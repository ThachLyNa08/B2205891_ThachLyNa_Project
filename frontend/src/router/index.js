import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// 1. LAYOUTS
import UserLayout from '../layouts/UserLayout.vue';
import AdminLayout from '../layouts/AdminLayout.vue';

// 2. VIEWS (USER)
import HomeView from '../views/HomeView.vue';
import BookListView from '../views/BookListView.vue';
import BookDetailView from '../views/BookDetailView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import MyLoansView from '../views/MyLoansView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

// 3. VIEWS (ADMIN)
import AdminDashboardView from '../views/AdminDashboardView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';

// Import các component quản lý riêng lẻ nếu muốn dùng trong Admin Portal
// (Nếu AdminDashboardView đã chứa tabs quản lý tất cả thì không cần import lẻ ở đây nữa)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // === KHU VỰC USER (PUBLIC) ===
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'books', name: 'books', component: BookListView },
        { path: 'books/:id', name: 'book-detail', component: BookDetailView },
        { path: 'profile', name: 'profile', component: UserProfileView, meta: { requiresAuth: true } },
        { path: 'my-loans', name: 'my-loans', component: MyLoansView, meta: { requiresAuth: true } },
      ]
    },

    // Auth (Login/Register cho User)
    { path: '/auth/login', name: 'user-login', component: LoginView },
    { path: '/auth/register', name: 'user-register', component: RegisterView },

    // === KHU VỰC ADMIN PORTAL ===
    {
      path: '/admin-portal/login',
      name: 'admin-login',
      component: AdminLoginView
    },
    {
      path: '/admin-portal',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresRole: 'admin' },
      children: [
        { 
          path: 'dashboard', 
          name: 'admin-dashboard', 
          component: AdminDashboardView 
        },
        // Nếu bạn muốn tách các trang con trong admin (ví dụ /admin-portal/books), khai báo thêm ở đây
      ]
    },
    
    // Catch-all 404 (Nếu có trang NotFound)
    // { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  // 1. Nếu route yêu cầu đăng nhập
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.path.startsWith('/admin-portal')) {
        return next({ name: 'admin-login' }); // Chưa login mà vào admin -> về login admin
    }
    return next({ name: 'user-login' }); // Chưa login mà vào user -> về login user
  }

  // 2. Nếu route yêu cầu quyền Admin
  if (to.meta.requiresRole === 'admin') {
    if (!['admin', 'staff'].includes(userRole)) {
       // Đã login nhưng không phải admin -> Đá về trang chủ user
       return next({ name: 'home' }); 
    }
  }

  // 3. Chặn User đã login quay lại trang Login/Register
  if ((to.name === 'user-login' || to.name === 'user-register') && isAuthenticated) {
      return next({ name: 'home' });
  }
  if (to.name === 'admin-login' && isAuthenticated && ['admin', 'staff'].includes(userRole)) {
      return next({ name: 'admin-dashboard' });
  }

  next();
});

export default router;