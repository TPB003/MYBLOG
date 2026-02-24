import { applyI18n, initI18n, onLocaleChange } from "./core/i18n.js";
import { bindTiltCards, initReveal, initSpotlight } from "./features/effects.js";
import { initIdeas } from "./features/ideas.js";
import { initKnowledge } from "./features/knowledge.js";
import { initPosts } from "./features/posts.js";
import { initStaticSections } from "./features/static-sections.js";
import { initWeather } from "./features/weather.js";

const localeToggleButton = document.getElementById("localeToggle");

initI18n(localeToggleButton);

const staticSections = initStaticSections();
const posts = initPosts();
const knowledge = initKnowledge();
const ideas = initIdeas();
const weather = initWeather();

function renderAll() {
  applyI18n();
  staticSections.render();
  posts.render();
  knowledge.render();
  ideas.render();
  weather.render();
  bindTiltCards();
}

initReveal();
initSpotlight();
renderAll();
weather.refresh(false);

onLocaleChange(() => {
  renderAll();
  weather.refresh(false);
});
