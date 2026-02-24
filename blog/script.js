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

const postGrid = document.getElementById("postGrid");
const chipWrap = document.getElementById("chips");
const countUpNode = document.getElementById("countUp");

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
        <span class="post-tag">${post.tag}</span>
        <time class="post-date" datetime="${post.date}">${formatDate(post.date)}</time>
      </div>
      <div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
      </div>
      <div class="post-foot">${post.reading}</div>
    `;

    postGrid.appendChild(card);

    setTimeout(() => {
      card.classList.add("ready");
    }, 70 * index);
  });
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

renderPosts();
animateCount();
