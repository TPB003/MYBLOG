import { defaultLocation } from "../data/content.js";
import { STORAGE_KEYS, store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { clamp, escapeHTML, formatDateTime, safeParseJSON, toLocaleCode } from "../core/utils.js";

const weatherLocation = document.getElementById("weatherLocation");
const weatherDesc = document.getElementById("weatherDesc");
const weatherTemp = document.getElementById("weatherTemp");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");
const weatherUpdated = document.getElementById("weatherUpdated");
const weatherSymbol = document.getElementById("weatherSymbol");
const forecastGrid = document.getElementById("forecastGrid");
const refreshButton = document.getElementById("refreshWeather");

const statsLocationLabel = document.getElementById("statsLocationLabel");
const footprintPath = document.getElementById("footprintPath");
const footprintDots = document.getElementById("footprintDots");
const footprintList = document.getElementById("footprintList");
const footprintPulse = document.getElementById("footprintPulse");

const FOOTPRINT_LIMIT = 30;
const FOOTPRINT_CITY_DISTANCE_KM = 45;
const WATCH_REFRESH_DISTANCE_KM = 5;

let cachedWeather = null;
let cachedLabel = null;
let cachedCoords = null;
let intervalId = null;
let watchId = null;
let isRefreshing = false;
let lastGeoErrorCode = null;
let lastWeatherFetchAt = 0;
let lastWeatherFetchCoords = null;

const weatherCodeTextMap = {
  0: { zh: "晴", en: "Clear" },
  1: { zh: "大致晴", en: "Mainly clear" },
  2: { zh: "局部多云", en: "Partly cloudy" },
  3: { zh: "阴", en: "Overcast" },
  45: { zh: "雾", en: "Fog" },
  48: { zh: "霜雾", en: "Rime fog" },
  51: { zh: "毛毛雨", en: "Drizzle" },
  53: { zh: "中毛毛雨", en: "Moderate drizzle" },
  55: { zh: "强毛毛雨", en: "Dense drizzle" },
  61: { zh: "小雨", en: "Slight rain" },
  63: { zh: "中雨", en: "Rain" },
  65: { zh: "大雨", en: "Heavy rain" },
  71: { zh: "小雪", en: "Slight snow" },
  73: { zh: "中雪", en: "Snow" },
  75: { zh: "大雪", en: "Heavy snow" },
  80: { zh: "阵雨", en: "Rain showers" },
  81: { zh: "中阵雨", en: "Moderate showers" },
  82: { zh: "强阵雨", en: "Violent showers" },
  95: { zh: "雷暴", en: "Thunderstorm" }
};

const weatherCodeIconMap = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️"
};

function weatherCodeText(code, locale) {
  const entry = weatherCodeTextMap[code];
  if (!entry) return locale === "zh" ? "未知" : "Unknown";
  return entry[locale] || entry.zh;
}

function weatherCodeIcon(code) {
  return weatherCodeIconMap[code] || "⛅";
}

function dayLabel(dateString, index, locale) {
  if (index === 0) {
    return t("weather.today");
  }

  return new Intl.DateTimeFormat(toLocaleCode(locale), {
    weekday: "short"
  }).format(new Date(dateString));
}

function setLoading(isLoading) {
  if (!refreshButton) return;
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? `${t("weather.refresh")}...` : t("weather.refresh");
}

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

function formatCoordsLabel(latitude, longitude) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

function locationKey(point) {
  const city = String(point.label || "")
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (city) {
    return `city:${city}`;
  }

  return `coord:${point.latitude.toFixed(1)},${point.longitude.toFixed(1)}`;
}

function readStoredCoords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.weatherCoords);
    if (!raw) return null;
    return validCoords(safeParseJSON(raw, null));
  } catch {
    return null;
  }
}

function persistCoords() {
  try {
    if (!store.weatherCoords) return;
    localStorage.setItem(STORAGE_KEYS.weatherCoords, JSON.stringify(store.weatherCoords));
  } catch {
    // ignore storage write failure
  }
}

function setStoredCoords(coords) {
  const normalized = validCoords(coords);
  if (!normalized) return;
  store.weatherCoords = normalized;
  persistCoords();
}

function normalizeFootprint(item) {
  const coords = validCoords(item);
  if (!coords) return null;

  const createdAt = typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString();
  const label = typeof item.label === "string" && item.label.trim()
    ? item.label.trim()
    : formatCoordsLabel(coords.latitude, coords.longitude);

  return {
    id: typeof item.id === "string" ? item.id : `fp-${createdAt}`,
    latitude: coords.latitude,
    longitude: coords.longitude,
    label,
    createdAt
  };
}

function readStoredFootprints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.footprints);
    if (!raw) return [];

    const parsed = safeParseJSON(raw, []);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeFootprint(item))
      .filter((item) => Boolean(item))
      .slice(-FOOTPRINT_LIMIT);
  } catch {
    return [];
  }
}

function persistFootprints() {
  try {
    localStorage.setItem(STORAGE_KEYS.footprints, JSON.stringify(store.footprints));
  } catch {
    // ignore storage write failure
  }
}

function syncLatestFootprintCoords(coords) {
  const normalized = validCoords(coords);
  if (!normalized || !Array.isArray(store.footprints) || !store.footprints.length) {
    return;
  }

  const next = [...store.footprints];
  const latest = next[next.length - 1];
  next[next.length - 1] = {
    ...latest,
    latitude: normalized.latitude,
    longitude: normalized.longitude
  };
  store.footprints = next;
  persistFootprints();
}

function upsertFootprint(coords, label) {
  const normalized = validCoords(coords);
  if (!normalized) return;

  const normalizedLabel = typeof label === "string" && label.trim()
    ? label.trim()
    : formatCoordsLabel(normalized.latitude, normalized.longitude);

  const point = {
    id: `fp-${Date.now()}`,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    label: normalizedLabel,
    createdAt: new Date().toISOString()
  };

  const history = Array.isArray(store.footprints) ? [...store.footprints] : [];
  const latest = history[history.length - 1];

  if (!latest) {
    store.footprints = [point];
    persistFootprints();
    return;
  }

  const movedFar = distanceKm(latest, point) >= FOOTPRINT_CITY_DISTANCE_KM;
  const movedCity = locationKey(latest) !== locationKey(point);

  if (movedFar || movedCity) {
    history.push(point);
    store.footprints = history.slice(-FOOTPRINT_LIMIT);
  } else {
    history[history.length - 1] = {
      ...latest,
      latitude: point.latitude,
      longitude: point.longitude,
      label: point.label
    };
    store.footprints = history;
  }

  persistFootprints();
}

function projectPoint(point) {
  return {
    ...point,
    x: clamp(((point.longitude + 180) / 360) * 100, 4, 96),
    y: clamp(((90 - point.latitude) / 180) * 100, 6, 94)
  };
}

function renderFootprints() {
  const points = Array.isArray(store.footprints) ? store.footprints : [];
  const projected = points.map((point) => projectPoint(point));
  const latest = projected[projected.length - 1] || null;
  const locale = getLocale();

  if (statsLocationLabel) {
    const latestLabel = points.length ? points[points.length - 1].label : null;
    statsLocationLabel.textContent = cachedLabel || latestLabel || t("stats.locationPending");
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
        const radius = isLatest ? 2.16 : 1.56;
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

  footprintList.innerHTML = points
    .slice(-6)
    .reverse()
    .map((point) => {
      return `
        <li class="footprint-item">
          <span class="footprint-city">${escapeHTML(point.label)}</span>
          <time class="footprint-time" datetime="${escapeHTML(point.createdAt)}">${escapeHTML(formatDateTime(point.createdAt, locale))}</time>
        </li>
      `;
    })
    .join("");
}

async function resolveCoords(force = false) {
  if (!force && store.weatherCoords) {
    return { coords: store.weatherCoords, source: "cache" };
  }

  if (!("geolocation" in navigator)) {
    return {
      coords: {
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude
      },
      source: "fallback"
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setStoredCoords(coords);
        lastGeoErrorCode = null;
        resolve({ coords, source: "device" });
      },
      (error) => {
        lastGeoErrorCode = error && typeof error.code === "number" ? error.code : null;
        if (store.weatherCoords) {
          resolve({ coords: store.weatherCoords, source: "cache" });
          return;
        }

        resolve({
          coords: {
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude
          },
          source: "fallback"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: force ? 0 : 5 * 60 * 1000
      }
    );
  });
}

async function reverseGeocode(latitude, longitude) {
  const locale = getLocale();

  try {
    const resp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${locale}&count=1`
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const place = data && Array.isArray(data.results) ? data.results[0] : null;
    if (!place) return null;

    const city = place.name || "";
    const region = place.admin1 || "";
    const country = place.country || "";
    const parts = [city, region, country].filter((part, index, array) => part && array.indexOf(part) === index);
    return parts.length ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error("weather request failed");
  }

  return resp.json();
}

function renderForecast(daily, locale) {
  if (!forecastGrid) return;

  const times = daily.time || [];
  const max = daily.temperature_2m_max || [];
  const min = daily.temperature_2m_min || [];
  const codes = daily.weather_code || [];

  if (!times.length) {
    forecastGrid.innerHTML = `<p class=\"kb-empty\">${t("weather.noData")}</p>`;
    return;
  }

  forecastGrid.innerHTML = times
    .map((dateString, index) => {
      const code = codes[index];
      const maxTemp = typeof max[index] === "number" ? Math.round(max[index]) : "--";
      const minTemp = typeof min[index] === "number" ? Math.round(min[index]) : "--";

      return `
        <article class="forecast-item">
          <p class="forecast-day">${dayLabel(dateString, index, locale)}</p>
          <p class="forecast-icon">${weatherCodeIcon(code)}</p>
          <p class="forecast-code">${weatherCodeText(code, locale)}</p>
          <p class="forecast-range">${maxTemp}° / ${minTemp}°</p>
        </article>
      `;
    })
    .join("");
}

function metric(value) {
  return Number.isFinite(value) ? String(Math.round(value)) : "--";
}

function renderWeather() {
  renderFootprints();

  if (!cachedWeather || !weatherLocation || !weatherDesc) {
    return;
  }

  const locale = getLocale();
  const current = cachedWeather.current || {};

  weatherLocation.textContent = cachedLabel || (cachedCoords ? formatCoordsLabel(cachedCoords.latitude, cachedCoords.longitude) : t("weather.loadingLocation"));
  weatherDesc.textContent = weatherCodeText(current.weather_code, locale);
  weatherTemp.textContent = metric(current.temperature_2m);
  weatherHumidity.textContent = metric(current.relative_humidity_2m);
  weatherWind.textContent = metric(current.wind_speed_10m);
  weatherUpdated.textContent = current.time ? formatDateTime(current.time, locale) : "--";
  if (weatherSymbol) {
    weatherSymbol.textContent = weatherCodeIcon(current.weather_code);
  }

  renderForecast(cachedWeather.daily || {}, locale);
}

function shouldRefreshFromWatch(nextCoords) {
  if (!cachedWeather || !lastWeatherFetchCoords) {
    return true;
  }

  const elapsed = Date.now() - lastWeatherFetchAt;
  if (elapsed > 20 * 60 * 1000) {
    return true;
  }

  return distanceKm(lastWeatherFetchCoords, nextCoords) >= WATCH_REFRESH_DISTANCE_KM && elapsed > 2 * 60 * 1000;
}

function startLocationWatch() {
  if (watchId !== null || !("geolocation" in navigator)) {
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      lastGeoErrorCode = null;
      cachedCoords = nextCoords;

      if (!store.weatherCoords || distanceKm(store.weatherCoords, nextCoords) > 0.1) {
        setStoredCoords(nextCoords);
      }

      if (shouldRefreshFromWatch(nextCoords)) {
        refreshWeather(false, nextCoords, "device");
      } else {
        syncLatestFootprintCoords(nextCoords);
        renderFootprints();
      }
    },
    (error) => {
      lastGeoErrorCode = error && typeof error.code === "number" ? error.code : null;
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60 * 1000
    }
  );
}

function hydrateStateFromStorage() {
  const savedCoords = readStoredCoords();
  if (savedCoords) {
    store.weatherCoords = savedCoords;
    cachedCoords = savedCoords;
  }

  store.footprints = readStoredFootprints();
  if (store.footprints.length) {
    const latest = store.footprints[store.footprints.length - 1];
    if (latest && typeof latest.label === "string" && latest.label) {
      cachedLabel = latest.label;
    }
  }
}

async function resolveDisplayLabel(coords, source) {
  const coordsLabel = formatCoordsLabel(coords.latitude, coords.longitude);

  if (source === "fallback") {
    if (lastGeoErrorCode === 1) {
      return {
        displayLabel: t("weather.locationDenied"),
        trackLabel: null
      };
    }

    return {
      displayLabel: `${t("weather.locationFallback")} (${coordsLabel})`,
      trackLabel: null
    };
  }

  const place = await reverseGeocode(coords.latitude, coords.longitude);
  const label = place || coordsLabel;

  return {
    displayLabel: label,
    trackLabel: label
  };
}

async function refreshWeather(force = false, injectedCoords = null, injectedSource = null) {
  if (!weatherLocation || !weatherDesc || isRefreshing) return;

  isRefreshing = true;
  setLoading(true);
  weatherDesc.textContent = t("weather.loadingDesc");

  try {
    const resolved = injectedCoords
      ? { coords: injectedCoords, source: injectedSource || "device" }
      : await resolveCoords(force);

    const coords = validCoords(resolved.coords);
    if (!coords) {
      throw new Error("invalid coords");
    }

    cachedCoords = coords;
    if (resolved.source !== "fallback") {
      setStoredCoords(coords);
    }

    const weather = await fetchWeather(coords.latitude, coords.longitude);
    const { displayLabel, trackLabel } = await resolveDisplayLabel(coords, resolved.source);

    cachedWeather = weather;
    cachedLabel = displayLabel;
    lastWeatherFetchAt = Date.now();
    lastWeatherFetchCoords = coords;

    if (trackLabel) {
      upsertFootprint(coords, trackLabel);
    }

    renderWeather();
  } catch {
    weatherLocation.textContent = t("weather.failedLocation");
    weatherDesc.textContent = t("weather.failedDesc");
    weatherTemp.textContent = "--";
    weatherHumidity.textContent = "--";
    weatherWind.textContent = "--";
    weatherUpdated.textContent = "--";
    if (weatherSymbol) {
      weatherSymbol.textContent = "⚠️";
    }
    renderFootprints();
  } finally {
    setLoading(false);
    isRefreshing = false;
  }
}

function bindEvents() {
  if (!refreshButton) return;

  refreshButton.addEventListener("click", () => {
    refreshWeather(true);
  });
}

export function initWeather() {
  hydrateStateFromStorage();
  bindEvents();
  startLocationWatch();

  if (!intervalId) {
    intervalId = window.setInterval(() => {
      refreshWeather(false);
    }, 30 * 60 * 1000);
  }

  return {
    render: renderWeather,
    refresh: refreshWeather
  };
}
