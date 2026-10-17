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
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(!isFormData && { 'Content-Type': 'application/json' }),
  };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    });
  } catch {
    const netErr = new Error('Unable to connect. Please try again.');
    (netErr as unknown as { isNetworkError: boolean }).isNetworkError = true;
    throw netErr;
  }

  if (res.status === 401) {
    localStorage.removeItem('cp_token');
    // Only redirect to /login if this was an expired session on a protected route,
    // NOT during login/auth submission and NOT if already on the login page.
    if (!path.startsWith('/auth/') && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: undefined }));
    let msg = (error as { message?: string })?.message;
    if (res.status === 401) {
      msg = msg || 'Invalid email or password.';
    } else if (res.status >= 500) {
      msg = 'Internal server error. Please try again later.';
    } else {
      msg = msg || 'Request failed';
    }
    const err = new Error(msg);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  upload: <T>(path: string, formData: FormData) => request<T>('POST', path, formData),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export default api;
