const API_BASE = 'https://route-posts.routemisr.com';

export class ApiError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

export async function api(path, { method = 'GET', body, token = localStorage.getItem('route-token'), headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) requestHeaders['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    const errors = Array.isArray(payload?.errors) ? payload.errors : [];
    throw new ApiError(errors.filter(Boolean).join(' · ') || payload?.message || `API error (${response.status})`, errors);
  }
  return payload;
}

export const pickData = (payload) => payload?.data ?? payload;
export function listFrom(payload) {
  const data = pickData(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) if (Array.isArray(value)) return value;
  }
  return [];
}
export const entityId = (item) => item?._id ?? item?.id ?? item?.postId ?? item?.commentId ?? item?.userId;
