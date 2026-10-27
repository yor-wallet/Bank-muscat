'use strict';

/* ============================================================
   AMAL TRIAGE — GÉNÉRÉ, NE PAS MODIFIER À LA MAIN.
   Source : supabase/functions/sanad-agents/core.mjs  ·  Régénérer : node scripts/dev/sync-triage.mjs
   Rôle : avant tout envoi à l'assistance IA, l'application repère sur l'appareil les messages URGENTS (réponse fixe + passage à une personne)
   et les messages contenant une donnée SENSIBLE (mot de passe, code, carte, IBAN, téléphone, e-mail) : ceux-là ne quittent jamais l'appareil.
   ============================================================ */
const AmalTriage = (() => {
  /* ---------- texte : nettoyage, normalisation, données sensibles ---------- */
  const clip = (value, max = 1200) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);
  /* chiffres arabo-indiens et persans -> chiffres latins, pour que les contrôles voient les mêmes nombres */
  const latinDigits = s => String(s).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x0660).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x06F0);
  const redact = value => latinDigits(clip(value)).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email removed]').replace(/\b[A-Z]{2}\d{2}[A-Z0-9 ]{8,30}\b/gi, '[account removed]').replace(/\b\d{7,}\b/g, '[number removed]');
  function isSensitive(raw) {
    const text = latinDigits(raw);
    return /\b[A-Z]{2}\d{2}[A-Z0-9 ]{8,30}\b/i.test(text)                                                       /* IBAN / compte */
      || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)                                                              /* e-mail */
      || /\b\d{7,}\b/.test(text) || /(?:\d[ -]?){9,}\d/.test(text) || /\b\d{4}[ -]\d{4}\b/.test(text) || /\+\d{2,3}[ -]?\d{3,}/.test(text)   /* numéro de téléphone, de carte, d'identité */
      || /(?:password|passcode|otp|pin|cvv|cvc|mot de passe|code secret|code pin|كلمة المرور|رمز التحقق|الرقم السري|رمز)\s*[:=]\s*\S+/i.test(text)
      || /\b(?:pin|otp|cvv|cvc|code|رمز|رقم سري)\b[^\d\n]{0,14}\d{4,8}\b/i.test(text);                         /* « my pin is 1234 » */
  }
  /* langage normalisé pour la détection d'urgence (minuscules, sans accents ni voyelles brèves arabes) */
  const fold = s => latinDigits(String(s ?? '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ً-ٰـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const URGENT = [
    /\b(stolen|stole|theft|thief|hacked?|hacker|fraud\w*|scam\w*|phish\w*|unauthori[sz]ed|compromised|emergency|urgent)\b/,
    /\b(not me|did ?n.?t (make|do|send|authori[sz]e)|did not (make|do|send|authori[sz]e)|never (made|sent|authori[sz]ed))\b/,
    /\b(lost|missing)\b.{0,20}\b(card|phone|device|money|funds)\b|\b(card|phone|device|money|funds)\b.{0,20}\b(lost|missing|disappeared|vanished)\b/,
    /\b(wrong (person|number|account)|sent .{0,20}by mistake|by mistake)\b/,
    /\b(vol|vole|volee|pirate|piratee|fraude|arnaque|escroc\w*|hame[cç]onnage|non autoris\w*|compromis\w*|urgence|urgent)\b/,
    /\b(pas moi|je n.?ai pas (fait|effectue|envoye|autorise)|jamais (fait|envoye|autorise))\b/,
    /\b(perdu|perdue|disparu\w*)\b.{0,24}\b(carte|telephone|argent|fonds)\b|\b(carte|telephone|argent|fonds)\b.{0,24}\b(perdu\w*|disparu\w*|vole\w*)\b/,
    /\b(mauvaise (personne|numero|compte)|par erreur)\b/,
    /(سرق|مسروق|اختراق|مخترق|اخترق|احتيال|نصب|نصاب|غير مصرح|غير مخول|عاجل|طارئ|طوارئ|ليس انا|لست انا|ما قمت|لم اقم|لم ارسل|ما ارسلت)/,
    /(ضاع|ضاعت|فقدت|فقدان|اختفت|اختفى|تبخر).{0,24}(بطاق|هاتف|جوال|مال|اموال|فلوس|مبلغ)|(بطاق|هاتف|جوال|مال|اموال|فلوس|مبلغ).{0,24}(ضاع|ضاعت|فقدت|اختفت|اختفى)/,
    /((شخص|رقم|حساب) (ال)?خطا|بالخطا|عن طريق الخطا)/
  ];
  function detectUrgent(text) { const s = fold(clip(text, 600)); return URGENT.some(r => r.test(s)); }

  /* messages fixes (jamais générés) : urgence, donnée sensible, repli. Aucun ne promet une action effectuée. */
  const CANNED = Object.freeze({
    urgent: {
      ar: 'هذا الأمر يحتاج إلى موظف دعم. سأفتح لك المحادثة مع فريق الدعم الآن. إن كان حسابك أو أموالك في خطر، لا تشارك أي رمز مع أحد وأبلغنا بما حدث.',
      en: 'This needs a person. I am opening the conversation with our support team now. If your account or money may be at risk, do not share any code with anyone and tell the team what happened.',
      fr: 'Cette situation demande une personne. J’ouvre maintenant la conversation avec l’équipe d’assistance. Si votre compte ou votre argent peut être en danger, ne partagez aucun code et expliquez-lui ce qui s’est passé.'
    },
    sensitive: {
      ar: 'لحمايتك، لا أستطيع قراءة كلمات المرور أو الرموز أو أرقام البطاقات أو الحسابات أو الهاتف. احذفها من رسالتك واسألني من جديد، أو تحدّث مع فريق الدعم.',
      en: 'To protect you, I cannot read passwords, codes, card numbers, account numbers or phone numbers. Remove them from your message and ask again, or talk to the support team.',
      fr: 'Pour votre protection, je ne peux pas lire de mots de passe, de codes, de numéros de carte, de compte ou de téléphone. Retirez-les de votre message et reposez votre question, ou parlez à l’équipe d’assistance.'
    },
    unavailable: {
      ar: 'لا أستطيع الإجابة الآن. يمكنك استخدام الأسئلة السريعة أو التحدث مع فريق الدعم.',
      en: 'I cannot answer right now. You can use the quick questions or talk to the support team.',
      fr: 'Je ne peux pas répondre pour le moment. Utilisez les questions rapides ou parlez à l’équipe d’assistance.'
    },
    guarded: {
      ar: 'لا أستطيع تأكيد ذلك من هنا. تظهر حالة عملياتك وأرصدتك الحقيقية في التطبيق، ويمكن لفريق الدعم التحقق معك.',
      en: 'I cannot confirm that from here. Your real balances and operation statuses are shown in the app, and the support team can check with you.',
      fr: 'Je ne peux pas le confirmer d’ici. Vos soldes et le statut réel de vos opérations sont affichés dans l’application, et l’équipe d’assistance peut vérifier avec vous.'
    }
  });
  const lg = l => (['ar', 'en', 'fr'].includes(l) ? l : 'ar');
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2B07}\u{2705}\u{274C}\u{2728}\u{23E9}-\u{23FF}\u{FE0F}\u{200D}]/gu;
  /* contrôle de la sortie du modèle : pas d'affirmation sur l'argent, pas de demande de secret, pas d'emoji, longueur bornée */
  const CLAIMS = [
    /\b(your|ur)\s+(balance|transfer|payment|deposit|withdrawal|refund)\b.{0,30}\b(is|was|has been|have been|will be)\b/i,
    /\b(has|have|was|were)\s+(been\s+)?(completed|confirmed|received|credited|refunded|approved|delivered|processed|sent)\b/i,
    /\b(votre\s+(solde|virement|paiement|retrait|remboursement)|le\s+(virement|paiement))\b.{0,30}\b(est|a ete|a été|sera)\b/i,
    /\b(a|ont)\s+(ete|été)\s+(confirm|recu|reçu|credit|crédit|rembours|approuv|livr|trait|envoy)/i,
    /(تم\s+(التحويل|الايداع|الإيداع|استلام|تأكيد|رد|إرجاع|ارجاع|قبول|ارسال|إرسال)|رصيدك\s+(هو|الحالي)|وصلت\s+(الحوالة|الاموال|الأموال))/,
    /\b(send|give|share|tell|enter)\s+(me\s+)?(your\s+)?(password|pin|otp|cvv|code|card number|iban)\b/i,
    /\b(envoyez|donnez|communiquez|indiquez)[- ](moi\s+)?(votre\s+)?(mot de passe|code|pin|otp|num[eé]ro de carte|iban)\b/i,
    /(أرسل|ارسل|اعطني|أعطني|شارك|أدخل|ادخل)\s*(لي\s*)?(كلمة المرور|الرمز|رمز|الرقم السري|رقم البطاقة)/
  ];
  function guardOutput(text, lang = 'ar') {
    const clean = clip(String(text ?? '').replace(EMOJI, '').replace(/[*_#`>]+/g, ''), 900).replace(/[ \t]+\n/g, '\n').trim();
    if (!clean) return { text: CANNED.unavailable[lg(lang)], blocked: true, reason: 'empty' };
    if (CLAIMS.some(r => r.test(clean))) return { text: CANNED.guarded[lg(lang)], blocked: true, reason: 'claim' };
    return { text: clean, blocked: false };
  }

  /** Tri avant tout appel au modèle : renvoie une réponse FIXE (vide / urgence / donnée sensible) ou null si la question peut aller au modèle. */
  function triage(message, lang = 'ar') {
    const language = lg(lang);
    const text = clip(message, 600).trim();
    if (!text) return { ok: false, code: 'empty', urgent: false, handoff: false, handoffAvailable: true, text: '' };
    if (detectUrgent(text)) return { ok: true, code: 'urgent', urgent: true, handoff: true, handoffAvailable: true, text: CANNED.urgent[language] };
    if (isSensitive(text)) return { ok: false, code: 'sensitive_input', urgent: false, handoff: true, handoffAvailable: true, text: CANNED.sensitive[language] };
    return null;
  }
  return { detectUrgent, isSensitive, triage, guardOutput, CANNED };
})();
