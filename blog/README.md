# TPBLOG Frontend

博客前端采用模块化目录结构，按 `core / data / features` 分层组织脚本，样式按 `tokens / base / layout / sections / effects / responsive` 组织。

## 架构分层说明

- `core`：全局状态、国际化、工具函数
- `data`：结构化内容数据（文章、知识卡、书单、统计等）
- `features`：业务功能模块（文章、知识库、主题、动效）
- `assets/css`：样式系统与响应式规则

## Markdown 内容流

1. 在 `blog/content/knowledge/` 或 `blog/knowledge/` 新建 `.md` 文件（可参考 `_template.md`）。
2. 执行 `node ../scripts/generate-knowledge-from-md.mjs`（本地）或直接 push（CI 自动执行）。
3. 脚本会自动生成：
- `blog/assets/js/data/knowledge-generated.js`（卡片数据）
- `blog/knowledge/generated-*.html`（全文页）
4. 如果只写中文或英文正文，脚本会自动翻译补全另一种语言。

## 目录与文件作用（自动生成）

<!-- AUTO-GENERATED:BLOG-STRUCTURE START -->
| Path | Type | Purpose |
|---|---|---|
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
<!-- AUTO-GENERATED:BLOG-STRUCTURE END -->

## 文档维护规则

- 目录结构变更后，不要手改自动生成块。
- 执行 `node ../scripts/sync-readme.mjs` 或直接提交（pre-commit 会自动执行）。
- 自动生成块外的说明文本可按需手动维护。
