// frontend/src/stores/auth.js
import { defineStore } from 'pinia';
import api from '../services/api.service'; // Import axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    error: null,
    loading: false,
  }),
  getters: {
    // getters ở đây
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isReader: (state) => state.user?.role === 'reader',
  },
  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', userData);
        // Lưu token và user vào localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.loading = false;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed.';
        this.loading = false;
        throw err; // Ném lỗi để component có thể xử lý
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      // TODO: Có thể gọi API logout nếu cần xóa refresh token trên server
    },

    // Action để kiểm tra và lấy lại thông tin user nếu chỉ có token trong localStorage (khi refresh trang)
    async fetchUser() {
      if (this.isAuthenticated && !this.user) {
        try {
          // Gọi API để lấy thông tin user dựa trên token hiện có
          const response = await api.get('/users/me'); // Cần tạo API '/users/me' trên backend
          this.user = response.data;
        } catch (error) {
          console.error('Failed to fetch user data on refresh:', error);
          this.logout(); // Nếu token không hợp lệ, logout
        }
      }
    }
  },
});