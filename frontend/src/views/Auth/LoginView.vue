<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const emailOrUsername = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const login = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login({ emailOrUsername: emailOrUsername.value, password: password.value });
    router.push('/'); // Chuyển hướng về trang chủ sau khi đăng nhập thành công
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
    console.error('Login error:', err);
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
            <v-toolbar-title class="text-h5 text-center">Login to Library Nexus</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                label="Email or Username"
                name="emailOrUsername"
                prepend-icon="mdi-account"
                type="text"
                v-model="emailOrUsername"
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
              <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
              <v-btn
                color="primary"
                :loading="loading"
                type="submit"
                block
                class="mt-3"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn variant="text" to="/register">Don't have an account? Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>