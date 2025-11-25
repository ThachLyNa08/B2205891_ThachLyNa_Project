<template>
  <div class="d-flex align-center justify-center h-screen bg-grey-darken-4">
    <v-card width="400" color="#1e293b" class="pa-6 rounded-lg elevation-12">
      <div class="text-center mb-6">
        <v-icon size="64" color="primary" class="mb-2">mdi-shield-lock</v-icon>
        <h2 class="text-h5 font-weight-bold text-white">Admin Portal Access</h2>
        <p class="text-caption text-grey">Authorized Personnel Only</p>
      </div>

      <v-form @submit.prevent="handleAdminLogin">
        <v-text-field
          v-model="username"
          label="Admin Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          color="primary"
          bg-color="#0f172a"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-key"
          variant="outlined"
          color="primary"
          bg-color="#0f172a"
        ></v-text-field>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">{{ error }}</v-alert>

        <v-btn type="submit" block color="primary" size="large" :loading="loading">Enter Portal</v-btn>
      </v-form>
      
      <div class="mt-4 text-center">
        <router-link to="/" class="text-caption text-grey text-decoration-none">
          <v-icon size="x-small" start>mdi-arrow-left</v-icon> Back to Public Library
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleAdminLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login({ emailOrUsername: username.value, password: password.value });
    
    // Kiểm tra quyền ngay lập tức
    if (!['admin', 'staff'].includes(authStore.user?.role)) {
       await authStore.logout(); // Đá ra nếu không phải admin
       error.value = "Access Denied. You are not an administrator.";
    } else {
       router.push('/admin-portal/dashboard');
    }
  } catch (err) {
    error.value = "Invalid credentials.";
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped> .h-screen { height: 100vh; } </style>