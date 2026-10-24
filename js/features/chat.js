'use strict';

/* ============================================================
   CHAT (18.0.0) — messagerie utilisateur <-> administrateur (texte, photo, vidéo, vocal) et assistant Freindi Pay.
   - Chat      : API publique { unread, start, stop, openSupport, openThread, onUnread } ; un seul canal realtime pour toute l'application.
   - Yaser     : assistant à règles (en / fr / ar), personnage SVG animé, mémoire locale par utilisateur ; ne dit que ce que lit l'application.
   - Écrans    : chat, yaser (utilisateur) ; admin-chat (boîte de réception), admin-chat-thread (conversation) pour l'administrateur.
   - Sécurité  : réservée côté serveur (RLS + fonctions chat_* / admin_chat_*) ; ici l'interface ne fait que masquer.
   - Aucun emoji : toutes les icônes sont des SVG ; chiffres latins ; le miroir RTL est géré par le CSS (html[dir="rtl"]).
   ============================================================ */
Strings.add({
  en: {
    'chat.title': 'Support', 'chat.brand': 'Freindi Pay', 'chat.online': 'Online', 'chat.connecting': 'Connecting…', 'chat.offline': 'Offline — messages will wait',
    'chat.ph': 'Message', 'chat.today': 'Today', 'chat.yesterday': 'Yesterday',
    'chat.helpT': 'To add money, write here', 'chat.helpB': 'The administrator confirms your deposit in this conversation.', 'chat.askDep': 'Request a deposit',
    'chat.depTpl': 'Hello, I would like to add money to my account. Amount: ___ OMR. Please tell me how to proceed.',
    'chat.attach': 'Attach', 'chat.pdf': 'PDF document', 'chat.photo': 'Photo', 'chat.camera': 'Camera', 'chat.video': 'Video', 'chat.mic': 'Voice message', 'chat.send': 'Send',
    'chat.slide': 'Slide to cancel', 'chat.recording': 'Recording', 'chat.recCancel': 'Cancel recording',
    'chat.recDenied': 'Microphone access was refused. Allow it in your browser settings.', 'chat.recNone': 'Voice messages are not available on this device.', 'chat.recShort': 'Hold to record, release to send.',
    'chat.retry': 'Retry', 'chat.failed': 'Not sent', 'chat.sending': 'Sending', 'chat.queued': 'Waiting for connection',
    'chat.tooBig': 'This file is larger than 25 MB.', 'chat.badType': 'This file type is not supported.', 'chat.caption': 'Add a caption', 'chat.cancel': 'Cancel', 'chat.close': 'Close',
    'chat.down': 'Latest messages', 'chat.deposit': 'Deposit confirmed', 'chat.credit': 'Credit granted', 'chat.ref': 'Ref.',
    'chat.empty': 'Start the conversation. An administrator will answer you here.', 'chat.yaser': 'Ask Freindi Pay',
    'chat.photoMsg': 'Photo', 'chat.videoMsg': 'Video', 'chat.audioMsg': 'Voice message', 'chat.loadErr': 'Could not load messages.', 'chat.upErr': 'Upload failed. Try again.',
    'chat.aSent': 'Sent', 'chat.aRead': 'Read', 'chat.play': 'Play', 'chat.pause': 'Pause', 'chat.speed': 'Speed', 'chat.copied': 'Copied', 'chat.zoom': 'Zoom',
    'chat.in.title': 'Messages', 'chat.in.search': 'Search name, number or ID', 'chat.in.empty': 'No conversation yet.', 'chat.in.none': 'No result', 'chat.th.noThread': 'Open a conversation from the inbox.',
    'chat.act.dep': 'Confirm a deposit', 'chat.act.credit': 'Credit requests', 'chat.act.quick': 'Quick replies',
    'chat.dep.title': 'Confirm a deposit', 'chat.dep.sub': 'Credits the member’s wallet and posts a receipt in this conversation.', 'chat.dep.amt': 'Amount (OMR)', 'chat.dep.note': 'Note (optional)',
    'chat.dep.review': 'Review', 'chat.dep.ask': 'Credit {a} to {n}?', 'chat.dep.go': 'Credit now', 'chat.dep.done': 'Deposit credited', 'chat.dep.bad': 'Enter a valid amount.', 'chat.dep.err': 'The deposit could not be recorded.',
    'chat.q.title': 'Quick replies', 'chat.q.edit': 'Edit', 'chat.q.add': 'Add a reply', 'chat.q.save': 'Save', 'chat.q.ph': 'Write a reply',
    'chat.q1': 'Hello, how can I help you?', 'chat.q2': 'Your deposit is being processed. I will confirm it here shortly.', 'chat.q3': 'Please send a photo of the transfer receipt.', 'chat.q4': 'Thank you for your trust.',
    'yas.title': 'Freindi Pay', 'yas.sub': 'Your financial assistant', 'yas.ph': 'Ask Freindi Pay', 'yas.typing': 'Freindi Pay is typing', 'yas.new': 'New conversation',
    'yas.openChat': 'Open the chat', 'yas.openCredit': 'Request a credit', 'yas.openBoost': 'Open Boost', 'yas.openSend': 'Send money', 'yas.openIntl': 'International transfer',
    'yas.c.deposit': 'How do I add money?', 'yas.c.credit': 'I need a credit', 'yas.c.boost': 'Earn on my money', 'yas.c.balance': 'My balance', 'yas.c.human': 'Talk to a person',
    'yas.r.hello': 'Welcome to Freindi Pay!\n\nI am your financial assistant.\n\nHow can I help you today?',
    'yas.r.who': 'I am your Freindi Pay financial assistant. I answer your questions and take you to the right screen.',
    'yas.r.deposit': 'To add money to your account, write to the administrator in the chat. The administrator confirms your deposit there, and the money appears in your balance right away.',
    'yas.r.credit': 'You can request a credit from {min} to {max} OMR. The administrator reviews your request and decides. If it is approved, the amount is added to your balance immediately.',
    'yas.r.boost': 'Freindi Pay does not announce any return that has not been validated. See the plans: gains are shown only when the model is defined and validated.',
    'yas.r.send': 'To send money, choose Send, enter the recipient’s mobile number, then the amount. Your personal code or Face ID confirms the transfer.',
    'yas.r.intl': 'You can send money to more than 60 countries with the international transfer. The usual time is 48 to 72 hours.',
    'yas.r.balance': 'Your available balance is {bal}.', 'yas.r.balanceNo': 'I cannot read your balance right now. Please try again in a moment.',
    'yas.r.history': 'Your latest operations:\n{list}', 'yas.r.historyNo': 'You have no operation yet.',
    'yas.r.security': 'Your account is protected by a 6-digit personal code and Face ID. Never share your code: no administrator will ever ask for it.',
    'yas.r.fees': 'Any fee is shown on the review screen before you confirm. Nothing is taken without showing it to you first.',
    'yas.r.human': 'I am opening the conversation with the administrator for you.',
    'yas.r.thanks': 'You are welcome {n}! I am here whenever you need me.',
    'yas.r.fallback': 'I did not fully understand. Try one of the suggestions, or talk to a person.'
  },
  fr: {
    'chat.title': 'Assistance', 'chat.brand': 'Freindi Pay', 'chat.online': 'En ligne', 'chat.connecting': 'Connexion…', 'chat.offline': 'Hors ligne — les messages attendront',
    'chat.ph': 'Message', 'chat.today': 'Aujourd’hui', 'chat.yesterday': 'Hier',
    'chat.helpT': 'Pour déposer de l’argent, écrivez ici', 'chat.helpB': 'L’administrateur confirme votre dépôt dans cette conversation.', 'chat.askDep': 'Demander un dépôt',
    'chat.depTpl': 'Bonjour, je souhaite déposer de l’argent sur mon compte. Montant : ___ OMR. Merci de m’indiquer comment procéder.',
    'chat.attach': 'Joindre', 'chat.pdf': 'Document PDF', 'chat.photo': 'Photo', 'chat.camera': 'Appareil photo', 'chat.video': 'Vidéo', 'chat.mic': 'Message vocal', 'chat.send': 'Envoyer',
    'chat.slide': 'Glissez pour annuler', 'chat.recording': 'Enregistrement', 'chat.recCancel': 'Annuler l’enregistrement',
    'chat.recDenied': 'L’accès au micro a été refusé. Autorisez-le dans les réglages du navigateur.', 'chat.recNone': 'Les messages vocaux ne sont pas disponibles sur cet appareil.', 'chat.recShort': 'Maintenez pour enregistrer, relâchez pour envoyer.',
    'chat.retry': 'Réessayer', 'chat.failed': 'Non envoyé', 'chat.sending': 'Envoi', 'chat.queued': 'En attente de connexion',
    'chat.tooBig': 'Ce fichier dépasse 25 Mo.', 'chat.badType': 'Ce type de fichier n’est pas pris en charge.', 'chat.caption': 'Ajouter une légende', 'chat.cancel': 'Annuler', 'chat.close': 'Fermer',
    'chat.down': 'Derniers messages', 'chat.deposit': 'Dépôt confirmé', 'chat.credit': 'Crédit accordé', 'chat.ref': 'Réf.',
    'chat.empty': 'Commencez la conversation. Un administrateur vous répondra ici.', 'chat.yaser': 'Demander à Freindi Pay',
    'chat.photoMsg': 'Photo', 'chat.videoMsg': 'Vidéo', 'chat.audioMsg': 'Message vocal', 'chat.loadErr': 'Impossible de charger les messages.', 'chat.upErr': 'Échec de l’envoi. Réessayez.',
    'chat.aSent': 'Envoyé', 'chat.aRead': 'Lu', 'chat.play': 'Lecture', 'chat.pause': 'Pause', 'chat.speed': 'Vitesse', 'chat.copied': 'Copié', 'chat.zoom': 'Zoom',
    'chat.in.title': 'Messages', 'chat.in.search': 'Rechercher nom, numéro ou ID', 'chat.in.empty': 'Aucune conversation pour l’instant.', 'chat.in.none': 'Aucun résultat', 'chat.th.noThread': 'Ouvrez une conversation depuis la boîte de réception.',
    'chat.act.dep': 'Confirmer un dépôt', 'chat.act.credit': 'Demandes de crédit', 'chat.act.quick': 'Réponses rapides',
    'chat.dep.title': 'Confirmer un dépôt', 'chat.dep.sub': 'Crédite le portefeuille du membre et publie un reçu dans cette conversation.', 'chat.dep.amt': 'Montant (OMR)', 'chat.dep.note': 'Note (facultatif)',
    'chat.dep.review': 'Vérifier', 'chat.dep.ask': 'Créditer {a} à {n} ?', 'chat.dep.go': 'Créditer maintenant', 'chat.dep.done': 'Dépôt crédité', 'chat.dep.bad': 'Saisissez un montant valide.', 'chat.dep.err': 'Le dépôt n’a pas pu être enregistré.',
    'chat.q.title': 'Réponses rapides', 'chat.q.edit': 'Modifier', 'chat.q.add': 'Ajouter une réponse', 'chat.q.save': 'Enregistrer', 'chat.q.ph': 'Écrivez une réponse',
    'chat.q1': 'Bonjour, comment puis-je vous aider ?', 'chat.q2': 'Votre dépôt est en cours de traitement. Je le confirme ici dans un instant.', 'chat.q3': 'Merci d’envoyer une photo du reçu du virement.', 'chat.q4': 'Merci pour votre confiance.',
    'yas.title': 'Freindi Pay', 'yas.sub': 'Votre assistant financier', 'yas.ph': 'Demandez à Freindi Pay', 'yas.typing': 'Freindi Pay écrit', 'yas.new': 'Nouvelle conversation',
    'yas.openChat': 'Ouvrir le chat', 'yas.openCredit': 'Demander un crédit', 'yas.openBoost': 'Ouvrir Boost', 'yas.openSend': 'Envoyer de l’argent', 'yas.openIntl': 'Transfert international',
    'yas.c.deposit': 'Comment déposer de l’argent ?', 'yas.c.credit': 'J’ai besoin d’un crédit', 'yas.c.boost': 'Gagner sur mon argent', 'yas.c.balance': 'Mon solde', 'yas.c.human': 'Parler à une personne',
    'yas.r.hello': 'Bienvenue sur Freindi Pay !\n\nJe suis votre assistant financier.\n\nComment puis-je vous aider aujourd’hui ?',
    'yas.r.who': 'Je suis votre assistant financier Freindi Pay. Je réponds à vos questions et je vous conduis au bon écran.',
    'yas.r.deposit': 'Pour ajouter de l’argent à votre compte, écrivez à l’administrateur dans le chat. Il confirme votre dépôt dans la conversation et l’argent apparaît aussitôt dans votre solde.',
    'yas.r.credit': 'Vous pouvez demander un crédit de {min} à {max} OMR. L’administrateur étudie votre demande et décide. En cas d’accord, le montant est ajouté tout de suite à votre solde.',
    'yas.r.boost': 'Freindi Pay n’annonce aucun rendement non validé. Consultez les plans : un gain n’est affiché que si le modèle est défini et validé.',
    'yas.r.send': 'Pour envoyer de l’argent, choisissez Envoyer, saisissez le numéro de mobile du destinataire puis le montant. Votre code personnel ou Face ID confirme le transfert.',
    'yas.r.intl': 'Vous pouvez envoyer de l’argent vers plus de 60 pays avec le transfert international. Le délai habituel est de 48 à 72 heures.',
    'yas.r.balance': 'Votre solde disponible est de {bal}.', 'yas.r.balanceNo': 'Je ne peux pas lire votre solde pour le moment. Réessayez dans un instant.',
    'yas.r.history': 'Vos dernières opérations :\n{list}', 'yas.r.historyNo': 'Vous n’avez pas encore d’opération.',
    'yas.r.security': 'Votre compte est protégé par un code personnel à 6 chiffres et Face ID. Ne partagez jamais votre code : aucun administrateur ne vous le demandera.',
    'yas.r.fees': 'Les frais éventuels s’affichent sur l’écran de vérification avant la confirmation. Rien n’est prélevé sans vous être montré.',
    'yas.r.human': 'J’ouvre pour vous la conversation avec l’administrateur.',
    'yas.r.thanks': 'Avec plaisir {n} ! Je suis là dès que vous avez besoin de moi.',
    'yas.r.fallback': 'Je n’ai pas tout à fait compris. Essayez une des suggestions, ou parlez à une personne.'
  },
  ar: {
    'chat.title': 'الدعم', 'chat.brand': 'فريندي باي', 'chat.online': 'متصل', 'chat.connecting': 'جارٍ الاتصال…', 'chat.offline': 'غير متصل — ستنتظر الرسائل',
    'chat.ph': 'اكتب رسالة', 'chat.today': 'اليوم', 'chat.yesterday': 'أمس',
    'chat.helpT': 'لإيداع الأموال اكتب هنا', 'chat.helpB': 'يؤكد المسؤول إيداعك داخل هذه المحادثة.', 'chat.askDep': 'طلب إيداع',
    'chat.depTpl': 'مرحباً، أرغب في إيداع مبلغ في حسابي. المبلغ: ___ ر.ع. يرجى إرشادي إلى الخطوات.',
    'chat.attach': 'إرفاق', 'chat.pdf': 'مستند PDF', 'chat.photo': 'صورة', 'chat.camera': 'الكاميرا', 'chat.video': 'فيديو', 'chat.mic': 'رسالة صوتية', 'chat.send': 'إرسال',
    'chat.slide': 'اسحب للإلغاء', 'chat.recording': 'جارٍ التسجيل', 'chat.recCancel': 'إلغاء التسجيل',
    'chat.recDenied': 'تم رفض الوصول إلى الميكروفون. اسمح به من إعدادات المتصفح.', 'chat.recNone': 'الرسائل الصوتية غير متاحة على هذا الجهاز.', 'chat.recShort': 'اضغط مع الاستمرار للتسجيل ثم ارفع إصبعك للإرسال.',
    'chat.retry': 'إعادة المحاولة', 'chat.failed': 'لم تُرسل', 'chat.sending': 'جارٍ الإرسال', 'chat.queued': 'بانتظار الاتصال',
    'chat.tooBig': 'حجم هذا الملف أكبر من 25 ميغابايت.', 'chat.badType': 'نوع الملف غير مدعوم.', 'chat.caption': 'أضف تعليقاً', 'chat.cancel': 'إلغاء', 'chat.close': 'إغلاق',
    'chat.down': 'أحدث الرسائل', 'chat.deposit': 'تم تأكيد الإيداع', 'chat.credit': 'تم منح الائتمان', 'chat.ref': 'المرجع',
    'chat.empty': 'ابدأ المحادثة. سيرد عليك مسؤول هنا.', 'chat.yaser': 'اسأل فريندي باي',
    'chat.photoMsg': 'صورة', 'chat.videoMsg': 'فيديو', 'chat.audioMsg': 'رسالة صوتية', 'chat.loadErr': 'تعذّر تحميل الرسائل.', 'chat.upErr': 'فشل الرفع. حاول مجدداً.',
    'chat.aSent': 'أُرسلت', 'chat.aRead': 'قُرئت', 'chat.play': 'تشغيل', 'chat.pause': 'إيقاف مؤقت', 'chat.speed': 'السرعة', 'chat.copied': 'تم النسخ', 'chat.zoom': 'تكبير',
    'chat.in.title': 'الرسائل', 'chat.in.search': 'ابحث بالاسم أو الرقم أو المعرّف', 'chat.in.empty': 'لا توجد محادثات بعد.', 'chat.in.none': 'لا نتائج', 'chat.th.noThread': 'افتح محادثة من صندوق الوارد.',
    'chat.act.dep': 'تأكيد إيداع', 'chat.act.credit': 'طلبات الائتمان', 'chat.act.quick': 'ردود سريعة',
    'chat.dep.title': 'تأكيد إيداع', 'chat.dep.sub': 'يُضاف المبلغ إلى محفظة العضو ويُنشر إيصال في هذه المحادثة.', 'chat.dep.amt': 'المبلغ (ر.ع)', 'chat.dep.note': 'ملاحظة (اختياري)',
    'chat.dep.review': 'مراجعة', 'chat.dep.ask': 'إضافة {a} إلى {n}؟', 'chat.dep.go': 'أضف الآن', 'chat.dep.done': 'تمت إضافة الإيداع', 'chat.dep.bad': 'أدخل مبلغاً صحيحاً.', 'chat.dep.err': 'تعذّر تسجيل الإيداع.',
    'chat.q.title': 'ردود سريعة', 'chat.q.edit': 'تعديل', 'chat.q.add': 'أضف رداً', 'chat.q.save': 'حفظ', 'chat.q.ph': 'اكتب رداً',
    'chat.q1': 'مرحباً، كيف أستطيع مساعدتك؟', 'chat.q2': 'إيداعك قيد المعالجة. سأؤكده هنا بعد قليل.', 'chat.q3': 'يرجى إرسال صورة إيصال التحويل.', 'chat.q4': 'شكراً لثقتك بنا.',
    'yas.title': 'فريندي باي', 'yas.sub': 'مساعدك المالي', 'yas.ph': 'اسأل فريندي باي', 'yas.typing': 'فريندي باي يكتب', 'yas.new': 'محادثة جديدة',
    'yas.openChat': 'فتح المحادثة', 'yas.openCredit': 'طلب ائتمان', 'yas.openBoost': 'فتح بوست', 'yas.openSend': 'إرسال أموال', 'yas.openIntl': 'التحويل الدولي',
    'yas.c.deposit': 'كيف أودع أموالاً؟', 'yas.c.credit': 'أحتاج إلى ائتمان', 'yas.c.boost': 'اربح من أموالي', 'yas.c.balance': 'رصيدي', 'yas.c.human': 'التحدث مع شخص',
    'yas.r.hello': 'مرحباً بك في Freindi Pay!\n\nأنا مساعدك المالي.\n\nكيف يمكنني مساعدتك اليوم؟',
    'yas.r.who': 'أنا مساعدك المالي في فريندي باي. أجيب عن أسئلتك وأوجّهك إلى الشاشة المناسبة.',
    'yas.r.deposit': 'لإضافة أموال إلى حسابك اكتب للمسؤول في المحادثة. يؤكد المسؤول الإيداع هناك وتظهر الأموال في رصيدك فوراً.',
    'yas.r.credit': 'يمكنك طلب ائتمان من {min} إلى {max} ر.ع. يراجع المسؤول طلبك ويقرر. عند الموافقة يُضاف المبلغ إلى رصيدك مباشرة.',
    'yas.r.boost': 'لا تعلن فريندي باي عن أي عائد غير معتمد. راجع الخطط: لا يظهر أي ربح إلا إذا كان النموذج محدداً ومعتمداً.',
    'yas.r.send': 'لإرسال أموال اختر إرسال، وأدخل رقم هاتف المستفيد ثم المبلغ. يؤكد رمزك الشخصي أو بصمة الوجه عملية التحويل.',
    'yas.r.intl': 'يمكنك إرسال أموال إلى أكثر من 60 دولة عبر التحويل الدولي. المدة المعتادة من 48 إلى 72 ساعة.',
    'yas.r.balance': 'رصيدك المتاح الآن هو {bal}.', 'yas.r.balanceNo': 'لا أستطيع قراءة رصيدك الآن. حاول مرة أخرى بعد قليل.',
    'yas.r.history': 'آخر عملياتك:\n{list}', 'yas.r.historyNo': 'ليس لديك أي عملية بعد.',
    'yas.r.security': 'حسابك محمي برمز شخصي من 6 أرقام وببصمة الوجه. لا تشارك رمزك مع أحد، فلن يطلبه منك أي مسؤول.',
    'yas.r.fees': 'تظهر الرسوم إن وُجدت في شاشة المراجعة قبل التأكيد. لا يُخصم أي شيء دون أن يُعرض عليك أولاً.',
    'yas.r.human': 'سأفتح لك المحادثة مع المسؤول.',
    'yas.r.thanks': 'على الرحب والسعة {n}! أنا هنا متى احتجت إليّ.',
    'yas.r.fallback': 'لم أفهم تماماً. جرّب أحد الاقتراحات أو تحدّث مع شخص.'
  }
});

/* ---------- outils ---------- */
const CHAT_BUCKET = 'chat-media', CHAT_MAX = 26214400, CHAT_REC_MAX = 180000;
const chIsAdmin = () => !!(typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.role === 'admin');
const chUid = () => (typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.uid) || '';
const chEsc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s));
const chLoc = () => (LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG === 'fr' ? 'fr-FR' : 'en-GB');
const CH_ICONS = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clip: '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.5 17.2a1.7 1.7 0 0 1-2.4-2.4L14.5 7.5"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  pause: '<rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor"/><rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor"/>',
  dcheck: '<path d="M2 12.5l4.5 4.5L15 8"/><path d="M10 15.5l1.5 1.5L21 8"/>',
  up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  retry: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'
};
function chIc(name, size, cls){
  size = size || 20;
  const d = CH_ICONS[name];
  if (!d) return (typeof icon === 'function') ? icon(name, size) : '';
  return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" class="ic' + (cls ? ' ' + cls : '') + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
}
let chGid = 0;
function chLogo(size){
  const n = ++chGid;
  return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" class="chat-logo" aria-hidden="true"><defs><linearGradient id="chl' + n + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8edde2"/><stop offset="1" stop-color="#bae8eb"/></linearGradient></defs>' +
    '<circle cx="24" cy="24" r="24" fill="url(#chl' + n + ')"/><text x="24" y="30.5" text-anchor="middle" font-family="Manrope,Inter,sans-serif" font-weight="800" font-size="17" fill="#14110a">FP</text></svg>';
}
function chInitials(name){
  const w = String(name || '?').trim().split(/\s+/).slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase();
  return w || '?';
}
function chDayKey(ts){ const d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
function chDayLabel(ts){
  const k = chDayKey(ts), now = Date.now();
  if (k === chDayKey(now)) return t('chat.today');
  if (k === chDayKey(now - 864e5)) return t('chat.yesterday');
  try { return new Date(ts).toLocaleDateString(chLoc(), { day: 'numeric', month: 'long', year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }); } catch(e){ return ''; }
}
function chClock(ts){ try { return new Date(ts).toLocaleTimeString(chLoc(), { hour: '2-digit', minute: '2-digit', hour12: false }); } catch(e){ return ''; } }
function chDur(ms){ const s = Math.max(0, Math.round((ms || 0) / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function chUuid(){ try { if (typeof uuid === 'function') return uuid(); } catch(e){ /* rien */ } return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
const CH_EXT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', heif: 'image/heic', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };
const CH_MIME_EXT = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/aac': 'aac', 'audio/x-m4a': 'm4a', 'audio/wav': 'wav' };
function chFileMime(f){
  let m = String(f.type || '').toLowerCase().split(';')[0];
  if (!m || m === 'application/octet-stream'){ const e = String(f.name || '').toLowerCase().split('.').pop(); m = CH_EXT[e] || ''; }
  return m;
}
async function chUp(path, blob, mime){
  const r = await Guardian.query(() => sb.storage.from(CHAT_BUCKET).upload(path, blob, { contentType: mime, cacheControl: '3600', upsert: false }), { retries: 1, timeout: 90000 });
  return r.ok;
}

/* URL signées (1 h) : gardées en mémoire, renouvelées à l'approche de l'expiration ; au plus 4 demandes à la fois */
const chUrlCache = new Map();
let chUrlBusy = 0; const chUrlWait = [];
async function chSigned(path){
  if (!path) return '';
  const c = chUrlCache.get(path);
  if (c && c.exp > Date.now() + 60000) return c.url;
  if (c && c.p) return c.p;
  const run = async () => {
    const r = await Guardian.query(() => sb.storage.from(CHAT_BUCKET).createSignedUrl(path, 3600), { retries: 1 });
    const url = r.ok && r.data ? (r.data.signedUrl || r.data.signedURL || '') : '';
    if (url) chUrlCache.set(path, { url, exp: Date.now() + 3600000 }); else chUrlCache.delete(path);
    return url;
  };
  const p = new Promise(res => {
    const go = () => { chUrlBusy++; run().then(res, () => res('')).finally(() => { chUrlBusy--; const n = chUrlWait.shift(); if (n) n(); }); };
    if (chUrlBusy < 4) go(); else chUrlWait.push(go);
  });
  chUrlCache.set(path, { url: '', exp: 0, p });
  return p;
}

/* Photo : orientation EXIF respectée, 1600 px au plus, JPEG 0,82 (les GIF restent tels quels) */
async function chCompress(file){
  const mime = chFileMime(file);
  if (mime === 'image/gif') return { blob: file, mime, w: 0, h: 0 };
  let bmp = null;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch(e){
    try { bmp = await new Promise((res, rej) => { const im = new Image(), u = URL.createObjectURL(file); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('decode')); }; im.src = u; }); } catch(x){ bmp = null; }
  }
  if (!bmp){ return file.size <= CHAT_MAX && /^image\/(jpeg|png|webp|heic)$/.test(mime) ? { blob: file, mime, w: 0, h: 0 } : null; }
  const w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight, k = Math.min(1, 1600 / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(bmp, 0, 0, w, h);
  try { if (bmp.close) bmp.close(); } catch(e){ /* rien */ }
  const blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', 0.82));
  if (!blob) return null;
  return { blob, mime: 'image/jpeg', w, h };
}
function chVideoMeta(file){
  return new Promise(res => {
    try {
      const v = document.createElement('video'), u = URL.createObjectURL(file); v.preload = 'metadata'; v.muted = true;
      const done = d => { try { URL.revokeObjectURL(u); } catch(e){ /* rien */ } res(d); };
      v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? Math.round(v.duration * 1000) : 0);
      v.onerror = () => done(0); setTimeout(() => done(0), 4000); v.src = u;
    } catch(e){ res(0); }
  });
}

/* ============================================================
   Chat — état partagé, canal realtime unique, non lus
   ============================================================ */
const Chat = (() => {
  const S = { uid: '', admin: false, ch: null, online: false, count: 0, listeners: [], view: null, inbox: null, started: false, stopPoll: null,
    threadUser: '', threadInfo: null, threads: [], prefill: '' };
  const emit = () => S.listeners.slice().forEach(fn => { try { fn(S.count); } catch(e){ /* rien */ } });
  function unread(){ return S.count; }
  function onUnread(fn){ if (typeof fn !== 'function') return () => {}; S.listeners.push(fn); try { fn(S.count); } catch(e){ /* rien */ } return () => { S.listeners = S.listeners.filter(x => x !== fn); }; }

  async function refreshUnread(){
    if (!S.uid) return;
    try {
      if (S.admin){
        const r = await Guardian.query(() => sb.from('chat_threads').select('unread_admin'));
        if (r.ok) S.count = (r.data || []).reduce((a, x) => a + Guardian.norm.int(x.unread_admin), 0);
      } else {
        const r = await Guardian.query(() => sb.from('chat_threads').select('unread_user').eq('user_id', S.uid).maybeSingle());
        if (r.ok) S.count = r.data ? Guardian.norm.int(r.data.unread_user) : 0;
      }
      S.lastUnread = Date.now(); emit();
    } catch(e){ Guardian.note('chat:unread', e); }
  }
  const refreshUnreadSoon = Guardian.debounce(refreshUnread, 400);

  function setOnline(v){
    S.online = !!v;
    try { if (S.view && S.view.setOnline) S.view.setOnline(S.online); } catch(e){ /* rien */ }
  }
  function onInsert(row){
    try {
      const m = Guardian.norm.msg(row);
      if (!m.id) return;
      const mine = S.admin ? m.role === 'admin' : m.role === 'user';
      const v = S.view;
      if (v && v.thread === m.thread && v.alive()){
        v.add(m, { animate: true, live: true });
        if (!mine){ if (m.kind !== 'deposit' && m.kind !== 'credit'){ try { Sfx.play('msgRecv'); Fx.haptic('tap'); } catch(e){ /* rien */ } } v.markRead(); }
      } else if (!mine && (!S.admin || m.role === 'user')){
        S.count++; emit(); try { Sfx.play(m.kind === 'deposit' || m.kind === 'credit' ? 'credit' : 'msgRecv'); } catch(e){ /* rien */ }
      }
      if (S.inbox && S.inbox.refresh) S.inbox.refresh();
    } catch(e){ Guardian.note('chat:insert', e); }
  }
  function onUpdate(row){
    try { const m = Guardian.norm.msg(row); if (S.view && S.view.thread === m.thread && S.view.alive()) S.view.update(m); } catch(e){ /* rien */ }
  }
  function start(){
    try {
      const uid = chUid();
      if (!uid || typeof supabaseReady === 'undefined' || !supabaseReady) return;
      if (S.started && S.uid === uid) return;
      stop();
      S.uid = uid; S.admin = chIsAdmin(); S.started = true;
      const filt = S.admin ? {} : { filter: 'thread_user=eq.' + uid };
      try {
        S.ch = sb.channel('lxchat-' + uid)
          .on('postgres_changes', Object.assign({ event: 'INSERT', schema: 'public', table: 'chat_messages' }, filt), p => onInsert(p.new))
          .on('postgres_changes', Object.assign({ event: 'UPDATE', schema: 'public', table: 'chat_messages' }, filt), p => onUpdate(p.new))
          .on('postgres_changes', Object.assign({ event: '*', schema: 'public', table: 'chat_threads' }, S.admin ? {} : { filter: 'user_id=eq.' + uid }), () => { refreshUnreadSoon(); if (S.inbox && S.inbox.refresh) S.inbox.refresh(); })
          .subscribe(st => { setOnline(st === 'SUBSCRIBED'); });
      } catch(e){ setOnline(false); Guardian.note('chat:channel', e); }
      S.stopPoll = Guardian.every(async () => {
        if (S.online){ if (Date.now() - (S.lastUnread || 0) > 60000) await refreshUnread(); return; }      /* le realtime couvre tout : relecture lente seulement */
        if (S.view && S.view.sync) await S.view.sync();
        if (S.inbox && S.inbox.refresh) await S.inbox.refresh();
        await refreshUnread();
      }, 6000);
      Guardian.queue.handle('chat-text', async p => {
        const r = await Guardian.rpc('chat_send', { p_thread: p.thread || null, p_kind: 'text', p_body: p.body, p_media_path: null, p_media_mime: null, p_media_size: null, p_duration_ms: null }, { read: false, retries: 0 });
        if (r.ok){ try { if (S.view && S.view.sync) S.view.sync(); } catch(e){ /* rien */ } }
        return r.ok || (r.error && !r.error.retryable);
      });
      refreshUnread();
    } catch(e){ Guardian.note('chat:start', e); }
  }
  function stop(){
    try { if (S.ch){ sb.removeChannel(S.ch); } } catch(e){ /* rien */ }
    S.ch = null; if (S.stopPoll){ try { S.stopPoll(); } catch(e){ /* rien */ } S.stopPoll = null; }
    S.started = false; S.online = false; S.count = 0; S.uid = ''; S.view = null; S.inbox = null; S.threads = []; emit();
  }
  function openSupport(prefill){ S.prefill = prefill ? String(prefill) : ''; start(); R.go('chat', { force: true }); }
  function openThread(userId, info){
    if (!userId) return;
    S.threadUser = String(userId);
    S.threadInfo = info || (S.threads || []).find(x => x.user_id === userId) || null;
    start(); R.go('admin-chat-thread', { force: true });
  }
  return { unread, start, stop, openSupport, openThread, onUnread, _S: S, _refreshUnread: refreshUnread, _onInsert: onInsert };
})();

/* ============================================================
   Éléments communs : visionneuse, lecteur vocal, feuilles
   ============================================================ */
let chViewerEl = null;
function chCloseViewer(){ if (chViewerEl){ try { if (chViewerEl.__key) document.removeEventListener('keydown', chViewerEl.__key); chViewerEl.remove(); } catch(e){ /* rien */ } chViewerEl = null; } }
function chOpenViewer(url){
  if (!url) return;
  chCloseViewer();
  const el = document.createElement('div'); el.className = 'chat-viewer'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.innerHTML = '<button type="button" class="chat-viewer-x" aria-label="' + chEsc(t('chat.close')) + '">' + chIc('close', 22) + '</button><img alt="" draggable="false">';
  const img = el.querySelector('img'); img.src = url;
  let sc = 1, tx = 0, ty = 0; const pts = new Map(); let d0 = 0, s0 = 1, drag = null;
  const apply = () => { img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')'; el.classList.toggle('is-zoom', sc > 1.02); };
  const setScale = (v) => { sc = Math.min(5, Math.max(1, v)); if (sc === 1){ tx = 0; ty = 0; } apply(); };
  el.addEventListener('click', e => { if (e.target === el || e.target.closest('.chat-viewer-x')) chCloseViewer(); });
  img.addEventListener('dblclick', () => setScale(sc > 1.1 ? 1 : 2.5));
  el.addEventListener('wheel', e => { e.preventDefault(); setScale(sc * (e.deltaY < 0 ? 1.15 : 0.87)); }, { passive: false });
  el.addEventListener('pointerdown', e => { if (e.target !== img) return; pts.set(e.pointerId, e); try { img.setPointerCapture(e.pointerId); } catch(x){ /* rien */ } if (pts.size === 2){ const a = [...pts.values()]; d0 = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY); s0 = sc; } else drag = { x: e.clientX - tx, y: e.clientY - ty }; });
  el.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
    if (pts.size === 2){ const a = [...pts.values()]; const d = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY); if (d0) setScale(s0 * d / d0); }
    else if (drag && sc > 1){ tx = e.clientX - drag.x; ty = e.clientY - drag.y; apply(); }
  });
  const up = e => { pts.delete(e.pointerId); drag = null; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  const key = e => { if (e.key === 'Escape') chCloseViewer(); };
  el.__key = key; document.addEventListener('keydown', key);
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('is-open'));
  chViewerEl = el; try { Sfx.play('open'); } catch(e){ /* rien */ }
}

/* un seul son à la fois */
const chAudio = { el: null, box: null, speed: 1 };
function chWaveBars(id, n){
  let h = 2166136261; const s = String(id || 'x');
  for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let out = ''; for (let i = 0; i < n; i++){ h = Math.imul(h ^ (h >>> 13), 1274126177); const v = 22 + ((h >>> 0) % 70); out += '<i style="height:' + v + '%"></i>'; }
  return out;
}
function chPlayerHtml(m){
  return '<div class="chat-voice" data-id="' + chEsc(m.id) + '" data-path="' + chEsc(m.path || '') + '" data-dur="' + (m.dur || 0) + '">' +
    '<button type="button" class="cv-play" aria-label="' + chEsc(t('chat.play')) + '">' + chIc('play', 20) + '</button>' +
    '<div class="cv-wave" role="slider" aria-label="' + chEsc(t('chat.audioMsg')) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">' + chWaveBars(m.id, 30) + '</div>' +
    '<span class="cv-time" dir="ltr">' + chDur(m.dur) + '</span>' +
    '<button type="button" class="cv-speed" aria-label="' + chEsc(t('chat.speed')) + '">1x</button></div>';
}
function chVoiceStop(){
  if (chAudio.el){ try { chAudio.el.pause(); } catch(e){ /* rien */ } }
  if (chAudio.box){ chAudio.box.classList.remove('is-playing', 'is-loading'); const b = chAudio.box.querySelector('.cv-play'); if (b){ b.innerHTML = chIc('play', 20); b.setAttribute('aria-label', t('chat.play')); } }
  chAudio.el = null; chAudio.box = null;
}
async function chVoiceToggle(box, localUrl){
  if (!box) return;
  if (chAudio.box === box && chAudio.el){ if (chAudio.el.paused){ chAudio.el.play().catch(() => {}); box.classList.add('is-playing'); box.querySelector('.cv-play').innerHTML = chIc('pause', 20); } else { chAudio.el.pause(); box.classList.remove('is-playing'); box.querySelector('.cv-play').innerHTML = chIc('play', 20); } return; }
  chVoiceStop();
  box.classList.add('is-loading');
  let url = localUrl || box.__url || '';
  if (!url) url = await chSigned(box.getAttribute('data-path'));
  if (!url){ box.classList.remove('is-loading'); try { toast(t('chat.loadErr'), 'error'); } catch(e){ /* rien */ } return; }
  box.__url = url;
  const au = new Audio(); au.preload = 'auto'; au.src = url; au.playbackRate = chAudio.speed;
  const bars = [...box.querySelectorAll('.cv-wave i')], tm = box.querySelector('.cv-time'), wave = box.querySelector('.cv-wave');
  const total = () => (Number.isFinite(au.duration) && au.duration > 0 ? au.duration : (Number(box.getAttribute('data-dur')) || 0) / 1000);
  au.ontimeupdate = () => { const d = total(); const r = d ? Math.min(1, au.currentTime / d) : 0; const k = Math.round(r * bars.length); bars.forEach((b, i) => b.classList.toggle('on', i < k)); wave.setAttribute('aria-valuenow', String(Math.round(r * 100))); tm.textContent = chDur(au.currentTime * 1000); };
  au.onended = () => { bars.forEach(b => b.classList.remove('on')); tm.textContent = chDur(total() * 1000); chVoiceStop(); };
  au.onerror = () => { chVoiceStop(); try { toast(t('chat.loadErr'), 'error'); } catch(e){ /* rien */ } };
  chAudio.el = au; chAudio.box = box;
  try { await au.play(); box.classList.remove('is-loading'); box.classList.add('is-playing'); const b = box.querySelector('.cv-play'); b.innerHTML = chIc('pause', 20); b.setAttribute('aria-label', t('chat.pause')); }
  catch(e){ box.classList.remove('is-loading'); chVoiceStop(); }
}

/* feuille modale légère (au-dessus de tout, liée à l'écran courant) */
function chSheet(html, wire){
  const close = R.overlay.open('<div class="chat-sheet" dir="' + (LANG === 'ar' ? 'rtl' : 'ltr') + '">' + html + '</div>', { kind: 'modal' });
  setTimeout(() => { const root = document.querySelector('.ov.is-open .chat-sheet, .ov .chat-sheet'); if (root) { try { wire(root, close); } catch(e){ console.error(e); } } }, 120);
  return close;
}

/* ============================================================
   Conversation : vue partagée (chat utilisateur et fil administrateur)
   ============================================================ */
function chShell(o){
  const admin = !!o.admin, info = o.info || {};
  const name = admin ? (info.full_name || (info.yor_id ? dispId(info.yor_id) : '—')) : t('chat.brand');
  const sub = admin ? [info.yor_id ? dispId(info.yor_id) : '', info.phone || ''].filter(Boolean).join(' · ') : '';
  const av = admin ? '<span class="chat-av chat-av-i">' + chEsc(chInitials(info.full_name || info.yor_id)) + '</span>' : '<span class="chat-av">' + chLogo(40) + '</span>';
  let h = '<div class="chat-wrap ' + (admin ? 'is-admin' : 'is-user') + '">' +
    '<header class="chat-head"><button type="button" class="chat-hb" data-action="back" aria-label="' + chEsc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 22) + '</span></button>' + av +
    '<div class="chat-hid"><b>' + chEsc(name) + '</b>' + (admin ? '<small class="chat-sub" dir="ltr">' + chEsc(sub) + '</small>' : '<small class="chat-st" data-st="connecting"><i></i><span>' + chEsc(t('chat.connecting')) + '</span></small>') + '</div>' +
    (admin ? (info.yor_id ? '<button type="button" class="chat-hb" data-ch="copy" data-copy="' + chEsc(dispId(info.yor_id)) + '" aria-label="' + chEsc(t('action.copy')) + '">' + icon('copy', 20) + '</button>' : '') :
      '<button type="button" class="chat-hb chat-yb" data-ch="yaser" aria-label="' + chEsc(t('chat.yaser')) + '">' + yaserSvg(36, 'mini') + '</button>') + '</header>';
  if (admin) h += '<div class="chat-acts" role="toolbar"><button type="button" class="chat-act" data-ch="deposit">' + icon('banknote', 18) + '<span>' + chEsc(t('chat.act.dep')) + '</span></button>' +
    '<button type="button" class="chat-act" data-ch="credit">' + icon('wallet', 18) + '<span>' + chEsc(t('chat.act.credit')) + '</span></button>' +
    '<button type="button" class="chat-act" data-ch="quick">' + chIc('bolt', 18) + '<span>' + chEsc(t('chat.act.quick')) + '</span></button></div>';
  else if (!Guardian.store.get('chat_help_hidden_' + chUid(), false)) h += '<div class="chat-help"><i class="chat-help-ic">' + icon('banknote', 20) + '</i><div class="chat-help-b"><b>' + chEsc(t('chat.helpT')) + '</b><span>' + chEsc(t('chat.helpB')) + '</span>' +
    '<button type="button" class="chat-help-go" data-ch="askdep">' + chEsc(t('chat.askDep')) + '</button></div><button type="button" class="chat-help-x" data-ch="hidehelp" aria-label="' + chEsc(t('chat.close')) + '">' + icon('close', 16) + '</button></div>';
  h += '<div class="chat-list" role="log" aria-live="polite"><div class="chat-loading"><i></i><i></i><i></i></div></div>' +
    '<button type="button" class="chat-down" data-ch="down" hidden aria-label="' + chEsc(t('chat.down')) + '">' + chIc('down', 20) + '<span class="chat-badge" hidden>0</span></button>';
  if (!admin) h += '<button type="button" class="chat-yfab" data-ch="yaser" aria-label="' + chEsc(t('chat.yaser')) + '">' + yaserSvg(44, 'fab') + '<span>' + chEsc(t('chat.yaser')) + '</span></button>';
  h += '<footer class="chat-comp"><div class="chat-menu" hidden>' +
    '<button type="button" data-ch="pick-photo" style="--i:2">' + chIc('image', 20) + '<span>' + chEsc(t('chat.photo')) + '</span></button>' +
    '<button type="button" data-ch="pick-camera" style="--i:1">' + chIc('camera', 20) + '<span>' + chEsc(t('chat.camera')) + '</span></button>' +
    '<button type="button" data-ch="pick-video" style="--i:0">' + chIc('video', 20) + '<span>' + chEsc(t('chat.video')) + '</span></button>' +
    '<button type="button" data-ch="pick-pdf" style="--i:3">' + chIc('list', 20) + '<span>' + chEsc(t('chat.pdf')) + '</span></button></div>' +
    '<div class="chat-row"><button type="button" class="chat-ib" data-ch="attach" aria-label="' + chEsc(t('chat.attach')) + '" aria-expanded="false">' + chIc('clip', 22) + '</button>' +
    /* administrateur : proposer un brouillon de réponse. Le brouillon n'est jamais envoyé tout seul. */
    (admin ? '<button type="button" class="chat-ib chat-ai-b" data-ch="ai" aria-label="' + chEsc(t('ai.draft')) + '" title="' + chEsc(t('ai.draft')) + '">' + icon('sparkle', 22) + '</button>' : '') +
    '<div class="chat-tw"><textarea rows="1" dir="auto" maxlength="2000" placeholder="' + chEsc(t('chat.ph')) + '" aria-label="' + chEsc(t('chat.ph')) + '" enterkeyhint="send" autocomplete="off"></textarea></div>' +
    '<button type="button" class="chat-send" data-ch="send" aria-label="' + chEsc(t('chat.send')) + '">' + chIc('up', 22) + '</button>' +
    '<button type="button" class="chat-mic" data-ch="mic" aria-label="' + chEsc(t('chat.mic')) + '">' + chIc('mic', 22) + '</button></div>' +
    '<div class="chat-rec" hidden><button type="button" class="chat-rec-x" data-ch="rec-cancel" aria-label="' + chEsc(t('chat.recCancel')) + '">' + icon('trash', 20) + '</button>' +
    '<span class="chat-rec-dot"></span><b class="chat-rec-time" dir="ltr">0:00</b><div class="chat-rec-bars" aria-hidden="true">' + '<i></i>'.repeat(26) + '</div>' +
    '<span class="chat-rec-hint"><span class="dir-flip" style="display:inline-flex">' + icon('back', 14) + '</span>' + chEsc(t('chat.slide')) + '</span>' +
    '<button type="button" class="chat-rec-send" data-ch="rec-send" aria-label="' + chEsc(t('chat.send')) + '">' + chIc('up', 22) + '</button></div></footer>' +
    '<input type="file" class="chat-file" data-f="photo" accept="image/*" hidden><input type="file" class="chat-file" data-f="camera" accept="image/*" capture="environment" hidden><input type="file" class="chat-file" data-f="video" accept="video/mp4,video/quicktime,video/webm,video/*" hidden><input type="file" class="chat-file" data-f="pdf" accept="application/pdf,.pdf" hidden></div>';
  return h;
}

function chThreadView(root, o){
  const V = { root, thread: o.thread, admin: !!o.admin, items: [], ids: new Set(), dead: false, previews: new Map(), unseen: 0, loaded: false, sending: 0 };
  const wrap = root.querySelector('.chat-wrap'), list = root.querySelector('.chat-list'), ta = root.querySelector('.chat-comp textarea');
  const down = root.querySelector('.chat-down'), badge = down.querySelector('.chat-badge'), comp = root.querySelector('.chat-comp');
  const mine = m => (V.admin ? m.role === 'admin' : m.role === 'user');
  const isCard = m => m.kind === 'deposit' || m.kind === 'credit' || m.kind === 'system' || m.role === 'system';
  V.alive = () => !V.dead && root.isConnected;
  const atBottom = () => list.scrollHeight - list.scrollTop - list.clientHeight < 90;
  const toBottom = smooth => { try { list.scrollTo({ top: list.scrollHeight, behavior: smooth && !Fx.reduced() ? 'smooth' : 'auto' }); } catch(e){ list.scrollTop = list.scrollHeight; } };
  const setDown = () => { const show = !atBottom(); down.hidden = !show; if (!show){ V.unseen = 0; } badge.hidden = !V.unseen; badge.textContent = String(V.unseen); };

  /* ---------- gabarits ---------- */
  const tick = m => {
    if (!mine(m)) return '';
    if (m.local){ return '<span class="chat-tk" data-s="' + chEsc(m.status) + '">' + (m.status === 'failed' ? icon('warn', 14) : icon('clock', 14)) + '</span>'; }
    return '<span class="chat-tk' + (m.read ? ' is-read' : '') + '" aria-label="' + chEsc(m.read ? t('chat.aRead') : t('chat.aSent')) + '">' + (m.read ? chIc('dcheck', 16) : icon('check', 14)) + '</span>';
  };
  const stat = m => {
    if (!m.local) return '';
    if (m.status === 'failed') return '<button type="button" class="chat-retry" data-id="' + chEsc(m.id) + '">' + chIc('retry', 14) + '<span>' + chEsc(t('chat.failed') + ' · ' + t('chat.retry')) + '</span></button>';
    if (m.status === 'queued') return '<span class="chat-qd">' + chEsc(t('chat.queued')) + '</span>';
    return '';
  };
  const mediaBody = m => {
    const prev = V.previews.get(m.id) || m.preview || '';
    if (m.kind === 'image') return '<button type="button" class="chat-img" data-path="' + chEsc(m.path || '') + '" data-prev="' + chEsc(prev) + '" aria-label="' + chEsc(t('chat.photoMsg')) + '"><span class="chat-ph"></span><img alt="" decoding="async"></button>';
    if (m.kind === 'video') return '<div class="chat-vid" data-path="' + chEsc(m.path || '') + '" data-prev="' + chEsc(prev) + '"><span class="chat-ph"></span><video preload="metadata" playsinline controls></video>' + (m.dur ? '<em class="chat-vd" dir="ltr">' + chDur(m.dur) + '</em>' : '') + '</div>';
    if (m.kind === 'audio') return chPlayerHtml(m);
    if (m.kind === 'file') return '<button type="button" class="chat-file-card" data-ch="open-file" data-path="' + chEsc(m.path || '') + '" aria-label="' + chEsc(t('chat.pdf')) + '"><i>' + chIc('list', 22) + '</i><span><b dir="auto">' + chEsc(m.body || 'PDF') + '</b><small>PDF' + (m.size ? ' · ' + Math.max(1, Math.round(m.size / 1024)) + ' KB' : '') + '</small></span></button>';
    return '';
  };
  const prog = m => (m.local && m.status === 'uploading' ? '<div class="chat-up" style="--p:' + (m.progress || 0) + '%"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15"/><circle class="chat-up-c" cx="18" cy="18" r="15"/></svg></div>' : '');
  const cardHtml = m => {
    if (m.kind === 'deposit' || m.kind === 'credit'){
      const mt = m.meta || {}, amt = Guardian.norm.num(mt.amount), cur = Guardian.norm.str(mt.currency, 6) || 'OMR';
      return '<div class="chat-card k-' + m.kind + '"><i class="chat-card-ic">' + icon(m.kind === 'deposit' ? 'banknote' : 'wallet', 22) + '</i><div class="chat-card-b"><small>' + chEsc(t(m.kind === 'deposit' ? 'chat.deposit' : 'chat.credit')) + '</small>' +
        '<b class="chat-card-amt" dir="ltr"><span class="amt-n" data-amt="' + amt + '">' + Money.num(amt, 3) + '</span> <span class="amt-c">' + chEsc(cur) + '</span></b>' +
        (mt.reference ? '<span class="chat-card-ref" dir="ltr">' + chEsc(t('chat.ref') + ' ' + dispId(mt.reference)) + '</span>' : '') + '</div><time>' + chEsc(chClock(m.at)) + '</time></div>';
    }
    return '<div class="chat-sysp">' + chEsc(m.body) + '</div>';
  };
  const msgHtml = (m, g) => {
    const cls = 'chat-m ' + (isCard(m) ? 'sys k-' + (m.kind || 'system') : (mine(m) ? 'mine' : 'theirs') + ' k-' + m.kind) + (g.first ? ' g-first' : '') + (g.last ? ' g-last' : '') + (m.local ? ' is-local' : '');
    if (isCard(m)) return '<div class="' + cls + '" data-id="' + chEsc(m.id) + '" data-at="' + m.at + '">' + cardHtml(m) + '</div>';
    const cap = m.kind !== 'text' && m.body ? '<p class="chat-t" dir="auto">' + chEsc(m.body) + '</p>' : '';
    const txt = m.kind === 'text' ? '<p class="chat-t" dir="auto">' + chEsc(m.body) + '</p>' : '';
    return '<div class="' + cls + '" data-id="' + chEsc(m.id) + '" data-at="' + m.at + '"><div class="chat-b">' + mediaBody(m) + prog(m) + txt + cap +
      '<span class="chat-meta"><time>' + chEsc(chClock(m.at)) + '</time>' + tick(m) + '</span></div>' + stat(m) + '</div>';
  };
  const sepHtml = ts => '<div class="chat-day" data-day="' + chDayKey(ts) + '"><span>' + chEsc(chDayLabel(ts)) + '</span></div>';
  const grp = (a, b) => !!a && !!b && !isCard(a) && !isCard(b) && mine(a) === mine(b) && chDayKey(a.at) === chDayKey(b.at) && Math.abs(b.at - a.at) < 300000;

  /* ---------- médias asynchrones ---------- */
  function hydrate(scope){
    scope.querySelectorAll('.chat-img:not([data-h])').forEach(b => {
      b.setAttribute('data-h', '1'); const img = b.querySelector('img'), prev = b.getAttribute('data-prev'), path = b.getAttribute('data-path');
      const show = u => { img.onload = () => b.classList.add('is-ready'); img.onerror = () => b.classList.add('is-err'); img.src = u; };
      if (prev) show(prev); else if (path) chSigned(path).then(u => { if (u && V.alive()) show(u); else b.classList.add('is-err'); });
    });
    scope.querySelectorAll('.chat-vid:not([data-h])').forEach(b => {
      b.setAttribute('data-h', '1'); const v = b.querySelector('video'), prev = b.getAttribute('data-prev'), path = b.getAttribute('data-path');
      const show = u => { v.onloadeddata = () => b.classList.add('is-ready'); v.onerror = () => b.classList.add('is-err'); v.src = u + (u.indexOf('blob:') === 0 ? '' : '#t=0.1'); };
      if (prev) show(prev); else if (path) chSigned(path).then(u => { if (u && V.alive()) show(u); else b.classList.add('is-err'); });
    });
    scope.querySelectorAll('.chat-card .amt-n').forEach(n => { n.setAttribute('data-h', '1'); });
  }
  function animateCard(el){
    const n = el.querySelector('.amt-n'); if (!n) return;
    const amt = Number(n.getAttribute('data-amt')) || 0; Fx.countUp(n, amt, { dec: 3, ms: 1100 });
    setTimeout(() => { try { Fx.confetti(el.querySelector('.chat-card-ic') || el, { n: 90, power: 8 }); Fx.pulse(el.querySelector('.chat-card-ic')); } catch(e){ /* rien */ } }, 250);
  }

  /* ---------- liste ---------- */
  function renderAll(){
    const sorted = V.items.slice().sort((a, b) => a.at - b.at);
    V.items = sorted; let h = '', prev = null;
    sorted.forEach((m, i) => { if (!prev || chDayKey(prev.at) !== chDayKey(m.at)) h += sepHtml(m.at); h += msgHtml(m, { first: !grp(prev, m), last: !grp(m, sorted[i + 1]) }); prev = m; });
    list.innerHTML = h || '<div class="chat-empty">' + chLogo(56) + '<p>' + chEsc(t('chat.empty')) + '</p></div>';
    hydrate(list);
  }
  V.add = (m, op) => {
    op = op || {};
    if (V.dead) return;
    if (V.ids.has(m.id)){ V.update(m); return; }
    V.ids.add(m.id);
    const last = V.items[V.items.length - 1];
    V.items.push(m);
    const empty = list.querySelector('.chat-empty, .chat-loading'); if (empty) empty.remove();
    if (last && m.at < last.at){ renderAll(); return; }
    const stick = atBottom() || mine(m) || !V.loaded;
    let h = ''; if (!last || chDayKey(last.at) !== chDayKey(m.at)) h += sepHtml(m.at);
    const g = grp(last, m);
    if (last && g){ const pe = list.querySelector('.chat-m[data-id="' + CSS.escape(last.id) + '"]'); if (pe) pe.classList.remove('g-last'); }
    h += msgHtml(m, { first: !g, last: true });
    const tpl = document.createElement('div'); tpl.innerHTML = h;
    let node = null; [...tpl.children].forEach(c => { if (op.animate && !c.classList.contains('chat-day')) c.classList.add('chat-in'); list.appendChild(c); node = c; });
    hydrate(list);
    if (op.animate && (m.kind === 'deposit' || m.kind === 'credit') && node){ try { Sfx.play('credit'); } catch(e){ /* rien */ } animateCard(node); }
    if (stick) toBottom(op.animate); else { V.unseen++; setDown(); }
  };
  V.update = m => {
    const i = V.items.findIndex(x => x.id === m.id); if (i < 0) return;
    const el = list.querySelector('.chat-m[data-id="' + CSS.escape(m.id) + '"]'); const old = V.items[i];
    V.items[i] = Object.assign({}, old, m);
    if (!el) return;
    const cur = V.items[i], tk = el.querySelector('.chat-tk');
    if (tk && !cur.local){ const t2 = document.createElement('div'); t2.innerHTML = tick(cur); if (t2.firstChild) tk.replaceWith(t2.firstChild); }
    if (cur.local){
      el.classList.toggle('is-failed', cur.status === 'failed');
      const meta = el.querySelector('.chat-tk'); if (meta){ const t2 = document.createElement('div'); t2.innerHTML = tick(cur); if (t2.firstChild) meta.replaceWith(t2.firstChild); }
      let st = el.querySelector('.chat-retry, .chat-qd'); const nh = stat(cur);
      if (st) st.remove(); if (nh){ const t3 = document.createElement('div'); t3.innerHTML = nh; el.appendChild(t3.firstChild); }
      const up = el.querySelector('.chat-up'); if (up){ if (cur.status === 'uploading') up.style.setProperty('--p', (cur.progress || 0) + '%'); else up.remove(); }
    }
  };
  /* un message local devient le message du serveur (sans clignoter) */
  V.resolve = (tmpId, real) => {
    const i = V.items.findIndex(x => x.id === tmpId); const el = list.querySelector('.chat-m[data-id="' + CSS.escape(tmpId) + '"]');
    if (V.ids.has(real.id)){ if (i >= 0) V.items.splice(i, 1); V.ids.delete(tmpId); if (el) el.remove(); return; }
    V.ids.delete(tmpId); V.ids.add(real.id);
    const pv = V.previews.get(tmpId); if (pv){ V.previews.set(real.id, pv); V.previews.delete(tmpId); }
    if (i >= 0) V.items[i] = real; else V.items.push(real);
    if (el){ const keep = el.className.replace(/\bis-local\b|\bis-failed\b|\bchat-in\b/g, '').trim(); const div = document.createElement('div'); div.innerHTML = msgHtml(real, { first: el.classList.contains('g-first'), last: el.classList.contains('g-last') });
      const ne = div.firstChild; el.replaceWith(ne); ne.className = keep + ' chat-sent'; const mt = ne.querySelector('.chat-voice'); if (mt && V.localAudio && V.localAudio.get(tmpId)) mt.__url = V.localAudio.get(tmpId); hydrate(list); }
  };
  V.setOnline = on => {
    const st = root.querySelector('.chat-st'); if (!st) return;
    st.setAttribute('data-st', on ? 'on' : (V.loaded ? 'off' : 'connecting'));
    st.querySelector('span').textContent = t(on ? 'chat.online' : (V.loaded ? 'chat.offline' : 'chat.connecting'));
  };
  V.markRead = Guardian.debounce(async () => {
    if (V.dead) return;
    const r = await Guardian.rpc('chat_mark_read', { p_thread: V.admin ? V.thread : null }, { read: false, retries: 1 });
    if (r.ok){ Chat._refreshUnread(); }
  }, 500);
  V.load = async () => {
    const r = await Guardian.query(() => sb.from('chat_messages').select('*').eq('thread_user', V.thread).order('created_at', { ascending: false }).limit(300));
    if (V.dead) return;
    if (r.ok && Array.isArray(r.data)) r.data = r.data.slice().reverse();      /* les 300 plus récents, remis dans l'ordre */
    if (!r.ok){ list.innerHTML = '<div class="chat-empty"><p>' + chEsc(t('chat.loadErr')) + '</p><button type="button" class="chat-retry-all" data-ch="reload">' + chIc('retry', 16) + '<span>' + chEsc(t('chat.retry')) + '</span></button></div>'; return; }
    const keep = V.items.filter(x => x.local);
    V.items = []; V.ids = new Set();
    (r.data || []).map(Guardian.norm.msg).forEach(m => { V.items.push(m); V.ids.add(m.id); });
    keep.forEach(x => { V.items.push(x); V.ids.add(x.id); });
    renderAll(); V.loaded = true; V.setOnline(Chat._S.online); toBottom(false); setDown(); V.markRead();
    const hp = root.querySelector('.chat-help'); if (hp && V.items.length > 2) hp.classList.add('is-compact');
  };
  V.sync = async () => {
    if (V.dead || !V.loaded) return;
    const last = V.items.filter(x => !x.local).slice(-1)[0];
    const r = await Guardian.query(() => { let q = sb.from('chat_messages').select('*').eq('thread_user', V.thread).order('created_at', { ascending: true }).limit(100); if (last) q = q.gt('created_at', new Date(last.at - 2000).toISOString()); return q; }, { retries: 0 });
    if (!r.ok || V.dead) return;
    let fresh = false; (r.data || []).map(Guardian.norm.msg).forEach(m => { if (!V.ids.has(m.id)){ V.add(m, { animate: true }); if (!mine(m)){ fresh = true; } } else V.update(m); });
    if (fresh){ try { Sfx.play('msgRecv'); } catch(e){ /* rien */ } V.markRead(); }
  };

  /* ---------- envoi ---------- */
  const side = () => (V.admin ? 'admin' : 'user');
  const rpcSend = (kind, body, path, mime, size, dur) => Guardian.rpc('chat_send', { p_thread: V.admin ? V.thread : null, p_kind: kind, p_body: body || '', p_media_path: path || null, p_media_mime: mime || null, p_media_size: size || null, p_duration_ms: dur || null }, { read: false, retries: 0 });
  async function deliverText(tmp){
    tmp.status = 'sending'; V.update(tmp);
    const r = await rpcSend('text', tmp.body);
    if (V.dead && !(r.ok)) return;
    if (r.ok && r.data && r.data.id){ V.resolve(tmp.id, Object.assign({}, tmp, { id: String(r.data.id), local: false, status: '', at: tmp.at })); }
    else if (r.error && r.error.retryable){ Guardian.queue.add('chat-text', { thread: V.admin ? V.thread : null, body: tmp.body }); tmp.status = 'queued'; V.update(tmp); }
    else { tmp.status = 'failed'; V.update(tmp); try { Sfx.play('error'); toast(t(r.error ? r.error.key : 'errors.UNKNOWN_ERROR'), 'error'); } catch(e){ /* rien */ } }
  }
  V.sendText = async body => {
    body = String(body || '').trim().slice(0, 2000); if (!body) return;
    const tmp = { id: 'tmp-' + chUuid(), local: true, status: 'sending', role: side(), kind: 'text', body, at: Date.now(), thread: V.thread, read: false, meta: {} };
    V.add(tmp, { animate: true }); try { Sfx.play('msgSend'); Fx.haptic('tap'); } catch(e){ /* rien */ }
    await deliverText(tmp);
  };
  async function deliverMedia(tmp, blob, mime){
    tmp.status = 'uploading'; tmp.progress = 4; V.update(tmp);
    const est = Math.max(2500, blob.size / 350); const t0 = Date.now();
    const iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / est); tmp.progress = Math.round(4 + 86 * (1 - Math.pow(1 - k, 2))); V.update(tmp); }, 160);
    const ext = CH_MIME_EXT[mime] || 'bin', name = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext, path = V.thread + '/' + name;
    let ok = await chUp(path, blob, mime), r = null;
    if (ok) r = await rpcSend(tmp.kind, tmp.body, path, mime, blob.size, tmp.dur);
    clearInterval(iv);
    if (ok && r && r.ok && r.data && r.data.id){
      tmp.progress = 100; V.update(tmp);
      V.resolve(tmp.id, Object.assign({}, tmp, { id: String(r.data.id), local: false, status: '', path, mime, size: blob.size }));
    } else {
      tmp.status = 'failed'; tmp.retryFn = () => deliverMedia(tmp, blob, mime); V.update(tmp);
      try { Sfx.play('error'); toast(t('chat.upErr'), 'error'); } catch(e){ /* rien */ }
    }
  }
  V.sendMedia = async o2 => {
    const tmp = { id: 'tmp-' + chUuid(), local: true, status: 'uploading', progress: 0, role: side(), kind: o2.kind, body: String(o2.caption || '').trim().slice(0, 500), at: Date.now(), thread: V.thread, read: false, dur: o2.dur || 0, meta: {}, mime: o2.mime };
    let pv = ''; try { pv = URL.createObjectURL(o2.blob); } catch(e){ /* rien */ }
    if (pv){ V.previews.set(tmp.id, pv); if (o2.kind === 'audio'){ (V.localAudio || (V.localAudio = new Map())).set(tmp.id, pv); } }
    tmp.preview = o2.kind === 'audio' ? '' : pv;
    V.add(tmp, { animate: true }); try { Sfx.play('msgSend'); Fx.haptic('tap'); } catch(e){ /* rien */ }
    await deliverMedia(tmp, o2.blob, o2.mime);
  };
  V.retry = id => {
    const m = V.items.find(x => x.id === id); if (!m || !m.local || m.status !== 'failed') return;
    try { Sfx.play('tap'); } catch(e){ /* rien */ }
    if (m.retryFn) m.retryFn(); else if (m.kind === 'text') deliverText(m);
  };

  /* ---------- composer ---------- */
  const syncH = () => { try { wrap.style.setProperty('--chat-comp-h', comp.offsetHeight + 'px'); } catch(e){ /* rien */ } };
  const autosize = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 132) + 'px'; syncH(); };
  syncH(); setTimeout(syncH, 300);
  const refreshMode = () => { const on = !!ta.value.trim(); if (wrap.classList.contains('has-text') !== on){ wrap.classList.toggle('has-text', on); } };
  ta.addEventListener('input', () => { autosize(); refreshMode(); });
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); doSend(); } });
  function doSend(){ const v = ta.value; if (!v.trim()) return; ta.value = ''; autosize(); refreshMode(); V.sendText(v); ta.focus({ preventScroll: true }); }
  V.insert = text => { ta.value = (ta.value ? ta.value + ' ' : '') + text; autosize(); refreshMode(); try { ta.focus({ preventScroll: true }); } catch(e){ /* rien */ } const i = ta.value.indexOf('___'); if (i >= 0){ try { ta.setSelectionRange(i, i + 3); } catch(e){ /* rien */ } } };
  V.focus = () => { try { ta.focus({ preventScroll: true }); } catch(e){ /* rien */ } };

  /* ---------- assistant : brouillon de réponse (administrateur) ----------
     Le texte est DÉPOSÉ dans la zone de saisie, jamais envoyé : l'administrateur relit, corrige, puis envoie. */
  async function aiDraft(b){
    if (!V.admin || typeof AI19 === 'undefined' || !AI19.available()) return;
    if (V.aiBusy) return; V.aiBusy = true;
    try { UIKit.loading(b, true); } catch(e){ /* rien */ }
    toast(t('ai.drafting'));
    const r = await AI19.call({ mode: 'reply', user_id: V.thread });
    V.aiBusy = false;
    try { UIKit.loading(b, false); } catch(e){ /* rien */ }
    if (!V.alive()) return;
    if (!r.ok){ toast(AI19.errText(r.code), 'error'); try { Sfx.play('error'); } catch(e){ /* rien */ } return; }
    ta.value = r.text; autosize(); refreshMode();
    try { ta.focus({ preventScroll: true }); } catch(e){ /* rien */ }
    toast(t('ai.draftIn'), 'success');
    try { Sfx.play('pop'); } catch(e){ /* rien */ }
  }

  const menu = root.querySelector('.chat-menu'), attachBtn = root.querySelector('[data-ch="attach"]');
  const toggleMenu = on => { const open = on == null ? menu.hidden : on; menu.hidden = !open; attachBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); attachBtn.classList.toggle('is-open', open); if (open){ try { Sfx.play('pop'); } catch(e){ /* rien */ } } };
  V.closeMenu = () => toggleMenu(false);

  /* aperçu d'un média avant envoi (légende) */
  function previewSheet(item){
    const pv = document.createElement('div'); pv.className = 'chat-prev';
    const isImg = item.kind === 'image', url = URL.createObjectURL(item.blob);
    pv.innerHTML = '<div class="chat-prev-top"><button type="button" class="chat-hb" data-p="x" aria-label="' + chEsc(t('chat.cancel')) + '">' + icon('close', 22) + '</button><span>' + chEsc(t(isImg ? 'chat.photoMsg' : 'chat.videoMsg')) + '</span></div>' +
      '<div class="chat-prev-m">' + (isImg ? '<img alt="">' : '<video controls playsinline></video>') + '</div>' +
      '<div class="chat-prev-bar"><input type="text" dir="auto" maxlength="500" placeholder="' + chEsc(t('chat.caption')) + '" aria-label="' + chEsc(t('chat.caption')) + '"><button type="button" class="chat-send is-on" data-p="go" aria-label="' + chEsc(t('chat.send')) + '">' + chIc('up', 22) + '</button></div>';
    pv.querySelector(isImg ? 'img' : 'video').src = url;
    const close = () => { try { URL.revokeObjectURL(url); } catch(e){ /* rien */ } pv.remove(); };
    pv.addEventListener('click', e => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      if (b.getAttribute('data-p') === 'x'){ close(); try { Sfx.play('tap'); } catch(x){ /* rien */ } }
      else { const cap = pv.querySelector('input').value; close(); V.sendMedia({ kind: item.kind, blob: item.blob, mime: item.mime, dur: item.dur, caption: cap }); }
    });
    pv.querySelector('input').addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); pv.querySelector('[data-p="go"]').click(); } });
    wrap.appendChild(pv); requestAnimationFrame(() => pv.classList.add('is-open')); try { Sfx.play('open'); } catch(e){ /* rien */ }
    V.closePrev = close;
  }
  async function handleFile(file){
    if (!file) return;
    const mime = chFileMime(file);
    if (/^image\//.test(mime)){
      if (!/^image\/(jpeg|png|webp|gif|heic)$/.test(mime)){ toast(t('chat.badType'), 'error'); return; }
      const c = await chCompress(file);
      if (!c){ toast(t('chat.badType'), 'error'); return; }
      if (c.blob.size > CHAT_MAX){ toast(t('chat.tooBig'), 'error'); return; }
      previewSheet({ kind: 'image', blob: c.blob, mime: c.mime });
    } else if (mime === 'application/pdf' || /\.pdf$/i.test(file.name || '')){
      if (file.size > 10485760){ toast(t('chat.tooBig'), 'error'); return; }
      V.sendMedia({ kind: 'file', blob: file.type === 'application/pdf' ? file : new Blob([file], { type: 'application/pdf' }), mime: 'application/pdf', caption: String(file.name || 'document.pdf').slice(0, 80) });
    } else if (/^video\//.test(mime)){
      if (!/^video\/(mp4|quicktime|webm)$/.test(mime)){ toast(t('chat.badType'), 'error'); return; }
      if (file.size > CHAT_MAX){ toast(t('chat.tooBig'), 'error'); try { Sfx.play('error'); } catch(e){ /* rien */ } return; }
      const dur = await chVideoMeta(file);
      previewSheet({ kind: 'video', blob: file, mime, dur });
    } else toast(t('chat.badType'), 'error');
  }
  root.querySelectorAll('.chat-file').forEach(inp => inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; inp.value = ''; toggleMenu(false); handleFile(f).catch(e => { Guardian.note('chat:file', e); toast(t('chat.badType'), 'error'); }); }));

  /* ---------- enregistrement vocal ---------- */
  const rec = { on: false, mr: null, stream: null, chunks: [], t0: 0, iv: 0, an: 0, ac: null, locked: false, armed: false, pressing: false, starting: false, mime: '' };
  const recBox = root.querySelector('.chat-rec'), recTime = recBox.querySelector('.chat-rec-time'), recBars = [...recBox.querySelectorAll('.chat-rec-bars i')], micBtn = root.querySelector('.chat-mic');
  function recCleanup(){
    clearInterval(rec.iv); clearInterval(rec.an);
    try { if (rec.stream) rec.stream.getTracks().forEach(tr => tr.stop()); } catch(e){ /* rien */ }
    try { if (rec.ac && rec.ac.state !== 'closed') rec.ac.close(); } catch(e){ /* rien */ }
    rec.stream = null; rec.ac = null; rec.mr = null; rec.on = false; rec.locked = false; rec.armed = false;
    recBox.hidden = true; recBox.classList.remove('is-locked', 'is-armed'); wrap.classList.remove('is-rec'); micBtn.classList.remove('is-rec');
  }
  async function recStart(){
    if (rec.on || rec.starting) return false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined'){ toast(t('chat.recNone'), 'error'); return false; }
    rec.starting = true;
    try {
      rec.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch(e){ rec.starting = false; toast(t('chat.recDenied'), 'error'); try { Sfx.play('error'); } catch(x){ /* rien */ } return false; }
    rec.starting = false;
    if (V.dead){ try { rec.stream.getTracks().forEach(tr => tr.stop()); } catch(e){ /* rien */ } return false; }
    const mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
    rec.mime = mimes.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch(e){ return false; } }) || '';
    try { rec.mr = rec.mime ? new MediaRecorder(rec.stream, { mimeType: rec.mime }) : new MediaRecorder(rec.stream); } catch(e){ recCleanup(); toast(t('chat.recNone'), 'error'); return false; }
    rec.chunks = []; rec.mr.ondataavailable = e => { if (e.data && e.data.size) rec.chunks.push(e.data); };
    try { rec.mr.start(250); } catch(e){ recCleanup(); toast(t('chat.recNone'), 'error'); return false; }
    rec.on = true; rec.t0 = Date.now();
    recBox.hidden = false; wrap.classList.add('is-rec'); micBtn.classList.add('is-rec'); recTime.textContent = '0:00';
    try { Sfx.play('recStart'); Fx.haptic('tap'); } catch(e){ /* rien */ }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; rec.ac = new AC(); const src = rec.ac.createMediaStreamSource(rec.stream), an = rec.ac.createAnalyser(); an.fftSize = 128; src.connect(an);
      const buf = new Uint8Array(an.frequencyBinCount); let lv = recBars.map(() => 0.1);
      rec.an = setInterval(() => { an.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++){ const x = (buf[i] - 128) / 128; s += x * x; } const l = Math.min(1, Math.sqrt(s / buf.length) * 5); lv.shift(); lv.push(Math.max(0.1, l)); recBars.forEach((b, i) => { b.style.transform = 'scaleY(' + lv[i].toFixed(2) + ')'; }); }, 80);
    } catch(e){ /* l'onde est un confort, pas une obligation */ }
    rec.iv = setInterval(() => { const ms = Date.now() - rec.t0; recTime.textContent = chDur(ms); if (ms >= CHAT_REC_MAX) recFinish(true); }, 200);
    return true;
  }
  function recFinish(send){
    if (!rec.on || !rec.mr){ recCleanup(); return; }
    const mr = rec.mr, dur = Date.now() - rec.t0, mimeRaw = (mr.mimeType || rec.mime || 'audio/webm').split(';')[0];
    const chunks = rec.chunks;
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: mimeRaw });
      recCleanup();
      if (!send) return;
      if (dur < 700 || blob.size < 600){ toast(t('chat.recShort')); return; }
      V.sendMedia({ kind: 'audio', blob, mime: mimeRaw, dur });
    };
    try { try { Sfx.play(send ? 'recStop' : 'tap'); } catch(e){ /* rien */ } mr.stop(); } catch(e){ recCleanup(); }
  }
  micBtn.addEventListener('pointerdown', async e => {
    if (rec.on || e.button > 0) return;
    e.preventDefault(); const sx = e.clientX, pid = e.pointerId; rec.pressing = true; rec.sx = sx; rec.pt = Date.now();
    try { micBtn.setPointerCapture(pid); } catch(x){ /* rien */ }
    const ok = await recStart();
    if (!ok){ rec.pressing = false; return; }
    if (!rec.pressing){ rec.locked = true; recBox.classList.add('is-locked'); }      /* relâché pendant l'autorisation : mode verrouillé */
  });
  micBtn.addEventListener('pointermove', e => {
    if (!rec.on || !rec.pressing || rec.locked) return;
    let dx = e.clientX - rec.sx; if (LANG === 'ar') dx = -dx;
    const armed = dx < -70; if (armed !== rec.armed){ rec.armed = armed; recBox.classList.toggle('is-armed', armed); if (armed){ try { Fx.haptic('tap'); } catch(x){ /* rien */ } } }
  });
  const micUp = e => {
    if (!rec.pressing) return; rec.pressing = false;
    try { micBtn.releasePointerCapture(e.pointerId); } catch(x){ /* rien */ }
    if (!rec.on) return;
    if (e.type === 'pointercancel' || rec.armed){ recFinish(false); return; }
    if (Date.now() - rec.t0 < 350){ rec.locked = true; recBox.classList.add('is-locked'); return; }
    recFinish(true);
  };
  micBtn.addEventListener('pointerup', micUp); micBtn.addEventListener('pointercancel', micUp);
  micBtn.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !rec.on){ e.preventDefault(); recStart().then(ok => { if (ok){ rec.locked = true; recBox.classList.add('is-locked'); } }); } });

  /* ---------- clics ---------- */
  wrap.addEventListener('click', e => {
    const el = e.target.closest('[data-ch],.chat-img,.cv-play,.cv-speed,.cv-wave,.chat-retry'); if (!el) { if (!e.target.closest('.chat-menu')) V.closeMenu(); return; }
    if (el.matches('.chat-img')){ const im = el.querySelector('img'); if (im && im.src) chOpenViewer(im.src); return; }
    if (el.matches('.cv-play')){ const box = el.closest('.chat-voice'); chVoiceToggle(box, box.__url || (V.localAudio && V.localAudio.get(el.closest('.chat-m').getAttribute('data-id')))); return; }
    if (el.matches('.cv-speed')){ const sp = chAudio.speed === 1 ? 1.5 : chAudio.speed === 1.5 ? 2 : 1; chAudio.speed = sp; wrap.querySelectorAll('.cv-speed').forEach(b => { b.textContent = (sp === 1.5 ? '1.5' : sp) + 'x'; }); if (chAudio.el) chAudio.el.playbackRate = sp; try { Sfx.play('tick'); } catch(x){ /* rien */ } return; }
    if (el.matches('.cv-wave')){ const box = el.closest('.chat-voice'); if (chAudio.box === box && chAudio.el && Number.isFinite(chAudio.el.duration)){ const r = el.getBoundingClientRect(); let k = (e.clientX - r.left) / r.width; if (LANG === 'ar') k = 1 - k; chAudio.el.currentTime = Math.max(0, Math.min(1, k)) * chAudio.el.duration; } return; }
    if (el.matches('.chat-retry')){ V.retry(el.getAttribute('data-id')); return; }
    const a = el.getAttribute('data-ch');
    if (a === 'attach') toggleMenu();
    else if (a === 'send') doSend();
    else if (a === 'pick-photo') root.querySelector('[data-f="photo"]').click();
    else if (a === 'pick-camera') root.querySelector('[data-f="camera"]').click();
    else if (a === 'pick-video') root.querySelector('[data-f="video"]').click();
    else if (a === 'pick-pdf') root.querySelector('[data-f="pdf"]').click();
    else if (a === 'open-file'){ const pth = el.getAttribute('data-path'); if (pth) chSigned(pth).then(u => { if (u) window.open(u, '_blank', 'noopener'); }); }
    else if (a === 'down'){ toBottom(true); V.unseen = 0; setDown(); try { Sfx.play('tick'); } catch(x){ /* rien */ } }
    else if (a === 'rec-cancel'){ recFinish(false); }
    else if (a === 'rec-send'){ recFinish(true); }
    else if (a === 'reload'){ V.load(); }
    else if (a === 'yaser'){ try { Sfx.play('yaser'); } catch(x){ /* rien */ } Yaser.open(); }
    else if (a === 'askdep'){ V.insert(t('chat.depTpl')); try { Sfx.play('pop'); } catch(x){ /* rien */ } }
    else if (a === 'ai'){ aiDraft(el); }
    else if (a === 'hidehelp'){ Guardian.store.set('chat_help_hidden_' + chUid(), true); const h = root.querySelector('.chat-help'); if (h){ h.classList.add('is-out'); setTimeout(() => h.remove(), 280); } }
    else if (a === 'copy'){ try { navigator.clipboard.writeText(el.getAttribute('data-copy')); } catch(x){ /* rien */ } toast(t('chat.copied')); try { Sfx.play('tick'); } catch(x){ /* rien */ } }
    else if (V.onAction) V.onAction(a, el);
  });
  list.addEventListener('scroll', Guardian.throttle(setDown, 120), { passive: true });

  V.destroy = () => {
    V.dead = true;
    try { if (rec.on) { rec.mr && (rec.mr.onstop = null); recCleanup(); } } catch(e){ /* rien */ }
    try { if (V.closePrev) V.closePrev(); } catch(e){ /* rien */ }
    chVoiceStop(); chCloseViewer();
    V.previews.forEach(u => { try { URL.revokeObjectURL(u); } catch(e){ /* rien */ } }); V.previews.clear();
    if (Chat._S.view === V) Chat._S.view = null;
  };
  return V;
}

/* ============================================================
   Côté administrateur : fil, dépôt, réponses rapides, boîte de réception
   ============================================================ */
const CHQ_KEY = 'chat_quick_v1';
function chQuickGet(){
  const all = Guardian.store.get(CHQ_KEY, {}) || {};
  if (Array.isArray(all[LANG]) && all[LANG].length) return all[LANG].slice(0, 20);
  return [1, 2, 3, 4].map(i => t('chat.q' + i));
}
function chQuickSet(list){ const all = Guardian.store.get(CHQ_KEY, {}) || {}; all[LANG] = list.slice(0, 20); Guardian.store.set(CHQ_KEY, all); }

function chQuickSheet(V){
  chSheet('<h3 class="chat-sh-t">' + chEsc(t('chat.q.title')) + '</h3><div class="chat-q-list"></div><div class="chat-sh-row"><button type="button" class="btn btn-secondary" data-q="edit">' + chEsc(t('chat.q.edit')) + '</button></div>', (root, close) => {
    const box = root.querySelector('.chat-q-list'); let edit = false, items = chQuickGet();
    const draw = () => {
      if (!edit){ box.innerHTML = items.map((x, i) => '<button type="button" class="chat-q" data-i="' + i + '" style="--i:' + i + '">' + chEsc(x) + '</button>').join(''); root.querySelector('[data-q="edit"]').textContent = t('chat.q.edit'); }
      else { box.innerHTML = items.map((x, i) => '<div class="chat-q-e" style="--i:' + i + '"><input type="text" dir="auto" maxlength="300" value="' + chEsc(x) + '" data-i="' + i + '" aria-label="' + chEsc(t('chat.q.ph')) + '"><button type="button" data-d="' + i + '" aria-label="' + chEsc(t('chat.cancel')) + '">' + icon('trash', 18) + '</button></div>').join('') +
        '<button type="button" class="chat-q-add" data-q="add">' + icon('plus', 16) + '<span>' + chEsc(t('chat.q.add')) + '</span></button>'; root.querySelector('[data-q="edit"]').textContent = t('chat.q.save'); }
    };
    draw();
    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('chat-q')){ V.insert(items[Number(b.getAttribute('data-i'))] || ''); close(); try { Sfx.play('pop'); } catch(x){ /* rien */ } return; }
      if (b.getAttribute('data-q') === 'edit'){ if (edit){ items = [...box.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean); chQuickSet(items); try { Sfx.play('success'); } catch(x){ /* rien */ } } edit = !edit; draw(); return; }
      if (b.getAttribute('data-q') === 'add'){ items = [...box.querySelectorAll('input')].map(i => i.value); items.push(''); draw(); const ins = box.querySelectorAll('input'); if (ins.length) ins[ins.length - 1].focus(); return; }
      if (b.hasAttribute('data-d')){ items = [...box.querySelectorAll('input')].map(i => i.value); items.splice(Number(b.getAttribute('data-d')), 1); draw(); }
    });
  });
}

function chDepositSheet(V, info){
  const name = (info && (info.full_name || info.yor_id)) ? (info.full_name || dispId(info.yor_id)) : '—';
  const key = 'dep-' + chUuid();
  chSheet('<h3 class="chat-sh-t">' + chEsc(t('chat.dep.title')) + '</h3><p class="chat-sh-p">' + chEsc(t('chat.dep.sub')) + '</p><div class="cd-step">' +
    '<div class="field"><label class="field-label" for="cd-amt">' + chEsc(t('chat.dep.amt')) + '</label><div class="field-box"><input id="cd-amt" type="text" inputmode="decimal" dir="ltr" autocomplete="off" placeholder="0.000"></div></div>' +
    '<div class="field"><label class="field-label" for="cd-note">' + chEsc(t('chat.dep.note')) + '</label><div class="field-box"><input id="cd-note" type="text" dir="auto" maxlength="140" autocomplete="off"></div></div>' +
    '<div class="field-err" id="cd-err" role="alert"></div><button type="button" class="btn btn-primary" id="cd-go">' + chEsc(t('chat.dep.review')) + '</button></div>', (root, close) => {
    const step = root.querySelector('.cd-step'), amtI = root.querySelector('#cd-amt'), noteI = root.querySelector('#cd-note'), err = root.querySelector('#cd-err'), go = root.querySelector('#cd-go');
    const parse = () => { const v = Number(String(amtI.value).replace(',', '.').replace(/\s/g, '')); return Number.isFinite(v) && v > 0 && v <= 10000000 ? Math.round(v * 1000) / 1000 : 0; };
    try { amtI.focus(); } catch(e){ /* rien */ }
    go.onclick = () => {
      const a = parse(); if (!a){ err.textContent = t('chat.dep.bad'); Fx.shake(amtI.parentElement); try { Sfx.play('error'); } catch(e){ /* rien */ } return; }
      const note = noteI.value.trim();
      step.innerHTML = '<div class="cd-sum"><i>' + icon('banknote', 26) + '</i><p>' + chEsc(tf('chat.dep.ask', { a: Money.fmt(a, 'OMR'), n: name }).replace('{a}', Money.fmt(a, 'OMR')).replace('{n}', name)) + '</p>' + (note ? '<small>' + chEsc(note) + '</small>' : '') + '</div>' +
        '<div class="field-err" id="cd-err2" role="alert"></div><button type="button" class="btn btn-primary" id="cd-ok">' + chEsc(t('chat.dep.go')) + '</button><button type="button" class="btn btn-ghost" id="cd-back">' + chEsc(t('chat.cancel')) + '</button>';
      try { Sfx.play('pop'); } catch(e){ /* rien */ }
      const ok = step.querySelector('#cd-ok'), e2 = step.querySelector('#cd-err2');
      step.querySelector('#cd-back').onclick = close;
      ok.onclick = async () => {
        UIKit.loading(ok, true);
        const r = await Guardian.rpc('admin_chat_deposit', { p_thread: V.thread, p_amount: a, p_note: note || null, p_key: key }, { read: false, retries: 0 });
        UIKit.loading(ok, false);
        if (r.ok){ try { Sfx.play('credit'); Fx.confetti(ok, { n: 80 }); Fx.haptic('success'); } catch(e){ /* rien */ } toast(t('chat.dep.done'), 'success'); setTimeout(close, 450); V.sync(); }
        else { e2.textContent = t(r.error && r.error.key && r.error.key !== 'errors.UNKNOWN_ERROR' ? r.error.key : 'chat.dep.err'); try { Sfx.play('error'); } catch(e){ /* rien */ } }
      };
    };
    [amtI, noteI].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); go.click(); } }));
  });
}

function chThreadRender(){
  const S = Chat._S;
  if (!S.threadUser) return '<div class="chat-wrap is-admin"><header class="chat-head"><button type="button" class="chat-hb" data-action="back" aria-label="' + chEsc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 22) + '</span></button><div class="chat-hid"><b>' + chEsc(t('chat.in.title')) + '</b></div></header><div class="chat-list"><div class="chat-empty"><p>' + chEsc(t('chat.th.noThread')) + '</p></div></div></div>';
  return chShell({ admin: true, info: S.threadInfo });
}
async function chEnsureInfo(root, uid){
  const S = Chat._S; if (S.threadInfo && S.threadInfo.user_id === uid && S.threadInfo.full_name) return;
  let info = (S.threads || []).find(x => x.user_id === uid) || null;
  if (!info){
    const r = await Guardian.rpc('admin_chat_threads', { p_limit: 200 }); if (r.ok){ S.threads = Guardian.norm.arr(r.data); info = S.threads.find(x => x.user_id === uid) || null; }
  }
  if (!info){
    const q = await Guardian.query(() => sb.from('profiles').select('id,yor_id,first_name,last_name,phone').eq('id', uid).maybeSingle(), { retries: 0 });
    if (q.ok && q.data) info = { user_id: uid, yor_id: q.data.yor_id, full_name: ((q.data.first_name || '') + ' ' + (q.data.last_name || '')).trim(), phone: q.data.phone };
  }
  if (!info) return; S.threadInfo = info;
  if (!root.isConnected) return;
  const nm = root.querySelector('.chat-hid b'), sb2 = root.querySelector('.chat-sub'), av = root.querySelector('.chat-av-i');
  if (nm) nm.textContent = info.full_name || dispId(info.yor_id || '');
  if (sb2) sb2.textContent = [info.yor_id ? dispId(info.yor_id) : '', info.phone || ''].filter(Boolean).join(' · ');
  if (av) av.textContent = chInitials(info.full_name || info.yor_id);
  const hd = root.querySelector('.chat-head'); if (hd && info.yor_id && !hd.querySelector('[data-ch="copy"]')){ const b = document.createElement('button'); b.type = 'button'; b.className = 'chat-hb'; b.setAttribute('data-ch', 'copy'); b.setAttribute('data-copy', dispId(info.yor_id)); b.setAttribute('aria-label', t('action.copy')); b.innerHTML = icon('copy', 20); hd.appendChild(b); }
}
Hooks.on('admin-chat-thread', root => {
  const S = Chat._S; if (!S.threadUser || !chIsAdmin()) return;
  Chat.start();
  const V = chThreadView(root, { thread: S.threadUser, admin: true }); S.view = V;
  V.onAction = (a) => {
    if (a === 'deposit') chDepositSheet(V, S.threadInfo || { user_id: S.threadUser });
    else if (a === 'quick') chQuickSheet(V);
    else if (a === 'credit'){ try { if (typeof Credit !== 'undefined' && Credit.adminOpen) Credit.adminOpen(); else R.go('admin-credit'); } catch(e){ /* rien */ } }
  };
  V.load(); chEnsureInfo(root, S.threadUser);
  R.onLeave(() => V.destroy());
});
Hooks.on('chat', root => {
  const S = Chat._S; Chat.start();
  const V = chThreadView(root, { thread: chUid(), admin: false }); S.view = V;
  if (S.prefill){ V.insert(S.prefill); S.prefill = ''; }
  V.load();
  try { Sfx.play('open'); } catch(e){ /* rien */ }
  const idle = setTimeout(() => { const w = root.querySelector('.chat-wrap'); if (w) { w.classList.add('is-idle'); setTimeout(() => w.classList.remove('is-idle'), 3600); } }, 2600);
  R.onLeave(() => { clearTimeout(idle); V.destroy(); });
});

function chInboxRender(){
  return '<div class="chat-inbox">' + v18Top(t('chat.in.title'), '<span class="chat-in-n" hidden>0</span>') +
    '<div class="chat-in-s"><div class="field-box">' + icon('search', 18) + '<input type="search" dir="auto" placeholder="' + chEsc(t('chat.in.search')) + '" aria-label="' + chEsc(t('chat.in.search')) + '" autocomplete="off"></div></div>' +
    '<div class="chat-in-l" role="list"><div class="chat-loading"><i></i><i></i><i></i></div></div></div>';
}
function chPlain(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9؀-ۿ]/g, ''); }
Hooks.on('admin-chat', root => {
  if (!chIsAdmin()) return;
  const S = Chat._S; Chat.start();
  const box = root.querySelector('.chat-in-l'), inp = root.querySelector('input[type="search"]'), cnt = root.querySelector('.chat-in-n');
  let first = true, dead = false;
  const draw = () => {
    const q = chPlain(inp.value); const list = (S.threads || []).filter(x => !q || chPlain([x.full_name, x.yor_id, dispId(x.yor_id || ''), x.phone, x.last_preview].join(' ')).indexOf(q) >= 0);
    const total = (S.threads || []).reduce((a, x) => a + Guardian.norm.int(x.unread_admin), 0); cnt.hidden = !total; cnt.textContent = String(total);
    if (!list.length){ box.innerHTML = '<div class="chat-empty"><p>' + chEsc(t(q ? 'chat.in.none' : 'chat.in.empty')) + '</p></div>'; return; }
    box.innerHTML = list.map((x, i) => {
      const at = Guardian.norm.time(x.last_message_at), n = Guardian.norm.int(x.unread_admin);
      const when = chDayKey(at) === chDayKey(Date.now()) ? chClock(at) : chDayLabel(at);
      return '<button type="button" class="chat-th' + (n ? ' is-unread' : '') + (first ? ' chat-in' : '') + '" role="listitem" data-uid="' + chEsc(x.user_id) + '" style="--i:' + Math.min(i, 12) + '"><span class="chat-av chat-av-i">' + chEsc(chInitials(x.full_name || x.yor_id)) + '</span>' +
        '<span class="chat-th-b"><b>' + chEsc(x.full_name || dispId(x.yor_id || '')) + '</b><small>' + chEsc(x.last_preview || '') + '</small></span><span class="chat-th-r"><time>' + chEsc(when) + '</time>' + (n ? '<i class="chat-th-n">' + n + '</i>' : '') + '</span></button>';
    }).join('');
    first = false;
  };
  const load = async () => {
    const r = await Guardian.rpc('admin_chat_threads', { p_limit: 200 });
    if (dead || !root.isConnected) return;
    if (r.ok){ S.threads = Guardian.norm.arr(r.data); draw(); }
    else if (first){ box.innerHTML = '<div class="chat-empty"><p>' + chEsc(t('chat.loadErr')) + '</p></div>'; }
  };
  S.inbox = { refresh: Guardian.debounce(load, 500) };
  inp.addEventListener('input', Guardian.debounce(draw, 120));
  box.addEventListener('click', e => { const b = e.target.closest('.chat-th'); if (!b) return; try { Sfx.play('tap'); } catch(x){ /* rien */ } Chat.openThread(b.getAttribute('data-uid')); });
  load();
  R.onLeave(() => { dead = true; if (S.inbox) S.inbox = null; });
});

/* ============================================================
   Freindi Pay — assistant à règles, personnage SVG animé
   ============================================================ */
let yGid = 0;
function yaserSvg(size, key){
  const n = ++yGid;
  const eye = cx => '<g class="yas-eye"><ellipse cx="' + cx + '" cy="56" rx="7.4" ry="9" fill="#fff"/><circle class="yas-pupil" cx="' + cx + '" cy="57" r="4.4" fill="#2a1d05"/><circle cx="' + (cx - 1.6) + '" cy="55" r="1.4" fill="#fff"/></g>';
  return '<svg class="yas-svg yas-' + key + '" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="yg' + n + '" cx="36%" cy="28%" r="78%"><stop offset="0" stop-color="#EAF5FF"/><stop offset=".42" stop-color="#8edde2"/><stop offset="1" stop-color="#bae8eb"/></radialGradient>' +
    '<radialGradient id="yh' + n + '"><stop offset="0" stop-color="#8edde2" stop-opacity=".55"/><stop offset="1" stop-color="#8edde2" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="yas-halo" cx="60" cy="62" r="58" fill="url(#yh' + n + ')"/>' +
    '<g class="yas-float"><line x1="60" y1="22" x2="60" y2="12" stroke="#bae8eb" stroke-width="3" stroke-linecap="round"/><circle class="yas-ant" cx="60" cy="9" r="4.2" fill="#EAF5FF"/>' +
    '<circle cx="60" cy="62" r="40" fill="url(#yg' + n + ')"/><ellipse cx="44" cy="40" rx="14" ry="8" fill="#fff" opacity=".28" transform="rotate(-28 44 40)"/>' +
    '<circle cx="37" cy="70" r="6" fill="#ff9d5c" opacity=".26"/><circle cx="83" cy="70" r="6" fill="#ff9d5c" opacity=".26"/>' +
    '<g class="yas-eyes">' + eye(47) + eye(73) + '</g>' +
    '<path class="yas-smile" d="M47 74 Q60 85 73 74" fill="none" stroke="#5b3a05" stroke-width="3.4" stroke-linecap="round"/>' +
    '<ellipse class="yas-open" cx="60" cy="76" rx="8" ry="5.5" fill="#5b3a05"/></g>' +
    '<path class="yas-sp s1" d="M104 28l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#EAF5FF"/><path class="yas-sp s2" d="M14 42l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#8edde2"/><path class="yas-sp s3" d="M100 94l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#EAF5FF"/></svg>';
}

const Yaser = (() => {
  const A = s => /[؀-ۿ]/.test(s);
  const KW = {
    deposit: ['deposit', 'add money', 'top up', 'topup', 'fund', 'load', 'deposer', 'depot', 'alimenter', 'recharger', 'ajouter de l', 'ايداع', 'اودع', 'شحن', 'اضافه مبلغ', 'اضيف', 'اضافه اموال', 'تعبئه'],
    credit: ['credit', 'loan', 'borrow', 'financ', 'pret', 'emprunt', 'قرض', 'ائتمان', 'تمويل', 'اقتراض', 'سلفه', 'اقترض'],
    boost: ['boost', 'earn', 'gain', 'interest', 'yield', 'profit', 'rendement', 'interet', 'gagner', 'epargne', 'saving', 'vault', 'coffre', 'ربح', 'ارباح', 'فايده', 'توفير', 'ادخار', 'كسب', 'خزنه'],
    intl: ['international', 'abroad', 'overseas', 'country', 'pays', 'etranger', 'دولي', 'خارج', 'بلد', 'دوله'],
    send: ['send', 'transfer', 'pay', 'envoyer', 'virement', 'transferer', 'payer', 'ارسال', 'ارسل', 'حول', 'تحويل', 'ادفع'],
    balance: ['balance', 'how much', 'solde', 'combien', 'رصيد', 'كم'],
    history: ['history', 'recent', 'transaction', 'operation', 'historique', 'dernier', 'سجل', 'اخر', 'عمليات', 'معاملات'],
    fees: ['fee', 'cost', 'charge', 'frais', 'commission', 'tarif', 'رسوم', 'عموله', 'تكلفه'],
    security: ['secur', 'pin', 'face id', 'faceid', 'password', 'mot de passe', 'empreinte', 'code', 'امان', 'رمز', 'بصمه', 'كلمه المرور', 'حمايه'],
    human: ['human', 'agent', 'admin', 'support', 'person', 'operator', 'contact', 'talk to', 'humain', 'conseiller', 'administrateur', 'assistance', 'parler', 'مسؤول', 'موظف', 'دعم', 'شخص', 'اداره', 'مشرف', 'تحدث'],
    thanks: ['thank', 'merci', 'شكرا', 'يعطيك', 'مشكور'],
    who: ['who are you', 'your name', 'qui es tu', 'qui etes', 'tu es qui', 'ton nom', 'من انت', 'اسمك', 'who is yaser'],
    plans: ['plan', 'invest', 'essentiel', 'croissance', 'premium', 'placement', 'souscri', 'اشتراك', 'خطه', 'خطط', 'استثمار', 'النمو', 'الاساسيه', 'بريميوم'],
    kyc: ['kyc', 'identity', 'identite', 'verification', 'verifier', 'selfie', 'piece d', 'id card', 'هويه', 'توثيق', 'تحقق', 'سيلفي'],
    withdraw: ['withdraw', 'retrait', 'retirer', 'cash out', 'virement bancaire', 'iban', 'سحب', 'اسحب', 'ايبان'],
    status: ['status', 'statut', 'suivi', 'dossier', 'where is', 'en est', 'حاله', 'حالة', 'طلبي', 'متابعه', 'وين'],
    payment: ['paid', 'paiement', 'payer mon', 'recu', 'receipt', 'proof', 'justificatif', 'دفعت', 'ايصال', 'اثبات', 'حواله', 'دفع'],
    greet: ['hello', 'hi', 'hey', 'salut', 'bonjour', 'bonsoir', 'coucou', 'salam', 'مرحبا', 'اهلا', 'السلام', 'هلا']
  };
  const ORDER = ['status', 'payment', 'kyc', 'withdraw', 'plans', 'deposit', 'credit', 'boost', 'intl', 'send', 'balance', 'history', 'fees', 'security', 'human', 'thanks', 'who', 'greet'];
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ً-ٰٟـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^a-z0-9؀-ۿ\s]/g, ' ').replace(/\s+/g, ' ').trim();
  function intentOf(text){
    const s = ' ' + norm(text) + ' '; let best = '', score = 0;
    ORDER.forEach(k => { let n = 0; KW[k].forEach(w => { if (A(w) && w.length <= 3 ? s.indexOf(' ' + w + ' ') >= 0 : (s.indexOf(' ' + w) >= 0 || (A(w) && s.indexOf(w) >= 0))) n++; }); if (n > score){ score = n; best = k; } });
    return best || 'fallback';
  }
  const fill = (s, v) => String(s).replace(/(\s*)\{(\w+)\}/g, (m0, ws, k) => { const val = v[k]; if (k === 'n') return val ? ' ' + val : ''; return ws + (val == null ? '' : val); });
  const dt = d => { try { return new Date(d).toLocaleDateString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { day: '2-digit', month: 'short', year: 'numeric' }); } catch(e){ return ''; } };
  const pn = (pl) => { const n = pl && pl.name; return (n && (n[LANG] || n.en)) || (pl && pl.code) || ''; };
  const stTxt = (k, st) => t('yas.st.' + k + '.' + st) || st;
  /* réponses fondées UNIQUEMENT sur les vraies données du serveur : jamais de confirmation inventée */
  async function replyServer(intent){
    const actions = [];
    const iso = v => (LANG === 'ar' && v ? '\u2066' + v + '\u2069' : v);
    const [inv, kyc, wd, cr] = await Promise.all([Guardian.rpc('invest_overview', {}), Guardian.rpc('kyc_status', {}), Guardian.rpc('withdraw_overview', {}), Guardian.rpc('credit_overview', {})]);
    if (intent === 'plans'){
      const pl = inv.ok && inv.data && Array.isArray(inv.data.plans) ? inv.data.plans.filter(p => p.active) : [];
      if (!pl.length) return { text: t('yas.r.noData'), actions: [{ k: 'yas.openChat', go: 'chat' }] };
      const lines = pl.map(p => '• ' + pn(p) + ' : ' + iso(Money.int(p.min) + ' – ' + Money.int(p.max) + ' OMR') + ' · ' + p.days + ' ' + t('yas.days') + (p.model_validated && p.return_pct != null ? ' · ' + t('yas.ret') + ' ' + iso(Money.num(p.return_pct, 2) + '%') : '')).join('\n');
      actions.push({ k: 'yas.openPlans', go: 'invest' });
      return { text: t('yas.r.plans') + '\n' + lines + '\n' + t('yas.r.noGain'), actions };
    }
    if (intent === 'kyc'){
      const st = kyc.ok && kyc.data ? String(kyc.data.status || 'UNVERIFIED') : '';
      if (!st) return { text: t('yas.r.noData'), actions: [{ k: 'yas.openChat', go: 'chat' }] };
      actions.push({ k: 'yas.openKyc', go: 'kyc' });
      return { text: t('yas.r.kyc') + ' ' + stTxt('kyc', st) + (kyc.data.last && kyc.data.last.reason && st === 'REJECTED' ? ' (' + kyc.data.last.reason + ')' : ''), actions };
    }
    if (intent === 'withdraw'){
      const items = wd.ok && wd.data && Array.isArray(wd.data.items) ? wd.data.items : null;
      if (!items) return { text: t('yas.r.noData'), actions: [{ k: 'yas.openChat', go: 'chat' }] };
      actions.push({ k: 'yas.openWithdraw', go: 'withdraw' });
      const last = items[0];
      return { text: t('yas.r.withdraw') + ' ' + iso(Money.num(wd.data.min, 0) + ' OMR') + '.' + (last ? '\n' + t('yas.r.last') + ' ' + last.reference + ' : ' + stTxt('wd', last.status) : '\n' + t('yas.r.none')), actions };
    }
    /* status / payment : tous les dossiers, avec leur vrai statut */
    const lines = [];
    if (inv.ok && inv.data && Array.isArray(inv.data.items)) inv.data.items.slice(0, 3).forEach(i => lines.push(i.reference + ' (' + iso(Money.fmt(i.amount, 'OMR')) + ') : ' + stTxt('inv', i.status) + (i.status === 'ACTIVE' && i.ends_at ? ' · ' + t('yas.until') + ' ' + dt(i.ends_at) : '')));
    if (wd.ok && wd.data && Array.isArray(wd.data.items)) wd.data.items.slice(0, 2).forEach(w => lines.push(w.reference + ' (' + iso(Money.fmt(w.amount, 'OMR')) + ') : ' + stTxt('wd', w.status)));
    if (cr.ok && cr.data && Array.isArray(cr.data.loans)) cr.data.loans.slice(0, 1).forEach(l => lines.push(t('yas.fin') + ' ' + iso(Money.fmt(l.approved, 'OMR')) + ' : ' + (l.closed ? t('yas.closed') : t('yas.outstanding') + ' ' + iso(Money.fmt(l.outstanding, 'OMR')))));
    if (kyc.ok && kyc.data) lines.push(t('yas.r.kyc') + ' ' + stTxt('kyc', String(kyc.data.status || 'UNVERIFIED')));
    if (!lines.length) return { text: t('yas.r.noData'), actions: [{ k: 'yas.openChat', go: 'chat' }] };
    actions.push({ k: 'yas.openPlans', go: 'invest' }, { k: 'yas.openChat', go: 'chat' });
    return { text: t(intent === 'payment' ? 'yas.r.payment' : 'yas.r.status') + '\n' + lines.map(x => '• ' + x).join('\n') + '\n' + t('yas.r.noFake'), actions };
  }
  const SERVER_INTENTS = ['plans', 'kyc', 'withdraw', 'status', 'payment'];
  function reply(intent){
    const name = Guardian.norm.str(Runtime.profile && Runtime.profile.firstName, 40), cfg = Cfg.get(), actions = [];
    const iso = v => (LANG === 'ar' && v ? '\u2066' + v + '\u2069' : v);      /* un montant latin reste d'un seul bloc dans une phrase arabe */
    const key = 'yas.r.' + intent; let text, auto = '';
    if (intent === 'balance'){
      const acc = Guardian.norm.arr(Runtime.accounts); const a = acc.find(x => x.currency === 'OMR') || acc[0];
      text = a ? fill(t('yas.r.balance'), { bal: iso(Money.fmt(Guardian.norm.num(a.availableBalance, Guardian.norm.num(a.balance)), a.currency || 'OMR')) }) : t('yas.r.balanceNo');
    } else if (intent === 'history'){
      const tx = Guardian.norm.arr(Runtime.transactions).slice(0, 3);
      text = tx.length ? fill(t('yas.r.history'), { list: tx.map(x => (x.direction === 'IN' ? '+' : '−') + iso(Money.fmt(x.amount, x.currency || 'OMR')) + ' · ' + ((typeof opLabel === 'function' && opLabel(x)) || x.kind || '') + ' · ' + v18Time(x.createdAt)).join('\n') }) : t('yas.r.historyNo');
    } else {
      text = fill(t(key), { n: name, min: Money.int(cfg.credit_min), max: Money.int(cfg.credit_max), rate: Money.num(cfg.vault_rate_pct_day, 2).replace(/\.?0+$/, '') });
    }
    if (intent === 'deposit') actions.push({ k: 'yas.openChat', go: 'chat' });
    if (intent === 'credit'){ actions.push({ k: 'yas.openCredit', go: 'credit' }); actions.push({ k: 'yas.openChat', go: 'chat' }); }
    if (intent === 'boost') actions.push({ k: 'yas.openPlans', go: 'invest' });
    if (intent === 'send') actions.push({ k: 'yas.openSend', go: 'country-select' });
    if (intent === 'intl') actions.push({ k: 'yas.openIntl', go: 'intl' });
    if (intent === 'human'){ actions.push({ k: 'yas.openChat', go: 'chat' }); auto = 'chat'; }
    return { text, actions, auto };
  }
  const CHIPS = [['status', 'yas.c.status'], ['plans', 'yas.c.plans'], ['payment', 'yas.c.payment'], ['withdraw', 'yas.c.withdraw'], ['deposit', 'yas.c.deposit'], ['credit', 'yas.c.credit'], ['balance', 'yas.c.balance'], ['human', 'yas.c.human']];
  const hkey = () => 'yas_hist_' + chUid();
  function open(){ R.go('yaser', { force: true }); }
  function render(){
    return '<div class="yas-wrap"><header class="chat-head yas-head"><button type="button" class="chat-hb" data-action="back" aria-label="' + chEsc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 22) + '</span></button>' +
      '<div class="chat-hid"><b>' + chEsc(t('yas.title')) + '</b><small>' + chEsc(t('yas.sub')) + '</small></div><button type="button" class="chat-hb" data-y="new" aria-label="' + chEsc(t('yas.new')) + '">' + chIc('retry', 20) + '</button></header>' +
      '<div class="yas-hero">' + yaserSvg(112, 'hero') + '</div><div class="yas-list" role="log" aria-live="polite"></div><div class="yas-chips"></div>' +
      '<footer class="yas-comp"><div class="chat-tw"><input type="text" dir="auto" maxlength="300" enterkeyhint="send" autocomplete="off" placeholder="' + chEsc(t('yas.ph')) + '" aria-label="' + chEsc(t('yas.ph')) + '"></div><button type="button" class="chat-send is-on" data-y="send" aria-label="' + chEsc(t('chat.send')) + '">' + chIc('up', 22) + '</button></footer></div>';
  }
  function wire(root){
    const wrap = root.querySelector('.yas-wrap'), list = root.querySelector('.yas-list'), chips = root.querySelector('.yas-chips'), inp = root.querySelector('.yas-comp input'), svg = root.querySelector('.yas-hero .yas-svg');
    let hist = Guardian.store.get(hkey(), []); if (!Array.isArray(hist)) hist = []; let busy = false, dead = false; const timers = [];
    const later = (fn, ms) => { const id = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(id); return id; };
    const save = () => Guardian.store.set(hkey(), hist.slice(-60));
    const bottom = () => { try { list.scrollTo({ top: list.scrollHeight, behavior: Fx.reduced() ? 'auto' : 'smooth' }); } catch(e){ list.scrollTop = list.scrollHeight; } };
    const addUser = (text, instant) => { const d = document.createElement('div'); d.className = 'yas-m me' + (instant ? '' : ' chat-in'); d.innerHTML = '<div class="yas-b" dir="auto">' + chEsc(text) + '</div>'; list.appendChild(d); wrap.classList.add('has-msgs'); bottom(); return d; };
    const botEl = () => { const d = document.createElement('div'); d.className = 'yas-m bot chat-in'; d.innerHTML = '<span class="yas-ava">' + yaserSvg(30, 'mini') + '</span><div class="yas-b" dir="auto"></div>'; list.appendChild(d); return d; };
    const actionsHtml = acts => (acts && acts.length ? '<div class="yas-acts">' + acts.map(a => '<button type="button" class="yas-act" data-go="' + chEsc(a.go) + '">' + chEsc(t(a.k)) + '</button>').join('') + '</div>' : '');
    const showChips = () => { chips.innerHTML = CHIPS.map((c, i) => '<button type="button" class="yas-chip" data-i="' + c[0] + '" style="--i:' + i + '">' + chEsc(t(c[1])) + '</button>').join(''); chips.classList.remove('is-in'); void chips.offsetWidth; chips.classList.add('is-in'); };
    const talk = on => { if (svg) svg.classList.toggle('is-talk', !!on); };
    const think = on => { if (svg) svg.classList.toggle('is-think', !!on); };
    function typeInto(el, text, done){
      const b = el.querySelector('.yas-b'); const reduce = Fx.reduced();
      if (reduce){ b.textContent = text; done(); return; }
      let i = 0, skipped = false; const step = text.length > 140 ? 3 : text.length > 70 ? 2 : 1; talk(true);
      const fin = () => { b.textContent = text; talk(false); el.removeEventListener('click', skip); done(); };
      const skip = () => { skipped = true; };
      el.addEventListener('click', skip);
      const tick = () => { if (dead) return; if (skipped){ fin(); return; } i += step; b.textContent = text.slice(0, i); bottom(); if (i >= text.length) fin(); else timers.push(setTimeout(tick, 18)); };
      tick();
    }
    function botSay(r, instant){
      const el = botEl(); const post = () => { const b = el.querySelector('.yas-b'); const h = actionsHtml(r.actions); if (h) b.insertAdjacentHTML('afterend', h.replace('class="yas-acts"', 'class="yas-acts chat-in"')); bottom(); showChips(); busy = false; if (r.auto){ later(() => { try { R.go(r.auto); } catch(e){ /* rien */ } }, 1500); } };
      if (instant){ el.classList.remove('chat-in'); el.querySelector('.yas-b').textContent = r.text; post(); return; }
      try { Sfx.play('yaser'); } catch(e){ /* rien */ }
      typeInto(el, r.text, () => { post(); });
    }
    function ask(text, intent){
      if (busy) return; busy = true; text = String(text || '').trim().slice(0, 300); if (!text) { busy = false; return; }
      addUser(text); hist.push({ r: 'u', x: text, at: Date.now() }); chips.innerHTML = '';
      const it = intent || intentOf(text); const rp = SERVER_INTENTS.indexOf(it) >= 0 ? replyServer(it).catch(() => ({ text: t('yas.r.noData'), actions: [{ k: 'yas.openChat', go: 'chat' }] })) : Promise.resolve(reply(it));
      const dots = document.createElement('div'); dots.className = 'yas-m bot yas-typing chat-in'; dots.setAttribute('aria-label', t('yas.typing')); dots.innerHTML = '<span class="yas-ava">' + yaserSvg(30, 'mini') + '</span><div class="yas-b"><i></i><i></i><i></i></div>'; list.appendChild(dots); bottom(); think(true);
      rp.then(r => { hist.push({ r: 'b', x: r.text, a: r.actions, at: Date.now() }); save(); later(() => { dots.remove(); think(false); botSay(r, false); }, 500); });
    }
    function restore(){
      hist.forEach(m => { if (m.r === 'u') addUser(m.x, true); else { const r = { text: m.x, actions: m.a || [] }; const el = botEl(); el.classList.remove('chat-in'); el.querySelector('.yas-b').textContent = m.x; const h = actionsHtml(r.actions); if (h) el.querySelector('.yas-b').insertAdjacentHTML('afterend', h); } });
      list.scrollTop = list.scrollHeight; showChips();
    }
    function hello(){ busy = true; const r = reply('hello'); hist.push({ r: 'b', x: r.text, a: [], at: Date.now() }); save(); later(() => botSay(r, false), 450); }
    if (hist.length) restore(); else hello();
    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('yas-chip')){ try { Sfx.play('tap'); } catch(x){ /* rien */ } const k = b.getAttribute('data-i'); const lab = (CHIPS.find(c => c[0] === k) || [])[1]; ask(lab ? t(lab) : k, k); return; }
      if (b.classList.contains('yas-act')){ const go = b.getAttribute('data-go'); try { Sfx.play('pop'); } catch(x){ /* rien */ } if (R.ids().indexOf(go) < 0){ toast(t('g.network'), 'error'); return; } R.go(go); return; }
      const y = b.getAttribute('data-y');
      if (y === 'send'){ const v = inp.value; inp.value = ''; ask(v); inp.focus({ preventScroll: true }); }
      else if (y === 'new'){ if (busy) return; hist = []; save(); list.innerHTML = ''; chips.innerHTML = ''; wrap.classList.remove('has-msgs'); try { Sfx.play('pop'); } catch(x){ /* rien */ } hello(); }
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing){ e.preventDefault(); const v = inp.value; inp.value = ''; ask(v); } });
    /* les yeux suivent le doigt */
    const pupils = [...root.querySelectorAll('.yas-hero .yas-pupil')];
    const look = Guardian.throttle(e => {
      if (!svg || !pupils.length) return; const r = svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.5;
      const dx = (e.clientX - cx), dy = (e.clientY - cy), d = Math.hypot(dx, dy) || 1, k = Math.min(3.4, d / 40);
      pupils.forEach(p => { p.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)'; });
    }, 30);
    document.addEventListener('pointermove', look, { passive: true });
    wrap.addEventListener('pointerdown', e => { if (svg && e.target.closest('.yas-hero')){ svg.classList.add('is-happy'); try { Sfx.play('yaser'); Fx.haptic('tap'); } catch(x){ /* rien */ } setTimeout(() => svg.classList.remove('is-happy'), 900); } });
    R.onLeave(() => { dead = true; timers.forEach(clearTimeout); document.removeEventListener('pointermove', look); });
  }
  return { open, render, wire, _intent: intentOf, _reply: reply };
})();
Hooks.on('yaser', root => { try { Yaser.wire(root); try { Sfx.play('open'); } catch(e){ /* rien */ } } catch(e){ console.error('yaser', e); } });

/* ---------- écrans ---------- */
R.register({
  chat: () => chShell({ admin: false }),
  yaser: () => Yaser.render(),
  'admin-chat': () => chInboxRender(),
  'admin-chat-thread': () => chThreadRender()
});
R.meta({
  chat: { parent: 'home', nav: 'services', nonav: true },
  yaser: { parent: 'home', nav: 'services', nonav: true },
  'admin-chat': { parent: 'admin', nav: 'services', admin: true },
  'admin-chat-thread': { parent: 'admin-chat', nav: 'services', admin: true, nonav: true }
});
