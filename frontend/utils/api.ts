export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  status?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshAttempts = 0;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
  }
}

function loadStoredTokens() {
  if (typeof window !== 'undefined' && !refreshToken) {
    const stored = localStorage.getItem('refreshToken');
    if (stored) refreshToken = stored;
  }
}

function buildUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshAttempts >= 2) {
    clearTokens();
    return null;
  }

  loadStoredTokens();
  if (!refreshToken) return null;

  refreshAttempts++;

  try {
    const res = await fetch(buildUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (res.ok && json?.data?.accessToken) {
      refreshAttempts = 0;
      accessToken = json.data.accessToken;
      if (json.data.refreshToken) {
        refreshToken = json.data.refreshToken;
        localStorage.setItem('refreshToken', json.data.refreshToken);
      }
      return accessToken;
    }

    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { data?: any; retry?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { data, retry = true, headers, ...rest } = options;
  const body = data !== undefined ? JSON.stringify(data) : undefined;
  const mergedHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  loadStoredTokens();
  if (accessToken) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = buildUrl(path);
  const response = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
    body,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (response.ok) {
    return json as ApiResponse<T>;
  }

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      mergedHeaders['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(url, {
        ...rest,
        headers: mergedHeaders,
        body,
      });
      const retryText = await retryRes.text();
      const retryJson = retryText ? JSON.parse(retryText) : null;
      if (retryRes.ok) return retryJson as ApiResponse<T>;
    }
  }

  const errorMessage = json?.message || response.statusText || 'Request failed';
  const error: any = new Error(errorMessage);
  error.status = response.status;
  error.data = json?.data;
  throw error;
}

export async function apiUpload<T = any>(
  path: string,
  formData: FormData,
  options: RequestInit & { retry?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { retry = true, ...rest } = options;
  const mergedHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  loadStoredTokens();
  if (accessToken) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = buildUrl(path);
  const response = await fetch(url, {
    ...rest,
    method: options.method || 'POST',
    headers: mergedHeaders,
    body: formData,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (response.ok) {
    return json as ApiResponse<T>;
  }

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      mergedHeaders['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(url, {
        ...rest,
        method: options.method || 'POST',
        headers: mergedHeaders,
        body: formData,
      });
      const retryText = await retryRes.text();
      const retryJson = retryText ? JSON.parse(retryText) : null;
      if (retryRes.ok) return retryJson as ApiResponse<T>;
    }
  }

  const errorMessage = json?.message || response.statusText || 'Upload failed';
  const error: any = new Error(errorMessage);
  error.status = response.status;
  error.data = json?.data;
  throw error;
}

export default apiFetch;
