<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const register = async () => {
  loading.value = true;
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    loading.value = false;
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
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
    console.error('Registration error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 pa-4">
          <v-toolbar color="primary" flat>
            <v-toolbar-title class="text-h5 text-center">Register for Library Nexus</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-text-field
                label="Username"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                v-model="username"
                required
              ></v-text-field>
              <v-text-field
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                v-model="email"
                required
              ></v-text-field>
              <v-text-field
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                v-model="password"
                required
              ></v-text-field>
              <v-text-field
                label="Confirm Password"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                v-model="confirmPassword"
                required
              ></v-text-field>
              <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
              <v-btn
                color="primary"
                :loading="loading"
                type="submit"
                block
                class="mt-3"
              >
                Register
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn variant="text" to="/login">Already have an account? Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>