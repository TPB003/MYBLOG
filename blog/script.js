const posts = [
  {
    title: "我把博客速度优化了 43%，只做了三件事",
    excerpt: "从图片策略、字体加载到 CSS 拆分，一次完整的性能复盘。",
    date: "2026-02-16",
    category: "tech",
    tagText: "TECH"
  },
  {
    title: "凌晨四点的城市，和我新建立的晨间写作流程",
    excerpt: "记录一个 30 天可持续的创作习惯，附可执行模板。",
    date: "2026-02-10",
    category: "life",
    tagText: "LIFE"
  },
  {
    title: "《设计心理学》读书摘记：界面为什么会让人犹豫",
    excerpt: "把书里的原则拆成可直接用于产品设计的检查清单。",
    date: "2026-01-28",
    category: "notes",
    tagText: "NOTES"
  },
  {
    title: "用 CSS Grid 做杂志风首页布局",
    excerpt: "不靠 UI 组件库，用原生 CSS 打造强视觉信息层级。",
    date: "2026-01-18",
    category: "tech",
    tagText: "TECH"
  },
  {
    title: "如何让输入焦虑变成可交付成果",
    excerpt: "整理我的知识管理系统：收藏、整理、输出三段式。",
    date: "2026-01-11",
    category: "life",
    tagText: "LIFE"
  },
  {
    title: "我在 Notion 里维护的周复盘模板",
    excerpt: "模板重点不是记录，而是如何让下周的计划更精准。",
    date: "2025-12-30",
    category: "notes",
    tagText: "NOTES"
  }
];

const postGrid = document.getElementById("postGrid");
const chipWrap = document.getElementById("chips");

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function renderPosts(filter = "all") {
  postGrid.innerHTML = "";
  const list = filter === "all" ? posts : posts.filter((post) => post.category === filter);

  if (!list.length) {
    postGrid.innerHTML = "<p>这个分类暂时还没有内容。</p>";
    return;
  }

  list.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.style.opacity = "0";
    card.style.transform = "translateY(14px)";
    card.style.transition = "opacity 0.45s ease, transform 0.45s ease";
    card.innerHTML = `
      <div class="post-meta">
        <span class="tag">${post.tagText}</span>
        <span class="date">${formatDate(post.date)}</span>
      </div>
      <h3 class="post-title">${post.title}</h3>
      <p class="post-excerpt">${post.excerpt}</p>
    `;
    postGrid.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 70 * index);
  });
}

chipWrap.addEventListener("click", (event) => {
  const button = event.target.closest(".chip");
  if (!button) return;

  document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
  button.classList.add("active");
  renderPosts(button.dataset.filter);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18
  }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
renderPosts();
