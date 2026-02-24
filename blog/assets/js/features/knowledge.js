import { knowledgeCards, knowledgeTagLabels } from "../data/content.js";
import { store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { escapeHTML, formatDate } from "../core/utils.js";

const searchInput = document.getElementById("knowledgeSearch");
const tagsWrap = document.getElementById("knowledgeTags");
const grid = document.getElementById("knowledgeGrid");
const countNode = document.getElementById("knowledgeCount");

function availableTags() {
  return Array.from(new Set(knowledgeCards.flatMap((card) => card.tags)));
}

function renderTagButtons() {
  if (!tagsWrap) return;

  const locale = getLocale();
  const tags = availableTags();

  const html = [
    `<button type=\"button\" class=\"k-tag ${store.knowledgeTag === "all" ? "active" : ""}\" data-tag=\"all\">${escapeHTML(t("knowledge.tagAll"))}</button>`
  ];

  tags.forEach((tag) => {
    const labelPack = knowledgeTagLabels[tag];
    const label = labelPack ? (labelPack[locale] || labelPack.zh) : tag;
    const active = store.knowledgeTag === tag ? "active" : "";
    html.push(`<button type=\"button\" class=\"k-tag ${active}\" data-tag=\"${escapeHTML(tag)}\">${escapeHTML(label)}</button>`);
  });

  tagsWrap.innerHTML = html.join("");
}

function filteredCards() {
  const locale = getLocale();
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  return knowledgeCards.filter((card) => {
    const title = card.title[locale] || card.title.zh;
    const summary = card.summary[locale] || card.summary.zh;

    const byTag = store.knowledgeTag === "all" || card.tags.includes(store.knowledgeTag);
    const byQuery = !query || `${title} ${summary} ${card.tags.join(" ")}`.toLowerCase().includes(query);

    return byTag && byQuery;
  });
}

function renderKnowledge() {
  if (!grid) return;

  renderTagButtons();

  const locale = getLocale();
  const list = filteredCards();

  if (countNode) {
    countNode.textContent = String(list.length);
  }

  if (!list.length) {
    grid.innerHTML = `<p class=\"kb-empty\">${escapeHTML(t("knowledge.empty"))}</p>`;
    return;
  }

  grid.innerHTML = list
    .map((card) => {
      const title = card.title[locale] || card.title.zh;
      const summary = card.summary[locale] || card.summary.zh;
      const badges = card.tags
        .map((tag) => {
          const pack = knowledgeTagLabels[tag];
          const label = pack ? (pack[locale] || pack.zh) : tag;
          return `<span class=\"kb-badge\">${escapeHTML(label)}</span>`;
        })
        .join("");

      return `
        <article class="kb-card interactive-tilt">
          <h3>${escapeHTML(title)}</h3>
          <p class="kb-summary">${escapeHTML(summary)}</p>
          <div class="kb-meta">
            <time datetime="${escapeHTML(card.updated)}">${escapeHTML(t("knowledge.updated", { date: formatDate(card.updated, locale) }))}</time>
            <div class="kb-badges">${badges}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function bindEvents() {
  if (tagsWrap) {
    tagsWrap.addEventListener("click", (event) => {
      const target = event.target.closest(".k-tag");
      if (!target) return;

      store.knowledgeTag = target.dataset.tag || "all";
      renderKnowledge();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderKnowledge();
    });
  }
}

export function initKnowledge() {
  bindEvents();

  return {
    render: renderKnowledge
  };
}
