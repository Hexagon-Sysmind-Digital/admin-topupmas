const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1/";

export function getEndpoint(path: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  return `${base}${path}`;
}

export async function safeJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || `Server error: ${response.status}`);
  }
}
