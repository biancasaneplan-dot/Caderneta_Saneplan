/* Guarda o app no aparelho para abrir sem sinal. Mude VERSAO ao publicar uma atualização. */
const VERSAO='caderneta-v4';
const BASE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const fonte=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(u.origin!==location.origin&&!fonte)return;
  e.respondWith(caches.open(VERSAO).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const rede=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(rede);return hit}
    const res=await rede;
    return res||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
