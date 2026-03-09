import { applyI18n, initI18n, onLocaleChange } from "./core/i18n.js";
import { applyAdminConfig, onAdminConfigChange } from "./core/admin-config.js";
import { bindTiltCards, initReveal, initSpotlight } from "./features/effects.js?v=20260309c";
import { initHeaderScroll } from "./features/header.js?v=20260308k";
import { initLanding } from "./features/landing.js?v=20260309c";
import { initKnowledge } from "./features/knowledge.js?v=20260308k";
import { initReadMetrics, syncReadMetricCatalog } from "./features/read-metrics.js?v=20260308k";
import { initStaticSections } from "./features/static-sections.js?v=20260308k";
import { initTheme } from "./features/theme.js?v=20260308k";

const localeToggleButton = document.getElementById("localeToggle");
const themeToggleButton = document.getElementById("themeToggle");

applyAdminConfig();
initI18n(localeToggleButton);

const staticSections = initStaticSections();
const landing = initLanding();
const knowledge = initKnowledge();
const theme = initTheme(themeToggleButton);
initHeaderScroll();

initReadMetrics();
syncReadMetricCatalog();

function renderAll() {
  applyI18n();
  staticSections.render();
  landing.render();
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


