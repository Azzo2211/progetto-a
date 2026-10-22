/*
 * Progetto A - Difesa: il timer non si ferma.
 *  - Schermo acceso durante gli allenamenti con il timer (Screen Wake Lock), dove il browser lo
 *    permette; si riattiva da solo quando torni sulla pagina.
 *  - Vibrazione e notifica a fine fase quando la pagina non è in primo piano (se hai dato il
 *    permesso alle notifiche).
 * I timer contano sull'orologio vero (Date.now): se il telefono sospende la pagina, al ritorno
 * il tempo passato è già conteggiato e le fasi finite nel frattempo vengono saltate.
 */
(function () {
  "use strict";
  let lock = null;
  let want = false;
  async function acquire() {
    want = true;
    if (lock || !("wakeLock" in navigator) || document.hidden) return;
    try {
      lock = await navigator.wakeLock.request("screen");
      lock.addEventListener("release", () => { lock = null; });
    } catch (e) { lock = null; /* non permesso: il timer conta lo stesso */ }
  }
  function release() {
    want = false;
    if (lock) { try { lock.release(); } catch (e) { /* niente */ } lock = null; }
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && want && !lock) acquire(); });
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* niente */ }
  }
  function askNotify() {
    try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); } catch (e) { /* niente */ }
  }
  async function notify(title, body) {
    vibrate([220, 120, 220]);
    if (!document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const reg = navigator.serviceWorker ? await navigator.serviceWorker.getRegistration() : null;
      if (reg && reg.showNotification) reg.showNotification(title, { body, tag: "difesa-timer", renotify: true, vibrate: [220, 120, 220] });
      else new Notification(title, { body, tag: "difesa-timer" });
    } catch (e) { /* niente */ }
  }
  window.DefenseAwake = { acquire, release, vibrate, notify, askNotify, get active() { return Boolean(lock); }, supported: "wakeLock" in navigator };
})();
