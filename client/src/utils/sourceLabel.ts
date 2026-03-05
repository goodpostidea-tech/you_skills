const SOURCE_LABELS: Record<string, string> = {
  codex: "Codex",
  cursor: "Cursor",
  openclaw: "OpenClaw",
  agents: "Agents",
  custom: "我的",
};

export function getSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}
