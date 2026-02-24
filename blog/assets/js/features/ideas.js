import { seedIdeas } from "../data/content.js";
import { STORAGE_KEYS, store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { escapeHTML, formatDateTime, safeParseJSON } from "../core/utils.js";

const ideaForm = document.getElementById("ideaForm");
const ideaInput = document.getElementById("ideaInput");
const ideaMood = document.getElementById("ideaMood");
const ideaList = document.getElementById("ideaList");
const clearButton = document.getElementById("clearIdeas");

function readStoredIdeas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ideas);
    if (!raw) return [];
    const parsed = safeParseJSON(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistIdeas() {
  try {
    localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify(store.ideas));
  } catch {
    // ignore write failure
  }
}

function resolveContent(item, locale) {
  if (typeof item.content === "string") {
    return item.content;
  }

  if (item.content && typeof item.content === "object") {
    return item.content[locale] || item.content.zh || "";
  }

  return "";
}

function allIdeas() {
  return [...store.ideas, ...seedIdeas]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderIdeas() {
  if (!ideaList) return;

  const locale = getLocale();
  const list = allIdeas();

  if (!list.length) {
    ideaList.innerHTML = `<li class=\"idea-empty\">${escapeHTML(t("ideas.empty"))}</li>`;
    return;
  }

  ideaList.innerHTML = list
    .map((item) => {
      const moodKey = `mood.${item.mood || "thinking"}`;
      const mood = t(moodKey);
      const content = resolveContent(item, locale);

      return `
        <li class="idea-item">
          <div class="idea-item-top">
            <span class="idea-item-tag">${escapeHTML(mood)}</span>
            <time class="idea-item-time" datetime="${escapeHTML(item.createdAt)}">${formatDateTime(item.createdAt, locale)}</time>
          </div>
          <p>${escapeHTML(content)}</p>
        </li>
      `;
    })
    .join("");
}

function bindEvents() {
  if (ideaForm && ideaInput && ideaMood) {
    ideaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const content = ideaInput.value.trim();

      if (content.length < 4) {
        alert(t("ideas.alertShort"));
        return;
      }

      store.ideas.unshift({
        id: `local-${Date.now()}`,
        mood: ideaMood.value,
        content,
        createdAt: new Date().toISOString()
      });

      store.ideas = store.ideas.slice(0, 80);
      persistIdeas();
      renderIdeas();

      ideaInput.value = "";
      ideaInput.focus();
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (!confirm(t("ideas.confirmClear"))) {
        return;
      }

      store.ideas = [];
      persistIdeas();
      renderIdeas();
    });
  }
}

export function initIdeas() {
  store.ideas = readStoredIdeas();
  bindEvents();

  return {
    render: renderIdeas
  };
}
