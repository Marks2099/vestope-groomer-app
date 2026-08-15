const CACHE="vestope-groomer-phase-a-v9";
const ASSETS=["./","./index.html","./manifest.webmanifest","./logo_vestope.cz.png","./vestope-groomer-background.webp","./groomer.svg"];
const UI_STYLE=`<style>
.quality-title{display:flex!important;align-items:center;gap:12px!important}
.quality-title:before{content:""!important;width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#eaf3ff!important;background-position:center!important;background-repeat:no-repeat!important;background-size:34px 34px!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important}
.quality-title.quality-track:before{background-image:url("./groomer.svg")!important;background-size:40px 30px!important}
.sectionHeader.snow-section-title,.sectionHeader.track-section-title{display:flex!important;align-items:center!important;gap:12px!important}
.sectionHeader.snow-section-title:before,.sectionHeader.track-section-title:before{content:"";width:52px;height:52px;flex:0 0 52px;border-radius:14px;background:#eaf3ff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(62,111,181,.14)}
.sectionHeader.snow-section-title:before{content:"❄";font-size:35px;line-height:1;color:#0b63ce}
.sectionHeader.track-section-title:before{background-image:url("./groomer.svg");background-position:center;background-repeat:no-repeat;background-size:40px 30px}
.trackTypeIcon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#eaf3ff!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important}
.trackTypeIcon svg{width:38px!important;height:38px!important;filter:brightness(0) saturate(100%) invert(29%) sepia(96%) saturate(2257%) hue-rotate(201deg) brightness(88%) contrast(96%)!important}
@media(max-width:600px){.quality-title:before,.sectionHeader.snow-section-title:before,.sectionHeader.track-section-title:before,.trackTypeIcon{width:52px!important;height:52px!important;flex-basis:52px!important}.quality-title,.sectionHeader.snow-section-title,.sectionHeader.track-section-title{gap:10px!important}}
</style>`;
const UI_SCRIPT=`<script>
(()=>{
  const markSections=()=>{
    document.querySelectorAll("h3,.quality-title,.sectionHeader").forEach(el=>{
      const t=(el.textContent||"").trim();
      if(t.includes("Jaká je podle tebe stopa?")) el.classList.add("quality-track");
      if(t.includes("Sněhové podmínky")) el.classList.add("snow-section-title");
      if(t.includes("Druh stopy")) el.classList.add("track-section-title");
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markSections); else markSections();
  new MutationObserver(markSections).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vestope-groomer-phase-a-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=="GET")return;if(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")){e.respondWith(fetch(e.request,{cache:"no-store"}).then(async r=>{const headers=new Headers(r.headers);headers.delete("content-length");let html=await r.text();if(html.includes("</head>"))html=html.replace("</head>",UI_STYLE+UI_SCRIPT+"</head>");const out=new Response(html,{status:r.status,statusText:r.statusText,headers});caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));return out}).catch(()=>caches.match("./index.html")));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});