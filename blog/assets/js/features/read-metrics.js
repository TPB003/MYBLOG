import { posts, profile } from "../data/content.js";
import { STORAGE_KEYS } from "../core/store.js";
import { safeParseJSON } from "../core/utils.js";

const listeners = new Set();
const POLL_INTERVAL_MS = 60 * 1000;
const COUNT_API_BASE = "https://api.countapi.xyz";
const TOTAL_KEY = "reads_total";
const SESSION_VISIT_KEY = "tpblog_visit_counted_v1";
const SESSION_POST_KEY = "tpblog_post_reads_v1";

const state = {
  total: 0,
  posts: {}
};

const postBaseReads = {};
let totalBaseReads = 0;

let initialized = false;
let pollTimerId = null;
let namespace = "tpblog-myblog";

function getPostBaseReads(post) {
  return Number.isFinite(post.baseReads) ? Math.max(0, Math.floor(post.baseReads)) : 0;
}

function getLocaleCode(locale) {
  return locale === "zh" ? "zh-CN" : "en-US";
}

function resolveNamespace() {
  const host = (window.location.hostname || "local")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const path = (window.location.pathname || "/")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  return `tpblog-${host}${path}`.slice(0, 96);
}

function ensureBaseState() {
  let postSum = 0;

  posts.forEach((post) => {
    const base = getPostBaseReads(post);
    postBaseReads[post.id] = base;
    state.posts[post.id] = base;
    postSum += base;
  });

  const profileBase = Number.isFinite(profile.readCount) ? Math.floor(profile.readCount) : 0;
  totalBaseReads = Math.max(profileBase, postSum);
  state.total = totalBaseReads;
}

function normalizeRemoteValue(rawValue, baseValue) {
  if (!Number.isFinite(rawValue)) return null;

  const normalized = Math.max(0, Math.floor(rawValue));
  // CountAPI may start counters from 0; treat values below base as incremental delta.
  return normalized < baseValue ? baseValue + normalized : normalized;
}

function emit() {
  const snapshot = {
    total: state.total,
    posts: { ...state.posts }
  };

  listeners.forEach((listener) => listener(snapshot));
}

function saveLocalSnapshot() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.readMetrics,
      JSON.stringify({
        total: state.total,
        posts: state.posts,
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

  if (snapshot.total != null) {
    const normalized = normalizeRemoteValue(Number(snapshot.total), totalBaseReads);
    if (normalized != null && normalized > state.total) {
      state.total = normalized;
      changed = true;
    }
  }

  posts.forEach((post) => {
    const raw = snapshot.posts && snapshot.posts[post.id];
    const nextValue = Number(raw);

    if (!Number.isFinite(nextValue)) return;

    const normalized = normalizeRemoteValue(nextValue, postBaseReads[post.id] || 0);
    if (normalized != null && normalized > state.posts[post.id]) {
      state.posts[post.id] = normalized;
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

function readSessionPosts() {
  try {
    const raw = safeParseJSON(sessionStorage.getItem(SESSION_POST_KEY), []);
    return Array.isArray(raw) ? new Set(raw) : new Set();
  } catch {
    return new Set();
  }
}

function writeSessionPosts(ids) {
  try {
    sessionStorage.setItem(SESSION_POST_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore session write failure
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

function postKey(postId) {
  return `post_${postId}`;
}

async function refreshFromRemote() {
  const requests = [fetchRemoteCount(TOTAL_KEY)];
  posts.forEach((post) => requests.push(fetchRemoteCount(postKey(post.id))));

  const results = await Promise.all(requests);
  const [remoteTotal, ...remotePostValues] = results;
  const snapshot = { total: remoteTotal, posts: {} };

  posts.forEach((post, index) => {
    snapshot.posts[post.id] = remotePostValues[index];
  });

  applySnapshot(snapshot);
}

function recordVisitOncePerSession() {
  try {
    if (sessionStorage.getItem(SESSION_VISIT_KEY) === "1") {
      return;
    }

    sessionStorage.setItem(SESSION_VISIT_KEY, "1");
  } catch {
    // If sessionStorage fails, continue with local increment.
  }

  state.total += 1;
  saveLocalSnapshot();
  emit();

  hitRemoteCount(TOTAL_KEY).then((remoteValue) => {
    applySnapshot({ total: remoteValue });
  });
}

export function getTotalReads() {
  return state.total;
}

export function getPostReads(postId) {
  return state.posts[postId] || 0;
}

export function formatReadCount(value, locale) {
  return Math.max(0, Math.floor(value)).toLocaleString(getLocaleCode(locale));
}

export function onReadMetricsChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function recordPostRead(postId) {
  if (!postId || !Object.prototype.hasOwnProperty.call(state.posts, postId)) return;

  const viewedPosts = readSessionPosts();
  // Avoid duplicate increments for repeated opens in the same browser session.
  if (viewedPosts.has(postId)) return;

  viewedPosts.add(postId);
  writeSessionPosts(viewedPosts);

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

export function initReadMetrics() {
  if (initialized) return;
  initialized = true;
  namespace = resolveNamespace();

  ensureBaseState();
  hydrateFromLocal();
  emit();

  recordVisitOncePerSession();
  refreshFromRemote();

  if (!pollTimerId) {
    pollTimerId = window.setInterval(refreshFromRemote, POLL_INTERVAL_MS);
  }
}
