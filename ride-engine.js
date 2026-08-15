/*
 * VeStope.cz – Ride Engine
 * Phase 1: single source of truth for ride state + GPS points.
 * No UI, Supabase or Service Worker responsibilities live here.
 */
(() => {
  const STATES = Object.freeze({
    IDLE: "IDLE",
    LOCATING: "LOCATING",
    READY: "READY",
    RUNNING: "RUNNING",
    PAUSED: "PAUSED",
    STOPPING: "STOPPING",
    COMPLETED: "COMPLETED"
  });

  const STORAGE_KEY = "vestope:groomer:ride-engine:v1";
  const EARTH_RADIUS_M = 6371000;
  const MAX_REASONABLE_ACCURACY_M = 100;
  const MAX_REASONABLE_SPEED_MPS = 45;

  const haversine = (a, b) => {
    const p = Math.PI / 180;
    const dLat = (b.latitude - a.latitude) * p;
    const dLon = (b.longitude - a.longitude) * p;
    const lat1 = a.latitude * p;
    const lat2 = b.latitude * p;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
  };

  const nowIso = () => new Date().toISOString();

  class RideEngine {
    constructor({ onChange } = {}) {
      this.onChange = typeof onChange === "function" ? onChange : () => {};
      this.watchId = null;
      this.state = STATES.IDLE;
      this.ride = null;
      this.restore();
    }

    snapshot() {
      return {
        state: this.state,
        ride: this.ride ? structuredClone(this.ride) : null,
        elapsedMs: this.getElapsedMs(),
        distanceM: this.ride?.distanceM || 0
      };
    }

    emit() {
      this.persist();
      this.onChange(this.snapshot());
    }

    transition(next) {
      const allowed = {
        [STATES.IDLE]: [STATES.LOCATING],
        [STATES.LOCATING]: [STATES.READY, STATES.IDLE],
        [STATES.READY]: [STATES.RUNNING, STATES.IDLE],
        [STATES.RUNNING]: [STATES.PAUSED, STATES.STOPPING],
        [STATES.PAUSED]: [STATES.RUNNING, STATES.STOPPING],
        [STATES.STOPPING]: [STATES.COMPLETED],
        [STATES.COMPLETED]: [STATES.IDLE]
      };
      if (!(allowed[this.state] || []).includes(next)) {
        throw new Error(`Invalid ride transition: ${this.state} -> ${next}`);
      }
      this.state = next;
      this.emit();
    }

    beginLocating() {
      if (this.state !== STATES.IDLE) return;
      this.transition(STATES.LOCATING);
    }

    setReady(location) {
      if (this.state !== STATES.LOCATING) return;
      this.ride = {
        id: crypto.randomUUID(),
        startedAt: null,
        endedAt: null,
        pausedAt: null,
        pausedMs: 0,
        distanceM: 0,
        points: [],
        startLocation: location,
        endLocation: null
      };
      this.transition(STATES.READY);
    }

    start(location) {
      if (this.state !== STATES.READY) throw new Error("Ride is not ready to start");
      const startedAt = Date.now();
      this.ride.startedAt = new Date(startedAt).toISOString();
      this.ride.pausedAt = null;
      this.addPoint(location, true);
      this.transition(STATES.RUNNING);
    }

    pause() {
      if (this.state !== STATES.RUNNING) return;
      this.ride.pausedAt = Date.now();
      this.transition(STATES.PAUSED);
    }

    resume(location) {
      if (this.state !== STATES.PAUSED) return;
      const pausedAt = this.ride.pausedAt || Date.now();
      this.ride.pausedMs += Math.max(0, Date.now() - pausedAt);
      this.ride.pausedAt = null;
      if (location) this.addPoint(location, true);
      this.transition(STATES.RUNNING);
    }

    requestStop() {
      if (![STATES.RUNNING, STATES.PAUSED].includes(this.state)) return;
      this.transition(STATES.STOPPING);
    }

    complete(endLocation = null) {
      if (this.state !== STATES.STOPPING) return;
      if (endLocation) {
        this.ride.endLocation = endLocation;
        this.addPoint(endLocation, true);
      }
      this.ride.endedAt = nowIso();
      if (this.ride.pausedAt) {
        this.ride.pausedMs += Math.max(0, Date.now() - this.ride.pausedAt);
        this.ride.pausedAt = null;
      }
      this.state = STATES.COMPLETED;
      this.emit();
    }

    reset() {
      this.clearWatch();
      this.state = STATES.IDLE;
      this.ride = null;
      this.persist();
      this.emit();
    }

    addPoint(location, force = false) {
      if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return false;
      if (!this.ride) return false;

      const point = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: Number.isFinite(location.accuracy) ? location.accuracy : null,
        speed: Number.isFinite(location.speed) ? location.speed : null,
        heading: Number.isFinite(location.heading) ? location.heading : null,
        timestamp: location.timestamp || nowIso()
      };

      if (!force && point.accuracy != null && point.accuracy > MAX_REASONABLE_ACCURACY_M) return false;

      const previous = this.ride.points[this.ride.points.length - 1];
      if (previous) {
        const delta = haversine(previous, point);
        const seconds = Math.max(0.1, (new Date(point.timestamp).getTime() - new Date(previous.timestamp).getTime()) / 1000);
        const derivedSpeed = delta / seconds;
        if (!force && derivedSpeed > MAX_REASONABLE_SPEED_MPS) return false;
        if (this.state === STATES.RUNNING) this.ride.distanceM += delta;
      }

      this.ride.points.push(point);
      this.emit();
      return true;
    }

    handlePosition(position) {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: new Date(position.timestamp || Date.now()).toISOString()
      };

      if (this.state === STATES.RUNNING) this.addPoint(location);
      else if (this.state === STATES.PAUSED) this.onChange(this.snapshot());
    }

    startWatch() {
      if (!navigator.geolocation) throw new Error("Geolocation is not supported");
      this.clearWatch();
      this.watchId = navigator.geolocation.watchPosition(
        position => this.handlePosition(position),
        error => this.onChange({ ...this.snapshot(), gpsError: error }),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    clearWatch() {
      if (this.watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(this.watchId);
      }
      this.watchId = null;
    }

    getElapsedMs(at = Date.now()) {
      if (!this.ride?.startedAt) return 0;
      const start = new Date(this.ride.startedAt).getTime();
      const end = this.ride.endedAt ? new Date(this.ride.endedAt).getTime() : at;
      let paused = this.ride.pausedMs || 0;
      if (this.state === STATES.PAUSED && this.ride.pausedAt) paused += Math.max(0, at - this.ride.pausedAt);
      return Math.max(0, end - start - paused);
    }

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: this.state, ride: this.ride }));
      } catch (error) {
        console.warn("RideEngine persistence failed", error);
      }
    }

    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved?.ride || !STATES[saved.state]) return;
        this.state = saved.state;
        this.ride = saved.ride;
      } catch (error) {
        console.warn("RideEngine restore failed", error);
        this.state = STATES.IDLE;
        this.ride = null;
      }
    }
  }

  window.VeStopeRideEngine = Object.freeze({ RideEngine, STATES, haversine });
})();
