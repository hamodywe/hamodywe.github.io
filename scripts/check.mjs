// Self-check for the site's content.
//
// The site has no build step, so nothing else would catch a project added in
// one language only, a data-i18n key with no string behind it, or a card whose
// repository name does not exist. Run: node scripts/check.mjs

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFile(path.join(root, p), 'utf8');

const problems = [];
const fail = (msg) => problems.push(msg);

const projects = JSON.parse(await read('data/projects.json'));
const site = JSON.parse(await read('data/site.json'));
const contributions = JSON.parse(await read('data/contributions.json'));
const i18nSrc = await read('assets/js/i18n.js');

/* --- every project is complete in both languages --- */

const seen = new Set();
for (const p of projects) {
  if (!p.id) fail('a project has no id');
  if (seen.has(p.id)) fail(`duplicate project id: ${p.id}`);
  seen.add(p.id);

  for (const lang of ['en', 'ar']) {
    const copy = p[lang];
    if (!copy) {
      fail(`${p.id}: missing "${lang}" block`);
      continue;
    }
    if (!copy.tagline?.trim()) fail(`${p.id}: empty ${lang}.tagline`);
    if (!copy.description?.trim()) fail(`${p.id}: empty ${lang}.description`);
  }

  if (!Array.isArray(p.tags) || p.tags.length === 0) fail(`${p.id}: no tags`);
}

/* --- site copy exists in both languages --- */

for (const lang of ['en', 'ar']) {
  const s = site[lang];
  if (!s) {
    fail(`site.json: missing "${lang}" block`);
    continue;
  }
  for (const key of ['name', 'role', 'tagline', 'intro', 'contributionsIntro']) {
    if (!s[key]?.trim()) fail(`site.json ${lang}.${key} is empty`);
  }
}

const prSeen = new Set();
for (const c of contributions) {
  const key = `${c.repo}#${c.pr}`;
  if (prSeen.has(key)) fail(`duplicate contribution: ${key}`);
  prSeen.add(key);
  if (!c.lang?.trim()) fail(`${key}: no language`);
  if (!Number.isFinite(c.stars)) fail(`${key}: stars must be a number`);
  for (const lang of ['en', 'ar']) {
    if (!c[lang]?.title?.trim()) fail(`${key}: empty ${lang}.title`);
    if (!c[lang]?.what?.trim()) fail(`${key}: empty ${lang}.what`);
  }
}

/* --- the two string tables carry the same keys --- */

const keysOf = (lang) => {
  const block = i18nSrc.match(new RegExp(`\\b${lang}:\\s*\\{([\\s\\S]*?)\\n  \\},`));
  if (!block) return null;
  return new Set([...block[1].matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
};

const en = keysOf('en');
const ar = keysOf('ar');

if (!en || !ar) {
  fail('could not read the i18n string tables');
} else {
  for (const k of en) if (!ar.has(k)) fail(`i18n: "${k}" exists in en but not ar`);
  for (const k of ar) if (!en.has(k)) fail(`i18n: "${k}" exists in ar but not en`);
}

/* --- every data-i18n attribute has a string behind it --- */

for (const file of ['index.html', 'admin.html']) {
  const html = await read(file);
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) {
    if (en && !en.has(m[1])) fail(`${file}: data-i18n="${m[1]}" has no string`);
  }
}

/* --- report --- */

if (problems.length > 0) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exitCode = 1;
} else {
  console.log(`ok — ${projects.length} projects, ${contributions.length} contributions, both languages complete`);
}
