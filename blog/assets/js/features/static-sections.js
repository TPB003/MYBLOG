import { books, knowledgeCards, posts, profile, statsBars } from "../data/content.js";
import { getLocale, t } from "../core/i18n.js";
import { animateCounter } from "./effects.js";
import { escapeHTML } from "../core/utils.js";

const heroRoleList = document.getElementById("heroRoleList");
const topicTrack = document.getElementById("topicTrack");
const introLine = document.getElementById("introLine");
const statsBarsWrap = document.getElementById("statsBars");
const bookGrid = document.getElementById("bookGrid");
const snapshotPosts = document.getElementById("snapshotPosts");
const snapshotKnowledge = document.getElementById("snapshotKnowledge");
const snapshotBooks = document.getElementById("snapshotBooks");
const snapshotReads = document.getElementById("snapshotReads");

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

function renderIntroLine() {
  if (!introLine) return;

  introLine.innerHTML = t("intro.line", {
    count: "<span id=\"countUp\">0</span>"
  });

  const countNode = introLine.querySelector("#countUp");
  if (countNode) {
    animateCounter(countNode, profile.readCount, getLocale());
  }
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

  if (snapshotPosts) {
    snapshotPosts.textContent = posts.length.toLocaleString(localeCode);
  }
  if (snapshotKnowledge) {
    snapshotKnowledge.textContent = knowledgeCards.length.toLocaleString(localeCode);
  }
  if (snapshotBooks) {
    snapshotBooks.textContent = books.length.toLocaleString(localeCode);
  }
  if (snapshotReads) {
    snapshotReads.textContent = profile.readCount.toLocaleString(localeCode);
  }
}

export function initStaticSections() {
  function render() {
    const locale = getLocale();
    renderHeroRoles(locale);
    renderTopicTrack(locale);
    renderIntroLine();
    renderStatsBars();
    renderBooks(locale);
    renderSnapshot(locale);
  }

  return {
    render
  };
}
