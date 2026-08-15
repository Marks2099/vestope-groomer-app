const CACHE="vestope-groomer-phase-a-v13";
const ASSETS=["./","./index.html","./manifest.webmanifest","./logo_vestope.cz.png","./vestope-groomer-background.webp","./groomer.svg"];

const UI_STYLE=`<style>
/* Section icons */
.quality-title:before{display:none!important;content:none!important}
.quality-title{display:flex!important;align-items:center!important;gap:12px!important}
.vestope-section-icon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#78a8ee!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;overflow:hidden!important}
.vestope-section-icon img{width:40px!important;height:34px!important;object-fit:contain!important;display:block!important;filter:brightness(0) invert(1)!important}
.vestope-section-icon.snow{background:#78a8ee!important;color:#fff!important;font-size:34px!important;line-height:1!important;font-family:system-ui,sans-serif!important}
.vestope-section-row{display:flex!important;align-items:center!important;gap:12px!important}
.vestope-section-row h3{margin:0!important}
.trackTypeIcon{width:52px!important;height:52px!important;flex:0 0 52px!important;border-radius:14px!important;background:#78a8ee!important;box-shadow:0 6px 14px rgba(62,111,181,.14)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
.trackTypeIcon svg{width:40px!important;height:40px!important;filter:none!important}
.daily-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0 4px}
.daily-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:15px;padding:14px 10px;text-align:center}
.daily-stat-value{font-size:25px;font-weight:900;color:#163c65;line-height:1.1;font-variant-numeric:tabular-nums}
.daily-stat-label{font-size:12px;color:#718096;font-weight:700;margin-top:5px}
.daily-stat-icon{font-size:19px;margin-bottom:5px}
.live-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 2px}
.live-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:14px;padding:10px 8px;text-align:center}
.live-stat-value{font-size:22px;font-weight:900;color:#163c65;line-height:1.05;font-variant-numeric:tabular-nums;white-space:nowrap}
.live-stat-label{font-size:11px;color:#718096;font-weight:700;margin-top:4px}
@media(max-width:600px){.quality-title{gap:10px!important}.vestope-section-row{gap:10px!important}.vestope-section-icon,.trackTypeIcon{width:52px!important;height:52px!important;flex-basis:52px!important}.daily-stats{gap:8px}.daily-stat{padding:12px 7px}.live-stats{gap:7px}.live-stat{padding:9px 6px}.live-stat-value{font-size:20px}}
</style>`;

const UI_SCRIPT=`<script>
(()=>{
  const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const iconSvg=()=>\`<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="12" r="3" fill="white" stroke="none"/><path d="M22 17v15l-8 12m8-12 9 7m-9-4 10 13M42 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M42 19v14l-7 12m7-12 9 6m-9-3 9 13M7 50h20m7 0h23"/></g></svg>\`;

  const addIcon=(heading,type)=>{
    if(!heading || heading.querySelector('[data-vestope-section-icon]')) return;
    const icon=document.createElement('span');
    icon.dataset.vestopeSectionIcon='1'; icon.className='vestope-section-icon '+type;
    if(type==='groomer'){
      const img=document.createElement('img'); img.src='./groomer.svg'; img.alt=''; img.setAttribute('aria-hidden','true'); icon.appendChild(img);
    }else{ icon.textContent='❄'; icon.setAttribute('aria-hidden','true'); }
    heading.classList.add('vestope-section-row'); heading.insertBefore(icon,heading.firstChild);
  };

  const fixTrackIcon=()=>document.querySelectorAll('.trackTypeIcon').forEach(icon=>{if(icon.dataset.vestopeFixed==='1')return;icon.dataset.vestopeFixed='1';icon.innerHTML=iconSvg()});
  const markSections=()=>{
    document.querySelectorAll('.quality-title,h3,.sectionHeader').forEach(el=>{const t=(el.textContent||'').trim();if(t.includes('Jaká je podle tebe stopa?'))addIcon(el,'groomer');if(t.includes('Sněhové podmínky'))addIcon(el,'snow')});
    fixTrackIcon();
  };

  const distanceKm=(points)=>{
    if(!Array.isArray(points)||points.length<2)return 0;
    const R=6371000,p=Math.PI/180; let total=0;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      if(!Number.isFinite(a?.latitude)||!Number.isFinite(a?.longitude)||!Number.isFinite(b?.latitude)||!Number.isFinite(b?.longitude))continue;
      const dLat=(b.latitude-a.latitude)*p,dLon=(b.longitude-a.longitude)*p;
      const x=Math.sin(dLat/2)**2+Math.cos(a.latitude*p)*Math.cos(b.latitude*p)*Math.sin(dLon/2)**2;
      const d=2*R*Math.asin(Math.sqrt(x));
      /* Ignore GPS jumps over 500 m between two samples. */
      if(d<=500)total+=d;
    }
    return total/1000;
  };

  const formatClock=(ms)=>{
    const total=Math.max(0,Math.floor(ms/1000));
    const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  };

  const dateKey=(value)=>{const d=new Date(value);return Number.isFinite(d.getTime())?`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`:null};
  const todayKey=()=>dateKey(new Date());

  const readDraft=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:phaseA:draft')||'null')}catch{return null}};
  const readRides=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:rides')||'[]')}catch{return []}};

  const liveData=()=>{
    const draft=readDraft();
    if(!draft)return null;
    const started=Date.parse(draft.startedAt||'');
    if(!Number.isFinite(started))return null;
    return {km:distanceKm(draft.points||[]),ms:Math.max(0,Date.now()-started),points:draft.points?.length||0};
  };

  const todayStats=()=>{
    const rides=readRides(),today=todayKey();let km=0,ms=0,count=0;
    rides.forEach(r=>{
      if(dateKey(r?.startedAt)!==today)return;
      km+=distanceKm(r?.points||[]);
      const start=Date.parse(r?.startedAt||''),end=Date.parse(r?.drivingEndedAt||r?.endedAt||'');
      if(Number.isFinite(start)&&Number.isFinite(end)&&end>=start)ms+=end-start;
      count++;
    });
    return {km,ms,count};
  };

  const renderLiveStats=()=>{
    const button=document.getElementById('start'),animation=document.getElementById('trackAnimation');
    const driving=!!button?.classList.contains('driving') && !!animation?.classList.contains('active');
    let box=document.getElementById('liveStats');
    if(!driving){box?.remove();return;}
    if(!box){
      box=document.createElement('div');box.id='liveStats';box.className='live-stats';
      box.innerHTML='<div class="live-stat"><div class="live-stat-value" id="liveKm">0,0 km</div><div class="live-stat-label">Upraveno</div></div><div class="live-stat"><div class="live-stat-value" id="liveTime">00:00:00</div><div class="live-stat-label">Čas za volantem</div></div>';
      animation?.insertAdjacentElement('afterend',box);
    }
    const d=liveData();if(!d)return;
    const km=document.getElementById('liveKm'),time=document.getElementById('liveTime');
    if(km)km.textContent=d.km.toFixed(1).replace('.',',')+' km';
    if(time)time.textContent=formatClock(d.ms);
  };

  const decorateThanks=()=>{
    const card=document.querySelector('.thanks');if(!card)return;
    const rides=readRides(); if(!rides.length)return;
    const latest=rides[rides.length-1];
    /* The stop moment is captured when the JEDU button is pressed, before the questionnaire opens. */
    const stoppedAt=localStorage.getItem('vestope:groomer:stoppedAt');
    if(stoppedAt){
      latest.drivingEndedAt=stoppedAt;
      localStorage.setItem('vestope:groomer:rides',JSON.stringify(rides));
      localStorage.removeItem('vestope:groomer:stoppedAt');
    }
    const stats=todayStats();
    let box=card.querySelector('.daily-stats');
    if(!box){
      box=document.createElement('div');box.className='daily-stats';
      box.innerHTML='<div class="daily-stat"><div class="daily-stat-icon">📏</div><div class="daily-stat-value" data-daily-km></div><div class="daily-stat-label">Dneska urolbováno</div></div><div class="daily-stat"><div class="daily-stat-icon">⏱️</div><div class="daily-stat-value" data-daily-time></div><div class="daily-stat-label">Čas za volantem</div></div>';
      const anchor=card.querySelector('.small');if(anchor)anchor.insertAdjacentElement('beforebegin',box);else card.appendChild(box);
    }
    box.querySelector('[data-daily-km]').textContent=stats.km.toFixed(1).replace('.',',')+' km';
    box.querySelector('[data-daily-time]').textContent=formatClock(stats.ms);
    const small=card.querySelector('.small');
    if(small)small.textContent=`Dnes máš za sebou ${stats.count} ${stats.count===1?'jízdu':'jízd'}.`;
  };

  const captureStop=()=>{
    document.addEventListener('click',e=>{
      const button=e.target.closest('#start');
      if(!button)return;
      if(button.classList.contains('driving'))localStorage.setItem('vestope:groomer:stoppedAt',new Date().toISOString());
    },true);
  };

  const init=()=>{
    markSections();captureStop();
    const observer=new MutationObserver(()=>{markSections();renderLiveStats();decorateThanks()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setInterval(()=>{renderLiveStats();decorateThanks()},1000);
    renderLiveStats();decorateThanks();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
</script>`;

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vestope-groomer-phase-a-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=="GET")return;if(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")){e.respondWith(fetch(e.request,{cache:"no-store"}).then(async r=>{const headers=new Headers(r.headers);headers.delete("content-length");let html=await r.text();if(html.includes("</head>"))html=html.replace("</head>",UI_STYLE+"</head>");if(html.includes("</body>"))html=html.replace("</body>",UI_SCRIPT+"</body>");const out=new Response(html,{status:r.status,statusText:r.statusText,headers});caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));return out}).catch(()=>caches.match("./index.html")));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});