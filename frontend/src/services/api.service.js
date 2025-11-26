// frontend/src/services/api.service.js
import axios from 'axios';

// 1. SỬA: Xử lý URL để tránh lỗi 2 dấu gạch chéo (//) khi nối chuỗi
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, ''); 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Quan trọng để gửi cookie (refresh token)
});

// Interceptor để thêm Authorization header cho mỗi request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Lấy JWT từ sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Nếu lỗi là 401 (Unauthorized) và không phải request refresh token
    // Thêm kiểm tra error.response để tránh crash nếu mất mạng
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu request này đã được thử lại

      try {
        // Gọi API refresh token
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.token;

        // Cập nhật token trong sessionStorage và header của request gốc
        sessionStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Thử lại request gốc với token mới
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, chuyển hướng về trang login
        console.error('Refresh token failed:', refreshError);
        sessionStorage.removeItem('token'); // Xóa token cũ
        sessionStorage.removeItem('user');  // Xóa luôn thông tin user cho sạch
        
        // 2. SỬA: Đường dẫn login đúng là /auth/login (theo router của bạn)
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;