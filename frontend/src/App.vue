<script setup>
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const drawer = ref(false); 

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const navItems = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Catalog', icon: 'mdi-bookshelf', to: '/books' },
  { title: 'My Loans', icon: 'mdi-book-multiple', to: '/my-loans', requiresAuth: true, roles: ['reader'] },
  { title: 'Admin Dashboard', icon: 'mdi-view-dashboard', to: '/admin', requiresAuth: true, roles: ['admin', 'staff'] },
];
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list density="compact" nav>
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" :prepend-icon="item.icon"
                     v-if="!item.requiresAuth || (authStore.isLoggedIn && item.roles.includes(authStore.userRole))">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="!authStore.isLoggedIn" to="/login" prepend-icon="mdi-login">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!authStore.isLoggedIn" to="/register" prepend-icon="mdi-account-plus">
          <v-list-item-title>Register</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isLoggedIn" @click="logout" prepend-icon="mdi-logout">
          <v-list-item-title>Logout ({{ authStore.currentUser?.username }})</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Library Nexus</v-toolbar-title>
      <v-spacer></v-spacer>

      <template v-for="item in navItems" :key="item.title">
        <v-btn text :to="item.to" v-if="!item.requiresAuth || (authStore.isLoggedIn && item.roles.includes(authStore.userRole))">
          {{ item.title }}
        </v-btn>
      </template>

      <v-btn text v-if="!authStore.isLoggedIn" to="/login">Login</v-btn>
      <v-btn text v-if="!authStore.isLoggedIn" to="/register">Register</v-btn>
      <v-menu v-if="authStore.isLoggedIn">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Welcome, {{ authStore.currentUser?.username }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="authStore.userRole === 'reader'" to="/profile">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="['admin', 'staff'].includes(authStore.userRole)" to="/admin">
            <v-list-item-title>Admin Panel</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <v-footer app class="bg-indigo-lighten-1 text-center d-flex flex-column">
      <div>
        {{ new Date().getFullYear() }} — <strong>Library Nexus</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
/* Global styles or specific app.vue styles */
</style>