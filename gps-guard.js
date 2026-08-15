(()=>{
  let watchId=null;
  const stopWatch=()=>{if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}};
  const startWatch=draft=>{
    stopWatch();
    watchId=navigator.geolocation.watchPosition(position=>{
      const b=document.getElementById('start');
      if(!b||!b.classList.contains('driving'))return;
      draft.points.push({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,speed:position.coords.speed,heading:position.coords.heading,timestamp:new Date(position.timestamp||Date.now()).toISOString()});
      localStorage.setItem('vestope:groomer:phaseA:draft',JSON.stringify(draft));
    },()=>{}, {enableHighAccuracy:true,maximumAge:5000,timeout:15000});
  };
  const run=()=>{
    const b=document.getElementById('start');
    const status=document.getElementById('startStatus');
    const animation=document.getElementById('trackAnimation');
    if(!b||b.dataset.gpsGuard==='1')return;
    b.dataset.gpsGuard='1';
    const initialStart=()=>{
      if(b.disabled||b.classList.contains('driving')||b.classList.contains('stopping'))return;
      if(!navigator.geolocation){if(status)status.textContent='Bez GPS dnes nevyrazíme.';return;}
      b.disabled=true;b.textContent='GPS…';if(status)status.textContent='Chytám přesnou polohu a vyrážíme…';
      navigator.geolocation.getCurrentPosition(position=>{
        const draft={id:crypto.randomUUID(),startedAt:new Date().toISOString(),synced:false,points:[],startLat:position.coords.latitude,startLon:position.coords.longitude,startAccuracy:position.coords.accuracy,startName:null};
        draft.points.push({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,speed:position.coords.speed,heading:position.coords.heading,timestamp:new Date(position.timestamp||Date.now()).toISOString()});
        localStorage.setItem('vestope:groomer:phaseA:draft',JSON.stringify(draft));
        startWatch(draft);
        b.disabled=false;b.dataset.gpsReady='true';b.textContent='JEDU';b.classList.add('driving');b.classList.remove('stopping','running');
        if(animation)animation.classList.add('active');
        if(status){status.className='status running';status.textContent='Jedu s tebou. GPS běží.'}
      },error=>{
        stopWatch();b.disabled=true;b.dataset.gpsReady='false';b.textContent='START';b.classList.remove('driving','stopping','running');
        if(status){status.className='status';status.style.color='#b3261e';status.textContent=error.code===1?'Přístup k GPS byl zamítnut. Povol GPS v nastavení zařízení.':'Poloha není momentálně dostupná. START zůstává zamčený.'}
      },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    };
    b.addEventListener('click',e=>{
      if(b.classList.contains('driving'))return;
      if(b.classList.contains('stopping')){stopWatch();return;}
      e.preventDefault();e.stopImmediatePropagation();initialStart();
    },true);
    setInterval(()=>{if(b.classList.contains('stopping')||document.getElementById('stopModal'))stopWatch();},250);
  };
  const timer=setInterval(()=>{if(document.getElementById('start')){clearInterval(timer);run()}},100);
})();
