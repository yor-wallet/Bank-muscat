'use strict';

/* ============================================================
   ADMIN 19 (19.0.0) — espace administrateur : plans, paiements et justificatifs, identités, retraits, journal, membres, notifications.
   Masquage d'interface seulement : toute la sécurité est dans les fonctions serveur (is_admin()) ; chaque décision est écrite dans le journal
   d'audit (en ajout seul). Écrans : admin-plans, admin-invest, admin-kyc, admin-withdrawals, admin-audit, admin-users, admin-notify.
   API : Admin19 = { tiles(), counts(), open(route) }.
   ============================================================ */
(() => {
  /* [en, fr, ar] */
  const D = {
    badge: ['ADMIN', 'ADMIN', 'مسؤول'], back: ['Back', 'Retour', 'رجوع'], refresh: ['Refresh', 'Actualiser', 'تحديث'], retry: ['Retry', 'Réessayer', 'إعادة المحاولة'],
    err: ['Could not load. Try again.', 'Chargement impossible. Réessayez.', 'تعذّر التحميل. حاول مجدداً.'], none: ['Nothing here', 'Rien ici', 'لا شيء هنا'],
    cancel: ['Cancel', 'Annuler', 'إلغاء'], confirm: ['Confirm', 'Confirmer', 'تأكيد'], save: ['Save', 'Enregistrer', 'حفظ'], saved: ['Saved', 'Enregistré', 'تم الحفظ'],
    logged: ['Recorded in the audit log', 'Enregistré dans le journal', 'تم التسجيل في سجل التدقيق'], copy: ['Copy', 'Copier', 'نسخ'], copied: ['Copied', 'Copié', 'تم النسخ'],
    search: ['Search', 'Rechercher', 'بحث'], reason: ['Reason (required)', 'Motif (obligatoire)', 'السبب (إلزامي)'], note: ['Note (optional)', 'Note (facultatif)', 'ملاحظة (اختياري)'],
    forbidden: ['Administrators only.', 'Réservé aux administrateurs.', 'للمسؤولين فقط.'], chatWith: ['Open chat', 'Ouvrir le chat', 'فتح الدردشة'],
    ago: ['just now', 'à l’instant', 'الآن'], open: ['Open', 'Ouvrir', 'فتح'], close: ['Close', 'Fermer', 'إغلاق'], person: ['Member', 'Membre', 'العضو'],
    amount: ['Amount', 'Montant', 'المبلغ'], status: ['Status', 'Statut', 'الحالة'], date: ['Date', 'Date', 'التاريخ'], actions: ['Actions', 'Actions', 'الإجراءات'],
    /* tuiles */
    tPlans: ['Plans and settings', 'Plans et paramètres', 'الخطط والإعدادات'], tPlansD: ['Amounts, durations, payment details', 'Montants, durées, coordonnées de paiement', 'المبالغ والمدد وبيانات الدفع'],
    tInvest: ['Payments to verify', 'Paiements à vérifier', 'مدفوعات للتحقق'], tInvestD: ['Receipts, activation, settlement', 'Reçus, activation, règlement', 'الإيصالات والتفعيل والتسوية'],
    tKyc: ['Identity checks', 'Identités à vérifier', 'التحقق من الهوية'], tKycD: ['ID front, back and selfie', 'Pièce recto, verso et selfie', 'الهوية والوجه الخلفي وصورة شخصية'],
    tWd: ['Withdrawals', 'Retraits à traiter', 'السحوبات'], tWdD: ['Review, bank transfer, confirmation', 'Examen, virement, confirmation', 'مراجعة وتحويل وتأكيد'],
    tUsers: ['Members', 'Utilisateurs', 'الأعضاء'], tUsersD: ['Search and member files', 'Recherche et fiches', 'بحث وملفات الأعضاء'],
    tAudit: ['Audit log', 'Journal d’audit', 'سجل التدقيق'], tAuditD: ['Every decision, append-only', 'Chaque décision, en ajout seul', 'كل قرار، للإضافة فقط'],
    tNotify: ['Notifications', 'Notifications', 'الإشعارات'], tNotifyD: ['Announcements to everyone', 'Annonces à tous', 'إعلانات للجميع'],
    /* statuts */
    sAWAITING_PAYMENT: ['Awaiting payment', 'En attente de paiement', 'بانتظار الدفع'], sPROOF_SENT: ['Receipt to verify', 'Reçu à vérifier', 'إيصال للتحقق'], sACTIVE: ['Active', 'Actif', 'فعّال'],
    sMATURED: ['Ended, to settle', 'Échu, à régler', 'منتهٍ، للتسوية'], sSETTLED: ['Settled', 'Réglé', 'تمت التسوية'], sREJECTED: ['Rejected', 'Refusé', 'مرفوض'], sCANCELLED: ['Cancelled', 'Annulé', 'ملغى'],
    sPENDING: ['In review', 'En examen', 'قيد المراجعة'], sAPPROVED: ['Approved', 'Approuvé', 'موافق عليه'], sPAID: ['Paid', 'Payé', 'مدفوع'],
    /* paiements */
    iTitle: ['Payments and plans', 'Paiements et plans', 'المدفوعات والخطط'], iProofs: ['Receipts to verify', 'Reçus à vérifier', 'إيصالات للتحقق'], iAwait: ['Awaiting payment', 'En attente de paiement', 'بانتظار الدفع'],
    iActive: ['Active', 'Actifs', 'الفعّالة'], iDue: ['Ended, to settle', 'Échus à régler', 'منتهية للتسوية'], iSettled: ['Settled', 'Réglés', 'مسوّاة'], iRej: ['Rejected', 'Refusés', 'مرفوضة'],
    ref: ['Reference', 'Référence', 'المرجع'], plan: ['Plan', 'Plan', 'الخطة'], ends: ['Ends', 'Échéance', 'الانتهاء'], days: ['{n} days', '{n} jours', '{n} يوماً'],
    viewProof: ['View receipt', 'Voir le justificatif', 'عرض الإيصال'], noProof: ['No receipt attached', 'Aucun justificatif joint', 'لا يوجد إيصال'], proofLoad: ['Loading receipt…', 'Chargement du justificatif…', 'جارٍ تحميل الإيصال…'],
    proofFail: ['Receipt unavailable', 'Justificatif indisponible', 'الإيصال غير متاح'], openPdf: ['Open PDF', 'Ouvrir le PDF', 'فتح ملف PDF'],
    confirmFunds: ['Confirm funds received', 'Confirmer la réception des fonds', 'تأكيد استلام الأموال'], rejectPay: ['Reject', 'Refuser', 'رفض'], settle: ['Settle', 'Régler', 'تسوية'],
    cfChecked: ['I verified that the exact amount arrived on the account.', 'J’ai vérifié que le montant exact est arrivé sur le compte.', 'تحققت من وصول المبلغ الدقيق إلى الحساب.'],
    cfFundsT: ['Confirm payment', 'Confirmer le paiement', 'تأكيد الدفعة'], cfFundsD: ['The plan will start now. The member is notified and receives an e-mail in Arabic.', 'Le plan démarre maintenant. La personne est prévenue et reçoit un e-mail en arabe.', 'ستبدأ الخطة الآن. يُشعَر العضو ويصله بريد إلكتروني بالعربية.'],
    rjT: ['Reject this payment', 'Refuser ce paiement', 'رفض هذه الدفعة'], stT: ['Settle the plan', 'Régler le plan', 'تسوية الخطة'], stPayout: ['Amount returned (OMR)', 'Montant rendu (OMR)', 'المبلغ المُعاد (ر.ع)'],
    stWarn: ['The financial model is not validated: only the principal can be returned.', 'Le modèle financier n’est pas validé : seul le capital peut être rendu.', 'النموذج المالي غير معتمد: يمكن إعادة رأس المال فقط.'],
    stNote: ['Note (required if below principal)', 'Note (obligatoire si inférieur au capital)', 'ملاحظة (إلزامية إن كان أقل من رأس المال)'], stOk: ['Credited to the member wallet', 'Crédité sur le portefeuille de la personne', 'تم الإيداع في محفظة العضو'],
    /* identité */
    kTitle: ['Identity checks', 'Vérifications d’identité', 'التحقق من الهوية'], kPending: ['To review', 'À examiner', 'للمراجعة'], kApproved: ['Accepted', 'Acceptées', 'مقبولة'], kRejected: ['Refused', 'Refusées', 'مرفوضة'],
    kReview: ['Review documents', 'Examiner les documents', 'مراجعة الوثائق'], kFront: ['ID front', 'Pièce recto', 'واجهة الهوية'], kBack: ['ID back', 'Pièce verso', 'ظهر الهوية'], kSelfie: ['Selfie', 'Selfie', 'صورة شخصية'],
    kChecks: ['Checklist (not blocking)', 'Contrôles (non bloquants)', 'قائمة التحقق (غير مانعة)'],
    kc1: ['The document is readable and not expired', 'Le document est lisible et non expiré', 'الوثيقة واضحة وغير منتهية'], kc2: ['Front and back belong to the same document', 'Recto et verso appartiennent au même document', 'الوجهان من الوثيقة نفسها'],
    kc3: ['The selfie matches the photo on the ID', 'Le selfie correspond à la photo de la pièce', 'الصورة الشخصية تطابق صورة الهوية'], kc4: ['The name matches the account name', 'Le nom correspond à celui du compte', 'الاسم يطابق اسم الحساب'], kc5: ['No sign of editing or screen photo', 'Aucune trace de retouche ni photo d’écran', 'لا أثر للتعديل أو تصوير شاشة'],
    kAccept: ['Accept', 'Accepter', 'قبول'], kRefuse: ['Refuse', 'Refuser', 'رفض'], kRefuseT: ['Refuse this identity check', 'Refuser cette vérification', 'رفض هذا التحقق'], kAcceptT: ['Accept this identity check', 'Accepter cette vérification', 'قبول هذا التحقق'],
    kAcceptD: ['The member becomes verified and receives an e-mail in Arabic.', 'La personne devient vérifiée et reçoit un e-mail en arabe.', 'يصبح العضو موثّقاً ويصله بريد إلكتروني بالعربية.'], kReason: ['Reason:', 'Motif :', 'السبب:'], zoomHint: ['Tap an image to zoom', 'Touchez une image pour zoomer', 'المس صورة للتكبير'],
    /* retraits */
    wTitle: ['Withdrawals', 'Retraits', 'السحوبات'], wPending: ['In review', 'En examen', 'قيد المراجعة'], wApproved: ['To transfer', 'À virer', 'للتحويل'], wPaid: ['Paid', 'Payés', 'مدفوعة'], wRej: ['Refused', 'Refusés', 'مرفوضة'],
    holder: ['Account holder', 'Titulaire', 'صاحب الحساب'], bank: ['Bank', 'Banque', 'البنك'], account: ['Account number', 'Numéro de compte', 'رقم الحساب'], iban: ['IBAN', 'IBAN', 'IBAN'],
    approve: ['Approve', 'Approuver', 'موافقة'], refuse: ['Refuse', 'Refuser', 'رفض'], markPaid: ['Mark as paid', 'Marquer comme payé', 'تحديد كمدفوع'], paidRef: ['Bank transfer reference', 'Référence du virement', 'مرجع التحويل المصرفي'],
    cfPaid: ['The bank transfer was really made.', 'Le virement a réellement été effectué.', 'تم فعلاً تنفيذ التحويل المصرفي.'], paidT: ['Mark as paid', 'Marquer comme payé', 'تحديد كمدفوع'],
    paidD: ['Only confirm once the money has left the bank. The member is notified and receives an e-mail in Arabic.', 'Ne confirmez qu’une fois l’argent parti de la banque. La personne est prévenue et reçoit un e-mail en arabe.', 'لا تؤكد إلا بعد خروج المبلغ من البنك. يُشعَر العضو ويصله بريد إلكتروني بالعربية.'],
    wApproveT: ['Approve this withdrawal', 'Approuver ce retrait', 'الموافقة على هذا السحب'], wApproveD: ['The funds stay reserved until you confirm the transfer.', 'Les fonds restent réservés jusqu’à la confirmation du virement.', 'تبقى الأموال محجوزة حتى تؤكد التحويل.'],
    wRefuseT: ['Refuse this withdrawal', 'Refuser ce retrait', 'رفض هذا السحب'], wRefuseD: ['The reserved funds go back to the member balance.', 'Les fonds réservés retournent sur le solde de la personne.', 'تعود الأموال المحجوزة إلى رصيد العضو.'], paidRefShow: ['Transfer ref.', 'Réf. virement', 'مرجع التحويل'],
    /* journal */
    aTitle: ['Audit log', 'Journal d’audit', 'سجل التدقيق'], aNote: ['The log is append-only: nothing can be edited or deleted.', 'Le journal est en ajout seul : aucune modification possible.', 'السجل للإضافة فقط: لا يمكن التعديل أو الحذف.'],
    aAll: ['All actions', 'Toutes les actions', 'كل الإجراءات'], aSearch: ['Search in the log', 'Chercher dans le journal', 'ابحث في السجل'], aExport: ['Export CSV', 'Exporter en CSV', 'تصدير CSV'], aActor: ['By', 'Par', 'بواسطة'], aTarget: ['On', 'Sur', 'على'], aUnavail: ['The log cannot be read with this account.', 'Le journal n’est pas lisible avec ce compte.', 'لا يمكن قراءة السجل بهذا الحساب.'],
    /* membres */
    uTitle: ['Members', 'Utilisateurs', 'الأعضاء'], uSearch: ['Name, phone, e-mail or ID', 'Nom, téléphone, e-mail ou ID', 'الاسم أو الهاتف أو البريد أو المعرّف'], uFile: ['Member file', 'Fiche du membre', 'ملف العضو'], uKyc: ['Identity', 'Identité', 'الهوية'],
    uInvest: ['Plans', 'Plans', 'الخطط'], uWd: ['Withdrawals', 'Retraits', 'السحوبات'], uCredit: ['Financing', 'Financements', 'التمويل'], uDeposit: ['Add money', 'Ajouter de l’argent', 'إضافة مبلغ'], uDepGo: ['Credit', 'Créditer', 'إيداع'],
    uDepConfirm: ['Credit {a} OMR to this member?', 'Créditer {a} OMR à cette personne ?', 'إيداع {a} ر.ع لهذا العضو؟'], uDepDone: ['Credited', 'Crédité', 'تم الإيداع'], uUnver: ['Not verified', 'Non vérifiée', 'غير موثّق'], uVer: ['Verified', 'Vérifiée', 'موثّق'],
    uPend: ['In review', 'En examen', 'قيد المراجعة'], uRej: ['Refused', 'Refusée', 'مرفوض'], uEmpty: ['No member found', 'Aucun membre trouvé', 'لا يوجد عضو'], uPhone: ['Phone', 'Téléphone', 'الهاتف'], uEmail: ['E-mail', 'E-mail', 'البريد'], uBal: ['Balance', 'Solde', 'الرصيد'],
    /* notifications */
    nTitle: ['Notifications', 'Notifications', 'الإشعارات'], nGo: ['Write an announcement', 'Rédiger une annonce', 'اكتب إعلاناً'], nGoD: ['Sent as a notification to every member and shown in the film.', 'Envoyée en notification à chaque membre et visible dans le film.', 'تُرسل كإشعار لكل عضو وتظهر في الفيلم.'],
    nT: ['Title', 'Titre', 'العنوان'], nB: ['Message', 'Message', 'الرسالة'], nSend: ['Send to everyone', 'Envoyer à tous', 'إرسال للجميع'], nDone: ['Sent to {n} members', 'Envoyée à {n} membres', 'أُرسل إلى {n} عضواً'], nActive: ['Active announcements', 'Annonces actives', 'الإعلانات الفعّالة'], nStop: ['Stop', 'Arrêter', 'إيقاف'],
    nConfirm: ['Send this to every member?', 'Envoyer ceci à chaque membre ?', 'إرسال هذا إلى كل عضو؟'], nBad: ['Add a title and a message.', 'Ajoutez un titre et un message.', 'أضف عنواناً ورسالة.'],
    /* plans */
    pTitle: ['Plans and settings', 'Plans et paramètres', 'الخطط والإعدادات'], pMin: ['Minimum (OMR)', 'Minimum (OMR)', 'الحد الأدنى (ر.ع)'], pMax: ['Maximum (OMR)', 'Maximum (OMR)', 'الحد الأقصى (ر.ع)'], pDays: ['Duration (days)', 'Durée (jours)', 'المدة (أيام)'],
    pActive: ['Plan active', 'Plan actif', 'الخطة فعّالة'], pModel: ['Financial model', 'Modèle financier', 'النموذج المالي'], pRate: ['Return over the duration (%)', 'Rendement sur la durée (%)', 'العائد على المدة (%)'],
    pValid: ['Model validated', 'Modèle validé', 'النموذج معتمد'], pNote: ['Justification of the model (min. 10 characters)', 'Justification du modèle (min. 10 caractères)', 'مبرّر النموذج (10 أحرف على الأقل)'],
    pWarn: ['As long as the model is not validated, NO gain is shown to members and only the principal can be returned.', 'Tant que le modèle n’est pas validé, AUCUN gain n’est affiché aux utilisateurs et seul le capital peut être rendu.', 'ما دام النموذج غير معتمد، لا يُعرض أي ربح للأعضاء ولا يمكن إعادة سوى رأس المال.'],
    pOverlap: ['These ranges overlap another active plan.', 'Ces montants chevauchent un autre plan actif.', 'هذه المبالغ تتداخل مع خطة فعّالة أخرى.'], pPay: ['Payment instructions', 'Instructions de paiement', 'تعليمات الدفع'],
    pPayD: ['Shown to members after they choose a plan.', 'Affichées aux utilisateurs après le choix d’un plan.', 'تظهر للأعضاء بعد اختيار الخطة.'], pBank: ['Bank name', 'Nom de la banque', 'اسم البنك'], pAccName: ['Account name', 'Nom du compte', 'اسم الحساب'],
    pAccNo: ['Account number', 'Numéro de compte', 'رقم الحساب'], pSwift: ['SWIFT', 'SWIFT', 'SWIFT'], pNoteEn: ['Instructions (English)', 'Instructions (anglais)', 'التعليمات (إنجليزي)'], pNoteFr: ['Instructions (French)', 'Instructions (français)', 'التعليمات (فرنسي)'], pNoteAr: ['Instructions (Arabic)', 'Instructions (arabe)', 'التعليمات (عربي)'],
    pPlat: ['Platform settings', 'Paramètres de la plateforme', 'إعدادات المنصة'], sInvest: ['Plans open', 'Plans ouverts', 'الخطط مفتوحة'], sKycInv: ['Identity required to subscribe', 'Identité requise pour souscrire', 'الهوية مطلوبة للاشتراك'],
    sKycWd: ['Identity required to withdraw', 'Identité requise pour retirer', 'الهوية مطلوبة للسحب'], sWd: ['Withdrawals open', 'Retraits ouverts', 'السحب مفتوح'], sWdMin: ['Minimum withdrawal (OMR)', 'Retrait minimum (OMR)', 'الحد الأدنى للسحب (ر.ع)'],
    sCredit: ['Financing requests open', 'Demandes de financement ouvertes', 'طلبات التمويل مفتوحة'], sCrMin: ['Financing minimum (OMR)', 'Financement minimum (OMR)', 'الحد الأدنى للتمويل (ر.ع)'], sCrMax: ['Financing maximum (OMR)', 'Financement maximum (OMR)', 'الحد الأقصى للتمويل (ر.ع)'],
    plan_ESSENTIAL: ['Essential', 'Essentiel', 'الأساسية'], plan_GROWTH: ['Growth', 'Croissance', 'النمو'], plan_PREMIUM: ['Premium', 'Premium', 'بريميوم'],
    /* erreurs serveur */
    e_plan_overlap: ['These amounts overlap another active plan.', 'Ces montants chevauchent un autre plan actif.', 'هذه المبالغ تتداخل مع خطة فعّالة أخرى.'],
    e_invalid_value: ['Invalid value.', 'Valeur invalide.', 'قيمة غير صالحة.'], e_model_incomplete: ['Enter the return rate before validating the model.', 'Saisissez le taux avant de valider le modèle.', 'أدخل نسبة العائد قبل اعتماد النموذج.'],
    e_model_note_required: ['The justification must have at least 10 characters.', 'La justification doit avoir au moins 10 caractères.', 'يجب أن يحتوي المبرّر على 10 أحرف على الأقل.'],
    e_not_matured: ['This plan has not reached its end date yet.', 'Ce plan n’a pas encore atteint son échéance.', 'لم تصل هذه الخطة إلى تاريخ انتهائها بعد.'],
    e_model_not_validated: ['Without a validated model, only the principal can be returned.', 'Sans modèle validé, seul le capital peut être rendu.', 'بدون نموذج معتمد لا يمكن إعادة سوى رأس المال.'],
    e_payout_above_model: ['This amount is above what the validated model allows.', 'Ce montant dépasse ce que permet le modèle validé.', 'هذا المبلغ يتجاوز ما يسمح به النموذج المعتمد.'],
    e_note_required: ['A note is required.', 'Une note est obligatoire.', 'الملاحظة إلزامية.'], e_reason_required: ['A reason is required.', 'Un motif est obligatoire.', 'السبب إلزامي.'],
    e_bank_reference_required: ['Enter the bank transfer reference (4 characters minimum).', 'Saisissez la référence du virement (4 caractères minimum).', 'أدخل مرجع التحويل المصرفي (4 أحرف على الأقل).'],
    e_invalid_state: ['This file was already handled.', 'Ce dossier a déjà été traité.', 'تمت معالجة هذا الملف مسبقاً.'], e_already_decided: ['This request was already decided.', 'Cette demande a déjà été décidée.', 'تم البت في هذا الطلب مسبقاً.'],
    e_not_found: ['File not found.', 'Dossier introuvable.', 'الملف غير موجود.'], e_forbidden: ['Administrators only.', 'Réservé aux administrateurs.', 'للمسؤولين فقط.'], e_recipient_not_found: ['Member not found.', 'Membre introuvable.', 'العضو غير موجود.'],
    e_invalid_amount: ['Invalid amount.', 'Montant invalide.', 'مبلغ غير صالح.']
  };
  ['en', 'fr', 'ar'].forEach((l, i) => { const o = {}; Object.keys(D).forEach(k => { o['a19.' + k] = D[k][i]; }); Strings.add({ [l]: o }); });

  const esc = s => escapeHtml(String(s == null ? '' : s));
  const a = (k, v) => { let s = t('a19.' + k); if (v) Object.keys(v).forEach(x => { s = s.split('{' + x + '}').join(v[x]); }); return s; };
  const N = () => Guardian.norm;
  const isAdmin = () => !!(typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.role === 'admin');
  const guard = () => { if (!isAdmin()){ setTimeout(() => { try { R.go('home', { reset: true }); } catch(x){ /* rien */ } }, 0); return false; } return true; };
  const ltr = s => '<span class="ltr" dir="ltr">' + esc(s) + '</span>';
  const money = n => { try { return CurrencyEngine.format(N().num(n), 'OMR'); } catch(x){ return N().num(n).toFixed(3) + ' OMR'; } };
  const fdate = v => { if (!v) return '—'; try { return new Date(v).toLocaleDateString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { day: '2-digit', month: 'short', year: 'numeric' }); } catch(x){ return String(v).slice(0, 10); } };
  const fdt = v => { if (!v) return '—'; try { return new Date(v).toLocaleString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch(x){ return String(v); } };
  const nm = r => (r && (r.full_name || r.yor_id)) ? (r.full_name || (typeof dispId === 'function' ? dispId(r.yor_id) : r.yor_id)) : '—';
  const yid = r => (r && r.yor_id) ? (typeof dispId === 'function' ? dispId(r.yor_id) : r.yor_id) : '';
  const ini = r => String(nm(r)).trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase() || '?';
  const sound = n => { try { Sfx.play(n); } catch(x){ /* rien */ } };
  const hap = k => { try { Fx.haptic(k); } catch(x){ /* rien */ } };
  const uid = () => { try { return crypto.randomUUID(); } catch(x){ return 'k-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };

  /* erreur serveur -> texte */
  function srvErr(er){
    const m = String((er && er.message) || '');
    const hit = /([a-z_]{5,})/.exec(m.replace(/^.*?:/, ''));
    const keys = Object.keys(D).filter(k => k.indexOf('e_') === 0);
    for (const k of keys) if (m.indexOf(k.slice(2)) !== -1) return a(k);
    void hit;
    const k = er && er.key; return k && k !== 'errors.UNKNOWN_ERROR' ? t(k) : t('errors.UNKNOWN_ERROR');
  }

  /* ---------- gabarits ---------- */
  const top = title => '<div class="topbar a19-top"><button class="topbar-back" data-action="back" aria-label="' + esc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button>' +
    '<span class="topbar-title">' + esc(title) + '</span><span class="a19-badge">' + icon('admin', 14) + esc(a('badge')) + '</span></div>';
  const page = (id, title, inner) => '<div class="a19" data-a19="' + id + '" dir="' + (LANG === 'ar' ? 'rtl' : 'ltr') + '">' + top(title) + '<div class="screen-body a19-body">' + inner + '</div></div>';
  const chip = (st, label) => '<span class="a19-st st-' + esc(String(st).toLowerCase()) + '">' + esc(label || a('s' + st)) + '</span>';
  const skel = n => Array.from({ length: n || 3 }, () => '<div class="a19-skel"></div>').join('');
  const empty = txt => '<div class="a19-empty">' + icon('info', 22) + '<span>' + esc(txt || a('none')) + '</span></div>';
  const logged = () => { toast(a('logged'), 'success'); sound('success'); hap('success'); };

  /* ---------- feuille modale ---------- */
  function sheet(html, wire){
    const close = R.overlay.open('<div class="a19-sheet" dir="' + (LANG === 'ar' ? 'rtl' : 'ltr') + '">' + html + '</div>', { kind: 'modal' });
    setTimeout(() => { const all = document.querySelectorAll('.a19-sheet'), root = all[all.length - 1]; if (root && wire) try { wire(root, close); } catch(x){ console.error(x); } }, 80);
    sound('open');
    return close;
  }
  /* confirmation avec champ (motif / note) et case à cocher facultatives */
  function ask(o){
    return new Promise(res => {
      let done = false;
      const fin = v => { if (done) return; done = true; res(v); };
      const html = '<h2>' + esc(o.title) + '</h2>' + (o.text ? '<p>' + esc(o.text) + '</p>' : '') + (o.warn ? '<p class="a19-warn">' + icon('info', 16) + '<span>' + esc(o.warn) + '</span></p>' : '') +
        (o.amount ? '<label class="a19-lbl">' + esc(o.amount.label) + '<span class="field-box"><input type="text" inputmode="decimal" dir="ltr" data-f="amount" value="' + esc(o.amount.value) + '"></span></label>' : '') +
        (o.field ? '<label class="a19-lbl">' + esc(o.field.label) + '<span class="field-box"><input type="text" maxlength="' + (o.field.max || 300) + '" data-f="text" placeholder="' + esc(o.field.ph || '') + '"></span></label>' : '') +
        (o.check ? '<label class="a19-chk"><input type="checkbox" data-f="check"><span>' + esc(o.check) + '</span></label>' : '') +
        '<div class="a19-err" role="alert" data-f="err"></div>' +
        '<div class="a19-btns"><button type="button" class="btn btn-ghost" data-f="no">' + esc(a('cancel')) + '</button><button type="button" class="btn ' + (o.danger ? 'a19-danger' : 'btn-primary') + '" data-f="ok">' + esc(o.ok || a('confirm')) + '</button></div>';
      sheet(html, (root, close) => {
        const q = s => root.querySelector('[data-f="' + s + '"]');
        const ok = q('ok');
        q('no').onclick = () => { close(); fin(null); };
        ok.onclick = async () => {
          const val = { text: q('text') ? q('text').value.trim() : '', amount: q('amount') ? parseFloat(String(q('amount').value).replace(',', '.')) : null };
          if (o.check && !q('check').checked){ q('err').textContent = o.check; Fx.shake(root); sound('error'); return; }
          if (o.field && o.field.required && val.text.length < (o.field.min || 3)){ q('err').textContent = o.field.err || a('e_reason_required'); Fx.shake(root); sound('error'); return; }
          if (o.amount && !(val.amount > 0)){ q('err').textContent = a('e_invalid_amount'); Fx.shake(root); sound('error'); return; }
          UIKit.loading(ok, true);
          const r = await o.run(val);
          UIKit.loading(ok, false);
          if (r && r.error){ q('err').textContent = r.error; Fx.shake(root); sound('error'); return; }
          close(); fin(true);
        };
        const f = q('text') || q('amount'); if (f) try { f.focus({ preventScroll: true }); } catch(x){ /* rien */ }
      });
      setTimeout(() => { if (!document.querySelector('.a19-sheet')) fin(null); }, 600);
    });
  }

  /* ---------- médias privés : URL signée + visionneuse avec zoom ---------- */
  async function signed(bucket, path, ttl){
    const r = await Guardian.query(() => sb.storage.from(bucket).createSignedUrl(path, ttl), { retries: 1 });
    return r.ok && r.data && r.data.signedUrl ? r.data.signedUrl : null;
  }
  function viewer(items, start){
    const list = items.filter(Boolean); if (!list.length) return;
    let i = start || 0, z = 1, tx = 0, ty = 0;
    const html = '<div class="a19-vw"><div class="a19-vw-bar"><b data-v="cap"></b><span><button type="button" data-v="prev" aria-label="prev">' + icon('back', 18) + '</button><button type="button" data-v="next" aria-label="next"><span style="display:inline-flex;transform:scaleX(-1)">' + icon('back', 18) + '</span></button><button type="button" data-v="close" aria-label="' + esc(a('close')) + '">' + icon('close', 18) + '</button></span></div>' +
      '<div class="a19-vw-st" data-v="stage"><img data-v="img" alt="" draggable="false"></div><div class="a19-vw-ft"><button type="button" data-v="out">−</button><button type="button" data-v="rst">1:1</button><button type="button" data-v="in">+</button></div></div>';
    const host = document.createElement('div'); host.innerHTML = html; const root = host.firstChild; document.body.appendChild(root);
    const onKey = e => { if (e.key === 'Escape') close(); };
    const close = () => { document.removeEventListener('keydown', onKey); root.remove(); };
    document.addEventListener('keydown', onKey);
    setTimeout(() => {
      const q = s => root.querySelector('[data-v="' + s + '"]'), img = q('img');
      const paint = () => { img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')'; };
      const show = () => { z = 1; tx = ty = 0; img.src = list[i].url; q('cap').textContent = (list[i].label || '') + (list.length > 1 ? '  ' + (i + 1) + '/' + list.length : ''); paint(); };
      q('close').onclick = () => close(); q('prev').onclick = () => { i = (i + list.length - 1) % list.length; show(); }; q('next').onclick = () => { i = (i + 1) % list.length; show(); };
      q('in').onclick = () => { z = Math.min(6, z * 1.4); paint(); }; q('out').onclick = () => { z = Math.max(1, z / 1.4); if (z === 1){ tx = ty = 0; } paint(); }; q('rst').onclick = () => { z = 1; tx = ty = 0; paint(); };
      const st = q('stage'); let drag = null;
      st.addEventListener('wheel', e => { e.preventDefault(); z = Math.min(6, Math.max(1, z * (e.deltaY < 0 ? 1.15 : 0.87))); if (z === 1){ tx = ty = 0; } paint(); }, { passive: false });
      st.addEventListener('pointerdown', e => { drag = { x: e.clientX - tx, y: e.clientY - ty }; try { st.setPointerCapture(e.pointerId); } catch(x){ /* rien */ } });
      st.addEventListener('pointermove', e => { if (drag && z > 1){ tx = e.clientX - drag.x; ty = e.clientY - drag.y; paint(); } });
      st.addEventListener('pointerup', () => { drag = null; });
      st.addEventListener('dblclick', () => { z = z > 1 ? 1 : 2.5; if (z === 1){ tx = ty = 0; } paint(); });
      show();
    }, 80);
  }

  /* ---------- liste générique : onglets, recherche, tableau sur grand écran ---------- */
  const store = {};   /* id -> état */
  function listPage(id, title, cfg){
    const S = store[id] || (store[id] = { tab: cfg.tabs[0].k, q: '', items: null, err: false });
    S.cfg = cfg;
    const tabs = '<div class="a19-tabs" role="tablist">' + cfg.tabs.map(tb => '<button type="button" role="tab" class="a19-tab' + (S.tab === tb.k ? ' on' : '') + '" data-tab="' + tb.k + '" aria-selected="' + (S.tab === tb.k) + '">' + esc(a(tb.l)) + '<em data-cnt="' + tb.k + '" hidden></em></button>').join('') + '</div>';
    return page(id, title, '<div class="a19-tools">' + (cfg.search ? '<label class="a19-search">' + icon('search', 16) + '<input type="search" data-q placeholder="' + esc(a('search')) + '" value="' + esc(S.q) + '" autocomplete="off"></label>' : '<span></span>') +
      '<button type="button" class="a19-ref" data-ref aria-label="' + esc(a('refresh')) + '">' + icon('refresh', 18) + '</button></div>' + tabs + '<div class="a19-head" hidden></div><div class="a19-list" data-list>' + skel(3) + '</div>');
  }
  function wireList(id, root){
    const S = store[id], cfg = S.cfg, wrap = root.querySelector('.a19'); if (!wrap) return;
    const list = wrap.querySelector('[data-list]'), head = wrap.querySelector('.a19-head');
    head.innerHTML = cfg.cols.slice(0, -1).map(c => '<span>' + esc(a(c)) + '</span>').join(''); wrap.style.setProperty('--n', cfg.cols.length - 1);
    const match = it => { const q = S.q.trim().toLowerCase(); if (!q) return true; return JSON.stringify([it.full_name, it.yor_id, it.phone, it.reference, it.email, it.holder, it.iban]).toLowerCase().indexOf(q) !== -1; };
    const paint = () => {
      if (!wrap.isConnected) return;
      if (S.err){ list.innerHTML = '<div class="a19-empty">' + icon('info', 22) + '<span>' + esc(a('err')) + '</span><button type="button" class="a19-link" data-ref>' + esc(a('retry')) + '</button></div>'; head.hidden = true; return; }
      if (!S.items){ list.innerHTML = skel(3); return; }
      wrap.querySelectorAll('[data-cnt]').forEach(el => { const n = S.items.filter(cfg.tabs.find(x => x.k === el.getAttribute('data-cnt')).f).length; el.textContent = n; el.hidden = !n; });
      const tab = cfg.tabs.find(x => x.k === S.tab) || cfg.tabs[0];
      const rows = S.items.filter(tab.f).filter(match);
      head.hidden = !rows.length;
      list.innerHTML = rows.length ? rows.map((it, i) => '<article class="a19-row fx-in" style="animation-delay:' + Math.min(i, 12) * 40 + 'ms" data-id="' + esc(it.id) + '">' + cfg.row(it, tab.k) + '</article>').join('') : empty();
    };
    const load = async () => {
      S.err = false; if (!S.items) paint();
      const r = await cfg.load();
      if (!wrap.isConnected) return;
      if (r.ok){ S.items = N().arr(r.data); } else if (!S.items){ S.err = true; }
      paint(); if (cfg.after) cfg.after(S);
    };
    S.reload = load;
    wrap.addEventListener('click', async ev => {
      const b = ev.target.closest('[data-tab],[data-ref],[data-act],[data-copy],[data-chat]'); if (!b) return;
      if (b.hasAttribute('data-tab')){ S.tab = b.getAttribute('data-tab'); wrap.querySelectorAll('.a19-tab').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); }); sound('tick'); paint(); return; }
      if (b.hasAttribute('data-ref')){ sound('tap'); load(); return; }
      if (b.hasAttribute('data-copy')){ try { navigator.clipboard.writeText(b.getAttribute('data-copy')); } catch(x){ /* rien */ } toast(a('copied'), 'success'); sound('tick'); return; }
      const row = b.closest('[data-id]'); const it = row && S.items.find(x => String(x.id) === row.getAttribute('data-id')); if (!it) return;
      if (b.hasAttribute('data-chat')){ openChat(it); return; }
      if (cfg.act) { await cfg.act(b.getAttribute('data-act'), it, { reload: load, root: wrap, btn: b }); }
    });
    const qi = wrap.querySelector('[data-q]'); if (qi) qi.addEventListener('input', Guardian.debounce(() => { S.q = qi.value; paint(); }, 160));
    load();
    const stop = Guardian.every(load, 20000); R.onLeave(stop);
  }
  function openChat(it){
    try { if (typeof Chat !== 'undefined' && Chat.openThread){ Chat.openThread(it.user_id, { name: nm(it), yor_id: it.yor_id, phone: it.phone }); return; } } catch(x){ /* rien */ }
    try { R.go('admin-chat'); } catch(x){ /* rien */ }
  }
  const person = r => '<div class="a19-c a19-who" data-l="' + esc(a('person')) + '"><span class="a19-ava">' + esc(ini(r)) + '</span><span><b>' + esc(nm(r)) + '</b><small>' + ltr(yid(r)) + (r.phone ? ' · ' + ltr(r.phone) : '') + '</small></span></div>';
  const cell = (label, html) => '<div class="a19-c" data-l="' + esc(label) + '">' + html + '</div>';
  const btn = (act, label, cls, ic) => '<button type="button" class="btn ' + (cls || 'btn-secondary') + ' a19-b" data-act="' + act + '">' + (ic ? icon(ic, 16) : '') + '<span>' + esc(label) + '</span></button>';
  const chatBtn = () => '<button type="button" class="btn btn-ghost a19-b" data-chat>' + icon('chat', 16) + '<span>' + esc(a('chatWith')) + '</span></button>';
  const copyBtn = (v) => v ? '<button type="button" class="a19-cp" data-copy="' + esc(v) + '" aria-label="' + esc(a('copy')) + '">' + icon('copy', 14) + '</button>' : '';

  /* ====================== PAIEMENTS / PLANS (dossiers) ====================== */
  const isDue = it => it.status === 'MATURED' || (it.status === 'ACTIVE' && it.ends_at && new Date(it.ends_at).getTime() <= Date.now());
  const INV = {
    tabs: [
      { k: 'proofs', l: 'iProofs', f: x => x.status === 'PROOF_SENT' }, { k: 'await', l: 'iAwait', f: x => x.status === 'AWAITING_PAYMENT' },
      { k: 'active', l: 'iActive', f: x => x.status === 'ACTIVE' && !isDue(x) }, { k: 'due', l: 'iDue', f: isDue },
      { k: 'settled', l: 'iSettled', f: x => x.status === 'SETTLED' }, { k: 'rej', l: 'iRej', f: x => x.status === 'REJECTED' || x.status === 'CANCELLED' }
    ],
    cols: ['person', 'plan', 'amount', 'date', 'status', 'actions'], search: true,
    load: () => Guardian.rpc('admin_invest_list', { p_status: null, p_limit: 300 }),
    row: (it, tab) => {
      const st = isDue(it) && it.status === 'ACTIVE' ? 'MATURED' : it.status;
      return person(it) +
        cell(a('plan'), '<b>' + esc(a('plan_' + it.plan_code)) + '</b><small>' + esc(a('days', { n: it.duration_days })) + ' · ' + ltr(it.reference) + '</small>') +
        cell(a('amount'), '<b class="a19-num">' + esc(money(it.amount)) + '</b>' + (it.status === 'SETTLED' ? '<small>' + esc(money(it.payout)) + '</small>' : '')) +
        cell(a('date'), '<small>' + esc(fdt(it.proof_sent_at || it.created_at)) + '</small>' + (it.ends_at ? '<small>' + esc(a('ends')) + ' ' + esc(fdate(it.ends_at)) + '</small>' : '')) +
        cell(a('status'), chip(st) + (it.rejected_reason ? '<small>' + esc(it.rejected_reason) + '</small>' : '')) +
        '<div class="a19-act">' +
          (it.status === 'PROOF_SENT' ? '<div class="a19-proof" data-proof="' + esc(it.proof_message || '') + '"></div>' + btn('proof', a('viewProof'), 'btn-secondary', 'image') + btn('confirm', a('confirmFunds'), 'btn-primary', 'check') + btn('reject', a('rejectPay'), 'a19-danger', 'close') : '') +
          (it.status === 'AWAITING_PAYMENT' ? btn('reject', a('rejectPay'), 'a19-danger', 'close') : '') +
          (isDue(it) ? btn('settle', a('settle'), 'btn-primary', 'banknote') : '') + chatBtn() + '</div>';
    },
    act: async (act, it, c) => {
      if (act === 'proof') return showProof(it, c.btn);
      if (act === 'confirm'){
        const ok = await ask({ title: a('cfFundsT'), text: a('cfFundsD') + '  ' + nm(it) + ' · ' + money(it.amount) + ' · ' + it.reference, check: a('cfChecked'), field: { label: a('note'), required: false }, ok: a('confirmFunds'),
          run: async v => { const r = await Guardian.rpc('admin_invest_confirm', { p_id: it.id, p_note: v.text || null }); return r.ok ? null : { error: srvErr(r.error) }; } });
        if (ok){ logged(); Fx.confetti(null, { n: 60 }); c.reload(); }
      } else if (act === 'reject'){
        const ok = await ask({ title: a('rjT'), text: nm(it) + ' · ' + money(it.amount) + ' · ' + it.reference, field: { label: a('reason'), required: true }, ok: a('rejectPay'), danger: true,
          run: async v => { const r = await Guardian.rpc('admin_invest_reject', { p_id: it.id, p_reason: v.text }); return r.ok ? null : { error: srvErr(r.error) }; } });
        if (ok){ logged(); c.reload(); }
      } else if (act === 'settle'){
        const ok = await ask({ title: a('stT'), text: nm(it) + ' · ' + a('plan_' + it.plan_code) + ' · ' + money(it.amount), warn: it.model_validated ? '' : a('stWarn'), amount: { label: a('stPayout'), value: N().num(it.amount).toFixed(3) },
          field: { label: a('stNote'), required: false }, ok: a('settle'),
          run: async v => { const r = await Guardian.rpc('admin_invest_settle', { p_id: it.id, p_payout: v.amount, p_note: v.text || null }); return r.ok ? null : { error: srvErr(r.error) }; } });
        if (ok){ logged(); toast(a('stOk'), 'success'); c.reload(); }
      }
    }
  };
  async function showProof(it, b){
    if (!it.proof_message){ toast(a('noProof'), 'error'); return; }
    UIKit.loading(b, true);
    const m = await Guardian.query(() => sb.from('chat_messages').select('*').eq('id', it.proof_message).maybeSingle(), { retries: 1 });
    const msg = m.ok && m.data ? Guardian.norm.msg(m.data) : null;
    const url = msg && msg.path ? await signed('chat-media', msg.path, 600) : null;
    UIKit.loading(b, false);
    if (!url){ toast(a('proofFail'), 'error'); sound('error'); return; }
    if (msg.kind === 'image') viewer([{ url, label: it.reference }]);
    else sheet('<h2>' + esc(it.reference) + '</h2><iframe class="a19-pdf" src="' + esc(url) + '" title="PDF"></iframe><a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(url) + '">' + esc(a('openPdf')) + '</a>');
  }

  /* ====================== IDENTITÉ ====================== */
  const KYC = {
    tabs: [{ k: 'p', l: 'kPending', f: x => x.status === 'PENDING' }, { k: 'a', l: 'kApproved', f: x => x.status === 'APPROVED' }, { k: 'r', l: 'kRejected', f: x => x.status === 'REJECTED' }],
    cols: ['person', 'date', 'status', 'actions'], search: true,
    load: () => Guardian.rpc('admin_kyc_list', { p_status: null, p_limit: 300 }),
    row: it => person(it) + cell(a('date'), '<small>' + esc(fdt(it.created_at)) + '</small>' + (it.decided_at ? '<small>' + esc(fdt(it.decided_at)) + '</small>' : '')) +
      cell(a('status'), chip(it.status) + (it.reason ? '<small>' + esc(a('kReason')) + ' ' + esc(it.reason) + '</small>' : '')) +
      '<div class="a19-act">' + btn('review', a('kReview'), it.status === 'PENDING' ? 'btn-primary' : 'btn-secondary', 'image') + chatBtn() + '</div>',
    act: async (act, it, c) => { if (act === 'review') reviewKyc(it, c.reload); }
  };
  async function reviewKyc(it, reload){
    const close0 = sheet('<h2>' + esc(a('kReview')) + '</h2><div class="a19-skel"></div><div class="a19-skel"></div>');
    const [f, b, s] = await Promise.all([signed('kyc-docs', it.front_path, 300), signed('kyc-docs', it.back_path, 300), signed('kyc-docs', it.selfie_path, 300)]);
    close0();
    const imgs = [{ url: f, label: a('kFront') }, { url: b, label: a('kBack') }, { url: s, label: a('kSelfie') }];
    const thumbs = imgs.map((x, i) => '<figure class="a19-th" data-i="' + i + '">' + (x.url ? '<img src="' + esc(x.url) + '" alt="' + esc(x.label) + '" loading="lazy">' : '<span class="a19-th-x">' + icon('info', 20) + '</span>') + '<figcaption>' + esc(x.label) + '</figcaption></figure>').join('');
    const pending = it.status === 'PENDING';
    const checks = ['kc1', 'kc2', 'kc3', 'kc4', 'kc5'].map(k => '<label class="a19-chk"><input type="checkbox"><span>' + esc(a(k)) + '</span></label>').join('');
    sheet('<h2>' + esc(nm(it)) + '</h2><p class="a19-sub">' + ltr(yid(it)) + ' · ' + esc(fdt(it.created_at)) + '</p><div class="a19-ths">' + thumbs + '</div><p class="a19-hint">' + esc(a('zoomHint')) + '</p>' +
      (pending ? '<h3>' + esc(a('kChecks')) + '</h3><div class="a19-checks">' + checks + '</div><div class="a19-btns"><button type="button" class="btn a19-danger" data-f="no">' + esc(a('kRefuse')) + '</button><button type="button" class="btn btn-primary" data-f="ok">' + esc(a('kAccept')) + '</button></div>' : (it.reason ? '<p>' + esc(a('kReason')) + ' ' + esc(it.reason) + '</p>' : '')),
      (root, close) => {
        root.querySelectorAll('.a19-th').forEach(el => el.onclick = () => { const i = +el.getAttribute('data-i'); const ok = imgs.filter(x => x.url); viewer(ok, Math.max(0, ok.indexOf(imgs[i]))); });
        const no = root.querySelector('[data-f="no"]'), ok = root.querySelector('[data-f="ok"]'); if (!no) return;
        ok.onclick = async () => {
          close();
          const done = await ask({ title: a('kAcceptT'), text: a('kAcceptD'), ok: a('kAccept'), run: async () => { const r = await Guardian.rpc('admin_kyc_decide', { p_id: it.id, p_approve: true, p_reason: null }); return r.ok ? null : { error: srvErr(r.error) }; } });
          if (done){ logged(); Fx.confetti(null, { n: 60 }); } reload();
        };
        no.onclick = async () => {
          close();
          const done = await ask({ title: a('kRefuseT'), field: { label: a('reason'), required: true }, ok: a('kRefuse'), danger: true, run: async v => { const r = await Guardian.rpc('admin_kyc_decide', { p_id: it.id, p_approve: false, p_reason: v.text }); return r.ok ? null : { error: srvErr(r.error) }; } });
          if (done) logged(); reload();
        };
      });
  }

  /* ====================== RETRAITS ====================== */
  const WD = {
    tabs: [{ k: 'p', l: 'wPending', f: x => x.status === 'PENDING' }, { k: 'a', l: 'wApproved', f: x => x.status === 'APPROVED' }, { k: 'd', l: 'wPaid', f: x => x.status === 'PAID' }, { k: 'r', l: 'wRej', f: x => x.status === 'REJECTED' || x.status === 'CANCELLED' }],
    cols: ['person', 'holder', 'amount', 'status', 'actions'], search: true,
    load: () => Guardian.rpc('admin_withdrawal_list', { p_status: null, p_limit: 300 }),
    row: it => person(it) +
      cell(a('holder'), '<b>' + esc(it.holder) + '</b><small>' + esc(it.bank_name) + '</small><small>' + esc(a('account')) + ': ' + ltr(it.account_number) + copyBtn(it.account_number) + '</small>' + (it.iban ? '<small>' + esc(a('iban')) + ': ' + ltr(it.iban) + copyBtn(it.iban) + '</small>' : '')) +
      cell(a('amount'), '<b class="a19-num">' + esc(money(it.amount)) + '</b><small>' + ltr(it.reference) + '</small><small>' + esc(fdt(it.created_at)) + '</small>') +
      cell(a('status'), chip(it.status) + (it.paid_ref ? '<small>' + esc(a('paidRefShow')) + ' ' + ltr(it.paid_ref) + '</small>' : '') + (it.admin_note ? '<small>' + esc(it.admin_note) + '</small>' : '')) +
      '<div class="a19-act">' + (it.status === 'PENDING' ? btn('approve', a('approve'), 'btn-primary', 'check') + btn('refuse', a('refuse'), 'a19-danger', 'close') : '') + (it.status === 'APPROVED' ? btn('paid', a('markPaid'), 'btn-primary', 'bank') + btn('refuse', a('refuse'), 'a19-danger', 'close') : '') + chatBtn() + '</div>',
    act: async (act, it, c) => {
      const sum = nm(it) + ' · ' + money(it.amount) + ' · ' + it.reference;
      if (act === 'approve'){ const ok = await ask({ title: a('wApproveT'), text: a('wApproveD') + '  ' + sum, field: { label: a('note'), required: false }, ok: a('approve'), run: async v => { const r = await Guardian.rpc('admin_withdrawal_decide', { p_id: it.id, p_approve: true, p_note: v.text || null }); return r.ok ? null : { error: srvErr(r.error) }; } }); if (ok){ logged(); c.reload(); } }
      else if (act === 'refuse'){ const ok = await ask({ title: a('wRefuseT'), text: a('wRefuseD') + '  ' + sum, field: { label: a('reason'), required: true }, ok: a('refuse'), danger: true, run: async v => { const r = await Guardian.rpc('admin_withdrawal_decide', { p_id: it.id, p_approve: false, p_note: v.text }); return r.ok ? null : { error: srvErr(r.error) }; } }); if (ok){ logged(); c.reload(); } }
      else if (act === 'paid'){ const ok = await ask({ title: a('paidT'), text: a('paidD') + '  ' + sum, field: { label: a('paidRef'), required: true, min: 4, max: 60, err: a('e_bank_reference_required') }, check: a('cfPaid'), ok: a('markPaid'),
          run: async v => { const r = await Guardian.rpc('admin_withdrawal_mark_paid', { p_id: it.id, p_bank_ref: v.text }); return r.ok ? null : { error: srvErr(r.error) }; } }); if (ok){ logged(); Fx.confetti(null, { n: 50 }); c.reload(); } }
    }
  };

  /* ====================== JOURNAL ====================== */
  const AUD = { items: null, err: false, q: '', act: '' };
  function auditPage(){
    return page('admin-audit', a('aTitle'), '<p class="a19-note">' + icon('lock', 16) + '<span>' + esc(a('aNote')) + '</span></p><div class="a19-tools"><label class="a19-search">' + icon('search', 16) + '<input type="search" data-q placeholder="' + esc(a('aSearch')) + '" value="' + esc(AUD.q) + '"></label>' +
      '<select class="a19-sel" data-act aria-label="' + esc(a('aAll')) + '"><option value="">' + esc(a('aAll')) + '</option></select><button type="button" class="btn btn-secondary a19-b" data-exp>' + esc(a('aExport')) + '</button><button type="button" class="a19-ref" data-ref aria-label="' + esc(a('refresh')) + '">' + icon('refresh', 18) + '</button></div><div class="a19-list" data-list>' + skel(4) + '</div>');
  }
  function auditWire(root){
    const wrap = root.querySelector('.a19'); if (!wrap) return;
    const list = wrap.querySelector('[data-list]'), sel = wrap.querySelector('[data-act]');
    const view = () => { const q = AUD.q.trim().toLowerCase(); return (AUD.items || []).filter(r => (!AUD.act || r.action === AUD.act) && (!q || JSON.stringify(r).toLowerCase().indexOf(q) !== -1)); };
    const paint = () => {
      if (AUD.err){ list.innerHTML = empty(a('aUnavail')); return; }
      if (!AUD.items){ list.innerHTML = skel(4); return; }
      const acts = Array.from(new Set(AUD.items.map(r => r.action))).sort(); sel.innerHTML = '<option value="">' + esc(a('aAll')) + '</option>' + acts.map(x => '<option value="' + esc(x) + '"' + (x === AUD.act ? ' selected' : '') + '>' + esc(x) + '</option>').join('');
      const rows = view();
      list.innerHTML = rows.length ? '<div class="a19-table">' + rows.map((r, i) => '<article class="a19-row a19-log fx-in" style="animation-delay:' + Math.min(i, 12) * 25 + 'ms"><div class="a19-c" data-l="' + esc(a('date')) + '"><small>' + esc(fdt(r.created_at)) + '</small></div><div class="a19-c" data-l="' + esc(a('actions')) + '"><b>' + esc(r.action) + '</b></div>' +
        '<div class="a19-c" data-l="' + esc(a('aActor')) + '"><small>' + ltr(String(r.actor_id || '').slice(0, 8)) + '</small></div><div class="a19-c" data-l="' + esc(a('aTarget')) + '"><small>' + ltr(String(r.target_id || '').slice(0, 8)) + '</small></div>' +
        '<div class="a19-c a19-json" data-l="">' + ltr(JSON.stringify(r.details || {})) + '</div></article>').join('') + '</div>' : empty();
    };
    const load = async () => { const r = await Guardian.query(() => sb.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200), { retries: 1 }); if (!wrap.isConnected) return; AUD.err = !r.ok; if (r.ok) AUD.items = N().arr(r.data); paint(); };
    wrap.addEventListener('click', ev => {
      if (ev.target.closest('[data-ref]')){ sound('tap'); load(); }
      if (ev.target.closest('[data-exp]')){
        const esq = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
        const csv = ['created_at,action,actor_id,target_id,details'].concat(view().map(r => [r.created_at, r.action, r.actor_id, r.target_id, JSON.stringify(r.details || {})].map(esq).join(','))).join('\n');
        try { const u = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); const l = document.createElement('a'); l.href = u; l.download = 'audit-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); sound('success'); } catch(x){ /* rien */ }
      }
    });
    wrap.querySelector('[data-q]').addEventListener('input', Guardian.debounce(e => { AUD.q = e.target.value; paint(); }, 160));
    sel.addEventListener('change', () => { AUD.act = sel.value; paint(); });
    load();
  }

  /* ====================== MEMBRES ====================== */
  const USR = { q: '', items: null };
  function usersPage(){
    return page('admin-users', a('uTitle'), '<div class="a19-tools"><label class="a19-search">' + icon('search', 16) + '<input type="search" data-q placeholder="' + esc(a('uSearch')) + '" value="' + esc(USR.q) + '" autocomplete="off"></label></div><div class="a19-list" data-list>' + skel(4) + '</div>');
  }
  function usersWire(root){
    const wrap = root.querySelector('.a19'); if (!wrap) return;
    const list = wrap.querySelector('[data-list]'); let seq = 0;
    const paint = () => {
      if (!USR.items){ list.innerHTML = skel(4); return; }
      list.innerHTML = USR.items.length ? USR.items.map((u, i) => '<article class="a19-row fx-in a19-u" style="animation-delay:' + Math.min(i, 12) * 35 + 'ms" data-i="' + i + '" role="button" tabindex="0">' + person(u) +
        cell(a('uKyc'), '<small>' + esc((u.email || '')) + '</small>') + cell(a('date'), '<small>' + esc(fdate(u.created_at)) + '</small>') + '<div class="a19-act"><span class="a19-go">' + icon('chev', 16) + '</span></div></article>').join('') : empty(a('uEmpty'));
    };
    const load = async () => {
      const my = ++seq, q = USR.q.trim();
      const r = q.length >= 2 ? await Guardian.rpc('admin_search_users', { p_query: q }, { read: true }) : await Guardian.rpc('admin_recent_users', { p_limit: 30 });
      if (my !== seq || !wrap.isConnected) return;
      USR.items = r.ok ? N().arr(r.data) : []; paint();
    };
    wrap.querySelector('[data-q]').addEventListener('input', Guardian.debounce(e => { USR.q = e.target.value; load(); }, 260));
    const open = ev => { const row = ev.target.closest('[data-i]'); if (row) memberSheet(USR.items[+row.getAttribute('data-i')]); };
    list.addEventListener('click', open); list.addEventListener('keydown', e => { if (e.key === 'Enter') open(e); });
    load();
  }
  async function memberSheet(u){
    if (!u) return;
    const close0 = sheet('<h2>' + esc(nm(u)) + '</h2><div class="a19-skel"></div><div class="a19-skel"></div>');
    const [ov, kyc, inv, wd, cr] = await Promise.all([Guardian.rpc('admin_user_overview', { p_yor_id: u.yor_id }), Guardian.rpc('admin_kyc_list', { p_status: null, p_limit: 300 }), Guardian.rpc('admin_invest_list', { p_status: null, p_limit: 300 }),
      Guardian.rpc('admin_withdrawal_list', { p_status: null, p_limit: 300 }), Guardian.rpc('admin_credit_list', { p_status: null, p_limit: 300 })]);
    close0();
    const mine = r => N().arr(r.data).filter(x => x.yor_id === u.yor_id);
    const kl = mine(kyc)[0], p = (ov.ok && ov.data && ov.data.profile) || u;
    const kst = p.kyc && p.kyc.status ? p.kyc.status : (kl ? (kl.status === 'APPROVED' ? 'VERIFIED' : kl.status) : 'UNVERIFIED');
    const kl18 = { VERIFIED: a('uVer'), PENDING: a('uPend'), REJECTED: a('uRej'), APPROVED: a('uVer') }[kst] || a('uUnver');
    const accs = ov.ok && ov.data ? N().arr(ov.data.accounts) : [];
    const mini = (title, rows, fmt) => '<h3>' + esc(title) + ' <em>' + rows.length + '</em></h3>' + (rows.length ? rows.slice(0, 6).map(fmt).join('') : '<p class="a19-hint">' + esc(a('none')) + '</p>');
    sheet('<div class="a19-who a19-who-l"><span class="a19-ava big">' + esc(ini(u)) + '</span><span><b>' + esc(nm(u)) + '</b><small>' + ltr(yid(u)) + '</small></span></div>' +
      '<div class="a19-kv"><span>' + esc(a('uPhone')) + '</span><b>' + ltr(p.phone || u.phone || '—') + '</b></div><div class="a19-kv"><span>' + esc(a('uEmail')) + '</span><b>' + ltr(p.email || u.email || '—') + '</b></div>' +
      '<div class="a19-kv"><span>' + esc(a('uKyc')) + '</span><b>' + esc(kl18) + '</b></div>' + accs.map(x => '<div class="a19-kv"><span>' + esc(a('uBal')) + '</span><b>' + esc(money(x.balance)) + '</b></div>').join('') +
      mini(a('uInvest'), mine(inv), x => '<div class="a19-mini">' + esc(a('plan_' + x.plan_code)) + ' · ' + esc(money(x.amount)) + ' ' + chip(x.status) + '</div>') +
      mini(a('uWd'), mine(wd), x => '<div class="a19-mini">' + esc(money(x.amount)) + ' · ' + esc(x.bank_name) + ' ' + chip(x.status) + '</div>') +
      mini(a('uCredit'), mine(cr), x => '<div class="a19-mini">' + esc(money(x.amount)) + ' ' + chip(x.status) + '</div>') +
      '<div class="a19-btns"><button type="button" class="btn btn-secondary" data-f="chat">' + icon('chat', 16) + '<span>' + esc(a('chatWith')) + '</span></button><button type="button" class="btn btn-primary" data-f="dep">' + icon('banknote', 16) + '<span>' + esc(a('uDeposit')) + '</span></button></div>',
      (root, close) => {
        root.querySelector('[data-f="chat"]').onclick = () => { close(); openChat({ user_id: (p.id || p.user_id || u.id || u.user_id), full_name: nm(u), yor_id: u.yor_id, phone: u.phone }); };
        root.querySelector('[data-f="dep"]').onclick = async () => {
          close();
          const ok = await ask({ title: a('uDeposit'), text: nm(u) + ' · ' + yid(u), amount: { label: a('amount') + ' (OMR)', value: '' }, field: { label: a('note'), required: false, max: 140 }, ok: a('uDepGo'),
            run: async v => { const r = await Guardian.rpc('admin_deposit', { p_target_yor_id: u.yor_id, p_amount: v.amount, p_currency: 'OMR', p_note: v.text || null, p_idempotency_key: uid() }, { retries: 0 }); return r.ok ? null : { error: srvErr(r.error) }; } });
          if (ok){ logged(); toast(a('uDepDone'), 'success'); sound('money'); }
        };
      });
  }

  /* ====================== NOTIFICATIONS ====================== */
  function notifyPage(){
    return page('admin-notify', a('nTitle'), '<button type="button" class="a19-go-card" data-go>' + icon('megaphone', 22) + '<span><b>' + esc(a('nGo')) + '</b><small>' + esc(a('nGoD')) + '</small></span>' + icon('chev', 18) + '</button>' +
      '<div class="a19-compose" data-comp hidden><label class="a19-lbl">' + esc(a('nT')) + '<span class="field-box"><input type="text" maxlength="80" data-t></span></label><label class="a19-lbl">' + esc(a('nB')) + '<span class="field-box"><textarea rows="3" maxlength="240" data-b></textarea></span></label>' +
      '<div class="a19-err" data-err role="alert"></div><button type="button" class="btn btn-primary" data-send>' + esc(a('nSend')) + '</button></div><h3>' + esc(a('nActive')) + '</h3><div class="a19-list" data-list>' + skel(2) + '</div>');
  }
  function notifyWire(root){
    const wrap = root.querySelector('.a19'); if (!wrap) return;
    const list = wrap.querySelector('[data-list]'), comp = wrap.querySelector('[data-comp]');
    const hasPage = () => { try { return R.ids().indexOf('admin-announce') !== -1; } catch(x){ return false; } };
    const load = async () => {
      const r = await Guardian.query(() => sb.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false }).limit(20), { retries: 1 });
      if (!wrap.isConnected) return;
      const rows = r.ok ? N().arr(r.data) : [];
      list.innerHTML = rows.length ? rows.map(x => '<article class="a19-row"><div class="a19-c" data-l=""><b>' + esc(x.title) + '</b><small>' + esc(x.body) + '</small><small>' + esc(fdt(x.created_at)) + '</small></div><div class="a19-act"><button type="button" class="btn a19-danger a19-b" data-stop="' + esc(x.id) + '">' + esc(a('nStop')) + '</button></div></article>').join('') : empty();
    };
    wrap.addEventListener('click', async ev => {
      if (ev.target.closest('[data-go]')){ if (hasPage()) R.go('admin-announce'); else comp.hidden = !comp.hidden; sound('tap'); return; }
      const st = ev.target.closest('[data-stop]');
      if (st){ const r = await Guardian.rpc('admin_announcement_stop', { p_id: st.getAttribute('data-stop') }, { retries: 0 }); if (r.ok){ logged(); load(); } else toast(srvErr(r.error), 'error'); return; }
      if (ev.target.closest('[data-send]')){
        const t1 = wrap.querySelector('[data-t]').value.trim(), b1 = wrap.querySelector('[data-b]').value.trim(), er = wrap.querySelector('[data-err]');
        if (!t1 || !b1){ er.textContent = a('nBad'); sound('error'); return; }
        const ok = await ask({ title: a('nSend'), text: a('nConfirm'), ok: a('nSend'), run: async () => { const r = await Guardian.rpc('admin_announce', { p_title: t1, p_body: b1 }, { retries: 0 }); if (!r.ok) return { error: srvErr(r.error) }; toast(a('nDone', { n: N().int(N().obj(r.data).recipients) }), 'success'); return null; } });
        if (ok){ logged(); wrap.querySelector('[data-t]').value = ''; wrap.querySelector('[data-b]').value = ''; comp.hidden = true; load(); }
      }
    });
    load();
  }

  /* ====================== PLANS ET PARAMÈTRES ====================== */
  const PL = { plans: null, pay: null, cfg: null };
  function plansPage(){ return page('admin-plans', a('pTitle'), '<div data-plans>' + skel(3) + '</div>'); }
  const fld = (k, label, val, o) => '<label class="a19-lbl">' + esc(label) + '<span class="field-box"><input type="' + ((o && o.type) || 'text') + '" ' + ((o && o.num) ? 'inputmode="decimal" dir="ltr" ' : '') + 'data-k="' + k + '" value="' + esc(val == null ? '' : val) + '"' + ((o && o.max) ? ' maxlength="' + o.max + '"' : '') + '></span></label>';
  const sw = (k, label, on) => '<button type="button" class="a19-sw" role="switch" aria-checked="' + !!on + '" data-sw="' + k + '"><span>' + esc(label) + '</span><i class="switch" aria-hidden="true"></i></button>';
  function plansWire(root){
    const wrap = root.querySelector('.a19'); if (!wrap) return;
    const box = wrap.querySelector('[data-plans]');
    const draw = () => {
      if (!PL.plans){ box.innerHTML = empty(a('err')); return; }
      const cfg = PL.cfg || {}, pay = PL.pay || {};
      box.innerHTML = '<p class="a19-warn">' + icon('info', 16) + '<span>' + esc(a('pWarn')) + '</span></p><div class="a19-plans">' + PL.plans.map(p => '<section class="a19-plan" data-plan="' + esc(p.code) + '"><header><h2>' + esc(((p.name && p.name[LANG]) || p.name && p.name.en) || a('plan_' + p.code)) + '</h2>' + chip(p.active ? 'ACTIVE' : 'CANCELLED', p.active ? a('pActive') : a('sCANCELLED')) + '</header>' +
        '<div class="a19-two">' + fld('min', a('pMin'), p.min_amount, { num: 1 }) + fld('max', a('pMax'), p.max_amount, { num: 1 }) + '</div>' + fld('days', a('pDays'), p.duration_days, { num: 1 }) + sw('active', a('pActive'), p.active) +
        '<h3>' + esc(a('pModel')) + '</h3>' + fld('rate', a('pRate'), p.return_pct == null ? '' : p.return_pct, { num: 1 }) + sw('valid', a('pValid'), p.model_validated) + '<label class="a19-lbl">' + esc(a('pNote')) + '<span class="field-box"><textarea rows="2" maxlength="1000" data-k="note">' + esc(p.model_note || '') + '</textarea></span></label>' +
        '<div class="a19-err" data-err></div><button type="button" class="btn btn-primary" data-save="' + esc(p.code) + '">' + esc(a('save')) + '</button></section>').join('') + '</div>' +
        '<section class="a19-plan a19-wide" data-pay><header><h2>' + esc(a('pPay')) + '</h2></header><p class="a19-hint">' + esc(a('pPayD')) + '</p><div class="a19-two">' + fld('bank_name', a('pBank'), pay.bank_name) + fld('account_name', a('pAccName'), pay.account_name) + fld('account_number', a('pAccNo'), pay.account_number) + fld('iban', a('iban'), pay.iban) + fld('swift', a('pSwift'), pay.swift) + '</div>' +
        ['en', 'fr', 'ar'].map(l => '<label class="a19-lbl">' + esc(a({ en: 'pNoteEn', fr: 'pNoteFr', ar: 'pNoteAr' }[l])) + '<span class="field-box"><textarea rows="2" data-k="note_' + l + '"' + (l === 'ar' ? ' dir="rtl"' : '') + '>' + esc(pay['note_' + l] || '') + '</textarea></span></label>').join('') +
        '<div class="a19-err" data-err></div><button type="button" class="btn btn-primary" data-savepay>' + esc(a('save')) + '</button></section>' +
        '<section class="a19-plan a19-wide"><header><h2>' + esc(a('pPlat')) + '</h2></header>' + sw('invest_enabled', a('sInvest'), cfg.invest_enabled) + sw('require_kyc_for_invest', a('sKycInv'), cfg.require_kyc_for_invest) + sw('require_kyc_for_withdraw', a('sKycWd'), cfg.require_kyc_for_withdraw) + sw('withdraw_enabled', a('sWd'), cfg.withdraw_enabled) + sw('credit_enabled', a('sCredit'), cfg.credit_enabled) +
        '<div class="a19-two">' + numSet('withdraw_min', a('sWdMin'), cfg.withdraw_min) + numSet('credit_min', a('sCrMin'), cfg.credit_min) + numSet('credit_max', a('sCrMax'), cfg.credit_max) + '</div></section>';
    };
    const numSet = (k, label, v) => '<div class="a19-num-set">' + fld(k, label, v, { num: 1 }) + '<button type="button" class="btn btn-secondary a19-b" data-setnum="' + k + '">' + esc(a('save')) + '</button></div>';
    const load = async () => {
      const [p, py, cf] = await Promise.all([Guardian.query(() => sb.from('invest_plans').select('*').order('sort')), Guardian.rpc('get_payment_instructions', {}), Guardian.rpc('get_app_config', {})]);
      if (!wrap.isConnected) return;
      PL.plans = p.ok ? N().arr(p.data) : null; PL.pay = py.ok ? N().obj(py.data) : {}; PL.cfg = cf.ok ? N().obj(cf.data) : {}; draw();
    };
    const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
    wrap.addEventListener('click', async ev => {
      const swb = ev.target.closest('[data-sw]');
      if (swb){
        const k = swb.getAttribute('data-sw'), on = swb.getAttribute('aria-checked') !== 'true';
        if (['active', 'valid'].indexOf(k) !== -1){ swb.setAttribute('aria-checked', on); sound('tick'); return; }
        swb.setAttribute('aria-checked', on);
        const r = await Guardian.rpc('admin_set_setting', { p_key: k, p_value: on }, { retries: 0 });
        if (r.ok){ PL.cfg = N().obj(r.data); logged(); } else { swb.setAttribute('aria-checked', !on); toast(srvErr(r.error), 'error'); sound('error'); }
        return;
      }
      const sn = ev.target.closest('[data-setnum]');
      if (sn){
        const k = sn.getAttribute('data-setnum'), v = num(wrap.querySelector('[data-k="' + k + '"]').value);
        if (v == null || v <= 0){ toast(a('e_invalid_value'), 'error'); return; }
        UIKit.loading(sn, true); const r = await Guardian.rpc('admin_set_setting', { p_key: k, p_value: v }, { retries: 0 }); UIKit.loading(sn, false);
        if (r.ok){ PL.cfg = N().obj(r.data); logged(); } else { toast(srvErr(r.error), 'error'); sound('error'); }
        return;
      }
      if (ev.target.closest('[data-savepay]')){
        const sec = wrap.querySelector('[data-pay]'), o = {}; sec.querySelectorAll('[data-k]').forEach(el => { o[el.getAttribute('data-k')] = el.value.trim(); });
        const b = ev.target.closest('[data-savepay]'); UIKit.loading(b, true); const r = await Guardian.rpc('admin_set_setting', { p_key: 'payment_instructions', p_value: o }, { retries: 0 }); UIKit.loading(b, false);
        if (r.ok){ PL.pay = o; logged(); } else { sec.querySelector('[data-err]').textContent = srvErr(r.error); sound('error'); }
        return;
      }
      const sv = ev.target.closest('[data-save]');
      if (sv){
        const code = sv.getAttribute('data-save'), sec = wrap.querySelector('[data-plan="' + code + '"]'), er = sec.querySelector('[data-err]'), g = k => sec.querySelector('[data-k="' + k + '"]').value;
        const mn = num(g('min')), mx = num(g('max')), dy = parseInt(g('days'), 10), rt = g('rate').trim() === '' ? null : num(g('rate')), active = sec.querySelector('[data-sw="active"]').getAttribute('aria-checked') === 'true', valid = sec.querySelector('[data-sw="valid"]').getAttribute('aria-checked') === 'true';
        er.textContent = '';
        if (mn == null || mx == null || mn <= 0 || mx < mn || !(dy >= 1)){ er.textContent = a('e_invalid_value'); Fx.shake(sec); sound('error'); return; }
        const clash = PL.plans.find(o => o.code !== code && o.active && (function(){ const s2 = wrap.querySelector('[data-plan="' + o.code + '"]'); const omn = num(s2.querySelector('[data-k="min"]').value), omx = num(s2.querySelector('[data-k="max"]').value); const oa = s2.querySelector('[data-sw="active"]').getAttribute('aria-checked') === 'true'; return oa && omn <= mx && mn <= omx; })());
        if (active && clash){ er.textContent = a('pOverlap'); Fx.shake(sec); sound('error'); return; }
        UIKit.loading(sv, true);
        const r = await Guardian.rpc('admin_plan_update', { p_code: code, p_min: mn, p_max: mx, p_days: dy, p_active: active, p_return_pct: rt, p_validated: valid, p_note: g('note').trim() || null }, { retries: 0 });
        UIKit.loading(sv, false);
        if (r.ok){ logged(); load(); } else { er.textContent = srvErr(r.error); Fx.shake(sec); sound('error'); }
      }
    });
    load();
  }

  /* ====================== compteurs et tuiles ====================== */
  let cache = { at: 0, p: null };
  function counts(){
    if (cache.p && Date.now() - cache.at < 10000) return cache.p;
    cache.at = Date.now();
    cache.p = (async () => {
      const [k, i, w] = await Promise.all([Guardian.rpc('admin_kyc_list', { p_status: 'PENDING', p_limit: 300 }), Guardian.rpc('admin_invest_list', { p_status: null, p_limit: 300 }), Guardian.rpc('admin_withdrawal_list', { p_status: null, p_limit: 300 })]);
      const il = i.ok ? N().arr(i.data) : [], wl = w.ok ? N().arr(w.data) : [];
      return { proofs: il.filter(x => x.status === 'PROOF_SENT').length, kyc: k.ok ? N().arr(k.data).filter(x => x.status === 'PENDING').length : 0,
        withdrawalsPending: wl.filter(x => x.status === 'PENDING').length, withdrawalsApproved: wl.filter(x => x.status === 'APPROVED').length, maturedToSettle: il.filter(isDue).length };
    })();
    return cache.p;
  }
  function tiles(){
    const pick = f => () => counts().then(f);
    const T = [
      { route: 'admin-invest', icon: 'banknote', titleKey: 'a19.tInvest', subKey: 'a19.tInvestD', f: c => c.proofs + c.maturedToSettle },
      { route: 'admin-kyc', icon: 'shield', titleKey: 'a19.tKyc', subKey: 'a19.tKycD', f: c => c.kyc },
      { route: 'admin-withdrawals', icon: 'bank', titleKey: 'a19.tWd', subKey: 'a19.tWdD', f: c => c.withdrawalsPending + c.withdrawalsApproved },
      { route: 'admin-plans', icon: 'chart', titleKey: 'a19.tPlans', subKey: 'a19.tPlansD', f: () => 0 },
      { route: 'admin-users', icon: 'users', titleKey: 'a19.tUsers', subKey: 'a19.tUsersD', f: () => 0 },
      { route: 'admin-audit', icon: 'doc', titleKey: 'a19.tAudit', subKey: 'a19.tAuditD', f: () => 0 },
      { route: 'admin-notify', icon: 'bell', titleKey: 'a19.tNotify', subKey: 'a19.tNotifyD', f: () => 0 }
    ];
    return T.map(x => ({ route: x.route, icon: x.icon, titleKey: x.titleKey, subKey: x.subKey, get badgePromise(){ return pick(x.f)(); } }));
  }

  /* ====================== routes ====================== */
  const mk = (id, title, cfg) => () => (guard() ? listPage(id, a(title), cfg) : '');
  R.register({
    'admin-invest': mk('admin-invest', 'iTitle', INV), 'admin-kyc': mk('admin-kyc', 'kTitle', KYC), 'admin-withdrawals': mk('admin-withdrawals', 'wTitle', WD),
    'admin-audit': () => (guard() ? auditPage() : ''), 'admin-users': () => (guard() ? usersPage() : ''), 'admin-notify': () => (guard() ? notifyPage() : ''), 'admin-plans': () => (guard() ? plansPage() : '')
  });
  const M = { parent: 'admin-hub', nav: 'services', admin: true };
  R.meta({ 'admin-invest': M, 'admin-kyc': M, 'admin-withdrawals': M, 'admin-audit': M, 'admin-users': M, 'admin-notify': M, 'admin-plans': M });
  ['admin-invest', 'admin-kyc', 'admin-withdrawals'].forEach(id => Hooks.on(id, root => { if (isAdmin()) wireList(id, root); }));
  Hooks.on('admin-audit', root => { if (isAdmin()) auditWire(root); });
  Hooks.on('admin-users', root => { if (isAdmin()) usersWire(root); });
  Hooks.on('admin-notify', root => { if (isAdmin()) notifyWire(root); });
  Hooks.on('admin-plans', root => { if (isAdmin()) plansWire(root); });

  window.Admin19 = { tiles, counts, open: route => { try { R.go(route); } catch(x){ /* rien */ } } };
})();
