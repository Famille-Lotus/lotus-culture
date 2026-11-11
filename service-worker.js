const CACHE='defi-quiz-culture-v11';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./lotus-icon.svg','./learning-data.js','./random-data.js','./culture.js','./lotus-family.css','./lotus-welcome.js','./lotus-brand.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('defi-quiz-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response.ok){try{await cache.put(event.request,response.clone());}catch{}}return response;}catch(error){const saved=await cache.match(event.request);if(saved)return saved;if(event.request.mode==='navigate'){const page=await cache.match('./index.html');if(page)return page;}throw error;}})());
});
