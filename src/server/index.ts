import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PORT } from "../constants.js";
import { applyCategoryCache } from "../skills/categoryCache.js";
import { scan } from "../skills/scan.js";
import { skillsRouter, handleGetDefaultPaths } from "./routes/skills.js";
import { browseRouter } from "./routes/browse.js";
import { configRouter, handleGetConfig, handlePatchConfig } from "./routes/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  // CORS 允许本地访问
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
    next();
  });

  // 显式注册易 404 的接口，确保优先匹配（避免子路由挂载路径差异）
  app.get("/api/skills/default-paths", handleGetDefaultPaths);
  app.get("/api/config", handleGetConfig);
  app.patch("/api/config", handlePatchConfig);

  app.use("/api/skills", skillsRouter);
  app.use("/api/browse", browseRouter);
  app.use("/api/config", configRouter);

  // CORS 预检：避免 OPTIONS 落入静态兜底返回 HTML
  app.options("/api/*", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
  });

  // Agent 用 manifest 别名：与 /api/skills/manifest 行为一致
  app.get("/api/manifest", (req, res) => {
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

  // 未匹配的 /api 请求返回 JSON 404，避免返回 HTML
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not Found", path: _req.path });
  });

  // 静态：优先 dist/client（构建后）
  const clientDir = path.join(__dirname, "..", "..", "dist", "client");
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDir, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>You Skills</title></head>
          <body>
            <h1>Skills 可视化器</h1>
            <p>前端未构建，请先执行 <code>npm run build</code>。</p>
            <p>API 可用：<a href="/api/skills">/api/skills</a>、<a href="/api/skills/manifest">/api/skills/manifest</a>、<a href="/api/browse">/api/browse</a></p>
          </body>
        </html>
      `);
    });
  }

  return app;
}

export function startServer(): void {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`You Skills 已启动: http://localhost:${PORT}`);
  });
}
