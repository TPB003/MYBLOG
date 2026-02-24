import { store, STORAGE_KEYS } from "./store.js";
import { isLocale } from "./utils.js";

const listeners = new Set();

const translations = {
  zh: {
    "meta.title": "TPBLOG | 个性化博客与知识库",
    "meta.description": "TPBLOG 的个人博客与知识库，记录技术、创作、生活与实时天气。",

    "nav.home": "主页",
    "nav.posts": "文章",
    "nav.knowledge": "知识库",
    "nav.ideas": "想法",
    "nav.weather": "天气",
    "nav.stats": "统计",
    "nav.books": "书单",

    "locale.switchToEn": "切换到英文",
    "locale.switchToZh": "Switch to Chinese",

    "hero.kicker": "MY NAME IS",
    "hero.subtitle": "Build, write, learn, repeat.",
    "hero.roleLabel": "我是一个：",
    "hero.text": "我在这里发布关于 Web 开发、内容创作和生活实验的长期记录。灵感很多，交付更重要。",
    "hero.actionPrimary": "打开知识库",
    "hero.actionSecondary": "发送想法",

    "orbit.code": "代码",
    "orbit.learn": "学习",
    "orbit.write": "写作",

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

    "ideas.title": "想法发布台",
    "ideas.sub": "记录并发送你的即时想法，自动保存到浏览器本地。",
    "ideas.formTitle": "发送一个想法",
    "ideas.contentLabel": "内容",
    "ideas.contentPlaceholder": "写下今天的灵感、观察或结论...",
    "ideas.moodLabel": "标签",
    "ideas.submit": "发送到想法流",
    "ideas.tip": "说明：想法会保存在当前浏览器，不会上传服务器。",
    "ideas.feedTitle": "实时想法流",
    "ideas.clear": "清空本地",
    "ideas.empty": "还没有想法，写下第一条吧。",
    "ideas.confirmClear": "确认清空你在本浏览器中的想法记录吗？",
    "ideas.alertShort": "想法至少输入 4 个字。",

    "mood.thinking": "思考",
    "mood.inspiration": "灵感",
    "mood.log": "记录",

    "weather.title": "每日天气",
    "weather.sub": "自动定位 + 实时天气 + 每日预报（7 天）。",
    "weather.loadingLocation": "定位中...",
    "weather.loadingDesc": "正在读取实时天气",
    "weather.refresh": "刷新",
    "weather.humidity": "湿度",
    "weather.wind": "风速",
    "weather.updated": "更新时间",
    "weather.forecastTitle": "未来 7 天",
    "weather.today": "今天",
    "weather.failedLocation": "天气读取失败",
    "weather.failedDesc": "请检查网络后点击刷新",
    "weather.noData": "暂无预报数据",

    "stats.timeTitle": "时间分配",
    "stats.timeDesc": "最近 90 天我的精力分配如下，主要时间依旧投入在技术与内容。",
    "stats.spaceTitle": "足迹",
    "stats.spaceDesc": "当前创作地点：Suzhou, China。",
    "stats.location": "Suzhou",
    "stats.bar.dev": "开发",
    "stats.bar.writing": "写作",
    "stats.bar.reading": "阅读",
    "stats.bar.fitness": "运动",

    "books.title": "阅读清单",
    "books.sub": "过去几年持续阅读，以下是近期高频推荐。",

    "contact.text": "我愿意和不同领域的人一起做有意思的项目。<br>如果你也在做长期内容或产品，欢迎联系我。",

    "footer.title": "TPBLOG | 数字创作博客",
    "footer.github": "GitHub",
    "footer.bilibili": "Bilibili",
    "footer.email": "Email"
  },
  en: {
    "meta.title": "TPBLOG | Personal Blog & Knowledge Base",
    "meta.description": "TPBLOG personal hub for engineering, writing, life notes, and live weather.",

    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.knowledge": "Knowledge",
    "nav.ideas": "Ideas",
    "nav.weather": "Weather",
    "nav.stats": "Stats",
    "nav.books": "Books",

    "locale.switchToEn": "Switch to English",
    "locale.switchToZh": "切换到中文",

    "hero.kicker": "MY NAME IS",
    "hero.subtitle": "Build, write, learn, repeat.",
    "hero.roleLabel": "I am a:",
    "hero.text": "This is my long-form lab for web engineering, creator workflow, and life experiments.",
    "hero.actionPrimary": "Open Knowledge Base",
    "hero.actionSecondary": "Post an Idea",

    "orbit.code": "CODE",
    "orbit.learn": "LEARN",
    "orbit.write": "WRITE",

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

    "ideas.title": "Idea Publishing",
    "ideas.sub": "Capture and post your thoughts instantly, stored in local browser storage.",
    "ideas.formTitle": "Send an Idea",
    "ideas.contentLabel": "Content",
    "ideas.contentPlaceholder": "Write today's insight, observation, or conclusion...",
    "ideas.moodLabel": "Label",
    "ideas.submit": "Send to Idea Stream",
    "ideas.tip": "Note: ideas are stored locally in this browser only.",
    "ideas.feedTitle": "Live Idea Stream",
    "ideas.clear": "Clear Local",
    "ideas.empty": "No ideas yet. Publish your first one.",
    "ideas.confirmClear": "Clear your local idea records in this browser?",
    "ideas.alertShort": "Please enter at least 4 characters.",

    "mood.thinking": "Thinking",
    "mood.inspiration": "Inspiration",
    "mood.log": "Log",

    "weather.title": "Daily Weather",
    "weather.sub": "Auto location + live conditions + 7-day forecast.",
    "weather.loadingLocation": "Locating...",
    "weather.loadingDesc": "Loading live weather",
    "weather.refresh": "Refresh",
    "weather.humidity": "Humidity",
    "weather.wind": "Wind",
    "weather.updated": "Updated",
    "weather.forecastTitle": "Next 7 Days",
    "weather.today": "Today",
    "weather.failedLocation": "Weather load failed",
    "weather.failedDesc": "Check your network and refresh.",
    "weather.noData": "No forecast data",

    "stats.timeTitle": "Time Allocation",
    "stats.timeDesc": "In the last 90 days, most of my energy stayed in engineering and content creation.",
    "stats.spaceTitle": "Footprint",
    "stats.spaceDesc": "Current creation base: Suzhou, China.",
    "stats.location": "Suzhou",
    "stats.bar.dev": "Build",
    "stats.bar.writing": "Write",
    "stats.bar.reading": "Read",
    "stats.bar.fitness": "Fitness",

    "books.title": "Reading List",
    "books.sub": "Books I repeatedly recommend from recent years.",

    "contact.text": "I love collaborating with people from different domains.<br>If you're building long-term content or products, feel free to reach out.",

    "footer.title": "TPBLOG | Personal Creative Hub",
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
