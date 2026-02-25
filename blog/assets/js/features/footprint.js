import { footprintSeedRoute } from "../data/content.js";
import { STORAGE_KEYS, store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { clamp, escapeHTML, formatDateTime, safeParseJSON } from "../core/utils.js";

const statsLocationLabel = document.getElementById("statsLocationLabel");
const footprintPath = document.getElementById("footprintPath");
const footprintDots = document.getElementById("footprintDots");
const footprintList = document.getElementById("footprintList");
const footprintPulse = document.getElementById("footprintPulse");
const footprintForm = document.getElementById("footprintForm");
const footprintCityInput = document.getElementById("footprintCityInput");
const footprintClearButton = document.getElementById("footprintClear");

const FOOTPRINT_LIMIT = 50;
const DUPLICATE_DISTANCE_KM = 8;

function validCoords(value) {
  if (!value || typeof value !== "object") return null;
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function distanceKm(a, b) {
  const from = validCoords(a);
  const to = validCoords(b);
  if (!from || !to) return Number.POSITIVE_INFINITY;

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function resolveLabel(label, locale) {
  if (typeof label === "string") {
    return label;
  }

  if (label && typeof label === "object") {
    return label[locale] || label.zh || label.en || "";
  }

  return "";
}

function normalizeFootprint(item) {
  const coords = validCoords(item);
  if (!coords) return null;

  return {
    id: typeof item.id === "string" ? item.id : `fp-${Date.now()}`,
    label: item.label || "",
    latitude: coords.latitude,
    longitude: coords.longitude,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString()
  };
}

function seedRoute() {
  return footprintSeedRoute
    .map((item) => normalizeFootprint(item))
    .filter((item) => Boolean(item));
}

// Use local cache first, and fall back to the seed route if cache is missing or invalid.
function readStoredRoute() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.footprints);
    if (!raw) return seedRoute();

    const parsed = safeParseJSON(raw, []);
    if (!Array.isArray(parsed) || !parsed.length) return seedRoute();

    const points = parsed
      .map((item) => normalizeFootprint(item))
      .filter((item) => Boolean(item))
      .slice(-FOOTPRINT_LIMIT);

    return points.length ? points : seedRoute();
  } catch {
    return seedRoute();
  }
}

function persistRoute() {
  try {
    localStorage.setItem(STORAGE_KEYS.footprints, JSON.stringify(store.footprints));
  } catch {
    // ignore storage write failure
  }
}

// Project world coordinates to the mock-map viewport (0-100 viewBox).
function projectPoint(point) {
  return {
    ...point,
    x: clamp(((point.longitude + 180) / 360) * 100, 4, 96),
    y: clamp(((90 - point.latitude) / 180) * 100, 6, 94)
  };
}

function isDuplicatePoint(nextPoint) {
  return store.footprints.some((point) => distanceKm(point, nextPoint) < DUPLICATE_DISTANCE_KM);
}

// Geocode a city name to a point so the route can be extended without manual coordinates.
async function geocodeCity(cityName, locale) {
  const query = encodeURIComponent(cityName.trim());
  const resp = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=${locale}&format=json`
  );

  if (!resp.ok) {
    throw new Error("geocode request failed");
  }

  const data = await resp.json();
  const place = data && Array.isArray(data.results) ? data.results[0] : null;
  if (!place) return null;

  const city = place.name || cityName;
  const region = place.admin1 || "";
  const country = place.country || "";
  const parts = [city, region, country].filter((part, index, array) => part && array.indexOf(part) === index);
  const label = parts.join(", ");

  return {
    id: `fp-${Date.now()}`,
    label: {
      zh: label,
      en: label
    },
    latitude: place.latitude,
    longitude: place.longitude,
    createdAt: new Date().toISOString()
  };
}

function renderRoute() {
  const locale = getLocale();
  const points = store.footprints.map((point) => ({
    ...point,
    displayLabel: resolveLabel(point.label, locale)
  }));
  const projected = points.map((point) => projectPoint(point));
  const latest = projected[projected.length - 1] || null;

  if (statsLocationLabel) {
    statsLocationLabel.textContent = latest
      ? latest.displayLabel
      : t("stats.routeEmpty");
  }

  if (footprintPath) {
    footprintPath.setAttribute(
      "points",
      projected.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")
    );
    footprintPath.style.opacity = projected.length > 1 ? "1" : "0";
  }

  if (footprintDots) {
    footprintDots.innerHTML = projected
      .map((point, index) => {
        const isLatest = index === projected.length - 1;
        const radius = isLatest ? 2.2 : 1.56;
        return `<circle class="footprint-dot${isLatest ? " is-latest" : ""}" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${radius.toFixed(2)}"></circle>`;
      })
      .join("");
  }

  if (footprintPulse) {
    if (latest) {
      footprintPulse.style.opacity = "1";
      footprintPulse.style.left = `${latest.x.toFixed(2)}%`;
      footprintPulse.style.top = `${latest.y.toFixed(2)}%`;
    } else {
      footprintPulse.style.opacity = "0";
    }
  }

  if (!footprintList) return;

  if (!points.length) {
    footprintList.innerHTML = `<li class=\"footprint-empty\">${escapeHTML(t("stats.footprintEmpty"))}</li>`;
    return;
  }

  // Keep list short and newest-first for quick scanning.
  footprintList.innerHTML = points
    .slice(-8)
    .reverse()
    .map((point, index) => {
      const routeIndex = points.length - index;
      return `
        <li class="footprint-item">
          <span class="footprint-city">${routeIndex}. ${escapeHTML(point.displayLabel)}</span>
          <time class="footprint-time" datetime="${escapeHTML(point.createdAt)}">${escapeHTML(formatDateTime(point.createdAt, locale))}</time>
        </li>
      `;
    })
    .join("");
}

function bindEvents() {
  if (footprintForm && footprintCityInput) {
    footprintForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const locale = getLocale();
      const cityName = footprintCityInput.value.trim();
      if (cityName.length < 2) {
        alert(t("stats.routeAddShort"));
        return;
      }

      footprintCityInput.disabled = true;

      try {
        const point = await geocodeCity(cityName, locale);
        if (!point) {
          alert(t("stats.routeAddNotFound"));
          return;
        }

        if (isDuplicatePoint(point)) {
          alert(t("stats.routeAddDuplicate"));
          return;
        }

        store.footprints = [...store.footprints, point].slice(-FOOTPRINT_LIMIT);
        persistRoute();
        renderRoute();
        footprintCityInput.value = "";
      } catch {
        alert(t("stats.routeAddFailed"));
      } finally {
        footprintCityInput.disabled = false;
        footprintCityInput.focus();
      }
    });
  }

  if (footprintClearButton) {
    footprintClearButton.addEventListener("click", () => {
      if (!confirm(t("stats.routeClearConfirm"))) {
        return;
      }

      store.footprints = seedRoute();
      persistRoute();
      renderRoute();
    });
  }
}

export function initFootprint() {
  store.footprints = readStoredRoute();
  bindEvents();

  return {
    render: renderRoute
  };
}
