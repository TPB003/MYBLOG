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

const IGNORE_NAMES = new Set([".git", ".vscode", "node_modules", "run-logs"]);

// Keep legacy admin route files out of docs if they still exist as stubs.
const HIDDEN_PATHS = new Set();

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
  "README.md": "Repository overview and usage guide.",
  "deploy-blog-pages.sh": "One-command Linux deployment script for GitHub Pages.",
  "deploy-blog-pages.ps1": "One-command PowerShell deployment script for GitHub Pages.",

  ".github": "GitHub configuration directory.",
  ".github/workflows": "GitHub Actions workflows.",
  ".github/workflows/deploy-pages.yml": "Pages deployment workflow.",
  ".github/workflows/readme-sync.yml": "Automatic README sync workflow.",

  "scripts": "Automation scripts.",
  "scripts/generate-knowledge-from-md.mjs": "Generate knowledge/book index and article pages from Markdown.",
  "scripts/sync-readme.mjs": "Auto-generate repository structure sections in README files.",

  ".githooks": "Local git hooks directory.",
  ".githooks/pre-commit": "Pre-commit hook to refresh README structure tables.",

  "blog": "Static blog frontend project.",
  "blog/.nojekyll": "Disable Jekyll processing on GitHub Pages.",
  "blog/DEPLOY.md": "Deployment notes.",
  "blog/README.md": "Project-level structure and maintenance notes.",
  "blog/index.html": "Main website entry page.",

  "blog/assets": "Static assets.",
  "blog/assets/css": "Stylesheets.",
  "blog/assets/css/main.css": "CSS entrypoint importing all style modules.",
  "blog/assets/css/tokens.css": "Design tokens for colors, spacing, and radii.",
  "blog/assets/css/base.css": "Base/global styles.",
  "blog/assets/css/layout.css": "Global layout and header/footer styles.",
  "blog/assets/css/sections.css": "Section-specific styles.",
  "blog/assets/css/effects.css": "Interactive effects and animations.",
  "blog/assets/css/responsive.css": "Responsive breakpoints and mobile overrides.",

  "blog/assets/js": "Frontend scripts.",
  "blog/assets/js/main.js": "Application bootstrap and module initialization.",
  "blog/assets/js/core": "Core runtime modules.",
  "blog/assets/js/core/store.js": "Global state and storage key constants.",
  "blog/assets/js/core/i18n.js": "Bilingual dictionary and i18n runtime.",
  "blog/assets/js/core/utils.js": "Utility helpers.",
  "blog/assets/js/core/markdown.js": "Markdown renderer used by article pages.",

  "blog/assets/js/data": "Content data modules.",
  "blog/assets/js/data/content.js": "Hand-authored content data.",
  "blog/assets/js/data/knowledge-generated.js": "Generated knowledge card data.",
  "blog/assets/js/data/knowledge-index.js": "Merged knowledge export.",
  "blog/assets/js/data/books-generated.js": "Generated reading list data.",
  "blog/assets/js/data/books-index.js": "Merged books export.",

  "blog/assets/js/features": "UI feature modules.",
  "blog/assets/js/features/static-sections.js": "Render static sections (hero/stats/books).",
  "blog/assets/js/features/posts.js": "Post list render and interactions.",
  "blog/assets/js/features/knowledge.js": "Knowledge search/tag/filter rendering.",
  "blog/assets/js/features/read-metrics.js": "Read count storage and aggregation.",
  "blog/assets/js/features/theme.js": "Day/night mode runtime.",
  "blog/assets/js/features/header.js": "Header visibility behavior on scroll.",
  "blog/assets/js/features/landing.js": "Top launchpad interactions and dynamic status.",
  "blog/assets/js/features/effects.js": "Reveal/tilt/spotlight effects.",

  "blog/assets/js/pages": "Standalone page scripts.",
  "blog/assets/js/pages/knowledge-article.js": "Knowledge article page runtime.",
  "blog/assets/js/pages/book-article.js": "Book article page runtime.",

  "blog/content": "Markdown content source.",
  "blog/content/knowledge": "Knowledge Markdown sources.",
  "blog/content/books": "Book Markdown sources.",
  "blog/knowledge": "Generated and static knowledge article pages.",
  "blog/books": "Generated and static book article pages."
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

  if (!fs.existsSync(startPath)) return result;

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
      if (IGNORE_NAMES.has(dirent.name)) continue;
      const childRel = normalize(path.posix.join(currentRel, dirent.name));
      if (HIDDEN_PATHS.has(childRel)) continue;

      const isDir = dirent.isDirectory();
      result.push({ path: childRel, isDir });
      if (isDir) visit(childRel);
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
    if (!fs.existsSync(targetAbs)) continue;

    const stat = fs.statSync(targetAbs);
    if (stat.isDirectory()) {
      items.push(...walkRel(normalizedRel, { includeSelf: true }));
    } else {
      items.push({ path: normalizedRel, isDir: false });
    }
  }

  const dedup = new Map();
  for (const item of items) dedup.set(item.path, item);
  return Array.from(dedup.values()).sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function getBlogEntries() {
  const items = walkRel("blog", { includeSelf: true });
  const dedup = new Map();
  for (const item of items) dedup.set(item.path, item);
  return Array.from(dedup.values()).sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function inferDescription(relPath, isDir) {
  if (EXPLICIT_DESCRIPTIONS[relPath]) return EXPLICIT_DESCRIPTIONS[relPath];
  if (isDir) return "Directory";

  if (relPath.endsWith(".css")) return "Stylesheet file.";
  if (relPath.endsWith(".js") || relPath.endsWith(".mjs")) return "Script file.";
  if (relPath.endsWith(".md")) return "Markdown document.";
  if (relPath.endsWith(".html")) return "HTML page.";
  if (relPath.endsWith(".yml") || relPath.endsWith(".yaml")) return "Workflow/config file.";
  return "File";
}

function toMarkdownTable(entries) {
  const header = [
    "| Path | Type | Purpose |",
    "|---|---|---|"
  ];

  const rows = entries.map((entry) => {
    const type = entry.isDir ? "Directory" : "File";
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
  if (fs.existsSync(ROOT_README)) return;

  const template = [
    "# MYBLOG",
    "",
    "TPBLOG personal blog + knowledge base.",
    "",
    "## Repository Structure",
    "",
    ROOT_SECTION_START,
    "",
    ROOT_SECTION_END,
    "",
    "## README Auto Sync",
    "",
    "- Sync script: `node scripts/sync-readme.mjs`",
    "- Local trigger: `.githooks/pre-commit`",
    "- CI trigger: `.github/workflows/readme-sync.yml`",
    ""
  ].join("\n");

  fs.writeFileSync(ROOT_README, template, "utf8");
}

function ensureBlogReadmeTemplate() {
  if (fs.existsSync(BLOG_README)) return;

  const template = [
    "# TPBLOG Frontend",
    "",
    "## Project Structure",
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


