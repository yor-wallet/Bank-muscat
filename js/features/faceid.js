'use strict';

/* ============================================================================================================
   FACE ID — confirmation biométrique OBLIGATOIRE (12.9.0)
   Utilise WebAuthn avec l'authentificateur de la PLATEFORME (Face ID / Touch ID sur iPhone, Windows Hello, empreinte
   Android) et la vérification de l'utilisateur exigée (userVerification:'required').
   - Exigé : à la confirmation de connexion, à l'ouverture / au retour dans l'application, et avant chaque confirmation
     de transfert (PinEngine.authorize).
   - Une clé est créée une seule fois par appareil et par compte. Elle reste dans le trousseau de l'appareil : aucun
     secret ne passe par ce code ; seul l'identifiant public de la clé et sa clé publique sont gardés localement.
   - Chaque confirmation est contrôlée localement : défi aléatoire, origine, hash du domaine, drapeaux « présence » +
     « vérification de l'utilisateur », et signature vérifiée avec la clé publique enregistrée.
   - IMPORTANT : cette vérification est faite dans l'appareil. Le serveur ne la voit pas : le code PIN à 6 chiffres reste
     le contrôle serveur (verify_pin) et la clé du transfert. Face ID s'ajoute devant, il ne remplace pas le PIN.
   - Appareil sans biométrie / sans WebAuthn : l'étape est ignorée (on ne peut pas exiger ce que l'appareil n'a pas) ;
     le PIN seul s'applique alors.
   ============================================================================================================ */
const FaceId = (() => {
  const KEY = 'friendly_faceid_v1';
  const L = {
    en: { verifyTitle:'Confirm with {N}', verifySub:'Look at your phone to confirm it is you.', unlock:'Unlock Barq', login:'Confirm your sign-in', transfer:'Confirm this transfer', generic:'Confirm to continue',
      enrollTitle:'Turn on {N}', enrollSub:'{N} is required to sign in and to confirm transfers on this device.', go:'Use {N}', retry:'Try again', cancel:'Cancel', logout:'Log out',
      recover:'{N} not working? Use your PIN', skip:'Continue with PIN only', errCancelled:'{N} was cancelled.', errInvalid:'{N} could not be verified. Try again.', errGeneric:'{N} is not available right now. Try again.', ok:'Confirmed', generic_n:'Biometrics' },
    fr: { verifyTitle:'Confirmez avec {N}', verifySub:'Regardez votre téléphone pour confirmer que c\'est bien vous.', unlock:'Déverrouiller Barq', login:'Confirmez votre connexion', transfer:'Confirmez ce transfert', generic:'Confirmez pour continuer',
      enrollTitle:'Activez {N}', enrollSub:'{N} est obligatoire pour vous connecter et confirmer les transferts sur cet appareil.', go:'Utiliser {N}', retry:'Réessayer', cancel:'Annuler', logout:'Se déconnecter',
      recover:'{N} ne marche pas ? Utilisez votre code', skip:'Continuer avec le code seulement', errCancelled:'{N} a été annulé.', errInvalid:'{N} n\'a pas pu être vérifié. Réessayez.', errGeneric:'{N} n\'est pas disponible pour le moment. Réessayez.', ok:'Confirmé', generic_n:'Biométrie' },
    ar: { verifyTitle:'أكّد باستخدام {N}', verifySub:'انظر إلى هاتفك لتأكيد أنك أنت.', unlock:'فتح برق', login:'أكّد تسجيل دخولك', transfer:'أكّد هذا التحويل', generic:'أكّد للمتابعة',
      enrollTitle:'فعّل {N}', enrollSub:'{N} مطلوب لتسجيل الدخول وتأكيد التحويلات على هذا الجهاز.', go:'استخدم {N}', retry:'أعد المحاولة', cancel:'إلغاء', logout:'تسجيل الخروج',
      recover:'{N} لا يعمل؟ استخدم رمزك', skip:'المتابعة بالرمز فقط', errCancelled:'تم إلغاء {N}.', errInvalid:'تعذّر التحقق عبر {N}. حاول مجدداً.', errGeneric:'{N} غير متاح الآن. حاول مجدداً.', ok:'تم التأكيد', generic_n:'البصمة' }
  };
  const apple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent || '');
  const nm = () => apple() ? 'Face ID' : (L[LANG] || L.en).generic_n;
  const tx = (k) => String(((L[LANG] || L.en)[k] || L.en[k] || '')).replace(/\{N\}/g, nm());
  let supportedP = null, supportedV = null, el = null;

  const b64u = (buf) => { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = (s) => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a.buffer; };
  const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
  const store = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

  async function uid(){
    try { const c = (typeof UserContext !== 'undefined' && UserContext.get) ? UserContext.get() : null; if (c && c.uid) return c.uid; } catch (e) {}
    try { const r = await sb.auth.getSession(); const u = r && r.data && r.data.session && r.data.session.user; return u ? u.id : null; } catch (e) { return null; }
  }
  function supported(){
    if (supportedP) return supportedP;
    supportedP = (async () => {
      try {
        if (!window.isSecureContext || !window.PublicKeyCredential || !navigator.credentials || !crypto || !crypto.subtle) return false;
        if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') return false;
        return !!(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
      } catch (e) { return false; }
    })().then(v => { supportedV = v; return v; });
    return supportedP;
  }
  /* état synchrone pour l'écran Paramètres : supported = null tant que la détection n'est pas finie */
  function info(){
    let enrolled = false;
    try { const c = (typeof UserContext !== 'undefined' && UserContext.get) ? UserContext.get() : null; enrolled = !!(c && c.uid && store()[c.uid]); } catch (e) {}
    return { supported: supportedV, enrolled, name: nm() };
  }

  /* --- création de la clé (une fois par appareil et par compte) --- */
  async function enroll(){
    const u = await uid(); if (!u) return { ok: false, reason: 'error' };
    let label = u, display = 'Barq';
    try { const c = UserContext.get(); if (c && c.email) label = c.email; const p = Runtime.profile || {}; display = ((p.firstName || '') + ' ' + (p.lastName || '')).trim() || display; } catch (e) {}
    try {
      const cred = await navigator.credentials.create({ publicKey: {
        challenge: rand(32), rp: { name: 'Barq', id: location.hostname },
        user: { id: new TextEncoder().encode(String(u)).slice(0, 64), name: label, displayName: display },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged', requireResidentKey: false },
        timeout: 60000, attestation: 'none', extensions: { prf: {} }
      } });
      if (!cred) return { ok: false, reason: 'error' };
      const r = cred.response;
      const pk = typeof r.getPublicKey === 'function' ? r.getPublicKey() : null;
      const alg = typeof r.getPublicKeyAlgorithm === 'function' ? r.getPublicKeyAlgorithm() : -7;
      let prf = false; try { const x = cred.getClientExtensionResults ? cred.getClientExtensionResults() : {}; prf = !!(x && x.prf && x.prf.enabled); } catch (e) {}
      const s = store(); s[u] = { id: b64u(cred.rawId), pk: pk ? b64u(pk) : null, alg: alg, at: Date.now(), prf: prf }; save(s);
      return { ok: true };
    } catch (e) { return { ok: false, reason: (e && e.name === 'NotAllowedError') ? 'cancelled' : 'error' }; }
  }

  /* --- vérification d'une confirmation --- */
  function derToRaw(sig){
    let i = 2; if (sig[1] & 0x80) i += sig[1] & 0x7f;
    if (sig[i] !== 2) throw new Error('der');
    const rl = sig[i + 1]; const r = sig.slice(i + 2, i + 2 + rl); i += 2 + rl;
    if (sig[i] !== 2) throw new Error('der');
    const sl = sig[i + 1]; const s = sig.slice(i + 2, i + 2 + sl);
    const fix = (x) => { while (x.length > 32 && x[0] === 0) x = x.slice(1); const o = new Uint8Array(32); o.set(x, 32 - x.length); return o; };
    const out = new Uint8Array(64); out.set(fix(r), 0); out.set(fix(s), 32); return out;
  }
  async function check(a, challenge, rec){
    try {
      if (b64u(a.rawId) !== rec.id) return false;
      const r = a.response;
      const cd = JSON.parse(new TextDecoder().decode(r.clientDataJSON));
      if (cd.type !== 'webauthn.get' || cd.challenge !== b64u(challenge) || cd.origin !== location.origin) return false;
      const ad = new Uint8Array(r.authenticatorData);
      const rpHash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(location.hostname)));
      for (let i = 0; i < 32; i++) if (ad[i] !== rpHash[i]) return false;
      if ((ad[32] & 0x05) !== 0x05) return false;               /* présence (UP) + vérification de l'utilisateur (UV) */
      if (!rec.pk) return true;
      const cdHash = new Uint8Array(await crypto.subtle.digest('SHA-256', r.clientDataJSON));
      const data = new Uint8Array(ad.length + 32); data.set(ad, 0); data.set(cdHash, ad.length);
      const sig = new Uint8Array(r.signature);
      if (rec.alg === -7){
        const key = await crypto.subtle.importKey('spki', unb64u(rec.pk), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
        return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, derToRaw(sig), data);
      }
      if (rec.alg === -257){
        const key = await crypto.subtle.importKey('spki', unb64u(rec.pk), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
        return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);
      }
      return false;
    } catch (e) { return false; }
  }
  async function assert(prfSalt){
    const u = await uid(); const rec = u ? store()[u] : null;
    if (!rec) return { ok: false, reason: 'error' };
    const challenge = rand(32);
    let a;
    try {
      const pk = { challenge, rpId: location.hostname,
        allowCredentials: [{ type: 'public-key', id: unb64u(rec.id), transports: ['internal'] }], userVerification: 'required', timeout: 60000 };
      if (prfSalt) pk.extensions = { prf: { eval: { first: prfSalt } } };
      a = await navigator.credentials.get({ publicKey: pk });
    } catch (e) { return { ok: false, reason: (e && e.name === 'NotAllowedError') ? 'cancelled' : 'error' }; }
    if (!a) return { ok: false, reason: 'error' };
    if (!(await check(a, challenge, rec))) return { ok: false, reason: 'invalid' };
    /* 12.15.0 — PRF secret (WebAuthn extension, Safari iOS 18+): released by the authenticator only after Face ID; null when unsupported */
    let prf = null;
    try { const x = a.getClientExtensionResults ? a.getClientExtensionResults() : {}; const f = x && x.prf && x.prf.results && x.prf.results.first; if (f && f.byteLength >= 32) prf = new Uint8Array(f); } catch (e) {}
    return { ok: true, prf: prf, cid: rec.id };
  }

  /* --- feuille plein écran : orbe « Face ID » animée, un toucher pour lancer la lecture --- */
  const FACE = '<svg class="fid-face" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<g class="fc"><path d="M10 22v-6a6 6 0 0 1 6-6h6"/><path d="M42 10h6a6 6 0 0 1 6 6v6"/><path d="M54 42v6a6 6 0 0 1-6 6h-6"/><path d="M22 54h-6a6 6 0 0 1-6-6v-6"/></g>' +
    '<g class="ff"><path d="M23 25v4"/><path d="M41 25v4"/><path d="M32 25v9a2 2 0 0 1-2 2h-1"/><path d="M23 42c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5"/></g>' +
    '<path class="fk" d="M19 33.5l9.5 9.5L46 22"/></svg>';
  /* Barq 21.0.0 : les styles de la feuille Face ID vivent dans css/s-screens.css */
  function css(){ /* rien */ }
  function close(){ if (el){ try { el.remove(); } catch (e) {} el = null; } }

  function sheet(mode, o){
    o = o || {};
    css(); close();
    return new Promise(resolve => {
      const root = document.createElement('div'); el = root;
      root.className = 'fid'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
      const purpose = tx(o.purpose || 'generic');
      root.innerHTML = '<div class="fid-card"><i class="fid-grab" aria-hidden="true"></i>' +
        '<div class="fid-chip">' + escapeHtml(purpose) + '</div>' +
        '<button type="button" class="fid-orb" id="fid-orb" aria-label="' + escapeHtml(tx('go')) + '"><i class="fid-ring r1"></i><i class="fid-ring r2"></i><i class="fid-ring r3"></i>' + FACE + '</button>' +
        '<h2 class="fid-title">' + escapeHtml(tx(mode === 'enroll' ? 'enrollTitle' : 'verifyTitle')) + '</h2>' +
        '<p class="fid-sub">' + escapeHtml(tx(mode === 'enroll' ? 'enrollSub' : 'verifySub')) + '</p>' +
        '<div class="fid-err" id="fid-err" role="alert"></div>' +
        '<button type="button" class="btn btn-primary fid-btn" id="fid-go">' + escapeHtml(tx('go')) + '</button>' +
        (mode === 'verify' && o.recover ? '<button type="button" class="fid-link" id="fid-rec">' + escapeHtml(tx('recover')) + '</button>' : '') +
        (o.cancel ? '<button type="button" class="fid-link muted" id="fid-cancel">' + escapeHtml(tx('cancel')) + '</button>' : '') +
        (o.logout ? '<button type="button" class="fid-link muted" id="fid-out">' + escapeHtml(tx('logout')) + '</button>' : '') + '</div>';
      document.body.appendChild(root);
      const $ = (id) => root.querySelector('#' + id);
      let busy = false, done = false, fails = 0;
      /* Barq 21.0.0 — comme dans les autres applications : quand la confirmation vient d'un toucher (envoi d'un transfert), l'invite Face ID du système
         s'ouvre directement ; la feuille reste invisible tant que tout va bien, et ne se montre que s'il faut réessayer */
      let quiet = false; try { quiet = mode === 'verify' && !!(navigator.userActivation && navigator.userActivation.isActive); } catch (e) {}
      if (quiet) root.classList.add('fid-quiet');
      const finish = (v) => { if (done) return; done = true; root.classList.add('out'); setTimeout(() => { try { root.remove(); } catch (e) {} if (el === root) el = null; }, 260); resolve(v); };
      async function run(){
        if (busy || done || root.classList.contains('ok')) return;     /* a second tap during the success animation must not create a second key */
        busy = true; root.classList.add('busy'); $('fid-err').textContent = ''; $('fid-go').disabled = true;
        const r = mode === 'enroll' ? await enroll() : await assert(o.prfSalt || null);
        busy = false; root.classList.remove('busy'); $('fid-go').disabled = false;
        if (r.ok){ if (quiet){ try { UIKit.haptic('success'); } catch (e) {} finish({ ok: true, prf: r.prf || null, cid: r.cid || null }); return; } root.classList.add('ok'); try { UIKit.haptic('success'); } catch (e) {} setTimeout(() => finish({ ok: true, prf: r.prf || null, cid: r.cid || null }), 700); return; }
        root.classList.remove('fid-quiet'); quiet = false;
        $('fid-err').textContent = tx(r.reason === 'cancelled' ? 'errCancelled' : r.reason === 'invalid' ? 'errInvalid' : 'errGeneric');
        $('fid-go').textContent = tx('retry');
        /* Safety valve: the device says it supports biometrics but the key cannot be created after 3 tries -> do not lock the user out */
        fails++;
        if (mode === 'enroll' && fails >= 3 && !$('fid-skip')){
          const b = document.createElement('button'); b.type = 'button'; b.className = 'fid-link muted'; b.id = 'fid-skip'; b.textContent = tx('skip');
          b.onclick = () => finish({ ok: true, skipped: 'enroll_failed' });
          $('fid-go').insertAdjacentElement('afterend', b);
        }
        try { UIKit.haptic('error'); } catch (e) {}
      }
      $('fid-orb').onclick = run; $('fid-go').onclick = run;
      if ($('fid-rec')) $('fid-rec').onclick = () => finish({ ok: false, recover: true });
      if ($('fid-cancel')) $('fid-cancel').onclick = () => finish({ ok: false, cancelled: true });
      if ($('fid-out')) $('fid-out').onclick = () => { finish({ ok: false, loggedOut: true }); try { o.logout(); } catch (e) {} };
      /* un toucher vient d'avoir lieu (ex. « Confirmer » le transfert) : on lance tout de suite, sinon on attend le toucher sur l'orbe */
      try { if (navigator.userActivation && navigator.userActivation.isActive) run(); } catch (e) {}
    });
  }

  /* Porte de confirmation : résout { ok:true } (confirmé ou ignoré), { ok:false, cancelled } ou { ok:false, recover } */
  async function gate(o){
    o = o || {};
    if (!(await supported())) return { ok: true, skipped: 'unsupported' };
    const u = await uid(); if (!u) return { ok: true, skipped: 'no_user' };
    const rec = store()[u];
    if (!rec) return sheet('enroll', o);
    return sheet('verify', Object.assign({ recover: true }, o));
  }
  /* Nouvelle clé (après vérification du PIN) */
  async function reenroll(o){
    if (!(await supported())) return { ok: true, skipped: 'unsupported' };
    return sheet('enroll', o || {});
  }
  function warm(){ supported(); }
  /* the stored key of this account on this device: { id, prf } or null */
  async function record(){ const u = await uid(); const r = u ? store()[u] : null; return r ? { id: r.id, prf: r.prf === true } : null; }
  return { gate, reenroll, supported, info, warm, record, name: nm, _check: check };
})();
