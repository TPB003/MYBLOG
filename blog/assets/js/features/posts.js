import { posts } from "../data/content.js";
import { store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { escapeHTML, formatDate } from "../core/utils.js";
import { formatReadCount, getPostReads, onReadMetricsChange, recordPostRead } from "./read-metrics.js?v=20260308j";

const postGrid = document.getElementById("postGrid");
const chipsWrap = document.getElementById("chips");
const postModal = document.getElementById("postModal");
const postModalTitle = document.getElementById("postModalTitle");
const postModalTag = document.getElementById("postModalTag");
const postModalDate = document.getElementById("postModalDate");
const postModalReading = document.getElementById("postModalReading");
const postModalReads = document.getElementById("postModalReads");
const postModalContent = document.getElementById("postModalContent");
const postModalClose = document.getElementById("postModalClose");

let activePostId = null;

function findPost(postId) {
  return posts.find((item) => item.id === postId) || null;
}

function readText(count, locale) {
  return t("posts.readCount", {
    count: formatReadCount(count, locale)
  });
}

function renderReadNodes() {
  if (!postGrid) return;

  const locale = getLocale();
  postGrid.querySelectorAll("[data-post-reads]").forEach((node) => {
    const postId = node.dataset.postReads;
    node.textContent = readText(getPostReads(postId), locale);
  });
}

function renderModal() {
  if (!postModal || !activePostId) return;

  const locale = getLocale();
  const post = findPost(activePostId);
  if (!post) return;

  const title = post.title[locale] || post.title.zh;
  const tag = post.tag[locale] || post.tag.zh;
  const reading = typeof post.reading === "string" ? post.reading : (post.reading[locale] || post.reading.zh);
  const blocks = post.content?.[locale] || post.content?.zh || [];

  if (postModalTitle) postModalTitle.textContent = title;
  if (postModalTag) postModalTag.textContent = tag;
  if (postModalDate) postModalDate.textContent = formatDate(post.date, locale);
  if (postModalReading) postModalReading.textContent = reading;
  if (postModalReads) postModalReads.textContent = readText(getPostReads(post.id), locale);
  if (postModalContent) {
    postModalContent.innerHTML = blocks.map((line) => `<p>${escapeHTML(line)}</p>`).join("");
  }
  postModal.setAttribute("aria-label", t("posts.modalTitle", { title }));
}

function openModal(postId) {
  const post = findPost(postId);
  if (!postModal || !post) return;

  activePostId = postId;
  renderModal();

  postModal.hidden = false;
  postModal.classList.add("open");
  postModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  recordPostRead(postId);
}

function closeModal() {
  if (!postModal) return;

  postModal.classList.remove("open");
  postModal.setAttribute("aria-hidden", "true");
  postModal.hidden = true;
  document.body.style.overflow = "";
  activePostId = null;
}

function renderPosts() {
  if (!postGrid) return;

  const locale = getLocale();
  const list = store.postFilter === "all"
    ? posts
    : posts.filter((post) => post.category === store.postFilter);

  postGrid.innerHTML = "";

  if (!list.length) {
    postGrid.innerHTML = `<p class="empty">${escapeHTML(t("posts.empty"))}</p>`;
    return;
  }

  list.forEach((post, index) => {
    const title = post.title[locale] || post.title.zh;
    const excerpt = post.excerpt[locale] || post.excerpt.zh;
    const tag = post.tag[locale] || post.tag.zh;
    const reading = typeof post.reading === "string" ? post.reading : (post.reading[locale] || post.reading.zh);
    const reads = readText(getPostReads(post.id), locale);

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
      <div class="post-bottom">
        <div class="post-foot">
          <span>${escapeHTML(reading)}</span>
          <span aria-hidden="true">&middot;</span>
          <span data-post-reads="${escapeHTML(post.id)}">${escapeHTML(reads)}</span>
        </div>
        <button class="post-open" type="button" data-post-open="${escapeHTML(post.id)}">${escapeHTML(t("posts.open"))}</button>
      </div>
    `;

    postGrid.appendChild(card);

    setTimeout(() => {
      card.classList.add("ready");
    }, index * 70);
  });

  if (activePostId) {
    renderModal();
  }
}

function bindEvents() {
  if (chipsWrap) {
    chipsWrap.addEventListener("click", (event) => {
      const target = event.target.closest(".chip");
      if (!target) return;

      store.postFilter = target.dataset.filter || "all";
      chipsWrap.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
      target.classList.add("active");

      renderPosts();
    });
  }

  if (postGrid) {
    postGrid.addEventListener("click", (event) => {
      const target = event.target.closest("[data-post-open]");
      if (!target) return;
      openModal(target.dataset.postOpen);
    });
  }

  if (postModal) {
    postModal.addEventListener("click", (event) => {
      const closeTarget = event.target.closest("[data-post-close]");
      if (closeTarget) {
        closeModal();
      }
    });
  }

  if (postModalClose) {
    postModalClose.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && postModal && !postModal.hidden) {
      closeModal();
    }
  });

  onReadMetricsChange(() => {
    renderReadNodes();
    if (activePostId) {
      renderModal();
    }
  });
}

export function initPosts() {
  bindEvents();

  return {
    render: renderPosts
  };
}
