const CACHE="vestope-groomer-phase-a-v16";
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo_vestope.cz.png",
  "./vestope-groomer-background.webp",
  "./groomer.svg",
  "./ride-enhancements.js"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(key=>key.startsWith("vestope-groomer-phase-a-") && key!==CACHE)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;

  const url=new URL(request.url);
  if(url.origin!==location.origin)return;

  if(url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")){
    event.respondWith(
      fetch(request,{cache:"no-store"})
        .then(async response=>{
          if(!response.ok)return response;
          const headers=new Headers(response.headers);
          headers.delete("content-length");
          let html=await response.text();
          const enhancementScript='<script src="./ride-enhancements.js?v=16"></script>';
          if(!html.includes("ride-enhancements.js")){
            if(html.includes("</body>"))html=html.replace("</body>",enhancementScript+"</body>");
            else html+=enhancementScript;
          }
          return new Response(html,{status:response.status,statusText:response.statusText,headers});
        })
        .catch(()=>caches.match(request))
    );
  }
});
