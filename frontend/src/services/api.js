import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
};

// Questions API
export const questionsAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

// Answers API
export const answersAPI = {
  getAnswers: (questionId, params) => api.get(`/answers/question/${questionId}`, { params }),
  createAnswer: (questionId, data) => api.post(`/answers/question/${questionId}`, data),
  updateAnswer: (id, data) => api.put(`/answers/${id}`, data),
  deleteAnswer: (id) => api.delete(`/answers/${id}`),
  acceptAnswer: (id) => api.patch(`/answers/${id}/accept`),
};

// Votes API
export const votesAPI = {
  vote: (data) => api.post('/votes', data),
  getUserVote: (targetType, targetId) => api.get(`/votes/user/${targetType}/${targetId}`),
  getVoteStats: (targetType, targetId) => api.get(`/votes/stats/${targetType}/${targetId}`),
  getUserVotes: (params) => api.get('/votes/user', { params }),
};

// Tags API
export const tagsAPI = {
  getTags: (params) => api.get('/tags', { params }),
  getTag: (identifier) => api.get(`/tags/${identifier}`),
  createTag: (data) => api.post('/tags', data),
  updateTag: (id, data) => api.put(`/tags/${id}`, data),
  deleteTag: (id) => api.delete(`/tags/${id}`),
  getPopularTags: (params) => api.get('/tags/popular', { params }),
  searchTags: (params) => api.get('/tags/search', { params }),
  getQuestionsByTag: (tagName, params) => api.get(`/tags/${tagName}/questions`, { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUserBan: (id) => api.patch(`/admin/users/${id}/toggle-ban`),
  getFlaggedContent: () => api.get('/admin/flagged-content'),
  deleteContent: (type, id) => api.delete(`/admin/content/${type}/${id}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  sendAdminMessage: (data) => api.post('/notifications/admin-message', data),
};

export default api;