// The home page: the whole body of work at a glance, with the detail living
// on the tools and contributions pages.

import { applyLang, detectLang, getLang, t } from './i18n.js';
import { $, countUp, el, observeOnce, reducedMotion, wireHeader } from './shared.js';
import { configureCards, renderCards, wireDialog } from './cards.js';
import { loadRepoStats } from './github.js';

const FEATURED_COUNT = 6;
const CONTRIB_PREVIEW = 5;

const state = { site: null, projects: [], contributions: [] };

/** Splits the headline so each word can rise on its own delay. */
function setHeadline(node, text) {
  if (reducedMotion()) {
    node.textContent = text;
    return;
  }
  node.replaceChildren(
    ...text.split(' ').flatMap((word, i) => {
      const span = el('span', { class: 'w', text: word });
      span.style.setProperty('--i', String(i));
      return [span, document.createTextNode(' ')];
    }),
  );
}

function renderStats() {
  const tests = state.projects.reduce((n, p) => n + (p.tests || 0), 0);
  const rows = [
    [state.projects.length, t('stat.repos.own')],
    [tests, t('stat.tests')],
    [state.contributions.length, t('stat.fixes')],
    [new Set(state.contributions.map((c) => c.repo)).size, t('stat.repos')],
  ];
  const nodes = rows.map(([n, label]) =>
    el('div', {}, [el('div', { class: 'stat-n', text: String(n) }), el('div', { class: 'stat-l', text: label })]),
  );
  $('#stats').replaceChildren(...nodes);
  observeOnce($('#stats'), () => nodes.forEach((w, i) => countUp(w.firstChild, rows[i][0])));
}

function renderMarquee() {
  const tags = [...new Set(state.projects.flatMap((p) => p.tags || []))];
  $('#marquee').replaceChildren(...[...tags, ...tags].map((tag) => el('span', { text: tag })));
}

/** Featured first, then whatever else fills the row. */
function selection() {
  const featured = state.projects.filter((p) => p.featured);
  const rest = state.projects.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, FEATURED_COUNT);
}

function renderContribPreview() {
  const lang = getLang();
  const top = [...state.contributions].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, CONTRIB_PREVIEW);
  $('#contrib-list').replaceChildren(
    ...top.map((c) => {
      const copy = c[lang] || c.en;
      const k = c.stars >= 1000 ? `${Math.round(c.stars / 100) / 10}k` : String(c.stars);
      return el(
        'a',
        { class: 'contrib', href: `https://github.com/${c.repo}/pull/${c.pr}`, target: '_blank', rel: 'noopener' },
        [
          el('span', { class: 'contrib-repo', text: c.repo }),
          el('span', { class: 'contrib-stars', text: `★ ${k}` }),
          el('span', { class: 'contrib-what', text: copy.title }),
          el('span', { class: 'contrib-pr', text: `#${c.pr}` }),
        ],
      );
    }),
  );
}

function renderPage() {
  const s = state.site[getLang()];

  $('#hero-role').textContent = s.role;
  setHeadline($('#hero-tagline'), s.tagline);
  $('#hero-intro').textContent = s.intro;

  $('#featured-title').textContent = t('home.selected');
  $('#featured-sub').textContent = t('home.selectedSub2');
  $('#all-tools').textContent = t('home.allTools');

  $('#contrib-title').textContent = s.sections.contributions;
  $('#contrib-sub').textContent = s.contributionsIntro;
  $('#all-contrib').textContent = t('home.allContrib');

  $('#about-title').textContent = s.sections.about;
  $('#about-body').innerHTML = t('about.body');
  $('#contact-title').textContent = s.sections.contact;
  $('#contact-line').textContent = t('contact.line');
  $('#foot-left').textContent = t('foot.left');

  const mail = $('#mail-link');
  mail.href = `mailto:${state.site.email}`;
  mail.textContent = t('contact.mail');

  renderStats();
  renderMarquee();
  renderCards($('#grid'), selection(), null);
  renderContribPreview();
}

async function main() {
  const [site, projects, contributions] = await Promise.all([
    fetch('data/site.json').then((r) => r.json()),
    fetch('data/projects.json').then((r) => r.json()),
    fetch('data/contributions.json').then((r) => r.json()),
  ]);
  state.site = site;
  state.projects = projects;
  state.contributions = contributions;

  applyLang(detectLang());
  configureCards({ handle: site.handle });
  wireDialog();
  wireHeader(renderPage);
  renderPage();

  const stars = await loadRepoStats(site.handle);
  if (stars.size) {
    configureCards({ stars });
    renderCards($('#grid'), selection(), null);
  }
}

main().catch((err) => {
  $('#grid').innerHTML = `<p class="empty">Could not load the data. ${String(err.message || err)}</p>`;
});
