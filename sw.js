/*
 * Progetto A - service worker: l'app funziona anche senza rete.
 * Strategia "prima la rete": con internet carichi sempre la versione nuova (niente app ferma
 * a una versione vecchia); senza internet si usa la copia salvata dell'ultima visita.
 * Al primo avvio salva subito la pagina e i file che index.html carica.
 */
const CACHE = "metodo-integrale-v1";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch("./index.html", { cache: "no-store" });
      if (res.ok) {
        await cache.put("./index.html", res.clone());
        const html = await res.text();
        const urls = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)]
          .map((m) => m[1])
          .filter((u) => !u.startsWith("//") && !u.startsWith("data:"));
        await Promise.all([...new Set(urls)].map((u) => cache.add(u).catch(() => {})));
      }
    } catch (e) { /* senza rete al primo avvio: si salvera' alla prossima visita */ }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase e altri siti: diretti alla rete
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (e) {
      const hit = await cache.match(req) || await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") {
        const page = await cache.match("./index.html");
        if (page) return page;
      }
      return new Response("Senza rete e senza copia salvata di questo file.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});

// tocco sulla notifica del timer (Difesa): riporta in primo piano l'app gia' aperta
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const open = list.find((c) => "focus" in c);
    if (open) return open.focus();
    if (self.clients.openWindow) return self.clients.openWindow("./index.html#defense");
    return null;
  })());
});
