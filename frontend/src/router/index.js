import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import auth store

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';

// Views
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import BookListView from '../views/BookListView.vue';
import BookDetailView from '../views/BookDetailView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';
import StaffDashboardView from '../views/StaffDashboardView.vue';
import NotFoundView from '../views/NotFoundView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout, // Sử dụng DefaultLayout cho các trang chính
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'books', name: 'books', component: BookListView },
        { path: 'books/:id', name: 'book-detail', component: BookDetailView },
        { path: 'profile', name: 'profile', component: UserProfileView, meta: { requiresAuth: true } },
        { path: 'admin', name: 'admin-dashboard', component: AdminDashboardView, meta: { requiresAuth: true, requiresRole: 'admin' } },
        { path: 'staff', name: 'staff-dashboard', component: StaffDashboardView, meta: { requiresAuth: true, requiresRole: 'staff' } },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout, // Sử dụng AuthLayout cho các trang đăng nhập/đăng ký
      children: [
        { path: 'login', name: 'login', component: LoginView, meta: { guestOnly: true } },
        { path: 'register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
      ],
    },
    // Catch-all route for 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
    }
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Kiểm tra nếu route yêu cầu đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }); // Chuyển hướng đến trang đăng nhập
  }
  // Kiểm tra nếu route chỉ dành cho khách (chưa đăng nhập)
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' }); // Chuyển hướng về trang chủ nếu đã đăng nhập
  }
  // Kiểm tra quyền
  else if (to.meta.requiresRole && !authStore.user?.role.includes(to.meta.requiresRole)) {
    // Nếu user không có quyền, chuyển hướng về trang chủ hoặc trang 403
    next({ name: 'home' }); // Hoặc một trang lỗi "Access Denied"
  }
  else {
    next();
  }
});

export default router;