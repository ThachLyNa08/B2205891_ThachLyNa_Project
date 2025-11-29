import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, ''); 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

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
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');  
        
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;