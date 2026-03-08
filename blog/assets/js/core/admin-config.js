import { books, posts, profile, statsBars } from "../data/content.js";
import { knowledgeCards, knowledgeTagLabels } from "../data/knowledge-index.js";

export const ADMIN_CONFIG_STORAGE_KEY = "tpblog_admin_config_v1";
const ADMIN_CONFIG_CHANGE_EVENT = "tpblog-admin-config-changed";

const SECTION_DEFS = {
  home: { selector: "#home", navHref: "#home" },
  intro: { selector: ".intro" },
  posts: { selector: "#posts", navHref: "#posts" },
  knowledge: { selector: "#knowledge", navHref: "#knowledge" },
  stats: { selector: "#stats", navHref: "#stats" },
  books: { selector: "#books", navHref: "#books" },
  contact: { selector: ".contact" }
};

const DEFAULT_VISIBILITY = Object.freeze({
  home: true,
  intro: true,
  posts: true,
  knowledge: true,
  stats: true,
  books: true,
  contact: true
});

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

const baseSnapshot = Object.freeze({
  profile: deepClone(profile),
  posts: deepClone(posts),
  knowledgeCards: deepClone(knowledgeCards),
  knowledgeTagLabels: deepClone(knowledgeTagLabels),
  books: deepClone(books),
  statsBars: deepClone(statsBars)
});

function replaceArray(target, source) {
  if (!Array.isArray(target) || !Array.isArray(source)) return;
  target.splice(0, target.length, ...deepClone(source));
}

function replaceObject(target, source) {
  if (!target || typeof target !== "object" || !source || typeof source !== "object") return;
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, deepClone(source));
}

function normalizeVisibility(rawVisibility) {
  const next = { ...DEFAULT_VISIBILITY };
  if (!rawVisibility || typeof rawVisibility !== "object") return next;

  Object.keys(DEFAULT_VISIBILITY).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rawVisibility, key)) {
      next[key] = Boolean(rawVisibility[key]);
    }
  });

  return next;
}

function normalizeAdminConfig(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    visibility: normalizeVisibility(source.visibility),
    data: source.data && typeof source.data === "object" ? source.data : {}
  };
}

function safeParseConfig(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadAdminConfig() {
  try {
    const parsed = safeParseConfig(localStorage.getItem(ADMIN_CONFIG_STORAGE_KEY));
    return normalizeAdminConfig(parsed);
  } catch {
    return normalizeAdminConfig(null);
  }
}

export function saveAdminConfig(config) {
  const normalized = normalizeAdminConfig(config);
  try {
    localStorage.setItem(ADMIN_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore storage write failure
  }
  notifyAdminConfigChange();
}

export function clearAdminConfig() {
  try {
    localStorage.removeItem(ADMIN_CONFIG_STORAGE_KEY);
  } catch {
    // ignore storage write failure
  }
  notifyAdminConfigChange();
}

function restoreDefaults() {
  replaceObject(profile, baseSnapshot.profile);
  replaceArray(posts, baseSnapshot.posts);
  replaceArray(knowledgeCards, baseSnapshot.knowledgeCards);
  replaceObject(knowledgeTagLabels, baseSnapshot.knowledgeTagLabels);
  replaceArray(books, baseSnapshot.books);
  replaceArray(statsBars, baseSnapshot.statsBars);
}

function applyDataOverrides(overrides) {
  if (!overrides || typeof overrides !== "object") return;

  if (overrides.profile && typeof overrides.profile === "object") {
    replaceObject(profile, overrides.profile);
  }
  if (Array.isArray(overrides.posts)) {
    replaceArray(posts, overrides.posts);
  }
  if (Array.isArray(overrides.knowledgeCards)) {
    replaceArray(knowledgeCards, overrides.knowledgeCards);
  }
  if (overrides.knowledgeTagLabels && typeof overrides.knowledgeTagLabels === "object") {
    replaceObject(knowledgeTagLabels, overrides.knowledgeTagLabels);
  }
  if (Array.isArray(overrides.books)) {
    replaceArray(books, overrides.books);
  }
  if (Array.isArray(overrides.statsBars)) {
    replaceArray(statsBars, overrides.statsBars);
  }
}

function applyVisibility(visibility) {
  if (typeof document === "undefined") return;

  Object.entries(SECTION_DEFS).forEach(([key, def]) => {
    const shouldShow = visibility[key] !== false;
    const section = document.querySelector(def.selector);
    if (section) {
      section.hidden = !shouldShow;
    }

    if (def.navHref) {
      document.querySelectorAll(`a[href="${def.navHref}"]`).forEach((node) => {
        node.hidden = !shouldShow;
      });
    }
  });
}

export function applyAdminConfig() {
  const config = loadAdminConfig();
  restoreDefaults();
  applyDataOverrides(config.data);
  applyVisibility(config.visibility);
  return config;
}

export function buildAdminSnapshot() {
  const config = loadAdminConfig();
  return {
    visibility: { ...config.visibility },
    data: {
      profile: deepClone(profile),
      posts: deepClone(posts),
      knowledgeCards: deepClone(knowledgeCards),
      knowledgeTagLabels: deepClone(knowledgeTagLabels),
      books: deepClone(books),
      statsBars: deepClone(statsBars)
    }
  };
}

export function onAdminConfigChange(callback) {
  if (typeof callback !== "function") return () => {};
  const handler = () => callback(loadAdminConfig());
  window.addEventListener(ADMIN_CONFIG_CHANGE_EVENT, handler);
  return () => window.removeEventListener(ADMIN_CONFIG_CHANGE_EVENT, handler);
}

function notifyAdminConfigChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_CONFIG_CHANGE_EVENT));
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== ADMIN_CONFIG_STORAGE_KEY) return;
    notifyAdminConfigChange();
  });
}
