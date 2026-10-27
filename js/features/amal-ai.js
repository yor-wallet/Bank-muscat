'use strict';

/* ============================================================
   AMAL AI — assistance par IA dans le chat d'Amal (côté application).

   Cadre :
   - l'IA ne répond QU'AUX questions générales que les réponses guidées d'Amal ne couvrent pas ; tout ce qui touche à un solde, à un statut,
     à un frais ou à une limite vient des vraies données de l'application (jamais du modèle) ;
   - rien ne part sans l'accord de la personne (une demande, une fois par compte et par appareil) ;
   - les messages URGENTS (vol, fraude, piratage, argent disparu…) ne vont PAS à l'IA : réponse fixe et passage immédiat à l'équipe d'assistance ;
   - les messages contenant une donnée SENSIBLE (mot de passe, code, carte, IBAN, téléphone, e-mail) ne quittent pas l'appareil ;
   - aucune réponse de l'IA n'est présentée comme une confirmation d'opération : le tri de sortie est refait ici ;
   - si le serveur n'est pas déployé, pas configuré ou injoignable, Amal retombe sur ses réponses guidées et le dit sans rien inventer.

   API : AmalAI = { consent, setConsent, available, ask }
   ============================================================ */
const AmalAI = (() => {
  Strings.add({
    en: {
      'yas.ai.ask': 'I can use an AI service to answer this. Your question is sent over a secure connection to our server, then to the AI provider. Nothing about your balance, transactions or identity is attached. Never write a password, a code, or a card, account or phone number. Allow AI answers?',
      'yas.ai.allow': 'Allow', 'yas.ai.deny': 'No thanks',
      'yas.ai.denied': 'Understood. I will keep to my guided answers.',
      'yas.ai.on': 'AI answers are on. They can be wrong: check amounts and statuses in the app, and never share a password or a code.',
      'yas.ai.turnOff': 'Turn off AI answers', 'yas.ai.turnOn': 'Turn on AI answers',
      'yas.hidden': 'Message hidden for your security'
    },
    fr: {
      'yas.ai.ask': 'Je peux utiliser un service d’IA pour répondre. Votre question est envoyée par une connexion sécurisée à notre serveur, puis au fournisseur d’IA. Rien sur votre solde, vos opérations ou votre identité n’y est joint. N’écrivez jamais de mot de passe, de code, ni de numéro de carte, de compte ou de téléphone. Autoriser les réponses par IA ?',
      'yas.ai.allow': 'Autoriser', 'yas.ai.deny': 'Non merci',
      'yas.ai.denied': 'Compris. Je m’en tiens à mes réponses guidées.',
      'yas.ai.on': 'Les réponses par IA sont activées. Elles peuvent être inexactes : vérifiez les montants et les statuts dans l’application, et ne partagez jamais de mot de passe ni de code.',
      'yas.ai.turnOff': 'Désactiver les réponses par IA', 'yas.ai.turnOn': 'Activer les réponses par IA',
      'yas.hidden': 'Message masqué pour votre sécurité'
    },
    ar: {
      'yas.ai.ask': 'يمكنني استخدام خدمة ذكاء اصطناعي للإجابة. يُرسل سؤالك عبر اتصال آمن إلى خادمنا ثم إلى مزوّد الذكاء الاصطناعي، دون أي معلومة عن رصيدك أو عملياتك أو هويتك. لا تكتب أبداً كلمة مرور أو رمزاً أو رقم بطاقة أو حساب أو هاتف. هل تسمح بإجابات الذكاء الاصطناعي؟',
      'yas.ai.allow': 'أسمح', 'yas.ai.deny': 'لا، شكراً',
      'yas.ai.denied': 'مفهوم. سأكتفي بإجاباتي الموجّهة.',
      'yas.ai.on': 'إجابات الذكاء الاصطناعي مفعّلة. قد تكون خاطئة: تحقّق من المبالغ والحالات في التطبيق ولا تشارك كلمة مرور أو رمزاً.',
      'yas.ai.turnOff': 'إيقاف إجابات الذكاء الاصطناعي', 'yas.ai.turnOn': 'تفعيل إجابات الذكاء الاصطناعي',
      'yas.hidden': 'تم إخفاء الرسالة لحمايتك'
    }
  });

  const TIMEOUT_MS = 20000;
  const uid = () => { try { return (typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.uid) || ''; } catch(e){ return ''; } };
  /* clé de la famille « amal_ai_<compte> » (déclarée dans Janitor.PER_USER) : le nettoyeur ne garde que celle de la personne connectée */
  const key = () => 'amal_ai_' + uid();
  function consent(){ try { return uid() ? (localStorage.getItem(key()) || '') : ''; } catch(e){ return ''; } }      /* 'yes' | 'no' | '' (pas encore demandé) */
  function setConsent(v){ try { if (uid()) localStorage.setItem(key(), v === 'yes' ? 'yes' : 'no'); } catch(e){ /* stockage indisponible : la demande sera reposée */ } }
  const available = () => { try { return !!(uid() && typeof sb !== 'undefined' && sb && sb.functions && navigator.onLine !== false); } catch(e){ return false; } };

  /* Appelle la fonction serveur. L'appelant a DÉJÀ fait le tri (AmalTriage.triage) : seules les questions ordinaires arrivent ici.
     Renvoie { ok, text, handoff, urgent } ou { ok:false, code[, text, handoff] }. */
  async function ask(message){
    try {
      if (!available()) return { ok: false, code: 'net' };
      const lang = (typeof LANG !== 'undefined' && LANG) || 'ar';
      const call = sb.functions.invoke('sanad-agents', { body: { mode: 'support', lang, message: String(message || '').slice(0, 600) } });
      const r = await Promise.race([call, new Promise(res => setTimeout(() => res({ error: { timeout: true } }), TIMEOUT_MS))]);
      if (r && r.error){
        let code = 'net', j = null;
        try { j = r.error.context && await r.error.context.json(); if (j && j.error) code = j.error; } catch(e){ /* réponse illisible */ }
        if (r.error.timeout) code = 'timeout';
        return j && j.text ? { ok: false, code, text: String(j.text), handoff: true } : { ok: false, code };
      }
      const d = (r && r.data) || {};
      if (!d.text) return { ok: false, code: d.error || 'net' };
      const g = AmalTriage.guardOutput(d.text, lang);
      return { ok: d.ok !== false, text: g.text, handoff: !!d.handoff || g.blocked, urgent: !!d.urgent };
    } catch(e){
      try { if (typeof Guardian !== 'undefined') Guardian.note('amal-ai', e); } catch(x){ /* rien */ }
      return { ok: false, code: 'net' };
    }
  }
  return { consent, setConsent, available, ask };
})();
