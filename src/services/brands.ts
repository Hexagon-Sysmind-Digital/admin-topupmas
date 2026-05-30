import { getEndpoint, safeJson } from "./api";

const publicEndpoint = getEndpoint("brands");
const adminEndpoint = getEndpoint("admin/brands");

export interface BrandItem {
  id: number;
  name: string;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function fetchBrands(): Promise<BrandItem[]> {
  const response = await fetch(publicEndpoint);
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengambil data brands");
  }
  return resData.data || [];
}

export async function createBrand(token: string, name: string, imageUrl: string | null): Promise<BrandItem> {
  const response = await fetch(adminEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      image_url: imageUrl,
    }),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menambahkan brand");
  }
  return resData.data;
}

export async function updateBrand(token: string, id: number, name: string, imageUrl: string | null): Promise<BrandItem> {
  const response = await fetch(`${adminEndpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      image_url: imageUrl,
    }),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengubah brand");
  }
  return resData.data;
}

export async function deleteBrand(token: string, id: number): Promise<{ message: string }> {
  const response = await fetch(`${adminEndpoint}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menghapus brand");
  }
  return resData.data;
}
