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
| Path | Type | Purpose |
|---|---|---|
| `.githooks` | Directory | Local git hooks directory. |
| `.githooks/pre-commit` | File | Pre-commit hook to refresh README structure tables. |
| `.github` | Directory | GitHub configuration directory. |
| `.github/workflows` | Directory | GitHub Actions workflows. |
| `.github/workflows/deploy-pages.yml` | File | Pages deployment workflow. |
| `.github/workflows/readme-sync.yml` | File | Automatic README sync workflow. |
| `blog` | Directory | Static blog frontend project. |
| `blog/.nojekyll` | File | Disable Jekyll processing on GitHub Pages. |
| `blog/assets` | Directory | Static assets. |
| `blog/assets/css` | Directory | Stylesheets. |
| `blog/assets/css/base.css` | File | Base/global styles. |
| `blog/assets/css/book-article.css` | File | Stylesheet file. |
| `blog/assets/css/effects.css` | File | Interactive effects and animations. |
| `blog/assets/css/knowledge-article.css` | File | Stylesheet file. |
| `blog/assets/css/layout.css` | File | Global layout and header/footer styles. |
| `blog/assets/css/main.css` | File | CSS entrypoint importing all style modules. |
| `blog/assets/css/responsive.css` | File | Responsive breakpoints and mobile overrides. |
| `blog/assets/css/sections.css` | File | Section-specific styles. |
| `blog/assets/css/tokens.css` | File | Design tokens for colors, spacing, and radii. |
| `blog/assets/js` | Directory | Frontend scripts. |
| `blog/assets/js/core` | Directory | Core runtime modules. |
| `blog/assets/js/core/i18n.js` | File | Bilingual dictionary and i18n runtime. |
| `blog/assets/js/core/markdown.js` | File | Markdown renderer used by article pages. |
| `blog/assets/js/core/store.js` | File | Global state and storage key constants. |
| `blog/assets/js/core/utils.js` | File | Utility helpers. |
| `blog/assets/js/data` | Directory | Content data modules. |
| `blog/assets/js/data/books-generated.js` | File | Generated reading list data. |
| `blog/assets/js/data/books-index.js` | File | Merged books export. |
| `blog/assets/js/data/content.js` | File | Hand-authored content data. |
| `blog/assets/js/data/knowledge-generated.js` | File | Generated knowledge card data. |
| `blog/assets/js/data/knowledge-index.js` | File | Merged knowledge export. |
| `blog/assets/js/features` | Directory | UI feature modules. |
| `blog/assets/js/features/effects.js` | File | Reveal/tilt/spotlight effects. |
| `blog/assets/js/features/header.js` | File | Header visibility behavior on scroll. |
| `blog/assets/js/features/knowledge.js` | File | Knowledge search/tag/filter rendering. |
| `blog/assets/js/features/landing.js` | File | Top launchpad interactions and dynamic status. |
| `blog/assets/js/features/posts.js` | File | Post list render and interactions. |
| `blog/assets/js/features/read-metrics.js` | File | Read count storage and aggregation. |
| `blog/assets/js/features/static-sections.js` | File | Render static sections (hero/stats/books). |
| `blog/assets/js/features/theme.js` | File | Day/night mode runtime. |
| `blog/assets/js/main.js` | File | Application bootstrap and module initialization. |
| `blog/assets/js/pages` | Directory | Standalone page scripts. |
| `blog/assets/js/pages/book-article.js` | File | Book article page runtime. |
| `blog/assets/js/pages/knowledge-article.js` | File | Knowledge article page runtime. |
| `blog/books` | Directory | Generated and static book article pages. |
| `blog/books/.gitkeep` | File | File |
| `blog/books/generated-almanack-of-naval.html` | File | HTML page. |
| `blog/books/generated-clean-architecture.html` | File | HTML page. |
| `blog/books/generated-designing-design.html` | File | HTML page. |
| `blog/books/generated-pyramid-principle.html` | File | HTML page. |
| `blog/content` | Directory | Markdown content source. |
| `blog/content/books` | Directory | Book Markdown sources. |
| `blog/content/books/_template.md` | File | Markdown document. |
| `blog/content/books/.gitkeep` | File | File |
| `blog/content/books/almanack-of-naval.md` | File | Markdown document. |
| `blog/content/books/clean-architecture.md` | File | Markdown document. |
| `blog/content/books/designing-design.md` | File | Markdown document. |
| `blog/content/books/pyramid-principle.md` | File | Markdown document. |
| `blog/content/knowledge` | Directory | Knowledge Markdown sources. |
| `blog/content/knowledge/_template.md` | File | Markdown document. |
| `blog/content/knowledge/.gitkeep` | File | File |
| `blog/content/knowledge/从猫型节点与狗型节点，看人类协作的去中心化模型.md` | File | Markdown document. |
| `blog/content/knowledge/预测市场不是赌博.md` | File | Markdown document. |
| `blog/DEPLOY.md` | File | Deployment notes. |
| `blog/index.html` | File | Main website entry page. |
| `blog/knowledge` | Directory | Generated and static knowledge article pages. |
| `blog/knowledge/frontend-performance-check.html` | File | HTML page. |
| `blog/knowledge/generated-从猫型节点与狗型节点-看人类协作的去中心化模型.html` | File | HTML page. |
| `blog/knowledge/generated-从猫狗去看什么是去中心化.html` | File | HTML page. |
| `blog/knowledge/generated-预测市场不是赌博.html` | File | HTML page. |
| `blog/knowledge/knowledge-card-naming.html` | File | HTML page. |
| `blog/knowledge/ssr-vs-ssg.html` | File | HTML page. |
| `blog/knowledge/tech-stack-decision-checklist.html` | File | HTML page. |
| `blog/knowledge/weekly-retrospective-template.html` | File | HTML page. |
| `blog/knowledge/writing-workflow-3-step.html` | File | HTML page. |
| `blog/knowledge/从猫狗去看什么是去中心化.md` | File | Markdown document. |
| `blog/README.md` | File | Project-level structure and maintenance notes. |
| `blog/robots.txt` | File | File |
| `deploy-blog-pages.ps1` | File | One-command PowerShell deployment script for GitHub Pages. |
| `deploy-blog-pages.sh` | File | One-command Linux deployment script for GitHub Pages. |
| `README.md` | File | Repository overview and usage guide. |
| `scripts` | Directory | Automation scripts. |
| `scripts/generate-books-from-md.mjs` | File | Script file. |
| `scripts/generate-knowledge-from-md.mjs` | File | Generate knowledge/book index and article pages from Markdown. |
| `scripts/sync-readme.mjs` | File | Auto-generate repository structure sections in README files. |
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
