'use strict';

/* ============================================================
   META (21.3.0) — présentation « banque » : textes et câblage des écrans recomposés (services, notifications…).
   Ne touche à aucune règle métier : filtre d'affichage côté navigateur, aucune requête, aucune écriture.
   ============================================================ */
Strings.add({
  en: { 'set21.intl': 'International transfers', 'set21.intlRegions': 'Destinations', 'set21.intlVia': 'Payout services', 'set21.svcSearch': 'Search a service', 'set21.svcNone': 'No service found', 'nc21.filter': 'Filter notifications', 'nc21.all': 'All', 'nc21.money': 'Money', 'nc21.security': 'Security', 'nc21.info': 'Information' },
  fr: { 'set21.intl': 'Transferts internationaux', 'set21.intlRegions': 'Destinations', 'set21.intlVia': 'Services de retrait', 'set21.svcSearch': 'Rechercher un service', 'set21.svcNone': 'Aucun service trouvé', 'nc21.filter': 'Filtrer les notifications', 'nc21.all': 'Toutes', 'nc21.money': 'Argent', 'nc21.security': 'Sécurité', 'nc21.info': 'Informations' },
  ar: { 'set21.intl': 'التحويلات الدولية', 'set21.intlRegions': 'الوجهات', 'set21.intlVia': 'خدمات الاستلام', 'set21.svcSearch': 'ابحث عن خدمة', 'set21.svcNone': 'لا توجد خدمة مطابقة', 'nc21.filter': 'تصفية الإشعارات', 'nc21.all': 'الكل', 'nc21.money': 'الأموال', 'nc21.security': 'الأمان', 'nc21.info': 'معلومات' }
});

/* Services : la recherche masque les lignes qui ne correspondent pas ; une catégorie vide disparaît ; rien n'est retiré du document */
Hooks.on('services', root => {
  const q = root.querySelector('#svc-q'); if (!q) return;
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let none = root.querySelector('.svc-none');
  if (!none){ none = document.createElement('p'); none.className = 'svc-none'; none.hidden = true; none.textContent = t('set21.svcNone'); root.querySelector('.sx-svc').appendChild(none); }
  q.addEventListener('input', () => {
    const v = norm(q.value).trim(); let any = false;
    root.querySelectorAll('.sx-grp').forEach(g => {
      if (g.hasAttribute('data-svc-keep')){ g.hidden = !!v && norm(g.textContent).indexOf(v) < 0; if (!g.hidden) any = true; return; }
      let shown = 0;
      g.querySelectorAll('.sx-svc-row').forEach(r => { const hit = !v || norm(r.textContent).indexOf(v) >= 0; r.hidden = !hit; if (hit) shown++; });
      g.hidden = shown === 0; if (shown) any = true;
    });
    none.hidden = any || !v;
  });
});
