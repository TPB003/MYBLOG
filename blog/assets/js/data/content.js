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
    baseReads: 124000,
    reading: { zh: "6 分钟阅读", en: "6 min read" },
    date: "2026-02-24",
    title: {
      zh: "我把博客首页重构成了信息分层式布局",
      en: "I redesigned my homepage into a layered information structure"
    },
    excerpt: {
      zh: "通过导航、叙事区和功能区分离，让访问者在 5 秒内理解我是谁、我写什么。",
      en: "By separating navigation, story, and utility zones, visitors can understand who I am in five seconds."
    },
    content: {
      zh: [
        "这次重构的核心不是把页面做得更花，而是让信息层级更清晰。访问者进来后的前 5 秒，需要先知道我是谁、我在做什么、他们接下来应该点哪里。",
        "我把首页拆成了三层：第一层是身份与长期方向，第二层是内容入口和知识库索引，第三层是运行状态与统计信息。每一层只负责一个目标，避免互相干扰。",
        "这种分层设计带来的直接收益是跳出率下降，文章区点击率提升。以前用户会在视觉上迷失，现在用户会更自然地从主页进入具体内容。",
        "如果你也在做个人主页，先别急着加组件。先定义信息优先级，再决定视觉和动效。结构正确以后，样式只是放大器。"
      ],
      en: [
        "This redesign is not about adding flashy UI. It is about clarifying hierarchy so visitors instantly know who I am, what I do, and where to go next.",
        "I split the homepage into three layers: identity and long-term focus, content and knowledge entry points, then operational signals and stats. Each layer serves one job.",
        "The immediate outcome was lower bounce rate and higher article click-through. Users no longer get distracted by visual noise before finding the core content.",
        "If you are building your own homepage, start with priority, not components. Once the information structure is correct, visual style becomes a force multiplier."
      ]
    }
  },
  {
    id: "post-2",
    category: "life",
    tag: { zh: "生活", en: "Life" },
    tone: "accent-dark",
    size: "medium",
    baseReads: 98000,
    reading: { zh: "5 分钟阅读", en: "5 min read" },
    date: "2026-02-20",
    title: {
      zh: "创作系统复盘：连续写作 100 天之后",
      en: "Creator system retrospective after writing for 100 days"
    },
    excerpt: {
      zh: "复盘输入、写作、发布、反馈四个环节中真正有效的动作，砍掉伪努力。",
      en: "I reviewed input, drafting, publishing, and feedback loops to keep only actions that truly compound."
    },
    content: {
      zh: [
        "连续写作 100 天以后，我发现真正有效的动作其实很少。大多数效率问题，不是因为不努力，而是流程里有太多无效环节。",
        "我把创作系统拆成输入、写作、发布、反馈四个环节。每个环节只保留一个核心指标，比如输入阶段只看是否沉淀成可复用卡片。",
        "最关键的改变是把“等灵感”改成“先结构后表达”。先写提纲，再填内容，最后压缩语言。这样即便状态一般，也能稳定产出。",
        "写作系统不是一次性搭好，而是每周小幅迭代。能长期运行的系统，往往不是最完美的，而是最不依赖情绪的。"
      ],
      en: [
        "After writing for 100 consecutive days, I learned that only a few actions actually matter. Most productivity issues came from noisy process, not lack of effort.",
        "I split my creator system into input, drafting, publishing, and feedback. Each stage keeps one core metric to avoid over-optimization.",
        "The biggest shift was replacing inspiration-first writing with structure-first writing. Outline first, expand second, compress language last.",
        "A writing system is never finished in one go. It improves through small weekly iterations, and it should survive low-energy days without breaking."
      ]
    }
  },
  {
    id: "post-3",
    category: "tech",
    tag: { zh: "技术", en: "Tech" },
    tone: "accent-orange",
    size: "small",
    baseReads: 110000,
    reading: { zh: "7 分钟阅读", en: "7 min read" },
    date: "2026-02-17",
    title: {
      zh: "我的前端性能清单（2026 版）",
      en: "My frontend performance checklist (2026 edition)"
    },
    excerpt: {
      zh: "从加载策略、图片压缩到交互延迟监控，列出我实际在项目里执行的 checklist。",
      en: "From loading strategy to image compression and interaction latency, this is the checklist I actually run."
    },
    content: {
      zh: [
        "性能优化不能只靠 Lighthouse 分数。真正有价值的是把关键页面的真实用户体验指标稳定在可控区间。",
        "我的排查顺序固定为：关键渲染路径、资源体积、第三方脚本、长任务来源。先找前两项，通常就能解决 70% 的问题。",
        "图片和字体策略会直接影响首屏。图片做格式分级，字体做子集化，并且延迟加载非关键资源，是性价比最高的做法。",
        "最后一步是建立回归机制。每次发布后自动记录核心指标，一旦波动超过阈值就触发提醒，避免性能在迭代中悄悄退化。"
      ],
      en: [
        "Performance work should not stop at a Lighthouse score. The real goal is keeping real user metrics stable on critical pages.",
        "My investigation order is fixed: critical rendering path, asset weight, third-party scripts, then long tasks. The first two usually solve most issues.",
        "Image and font strategy directly impact first paint. Format tiering, font subsetting, and lazy-loading non-critical assets deliver strong ROI.",
        "The final step is regression control. Track key metrics after every deploy and alert when thresholds are crossed."
      ]
    }
  },
  {
    id: "post-4",
    category: "notes",
    tag: { zh: "笔记", en: "Notes" },
    tone: "accent-light",
    size: "small",
    baseReads: 76000,
    reading: { zh: "4 分钟阅读", en: "4 min read" },
    date: "2026-02-14",
    title: {
      zh: "读书笔记：如何把抽象知识转成可执行步骤",
      en: "Reading notes: turn abstract knowledge into executable steps"
    },
    excerpt: {
      zh: "我把每本书拆成“原理 / 模板 / 场景”三层，确保读完就能用。",
      en: "I split every book into principles, templates, and use cases so each note is ready to act on."
    },
    content: {
      zh: [
        "很多读书笔记的问题是“记住了观点，但没有行动”。知识如果不能转化为下一步动作，价值会快速衰减。",
        "我现在统一用三层结构记录：原理、模板、场景。原理帮助理解，模板帮助复用，场景决定什么时候调用。",
        "例如读到“先明确问题再找方案”，我会把它写成会议模板：问题定义、约束条件、可行方案、决策标准。",
        "这样做之后，笔记不再是收藏夹，而是执行工具箱。每次遇到类似问题，都能快速调用已有结构。"
      ],
      en: [
        "The common issue with reading notes is this: ideas are remembered but not executed. Knowledge decays quickly without action.",
        "I now capture notes in three layers: principle, template, and scenario. Principles explain, templates operationalize, scenarios trigger usage.",
        "For example, when a book says define the problem before discussing solutions, I turn it into a meeting template with constraints and decision criteria.",
        "With this approach, notes become an execution toolkit rather than a passive archive."
      ]
    }
  },
  {
    id: "post-5",
    category: "notes",
    tag: { zh: "笔记", en: "Notes" },
    tone: "accent-dark",
    size: "wide",
    baseReads: 104000,
    reading: { zh: "6 分钟阅读", en: "6 min read" },
    date: "2026-02-10",
    title: {
      zh: "产品和内容的共同点：先建立可复用框架",
      en: "Product and content share one rule: build reusable frameworks first"
    },
    excerpt: {
      zh: "无论是写文章还是做页面，先做框架再做细节，稳定性会高很多。",
      en: "Whether writing articles or building pages, stability comes from framework-first execution."
    },
    content: {
      zh: [
        "内容创作和产品开发看起来不同，但底层方法高度一致：先搭框架，再补细节。没有框架，迭代越多越容易混乱。",
        "在内容里，框架是选题系统、标题结构和发布节奏；在产品里，框架是信息架构、组件规则和状态管理。",
        "我现在的做法是先做“可复用最小版”，确认这套结构能在三次以上任务中重复使用，再进入精修阶段。",
        "这能显著降低长期维护成本，也能让团队协作更顺畅。框架不是限制创造力，而是给创造力一个稳定容器。"
      ],
      en: [
        "Content and product work look different, but they share the same foundation: framework first, details second.",
        "In content, framework means topic pipeline, title structure, and publishing cadence. In product, it means architecture, component rules, and state flow.",
        "My current method is building a reusable minimum first, proving it across multiple tasks, and then polishing.",
        "This reduces long-term maintenance cost and keeps collaboration aligned. Frameworks do not kill creativity; they protect it."
      ]
    }
  },
  {
    id: "post-6",
    category: "life",
    tag: { zh: "生活", en: "Life" },
    tone: "accent-light",
    size: "small",
    baseReads: 84000,
    reading: { zh: "3 分钟阅读", en: "3 min read" },
    date: "2026-02-08",
    title: {
      zh: "一个更现实的周计划系统",
      en: "A more realistic weekly planning system"
    },
    excerpt: {
      zh: "我不再做“完美计划”，而是做可以在现实里持续运行的最小系统。",
      en: "I stopped chasing perfect plans and built a lightweight system that survives real life."
    },
    content: {
      zh: [
        "周计划失败的核心原因，通常不是目标太大，而是计划假设了“每天状态都很好”。现实里，状态波动才是常态。",
        "我把周计划拆成三层：必须完成、可推进、可放弃。这样即便出现突发情况，也不会整周计划全部崩掉。",
        "每天只锁定 1 个关键任务，其余任务作为弹性池。关键任务完成后再补充，避免一开始就被长清单压垮。",
        "这个系统看起来不激进，但执行稳定。长期来看，稳定推进比短期冲刺更能积累复利。"
      ],
      en: [
        "Weekly plans often fail because they assume perfect daily energy. Reality is variable, so plans must absorb volatility.",
        "I split the week into three layers: must-do, should-do, and optional. This keeps the system intact under unexpected events.",
        "Each day has one anchor task. Everything else is flexible capacity after the anchor is done.",
        "This method looks less aggressive, but it is much more durable. Over time, durable systems compound better than heroic sprints."
      ]
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
