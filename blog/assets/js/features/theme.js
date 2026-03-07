import { getLocale, t } from "../core/i18n.js";
import { toLocaleCode } from "../core/utils.js";

const root = document.documentElement;
const themeModeChip = document.getElementById("themeModeChip");
const liveClockChip = document.getElementById("liveClockChip");
const dashboardGreeting = document.getElementById("dashboardGreeting");
const dashboardDate = document.getElementById("dashboardDate");
const dashboardTime = document.getElementById("dashboardTime");
const dashboardScene = document.getElementById("dashboardScene");

let timerId = null;

function resolveTheme(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
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
  const theme = resolveTheme(hour);

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
}

export function initTheme() {
  renderTheme();

  if (!timerId) {
    timerId = window.setInterval(renderTheme, 30 * 1000);
  }

  return {
    render: renderTheme
  };
}
