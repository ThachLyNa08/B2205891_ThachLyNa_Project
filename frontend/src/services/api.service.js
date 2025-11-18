
import axios from 'axios';

// Lấy base URL từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';

const ApiService = {
  init() {
    axios.defaults.baseURL = API_BASE_URL;
    // Cho phép gửi cookies qua các request cross-origin
    axios.defaults.withCredentials = true;
  },

  setHeader(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeHeader() {
    delete axios.defaults.headers.common['Authorization'];
  },

  get(resource) {
    return axios.get(resource);
  },

  post(resource, data) {
    return axios.post(resource, data);
  },

  put(resource, data) {
    return axios.put(resource, data);
  },

  delete(resource) {
    return axios.delete(resource);
  },
  
  // Axios interceptor for error handling and token refresh
  setupInterceptors(store) { // Truyền Pinia store vào để có thể dispatch actions
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        // Nếu lỗi là 401 Unauthorized và không phải request refresh token
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Đánh dấu request này đã được thử lại

          try {
            // Gọi API refresh token
            await store.dispatch('auth/refreshToken'); // Gọi action refreshToken từ Pinia store
            // Sau khi refresh thành công, cập nhật header và thử lại request gốc
            originalRequest.headers['Authorization'] = `Bearer ${store.state.auth.token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Nếu refresh token thất bại, chuyển hướng về trang đăng nhập
            console.error('Refresh token failed:', refreshError);
            store.dispatch('auth/logout'); // Đăng xuất người dùng
            // Redirect to login page (assuming you have a router instance)
            // import router from '@/router';
            // router.push('/login');
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }
};

export default ApiService;