import { books, posts, profile, statsBars } from "../data/content.js";
import { knowledgeCards } from "../data/knowledge-index.js";
import { getLocale, t } from "../core/i18n.js";
import { animateCounter } from "./effects.js";
import { escapeHTML } from "../core/utils.js";
import { formatReadCount, getTotalReads, onReadMetricsChange } from "./read-metrics.js?v=20260308j";

const heroRoleList = document.getElementById("heroRoleList");
const topicTrack = document.getElementById("topicTrack");
const introLine = document.getElementById("introLine");
const statsBarsWrap = document.getElementById("statsBars");
const bookGrid = document.getElementById("bookGrid");
const snapshotPosts = document.getElementById("snapshotPosts");
const snapshotKnowledge = document.getElementById("snapshotKnowledge");
const snapshotBooks = document.getElementById("snapshotBooks");
const snapshotReads = document.getElementById("snapshotReads");

let readsAnimated = false;

function setSnapshotMetric(node, value) {
  if (!node) return;
  const formatted = String(value);
  node.textContent = formatted;
  node.dataset.value = formatted;
}

function renderHeroRoles(locale) {
  if (!heroRoleList) return;

  const roles = profile.roles[locale] || profile.roles.zh;
  heroRoleList.innerHTML = roles.map((role) => `<li>${escapeHTML(role)}</li>`).join("");
}

function renderTopicTrack(locale) {
  if (!topicTrack) return;

  const topics = profile.topics[locale] || profile.topics.zh;
  const doubled = [...topics, ...topics];
  topicTrack.innerHTML = doubled.map((topic) => `<li>${escapeHTML(topic)}</li>`).join("");
}

function updateReadViews(locale) {
  const totalReads = getTotalReads();
  const formatted = formatReadCount(totalReads, locale);

  const countNode = introLine ? introLine.querySelector("#countUp") : null;
  if (countNode) {
    if (!readsAnimated) {
      animateCounter(countNode, totalReads, locale);
      readsAnimated = true;
    } else {
      countNode.textContent = formatted;
    }
  }

  if (snapshotReads) {
    setSnapshotMetric(snapshotReads, formatted);
  }
}

function renderIntroLine(locale) {
  if (!introLine) return;

  introLine.innerHTML = t("intro.line", {
    count: "<span id=\"countUp\">0</span>"
  });

  updateReadViews(locale);
}

function renderStatsBars() {
  if (!statsBarsWrap) return;

  statsBarsWrap.innerHTML = statsBars
    .map((bar) => {
      return `
        <div>
          <span>${escapeHTML(t(`stats.bar.${bar.key}`))}</span>
          <b style="--w:${bar.value}%"></b>
        </div>
      `;
    })
    .join("");
}

function renderBooks(locale) {
  if (!bookGrid) return;

  bookGrid.innerHTML = books
    .map((book) => {
      const title = book.title[locale] || book.title.zh;
      const summary = book.summary[locale] || book.summary.zh;

      return `
        <article class="book-card interactive-tilt">
          <h4>${escapeHTML(title)}</h4>
          <p>${escapeHTML(summary)}</p>
        </article>
      `;
    })
    .join("");
}

function renderSnapshot(locale) {
  const localeCode = locale === "zh" ? "zh-CN" : "en-US";
  const postsTotal = Array.isArray(posts) ? posts.length : 0;
  const knowledgeTotal = Array.isArray(knowledgeCards) ? knowledgeCards.length : 0;
  const booksTotal = Array.isArray(books) ? books.length : 0;

  if (snapshotPosts) {
    setSnapshotMetric(snapshotPosts, postsTotal.toLocaleString(localeCode));
  }
  if (snapshotKnowledge) {
    setSnapshotMetric(snapshotKnowledge, knowledgeTotal.toLocaleString(localeCode));
  }
  if (snapshotBooks) {
    setSnapshotMetric(snapshotBooks, booksTotal.toLocaleString(localeCode));
  }

  updateReadViews(locale);
}

export function initStaticSections() {
  onReadMetricsChange(() => {
    updateReadViews(getLocale());
  });

  function render() {
    const locale = getLocale();
    renderHeroRoles(locale);
    renderTopicTrack(locale);
    renderIntroLine(locale);
    renderStatsBars();
    renderBooks(locale);
    renderSnapshot(locale);
  }

  return {
    render
  };
}
