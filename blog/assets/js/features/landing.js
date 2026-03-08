import { getLocale } from "../core/i18n.js";

const phaseNode = document.getElementById("landingPhase");
const statusTimeNode = document.getElementById("landingStatusTime");
const buildNode = document.getElementById("landingBuildText");
const launchpadShell = document.querySelector(".launchpad-shell");
const landingCards = Array.from(document.querySelectorAll(".lz-card"));
const toolNodes = Array.from(document.querySelectorAll(".lz-tool"));

const buildTerms = {
  zh: ["Web \u5e94\u7528", "\u77e5\u8bc6\u7cfb\u7edf", "\u521b\u4f5c\u5de5\u5177"],
  en: ["WebApps", "Knowledge Systems", "Creator Tools"]
};

let started = false;
let clockTimer = null;
let typingTimer = null;
let pulseTimer = null;
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
let holdTicks = 0;
let cardsRevealed = false;

function formatTimestamp(locale) {
  const localeCode = locale === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}

function renderClock() {
  const locale = getLocale();
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

  if (phaseNode) {
    phaseNode.textContent = locale === "zh" ? (isNight ? "\u591c" : "\u663c") : (isNight ? "NIGHT" : "DAY");
  }

  if (statusTimeNode) {
    statusTimeNode.textContent = formatTimestamp(locale);
  }
}

function tickTyping() {
  if (!buildNode) return;

  const locale = getLocale();
  const terms = buildTerms[locale] || buildTerms.en;
  if (!terms.length) return;

  const term = terms[phraseIndex % terms.length];

  if (holdTicks > 0) {
    holdTicks -= 1;
    return;
  }

  if (deleting) {
    charIndex -= 1;
    buildNode.textContent = term.slice(0, Math.max(0, charIndex));
    if (charIndex <= 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % terms.length;
      holdTicks = 2;
    }
    return;
  }

  charIndex += 1;
  buildNode.textContent = term.slice(0, Math.min(term.length, charIndex));
  if (charIndex >= term.length) {
    deleting = true;
    holdTicks = 10;
  }
}

function revealCards() {
  if (cardsRevealed) return;
  cardsRevealed = true;
  landingCards.forEach((card, index) => {
    window.setTimeout(() => {
      card.classList.add("is-live");
    }, 80 * index);
  });
}

function pulseTools() {
  if (!toolNodes.length) return;
  toolNodes.forEach((node) => node.classList.remove("is-ping"));
  const index = Math.floor(Math.random() * toolNodes.length);
  toolNodes[index]?.classList.add("is-ping");
}

function bindLaunchpadGlow() {
  if (!launchpadShell || !window.matchMedia("(pointer: fine)").matches) return;

  launchpadShell.addEventListener("pointermove", (event) => {
    const rect = launchpadShell.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    launchpadShell.style.setProperty("--lz-mx", `${x.toFixed(2)}%`);
    launchpadShell.style.setProperty("--lz-my", `${y.toFixed(2)}%`);
  });
}

function start() {
  if (started) return;
  started = true;

  revealCards();
  bindLaunchpadGlow();
  renderClock();
  tickTyping();
  pulseTools();

  clockTimer = window.setInterval(renderClock, 1000);
  typingTimer = window.setInterval(tickTyping, 90);
  pulseTimer = window.setInterval(pulseTools, 1400);
}

export function initLanding() {
  if (!phaseNode && !statusTimeNode && !buildNode && !launchpadShell) {
    return {
      render() {}
    };
  }

  start();

  return {
    render() {
      renderClock();
    },
    dispose() {
      if (clockTimer) window.clearInterval(clockTimer);
      if (typingTimer) window.clearInterval(typingTimer);
      if (pulseTimer) window.clearInterval(pulseTimer);
      clockTimer = null;
      typingTimer = null;
      pulseTimer = null;
      started = false;
    }
  };
}
