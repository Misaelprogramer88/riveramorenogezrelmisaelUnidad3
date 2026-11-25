import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const listeners = new Set();
let unauthorizedHandler = null;

export function subscribeHttpLog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function emitHttpLog(entry) {
  listeners.forEach((fn) => fn(entry));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 12000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('poscore_token');
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: performance.now() };
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const durationMs = Math.round(
      performance.now() - (response.config.metadata?.startTime || performance.now())
    );
    const statusText =
      response.data?.statusText || `${response.status} ${response.statusText || 'OK'}`;

    emitHttpLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      method: (response.config.method || 'GET').toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText,
      durationMs,
      ok: true,
      message: response.data?.message || 'Operación completada',
      timestamp: new Date().toISOString()
    });

    return response;
  },
  (error) => {
    const durationMs = Math.round(
      performance.now() - (error.config?.metadata?.startTime || performance.now())
    );
    const status = error.response?.status || 0;
    const statusText =
      error.response?.data?.statusText ||
      (status ? `${status} Error` : 'Network Error');
    const message =
      error.response?.data?.message ||
      'No se pudo conectar con el servidor API.';

    emitHttpLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      method: (error.config?.method || 'GET').toUpperCase(),
      url: error.config?.url || '',
      status,
      statusText,
      durationMs,
      ok: false,
      message,
      timestamp: new Date().toISOString()
    });

    if (status === 401 && !error.config?.skipAuth && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials, { skipAuth: true }),
  register: (payload) => apiClient.post('/auth/register', payload, { skipAuth: true }),
  me: () => apiClient.get('/auth/me'),
  securityStatus: () => apiClient.get('/auth/security-status'),
  testUnauthenticatedAccess: () =>
    apiClient.get('/products', { skipAuth: true })
};

export const productsApi = {
  list: (params = {}) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (payload) => apiClient.post('/products', payload),
  update: (id, payload) => apiClient.put(`/products/${id}`, payload),
  remove: (id) => apiClient.delete(`/products/${id}`)
};

export const quotesApi = {
  list: () => apiClient.get('/quotes'),
  create: (payload) => apiClient.post('/quotes', payload),
  updateStatus: (id, estado) => apiClient.patch(`/quotes/${id}/status`, { estado }),
  remove: (id) => apiClient.delete(`/quotes/${id}`)
};

export const externalApi = {
  getExchangeRate: (refresh = false) =>
    apiClient.get('/external/exchange-rate', {
      params: refresh ? { refresh: 'true' } : {}
    })
};
