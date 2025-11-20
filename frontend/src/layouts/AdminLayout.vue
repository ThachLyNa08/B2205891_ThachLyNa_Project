<template>
  <v-app theme="dark">
    <v-navigation-drawer app permanent color="#1e293b" width="260">
      <div class="pa-6 d-flex align-center">
        <v-icon color="primary" size="x-large" start>mdi-shield-crown</v-icon>
        <div>
            <div class="text-h6 font-weight-bold">Admin Portal</div>
            <div class="text-caption text-grey">Management System</div>
        </div>
      </div>
      <v-divider class="border-opacity-12"></v-divider>

      <v-list nav class="mt-4">
        <v-list-item 
            to="/admin-portal/dashboard" 
            prepend-icon="mdi-view-dashboard-outline" 
            title="Dashboard Center"
            active-class="bg-primary text-white"
            rounded="lg"
            class="mb-1"
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

    <v-app-bar app color="#0f172a" elevation="0" class="border-b border-opacity-12">
       <v-spacer></v-spacer>
       <div class="d-flex align-center mr-6">
           <span class="text-body-2 mr-3 text-grey-lighten-1">Welcome back,</span>
           <v-chip color="primary" variant="flat" size="small">
              <v-icon start size="small">mdi-account</v-icon>
              {{ authStore.user?.username }}
           </v-chip>
       </div>
    </v-app-bar>

    <v-main class="bg-grey-darken-4">
      <v-container fluid class="pa-0 fill-height align-start">
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