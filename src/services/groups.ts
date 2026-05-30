import { getEndpoint, safeJson } from "./api";

const endpoint = getEndpoint("admin/product-groups");

export interface GroupItem {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchGroups(token: string): Promise<GroupItem[]> {
  const response = await fetch(endpoint, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengambil data product groups");
  }
  return resData.data || [];
}

export async function createGroup(token: string, name: string): Promise<GroupItem> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menambahkan product group");
  }
  return resData.data;
}

export async function updateGroup(token: string, id: number, name: string): Promise<GroupItem> {
  const response = await fetch(`${endpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal mengubah product group");
  }
  return resData.data;
}

export async function deleteGroup(token: string, id: number): Promise<{ message: string }> {
  const response = await fetch(`${endpoint}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const resData = await safeJson(response);
  if (!response.ok) {
    throw new Error(resData.message || resData.error || "Gagal menghapus product group");
  }
  return resData.data;
}
