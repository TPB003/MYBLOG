const posts = [
  {
    title: "我把博客首页重构成了信息分层式布局",
    excerpt: "通过导航、叙事区和功能区分离，让访问者在 5 秒内理解我是谁、我写什么。",
    date: "2026-02-24",
    category: "tech",
    tag: "TECH",
    tone: "accent-light",
    size: "large",
    reading: "6 min read"
  },
  {
    title: "创作系统复盘：连续写作 100 天之后",
    excerpt: "复盘输入、写作、发布、反馈四个环节中真正有效的动作，砍掉伪努力。",
    date: "2026-02-20",
    category: "life",
    tag: "LIFE",
    tone: "accent-dark",
    size: "medium",
    reading: "5 min read"
  },
  {
    title: "我的前端性能清单（2026 版）",
    excerpt: "从加载策略、图片压缩到交互延迟监控，列出我实际在项目里执行的 checklist。",
    date: "2026-02-17",
    category: "tech",
    tag: "TECH",
    tone: "accent-orange",
    size: "small",
    reading: "7 min read"
  },
  {
    title: "读书笔记：如何把抽象知识转成可执行步骤",
    excerpt: "我把每本书拆成“原理 / 模板 / 场景”三层，确保读完就能用。",
    date: "2026-02-14",
    category: "notes",
    tag: "NOTES",
    tone: "accent-light",
    size: "small",
    reading: "4 min read"
  },
  {
    title: "产品和内容的共同点：先建立可复用框架",
    excerpt: "无论是写文章还是做页面，先做框架再做细节，稳定性会高很多。",
    date: "2026-02-10",
    category: "notes",
    tag: "NOTES",
    tone: "accent-dark",
    size: "wide",
    reading: "6 min read"
  },
  {
    title: "一个更现实的周计划系统",
    excerpt: "我不再做“完美计划”，而是做可以在现实里持续运行的最小系统。",
    date: "2026-02-08",
    category: "life",
    tag: "LIFE",
    tone: "accent-light",
    size: "small",
    reading: "3 min read"
  }
];

const knowledgeItems = [
  {
    title: "SSR 与 SSG 选择原则",
    summary: "内容变化频率低、以 SEO 为主时优先 SSG；需要实时性和个性化时使用 SSR。",
    tags: ["Web", "架构", "SEO"],
    updated: "2026-02-24"
  },
  {
    title: "前端性能排查顺序",
    summary: "先看关键渲染路径，再查图片体积、字体加载、第三方脚本和长任务来源。",
    tags: ["性能", "Web", "调优"],
    updated: "2026-02-23"
  },
  {
    title: "复盘模板（周）",
    summary: "本周目标、关键事实、偏差原因、下周调整四段式，避免空泛总结。",
    tags: ["复盘", "效率", "模板"],
    updated: "2026-02-22"
  },
  {
    title: "写作流程 3 步法",
    summary: "先列框架，再补案例，最后压缩句子，把每篇文章控制在一个核心观点。",
    tags: ["写作", "内容", "方法"],
    updated: "2026-02-21"
  },
  {
    title: "知识卡片命名规范",
    summary: "统一采用“主题-问题-结论”命名，如：缓存-何时失效-按业务事件驱动刷新。",
    tags: ["知识库", "规范", "方法"],
    updated: "2026-02-20"
  },
  {
    title: "技术选型检查清单",
    summary: "评估生态、维护成本、团队熟悉度和迁移风险，避免仅凭热度决策。",
    tags: ["架构", "决策", "团队"],
    updated: "2026-02-19"
  }
];

const seedIdeas = [
  {
    id: "seed-1",
    content: "内容是长期资产，代码是内容的放大器。两者应该同步迭代。",
    mood: "思考",
    createdAt: "2026-02-24T09:30:00+08:00"
  },
  {
    id: "seed-2",
    content: "今天给每个知识卡增加了标签体系，检索体验立刻提升。",
    mood: "记录",
    createdAt: "2026-02-24T16:40:00+08:00"
  }
];

const IDEA_STORAGE_KEY = "tpblog_idea_stream_v1";
const DEFAULT_COORDS = {
  latitude: 31.299,
  longitude: 120.585,
  label: "Suzhou, China"
};

let activeKnowledgeTag = "all";
let weatherCoords = null;
let userIdeas = loadLocalIdeas();

const postGrid = document.getElementById("postGrid");
const chipWrap = document.getElementById("chips");
const countUpNode = document.getElementById("countUp");

const knowledgeSearch = document.getElementById("knowledgeSearch");
const knowledgeTags = document.getElementById("knowledgeTags");
const knowledgeGrid = document.getElementById("knowledgeGrid");
const knowledgeCount = document.getElementById("knowledgeCount");

const ideaForm = document.getElementById("ideaForm");
const ideaInput = document.getElementById("ideaInput");
const ideaMood = document.getElementById("ideaMood");
const ideaList = document.getElementById("ideaList");
const clearIdeasBtn = document.getElementById("clearIdeas");

const weatherLocation = document.getElementById("weatherLocation");
const weatherDesc = document.getElementById("weatherDesc");
const weatherTemp = document.getElementById("weatherTemp");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");
const weatherUpdated = document.getElementById("weatherUpdated");
const forecastGrid = document.getElementById("forecastGrid");
const refreshWeatherBtn = document.getElementById("refreshWeather");

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPosts(filter = "all") {
  if (!postGrid) return;

  const list = filter === "all" ? posts : posts.filter((post) => post.category === filter);
  postGrid.innerHTML = "";

  if (!list.length) {
    postGrid.innerHTML = "<p class='empty'>该分类暂时还没有内容。</p>";
    return;
  }

  list.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = `post-card ${post.tone} ${post.size}`;

    card.innerHTML = `
      <div class="post-top">
        <span class="post-tag">${escapeHTML(post.tag)}</span>
        <time class="post-date" datetime="${escapeHTML(post.date)}">${formatDate(post.date)}</time>
      </div>
      <div>
        <h3 class="post-title">${escapeHTML(post.title)}</h3>
        <p class="post-excerpt">${escapeHTML(post.excerpt)}</p>
      </div>
      <div class="post-foot">${escapeHTML(post.reading)}</div>
    `;

    postGrid.appendChild(card);

    setTimeout(() => {
      card.classList.add("ready");
    }, 70 * index);
  });
}

function buildKnowledgeTags() {
  if (!knowledgeTags) return;

  const tags = Array.from(
    new Set(
      knowledgeItems.flatMap((item) => item.tags)
    )
  );

  const buttons = [
    `<button type=\"button\" class=\"k-tag active\" data-tag=\"all\">全部</button>`
  ];

  tags.forEach((tag) => {
    buttons.push(`<button type=\"button\" class=\"k-tag\" data-tag=\"${escapeHTML(tag)}\">${escapeHTML(tag)}</button>`);
  });

  knowledgeTags.innerHTML = buttons.join("");
}

function filterKnowledge() {
  const keyword = knowledgeSearch ? knowledgeSearch.value.trim().toLowerCase() : "";

  return knowledgeItems.filter((item) => {
    const byTag = activeKnowledgeTag === "all" || item.tags.includes(activeKnowledgeTag);
    const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
    const byKeyword = !keyword || haystack.includes(keyword);
    return byTag && byKeyword;
  });
}

function renderKnowledge() {
  if (!knowledgeGrid) return;

  const list = filterKnowledge();
  if (knowledgeCount) {
    knowledgeCount.textContent = String(list.length);
  }

  if (!list.length) {
    knowledgeGrid.innerHTML = "<p class='kb-empty'>没有找到相关知识卡，试试更短关键词或切换标签。</p>";
    return;
  }

  knowledgeGrid.innerHTML = list
    .map((item) => {
      const badges = item.tags
        .map((tag) => `<span class=\"kb-badge\">${escapeHTML(tag)}</span>`)
        .join("");

      return `
        <article class="kb-card">
          <h3>${escapeHTML(item.title)}</h3>
          <p class="kb-summary">${escapeHTML(item.summary)}</p>
          <div class="kb-meta">
            <time datetime="${escapeHTML(item.updated)}">更新于 ${formatDate(item.updated)}</time>
            <div class="kb-badges">${badges}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function loadLocalIdeas() {
  try {
    const raw = localStorage.getItem(IDEA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLocalIdeas() {
  try {
    localStorage.setItem(IDEA_STORAGE_KEY, JSON.stringify(userIdeas));
  } catch {
    // Ignore localStorage write errors.
  }
}

function renderIdeas() {
  if (!ideaList) return;

  const allIdeas = [...userIdeas, ...seedIdeas];

  if (!allIdeas.length) {
    ideaList.innerHTML = "<li class='idea-empty'>还没有想法，写下第一条吧。</li>";
    return;
  }

  ideaList.innerHTML = allIdeas
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => `
      <li class="idea-item">
        <div class="idea-item-top">
          <span class="idea-item-tag">${escapeHTML(item.mood)}</span>
          <time class="idea-item-time" datetime="${escapeHTML(item.createdAt)}">${formatDateTime(item.createdAt)}</time>
        </div>
        <p>${escapeHTML(item.content)}</p>
      </li>
    `)
    .join("");
}

function weatherCodeToText(code) {
  const map = {
    0: "晴",
    1: "大致晴",
    2: "局部多云",
    3: "阴",
    45: "雾",
    48: "霜雾",
    51: "毛毛雨",
    53: "中等毛毛雨",
    55: "强毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "阵雨",
    81: "中阵雨",
    82: "强阵雨",
    95: "雷暴"
  };

  return map[code] || "未知";
}

function getDayLabel(dateString, index) {
  if (index === 0) return "今天";
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(dateString));
}

function setWeatherLoading(isLoading) {
  if (!refreshWeatherBtn) return;

  refreshWeatherBtn.disabled = isLoading;
  refreshWeatherBtn.textContent = isLoading ? "更新中..." : "刷新";
}

async function resolveCoords() {
  if (weatherCoords) return weatherCoords;

  if (!("geolocation" in navigator)) {
    weatherCoords = { ...DEFAULT_COORDS };
    return weatherCoords;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        weatherCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "当前位置"
        };
        resolve(weatherCoords);
      },
      () => {
        weatherCoords = { ...DEFAULT_COORDS };
        resolve(weatherCoords);
      },
      {
        timeout: 8000,
        maximumAge: 10 * 60 * 1000
      }
    );
  });
}

async function fetchLocationLabel(lat, lon) {
  try {
    const resp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=zh&count=1`
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const first = data && Array.isArray(data.results) ? data.results[0] : null;
    if (!first) return null;

    const name = first.name || "当前位置";
    const admin = first.admin1 || "";
    return admin ? `${name}, ${admin}` : name;
  } catch {
    return null;
  }
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error("Weather request failed");
  }
  return resp.json();
}

function renderForecast(daily) {
  if (!forecastGrid) return;

  const times = daily.time || [];
  const max = daily.temperature_2m_max || [];
  const min = daily.temperature_2m_min || [];
  const codes = daily.weather_code || [];

  if (!times.length) {
    forecastGrid.innerHTML = "<p class='kb-empty'>暂无预报数据</p>";
    return;
  }

  forecastGrid.innerHTML = times
    .map((dateString, index) => {
      const maxTemp = typeof max[index] === "number" ? Math.round(max[index]) : "--";
      const minTemp = typeof min[index] === "number" ? Math.round(min[index]) : "--";
      return `
        <article class="forecast-item">
          <p class="forecast-day">${getDayLabel(dateString, index)}</p>
          <p class="forecast-code">${weatherCodeToText(codes[index])}</p>
          <p class="forecast-range">${maxTemp}° / ${minTemp}°</p>
        </article>
      `;
    })
    .join("");
}

async function refreshWeather(forceRelocate = false) {
  if (!weatherLocation || !weatherDesc) return;

  if (forceRelocate) {
    weatherCoords = null;
  }

  setWeatherLoading(true);
  weatherDesc.textContent = "正在读取实时天气...";

  try {
    const coords = await resolveCoords();
    const weather = await fetchWeather(coords.latitude, coords.longitude);

    const maybeLabel = await fetchLocationLabel(coords.latitude, coords.longitude);
    const locationLabel = maybeLabel || coords.label || DEFAULT_COORDS.label;

    const current = weather.current;
    weatherLocation.textContent = locationLabel;
    weatherDesc.textContent = weatherCodeToText(current.weather_code);
    weatherTemp.textContent = Math.round(current.temperature_2m);
    weatherHumidity.textContent = Math.round(current.relative_humidity_2m);
    weatherWind.textContent = Math.round(current.wind_speed_10m);
    weatherUpdated.textContent = formatDateTime(current.time);

    renderForecast(weather.daily || {});
  } catch {
    weatherLocation.textContent = "天气读取失败";
    weatherDesc.textContent = "请检查网络后点击刷新";
    weatherTemp.textContent = "--";
    weatherHumidity.textContent = "--";
    weatherWind.textContent = "--";
    weatherUpdated.textContent = "--";
  } finally {
    setWeatherLoading(false);
  }
}

function animateCount() {
  if (!countUpNode) return;

  const target = 596000;
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(target * progress);
    countUpNode.textContent = value.toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

if (chipWrap) {
  chipWrap.addEventListener("click", (event) => {
    const target = event.target.closest(".chip");
    if (!target) return;

    document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    target.classList.add("active");

    renderPosts(target.dataset.filter || "all");
  });
}

if (knowledgeTags) {
  knowledgeTags.addEventListener("click", (event) => {
    const target = event.target.closest(".k-tag");
    if (!target) return;

    activeKnowledgeTag = target.dataset.tag || "all";

    knowledgeTags.querySelectorAll(".k-tag").forEach((item) => item.classList.remove("active"));
    target.classList.add("active");

    renderKnowledge();
  });
}

if (knowledgeSearch) {
  knowledgeSearch.addEventListener("input", () => {
    renderKnowledge();
  });
}

if (ideaForm && ideaInput && ideaMood) {
  ideaForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const content = ideaInput.value.trim();
    if (content.length < 4) {
      alert("想法至少输入 4 个字。")
      return;
    }

    userIdeas.unshift({
      id: String(Date.now()),
      content,
      mood: ideaMood.value,
      createdAt: new Date().toISOString()
    });

    userIdeas = userIdeas.slice(0, 80);
    saveLocalIdeas();
    renderIdeas();

    ideaInput.value = "";
    ideaInput.focus();
  });
}

if (clearIdeasBtn) {
  clearIdeasBtn.addEventListener("click", () => {
    if (!confirm("确认清空你在本浏览器中的想法记录吗？")) {
      return;
    }

    userIdeas = [];
    saveLocalIdeas();
    renderIdeas();
  });
}

if (refreshWeatherBtn) {
  refreshWeatherBtn.addEventListener("click", () => {
    refreshWeather(true);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

renderPosts();
buildKnowledgeTags();
renderKnowledge();
renderIdeas();
animateCount();
refreshWeather();

setInterval(() => {
  refreshWeather(false);
}, 30 * 60 * 1000);
