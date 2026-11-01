'use strict';

/* ============================================================
   APP LOCK — Barq 12.9.0
   Ouverture de l'application (démarrage à froid, rechargement, ou retour après plus de GRACE_MS) :
     - appareil compatible, Face ID déjà activé  -> confirmation Face ID (obligatoire), sans saisie du code ;
     - appareil compatible, Face ID pas encore activé -> code à 6 chiffres puis activation de Face ID (obligatoire) ;
     - appareil sans biométrie -> code à 6 chiffres, comme avant.
   Après une nouvelle connexion : le code doit exister (création obligatoire), puis Face ID est demandé (confirmation de connexion).
   « Face ID ne marche pas ? » : le code est demandé (vérifié par le serveur) puis la clé Face ID est recréée.
   Pendant le verrouillage l'application dessous est couverte et rendue inerte. Le code est contrôlé par le serveur
   (verify_pin) et n'est jamais conservé.
   ============================================================ */
const AppLock = (() => {
  const GRACE_MS = 5000;
  const L = {
    en:{ unlockTitle:'Enter your PIN', unlockSub:'Enter your 6-digit code to open Barq', createTitle:'Create your PIN', createSub:'Choose a 6-digit code. It is needed to confirm your transfers.', confirmTitle:'Confirm your PIN', confirmSub:'Enter the same code again', mismatch:'Codes do not match. Try again.', weak:'This code is too easy to guess. Choose another one.', logout:'Log out', error:'Something went wrong. Try again.', del:'Delete' },
    fr:{ unlockTitle:'Entrez votre code', unlockSub:'Saisissez votre code à 6 chiffres pour ouvrir Barq', createTitle:'Créez votre code', createSub:'Choisissez un code à 6 chiffres. Il sert à confirmer vos transferts.', confirmTitle:'Confirmez votre code', confirmSub:'Saisissez de nouveau le même code', mismatch:'Les codes ne correspondent pas. Réessayez.', weak:'Ce code est trop facile à deviner. Choisissez-en un autre.', logout:'Se déconnecter', error:'Une erreur est survenue. Réessayez.', del:'Effacer' },
    ar:{ unlockTitle:'أدخل رمز PIN', unlockSub:'أدخل رمزك المكوّن من 6 أرقام لفتح برق', createTitle:'أنشئ رمز PIN', createSub:'اختر رمزاً من 6 أرقام. يُستخدم لتأكيد تحويلاتك.', confirmTitle:'أكّد رمز PIN', confirmSub:'أدخل الرمز نفسه مرة أخرى', mismatch:'الرمزان غير متطابقين. حاول مرة أخرى.', weak:'هذا الرمز سهل التخمين. اختر رمزاً آخر.', logout:'تسجيل الخروج', error:'حدث خطأ. حاول مرة أخرى.', del:'حذف' }
  };
  const tx = (k) => (L[LANG] || L.en)[k] || L.en[k];
  let signedIn = false, pinKnown = false, hiddenAt = 0, ov = null, cover = null, keyHandler = null, faceBusy = false, held = 0, heldAt = 0, lastPin = null;

  /* Barq 21.0.0 : les styles du verrouillage vivent dans css/s-screens.css (feuille unique) */
  function css(){ /* rien */ }
  function setInert(on){
    const r = document.getElementById('app'); if (!r) return;
    try { r.inert = on; } catch(e){}
    if (on) r.setAttribute('aria-hidden', 'true'); else r.removeAttribute('aria-hidden');
  }
  function removeCover(){ if (cover){ cover.remove(); cover = null; } }
  function close(){
    if (keyHandler){ document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    if (ov){ ov.remove(); ov = null; }
    removeCover(); setInert(false);
  }
  function showCover(){
    if (cover || ov) return; css();
    cover = document.createElement('div'); cover.className = 'yl-cover'; cover.setAttribute('aria-hidden', 'true');
    cover.innerHTML = logoLockup(72);
    document.body.appendChild(cover);
  }
  async function logout(){ close(); pinKnown = false; try { await AuthEngine.signOut(); } catch(e){} }

  /* Pavé du code : mode 'unlock' (vérifier), 'create' (créer + confirmer). onDone() peut renvoyer une promesse :
     la feuille du code reste affichée jusqu'à la fin de la suite (ex. activation de Face ID). */
  function open(mode, onDone){
    css(); close(); setInert(true);
    let entry = '', first = null, step = mode === 'create' ? 1 : 0, busy = false;
    ov = document.createElement('div'); ov.className = 'yl'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div id="yl-logo">' + logoLockup(56) + '</div>' +
      '<div class="yl-title" id="yl-title"></div><p class="yl-sub" id="yl-sub"></p>' +
      '<div class="yl-dots fk-dots" id="yl-dots">' + '<i class="yl-dot"></i>'.repeat(6) + '</div>' +
      '<div class="yl-err" id="yl-err" role="alert"></div>' +
      Keypad.padHtml('yl') +
      '<button type="button" class="yl-out" id="yl-out">' + escapeHtml(tx('logout')) + '</button>';
    document.body.appendChild(ov);
    const me = ov;
    const $ = (id) => me.querySelector('#' + id);
    function paint(){
      $('yl-title').textContent = step === 0 ? tx('unlockTitle') : step === 1 ? tx('createTitle') : tx('confirmTitle');
      $('yl-sub').textContent = step === 0 ? tx('unlockSub') : step === 1 ? tx('createSub') : tx('confirmSub');
      me.querySelectorAll('.yl-dot').forEach((d, i) => d.classList.toggle('on', i < entry.length));
    }
    function fail(msg){
      $('yl-err').textContent = msg || tx('error');
      const d = $('yl-dots'); d.classList.remove('yl-shake'); void d.offsetWidth; d.classList.add('yl-shake');
      try { UIKit.haptic('error'); } catch(e){}
      entry = ''; busy = false; paint();
    }
    async function success(){
      pinKnown = true; try { UIKit.haptic('success'); } catch(e){}
      let r; try { r = onDone ? onDone() : null; } catch(e){ r = null; }
      try { await Promise.resolve(r); } catch(e){}
      if (ov === me) close();
    }
    async function submit(){
      busy = true;
      if (step === 0){
        let r; try { r = await PinEngine.verify(entry); } catch(e){ r = { ok:false, msg:tx('error') }; }
        if (r.ok){ lastPin = entry; success(); return; }
        fail(r.msg); return;
      }
      if (step === 1){ first = entry; entry = ''; step = 2; busy = false; $('yl-err').textContent = ''; paint(); return; }
      if (entry !== first){ first = null; step = 1; fail(tx('mismatch')); return; }
      const r = await sb.rpc('set_pin', { p_pin: entry });
      if (r.error){
        const m = String(r.error.message || '').toLowerCase();
        if (m.includes('weak_pin')){ first = null; step = 1; fail(tx('weak')); return; }
        if (!m.includes('pin_exists')){ fail(tx('error')); return; }
      }
      lastPin = entry; success();
    }
    function press(k, btn){
      if (busy) return;
      $('yl-err').textContent = '';
      if (k === 'del'){ entry = entry.slice(0, -1); paint(); return; }
      if (entry.length >= 6) return;
      entry += k; try { UIKit.haptic('tap'); } catch(e){} paint();
      if (btn) Keypad.fly(btn, $('yl-dots'), entry.length - 1);
      if (entry.length === 6){ Keypad.bloom($('yl-dots')); submit(); }
    }
    Keypad.bind(me, press);
    $('yl-out').onclick = logout;
    keyHandler = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
    document.addEventListener('keydown', keyHandler);
    paint();
  }

  let pinP = null, pinPAt = 0;
  /* 16.0.2 : l'état du code est demandé dès que la personne est connue (en parallèle du chargement des données), pas après */
  function prefetch(){ if (!pinP || Date.now() - pinPAt > 20000){ pinPAt = Date.now(); pinP = hasPin(); } }
  async function hasPin(){
    try { const r = await PinEngine.hasPin(); return r; } catch(e){ return null; }
  }
  /* Après le code (vérifié ou créé) : sur un appareil compatible, Face ID doit être activé. */
  async function afterPin(purpose, next){
    let sup = false; try { sup = await FaceId.supported(); } catch(e){}
    if (sup){
      const r = await FaceId.reenroll({ purpose: purpose, logout: logout });
      if (r && r.loggedOut) return;
      if (lastPin && r && r.ok && !r.skipped){ try { await PinEngine.seed(lastPin, r); } catch(e){ /* rien */ } }     /* 16.1.0 : Face ID activé -> les transferts n'ont plus besoin du code */
    }
    lastPin = null;
    close(); if (next) next();
  }
  /* Confirmation Face ID (obligatoire quand l'appareil le permet) à l'ouverture / au retour dans l'application */
  async function unlockFlow(purpose, next){
    css(); setInert(true);
    let sup = false; try { sup = await FaceId.supported(); } catch(e){}
    if (sup && FaceId.info().enrolled){
      if (faceBusy) return; faceBusy = true;
      let r; try { r = await FaceId.gate({ purpose: purpose, logout: logout }); } catch(e){ r = { ok:false, recover:true }; }
      faceBusy = false;
      if (r.ok){ pinKnown = true; close(); if (next) next(); return; }
      if (r.loggedOut) return;
      open('unlock', () => afterPin(purpose, next));            /* Face ID ne marche pas : code, puis nouvelle clé */
      return;
    }
    open('unlock', () => afterPin(purpose, next));
  }
  /* App start with an existing session: Face ID / the code is asked BEFORE anything is shown. */
  async function gate(next){
    if (!signedIn){ next(); return; }
    css(); showCover(); setInert(true);
    const has = await (pinP && Date.now() - pinPAt < 20000 ? pinP : hasPin()); pinP = null;
    pinKnown = has !== false;                 /* if the status cannot be read, fail closed: ask for the code */
    if (has === false){ open('create', () => afterPin('unlock', next)); return; }
    unlockFlow('unlock', next);
  }
  /* After a fresh sign-in / sign-up: the code must exist, then Face ID confirms the sign-in. */
  async function ensurePin(){
    if (!signedIn || ov || faceBusy) return;
    const has = await hasPin();
    if (has === false){ pinKnown = false; open('create', () => afterPin('login', null)); return; }
    if (has === true) pinKnown = true;
    let sup = false; try { sup = await FaceId.supported(); } catch(e){}
    if (!sup) return;
    css(); setInert(true); faceBusy = true;
    let r; try { r = await FaceId.gate({ purpose: 'login', logout: logout }); } catch(e){ r = { ok:false, recover:true }; }
    faceBusy = false;
    if (r.ok){ close(); return; }
    if (r.loggedOut) return;
    open('unlock', () => afterPin('login', null));
  }
  function setSignedIn(v){ signedIn = !!v; if (!signedIn){ pinKnown = false; faceBusy = false; pinP = null; close(); } }
  /* 16.0.1 : pendant un transfert (confirmation Face ID / code, puis envoi) la feuille système ou une notification peut mettre la page « en arrière-plan » un
     instant : le verrouillage ne doit alors NI couvrir l'écran (on aurait cru l'application fermée) NI redemander le code au retour. */
  function hold(){ if (!held) heldAt = Date.now(); held++; }
  function release(){ held = Math.max(0, held - 1); if (!held){ hiddenAt = 0; if (!ov && !faceBusy) removeCover(); } }
  function stale(){ if (held && Date.now() - heldAt > 180000) held = 0; }     /* garde-fou : une suspension oubliée ne dure jamais plus de 3 min */
  function onHide(){ stale(); if (held) return; hiddenAt = Date.now(); if (signedIn && pinKnown) showCover(); }
  function onShow(){
    stale();
    if (held){ hiddenAt = 0; if (!ov && !faceBusy) removeCover(); return; }
    if (!signedIn || !pinKnown){ removeCover(); return; }
    if (ov || faceBusy){ removeCover(); return; }
    if (hiddenAt && Date.now() - hiddenAt >= GRACE_MS){ showCover(); unlockFlow('unlock', null); }
    else removeCover();
  }
  function init(){
    try { FaceId.warm(); } catch(e){}
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onHide(); else onShow(); });
    window.addEventListener('pagehide', onHide);
    window.addEventListener('pageshow', (e) => { if (e.persisted) onShow(); });
  }
  return { init, gate, ensurePin, setSignedIn, hold, release, prefetch };
})();
