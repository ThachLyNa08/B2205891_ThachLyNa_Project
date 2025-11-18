<!-- frontend/src/views/LoginView.vue -->
<template>
  <v-form @submit.prevent="handleLogin">
    <v-text-field
      v-model="emailOrUsername"
      label="Email or Username"
      prepend-inner-icon="mdi-account"
      required
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>

    <v-alert v-if="authStore.error" type="error" class="mb-4">{{ authStore.error }}</v-alert>

    <v-btn type="submit" color="primary" block :loading="authStore.loading">Login</v-btn>

    <v-divider class="my-4"></v-divider>
    <v-card-actions class="justify-center">
      <router-link to="/auth/register" class="text-decoration-none">Don't have an account? Register</router-link>
    </v-card-actions>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const emailOrUsername = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await authStore.login({ emailOrUsername: emailOrUsername.value, password: password.value });
    // Nếu đăng nhập thành công, chuyển hướng tùy theo vai trò
    if (authStore.user.role === 'admin') {
      router.push('/admin');
    } else if (authStore.user.role === 'staff') {
      router.push('/admin'); // Staff có thể dùng chung dashboard với admin hoặc có dashboard riêng
    } else {
      router.push('/profile'); // Reader về trang profile hoặc home
    }
  } catch (error) {
    console.error('Login error:', error);
    // authStore.error đã được set trong store
  }
};
</script>