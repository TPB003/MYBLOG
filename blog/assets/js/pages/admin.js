import {
  applyAdminConfig,
  buildAdminSnapshot,
  clearAdminConfig,
  loadAdminConfig,
  onAdminConfigChange,
  saveAdminConfig
} from "../core/admin-config.js";

const LOCALE_KEY = "tpblog_locale_v2";
const AUTH_HASH_KEY = "tpblog_admin_password_hash_v1";
const AUTH_SESSION_KEY = "tpblog_admin_session_v1";
const AUTH_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const DEFAULT_PASSWORD_HASH = "99866652be121723b1bb47b910656eb4f1a6c4d65f502107571f4eda38708fff"; // TPBLOG@2026
const DEFAULT_PASSWORD_TEXT = "TPBLOG@2026";
const ADMIN_ENTRY_HASH = "#tp-9031";

const POST_CATEGORIES = ["tech", "life", "notes"];
const POST_TONES = ["accent-light", "accent-dark", "accent-orange"];
const POST_SIZES = ["large", "medium", "small", "wide"];

const SECTION_FIELDS = [
  { key: "home", zh: "主页", en: "Home" },
  { key: "intro", zh: "介绍", en: "Intro" },
  { key: "posts", zh: "文章", en: "Posts" },
  { key: "knowledge", zh: "知识库", en: "Knowledge" },
  { key: "stats", zh: "统计", en: "Stats" },
  { key: "books", zh: "书单", en: "Books" },
  { key: "contact", zh: "联系", en: "Contact" }
];

const copy = {
  zh: {
    metaTitle: "TPBLOG | 管理控制台",
    authTitle: "管理员登录",
    authSub: "请输入管理员口令以进入控制台。",
    authPasswordLabel: "口令",
    authSubmit: "登录",
    authResetDefault: "忘记密码，恢复默认",
    authFailed: "口令错误，请重试。",
    authResetDone: "已恢复默认密码，请用 TPBLOG@2026 登录。",
    headerTitle: "管理员控制台",
    headerSub: "图形化控制首页模块与内容。",
    backHome: "返回主页",
    logout: "退出登录",
    localeAria: "切换到英文",
    summaryTitle: "概览",
    summarySub: "当前可编辑内容的数量。",
    summaryPosts: "文章",
    summaryKnowledge: "知识卡",
    summaryBooks: "书单",
    summaryTags: "标签映射",
    visibilityTitle: "模块显示控制",
    visibilitySub: "按模块开关首页内容区。",
    profileTitle: "个人信息",
    profileSub: "配置角色与话题标签。",
    profileReadCount: "历史阅读基数",
    profileRolesZh: "角色（中文，每行一个）",
    profileRolesEn: "角色（英文，每行一个）",
    profileTopicsZh: "话题（中文，每行一个）",
    profileTopicsEn: "话题（英文，每行一个）",
    postsTitle: "文章卡片",
    postsSub: "管理首页文章列表。",
    addPost: "新增文章",
    knowledgeTitle: "知识卡片",
    knowledgeSub: "管理知识卡展示信息。",
    addKnowledge: "新增知识卡",
    tagTitle: "标签映射",
    tagSub: "设置标签 key 对应的中英文本。",
    addTagLabel: "新增标签映射",
    statsTitle: "统计条",
    statsSub: "控制统计面板中的 key 与百分比。",
    addStats: "新增统计条",
    booksTitle: "书单",
    booksSub: "管理阅读书单卡片。",
    addBook: "新增书籍",
    actionsTitle: "操作",
    actionsSub: "保存、重置、重载，或导入导出配置。",
    actionSave: "保存并应用",
    actionReset: "恢复默认",
    actionReload: "从存储重载",
    actionExport: "导出配置",
    actionImport: "导入配置",
    configBoxLabel: "配置 JSON",
    securityTitle: "安全",
    securitySub: "修改管理员密码，或恢复默认密码。",
    securityCurrent: "当前密码",
    securityNew: "新密码",
    securityConfirm: "确认新密码",
    securityUpdate: "更新密码",
    securityReset: "恢复默认密码",
    remove: "删除",
    emptyPosts: "暂无文章，点击“新增文章”开始。",
    emptyKnowledge: "暂无知识卡，点击“新增知识卡”开始。",
    emptyTags: "暂无标签映射，点击“新增标签映射”开始。",
    emptyStats: "暂无统计条，点击“新增统计条”开始。",
    emptyBooks: "暂无书单，点击“新增书籍”开始。",
    statusSaved: "配置已保存并应用。",
    statusReset: "已恢复默认配置。",
    statusReloaded: "已从存储重载最新配置。",
    statusExported: "配置已导出到下方文本框。",
    statusImported: "配置已导入并应用。",
    statusNeedImport: "请先粘贴配置 JSON。",
    statusInvalidImport: "导入失败：JSON 格式不合法。",
    statusDuplicatePostId: "存在重复文章 ID：{id}",
    statusDuplicateKnowledgeId: "存在重复知识卡 ID：{id}",
    statusSyncHint: "检测到其他页面更新，已自动同步。",
    statusResetCanceled: "已取消恢复默认操作。",
    securityCurrentWrong: "当前密码不正确。",
    securityTooShort: "新密码至少 6 位。",
    securityMismatch: "两次输入的新密码不一致。",
    securityUpdated: "密码更新成功。",
    securityResetDone: "已恢复为默认密码。",
    securityNeedCurrent: "请输入当前密码。",
    confirmResetConfig: "确认恢复默认配置？",
    confirmResetPassword: "确认将管理员密码恢复为默认值？"
  },
  en: {
    metaTitle: "TPBLOG | Admin Console",
    authTitle: "Admin Login",
    authSub: "Enter admin password to unlock this dashboard.",
    authPasswordLabel: "Password",
    authSubmit: "Sign In",
    authResetDefault: "Reset to Default Password",
    authFailed: "Wrong password. Please try again.",
    authResetDone: "Password reset to default. Sign in with TPBLOG@2026.",
    headerTitle: "Admin Console",
    headerSub: "Visually manage homepage modules and content.",
    backHome: "Back Home",
    logout: "Logout",
    localeAria: "Switch to Chinese",
    summaryTitle: "Overview",
    summarySub: "Object counts in editable homepage model.",
    summaryPosts: "Posts",
    summaryKnowledge: "Knowledge Cards",
    summaryBooks: "Books",
    summaryTags: "Tag Labels",
    visibilityTitle: "Section Visibility",
    visibilitySub: "Toggle each section shown on homepage.",
    profileTitle: "Profile",
    profileSub: "Manage role and topic text lists.",
    profileReadCount: "Legacy Read Count",
    profileRolesZh: "Roles (ZH, one per line)",
    profileRolesEn: "Roles (EN, one per line)",
    profileTopicsZh: "Topics (ZH, one per line)",
    profileTopicsEn: "Topics (EN, one per line)",
    postsTitle: "Posts",
    postsSub: "Manage post cards in homepage feed.",
    addPost: "Add Post",
    knowledgeTitle: "Knowledge Cards",
    knowledgeSub: "Manage card metadata for the knowledge section.",
    addKnowledge: "Add Knowledge Card",
    tagTitle: "Tag Labels",
    tagSub: "Map tag keys to bilingual labels.",
    addTagLabel: "Add Tag Label",
    statsTitle: "Stats Bars",
    statsSub: "Control key and percentage bars in stats section.",
    addStats: "Add Stats Bar",
    booksTitle: "Books",
    booksSub: "Manage reading list cards.",
    addBook: "Add Book",
    actionsTitle: "Actions",
    actionsSub: "Save, reset, reload, or import/export configuration.",
    actionSave: "Save and Apply",
    actionReset: "Reset to Defaults",
    actionReload: "Reload from Storage",
    actionExport: "Export Config",
    actionImport: "Import Config",
    configBoxLabel: "Config JSON",
    securityTitle: "Security",
    securitySub: "Change admin password or reset to default.",
    securityCurrent: "Current Password",
    securityNew: "New Password",
    securityConfirm: "Confirm New Password",
    securityUpdate: "Update Password",
    securityReset: "Reset to Default Password",
    remove: "Remove",
    emptyPosts: "No posts yet. Click Add Post.",
    emptyKnowledge: "No knowledge cards yet. Click Add Knowledge Card.",
    emptyTags: "No tag labels yet. Click Add Tag Label.",
    emptyStats: "No stats bars yet. Click Add Stats Bar.",
    emptyBooks: "No books yet. Click Add Book.",
    statusSaved: "Configuration saved and applied.",
    statusReset: "Configuration reset to defaults.",
    statusReloaded: "Configuration reloaded from storage.",
    statusExported: "Configuration exported to the text box below.",
    statusImported: "Configuration imported and applied.",
    statusNeedImport: "Paste config JSON first.",
    statusInvalidImport: "Import failed: invalid JSON.",
    statusDuplicatePostId: "Duplicate post id found: {id}",
    statusDuplicateKnowledgeId: "Duplicate knowledge id found: {id}",
    statusSyncHint: "Synced because config changed in another tab.",
    statusResetCanceled: "Reset cancelled.",
    securityCurrentWrong: "Current password is incorrect.",
    securityTooShort: "New password must be at least 6 characters.",
    securityMismatch: "New password and confirmation do not match.",
    securityUpdated: "Password updated successfully.",
    securityResetDone: "Password restored to default.",
    securityNeedCurrent: "Enter current password.",
    confirmResetConfig: "Reset all admin overrides to defaults?",
    confirmResetPassword: "Reset admin password to default?"
  }
};

const el = {
  authGate: document.getElementById("authGate"),
  authForm: document.getElementById("authForm"),
  authPassword: document.getElementById("authPassword"),
  authResetDefaultBtn: document.getElementById("authResetDefaultBtn"),
  authMessage: document.getElementById("authMessage"),
  adminMain: document.getElementById("adminMain"),
  localeToggle: document.getElementById("adminLocaleToggle"),
  logoutBtn: document.getElementById("logoutBtn"),
  summaryPosts: document.getElementById("summaryPosts"),
  summaryKnowledge: document.getElementById("summaryKnowledge"),
  summaryBooks: document.getElementById("summaryBooks"),
  summaryTags: document.getElementById("summaryTags"),
  visibilityList: document.getElementById("visibilityList"),
  profileReadCount: document.getElementById("profileReadCount"),
  profileRolesZh: document.getElementById("profileRolesZh"),
  profileRolesEn: document.getElementById("profileRolesEn"),
  profileTopicsZh: document.getElementById("profileTopicsZh"),
  profileTopicsEn: document.getElementById("profileTopicsEn"),
  addPostBtn: document.getElementById("addPostBtn"),
  postsList: document.getElementById("postsList"),
  addKnowledgeBtn: document.getElementById("addKnowledgeBtn"),
  knowledgeList: document.getElementById("knowledgeList"),
  addTagLabelBtn: document.getElementById("addTagLabelBtn"),
  tagLabelList: document.getElementById("tagLabelList"),
  addStatsBtn: document.getElementById("addStatsBtn"),
  statsList: document.getElementById("statsList"),
  addBookBtn: document.getElementById("addBookBtn"),
  booksList: document.getElementById("booksList"),
  saveBtn: document.getElementById("adminSaveBtn"),
  resetBtn: document.getElementById("adminResetBtn"),
  reloadBtn: document.getElementById("adminReloadBtn"),
  exportBtn: document.getElementById("adminExportBtn"),
  importBtn: document.getElementById("adminImportBtn"),
  configBox: document.getElementById("configBox"),
  adminStatus: document.getElementById("adminStatus"),
  securityCurrent: document.getElementById("securityCurrentPassword"),
  securityNew: document.getElementById("securityNewPassword"),
  securityConfirm: document.getElementById("securityConfirmPassword"),
  securityUpdateBtn: document.getElementById("securityUpdateBtn"),
  securityResetBtn: document.getElementById("securityResetBtn"),
  securityStatus: document.getElementById("securityStatus")
};

const state = {
  locale: detectLocale(),
  visibility: {},
  data: emptyData(),
  tagLabelRows: [],
  booted: false
};

function emptyData() {
  return {
    profile: { readCount: 0, roles: { zh: [], en: [] }, topics: { zh: [], en: [] } },
    posts: [],
    knowledgeCards: [],
    knowledgeTagLabels: {},
    books: [],
    statsBars: []
  };
}

function deepClone(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch { return null; }
}

function detectLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {}
  return (navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function saveLocale(locale) {
  try { localStorage.setItem(LOCALE_KEY, locale); } catch {}
}

function t(key, params = {}) {
  const pack = copy[state.locale] || copy.zh;
  const source = Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : key;
  return source.replace(/\{(\w+)\}/g, (_, name) => (Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setByPath(target, path, value) {
  const parts = String(path || "").split(".").filter(Boolean);
  let ref = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (!ref[parts[i]] || typeof ref[parts[i]] !== "object") ref[parts[i]] = {};
    ref = ref[parts[i]];
  }
  ref[parts[parts.length - 1]] = value;
}

function linesToArray(value) {
  return String(value || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

function arrayToLines(list) {
  return Array.isArray(list) ? list.join("\n") : "";
}

function parseTags(value) {
  return String(value || "").split(/[，,\s]+/).map((x) => x.trim()).filter(Boolean);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeTextPair(input, fallback = "") {
  const source = input && typeof input === "object" ? input : {};
  return { zh: String(source.zh ?? fallback), en: String(source.en ?? fallback) };
}

function normalizeLinesPair(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    zh: Array.isArray(source.zh) ? source.zh.map(String).filter(Boolean) : [],
    en: Array.isArray(source.en) ? source.en.map(String).filter(Boolean) : []
  };
}

function normalizeData(data) {
  const source = data && typeof data === "object" ? deepClone(data) : {};
  const next = emptyData();
  const profile = source.profile && typeof source.profile === "object" ? source.profile : {};
  next.profile.readCount = Math.max(0, Math.floor(toNumber(profile.readCount, 0)));
  next.profile.roles = normalizeLinesPair(profile.roles);
  next.profile.topics = normalizeLinesPair(profile.topics);

  next.posts = Array.isArray(source.posts) ? source.posts.map((post, index) => {
    const p = post && typeof post === "object" ? deepClone(post) : {};
    p.id = String(p.id || `post-${Date.now()}-${index}`);
    p.category = POST_CATEGORIES.includes(p.category) ? p.category : "tech";
    p.tag = normalizeTextPair(p.tag, "Tag");
    p.tone = POST_TONES.includes(p.tone) ? p.tone : "accent-light";
    p.size = POST_SIZES.includes(p.size) ? p.size : "medium";
    p.baseReads = Math.max(0, Math.floor(toNumber(p.baseReads, 0)));
    p.date = String(p.date || new Date().toISOString().slice(0, 10));
    p.reading = normalizeTextPair(p.reading, "5 min read");
    p.title = normalizeTextPair(p.title, "Untitled");
    p.excerpt = normalizeTextPair(p.excerpt, "");
    p.content = normalizeLinesPair(p.content);
    return p;
  }) : [];

  next.knowledgeCards = Array.isArray(source.knowledgeCards) ? source.knowledgeCards.map((card, index) => {
    const k = card && typeof card === "object" ? deepClone(card) : {};
    k.id = String(k.id || `kb-${Date.now()}-${index}`);
    k.slug = String(k.slug || k.id);
    k.tags = Array.isArray(k.tags) ? k.tags.map((x) => String(x).trim()).filter(Boolean) : [];
    k.updated = String(k.updated || new Date().toISOString().slice(0, 10));
    k.reading = normalizeTextPair(k.reading, "5 min read");
    k.title = normalizeTextPair(k.title, "Knowledge");
    k.summary = normalizeTextPair(k.summary, "");
    k.page = k.page ? String(k.page) : "";
    return k;
  }) : [];

  const labels = source.knowledgeTagLabels && typeof source.knowledgeTagLabels === "object" ? source.knowledgeTagLabels : {};
  next.knowledgeTagLabels = {};
  Object.keys(labels).forEach((key) => {
    if (!key) return;
    next.knowledgeTagLabels[key] = normalizeTextPair(labels[key], key);
  });

  next.books = Array.isArray(source.books) ? source.books.map((book) => {
    const b = book && typeof book === "object" ? deepClone(book) : {};
    b.title = normalizeTextPair(b.title, "Book");
    b.summary = normalizeTextPair(b.summary, "");
    return b;
  }) : [];

  next.statsBars = Array.isArray(source.statsBars) ? source.statsBars.map((item, index) => {
    const s = item && typeof item === "object" ? deepClone(item) : {};
    s.key = String(s.key || `metric_${index + 1}`);
    s.value = clamp(Math.floor(toNumber(s.value, 50)), 0, 100);
    return s;
  }) : [];

  return next;
}

function syncTagRowsFromData() {
  const labels = state.data.knowledgeTagLabels || {};
  state.tagLabelRows = Object.keys(labels).sort((a, b) => a.localeCompare(b, "en")).map((key) => ({
    key,
    zh: String(labels[key]?.zh || key),
    en: String(labels[key]?.en || key)
  }));
}

function syncDataFromTagRows() {
  const result = {};
  state.tagLabelRows.forEach((row) => {
    const key = String(row.key || "").trim();
    if (!key) return;
    result[key] = { zh: String(row.zh || key), en: String(row.en || key) };
  });
  state.data.knowledgeTagLabels = result;
}

function applyStaticCopy() {
  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  document.title = t("metaTitle");
  document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = t(node.dataset.copy); });
  el.localeToggle.textContent = state.locale === "zh" ? "EN" : "中";
  el.localeToggle.setAttribute("aria-label", t("localeAria"));
  el.localeToggle.title = t("localeAria");
}

function renderSummary() {
  el.summaryPosts.textContent = String(state.data.posts.length);
  el.summaryKnowledge.textContent = String(state.data.knowledgeCards.length);
  el.summaryBooks.textContent = String(state.data.books.length);
  el.summaryTags.textContent = String(state.tagLabelRows.length);
}

function renderVisibility() {
  el.visibilityList.innerHTML = SECTION_FIELDS.map((section) => {
    const checked = state.visibility[section.key] !== false ? "checked" : "";
    const label = state.locale === "zh" ? section.zh : section.en;
    return `<label class="visibility-item"><strong>${escapeHTML(label)}</strong><input type="checkbox" data-section-key="${section.key}" ${checked}></label>`;
  }).join("");
}

function renderProfile() {
  const p = state.data.profile;
  el.profileReadCount.value = String(p.readCount || 0);
  el.profileRolesZh.value = arrayToLines(p.roles.zh);
  el.profileRolesEn.value = arrayToLines(p.roles.en);
  el.profileTopicsZh.value = arrayToLines(p.topics.zh);
  el.profileTopicsEn.value = arrayToLines(p.topics.en);
}

function renderPosts() {
  if (!state.data.posts.length) {
    el.postsList.innerHTML = `<p class="empty-tip">${escapeHTML(t("emptyPosts"))}</p>`;
    return;
  }

  const categoryOptions = POST_CATEGORIES.map((item) => `<option value="${item}">${item}</option>`).join("");
  const toneOptions = POST_TONES.map((item) => `<option value="${item}">${item}</option>`).join("");
  const sizeOptions = POST_SIZES.map((item) => `<option value="${item}">${item}</option>`).join("");

  el.postsList.innerHTML = state.data.posts.map((post, index) => `
    <article class="entity-card" data-type="posts" data-idx="${index}">
      <div class="entity-head"><strong>Post #${index + 1}</strong><button class="admin-btn danger" type="button" data-action="remove-post" data-index="${index}">${escapeHTML(t("remove"))}</button></div>
      <div class="entity-grid">
        <label class="input-field"><span>ID</span><input data-entity="posts" data-index="${index}" data-field="id" value="${escapeHTML(post.id)}"></label>
        <label class="input-field"><span>Category</span><select data-entity="posts" data-index="${index}" data-field="category">${categoryOptions}</select></label>
        <label class="input-field"><span>Date</span><input type="date" data-entity="posts" data-index="${index}" data-field="date" value="${escapeHTML(post.date)}"></label>
      </div>
      <div class="entity-grid">
        <label class="input-field"><span>Tone</span><select data-entity="posts" data-index="${index}" data-field="tone">${toneOptions}</select></label>
        <label class="input-field"><span>Size</span><select data-entity="posts" data-index="${index}" data-field="size">${sizeOptions}</select></label>
        <label class="input-field"><span>Base Reads</span><input type="number" min="0" step="1" data-entity="posts" data-index="${index}" data-field="baseReads" data-type="number" value="${post.baseReads}"></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Title ZH</span><input data-entity="posts" data-index="${index}" data-field="title.zh" value="${escapeHTML(post.title.zh)}"></label>
        <label class="input-field"><span>Title EN</span><input data-entity="posts" data-index="${index}" data-field="title.en" value="${escapeHTML(post.title.en)}"></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Excerpt ZH</span><textarea data-entity="posts" data-index="${index}" data-field="excerpt.zh">${escapeHTML(post.excerpt.zh)}</textarea></label>
        <label class="input-field"><span>Excerpt EN</span><textarea data-entity="posts" data-index="${index}" data-field="excerpt.en">${escapeHTML(post.excerpt.en)}</textarea></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Content ZH (line split)</span><textarea data-entity="posts" data-index="${index}" data-field="content.zh" data-type="lines">${escapeHTML(arrayToLines(post.content.zh))}</textarea></label>
        <label class="input-field"><span>Content EN (line split)</span><textarea data-entity="posts" data-index="${index}" data-field="content.en" data-type="lines">${escapeHTML(arrayToLines(post.content.en))}</textarea></label>
      </div>
    </article>
  `).join("");

  state.data.posts.forEach((post, index) => {
    const card = el.postsList.querySelector(`[data-type=\"posts\"][data-idx=\"${index}\"]`);
    const categoryNode = card?.querySelector('[data-field="category"]');
    const toneNode = card?.querySelector('[data-field="tone"]');
    const sizeNode = card?.querySelector('[data-field="size"]');
    if (categoryNode) categoryNode.value = post.category;
    if (toneNode) toneNode.value = post.tone;
    if (sizeNode) sizeNode.value = post.size;
  });
}

function renderKnowledge() {
  if (!state.data.knowledgeCards.length) {
    el.knowledgeList.innerHTML = `<p class="empty-tip">${escapeHTML(t("emptyKnowledge"))}</p>`;
    return;
  }

  el.knowledgeList.innerHTML = state.data.knowledgeCards.map((card, index) => `
    <article class="entity-card">
      <div class="entity-head"><strong>Card #${index + 1}</strong><button class="admin-btn danger" type="button" data-action="remove-knowledge" data-index="${index}">${escapeHTML(t("remove"))}</button></div>
      <div class="entity-grid">
        <label class="input-field"><span>ID</span><input data-entity="knowledgeCards" data-index="${index}" data-field="id" value="${escapeHTML(card.id)}"></label>
        <label class="input-field"><span>Slug</span><input data-entity="knowledgeCards" data-index="${index}" data-field="slug" value="${escapeHTML(card.slug || "")}"></label>
        <label class="input-field"><span>Updated</span><input type="date" data-entity="knowledgeCards" data-index="${index}" data-field="updated" value="${escapeHTML(card.updated || "")}"></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Title ZH</span><input data-entity="knowledgeCards" data-index="${index}" data-field="title.zh" value="${escapeHTML(card.title.zh)}"></label>
        <label class="input-field"><span>Title EN</span><input data-entity="knowledgeCards" data-index="${index}" data-field="title.en" value="${escapeHTML(card.title.en)}"></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Summary ZH</span><textarea data-entity="knowledgeCards" data-index="${index}" data-field="summary.zh">${escapeHTML(card.summary.zh)}</textarea></label>
        <label class="input-field"><span>Summary EN</span><textarea data-entity="knowledgeCards" data-index="${index}" data-field="summary.en">${escapeHTML(card.summary.en)}</textarea></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Tags (csv)</span><input data-entity="knowledgeCards" data-index="${index}" data-field="tags" data-type="tags" value="${escapeHTML(card.tags.join(", "))}"></label>
        <label class="input-field"><span>Page</span><input data-entity="knowledgeCards" data-index="${index}" data-field="page" value="${escapeHTML(card.page || "")}"></label>
      </div>
    </article>
  `).join("");
}

function renderTagLabels() {
  if (!state.tagLabelRows.length) {
    el.tagLabelList.innerHTML = `<p class="empty-tip">${escapeHTML(t("emptyTags"))}</p>`;
    return;
  }

  el.tagLabelList.innerHTML = state.tagLabelRows.map((row, index) => `
    <article class="entity-card">
      <div class="entity-head"><strong>Tag #${index + 1}</strong><button class="admin-btn danger" type="button" data-action="remove-tag" data-index="${index}">${escapeHTML(t("remove"))}</button></div>
      <div class="entity-grid">
        <label class="input-field"><span>Key</span><input data-entity="tagRows" data-index="${index}" data-field="key" value="${escapeHTML(row.key)}"></label>
        <label class="input-field"><span>ZH</span><input data-entity="tagRows" data-index="${index}" data-field="zh" value="${escapeHTML(row.zh)}"></label>
        <label class="input-field"><span>EN</span><input data-entity="tagRows" data-index="${index}" data-field="en" value="${escapeHTML(row.en)}"></label>
      </div>
    </article>
  `).join("");
}

function renderStats() {
  if (!state.data.statsBars.length) {
    el.statsList.innerHTML = `<p class="empty-tip">${escapeHTML(t("emptyStats"))}</p>`;
    return;
  }

  el.statsList.innerHTML = state.data.statsBars.map((item, index) => `
    <article class="entity-card">
      <div class="entity-head"><strong>Stats #${index + 1}</strong><button class="admin-btn danger" type="button" data-action="remove-stats" data-index="${index}">${escapeHTML(t("remove"))}</button></div>
      <div class="entity-grid">
        <label class="input-field"><span>Key</span><input data-entity="statsBars" data-index="${index}" data-field="key" value="${escapeHTML(item.key)}"></label>
        <label class="input-field"><span>Value 0-100</span><div class="entity-inline"><input type="range" min="0" max="100" step="1" data-entity="statsBars" data-index="${index}" data-field="value" data-type="number" value="${item.value}"><input class="inline-input" type="number" min="0" max="100" step="1" data-entity="statsBars" data-index="${index}" data-field="value" data-type="number" value="${item.value}"></div></label>
      </div>
    </article>
  `).join("");
}

function renderBooks() {
  if (!state.data.books.length) {
    el.booksList.innerHTML = `<p class="empty-tip">${escapeHTML(t("emptyBooks"))}</p>`;
    return;
  }

  el.booksList.innerHTML = state.data.books.map((book, index) => `
    <article class="entity-card">
      <div class="entity-head"><strong>Book #${index + 1}</strong><button class="admin-btn danger" type="button" data-action="remove-book" data-index="${index}">${escapeHTML(t("remove"))}</button></div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Title ZH</span><input data-entity="books" data-index="${index}" data-field="title.zh" value="${escapeHTML(book.title.zh)}"></label>
        <label class="input-field"><span>Title EN</span><input data-entity="books" data-index="${index}" data-field="title.en" value="${escapeHTML(book.title.en)}"></label>
      </div>
      <div class="entity-grid two-col">
        <label class="input-field"><span>Summary ZH</span><textarea data-entity="books" data-index="${index}" data-field="summary.zh">${escapeHTML(book.summary.zh)}</textarea></label>
        <label class="input-field"><span>Summary EN</span><textarea data-entity="books" data-index="${index}" data-field="summary.en">${escapeHTML(book.summary.en)}</textarea></label>
      </div>
    </article>
  `).join("");
}

function renderAll() {
  applyStaticCopy();
  renderSummary();
  renderVisibility();
  renderProfile();
  renderPosts();
  renderKnowledge();
  renderTagLabels();
  renderStats();
  renderBooks();
}

function status(node, msg, type = "info") {
  node.textContent = msg;
  node.className = node.id === "authMessage" ? "auth-message" : "admin-status";
  if (type === "error") node.classList.add("error");
  if (type === "success") node.classList.add("success");
}

function updateProfileState() {
  state.data.profile.readCount = Math.max(0, Math.floor(toNumber(el.profileReadCount.value, 0)));
  state.data.profile.roles.zh = linesToArray(el.profileRolesZh.value);
  state.data.profile.roles.en = linesToArray(el.profileRolesEn.value);
  state.data.profile.topics.zh = linesToArray(el.profileTopicsZh.value);
  state.data.profile.topics.en = linesToArray(el.profileTopicsEn.value);
}

function getEntityItem(entity, index) {
  if (entity === "tagRows") return state.tagLabelRows[index] || null;
  return Array.isArray(state.data[entity]) ? state.data[entity][index] || null : null;
}

function bindInputs() {
  [el.profileReadCount, el.profileRolesZh, el.profileRolesEn, el.profileTopicsZh, el.profileTopicsEn].forEach((node) => {
    node.addEventListener("input", updateProfileState);
  });

  document.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[data-section-key]");
    if (checkbox) {
      state.visibility[checkbox.dataset.sectionKey] = Boolean(checkbox.checked);
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target.closest("[data-entity][data-index][data-field]");
    if (!target) return;
    const entity = target.dataset.entity;
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    const type = target.dataset.type || "string";
    const item = getEntityItem(entity, index);
    if (!item) return;

    let value = target.value;
    if (type === "number") value = clamp(Math.floor(toNumber(value, 0)), 0, 100);
    if (type === "lines") value = linesToArray(value);
    if (type === "tags") value = parseTags(value);

    setByPath(item, field, value);

    if (entity === "statsBars" && field === "value") {
      const card = target.closest(".entity-card");
      card?.querySelectorAll('[data-field="value"]').forEach((node) => {
        if (node !== target) node.value = String(value);
      });
    }
  });
}

function bindListActions() {
  el.addPostBtn.addEventListener("click", () => {
    state.data.posts.push(normalizeData({ posts: [{}] }).posts[0]);
    renderPosts();
    renderSummary();
  });

  el.addKnowledgeBtn.addEventListener("click", () => {
    state.data.knowledgeCards.push(normalizeData({ knowledgeCards: [{}] }).knowledgeCards[0]);
    renderKnowledge();
    renderSummary();
  });

  el.addTagLabelBtn.addEventListener("click", () => {
    state.tagLabelRows.push({ key: "", zh: "", en: "" });
    renderTagLabels();
    renderSummary();
  });

  el.addStatsBtn.addEventListener("click", () => {
    state.data.statsBars.push(normalizeData({ statsBars: [{}] }).statsBars[0]);
    renderStats();
  });

  el.addBookBtn.addEventListener("click", () => {
    state.data.books.push(normalizeData({ books: [{}] }).books[0]);
    renderBooks();
    renderSummary();
  });

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === "remove-post") state.data.posts.splice(index, 1);
    if (action === "remove-knowledge") state.data.knowledgeCards.splice(index, 1);
    if (action === "remove-tag") state.tagLabelRows.splice(index, 1);
    if (action === "remove-stats") state.data.statsBars.splice(index, 1);
    if (action === "remove-book") state.data.books.splice(index, 1);

    syncDataFromTagRows();
    renderSummary();
    renderPosts();
    renderKnowledge();
    renderTagLabels();
    renderStats();
    renderBooks();
  });
}

function duplicateId(list) {
  const seen = new Set();
  for (const raw of list) {
    const id = String(raw || "").trim();
    if (!id) continue;
    if (seen.has(id)) return id;
    seen.add(id);
  }
  return null;
}

function buildConfig() {
  syncDataFromTagRows();
  const postDup = duplicateId(state.data.posts.map((x) => x.id));
  if (postDup) throw new Error(t("statusDuplicatePostId", { id: postDup }));
  const knowledgeDup = duplicateId(state.data.knowledgeCards.map((x) => x.id));
  if (knowledgeDup) throw new Error(t("statusDuplicateKnowledgeId", { id: knowledgeDup }));
  return { visibility: deepClone(state.visibility), data: deepClone(state.data) };
}

function loadFromRuntime() {
  applyAdminConfig();
  const snapshot = buildAdminSnapshot();
  state.visibility = { ...(snapshot.visibility || {}) };
  state.data = normalizeData(snapshot.data);
  syncTagRowsFromData();
  renderAll();
  el.configBox.value = JSON.stringify(loadAdminConfig(), null, 2);
}

function bindActions() {
  el.saveBtn.addEventListener("click", () => {
    try {
      saveAdminConfig(buildConfig());
      applyAdminConfig();
      el.configBox.value = JSON.stringify(loadAdminConfig(), null, 2);
      status(el.adminStatus, t("statusSaved"), "success");
    } catch (error) {
      status(el.adminStatus, error.message || String(error), "error");
    }
  });

  el.resetBtn.addEventListener("click", () => {
    if (!window.confirm(t("confirmResetConfig"))) {
      status(el.adminStatus, t("statusResetCanceled"));
      return;
    }
    clearAdminConfig();
    loadFromRuntime();
    status(el.adminStatus, t("statusReset"), "success");
  });

  el.reloadBtn.addEventListener("click", () => {
    loadFromRuntime();
    status(el.adminStatus, t("statusReloaded"), "success");
  });

  el.exportBtn.addEventListener("click", () => {
    try {
      el.configBox.value = JSON.stringify(buildConfig(), null, 2);
      status(el.adminStatus, t("statusExported"), "success");
    } catch (error) {
      status(el.adminStatus, error.message || String(error), "error");
    }
  });

  el.importBtn.addEventListener("click", () => {
    const raw = (el.configBox.value || "").trim();
    if (!raw) {
      status(el.adminStatus, t("statusNeedImport"), "error");
      return;
    }
    try {
      saveAdminConfig(JSON.parse(raw));
      loadFromRuntime();
      status(el.adminStatus, t("statusImported"), "success");
    } catch {
      status(el.adminStatus, t("statusInvalidImport"), "error");
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      el.saveBtn.click();
    }
  });
}

function getPasswordHash() {
  try { return localStorage.getItem(AUTH_HASH_KEY) || DEFAULT_PASSWORD_HASH; } catch { return DEFAULT_PASSWORD_HASH; }
}

async function sha256Hex(input) {
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(String(input));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return String(input);
}

async function verifyPassword(password) {
  const stored = getPasswordHash();
  const hashed = await sha256Hex(password);
  if (hashed === stored) return true;

  // Compatibility path for browsers where SubtleCrypto is unavailable.
  if (!window.crypto?.subtle && stored === DEFAULT_PASSWORD_HASH && password === DEFAULT_PASSWORD_TEXT) {
    return true;
  }

  return false;
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || Number(parsed.expiresAt) <= Date.now()) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function writeSession() {
  try { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + AUTH_SESSION_TTL_MS })); } catch {}
}

function clearSession() {
  try { localStorage.removeItem(AUTH_SESSION_KEY); } catch {}
}

function lockUI() {
  document.body.classList.add("is-locked");
  el.adminMain.hidden = true;
  el.authGate.hidden = false;
  el.logoutBtn.hidden = true;
}

function unlockUI() {
  document.body.classList.remove("is-locked");
  el.adminMain.hidden = false;
  el.authGate.hidden = true;
  el.logoutBtn.hidden = false;
  if (!state.booted) {
    state.booted = true;
    loadFromRuntime();
  }
}

function bindAuth() {
  el.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = el.authPassword.value || "";
    if (!input || !(await verifyPassword(input))) {
      status(el.authMessage, t("authFailed"), "error");
      return;
    }
    el.authPassword.value = "";
    status(el.authMessage, "");
    writeSession();
    unlockUI();
  });

  el.authResetDefaultBtn.addEventListener("click", () => {
    if (!window.confirm(t("confirmResetPassword"))) return;
    localStorage.removeItem(AUTH_HASH_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    el.authPassword.value = "";
    status(el.authMessage, t("authResetDone"), "success");
    el.authPassword.focus();
  });

  el.logoutBtn.addEventListener("click", () => {
    clearSession();
    lockUI();
    el.authPassword.focus();
  });
}

function bindSecurity() {
  el.securityUpdateBtn.addEventListener("click", async () => {
    const current = el.securityCurrent.value || "";
    const next = el.securityNew.value || "";
    const confirm = el.securityConfirm.value || "";

    if (!current) {
      status(el.securityStatus, t("securityNeedCurrent"), "error");
      return;
    }
    if (!(await verifyPassword(current))) {
      status(el.securityStatus, t("securityCurrentWrong"), "error");
      return;
    }
    if (next.length < 6) {
      status(el.securityStatus, t("securityTooShort"), "error");
      return;
    }
    if (next !== confirm) {
      status(el.securityStatus, t("securityMismatch"), "error");
      return;
    }

    localStorage.setItem(AUTH_HASH_KEY, await sha256Hex(next));
    el.securityCurrent.value = "";
    el.securityNew.value = "";
    el.securityConfirm.value = "";
    status(el.securityStatus, t("securityUpdated"), "success");
  });

  el.securityResetBtn.addEventListener("click", async () => {
    const current = el.securityCurrent.value || "";
    if (!current) {
      status(el.securityStatus, t("securityNeedCurrent"), "error");
      return;
    }
    if (!(await verifyPassword(current))) {
      status(el.securityStatus, t("securityCurrentWrong"), "error");
      return;
    }
    if (!window.confirm(t("confirmResetPassword"))) return;

    localStorage.removeItem(AUTH_HASH_KEY);
    el.securityCurrent.value = "";
    el.securityNew.value = "";
    el.securityConfirm.value = "";
    status(el.securityStatus, t("securityResetDone"), "success");
  });
}

function bindLocaleToggle() {
  el.localeToggle.addEventListener("click", () => {
    state.locale = state.locale === "zh" ? "en" : "zh";
    saveLocale(state.locale);
    renderAll();
  });
}

function bindCrossTabSync() {
  onAdminConfigChange(() => {
    if (!state.booted) return;
    loadFromRuntime();
  });
}

function init() {
  if (window.location.hash !== ADMIN_ENTRY_HASH) {
    window.location.replace("./index.html");
    return;
  }

  applyStaticCopy();
  bindAuth();
  bindLocaleToggle();
  bindInputs();
  bindListActions();
  bindActions();
  bindSecurity();
  bindCrossTabSync();

  if (readSession()) {
    unlockUI();
  } else {
    lockUI();
    el.authPassword.focus();
  }
}

init();
