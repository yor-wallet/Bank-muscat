'use strict';

/* ============================================================
   TOUR (20.4.0) — visite guidée de la première ouverture d'un NOUVEAU compte.
   Après la présentation (Onboarding, avant la connexion) et la création du compte, l'accueil s'ouvre ; la visite éclaire une à une les 5 touches de la barre
   du bas pour dire à quoi elles servent. Elle est :
   - unique : un compte de moins de 7 jours, jamais déjà vue sur cet appareil (clé fp_tour_<id>) ; les comptes existants ne la voient pas ;
   - discrète : « Passer » à tout moment, Échap, jamais pendant une récompense, une fenêtre ouverte ou le mode sûr ;
   - honnête : elle ne montre que les touches réellement présentes à l'écran (une touche introuvable est sautée) ; rien n'est inventé ni simulé ;
   - accessible : dialogue modal annoncé, focus sur « Suivant », sens de lecture arabe respecté, « réduire les animations » respecté.
   `Tour.maybe()` est appelé par le démarrage après l'ouverture de l'accueil ; `Tour.show(true)` la rejoue (tests, aide).
   ============================================================ */
const Tour = (() => {
  const S = {
    en: { skip: 'Skip', next: 'Next', done: 'Got it', of: (a, b) => a + ' / ' + b, label: 'Quick tour', steps: {
      home: ['Home', 'Your balance and latest activity, at a glance.'],
      accounts: ['Accounts', 'Each account with its balance and what came in and went out over 30 days.'],
      'country-select': ['Transfer', 'Send money in a few taps.'],
      cards: ['Cards', 'Your cards, all in one place.'],
      services: ['More', 'History, services and help.'] } },
    fr: { skip: 'Passer', next: 'Suivant', done: 'Compris', of: (a, b) => a + ' / ' + b, label: 'Visite rapide', steps: {
      home: ['Accueil', 'Votre solde et vos dernières opérations, en un coup d’œil.'],
      accounts: ['Comptes', 'Chaque compte, son solde et ses entrées et sorties sur 30 jours.'],
      'country-select': ['Transfert', 'Envoyez de l’argent en quelques touches.'],
      cards: ['Cartes', 'Vos cartes, au même endroit.'],
      services: ['Plus', 'Historique, services et aide.'] } },
    ar: { skip: 'تخطّي', next: 'التالي', done: 'فهمت', of: (a, b) => a + ' / ' + b, label: 'جولة سريعة', steps: {
      home: ['الرئيسية', 'رصيدك وآخر عملياتك بنظرة واحدة.'],
      accounts: ['الحسابات', 'كل حساب مع رصيده وما دخل وما خرج خلال 30 يوماً.'],
      'country-select': ['تحويل', 'أرسل المال بخطوات قليلة.'],
      cards: ['البطاقات', 'بطاقاتك في مكان واحد.'],
      services: ['المزيد', 'السجل والخدمات والمساعدة.'] } }
  };
  const ORDER = ['home', 'accounts', 'country-select', 'cards', 'services'];
  const MAX_AGE = 7 * 864e5;
  const uid = () => { try { return (Runtime.ctx && Runtime.ctx.uid) || ''; } catch(e){ return ''; } };
  const key = () => 'fp_tour_' + uid();
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  const seen = () => { try { return localStorage.getItem(key()) === '1'; } catch(e){ return true; } };
  const mark = () => { try { localStorage.setItem(key(), '1'); } catch(e){ /* rien */ } };
  let open = null, tries = 0;

  function eligible(){
    if (open || !uid() || seen()) return false;
    try { if (Conductor.isSafe()) return false; } catch(e){ /* rien */ }
    const created = Runtime.profile && Runtime.profile.createdAt;
    if (!(created && Date.now() - created < MAX_AGE)) return false;
    return true;
  }
  /* quelque chose d'autre occupe l'écran : récompense, fenêtre, verrouillage, présentation */
  const blocked = () => !!document.querySelector('.rwd, .ob, .yl, .ov-root > *, [role="dialog"][aria-modal="true"]:not(.tr)');

  function maybe(){
    if (!eligible()) return;
    const cur = (typeof R !== 'undefined' && R.current && R.current()) || '';
    if (cur !== 'home') return;
    if (blocked()){ if (++tries <= 4) setTimeout(maybe, 3000); return; }
    show();
  }

  function show(force){
    if (open) return;
    if (!force && !eligible()) return;
    const L = S[(typeof LANG !== 'undefined' && S[LANG]) ? LANG : 'en'], rtl = (typeof LANG !== 'undefined' && LANG === 'ar');
    const steps = ORDER.map(k => ({ k, el: document.querySelector('#bottom-nav [data-nav="' + k + '"]') }))
      .filter(s => { if (!s.el) return false; const r = s.el.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
    if (!steps.length) return;                       /* rien d'honnête à montrer : on réessaiera à la prochaine ouverture */
    let i = 0, closed = false;
    const prev = document.activeElement;
    const el = document.createElement('div');
    el.className = 'tr'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', L.label); el.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    el.innerHTML = '<div class="tr-spot" id="tr-spot" aria-hidden="true"></div>' +
      '<div class="tr-card" id="tr-card"><div class="tr-top"><span class="tr-kick" id="tr-kick"></span><button type="button" class="tr-skip" id="tr-skip">' + L.skip + '</button></div>' +
      '<h2 class="tr-h" id="tr-h"></h2><p class="tr-p" id="tr-p" aria-live="polite"></p>' +
      '<div class="tr-foot"><div class="tr-dots" id="tr-dots">' + steps.map(() => '<i></i>').join('') + '</div><button type="button" class="btn btn-primary tr-next" id="tr-next"></button></div></div>';
    document.body.appendChild(el);
    const $ = id => el.querySelector('#' + id);

    function place(){
      const s = steps[i], r = s.el.getBoundingClientRect(), pad = 7, vw = window.innerWidth || 390, vh = window.innerHeight || 800;
      const sp = $('tr-spot');
      sp.style.cssText = 'left:' + (r.left - pad) + 'px;top:' + (r.top - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px';
      const card = $('tr-card'), cw = Math.min(vw - 32, 340);
      card.style.width = cw + 'px';
      const cx = r.left + r.width / 2, left = Math.max(16, Math.min(vw - cw - 16, cx - cw / 2));
      card.style.left = left + 'px'; card.style.bottom = Math.max(16, vh - r.top + pad + 14) + 'px';
      card.style.setProperty('--ax', Math.max(22, Math.min(cw - 22, cx - left)) + 'px');
    }
    function paint(first){
      const s = steps[i], txt = L.steps[s.k];
      $('tr-kick').textContent = L.of(i + 1, steps.length);
      $('tr-h').textContent = txt[0]; $('tr-p').textContent = txt[1];
      $('tr-next').textContent = i === steps.length - 1 ? L.done : L.next;
      el.querySelectorAll('#tr-dots i').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('done', k < i); });
      place();
      if (!first){ try { Sfx.play('swipe'); } catch(e){ /* rien */ } }
    }
    function close(){
      if (closed) return; closed = true; mark();
      document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', place);
      el.classList.add('is-out');
      setTimeout(() => { try { el.remove(); } catch(e){ /* rien */ } open = null; try { if (prev && prev.focus) prev.focus({ preventScroll: true }); } catch(e){ /* rien */ } }, reduced() ? 0 : 220);
    }
    function onKey(e){
      if (closed) return;
      if (e.key === 'Escape'){ e.preventDefault(); close(); }
      else if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'tr-next'){ /* le bouton gère */ }
      else if (e.key === 'Tab'){ const f = [$('tr-skip'), $('tr-next')]; const a = document.activeElement; if (e.shiftKey && a === f[0]){ e.preventDefault(); f[1].focus(); } else if (!e.shiftKey && a === f[1]){ e.preventDefault(); f[0].focus(); } }
    }
    $('tr-next').onclick = () => { if (i >= steps.length - 1) close(); else { i++; paint(false); } };
    $('tr-skip').onclick = close;
    document.addEventListener('keydown', onKey, true); window.addEventListener('resize', place);
    open = { close };
    paint(true);
    requestAnimationFrame(() => { el.classList.add('is-in'); try { $('tr-next').focus({ preventScroll: true }); } catch(e){ /* rien */ } });
  }
  return { maybe, show, seen, _eligible: eligible };
})();
