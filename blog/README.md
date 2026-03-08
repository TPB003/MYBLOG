# TPBLOG Frontend

博客前端采用模块化目录结构，按 `core / data / features` 分层组织脚本，样式按 `tokens / base / layout / sections / effects / responsive` 组织。

## 架构分层说明

- `core`：全局状态、国际化、工具函数
- `data`：结构化内容数据（文章、知识卡、书单、统计等）
- `features`：业务功能模块（文章、知识库、主题、动效）
- `assets/css`：样式系统与响应式规则

## Markdown 内容流

1. 在 `blog/content/knowledge/` 新建 `.md` 文件（可参考 `_template.md`）。
2. 执行 `node ../scripts/generate-knowledge-from-md.mjs`（本地）或直接 push（CI 自动执行）。
3. 脚本会自动生成：
- `blog/assets/js/data/knowledge-generated.js`（卡片数据）
- `blog/knowledge/generated-*.html`（全文页）

## 目录与文件作用（自动生成）

<!-- AUTO-GENERATED:BLOG-STRUCTURE START -->
| 路径 | 类型 | 作用 |
|---|---|---|
| `blog` | 目录 | 博客前端项目根目录 |
| `blog/.nojekyll` | 文件 | 禁用 Jekyll 处理，确保静态资源按原路径发布 |
| `blog/assets` | 目录 | 静态资源目录 |
| `blog/assets/css` | 目录 | 样式目录 |
| `blog/assets/css/base.css` | 文件 | 基础样式：重置、全局、通用类 |
| `blog/assets/css/effects.css` | 文件 | 动画与动效样式：轨道、扫描、倾斜、过渡 |
| `blog/assets/css/knowledge-article.css` | 文件 | 样式文件 |
| `blog/assets/css/layout.css` | 文件 | 布局样式：导航、页面骨架、footer |
| `blog/assets/css/main.css` | 文件 | 样式入口，汇总各 CSS 模块 |
| `blog/assets/css/responsive.css` | 文件 | 响应式断点与移动端适配 |
| `blog/assets/css/sections.css` | 文件 | 分区样式：hero/posts/knowledge/stats/books |
| `blog/assets/css/tokens.css` | 文件 | 设计令牌：颜色、字体、圆角、阴影变量 |
| `blog/assets/js` | 目录 | 脚本目录 |
| `blog/assets/js/core` | 目录 | 核心层（状态、i18n、工具） |
| `blog/assets/js/core/i18n.js` | 文件 | 中英双语字典与切换逻辑 |
| `blog/assets/js/core/markdown.js` | 文件 | Markdown 渲染器：将知识全文按标题/列表/代码块等格式渲染 |
| `blog/assets/js/core/store.js` | 文件 | 全局状态与本地存储键 |
| `blog/assets/js/core/utils.js` | 文件 | 通用工具函数 |
| `blog/assets/js/data` | 目录 | 数据层（内容数据） |
| `blog/assets/js/data/content.js` | 文件 | 文章/知识卡/统计/书单等结构化数据 |
| `blog/assets/js/data/knowledge-generated.js` | 文件 | 自动生成的数据文件：由 Markdown 构建出的知识卡与标签 |
| `blog/assets/js/data/knowledge-index.js` | 文件 | 知识卡聚合入口：合并手写数据与 Markdown 生成数据 |
| `blog/assets/js/features` | 目录 | 功能层（按业务模块拆分） |
| `blog/assets/js/features/effects.js` | 文件 | 视觉动效与交互效果（reveal/tilt/spotlight 等） |
| `blog/assets/js/features/knowledge.js` | 文件 | 知识库搜索、标签筛选与卡片渲染 |
| `blog/assets/js/features/posts.js` | 文件 | 文章列表渲染与分类筛选 |
| `blog/assets/js/features/read-metrics.js` | 文件 | 脚本文件 |
| `blog/assets/js/features/static-sections.js` | 文件 | 静态区块渲染（Hero、话题、统计、书单） |
| `blog/assets/js/features/theme.js` | 文件 | 自动日夜主题模块：时间驱动主题与主页时钟 |
| `blog/assets/js/main.js` | 文件 | 前端启动入口：初始化语言、模块渲染、动效绑定 |
| `blog/assets/js/pages` | 目录 | 目录 |
| `blog/assets/js/pages/knowledge-article.js` | 文件 | 脚本文件 |
| `blog/content` | 目录 | Markdown 内容源目录（用于自动生成知识卡） |
| `blog/content/knowledge` | 目录 | 知识卡 Markdown 目录（新增 .md 后自动生成） |
| `blog/content/knowledge/_template.md` | 文件 | 知识卡 Markdown 模板（含 front matter 示例） |
| `blog/content/knowledge/.gitkeep` | 文件 | 占位文件，确保目录可被 Git 跟踪 |
| `blog/content/knowledge/从猫型节点与狗型节点，看人类协作的去中心化模型.md` | 文件 | 说明文档 |
| `blog/content/knowledge/预测市场不是赌博.md` | 文件 | 说明文档 |
| `blog/DEPLOY.md` | 文件 | 部署步骤文档 |
| `blog/index.html` | 文件 | 页面入口（语义结构与区块容器） |
| `blog/knowledge` | 目录 | 知识全文输出目录，同时支持直接放置 Markdown 源文件 |
| `blog/knowledge/frontend-performance-check.html` | 文件 | 页面文件 |
| `blog/knowledge/generated-从猫型节点与狗型节点-看人类协作的去中心化模型.html` | 文件 | 页面文件 |
| `blog/knowledge/generated-从猫狗去看什么是去中心化.html` | 文件 | 页面文件 |
| `blog/knowledge/generated-预测市场不是赌博.html` | 文件 | 页面文件 |
| `blog/knowledge/knowledge-card-naming.html` | 文件 | 页面文件 |
| `blog/knowledge/ssr-vs-ssg.html` | 文件 | 页面文件 |
| `blog/knowledge/tech-stack-decision-checklist.html` | 文件 | 页面文件 |
| `blog/knowledge/weekly-retrospective-template.html` | 文件 | 页面文件 |
| `blog/knowledge/writing-workflow-3-step.html` | 文件 | 页面文件 |
| `blog/knowledge/从猫狗去看什么是去中心化.md` | 文件 | 说明文档 |
| `blog/README.md` | 文件 | 博客端详细架构文档（由脚本维护结构说明块） |
<!-- AUTO-GENERATED:BLOG-STRUCTURE END -->

## 文档维护规则

- 目录结构变更后，不要手改自动生成块。
- 执行 `node ../scripts/sync-readme.mjs` 或直接提交（pre-commit 会自动执行）。
- 自动生成块外的说明文本可按需手动维护。
