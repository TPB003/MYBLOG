export const profile = {
  readCount: 596000,
  roles: {
    zh: ["前端开发者", "创作型博主", "产品设计爱好者", "终身学习实践者"],
    en: ["Frontend Engineer", "Creator Blogger", "Product Design Enthusiast", "Lifelong Learner"]
  },
  topics: {
    zh: ["Web 工程", "设计系统", "性能优化", "内容策略", "产品思考", "数字笔记"],
    en: ["Web Engineering", "Design Systems", "Performance", "Content Strategy", "Product Thinking", "Digital Notes"]
  }
};

export const posts = [
  {
    id: "post-1",
    category: "tech",
    tag: { zh: "技术", en: "Tech" },
    tone: "accent-light",
    size: "large",
    reading: { zh: "6 分钟阅读", en: "6 min read" },
    date: "2026-02-24",
    title: {
      zh: "我把博客首页重构成了信息分层式布局",
      en: "I redesigned my homepage into a layered information structure"
    },
    excerpt: {
      zh: "通过导航、叙事区和功能区分离，让访问者在 5 秒内理解我是谁、我写什么。",
      en: "By separating navigation, story, and utility zones, visitors can understand who I am in five seconds."
    }
  },
  {
    id: "post-2",
    category: "life",
    tag: { zh: "生活", en: "Life" },
    tone: "accent-dark",
    size: "medium",
    reading: { zh: "5 分钟阅读", en: "5 min read" },
    date: "2026-02-20",
    title: {
      zh: "创作系统复盘：连续写作 100 天之后",
      en: "Creator system retrospective after writing for 100 days"
    },
    excerpt: {
      zh: "复盘输入、写作、发布、反馈四个环节中真正有效的动作，砍掉伪努力。",
      en: "I reviewed input, drafting, publishing, and feedback loops to keep only actions that truly compound."
    }
  },
  {
    id: "post-3",
    category: "tech",
    tag: { zh: "技术", en: "Tech" },
    tone: "accent-orange",
    size: "small",
    reading: { zh: "7 分钟阅读", en: "7 min read" },
    date: "2026-02-17",
    title: {
      zh: "我的前端性能清单（2026 版）",
      en: "My frontend performance checklist (2026 edition)"
    },
    excerpt: {
      zh: "从加载策略、图片压缩到交互延迟监控，列出我实际在项目里执行的 checklist。",
      en: "From loading strategy to image compression and interaction latency, this is the checklist I actually run."
    }
  },
  {
    id: "post-4",
    category: "notes",
    tag: { zh: "笔记", en: "Notes" },
    tone: "accent-light",
    size: "small",
    reading: { zh: "4 分钟阅读", en: "4 min read" },
    date: "2026-02-14",
    title: {
      zh: "读书笔记：如何把抽象知识转成可执行步骤",
      en: "Reading notes: turn abstract knowledge into executable steps"
    },
    excerpt: {
      zh: "我把每本书拆成“原理 / 模板 / 场景”三层，确保读完就能用。",
      en: "I split every book into principles, templates, and use cases so each note is ready to act on."
    }
  },
  {
    id: "post-5",
    category: "notes",
    tag: { zh: "笔记", en: "Notes" },
    tone: "accent-dark",
    size: "wide",
    reading: { zh: "6 分钟阅读", en: "6 min read" },
    date: "2026-02-10",
    title: {
      zh: "产品和内容的共同点：先建立可复用框架",
      en: "Product and content share one rule: build reusable frameworks first"
    },
    excerpt: {
      zh: "无论是写文章还是做页面，先做框架再做细节，稳定性会高很多。",
      en: "Whether writing articles or building pages, stability comes from framework-first execution."
    }
  },
  {
    id: "post-6",
    category: "life",
    tag: { zh: "生活", en: "Life" },
    tone: "accent-light",
    size: "small",
    reading: { zh: "3 分钟阅读", en: "3 min read" },
    date: "2026-02-08",
    title: {
      zh: "一个更现实的周计划系统",
      en: "A more realistic weekly planning system"
    },
    excerpt: {
      zh: "我不再做“完美计划”，而是做可以在现实里持续运行的最小系统。",
      en: "I stopped chasing perfect plans and built a lightweight system that survives real life."
    }
  }
];

export const knowledgeCards = [
  {
    id: "kb-1",
    tags: ["web", "architecture", "seo"],
    updated: "2026-02-24",
    title: {
      zh: "SSR 与 SSG 的选择原则",
      en: "Choosing between SSR and SSG"
    },
    summary: {
      zh: "内容变化频率低、以 SEO 为主时优先 SSG；需要实时性和个性化时使用 SSR。",
      en: "Use SSG for low-change SEO pages; use SSR when freshness or personalization matters."
    }
  },
  {
    id: "kb-2",
    tags: ["performance", "web", "debug"],
    updated: "2026-02-23",
    title: {
      zh: "前端性能排查顺序",
      en: "Frontend performance troubleshooting order"
    },
    summary: {
      zh: "先看关键渲染路径，再查图片体积、字体加载、第三方脚本和长任务来源。",
      en: "Check critical rendering path first, then image sizes, font loading, third-party scripts, and long tasks."
    }
  },
  {
    id: "kb-3",
    tags: ["retrospective", "efficiency", "template"],
    updated: "2026-02-22",
    title: {
      zh: "周复盘模板",
      en: "Weekly retrospective template"
    },
    summary: {
      zh: "本周目标、关键事实、偏差原因、下周调整四段式，避免空泛总结。",
      en: "Use four blocks: goals, facts, deviations, and next-week adjustments to avoid vague summaries."
    }
  },
  {
    id: "kb-4",
    tags: ["writing", "content", "method"],
    updated: "2026-02-21",
    title: {
      zh: "写作流程 3 步法",
      en: "Three-step writing workflow"
    },
    summary: {
      zh: "先列框架，再补案例，最后压缩句子，把每篇文章控制在一个核心观点。",
      en: "Outline first, add cases second, compress language last; keep one core argument per article."
    }
  },
  {
    id: "kb-5",
    tags: ["knowledge", "naming", "system"],
    updated: "2026-02-20",
    title: {
      zh: "知识卡片命名规范",
      en: "Knowledge card naming convention"
    },
    summary: {
      zh: "统一采用“主题-问题-结论”命名，提升检索与二次复用效率。",
      en: "Use `topic-question-conclusion` naming for faster search and better reuse."
    }
  },
  {
    id: "kb-6",
    tags: ["architecture", "decision", "team"],
    updated: "2026-02-19",
    title: {
      zh: "技术选型检查清单",
      en: "Tech stack decision checklist"
    },
    summary: {
      zh: "评估生态、维护成本、团队熟悉度和迁移风险，避免仅凭热度决策。",
      en: "Evaluate ecosystem, maintenance cost, team familiarity, and migration risk before selecting tools."
    }
  }
];

export const knowledgeTagLabels = {
  web: { zh: "Web", en: "Web" },
  architecture: { zh: "架构", en: "Architecture" },
  seo: { zh: "SEO", en: "SEO" },
  performance: { zh: "性能", en: "Performance" },
  debug: { zh: "排障", en: "Debug" },
  retrospective: { zh: "复盘", en: "Retrospective" },
  efficiency: { zh: "效率", en: "Efficiency" },
  template: { zh: "模板", en: "Template" },
  writing: { zh: "写作", en: "Writing" },
  content: { zh: "内容", en: "Content" },
  method: { zh: "方法", en: "Method" },
  knowledge: { zh: "知识库", en: "Knowledge" },
  naming: { zh: "命名", en: "Naming" },
  system: { zh: "系统", en: "System" },
  decision: { zh: "决策", en: "Decision" },
  team: { zh: "团队", en: "Team" }
};

export const seedIdeas = [
  {
    id: "seed-1",
    mood: "thinking",
    createdAt: "2026-02-24T09:30:00+08:00",
    content: {
      zh: "内容是长期资产，代码是内容的放大器。两者应该同步迭代。",
      en: "Content is a long-term asset, and code is its amplifier. Both should evolve together."
    }
  },
  {
    id: "seed-2",
    mood: "log",
    createdAt: "2026-02-24T16:40:00+08:00",
    content: {
      zh: "今天给每个知识卡增加了标签体系，检索体验立刻提升。",
      en: "I added a tag system for every knowledge card today, and retrieval quality improved instantly."
    }
  }
];

export const statsBars = [
  { key: "dev", value: 78 },
  { key: "writing", value: 62 },
  { key: "reading", value: 45 },
  { key: "fitness", value: 31 }
];

export const books = [
  {
    title: { zh: "《设计中的设计》", en: "Designing Design" },
    summary: {
      zh: "建立了我对“留白、节奏、秩序”的审美底层。",
      en: "It shaped my visual foundation in whitespace, rhythm, and order."
    }
  },
  {
    title: { zh: "《Clean Architecture》", en: "Clean Architecture" },
    summary: {
      zh: "提醒我：代码是长期沟通，而不是短期交付。",
      en: "A reminder that code is long-term communication, not short-term output."
    }
  },
  {
    title: { zh: "《金字塔原理》", en: "The Pyramid Principle" },
    summary: {
      zh: "帮助我把输出从“堆内容”变成“可读结构”。",
      en: "It helped me transform output from content piles into readable structures."
    }
  },
  {
    title: { zh: "《纳瓦尔宝典》", en: "The Almanack of Naval Ravikant" },
    summary: {
      zh: "关于长期主义、杠杆和自我选择的实践手册。",
      en: "A practical playbook on compounding, leverage, and conscious choice."
    }
  }
];

export const defaultLocation = {
  label: { zh: "Suzhou, China", en: "Suzhou, China" },
  latitude: 31.299,
  longitude: 120.585
};
