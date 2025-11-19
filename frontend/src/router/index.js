import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Layouts: ĐÃ XÓA HẾT IMPORT TỪ THƯ MỤC LAYOUTS
// Không còn import AuthLayout hay DefaultLayout nữa

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
import MyLoansView from '../views/MyLoansView.vue'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- CÁC ROUTE CHÍNH ---
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/books',
      name: 'books',
      component: BookListView
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: BookDetailView
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-loans',
      name: 'my-loans',
      component: MyLoansView, 
      meta: { requiresAuth: true, requiresRole: 'reader' }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },
    {
      path: '/staff',
      name: 'staff-dashboard',
      component: StaffDashboardView,
      meta: { requiresAuth: true, requiresRole: 'staff' }
    },

    // --- AUTH ROUTES (Đưa thẳng ra ngoài vì mất Layout) ---
    { 
      path: '/auth/login', 
      name: 'login', 
      component: LoginView, 
      meta: { guestOnly: true, hideLayout: true } // Thêm meta để ẩn layout nếu cần xử lý bên App.vue
    },
    { 
      path: '/auth/register', 
      name: 'register', 
      component: RegisterView, 
      meta: { guestOnly: true, hideLayout: true } 
    },

    // --- 404 NOT FOUND ---
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

  // 1. Kiểm tra yêu cầu đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' });
  }
  
  // 2. Kiểm tra trang chỉ dành cho khách
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'home' });
  }
  
  // 3. Kiểm tra quyền (Role)
  if (to.meta.requiresRole) {
      if (!authStore.user?.role || !to.meta.requiresRole.includes(authStore.user.role)) {
          return next({ name: 'home' });
      }
  }

  next();
});

export default router;