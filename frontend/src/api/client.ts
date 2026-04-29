export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const defaultBaseUrl = '/api/v1';

function getBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) || defaultBaseUrl;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!response.ok) {
    let message = text || response.statusText;
    if (contentType.includes('application/json')) {
      try {
        const data = JSON.parse(text) as { message?: string };
        message = data.message || message;
      } catch {
        // fall through with raw text
      }
    }
    throw new ApiError(message, response.status);
  }

  if (!text) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T;
  }

  return text as T;
}