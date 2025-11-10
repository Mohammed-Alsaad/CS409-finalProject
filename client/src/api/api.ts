import axios from 'axios';

// API URL: Use environment variable for production, localhost for development
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://home-maintenance-planner-api.onrender.com/api'  // Render backend URL
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  name: string;
  home_type?: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category?: string;
  frequency_days?: number;
  last_completed?: string;
  next_due_date: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  completion_count?: number;
}

export interface Suggestion {
  title: string;
  description: string;
  category: string;
  frequency_days: number;
  priority: string;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string, home_type?: string) => {
    const response = await api.post('/auth/register', { email, password, name, home_type });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.tasks;
  },
  getById: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task;
  },
  create: async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data.task;
  },
  update: async (id: number, task: Partial<Task>): Promise<void> => {
    await api.put(`/tasks/${id}`, task);
  },
  complete: async (id: number, notes?: string): Promise<void> => {
    await api.post(`/tasks/${id}/complete`, { notes });
  },
  getHistory: async (id: number) => {
    const response = await api.get(`/tasks/${id}/history`);
    return response.data.history;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Suggestions API
export const suggestionsAPI = {
  getSuggestions: async (): Promise<Suggestion[]> => {
    const response = await api.get('/suggestions');
    return response.data.suggestions;
  },
};

export default api;

