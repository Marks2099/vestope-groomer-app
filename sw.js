const CACHE="vestope-groomer-phase-a-v11";
const ASSETS=["./","./index.html","./manifest.webmanifest","./logo_vestope.cz.png","./vestope-groomer-background.webp","./groomer.svg"];
const UI_STYLE=`<style>
/* Section graphics are inserted as real DOM elements. This avoids pseudo-element/background-image conflicts in the original form CSS. */
.vestope-section-icon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#eaf3ff!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;overflow:hidden!important}
.vestope-section-icon.groomer img{width:42px!important;height:auto!important;display:block!important;object-fit:contain!important}
.vestope-section-icon.snow{font-size:35px!important;line-height:1!important;color:#0b63ce!important;font-family:system-ui,sans-serif!important}
.vestope-section-row{display:flex!important;align-items:center!important;gap:12px!important}
@media(max-width:600px){.vestope-section-icon{width:52px!important;height:52px!important;flex-basis:52px!important}.vestope-section-row{gap:10px!important}}
</style>`;
const UI_SCRIPT=`<script>
(()=>{
  const addIcon=(heading,type)=>{
    if(!heading || heading.querySelector('[data-vestope-section-icon]')) return;
    const icon=document.createElement('span');
    icon.dataset.vestopeSectionIcon='1';
    icon.className='vestope-section-icon '+type;
    if(type==='groomer'){
      const img=document.createElement('img');
      img.src='./groomer.svg';
      img.alt='';
      img.setAttribute('aria-hidden','true');
      icon.appendChild(img);
    }else{
      icon.textContent='❄';
      icon.setAttribute('aria-hidden','true');
    }
    heading.classList.add('vestope-section-row');
    heading.insertBefore(icon,heading.firstChild);
  };
  const markSections=()=>{
    document.querySelectorAll('h3,.quality-title,.sectionHeader').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t.includes('Jaká je podle tebe stopa?')) addIcon(el,'groomer');
      if(t.includes('Sněhové podmínky')) addIcon(el,'snow');
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markSections); else markSections();
  new MutationObserver(markSections).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vestope-groomer-phase-a-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=="GET")return;if(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")){e.respondWith(fetch(e.request,{cache:"no-store"}).then(async r=>{const headers=new Headers(r.headers);headers.delete("content-length");let html=await r.text();if(html.includes("</head>"))html=html.replace("</head>",UI_STYLE+UI_SCRIPT+"</head>");const out=new Response(html,{status:r.status,statusText:r.statusText,headers});caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));return out}).catch(()=>caches.match("./index.html")));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});