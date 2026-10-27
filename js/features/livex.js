'use strict';

/* ============================================================
   SANAD PAY (16.0.0) — liaison des nouveautés : capacités serveur, téléphone obligatoire, console admin, transfert international.
   - caps.intl : le service « Transfert international » n'apparaît que si le serveur a sa table de pays (intl_countries) ; tant que la migration
     n'est pas en place, l'application fonctionne exactement comme avant.
   - PhoneGate : un compte ne peut pas être utilisé sans numéro de téléphone. Les comptes créés avant l'obligation (sans numéro) le saisissent UNE fois
     (fonction serveur set_my_phone) ; ensuite le numéro identifie le compte et n'est plus modifiable par la personne.
   - onScreen(id, root) est appelé par wire() pour chaque écran.
   ============================================================ */
Object.assign(TR.en, {
  'lx.svc.intl': 'International', 'lx.svc.admin': 'Admin console', 'lx.svc.gAdmin': 'Administration',
  'lx.pg.title': 'Add your phone number', 'lx.pg.body': 'A phone number is required for every account. It identifies you and protects your transfers.', 'lx.pg.save': 'Save number', 'lx.pg.bad': 'Enter a valid number with your country code.', 'lx.pg.done': 'Number saved', 'lx.pg.out': 'Sign out',
  'lx.set.admin': 'Admin console', 'lx.set.adminD': 'Members, rewards and alerts — administrators only',
});
Object.assign(TR.fr, {
  'lx.svc.intl': 'International', 'lx.svc.admin': 'Console admin', 'lx.svc.gAdmin': 'Administration',
  'lx.pg.title': 'Ajoutez votre numéro de téléphone', 'lx.pg.body': 'Un numéro de téléphone est obligatoire pour chaque compte. Il vous identifie et protège vos transferts.', 'lx.pg.save': 'Enregistrer le numéro', 'lx.pg.bad': 'Saisissez un numéro valide avec l’indicatif de votre pays.', 'lx.pg.done': 'Numéro enregistré', 'lx.pg.out': 'Se déconnecter',
  'lx.set.admin': 'Console admin', 'lx.set.adminD': 'Membres, récompenses et alertes — administrateurs seulement',
});
Object.assign(TR.ar, {
  'lx.svc.intl': 'دولي', 'lx.svc.admin': 'لوحة الإدارة', 'lx.svc.gAdmin': 'الإدارة',
  'lx.pg.title': 'أضف رقم هاتفك', 'lx.pg.body': 'رقم الهاتف مطلوب لكل حساب. فهو يحدّد هويتك ويحمي تحويلاتك.', 'lx.pg.save': 'حفظ الرقم', 'lx.pg.bad': 'أدخل رقماً صحيحاً مع رمز دولتك.', 'lx.pg.done': 'تم حفظ الرقم', 'lx.pg.out': 'تسجيل الخروج',
  'lx.set.admin': 'لوحة الإدارة', 'lx.set.adminD': 'الأعضاء والمكافآت والتنبيهات — للمسؤولين فقط',
});

const LiveX = (() => {
  const caps = { intl: null };
  const validPhone = p => /^\+[0-9]{8,15}$/.test(String(p || '').replace(/[\s().-]/g, ''));
  let gateOpen = false;

  async function probe(){
    try {
      const r = await sb.from('intl_countries').select('iso', { count: 'exact', head: true });
      caps.intl = !r.error && (r.count || 0) > 0;
    } catch(err){ caps.intl = false; }
    return caps.intl;
  }
  function phoneGate(){
    try {
      const p = Runtime.profile;
      if (!p || gateOpen || validPhone(p.phone)) return;
      gateOpen = true;
      const rtl = LANG === 'ar';
      const close = R.overlay.open('<div class="pg" dir="' + (rtl ? 'rtl' : 'ltr') + '"><div class="pg-i">' + icon('mobile', 30) + '</div><h2>' + escapeHtml(t('lx.pg.title')) + '</h2><p>' + escapeHtml(t('lx.pg.body')) + '</p>' +
        '<div class="field"><div class="field-box su-phone ltr">' + signupDialSelect() + '<input type="tel" id="pg-phone" inputmode="tel" autocomplete="tel-national" dir="ltr" placeholder="7798 6533"></div></div>' +
        '<div class="field-err" id="pg-err" role="alert"></div><button type="button" class="btn btn-primary" id="pg-save">' + escapeHtml(t('lx.pg.save')) + '</button>' +
        '<button type="button" class="btn btn-ghost" id="pg-out">' + escapeHtml(t('lx.pg.out')) + '</button></div>', { kind: 'modal', dismissible: false });
      setTimeout(() => {
        const root = document.querySelector('.pg'); if (!root) return;
        const dial = root.querySelector('#su-dial'), inp = root.querySelector('#pg-phone'), err = root.querySelector('#pg-err'), btn = root.querySelector('#pg-save');
        let busy = false;
        const save = async () => {
          if (busy) return;
          const sel = dial && dial.options[dial.selectedIndex], d = sel ? sel.getAttribute('data-dial') : '+968';
          const ph = signupPhone(d, inp.value);
          if (!ph){ err.textContent = t('lx.pg.bad'); try { Sfx.play('error'); } catch(e2){ /* rien */ } return; }
          busy = true; err.textContent = ''; UIKit.loading(btn, true);
          const r = await sb.rpc('set_my_phone', { p_phone: ph });
          UIKit.loading(btn, false); busy = false;
          if (r.error){ err.textContent = /phone_already_set/i.test(r.error.message || '') ? t('lx.pg.done') : t('lx.pg.bad'); if (!/phone_already_set/i.test(r.error.message || '')) return; }
          Runtime.profile.phone = (r.data && r.data.phone) || ph; gateOpen = false;
          try { Sfx.play('success'); UIKit.haptic('success'); } catch(e2){ /* rien */ }
          close(); toast(t('lx.pg.done'), 'success');
          if (['profile', 'settings'].indexOf(R.current()) !== -1) R.go(R.current(), { force: true, replace: true });
        };
        btn.onclick = save; inp.addEventListener('keydown', ev => { if (ev.key === 'Enter'){ ev.preventDefault(); save(); } });
        root.querySelector('#pg-out').onclick = () => { try { close(); } catch(e2){ /* rien */ } gateOpen = false; AuthEngine.signOut(); };
        try { inp.focus({ preventScroll: true }); } catch(e2){ /* rien */ }
      }, 380);
    } catch(err){ console.error('phone gate', err); gateOpen = false; }
  }
  /* après l'ouverture de l'accueil */
  function afterHome(){
    probe().then(() => { if (caps.intl && R.current() === 'home') R.go('home', { force: true, replace: true }); });
    phoneGate();
    try { Mobile.afterHome(); } catch(e2){ /* rien */ }      /* 16.1.0 : notifications obligatoires / installation iPhone */
  }
  function guardIntl(){
    if (caps.intl === false){ setTimeout(() => { try { toast(IntlX.e('notReady'), 'error'); } catch(e2){ /* rien */ } R.go('services', { replace: true }); }, 0); return false; }
    return true;
  }
  function onScreen(id, root){
    if (id === 'intl' || id.indexOf('intl-') === 0) IntlX.wire(id, root);
    else if (id === 'admin' || id === 'admin-user') Admin.wire(id, root);
    try { if (typeof Hooks !== 'undefined') Hooks.run(id, root); } catch(e2){ console.error(e2); }      /* 18.0.0 : modules crédit / coffre / chat / cinéma / centre de contrôle */
  }
  return { caps, probe, afterHome, phoneGate, guardIntl, onScreen, validPhone };
})();

R.register({
  intl: () => (LiveX.guardIntl() ? (IntlX.startFresh(), IntlX.renderIntl()) : ''),
  'intl-method': () => IntlX.renderMethod(), 'intl-details': () => IntlX.renderDetails(), 'intl-amount': () => IntlX.renderAmount(),
  'intl-review': () => IntlX.renderReview(), 'intl-result': () => IntlX.renderResult(),
  admin: () => Admin.render(), 'admin-user': () => Admin.renderUser(),
});
