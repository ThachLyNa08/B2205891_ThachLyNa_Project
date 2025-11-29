<template>
  <div class="auth-wrapper d-flex w-100 h-screen">
    <div class="auth-image d-none d-md-flex align-end pa-10">
      <div class="image-overlay"></div>
      <div class="text-content position-relative text-white" style="z-index: 2;">
        <h1 class="text-h3 font-weight-bold mb-2">Welcome Back!</h1>
        <p class="text-h6 opacity-80">Discover endless knowledge within Library Nexus.</p>
      </div>
    </div>

    <div class="auth-form d-flex align-center justify-center pa-6 bg-white">
      <v-card width="100%" max-width="450" elevation="0" class="pa-4">
        <div class="text-center mb-8">
          <v-icon color="primary" size="64" class="mb-4">mdi-book-open-page-variant</v-icon>
          <h2 class="text-h4 font-weight-bold text-primary">Login</h2>
          <p class="text-medium-emphasis">Please sign in to continue</p>
        </div>

        <v-form @submit.prevent="handleLogin">
          <v-text-field v-model="emailOrUsername" label="Email or Username" prepend-inner-icon="mdi-account"
            variant="outlined" color="primary" class="mb-2" required></v-text-field>

          <v-text-field v-model="password" label="Password" prepend-inner-icon="mdi-lock" variant="outlined"
            color="primary" :type="showPass ? 'text' : 'password'"
            :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPass = !showPass"
            class="mb-2" required></v-text-field>

          <div class="d-flex justify-end mb-6">
            <a href="#" class="text-decoration-none text-body-2 text-primary">Forgot Password?</a>
          </div>

          <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4" density="compact">
            {{ authStore.error }}
          </v-alert>

          <v-btn type="submit" color="primary" block size="large" :loading="authStore.loading"
            class="mb-6 text-capitalize font-weight-bold">
            Login
          </v-btn>
          <!-- Thêm vào dưới nút Login bình thường -->
          <div class="d-flex align-center my-4">
            <v-divider class="flex-grow-1"></v-divider>
            <span class="mx-2 text-caption text-grey">OR</span>
            <v-divider class="flex-grow-1"></v-divider>
          </div>

          <v-btn block variant="outlined" color="red" class="mb-3 text-capitalize" prepend-icon="mdi-google"
            href="http://localhost:3000/api/auth/google">
            Continue with Google
          </v-btn>

          <div class="text-center text-body-2">
            Don't have an account?
            <router-link to="/register" class="text-primary font-weight-bold text-decoration-none">
              Create Account
            </router-link>
          </div>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const emailOrUsername = ref('');
const password = ref('');
const showPass = ref(false);

const handleLogin = async () => {
  try {
    await authStore.login({ emailOrUsername: emailOrUsername.value, password: password.value });
    if (['admin', 'staff'].includes(authStore.user?.role)) {
      router.push({ name: 'admin-dashboard' });
    } else {
      router.push({ name: 'home' });
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
</script>

<style scoped>
.h-screen {
  height: 100vh;
  width: 100vw;
}

.auth-image {
  width: 50%;
  background: url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2940&auto=format&fit=crop') center/cover no-repeat;
  position: relative;
}

.auth-form {
  width: 50%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2));
}

@media (max-width: 960px) {
  .auth-form {
    width: 100%;
  }
}
</style>