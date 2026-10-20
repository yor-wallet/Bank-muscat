'use strict';

/* ============================================================
   MOBILE (16.1.0) — notifications obligatoires + installation sur l'iPhone sans App Store
   - NotifGate : après la connexion, si les notifications ne sont pas activées, une feuille NON fermable demande l'autorisation (le bouton est un geste
     de la personne : seul moyen d'obtenir l'autorisation). Si elles sont bloquées, elle explique comment les rouvrir et revérifie.
   - Sur iPhone, les notifications n'existent que si le site est ajouté à l'écran d'accueil (règle d'Apple) : la feuille explique l'installation
     (Partager > Sur l'écran d'accueil). Ce n'est pas une application de l'App Store : c'est le site installé, gratuit, qui s'ouvre en plein écran.
   ============================================================ */
Object.assign(TR.en, {
  'mb.n.title': 'Turn on notifications', 'mb.n.body': 'You are alerted the moment you send or receive money, with the amount, the person and the reference.',
  'mb.n.enable': 'Allow notifications', 'mb.n.err': 'Could not turn them on. Please try again.',
  'mb.n.dTitle': 'Notifications are blocked', 'mb.n.dIos': 'Open Settings › Notifications › Live X Digitale and turn on Allow Notifications, then come back here.',
  'mb.n.dOther': 'Open the site settings of your browser (the lock icon next to the address) and set Notifications to Allow, then come back here.',
  'mb.n.recheck': 'I turned them on', 'mb.n.later': 'Later', 'mb.n.still': 'They are still blocked.',
  'mb.i.title': 'Install Live X Digitale on your iPhone', 'mb.i.sub': 'Free, without the App Store. Needed to receive notifications.',
  'mb.i.s1': 'Open this page in Safari', 'mb.i.s2': 'Tap the Share button', 'mb.i.s3': 'Choose “Add to Home Screen”', 'mb.i.s4': 'Tap Add, then open Live X Digitale from your home screen',
  'mb.i.cont': 'Continue in the browser', 'mb.i.row': 'Install on your phone', 'mb.i.rowD': 'Free, no App Store — full-screen app and notifications',
  'mb.i.a1': 'Open the browser menu', 'mb.i.a2': 'Tap “Install app” or “Add to Home screen”', 'mb.i.a3': 'Confirm, then open Live X Digitale from your home screen',
  'mb.i.go': 'Install now', 'mb.i.done': 'Already installed',
});
Object.assign(TR.fr, {
  'mb.n.title': 'Activez les notifications', 'mb.n.body': 'Vous êtes averti dès que vous envoyez ou recevez de l’argent, avec le montant, la personne et la référence.',
  'mb.n.enable': 'Autoriser les notifications', 'mb.n.err': 'Impossible de les activer. Veuillez réessayer.',
  'mb.n.dTitle': 'Les notifications sont bloquées', 'mb.n.dIos': 'Ouvrez Réglages › Notifications › Live X Digitale et activez « Autoriser les notifications », puis revenez ici.',
  'mb.n.dOther': 'Ouvrez les réglages du site dans votre navigateur (le cadenas à côté de l’adresse) et réglez Notifications sur « Autoriser », puis revenez ici.',
  'mb.n.recheck': 'Je les ai activées', 'mb.n.later': 'Plus tard', 'mb.n.still': 'Elles sont toujours bloquées.',
  'mb.i.title': 'Installez Live X Digitale sur votre iPhone', 'mb.i.sub': 'Gratuit, sans App Store. Nécessaire pour recevoir les notifications.',
  'mb.i.s1': 'Ouvrez cette page dans Safari', 'mb.i.s2': 'Touchez le bouton Partager', 'mb.i.s3': 'Choisissez « Sur l’écran d’accueil »', 'mb.i.s4': 'Touchez Ajouter, puis ouvrez Live X Digitale depuis l’écran d’accueil',
  'mb.i.cont': 'Continuer dans le navigateur', 'mb.i.row': 'Installer sur votre téléphone', 'mb.i.rowD': 'Gratuit, sans App Store — application plein écran et notifications',
  'mb.i.a1': 'Ouvrez le menu du navigateur', 'mb.i.a2': 'Touchez « Installer l’application » ou « Ajouter à l’écran d’accueil »', 'mb.i.a3': 'Confirmez, puis ouvrez Live X Digitale depuis l’écran d’accueil',
  'mb.i.go': 'Installer maintenant', 'mb.i.done': 'Déjà installée',
});
Object.assign(TR.ar, {
  'mb.n.title': 'فعّل الإشعارات', 'mb.n.body': 'يصلك تنبيه فور إرسال أو استلام أي مبلغ، مع المبلغ والشخص والمرجع.',
  'mb.n.enable': 'السماح بالإشعارات', 'mb.n.err': 'تعذّر التفعيل. حاول مرة أخرى.',
  'mb.n.dTitle': 'الإشعارات محظورة', 'mb.n.dIos': 'افتح الإعدادات › الإشعارات › لايف إكس ديجيتال وفعّل «السماح بالإشعارات»، ثم عُد إلى هنا.',
  'mb.n.dOther': 'افتح إعدادات الموقع في المتصفح (أيقونة القفل بجانب العنوان) واضبط الإشعارات على «السماح»، ثم عُد إلى هنا.',
  'mb.n.recheck': 'لقد فعّلتها', 'mb.n.later': 'لاحقاً', 'mb.n.still': 'ما زالت محظورة.',
  'mb.i.title': 'ثبّت لايف إكس ديجيتال على آيفون', 'mb.i.sub': 'مجاني وبدون App Store. مطلوب لاستقبال الإشعارات.',
  'mb.i.s1': 'افتح هذه الصفحة في Safari', 'mb.i.s2': 'اضغط على زر المشاركة', 'mb.i.s3': 'اختر «إضافة إلى الشاشة الرئيسية»', 'mb.i.s4': 'اضغط «إضافة» ثم افتح لايف إكس ديجيتال من الشاشة الرئيسية',
  'mb.i.cont': 'المتابعة في المتصفح', 'mb.i.row': 'ثبّت التطبيق على هاتفك', 'mb.i.rowD': 'مجاني وبدون App Store — تطبيق بملء الشاشة مع الإشعارات',
  'mb.i.a1': 'افتح قائمة المتصفح', 'mb.i.a2': 'اضغط «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»', 'mb.i.a3': 'أكّد ثم افتح لايف إكس ديجيتال من الشاشة الرئيسية',
  'mb.i.go': 'ثبّت الآن', 'mb.i.done': 'مثبّت بالفعل',
});

const Mobile = (() => {
  let open = false, deferred = null, later = false;
  const rtlAttr = () => (LANG === 'ar' ? 'rtl' : 'ltr');
  const standalone = () => { try { return Push.isStandalone(); } catch(e){ return false; } };
  const isIos = () => { try { return Push.isIos(); } catch(e){ return false; } };

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { deferred = null; });

  function sheet(html, onWire){
    open = true;
    const close = R.overlay.open('<div class="mb" dir="' + rtlAttr() + '">' + html + '</div>', { kind: 'modal', dismissible: false });
    const done = () => { open = false; try { close(); } catch(e){ /* rien */ } };
    setTimeout(() => { const root = document.querySelector('.mb'); if (root) onWire(root, done); else open = false; }, 120);
    return done;
  }

  /* ---------- guide d'installation ---------- */
  function stepsHtml(steps){ return '<ol class="mb-steps">' + steps.map((s, i) => '<li><b>' + (i + 1) + '</b><span>' + escapeHtml(t(s)) + '</span></li>').join('') + '</ol>'; }
  function openInstall(opts){
    if (open) return;
    opts = opts || {};
    const ios = isIos();
    const steps = ios ? ['mb.i.s1', 'mb.i.s2', 'mb.i.s3', 'mb.i.s4'] : ['mb.i.a1', 'mb.i.a2', 'mb.i.a3'];
    sheet('<div class="mb-ic">' + icon('mobile', 30) + '</div><h2>' + escapeHtml(t('mb.i.title')) + '</h2><p>' + escapeHtml(t('mb.i.sub')) + '</p>' + stepsHtml(steps) +
      (!ios && deferred ? '<button type="button" class="btn btn-primary" id="mb-go">' + escapeHtml(t('mb.i.go')) + '</button>' : '') +
      '<button type="button" class="btn btn-ghost" id="mb-cont">' + escapeHtml(opts.fromGate ? t('mb.i.cont') : t('mb.n.later')) + '</button>', (root, done) => {
      const go = root.querySelector('#mb-go');
      if (go) go.onclick = async () => { try { deferred.prompt(); await deferred.userChoice; } catch(e){ /* rien */ } deferred = null; done(); };
      root.querySelector('#mb-cont').onclick = () => { try { sessionStorage.setItem('lx_inst_seen', '1'); } catch(e){ /* rien */ } done(); };
    });
  }

  /* ---------- porte des notifications ---------- */
  function openNotif(st){
    if (open) return;
    let fails = 0;
    const render = (state, done, root) => {
      const denied = state === 'denied';
      root.innerHTML = '<div class="mb-ic">' + icon('bell', 30) + '</div><h2>' + escapeHtml(t(denied ? 'mb.n.dTitle' : 'mb.n.title')) + '</h2>' +
        '<p>' + escapeHtml(denied ? t(isIos() ? 'mb.n.dIos' : 'mb.n.dOther') : t('mb.n.body')) + '</p><div class="mb-err" id="mb-err" role="alert"></div>' +
        '<button type="button" class="btn btn-primary" id="mb-en">' + escapeHtml(denied ? t('mb.n.recheck') : t('mb.n.enable')) + '</button>' +
        (fails >= 1 ? '<button type="button" class="btn btn-ghost" id="mb-later">' + escapeHtml(t('mb.n.later')) + '</button>' : '');
      const en = root.querySelector('#mb-en'), err = root.querySelector('#mb-err'), lt = root.querySelector('#mb-later');
      if (lt) lt.onclick = () => { later = true; done(); };
      en.onclick = async () => {
        en.disabled = true;
        const r = await Push.enable();                          /* premier « await » du geste : obligatoire pour que le navigateur affiche la demande */
        if (r.ok){ try { Sfx.play('success'); UIKit.haptic('success'); } catch(e){ /* rien */ } done(); toast(t('push.toast.on'), 'success'); return; }
        fails++;
        if (r.reason === 'denied' || Notification.permission === 'denied'){ render('denied', done, root); const e2 = root.querySelector('#mb-err'); if (e2 && denied) e2.textContent = t('mb.n.still'); return; }
        err.textContent = t('mb.n.err'); en.disabled = false;
        if (fails >= 1 && !root.querySelector('#mb-later')){ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost'; b.id = 'mb-later'; b.textContent = t('mb.n.later'); b.onclick = () => { later = true; done(); }; root.appendChild(b); }
      };
    };
    sheet('', (root, done) => render(st, done, root));
  }

  async function check(){
    try {
      if (open || later || !AuthEngine.hasValidContext() || !keyOk()) return;
      if (R.overlay.isOpen()) return;                             /* une autre fenêtre est ouverte (ex. numéro de téléphone) : on réessaie plus tard */
      const st = await Push.state();
      if (st === 'on' || st === 'unsupported') return;
      if (st === 'install'){ let seen = false; try { seen = !!sessionStorage.getItem('lx_inst_seen'); } catch(e){ /* rien */ } if (!seen) openInstall({ fromGate: true }); return; }
      openNotif(st);
    } catch(e){ console.warn('notif gate', e); }
  }
  const keyOk = () => !!(typeof CONFIG !== 'undefined' && CONFIG.PUSH && CONFIG.PUSH.vapidPublicKey);

  /* appelé après l'ouverture de l'accueil, puis à chaque retour dans l'application */
  function afterHome(){ setTimeout(check, 1800); setTimeout(check, 6500); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(check, 600); });
  window.addEventListener('online', () => setTimeout(check, 1200));

  /* ---------- ligne des Réglages ---------- */
  function installRowHtml(){
    if (standalone()) return '';
    return '<button type="button" class="settings-row" data-mb-install style="cursor:pointer"><div class="tile">' + icon('mobile', 20) + '</div>' +
      '<div class="settings-row-body"><div class="settings-row-title">' + escapeHtml(t('mb.i.row')) + '</div><div class="settings-row-sub">' + escapeHtml(t('mb.i.rowD')) + '</div></div></button>';
  }
  document.addEventListener('click', (e) => { const b = e.target && e.target.closest && e.target.closest('[data-mb-install]'); if (b){ e.preventDefault(); openInstall(); } });

  return { check, afterHome, openInstall, installRowHtml };
})();

/* 16.1.0 : titre et texte des alertes d'argent dans la langue de la personne, avec les détails de la transaction (montant, personne, référence).
   Les alertes sans données (anciennes lignes) gardent le texte du serveur. */
function notifView(n){
  try {
    const d = (n && n.data) || {};
    const kind = n && n.type === 'TRANSFER_RECEIVED' ? 'in' : n && n.type === 'TRANSFER_SENT' ? 'out' : n && n.type === 'DEPOSIT' ? 'dep' : '';
    if (!kind || d.amount == null) return { title: n.title, message: n.message };
    const iso = v => (LANG === 'ar' && v ? '\u2066' + v + '\u2069' : v);
    const amt = iso(CurrencyEngine.format(d.amount, d.currency || 'OMR'));
    const ref = d.reference ? iso(dispId(d.reference)) : '—';
    const msg = tf('lx.nv.' + kind + 'Msg', { amt, from: d.from || '', to: d.to || '', ref });
    return { title: t('lx.nv.' + kind), message: msg };
  } catch(e){ return { title: n.title, message: n.message }; }
}
