import { escapeHTML } from "./utils.js";

function sanitizeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "#";
  if (/^(https?:\/\/|mailto:|\.{0,2}\/|#)/i.test(value)) {
    return value;
  }
  return "#";
}

function renderInline(text) {
  const source = String(text || "");
  const placeholders = [];

  const stash = (html) => {
    const token = `%%MD_${placeholders.length}%%`;
    placeholders.push(html);
    return token;
  };

  let value = source.replace(/`([^`]+)`/g, (_, code) => {
    return stash(`<code>${escapeHTML(code)}</code>`);
  });

  value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, alt, url, title) => {
    const src = escapeHTML(sanitizeUrl(url));
    const safeAlt = escapeHTML(alt || "");
    const safeTitle = title ? ` title="${escapeHTML(title)}"` : "";
    return stash(`<img src="${src}" alt="${safeAlt}"${safeTitle} loading="lazy">`);
  });

  value = value.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, label, url, title) => {
    const href = escapeHTML(sanitizeUrl(url));
    const safeLabel = escapeHTML(label || "");
    const safeTitle = title ? ` title="${escapeHTML(title)}"` : "";
    return stash(`<a href="${href}"${safeTitle} target="_blank" rel="noopener noreferrer">${safeLabel}</a>`);
  });

  value = escapeHTML(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");

  return value.replace(/%%MD_(\d+)%%/g, (_, index) => placeholders[Number(index)] || "");
}

export function renderMarkdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listType = "";
  let listItems = [];
  let quoteLines = [];
  let codeLanguage = "";
  let codeLines = [];
  let inCodeFence = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push(`<p>${renderInline(text)}</p>`);
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    const tag = listType === "ol" ? "ol" : "ul";
    const items = listItems.map((item) => `<li>${renderInline(item)}</li>`).join("");
    blocks.push(`<${tag}>${items}</${tag}>`);
    listType = "";
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    const html = quoteLines.map((line) => renderInline(line)).join("<br>");
    blocks.push(`<blockquote>${html}</blockquote>`);
    quoteLines = [];
  };

  const flushCode = () => {
    if (!inCodeFence) return;
    const languageClass = codeLanguage ? ` class="language-${escapeHTML(codeLanguage)}"` : "";
    const content = escapeHTML(codeLines.join("\n"));
    blocks.push(`<pre><code${languageClass}>${content}</code></pre>`);
    inCodeFence = false;
    codeLanguage = "";
    codeLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (inCodeFence) {
      if (trimmed.startsWith("```")) {
        flushCode();
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      flushQuote();
      inCodeFence = true;
      codeLanguage = trimmed.slice(3).trim();
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push("<hr>");
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(olMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushCode();

  return blocks.join("\n");
}
