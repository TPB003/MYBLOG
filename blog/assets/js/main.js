import { applyI18n, initI18n, onLocaleChange } from "./core/i18n.js";
import { applyAdminConfig, onAdminConfigChange } from "./core/admin-config.js";
import { bindTiltCards, initReveal, initSpotlight } from "./features/effects.js";
import { initKnowledge } from "./features/knowledge.js?v=20260308j";
import { initPosts } from "./features/posts.js?v=20260308j";
import { initReadMetrics, syncReadMetricCatalog } from "./features/read-metrics.js?v=20260308j";
import { initStaticSections } from "./features/static-sections.js?v=20260308j";
import { initTheme } from "./features/theme.js?v=20260308j";

const localeToggleButton = document.getElementById("localeToggle");
const themeToggleButton = document.getElementById("themeToggle");

applyAdminConfig();
initI18n(localeToggleButton);

const staticSections = initStaticSections();
const posts = initPosts();
const knowledge = initKnowledge();
const theme = initTheme(themeToggleButton);

initReadMetrics();
syncReadMetricCatalog();

function renderAll() {
  applyI18n();
  staticSections.render();
  posts.render();
  knowledge.render();
  theme.render();
  bindTiltCards();
}

initReveal();
initSpotlight();
renderAll();

onLocaleChange(() => {
  renderAll();
});

onAdminConfigChange(() => {
  applyAdminConfig();
  syncReadMetricCatalog();
  renderAll();
});
