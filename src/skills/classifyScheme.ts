/**
 * 根据预设分类方案（scheme）的 rules + matching_config 推断 skill 分类。
 * 用于替代原 classify.ts 的固定规则，配置来自 config.json 的 classification_scheme_id。
 */

import { BUILTIN_CLASSIFICATIONS } from "./presets/classificationsData.js";
import { getClassificationSchemeId } from "./config.js";

type Scheme = (typeof BUILTIN_CLASSIFICATIONS.classification_schemes)[number];
type CategoryLike = { id: string; label: string; rules: readonly string[] };

function getCategoriesFromScheme(scheme: Scheme): CategoryLike[] {
  if ("categories" in scheme && Array.isArray(scheme.categories)) {
    return scheme.categories as CategoryLike[];
  }
  if ("roles" in scheme && Array.isArray(scheme.roles)) {
    return scheme.roles as CategoryLike[];
  }
  return [];
}

function buildPatterns(rules: readonly string[], caseSensitive: boolean): RegExp[] {
  const flags = caseSensitive ? "" : "i";
  return rules.map((r) => {
    try {
      return new RegExp(r, flags);
    } catch {
      return null;
    }
  }).filter((p): p is RegExp => p != null);
}

/** 返回当前方案下的分类 label 列表（含 fallback），供前端下拉与筛选展示 */
export function getCurrentSchemeCategoryLabels(): string[] {
  const schemeId = getClassificationSchemeId();
  const scheme = BUILTIN_CLASSIFICATIONS.classification_schemes.find((s) => s.id === schemeId);
  const fallback = BUILTIN_CLASSIFICATIONS.matching_config.fallback_label ?? "其他";
  if (!scheme) return [fallback];
  const categories = getCategoriesFromScheme(scheme);
  const labels = categories.map((c) => c.label);
  if (!labels.includes(fallback)) labels.push(fallback);
  return labels;
}

/**
 * 根据当前配置的 scheme 对 name + description 做匹配，返回分类 label（或 fallback_label）
 */
export function inferCategoryByScheme(name: string, description: string): string {
  const schemeId = getClassificationSchemeId();
  const scheme = BUILTIN_CLASSIFICATIONS.classification_schemes.find((s) => s.id === schemeId);
  const matching = BUILTIN_CLASSIFICATIONS.matching_config;
  const fallback = matching.fallback_label ?? "其他";
  const caseSensitive = matching.case_sensitive ?? false;

  if (!scheme) return fallback;

  const categories = getCategoriesFromScheme(scheme);
  const matchField = scheme.match_field ?? ["name", "description"];
  const parts: string[] = [];
  if (matchField.includes("name")) parts.push(name ?? "");
  if (matchField.includes("description")) parts.push(description ?? "");
  const text = parts.join(" ").trim();
  if (!text) return fallback;

  for (const cat of categories) {
    const patterns = buildPatterns(cat.rules, caseSensitive);
    for (const re of patterns) {
      if (re.test(text)) return cat.label;
    }
  }
  return fallback;
}
