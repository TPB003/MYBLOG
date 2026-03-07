import { knowledgeCards } from "../data/content.js";
import { STORAGE_KEYS } from "../core/store.js";
import { safeParseJSON } from "../core/utils.js";

const listeners = new Set();
const POLL_INTERVAL_MS = 60 * 1000;
const COUNT_API_BASE = "https://api.countapi.xyz";
const TOTAL_KEY = "knowledge_reads_total_v2";
const KNOWLEDGE_PREFIX = "knowledge_read_";

const state = {
  total: 0,
  knowledge: {}
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

function ensureBaseState() {
  state.total = 0;
  knowledgeCards.forEach((card) => {
    state.knowledge[card.id] = 0;
  });
}

function emit() {
  listeners.forEach((listener) => {
    listener({
      total: state.total,
      knowledge: { ...state.knowledge }
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

  const results = await Promise.all(requests);
  const [totalValue, ...knowledgeValues] = results;
  const snapshot = { total: totalValue, knowledge: {} };

  knowledgeCards.forEach((card, index) => {
    snapshot.knowledge[card.id] = knowledgeValues[index];
  });

  applySnapshot(snapshot);
}

export function getTotalReads() {
  return state.total;
}

export function getKnowledgeReads(cardId) {
  return state.knowledge[cardId] || 0;
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

export function initReadMetrics(options = {}) {
  if (initialized) return;
  initialized = true;
  namespace = resolveNamespace();

  ensureBaseState();
  hydrateFromLocal();
  emit();
  refreshReadMetrics();

  if (options.poll !== false && !pollTimerId) {
    pollTimerId = window.setInterval(refreshReadMetrics, POLL_INTERVAL_MS);
  }
}
