'use strict';

/* ============================================================
   RENDER FUNCTIONS — all read from Runtime (current user only)
   ============================================================ */
function mainAccount(){
  return (Runtime.accounts || []).find(a => a.type === 'MAIN') || { balance:0, availableBalance:0, currency:'OMR', name:'Main OMR', id:null };
}

/* Barq 21.0.0 — connexion / inscription / réinitialisation : demi-écran de ciel (marque + titre) et feuille de formulaire qui remonte.
   Mêmes id, mêmes champs, mêmes data-* qu'avant (wireLogin / wireSignup / wireReset). */
function authSky(titleKey, subKey, back){
  const name = (typeof LANG !== 'undefined' && LANG === 'ar') ? 'برق' : 'Barq';
  const langs = '<div class="sx-lang" role="group" aria-label="' + escapeHtml(V12.vt('language')) + '">' + ['en', 'fr', 'ar'].map(l => '<button type="button" data-v12-lang="' + l + '" aria-pressed="' + (LANG === l) + '">' + (l === 'fr' ? 'FR' : l === 'en' ? 'EN' : 'عربي') + '</button>').join('') + '</div>';
  return '<header class="sx-auth-sky">' +
    '<div class="sx-auth-bar">' + (back ? '<button class="topbar-back" data-action="back" aria-label="' + t('ui.back') + '"><span class="dir-flip">' + icon('back', 20) + '</span></button>' : '<span></span>') + langs + '</div>' +
    '<img class="sx-auth-mark" src="assets/brand/barq-mark-192.png" alt="' + name + '" width="72" height="72">' +
    '<h1>' + escapeHtml(titleKey) + '</h1><p>' + escapeHtml(subKey) + '</p>' +
    '<div class="sx-auth-line" aria-hidden="true"><i></i></div></header>';
}
function renderLogin(){
  return '<div class="sx-auth">' + authSky(LANG === 'ar' ? 'برق' : 'Barq', V12.vt('tagline')) +
    '<div class="sx-auth-sheet">' +
      '<div class="field"><label class="field-label" for="au-email">' + t('auth.username') + '</label><div class="field-box"><input type="email" id="au-email" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false" class="ltr"></div></div>' +
      '<div class="field"><label class="field-label" for="au-pass">' + t('auth.code') + '</label><div class="field-box"><input type="password" id="au-pass" autocomplete="current-password" class="ltr"><button type="button" class="field-icon" data-auth-toggle="au-pass" aria-label="' + t('auth.show') + '">' + icon('eye', 22) + '</button></div></div>' +
      '<div class="field-err" id="login-err" style="text-align:center" role="alert"></div>' +
      '<button class="btn btn-primary" id="au-submit" type="button">' + t('auth.signin') + '</button>' +
      '<button class="btn btn-ghost" id="au-to-signup" type="button">' + t('auth.noAccount') + '</button>' +
      '<button class="btn btn-ghost sx-small" id="au-to-reset" type="button">' + t('auth.forgot') + '</button>' +
    '</div></div>';
}

/* dial-code picker for the mandatory sign-up phone (12.6.0): "OM +968", Oman first */
function signupDialSelect(){
  const data = (typeof COUNTRY_DATA !== 'undefined') ? COUNTRY_DATA : { OM:{ iso:'OM', dial:'+968', en:'Oman' } };
  const lang = (typeof LANG !== 'undefined' && data.OM && data.OM[LANG]) ? LANG : 'en';
  const rows = Object.keys(data).map(k => data[k]).filter(c => c && c.dial);
  return '<select id="su-dial" class="su-dial" aria-label="' + t('auth.dial') + '">' + rows.map(c =>
    '<option value="' + escapeHtml(c.iso) + '" data-dial="' + escapeHtml(c.dial) + '"' + (c.iso === 'OM' ? ' selected' : '') + '>' + escapeHtml(c.iso + ' ' + c.dial) + '</option>').join('') + '</select>';
}

function renderSignup(){
  return '<div class="sx-auth">' + authSky(V12.vt('createAccount'), V12.vt('signupSub'), true) +
    '<div class="sx-auth-sheet">' +
      '<div class="su-gift" role="note"><span class="su-gift-i">' + icon('wallet', 22) + '</span><span class="su-gift-t"><b>' + t('lx.su.gift').replace('{a}', '10 OMR') + '</b><small>' + t('lx.su.gift2') + '</small></span></div>' +
      '<div class="field"><label class="field-label" for="su-first">' + t('auth.firstName') + '</label><div class="field-box"><input type="text" id="su-first" autocomplete="given-name"></div></div>' +
      '<div class="field"><label class="field-label" for="su-last">' + t('auth.lastName') + '</label><div class="field-box"><input type="text" id="su-last" autocomplete="family-name"></div></div>' +
      '<div class="field"><label class="field-label" for="su-email">' + t('auth.username') + '</label><div class="field-box"><input type="email" id="su-email" autocomplete="email" autocapitalize="off" spellcheck="false" class="ltr"></div></div>' +
      '<div class="field"><label class="field-label" for="su-phone">' + t('auth.phone') + ' *</label><div class="field-box su-phone ltr">' + signupDialSelect() + '<input type="tel" id="su-phone" inputmode="tel" autocomplete="tel-national" required aria-required="true" aria-describedby="su-phone-hint" placeholder="' + t('auth.phonePh') + '" class="ltr"></div><div class="caption" id="su-phone-hint" style="margin-top:calc(6px*var(--ui))">' + t('auth.phoneHint') + '</div></div>' +
      '<div class="field"><label class="field-label" for="su-pass">' + t('auth.code') + '</label><div class="field-box"><input type="password" id="su-pass" autocomplete="new-password" minlength="8" class="ltr"><button type="button" class="field-icon" data-auth-toggle="su-pass" aria-label="' + t('auth.show') + '" style="padding:calc(6px*var(--ui))">' + icon('eye', 18) + '</button></div></div>' +
      '<div class="field-err" id="signup-err" role="alert"></div>' +
      '<button class="btn btn-primary" id="su-submit" type="button">' + t('auth.signup') + '</button>' +
      
      '<button class="btn btn-ghost" id="su-to-login" type="button">' + t('auth.haveAccount') + '</button>' +
    '</div></div>';
}

function renderReset(){
  return '<div class="sx-auth">' + authSky(t('auth.resetTitle'), V12.vt('resetSub'), true) +
    '<div class="sx-auth-sheet">' +
      '<div class="field"><label class="field-label" for="rs-email">' + t('auth.username') + '</label><div class="field-box"><input type="email" id="rs-email" autocomplete="email" class="ltr"></div></div>' +
      '<div class="field-err" id="reset-err" role="alert"></div>' +
      '<button class="btn btn-primary" id="rs-submit" type="button">' + t('auth.resetSend') + '</button>' +
    '</div></div>';
}
