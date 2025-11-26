<!-- <script setup>
import { ref, computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const drawer = ref(false);

const logout = async () => {
  await authStore.logout();
  router.push('/auth/login');
};

// Danh sách các trang và quyền truy cập
const navItems = [
  // Các trang công khai (ai cũng thấy)
  { title: 'Home', icon: 'mdi-home', to: '/', requiresAuth: false, roles: [] },
  { title: 'Catalog', icon: 'mdi-bookshelf', to: '/books', requiresAuth: false, roles: [] },

  // Các trang dành cho Reader (Độc giả)
  { title: 'My Profile', icon: 'mdi-account', to: '/profile', requiresAuth: true, roles: ['reader'] },
  { title: 'My Loans', icon: 'mdi-book-multiple', to: '/my-loans', requiresAuth: true, roles: ['reader'] },

  // Các trang dành cho Quản lý (Admin/Staff)
  { title: 'Admin Dashboard', icon: 'mdi-view-dashboard', to: '/admin', requiresAuth: true, roles: ['admin', 'staff'] },
  // { title: 'Staff Dashboard', icon: 'mdi-account-tie', to: '/staff', requiresAuth: true, roles: ['staff'] }, // Nếu muốn tách riêng
];

// Computed property để lọc menu dựa trên trạng thái đăng nhập và quyền
const visibleNavItems = computed(() => {
  return navItems.filter(item => {
    // 1. Nếu không yêu cầu đăng nhập -> Hiện
    if (!item.requiresAuth) return true;

    // 2. Nếu yêu cầu đăng nhập -> Phải đã login VÀ có quyền phù hợp
    return authStore.isAuthenticated && item.roles.includes(authStore.user?.role);
  });
});
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary v-if="!route.meta.hideLayout">
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in visibleNavItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          link
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item v-if="!authStore.isAuthenticated" to="/auth/login" prepend-icon="mdi-login">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!authStore.isAuthenticated" to="/auth/register" prepend-icon="mdi-account-plus">
          <v-list-item-title>Register</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="authStore.isAuthenticated" @click="logout" prepend-icon="mdi-logout" color="error">
          <v-list-item-title>Logout ({{ authStore.user?.username }})</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" density="comfortable" v-if="!route.meta.hideLayout">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="text-uppercase font-weight-bold">
        <v-icon start>mdi-library</v-icon> Library Nexus
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex align-center">
        <v-btn 
          v-for="item in visibleNavItems" 
          :key="'header-' + item.title"
          :to="item.to"
          variant="text"
          class="text-capitalize"
        >
          {{ item.title }}
        </v-btn>

        <div v-if="!authStore.isAuthenticated" class="ml-4">
          <v-btn to="/auth/login" variant="text">Login</v-btn>
          <v-btn to="/auth/register" variant="flat" color="secondary" class="ml-2">Register</v-btn>
        </div>

        <v-menu v-if="authStore.isAuthenticated">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="ml-2">
              <v-avatar color="surface" size="32">
                <span class="text-primary font-weight-bold">
                  {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list width="200">
            <v-list-item :title="authStore.user?.username" :subtitle="authStore.user?.role">
              <template v-slot:prepend>
                <v-icon>mdi-account-circle</v-icon>
              </template>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout" title="Logout" prepend-icon="mdi-logout" color="error"></v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="fill-height align-start pa-0">
         <RouterView />
      </v-container>
    </v-main>

    <v-footer app color="primary" class="text-center d-flex flex-column py-4" v-if="!route.meta.hideLayout">
      <div class="text-white">
        {{ new Date().getFullYear() }} — <strong>Library Nexus</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
/* Tùy chỉnh thêm nếu cần */
</style> -->

<script setup>
import { RouterView } from 'vue-router';
// Xóa import ChatWidget ở đây
</script>

<template>
  <RouterView />
</template>

<style>
html, body { margin: 0; padding: 0; }
</style>