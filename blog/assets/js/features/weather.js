import { defaultLocation } from "../data/content.js";
import { store } from "../core/store.js";
import { getLocale, t } from "../core/i18n.js";
import { formatDateTime, toLocaleCode } from "../core/utils.js";

const weatherLocation = document.getElementById("weatherLocation");
const weatherDesc = document.getElementById("weatherDesc");
const weatherTemp = document.getElementById("weatherTemp");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");
const weatherUpdated = document.getElementById("weatherUpdated");
const weatherSymbol = document.getElementById("weatherSymbol");
const forecastGrid = document.getElementById("forecastGrid");
const refreshButton = document.getElementById("refreshWeather");

let cachedWeather = null;
let cachedLabel = null;
let intervalId = null;

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

async function resolveCoords(force = false) {
  if (!force && store.weatherCoords) {
    return store.weatherCoords;
  }

  if (!("geolocation" in navigator)) {
    store.weatherCoords = {
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude
    };
    return store.weatherCoords;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        store.weatherCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        resolve(store.weatherCoords);
      },
      () => {
        store.weatherCoords = {
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude
        };
        resolve(store.weatherCoords);
      },
      {
        timeout: 8000,
        maximumAge: 10 * 60 * 1000
      }
    );
  });
}

async function reverseGeocode(latitude, longitude) {
  const locale = getLocale();

  try {
    const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${locale}&count=1`);
    if (!resp.ok) return null;

    const data = await resp.json();
    const place = data && Array.isArray(data.results) ? data.results[0] : null;
    if (!place) return null;

    const city = place.name || "";
    const region = place.admin1 || "";
    return region ? `${city}, ${region}` : city;
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

function renderWeather() {
  if (!cachedWeather || !weatherLocation || !weatherDesc) {
    return;
  }

  const locale = getLocale();
  const current = cachedWeather.current;

  weatherLocation.textContent = cachedLabel || defaultLocation.label[locale] || defaultLocation.label.zh;
  weatherDesc.textContent = weatherCodeText(current.weather_code, locale);
  weatherTemp.textContent = Math.round(current.temperature_2m);
  weatherHumidity.textContent = Math.round(current.relative_humidity_2m);
  weatherWind.textContent = Math.round(current.wind_speed_10m);
  weatherUpdated.textContent = formatDateTime(current.time, locale);
  if (weatherSymbol) {
    weatherSymbol.textContent = weatherCodeIcon(current.weather_code);
  }

  renderForecast(cachedWeather.daily || {}, locale);
}

async function refreshWeather(force = false) {
  if (!weatherLocation || !weatherDesc) return;

  setLoading(true);
  weatherDesc.textContent = t("weather.loadingDesc");

  try {
    const coords = await resolveCoords(force);
    const weather = await fetchWeather(coords.latitude, coords.longitude);
    const label = await reverseGeocode(coords.latitude, coords.longitude);

    cachedWeather = weather;
    const locale = getLocale();
    cachedLabel = label || defaultLocation.label[locale] || defaultLocation.label.zh;

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
  } finally {
    setLoading(false);
  }
}

function bindEvents() {
  if (!refreshButton) return;

  refreshButton.addEventListener("click", () => {
    refreshWeather(true);
  });
}

export function initWeather() {
  bindEvents();

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
