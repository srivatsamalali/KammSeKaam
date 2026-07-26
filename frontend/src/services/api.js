import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const candidateService = {
  getProfile: () => api.get('/candidate/profile'),
  updateProfile: (formData) =>
    api.put('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getApplications: () => api.get('/candidate/applications'),
}

export const recruiterService = {
  getAll: () => api.get('/recruiters'),
  create: (data) => api.post('/recruiters', data),
  update: (id, data) => api.put(`/recruiters/${id}`, data),
  delete: (id) => api.delete(`/recruiters/${id}`),
  getApplications: () => api.get('/recruiters/applications'),
}

export const applicationService = {
  assign: (data) => api.post('/applications/assign', data),
  updateStatus: (applicationId, data) =>
    api.put(`/applications/${applicationId}/status`, data),
  // backward-compatible alias used by some pages
  updateApplicationStatus: (applicationId, data) =>
    api.put(`/applications/${applicationId}/status`, data),
  scheduleInterview: (applicationId, data) =>
    api.put(`/applications/${applicationId}/interview`, data),
  addFeedback: (applicationId, data) =>
    api.put(`/applications/${applicationId}/feedback`, data),
}

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports'),
  getUnassignedCandidates: () => api.get('/admin/unassigned'),
  overrideStatus: (applicationId, data) =>
    api.put(`/admin/applications/${applicationId}`, data),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
}

export default api
