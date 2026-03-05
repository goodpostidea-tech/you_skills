import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SKILL_FILENAME = "SKILL.md";

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  whenToUse?: string;
  path: string;
  source: "codex" | "cursor" | "openclaw" | "agents" | "custom";
  /** 本地推断的分类（基于 name + description），未识别为「其他」 */
  category?: string;
  raw?: string;
}

/**
 * 判断目录是否为 skill 根目录（包含 SKILL.md）
 */
export function isSkillDir(dirPath: string): boolean {
  try {
    const p = path.join(dirPath, SKILL_FILENAME);
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * 从 skill 根目录解析 SKILL.md，只读，不做任何改写。
 * 缺失字段不臆造，用空字符串或 undefined。
 */
export function parseSkillMd(skillDirPath: string, source: SkillMeta["source"]): SkillMeta | null {
  const mdPath = path.join(skillDirPath, SKILL_FILENAME);
  if (!fs.existsSync(mdPath)) return null;

  try {
    const raw = fs.readFileSync(mdPath, "utf-8");
    const { data: frontmatter, content } = matter(raw);
    const fm = frontmatter ?? {};

    const name = fm.name ?? path.basename(skillDirPath);
    const description = fm.description ?? fm.short_description ?? "";
    const shortDescription = fm.short_description ?? (fm as Record<string, unknown>)["short-description"] ?? description.slice(0, 200);
    const whenToUse = fm.when_to_use ?? (fm as Record<string, unknown>)["when to use"] ?? "";

    return {
      id: path.basename(skillDirPath),
      name: String(name),
      description: String(description),
      shortDescription: shortDescription ? String(shortDescription) : undefined,
      whenToUse: whenToUse ? String(whenToUse) : undefined,
      path: skillDirPath,
      source,
      raw: content?.trim() || undefined,
    };
  } catch {
    return null;
  }
}
