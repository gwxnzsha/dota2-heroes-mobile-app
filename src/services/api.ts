import { API_BASE_URL } from '../api/config';

export const API_ENDPOINTS = {
  heroes: '',
  heroById: (id: string | number) => `?id=${encodeURIComponent(String(id))}`,
} as const;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const responseText = await response.text();
    let payload: T | { status_message?: string };
    try {
      payload = responseText ? JSON.parse(responseText) : ({} as T);
    } catch {
      payload = {} as T;
    }

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'status_message' in payload
          ? payload.status_message
          : undefined;
      throw new ApiError(
        message
          ? `${message} (HTTP ${response.status})`
          : `Request failed (HTTP ${response.status})`,
        response.status,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ApiError('The request timed out.');
    throw new ApiError('Network request failed.');
  } finally {
    clearTimeout(timer);
  }
}

export const apiGet = <T>(path: string) => request<T>(path, 'GET');
export const apiPost = <T>(path: string, body: unknown) => request<T>(path, 'POST', body);
export const apiPut = <T>(path: string, body: unknown) => request<T>(path, 'PUT', body);
export const apiDelete = <T>(path: string) => request<T>(path, 'DELETE');

export function resolveAssetUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^(https?|file|content|data):/i.test(value)) return value;
  const base = API_BASE_URL.replace(/\/[^/]*$/, '');
  return `${base}/${value.replace(/^\//, '')}`;
}
