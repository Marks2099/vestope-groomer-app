const CACHE="vestope-groomer-phase-a-v19";
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo_vestope.cz.png",
  "./vestope-groomer-background.webp",
  "./groomer.svg",
  "./ride-enhancements.js",
  "./gps-guard.js"
];

const injectEnhancements=async response=>{
  if(!response)return response;
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  let html=await response.text();
  const scripts='<script src="./ride-enhancements.js?v=19"></script><script src="./gps-guard.js?v=19"></script>';
  if(!html.includes("ride-enhancements.js")){
    html=html.includes("</body>")?html.replace("</body>",scripts+"</body>"):html+scripts;
  }else if(!html.includes("gps-guard.js")){
    html=html.includes("</body>")?html.replace("</body>",'<script src="./gps-guard.js?v=19"></script></body>'):html+scripts;
  }
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
};

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vestope-groomer-phase-a-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith("/index.html")||url.pathname.endsWith("/")){
    event.respondWith(
      fetch(request,{cache:"no-store"})
        .then(response=>response.ok?injectEnhancements(response):response)
        .catch(async()=>injectEnhancements(await caches.match(request)))
    );
  }
});
