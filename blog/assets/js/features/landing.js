import { getLocale } from "../core/i18n.js";

const phaseNode = document.getElementById("landingPhase");
const statusTimeNode = document.getElementById("landingStatusTime");
const buildNode = document.getElementById("landingBuildText");
const launchpadShell = document.querySelector(".launchpad-shell");
const landingCards = Array.from(document.querySelectorAll(".lz-card"));
const draggableCards = Array.from(document.querySelectorAll(".lz-card[data-lz-draggable='true']"));
const toolNodes = Array.from(document.querySelectorAll(".lz-tool"));

const buildTerms = {
  zh: ["Web \u5e94\u7528", "\u77e5\u8bc6\u7cfb\u7edf", "\u521b\u4f5c\u5de5\u5177"],
  en: ["WebApps", "Knowledge Systems", "Creator Tools"]
};

const dragStates = new WeakMap();

let started = false;
let clockTimer = null;
let typingTimer = null;
let pulseTimer = null;
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
let holdTicks = 0;
let cardsRevealed = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

function setCardDragTransform(card, x, y) {
  const maxX = 72;
  const maxY = 56;
  const safeX = clamp(x, -maxX, maxX);
  const safeY = clamp(y, -maxY, maxY);
  const rotate = (safeX / maxX) * 2.2;

  card.style.setProperty("--drag-x", `${safeX.toFixed(1)}px`);
  card.style.setProperty("--drag-y", `${safeY.toFixed(1)}px`);
  card.style.setProperty("--drag-r", `${rotate.toFixed(2)}deg`);
}

function bindCardDrag() {
  if (!draggableCards.length || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  draggableCards.forEach((card) => {
    if (card.dataset.dragBound === "true") return;
    card.dataset.dragBound = "true";

    const state = {
      pointerId: null,
      startClientX: 0,
      startClientY: 0,
      moved: false
    };

    dragStates.set(card, state);

    card.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;

      state.pointerId = event.pointerId;
      state.startClientX = event.clientX;
      state.startClientY = event.clientY;
      state.moved = false;

      card.classList.add("is-dragging");
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", (event) => {
      if (state.pointerId !== event.pointerId) return;

      const dx = event.clientX - state.startClientX;
      const dy = event.clientY - state.startClientY;

      if (!state.moved && Math.abs(dx) + Math.abs(dy) > 6) {
        state.moved = true;
      }

      setCardDragTransform(card, dx, dy);
    });

    function release(event) {
      if (state.pointerId !== event.pointerId) return;

      state.pointerId = null;
      card.classList.remove("is-dragging");
      setCardDragTransform(card, 0, 0);
      if (card.hasPointerCapture(event.pointerId)) {
        card.releasePointerCapture(event.pointerId);
      }
    }

    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);

    card.addEventListener(
      "click",
      (event) => {
        const currentState = dragStates.get(card);
        if (currentState?.moved) {
          event.preventDefault();
          event.stopPropagation();
          currentState.moved = false;
        }
      },
      true
    );
  });
}

function start() {
  if (started) return;
  started = true;

  revealCards();
  bindLaunchpadGlow();
  bindCardDrag();
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
