<template>
  <v-app theme="dark"> <v-navigation-drawer app permanent color="#1e293b">
      <div class="pa-4 d-flex align-center">
        <v-icon color="primary" size="large" start>mdi-shield-crown</v-icon>
        <span class="text-h6 font-weight-bold">Admin Portal</span>
      </div>
      <v-divider></v-divider>

      <v-list nav>
        <v-list-item to="/admin-portal/dashboard" prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>
        <v-list-item to="/admin-portal/books" prepend-icon="mdi-book-multiple" title="Books Manager"></v-list-item>
        <v-list-item to="/admin-portal/users" prepend-icon="mdi-account-group" title="Users Manager"></v-list-item>
        <v-list-item to="/admin-portal/loans" prepend-icon="mdi-swap-horizontal" title="Loan Requests"></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" @click="logout">
            Exit Portal
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="#0f172a" elevation="1">
       <v-toolbar-title>Welcome, {{ authStore.user?.username }}</v-toolbar-title>
    </v-app-bar>

    <v-main class="bg-grey-darken-4">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/admin-portal/login'); // Logout của admin thì về trang login admin
};
</script>