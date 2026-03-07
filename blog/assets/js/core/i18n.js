import { store, STORAGE_KEYS } from "./store.js";
import { isLocale } from "./utils.js";

const listeners = new Set();

const translations = {
  zh: {
    "meta.title": "TPBLOG | iOS 风格主页",
    "meta.description": "TPBLOG 的 iOS 风格个人主页，支持中英切换与自动日夜主题。",

    "nav.home": "主页",
    "nav.posts": "文章",
    "nav.knowledge": "知识库",
    "nav.stats": "统计",
    "nav.books": "书单",

    "locale.switchToEn": "切换到英文",
    "locale.switchToZh": "Switch to Chinese",

    "hero.kicker": "PERSONAL HOME",
    "hero.subtitle": "一个更轻量、更克制的 iOS 风格工作台。",
    "hero.roleLabel": "我正在长期专注：",
    "hero.text": "把写作、工程和学习沉淀在同一个首页，减少上下文切换，强化长期产出。",
    "hero.actionPrimary": "打开知识库",
    "hero.actionSecondary": "浏览文章",

    "theme.day": "白天模式",
    "theme.night": "夜间模式",
    "theme.autoShort": "自动",
    "theme.dayShort": "白天",
    "theme.nightShort": "黑夜",
    "theme.toggleHintAuto": "当前自动模式，点击切换到白天模式",
    "theme.toggleHintDay": "当前白天模式，点击切换到黑夜模式",
    "theme.toggleHintNight": "当前黑夜模式，点击恢复自动模式",

    "dashboard.nowLabel": "当前状态",
    "dashboard.clockLabel": "本地时间",
    "dashboard.focusLabel": "今日焦点",
    "dashboard.focusA": "完成 1 篇高质量输出",
    "dashboard.focusB": "知识卡再沉淀 3 条",
    "dashboard.focusC": "保持节奏，不做多线程分心",
    "dashboard.greetMorning": "早上好，开始推进主线任务",
    "dashboard.greetAfternoon": "下午好，进入深度执行区间",
    "dashboard.greetEvening": "晚上好，适合整理与复盘",
    "dashboard.greetNight": "夜间时段，建议低负荷收尾",
    "dashboard.sceneDay": "DAYLIGHT MODE ACTIVE",
    "dashboard.sceneNight": "NIGHT MODE ACTIVE",

    "intro.line": "我分享 #编程 #写作 #产品 #生活。<br>这些内容累计吸引了 <strong>{count}</strong> 次阅读。",

    "posts.title": "精选文章",
    "posts.empty": "该分类暂时还没有内容。",

    "filter.all": "全部",
    "filter.tech": "技术",
    "filter.life": "生活",
    "filter.notes": "笔记",

    "knowledge.title": "知识库",
    "knowledge.sub": "沉淀概念、方法、模板，支持检索和标签筛选。",
    "knowledge.searchLabel": "搜索",
    "knowledge.searchPlaceholder": "输入关键词：比如 SSR、复盘、写作模板",
    "knowledge.tagAll": "全部",
    "knowledge.countPrefix": "共",
    "knowledge.countSuffix": "条知识卡",
    "knowledge.empty": "没有找到相关知识卡，试试更短关键词或切换标签。",
    "knowledge.updated": "更新于 {date}",

    "stats.timeTitle": "时间分配",
    "stats.timeDesc": "最近 90 天我的精力分配如下，主要时间投入在技术与内容。",
    "stats.bar.dev": "开发",
    "stats.bar.writing": "写作",
    "stats.bar.reading": "阅读",
    "stats.bar.fitness": "运动",

    "snapshot.title": "系统快照",
    "snapshot.sub": "主页内容按模块组织，轻量但可持续迭代。",
    "snapshot.posts": "文章",
    "snapshot.knowledge": "知识卡",
    "snapshot.books": "书单",
    "snapshot.reads": "累计阅读",

    "books.title": "阅读清单",
    "books.sub": "过去几年持续阅读，以下是近期高频推荐。",

    "contact.text": "我愿意和不同领域的人一起做有意思的项目。<br>如果你也在做长期内容或产品，欢迎联系我。",

    "footer.title": "TPBLOG | iOS 风格个人主页",
    "footer.github": "GitHub",
    "footer.bilibili": "Bilibili",
    "footer.email": "Email"
  },
  en: {
    "meta.title": "TPBLOG | iOS Style Home",
    "meta.description": "TPBLOG iOS-style personal homepage with bilingual support and auto day/night theme.",

    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.knowledge": "Knowledge",
    "nav.stats": "Stats",
    "nav.books": "Books",

    "locale.switchToEn": "Switch to English",
    "locale.switchToZh": "切换到中文",

    "hero.kicker": "PERSONAL HOME",
    "hero.subtitle": "A cleaner iOS-style dashboard for focused work.",
    "hero.roleLabel": "Current long-term focus:",
    "hero.text": "Writing, engineering, and learning are now consolidated into one calm homepage.",
    "hero.actionPrimary": "Open Knowledge Base",
    "hero.actionSecondary": "Browse Posts",

    "theme.day": "Day Mode",
    "theme.night": "Night Mode",
    "theme.autoShort": "AUTO",
    "theme.dayShort": "DAY",
    "theme.nightShort": "NIGHT",
    "theme.toggleHintAuto": "Auto mode on. Click to switch to day mode.",
    "theme.toggleHintDay": "Day mode on. Click to switch to night mode.",
    "theme.toggleHintNight": "Night mode on. Click to switch back to auto mode.",

    "dashboard.nowLabel": "Current State",
    "dashboard.clockLabel": "Local Time",
    "dashboard.focusLabel": "Today's Focus",
    "dashboard.focusA": "Ship one high-quality post",
    "dashboard.focusB": "Refine three knowledge cards",
    "dashboard.focusC": "Keep single-threaded execution",
    "dashboard.greetMorning": "Good morning, move core tasks first",
    "dashboard.greetAfternoon": "Good afternoon, deep work window is open",
    "dashboard.greetEvening": "Good evening, ideal time for review",
    "dashboard.greetNight": "Night mode: keep the workload light",
    "dashboard.sceneDay": "DAYLIGHT MODE ACTIVE",
    "dashboard.sceneNight": "NIGHT MODE ACTIVE",

    "intro.line": "I share #coding #writing #product #life.<br>These stories have reached <strong>{count}</strong> reads.",

    "posts.title": "Featured Posts",
    "posts.empty": "No content in this category yet.",

    "filter.all": "All",
    "filter.tech": "Tech",
    "filter.life": "Life",
    "filter.notes": "Notes",

    "knowledge.title": "Knowledge Base",
    "knowledge.sub": "Concepts, methods, and templates with search and tag filters.",
    "knowledge.searchLabel": "Search",
    "knowledge.searchPlaceholder": "Type keywords: SSR, retrospective, writing template...",
    "knowledge.tagAll": "All",
    "knowledge.countPrefix": "",
    "knowledge.countSuffix": "knowledge cards",
    "knowledge.empty": "No matching card found. Try shorter keywords or another tag.",
    "knowledge.updated": "Updated {date}",

    "stats.timeTitle": "Time Allocation",
    "stats.timeDesc": "In the last 90 days, most of my energy went to engineering and content.",
    "stats.bar.dev": "Build",
    "stats.bar.writing": "Write",
    "stats.bar.reading": "Read",
    "stats.bar.fitness": "Fitness",

    "snapshot.title": "System Snapshot",
    "snapshot.sub": "The homepage is modular, lightweight, and built to evolve.",
    "snapshot.posts": "Posts",
    "snapshot.knowledge": "Cards",
    "snapshot.books": "Books",
    "snapshot.reads": "Reads",

    "books.title": "Reading List",
    "books.sub": "Books I repeatedly recommend from recent years.",

    "contact.text": "I love collaborating with people from different domains.<br>If you're building long-term content or products, feel free to reach out.",

    "footer.title": "TPBLOG | iOS Style Personal Home",
    "footer.github": "GitHub",
    "footer.bilibili": "Bilibili",
    "footer.email": "Email"
  }
};

function interpolate(template, params) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`;
  });
}

export function t(key, params = {}) {
  const current = translations[store.locale] || translations.zh;
  const fallback = translations.zh;
  const source = Object.prototype.hasOwnProperty.call(current, key)
    ? current[key]
    : Object.prototype.hasOwnProperty.call(fallback, key)
      ? fallback[key]
      : key;

  return interpolate(source, params);
}

export function getLocale() {
  return store.locale;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });

  document.title = t("meta.title");
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", t("meta.description"));
  }
}

function saveLocale(nextLocale) {
  try {
    localStorage.setItem(STORAGE_KEYS.locale, nextLocale);
  } catch {
    // ignore storage write failure
  }
}

function readStoredLocale() {
  try {
    return localStorage.getItem(STORAGE_KEYS.locale);
  } catch {
    return null;
  }
}

function detectBrowserLocale() {
  const raw = (navigator.language || "zh").toLowerCase();
  return raw.startsWith("zh") ? "zh" : "en";
}

function updateToggleButton(button) {
  if (!button) return;

  if (store.locale === "zh") {
    button.textContent = "EN";
    button.setAttribute("aria-label", t("locale.switchToEn"));
  } else {
    button.textContent = "中";
    button.setAttribute("aria-label", t("locale.switchToZh"));
  }
}

export function onLocaleChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setLocale(nextLocale, options = {}) {
  if (!isLocale(nextLocale) || store.locale === nextLocale) {
    return;
  }

  store.locale = nextLocale;
  document.documentElement.lang = nextLocale === "zh" ? "zh-CN" : "en";
  saveLocale(nextLocale);
  applyI18n();

  if (!options.silent) {
    listeners.forEach((listener) => listener(nextLocale));
  }
}

export function initI18n(button) {
  const stored = readStoredLocale();
  const locale = isLocale(stored) ? stored : detectBrowserLocale();

  store.locale = locale;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  applyI18n();

  if (button) {
    updateToggleButton(button);

    button.addEventListener("click", () => {
      const nextLocale = store.locale === "zh" ? "en" : "zh";
      setLocale(nextLocale);
      updateToggleButton(button);
    });

    onLocaleChange(() => {
      updateToggleButton(button);
    });
  }
}
