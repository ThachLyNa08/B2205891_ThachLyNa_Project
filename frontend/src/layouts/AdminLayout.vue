<template>
  <v-app theme="dark" class="overflow-hidden">
    
    <!-- SIDEBAR -->
    <v-navigation-drawer app permanent color="#1e293b" width="280">
      <div class="pa-6 d-flex align-center">
        <v-icon color="primary" size="x-large" start>mdi-shield-crown</v-icon>
        <div>
          <div class="text-h6 font-weight-bold">Admin Portal</div>
          <div class="text-caption text-grey">Management System</div>
        </div>
      </div>
      <v-divider class="border-opacity-12"></v-divider>

      <!-- DANH SÁCH MENU MỚI -->
      <v-list nav class="mt-4">
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          active-class="bg-primary text-white"
          rounded="lg"
          class="mb-2" 
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" @click="logout" class="text-capitalize">
            Exit Portal
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- HEADER -->
    <v-app-bar app color="#0f172a" elevation="0" class="border-b border-opacity-12">
      <v-spacer></v-spacer>
      <div class="d-flex align-center mr-6">
        <span class="text-body-2 mr-3 text-grey-lighten-1">Welcome back,</span>
        <v-chip color="primary" variant="flat" size="small">
          <v-icon start size="small">mdi-account</v-icon>
          {{ authStore.user?.username || 'Admin' }}
        </v-chip>
      </div>
    </v-app-bar>

    <!-- MAIN CONTENT -->
    <v-main class="bg-grey-darken-4 scrollable-main">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Cấu hình các đường dẫn (path) tương ứng với các nút
const menuItems = ref([
  { 
    title: 'Dashboard Center', 
    icon: 'mdi-view-dashboard-outline', 
    to: '/admin-portal/dashboard' 
  },
  { 
    title: 'Loan Management', 
    icon: 'mdi-hand-coin-outline', 
    to: '/admin-portal/loans' 
  },
  { 
    title: 'Book Management', 
    icon: 'mdi-book-open-page-variant-outline', 
    to: '/admin-portal/books' 
  },
  { 
    title: 'User Management', 
    icon: 'mdi-account-group-outline', 
    to: '/admin-portal/users' 
  },
  { 
    title: 'Payment History', 
    icon: 'mdi-credit-card-clock-outline', 
    to: '/admin-portal/payments' 
  },
]);

const logout = async () => {
  await authStore.logout();
  router.push('/admin-portal/login');
};
</script>

<style scoped>
.scrollable-main {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-main::-webkit-scrollbar {
  width: 8px;
}
.scrollable-main::-webkit-scrollbar-track {
  background: #1e293b; 
}
.scrollable-main::-webkit-scrollbar-thumb {
  background: #475569; 
  border-radius: 4px;
}
</style>