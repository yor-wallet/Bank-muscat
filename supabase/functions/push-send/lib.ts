/* push-send / lib.ts — logique PURE des notifications push (Web Push) de Sanad Pay.
   Aucun accès réseau ni base de données ici : tout ce qui est testable est testé, y compris un aller-retour
   chiffrement / déchiffrement complet et la signature VAPID.

   Normes appliquées :
   - RFC 8291 (Message Encryption for Web Push, codage « aes128gcm » de la RFC 8188) pour le contenu ;
   - RFC 8292 (VAPID) pour l'identification du serveur d'application (en-tête Authorization: vapid t=<JWT ES256>, k=<clé publique>).
   Apple (iPhone, iOS 16.4 ou plus, application ajoutée à l'écran d'accueil) accepte ce protocole standard sur web.push.apple.com.
   16.0.0 : types REWARD (récompense de bienvenue) et NEW_USER (alerte administrateur : nouveau membre). */

export type Lang = "en" | "fr" | "ar";
// deno-lint-ignore no-explicit-any
export type Row = Record<string, any>;

/* ---------- base64url ---------- */
export function b64uEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function b64uDecode(str: string): Uint8Array {
  const s = String(str ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const enc = new TextEncoder();
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};
export function safeEqual(a: unknown, b: unknown): boolean {
  const x = String(a ?? ""), y = String(b ?? "");
  if (!x || x.length !== y.length) return false;
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return r === 0;
}

/* ---------- clés VAPID ---------- */
export type VapidKeys = { publicKey: string; privateJwk: JsonWebKey };

/* Paire de clés ECDSA P-256. La clé publique (65 octets, non compressée) est donnée en base64url : c'est l'« applicationServerKey » de l'application.
   La clé privée reste une JWK : elle n'est stockée que côté serveur (table privée push_vapid) et n'est jamais renvoyée à personne. */
export async function generateVapidKeys(): Promise<VapidKeys> {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const privateJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  return { publicKey: b64uEncode(raw), privateJwk };
}

/* Origine du service de push (« audience » du JWT) : https://web.push.apple.com, https://fcm.googleapis.com, … */
export function audienceOf(endpoint: string): string {
  const u = new URL(endpoint);
  if (u.protocol !== "https:") throw new Error("endpoint_not_https");
  return u.origin;
}

/* En-tête Authorization VAPID. Le JWT dure 12 h au plus (la norme impose moins de 24 h). */
export async function vapidAuthorization(endpoint: string, keys: VapidKeys, subject: string, nowSec = Math.floor(Date.now() / 1000)): Promise<string> {
  const head = b64uEncode(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64uEncode(enc.encode(JSON.stringify({ aud: audienceOf(endpoint), exp: nowSec + 12 * 3600, sub: subject })));
  const signingInput = enc.encode(head + "." + claims);
  const key = await crypto.subtle.importKey("jwk", keys.privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, signingInput));   /* WebCrypto rend déjà r||s (64 octets) */
  return "vapid t=" + head + "." + claims + "." + b64uEncode(sig) + ", k=" + keys.publicKey;
}

/* ---------- chiffrement du contenu (RFC 8291, aes128gcm) ---------- */
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, bytes * 8));
}

export type EncryptOpts = { salt?: Uint8Array; asPrivateJwk?: JsonWebKey; asPublicRaw?: Uint8Array };   /* options : valeurs imposées, pour les vecteurs de test */

/* Corps complet à envoyer au service de push : en-tête (sel, taille de bloc, clé publique du serveur) puis contenu chiffré.
   uaPublic = clé « p256dh » de l'abonnement (65 octets) ; authSecret = secret « auth » de l'abonnement (16 octets). */
export async function encryptPayload(plain: Uint8Array, uaPublic: Uint8Array, authSecret: Uint8Array, o: EncryptOpts = {}): Promise<Uint8Array> {
  if (uaPublic.length !== 65 || uaPublic[0] !== 4) throw new Error("bad_p256dh");
  if (authSecret.length < 16) throw new Error("bad_auth");
  if (plain.length > 3993) throw new Error("payload_too_large");   /* 4096 - 86 (en-tête + marque + étiquette GCM) */

  let asPriv: CryptoKey, asPub: Uint8Array;
  if (o.asPrivateJwk && o.asPublicRaw) {
    asPriv = await crypto.subtle.importKey("jwk", o.asPrivateJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
    asPub = o.asPublicRaw;
  } else {
    const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    asPriv = kp.privateKey;
    asPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  }
  const salt = o.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, asPriv, 256));

  const keyInfo = concat(enc.encode("WebPush: info\0"), uaPublic, asPub);
  const ikm = await hkdf(authSecret, ecdh, keyInfo, 32);
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);

  const record = concat(plain, new Uint8Array([2]));   /* 0x02 = dernier (et seul) bloc, sans remplissage */
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, record));

  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096, false);
  return concat(salt, rs, new Uint8Array([asPub.length]), asPub, cipher);
}

/* ---------- envoi ---------- */
export type Sub = { endpoint: string; p256dh: string; auth: string };
export type SendResult = { status: number; ok: boolean; gone: boolean; retryAfterSec?: number };

/* TTL 24 h : si l'iPhone est éteint, Apple garde le message jusqu'à 24 h. Urgency « high » : c'est une opération sur de l'argent. */
export async function sendPush(
  sub: Sub, payload: unknown, keys: VapidKeys, subject: string,
  o: { fetchFn?: typeof fetch; ttl?: number; nowSec?: number; retries?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<SendResult> {
  const f = o.fetchFn ?? fetch;
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const body = await encryptPayload(enc.encode(JSON.stringify(payload)), b64uDecode(sub.p256dh), b64uDecode(sub.auth));
  const auth = await vapidAuthorization(sub.endpoint, keys, subject, o.nowSec);
  let res: Response | null = null;
  const tries = 1 + Math.max(0, o.retries ?? 1);
  for (let i = 0; i < tries; i++) {
    try {
      res = await f(sub.endpoint, {
        method: "POST",
        headers: { Authorization: auth, "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: String(o.ttl ?? 86400), Urgency: "high" },
        body,
      });
    } catch { res = null; }
    const st = res?.status ?? 0;
    if (res && st >= 200 && st < 300) break;
    if (st === 429 || st >= 500 || st === 0) { if (i < tries - 1) await sleep(1500); continue; }   /* échec passager : une seule nouvelle tentative */
    break;
  }
  const status = res?.status ?? 0;
  const ra = Number(res?.headers?.get?.("retry-after"));
  return { status, ok: status >= 200 && status < 300, gone: status === 404 || status === 410, ...(Number.isFinite(ra) && ra > 0 ? { retryAfterSec: ra } : {}) };
}

/* ---------- texte des notifications ---------- */
export const PUSH_TYPES = ["TRANSFER_SENT", "TRANSFER_RECEIVED", "DEPOSIT", "REWARD", "NEW_USER", "CHAT_MESSAGE", "CREDIT_DECISION", "CREDIT_REQUEST", "CREDIT_DUE", "ANNOUNCEMENT"] as const;   /* argent, récompense et alerte administrateur ; la crypto est masquée dans l'application */

const T: Record<Lang, Record<string, string>> = {
  en: {
    sent: "Money sent", received: "Money received", deposit: "Money added", reward: "Welcome reward", newUser: "New member",
    sentBody: "{amt} sent to {to}", sentBodyNoTo: "{amt} sent", receivedBody: "{amt} received from {from}", receivedBodyNoFrom: "{amt} received", depositBody: "{amt} added to your account",
    rewardBody: "{amt} added to your wallet as a welcome reward",
    ref: "Ref.", chat: "New message", creditOk: "Credit approved", creditNo: "Credit declined", creditReq: "Credit request", dueSoon: "Credit payment due soon", dueToday: "Credit payment due today", dueOver: "Credit payment overdue", dueClosed: "Credit repaid", dueBody: "{amt} due on {d}", dueClosedBody: "Your credit is fully repaid",
    testTitle: "Notifications are on", testBody: "You will see here when money is sent or received.",
  },
  fr: {
    sent: "Transfert envoyé", received: "Argent reçu", deposit: "Argent ajouté", reward: "Récompense de bienvenue", newUser: "Nouveau membre",
    sentBody: "{amt} envoyés à {to}", sentBodyNoTo: "{amt} envoyés", receivedBody: "{amt} reçus de {from}", receivedBodyNoFrom: "{amt} reçus", depositBody: "{amt} ajoutés à votre compte",
    rewardBody: "{amt} ajoutés à votre portefeuille en cadeau de bienvenue",
    ref: "Réf.", chat: "Nouveau message", creditOk: "Crédit accordé", creditNo: "Crédit refusé", creditReq: "Demande de crédit", dueSoon: "Échéance de crédit proche", dueToday: "Échéance de crédit aujourd'hui", dueOver: "Échéance de crédit en retard", dueClosed: "Crédit remboursé", dueBody: "{amt} à payer le {d}", dueClosedBody: "Votre crédit est entièrement remboursé",
    testTitle: "Notifications activées", testBody: "Vous serez prévenu ici dès qu'un transfert est envoyé ou reçu.",
  },
  ar: {
    sent: "تم الإرسال", received: "تم استلام مبلغ", deposit: "تمت إضافة مبلغ", reward: "مكافأة الترحيب", newUser: "عضو جديد",
    sentBody: "تم إرسال {amt} إلى {to}", sentBodyNoTo: "تم إرسال {amt}", receivedBody: "تم استلام {amt} من {from}", receivedBodyNoFrom: "تم استلام {amt}", depositBody: "تمت إضافة {amt} إلى حسابك",
    rewardBody: "تمت إضافة {amt} إلى محفظتك كمكافأة ترحيب",
    ref: "المرجع", chat: "رسالة جديدة", creditOk: "تمت الموافقة على الائتمان", creditNo: "تم رفض الائتمان", creditReq: "طلب ائتمان", dueSoon: "اقتراب موعد قسط الائتمان", dueToday: "قسط الائتمان مستحق اليوم", dueOver: "قسط الائتمان متأخر", dueClosed: "تم سداد الائتمان", dueBody: "{amt} مستحق في {d}", dueClosedBody: "تم سداد ائتمانك بالكامل",
    testTitle: "الإشعارات مفعّلة", testBody: "ستظهر هنا عند إرسال أو استلام أي مبلغ.",
  },
};
export function normalizeLang(l: unknown): Lang { return l === "fr" || l === "ar" || l === "en" ? l : "en"; }

/* Montant : rial omanais à 3 décimales (baïsa), autres devises à 2. Jamais d'arrondi inventé : le nombre vient de la base. */
export function fmtAmount(amount: unknown, currency: unknown): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "";
  const cur = String(currency ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
  const dec = cur === "OMR" || cur === "KWD" || cur === "BHD" ? 3 : 2;
  return n.toFixed(dec) + (cur ? " " + cur : "");
}

const LRI = String.fromCharCode(0x2066), PDI = String.fromCharCode(0x2069);   /* isolat gauche-à-droite : un numéro reste lisible dans une phrase arabe */
const MASK = String.fromCharCode(0x2022);                                      /* • */

/* Numéro affiché sur l'écran verrouillé : indicatif + 4 derniers chiffres seulement (le reste est masqué). */
export function maskPhone(raw: unknown): string {
  const s = String(raw ?? "").trim();
  const digits = s.replace(/\D/g, "");
  if (digits.length < 6) return "";
  const tail = digits.slice(-4);
  /* l'indicatif n'est repris que s'il est écrit à part (« +968 77986533 ») : on ne le devine jamais */
  const m = /^\+(\d{1,3})\s/.exec(s);
  return (m ? "+" + m[1] + " " : "") + MASK.repeat(4) + tail;
}

const clean = (s: unknown, max: number) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export type PushMessage = { title: string; body: string; tag: string; url: string; badge: number; lang: Lang; dir: "ltr" | "rtl"; ts: number; kind: string };

/* Titre et texte de la notification dans la langue de la personne. Le texte d'origine de la base (anglais) sert seulement de repli. */
export function buildPushMessage(n: Row, lang: Lang, unread = 0): PushMessage | null {
  const type = String(n?.type ?? "");
  if (!(PUSH_TYPES as readonly string[]).includes(type)) return null;
  const d: Row = n?.data && typeof n.data === "object" ? n.data : {};
  const t = T[lang];
  const amt = fmtAmount(d.amount, d.currency);
  const iso = (v: string) => (lang === "ar" && v ? LRI + v + PDI : v);
  const fill = (tpl: string, vars: Row) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  let title = "", body = "";
  if (type === "TRANSFER_SENT") {
    const toRaw = String(d.to ?? "");
    const to = /\d{6,}/.test(toRaw) ? maskPhone(toRaw) : clean(toRaw, 40);   /* numéro : masqué ; nom d'un membre (transfert interne) : affiché */
    title = t.sent;
    body = amt ? fill(to ? t.sentBody : t.sentBodyNoTo, { amt: iso(amt), to: iso(to) }) : clean(n.message, 120);
  } else if (type === "TRANSFER_RECEIVED") {
    const from = clean(d.from, 40);
    title = t.received;
    body = amt ? fill(from ? t.receivedBody : t.receivedBodyNoFrom, { amt: iso(amt), from }) : clean(n.message, 120);
  } else if (type === "REWARD") {
    title = t.reward;
    body = amt ? fill(t.rewardBody, { amt: iso(amt) }) : clean(n.message, 120);
  } else if (type === "CHAT_MESSAGE") {
    title = t.chat; body = clean(n.message, 120);
  } else if (type === "CREDIT_REQUEST") {
    title = t.creditReq; body = clean(n.message, 120);
  } else if (type === "CREDIT_DECISION") {
    title = String(d.status) === "APPROVED" ? t.creditOk : t.creditNo;
    body = String(d.status) === "APPROVED" && amt ? fill(t.depositBody, { amt: iso(amt) }) : clean(n.message, 120);
  } else if (type === "CREDIT_DUE") {
    const st = String(d.stage ?? "");
    title = st === "OVERDUE" ? t.dueOver : st === "TODAY" ? t.dueToday : st === "CLOSED" || st === "FORGIVEN" ? t.dueClosed : t.dueSoon;
    body = st === "CLOSED" || st === "FORGIVEN" ? t.dueClosedBody : (amt ? fill(t.dueBody, { amt: iso(amt), d: iso(clean(d.due, 12)) }) : clean(n.message, 120));
  } else if (type === "ANNOUNCEMENT") {
    title = clean(n.title, 60) || "Sanad Pay"; body = clean(n.message, 160);
  } else if (type === "NEW_USER") {
    /* alerte administrateur : nom, pays et numéro MASQUÉ sur l'écran verrouillé (le numéro complet reste dans la console admin) */
    title = t.newUser;
    const name = clean(d.name, 40), ph = maskPhone(d.phone), cc = clean(d.country, 2).toUpperCase();
    body = [name, cc, ph ? iso(ph) : ""].filter(Boolean).join(" · ") || clean(n.message, 120);
  } else {
    title = t.deposit;                                        /* DEPOSIT : on n'affiche pas l'expéditeur (ancien nom de marque dans les anciennes lignes) */
    body = amt ? fill(t.depositBody, { amt: iso(amt) }) : clean(n.message, 120);
  }
  /* 16.1.0 : référence de la transaction dans le texte de l'alerte (montant, personne et référence) */
  if (d.reference && (type === "TRANSFER_SENT" || type === "TRANSFER_RECEIVED" || type === "DEPOSIT") && amt) body += " · " + t.ref + " " + iso(String(d.reference).replace(/^YOR-/i, "FP-"));
  if (!body) body = title;
  const id = String(n?.id ?? "");
  return {
    title: clean(title, 60), body: clean(body, 160), tag: id ? "fp-" + id : "fp-" + type.toLowerCase(), url: type === "NEW_USER" ? "#/admin" : type === "CHAT_MESSAGE" ? (String(d.from) === "Sanad Pay" ? "#/chat" : "#/admin/chat") : type === "CREDIT_REQUEST" ? "#/admin/credit" : (type === "CREDIT_DECISION" || type === "CREDIT_DUE") ? "#/credit" : "#/notifications",
    badge: Math.max(0, Math.min(99, Math.floor(Number(unread) || 0))), lang, dir: lang === "ar" ? "rtl" : "ltr", ts: Date.now(), kind: type,
  };
}

export function buildTestMessage(lang: Lang): PushMessage {
  const t = T[lang];
  return { title: t.testTitle, body: t.testBody, tag: "fp-test", url: "#/settings", badge: 0, lang, dir: lang === "ar" ? "rtl" : "ltr", ts: Date.now(), kind: "TEST" };
}

/* Services de push connus : l'adresse de livraison d'un abonnement ne peut mener QU'À l'un d'eux. Sans cette liste, une personne connectée pourrait
   enregistrer l'adresse d'un autre site et faire envoyer des requêtes signées par le serveur vers n'importe où. */
const PUSH_HOST_SUFFIXES = ["push.apple.com", "push.services.mozilla.com", "notify.windows.com"];   /* Apple (Safari / iPhone), Firefox, Edge */
const PUSH_HOSTS_EXACT = ["fcm.googleapis.com"];                                                      /* Chrome, Android */
export function isPushServiceHost(host: string): boolean {
  const h = String(host ?? "").toLowerCase();
  return PUSH_HOSTS_EXACT.includes(h) || PUSH_HOST_SUFFIXES.some((x) => h === x || h.endsWith("." + x));
}

export type SubInput = { endpoint: string; p256dh: string; auth: string; userAgent: string };
const B64U = /^[A-Za-z0-9_-]+$/;
/* Contrôle d'un abonnement envoyé par l'application (forme de PushSubscription.toJSON() : { endpoint, keys: { p256dh, auth } }).
   Rend les valeurs nettoyées, ou lève « invalid_… ». */
export function validateSubscription(input: Row | null | undefined, userAgent?: unknown): SubInput {
  const endpoint = String(input?.endpoint ?? "");
  const p256dh = String(input?.keys?.p256dh ?? input?.p256dh ?? "");
  const auth = String(input?.keys?.auth ?? input?.auth ?? "");
  let u: URL;
  try { u = new URL(endpoint); } catch { throw new Error("invalid_endpoint"); }
  if (u.protocol !== "https:" || endpoint.length > 1000 || /\s/.test(endpoint) || u.username || u.password || u.port) throw new Error("invalid_endpoint");
  if (!isPushServiceHost(u.hostname)) throw new Error("invalid_endpoint_host");
  if (!B64U.test(p256dh) || p256dh.length < 80 || p256dh.length > 100) throw new Error("invalid_key");
  try { const k = b64uDecode(p256dh); if (k.length !== 65 || k[0] !== 4) throw new Error("x"); } catch { throw new Error("invalid_key"); }
  if (!B64U.test(auth) || auth.length < 16 || auth.length > 64) throw new Error("invalid_auth");
  return { endpoint, p256dh, auth, userAgent: String(userAgent ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 300) };
}

/* Un abonnement est « mort » si le service de push dit qu'il n'existe plus (404 / 410) : on le supprime pour ne plus l'appeler.
   Ici : un abonnement lisible, vers un service de push connu, avec des clés de la bonne taille. */
export function validSub(s: Row | null | undefined): s is Sub {
  if (!s) return false;
  try {
    const u = new URL(String(s.endpoint));
    if (u.protocol !== "https:" || !isPushServiceHost(u.hostname)) return false;
    return b64uDecode(String(s.p256dh)).length === 65 && b64uDecode(String(s.auth)).length >= 16;
  } catch { return false; }
}
