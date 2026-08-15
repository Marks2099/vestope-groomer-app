const CACHE="vestope-groomer-phase-a-v14";
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
/* Live ride stats sit directly beside the main START/JEDU/STOP button. */
.start-row{display:grid!important;grid-template-columns:minmax(78px,1fr) auto minmax(78px,1fr)!important;align-items:center!important;gap:10px!important;width:100%!important;margin:28px auto 16px!important}
.start-row .start{margin:0!important;grid-column:2!important;grid-row:1!important}
.live-stats{display:contents!important}
.live-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:14px;padding:10px 7px;text-align:center;min-width:0}
.live-stat:first-child{grid-column:1!important;grid-row:1!important}
.live-stat:last-child{grid-column:3!important;grid-row:1!important}
.live-stat-value{font-size:20px;font-weight:900;color:#163c65;line-height:1.05;font-variant-numeric:tabular-nums;white-space:nowrap}
.live-stat-label{font-size:11px;color:#718096;font-weight:700;margin-top:4px;line-height:1.2}
@media(max-width:600px){.quality-title{gap:10px!important}.vestope-section-row{gap:10px!important}.vestope-section-icon,.trackTypeIcon{width:52px!important;height:52px!important;flex-basis:52px!important}.daily-stats{gap:8px}.daily-stat{padding:12px 7px}.start-row{grid-template-columns:minmax(68px,1fr) auto minmax(68px,1fr)!important;gap:7px!important;margin-top:20px!important}.live-stat{padding:9px 5px}.live-stat-value{font-size:17px}.live-stat-label{font-size:10px}}
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

  const ensureStartRow=()=>{
    const button=document.getElementById('start');
    if(!button)return null;
    let row=button.closest('.start-row');
    if(!row){
      row=document.createElement('div');row.className='start-row';
      button.parentNode.insertBefore(row,button);
      row.appendChild(button);
    }
    return row;
  };

  const renderLiveStats=()=>{
    const button=document.getElementById('start'),animation=document.getElementById('trackAnimation');
    const driving=!!button?.classList.contains('driving') && !!animation?.classList.contains('active');
    const row=ensureStartRow();
    if(!row)return;
    let box=row.querySelector('#liveStats');
    if(!driving){box?.remove();return;}
    if(!box){
      box=document.createElement('div');box.id='liveStats';box.className='live-stats';
      box.innerHTML='<div class="live-stat"><div class="live-stat-value" id="liveTime">00:00:00</div><div class="live-stat-label">Čas za volantem</div></div><div class="live-stat"><div class="live-stat-value" id="liveKm">0,0 km</div><div class="live-stat-label">Upraveno</div></div>';
      row.insertBefore(box,button);
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
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=="GET")return;if(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")){e.respondWith(fetch(e.request,{cache:"no-store"}).then(async r=>{const headers=new Headers(r.headers);headers.delete("content-length");let html=await r.text();if(html.includes("</head>"))html=html.replace("</head>",UI_STYLE+"</head>");if(html.includes("</body>"))html=html.replace("</body>",UI_SCRIPT+"<script>"+"(()=>{\n  const CSS=`<style>\n  .ride-controls{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px auto 4px;max-width:360px}\n  .ride-side-stat{width:96px;min-width:0;text-align:center;background:#f3f8fc;border:1px solid #dce8f2;border-radius:13px;padding:8px 5px}\n  .ride-side-value{font-size:17px;font-weight:900;color:#163c65;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}\n  .ride-side-label{font-size:9px;color:#718096;font-weight:700;margin-top:3px;line-height:1.15}\n  .pause-btn{border:1px solid #d9e1eb;background:#fff;color:#34445a;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px;cursor:pointer;margin:8px auto 0;display:none}.pause-btn.show{display:block}\n  .pause-note{font-size:12px;color:#7a8798;text-align:center;margin-top:5px;display:none}.pause-note.show{display:block}\n  .confirm-overlay{position:fixed;inset:0;z-index:80;background:rgba(17,35,54,.48);display:flex;align-items:center;justify-content:center;padding:18px}\n  .confirm-card{width:100%;max-width:390px;background:#fff;border-radius:22px;padding:24px;box-shadow:0 25px 70px rgba(15,35,55,.3)}\n  .confirm-card h2{text-align:center;color:#142b4b;margin:0 0 8px;font-size:22px}.confirm-card p{text-align:center;color:#68778a;font-size:14px;margin:0 auto 18px}\n  .confirm-actions{display:flex;gap:9px}.confirm-actions button{flex:1;padding:12px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer}.confirm-continue{border:1px solid #d9e1eb;background:#fff;color:#34445a}.confirm-stop{border:0;background:#d83b3b;color:#fff}\n  .photo-wrap{margin:10px 0 2px;text-align:center}.photo-btn{border:1px solid #cfdbe8;background:#f7fbff;color:#163c65;border-radius:12px;padding:10px 14px;font-weight:800;font-size:13px;cursor:pointer}.photo-input{display:none}.photo-list{display:flex;gap:7px;overflow-x:auto;margin-top:9px;padding-bottom:2px}.photo-thumb{width:62px;height:62px;border-radius:10px;object-fit:cover;border:1px solid #d8e1eb;flex:0 0 62px}.photo-meta{font-size:10px;color:#718096;margin-top:5px}\n  @media(max-width:600px){.ride-controls{max-width:100%;gap:5px}.ride-side-stat{width:82px;padding:7px 3px}.ride-side-value{font-size:15px}.ride-side-label{font-size:8px}.pause-btn{padding:9px 12px}}\n  </style>`;\n  const hav=(a,b)=>{if(!a||!b)return 0;const R=6371000,p=Math.PI/180,dLat=(b.latitude-a.latitude)*p,dLon=(b.longitude-a.longitude)*p,x=Math.sin(dLat/2)**2+Math.cos(a.latitude*p)*Math.cos(b.latitude*p)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))};\n  const draft=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:phaseA:draft')||'null')}catch{return null}};\n  const saveDraft=d=>localStorage.setItem('vestope:groomer:phaseA:draft',JSON.stringify(d));\n  const getPhotos=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:photos')||'[]')}catch{return []}};\n  const savePhotos=a=>localStorage.setItem('vestope:groomer:photos',JSON.stringify(a));\n  const compress=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.76))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)});\n  const geo=()=>new Promise(resolve=>{if(!navigator.geolocation)return resolve(null);navigator.geolocation.getCurrentPosition(p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,takenAt:new Date().toISOString()}),()=>resolve(null),{enableHighAccuracy:true,maximumAge:10000,timeout:10000})});\n  const nearestFromDraft=d=>d?.nearestPoint||d?.startingPoint||null;\n  const renderPhotos=()=>{const list=document.getElementById('ridePhotoList');if(!list)return;const d=draft()||{};const ids=d.photos||[];const all=getPhotos().filter(x=>ids.includes(x.id));list.innerHTML=all.map(x=>`<img class=\"photo-thumb\" src=\"${x.data}\" alt=\"\">`).join('')};\n  const photoUI=()=>{const b=document.getElementById('start');if(!b||!b.classList.contains('driving')){document.querySelector('.photo-wrap')?.remove();return}if(document.querySelector('.photo-wrap')){renderPhotos();return}const w=document.createElement('div');w.className='photo-wrap';w.innerHTML='<button type=\"button\" class=\"photo-btn\" id=\"addRidePhoto\">📷 Přidat fotku</button><input class=\"photo-input\" id=\"ridePhotoInput\" type=\"file\" accept=\"image/*\" capture=\"environment\"><div class=\"photo-list\" id=\"ridePhotoList\"></div><div class=\"photo-meta\">Fotka se uloží k jízdě i s místem pořízení.</div>';const a=document.getElementById('trackAnimation');(a||b).insertAdjacentElement('afterend',w);w.querySelector('#addRidePhoto').onclick=()=>w.querySelector('#ridePhotoInput').click();w.querySelector('#ridePhotoInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const pos=await geo();const d=draft()||{};const photo={id:crypto.randomUUID?.()||String(Date.now()),name:f.name,createdAt:new Date().toISOString(),data:await compress(f),latitude:pos?.latitude??null,longitude:pos?.longitude??null,accuracy:pos?.accuracy??null,nearestPoint:nearestFromDraft(d),rideStartedAt:d.startedAt||null};const arr=getPhotos();arr.push(photo);savePhotos(arr);d.photos=[...(d.photos||[]),photo.id];saveDraft(d);renderPhotos();e.target.value=''};renderPhotos()};\n  const dist=d=>{if(!d?.points?.length)return 0;let km=0;for(let i=1;i<d.points.length;i++){const x=hav(d.points[i-1],d.points[i]);if(x<=500)km+=x}return km/1000};\n  const clock=ms=>{let s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')};\n  const elapsed=d=>{const start=Date.parse(d?.startedAt||'');if(!Number.isFinite(start))return 0;let pause=Number(d?.pausedMs||0);if(d?.pausedAt){const p=Date.parse(d.pausedAt);if(Number.isFinite(p))pause+=Date.now()-p}return Math.max(0,Date.now()-start-pause)};\n  const updateStats=()=>{const d=draft();const t=document.getElementById('rideTime'),k=document.getElementById('rideKm');if(t)t.textContent=clock(elapsed(d));if(k)k.textContent=dist(d).toFixed(1).replace('.',',')+' km'};\n  const addControls=()=>{const b=document.getElementById('start');if(!b||!b.classList.contains('driving')){document.querySelector('.ride-controls')?.remove();document.querySelector('.pause-btn')?.remove();return}if(!document.querySelector('.ride-controls')){const row=document.createElement('div');row.className='ride-controls';row.innerHTML='<div class=\"ride-side-stat\"><div class=\"ride-side-value\" id=\"rideTime\">00:00:00</div><div class=\"ride-side-label\">Čas za volantem</div></div><div class=\"ride-side-stat\"><div class=\"ride-side-value\" id=\"rideKm\">0,0 km</div><div class=\"ride-side-label\">Upraveno</div></div>';b.insertAdjacentElement('beforebegin',row)}if(!document.querySelector('.pause-btn')){const p=document.createElement('button');p.className='pause-btn show';p.id='pauseRide';p.textContent='⏸ Pauza';b.insertAdjacentElement('afterend',p);p.onclick=()=>pause(true)}updateStats()};\n  const pause=()=>{const b=document.getElementById('start');if(!b)return;const d=draft()||{};d.pausedAt=new Date().toISOString();saveDraft(d);b.classList.remove('driving');b.classList.add('paused');b.textContent='POKRAČOVAT';document.querySelector('.ride-controls')?.remove();document.getElementById('pauseRide')?.remove();const n=document.createElement('div');n.className='pause-note show';n.textContent='Jízda je pozastavená. Až budeš připravený, pokračujeme.';b.insertAdjacentElement('afterend',n);b.onclick=()=>resume()};\n  const resume=()=>{const b=document.getElementById('start');const d=draft()||{};const p=Date.parse(d.pausedAt||'');if(Number.isFinite(p))d.pausedMs=(d.pausedMs||0)+(Date.now()-p);delete d.pausedAt;saveDraft(d);b.classList.remove('paused');b.classList.add('driving');b.textContent='JEDU';b.onclick=null;document.querySelector('.pause-note')?.remove();addControls();photoUI()};\n  const confirmStop=()=>{if(document.getElementById('confirmStop'))return;const o=document.createElement('div');o.id='confirmStop';o.className='confirm-overlay';o.innerHTML='<div class=\"confirm-card\"><h2>Chceš jízdu ukončit?</h2><p>Jestli jsi kliknul omylem, nic se neděje. Pokračuj v jízdě. Pokud je hotovo, jízdu ukončíme a data uložíme.</p><div class=\"confirm-actions\"><button class=\"confirm-continue\" id=\"continueRide\">Pokračovat v jízdě</button><button class=\"confirm-stop\" id=\"reallyStop\">Ano, ukončit</button></div></div>';document.body.appendChild(o);o.querySelector('#continueRide').onclick=()=>o.remove();o.querySelector('#reallyStop').onclick=()=>{o.remove();localStorage.setItem('vestope:groomer:stoppedAt',new Date().toISOString());const b=document.getElementById('start');if(b){b.classList.remove('driving');b.classList.add('stopping');b.textContent='STOP';setTimeout(()=>{b.onclick=null;b.click()},500)}}};\n  const intercept=()=>document.addEventListener('click',e=>{const b=e.target.closest('#start');if(!b||b.classList.contains('paused'))return;if(b.classList.contains('driving')){e.preventDefault();e.stopImmediatePropagation();confirmStop()}},true);\n  const init=()=>{if(document.getElementById('rideEnhancementStyle'))return;const s=document.createElement('div');s.id='rideEnhancementStyle';s.innerHTML=CSS;document.head.appendChild(s);intercept();setInterval(()=>{addControls();photoUI();updateStats()},1000);addControls();photoUI()};\n  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();\n})();\n"+"</script></body>");const out=new Response(html,{status:r.status,statusText:r.statusText,headers});caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));return out}).catch(()=>caches.match("./index.html")));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match("./index.html"))))});
/* VESTOPE_RIDE_ENHANCEMENTS_V15 */
