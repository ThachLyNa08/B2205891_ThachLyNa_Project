<template>
  <v-container class="fill-height justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-h6">Processing login...</div>
    </div>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api.service';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  
  if (token) {
    try {
      // 1. Lưu token tạm
      authStore.token = token;
      sessionStorage.setItem('token', token);
      
      // 2. Gọi API lấy thông tin User (vì token chỉ chứa ID)
      const res = await api.get('/users/me'); // Cần đảm bảo API này hoạt động
      
      // 3. Lưu user vào store
      authStore.user = res.data;
      sessionStorage.setItem('user', JSON.stringify(res.data));
      authStore.isAuthenticated = true;

      // 4. Chuyển hướng vào Home
      router.push('/home');
    } catch (error) {
      console.error("Login failed", error);
      router.push('/login');
    }
  } else {
    router.push('/login');
  }
});
</script>