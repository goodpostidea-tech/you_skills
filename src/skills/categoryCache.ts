/**
 * 分类缓存：使用 category-cache.json 持久化「路径 → 分类」映射。
 * 优先使用缓存，未命中时用推断结果并写回缓存；支持用户覆盖后持久化。
 * 缓存文件位置：~/.you-skills/category-cache.json（不写入用户 Skills 目录，只读 Skills）
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { SkillMeta } from "./parse.js";
import { inferCategoryByScheme } from "./classifyScheme.js";

const CACHE_DIR = ".you-skills";
const CACHE_FILENAME = "category-cache.json";

function getCachePath(): string {
  return path.join(os.homedir(), CACHE_DIR, CACHE_FILENAME);
}

/** 标准化路径作为缓存 key（绝对路径、统一分隔符） */
function normalizePath(p: string): string {
  return path.resolve(p);
}

/**
 * 读取缓存；文件不存在或非法时返回空对象
 */
export function readCategoryCache(): Record<string, string> {
  const filePath = getCachePath();
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, string>;
    }
  } catch {
    // 忽略解析错误
  }
  return {};
}

/**
 * 写入缓存；自动创建 ~/.you-skills 目录
 */
export function writeCategoryCache(data: Record<string, string>): void {
  const filePath = getCachePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * 为 skills 填充 category：优先缓存，未命中则推断并写回缓存。
 * 不修改 Skills 文件，只读写 category-cache.json。
 */
export function applyCategoryCache(skills: SkillMeta[]): SkillMeta[] {
  const cache = readCategoryCache();
  let dirty = false;
  for (const s of skills) {
    const key = normalizePath(s.path);
    if (key in cache) {
      s.category = cache[key];
    } else {
      const inferred = inferCategoryByScheme(s.name, s.description ?? "");
      s.category = inferred;
      cache[key] = inferred;
      dirty = true;
    }
  }
  if (dirty) writeCategoryCache(cache);
  return skills;
}

/**
 * 用户调整分类：更新缓存中该 path 的 category
 */
export function setCategoryInCache(skillPath: string, category: string): void {
  const cache = readCategoryCache();
  cache[normalizePath(skillPath)] = category;
  writeCategoryCache(cache);
}

/**
 * 清空分类缓存（切换预设方案后调用，使下次扫描全部按新 scheme 重新推断）
 */
export function clearCategoryCache(): void {
  writeCategoryCache({});
}
