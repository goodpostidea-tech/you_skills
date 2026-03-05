import type { Request, Response } from "express";
import { Router } from "express";
import { getDefaultSkillRoots } from "../../skills/paths.js";
import { applyCategoryCache, setCategoryInCache } from "../../skills/categoryCache.js";
import { scan } from "../../skills/scan.js";

export const skillsRouter = Router();

/**
 * GET /api/skills/default-paths — 返回默认扫描路径列表与当前平台（用于授权说明与路径参考）
 * platform: win32 | darwin | linux，供前端区分 Windows / macOS / Linux 展示
 */
export function handleGetDefaultPaths(_req: Request, res: Response): void {
  try {
    const paths = getDefaultSkillRoots();
    const platform = process.platform as "win32" | "darwin" | "linux";
    res.json({ paths, platform });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
skillsRouter.get("/default-paths", handleGetDefaultPaths);

/**
 * GET /api/skills?root=
 * root 可选。无 root 时扫默认路径；有 root 时只扫该路径。
 * category 来自 category-cache.json，未命中时推断并写回缓存。
 */
skillsRouter.get("/", (req, res) => {
  const root = (req.query.root as string) || undefined;
  try {
    const { skills, rootsUsed } = scan(root);
    applyCategoryCache(skills);
    res.json({ skills, rootsUsed });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * PATCH /api/skills/category — 用户调整分类，写入 category-cache.json
 * Body: { path: string, category: string }
 */
skillsRouter.patch("/category", (req, res) => {
  const { path: skillPath, category } = req.body as { path?: string; category?: string };
  if (typeof skillPath !== "string" || !skillPath.trim() || typeof category !== "string" || !category.trim()) {
    res.status(400).json({ error: "需要 path 与 category" });
    return;
  }
  const value = category.trim();
  try {
    setCategoryInCache(skillPath.trim(), value);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/skills/manifest 或 /api/manifest
 * Agent 用结构化清单
 */
skillsRouter.get("/manifest", (req, res) => {
  const root = (req.query.root as string) || undefined;
  try {
    const { skills, rootsUsed } = scan(root);
    applyCategoryCache(skills);
    res.json({
      skills: skills.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        shortDescription: s.shortDescription,
        whenToUse: s.whenToUse,
        path: s.path,
        source: s.source,
        category: s.category,
      })),
      rootsUsed,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
