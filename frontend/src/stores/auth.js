
import { defineStore } from 'pinia';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service'; // Cần để set header

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt_token') || null,
    user: JSON.parse(localStorage.getItem('user_data')) || null,
    isAuthenticated: !!localStorage.getItem('jwt_token'),
  }),
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    userRole: (state) => state.user ? state.user.role : null,
  },
  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      ApiService.setHeader(token); // Set header cho tất cả các request
    },
    purgeAuth() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      ApiService.removeHeader(); // Xóa header
    },
    async login(credentials) {
      try {
        const response = await AuthService.login(credentials);
        const { token, user } = response.data;
        this.setAuth(token, user);
        return response;
      } catch (error) {
        this.purgeAuth();
        throw error;
      }
    },
    async register(userData) {
      try {
        const response = await AuthService.register(userData);
        const { token, user } = response.data; // Register có thể trả về token ngay
        this.setAuth(token, user);
        return response;
      } catch (error) {
        this.purgeAuth();
        throw error;
      }
    },
    async logout() {
      try {
        // Nếu có API logout ở backend, gọi ở đây
        // await AuthService.logout();
      } finally {
        this.purgeAuth();
      }
    },
    async refreshToken() {
        try {
            const response = await AuthService.refreshToken();
            const { token } = response.data;
            this.token = token;
            this.isAuthenticated = true;
            localStorage.setItem('jwt_token', token);
            ApiService.setHeader(token);
            return response;
        } catch (error) {
            console.error("Failed to refresh token, logging out:", error);
            this.purgeAuth();
            throw error;
        }
    },
  },
});