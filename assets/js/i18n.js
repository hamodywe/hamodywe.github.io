// Language state, UI strings, and the direction flip. No dependencies.

export const STRINGS = {
  en: {
    'skip': 'Skip to content',
    'nav.home': 'Home',
    'kind.tool': 'tool',
    'kind.handbook': 'handbook',
    'kind.app': 'app',
    'kind.list': 'list',
    'stat.handbooks': 'handbooks written',
    'stat.repos.own': 'public repositories',
    'home.selectedSub2': 'The most used and the most recent. Everything else is on the work page.',
    'nav.tools': 'Work',
    'cta.tools': 'Browse the work',
    'cta.contributions': 'See contributions',
    'home.selected': 'Selected work',
    'home.selectedSub': 'Six of them. The rest are on the tools page.',
    'home.allTools': 'All work →',
    'home.allContrib': 'All contributions →',
    'contrib.search': 'Search contributions…',
    'stat.fixes': 'fixes sent upstream',
    'stat.repos': 'projects contributed to',
    'stat.reach': 'thousand stars reached',
    'stat.langs': 'languages worked in',
    'stat.areas': 'problem areas',
    'nav.work': 'Work',
    'nav.contributions': 'Contributions',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'cta.work': 'See the work',
    'work.intro': 'Each tool targets one silent failure. TypeScript, zero runtime dependencies, offline by default.',
    'work.empty': 'Nothing matches that filter.',
    'work.search': 'Search the work…',
    'work.all': 'All',
    'foot.dashboard': 'Dashboard',
    'copy': 'copy',
    'copied': 'Copied',
    'featured': 'Featured',
    'tests': 'tests',
    'stat.projects': 'CLI tools',
    'stat.tests': 'tests passing',
    'stat.deps': 'runtime dependencies',
    'stat.prs': 'upstream fixes sent',
    'about.body': '<p>I work on the seam where a system reports success and is wrong. Most of my tools grew out of an afternoon lost to one of them: a cache that had never once hit, a required check that had silently detached from the job it was named after, an eval suite that could not go red.</p><p>Every tool is written in <strong>TypeScript with zero runtime dependencies</strong>, runs <strong>offline and deterministically</strong>, and ships with a fixture it is supposed to stay <em>silent</em> about — because a finding that is always present is a finding nobody reads.</p>',
    'contact.line': 'Available for remote roles and contract work. The fastest way to reach me is email.',
    'contact.mail': 'Email me',
    'foot.left': 'Built with no framework and no build step.',
    'detail.repo': 'Open the repository',
    'detail.more': 'details',
  },
  ar: {
    'skip': 'تخطَّ إلى المحتوى',
    'nav.home': 'الرئيسية',
    'kind.tool': 'أداة',
    'kind.handbook': 'دليل',
    'kind.app': 'تطبيق',
    'kind.list': 'قائمة',
    'stat.handbooks': 'دليلاً مكتوباً',
    'stat.repos.own': 'مستودعاً عاماً',
    'home.selectedSub2': 'الأكثر استخداماً والأحدث. والبقية في صفحة الأعمال.',
    'nav.tools': 'الأعمال',
    'cta.tools': 'استعرض الأعمال',
    'cta.contributions': 'شاهد المساهمات',
    'home.selected': 'أعمال مختارة',
    'home.selectedSub': 'ستٌّ منها. والبقية في صفحة الأدوات.',
    'home.allTools': 'كل الأعمال ←',
    'home.allContrib': 'كل المساهمات ←',
    'contrib.search': 'ابحث في المساهمات…',
    'stat.fixes': 'إصلاحاً مُرسَلاً',
    'stat.repos': 'مشروعاً ساهمت فيه',
    'stat.reach': 'ألف نجمة وصلتها',
    'stat.langs': 'لغات برمجة',
    'stat.areas': 'مجالاً تقنياً',
    'nav.work': 'الأعمال',
    'nav.contributions': 'المساهمات',
    'nav.about': 'نبذة',
    'nav.contact': 'تواصل',
    'cta.work': 'استعرض الأعمال',
    'work.intro': 'كل أداة تستهدف عطلاً صامتاً واحداً. مكتوبة بـ TypeScript، بلا اعتماديات تشغيل، وتعمل دون اتصال.',
    'work.empty': 'لا نتائج تطابق هذا الفلتر.',
    'work.search': 'ابحث في الأعمال…',
    'work.all': 'الكل',
    'foot.dashboard': 'لوحة التحكم',
    'copy': 'نسخ',
    'copied': 'تم النسخ',
    'featured': 'مميّز',
    'tests': 'اختباراً',
    'stat.projects': 'أداة سطر أوامر',
    'stat.tests': 'اختباراً ناجحاً',
    'stat.deps': 'اعتمادية تشغيل',
    'stat.prs': 'إصلاحاً مُرسَلاً لمشاريع عالمية',
    'about.body': '<p>أعمل عند الحدّ الذي يُبلّغ فيه النظام بالنجاح وهو مخطئ. أغلب أدواتي وُلدت من يوم ضاع في تعقّب واحد من هذه الأعطال: ذاكرة مؤقتة لم تُصِب ولو مرة، وفحص إلزامي انفصل بصمت عن المهمة التي سُمّي باسمها، ومجموعة تقييم لا تستطيع أن تفشل.</p><p>كل أداة مكتوبة بـ <strong>TypeScript وبلا أي اعتماديات تشغيل</strong>، وتعمل <strong>دون اتصال وبنتيجة حتمية</strong>، وتُشحن معها حالة اختبار يُفترض أن تبقى <em>صامتة</em> عنها — لأن النتيجة التي تظهر دائماً نتيجة لا يقرأها أحد.</p>',
    'contact.line': 'متاح للعمل عن بُعد والمشاريع التعاقدية. أسرع طريقة للوصول إليّ هي البريد الإلكتروني.',
    'contact.mail': 'راسلني',
    'foot.left': 'مبني بلا إطار عمل وبلا خطوة بناء.',
    'detail.repo': 'افتح المستودع',
    'detail.more': 'تفاصيل',
  },
};

let current = 'en';

export function getLang() { return current; }

export function detectLang() {
  const saved = localStorage.getItem('lang');
  if (saved === 'ar' || saved === 'en') return saved;
  return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function t(key) {
  return STRINGS[current][key] ?? STRINGS.en[key] ?? key;
}

/** Sets the language, flips direction, and applies every [data-i18n] label. */
export function applyLang(lang) {
  current = lang === 'ar' ? 'ar' : 'en';
  localStorage.setItem('lang', current);

  const html = document.documentElement;
  html.lang = current;
  html.dir = current === 'ar' ? 'rtl' : 'ltr';

  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.textContent = current === 'ar' ? 'English' : 'العربية';
    toggle.setAttribute('aria-label', current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }
}
