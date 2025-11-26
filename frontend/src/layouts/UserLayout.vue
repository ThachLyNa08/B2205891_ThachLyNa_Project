<template>
  <!-- 1. Khóa cuộn của body (h-screen, overflow-hidden) để xử lý cuộn bên trong v-main -->
  <v-app class="h-screen overflow-hidden">

    <!-- ============================================= -->
    <!-- 1. NAVIGATION DRAWER (MENU TRƯỢT BÊN TRÁI) -->
    <!-- ============================================= -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      class="bg-grey-lighten-5"
      width="300"
    >
      <!-- A. Header của Drawer: Thông tin User -->
      <div v-if="authStore.isAuthenticated" class="pa-4 bg-primary text-white">
        <div class="d-flex align-center gap-3 mb-2">
          <v-avatar color="white" size="50" class="elevation-2">
            <!-- Hiển thị Avatar thật hoặc chữ cái đầu -->
            <v-img 
              v-if="authStore.user?.avatar" 
              :src="authStore.user.avatar" 
              cover
            ></v-img>
            <span v-else class="text-primary font-weight-bold text-h6">
              {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </v-avatar>
          <div class="overflow-hidden">
            <div class="font-weight-bold text-subtitle-1 text-truncate">{{ authStore.user?.username }}</div>
            <div class="text-caption opacity-80 text-truncate">{{ authStore.user?.email || 'Member' }}</div>
          </div>
        </div>
      </div>

      <!-- B. Header của Drawer: Khi chưa đăng nhập -->
      <div v-else class="pa-6 bg-primary text-center text-white">
        <v-icon size="40" class="mb-2">mdi-library</v-icon>
        <div class="font-weight-bold text-h6">Library Nexus</div>
        <div class="text-caption">Join us today!</div>
        <div class="mt-4 d-flex gap-2 justify-center">
            <v-btn to="/login" variant="flat" color="white" size="small" class="text-primary font-weight-bold">Login</v-btn>
            <v-btn to="/register" variant="outlined" color="white" size="small">Register</v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- C. Danh sách Menu (Đã sửa active-color -> color) -->
      <v-list nav density="comfortable" class="mt-2">
        
        <!-- Nhóm 1: Khám phá -->
        <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-2">EXPLORE</div>
        
        <v-list-item to="/home" prepend-icon="mdi-home-outline" title="Home" rounded="lg" color="primary"></v-list-item>
        <v-list-item to="/books" prepend-icon="mdi-bookshelf" title="Catalog / All Books" rounded="lg" color="primary"></v-list-item>
        
        <!-- Nhóm 2: Cá nhân (Chỉ hiện khi đã Login) -->
        <template v-if="authStore.isAuthenticated">
          <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-4">MY LIBRARY</div>
          
          <v-list-item to="/profile" prepend-icon="mdi-account-outline" title="My Profile" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/my-loans" prepend-icon="mdi-book-clock-outline" title="My Loans" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/favorites" prepend-icon="mdi-heart-outline" title="Favorites" rounded="lg" color="pink"></v-list-item>
          <v-list-item to="/reading" prepend-icon="mdi-book-open-page-variant-outline" title="Currently Reading" rounded="lg" color="info"></v-list-item>
          <v-list-item to="/history" prepend-icon="mdi-history" title="History" rounded="lg" color="warning"></v-list-item>
        </template>

        <!-- Nhóm 3: Hệ thống -->
        <v-divider class="my-4"></v-divider>
        <v-list-item v-if="authStore.isAuthenticated" @click="logout" prepend-icon="mdi-logout" title="Logout" base-color="error" rounded="lg"></v-list-item>
        <v-list-item v-else to="/login" prepend-icon="mdi-login" title="Login now" rounded="lg"></v-list-item>

      </v-list>
    </v-navigation-drawer>


    <!-- ============================================= -->
    <!-- 2. APP BAR (THANH HEADER TRÊN CÙNG) -->
    <!-- ============================================= -->
    <v-app-bar app color="#1565C0" elevation="2" class="px-2">
      <!-- Nút mở Drawer -->
      <v-app-bar-nav-icon variant="text" color="white" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="text-uppercase font-weight-bold text-white cursor-pointer" @click="router.push('/home')">
        <div class="d-flex align-center">
            <v-icon start icon="mdi-library" class="mr-2"></v-icon>
            <span class="d-none d-sm-inline">Library Nexus</span>
        </div>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      
      <!-- Menu ngang (Chỉ hiện trên màn hình lớn > md) -->
      <div class="d-none d-md-flex align-center">
        <v-btn variant="text" to="/" class="text-white text-capitalize">Home</v-btn>
        <v-btn variant="text" to="/books" class="text-white text-capitalize">Catalog</v-btn>
        
        <div v-if="!authStore.isAuthenticated" class="ml-2">
          <v-btn variant="text" to="/login" class="text-white font-weight-bold">Login</v-btn>
          <v-btn variant="flat" color="white" to="/register" class="text-primary font-weight-bold ml-2">Register</v-btn>
        </div>

        <!-- Avatar Menu góc phải (Khi đã Login) -->
        <v-menu v-else offset-y transition="scale-transition">
           <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" class="ml-2">
                <v-avatar color="white" size="36" class="elevation-1">
                   <v-img 
                      v-if="authStore.user?.avatar" 
                      :src="authStore.user.avatar" 
                      cover
                   ></v-img>
                   <span v-else class="text-primary font-weight-bold text-subtitle-2">
                     {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                   </span>
                </v-avatar>
              </v-btn>
           </template>
           <v-list width="220" density="compact" class="py-0">
             <v-list-item class="bg-grey-lighten-4 py-3">
                <div class="font-weight-bold text-truncate">{{ authStore.user?.username }}</div>
                <div class="text-caption text-grey text-truncate">{{ authStore.user?.email }}</div>
             </v-list-item>
             <v-divider></v-divider>
             <v-list-item to="/profile" prepend-icon="mdi-account-cog-outline" title="Profile"></v-list-item>
             <v-list-item to="/my-loans" prepend-icon="mdi-book-clock" title="My Loans"></v-list-item>
             <v-divider></v-divider>
             <v-list-item @click="logout" title="Logout" prepend-icon="mdi-logout" class="text-error"></v-list-item>
           </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- ============================================= -->
    <!-- 3. MAIN CONTENT (NỘI DUNG CUỘN) -->
    <!-- ============================================= -->
    <v-main class="bg-grey-lighten-4 scrollable-main">
      
      <!-- Wrapper Flexbox để đẩy Footer xuống dưới cùng -->
      <div class="content-wrapper d-flex flex-column">
        
        <!-- Nội dung trang (Router View) -->
        <div class="flex-grow-1">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <!-- Footer -->
        <v-footer color="#0D47A1" class="text-center d-flex flex-column py-6 text-white w-100">
          <div class="d-flex gap-4 mb-4">
            <v-btn icon="mdi-facebook" variant="text" color="white" size="small"></v-btn>
            <v-btn icon="mdi-twitter" variant="text" color="white" size="small"></v-btn>
            <v-btn icon="mdi-instagram" variant="text" color="white" size="small"></v-btn>
          </div>
          <div class="text-body-2 font-weight-light opacity-80">
            &copy; {{ new Date().getFullYear() }} — <strong>Library Nexus</strong>. All rights reserved.
          </div>
        </v-footer>

      </div>
      
    </v-main>
    <ChatWidget />
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import ChatWidget from '@/components/ChatWidget.vue'; 

const authStore = useAuthStore();
const router = useRouter();
const drawer = ref(false); // Trạng thái đóng/mở của Drawer

const logout = async () => {
  await authStore.logout();
  drawer.value = false; // Đóng drawer sau khi logout
  router.push('/login');
};
</script>

<style scoped>
/* 1. Thiết lập chiều cao và ẩn cuộn của body */
.h-screen {
  height: 100vh;
}
/* .overflow-hidden {
  /*overflow: hidden;
} */

/* 2. Thiết lập vùng cuộn chính (v-main) */
.scrollable-main {
  height: 100vh;       /* Chiều cao bằng màn hình */
  overflow-y: auto;    /* Cho phép cuộn dọc nội dung bên trong */
  padding-top: 64px;   /* Trừ đi chiều cao mặc định của App Bar để không bị che */
}

/* 3. Wrapper để đảm bảo footer luôn ở đáy nếu nội dung ngắn */
.content-wrapper {
  min-height: 100%;    /* Ít nhất bằng chiều cao vùng cuộn */
}

/* 4. Tùy chỉnh thanh cuộn cho đẹp */
.scrollable-main::-webkit-scrollbar {
  width: 8px;
}
.scrollable-main::-webkit-scrollbar-thumb {
  background: #90A4AE; 
  border-radius: 4px;
}
.scrollable-main::-webkit-scrollbar-thumb:hover {
  background: #607D8B; 
}

/* 5. Animation chuyển trang */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Utilities */
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.cursor-pointer { cursor: pointer; }
</style>