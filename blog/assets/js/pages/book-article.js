import { books } from "../data/books-index.js";
import { escapeHTML, formatDate } from "../core/utils.js";
import { renderMarkdownToHtml } from "../core/markdown.js";
import {
  formatReadCount,
  getBookReads,
  initReadMetrics,
  onReadMetricsChange,
  recordBookRead
} from "../features/read-metrics.js?v=20260308k";

const LOCALE_KEY = "tpblog_locale_v2";
const THEME_KEY = "tpblog_theme_pref_v1";
const THEME_PREFS = ["auto", "day", "night"];

const textMap = {
  zh: {
    kicker: "\u9605\u8BFB\u5168\u6587",
    author: "\u4F5C\u8005",
    updated: "\u66F4\u65B0",
    reads: "\u9605\u8BFB",
    backHome: "\u8FD4\u56DE\u4E3B\u9875",
    backBooks: "\u8FD4\u56DE\u4E66\u5355",
    notFoundTitle: "\u672A\u627E\u5230\u8BE5\u4E66\u7C4D",
    notFoundBody: "\u5F53\u524D\u9875\u9762\u5BF9\u5E94\u7684\u4E66\u7C4D\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u79FB\u9664\u3002",
    themeAuto: "\u81EA\u52A8",
    themeDay: "\u767D\u5929",
    themeNight: "\u591C\u95F4",
    localeToggle: "EN",
    localeAria: "\u5207\u6362\u5230\u82F1\u6587"
  },
  en: {
    kicker: "BOOK NOTE",
    author: "Author",
    updated: "Updated",
    reads: "Reads",
    backHome: "Back Home",
    backBooks: "Back to Books",
    notFoundTitle: "Book Not Found",
    notFoundBody: "This page does not map to a valid book entry.",
    themeAuto: "AUTO",
    themeDay: "DAY",
    themeNight: "NIGHT",
    localeToggle: "\u4E2D",
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
const authorNode = document.getElementById("articleAuthor");
const updatedNode = document.getElementById("articleUpdated");
const readingNode = document.getElementById("articleReading");
const readsNode = document.getElementById("articleReads");
const coverNode = document.getElementById("articleCover");
const contentNode = document.getElementById("articleContent");
const fallbackNode = document.getElementById("articleFallback");
const backHomeNodes = document.querySelectorAll("[data-back-home]");
const backBookNodes = document.querySelectorAll("[data-back-books]");

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

function getCurrentBook() {
  const bookId = body.dataset.bookId || "";
  return books.find((book) => book.id === bookId) || null;
}

function renderFallback() {
  const textPack = textMap[locale];
  if (!fallbackNode || !contentNode) return;

  fallbackNode.hidden = false;
  fallbackNode.innerHTML = `<strong>${escapeHTML(textPack.notFoundTitle)}</strong><p>${escapeHTML(textPack.notFoundBody)}</p>`;
  contentNode.innerHTML = "";
}

function renderReads(bookId) {
  if (!readsNode) return;
  const textPack = textMap[locale];
  const count = formatReadCount(getBookReads(bookId), locale);
  readsNode.textContent = `${textPack.reads} ${count}`;
}

function resolveMarkdown(book, localeCode) {
  const markdownPack = book.contentMarkdown;
  if (markdownPack && typeof markdownPack === "object") {
    return markdownPack[localeCode] || markdownPack.zh || markdownPack.en || "";
  }

  const paragraphs = book.content?.[localeCode] || book.content?.zh || [];
  if (Array.isArray(paragraphs)) {
    return paragraphs.join("\n\n");
  }

  return String(paragraphs || "");
}

function renderBook() {
  const book = getCurrentBook();
  const textPack = textMap[locale];

  root.lang = locale === "zh" ? "zh-CN" : "en";

  if (localeToggle) {
    localeToggle.textContent = textPack.localeToggle;
    localeToggle.setAttribute("aria-label", textPack.localeAria);
  }

  if (!book) {
    renderFallback();
    document.title = `TPBLOG | ${textPack.notFoundTitle}`;
    return;
  }

  if (fallbackNode) {
    fallbackNode.hidden = true;
  }

  const title = book.title?.[locale] || book.title?.zh || "Untitled";
  const summary = book.summary?.[locale] || book.summary?.zh || "";
  const author = book.author?.[locale] || book.author?.zh || "";
  const reading = typeof book.reading === "string"
    ? book.reading
    : (book.reading?.[locale] || book.reading?.zh || "");
  const markdown = resolveMarkdown(book, locale);

  if (kickerNode) kickerNode.textContent = textPack.kicker;
  if (titleNode) titleNode.textContent = title;
  if (summaryNode) summaryNode.textContent = summary;
  if (authorNode) {
    authorNode.textContent = author
      ? `${textPack.author} ${author}`
      : "";
  }
  if (updatedNode) {
    updatedNode.textContent = book.updated
      ? `${textPack.updated} ${formatDate(book.updated, locale)}`
      : "";
  }
  if (readingNode) readingNode.textContent = reading;
  renderReads(book.id);

  if (coverNode) {
    const cover = String(book.cover || "").trim();
    if (cover) {
      coverNode.hidden = false;
      coverNode.innerHTML = `<img src="${escapeHTML(cover)}" alt="${escapeHTML(title)}" loading="lazy">`;
    } else {
      coverNode.hidden = true;
      coverNode.innerHTML = "";
    }
  }

  if (contentNode) {
    contentNode.innerHTML = renderMarkdownToHtml(markdown);
  }

  backHomeNodes.forEach((node) => {
    node.textContent = textPack.backHome;
  });

  backBookNodes.forEach((node) => {
    node.textContent = textPack.backBooks;
  });

  document.title = `${title} | TPBLOG`;
}

function initLocaleToggle() {
  if (!localeToggle) return;
  localeToggle.addEventListener("click", () => {
    locale = locale === "zh" ? "en" : "zh";
    saveLocale(locale);
    renderThemeButton();
    renderBook();
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
  renderBook();

  const book = getCurrentBook();
  if (book) {
    recordBookRead(book.id);
  }

  onReadMetricsChange(() => {
    const currentBook = getCurrentBook();
    if (!currentBook) return;
    renderReads(currentBook.id);
  });

  window.setInterval(() => {
    if (themePreference === "auto") {
      applyTheme();
    }
  }, 30 * 1000);
}

init();
