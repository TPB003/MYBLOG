import { applyI18n, initI18n, onLocaleChange } from "./core/i18n.js";
import { bindTiltCards, initReveal, initSpotlight } from "./features/effects.js";
import { initKnowledge } from "./features/knowledge.js";
import { initReadMetrics } from "./features/read-metrics.js";
import { initStaticSections } from "./features/static-sections.js";
import { initTheme } from "./features/theme.js";

const localeToggleButton = document.getElementById("localeToggle");
const themeToggleButton = document.getElementById("themeToggle");

initI18n(localeToggleButton);

const staticSections = initStaticSections();
const knowledge = initKnowledge();
const theme = initTheme(themeToggleButton);

initReadMetrics();

function renderAll() {
  applyI18n();
  staticSections.render();
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
