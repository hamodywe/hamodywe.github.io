// The contributions page: every fix sent upstream, filterable by language.

import { applyLang, detectLang, getLang, t } from './i18n.js';
import { $, countUp, el, observeOnce, wireHeader } from './shared.js';

const state = { site: null, items: [], query: '', lang: null };

const stars = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));

function matches(c) {
  if (state.lang && c.lang !== state.lang) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const copy = c[getLang()] || c.en;
  return [c.repo, c.lang, copy.title, copy.what].join(' ').toLowerCase().includes(q);
}

function renderStats() {
  const totalStars = state.items.reduce((n, c) => n + (c.stars || 0), 0);
  const repos = new Set(state.items.map((c) => c.repo));
  const langs = new Set(state.items.map((c) => c.lang));
  const rows = [
    [state.items.length, t('stat.fixes')],
    [repos.size, t('stat.repos')],
    [Math.round(totalStars / 1000), t('stat.reach')],
    [langs.size, t('stat.langs')],
  ];
  const nodes = rows.map(([n, label]) =>
    el('div', {}, [el('div', { class: 'stat-n', text: String(n) }), el('div', { class: 'stat-l', text: label })]),
  );
  $('#stats').replaceChildren(...nodes);
  observeOnce($('#stats'), () => nodes.forEach((w, i) => countUp(w.firstChild, rows[i][0])));
}

function renderLangs() {
  const counts = new Map();
  for (const c of state.items) counts.set(c.lang, (counts.get(c.lang) || 0) + 1);
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  const button = (label, value) =>
    el('button', {
      class: 'tag-btn',
      type: 'button',
      'aria-pressed': String(state.lang === value),
      text: label,
      onclick: () => {
        state.lang = state.lang === value ? null : value;
        renderLangs();
        renderList();
      },
    });

  $('#langs').replaceChildren(
    button(t('work.all'), null),
    ...ordered.map(([lang, n]) => button(`${lang} ${n}`, lang)),
  );
}

function item(c) {
  const copy = c[getLang()] || c.en;
  const node = el(
    'a',
    {
      class: 'contrib-card',
      href: `https://github.com/${c.repo}/pull/${c.pr}`,
      target: '_blank',
      rel: 'noopener',
    },
    [
      el('div', { class: 'contrib-head' }, [
        el('span', { class: 'contrib-repo', text: c.repo }),
        el('span', { class: 'contrib-stars', text: `★ ${stars(c.stars)}` }),
      ]),
      el('p', { class: 'contrib-title', text: copy.title }),
      el('p', { class: 'contrib-what', text: copy.what }),
      el('div', { class: 'card-meta' }, [
        el('span', { class: 'pill', text: c.lang }),
        el('span', { class: 'pill', text: `#${c.pr}` }),
      ]),
    ],
  );

  node.addEventListener('pointermove', (ev) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width) * 100}%`);
    node.style.setProperty('--my', `${((ev.clientY - r.top) / r.height) * 100}%`);
  });

  return node;
}

function renderList() {
  const list = state.items.filter(matches);
  const box = $('#list');
  box.replaceChildren(...list.map(item));
  $('#empty').hidden = list.length > 0;

  if (!('IntersectionObserver' in window)) {
    for (const n of box.children) n.classList.add('in');
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
  for (const n of box.children) io.observe(n);
}

function renderPage() {
  const s = state.site[getLang()];
  $('#page-title').textContent = s.sections.contributions;
  $('#page-sub').textContent = s.contributionsIntro;
  $('#q').placeholder = t('contrib.search');
  $('#foot-left').textContent = t('foot.left');
  renderStats();
  renderLangs();
  renderList();
}

async function main() {
  const [site, items] = await Promise.all([
    fetch('data/site.json').then((r) => r.json()),
    fetch('data/contributions.json').then((r) => r.json()),
  ]);
  state.site = site;
  state.items = items;

  applyLang(detectLang());
  wireHeader(renderPage);
  renderPage();

  $('#q').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderList();
  });
}

main().catch((err) => {
  $('#list').innerHTML = `<p class="empty">Could not load the contributions. ${String(err.message || err)}</p>`;
});
