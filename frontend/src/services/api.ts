/**
 * api.ts
 * Centralised HTTP client for CareerPulse frontend → backend communication.
 *
 * Uses the native fetch API so no additional runtime dependency is required.
 * When the team is ready to add Axios, replace the `request` function body
 * and keep the same exported helpers (get, post, put, del).
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('cp_token');
    window.location.href = '/login';
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((error as { message?: string }).message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export default api;
