<template>
  <v-app>
    <v-app-bar app color="#1565C0" elevation="2">
      <v-toolbar-title class="text-uppercase font-weight-bold text-white">
        <v-icon start>mdi-library</v-icon> Library Nexus - Ứng dụng mượn sách online
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn text to="/" class="text-white">Home</v-btn>
      <v-btn text to="/books" class="text-white">Catalog</v-btn>
      
      <div v-if="!authStore.isAuthenticated">
        <v-btn text to="/auth/login" class="text-white">Login</v-btn>
        <v-btn variant="outlined" color="white" to="/auth/register" class="ml-2">Register</v-btn>
      </div>

      <v-menu v-else>
         <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="text-white">
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
         </template>
         <v-list>
           <v-list-item to="/profile" title="Profile"></v-list-item>
           <v-list-item to="/my-loans" title="My Loans"></v-list-item>
           <v-divider></v-divider>
           <v-list-item @click="logout" title="Logout" prepend-icon="mdi-logout" color="error"></v-list-item>
         </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>

    <v-footer app color="#1565C0" class="text-center d-flex flex-column py-4 text-white">
      <div>{{ new Date().getFullYear() }} — Library Nexus</div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/auth/login');
};
</script>