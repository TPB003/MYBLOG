#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const markdownDir = path.join(repoRoot, "blog", "content", "knowledge");
const outputModulePath = path.join(repoRoot, "blog", "assets", "js", "data", "knowledge-generated.js");
const knowledgePageDir = path.join(repoRoot, "blog", "knowledge");

const GENERATED_PAGE_PREFIX = "generated-";
const GENERATED_PAGE_MARKER = "AUTO-GENERATED:MD-KNOWLEDGE";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, "/");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, "utf8");
}

function normalizeNewline(value) {
  return value.replace(/\r\n/g, "\n");
}

function parseFrontMatter(raw) {
  const source = normalizeNewline(raw);
  if (!source.startsWith("---\n")) {
    return { meta: {}, body: source.trim() };
  }

  const closeIndex = source.indexOf("\n---\n", 4);
  if (closeIndex === -1) {
    return { meta: {}, body: source.trim() };
  }

  const header = source.slice(4, closeIndex).trim();
  const body = source.slice(closeIndex + 5).trim();
  const meta = {};

  header.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key) {
      meta[key] = value;
    }
  });

  return { meta, body };
}

function normalizeDate(value, fallbackDate) {
  const normalized = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  return fallbackDate;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function stripInlineMarkdown(value) {
  return String(value || "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeading(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? stripInlineMarkdown(match[1]) : "";
}

function extractParagraphs(markdownBody) {
  const normalized = normalizeNewline(markdownBody);
  const noCodeFences = normalized.replace(/```[\s\S]*?```/g, (block) => {
    return block
      .split("\n")
      .filter((line) => !line.trim().startsWith("```"))
      .join(" ");
  });

  return noCodeFences
    .split(/\n\s*\n/g)
    .map((chunk) => {
      return chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^#{1,6}\s+/, ""))
        .map((line) => line.replace(/^[-*+]\s+/, ""))
        .map((line) => line.replace(/^\d+\.\s+/, ""))
        .join(" ");
    })
    .map(stripInlineMarkdown)
    .filter(Boolean);
}

function inferSummary(paragraphs, fallback) {
  if (paragraphs.length > 0) return paragraphs[0];
  return fallback || "No summary provided.";
}

function splitMarkdownByLocale(body) {
  const parts = normalizeNewline(body).split(/\n<!--\s*EN\s*-->\s*\n/i);
  const zhPart = (parts[0] || "").trim();
  const enPart = (parts[1] || "").trim();
  return { zhPart, enPart };
}

function parseTags(rawTags) {
  const source = String(rawTags || "").trim();
  if (!source) return ["general"];
  const items = source
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, "-").toLowerCase());
  return items.length > 0 ? items : ["general"];
}

function titleCase(value) {
  return String(value)
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferTagLabel(tag) {
  if (/[\u4e00-\u9fff]/.test(tag)) return tag;
  return titleCase(tag);
}

function readAssetVersion() {
  const indexPath = path.join(repoRoot, "blog", "index.html");
  if (!fs.existsSync(indexPath)) return "latest";
  const indexContent = readText(indexPath);
  const match = indexContent.match(/assets\/css\/main\.css\?v=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : "latest";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildArticleHtml(cardId, version) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TPBLOG Knowledge</title>
  <meta name="description" content="TPBLOG knowledge article.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/main.css?v=${escapeHtml(version)}">
  <link rel="stylesheet" href="../assets/css/knowledge-article.css?v=${escapeHtml(version)}">
</head>
<body data-card-id="${escapeHtml(cardId)}">
  <!-- ${GENERATED_PAGE_MARKER} -->
  <div class="aurora-layer" aria-hidden="true"></div>
  <div class="noise-layer" aria-hidden="true"></div>
  <div class="spotlight" id="spotlight" aria-hidden="true"></div>

  <header class="site-header" id="top">
    <div class="header-inner">
      <nav class="main-nav">
        <a class="brand" href="../index.html">TPBLOG</a>
        <a href="../index.html" data-back-home>Back Home</a>
        <a href="../index.html#knowledge" data-back-knowledge>Knowledge Index</a>
      </nav>
      <div class="header-actions">
        <button id="themeToggle" class="theme-toggle" type="button">AUTO</button>
        <button id="localeToggle" class="locale-toggle" type="button">EN</button>
      </div>
    </div>
  </header>

  <main class="article-shell">
    <section class="article-head">
      <p id="articleKicker" class="article-kicker">KNOWLEDGE ARTICLE</p>
      <h1 id="articleTitle" class="article-title"></h1>
      <p id="articleSummary" class="article-summary"></p>
      <div class="article-meta">
        <span id="articleUpdated" class="meta-pill"></span>
        <span id="articleReading" class="meta-pill"></span>
        <span id="articleReads" class="meta-pill"></span>
      </div>
      <div id="articleTags" class="article-tags"></div>
    </section>

    <section class="article-card">
      <div id="articleFallback" class="article-empty" hidden></div>
      <div id="articleContent" class="article-content"></div>
      <div class="article-actions">
        <a href="../index.html#knowledge" class="article-link primary" data-back-knowledge>Knowledge Index</a>
        <a href="../index.html" class="article-link" data-back-home>Back Home</a>
      </div>
    </section>
  </main>

  <script type="module" src="../assets/js/pages/knowledge-article.js?v=${escapeHtml(version)}"></script>
</body>
</html>
`;
}

function main() {
  ensureDir(markdownDir);
  ensureDir(path.dirname(outputModulePath));
  ensureDir(knowledgePageDir);

  const version = readAssetVersion();
  const fileEntries = fs
    .readdirSync(markdownDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .filter((entry) => !entry.name.startsWith("_"))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const cards = [];
  const tagLabels = {};
  const usedIds = new Set();
  const usedSlugs = new Set();
  const generatedPageNames = new Set();

  for (const fileEntry of fileEntries) {
    const absPath = path.join(markdownDir, fileEntry.name);
    const basename = path.basename(fileEntry.name, ".md");
    const rawText = readText(absPath);
    const { meta, body } = parseFrontMatter(rawText);
    const fileMtime = fs.statSync(absPath).mtime.toISOString().slice(0, 10);
    const splitBody = splitMarkdownByLocale(body);
    const zhParagraphs = extractParagraphs(splitBody.zhPart);
    const enParagraphs = splitBody.enPart ? extractParagraphs(splitBody.enPart) : [];

    const inferredTitle = extractHeading(splitBody.zhPart) || basename;
    const slugSource = meta.slug || basename;
    let slug = slugify(slugSource) || slugify(basename) || `md-${Date.now()}`;
    let slugSuffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slug}-${slugSuffix}`;
      slugSuffix += 1;
    }
    usedSlugs.add(slug);

    const baseId = String(meta.id || `kb-md-${slug}`).trim();
    let id = baseId;
    let idSuffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${idSuffix}`;
      idSuffix += 1;
    }
    usedIds.add(id);

    const titleZh = String(meta.title || inferredTitle).trim();
    const titleEn = String(meta.title_en || meta.titleEn || titleZh).trim();
    const summaryZh = String(meta.summary || inferSummary(zhParagraphs, titleZh)).trim();
    const summaryEn = String(meta.summary_en || meta.summaryEn || inferSummary(enParagraphs, summaryZh)).trim();
    const updated = normalizeDate(meta.updated, fileMtime);
    const readingZh = String(meta.reading || "5 分钟阅读").trim();
    const readingEn = String(meta.reading_en || meta.readingEn || "5 min read").trim();
    const tags = parseTags(meta.tags);
    const pageName = `${GENERATED_PAGE_PREFIX}${slug}.html`;
    const pagePath = `./knowledge/${pageName}`;

    const card = {
      id,
      slug,
      page: pagePath,
      tags,
      updated,
      reading: { zh: readingZh, en: readingEn },
      title: { zh: titleZh, en: titleEn },
      summary: { zh: summaryZh, en: summaryEn },
      content: {
        zh: zhParagraphs.length > 0 ? zhParagraphs : [summaryZh],
        en: enParagraphs.length > 0 ? enParagraphs : zhParagraphs.length > 0 ? zhParagraphs : [summaryEn]
      }
    };

    cards.push(card);
    generatedPageNames.add(pageName);

    tags.forEach((tag) => {
      if (!tagLabels[tag]) {
        const label = inferTagLabel(tag);
        tagLabels[tag] = { zh: label, en: label };
      }
    });
  }

  const generatedModule = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: blog/content/knowledge/*.md

export const generatedKnowledgeCards = ${JSON.stringify(cards, null, 2)};

export const generatedKnowledgeTagLabels = ${JSON.stringify(tagLabels, null, 2)};
`;
  writeText(outputModulePath, generatedModule);

  const existingPages = fs
    .readdirSync(knowledgePageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(GENERATED_PAGE_PREFIX) && entry.name.endsWith(".html"))
    .map((entry) => entry.name);

  existingPages.forEach((name) => {
    const absPath = path.join(knowledgePageDir, name);
    const text = readText(absPath);
    if (!text.includes(GENERATED_PAGE_MARKER)) return;
    if (!generatedPageNames.has(name)) {
      fs.rmSync(absPath);
    }
  });

  cards.forEach((card) => {
    const pageName = `${GENERATED_PAGE_PREFIX}${card.slug}.html`;
    const pageAbsPath = path.join(knowledgePageDir, pageName);
    const html = buildArticleHtml(card.id, version);
    writeText(pageAbsPath, html);
  });

  const relativeMarkdownDir = toPosix(path.relative(repoRoot, markdownDir));
  const relativeModulePath = toPosix(path.relative(repoRoot, outputModulePath));
  console.log(
    `[knowledge-md] generated ${cards.length} cards from ${relativeMarkdownDir} -> ${relativeModulePath}`
  );
}

main();
