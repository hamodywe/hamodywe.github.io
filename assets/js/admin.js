// Dashboard. Edits the project list in the browser and hands back the exact
// file to commit — there is no server, so nothing here can silently diverge
// from what the site actually reads.

import { applyLang, detectLang, getLang } from './i18n.js';

const $ = (sel) => document.querySelector(sel);
const DRAFT_KEY = 'projects-draft-v1';

const UI = {
  en: {
    brand: 'Dashboard',
    back: '← Site',
    title: 'Projects',
    sub: 'Add, edit and reorder what the site shows. Nothing is uploaded.',
    note: 'Edits live in this browser only. When you are done, download <code>projects.json</code>, replace <code>data/projects.json</code> in the repository, and push — the site reads that file directly.',
    formTitle: 'Add a project',
    formSub: 'Both languages are required: a card with a missing translation would fall back to English and look unfinished.',
    listTitle: 'Current projects',
    listSub: 'Drag order is the display order. Newest edits are kept as a draft until you download.',
    id: 'Repository name',
    hintId: 'Must match the GitHub repository exactly — the card links to it and reads its stars.',
    tests: 'Tests',
    featured: 'Featured',
    tags: 'Tags',
    hintTags: 'Comma separated. The first three appear on the card.',
    enTagline: 'Tagline — English',
    enDesc: 'Description — English',
    arTagline: 'Tagline — Arabic',
    arDesc: 'Description — Arabic',
    save: 'Save',
    update: 'Update',
    clear: 'Clear',
    download: 'Download projects.json',
    copy: 'Copy JSON',
    revert: 'Revert to file',
    out: 'File preview',
    saved: 'Saved',
    removed: 'Removed',
    copied: 'Copied to clipboard',
    reverted: 'Reverted to the committed file',
    exists: 'A project with that name already exists',
    confirmDelete: 'Remove this project?',
  },
  ar: {
    brand: 'لوحة التحكم',
    back: '← الموقع',
    title: 'المشاريع',
    sub: 'أضف وعدّل ورتّب ما يعرضه الموقع. لا شيء يُرفع إلى خادم.',
    note: 'التعديلات تبقى في هذا المتصفح فقط. عند الانتهاء، نزّل ملف <code>projects.json</code>، واستبدل به <code>data/projects.json</code> في المستودع، وادفعه — فالموقع يقرأ ذلك الملف مباشرة.',
    formTitle: 'إضافة مشروع',
    formSub: 'اللغتان مطلوبتان: البطاقة التي ينقصها ترجمة ستعود للإنجليزية وتبدو غير مكتملة.',
    listTitle: 'المشاريع الحالية',
    listSub: 'الترتيب هنا هو ترتيب العرض. تُحفظ تعديلاتك كمسودّة حتى تنزّل الملف.',
    id: 'اسم المستودع',
    hintId: 'يجب أن يطابق اسم مستودع GitHub تماماً — البطاقة ترتبط به وتقرأ نجومه.',
    tests: 'عدد الاختبارات',
    featured: 'مميّز',
    tags: 'الوسوم',
    hintTags: 'مفصولة بفواصل. تظهر أول ثلاثة على البطاقة.',
    enTagline: 'العنوان — بالإنجليزية',
    enDesc: 'الوصف — بالإنجليزية',
    arTagline: 'العنوان — بالعربية',
    arDesc: 'الوصف — بالعربية',
    save: 'حفظ',
    update: 'تحديث',
    clear: 'مسح',
    download: 'تنزيل projects.json',
    copy: 'نسخ الملف',
    revert: 'العودة للملف الأصلي',
    out: 'معاينة الملف',
    saved: 'حُفظ',
    removed: 'حُذف',
    copied: 'نُسخ إلى الحافظة',
    reverted: 'أُعيد إلى الملف المثبَّت',
    exists: 'يوجد مشروع بهذا الاسم بالفعل',
    confirmDelete: 'حذف هذا المشروع؟',
  },
};

const state = { projects: [], editingId: null, fromFile: [] };
const ui = () => UI[getLang()];

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

const serialise = () => `${JSON.stringify(state.projects, null, 2)}\n`;

function persist() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state.projects));
  } catch {
    // A full quota should not stop the session; the download still works.
  }
  $('#out').textContent = serialise();
}

/* ---------- labels ---------- */

function paintLabels() {
  const s = ui();
  $('#brand-label').textContent = s.brand;
  $('#back-link').textContent = s.back;
  $('#dash-title').textContent = s.title;
  $('#dash-sub').textContent = s.sub;
  $('#dash-note').innerHTML = s.note;
  $('#form-title').textContent = state.editingId ? `${s.update}: ${state.editingId}` : s.formTitle;
  $('#form-sub').textContent = s.formSub;
  $('#list-title').textContent = s.listTitle;
  $('#list-sub').textContent = s.listSub;
  $('#hint-id').textContent = s.hintId;
  $('#hint-tags').textContent = s.hintTags;
  $('#btn-save').textContent = state.editingId ? s.update : s.save;
  $('#btn-reset').textContent = s.clear;
  $('#btn-download').textContent = s.download;
  $('#btn-copy').textContent = s.copy;
  $('#btn-revert').textContent = s.revert;
  $('#out-label').textContent = s.out;

  for (const label of document.querySelectorAll('label[data-k]')) {
    const key = label.dataset.k;
    if (s[key]) label.textContent = s[key];
  }

  const toggle = $('#lang-toggle');
  toggle.textContent = getLang() === 'ar' ? 'English' : 'العربية';
}

/* ---------- list ---------- */

function renderList() {
  const s = ui();
  const rows = state.projects.map((p, i) => buildRow(p, i, p[getLang()] || p.en, s));
  $('#list').replaceChildren(...rows);
}

function buildRow(p, index, copy, s) {
  const row = document.createElement('div');
  row.className = 'admin-item';

  const name = document.createElement('strong');
  name.textContent = p.id;

  const desc = document.createElement('span');
  desc.textContent = copy?.tagline ?? '';

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const mk = (label, title, fn, danger = false) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `icon-btn${danger ? ' danger' : ''}`;
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', fn);
    return b;
  };

  actions.append(
    mk('↑', 'move up', () => move(index, -1)),
    mk('↓', 'move down', () => move(index, 1)),
    mk('✎', 'edit', () => startEdit(p.id)),
    mk('✕', 'remove', () => remove(p.id), true),
  );

  row.append(name, desc, actions);
  return row;
}

function move(index, delta) {
  const next = index + delta;
  if (next < 0 || next >= state.projects.length) return;
  const [item] = state.projects.splice(index, 1);
  state.projects.splice(next, 0, item);
  persist();
  renderList();
}

function remove(id) {
  if (!confirm(ui().confirmDelete)) return;
  state.projects = state.projects.filter((p) => p.id !== id);
  if (state.editingId === id) resetForm();
  persist();
  renderList();
  toast(ui().removed);
}

/* ---------- form ---------- */

function startEdit(id) {
  const p = state.projects.find((x) => x.id === id);
  if (!p) return;
  state.editingId = id;
  $('#f-id').value = p.id;
  $('#f-tests').value = p.tests ?? '';
  $('#f-featured').value = p.featured ? 'true' : 'false';
  $('#f-tags').value = (p.tags || []).join(', ');
  $('#f-en-tag').value = p.en?.tagline ?? '';
  $('#f-en-desc').value = p.en?.description ?? '';
  $('#f-ar-tag').value = p.ar?.tagline ?? '';
  $('#f-ar-desc').value = p.ar?.description ?? '';
  paintLabels();
  $('#f-id').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  state.editingId = null;
  $('#form').reset();
  paintLabels();
}

function readForm() {
  const tests = Number.parseInt($('#f-tests').value, 10);
  return {
    id: $('#f-id').value.trim(),
    featured: $('#f-featured').value === 'true',
    tags: $('#f-tags').value.split(',').map((s) => s.trim()).filter(Boolean),
    tests: Number.isFinite(tests) && tests > 0 ? tests : undefined,
    en: { tagline: $('#f-en-tag').value.trim(), description: $('#f-en-desc').value.trim() },
    ar: { tagline: $('#f-ar-tag').value.trim(), description: $('#f-ar-desc').value.trim() },
  };
}

function onSubmit(event) {
  event.preventDefault();
  const entry = readForm();
  if (entry.tests === undefined) delete entry.tests;

  const clash = state.projects.some((p) => p.id === entry.id && p.id !== state.editingId);
  if (clash) {
    toast(ui().exists);
    return;
  }

  if (state.editingId) {
    const i = state.projects.findIndex((p) => p.id === state.editingId);
    state.projects[i] = entry;
  } else {
    state.projects.push(entry);
  }

  resetForm();
  persist();
  renderList();
  toast(ui().saved);
}

/* ---------- export ---------- */

function download() {
  const blob = new Blob([serialise()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'projects.json' });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(serialise());
    toast(ui().copied);
  } catch {
    $('#out').focus();
  }
}

async function revert() {
  state.projects = structuredClone(state.fromFile);
  localStorage.removeItem(DRAFT_KEY);
  resetForm();
  persist();
  renderList();
  toast(ui().reverted);
}

/* ---------- boot ---------- */

async function main() {
  state.fromFile = await fetch('data/projects.json').then((r) => r.json());

  let draft = null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) draft = JSON.parse(raw);
  } catch {
    draft = null;
  }
  state.projects = Array.isArray(draft) && draft.length ? draft : structuredClone(state.fromFile);

  applyLang(detectLang());
  paintLabels();
  renderList();
  persist();

  $('#form').addEventListener('submit', onSubmit);
  $('#btn-reset').addEventListener('click', resetForm);
  $('#btn-download').addEventListener('click', download);
  $('#btn-copy').addEventListener('click', copyJson);
  $('#btn-revert').addEventListener('click', revert);

  $('#lang-toggle').addEventListener('click', () => {
    applyLang(getLang() === 'ar' ? 'en' : 'ar');
    paintLabels();
    renderList();
  });

  $('#theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  });
}

main().catch((err) => {
  $('#list').textContent = `Could not load data/projects.json — ${String(err.message || err)}`;
});
