import { applyI18n, initI18n, onLocaleChange } from "./core/i18n.js";
import { bindTiltCards, initReveal, initSpotlight } from "./features/effects.js";
import { initFootprint } from "./features/footprint.js";
import { initIdeas } from "./features/ideas.js";
import { initKnowledge } from "./features/knowledge.js";
import { initPosts } from "./features/posts.js";
import { initStaticSections } from "./features/static-sections.js";

const localeToggleButton = document.getElementById("localeToggle");

initI18n(localeToggleButton);

const staticSections = initStaticSections();
const posts = initPosts();
const knowledge = initKnowledge();
const ideas = initIdeas();
const footprint = initFootprint();

function renderAll() {
  applyI18n();
  staticSections.render();
  posts.render();
  knowledge.render();
  ideas.render();
  footprint.render();
  bindTiltCards();
}

initReveal();
initSpotlight();
renderAll();

onLocaleChange(() => {
  renderAll();
});
