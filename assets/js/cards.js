// The project card and its detail dialog. Shared by the home page (a
// selection) and the tools page (all of them).

import { getLang, t } from './i18n.js';
import { $, el, toast } from './shared.js';

let handle = 'hamodywe';
let stars = new Map();

export function configureCards(options) {
  if (options.handle) handle = options.handle;
  if (options.stars) stars = options.stars;
}

export const repoUrl = (id) => `https://github.com/${handle}/${id}`;

export function openDetail(p) {
  const copy = p[getLang()] || p.en;
  const stat = stars.get(p.id);

  $('#detail-in').replaceChildren(
    el('h3', { id: 'detail-title', text: p.id }),
    el('p', { class: 'lede', text: copy.tagline }),
    el('p', { text: copy.description }),
    p.kind === 'tool' ? el('div', { class: 'card-run' }, [el('span', { text: `npx ${p.id}` })]) : null,
    el('div', { class: 'card-meta' }, [
      ...(p.tags || []).map((tag) => el('span', { class: 'pill', text: tag })),
      p.tests ? el('span', { class: 'pill', text: `${p.tests} ${t('tests')}` }) : null,
      stat && stat.stars > 0 ? el('span', { class: 'pill', text: `★ ${stat.stars}` }) : null,
    ]),
    el('div', { class: 'hero-actions' }, [
      el('a', {
        class: 'btn btn-primary',
        href: repoUrl(p.id),
        target: '_blank',
        rel: 'noopener',
        text: t('detail.repo'),
      }),
    ]),
  );

  const dlg = $('#detail');
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}

export function card(p) {
  const copy = p[getLang()] || p.en;
  const stat = stars.get(p.id);
  const run = `npx ${p.id}`;

  const top = el('div', { class: 'card-top' }, [
    el('h3', {}, [el('a', { href: repoUrl(p.id), target: '_blank', rel: 'noopener', text: p.id })]),
    el('span', { class: `kind kind-${p.kind || 'tool'}`, text: t(`kind.${p.kind || 'tool'}`) }),
    stat && stat.stars > 0 ? el('span', { class: 'star', text: `★ ${stat.stars}` }) : null,
  ]);

  const runRow = p.kind !== 'tool' ? null : el('div', { class: 'card-run' }, [
    el('span', { text: run }),
    el('button', {
      type: 'button',
      text: t('copy'),
      'aria-label': `${t('copy')} ${run}`,
      onclick: async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        try {
          await navigator.clipboard.writeText(run);
          toast(t('copied'));
        } catch {
          toast(run);
        }
      },
    }),
  ]);

  const meta = el('div', { class: 'card-meta' }, [
    ...(p.tags || []).slice(0, 3).map((tag) => el('span', { class: 'pill', text: tag })),
    p.tests ? el('span', { class: 'pill', text: `${p.tests} ${t('tests')}` }) : null,
    el('button', {
      class: 'card-more',
      type: 'button',
      text: t('detail.more'),
      onclick: (ev) => {
        ev.stopPropagation();
        openDetail(p);
      },
    }),
  ]);

  const node = el('article', { class: 'card' }, [
    top,
    el('p', { class: 'card-tagline', text: copy.tagline }),
    el('p', { class: 'card-desc', text: copy.description }),
    runRow,
    meta,
  ]);

  node.addEventListener('pointermove', (ev) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width) * 100}%`);
    node.style.setProperty('--my', `${((ev.clientY - r.top) / r.height) * 100}%`);
  });

  node.addEventListener('click', (ev) => {
    if (ev.target.closest('a, button')) return;
    openDetail(p);
  });

  return node;
}

/** Fills `grid` with cards and reveals them, hiding `empty` when there are any. */
export function renderCards(grid, list, empty) {
  grid.replaceChildren(...list.map(card));
  if (empty) empty.hidden = list.length > 0;

  if (!('IntersectionObserver' in window)) {
    for (const c of grid.children) c.classList.add('in');
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -40px 0px' },
  );
  for (const c of grid.children) io.observe(c);
}

/** Close handlers for the shared dialog. */
export function wireDialog() {
  const dlg = $('#detail');
  if (!dlg) return;
  $('#detail-close')?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (ev) => {
    if (ev.target === dlg) dlg.close();
  });
}
