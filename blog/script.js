const posts = [
  {
    title: "从 Framer 到原生代码：我复刻了一个流光 Hero",
    excerpt: "拆解视觉层级、渐变字和动效节奏，用纯 HTML/CSS 做出接近设计稿的气质。",
    date: "2026-02-22",
    category: "tech",
    tagText: "TECH",
    readTime: 7,
    size: "large"
  },
  {
    title: "把焦虑做成看板：我的周计划系统 2.0",
    excerpt: "用一个更轻的任务结构，兼顾长期目标推进和日常执行。",
    date: "2026-02-19",
    category: "life",
    tagText: "LIFE",
    readTime: 5,
    size: "tall"
  },
  {
    title: "Magic UI 组件灵感清单：哪些动效真的有价值",
    excerpt: "从炫技里筛选有意义的动效，给真实产品界面留出性能预算。",
    date: "2026-02-14",
    category: "notes",
    tagText: "NOTES",
    readTime: 6,
    size: "wide"
  },
  {
    title: "我把博客首屏重构成 Bento Grid 的全过程",
    excerpt: "不是堆卡片，而是通过节奏感和对比度讲清信息优先级。",
    date: "2026-02-10",
    category: "tech",
    tagText: "TECH",
    readTime: 4,
    size: "normal"
  },
  {
    title: "写作不是灵感，是可重复执行的系统",
    excerpt: "把输入、整理、输出放进一个迭代循环，稳定地产生内容。",
    date: "2026-02-04",
    category: "life",
    tagText: "LIFE",
    readTime: 5,
    size: "normal"
  },
  {
    title: "读书笔记：好的界面是如何减少认知负担的",
    excerpt: "把抽象原则翻译成按钮、表单、导航等可落地的界面规范。",
    date: "2026-01-31",
    category: "notes",
    tagText: "NOTES",
    readTime: 6,
    size: "normal"
  }
];

const postGrid = document.getElementById("postGrid");
const chipWrap = document.getElementById("chips");
const cursorGlow = document.getElementById("cursorGlow");

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function renderPosts(filter = "all") {
  if (!postGrid) return;

  postGrid.innerHTML = "";
  const list = filter === "all" ? posts : posts.filter((post) => post.category === filter);

  if (!list.length) {
    postGrid.innerHTML = "<p class=\"empty-state\">这个分类暂时还没有内容。</p>";
    return;
  }

  list.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = `post-card shine-card ${post.size}`;
    card.innerHTML = `
      <div class="post-top">
        <span class="badge">${post.tagText}</span>
        <time class="date" datetime="${post.date}">${formatDate(post.date)}</time>
      </div>
      <div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
      </div>
      <div class="post-foot">
        <span>${post.readTime} min read</span>
        <span class="arrow">↗</span>
      </div>
    `;

    postGrid.appendChild(card);

    setTimeout(() => {
      card.classList.add("is-ready");
    }, 80 * index);
  });
}

if (chipWrap) {
  chipWrap.addEventListener("click", (event) => {
    const button = event.target.closest(".chip");
    if (!button) return;

    document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    renderPosts(button.dataset.filter);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    cursorGlow.classList.add("active");
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.classList.remove("active");
  });
} else if (cursorGlow) {
  cursorGlow.remove();
}

renderPosts();
