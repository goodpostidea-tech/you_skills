/**
 * 解析 fetch 响应为 JSON；若返回的是 HTML（如 SPA 兜底页）则抛出明确错误。
 */
export async function parseJsonResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();
  const trimmed = text.trimStart();
  if (!contentType.includes("application/json") || trimmed.startsWith("<")) {
    throw new Error("服务返回了页面而非数据，请确认后端已启动 (http://localhost:12434)");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("响应不是合法 JSON");
  }
}
