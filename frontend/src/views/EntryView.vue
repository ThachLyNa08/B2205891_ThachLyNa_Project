<template>
  <div class="entry-container fill-height">
    <!-- Hình nền mờ -->
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <v-container class="position-relative z-10 fill-height justify-center align-center">
      <v-row justify="center" align="center">
        <v-col cols="12" class="text-center mb-10">
          <div class="animate-fade-down">
            <v-icon size="80" color="white" class="mb-4">mdi-book-open-page-variant-outline</v-icon>
            <h1 class="text-h2 font-weight-bold text-white text-uppercase tracking-widest text-shadow">
              Library Nexus
            </h1>
            <p class="text-h6 text-grey-lighten-3 font-weight-light mt-2">
              Gateway to Knowledge & Management
            </p>
          </div>
        </v-col>

        <!-- Card chọn vai trò -->
        <v-col cols="12" md="10" lg="8">
          <v-row justify="center" class="gap-6">
            
            <!-- 1. USER PORTAL CARD -->
            <v-col cols="12" md="5">
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  class="role-card rounded-xl pa-8 text-center cursor-pointer d-flex flex-column align-center justify-center"
                  :class="{'elevation-24 scale-up': isHovering}"
                  color="rgba(255, 255, 255, 0.9)"
                  @click="navigateTo('user')"
                >
                  <div class="icon-circle bg-blue-lighten-5 mb-6">
                    <v-icon color="primary" size="48">mdi-account-school</v-icon>
                  </div>
                  <h2 class="text-h5 font-weight-bold text-primary mb-2">Reader Portal</h2>
                  <p class="text-body-2 text-grey-darken-1 mb-6">
                    Access book catalog, manage loans, and reading history.
                  </p>
                  <v-btn color="primary" variant="flat" rounded="pill" size="large" class="px-8 font-weight-bold">
                    Login as Reader
                  </v-btn>
                  
                  <!-- Nút phụ để vào trang chủ mà không cần login -->
                  <div class="mt-4">
                     <span 
                        class="text-caption text-primary text-decoration-underline cursor-pointer"
                        @click.stop="navigateTo('home')"
                     >
                        Continue as Guest
                     </span>
                  </div>
                </v-card>
              </v-hover>
            </v-col>

            <!-- 2. ADMIN PORTAL CARD -->
            <v-col cols="12" md="5">
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  class="role-card rounded-xl pa-8 text-center cursor-pointer d-flex flex-column align-center justify-center"
                  :class="{'elevation-24 scale-up': isHovering}"
                  color="rgba(30, 41, 59, 0.95)"
                  theme="dark"
                  @click="navigateTo('admin')"
                >
                  <div class="icon-circle bg-grey-darken-3 mb-6">
                    <v-icon color="white" size="48">mdi-shield-crown</v-icon>
                  </div>
                  <h2 class="text-h5 font-weight-bold text-white mb-2">Admin Portal</h2>
                  <p class="text-body-2 text-grey-lighten-1 mb-6">
                    System management, user control, and library statistics.
                  </p>
                  <v-btn color="white" variant="flat" rounded="pill" size="large" class="px-8 font-weight-bold text-black">
                    Login as Admin
                  </v-btn>
                </v-card>
              </v-hover>
            </v-col>

          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer nhỏ -->
    <div class="footer-text text-white text-caption opacity-60">
      &copy; {{ new Date().getFullYear() }} Library Nexus System
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const navigateTo = (role) => {
  if (role === 'admin') {
    router.push('/admin-portal/login');
  } else if (role === 'user') {
    router.push('/login'); // Trang login user
  } else if (role === 'home') {
    router.push('/home'); // Trang chủ thư viện (Public)
  }
};

// Kiểm tra nếu đã login rồi thì chuyển hướng luôn, đỡ phải chọn lại
onMounted(() => {
    if (authStore.isAuthenticated) {
        if (['admin', 'staff'].includes(authStore.user?.role)) {
            router.push('/admin-portal/dashboard');
        } else {
            router.push('/home');
        }
    }
});
</script>

<style scoped>
.entry-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}

/* Ảnh nền full màn hình */
.bg-image {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('https://images.unsplash.com/photo-1507842217153-eae850688719?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  filter: blur(2px);
  transform: scale(1.05); /* Zoom nhẹ để tránh viền trắng khi blur */
}

/* Lớp phủ tối */
.bg-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(21, 101, 192, 0.8));
}

.z-10 { z-index: 10; }

.role-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255,255,255,0.1);
  height: 100%;
  min-height: 350px;
}

.scale-up {
  transform: translateY(-10px);
}

.icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.text-shadow {
  text-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.tracking-widest { letter-spacing: 0.15em; }

.footer-text {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  z-index: 10;
}

/* Animation */
.animate-fade-down {
  animation: fadeDown 1s ease-out;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>