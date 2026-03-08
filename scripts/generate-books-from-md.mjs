#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const markdownSourceDirs = [
  path.join(repoRoot, "blog", "content", "books"),
  path.join(repoRoot, "blog", "books")
];

const outputModulePath = path.join(repoRoot, "blog", "assets", "js", "data", "books-generated.js");
const bookPageDir = path.join(repoRoot, "blog", "books");

const GENERATED_PAGE_PREFIX = "generated-";
const GENERATED_PAGE_MARKER = "AUTO-GENERATED:MD-BOOKS";
const GOOGLE_TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TRANSLATE_CHUNK_LIMIT = 1200;
const AUTO_TRANSLATE_ENABLED = process.env.TPBLOG_AUTO_TRANSLATE !== "0";
const TRANSLATE_PROVIDER = String(process.env.TPBLOG_TRANSLATE_PROVIDER || "").trim().toLowerCase();
const OPENAI_API_KEY = String(process.env.TPBLOG_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = String(process.env.TPBLOG_OPENAI_MODEL || "gpt-4.1-mini").trim();
const OPENAI_BASE_URL = String(
  process.env.TPBLOG_OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions"
).trim();

const translationCache = new Map();
const translationWarnedPairs = new Set();

function resolveTranslateProvider() {
  if (!AUTO_TRANSLATE_ENABLED) return "disabled";
  if (TRANSLATE_PROVIDER) return TRANSLATE_PROVIDER;
  if (OPENAI_API_KEY) return "openai";
  return "google";
}

const ACTIVE_TRANSLATE_PROVIDER = resolveTranslateProvider();

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, "utf8");
}

function normalizeNewline(value) {
  return String(value || "").replace(/\r\n/g, "\n");
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, "/");
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
    if (key) meta[key] = value;
  });

  return { meta, body };
}

function pickMeta(meta, keys) {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(meta, key)) continue;
    const value = String(meta[key] ?? "").trim();
    if (value) return value;
  }
  return "";
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
  const primaryPart = (parts[0] || "").trim();
  const enPart = (parts[1] || "").trim();
  return { primaryPart, enPart };
}

function normalizeLocale(value) {
  const source = String(value || "").trim().toLowerCase();
  if (!source) return "";
  if (source.startsWith("zh")) return "zh";
  if (source.startsWith("en")) return "en";
  return "";
}

function detectLocaleFromText(value) {
  const source = String(value || "");
  const zhCount = (source.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinCount = (source.match(/[a-zA-Z]/g) || []).length;

  if (zhCount > 0 && latinCount === 0) return "zh";
  if (latinCount > 0 && zhCount === 0) return "en";
  if (zhCount >= latinCount) return "zh";
  return "en";
}

function splitTextForTranslate(value, maxChars = TRANSLATE_CHUNK_LIMIT) {
  const source = normalizeNewline(value);
  if (!source) return [];
  if (source.length <= maxChars) return [source];

  const units = source.split(/(\n\s*\n)/);
  const chunks = [];
  let current = "";

  const pushCurrent = () => {
    if (!current) return;
    chunks.push(current);
    current = "";
  };

  const appendUnit = (unit) => {
    if (!unit) return;
    if (unit.length > maxChars) {
      for (let i = 0; i < unit.length; i += maxChars) {
        const piece = unit.slice(i, i + maxChars);
        if ((current + piece).length > maxChars) pushCurrent();
        current += piece;
        pushCurrent();
      }
      return;
    }
    if ((current + unit).length > maxChars && current) pushCurrent();
    current += unit;
  };

  units.forEach((unit) => appendUnit(unit));
  pushCurrent();
  return chunks;
}

function splitMarkdownSegments(value) {
  const source = normalizeNewline(value);
  const segments = [];
  const codeFencePattern = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match = codeFencePattern.exec(source);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: source.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", value: match[0] });
    lastIndex = match.index + match[0].length;
    match = codeFencePattern.exec(source);
  }

  if (lastIndex < source.length) {
    segments.push({ type: "text", value: source.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", value: source }];
}

function parseTranslatePayload(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return "";
  return payload[0]
    .map((item) => (Array.isArray(item) && item[0] ? String(item[0]) : ""))
    .join("");
}

function warnTranslateFailure(from, to, error) {
  const key = `${ACTIVE_TRANSLATE_PROVIDER}:${from}->${to}`;
  if (translationWarnedPairs.has(key)) return;
  translationWarnedPairs.add(key);
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[books-md] auto-translate fallback for ${key}: ${message}`);
}

function parseOpenAiMessageContent(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      if (typeof item.text === "string") return item.text;
      return "";
    })
    .join("");
}

async function requestGoogleTranslate(text, from, to) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: from,
    tl: to,
    dt: "t",
    q: text
  });

  const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?${params.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const translated = parseTranslatePayload(payload);
  if (!translated.trim()) throw new Error("empty translation result");
  return translated;
}

async function requestOpenAiTranslate(text, from, to) {
  if (!OPENAI_API_KEY) throw new Error("missing TPBLOG_OPENAI_API_KEY");

  const response = await fetch(OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Translate from ${from} to ${to}. Preserve Markdown syntax, links, and code fences. Return only translated text.`
        },
        {
          role: "user",
          content: text
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const choice = payload?.choices?.[0]?.message?.content;
  const translated = parseOpenAiMessageContent(choice).trim();
  if (!translated) throw new Error("empty openai translation result");
  return translated;
}

async function requestTranslate(text, from, to) {
  if (ACTIVE_TRANSLATE_PROVIDER === "openai") {
    return requestOpenAiTranslate(text, from, to);
  }
  return requestGoogleTranslate(text, from, to);
}

async function translatePlainText(value, from, to) {
  const source = normalizeNewline(value).trim();
  if (!source || from === to) return source;
  if (!AUTO_TRANSLATE_ENABLED) return source;

  const cacheKey = `${from}->${to}:${source}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const chunks = splitTextForTranslate(source);
  const translatedChunks = [];
  for (const chunk of chunks) {
    try {
      translatedChunks.push(await requestTranslate(chunk, from, to));
    } catch (error) {
      warnTranslateFailure(from, to, error);
      translatedChunks.push(chunk);
    }
  }

  const translated = translatedChunks.join("").trim() || source;
  translationCache.set(cacheKey, translated);
  return translated;
}

async function translateMarkdown(value, from, to) {
  const source = normalizeNewline(value).trim();
  if (!source || from === to) return source;
  if (!AUTO_TRANSLATE_ENABLED) return source;

  const cacheKey = `md:${from}->${to}:${source}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const segments = splitMarkdownSegments(source);
  const translatedSegments = [];
  for (const segment of segments) {
    if (segment.type === "code") {
      translatedSegments.push(segment.value);
      continue;
    }
    translatedSegments.push(await translatePlainText(segment.value, from, to));
  }

  const translated = translatedSegments.join("").trim() || source;
  translationCache.set(cacheKey, translated);
  return translated;
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

function buildBookHtml(bookId, version) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TPBLOG Book Note</title>
  <meta name="description" content="TPBLOG book article.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/main.css?v=${escapeHtml(version)}">
  <link rel="stylesheet" href="../assets/css/book-article.css?v=${escapeHtml(version)}">
</head>
<body data-book-id="${escapeHtml(bookId)}">
  <!-- ${GENERATED_PAGE_MARKER} -->
  <div class="aurora-layer" aria-hidden="true"></div>
  <div class="noise-layer" aria-hidden="true"></div>
  <div class="spotlight" id="spotlight" aria-hidden="true"></div>

  <header class="site-header" id="top">
    <div class="header-inner">
      <nav class="main-nav">
        <a class="brand" href="../index.html">TPBLOG</a>
        <a href="../index.html" data-back-home>Back Home</a>
        <a href="../index.html#books" data-back-books>Back to Books</a>
      </nav>
      <div class="header-actions">
        <button id="themeToggle" class="theme-toggle" type="button">AUTO</button>
        <button id="localeToggle" class="locale-toggle" type="button">EN</button>
      </div>
    </div>
  </header>

  <main class="article-shell">
    <section class="article-head">
      <p id="articleKicker" class="article-kicker">BOOK NOTE</p>
      <h1 id="articleTitle" class="article-title"></h1>
      <p id="articleSummary" class="article-summary"></p>
      <div class="article-meta">
        <span id="articleAuthor" class="meta-pill"></span>
        <span id="articleUpdated" class="meta-pill"></span>
        <span id="articleReading" class="meta-pill"></span>
        <span id="articleReads" class="meta-pill"></span>
      </div>
    </section>

    <section class="article-card">
      <div id="articleFallback" class="article-empty" hidden></div>
      <div id="articleCover" class="article-cover" hidden></div>
      <div id="articleContent" class="article-content"></div>
      <div class="article-actions">
        <a href="../index.html#books" class="article-link primary" data-back-books>Back to Books</a>
        <a href="../index.html" class="article-link" data-back-home>Back Home</a>
      </div>
    </section>
  </main>

  <script type="module" src="../assets/js/pages/book-article.js?v=${escapeHtml(version)}"></script>
</body>
</html>
`;
}

async function main() {
  markdownSourceDirs.forEach((dir) => ensureDir(dir));
  ensureDir(path.dirname(outputModulePath));
  ensureDir(bookPageDir);

  const version = readAssetVersion();
  const fileEntries = markdownSourceDirs
    .flatMap((dir) => {
      return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
        .filter((entry) => !entry.name.startsWith("_"))
        .map((entry) => ({
          absPath: path.join(dir, entry.name),
          sourceDir: dir,
          name: entry.name
        }));
    })
    .sort((a, b) => {
      const dirOrder = markdownSourceDirs.indexOf(a.sourceDir) - markdownSourceDirs.indexOf(b.sourceDir);
      if (dirOrder !== 0) return dirOrder;
      return a.name.localeCompare(b.name, "en");
    });

  const cards = [];
  const generatedPageNames = new Set();
  const usedIds = new Set();
  const usedSlugs = new Set();

  for (const fileEntry of fileEntries) {
    const absPath = fileEntry.absPath;
    const basename = path.basename(fileEntry.name, ".md");
    const rawText = readText(absPath);
    const { meta, body } = parseFrontMatter(rawText);
    const fileMtime = fs.statSync(absPath).mtime.toISOString().slice(0, 10);
    const splitBody = splitMarkdownByLocale(body);

    const sourceLocaleFromMeta = normalizeLocale(
      pickMeta(meta, ["lang", "locale", "language", "source_lang", "sourceLocale"])
    );
    const sourceLocale = sourceLocaleFromMeta || detectLocaleFromText(splitBody.primaryPart);
    const hasManualEnSection = Boolean(splitBody.enPart);

    let markdownZh = "";
    let markdownEn = "";
    if (hasManualEnSection) {
      markdownZh = splitBody.primaryPart;
      markdownEn = splitBody.enPart;
    } else if (sourceLocale === "en") {
      markdownEn = splitBody.primaryPart;
      markdownZh = await translateMarkdown(markdownEn, "en", "zh");
    } else {
      markdownZh = splitBody.primaryPart;
      markdownEn = await translateMarkdown(markdownZh, "zh", "en");
    }

    if (!markdownZh && markdownEn) markdownZh = await translateMarkdown(markdownEn, "en", "zh");
    if (!markdownEn && markdownZh) markdownEn = await translateMarkdown(markdownZh, "zh", "en");
    if (!markdownZh && !markdownEn) continue;

    const zhParagraphs = extractParagraphs(markdownZh);
    const enParagraphs = extractParagraphs(markdownEn);
    const inferredTitleZh = extractHeading(markdownZh);
    const inferredTitleEn = extractHeading(markdownEn);

    const genericTitle = pickMeta(meta, ["title"]);
    let titleZh = pickMeta(meta, ["title_zh", "titleZh"]);
    let titleEn = pickMeta(meta, ["title_en", "titleEn"]);

    if (!titleZh && sourceLocale !== "en") titleZh = genericTitle;
    if (!titleEn && sourceLocale === "en") titleEn = genericTitle;
    if (!titleZh) titleZh = inferredTitleZh;
    if (!titleEn) titleEn = inferredTitleEn;
    if (!titleZh && titleEn) titleZh = await translatePlainText(titleEn, "en", "zh");
    if (!titleEn && titleZh) titleEn = await translatePlainText(titleZh, "zh", "en");
    if (!titleZh) titleZh = basename;
    if (!titleEn) titleEn = titleZh;

    const genericSummary = pickMeta(meta, ["summary"]);
    let summaryZh = pickMeta(meta, ["summary_zh", "summaryZh"]);
    let summaryEn = pickMeta(meta, ["summary_en", "summaryEn"]);
    if (!summaryZh && sourceLocale !== "en") summaryZh = genericSummary;
    if (!summaryEn && sourceLocale === "en") summaryEn = genericSummary;
    if (!summaryZh) summaryZh = inferSummary(zhParagraphs, titleZh);
    if (!summaryEn) summaryEn = inferSummary(enParagraphs, titleEn);
    if (!summaryZh && summaryEn) summaryZh = await translatePlainText(summaryEn, "en", "zh");
    if (!summaryEn && summaryZh) summaryEn = await translatePlainText(summaryZh, "zh", "en");
    if (!summaryZh) summaryZh = titleZh;
    if (!summaryEn) summaryEn = titleEn;

    const genericAuthor = pickMeta(meta, ["author"]);
    let authorZh = pickMeta(meta, ["author_zh", "authorZh"]);
    let authorEn = pickMeta(meta, ["author_en", "authorEn"]);
    if (!authorZh && sourceLocale !== "en") authorZh = genericAuthor;
    if (!authorEn && sourceLocale === "en") authorEn = genericAuthor;
    if (!authorZh && authorEn) authorZh = await translatePlainText(authorEn, "en", "zh");
    if (!authorEn && authorZh) authorEn = await translatePlainText(authorZh, "zh", "en");

    const genericReading = pickMeta(meta, ["reading"]);
    let readingZh = pickMeta(meta, ["reading_zh", "readingZh"]);
    let readingEn = pickMeta(meta, ["reading_en", "readingEn"]);
    if (!readingZh && sourceLocale !== "en") readingZh = genericReading;
    if (!readingEn && sourceLocale === "en") readingEn = genericReading;
    if (!readingZh) readingZh = "8 分钟阅读";
    if (!readingEn) readingEn = "8 min read";

    const cover = pickMeta(meta, ["cover", "image", "poster"]);
    const slugSource = pickMeta(meta, ["slug"]) || basename;
    let slug = slugify(slugSource) || slugify(basename) || `book-${Date.now()}`;
    let slugSuffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slug}-${slugSuffix}`;
      slugSuffix += 1;
    }
    usedSlugs.add(slug);

    const baseId = String(pickMeta(meta, ["id"]) || `book-md-${slug}`).trim();
    let id = baseId;
    let idSuffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${idSuffix}`;
      idSuffix += 1;
    }
    usedIds.add(id);

    const updated = normalizeDate(pickMeta(meta, ["updated"]), fileMtime);
    const pageName = `${GENERATED_PAGE_PREFIX}${slug}.html`;
    const pagePath = `./books/${pageName}`;

    cards.push({
      id,
      slug,
      page: pagePath,
      cover,
      updated,
      reading: { zh: readingZh, en: readingEn },
      title: { zh: titleZh, en: titleEn },
      summary: { zh: summaryZh, en: summaryEn },
      author: { zh: authorZh, en: authorEn },
      content: {
        zh: zhParagraphs.length ? zhParagraphs : [summaryZh],
        en: enParagraphs.length ? enParagraphs : [summaryEn]
      },
      contentMarkdown: {
        zh: markdownZh || summaryZh,
        en: markdownEn || summaryEn
      },
      source: toPosix(path.relative(repoRoot, absPath))
    });

    generatedPageNames.add(pageName);
  }

  const generatedModule = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: blog/content/books/*.md + blog/books/*.md

export const generatedBooks = ${JSON.stringify(cards, null, 2)};
`;
  writeText(outputModulePath, generatedModule);

  const existingPages = fs
    .readdirSync(bookPageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(GENERATED_PAGE_PREFIX) && entry.name.endsWith(".html"))
    .map((entry) => entry.name);

  existingPages.forEach((name) => {
    const absPath = path.join(bookPageDir, name);
    const text = readText(absPath);
    if (!text.includes(GENERATED_PAGE_MARKER)) return;
    if (!generatedPageNames.has(name)) {
      fs.rmSync(absPath);
    }
  });

  cards.forEach((card) => {
    const pageName = `${GENERATED_PAGE_PREFIX}${card.slug}.html`;
    const pageAbsPath = path.join(bookPageDir, pageName);
    const html = buildBookHtml(card.id, version);
    writeText(pageAbsPath, html);
  });

  const relativeMarkdownDirs = markdownSourceDirs
    .map((dir) => toPosix(path.relative(repoRoot, dir)))
    .join(", ");
  const relativeModulePath = toPosix(path.relative(repoRoot, outputModulePath));
  console.log(
    `[books-md] generated ${cards.length} books from ${relativeMarkdownDirs} -> ${relativeModulePath} (translate: ${ACTIVE_TRANSLATE_PROVIDER})`
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[books-md] generation failed: ${message}`);
  process.exitCode = 1;
});
