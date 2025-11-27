import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// 1. LAYOUTS
import UserLayout from "@/layouts/UserLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import EntryView from "@/views/EntryView.vue";

// 2. VIEWS (USER)
import HomeView from "@/views/user/HomeView.vue";
import BookListView from "@/views/user/BookListView.vue";
import BookDetailView from "@/views/user/BookDetailView.vue";
import UserProfileView from "@/views/user/UserProfileView.vue";
import MyLoansView from "@/views/user/MyLoansView.vue";
import LoginView from "@/views/user/LoginView.vue";
import RegisterView from "@/views/user/RegisterView.vue";
import AuthCallback from "@/views/AuthCallback.vue";
import LeaderboardView from "@/views/user/LeaderboardView.vue";

// 3. VIEWS (ADMIN)
import AdminDashboardView from "@/views/admin/AdminDashboardView.vue";
import AdminLoginView from "@/views/admin/AdminLoginView.vue";
import BookManagement from "@/components/admin/BookManagement.vue";
import UserManagement from "@/components/admin/UserManagement.vue";
import LoanManagement from "@/components/admin/LoanManagement.vue";
import PaymentHistory from "@/components/admin/PaymentHistory.vue";
import ReviewManagement from '@/components/admin/ReviewManagement.vue';
import CategoryManagement from '../components/admin/CategoryManagement.vue'
import PublisherManagement from '../components/admin/PublisherManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "entry",
      component: EntryView,
    },
    // === KHU VỰC USER (PUBLIC) ===
    {
      path: "/home",
      component: UserLayout,
      children: [
        // path: '' nghĩa là trang chủ (localhost:5173/)
        { path: "", name: "home", component: HomeView },
        { path: "/books", name: "books", component: BookListView },
        { path: "/books/:id", name: "book-detail", component: BookDetailView },
        {
          path: "/profile",
          name: "profile",
          component: UserProfileView,
          meta: { requiresAuth: true },
        },
        {
          path: "/my-loans",
          name: "my-loans",
          component: MyLoansView,
          meta: { requiresAuth: true },
        },
        {
          path: "/history",
          name: "history",
          component: MyLoansView,
          meta: { requiresAuth: true },
        },
        {
          path: "/notifications",
          name: "notifications",
          component: () => import("@/views/user/NotificationsView.vue"),
          meta: { requiresAuth: true },
        },
        { path: "/leaderboard", name: "leaderboard", component: LeaderboardView },
      ],
    },

    // Đổi từ '/auth/login' thành '/login' để khớp với thực tế
    { path: "/login", name: "user-login", component: LoginView },
    { path: "/register", name: "user-register", component: RegisterView },

    // === KHU VỰC ADMIN PORTAL ===
    {
      path: "/admin-portal/login",
      name: "admin-login",
      component: AdminLoginView,
    },
    {
      path: "/admin-portal",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresRole: "admin" },
      children: [
        { path: "dashboard",name: "admin-dashboard",component: AdminDashboardView,},
        { path: "books", name: "admin-books", component: BookManagement },
        { path: "users", name: "admin-users", component: UserManagement },
        { path: "loans", name: "admin-loans", component: LoanManagement },
        { path: "payments", name: "admin-payments", component: PaymentHistory },
        { path: 'reviews', name: 'admin-reviews', component: ReviewManagement },
        { path: 'categories', name: 'admin-categories', component: CategoryManagement },
        { path: 'publishers', name: 'admin-publishers', component: PublisherManagement },
      ],
    },

    // Route bắt tất cả các link sai (404) -> Quay về trang chủ
    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/NotFoundView.vue"), // Import trang thông báo lỗi 404
    },

    {
      path: "/oauth-callback",
      name: "oauth-callback",
      component: AuthCallback,
    },
  ],
});

// Navigation Guard (Giữ nguyên logic nhưng kiểm tra lại name)
// Navigation Guard (Cập nhật logic redirect)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  // Nếu đã login mà cố vào trang Entry (/), tự động đẩy vào trang trong
  if (to.path === "/" && isAuthenticated) {
    if (["admin", "staff"].includes(userRole))
      return next({ name: "admin-dashboard" });
    return next({ name: "home" });
  }

  // Logic bảo vệ route cũ giữ nguyên
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.path.startsWith("/admin-portal")) {
      return next({ name: "admin-login" });
    }
    return next({ name: "user-login" });
  }

  if (to.meta.requiresRole === "admin") {
    if (!["admin", "staff"].includes(userRole)) {
      return next({ name: "home" });
    }
  }

  // Chặn user đã login quay lại trang login
  if (
    (to.name === "user-login" || to.name === "user-register") &&
    isAuthenticated
  ) {
    return next({ name: "home" });
  }
  if (
    to.name === "admin-login" &&
    isAuthenticated &&
    ["admin", "staff"].includes(userRole)
  ) {
    return next({ name: "admin-dashboard" });
  }

  next();
});

export default router;
