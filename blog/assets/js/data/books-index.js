import { books as manualBooks } from "./content.js";
import { generatedBooks } from "./books-generated.js";

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function asText(value, fallback = "") {
  return String(value ?? fallback);
}

function asTextPair(value, fallback = "") {
  if (value && typeof value === "object") {
    return {
      zh: asText(value.zh, fallback),
      en: asText(value.en, fallback)
    };
  }

  const text = asText(value, fallback);
  return { zh: text, en: text };
}

function asLinesPair(value, fallback = "") {
  if (value && typeof value === "object") {
    const zh = Array.isArray(value.zh) ? value.zh.map((line) => asText(line)).filter(Boolean) : [];
    const en = Array.isArray(value.en) ? value.en.map((line) => asText(line)).filter(Boolean) : [];
    return {
      zh: zh.length ? zh : [fallback].filter(Boolean),
      en: en.length ? en : [fallback].filter(Boolean)
    };
  }

  const text = asText(value, fallback);
  const lines = text ? [text] : [];
  return { zh: [...lines], en: [...lines] };
}

function slugify(value) {
  return asText(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function normalizeBook(rawBook, index, source = "manual") {
  const book = rawBook && typeof rawBook === "object" ? deepClone(rawBook) : {};

  const title = asTextPair(book.title, `Book ${index + 1}`);
  const summary = asTextPair(book.summary, "");
  const author = asTextPair(book.author, "");
  const reading = asTextPair(book.reading, source === "generated" ? "8 min read" : "6 min read");
  const slug = asText(book.slug || slugify(title.en || title.zh || `book-${index + 1}`), `book-${index + 1}`);
  const id = asText(book.id || `book-${slug}`, `book-${slug}`);
  const page = asText(book.page || `./books/generated-${slug}.html`);
  const cover = asText(book.cover || "");
  const updated = asText(book.updated || "");

  const contentMarkdown = {
    zh: asText(book.contentMarkdown?.zh || ""),
    en: asText(book.contentMarkdown?.en || "")
  };

  const content = asLinesPair(book.content, summary.zh || title.zh);
  if (!contentMarkdown.zh) contentMarkdown.zh = content.zh.join("\n\n");
  if (!contentMarkdown.en) contentMarkdown.en = content.en.join("\n\n");

  return {
    id,
    slug,
    page,
    cover,
    updated,
    title,
    summary,
    author,
    reading,
    content,
    contentMarkdown,
    source: asText(book.source || source)
  };
}

function dedupeById(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!item || !item.id) return;
    map.set(item.id, item);
  });
  return [...map.values()];
}

const normalizedGenerated = Array.isArray(generatedBooks)
  ? generatedBooks.map((book, index) => normalizeBook(book, index, "generated"))
  : [];

const generatedSlugs = new Set(normalizedGenerated.map((book) => book.slug));

const normalizedManual = Array.isArray(manualBooks)
  ? manualBooks
      .map((book, index) => normalizeBook(book, index, "manual"))
      .filter((book) => !generatedSlugs.has(book.slug))
  : [];

const sourceBooks = normalizedGenerated.length > 0
  ? normalizedGenerated
  : normalizedManual;

export const books = dedupeById(sourceBooks);

