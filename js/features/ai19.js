'use strict';

/* ============================================================
   AI 19.1 — assistant de l'administrateur (côté application).

   Ce module ne fait que DEMANDER du texte au serveur et l'afficher.
   Il n'exécute aucune décision : pas de confirmation de paiement,
   pas de validation de retrait, pas d'envoi automatique de message.
   Tout ce qui sort d'ici est une SUGGESTION à relire par un humain.

   API : AI19 = { call, html, errText, available }
   ============================================================ */
const AI19 = (() => {
  Strings.add({
    en: {
      'ai.btn': 'Assistant', 'ai.title': 'Assistant — file summary', 'ai.wait': 'Reading the file…',
      'ai.note': 'Suggestion produced by an assistant from the file data. It decides nothing: check the facts yourself before any decision.',
      'ai.s1': 'Summary', 'ai.s2': 'To check yourself', 'ai.s3': 'Signals',
      'ai.draft': 'Draft a reply', 'ai.drafting': 'Writing a draft…', 'ai.draftIn': 'Draft inserted — read it, correct it, then send.',
      'ai.copy': 'Copy', 'ai.copied': 'Copied', 'ai.again': 'Try again',
      'ai.e.off': 'The assistant is not configured yet (missing AI key on the server).',
      'ai.e.admin': 'Administrators only.', 'ai.e.quota': 'Too many requests this hour. Try again later.',
      'ai.e.net': 'The assistant is unreachable. Try again.', 'ai.e.none': 'File not found.'
    },
    fr: {
      'ai.btn': 'Assistant', 'ai.title': 'Assistant — résumé du dossier', 'ai.wait': 'Lecture du dossier…',
      'ai.note': 'Suggestion produite par un assistant à partir des données du dossier. Il ne décide rien : vérifiez vous-même les faits avant toute décision.',
      'ai.s1': 'Résumé', 'ai.s2': 'À vérifier vous-même', 'ai.s3': 'Signaux',
      'ai.draft': 'Proposer une réponse', 'ai.drafting': 'Rédaction d’un brouillon…', 'ai.draftIn': 'Brouillon inséré — relisez, corrigez, puis envoyez.',
      'ai.copy': 'Copier', 'ai.copied': 'Copié', 'ai.again': 'Réessayer',
      'ai.e.off': 'L’assistant n’est pas encore configuré (clé IA absente sur le serveur).',
      'ai.e.admin': 'Réservé aux administrateurs.', 'ai.e.quota': 'Trop de demandes cette heure-ci. Réessayez plus tard.',
      'ai.e.net': 'L’assistant est injoignable. Réessayez.', 'ai.e.none': 'Dossier introuvable.'
    },
    ar: {
      'ai.btn': 'المساعد', 'ai.title': 'المساعد — ملخص الملف', 'ai.wait': 'جارٍ قراءة الملف…',
      'ai.note': 'اقتراح من مساعد بناءً على بيانات الملف. لا يتخذ أي قرار: تحقّق من الوقائع بنفسك قبل أي قرار.',
      'ai.s1': 'الملخص', 'ai.s2': 'تحقّق بنفسك', 'ai.s3': 'إشارات',
      'ai.draft': 'اقتراح ردّ', 'ai.drafting': 'جارٍ كتابة مسودة…', 'ai.draftIn': 'أُدرجت المسودة — راجعها وصحّحها ثم أرسلها.',
      'ai.copy': 'نسخ', 'ai.copied': 'تم النسخ', 'ai.again': 'إعادة المحاولة',
      'ai.e.off': 'لم يُضبط المساعد بعد (مفتاح الذكاء الاصطناعي غير موجود على الخادم).',
      'ai.e.admin': 'للمسؤولين فقط.', 'ai.e.quota': 'طلبات كثيرة خلال هذه الساعة. حاول لاحقاً.',
      'ai.e.net': 'تعذّر الوصول إلى المساعد. حاول مجدداً.', 'ai.e.none': 'الملف غير موجود.'
    }
  });

  const ERR = { ai_not_configured: 'ai.e.off', admin_only: 'ai.e.admin', quota: 'ai.e.quota', not_found: 'ai.e.none' };
  const errText = code => t(ERR[code] || 'ai.e.net');

  /* appel de la fonction serveur ; renvoie { ok, text } ou { ok:false, code } */
  async function call(body){
    try {
      if (typeof sb === 'undefined' || !sb || !sb.functions) return { ok: false, code: 'net' };
      const lang = (typeof LANG !== 'undefined' && LANG) || 'fr';
      const r = await sb.functions.invoke('ai-assist', { body: Object.assign({ lang }, body) });
      if (r.error){
        let code = 'net';
        try { const j = await r.error.context.json(); code = j && j.error ? j.error : 'net'; } catch(e){ /* réponse illisible */ }
        return { ok: false, code };
      }
      const d = r.data || {};
      if (!d.ok || !d.text) return { ok: false, code: d.error || 'net' };
      return { ok: true, text: String(d.text) };
    } catch(e){
      if (typeof Guardian !== 'undefined') Guardian.note('ai-assist', e);
      return { ok: false, code: 'net' };
    }
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* découpe la réponse en trois sections ; si le format n'est pas respecté, on montre le texte brut */
  function html(text){
    const src = String(text || '').trim();
    const cut = (from, to) => {
      const i = src.search(from); if (i < 0) return '';
      const rest = src.slice(i).replace(from, '').trim();
      if (!to) return rest;
      const j = rest.search(to);
      return (j < 0 ? rest : rest.slice(0, j)).trim();
    };
    const r1 = cut(/RESUME\s*:?\s*/i, /A\s*VERIFIER|SIGNAUX/i);
    const r2 = cut(/A\s*VERIFIER\s*:?\s*/i, /SIGNAUX/i);
    const r3 = cut(/SIGNAUX\s*:?\s*/i, null);
    const lines = s => s.split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    if (!r1 && !r2 && !r3) return '<div class="ai-sec"><p>' + esc(src).replace(/\n/g, '<br>') + '</p></div>';
    const sec = (key, body, cls) => {
      const L = lines(body); if (!L.length) return '';
      return '<div class="ai-sec' + (cls ? ' ' + cls : '') + '"><h3>' + esc(t(key)) + '</h3>' +
        (L.length > 1 ? '<ul>' + L.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<p>' + esc(L[0]) + '</p>') + '</div>';
    };
    return sec('ai.s1', r1) + sec('ai.s2', r2, 'ai-check') + sec('ai.s3', r3, 'ai-flag');
  }

  const available = () => typeof sb !== 'undefined' && !!(sb && sb.functions);

  return { call, html, errText, available };
})();
