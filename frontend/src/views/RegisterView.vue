
<template>
  <v-form @submit.prevent="handleRegister">
    <v-text-field
      v-model="username"
      label="Username"
      prepend-inner-icon="mdi-account"
      required
    ></v-text-field>
    <v-text-field
      v-model="email"
      label="Email"
      prepend-inner-icon="mdi-email"
      type="email"
      required
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>
    <v-text-field
      v-model="confirmPassword"
      label="Confirm Password"
      prepend-inner-icon="mdi-lock-check"
      type="password"
      required
    ></v-text-field>

    <v-alert v-if="authStore.error" type="error" class="mb-4">{{ authStore.error }}</v-alert>
    <v-alert v-if="passwordMismatchError" type="warning" class="mb-4">{{ passwordMismatchError }}</v-alert>


    <v-btn type="submit" color="primary" block :loading="authStore.loading">Register</v-btn>

    <v-divider class="my-4"></v-divider>
    <v-card-actions class="justify-center">
      <router-link to="/auth/login" class="text-decoration-none">Already have an account? Login</router-link>
    </v-card-actions>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const passwordMismatchError = ref('');

const handleRegister = async () => {
  passwordMismatchError.value = '';
  if (password.value !== confirmPassword.value) {
    passwordMismatchError.value = 'Passwords do not match.';
    return;
  }

  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      role: 'reader' // Mặc định đăng ký là reader
    });
    router.push('/'); // Chuyển hướng về trang chủ sau khi đăng ký thành công
  } catch (error) {
    console.error('Registration error:', error);
    // authStore.error đã được set trong store
  }
};
</script>