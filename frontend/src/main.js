import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import ApiService from './services/api.service';
import { useAuthStore } from './stores/auth'; // Import auth store

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Icon MDI

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi', // 'mdi' (Material Design Icons)
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify); // Sử dụng Vuetify

// Khởi tạo ApiService (Axios)
ApiService.init();

// Khôi phục trạng thái auth nếu có token trong localStorage
const authStore = useAuthStore();
if (authStore.token) {
  ApiService.setHeader(authStore.token);
}

// Thiết lập interceptor cho Axios (phải sau khi pinia được use)
ApiService.setupInterceptors(authStore);


// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresStaff = to.matched.some(record => record.meta.requiresStaff);

  if (requiresAuth && !auth.isLoggedIn) {
    next('/login');
  } else if (requiresAdmin && auth.isLoggedIn && auth.userRole !== 'admin') {
    next('/'); // Chuyển hướng về trang chủ nếu không phải admin
  } else if (requiresStaff && auth.isLoggedIn && !['admin', 'staff'].includes(auth.userRole)) {
    next('/'); // Chuyển hướng về trang chủ nếu không phải admin/staff
  }
  else {
    next();
  }
});


app.mount('#app');