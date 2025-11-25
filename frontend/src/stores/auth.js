import { defineStore } from 'pinia';
import api from '../services/api.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Giữ nguyên logic lấy từ sessionStorage của bạn
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    token: sessionStorage.getItem('token') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),
    error: null,
    loading: false,
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isReader: (state) => state.user?.role === 'reader',
  },
  actions: {
    // --- GIỮ NGUYÊN CÁC HÀM CŨ: register, login, logout, fetchUser ---
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', userData);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user)); // Backend giờ đã trả về có avatar

        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.loading = false;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed.';
        this.loading = false;
        throw err;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user)); // Backend giờ đã trả về có avatar

        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.loading = false;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Invalid credentials.';
        this.loading = false;
        throw err;
      }
    },

    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    },

    async fetchUser() {
      if (this.isAuthenticated && !this.user) {
        try {
          const response = await api.get('/users/me');
          this.user = response.data;
        } catch (error) {
          console.error('Failed to fetch user data on refresh:', error);
          this.logout();
        }
      }
    },

    // --- THÊM HÀM MỚI NÀY VÀO CUỐI ACTIONS ---
    // Hàm này giúp cập nhật avatar/cover ngay lập tức vào sessionStorage
    // Gọi hàm này ở UserProfileView.vue sau khi upload thành công
    updateUser(fieldsToUpdate) {
      if (this.user) {
        // Gộp thông tin cũ và thông tin mới (ví dụ chỉ có avatar mới)
        this.user = { ...this.user, ...fieldsToUpdate };
        // Lưu ngược lại vào sessionStorage để F5 không bị mất
        sessionStorage.setItem('user', JSON.stringify(this.user));
      }
    }
  },
});