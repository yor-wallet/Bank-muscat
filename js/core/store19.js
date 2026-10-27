'use strict';

/* ============================================================
   STORE 19 (19.0.0) — mémoire de l'application et nettoyage automatique.
   Snap    : copie CHIFFRÉE (AES-GCM, clé non extractible de CET appareil) des données de la personne : à la réouverture l'accueil s'affiche tout de suite
             avec les dernières données connues, puis le serveur met à jour en arrière-plan. Une copie illisible ou d'une autre personne est supprimée.
   Janitor : supprime ce qui ne sert plus : copies d'autres comptes, restes temporaires, anciens caches, listes trop longues ; tourne au repos
             (après le démarrage, puis toutes les 30 min, jamais pendant une saisie ni quand la page est cachée).
   Aucune donnée n'est gardée après une déconnexion volontaire.
   ============================================================ */
const Snap = (() => {
  const DB = 'lx_snap', STORE = 'snap', KEYDB = 'lx_vault', KEYSTORE = 'k', VER = 2, MAX_AGE = 30 * 864e5;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const open = (name, store) => new Promise((res, rej) => {
    try { const r = indexedDB.open(name, 1); r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(store)) r.result.createObjectStore(store); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch(e){ rej(e); }
  });
  const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function key(create){
    const db = await open(KEYDB, KEYSTORE);
    try {
      const k = await req(db.transaction(KEYSTORE).objectStore(KEYSTORE).get('dk'));
      if (k || !create) return k || null;
      const nk = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      await new Promise((res, rej) => { const tx = db.transaction(KEYSTORE, 'readwrite'); tx.objectStore(KEYSTORE).put(nk, 'dk'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
      return nk;
    } finally { try { db.close(); } catch(e){ /* rien */ } }
  }
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const keep = (a, n) => (Array.isArray(a) ? a.slice(0, n) : []);

  /* ce qui est mémorisé : le même tableau que celui lu au démarrage (voir AuthEngine.fetchAll) */
  function pack(R0){
    return [R0.profile || null, R0.settings || {}, R0.security || {}, keep(R0.accounts, 20), keep(R0.transactions, 100), keep(R0.receipts, 30), keep(R0.notifications, 60), keep(R0.cards, 20), keep(R0.wallets, 40),
      keep(R0.bankAccounts, 20), keep(R0.contacts, 100), keep(R0.beneficiaries, 100), [], []];
  }
  let timer = 0, last = 0;
  async function write(uid, R0){
    try {
      if (!uid || !R0 || !R0.profile || !window.indexedDB || !crypto.subtle) return false;
      const k = await key(true); if (!k) return false;
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify({ v: VER, uid, at: Date.now(), d: pack(R0) }))));
      const db = await open(DB, STORE);
      try { await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put({ iv: b64(iv), ct: b64(ct), at: Date.now() }, uid); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
      finally { try { db.close(); } catch(e){ /* rien */ } }
      last = Date.now(); return true;
    } catch(e){ if (typeof Guardian !== 'undefined') Guardian.note('snap-save', e); return false; }
  }
  /* enregistre dans 1,2 s (regroupe les mises à jour rapprochées) */
  function save(uid, R0){ clearTimeout(timer); timer = setTimeout(() => write(uid, R0 || Runtime), 1200); }
  /* -> tableau prêt pour applyAll, ou null */
  async function load(uid){
    try {
      if (!uid || !window.indexedDB || !crypto.subtle) return null;
      const k = await key(false); if (!k) return null;
      const db = await open(DB, STORE); let row;
      try { row = await req(db.transaction(STORE).objectStore(STORE).get(uid)); } finally { try { db.close(); } catch(e){ /* rien */ } }
      if (!row || !row.ct || Date.now() - (row.at || 0) > MAX_AGE) { if (row) wipe(uid); return null; }
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(row.iv) }, k, unb64(row.ct));
      const o = JSON.parse(dec.decode(pt));
      if (!o || o.v !== VER || o.uid !== uid || !Array.isArray(o.d) || !o.d[0] || o.d[0].uid !== uid) { wipe(uid); return null; }
      return o.d;
    } catch(e){ try { wipe(uid); } catch(x){ /* rien */ } return null; }
  }
  async function wipe(uid){
    try {
      const db = await open(DB, STORE);
      try { await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); const s = tx.objectStore(STORE); if (uid) s.delete(uid); else s.clear(); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
      finally { try { db.close(); } catch(e){ /* rien */ } }
    } catch(e){ /* rien */ }
  }
  return { save, write, load, wipe, lastSaved: () => last };
})();

const Janitor = (() => {
  const stat = { runs: 0, removed: 0, at: 0, last: {} };
  const uidNow = () => { try { return (Runtime.ctx && Runtime.ctx.uid) || (UserContext.get() && UserContext.get().uid) || ''; } catch(e){ return ''; } };
  /* clés locales liées à une personne : on ne garde que celles de la personne connectée */
  const PER_USER = [/^sanad_ui_(.+)$/, /^amal_ai_(.+)$/, /^cr_fete_(.+)$/, /^yaser_(?:hist|mem)_(.+)$/, /^chat_(?:draft|tpl)_(.+)$/, /^fp_cache_(.+)$/];
  async function run(){
    if (typeof document !== 'undefined' && document.hidden) return stat;
    const uid = uidNow(); let n = 0; const det = {};
    try {
      const del = [];
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i); if (!k) continue;
        if (/^(lx_tmp|gq_done)/.test(k)) { del.push(k); continue; }
        for (const re of PER_USER){ const m = re.exec(k); if (m && uid && m[1] !== uid) { del.push(k); break; } }
      }
      del.forEach(k => { try { localStorage.removeItem(k); n++; } catch(e){ /* rien */ } });
      det.ls = del.length;
    } catch(e){ /* rien */ }
    try {   /* coffre de code : seulement la personne connectée */
      const raw = localStorage.getItem('friendly_pin_vault_v1');
      if (raw && uid){ const v = JSON.parse(raw); let ch = 0; Object.keys(v).forEach(u => { if (u !== uid) { delete v[u]; ch++; } }); if (ch) { localStorage.setItem('friendly_pin_vault_v1', JSON.stringify(v)); n += ch; det.vault = ch; } }
    } catch(e){ /* rien */ }
    try {   /* copies chiffrées d'autres comptes */
      if (window.indexedDB && uid){
        const db = await new Promise((res, rej) => { const r = indexedDB.open('lx_snap', 1); r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('snap')) r.result.createObjectStore('snap'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
        try {
          const keys = await new Promise((res, rej) => { const q = db.transaction('snap').objectStore('snap').getAllKeys(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
          const old = keys.filter(k => k !== uid);
          if (old.length) await new Promise((res, rej) => { const tx = db.transaction('snap', 'readwrite'); old.forEach(k => tx.objectStore('snap').delete(k)); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
          n += old.length; det.snap = old.length;
        } finally { try { db.close(); } catch(e){ /* rien */ } }
      }
    } catch(e){ /* rien */ }
    try {   /* anciens caches de coquille (le service worker garde seulement le courant) */
      if (window.caches){
        const names = await caches.keys(); let cur = ''; try { const r = await fetch('sw.js', { cache: 'no-store' }); const m = /fp-shell-[^'"`\s]+/.exec(await r.text()); cur = m ? m[0] : ''; } catch(e){ /* hors ligne : on ne touche à rien */ }
        if (cur){ const old = names.filter(x => /^fp-shell-/.test(x) && x !== cur); await Promise.all(old.map(x => caches.delete(x))); n += old.length; det.caches = old.length; }
      }
    } catch(e){ /* rien */ }
    try {   /* listes trop longues en mémoire */
      if (typeof Runtime !== 'undefined'){
        if ((Runtime.transactions || []).length > 300) { Runtime.transactions.length = 300; n++; }
        if ((Runtime.notifications || []).length > 150) { Runtime.notifications.length = 150; n++; }
        if ((Runtime.receipts || []).length > 100) { Runtime.receipts.length = 100; n++; }
      }
    } catch(e){ /* rien */ }
    stat.runs++; stat.removed += n; stat.at = Date.now(); stat.last = det;
    return stat;
  }
  let started = false;
  function start(){
    if (started) return; started = true;
    const idle = (fn) => { try { (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(fn, { timeout: 6000 }); } catch(e){ setTimeout(fn, 3000); } };
    setTimeout(() => idle(run), 12000);
    setInterval(() => idle(run), 30 * 60 * 1000);
    try { document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { try { if (typeof Runtime !== 'undefined' && Runtime.ctx) Snap.write(Runtime.ctx.uid, Runtime); } catch(e){ /* rien */ } } }); } catch(e){ /* rien */ }
  }
  return { run, start, stats: () => stat };
})();
try { Janitor.start(); } catch(e){ /* rien */ }
