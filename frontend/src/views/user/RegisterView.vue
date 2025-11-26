<template>
  <div class="auth-wrapper d-flex w-100 h-screen">
    <div class="auth-image d-none d-md-flex align-end pa-10">
      <div class="image-overlay"></div>
      <div class="text-content position-relative text-white" style="z-index: 2;">
        <h1 class="text-h3 font-weight-bold mb-2">Join Our Community</h1>
        <p class="text-h6 opacity-80">Start your reading journey today.</p>
      </div>
    </div>

    <div class="auth-form d-flex align-center justify-center pa-6 bg-white">
      <v-card width="100%" max-width="500" elevation="0" class="pa-4">
        <div class="text-center mb-6">
          <v-icon color="secondary" size="64" class="mb-4">mdi-account-plus</v-icon>
          <h2 class="text-h4 font-weight-bold text-secondary">Create Account</h2>
          <p class="text-medium-emphasis">Fill in your details to register</p>
        </div>

        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="username"
            label="Username"
            prepend-inner-icon="mdi-account-circle"
            variant="outlined"
            color="secondary"
            class="mb-2"
            required
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email Address"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            type="email"
            color="secondary"
            class="mb-2"
            required
          ></v-text-field>
          
          <v-row>
            <v-col cols="12" md="6" class="py-0">
               <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                color="secondary"
                type="password"
                class="mb-2"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="py-0">
               <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                color="secondary"
                type="password"
                class="mb-2"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4" density="compact">{{ authStore.error }}</v-alert>
          <v-alert v-if="passwordMismatchError" type="warning" variant="tonal" class="mb-4" density="compact">{{ passwordMismatchError }}</v-alert>

          <v-btn 
            type="submit" 
            color="secondary" 
            block 
            size="large" 
            :loading="authStore.loading"
            class="mb-6 text-capitalize font-weight-bold"
          >
            Register
          </v-btn>

          <div class="text-center text-body-2">
            Already have an account? 
            <router-link to="/login" class="text-secondary font-weight-bold text-decoration-none">
              Login here
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
      role: 'reader'
    });
    authStore.logout();
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    router.push('/login');
  } catch (error) {
    console.error('Registration error:', error);
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
  background: url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2940&auto=format&fit=crop') center/cover no-repeat;
  position: relative;
}

.auth-form {
  width: 50%;
}

.image-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
}

@media (max-width: 960px) {
  .auth-form { width: 100%; }
}
</style>