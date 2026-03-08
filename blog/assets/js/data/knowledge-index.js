import { knowledgeCards as manualKnowledgeCards, knowledgeTagLabels as manualKnowledgeTagLabels } from "./content.js";
import { generatedKnowledgeCards, generatedKnowledgeTagLabels } from "./knowledge-generated.js";

function dedupeById(cards) {
  const map = new Map();
  cards.forEach((card) => {
    if (!card || !card.id) return;
    map.set(card.id, card);
  });
  return [...map.values()];
}

export const knowledgeCards = dedupeById([
  ...manualKnowledgeCards,
  ...generatedKnowledgeCards
]);

export const knowledgeTagLabels = {
  ...manualKnowledgeTagLabels,
  ...generatedKnowledgeTagLabels
};

