import { posts } from "../data/content.js";
import { books } from "../data/books-index.js";
import { knowledgeCards } from "../data/knowledge-index.js";
import { STORAGE_KEYS } from "../core/store.js";
import { safeParseJSON } from "../core/utils.js";

const listeners = new Set();
const POLL_INTERVAL_MS = 60 * 1000;
const COUNT_API_BASE = "https://api.countapi.xyz";
const TOTAL_KEY = "knowledge_reads_total_v2";
const KNOWLEDGE_PREFIX = "knowledge_read_";
const POST_PREFIX = "post_read_";
const BOOK_PREFIX = "book_read_";

const state = {
  total: 0,
  knowledge: {},
  posts: {},
  books: {}
};

let initialized = false;
let pollTimerId = null;
let namespace = "tpblog-myblog";

function getLocaleCode(locale) {
  return locale === "zh" ? "zh-CN" : "en-US";
}

function resolveNamespace() {
  const host = (window.location.hostname || "local")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  // Use a fixed project namespace so all pages share one counter bucket.
  return `tpblog-${host}-myblog`.slice(0, 96);
}

function knowledgeKey(cardId) {
  return `${KNOWLEDGE_PREFIX}${cardId}`;
}

function postKey(postId) {
  return `${POST_PREFIX}${postId}`;
}

function bookKey(bookId) {
  return `${BOOK_PREFIX}${bookId}`;
}

function ensureBaseState() {
  state.total = 0;
  state.knowledge = {};
  state.posts = {};
  state.books = {};
}

function ensureCatalogState() {
  let changed = false;

  knowledgeCards.forEach((card) => {
    if (!Object.prototype.hasOwnProperty.call(state.knowledge, card.id)) {
      state.knowledge[card.id] = 0;
      changed = true;
    }
  });

  posts.forEach((post) => {
    if (!Object.prototype.hasOwnProperty.call(state.posts, post.id)) {
      state.posts[post.id] = 0;
      changed = true;
    }
  });

  books.forEach((book) => {
    if (!book?.id) return;
    if (!Object.prototype.hasOwnProperty.call(state.books, book.id)) {
      state.books[book.id] = 0;
      changed = true;
    }
  });

  return changed;
}

function emit() {
  listeners.forEach((listener) => {
    listener({
      total: state.total,
      knowledge: { ...state.knowledge },
      posts: { ...state.posts },
      books: { ...state.books }
    });
  });
}

function saveLocalSnapshot() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.readMetrics,
      JSON.stringify({
        total: state.total,
        knowledge: state.knowledge,
        posts: state.posts,
        books: state.books,
        updatedAt: Date.now()
      })
    );
  } catch {
    // ignore storage write failure
  }
}

function applySnapshot(snapshot, options = {}) {
  if (!snapshot || typeof snapshot !== "object") return false;

  let changed = false;

  const totalValue = Number(snapshot.total);
  if (Number.isFinite(totalValue)) {
    const nextTotal = Math.max(0, Math.floor(totalValue));
    // Keep counters monotonic to avoid stale remote values resetting local data.
    if (nextTotal > state.total) {
      state.total = nextTotal;
      changed = true;
    }
  }

  knowledgeCards.forEach((card) => {
    const raw = snapshot.knowledge && snapshot.knowledge[card.id];
    const nextValue = Number(raw);
    if (!Number.isFinite(nextValue)) return;

    const normalized = Math.max(0, Math.floor(nextValue));
    if (normalized > state.knowledge[card.id]) {
      state.knowledge[card.id] = normalized;
      changed = true;
    }
  });

  posts.forEach((post) => {
    const raw = snapshot.posts && snapshot.posts[post.id];
    const nextValue = Number(raw);
    if (!Number.isFinite(nextValue)) return;

    const normalized = Math.max(0, Math.floor(nextValue));
    if (normalized > state.posts[post.id]) {
      state.posts[post.id] = normalized;
      changed = true;
    }
  });

  books.forEach((book) => {
    if (!book?.id) return;
    const raw = snapshot.books && snapshot.books[book.id];
    const nextValue = Number(raw);
    if (!Number.isFinite(nextValue)) return;

    const normalized = Math.max(0, Math.floor(nextValue));
    if (normalized > state.books[book.id]) {
      state.books[book.id] = normalized;
      changed = true;
    }
  });

  if (changed && options.persist !== false) {
    saveLocalSnapshot();
  }

  if (changed && options.emit !== false) {
    emit();
  }

  return changed;
}

function hydrateFromLocal() {
  try {
    const cached = safeParseJSON(localStorage.getItem(STORAGE_KEYS.readMetrics), null);
    applySnapshot(cached, { emit: false });
  } catch {
    // ignore storage read failure
  }
}

async function fetchRemoteCount(key) {
  try {
    const response = await fetch(
      `${COUNT_API_BASE}/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    const payload = await response.json();
    return Number.isFinite(payload.value) ? Math.max(0, Math.floor(payload.value)) : null;
  } catch {
    return null;
  }
}

async function hitRemoteCount(key) {
  try {
    const response = await fetch(
      `${COUNT_API_BASE}/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
      { method: "GET", cache: "no-store" }
    );

    if (!response.ok) return null;

    const payload = await response.json();
    return Number.isFinite(payload.value) ? Math.max(0, Math.floor(payload.value)) : null;
  } catch {
    return null;
  }
}

export async function refreshReadMetrics() {
  const requests = [fetchRemoteCount(TOTAL_KEY)];
  knowledgeCards.forEach((card) => {
    requests.push(fetchRemoteCount(knowledgeKey(card.id)));
  });
  posts.forEach((post) => {
    requests.push(fetchRemoteCount(postKey(post.id)));
  });
  books.forEach((book) => {
    if (!book?.id) return;
    requests.push(fetchRemoteCount(bookKey(book.id)));
  });

  const results = await Promise.all(requests);
  const [totalValue, ...allValues] = results;
  const snapshot = { total: totalValue, knowledge: {}, posts: {}, books: {} };

  knowledgeCards.forEach((card, index) => {
    snapshot.knowledge[card.id] = allValues[index];
  });

  const postStartIndex = knowledgeCards.length;
  posts.forEach((post, index) => {
    snapshot.posts[post.id] = allValues[postStartIndex + index];
  });

  const bookStartIndex = knowledgeCards.length + posts.length;
  books.forEach((book, index) => {
    if (!book?.id) return;
    snapshot.books[book.id] = allValues[bookStartIndex + index];
  });

  applySnapshot(snapshot);
}

export function getTotalReads() {
  return state.total;
}

export function getKnowledgeReads(cardId) {
  return state.knowledge[cardId] || 0;
}

export function getPostReads(postId) {
  return state.posts[postId] || 0;
}

export function getBookReads(bookId) {
  return state.books[bookId] || 0;
}

export function formatReadCount(value, locale) {
  return Math.max(0, Math.floor(value)).toLocaleString(getLocaleCode(locale));
}

export function onReadMetricsChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function recordKnowledgeRead(cardId) {
  if (!cardId || !Object.prototype.hasOwnProperty.call(state.knowledge, cardId)) return;

  state.knowledge[cardId] += 1;
  state.total += 1;
  saveLocalSnapshot();
  emit();

  Promise.all([hitRemoteCount(knowledgeKey(cardId)), hitRemoteCount(TOTAL_KEY)]).then(([knowledgeValue, totalValue]) => {
    applySnapshot({
      total: totalValue,
      knowledge: {
        [cardId]: knowledgeValue
      }
    });
  });
}

export function recordPostRead(postId) {
  if (!postId || !Object.prototype.hasOwnProperty.call(state.posts, postId)) return;

  state.posts[postId] += 1;
  state.total += 1;
  saveLocalSnapshot();
  emit();

  Promise.all([hitRemoteCount(postKey(postId)), hitRemoteCount(TOTAL_KEY)]).then(([postValue, totalValue]) => {
    applySnapshot({
      total: totalValue,
      posts: {
        [postId]: postValue
      }
    });
  });
}

export function recordBookRead(bookId) {
  if (!bookId || !Object.prototype.hasOwnProperty.call(state.books, bookId)) return;

  state.books[bookId] += 1;
  state.total += 1;
  saveLocalSnapshot();
  emit();

  Promise.all([hitRemoteCount(bookKey(bookId)), hitRemoteCount(TOTAL_KEY)]).then(([bookValue, totalValue]) => {
    applySnapshot({
      total: totalValue,
      books: {
        [bookId]: bookValue
      }
    });
  });
}

export function initReadMetrics(options = {}) {
  if (initialized) return;
  initialized = true;
  namespace = resolveNamespace();

  ensureBaseState();
  ensureCatalogState();
  hydrateFromLocal();
  ensureCatalogState();
  emit();
  refreshReadMetrics();

  if (options.poll !== false && !pollTimerId) {
    pollTimerId = window.setInterval(refreshReadMetrics, POLL_INTERVAL_MS);
  }
}

export function syncReadMetricCatalog() {
  if (ensureCatalogState()) {
    saveLocalSnapshot();
    emit();
  }
}

