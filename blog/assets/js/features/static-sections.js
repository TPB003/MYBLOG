import { books, profile, statsBars } from "../data/content.js";
import { getLocale, t } from "../core/i18n.js";
import { animateCounter } from "./effects.js";
import { escapeHTML } from "../core/utils.js";

const heroRoleList = document.getElementById("heroRoleList");
const topicTrack = document.getElementById("topicTrack");
const introLine = document.getElementById("introLine");
const statsBarsWrap = document.getElementById("statsBars");
const bookGrid = document.getElementById("bookGrid");

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

export function initStaticSections() {
  function render() {
    const locale = getLocale();
    renderHeroRoles(locale);
    renderTopicTrack(locale);
    renderIntroLine();
    renderStatsBars();
    renderBooks(locale);
  }

  return {
    render
  };
}
