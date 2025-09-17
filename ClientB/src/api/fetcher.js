export const BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.status === 204 ? null : await res.json();
}

export const loginApi = (body) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const registerApi = (body) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const logoutApi = (body = {}) =>
  request('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify(body),
});

export const checkApi = () => request('/api/auth/check');

export const refreshApi = () =>
  request('/api/auth/token', { method: 'POST' });

export const forgotApi = (body) =>
  request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
});

export const resetApi = (body) =>
  request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
});
