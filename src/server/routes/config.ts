import type { Request, Response } from "express";
import { Router } from "express";
import { BUILTIN_CLASSIFICATIONS } from "../../skills/presets/classificationsData.js";
import {
  getClassificationSchemeId,
  setClassificationSchemeId,
  getThemeId,
  setThemeId,
  type UserConfig,
  type ThemeId,
} from "../../skills/config.js";
import type { ClassificationSchemeId } from "../../skills/presets/classificationsData.js";
import { clearCategoryCache } from "../../skills/categoryCache.js";
import { getCurrentSchemeCategoryLabels } from "../../skills/classifyScheme.js";

export const configRouter = Router();

const VALID_SCHEME_IDS: ClassificationSchemeId[] = ["by_output", "by_scenario", "by_role"];

/**
 * GET /api/config — 返回当前配置与可选预设分类方案列表
 */
/** 同时匹配 "" 与 "/"，避免不同 Express 环境下路径不一致导致 404 */
export function handleGetConfig(_req: Request, res: Response): void {
  try {
    const classification_scheme_id = getClassificationSchemeId();
    const schemes = BUILTIN_CLASSIFICATIONS.classification_schemes.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));
    const current_scheme_categories = getCurrentSchemeCategoryLabels();
    const theme_id = getThemeId();
    res.json({ classification_scheme_id, schemes, current_scheme_categories, theme_id });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
configRouter.get("/", handleGetConfig);
configRouter.get("", handleGetConfig);

const VALID_THEME_IDS: ThemeId[] = [
  "default", "matcha", "apricot", "lavender", "tomato", "seasalt",
  "lotus", "glacier", "terracotta", "lava", "chalk",
];

/**
 * PATCH /api/config — 更新配置（classification_scheme_id、theme_id）
 * Body: { classification_scheme_id?: string, theme_id?: string }
 */
export function handlePatchConfig(req: Request, res: Response): void {
  const body = req.body as UserConfig & { classification_scheme_id?: string; theme_id?: string };
  const schemeId = body?.classification_scheme_id;
  const themeId = body?.theme_id;
  if (schemeId != null && typeof schemeId !== "string") {
    res.status(400).json({ error: "classification_scheme_id 须为字符串" });
    return;
  }
  if (schemeId != null && !VALID_SCHEME_IDS.includes(schemeId as ClassificationSchemeId)) {
    res.status(400).json({
      error: `classification_scheme_id 须为: ${VALID_SCHEME_IDS.join(", ")}`,
    });
    return;
  }
  if (themeId != null && typeof themeId !== "string") {
    res.status(400).json({ error: "theme_id 须为字符串" });
    return;
  }
  if (themeId != null && !VALID_THEME_IDS.includes(themeId as ThemeId)) {
    res.status(400).json({
      error: `theme_id 须为: ${VALID_THEME_IDS.join(", ")}`,
    });
    return;
  }
  try {
    const prevSchemeId = getClassificationSchemeId();
    if (schemeId != null) {
      setClassificationSchemeId(schemeId as ClassificationSchemeId);
      if (prevSchemeId !== schemeId) clearCategoryCache();
    }
    if (themeId != null) setThemeId(themeId as ThemeId);
    const classification_scheme_id = getClassificationSchemeId();
    const outThemeId = getThemeId();
    res.json({ ok: true, classification_scheme_id, theme_id: outThemeId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
configRouter.patch("/", handlePatchConfig);
configRouter.patch("", handlePatchConfig);
