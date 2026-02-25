# MYBLOG

TPBLOG 是一个「个人博客 + 知识库 + 想法流 + 足迹路线」项目，使用纯前端架构部署到 GitHub Pages。

## 项目能力

- 博客文章：分类筛选、个性化布局、动效呈现
- 知识库：关键词搜索 + 标签过滤
- 想法流：本地持久化发布（`localStorage`）
- 足迹路线：默认连云港到上海，可持续追加城市并自动连线
- 中英双语：运行时切换（CN/EN）
- 动效系统：轨道动画、卡片倾斜、聚光跟随、滚动显现

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
| `blog/assets/css/base.css` | 文件 | 基础样式：重置、全局、通用类 |
| `blog/assets/css/effects.css` | 文件 | 动画与动效样式：轨道、扫描、倾斜、过渡 |
| `blog/assets/css/layout.css` | 文件 | 布局样式：导航、页面骨架、footer |
| `blog/assets/css/main.css` | 文件 | 样式入口，汇总各 CSS 模块 |
| `blog/assets/css/responsive.css` | 文件 | 响应式断点与移动端适配 |
| `blog/assets/css/sections.css` | 文件 | 分区样式：hero/posts/knowledge/ideas/stats/books |
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
| `blog/assets/js/features/footprint.js` | 文件 | 足迹路线模块：城市追加、持久化与连线渲染 |
| `blog/assets/js/features/ideas.js` | 文件 | 想法发布流与本地持久化 |
| `blog/assets/js/features/knowledge.js` | 文件 | 知识库搜索、标签筛选与卡片渲染 |
| `blog/assets/js/features/posts.js` | 文件 | 文章列表渲染与分类筛选 |
| `blog/assets/js/features/static-sections.js` | 文件 | 静态区块渲染（Hero、话题、统计、书单） |
| `blog/assets/js/main.js` | 文件 | 前端启动入口：初始化语言、模块渲染、动效绑定 |
| `blog/DEPLOY.md` | 文件 | 部署步骤文档 |
| `blog/index.html` | 文件 | 页面入口（语义结构与区块容器） |
| `blog/README.md` | 文件 | 博客端详细架构文档（由脚本维护结构说明块） |
| `deploy-blog-pages.ps1` | 文件 | PowerShell 一键部署脚本：提交并推送到 GitHub Pages |
| `deploy-blog-pages.sh` | 文件 | Linux 一键部署脚本：提交并推送到 GitHub Pages |
| `README.md` | 文件 | 仓库总览文档（项目介绍、目录说明、自动同步说明） |
| `scripts` | 目录 | 自动化脚本目录 |
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
