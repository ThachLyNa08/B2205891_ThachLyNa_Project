
import ApiService from './api.service';

const AuthService = {
  login(credentials) {
    return ApiService.post('auth/login', credentials);
  },

  register(userData) {
    return ApiService.post('auth/register', userData);
  },

  logout() {
    // Hiện tại backend không có API logout, chỉ cần xóa token phía client
    // Nếu có API logout, sẽ gọi ở đây để server xóa session/blacklist refresh token
    ApiService.removeHeader();
  },

  refreshToken() {
    // Backend sẽ lấy refresh token từ cookie
    return ApiService.post('auth/refresh');
  }
};

export default AuthService;