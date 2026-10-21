'use strict';

/* ============================================================
   VÉRIFICATION D'IDENTITÉ (19.0.0) — écran `kyc` : pièce d'identité recto, verso, selfie.
   Les trois photos sont réduites (1600 px), envoyées dans le bucket privé `kyc-docs` (dossier = identifiant de la personne), puis kyc_submit() les
   déclare. L'administrateur les examine : le statut affiché est toujours celui du serveur (UNVERIFIED / PENDING / VERIFIED / REJECTED).
   ============================================================ */
Strings.add({
  en: {
    'kyc.title': 'Identity check', 'kyc.hero': 'Verify your identity', 'kyc.heroD': 'Three photos are needed. An administrator reviews them and accepts or declines your request.',
    'kyc.front': 'ID card — front', 'kyc.back': 'ID card — back', 'kyc.selfie': 'Selfie', 'kyc.frontD': 'The side with your photo', 'kyc.backD': 'The other side', 'kyc.selfieD': 'Your face, no hat or glasses',
    'kyc.take': 'Take or choose', 'kyc.retake': 'Change', 'kyc.tips': 'Good light, no glare, all four corners visible, text readable.', 'kyc.priv': 'Your documents are stored in a private space. Only authorised administrators can open them, only to check your identity.',
    'kyc.submit': 'Send for review', 'kyc.up': 'Sending {n} of 3', 'kyc.sub': 'Submitting your request', 'kyc.need': 'Add the three photos to continue.', 'kyc.tooBig': 'A photo is too large (10 MB maximum).', 'kyc.notImg': 'Choose an image.',
    'kyc.st.UNVERIFIED': 'Not verified', 'kyc.st.PENDING': 'Under review', 'kyc.st.VERIFIED': 'Verified', 'kyc.st.REJECTED': 'Declined',
    'kyc.pendT': 'Your request is under review', 'kyc.pendD': 'An administrator is checking your documents. You will be notified of the decision. Nothing else to do.', 'kyc.okT': 'Identity verified', 'kyc.okD': 'You can now choose a plan and request withdrawals.',
    'kyc.rejT': 'Request declined', 'kyc.rejD': 'Your documents were not accepted.', 'kyc.reason': 'Reason', 'kyc.again': 'Send new photos', 'kyc.sent': 'Request sent for review'
  },
  fr: {
    'kyc.title': 'Vérification d’identité', 'kyc.hero': 'Vérifiez votre identité', 'kyc.heroD': 'Trois photos sont nécessaires. Un administrateur les examine et accepte ou refuse votre demande.',
    'kyc.front': 'Pièce d’identité — recto', 'kyc.back': 'Pièce d’identité — verso', 'kyc.selfie': 'Selfie', 'kyc.frontD': 'Le côté avec votre photo', 'kyc.backD': 'L’autre côté', 'kyc.selfieD': 'Votre visage, sans chapeau ni lunettes',
    'kyc.take': 'Prendre ou choisir', 'kyc.retake': 'Changer', 'kyc.tips': 'Bonne lumière, sans reflet, les quatre coins visibles, texte lisible.', 'kyc.priv': 'Vos documents sont conservés dans un espace privé. Seuls les administrateurs autorisés peuvent les ouvrir, uniquement pour vérifier votre identité.',
    'kyc.submit': 'Envoyer pour examen', 'kyc.up': 'Envoi {n} sur 3', 'kyc.sub': 'Dépôt de votre demande', 'kyc.need': 'Ajoutez les trois photos pour continuer.', 'kyc.tooBig': 'Une photo est trop lourde (10 Mo maximum).', 'kyc.notImg': 'Choisissez une image.',
    'kyc.st.UNVERIFIED': 'Non vérifié', 'kyc.st.PENDING': 'En cours d’examen', 'kyc.st.VERIFIED': 'Vérifié', 'kyc.st.REJECTED': 'Refusé',
    'kyc.pendT': 'Votre demande est en cours d’examen', 'kyc.pendD': 'Un administrateur vérifie vos documents. Vous serez prévenu de la décision. Rien d’autre à faire.', 'kyc.okT': 'Identité vérifiée', 'kyc.okD': 'Vous pouvez maintenant choisir un plan et demander des retraits.',
    'kyc.rejT': 'Demande refusée', 'kyc.rejD': 'Vos documents n’ont pas été acceptés.', 'kyc.reason': 'Motif', 'kyc.again': 'Envoyer de nouvelles photos', 'kyc.sent': 'Demande envoyée pour examen'
  },
  ar: {
    'kyc.title': 'التحقق من الهوية', 'kyc.hero': 'وثّق هويتك', 'kyc.heroD': 'يلزم ثلاث صور. يراجعها مسؤول ويقبل طلبك أو يرفضه.',
    'kyc.front': 'بطاقة الهوية — الوجه الأمامي', 'kyc.back': 'بطاقة الهوية — الوجه الخلفي', 'kyc.selfie': 'صورة شخصية', 'kyc.frontD': 'الوجه الذي عليه صورتك', 'kyc.backD': 'الوجه الآخر', 'kyc.selfieD': 'وجهك بدون قبعة أو نظارات',
    'kyc.take': 'التقاط أو اختيار', 'kyc.retake': 'تغيير', 'kyc.tips': 'إضاءة جيدة، بدون انعكاس، الزوايا الأربع ظاهرة، والنص مقروء.', 'kyc.priv': 'تُحفظ وثائقك في مساحة خاصة. لا يفتحها إلا مسؤولون مخوّلون، ولغرض التحقق من هويتك فقط.',
    'kyc.submit': 'إرسال للمراجعة', 'kyc.up': 'إرسال {n} من 3', 'kyc.sub': 'جارٍ تقديم طلبك', 'kyc.need': 'أضف الصور الثلاث للمتابعة.', 'kyc.tooBig': 'إحدى الصور كبيرة جداً (10 ميغابايت كحد أقصى).', 'kyc.notImg': 'اختر صورة.',
    'kyc.st.UNVERIFIED': 'غير موثّق', 'kyc.st.PENDING': 'قيد المراجعة', 'kyc.st.VERIFIED': 'موثّق', 'kyc.st.REJECTED': 'مرفوض',
    'kyc.pendT': 'طلبك قيد المراجعة', 'kyc.pendD': 'يتحقق مسؤول من وثائقك. سيصلك إشعار بالقرار. لا شيء آخر مطلوب.', 'kyc.okT': 'تم توثيق الهوية', 'kyc.okD': 'يمكنك الآن اختيار خطة وطلب السحب.',
    'kyc.rejT': 'تم رفض الطلب', 'kyc.rejD': 'لم تُقبل وثائقك.', 'kyc.reason': 'السبب', 'kyc.again': 'إرسال صور جديدة', 'kyc.sent': 'تم إرسال الطلب للمراجعة'
  }
});

const Kyc = (() => {
  const F = Flow, esc = F.esc;
  const S = { st: null, last: null, loading: false, err: false, files: { front: null, back: null, selfie: null }, urls: {}, busy: false };
  const SLOTS = [['front', 'id'], ['back', 'id'], ['selfie', 'selfie']];

  async function load(){
    S.loading = true; S.err = false;
    const r = await Guardian.rpc('kyc_status', {}, { retries: 1 });
    S.loading = false;
    if (r.ok && r.data && typeof r.data === 'object'){ S.st = String(r.data.status || 'UNVERIFIED'); S.last = r.data.last || null; } else if (!S.st) S.err = true;
    return S.st;
  }
  function revoke(){ Object.keys(S.urls).forEach(k => { try { URL.revokeObjectURL(S.urls[k]); } catch(e){ /* rien */ } }); S.urls = {}; }
  const badge = st => '<span class="fl-badge ' + (st === 'VERIFIED' ? 'ok' : st === 'REJECTED' ? 'bad' : st === 'PENDING' ? 'wait' : 'muted') + '">' + esc(t('kyc.st.' + st)) + '</span>';

  function slot(k, icn){
    const f = S.files[k], url = S.urls[k];
    return '<div class="fl-card fl-slot fl-in' + (f ? ' has' : '') + '" data-slot="' + k + '"><div class="fl-slot-v">' + (url ? '<img src="' + esc(url) + '" alt="' + esc(t('kyc.' + k)) + '">' : '<i>' + F.ic(icn, 34) + '</i>') + (f ? '<span class="fl-tick">' + F.ic('check', 16) + '</span>' : '') + '</div>' +
      '<div class="fl-slot-t"><b>' + esc(t('kyc.' + k)) + '</b><small>' + esc(t('kyc.' + k + 'D')) + '</small></div>' +
      '<input type="file" accept="image/*"' + (k === 'selfie' ? ' capture="user"' : ' capture="environment"') + ' hidden data-file="' + k + '"><button type="button" class="btn ' + (f ? 'btn-secondary' : 'btn-primary') + '" data-pick="' + k + '">' + F.ic('camera', 18) + '<span>' + esc(t(f ? 'kyc.retake' : 'kyc.take')) + '</span></button></div>';
  }
  function statusCard(){
    const st = S.st;
    if (st === 'PENDING') return '<section class="fl-card fl-state wait fl-in"><div class="fl-orbit" aria-hidden="true"><i></i><i></i>' + F.ic('clock', 30) + '</div><h2>' + esc(t('kyc.pendT')) + '</h2><p>' + esc(t('kyc.pendD')) + '</p></section>';
    if (st === 'VERIFIED') return '<section class="fl-card fl-state ok fl-in"><div class="fl-seal" aria-hidden="true">' + F.ic('shield', 34) + '</div><h2>' + esc(t('kyc.okT')) + '</h2><p>' + esc(t('kyc.okD')) + '</p></section>';
    return '';
  }
  function body(){
    if (S.err) return F.errCard('data-fl-retry');
    if (!S.st) return F.skeleton();
    const st = S.st;
    const hdr = '<div class="fl-kyc-h fl-in"><div><h2>' + esc(t('kyc.hero')) + '</h2><p>' + esc(t('kyc.heroD')) + '</p></div>' + badge(st) + '</div>';
    if (st === 'PENDING' || st === 'VERIFIED') return hdr + statusCard();
    let rej = '';
    if (st === 'REJECTED') rej = '<section class="fl-card fl-state bad fl-in"><h2>' + esc(t('kyc.rejT')) + '</h2><p>' + esc(t('kyc.rejD')) + '</p>' + (S.last && S.last.reason ? '<p class="fl-note bad">' + F.ic('x', 16) + '<span>' + esc(t('kyc.reason')) + ' : ' + esc(S.last.reason) + '</span></p>' : '') + '<p class="fl-hint">' + esc(t('kyc.again')) + '</p></section>';
    const ready = S.files.front && S.files.back && S.files.selfie;
    return hdr + rej + '<div class="fl-slots">' + SLOTS.map(x => slot(x[0], x[1])).join('') + '</div>' +
      '<p class="fl-note">' + F.ic('camera', 16) + '<span>' + esc(t('kyc.tips')) + '</span></p><p class="fl-note">' + F.ic('lock', 16) + '<span>' + esc(t('kyc.priv')) + '</span></p>' +
      '<div class="fl-prog" id="fl-prog" hidden><i></i><span></span></div><div class="field-err" id="fl-err" role="alert"></div>' +
      '<button type="button" class="btn btn-primary fl-cta" data-submit' + (ready ? '' : ' disabled') + '>' + F.ic('upload', 18) + '<span>' + esc(t('kyc.submit')) + '</span></button>' + (ready ? '' : '<p class="fl-hint c">' + esc(t('kyc.need')) + '</p>');
  }
  const render = () => '<div class="fl-screen" data-fl="kyc">' + F.top(t('kyc.title')) + '<div class="screen-body fl-body">' + body() + '</div></div>';
  const bodyEl = () => document.querySelector('.screen.active [data-fl="kyc"] .fl-body');
  function repaint(){ const b = bodyEl(); if (b){ b.innerHTML = body(); wire(b); } }

  function wire(b){
    b.querySelectorAll('[data-fl-retry]').forEach(x => { x.onclick = async () => { S.err = false; await load(); repaint(); }; });
    b.querySelectorAll('[data-pick]').forEach(x => { x.onclick = () => { const i = b.querySelector('[data-file="' + x.getAttribute('data-pick') + '"]'); if (i) i.click(); }; });
    b.querySelectorAll('[data-file]').forEach(i => {
      i.onchange = () => {
        const k = i.getAttribute('data-file'), f = i.files && i.files[0]; i.value = ''; if (!f) return;
        const err = b.querySelector('#fl-err');
        if (!/^image\//.test(f.type)){ if (err) err.textContent = t('kyc.notImg'); return; }
        if (f.size > 25 * 1048576){ if (err) err.textContent = t('kyc.tooBig'); return; }
        if (S.urls[k]) { try { URL.revokeObjectURL(S.urls[k]); } catch(e){ /* rien */ } }
        S.files[k] = f; S.urls[k] = URL.createObjectURL(f); F.hap('tap'); F.snd('pop'); repaint();
      };
    });
    const sub = b.querySelector('[data-submit]');
    if (sub) sub.onclick = submit;
  }
  function prog(b, n, label){ const el = b.querySelector('#fl-prog'); if (!el) return; el.hidden = !label; el.style.setProperty('--p', Math.round(n * 100) + '%'); el.querySelector('span').textContent = label || ''; }
  async function submit(){
    if (S.busy) return;
    const b = bodyEl(), err = b && b.querySelector('#fl-err'), btn = b && b.querySelector('[data-submit]'); if (!b) return;
    if (!(S.files.front && S.files.back && S.files.selfie)){ if (err) err.textContent = t('kyc.need'); return; }
    S.busy = true; F.btnBusy(btn, true); if (err) err.textContent = '';
    try {
      const paths = {}; let n = 0;
      for (const [k] of SLOTS){
        prog(b, n / 4, tf('kyc.up', { n: n + 1 }));
        const blob = await F.compress(S.files[k], 1600, 0.85); const mime = /^image\/(jpeg|png|webp|heic)$/.test(blob.type) ? blob.type : 'image/jpeg';
        if (blob.size > 10 * 1048576) throw new Error('too_big');
        const path = F.uid() + '/kyc-' + k + '-' + F.uuid().slice(0, 12) + '.' + F.extOf(mime);
        const up = await F.upload('kyc-docs', path, blob, mime); if (!up.ok) throw up.error || new Error('upload');
        paths[k] = path; n++;
      }
      prog(b, 0.9, t('kyc.sub'));
      const r = await Guardian.rpc('kyc_submit', { p_front: paths.front, p_back: paths.back, p_selfie: paths.selfie }, { retries: 0 });
      if (!r.ok) throw r.error || new Error('submit');
      S.files = { front: null, back: null, selfie: null }; revoke(); S.st = 'PENDING'; S.last = null;
      F.snd('success'); F.hap('success'); toast(t('kyc.sent'), 'success'); S.busy = false; repaint(); Fx.confetti(null, { n: 40 });
    } catch(e){
      S.busy = false; F.btnBusy(btn, false); prog(b, 0, '');
      if (err) err.textContent = /too_big/.test(String(e && e.message)) ? t('kyc.tooBig') : F.srvErr(e && e.message ? e : null);
      F.snd('error'); if (btn) Fx.shake(btn);
    }
  }
  Hooks.on('kyc', async () => { const b = bodyEl(); if (b) wire(b); R.onLeave(revoke); await load(); repaint(); });
  R.register({ kyc: render });
  R.meta({ kyc: { parent: 'services', nav: 'services' } });
  return { open(){ R.go('kyc'); }, status(){ return load(); }, _S: S };
})();
