'use strict';

/* ============================================================
   AGENTS ADMIN — état et revue des cinq rôles d'assistance (écran « admin-agents », réservé aux administrateurs).

   Ce que montre cet écran, et RIEN d'autre :
   - l'état réel de chaque rôle, tel que le serveur le déclare : « non configuré » (fonction absente ou clé/modèle manquants),
     « disponible », « occupé » (une revue est réellement en cours), « erreur » (la dernière demande a échoué) ;
   - le texte rendu par une revue demandée par l'administrateur. La revue lit seulement des COMPTEURS (requêtes, erreurs, nombre de dossiers en attente) :
     jamais un solde, un nom, un message. Elle ne modifie rien : un humain décide.
   Rien ici n'est simulé : si la fonction serveur n'est pas déployée, l'écran le dit.
   API : AgentsAdmin = { render, wire }
   ============================================================ */
const AgentsAdmin = (() => {
  Strings.add({
    en: {
      'ag.title': 'Assistants', 'ag.sub': 'The five roles that help run Barq. Their state below is the real state reported by the server.',
      'ag.r.support': 'Amal', 'ag.d.support': 'Member assistance and wording', 'ag.r.data': 'Data', 'ag.d.data': 'Reads the aggregate numbers',
      'ag.r.supervision': 'Supervision', 'ag.d.supervision': 'Watches the health signals', 'ag.r.diagnostics': 'Diagnostics', 'ag.d.diagnostics': 'Explains error categories', 'ag.r.maintenance': 'Maintenance', 'ag.d.maintenance': 'Suggests low-risk upkeep',
      'ag.s.unknown': 'Checking…', 'ag.s.off': 'Not configured', 'ag.s.ready': 'Available', 'ag.s.busy': 'Busy', 'ag.s.error': 'Error',
      'ag.why.notDeployed': 'The server function is not deployed yet.', 'ag.why.noKey': 'The AI key or model is missing on the server.', 'ag.why.net': 'The server did not answer.', 'ag.why.admin': 'This account is not an active administrator.', 'ag.why.quota': 'Too many reviews this hour.', 'ag.why.failed': 'The review could not be completed.',
      'ag.run': 'Run a review', 'ag.running': 'Review in progress…', 'ag.refresh': 'Check again',
      'ag.note': 'A review reads counters only (requests, errors, files waiting). It never reads balances, names or messages and never changes anything. A person decides what to do.',
      'ag.report': 'Report', 'ag.human': 'To be read by a person. Nothing has been applied.', 'ag.cache': 'Temporary cache cleaned: {n} entries', 'ag.at': 'Last review: {t}', 'ag.none': 'No review yet.'
    },
    fr: {
      'ag.title': 'Assistants', 'ag.sub': 'Les cinq rôles qui aident à faire tourner Barq. L’état affiché est l’état réel annoncé par le serveur.',
      'ag.r.support': 'Amal', 'ag.d.support': 'Assistance aux membres et rédaction', 'ag.r.data': 'Données', 'ag.d.data': 'Lit les chiffres agrégés',
      'ag.r.supervision': 'Supervision', 'ag.d.supervision': 'Surveille les signaux de santé', 'ag.r.diagnostics': 'Diagnostic', 'ag.d.diagnostics': 'Explique les catégories d’erreurs', 'ag.r.maintenance': 'Maintenance', 'ag.d.maintenance': 'Propose un entretien sans risque',
      'ag.s.unknown': 'Vérification…', 'ag.s.off': 'Non configuré', 'ag.s.ready': 'Disponible', 'ag.s.busy': 'Occupé', 'ag.s.error': 'Erreur',
      'ag.why.notDeployed': 'La fonction serveur n’est pas encore déployée.', 'ag.why.noKey': 'La clé ou le modèle d’IA manque sur le serveur.', 'ag.why.net': 'Le serveur n’a pas répondu.', 'ag.why.admin': 'Ce compte n’est pas un administrateur actif.', 'ag.why.quota': 'Trop de revues cette heure-ci.', 'ag.why.failed': 'La revue n’a pas pu aboutir.',
      'ag.run': 'Lancer une revue', 'ag.running': 'Revue en cours…', 'ag.refresh': 'Vérifier à nouveau',
      'ag.note': 'Une revue lit seulement des compteurs (requêtes, erreurs, dossiers en attente). Elle ne lit jamais de solde, de nom ni de message et ne modifie rien. Une personne décide de la suite.',
      'ag.report': 'Rapport', 'ag.human': 'À lire par une personne. Rien n’a été appliqué.', 'ag.cache': 'Cache temporaire nettoyé : {n} entrées', 'ag.at': 'Dernière revue : {t}', 'ag.none': 'Aucune revue pour le moment.'
    },
    ar: {
      'ag.title': 'المساعدون', 'ag.sub': 'الأدوار الخمسة التي تساعد في تشغيل برق. الحالة المعروضة هي الحالة الفعلية التي يعلنها الخادم.',
      'ag.r.support': 'أمل', 'ag.d.support': 'مساعدة الأعضاء وصياغة الردود', 'ag.r.data': 'البيانات', 'ag.d.data': 'تقرأ الأرقام المجمّعة',
      'ag.r.supervision': 'الإشراف', 'ag.d.supervision': 'تراقب مؤشرات السلامة', 'ag.r.diagnostics': 'التشخيص', 'ag.d.diagnostics': 'تشرح فئات الأخطاء', 'ag.r.maintenance': 'الصيانة', 'ag.d.maintenance': 'تقترح صيانة منخفضة المخاطر',
      'ag.s.unknown': 'جارٍ التحقق…', 'ag.s.off': 'غير مهيّأ', 'ag.s.ready': 'متاح', 'ag.s.busy': 'مشغول', 'ag.s.error': 'خطأ',
      'ag.why.notDeployed': 'وظيفة الخادم لم تُنشر بعد.', 'ag.why.noKey': 'مفتاح الذكاء الاصطناعي أو النموذج غير موجود على الخادم.', 'ag.why.net': 'لم يردّ الخادم.', 'ag.why.admin': 'هذا الحساب ليس مسؤولاً نشطاً.', 'ag.why.quota': 'مراجعات كثيرة خلال هذه الساعة.', 'ag.why.failed': 'تعذّر إكمال المراجعة.',
      'ag.run': 'تشغيل مراجعة', 'ag.running': 'المراجعة قيد التنفيذ…', 'ag.refresh': 'التحقق مجدداً',
      'ag.note': 'تقرأ المراجعة عدّادات فقط (الطلبات والأخطاء والملفات المنتظرة). لا تقرأ أبداً رصيداً أو اسماً أو رسالة ولا تغيّر شيئاً. يقرّر شخص ما يجب فعله.',
      'ag.report': 'التقرير', 'ag.human': 'يقرؤه شخص. لم يُطبَّق أي شيء.', 'ag.cache': 'ذاكرة مؤقتة نُظّفت: {n} عناصر', 'ag.at': 'آخر مراجعة: {t}', 'ag.none': 'لا توجد مراجعة بعد.'
    }
  });
  const ROLES = ['support', 'data', 'supervision', 'diagnostics', 'maintenance'];
  const ICONS = { data: 'chart', supervision: 'eye', diagnostics: 'search', maintenance: 'settings' };
  const S = { state: 'unknown', why: '', report: null, at: 0, root: null, busy: false };
  const esc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s));

  /* appelle la fonction ; renvoie { ok, data } ou { ok:false, why, state } sans jamais inventer un succès */
  async function call(body){
    try {
      if (typeof sb === 'undefined' || !sb || !sb.functions) return { ok: false, why: 'net', state: 'off' };
      const lang = (typeof LANG !== 'undefined' && LANG) || 'fr';
      const r = await sb.functions.invoke('sanad-agents', { body: Object.assign({ lang }, body) });
      if (r.error){
        let status = 0, code = '';
        try { status = r.error.context && r.error.context.status || 0; const j = await r.error.context.json(); code = j && j.error || ''; } catch(e){ /* réponse illisible */ }
        if (status === 404) return { ok: false, why: 'notDeployed', state: 'off' };
        if (code === 'ai_not_configured') return { ok: false, why: 'noKey', state: 'off' };
        if (code === 'admin_only') return { ok: false, why: 'admin', state: 'error' };
        if (code === 'quota') return { ok: false, why: 'quota', state: 'ready' };
        return { ok: false, why: status ? 'failed' : 'net', state: status ? 'error' : 'off' };
      }
      return { ok: true, data: r.data || {} };
    } catch(e){ return { ok: false, why: 'net', state: 'off' }; }
  }
  async function check(){
    S.state = 'unknown'; S.why = ''; paint();
    const r = await call({ mode: 'status' });
    if (r.ok){ S.state = r.data.configured ? 'ready' : 'off'; S.why = r.data.configured ? '' : 'noKey'; }
    else { S.state = r.state; S.why = r.why; }
    paint();
  }
  async function review(){
    if (S.busy || S.state === 'off') return;
    S.busy = true; S.state = 'busy'; S.why = ''; paint();
    const r = await call({ mode: 'review', windowMinutes: 60 });
    S.busy = false;
    if (r.ok && r.data && r.data.agents){ S.report = r.data; S.at = Date.now(); S.state = 'ready'; S.why = ''; }
    else { S.state = r.state === 'ready' ? 'ready' : (r.state || 'error'); S.why = r.why || 'failed'; }
    paint();
  }
  const clock = ts => { try { return new Date(ts).toLocaleTimeString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { hour: '2-digit', minute: '2-digit' }); } catch(e){ return ''; } };

  function card(role){
    const ag = S.report && S.report.agents && S.report.agents[role];
    const face = role === 'support' ? '<img src="assets/sanad/amal-240.png" alt="" width="44" height="44" decoding="async">' : (typeof icon === 'function' ? icon(ICONS[role], 22) : '');
    return '<article class="ag-card" data-role="' + role + '" data-state="' + S.state + '"><i class="ag-face' + (role === 'support' ? ' is-amal' : '') + '">' + face + '</i>' +
      '<div class="ag-main"><b>' + esc(t('ag.r.' + role)) + '</b><small>' + esc(t('ag.d.' + role)) + '</small></div>' +
      '<span class="ag-st" role="status"><i></i>' + esc(t('ag.s.' + S.state)) + '</span>' +
      (ag ? '<p class="ag-out" dir="auto">' + esc(ag) + '</p>' : '') + '</article>';
  }
  function body(){
    const why = S.why ? '<p class="ag-why" role="alert">' + esc(t('ag.why.' + S.why)) + '</p>' : '';
    const auto = S.report && S.report.automaticActions && S.report.automaticActions.temporaryCacheSweep;
    return '<div class="ag-hero"><h1>' + esc(t('ag.title')) + '</h1><p>' + esc(t('ag.sub')) + '</p></div>' + why +
      '<div class="ag-list">' + ROLES.map(card).join('') + '</div>' +
      '<div class="ag-acts"><button type="button" class="btn btn-primary" data-ag="run"' + (S.state === 'off' || S.state === 'busy' || S.state === 'unknown' ? ' disabled' : '') + '>' + esc(t(S.state === 'busy' ? 'ag.running' : 'ag.run')) + '</button>' +
      '<button type="button" class="btn btn-ghost" data-ag="check"' + (S.state === 'busy' ? ' disabled' : '') + '>' + esc(t('ag.refresh')) + '</button></div>' +
      '<p class="ag-note">' + esc(t('ag.note')) + '</p>' +
      (S.report ? '<p class="ag-human">' + esc(t('ag.human')) + (auto ? ' · ' + esc(tf('ag.cache', { n: auto.removed })) : '') + (S.at ? ' · ' + esc(tf('ag.at', { t: clock(S.at) })) : '') + '</p>' : '<p class="ag-human">' + esc(t('ag.none')) + '</p>');
  }
  function render(){
    return '<div class="topbar adm-top"><button class="topbar-back" data-action="back" aria-label="' + esc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button><span class="topbar-title">' + esc(t('ag.title')) + '</span><span style="width:calc(44px*var(--ui))"></span></div>' +
      '<div class="screen-body ag-body" id="ag-body">' + body() + '</div>';
  }
  function paint(){ const el = S.root && S.root.querySelector('#ag-body'); if (el && el.isConnected) el.innerHTML = body(); }
  function wire(root){
    S.root = root; S.busy = false; S.report = null; S.at = 0;
    root.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ag]'); if (!b || b.disabled) return; if (b.getAttribute('data-ag') === 'run') review(); else check(); });
    check();
  }
  return { render, wire, _state: () => Object.assign({}, S, { root: null }) };
})();
Hooks.on('admin-agents', root => { try { AgentsAdmin.wire(root); } catch(e){ console.error('agents', e); } });
R.register({ 'admin-agents': () => AgentsAdmin.render() });
R.meta({ 'admin-agents': { parent: 'admin-hub', nav: 'services', admin: true } });
