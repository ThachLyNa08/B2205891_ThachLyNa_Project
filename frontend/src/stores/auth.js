import { defineStore } from 'pinia';
import api from '../services/api.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    token: sessionStorage.getItem('token') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),
    favorites: [], // [MỚI] Lưu danh sách sách yêu thích
    error: null,
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isReader: (state) => state.user?.role === 'reader',
    // [MỚI] Getter kiểm tra xem một sách có được like không
    // Cách dùng: authStore.isFavorite(bookId)
    isFavorite: (state) => (bookId) => {
      return state.favorites.some(b => b._id === bookId);
    }
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', userData);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user)); 

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
        sessionStorage.setItem('user', JSON.stringify(response.data.user));

        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        
        // [MỚI] Sau khi login thành công, tải luôn danh sách yêu thích
        await this.fetchFavorites();

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
      this.favorites = []; // [MỚI] Xóa danh sách yêu thích khi logout
      this.isAuthenticated = false;
      this.error = null;
    },

    async fetchUser() {
      if (this.isAuthenticated && !this.user) {
        try {
          const response = await api.get('/users/me');
          this.user = response.data;
          // [MỚI] Tải lại favorites nếu refresh trang
          await this.fetchFavorites();
        } catch (error) {
          console.error('Failed to fetch user data on refresh:', error);
          this.logout();
        }
      } else if (this.isAuthenticated) {
          // Nếu user đã có nhưng favorites chưa có (do reload), fetch lại
          if (this.favorites.length === 0) {
              await this.fetchFavorites();
          }
      }
    },

    updateUser(fieldsToUpdate) {
      if (this.user) {
        this.user = { ...this.user, ...fieldsToUpdate };
        sessionStorage.setItem('user', JSON.stringify(this.user));
      }
    },

    // --- [MỚI] CÁC HÀM QUẢN LÝ YÊU THÍCH ---
    
    async fetchFavorites() {
        if (!this.token) return;
        try {
            const res = await api.get('/users/favorites');
            this.favorites = res.data || [];
        } catch (e) {
            console.error("Error fetching favorites:", e);
        }
    },

    async toggleFavorite(book) {
        if (!this.token) return false;
        
        const bookId = book._id;
        // Dùng getter isFavorite để kiểm tra
        const isLiked = this.isFavorite(bookId);

        try {
            if (isLiked) {
                // Đang thích -> Bỏ thích
                await api.delete(`/users/favorites/${bookId}`);
                this.favorites = this.favorites.filter(b => b._id !== bookId);
                return false; 
            } else {
                // Chưa thích -> Thêm thích
                await api.post('/users/favorites', { bookId });
                this.favorites.push(book);
                return true;
            }
        } catch (e) {
            console.error("Error toggling favorite:", e);
            // Nếu lỗi server, hoàn tác lại trạng thái cũ (optional)
            return isLiked;
        }
    }
  },
});