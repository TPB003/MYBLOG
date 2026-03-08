import { profile, statsBars } from "../data/content.js";
import { books } from "../data/books-index.js";
import { knowledgeCards } from "../data/knowledge-index.js";
import { getLocale, t } from "../core/i18n.js";
import { animateCounter } from "./effects.js";
import { escapeHTML } from "../core/utils.js";
import {
  formatReadCount,
  getBookReads,
  getTotalReads,
  onReadMetricsChange
} from "./read-metrics.js?v=20260308k";

const heroRoleList = document.getElementById("heroRoleList");
const topicTrack = document.getElementById("topicTrack");
const introLine = document.getElementById("introLine");
const statsBarsWrap = document.getElementById("statsBars");
const bookGrid = document.getElementById("bookGrid");
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

function resolveBookPage(book) {
  const page = String(book?.page || "").trim();
  if (page) return page;
  const slug = String(book?.slug || book?.id || "").trim();
  return slug ? `./books/generated-${slug}.html` : "./books/";
}

function readText(value, locale) {
  return t("knowledge.readCount", {
    count: formatReadCount(value, locale)
  });
}

function renderBooks(locale) {
  if (!bookGrid) return;

  if (!Array.isArray(books) || books.length === 0) {
    const empty = locale === "zh" ? "暂无书单内容。" : "No books available yet.";
    bookGrid.innerHTML = `<p class="empty">${escapeHTML(empty)}</p>`;
    return;
  }

  bookGrid.innerHTML = books
    .map((book) => {
      const title = book.title?.[locale] || book.title?.zh || "Untitled";
      const summary = book.summary?.[locale] || book.summary?.zh || "";
      const author = book.author?.[locale] || book.author?.zh || "";
      const reading = typeof book.reading === "string"
        ? book.reading
        : (book.reading?.[locale] || book.reading?.zh || "");
      const cover = String(book.cover || "").trim();
      const page = resolveBookPage(book);
      const reads = readText(getBookReads(book.id), locale);

      const coverNode = cover
        ? `<a class="book-cover" href="${escapeHTML(page)}"><img src="${escapeHTML(cover)}" alt="${escapeHTML(title)}" loading="lazy"></a>`
        : `<a class="book-cover placeholder" href="${escapeHTML(page)}"><span>${escapeHTML(title.slice(0, 1) || "B")}</span></a>`;

      const authorNode = author
        ? `<p class="book-author">${escapeHTML(author)}</p>`
        : "";

      return `
        <article class="book-card interactive-tilt" data-book-href="${escapeHTML(page)}" tabindex="0" role="link">
          ${coverNode}
          <div class="book-body">
            ${authorNode}
            <h4>${escapeHTML(title)}</h4>
            <p>${escapeHTML(summary)}</p>
            <div class="book-meta">
              <span>${escapeHTML(reading)}</span>
              <span>${escapeHTML(reads)}</span>
              <a class="book-open" href="${escapeHTML(page)}">${escapeHTML(t("knowledge.open"))}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bookGrid.querySelectorAll(".book-card[data-book-href]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, textarea")) return;
      const href = card.dataset.bookHref;
      if (href) window.location.assign(href);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const href = card.dataset.bookHref;
      if (href) window.location.assign(href);
    });
  });
}

function renderSnapshot(locale) {
  const localeCode = locale === "zh" ? "zh-CN" : "en-US";
  const knowledgeTotal = Array.isArray(knowledgeCards) ? knowledgeCards.length : 0;
  const booksTotal = Array.isArray(books) ? books.length : 0;

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
    const locale = getLocale();
    updateReadViews(locale);
    renderBooks(locale);
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

