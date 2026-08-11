// Pieces every page needs: element building, the toast, motion helpers, and
// the header controls. Kept here so the three pages cannot drift apart.

import { applyLang, getLang } from './i18n.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, String(v));
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

export function toast(message) {
  const box = $('#toast');
  if (!box) return;
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove('show'), 1800);
}

/** Runs `fn` the first time `node` is on screen — or straight away when there
 *  is no observer, so content is never left in its pre-animation state. */
export function observeOnce(node, fn) {
  if (!node) return;
  if (!('IntersectionObserver' in window)) {
    fn();
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          obs.disconnect();
          fn();
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  io.observe(node);
}

/** Wraps an update in a view transition where the browser has one. */
export function transition(update) {
  if (!document.startViewTransition || reducedMotion()) {
    update();
    return;
  }
  document.startViewTransition(update);
}

export function countUp(node, value) {
  const target = Number(String(value).replace(/[^\d]/g, ''));
  if (!Number.isFinite(target) || target === 0 || reducedMotion()) {
    node.textContent = String(value);
    return;
  }
  const locale = getLang() === 'ar' ? 'ar-EG' : 'en-US';
  let start = null;
  node.dataset.counting = '';
  const step = (now) => {
    start ??= now;
    const p = Math.min(1, (now - start) / 900);
    node.textContent = Math.round(target * (1 - (1 - p) ** 3)).toLocaleString(locale);
    if (p < 1) requestAnimationFrame(step);
    else delete node.dataset.counting;
  };
  requestAnimationFrame(step);
}

/** Marks the current page in the navigation. */
export function markCurrentNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  for (const a of $$('.top-nav a')) {
    const target = a.getAttribute('href').split('/').pop();
    if (target === here) a.setAttribute('aria-current', 'page');
  }
}

/** Language and theme buttons, wired identically on every page. */
export function wireHeader(onLangChange) {
  markCurrentNav();

  $('#lang-toggle')?.addEventListener('click', () => {
    transition(() => {
      applyLang(getLang() === 'ar' ? 'en' : 'ar');
      onLangChange?.();
    });
  });

  $('#theme-toggle')?.addEventListener('click', () => {
    transition(() => {
      const root = document.documentElement;
      const dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      localStorage.setItem('theme', root.dataset.theme);
    });
  });

  for (const head of $$('.sec-head')) observeOnce(head, () => head.classList.add('in'));
}
