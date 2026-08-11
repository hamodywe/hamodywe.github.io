// The tools page: every tool, with search and tag filters.

import { applyLang, detectLang, getLang, t } from './i18n.js';
import { $, countUp, el, observeOnce, wireHeader } from './shared.js';
import { configureCards, renderCards, wireDialog } from './cards.js';
import { loadRepoStats } from './github.js';

const state = { site: null, projects: [], query: '', tag: null };

function matches(p) {
  if (state.tag && !(p.tags || []).includes(state.tag)) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const copy = p[getLang()] || p.en;
  return [p.id, copy.tagline, copy.description, ...(p.tags || [])].join(' ').toLowerCase().includes(q);
}

function renderStats() {
  const tests = state.projects.reduce((n, p) => n + (p.tests || 0), 0);
  const tags = new Set(state.projects.flatMap((p) => p.tags || []));
  const rows = [
    [state.projects.length, t('stat.projects')],
    [tests, t('stat.tests')],
    [0, t('stat.deps')],
    [tags.size, t('stat.areas')],
  ];
  const nodes = rows.map(([n, label]) =>
    el('div', {}, [el('div', { class: 'stat-n', text: String(n) }), el('div', { class: 'stat-l', text: label })]),
  );
  $('#stats').replaceChildren(...nodes);
  observeOnce($('#stats'), () => nodes.forEach((w, i) => countUp(w.firstChild, rows[i][0])));
}

function renderTags() {
  const counts = new Map();
  for (const p of state.projects) for (const tag of p.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const button = (label, value) =>
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

  $('#tags').replaceChildren(
    button(t('work.all'), null),
    ...ordered.map(([tag, n]) => button(`${tag} ${n}`, tag)),
  );
}

function renderGrid() {
  renderCards($('#grid'), state.projects.filter(matches), $('#empty'));
}

function renderPage() {
  const s = state.site[getLang()];
  $('#page-title').textContent = s.sections.work;
  $('#page-sub').textContent = t('work.intro');
  $('#q').placeholder = t('work.search');
  $('#foot-left').textContent = t('foot.left');
  renderStats();
  renderTags();
  renderGrid();
}

async function main() {
  const [site, projects] = await Promise.all([
    fetch('data/site.json').then((r) => r.json()),
    fetch('data/projects.json').then((r) => r.json()),
  ]);
  state.site = site;
  state.projects = projects;

  applyLang(detectLang());
  configureCards({ handle: site.handle });
  wireDialog();
  wireHeader(renderPage);
  renderPage();

  $('#q').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  const stars = await loadRepoStats(site.handle);
  if (stars.size) {
    configureCards({ stars });
    renderGrid();
  }
}

main().catch((err) => {
  $('#grid').innerHTML = `<p class="empty">Could not load the tools. ${String(err.message || err)}</p>`;
});
