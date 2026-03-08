# MYBLOG

TPBLOG 是一个「iOS 风格个人主页 + 知识库 + 文章系统 + 统计看板」项目，使用纯前端架构部署到 GitHub Pages。

## 项目能力

- 博客文章：分类筛选、个性化布局、动效呈现
- 知识库：关键词搜索 + 标签过滤
- Markdown 驱动知识卡：上传 `.md` 后自动生成卡片和全文页
- 自动日夜主题：按本地时间切换 Day/Night 风格
- iOS 风格 UI：玻璃拟态、卡片分层、移动端适配
- 中英双语：运行时切换（CN/EN）
- 动效系统：轨道动画、卡片倾斜、聚光跟随、滚动显现

## Markdown 自动生成知识卡

1. 把 Markdown 文件放到 `blog/content/knowledge/` 或 `blog/knowledge/` 目录（可复制 `_template.md`）。
2. `git push` 后，GitHub Actions 会自动运行 `scripts/generate-knowledge-from-md.mjs`。
3. 前端会自动展示新知识卡，并生成对应全文页。
4. 若只写中文或英文，脚本会自动补全另一种语言（中英互译）。

支持两种添加方式：
- 本地文件夹：直接新增 `.md` 后提交推送。
- GitHub 网页界面：在仓库网页里上传 `.md` 到 `blog/content/knowledge/` 或 `blog/knowledge/` 后提交。

可选：配置更高质量翻译（OpenAI）  
在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中配置：
- `secret` `TPBLOG_OPENAI_API_KEY`
- `variable` `TPBLOG_TRANSLATE_PROVIDER` = `openai`
- `variable` `TPBLOG_OPENAI_MODEL`（可选，默认 `gpt-4.1-mini`）
- `variable` `TPBLOG_OPENAI_BASE_URL`（可选，默认 `https://api.openai.com/v1/chat/completions`）

## 仓库结构（自动生成）

<!-- AUTO-GENERATED:ROOT-STRUCTURE START -->
| 路径 | 类型 | 作用 |
|---|---|---|
| `.githooks` | 目录 | 本地 Git Hook 目录 |
| `.githooks/pre-commit` | 文件 | 提交前自动执行 README 同步并暂存变更 |
| `.github` | 目录 | GitHub 配置目录 |
| `.github/workflows` | 目录 | GitHub Actions 工作流目录 |
| `.github/workflows/deploy-pages.yml` | 文件 | Pages 部署工作流 |
| `.github/workflows/readme-sync.yml` | 文件 | README 自动同步工作流（代码变更后自动更新文档） |
| `blog` | 目录 | 博客前端项目根目录 |
| `blog/.nojekyll` | 文件 | 禁用 Jekyll 处理，确保静态资源按原路径发布 |
| `blog/assets` | 目录 | 静态资源目录 |
| `blog/assets/css` | 目录 | 样式目录 |
| `blog/assets/css/admin.css` | 文件 | 管理员页面样式：控制台布局、表单与交互按钮 |
| `blog/assets/css/base.css` | 文件 | 基础样式：重置、全局、通用类 |
| `blog/assets/css/book-article.css` | 文件 | 样式文件 |
| `blog/assets/css/effects.css` | 文件 | 动画与动效样式：轨道、扫描、倾斜、过渡 |
| `blog/assets/css/knowledge-article.css` | 文件 | 样式文件 |
| `blog/assets/css/layout.css` | 文件 | 布局样式：导航、页面骨架、footer |
| `blog/assets/css/main.css` | 文件 | 样式入口，汇总各 CSS 模块 |
| `blog/assets/css/responsive.css` | 文件 | 响应式断点与移动端适配 |
| `blog/assets/css/sections.css` | 文件 | 分区样式：hero/posts/knowledge/stats/books |
| `blog/assets/css/tokens.css` | 文件 | 设计令牌：颜色、字体、圆角、阴影变量 |
| `blog/assets/js` | 目录 | 脚本目录 |
| `blog/assets/js/core` | 目录 | 核心层（状态、i18n、工具） |
| `blog/assets/js/core/admin-config.js` | 文件 | 管理员配置核心：本地存储读写、数据覆盖与模块显隐应用 |
| `blog/assets/js/core/i18n.js` | 文件 | 中英双语字典与切换逻辑 |
| `blog/assets/js/core/markdown.js` | 文件 | Markdown 渲染器：将知识全文按标题/列表/代码块等格式渲染 |
| `blog/assets/js/core/store.js` | 文件 | 全局状态与本地存储键 |
| `blog/assets/js/core/utils.js` | 文件 | 通用工具函数 |
| `blog/assets/js/data` | 目录 | 数据层（内容数据） |
| `blog/assets/js/data/books-generated.js` | 文件 | 脚本文件 |
| `blog/assets/js/data/books-index.js` | 文件 | 脚本文件 |
| `blog/assets/js/data/content.js` | 文件 | 文章/知识卡/统计/书单等结构化数据 |
| `blog/assets/js/data/knowledge-generated.js` | 文件 | 自动生成的数据文件：由 Markdown 构建出的知识卡与标签 |
| `blog/assets/js/data/knowledge-index.js` | 文件 | 知识卡聚合入口：合并手写数据与 Markdown 生成数据 |
| `blog/assets/js/features` | 目录 | 功能层（按业务模块拆分） |
| `blog/assets/js/features/effects.js` | 文件 | 视觉动效与交互效果（reveal/tilt/spotlight 等） |
| `blog/assets/js/features/header.js` | 文件 | 脚本文件 |
| `blog/assets/js/features/knowledge.js` | 文件 | 知识库搜索、标签筛选与卡片渲染 |
| `blog/assets/js/features/posts.js` | 文件 | 文章列表渲染与分类筛选 |
| `blog/assets/js/features/read-metrics.js` | 文件 | 脚本文件 |
| `blog/assets/js/features/static-sections.js` | 文件 | 静态区块渲染（Hero、话题、统计、书单） |
| `blog/assets/js/features/theme.js` | 文件 | 自动日夜主题模块：时间驱动主题与主页时钟 |
| `blog/assets/js/main.js` | 文件 | 前端启动入口：初始化语言、模块渲染、动效绑定 |
| `blog/assets/js/pages` | 目录 | 目录 |
| `blog/assets/js/pages/admin.js` | 文件 | 管理员页面脚本：模块开关、JSON 编辑、导入导出与即时应用 |
| `blog/assets/js/pages/book-article.js` | 文件 | 脚本文件 |
| `blog/assets/js/pages/knowledge-article.js` | 文件 | 脚本文件 |
| `blog/books` | 目录 | 目录 |
| `blog/books/.gitkeep` | 文件 | 文件 |
| `blog/books/generated-almanack-of-naval.html` | 文件 | 页面文件 |
| `blog/books/generated-clean-architecture.html` | 文件 | 页面文件 |
| `blog/books/generated-designing-design.html` | 文件 | 页面文件 |
| `blog/books/generated-pyramid-principle.html` | 文件 | 页面文件 |
| `blog/content` | 目录 | Markdown 内容源目录（用于自动生成知识卡） |
| `blog/content/books` | 目录 | 目录 |
| `blog/content/books/_template.md` | 文件 | 说明文档 |
| `blog/content/books/.gitkeep` | 文件 | 文件 |
| `blog/content/books/almanack-of-naval.md` | 文件 | 说明文档 |
| `blog/content/books/clean-architecture.md` | 文件 | 说明文档 |
| `blog/content/books/designing-design.md` | 文件 | 说明文档 |
| `blog/content/books/pyramid-principle.md` | 文件 | 说明文档 |
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
| `blog/robots.txt` | 文件 | 文件 |
| `deploy-blog-pages.ps1` | 文件 | PowerShell 一键部署脚本：提交并推送到 GitHub Pages |
| `deploy-blog-pages.sh` | 文件 | Linux 一键部署脚本：提交并推送到 GitHub Pages |
| `README.md` | 文件 | 仓库总览文档（项目介绍、目录说明、自动同步说明） |
| `scripts` | 目录 | 自动化脚本目录 |
| `scripts/generate-books-from-md.mjs` | 文件 | 脚本文件 |
| `scripts/generate-knowledge-from-md.mjs` | 文件 | 知识卡生成脚本：将 Markdown 自动转换为知识卡数据与全文页 |
| `scripts/sync-readme.mjs` | 文件 | README 结构同步脚本（扫描目录并更新文档块） |
<!-- AUTO-GENERATED:ROOT-STRUCTURE END -->

## README 自动同步机制

当代码结构变化后，README 会自动更新：

1. 本地提交自动同步：
- 通过 `.githooks/pre-commit` 在提交前执行 `node scripts/sync-readme.mjs`
- 自动暂存 `README.md` 和 `blog/README.md`

2. 远端推送自动同步：
- `.github/workflows/readme-sync.yml` 在 `push` 后执行同步脚本
- 若检测到 README 变化，会自动提交回当前分支

## 手动执行同步

```bash
node scripts/sync-readme.mjs
```

## 前端详细文档

- 见 [blog/README.md](blog/README.md)
