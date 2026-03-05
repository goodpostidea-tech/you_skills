import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { resolveRoot } from "../../skills/paths.js";

export const browseRouter = Router();

/**
 * GET /api/browse?path=
 * 列出 path 下的子目录（仅一层），用于前端「选择目录」。
 * path 默认 homedir
 */
browseRouter.get("/", (req, res) => {
  let dir = (req.query.path as string) || os.homedir();
  dir = resolveRoot(dir);

  try {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return res.json({ directories: [], current: dir });
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const directories = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => ({
        name: e.name,
        path: path.join(dir, e.name),
      }));
    res.json({ directories, current: dir });
  } catch (err) {
    res.status(500).json({ error: String(err), directories: [], current: dir });
  }
});
