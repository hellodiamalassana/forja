import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('forja_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('forja_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const forjaAPI = {
  // Generation endpoints
  generate: async (description) => {
    const { data } = await api.post('/api/generate', { description });
    return data;
  },

  modify: async (sessionId, modification, currentCode) => {
    const { data } = await api.post('/api/modify', {
      sessionId,
      modification,
      currentCode,
    });
    return data;
  },

  build: async (sessionId, platforms) => {
    const { data } = await api.post('/api/build', {
      sessionId,
      platforms,
    });
    return data;
  },

  // Session endpoints
  getSession: async (sessionId) => {
    const { data } = await api.get(`/api/session/${sessionId}`);
    return data;
  },

  deleteSession: async (sessionId) => {
    const { data } = await api.delete(`/api/session/${sessionId}`);
    return data;
  },

  // Auth endpoints
  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      name,
    });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', {
      email,
      password,
    });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/api/auth/profile');
    return data;
  },

  // Projects endpoints
  getProjects: async () => {
    const { data } = await api.get('/api/projects');
    return data;
  },

  getProject: async (projectId) => {
    const { data } = await api.get(`/api/projects/${projectId}`);
    return data;
  },

  saveProject: async (projectData) => {
    const { data } = await api.post('/api/projects', projectData);
    return data;
  },

  updateProject: async (projectId, updates) => {
    const { data } = await api.patch(`/api/projects/${projectId}`, updates);
    return data;
  },

  deleteProject: async (projectId) => {
    const { data } = await api.delete(`/api/projects/${projectId}`);
    return data;
  },

  // Subscription endpoints
  createCheckoutSession: async (priceId) => {
    const { data } = await api.post('/api/stripe/create-checkout-session', {
      priceId,
    });
    return data;
  },

  getSubscription: async () => {
    const { data } = await api.get('/api/stripe/subscription');
    return data;
  },

  cancelSubscription: async () => {
    const { data } = await api.post('/api/stripe/cancel-subscription');
    return data;
  },

  // Health check
  health: async () => {
    const { data } = await api.get('/health');
    return data;
  },
};

export default api;
