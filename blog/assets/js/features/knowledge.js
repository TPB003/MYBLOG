import { knowledgeCards, knowledgeTagLabels } from "../data/knowledge-index.js";
import { store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { escapeHTML, formatDate } from "../core/utils.js";
import { formatReadCount, getKnowledgeReads, onReadMetricsChange } from "./read-metrics.js?v=20260308j";

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
    `<button type="button" class="k-tag ${store.knowledgeTag === "all" ? "active" : ""}" data-tag="all">${escapeHTML(t("knowledge.tagAll"))}</button>`
  ];

  tags.forEach((tag) => {
    const labelPack = knowledgeTagLabels[tag];
    const label = labelPack ? (labelPack[locale] || labelPack.zh) : tag;
    const active = store.knowledgeTag === tag ? "active" : "";
    html.push(`<button type="button" class="k-tag ${active}" data-tag="${escapeHTML(tag)}">${escapeHTML(label)}</button>`);
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
    grid.innerHTML = `<p class="kb-empty">${escapeHTML(t("knowledge.empty"))}</p>`;
    return;
  }

  grid.innerHTML = list
    .map((card) => {
      const title = card.title[locale] || card.title.zh;
      const summary = card.summary[locale] || card.summary.zh;
      const reading = typeof card.reading === "string" ? card.reading : (card.reading?.[locale] || card.reading?.zh || "");
      const reads = t("knowledge.readCount", {
        count: formatReadCount(getKnowledgeReads(card.id), locale)
      });
      const articlePath = card.page || `./knowledge/${card.slug || card.id}.html`;
      const badges = card.tags
        .map((tag) => {
          const pack = knowledgeTagLabels[tag];
          const label = pack ? (pack[locale] || pack.zh) : tag;
          return `<span class="kb-badge">${escapeHTML(label)}</span>`;
        })
        .join("");

      return `
        <article class="kb-card interactive-tilt" data-kb-href="${escapeHTML(articlePath)}" tabindex="0" role="link">
          <h3>${escapeHTML(title)}</h3>
          <p class="kb-summary">${escapeHTML(summary)}</p>
          <div class="kb-footer">
            <div class="kb-meta">
              <time datetime="${escapeHTML(card.updated)}">${escapeHTML(t("knowledge.updated", { date: formatDate(card.updated, locale) }))}</time>
              <span class="kb-reading">${escapeHTML(reading)}</span>
              <span class="kb-reads">${escapeHTML(reads)}</span>
              <div class="kb-badges">${badges}</div>
            </div>
            <a class="kb-open" href="${escapeHTML(articlePath)}">${escapeHTML(t("knowledge.open"))}</a>
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

  if (grid) {
    grid.addEventListener("click", (event) => {
      const card = event.target.closest(".kb-card[data-kb-href]");
      if (!card || event.target.closest("a, button, input, textarea")) return;
      window.location.assign(card.dataset.kbHref);
    });

    grid.addEventListener("keydown", (event) => {
      const card = event.target.closest(".kb-card[data-kb-href]");
      if (!card) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      window.location.assign(card.dataset.kbHref);
    });
  }
}

export function initKnowledge() {
  bindEvents();
  onReadMetricsChange(() => {
    renderKnowledge();
  });

  return {
    render: renderKnowledge
  };
}
