import { posts } from "../data/content.js";
import { store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { escapeHTML, formatDate } from "../core/utils.js";

const postGrid = document.getElementById("postGrid");
const chipsWrap = document.getElementById("chips");

function renderPosts() {
  if (!postGrid) return;

  const locale = getLocale();
  const list = store.postFilter === "all"
    ? posts
    : posts.filter((post) => post.category === store.postFilter);

  postGrid.innerHTML = "";

  if (!list.length) {
    postGrid.innerHTML = `<p class=\"empty\">${escapeHTML(t("posts.empty"))}</p>`;
    return;
  }

  list.forEach((post, index) => {
    const title = post.title[locale] || post.title.zh;
    const excerpt = post.excerpt[locale] || post.excerpt.zh;
    const tag = post.tag[locale] || post.tag.zh;
    const reading = typeof post.reading === "string" ? post.reading : (post.reading[locale] || post.reading.zh);

    const card = document.createElement("article");
    card.className = `post-card ${post.tone} ${post.size} interactive-tilt`;
    card.innerHTML = `
      <div class="post-top">
        <span class="post-tag">${escapeHTML(tag)}</span>
        <time class="post-date" datetime="${escapeHTML(post.date)}">${formatDate(post.date, locale)}</time>
      </div>
      <div>
        <h3 class="post-title">${escapeHTML(title)}</h3>
        <p class="post-excerpt">${escapeHTML(excerpt)}</p>
      </div>
      <div class="post-foot">${escapeHTML(reading)}</div>
    `;

    postGrid.appendChild(card);

    setTimeout(() => {
      card.classList.add("ready");
    }, index * 70);
  });
}

function bindEvents() {
  if (!chipsWrap) return;

  chipsWrap.addEventListener("click", (event) => {
    const target = event.target.closest(".chip");
    if (!target) return;

    store.postFilter = target.dataset.filter || "all";
    chipsWrap.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    target.classList.add("active");

    renderPosts();
  });
}

export function initPosts() {
  bindEvents();

  return {
    render: renderPosts
  };
}
