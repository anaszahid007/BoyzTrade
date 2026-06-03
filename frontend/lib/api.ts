export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  status?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildUrl(path: string) {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
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

  const url = buildUrl(path);
  const response = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
    body,
    credentials: 'include',
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (response.ok) {
    return json as ApiResponse<T>;
  }

  if (response.status === 401 && retry) {
    try {
      const refreshResponse = await fetch(buildUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: mergedHeaders,
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const retryText = await fetch(url, {
          ...rest,
          headers: mergedHeaders,
          body,
          credentials: 'include',
        }).then((r) => r.text());
        return retryText ? (JSON.parse(retryText) as ApiResponse<T>) : ({} as ApiResponse<T>);
      }
    } catch (refreshError) {
      // ignore refresh failure and fall through to error handling
    }
  }

  const errorMessage = json?.message || response.statusText || 'Request failed';
  const error: any = new Error(errorMessage);
  error.status = response.status;
  error.data = json?.data;
  throw error;
}

export default apiFetch;
