import { getEndpoint, safeJson } from "./api";

const endpoint = getEndpoint("admin/products");

export interface ProductItem {
  code: string;
  name: string;
  category: string;
  brand: string;
  type: string;
  sell_price: number;
  cost_price: number;
  supplier: string;
  supplier_code: string;
  is_active: boolean;
  product_group_id?: number | null;
  product_group_name?: string | null;
  brand_id?: number | null;
  brand_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function fetchProducts(
  token: string,
  params?: { limit?: number; offset?: number; brand?: string }
): Promise<ProductItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params?.offset !== undefined) queryParams.append("offset", params.offset.toString());
  if (params?.brand) queryParams.append("brand", params.brand);

  const url = `${endpoint}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengambil data produk");
  }
  return resData.data || [];
}

export async function createProduct(token: string, product: Omit<ProductItem, "created_at" | "updated_at">): Promise<ProductItem> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menambahkan produk");
  }
  return resData.data;
}

export async function updateProduct(
  token: string,
  code: string,
  product: Omit<ProductItem, "code" | "created_at" | "updated_at">
): Promise<ProductItem> {
  const response = await fetch(`${endpoint}/${code}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengubah produk");
  }
  return resData.data;
}

export async function deleteProduct(token: string, code: string): Promise<{ message: string }> {
  const response = await fetch(`${endpoint}/${code}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menghapus produk");
  }
  return resData.data;
}
