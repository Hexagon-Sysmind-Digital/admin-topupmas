import { getEndpoint, safeJson } from "./api";

const endpoint = getEndpoint("admin/upload");

export async function uploadImage(token: string, file: File, folder = "brands"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Note: Do NOT set Content-Type header here. Fetch will set it automatically with the correct boundary.
    },
    body: formData,
  });

  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengunggah gambar");
  }

  // The response contains { success: true, data: { url: "https://..." } }
  return resData.data?.url || "";
}
