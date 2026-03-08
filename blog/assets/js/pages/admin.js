import {
  applyAdminConfig,
  buildAdminSnapshot,
  clearAdminConfig,
  loadAdminConfig,
  onAdminConfigChange,
  saveAdminConfig
} from "../core/admin-config.js";

const LOCALE_KEY = "tpblog_locale_v2";

const SECTION_FIELDS = [
  { key: "home", zh: "主页", en: "Home" },
  { key: "intro", zh: "介绍", en: "Intro" },
  { key: "posts", zh: "文章", en: "Posts" },
  { key: "knowledge", zh: "知识库", en: "Knowledge" },
  { key: "stats", zh: "统计", en: "Stats" },
  { key: "books", zh: "书单", en: "Books" },
  { key: "contact", zh: "联系", en: "Contact" }
];

const DATA_FIELDS = [
  { key: "profile", type: "object", editorId: "editorProfile", copyKey: "fieldProfile" },
  { key: "posts", type: "array", editorId: "editorPosts", copyKey: "fieldPosts" },
  { key: "knowledgeCards", type: "array", editorId: "editorKnowledgeCards", copyKey: "fieldKnowledgeCards" },
  { key: "knowledgeTagLabels", type: "object", editorId: "editorKnowledgeTagLabels", copyKey: "fieldKnowledgeTagLabels" },
  { key: "books", type: "array", editorId: "editorBooks", copyKey: "fieldBooks" },
  { key: "statsBars", type: "array", editorId: "editorStatsBars", copyKey: "fieldStatsBars" }
];

const copy = {
  zh: {
    metaTitle: "TPBLOG | 管理台",
    headerTitle: "管理员控制台",
    headerSub: "直接控制首页模块显示和内容数据覆盖。",
    backHome: "返回主页",
    localeAria: "切换到英文",
    visibilityTitle: "模块显示控制",
    visibilitySub: "按模块开关首页内容区。",
    editorTitle: "内容数据编辑器",
    editorSub: "使用 JSON 修改内容，保存后立即生效。",
    editorHint: "请保持 JSON 格式合法。数组用 []，对象用 {}。",
    actionsTitle: "操作区",
    actionsSub: "保存、重置、导出或导入管理配置。",
    actionSave: "保存并应用",
    actionReset: "恢复默认",
    actionExport: "导出配置",
    actionImport: "导入配置",
    configBoxLabel: "配置 JSON",
    fieldProfile: "个人资料 Profile",
    fieldPosts: "文章 Posts",
    fieldKnowledgeCards: "知识卡 Knowledge Cards",
    fieldKnowledgeTagLabels: "知识卡标签 Knowledge Tag Labels",
    fieldBooks: "书单 Books",
    fieldStatsBars: "统计条 Stats Bars",
    statusSaved: "配置已保存并应用。",
    statusReset: "已恢复默认配置。",
    statusExported: "配置已导出到下方文本框。",
    statusImported: "配置已导入并应用。",
    statusNeedImport: "请先在下方文本框粘贴配置 JSON。",
    statusInvalidImport: "导入失败：JSON 格式不合法。",
    statusInvalidField: "字段 {field} 的 JSON 不合法：{error}",
    statusTypeMismatch: "字段 {field} 类型错误，期望 {expected}。",
    statusCannotReset: "已取消恢复默认操作。"
  },
  en: {
    metaTitle: "TPBLOG | Admin Console",
    headerTitle: "Admin Console",
    headerSub: "Control homepage section visibility and data overrides from one place.",
    backHome: "Back Home",
    localeAria: "Switch to Chinese",
    visibilityTitle: "Section Visibility",
    visibilitySub: "Toggle each section shown on the homepage.",
    editorTitle: "Content Data Editors",
    editorSub: "Edit JSON data and apply instantly.",
    editorHint: "Keep valid JSON. Use [] for arrays and {} for objects.",
    actionsTitle: "Actions",
    actionsSub: "Save, reset, export, or import admin configuration.",
    actionSave: "Save and Apply",
    actionReset: "Reset to Defaults",
    actionExport: "Export Config",
    actionImport: "Import Config",
    configBoxLabel: "Config JSON",
    fieldProfile: "Profile",
    fieldPosts: "Posts",
    fieldKnowledgeCards: "Knowledge Cards",
    fieldKnowledgeTagLabels: "Knowledge Tag Labels",
    fieldBooks: "Books",
    fieldStatsBars: "Stats Bars",
    statusSaved: "Configuration saved and applied.",
    statusReset: "Configuration reset to defaults.",
    statusExported: "Configuration exported to the box below.",
    statusImported: "Configuration imported and applied.",
    statusNeedImport: "Paste a config JSON first.",
    statusInvalidImport: "Import failed: invalid JSON.",
    statusInvalidField: "Invalid JSON in {field}: {error}",
    statusTypeMismatch: "Type mismatch for {field}, expected {expected}.",
    statusCannotReset: "Reset was cancelled."
  }
};

const visibilityList = document.getElementById("visibilityList");
const configBox = document.getElementById("configBox");
const saveButton = document.getElementById("adminSaveBtn");
const resetButton = document.getElementById("adminResetBtn");
const exportButton = document.getElementById("adminExportBtn");
const importButton = document.getElementById("adminImportBtn");
const localeToggle = document.getElementById("adminLocaleToggle");
const statusNode = document.getElementById("adminStatus");

const editorNodes = DATA_FIELDS.reduce((acc, field) => {
  const node = document.getElementById(field.editorId);
  if (node) acc[field.key] = node;
  return acc;
}, {});

const state = {
  locale: detectLocale()
};

function detectLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    // ignore storage read failure
  }
  return (navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function saveLocale(locale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // ignore storage write failure
  }
}

function text(key, params = {}) {
  const pack = copy[state.locale] || copy.zh;
  const source = Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : key;
  return source.replace(/\{(\w+)\}/g, (_, name) => (Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`));
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function parseJson(textValue) {
  return JSON.parse(textValue);
}

function expectedTypeLabel(type) {
  if (state.locale === "zh") {
    return type === "array" ? "数组" : "对象";
  }
  return type;
}

function fieldLabel(field) {
  return text(field.copyKey);
}

function setStatus(message, type = "info") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.className = "admin-status";
  if (type === "error") {
    statusNode.classList.add("error");
  } else if (type === "success") {
    statusNode.classList.add("success");
  }
}

function renderVisibility(visibility) {
  if (!visibilityList) return;

  const rows = SECTION_FIELDS.map((section) => {
    const checked = visibility[section.key] !== false ? "checked" : "";
    const label = state.locale === "zh" ? section.zh : section.en;
    return `
      <label class="visibility-item">
        <strong>${label}</strong>
        <input type="checkbox" data-section-key="${section.key}" ${checked}>
      </label>
    `;
  });

  visibilityList.innerHTML = rows.join("");
}

function renderEditors(data) {
  DATA_FIELDS.forEach((field) => {
    const node = editorNodes[field.key];
    if (!node) return;
    node.value = stringify(data[field.key]);
  });
}

function readVisibilityFromForm() {
  const values = {};
  SECTION_FIELDS.forEach((section) => {
    const input = visibilityList?.querySelector(`input[data-section-key="${section.key}"]`);
    values[section.key] = input ? input.checked : true;
  });
  return values;
}

function validateParsedValue(field, value) {
  if (field.type === "array" && !Array.isArray(value)) {
    throw new Error(text("statusTypeMismatch", {
      field: fieldLabel(field),
      expected: expectedTypeLabel(field.type)
    }));
  }

  if (field.type === "object" && (typeof value !== "object" || value === null || Array.isArray(value))) {
    throw new Error(text("statusTypeMismatch", {
      field: fieldLabel(field),
      expected: expectedTypeLabel(field.type)
    }));
  }
}

function readDataFromEditors() {
  const result = {};

  DATA_FIELDS.forEach((field) => {
    const node = editorNodes[field.key];
    if (!node) return;

    const raw = node.value.trim();
    if (!raw) {
      throw new Error(text("statusTypeMismatch", {
        field: fieldLabel(field),
        expected: expectedTypeLabel(field.type)
      }));
    }

    let parsed;
    try {
      parsed = parseJson(raw);
    } catch (error) {
      throw new Error(text("statusInvalidField", {
        field: fieldLabel(field),
        error: error.message
      }));
    }

    validateParsedValue(field, parsed);
    result[field.key] = parsed;
  });

  return result;
}

function buildConfigFromForm() {
  return {
    visibility: readVisibilityFromForm(),
    data: readDataFromEditors()
  };
}

function loadToForm() {
  applyAdminConfig();
  const snapshot = buildAdminSnapshot();
  renderVisibility(snapshot.visibility);
  renderEditors(snapshot.data);
  configBox.value = stringify(loadAdminConfig());
}

function applyStaticCopy() {
  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  document.title = text("metaTitle");

  document.querySelectorAll("[data-copy]").forEach((node) => {
    node.textContent = text(node.dataset.copy);
  });

  if (localeToggle) {
    localeToggle.textContent = state.locale === "zh" ? "EN" : "中";
    localeToggle.setAttribute("aria-label", text("localeAria"));
    localeToggle.title = text("localeAria");
  }
}

function handleSave() {
  try {
    const config = buildConfigFromForm();
    saveAdminConfig(config);
    applyAdminConfig();
    configBox.value = stringify(loadAdminConfig());
    setStatus(text("statusSaved"), "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function handleReset() {
  const confirmed = window.confirm(state.locale === "zh" ? "确认恢复默认配置？" : "Reset all admin overrides to defaults?");
  if (!confirmed) {
    setStatus(text("statusCannotReset"), "info");
    return;
  }

  clearAdminConfig();
  loadToForm();
  setStatus(text("statusReset"), "success");
}

function handleExport() {
  try {
    const config = buildConfigFromForm();
    configBox.value = stringify(config);
    setStatus(text("statusExported"), "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function handleImport() {
  const raw = configBox?.value.trim() || "";
  if (!raw) {
    setStatus(text("statusNeedImport"), "error");
    return;
  }

  let parsed = null;
  try {
    parsed = parseJson(raw);
  } catch {
    setStatus(text("statusInvalidImport"), "error");
    return;
  }

  saveAdminConfig(parsed);
  loadToForm();
  setStatus(text("statusImported"), "success");
}

function toggleLocale() {
  state.locale = state.locale === "zh" ? "en" : "zh";
  saveLocale(state.locale);
  applyStaticCopy();
  loadToForm();
}

function bindEvents() {
  saveButton?.addEventListener("click", handleSave);
  resetButton?.addEventListener("click", handleReset);
  exportButton?.addEventListener("click", handleExport);
  importButton?.addEventListener("click", handleImport);
  localeToggle?.addEventListener("click", toggleLocale);

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleSave();
    }
  });

  onAdminConfigChange(() => {
    loadToForm();
  });
}

function init() {
  applyStaticCopy();
  loadToForm();
  bindEvents();
}

init();
