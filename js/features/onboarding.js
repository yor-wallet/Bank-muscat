'use strict';

/* ============================================================
   ONBOARDING (12.11.0) — présentation en 4 pages, affichée une seule fois au tout premier lancement.
   - illustrations animées (OpeningArt), glisser du doigt qui suit réellement le doigt, boutons, clavier ;
   - choix de la langue (EN / FR / عربي) dès la première page : l'application change à l'instant, en droite-à-gauche pour l'arabe ;
   - dernière page : « Créer mon compte » ou « J'ai déjà un compte » ;
   - accessible : dialogue modal, pages annoncées, focus piégé, « réduire les animations » respecté.
   `show(done)` appelle `done('signup' | 'login')`.
   ============================================================ */
const Onboarding = (() => {
  const KEY = 'yor_onboarded';
  const S = {
    en:{ skip:'Skip', next:'Next', create:'Create my account', have:'I already have an account', lang:'Language', page:(a, b) => 'Page ' + a + ' of ' + b, slides:[
      { l1:'WELCOME TO', l2:'SANAD PAY', k:'Your money, simple & secure' },
      { l1:'GET 10 OMR', l2:'ON US', k:'A welcome reward for every new account' },
      { l1:'SEND MONEY', l2:'ACROSS THE WORLD', k:'Gulf · Africa · USA · Canada' },
      { l1:'A METAL CARD', l2:'WITH VISA', k:'Tap, shop and pay online' },
      { l1:'PROTECTED BY', l2:'FACE ID & PIN', k:'Your money stays yours' } ] },
    fr:{ skip:'Passer', next:'Suivant', create:'Créer mon compte', have:'J\'ai déjà un compte', lang:'Langue', page:(a, b) => 'Page ' + a + ' sur ' + b, slides:[
      { l1:'BIENVENUE CHEZ', l2:'SANAD PAY', k:'Votre argent, simple et sécurisé' },
      { l1:'GAGNEZ 10 OMR', l2:'OFFERTS', k:'Une récompense pour chaque nouveau compte' },
      { l1:'ENVOYEZ DE L’ARGENT', l2:'DANS LE MONDE ENTIER', k:'Golfe · Afrique · USA · Canada' },
      { l1:'UNE CARTE EN MÉTAL', l2:'AVEC VISA', k:'Payez en magasin et en ligne' },
      { l1:'PROTÉGÉ PAR', l2:'FACE ID ET CODE', k:'Votre argent reste le vôtre' } ] },
    ar:{ skip:'تخطّي', next:'التالي', create:'إنشاء حسابي', have:'لدي حساب بالفعل', lang:'اللغة', page:(a, b) => 'الصفحة ' + a + ' من ' + b, slides:[
      { l1:'مرحباً بك في', l2:'سند باي', k:'أموالك بشكل بسيط وآمن' },
      { l1:'احصل على 10 ريال', l2:'هدية منّا', k:'مكافأة ترحيب لكل حساب جديد' },
      { l1:'أرسل الأموال', l2:'إلى أي مكان في العالم', k:'الخليج · أفريقيا · أمريكا · كندا' },
      { l1:'بطاقة معدنية', l2:'من فيزا', k:'ادفع في المتاجر وعبر الإنترنت' },
      { l1:'محمي بواسطة', l2:'Face ID ورمز PIN', k:'أموالك تبقى ملكك' } ] }
  };
  const LANGS = [['en', 'EN'], ['fr', 'FR'], ['ar', 'عربي']];
  const NAMES = { en:'English', fr:'Français', ar:'العربية' };

  function seen(){ try { return localStorage.getItem(KEY) === '1'; } catch(e){ return false; } }
  function mark(){ try { localStorage.setItem(KEY, '1'); } catch(e){ /* rien */ } }
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  const arrow = () => (typeof icon === 'function' ? icon('arrowRight', 20) : '→');

  function show(done){
    const n = PhoneArt.count;
    let i = 0, lang = (S[LANG] ? LANG : 'en'), drag = null, closing = false;
    const prevFocus = document.activeElement;
    const el = document.createElement('div');
    el.className = 'ob';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-roledescription', 'carousel');
    document.body.appendChild(el);
    const $ = (sel) => el.querySelector(sel);

    function build(){
      const T = S[lang], rtl = lang === 'ar';
      el.setAttribute('dir', rtl ? 'rtl' : 'ltr'); el.setAttribute('lang', lang);
      el.setAttribute('aria-label', rtl ? 'سند باي' : 'Sanad Pay');
      el.innerHTML =
        '<div class="ob-top">' +
          '<div class="ob-lang" role="group" aria-label="' + escapeHtml(T.lang) + '">' +
            LANGS.map(([c, label]) => '<button type="button" class="ob-lang-b" data-ob-lang="' + c + '" lang="' + c + '" aria-label="' + NAMES[c] + '" aria-pressed="' + (c === lang) + '">' + label + '</button>').join('') +
          '</div>' +
          '<button type="button" class="ob-skip" id="ob-skip">' + escapeHtml(T.skip) + '</button>' +
        '</div>' +
        '<div class="ob-stage" id="ob-stage"><div class="ob-track" id="ob-track">' +
          T.slides.map((s, k) =>
            '<section class="ob-slide" data-k="' + k + '" role="group" aria-roledescription="slide" aria-label="' + escapeHtml(T.page(k + 1, n)) + '">' +
              '<div class="ob-copy"><h1 class="ob-h"><span class="l1">' + escapeHtml(s.l1) + '</span><span class="l2">' + escapeHtml(s.l2) + '</span></h1><p class="ob-p">' + escapeHtml(s.k) + '</p></div>' +
              '<div class="ob-hero">' + PhoneArt.slide(k, lang) + '</div>' +
            '</section>').join('') +
        '</div></div>' +
        '<div class="ob-bottom">' +
          '<div class="ob-dots" role="group" aria-label="' + escapeHtml(T.page(i + 1, n)) + '" id="ob-dots">' +
            T.slides.map((_, k) => '<button type="button" class="ob-dot" data-dot="' + k + '" aria-label="' + escapeHtml(T.page(k + 1, n)) + '"></button>').join('') +
          '</div>' +
          '<button type="button" class="btn btn-primary ob-next" id="ob-next" data-fast><span id="ob-next-t"></span><span class="ob-arrow" aria-hidden="true">' + arrow() + '</span></button>' +
          '<button type="button" class="ob-alt" id="ob-have">' + escapeHtml(T.have) + '</button>' +
        '</div>' +
        '<div class="ob-live" id="ob-live" role="status" aria-live="polite"></div>';
      bind();
      paint(true);
    }

    function stageW(){ const st = $('#ob-stage'); return st ? st.getBoundingClientRect().width : 0; }
    function place(dx, animate){
      const tr = $('#ob-track'); if (!tr) return;
      const rtl = lang === 'ar', w = stageW();
      tr.classList.toggle('drag', !animate);
      tr.style.setProperty('--ob-x', ((rtl ? 1 : -1) * i * w + (dx || 0)) + 'px');
    }

    function paint(first){
      const T = S[lang], last = i === n - 1;
      el.querySelectorAll('.ob-slide').forEach((s, k) => {
        const on = k === i;
        s.classList.toggle('on', on); s.classList.toggle('past', k < i);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      el.querySelectorAll('.ob-dot').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('done', k < i); if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      const dots = $('#ob-dots'); if (dots) dots.setAttribute('aria-label', T.page(i + 1, n));
      const nt = $('#ob-next-t'); if (nt) nt.textContent = last ? T.create : T.next;
      el.classList.toggle('is-last', last);
      const skip = $('#ob-skip'); if (skip){ skip.style.visibility = last ? 'hidden' : 'visible'; skip.tabIndex = last ? -1 : 0; }
      const have = $('#ob-have'); if (have){ have.tabIndex = last ? 0 : -1; have.setAttribute('aria-hidden', last ? 'false' : 'true'); }
      const live = $('#ob-live'); if (live && !first) live.textContent = T.slides[i].l1 + ' ' + T.slides[i].l2;
      place(0, !first && !reduced());
    }

    function go(d){
      const j = i + d;
      if (j < 0 || j >= n){ place(0, !reduced()); return; }
      i = j; paint(false);
      try { Sfx.play('swipe'); } catch(e){ /* rien */ }
    }
    function goTo(k){ if (k >= 0 && k < n && k !== i){ i = k; paint(false); try { Sfx.play('swipe'); } catch(e){ /* rien */ } } }

    function teardown(){
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
    }
    function finish(target){
      if (closing) return; closing = true;
      mark();
      el.classList.add('is-leaving');
      const end = () => {
        teardown();
        try { el.remove(); } catch(e){ /* rien */ }
        try { if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll:true }); } catch(e){ /* rien */ }
        if (typeof done === 'function') done(target);
      };
      if (reduced()) end(); else setTimeout(end, 260);
    }

    function setLang(c){
      if (!S[c] || c === lang) return;
      lang = c;
      DeviceLang.set(c); LANG = c; applyI18n();
      build();
      const b = el.querySelector('[data-ob-lang="' + c + '"]'); if (b) { try { b.focus({ preventScroll:true }); } catch(e){ /* rien */ } }
    }

    function bind(){
      $('#ob-next').onclick = () => (i === n - 1 ? finish('signup') : go(1));
      $('#ob-skip').onclick = () => finish('login');
      $('#ob-have').onclick = () => finish('login');
      el.querySelectorAll('[data-ob-lang]').forEach(b => { b.onclick = () => setLang(b.getAttribute('data-ob-lang')); });
      el.querySelectorAll('[data-dot]').forEach(b => { b.onclick = () => goTo(parseInt(b.getAttribute('data-dot'), 10)); });
      /* glisser : la piste suit le doigt, puis se cale sur la page la plus proche */
      const st = $('#ob-stage');
      st.onpointerdown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag = { x: e.clientX, y: e.clientY, dx: 0, locked: null, id: e.pointerId };
      };
      st.onpointermove = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (drag.locked == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) drag.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.locked !== 'x') return;
        try { st.setPointerCapture(e.pointerId); } catch(err){ /* rien */ }
        const rtl = lang === 'ar', fwd = rtl ? dx > 0 : dx < 0;           /* « page suivante » = vers la gauche en LTR, vers la droite en RTL */
        const edge = (fwd && i === n - 1) || (!fwd && i === 0);
        drag.dx = edge ? dx * 0.22 : dx;                                   /* résistance aux extrémités */
        place(drag.dx, false);
      };
      const end = (e) => {
        if (!drag || (e && e.pointerId !== drag.id)) return;
        const d = drag; drag = null;
        if (d.locked !== 'x') return;
        const rtl = lang === 'ar', w = stageW() || 1;
        const fwd = rtl ? d.dx > 0 : d.dx < 0;
        if (Math.abs(d.dx) > Math.min(70, w * 0.18)) go(fwd ? 1 : -1); else place(0, !reduced());
      };
      st.onpointerup = end; st.onpointercancel = end;
    }

    /* clavier : flèches (sens selon la langue), Tab piégé dans la présentation */
    function onKey(e){
      if (closing) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        if (e.target && e.target.closest && e.target.closest('.ob-lang')) return;
        const next = (e.key === 'ArrowRight') !== (lang === 'ar');         /* LTR : → = suivant ; RTL : ← = suivant */
        e.preventDefault(); go(next ? 1 : -1);
        return;
      }
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll('button')].filter(b => b.tabIndex !== -1 && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], ae = document.activeElement;
      if (e.shiftKey && (ae === first || !el.contains(ae))){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (ae === last || !el.contains(ae))){ e.preventDefault(); first.focus(); }
    }
    function fit(){ el.style.setProperty('--ob-h', (window.innerHeight || 800) + 'px'); }
    function onResize(){ if (!closing){ fit(); place(0, false); } }
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);

    fit(); build();
    el.tabIndex = -1;
    requestAnimationFrame(() => { el.classList.add('is-in'); try { el.focus({ preventScroll:true }); } catch(e){ /* rien */ } });
    return el;
  }
  return { seen, show };
})();
