import path from "node:path";
import os from "node:os";

/**
 * 获取本机默认的 Skills 根路径列表（Codex、OpenClaw 等），跨平台。
 * 仅返回可能存在的路径，不保证可读或存在；实际扫描时再判断。
 */
export function getDefaultSkillRoots(): string[] {
  const home = os.homedir();
  const roots: string[] = [];

  // Codex / Claude Code: $CODEX_HOME/skills 或 ~/.codex/skills
  const codexHome = process.env.CODEX_HOME || path.join(home, ".codex");
  roots.push(path.join(codexHome, "skills"));

  // Cursor 常见 skills 路径（与 Codex 类似）
  const cursorHome = process.env.CURSOR_HOME || path.join(home, ".cursor");
  roots.push(path.join(cursorHome, "skills"));

  // OpenClaw
  roots.push(path.join(home, ".openclaw", "skills"));

  // Agents 常见路径（部分生态）
  roots.push(path.join(home, ".agents", "skills"));

  return roots;
}

/**
 * 将用户输入的路径标准化（展开 ~、处理相对路径）
 */
export function resolveRoot(inputPath: string): string {
  const normalized = inputPath.trim().replace(/^~($|\/)/, `${os.homedir()}$1`);
  return path.resolve(normalized);
}
