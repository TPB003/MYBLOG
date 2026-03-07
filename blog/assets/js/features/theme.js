import { getLocale, t } from "../core/i18n.js";
import { STORAGE_KEYS } from "../core/store.js";
import { toLocaleCode } from "../core/utils.js";

const root = document.documentElement;
const themeModeChip = document.getElementById("themeModeChip");
const liveClockChip = document.getElementById("liveClockChip");
const dashboardGreeting = document.getElementById("dashboardGreeting");
const dashboardDate = document.getElementById("dashboardDate");
const dashboardTime = document.getElementById("dashboardTime");
const dashboardScene = document.getElementById("dashboardScene");

const THEME_PREFS = ["auto", "day", "night"];

let timerId = null;
let themePreference = "auto";
let themeToggleButton = null;

function resolveTheme(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
}

function isThemePreference(value) {
  return THEME_PREFS.includes(value);
}

function resolveActiveTheme(hour) {
  if (themePreference === "day" || themePreference === "night") {
    return themePreference;
  }

  return resolveTheme(hour);
}

function readThemePreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.themePreference);
    return isThemePreference(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

function saveThemePreference(nextPreference) {
  try {
    localStorage.setItem(STORAGE_KEYS.themePreference, nextPreference);
  } catch {
    // ignore storage write failure
  }
}

function nextPreference(currentPreference) {
  if (currentPreference === "auto") return "day";
  if (currentPreference === "day") return "night";
  return "auto";
}

function modeText(mode) {
  if (mode === "day") return t("theme.dayShort");
  if (mode === "night") return t("theme.nightShort");
  return t("theme.autoShort");
}

function modeHint(mode) {
  if (mode === "day") return t("theme.toggleHintDay");
  if (mode === "night") return t("theme.toggleHintNight");
  return t("theme.toggleHintAuto");
}

function renderThemeToggle() {
  if (!themeToggleButton) return;

  themeToggleButton.textContent = modeText(themePreference);
  const hint = modeHint(themePreference);
  themeToggleButton.setAttribute("aria-label", hint);
  themeToggleButton.setAttribute("title", hint);
  themeToggleButton.dataset.mode = themePreference;
}

function greetingKey(hour) {
  if (hour >= 5 && hour < 12) return "dashboard.greetMorning";
  if (hour >= 12 && hour < 18) return "dashboard.greetAfternoon";
  if (hour >= 18 && hour < 22) return "dashboard.greetEvening";
  return "dashboard.greetNight";
}

function formatClock(now, locale) {
  return new Intl.DateTimeFormat(toLocaleCode(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);
}

function formatDate(now, locale) {
  return new Intl.DateTimeFormat(toLocaleCode(locale), {
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(now);
}

function renderTheme() {
  const now = new Date();
  const locale = getLocale();
  const hour = now.getHours();
  const theme = resolveActiveTheme(hour);

  root.dataset.theme = theme;

  if (themeModeChip) {
    themeModeChip.textContent = theme === "day" ? t("theme.day") : t("theme.night");
  }

  const clock = formatClock(now, locale);
  if (liveClockChip) {
    liveClockChip.textContent = clock;
  }
  if (dashboardTime) {
    dashboardTime.textContent = clock;
  }
  if (dashboardDate) {
    dashboardDate.textContent = formatDate(now, locale);
  }
  if (dashboardGreeting) {
    dashboardGreeting.textContent = t(greetingKey(hour));
  }
  if (dashboardScene) {
    dashboardScene.textContent = theme === "day" ? t("dashboard.sceneDay") : t("dashboard.sceneNight");
  }

  renderThemeToggle();
}

function toggleThemePreference() {
  themePreference = nextPreference(themePreference);
  saveThemePreference(themePreference);
  renderTheme();
}

export function initTheme(button) {
  themeToggleButton = button || null;
  themePreference = readThemePreference();

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleThemePreference);
  }

  renderTheme();

  if (!timerId) {
    timerId = window.setInterval(renderTheme, 30 * 1000);
  }

  return {
    render: renderTheme
  };
}
