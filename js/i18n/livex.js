'use strict';

/* Textes ajoutés en 16.0.0 (récompense, sons, téléphone, console admin, transfert international). Clés « lx.* » — EN / FR / AR.
   Chargé juste après translations.js ; les clés existantes ne sont jamais modifiées ici. */
Object.assign(TR.en, {
  /* récompense */
  'lx.rw.k': 'You earned', 'lx.rw.p': 'Welcome reward added to your wallet', 'lx.rw.sub': 'Thanks for joining Live X Digitale', 'lx.rw.go': 'Awesome!',
  'lx.su.gift': 'Get {a} free when your account is confirmed', 'lx.su.gift2': 'One welcome reward per account and phone number.',
  /* sons */
  'lx.set.sounds': 'Sounds', 'lx.set.soundsD': 'Chimes for notifications, money received and rewards',
  /* notifications : nouveaux types */
  'lx.n.REWARD': 'Welcome reward', 'lx.n.NEW_USER': 'New member', 'lx.n.TRANSFER_STATUS': 'Transfer update',
  'op.INTL_TRANSFER': 'International transfer', 'op.SIGNUP_BONUS': 'Welcome reward',
  'lx.appr.done': 'Confirmed and approved', 'lx.appr.ok': 'Confirmed and approved',
  'lx.member': 'Live X account', 'lx.memberNote': 'instant transfer, they will be notified',
  'lx.nv.in': 'Money received', 'lx.nv.out': 'Money sent', 'lx.nv.dep': 'Money added',
  'lx.nv.inMsg': '{amt} from {from} · Ref. {ref}', 'lx.nv.outMsg': '{amt} to {to} · Ref. {ref}', 'lx.nv.depMsg': '{amt} added to your account · Ref. {ref}',
});
Object.assign(TR.fr, {
  'lx.rw.k': 'Vous avez gagné', 'lx.rw.p': 'Récompense de bienvenue ajoutée à votre portefeuille', 'lx.rw.sub': 'Merci d’avoir rejoint Live X Digitale', 'lx.rw.go': 'Génial !',
  'lx.su.gift': 'Recevez {a} offerts dès la confirmation de votre compte', 'lx.su.gift2': 'Une récompense de bienvenue par compte et par numéro de téléphone.',
  'lx.set.sounds': 'Sons', 'lx.set.soundsD': 'Carillons pour les notifications, l’argent reçu et les récompenses',
  'lx.n.REWARD': 'Récompense de bienvenue', 'lx.n.NEW_USER': 'Nouveau membre', 'lx.n.TRANSFER_STATUS': 'Suivi du transfert',
  'op.INTL_TRANSFER': 'Transfert international', 'op.SIGNUP_BONUS': 'Récompense de bienvenue',
  'lx.appr.done': 'Confirmé et approuvé', 'lx.appr.ok': 'Confirmé et approuvé',
  'lx.member': 'Compte Live X', 'lx.memberNote': 'transfert instantané, la personne sera avertie',
  'lx.nv.in': 'Argent reçu', 'lx.nv.out': 'Argent envoyé', 'lx.nv.dep': 'Argent ajouté',
  'lx.nv.inMsg': '{amt} de {from} · Réf. {ref}', 'lx.nv.outMsg': '{amt} à {to} · Réf. {ref}', 'lx.nv.depMsg': '{amt} ajoutés à votre compte · Réf. {ref}',
});
Object.assign(TR.ar, {
  'lx.rw.k': 'لقد ربحت', 'lx.rw.p': 'تمت إضافة مكافأة الترحيب إلى محفظتك', 'lx.rw.sub': 'شكراً لانضمامك إلى لايف إكس ديجيتال', 'lx.rw.go': 'رائع!',
  'lx.su.gift': 'احصل على {a} مجاناً عند تأكيد حسابك', 'lx.su.gift2': 'مكافأة ترحيب واحدة لكل حساب ولكل رقم هاتف.',
  'lx.set.sounds': 'الأصوات', 'lx.set.soundsD': 'نغمات للإشعارات والأموال المستلمة والمكافآت',
  'lx.n.REWARD': 'مكافأة الترحيب', 'lx.n.NEW_USER': 'عضو جديد', 'lx.n.TRANSFER_STATUS': 'تحديث التحويل',
  'op.INTL_TRANSFER': 'تحويل دولي', 'op.SIGNUP_BONUS': 'مكافأة الترحيب',
  'lx.appr.done': 'تم التأكيد والاعتماد', 'lx.appr.ok': 'تم التأكيد والاعتماد',
  'lx.member': 'حساب لايف إكس', 'lx.memberNote': 'تحويل فوري، وسيتم إشعار المستلم',
  'lx.nv.in': 'تم استلام مبلغ', 'lx.nv.out': 'تم إرسال مبلغ', 'lx.nv.dep': 'تمت إضافة مبلغ',
  'lx.nv.inMsg': '{amt} من {from} · المرجع {ref}', 'lx.nv.outMsg': '{amt} إلى {to} · المرجع {ref}', 'lx.nv.depMsg': 'تمت إضافة {amt} إلى حسابك · المرجع {ref}',
});

/* 16.1.0 — arabe : phrases complètes (certaines étaient tronquées) + orthographe unifiée (tanwin sur l'alif : «أبداً», «لاحقاً») */
Object.assign(TR.ar, {
  'home.no_tx': 'لا توجد عمليات بعد',
  'success.subtitle': 'تمت عملية التحويل بنجاح.',
  'cards.err.holder': 'أدخل اسم حامل البطاقة (3 أحرف على الأقل)',
  'banks.add': 'إضافة بنك', 'banks.account': 'حساب بنكي', 'banks.eta': 'الوصول المتوقع', 'banks.days': 'أيام عمل',
  'banks.choose_eta': 'حتى {days} أيام عمل', 'banks.added': 'تمت إضافة البنك', 'banks.err_holder': 'اسم غير صالح (3 أحرف على الأقل)',
  'banks.withdraw': 'السحب إلى البنك', 'banks.withdraw_fee': 'رسوم السحب', 'banks.withdraw_days': '{days} أيام عمل', 'banks.no_account': 'لا يوجد حساب بنكي محفوظ',
  'settings.notifsDesc': 'تنبيهات العمليات ونشاط الحساب', 'settings.biometricDesc': 'بصمة الوجه أو الإصبع لتأكيد العمليات', 'settings.limitsDesc': 'الحدود اليومية وحدود كل عملية',
  'auth.err.empty': 'أدخل بريدك الإلكتروني وكلمة المرور.', 'auth.err.invalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth.err.locked': 'محاولات كثيرة. أعد المحاولة بعد {s} ثانية.', 'auth.err.unavailable': 'الخدمة غير متاحة. أعد المحاولة.',
  'auth.err.emailInUse': 'هذا البريد الإلكتروني مسجّل بالفعل.', 'auth.err.weak': 'يجب ألا تقل كلمة المرور عن 8 أحرف.',
  'auth.err.invalidEmail': 'عنوان البريد الإلكتروني غير صالح.', 'auth.err.tooMany': 'محاولات كثيرة. أعد المحاولة لاحقاً.',
  'auth.err.network': 'خطأ في الشبكة. أعد المحاولة.', 'auth.err.userNotFound': 'لا يوجد حساب بهذا البريد الإلكتروني.', 'auth.err.invalidCode': 'الرمز غير صحيح.',
  'recog.recognized': 'تم التعرف على المستفيد', 'recog.notfound': 'مستفيد جديد', 'recog.new_benef': 'لا يوجد اسم مرتبط — سيعتمد الإيصال على المعرّف',
  'px.rcvNote': 'عند التحويل إلى رقم هاتف مسجّل في لايف إكس ديجيتال يصل المبلغ فوراً إلى رصيد صاحبه ويُشعَر به. أما الأرقام غير المسجّلة فيُبلَّغ أصحابها برسالة نصية.',
  'pi.ios1': 'اضغط زر المشاركة'
});
