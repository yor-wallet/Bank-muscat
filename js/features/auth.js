'use strict';

/* ============================================================
   AUTH ENGINE — Supabase Auth + Postgres
   ============================================================ */
const AuthEngine = (() => {
  let pendingUid = null, rt = null, queue = Promise.resolve(), refreshTimer = 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function hasValidContext(){
    const c = UserContext.get();
    return !!(c && c.uid && c.userId && c.yorId);
  }
  function errorKey(err){
    if (!err) return 'auth.err.unavailable';
    const m = String(err.message || '').toLowerCase(), code = String(err.code || '').toLowerCase();
    if (m.includes('invalid login') || m.includes('invalid credentials')) return 'auth.err.wrongPassword';
    if (m.includes('phone') && (m.includes('required') || m.includes('invalid'))) return 'auth.err.phone';
    if (m.includes('already registered') || code === 'user_already_exists') return 'auth.err.emailInUse';
    if (m.includes('password should') || code === 'weak_password') return 'auth.err.weak';
    if (m.includes('not confirmed')) return 'auth.err.emailNotConfirmed';
    if (m.includes('rate limit') || m.includes('too many') || err.status === 429) return 'auth.err.tooMany';
    if (m.includes('invalid') && m.includes('email')) return 'auth.err.invalidEmail';
    if (m.includes('fetch') || m.includes('network')) return 'auth.err.network';
    return 'auth.err.unavailable';
  }
  async function loadContextFromUser(user){
    let profile = null;
    for (let i = 0; i < 8 && !profile; i++){            /* the DB trigger creates it at sign-up */
      profile = await UserDataEngine.readProfile(user.id);
      if (!profile) await sleep(400);
    }
    if (!profile) return null;
    const deviceId = DeviceEngine.ensure(), info = DeviceEngine.describe(), now = Date.now();
    let sessionId = SessionEngine.current(); if (!sessionId) sessionId = SessionEngine.start();
    /* 16.0.2 : l'enregistrement de l'appareil et de la session n'est plus ATTENDU (il retardait l'ouverture de ~0,3 s) : il part en arrière-plan */
    Promise.all([
      UserDataEngine.writeSub(user.id, 'devices', deviceId, { deviceId, platform: info.platform, browser: info.browser, language: info.language, lastSeen: now, status:'active', createdAt: now }),
      UserDataEngine.writeSub(user.id, 'sessions', sessionId, { sessionId, deviceId, uid: user.id, createdAt: now, lastActiveAt: now, status:'active' })
    ]).then(async () => {
      /* la liste « Appareils / Sessions » se met à jour dès que l'enregistrement est fait (il n'est plus attendu au démarrage) */
      const [d, s] = await Promise.all([UserDataEngine.readDevices(user.id), UserDataEngine.readSessions(user.id)]);
      const cur = UserContext.get(); if (!cur || cur.uid !== user.id) return;
      Runtime.devices = d || []; Runtime.sessions = s || [];
      try { if (['devices', 'sessions'].indexOf(R.current()) !== -1) R.go(R.current(), { force: true, replace: true }); } catch(e){ /* rien */ }
    }).catch(e => console.warn('device/session registration failed', e));
    return { uid: user.id, userId: profile.userId, yorId: profile.yorId, role: profile.role || 'user', deviceId, sessionId };
  }
  /* 16.0.2 : les 14 lectures ne dépendent que de l'identifiant : elles partent EN MÊME TEMPS que la lecture du profil au démarrage (voir handle) */
  function fetchAll(uid){
    return Promise.all([
      UserDataEngine.readProfile(uid), UserDataEngine.readDoc(uid, 'preferences', {}), UserDataEngine.readDoc(uid, 'security', {}),
      UserDataEngine.readAccounts(uid), UserDataEngine.readTransactions(uid), UserDataEngine.readReceipts(uid),
      UserDataEngine.readNotifications(uid), UserDataEngine.readCards(uid), UserDataEngine.readWallets(uid),
      UserDataEngine.readBankAccounts(uid), UserDataEngine.readContacts(uid), UserDataEngine.readBeneficiaries(uid),
      UserDataEngine.readDevices(uid), UserDataEngine.readSessions(uid)
    ]);
  }
  async function hydrateRuntime(){
    const c = UserContext.requireCtx();
    return applyAll(c, c.uid, await fetchAll(c.uid));
  }
  /* 16.0.2 : mise à jour en direct (argent reçu, solde modifié) : seules les 3 choses qui changent sont relues (soldes, opérations, alertes),
     au lieu des 14 lectures complètes à chaque alerte */
  async function hydrateLive(){
    const c = UserContext.get(); if (!c) return Runtime;
    const uid = c.uid;
    const [accounts, transactions, notifications] = await Promise.all([UserDataEngine.readAccounts(uid), UserDataEngine.readTransactions(uid), UserDataEngine.readNotifications(uid)]);
    if (!UserContext.get() || UserContext.get().uid !== uid) return Runtime;
    Runtime.accounts = accounts || []; Runtime.transactions = transactions || []; Runtime.notifications = notifications || [];
    try { if (typeof Guardian !== 'undefined') Guardian.heal(Runtime); } catch(e){}
    try { if (typeof Snap !== 'undefined' && UserContext.get()) Snap.save(uid, Runtime); } catch(e){}
    try { if (typeof Push !== 'undefined') Push.syncBadge(); } catch(e){}
    return Runtime;
  }
  function applyAll(c, uid, res){
    const [profile, settingsDoc, securityDoc, accounts, transactions, receipts, notifications, cards, wallets, bankAccounts, contacts, beneficiaries, devices, sessions] = res;
    if (!UserContext.get() || UserContext.get().uid !== uid) return Runtime;   /* signed out meanwhile */
    Runtime.ctx = c; Runtime.profile = profile; Runtime.settings = settingsDoc || {}; Runtime.security = securityDoc || {};
    Runtime.accounts = accounts || []; Runtime.transactions = transactions || []; Runtime.receipts = receipts || [];
    Runtime.notifications = notifications || []; Runtime.cards = cards || []; Runtime.wallets = wallets || [];
    Runtime.bankAccounts = bankAccounts || []; Runtime.contacts = contacts || []; Runtime.beneficiaries = beneficiaries || [];
    Runtime.devices = devices || []; Runtime.sessions = sessions || [];
    Runtime.hideBalance = !!Runtime.settings.hideBalances;
    LANG = Runtime.settings.language || DeviceLang.get();
    try { if (typeof Guardian !== 'undefined') Guardian.heal(Runtime); } catch(e){}      /* 18.0.0 : contrôle d'intégrité des données chargées */
    try { if (typeof Push !== 'undefined') Push.syncBadge(); } catch(e){}      /* 12.13.0 : pastille de l'icône = alertes non lues */
    return Runtime;
  }
  /* live updates: money received appears instantly, balances refresh */
  function stopRealtime(){ if (rt){ try { sb.removeChannel(rt); } catch(e){} rt = null; } clearTimeout(refreshTimer); }
  function startRealtime(uid){
    stopRealtime();
    try {
      rt = sb.channel('yor-' + uid)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:'user_id=eq.' + uid }, p => onLive(p.new))
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'accounts', filter:'user_id=eq.' + uid }, () => onLive(null))
        .subscribe();
    } catch(e){ console.warn('realtime unavailable', e); }
  }
  function onLive(n){
    const notifOn = !(Runtime.settings && Runtime.settings.notifications === false);
    if (n && notifOn){
      const d = n.data || {};
      if (typeof V18 !== 'undefined' && V18.handles(n.type)){
        V18.onNotif(n);                                                                                              /* 18.0.0 : message, crédit, annonce */
      } else if (n.type === 'TRANSFER_RECEIVED' || n.type === 'DEPOSIT'){
        const nv = (typeof notifView === 'function') ? notifView(n) : { title: n.title, message: n.message };
        InAppNotif.showCall({ title: nv.title, message: nv.message, status:'success' });
        try { Sfx.play('money'); } catch(e){ /* rien */ }
      } else if (n.type === 'REWARD'){
        try { Reward.celebrate({ id: n.id, amount: d.amount, currency: d.currency }); } catch(e){ /* rien */ }       /* 16.0.0 : la récompense réelle (écrite par le serveur) s'affiche en grand, avec son */
      } else if (n.type === 'NEW_USER'){
        try { Admin.onNewUser(); } catch(e){ /* rien */ }
        InAppNotif.showCall({ title: t('lx.n.NEW_USER'), message: n.message, status:'success' });                      /* administrateurs : un nouvel inscrit vient d'arriver */
        try { Sfx.play('newUser'); } catch(e){ /* rien */ }
      } else if (n.type === 'TRANSFER_STATUS'){
        InAppNotif.show({ icon:'globe', title: n.title, message: n.message, status:'success' });
        try { Sfx.play('notify'); } catch(e){ /* rien */ }
      } else if (n.type !== 'TRANSFER_SENT'){
        try { Sfx.play('notify'); } catch(e){ /* rien */ }
      }
    }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      try {
        await hydrateLive();
        const cur = R.current();
        if (['home','history','notifications'].indexOf(cur) !== -1) R.go(cur, { force:true });      /* l'écran admin se rafraîchit lui-même (Admin.onNewUser) */
      } catch(e){}
    }, 500);
  }
  function subscribe(onChange){
    if (!supabaseReady) return;
    sb.auth.onAuthStateChange((event, session) => {
      /* never await supabase calls inside this callback (deadlock) — defer + serialise */
      queue = queue.then(() => handle(event, session, onChange)).catch(e => console.warn('auth event failed', e));
    });
  }
  async function handle(event, session, onChange){
    if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
    const user = session && session.user;
    let loadFailed = false;
    if (user){
      const cur = UserContext.get();
      if (cur && cur.uid === user.id && event !== 'PASSWORD_RECOVERY') return;   /* tab refocus re-fires SIGNED_IN */
      if (pendingUid === user.id) return;
      pendingUid = user.id;
      try {
        const dataP = fetchAll(user.id); dataP.catch(() => {});              /* démarre tout de suite, en parallèle de la lecture du profil */
        try { if (typeof AppLock !== 'undefined') AppLock.prefetch(); } catch(e){ /* rien */ }
        /* 19.0.0 : réouverture instantanée : si une copie chiffrée récente existe, l'accueil s'affiche tout de suite avec les dernières données connues,
           puis le serveur remet tout à jour en arrière-plan (la copie n'est jamais utilisée si elle est illisible ou d'une autre personne) */
        let snap = null; try { if (typeof Snap !== 'undefined') snap = await Snap.load(user.id); } catch(e){ snap = null; }
        if (snap && snap[0] && snap[0].uid === user.id){
          const p0 = snap[0];
          const fast = { uid: user.id, userId: p0.userId, yorId: p0.yorId, role: p0.role || 'user', deviceId: DeviceEngine.ensure(), sessionId: SessionEngine.current() || SessionEngine.start() };
          UserContext.set(fast);
          applyAll(fast, user.id, snap);
          startRealtime(user.id);
          if (typeof onChange === 'function') onChange(true, event);
          pendingUid = null;
          (async () => {      /* mise à jour en arrière-plan */
            try {
              const real = await loadContextFromUser(user); let res = null; try { res = await dataP; } catch(e){ res = null; }
              const c0 = UserContext.get(); if (!c0 || c0.uid !== user.id) return;
              if (!real){ return; }
              UserContext.set(real); if (res) applyAll(real, user.id, res); else await hydrateRuntime();
              try { if (typeof Push !== 'undefined') Push.sync(); } catch(e){ /* rien */ }
              try { Snap.save(user.id, Runtime); } catch(e){ /* rien */ }
              const cur2 = R.current(); if (['home', 'history', 'notifications', 'cards', 'services'].indexOf(cur2) !== -1) R.go(cur2, { force: true, replace: true });
            } catch(e){ console.warn('background refresh failed', e); }
          })();
          return;
        }
        const ctx = await loadContextFromUser(user);
        if (ctx){
          UserContext.set(ctx);
          let res = null; try { res = await dataP; } catch(e){ res = null; }
          if (res) applyAll(ctx, user.id, res); else await hydrateRuntime();
          startRealtime(user.id);
          try { if (typeof Snap !== 'undefined') Snap.save(user.id, Runtime); } catch(e){ /* rien */ }
          try { if (typeof Push !== 'undefined') Push.sync(); } catch(e){}           /* 12.13.0 : réenregistre l'appareil des alertes (adresse de livraison renouvelée, autre personne) */
          if (typeof onChange === 'function') onChange(true, event);
          return;
        }
      } catch(e){ console.warn('context load failed', e); loadFailed = true; }
      finally { pendingUid = null; }
    }
    stopRealtime(); UserContext.reset(); resetRuntime(); SessionEngine.end();
    /* 'LOAD_FAILED' : la session existe mais ses données n'ont pas pu être lues (réseau, service) — ce n'est pas une déconnexion */
    if (typeof onChange === 'function') onChange(false, loadFailed ? 'LOAD_FAILED' : event);
  }
  async function signIn(email, password){
    if (!supabaseReady) return { ok:false, error:'auth.err.unavailable' };
    try {
      const { error } = await sb.auth.signInWithPassword({ email: String(email).trim(), password: String(password) });
      return error ? { ok:false, error: errorKey(error) } : { ok:true };
    } catch(e){ return { ok:false, error: errorKey(e) }; }
  }
  async function signUp(email, password, firstName, lastName, phone, country){
    if (!supabaseReady) return { ok:false, error:'auth.err.unavailable' };
    try {
      const { data, error } = await sb.auth.signUp({
        email: String(email).trim(), password: String(password),
        options: { data: { first_name: (firstName || '').trim(), last_name: (lastName || '').trim(),
          phone: String(phone || '').trim(), country: String(country || '').trim().toUpperCase().slice(0, 2),
          language: (['fr','en','ar'].indexOf(LANG) >= 0 ? LANG : DeviceLang.get()) } }
      });
      if (error) return { ok:false, error: errorKey(error) };
      /* e-mail confirmation enabled => no session yet */
      return { ok:true, needsConfirm: !data.session };
    } catch(e){ return { ok:false, error: errorKey(e) }; }
  }
  async function signOut(){
    try { if (typeof PinEngine !== 'undefined') PinEngine.forget(); } catch(e){}   /* 12.15.0: the encrypted code never outlives the session */
    try { if (typeof Snap !== 'undefined') Snap.wipe(); } catch(e){}                /* 19.0.0 : la copie chiffrée ne survit pas à une déconnexion volontaire */
    if (!supabaseReady) return;
    const c = UserContext.get();
    if (c){ try { await UserDataEngine.writeSub(c.uid, 'sessions', c.sessionId, { status:'signed_out', lastActiveAt: Date.now() }); } catch(e){} }
    stopRealtime();
    try { if (typeof Push !== 'undefined') await Push.forget(); } catch(e){}   /* 12.13.0 : cet appareil ne reçoit plus les alertes de la personne qui part (2 s au plus) */
    try { await sb.auth.signOut(); } catch(e){}
    UserContext.reset(); resetRuntime(); SessionEngine.end();
  }
  async function sendReset(email){
    if (!supabaseReady) return { ok:false, error:'auth.err.unavailable' };
    try {
      const { error } = await sb.auth.resetPasswordForEmail(String(email).trim(), { redirectTo: location.href.split('#')[0] });
      return error ? { ok:false, error: errorKey(error) } : { ok:true };
    } catch(e){ return { ok:false, error: errorKey(e) }; }
  }
  async function updatePassword(pw){
    try { const { error } = await sb.auth.updateUser({ password: String(pw) }); return error ? { ok:false, error: errorKey(error) } : { ok:true }; }
    catch(e){ return { ok:false, error: errorKey(e) }; }
  }
  return { subscribe, signIn, signUp, signOut, sendReset, updatePassword, hasValidContext, hydrateRuntime, hydrateLive };
})();

