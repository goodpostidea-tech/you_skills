/**
 * 用户配置持久化：~/.you-skills/config.json
 * 本期仅包含预设分类方案选择（classification_scheme_id）。
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ClassificationSchemeId } from "./presets/classificationsData.js";

const CONFIG_DIR = ".you-skills";
const CONFIG_FILENAME = "config.json";

const DEFAULT_SCHEME_ID: ClassificationSchemeId = "by_output";

/** 主题 id：与前端 BUILTIN_THEMES 的 id 一致 */
export type ThemeId =
  | "default"
  | "matcha"
  | "apricot"
  | "lavender"
  | "tomato"
  | "seasalt"
  | "lotus"
  | "glacier"
  | "terracotta"
  | "lava"
  | "chalk";

const DEFAULT_THEME_ID: ThemeId = "default";

export interface UserConfig {
  classification_scheme_id?: ClassificationSchemeId;
  theme_id?: ThemeId;
}

function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_DIR, CONFIG_FILENAME);
}

export function readConfig(): UserConfig {
  const filePath = getConfigPath();
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as UserConfig;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function writeConfig(config: UserConfig): void {
  const filePath = getConfigPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
}

export function getClassificationSchemeId(): ClassificationSchemeId {
  const cfg = readConfig();
  const id = cfg.classification_scheme_id;
  if (id === "by_output" || id === "by_scenario" || id === "by_role") return id;
  return DEFAULT_SCHEME_ID;
}

export function setClassificationSchemeId(schemeId: ClassificationSchemeId): void {
  const cfg = readConfig();
  cfg.classification_scheme_id = schemeId;
  writeConfig(cfg);
}

const VALID_THEME_IDS: ThemeId[] = [
  "default", "matcha", "apricot", "lavender", "tomato", "seasalt",
  "lotus", "glacier", "terracotta", "lava", "chalk",
];

export function getThemeId(): ThemeId {
  const cfg = readConfig();
  const id = cfg.theme_id;
  if (id != null && VALID_THEME_IDS.includes(id)) return id;
  return DEFAULT_THEME_ID;
}

export function setThemeId(themeId: ThemeId): void {
  const cfg = readConfig();
  cfg.theme_id = themeId;
  writeConfig(cfg);
}
