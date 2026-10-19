'use strict';

/* ============================================================
   CATALOGUE DU TRANSFERT INTERNATIONAL (16.0.0)
   Source unique : ce fichier. La même liste est copiée dans la table serveur public.intl_countries (scripts/dev/gen-intl-sql.mjs) :
   le serveur REFUSE tout pays, région ou moyen de retrait absent de sa table.
   Chaque ligne : [ ISO, région, devise locale, moyens de retrait, fournisseurs mobile money (noms d'usage, indicatifs) ].
   Moyens : BANK (compte bancaire / IBAN), MOBILE_MONEY (portefeuille mobile), CASH_PICKUP (retrait en espèces), INTERAC (virement par e-mail, Canada).
   Délai : TOUJOURS de 48 h à 72 h (2 à 3 jours) après l'envoi, quel que soit le pays et le moyen.
   Pays d'origine : Oman (les transferts vers un numéro omanais restent dans « Envoyer »). Les noms de pays viennent d'Intl.DisplayNames (EN / FR / AR).
   ============================================================ */
const INTL_ETA = Object.freeze({ min: 48, max: 72 });
const INTL_REGIONS = Object.freeze(['GULF', 'NORTH_AFRICA', 'WEST_AFRICA', 'CENTRAL_AFRICA', 'EAST_AFRICA', 'SOUTH_AFRICA', 'NORTH_AMERICA']);
/* groupes affichés en haut de l'écran : Golfe · Afrique (5 sous-régions) · États-Unis · Canada */
const INTL_GROUPS = Object.freeze([
  { id: 'GULF', regions: ['GULF'] },
  { id: 'AFRICA', regions: ['NORTH_AFRICA', 'WEST_AFRICA', 'CENTRAL_AFRICA', 'EAST_AFRICA', 'SOUTH_AFRICA'] },
  { id: 'USA', regions: ['NORTH_AMERICA'], only: ['US'] },
  { id: 'CANADA', regions: ['NORTH_AMERICA'], only: ['CA'] },
]);
const INTL_CATALOG = Object.freeze([
  /* ---- Golfe (hors Oman) ---- */
  ['AE', 'GULF', 'AED', ['BANK', 'CASH_PICKUP'], {}], ['SA', 'GULF', 'SAR', ['BANK', 'CASH_PICKUP'], {}], ['KW', 'GULF', 'KWD', ['BANK', 'CASH_PICKUP'], {}],
  ['QA', 'GULF', 'QAR', ['BANK', 'CASH_PICKUP'], {}], ['BH', 'GULF', 'BHD', ['BANK', 'CASH_PICKUP'], {}],
  /* ---- Afrique du Nord ---- */
  ['MA', 'NORTH_AFRICA', 'MAD', ['BANK', 'CASH_PICKUP'], {}], ['DZ', 'NORTH_AFRICA', 'DZD', ['BANK', 'CASH_PICKUP'], {}], ['TN', 'NORTH_AFRICA', 'TND', ['BANK', 'CASH_PICKUP'], {}],
  ['LY', 'NORTH_AFRICA', 'LYD', ['BANK', 'CASH_PICKUP'], {}], ['EG', 'NORTH_AFRICA', 'EGP', ['BANK', 'MOBILE_MONEY', 'CASH_PICKUP'], { MOBILE_MONEY: ['Vodafone Cash', 'Orange Cash', 'Etisalat Cash'] }],
  ['SD', 'NORTH_AFRICA', 'SDG', ['BANK', 'CASH_PICKUP'], {}],
  /* ---- Afrique de l'Ouest ---- */
  ['SN', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Wave', 'Orange Money', 'Free Money'] }],
  ['CI', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'] }],
  ['ML', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'Moov Money'] }],
  ['BF', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'Moov Money'] }],
  ['BJ', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Moov Money'] }],
  ['TG', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Moov Money', 'TMoney'] }],
  ['NE', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'Airtel Money'] }],
  ['GW', 'WEST_AFRICA', 'XOF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'MTN MoMo'] }],
  ['GH', 'WEST_AFRICA', 'GHS', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Telecel Cash', 'AirtelTigo Money'] }],
  ['NG', 'WEST_AFRICA', 'NGN', ['BANK', 'MOBILE_MONEY', 'CASH_PICKUP'], { MOBILE_MONEY: ['OPay', 'PalmPay'] }],
  ['GN', 'WEST_AFRICA', 'GNF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'MTN MoMo'] }],
  ['SL', 'WEST_AFRICA', 'SLE', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'Africell Money'] }],
  ['LR', 'WEST_AFRICA', 'LRD', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money', 'MTN MoMo'] }],
  ['GM', 'WEST_AFRICA', 'GMD', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Wave', 'Afrimoney'] }],
  ['MR', 'WEST_AFRICA', 'MRU', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Bankily', 'Masrvi'] }],
  ['CV', 'WEST_AFRICA', 'CVE', ['BANK', 'CASH_PICKUP'], {}],
  /* ---- Afrique centrale ---- */
  ['CM', 'CENTRAL_AFRICA', 'XAF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Orange Money'] }],
  ['CD', 'CENTRAL_AFRICA', 'CDF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['M-Pesa', 'Orange Money', 'Airtel Money'] }],
  ['CG', 'CENTRAL_AFRICA', 'XAF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Airtel Money', 'MTN MoMo'] }],
  ['GA', 'CENTRAL_AFRICA', 'XAF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Airtel Money'] }],
  ['TD', 'CENTRAL_AFRICA', 'XAF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Airtel Money', 'Moov Money'] }],
  ['CF', 'CENTRAL_AFRICA', 'XAF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Orange Money'] }],
  ['GQ', 'CENTRAL_AFRICA', 'XAF', ['BANK', 'CASH_PICKUP'], {}], ['AO', 'CENTRAL_AFRICA', 'AOA', ['BANK', 'CASH_PICKUP'], {}], ['ST', 'CENTRAL_AFRICA', 'STN', ['BANK', 'CASH_PICKUP'], {}],
  /* ---- Afrique de l'Est ---- */
  ['KE', 'EAST_AFRICA', 'KES', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['M-Pesa', 'Airtel Money'] }],
  ['TZ', 'EAST_AFRICA', 'TZS', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa'] }],
  ['UG', 'EAST_AFRICA', 'UGX', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Airtel Money'] }],
  ['RW', 'EAST_AFRICA', 'RWF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Airtel Money'] }],
  ['BI', 'EAST_AFRICA', 'BIF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Lumicash', 'EcoCash'] }],
  ['ET', 'EAST_AFRICA', 'ETB', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['telebirr'] }],
  ['SO', 'EAST_AFRICA', 'SOS', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['EVC Plus'] }],
  ['DJ', 'EAST_AFRICA', 'DJF', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['D-Money'] }],
  ['MG', 'EAST_AFRICA', 'MGA', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MVola', 'Orange Money', 'Airtel Money'] }],
  ['ZM', 'EAST_AFRICA', 'ZMW', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo', 'Airtel Money'] }],
  ['MW', 'EAST_AFRICA', 'MWK', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['Airtel Money', 'TNM Mpamba'] }],
  ['MZ', 'EAST_AFRICA', 'MZN', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['M-Pesa', 'mKesh'] }],
  ['ZW', 'EAST_AFRICA', 'USD', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['EcoCash'] }],
  ['KM', 'EAST_AFRICA', 'KMF', ['BANK', 'CASH_PICKUP'], {}], ['ER', 'EAST_AFRICA', 'ERN', ['BANK', 'CASH_PICKUP'], {}], ['SS', 'EAST_AFRICA', 'SSP', ['BANK', 'CASH_PICKUP'], {}],
  ['MU', 'EAST_AFRICA', 'MUR', ['BANK', 'CASH_PICKUP'], {}], ['SC', 'EAST_AFRICA', 'SCR', ['BANK', 'CASH_PICKUP'], {}],
  /* ---- Afrique australe ---- */
  ['ZA', 'SOUTH_AFRICA', 'ZAR', ['BANK', 'CASH_PICKUP'], {}], ['BW', 'SOUTH_AFRICA', 'BWP', ['BANK', 'CASH_PICKUP'], {}], ['NA', 'SOUTH_AFRICA', 'NAD', ['BANK', 'CASH_PICKUP'], {}],
  ['LS', 'SOUTH_AFRICA', 'LSL', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['M-Pesa'] }], ['SZ', 'SOUTH_AFRICA', 'SZL', ['MOBILE_MONEY', 'BANK', 'CASH_PICKUP'], { MOBILE_MONEY: ['MTN MoMo'] }],
  /* ---- Amérique du Nord ---- */
  ['US', 'NORTH_AMERICA', 'USD', ['BANK', 'CASH_PICKUP'], {}], ['CA', 'NORTH_AMERICA', 'CAD', ['BANK', 'INTERAC'], {}],
].map(r => Object.freeze({ iso: r[0], region: r[1], cur: r[2], methods: Object.freeze(r[3]), providers: Object.freeze(r[4]) })));

/* indicatifs téléphoniques (sans « + ») */
const INTL_DIAL = Object.freeze({
  AE: '971', SA: '966', KW: '965', QA: '974', BH: '973', MA: '212', DZ: '213', TN: '216', LY: '218', EG: '20', SD: '249',
  SN: '221', CI: '225', ML: '223', BF: '226', BJ: '229', TG: '228', NE: '227', GW: '245', GH: '233', NG: '234', GN: '224', SL: '232', LR: '231', GM: '220', MR: '222', CV: '238',
  CM: '237', CD: '243', CG: '242', GA: '241', TD: '235', CF: '236', GQ: '240', AO: '244', ST: '239',
  KE: '254', TZ: '255', UG: '256', RW: '250', BI: '257', ET: '251', SO: '252', DJ: '253', MG: '261', ZM: '260', MW: '265', MZ: '258', ZW: '263', KM: '269', ER: '291', SS: '211', MU: '230', SC: '248',
  ZA: '27', BW: '267', NA: '264', LS: '266', SZ: '268', US: '1', CA: '1',
});
