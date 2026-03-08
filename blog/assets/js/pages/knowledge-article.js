import { knowledgeCards, knowledgeTagLabels } from "../data/knowledge-index.js";
import { escapeHTML, formatDate } from "../core/utils.js";
import { renderMarkdownToHtml } from "../core/markdown.js";
import {
  formatReadCount,
  getKnowledgeReads,
  initReadMetrics,
  onReadMetricsChange,
  recordKnowledgeRead
} from "../features/read-metrics.js?v=20260308k";

const LOCALE_KEY = "tpblog_locale_v2";
const THEME_KEY = "tpblog_theme_pref_v1";
const THEME_PREFS = ["auto", "day", "night"];

const textMap = {
  zh: {
    kicker: "KNOWLEDGE ARTICLE",
    updated: "更新于",
    reads: "阅读",
    backHome: "返回主页",
    backKnowledge: "返回知识库",
    notFoundTitle: "未找到知识卡",
    notFoundBody: "当前页面对应的知识卡不存在，可能已被重命名或移除。",
    themeAuto: "自动",
    themeDay: "白天",
    themeNight: "黑夜",
    localeToggle: "EN",
    localeAria: "切换到英文"
  },
  en: {
    kicker: "KNOWLEDGE ARTICLE",
    updated: "Updated",
    reads: "Reads",
    backHome: "Back Home",
    backKnowledge: "Knowledge Index",
    notFoundTitle: "Knowledge Entry Not Found",
    notFoundBody: "This page does not map to a valid knowledge card.",
    themeAuto: "AUTO",
    themeDay: "DAY",
    themeNight: "NIGHT",
    localeToggle: "中",
    localeAria: "Switch to Chinese"
  }
};

const root = document.documentElement;
const body = document.body;
const localeToggle = document.getElementById("localeToggle");
const themeToggle = document.getElementById("themeToggle");
const kickerNode = document.getElementById("articleKicker");
const titleNode = document.getElementById("articleTitle");
const summaryNode = document.getElementById("articleSummary");
const updatedNode = document.getElementById("articleUpdated");
const readingNode = document.getElementById("articleReading");
const readsNode = document.getElementById("articleReads");
const tagsNode = document.getElementById("articleTags");
const contentNode = document.getElementById("articleContent");
const backHomeNodes = document.querySelectorAll("[data-back-home]");
const backKnowledgeNodes = document.querySelectorAll("[data-back-knowledge]");
const fallbackNode = document.getElementById("articleFallback");

let locale = "zh";
let themePreference = "auto";

function isLocale(value) {
  return value === "zh" || value === "en";
}

function detectLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // ignore storage error
  }

  const lang = (navigator.language || "zh").toLowerCase();
  return lang.startsWith("zh") ? "zh" : "en";
}

function saveLocale(nextLocale) {
  try {
    localStorage.setItem(LOCALE_KEY, nextLocale);
  } catch {
    // ignore storage error
  }
}

function readThemePreference() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEME_PREFS.includes(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

function saveThemePreference(nextPreference) {
  try {
    localStorage.setItem(THEME_KEY, nextPreference);
  } catch {
    // ignore storage error
  }
}

function resolveThemeByTime(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
}

function resolveTheme() {
  if (themePreference === "day" || themePreference === "night") return themePreference;
  return resolveThemeByTime(new Date().getHours());
}

function applyTheme() {
  root.dataset.theme = resolveTheme();
}

function renderThemeButton() {
  if (!themeToggle) return;
  const textPack = textMap[locale];
  const label = themePreference === "day"
    ? textPack.themeDay
    : themePreference === "night"
      ? textPack.themeNight
      : textPack.themeAuto;
  themeToggle.textContent = label;
}

function toggleTheme() {
  const index = THEME_PREFS.indexOf(themePreference);
  themePreference = THEME_PREFS[(index + 1) % THEME_PREFS.length];
  saveThemePreference(themePreference);
  applyTheme();
  renderThemeButton();
}

function getCurrentCard() {
  const cardId = body.dataset.cardId || "";
  return knowledgeCards.find((card) => card.id === cardId) || null;
}

function renderFallback() {
  const textPack = textMap[locale];
  if (!fallbackNode || !contentNode) return;

  fallbackNode.hidden = false;
  fallbackNode.innerHTML = `<strong>${escapeHTML(textPack.notFoundTitle)}</strong><p>${escapeHTML(textPack.notFoundBody)}</p>`;
  contentNode.innerHTML = "";
}

function renderReads(cardId) {
  const card = knowledgeCards.find((item) => item.id === cardId);
  if (!card || !readsNode) return;

  const textPack = textMap[locale];
  const count = formatReadCount(getKnowledgeReads(card.id), locale);
  readsNode.textContent = `${textPack.reads} ${count}`;
}

function resolveMarkdown(card, localeCode) {
  const markdownPack = card.contentMarkdown;
  if (markdownPack && typeof markdownPack === "object") {
    return markdownPack[localeCode] || markdownPack.zh || markdownPack.en || "";
  }

  const paragraphs = card.content?.[localeCode] || card.content?.zh || [];
  if (Array.isArray(paragraphs)) {
    return paragraphs.join("\n\n");
  }

  return String(paragraphs || "");
}

function renderArticle() {
  const card = getCurrentCard();
  const textPack = textMap[locale];

  root.lang = locale === "zh" ? "zh-CN" : "en";

  if (localeToggle) {
    localeToggle.textContent = textPack.localeToggle;
    localeToggle.setAttribute("aria-label", textPack.localeAria);
  }

  if (!card) {
    renderFallback();
    document.title = `TPBLOG | ${textPack.notFoundTitle}`;
    return;
  }

  if (fallbackNode) {
    fallbackNode.hidden = true;
  }

  const title = card.title[locale] || card.title.zh;
  const summary = card.summary[locale] || card.summary.zh;
  const reading = typeof card.reading === "string" ? card.reading : (card.reading?.[locale] || card.reading?.zh || "");
  const markdown = resolveMarkdown(card, locale);
  const formattedDate = formatDate(card.updated, locale);

  if (kickerNode) kickerNode.textContent = textPack.kicker;
  if (titleNode) titleNode.textContent = title;
  if (summaryNode) summaryNode.textContent = summary;
  if (updatedNode) updatedNode.textContent = `${textPack.updated} ${formattedDate}`;
  if (readingNode) readingNode.textContent = reading;
  renderReads(card.id);

  backHomeNodes.forEach((node) => {
    node.textContent = textPack.backHome;
  });
  backKnowledgeNodes.forEach((node) => {
    node.textContent = textPack.backKnowledge;
  });

  if (tagsNode) {
    tagsNode.innerHTML = card.tags
      .map((tag) => {
        const labelPack = knowledgeTagLabels[tag];
        const value = labelPack ? (labelPack[locale] || labelPack.zh) : tag;
        return `<span class="article-tag">${escapeHTML(value)}</span>`;
      })
      .join("");
  }

  if (contentNode) {
    contentNode.innerHTML = renderMarkdownToHtml(markdown);
  }

  document.title = `${title} | TPBLOG`;
}

function initLocaleToggle() {
  if (!localeToggle) return;
  localeToggle.addEventListener("click", () => {
    locale = locale === "zh" ? "en" : "zh";
    saveLocale(locale);
    renderThemeButton();
    renderArticle();
  });
}

function initThemeToggle() {
  if (!themeToggle) return;
  themeToggle.addEventListener("click", toggleTheme);
}

function init() {
  locale = detectLocale();
  themePreference = readThemePreference();

  initLocaleToggle();
  initThemeToggle();
  initReadMetrics({ poll: false });

  applyTheme();
  renderThemeButton();
  renderArticle();

  const card = getCurrentCard();
  if (card) {
    recordKnowledgeRead(card.id);
  }

  onReadMetricsChange(() => {
    const current = getCurrentCard();
    if (!current) return;
    renderReads(current.id);
  });

  window.setInterval(() => {
    if (themePreference === "auto") {
      applyTheme();
    }
  }, 30 * 1000);
}

init();
