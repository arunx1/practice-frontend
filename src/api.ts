// src/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
  source?: string | null;
  hostname?: string | null;
}

const API_BASE = "/py";

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await resp.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }

  if (!resp.ok) {
    const detail =
      data?.detail ??
      data?.message ??
      resp.statusText ??
      `HTTP ${resp.status}`;
    throw new Error(detail);
  }

  return data as T;
}

export function listUsers(): Promise<User[]> {
  return fetchJson<User[]>(`${API_BASE}/users`);
}

export function createUser(
  name: string,
  email: string
): Promise<User> {
  return fetchJson<User>(`${API_BASE}/users`, {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

export function updateUser(
  id: number,
  data: Partial<Pick<User, "name" | "email">>
): Promise<User> {
  return fetchJson<User>(`${API_BASE}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: number): Promise<void> {
  return fetchJson<void>(`${API_BASE}/users/${id}`, {
    method: "DELETE",
  });
}

export function getUser(id: number): Promise<User> {
  return fetchJson<User>(`${API_BASE}/users/${id}`);
}
