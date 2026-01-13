import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (email, password, name) => api.post('/auth/register', { email, password, name }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Food API
export const foodAPI = {
    getAll: (params) => api.get('/food', { params }),
    getById: (id) => api.get(`/food/${id}`),
    getAllAdmin: () => api.get('/food/admin/all'),
    create: (data) => api.post('/food', data),
    update: (id, data) => api.put(`/food/${id}`, data),
    delete: (id) => api.delete(`/food/${id}`),
};

// Intake API
export const intakeAPI = {
    add: (foodId, quantity = 1, date) => api.post('/intake', { foodId, quantity, date }),
    getDaily: (date) => api.get('/intake/daily', { params: { date } }),
    getToday: () => api.get('/intake/today'),
    getHistory: (days = 30) => api.get('/intake/history', { params: { days } }),
    update: (id, quantity) => api.put(`/intake/${id}`, { quantity }),
    delete: (id) => api.delete(`/intake/${id}`),
};

// Favorites API
export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    add: (foodId) => api.post('/favorites', { foodId }),
    remove: (foodId) => api.delete(`/favorites/${foodId}`),
    check: (foodId) => api.get(`/favorites/check/${foodId}`),
};

export default api;
