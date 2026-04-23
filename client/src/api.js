const BASE = '/api';

const getHeaders = (token) => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const handleRes = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

// Products
export const getProducts = (params = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
  return fetch(`${BASE}/products?${q}`).then(handleRes);
};
export const getProduct = (id) => fetch(`${BASE}/products/${id}`).then(handleRes);
export const createProduct = (data, token) =>
  fetch(`${BASE}/products`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data }).then(handleRes);
export const updateProduct = (id, data, token) =>
  fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: data }).then(handleRes);
export const deleteProduct = (id, token) =>
  fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleRes);

// Orders
export const createOrder = (data) =>
  fetch(`${BASE}/orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleRes);
export const getOrders = (token, params = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
  return fetch(`${BASE}/orders?${q}`, { headers: getHeaders(token) }).then(handleRes);
};
export const updateOrderStatus = (id, status, token) =>
  fetch(`${BASE}/orders/${id}/status`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ status }) }).then(handleRes);
export const getOrderStats = (token) =>
  fetch(`${BASE}/orders/stats/summary`, { headers: getHeaders(token) }).then(handleRes);

// Auth
export const login = (username, password) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ username, password }) }).then(handleRes);
export const getMe = (token) =>
  fetch(`${BASE}/auth/me`, { headers: getHeaders(token) }).then(handleRes);

// Categories
export const getCategories = () => fetch(`${BASE}/categories`).then(handleRes);
