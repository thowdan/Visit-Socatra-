import en from './locales/en.js';
import ar from './locales/ar.js';

const LOCALES = { en, ar };
const KEY = 'visit-socotra-lang';

function readStored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LOCALES[q]) return q;
  const stored = readStored();
  if (stored && LOCALES[stored]) return stored;
  return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function setLang(lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode: the URL param still carries the choice */
  }
  const url = new URL(location.href);
  url.searchParams.set('lang', lang);
  url.hash = '';
  location.assign(url.toString());
}

export function applyLang(lang) {
  const t = LOCALES[lang];
  const html = document.documentElement;
  html.lang = t.lang;
  html.dir = t.dir;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  return t;
}
