(()=>{
  const CSS=`<style>
  .ride-controls{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px auto 4px;max-width:360px}
  .ride-side-stat{width:96px;min-width:0;text-align:center;background:#f3f8fc;border:1px solid #dce8f2;border-radius:13px;padding:8px 5px}
  .ride-side-value{font-size:17px;font-weight:900;color:#163c65;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}
  .ride-side-label{font-size:9px;color:#718096;font-weight:700;margin-top:3px;line-height:1.15}
  .pause-btn{border:1px solid #d9e1eb;background:#fff;color:#34445a;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px;cursor:pointer;margin:8px auto 0;display:none}.pause-btn.show{display:block}
  .pause-note{font-size:12px;color:#7a8798;text-align:center;margin-top:5px;display:none}.pause-note.show{display:block}
  .confirm-overlay{position:fixed;inset:0;z-index:80;background:rgba(17,35,54,.48);display:flex;align-items:center;justify-content:center;padding:18px}
  .confirm-card{width:100%;max-width:390px;background:#fff;border-radius:22px;padding:24px;box-shadow:0 25px 70px rgba(15,35,55,.3)}
  .confirm-card h2{text-align:center;color:#142b4b;margin:0 0 8px;font-size:22px}.confirm-card p{text-align:center;color:#68778a;font-size:14px;margin:0 auto 18px}
  .confirm-actions{display:flex;gap:9px}.confirm-actions button{flex:1;padding:12px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer}.confirm-continue{border:1px solid #d9e1eb;background:#fff;color:#34445a}.confirm-stop{border:0;background:#d83b3b;color:#fff}
  .photo-wrap{margin:12px 0 4px;text-align:center}.photo-btn{border:1px solid #cfdbe8;background:#f7fbff;color:#163c65;border-radius:12px;padding:10px 14px;font-weight:800;font-size:13px;cursor:pointer}.photo-input{display:none}.photo-list{display:flex;gap:7px;overflow-x:auto;margin-top:9px;padding-bottom:2px}.photo-thumb{width:62px;height:62px;border-radius:10px;object-fit:cover;border:1px solid #d8e1eb;flex:0 0 62px}.photo-meta{font-size:10px;color:#718096;margin-top:5px}
  .final-photo-wrap{margin:16px 0 2px;padding-top:14px;border-top:1px solid #e8eef4;text-align:left}.final-photo-title{font-size:15px;font-weight:800;color:#142b4b;margin-bottom:7px}.final-photo-subtitle{font-size:12px;color:#718096;margin-bottom:9px}.final-photo-btn{border:1px solid #cfdbe8;background:#f7fbff;color:#163c65;border-radius:12px;padding:10px 14px;font-weight:800;font-size:13px;cursor:pointer}.final-photo-list{display:flex;gap:7px;overflow-x:auto;margin-top:9px}.final-photo-list img{width:68px;height:68px;border-radius:10px;object-fit:cover;border:1px solid #d8e1eb;flex:0 0 68px}
  .daily-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0 4px}.daily-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:15px;padding:14px 10px;text-align:center}.daily-stat-value{font-size:25px;font-weight:900;color:#163c65;line-height:1.1;font-variant-numeric:tabular-nums}.daily-stat-label{font-size:12px;color:#718096;font-weight:700;margin-top:5px}.daily-stat-icon{font-size:19px;margin-bottom:5px}
  .live-stats{display:contents}.live-stat{background:#f3f8fc;border:1px solid #dce8f2;border-radius:14px;padding:10px 7px;text-align:center;min-width:0}.live-stat-value{font-size:20px;font-weight:900;color:#163c65;line-height:1.05;font-variant-numeric:tabular-nums;white-space:nowrap}.live-stat-label{font-size:11px;color:#718096;font-weight:700;margin-top:4px;line-height:1.2}
  .start-row{display:grid!important;grid-template-columns:minmax(78px,1fr) auto minmax(78px,1fr)!important;align-items:center!important;gap:10px!important;width:100%!important;margin:28px auto 16px!important}.start-row .start{margin:0!important;grid-column:2!important;grid-row:1!important}.live-stat:first-child{grid-column:1!important;grid-row:1!important}.live-stat:last-child{grid-column:3!important;grid-row:1!important}
  @media(max-width:600px){.ride-controls{max-width:100%;gap:5px}.ride-side-stat{width:82px;padding:7px 3px}.ride-side-value{font-size:15px}.ride-side-label{font-size:8px}.start-row{grid-template-columns:minmax(68px,1fr) auto minmax(68px,1fr)!important;gap:7px!important;margin-top:20px!important}.live-stat{padding:9px 5px}.live-stat-value{font-size:17px}.live-stat-label{font-size:10px}.daily-stats{gap:8px}.daily-stat{padding:12px 7px}}
  </style>`;

  const hav=(a,b)=>{if(!a||!b)return 0;const R=6371000,p=Math.PI/180,dLat=(b.latitude-a.latitude)*p,dLon=(b.longitude-a.longitude)*p,x=Math.sin(dLat/2)**2+Math.cos(a.latitude*p)*Math.cos(b.latitude*p)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
  const draft=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:phaseA:draft')||'null')}catch{return null}};
  const saveDraft=d=>localStorage.setItem('vestope:groomer:phaseA:draft',JSON.stringify(d));
  const getPhotos=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:photos')||'[]')}catch{return []}};
  const savePhotos=a=>localStorage.setItem('vestope:groomer:photos',JSON.stringify(a));
  const getRides=()=>{try{return JSON.parse(localStorage.getItem('vestope:groomer:rides')||'[]')}catch{return []}};
  const saveRides=a=>localStorage.setItem('vestope:groomer:rides',JSON.stringify(a));
  const compress=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.76))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)});
  const geo=()=>new Promise(resolve=>{if(!navigator.geolocation)return resolve(null);navigator.geolocation.getCurrentPosition(p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,takenAt:new Date().toISOString()}),()=>resolve(null),{enableHighAccuracy:true,maximumAge:10000,timeout:10000})});
  const nearestFromDraft=d=>d?.nearestPoint||d?.startingPoint||null;
  const clock=ms=>{let s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')};
  const dist=d=>{if(!d?.points?.length)return 0;let km=0;for(let i=1;i<d.points.length;i++){const x=hav(d.points[i-1],d.points[i]);if(x<=500)km+=x}return km/1000};
  const elapsed=d=>{const start=Date.parse(d?.startedAt||'');if(!Number.isFinite(start))return 0;let pause=Number(d?.pausedMs||0);if(d?.pausedAt){const p=Date.parse(d.pausedAt);if(Number.isFinite(p))pause+=Date.now()-p}return Math.max(0,Date.now()-start-pause)};

  const renderPhotoList=(listId,ids,cls='photo-thumb')=>{const list=document.getElementById(listId);if(!list)return;const all=getPhotos().filter(x=>ids.includes(x.id));list.innerHTML=all.map(x=>`<img class="${cls}" src="${x.data}" alt="">`).join('')};
  const addPhoto=async(file,targetDraft)=>{const pos=await geo();const d=targetDraft||draft()||{};const photo={id:crypto.randomUUID?.()||String(Date.now()+Math.random()),name:file.name,createdAt:new Date().toISOString(),data:await compress(file),latitude:pos?.latitude??null,longitude:pos?.longitude??null,accuracy:pos?.accuracy??null,nearestPoint:nearestFromDraft(d),rideStartedAt:d.startedAt||null};const arr=getPhotos();arr.push(photo);savePhotos(arr);d.photos=[...(d.photos||[]),photo.id];saveDraft(d);return photo};

  const renderRidePhotos=()=>{const d=draft()||{};renderPhotoList('ridePhotoList',d.photos||[],'photo-thumb')};
  const photoUI=()=>{
    const b=document.getElementById('start');
    if(!b||!b.classList.contains('driving')){document.querySelector('.photo-wrap')?.remove();return}
    if(document.querySelector('.photo-wrap')){renderRidePhotos();return}
    const w=document.createElement('div');w.className='photo-wrap';
    w.innerHTML='<button type="button" class="photo-btn" id="addRidePhoto">📷 Přidat fotku během jízdy</button><input class="photo-input" id="ridePhotoInput" type="file" accept="image/*" capture="environment"><div class="photo-list" id="ridePhotoList"></div><div class="photo-meta">Fotka se uloží k jízdě i s místem pořízení.</div>';
    const a=document.getElementById('trackAnimation');(a||b).insertAdjacentElement('afterend',w);
    w.querySelector('#addRidePhoto').onclick=()=>w.querySelector('#ridePhotoInput').click();
    w.querySelector('#ridePhotoInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{await addPhoto(f,draft()||{});renderRidePhotos()}catch(err){console.error(err)}e.target.value=''};
    renderRidePhotos();
  };

  const finalPhotoUI=()=>{
    const card=document.querySelector('.modalCard:not(.thanks)');
    if(!card)return;
    const actions=card.querySelector('.formActions');
    if(!actions||card.querySelector('.final-photo-wrap'))return;
    const wrap=document.createElement('div');wrap.className='final-photo-wrap';
    wrap.innerHTML='<div class="final-photo-title">📷 Fotky k jízdě</div><div class="final-photo-subtitle">Můžeš přidat fotky ještě teď, po ukončení jízdy.</div><button type="button" class="final-photo-btn" id="addFinalRidePhoto">+ Přidat fotku</button><input class="photo-input" id="finalRidePhotoInput" type="file" accept="image/*" capture="environment"><div class="final-photo-list" id="finalRidePhotoList"></div>';
    actions.parentNode.insertBefore(wrap,actions);
    const render=()=>{const d=draft()||{};renderPhotoList('finalRidePhotoList',d.photos||[],'')};
    wrap.querySelector('#addFinalRidePhoto').onclick=()=>wrap.querySelector('#finalRidePhotoInput').click();
    wrap.querySelector('#finalRidePhotoInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{await addPhoto(f,draft()||{});render()}catch(err){console.error(err)}e.target.value=''};
    render();
  };

  const attachPendingPhotos=()=>{
    const d=draft()||{};
    const pending=JSON.parse(localStorage.getItem('vestope:groomer:pendingPhotoIds')||'[]');
    const ids=[...(new Set([...(d.photos||[]),...pending]))];
    if(!ids.length)return;
    const rides=getRides();if(!rides.length)return;
    const latest=rides[rides.length-1];
    if(!latest)return;
    latest.photos=[...(new Set([...(latest.photos||[]),...ids]))];
    latest.photoIds=latest.photos;
    saveRides(rides);
    localStorage.removeItem('vestope:groomer:pendingPhotoIds');
  };

  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`};
  const dateKey=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`:null};
  const todayStats=()=>{const rides=getRides(),today=todayKey();let km=0,ms=0,count=0;rides.forEach(r=>{if(dateKey(r?.startedAt)!==today)return;km+=dist(r);const a=Date.parse(r?.startedAt||''),b=Date.parse(r?.drivingEndedAt||r?.endedAt||'');if(Number.isFinite(a)&&Number.isFinite(b)&&b>=a)ms+=b-a;count++});return {km,ms,count}};
  const decorateThanks=()=>{
    const card=document.querySelector('.thanks');if(!card)return;
    attachPendingPhotos();
    const stats=todayStats();
    let box=card.querySelector('.daily-stats');
    if(!box){box=document.createElement('div');box.className='daily-stats';box.innerHTML='<div class="daily-stat"><div class="daily-stat-icon">📏</div><div class="daily-stat-value" data-daily-km></div><div class="daily-stat-label">Dneska urolbováno</div></div><div class="daily-stat"><div class="daily-stat-icon">⏱️</div><div class="daily-stat-value" data-daily-time></div><div class="daily-stat-label">Čas za volantem</div></div>';const anchor=card.querySelector('.small');if(anchor)anchor.insertAdjacentElement('beforebegin',box);else card.appendChild(box)}
    box.querySelector('[data-daily-km]').textContent=stats.km.toFixed(1).replace('.',',')+' km';
    box.querySelector('[data-daily-time]').textContent=clock(stats.ms);
    const small=card.querySelector('.small');if(small)small.textContent=`Dnes máš za sebou ${stats.count} ${stats.count===1?'jízdu':'jízd'}.`;
  };

  const addControls=()=>{
    const b=document.getElementById('start');
    if(!b||!b.classList.contains('driving')){document.querySelector('.ride-controls')?.remove();document.querySelector('.pause-btn')?.remove();return}
    let row=b.closest('.start-row');
    if(!row){row=document.createElement('div');row.className='start-row';b.parentNode.insertBefore(row,b);row.appendChild(b)}
    if(!document.querySelector('.live-stats')){const box=document.createElement('div');box.className='live-stats';box.innerHTML='<div class="live-stat"><div class="live-stat-value" id="rideTime">00:00:00</div><div class="live-stat-label">Čas za volantem</div></div><div class="live-stat"><div class="live-stat-value" id="rideKm">0,0 km</div><div class="live-stat-label">Upraveno</div></div>';row.insertBefore(box,b)}
    if(!document.querySelector('.pause-btn')){const p=document.createElement('button');p.className='pause-btn show';p.id='pauseRide';p.type='button';p.textContent='⏸ Pauza';b.insertAdjacentElement('afterend',p);p.onclick=()=>pause()}
    updateStats();
  };
  const updateStats=()=>{const d=draft();const t=document.getElementById('rideTime'),k=document.getElementById('rideKm');if(t)t.textContent=clock(elapsed(d));if(k)k.textContent=dist(d).toFixed(1).replace('.',',')+' km'};

  const pause=()=>{const b=document.getElementById('start');if(!b)return;const d=draft()||{};if(d.pausedAt)return;d.pausedAt=new Date().toISOString();saveDraft(d);b.classList.remove('driving');b.classList.add('paused');b.textContent='POKRAČOVAT';document.querySelector('.live-stats')?.remove();document.querySelector('.pause-btn')?.remove();const n=document.createElement('div');n.className='pause-note show';n.textContent='Jízda je pozastavená. Až budeš připravený, pokračujeme.';b.insertAdjacentElement('afterend',n);b.onclick=()=>resume()};
  const resume=()=>{const b=document.getElementById('start');if(!b)return;const d=draft()||{};const p=Date.parse(d.pausedAt||'');if(Number.isFinite(p))d.pausedMs=(d.pausedMs||0)+(Date.now()-p);delete d.pausedAt;saveDraft(d);b.classList.remove('paused');b.classList.add('driving');b.textContent='JEDU';b.onclick=null;document.querySelector('.pause-note')?.remove();addControls();photoUI()};

  const confirmStop=()=>{if(document.getElementById('confirmStop'))return;const o=document.createElement('div');o.id='confirmStop';o.className='confirm-overlay';o.innerHTML='<div class="confirm-card"><h2>Chceš jízdu ukončit?</h2><p>Jestli jsi kliknul omylem, nic se neděje. Pokračuj v jízdě. Pokud je hotovo, jízdu ukončíme a data uložíme.</p><div class="confirm-actions"><button class="confirm-continue" id="continueRide">Pokračovat v jízdě</button><button class="confirm-stop" id="reallyStop">Ano, ukončit</button></div></div>';document.body.appendChild(o);o.querySelector('#continueRide').onclick=()=>o.remove();o.querySelector('#reallyStop').onclick=()=>{o.remove();const d=draft()||{};localStorage.setItem('vestope:groomer:pendingPhotoIds',JSON.stringify(d.photos||[]));localStorage.setItem('vestope:groomer:stoppedAt',new Date().toISOString());const b=document.getElementById('start');if(b){b.classList.remove('driving');b.classList.add('stopping');b.textContent='STOP';setTimeout(()=>{b.onclick=null;b.click()},350)}}};
  const intercept=()=>document.addEventListener('click',e=>{const b=e.target.closest('#start');if(!b||b.classList.contains('paused'))return;if(b.classList.contains('driving')){e.preventDefault();e.stopImmediatePropagation();confirmStop()}},true);

  const fixFormIcons=()=>{
    document.querySelectorAll('.sectionHeader,.formSection').forEach(section=>{const h=section.querySelector('h3');if(!h)return;const text=(h.textContent||'').trim();if(text==='Druh stopy'&&!section.querySelector('.trackTypeIcon')){const i=document.createElement('div');i.className='trackTypeIcon';i.setAttribute('aria-hidden','true');i.innerHTML='<span style="font-size:22px">⛷</span>';h.parentNode.insertBefore(i,h)} });
    document.querySelectorAll('.quality-title').forEach(h=>{const t=(h.textContent||'').trim();if(t.includes('Jaká je podle tebe stopa?')&&!h.querySelector('.vestope-inline-icon')){const i=document.createElement('span');i.className='vestope-inline-icon';i.textContent='🚜';i.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:11px;background:#78a8ee;font-size:21px;flex:0 0 38px';h.insertBefore(i,h.firstChild)}if(t.includes('Sněhové podmínky')&&!h.querySelector('.vestope-inline-icon')){const i=document.createElement('span');i.className='vestope-inline-icon';i.textContent='❄';i.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:11px;background:#eaf5ff;color:#4d91d9;font-size:22px;flex:0 0 38px';h.insertBefore(i,h.firstChild)}});
  };

  const init=()=>{
    if(document.getElementById('rideEnhancementStyle'))return;
    const s=document.createElement('div');s.id='rideEnhancementStyle';s.innerHTML=CSS;document.head.appendChild(s);
    intercept();
    const observer=new MutationObserver(()=>{fixFormIcons();addControls();photoUI();finalPhotoUI();decorateThanks()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setInterval(()=>{fixFormIcons();addControls();photoUI();finalPhotoUI();updateStats();decorateThanks()},1000);
    fixFormIcons();addControls();photoUI();finalPhotoUI();decorateThanks();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
