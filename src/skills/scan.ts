import fs from "node:fs";
import path from "node:path";
import { getDefaultSkillRoots, resolveRoot } from "./paths.js";
import { isSkillDir, parseSkillMd, type SkillMeta } from "./parse.js";

type SourceLabel = SkillMeta["source"];

function inferSource(rootPath: string): SourceLabel {
  const normalized = rootPath.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes(".codex")) return "codex";
  if (normalized.includes(".cursor")) return "cursor";
  if (normalized.includes(".openclaw")) return "openclaw";
  if (normalized.includes(".agents")) return "agents";
  return "custom";
}

/**
 * 扫描单个根目录下所有直接子目录，找出含 SKILL.md 的 skill 目录并解析。
 * 只读，不写入、不修改。
 */
export function scanRoot(rootPath: string): SkillMeta[] {
  const resolved = resolveRoot(rootPath);
  const source = inferSource(resolved);
  const skills: SkillMeta[] = [];

  try {
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      return skills;
    }
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skillDir = path.join(resolved, ent.name);
      if (isSkillDir(skillDir)) {
        const meta = parseSkillMd(skillDir, source);
        if (meta) skills.push(meta);
      }
    }
  } catch {
    // 无权限或不存在时返回空，不抛错
  }
  return skills;
}

/**
 * 使用默认根路径列表扫描，合并去重（按 skill path 去重）
 */
export function scanDefaultRoots(): { skills: SkillMeta[]; rootsUsed: string[] } {
  const roots = getDefaultSkillRoots();
  const seen = new Set<string>();
  const skills: SkillMeta[] = [];
  const rootsUsed: string[] = [];

  for (const root of roots) {
    const list = scanRoot(root);
    if (list.length > 0) rootsUsed.push(root);
    for (const s of list) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        skills.push(s);
      }
    }
  }
  return { skills, rootsUsed };
}

/**
 * 若传入 root 则只扫该路径；否则扫默认路径
 */
export function scan(root?: string): { skills: SkillMeta[]; rootsUsed: string[] } {
  if (root && root.trim()) {
    const list = scanRoot(root);
    return { skills: list, rootsUsed: list.length > 0 ? [resolveRoot(root)] : [] };
  }
  return scanDefaultRoots();
}
