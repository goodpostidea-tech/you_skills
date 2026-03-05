/**
 * 基于名称与描述的本地推断分类，仅做简单正则/关键词匹配。
 * 无法识别的归为「其他」。不修改任何 Skill 文件。
 */

export const INFERRED_CATEGORIES = [
  "文档输出类",
  "设计创作类",
  "工具构建类",
  "知识库类",
  "其他",
] as const;

export type InferredCategory = (typeof INFERRED_CATEGORIES)[number];

const CATEGORY_OTHER: InferredCategory = "其他";

/** 按优先级排列：先匹配的类别优先 */
const RULES: { category: InferredCategory; pattern: RegExp }[] = [
  {
    category: "文档输出类",
    pattern: /word|docx|xlsx|pptx|csv|tsv|pdf|spreadsheet|slide|presentation|memo|letter|template|report|document|合同|简历|表格|文档|watermark|form|ocr/i,
  },
  {
    category: "设计创作类",
    pattern: /design|poster|art|layout|html|css|component|gif|theme|styling|visual|canvas|generative|algorithmic|设计|海报|配图|ui|figma/i,
  },
  {
    category: "工具构建类",
    pattern: /mcp|server|builder|skill-creator|evals|api|工具|构建|automation|script/i,
  },
  {
    category: "知识库类",
    pattern: /knowledge|product.*fact|知识库|问答|facts about|internal doc/i,
  },
];

/**
 * 根据 name 与 description 推断类别；无法识别则返回「其他」
 */
export function inferCategory(name: string, description: string): InferredCategory {
  const text = `${name ?? ""} ${description ?? ""}`.trim();
  if (!text) return CATEGORY_OTHER;
  for (const { category, pattern } of RULES) {
    if (pattern.test(text)) return category;
  }
  return CATEGORY_OTHER;
}
