<!-- frontend/src/layouts/DefaultLayout.vue -->
<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Library Nexus</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/books">Catalog</v-btn>
      <v-btn text v-if="authStore.isAuthenticated && authStore.isReader" to="/profile">My Profile</v-btn>
      <v-btn text v-if="authStore.isAuthenticated && (authStore.isAdmin || authStore.isStaff)" to="/admin">Dashboard</v-btn>
      <!-- <v-btn text v-if="authStore.isAuthenticated && authStore.isStaff" to="/staff">Staff Dashboard</v-btn> -->


      <v-btn text v-if="!authStore.isAuthenticated" to="/auth/login">Login</v-btn>
      <v-btn text v-if="!authStore.isAuthenticated" to="/auth/register">Register</v-btn>
      <v-btn text v-if="authStore.isAuthenticated" @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense nav>
        <v-list-item link to="/">
          <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/books">
          <v-list-item-icon><v-icon>mdi-book-multiple</v-icon></v-list-item-icon>
          <v-list-item-title>Catalog</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAuthenticated && authStore.isReader" link to="/profile">
          <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
          <v-list-item-title>My Profile</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAuthenticated && (authStore.isAdmin || authStore.isStaff)" link to="/admin">
          <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
          <v-list-item-title>Admin Dashboard</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item v-if="authStore.isAuthenticated && authStore.isStaff" link to="/staff">
          <v-list-item-icon><v-icon>mdi-account-tie</v-icon></v-list-item-icon>
          <v-list-item-title>Staff Dashboard</v-list-item-title>
        </v-list-item> -->
        <v-list-item v-if="!authStore.isAuthenticated" link to="/auth/login">
          <v-list-item-icon><v-icon>mdi-login</v-icon></v-list-item-icon>
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!authStore.isAuthenticated" link to="/auth/register">
          <v-list-item-icon><v-icon>mdi-account-plus</v-icon></v-list-item-icon>
          <v-list-item-title>Register</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAuthenticated" @click="logout">
          <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer app>
      <!-- Footer content -->
      <span class="ml-auto">&copy; {{ new Date().getFullYear() }} Library Nexus</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const drawer = ref(false);

const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>
```

**`frontend/src/layouts/AuthLayout.vue`**

```vue
<!-- frontend/src/layouts/AuthLayout.vue -->
<template>
  <v-app class="auth-layout-background">
    <v-main class="d-flex align-center justify-center">
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12 pa-5">
              <v-card-title class="text-h5 text-center">
                <v-icon color="primary" class="mr-2">mdi-library</v-icon> Library Nexus
              </v-card-title>
              <v-card-text>
                <router-view />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-layout-background {
  background: linear-gradient(to right, #4CAF50, #2196F3); /* Màu nền chuyển sắc */
}
</style>