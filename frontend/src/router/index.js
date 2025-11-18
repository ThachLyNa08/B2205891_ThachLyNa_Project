
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/Auth/LoginView.vue'; 
import RegisterView from '../views/Auth/RegisterView.vue'; 
//import DashboardView from '../views/Admin/DashboardView.vue'; 
// import BookListView from '../views/Books/BookListView.vue'; 
// import BookDetailView from '../views/Books/BookDetailView.vue'; 
// import MyLoansView from '../views/Loans/MyLoansView.vue'; 
// import LoanManagementView from '../views/Admin/LoanManagementView.vue'; 
// import UserManagementView from '../views/Admin/UserManagementView.vue'; 
// import PublisherManagementView from '../views/Admin/PublisherManagementView.vue'; 
// import CategoryManagementView from '../views/Admin/CategoryManagementView.vue'; 
import NotFoundView from '../views/NotFoundView.vue'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false } // Trang chủ không yêu cầu đăng nhập
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
        path: '/books',
        name: 'book-list',
        component: BookListView,
        meta: { requiresAuth: false }
    },
    {
        path: '/books/:id',
        name: 'book-detail',
        component: BookDetailView,
        meta: { requiresAuth: false }
    },
    {
        path: '/my-loans',
        name: 'my-loans',
        component: MyLoansView,
        meta: { requiresAuth: true, requiresReader: true } // Reader xem lịch sử mượn của mình
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, requiresAdmin: true, requiresStaff: true } // Chỉ admin/staff truy cập
    },
    {
        path: '/admin/loans',
        name: 'admin-loan-management',
        component: LoanManagementView,
        meta: { requiresAuth: true, requiresAdmin: true, requiresStaff: true }
    },
    {
        path: '/admin/users',
        name: 'admin-user-management',
        component: UserManagementView,
        meta: { requiresAuth: true, requiresAdmin: true } // Chỉ admin quản lý user
    },
    {
        path: '/admin/publishers',
        name: 'admin-publisher-management',
        component: PublisherManagementView,
        meta: { requiresAuth: true, requiresAdmin: true, requiresStaff: true }
    },
    {
        path: '/admin/categories',
        name: 'admin-category-management',
        component: CategoryManagementView,
        meta: { requiresAuth: true, requiresAdmin: true, requiresStaff: true }
    },
    // catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { requiresAuth: false }
    }
  ]
});

// Thêm một navigation guard để handle requiresReader/requiresStaff
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresReader && authStore.isLoggedIn && authStore.userRole !== 'reader') {
        next('/');
    } else if (to.meta.requiresStaff && authStore.isLoggedIn && !['admin', 'staff'].includes(authStore.userRole)) {
        next('/');
    } else {
        next();
    }
});

export default router;