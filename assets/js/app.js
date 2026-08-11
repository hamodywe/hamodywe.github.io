// Portfolio page. Loads data, renders, filters, and switches language/theme.

import { applyLang, detectLang, getLang, t } from './i18n.js';
import { loadRepoStats } from './github.js';

const $ = (sel) => document.querySelector(sel);

const state = {
  site: null,
  projects: [],
  stars: new Map(),
  query: '',
  tag: null,
};

/* ---------- utilities ---------- */

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

function el(tag, props = {}, children = []) {
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

const repoUrl = (id) => `https://github.com/${state.site.handle}/${id}`;

/* ---------- rendering ---------- */

function renderHeader() {
  const s = state.site[getLang()];
  $('#hero-role').textContent = s.role;
  $('#hero-tagline').textContent = s.tagline;
  $('#hero-intro').textContent = s.intro;
  $('#contrib-intro').textContent = s.contributionsIntro;
  $('#about-body').innerHTML = t('about.body');
  $('#contact-line').textContent = t('contact.line');
  $('#foot-left').textContent = t('foot.left');
  $('#q').placeholder = t('work.search');

  const mail = $('#mail-link');
  mail.href = `mailto:${state.site.email}`;
  mail.textContent = t('contact.mail');
}

function renderStats() {
  const totalTests = state.projects.reduce((n, p) => n + (p.tests || 0), 0);
  const rows = [
    [state.projects.length, t('stat.projects')],
    [totalTests.toLocaleString(getLang() === 'ar' ? 'ar-EG' : 'en-US'), t('stat.tests')],
    [0, t('stat.deps')],
    [state.site.contributions.length, t('stat.prs')],
  ];
  $('#stats').replaceChildren(
    ...rows.map(([n, label]) =>
      el('div', {}, [el('div', { class: 'stat-n', text: String(n) }), el('div', { class: 'stat-l', text: label })]),
    ),
  );
}

function renderTags() {
  const counts = new Map();
  for (const p of state.projects) for (const tag of p.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);

  const make = (label, value) =>
    el('button', {
      class: 'tag-btn',
      type: 'button',
      'aria-pressed': String(state.tag === value),
      text: label,
      onclick: () => {
        state.tag = state.tag === value ? null : value;
        renderTags();
        renderGrid();
      },
    });

  $('#tags').replaceChildren(...top.map(([tag]) => make(tag, tag)));
}

function matches(p) {
  if (state.tag && !(p.tags || []).includes(state.tag)) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const copy = p[getLang()] || p.en;
  return [p.id, copy.tagline, copy.description, ...(p.tags || [])]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function card(p) {
  const copy = p[getLang()] || p.en;
  const stat = state.stars.get(p.id);
  const run = `npx ${p.id}`;

  const top = el('div', { class: 'card-top' }, [
    el('h3', {}, [el('a', { href: repoUrl(p.id), target: '_blank', rel: 'noopener', text: p.id })]),
    p.featured ? el('span', { class: 'badge-featured', text: t('featured') }) : null,
    stat && stat.stars > 0 ? el('span', { class: 'star', text: `★ ${stat.stars}` }) : null,
  ]);

  const runRow = el('div', { class: 'card-run' }, [
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

  const meta = el(
    'div',
    { class: 'card-meta' },
    [
      ...(p.tags || []).slice(0, 3).map((tag) => el('span', { class: 'pill', text: tag })),
      p.tests ? el('span', { class: 'pill', text: `${p.tests} ${t('tests')}` }) : null,
    ],
  );

  return el('article', { class: 'card' }, [
    top,
    el('p', { class: 'card-tagline', text: copy.tagline }),
    el('p', { class: 'card-desc', text: copy.description }),
    runRow,
    meta,
  ]);
}

function renderGrid() {
  const list = state.projects.filter(matches);
  const grid = $('#grid');
  grid.replaceChildren(...list.map(card));
  $('#empty').hidden = list.length > 0;

  // Reveal on scroll, but never leave a card invisible if the observer is
  // unavailable or the element is already in view.
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

function renderContributions() {
  const lang = getLang();
  $('#contrib-list').replaceChildren(
    ...state.site.contributions.map((c) =>
      el(
        'a',
        { class: 'contrib', href: `https://github.com/${c.repo}/pull/${c.pr}`, target: '_blank', rel: 'noopener' },
        [
          el('span', { class: 'contrib-repo', text: c.repo }),
          el('span', { class: 'contrib-stars', text: `★ ${c.stars}` }),
          el('span', { class: 'contrib-what', text: c[lang] || c.en }),
          el('span', { class: 'contrib-pr', text: `#${c.pr}` }),
        ],
      ),
    ),
  );
}

function renderAll() {
  renderHeader();
  renderStats();
  renderTags();
  renderGrid();
  renderContributions();
}

/* ---------- wiring ---------- */

function wireControls() {
  $('#lang-toggle').addEventListener('click', () => {
    applyLang(getLang() === 'ar' ? 'en' : 'ar');
    renderAll();
  });

  $('#theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  });

  $('#q').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderGrid();
  });
}

async function main() {
  const [site, projects] = await Promise.all([
    fetch('data/site.json').then((r) => r.json()),
    fetch('data/projects.json').then((r) => r.json()),
  ]);

  state.site = site;
  state.projects = projects;

  applyLang(detectLang());
  wireControls();
  renderAll();

  // Stars arrive after first paint and only re-render the grid.
  state.stars = await loadRepoStats(site.handle);
  if (state.stars.size) renderGrid();
}

main().catch((err) => {
  document.getElementById('grid').innerHTML =
    `<p class="empty">Could not load project data. ${String(err.message || err)}</p>`;
});
