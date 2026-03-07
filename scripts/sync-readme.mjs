#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const ROOT_README = path.join(repoRoot, "README.md");
const BLOG_README = path.join(repoRoot, "blog", "README.md");

const ROOT_SECTION_START = "<!-- AUTO-GENERATED:ROOT-STRUCTURE START -->";
const ROOT_SECTION_END = "<!-- AUTO-GENERATED:ROOT-STRUCTURE END -->";
const BLOG_SECTION_START = "<!-- AUTO-GENERATED:BLOG-STRUCTURE START -->";
const BLOG_SECTION_END = "<!-- AUTO-GENERATED:BLOG-STRUCTURE END -->";

const IGNORE_NAMES = new Set([
  ".git",
  ".vscode",
  "node_modules",
  "run-logs"
]);

const ROOT_INCLUDE = [
  "README.md",
  "blog",
  ".github",
  "scripts",
  ".githooks",
  "deploy-blog-pages.sh",
  "deploy-blog-pages.ps1"
];

const EXPLICIT_DESCRIPTIONS = {
  "README.md": "仓库总览文档（项目介绍、目录说明、自动同步说明）",
  "deploy-blog-pages.sh": "Linux 一键部署脚本：提交并推送到 GitHub Pages",
  "deploy-blog-pages.ps1": "PowerShell 一键部署脚本：提交并推送到 GitHub Pages",

  ".github": "GitHub 配置目录",
  ".github/workflows": "GitHub Actions 工作流目录",
  ".github/workflows/deploy-pages.yml": "Pages 部署工作流",
  ".github/workflows/readme-sync.yml": "README 自动同步工作流（代码变更后自动更新文档）",

  "scripts": "自动化脚本目录",
  "scripts/sync-readme.mjs": "README 结构同步脚本（扫描目录并更新文档块）",

  ".githooks": "本地 Git Hook 目录",
  ".githooks/pre-commit": "提交前自动执行 README 同步并暂存变更",

  "blog": "博客前端项目根目录",
  "blog/.nojekyll": "禁用 Jekyll 处理，确保静态资源按原路径发布",
  "blog/DEPLOY.md": "部署步骤文档",
  "blog/README.md": "博客端详细架构文档（由脚本维护结构说明块）",
  "blog/index.html": "页面入口（语义结构与区块容器）",

  "blog/assets": "静态资源目录",
  "blog/assets/css": "样式目录",
  "blog/assets/css/main.css": "样式入口，汇总各 CSS 模块",
  "blog/assets/css/tokens.css": "设计令牌：颜色、字体、圆角、阴影变量",
  "blog/assets/css/base.css": "基础样式：重置、全局、通用类",
  "blog/assets/css/layout.css": "布局样式：导航、页面骨架、footer",
  "blog/assets/css/sections.css": "分区样式：hero/posts/knowledge/stats/books",
  "blog/assets/css/effects.css": "动画与动效样式：轨道、扫描、倾斜、过渡",
  "blog/assets/css/responsive.css": "响应式断点与移动端适配",

  "blog/assets/js": "脚本目录",
  "blog/assets/js/main.js": "前端启动入口：初始化语言、模块渲染、动效绑定",

  "blog/assets/js/core": "核心层（状态、i18n、工具）",
  "blog/assets/js/core/store.js": "全局状态与本地存储键",
  "blog/assets/js/core/i18n.js": "中英双语字典与切换逻辑",
  "blog/assets/js/core/utils.js": "通用工具函数",

  "blog/assets/js/data": "数据层（内容数据）",
  "blog/assets/js/data/content.js": "文章/知识卡/统计/书单等结构化数据",

  "blog/assets/js/features": "功能层（按业务模块拆分）",
  "blog/assets/js/features/static-sections.js": "静态区块渲染（Hero、话题、统计、书单）",
  "blog/assets/js/features/posts.js": "文章列表渲染与分类筛选",
  "blog/assets/js/features/knowledge.js": "知识库搜索、标签筛选与卡片渲染",
  "blog/assets/js/features/theme.js": "自动日夜主题模块：时间驱动主题与主页时钟",
  "blog/assets/js/features/effects.js": "视觉动效与交互效果（reveal/tilt/spotlight 等）"
};

function normalize(value) {
  return value.replace(/\\/g, "/");
}

function abs(relPath) {
  return path.join(repoRoot, relPath);
}

function entrySorter(a, b) {
  if (a.isDirectory() !== b.isDirectory()) {
    return a.isDirectory() ? -1 : 1;
  }
  return a.name.localeCompare(b.name, "en");
}

function walkRel(relDir, options = {}) {
  const includeSelf = options.includeSelf ?? true;
  const result = [];

  const startPath = abs(relDir);
  if (!fs.existsSync(startPath)) {
    return result;
  }

  const stat = fs.statSync(startPath);
  if (!stat.isDirectory()) {
    return [{ path: normalize(relDir), isDir: false }];
  }

  if (includeSelf) {
    result.push({ path: normalize(relDir), isDir: true });
  }

  function visit(currentRel) {
    const currentAbs = abs(currentRel);
    const dirEntries = fs.readdirSync(currentAbs, { withFileTypes: true }).sort(entrySorter);

    for (const dirent of dirEntries) {
      if (IGNORE_NAMES.has(dirent.name)) {
        continue;
      }

      const childRel = normalize(path.posix.join(currentRel, dirent.name));
      const isDir = dirent.isDirectory();
      result.push({ path: childRel, isDir });

      if (isDir) {
        visit(childRel);
      }
    }
  }

  visit(normalize(relDir));
  return result;
}

function getRootEntries() {
  const items = [];

  for (const rel of ROOT_INCLUDE) {
    const normalizedRel = normalize(rel);
    const targetAbs = abs(normalizedRel);
    if (!fs.existsSync(targetAbs)) {
      continue;
    }

    const stat = fs.statSync(targetAbs);
    if (stat.isDirectory()) {
      items.push(...walkRel(normalizedRel, { includeSelf: true }));
    } else {
      items.push({ path: normalizedRel, isDir: false });
    }
  }

  const dedup = new Map();
  for (const item of items) {
    dedup.set(item.path, item);
  }

  return Array.from(dedup.values()).sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function getBlogEntries() {
  const items = walkRel("blog", { includeSelf: true });
  const dedup = new Map();
  for (const item of items) {
    dedup.set(item.path, item);
  }
  return Array.from(dedup.values()).sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function inferDescription(relPath, isDir) {
  if (EXPLICIT_DESCRIPTIONS[relPath]) {
    return EXPLICIT_DESCRIPTIONS[relPath];
  }

  if (isDir) {
    return "目录";
  }

  if (relPath.endsWith(".css")) return "样式文件";
  if (relPath.endsWith(".js") || relPath.endsWith(".mjs")) return "脚本文件";
  if (relPath.endsWith(".md")) return "说明文档";
  if (relPath.endsWith(".html")) return "页面文件";
  if (relPath.endsWith(".yml") || relPath.endsWith(".yaml")) return "工作流/配置文件";
  return "文件";
}

function toMarkdownTable(entries) {
  const header = [
    "| 路径 | 类型 | 作用 |",
    "|---|---|---|"
  ];

  const rows = entries.map((entry) => {
    const type = entry.isDir ? "目录" : "文件";
    const description = inferDescription(entry.path, entry.isDir);
    return `| \`${entry.path}\` | ${type} | ${description} |`;
  });

  return [...header, ...rows].join("\n");
}

function replaceSection(content, startMarker, endMarker, nextBlock) {
  const wrapped = `${startMarker}\n${nextBlock}\n${endMarker}`;

  if (content.includes(startMarker) && content.includes(endMarker)) {
    const reg = new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`, "m");
    return content.replace(reg, wrapped);
  }

  const spacer = content.endsWith("\n") ? "\n" : "\n\n";
  return `${content}${spacer}${wrapped}\n`;
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function ensureRootReadmeTemplate() {
  if (fs.existsSync(ROOT_README)) {
    return;
  }

  const template = [
    "# MYBLOG",
    "",
    "TPBLOG 是一个个人博客 + 知识库项目，包含文章、知识卡片、统计看板和书单。",
    "",
    "## 项目特性",
    "",
    "- 博客文章与分类筛选",
    "- 知识库搜索与标签过滤",
    "- 自动日夜主题（按本地时间）",
    "- 中英双语切换与 iOS 风格界面",
    "- 中英双语切换与动效体验",
    "",
    "## 仓库结构（自动生成）",
    "",
    ROOT_SECTION_START,
    "",
    ROOT_SECTION_END,
    "",
    "## README 自动同步机制",
    "",
    "- 同步脚本：`node scripts/sync-readme.mjs`",
    "- 本地自动触发：`.githooks/pre-commit`",
    "- 远端自动触发：`.github/workflows/readme-sync.yml`",
    ""
  ].join("\n");

  fs.writeFileSync(ROOT_README, template, "utf8");
}

function ensureBlogReadmeTemplate() {
  if (fs.existsSync(BLOG_README)) {
    return;
  }

  const template = [
    "# TPBLOG Frontend",
    "",
    "## 目录结构（自动生成）",
    "",
    BLOG_SECTION_START,
    "",
    BLOG_SECTION_END,
    ""
  ].join("\n");

  fs.writeFileSync(BLOG_README, template, "utf8");
}

function syncReadmes() {
  ensureRootReadmeTemplate();
  ensureBlogReadmeTemplate();

  const rootContent = fs.readFileSync(ROOT_README, "utf8");
  const blogContent = fs.readFileSync(BLOG_README, "utf8");

  const rootTable = toMarkdownTable(getRootEntries());
  const blogTable = toMarkdownTable(getBlogEntries());

  const nextRoot = replaceSection(rootContent, ROOT_SECTION_START, ROOT_SECTION_END, rootTable);
  const nextBlog = replaceSection(blogContent, BLOG_SECTION_START, BLOG_SECTION_END, blogTable);

  fs.writeFileSync(ROOT_README, nextRoot, "utf8");
  fs.writeFileSync(BLOG_README, nextBlog, "utf8");
}

syncReadmes();
console.log("README files synchronized.");
