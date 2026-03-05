import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * 将 Markdown 字符串转为安全的 HTML，用于 v-html 展示
 */
export function renderMarkdown(md: string): string {
  if (!md || typeof md !== "string") return "";
  const rawHtml = marked(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "code", "pre", "blockquote",
      "a", "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}
