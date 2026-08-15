const CACHE="vestope-groomer-phase-a-v12";
const ASSETS=["./","./index.html","./manifest.webmanifest","./logo_vestope.cz.png","./vestope-groomer-background.webp","./groomer.svg"];

const UI_STYLE=`<style>
/* Real DOM section icons. We intentionally disable the older pseudo-element icons. */
.quality-title:before{display:none!important;content:none!important}
.quality-title{display:flex!important;align-items:center!important;gap:12px!important}
.vestope-section-icon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#78a8ee!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;overflow:hidden!important}
.vestope-section-icon img{width:40px!important;height:34px!important;object-fit:contain!important;display:block!important;filter:brightness(0) invert(1)!important}
.vestope-section-icon.snow{background:#78a8ee!important;color:#fff!important;font-size:34px!important;line-height:1!important;font-family:system-ui,sans-serif!important}
.vestope-section-row{display:flex!important;align-items:center!important;gap:12px!important}
.vestope-section-row h3{margin:0!important}
.trackTypeIcon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#78a8ee!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
.trackTypeIcon svg{width:40px!important;height:40px!important;filter:none!important}
.daily-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:22px 0 4px}
.daily-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:15px;padding:14px 10px;text-align:center}
.daily-stat-value{font-size:25px;font-weight:900;color:#163c65;line-height:1.1}
.daily-stat-label{font-size:12px;color:#718096;font-weight:700;margin-top:5px}
.daily-stat-icon{font-size:19px;margin-bottom:5px}
@media(max-width:600px){.quality-title{gap:10px!important}.vestope-section-row{gap:10px!important}.vestope-section-icon,.trackTypeIcon{width:52px!important;height:52px!important;flex-basis:52px!important}.daily-stats{gap:8px}.daily-stat{padding:12px 7px}}
</style>`;

const UI_SCRIPT=`<script>
(()=>{
  const iconSvg=()=>\`<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="12" r="3" fill="white" stroke="none"/><path d="M22 17v15l-8 12m8-12 9 7m-9-4 10 13M42 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M42 19v14l-7 12m7-12 9 6m-9-3 9 13M7 50h20m7 0h23"/></g></svg>\`;

  const addGroomerIcon=(heading)=>{
    if(!heading || heading.querySelector('[data-vestope-section-icon]')) return;
    const icon=document.createElement('span');
    icon.dataset.vestopeSectionIcon='1';
    icon.className='vestope-section-icon groomer';
    const img=document.createElement('img');
    img.src='./groomer.svg'; img.alt=''; img.setAttribute('aria-hidden','true');
    icon.appendChild(img);
    heading.classList.add('vestope-section-row');
    heading.insertBefore(icon,heading.firstChild);
  };

  const addSnowIcon=(heading)=>{
    if(!heading || heading.querySelector('[data-vestope-section-icon]')) return;
    const icon=document.createElement('span');
    icon.dataset.vestopeSectionIcon='1'; icon.className='vestope-section-icon snow';
    icon.textContent='❄'; icon.setAttribute('aria-hidden','true');
    heading.classList.add('vestope-section-row'); heading.insertBefore(icon,heading.firstChild);
  };

  const fixTrackIcon=()=>{
    document.querySelectorAll('.trackTypeIcon').forEach(icon=>{
      if(icon.dataset.vestopeFixed==='1') return;
      icon.dataset.vestopeFixed='1'; icon.innerHTML=iconSvg();
    });
  };

  const markSections=()=>{
    document.querySelectorAll('.quality-title,h3,.sectionHeader').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t.includes('Jaká je podle tebe stopa?')) addGroomerIcon(el);
      if(t.includes('Sněhové podmínky')) addSnowIcon(el);
    });
    fixTrackIcon();
  };

  const distanceKm=(points)=>{
    if(!Array.isArray(points)||points.length<2) return 0;
    const r=6371000,p=Math.PI/180;
    let total=0;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      if(!Number.isFinite(a.latitude)||!Number.isFinite(a.longitude)||!Number.isFinite(b.latitude)||!Number.isFinite(b.longitude)) continue;
      const dLat=(b.latitude-a.latitude)*p,dLon=(b.longitude-a.longitude)*p;
      const x=Math.sin(dLat/2)**2+Math.cos(a.latitude*p)*Math.cos(b.latitude*p)*Math.sin(dLon/2)**2;
      const d=2*r*Math.asin(Math.sqrt(x));
      /* Ignore obvious GPS jumps. A rolba cannot realistically jump hundreds of metres between samples. */
      if(d<=500) total+=d;
    }
    return total/1000;
  };

  const durationMs=(ride)=>{
    const a=Date.parse(ride?.startedAt||'');
    const b=Date.parse(ride?.endedAt||'');
    return Number.isFinite(a)&&Number.isFinite(b)&&b>=a?b-a:0;
  };

  const todayStats=()=>{
    const rides=JSON.parse(localStorage.getItem('vestope:groomer:rides')||'[]');
    const now=new Date();
    const todayKey=\`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}\`;
    let km=0,ms=0,count=0;
    rides.forEach(r=>{
      const d=new Date(r?.startedAt||'');
      if(!Number.isFinite(d.getTime())) return;
      const key=\`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}\`;
      if(key!==todayKey) return;
      km+=distanceKm(r.points); ms+=durationMs(r); count++;
    });
    return {km,ms,count};
  };

  const formatTime=(ms)=>{
    const min=Math.round(ms/60000);
    if(min<60) return \`${min} min\`;
    const h=Math.floor(min/60),m=min%60;
    return m?\`${h} h ${m} min\`:\`${h} h\`;
  };

  const originalShowThanks=window.showThanks;
  const thanksPool={
    excellent:['Paráda. Další kus bílé stopy je hotový. Díky za dnešní práci!','Tohle bude radost pro běžkaře. Stopa je připravená. Díky!'],
    'very-good':['Moc dobrá práce. Bílá stopa je zase o kus lepší!','Stopa drží a může se vyrazit. Díky, parťáku!'],
    passable:['Dneska to nebylo úplně zadarmo, ale stopa je hotová. Díky!','Podmínky nebyly ideální, ale zvládl jsi to. Dobrá práce!'],
    limited:['Dneska to chtělo trochu víc práce. Díky, že jsi to dal dohromady!','Sněhu nebylo zrovna na rozdávání, ale udělal jsi maximum. Díky!'],
    bad:['Dneska příroda moc nepomohla, ale díky za každou upravenou stopu.','Podmínky byly náročné. I tak díky za kus práce pro běžkaře!']
  };
  window.showThanks=(condition)=>{
    const pool=thanksPool[condition]||thanksPool.excellent;
    const message=pool[Math.floor(Math.random()*pool.length)];
    const stats=todayStats();
    const km=stats.km.toFixed(1).replace('.',',');
    const oldName=document.querySelector('.account span')?.textContent||'Rolbař';
    const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const app=document.getElementById('app');
    if(!app) return originalShowThanks?.(condition);
    app.innerHTML=\`<section class="card thanks"><div class="thanksIcon">❄️</div><div class="eyebrow">HOTOVO</div><h2>Dobrá práce!</h2><p>\${safe(message)}</p><div class="daily-stats"><div class="daily-stat"><div class="daily-stat-icon">📏</div><div class="daily-stat-value">\${km} km</div><div class="daily-stat-label">Dneska urolbováno</div></div><div class="daily-stat"><div class="daily-stat-icon">⏱️</div><div class="daily-stat-value">\${formatTime(stats.ms)}</div><div class="daily-stat-label">Čas za volantem</div></div></div><div class="small">Dnes máš za sebou \${stats.count} \${stats.count===1?'jízdu':'jízd'}. Paráda. Bílá stopa je zase o kus lepší.</div><button class="primary" id="again" style="margin-top:22px">Další jízda</button><div class="account"><span>\${safe(oldName)}</span><button id="logoutThanks" class="secondary">Odhlásit</button></div></section>\`;
    document.getElementById('again')?.addEventListener('click',()=>location.reload());
    document.getElementById('logoutThanks')?.addEventListener('click',async()=>{try{const c=window.supabase.createClient('https://wlxrqqtvpqumvbbdfpuv.supabase.co','sb_publishable_aXH1aT3OZN2p0mMzfWLt0w_YGFBFaQl');await c.auth.signOut()}finally{location.reload()}});
  };

  const init=()=>{
    markSections();
    const observer=new MutationObserver(markSections);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
</script>`;

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vestope-groomer-phase-a-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=="GET")return;if(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")){e.respondWith(fetch(e.request,{cache:"no-store"}).then(async r=>{const headers=new Headers(r.headers);headers.delete("content-length");let html=await r.text();if(html.includes("</head>"))html=html.replace("</head>",UI_STYLE+"</head>");if(html.includes("</body>"))html=html.replace("</body>",UI_SCRIPT+"</body>");const out=new Response(html,{status:r.status,statusText:r.statusText,headers});caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));return out}).catch(()=>caches.match("./index.html")));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});