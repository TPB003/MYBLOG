# TPBLOG Frontend

博客前端采用模块化目录结构，按 `core / data / features` 分层组织脚本，样式按 `tokens / base / layout / sections / effects / responsive` 组织。

## 架构分层说明

- `core`：全局状态、国际化、工具函数
- `data`：结构化内容数据（文章、知识卡、书单、统计等）
- `features`：业务功能模块（文章、知识库、想法流、天气、动效）
- `assets/css`：样式系统与响应式规则

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
| `blog/assets/css/layout.css` | 文件 | 布局样式：导航、页面骨架、footer |
| `blog/assets/css/main.css` | 文件 | 样式入口，汇总各 CSS 模块 |
| `blog/assets/css/responsive.css` | 文件 | 响应式断点与移动端适配 |
| `blog/assets/css/sections.css` | 文件 | 分区样式：hero/posts/knowledge/ideas/weather/stats/books |
| `blog/assets/css/tokens.css` | 文件 | 设计令牌：颜色、字体、圆角、阴影变量 |
| `blog/assets/js` | 目录 | 脚本目录 |
| `blog/assets/js/core` | 目录 | 核心层（状态、i18n、工具） |
| `blog/assets/js/core/i18n.js` | 文件 | 中英双语字典与切换逻辑 |
| `blog/assets/js/core/store.js` | 文件 | 全局状态与本地存储键 |
| `blog/assets/js/core/utils.js` | 文件 | 通用工具函数 |
| `blog/assets/js/data` | 目录 | 数据层（内容数据） |
| `blog/assets/js/data/content.js` | 文件 | 文章/知识卡/想法种子/统计/书单等结构化数据 |
| `blog/assets/js/features` | 目录 | 功能层（按业务模块拆分） |
| `blog/assets/js/features/effects.js` | 文件 | 视觉动效与交互效果（reveal/tilt/spotlight 等） |
| `blog/assets/js/features/ideas.js` | 文件 | 想法发布流与本地持久化 |
| `blog/assets/js/features/knowledge.js` | 文件 | 知识库搜索、标签筛选与卡片渲染 |
| `blog/assets/js/features/posts.js` | 文件 | 文章列表渲染与分类筛选 |
| `blog/assets/js/features/static-sections.js` | 文件 | 静态区块渲染（Hero、话题、统计、书单） |
| `blog/assets/js/features/weather.js` | 文件 | 实时天气与 7 天预报 |
| `blog/assets/js/main.js` | 文件 | 前端启动入口：初始化语言、模块渲染、动效绑定 |
| `blog/DEPLOY.md` | 文件 | 部署步骤文档 |
| `blog/index.html` | 文件 | 页面入口（语义结构与区块容器） |
| `blog/README.md` | 文件 | 博客端详细架构文档（由脚本维护结构说明块） |
<!-- AUTO-GENERATED:BLOG-STRUCTURE END -->

## 文档维护规则

- 目录结构变更后，不要手改自动生成块。
- 执行 `node ../scripts/sync-readme.mjs` 或直接提交（pre-commit 会自动执行）。
- 自动生成块外的说明文本可按需手动维护。
