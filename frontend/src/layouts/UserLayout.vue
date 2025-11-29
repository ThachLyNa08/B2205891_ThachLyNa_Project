<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      class="bg-grey-lighten-5"
      width="300"
    >
      <div v-if="authStore.isAuthenticated" class="pa-4 bg-primary text-white">
        <div class="d-flex align-center gap-3 mb-2">
          <v-avatar color="white" size="50" class="elevation-2">
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

      <div v-else class="pa-6 bg-primary text-center text-white">
        <v-icon size="40" class="mb-2">mdi-library</v-icon>
        <div class="font-weight-bold text-h6">Library Nexus</div>
        <div class="mt-4 d-flex gap-2 justify-center">
            <v-btn to="/login" variant="flat" color="white" size="small" class="text-primary font-weight-bold">Đăng nhập</v-btn>
            <v-btn to="/register" variant="outlined" color="white" size="small">Đăng ký</v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list nav density="comfortable" class="mt-2">
        <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-2">EXPLORE</div>
        <v-list-item to="/home" prepend-icon="mdi-home-outline" title="Trang chủ" rounded="lg" color="primary"></v-list-item>
        <v-list-item to="/books" prepend-icon="mdi-bookshelf" title="Thư viện sách" rounded="lg" color="primary"></v-list-item>
        <v-list-item to="/leaderboard" prepend-icon="mdi-trophy-outline" title="Bảng xếp hạng" rounded="lg" color="amber-darken-2"></v-list-item>
        
        <template v-if="authStore.isAuthenticated">
          <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-4">MY LIBRARY</div>
          <v-list-item to="/profile" prepend-icon="mdi-account-outline" title="Hồ sơ của tôi" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/my-loans" prepend-icon="mdi-book-clock-outline" title="Tú sách của tôi" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/favorites" prepend-icon="mdi-heart-outline" title="Sách yêu thích" rounded="lg" color="pink"></v-list-item>
          <v-list-item to="/reading" prepend-icon="mdi-book-open-page-variant-outline" title="Sách đang đọc" rounded="lg" color="info"></v-list-item>
          <v-list-item to="/history" prepend-icon="mdi-history" title="Lịch sử mượn" rounded="lg" color="warning"></v-list-item>
        </template>

        <v-divider class="my-4"></v-divider>
        <v-list-item v-if="authStore.isAuthenticated" @click="logout" prepend-icon="mdi-logout" title="Đăng xuất" base-color="error" rounded="lg"></v-list-item>
        <v-list-item v-else to="/login" prepend-icon="mdi-login" title="Đăng nhập ngay" rounded="lg"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="#1565C0" elevation="2" class="px-2">
      <v-app-bar-nav-icon variant="text" color="white" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase font-weight-bold text-white cursor-pointer" @click="router.push('/home')">
        <div class="d-flex align-center">
            <v-icon start icon="mdi-library" class="mr-2"></v-icon>
            <span class="d-none d-sm-inline">Library Nexus - Ứng dụng mượn sách Online</span>
        </div>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <div class="d-none d-md-flex align-center">
        <v-btn variant="text" to="/home" class="text-white text-capitalize">Home</v-btn>
        <v-btn variant="text" to="/books" class="text-white text-capitalize">Catalog</v-btn>
        
        <div v-if="!authStore.isAuthenticated" class="ml-2">
          <v-btn variant="text" to="/login" class="text-white font-weight-bold">Login</v-btn>
          <v-btn variant="flat" color="white" to="/register" class="text-primary font-weight-bold ml-2">Register</v-btn>
        </div>

        <div v-else class="d-flex align-center ml-2">
           
           <v-btn icon class="mr-1 text-white" to="/notifications">
              <v-badge 
                v-if="unreadCount > 0" 
                :content="unreadCount" 
                color="error" 
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
              <v-icon v-else>mdi-bell-outline</v-icon>
           </v-btn>

           <v-menu offset-y transition="scale-transition">
               <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" class="ml-1">
                    <v-avatar color="white" size="36" class="elevation-1">
                       <v-img v-if="authStore.user?.avatar" :src="authStore.user.avatar" cover></v-img>
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
                 <v-list-item to="/profile" prepend-icon="mdi-account-cog-outline" title="Hồ sơ của tôi"></v-list-item>
                 <v-list-item to="/my-loans" prepend-icon="mdi-book-clock" title="Tủ sách cảu tôi"></v-list-item>
                 <v-divider></v-divider>
                 <v-list-item @click="logout" title="Đăng xuất" prepend-icon="mdi-logout" class="text-error"></v-list-item>
               </v-list>
            </v-menu>
        </div>
      </div>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </v-main>

<v-footer class="pa-0 d-flex flex-column">
      
      <div class="footer-universe w-100 position-relative">
        
        <div class="footer-overlay"></div>

        <div class="footer-content position-relative">
          <div class="py-12">
            <v-container class="mx-auto px-4" style="max-width: 1200px;">
              <v-row>
                
                <v-col cols="12" md="4" class="mb-6">
                  <div class="glass-panel pa-6 rounded-xl">
                    <div class="d-flex align-center mb-4">
                      <v-icon size="40" color="cyan-accent-3" class="mr-3 glow-icon">mdi-book-open-page-variant-outline</v-icon>
                      <div>
                        <h3 class="text-h6 font-weight-bold text-white tracking-wider">LIBRARY NEXUS - Ứng dụng web mượn sách online</h3>
                        <div class="text-caption text-cyan-lighten-3">Universe of Knowledge</div>
                      </div>
                    </div>
                    <p class="text-body-2 text-grey-lighten-3 mb-4" style="line-height: 1.8;">
                      Khám phá vũ trụ tri thức vô tận. Nơi hội tụ những cuốn sách hay nhất, kết nối cộng đồng đam mê đọc sách.
                    </p>
                    <div class="d-flex gap-3">
                      <v-btn icon variant="tonal" color="cyan-accent-3" class="social-btn"><v-icon>mdi-facebook</v-icon></v-btn>
                      <v-btn icon variant="tonal" color="cyan-accent-3" class="social-btn"><v-icon>mdi-instagram</v-icon></v-btn>
                      <v-btn icon variant="tonal" color="cyan-accent-3" class="social-btn"><v-icon>mdi-youtube</v-icon></v-btn>
                    </div>
                  </div>
                </v-col>

                <v-col cols="6" md="2" class="pl-md-8">
                  <h4 class="text-subtitle-1 font-weight-bold text-cyan-accent-2 mb-4 text-uppercase glow-text">Khám phá</h4>
                  <div class="d-flex flex-column gap-3">
                    <router-link to="/home" class="star-link">Trang chủ</router-link>
                    <router-link to="/books" class="star-link">Kho sách Galaxy</router-link>
                    <router-link to="/reviews" class="star-link">Góc Review</router-link>
                    <router-link to="/events" class="star-link">Sự kiện</router-link>
                  </div>
                </v-col>

                <v-col cols="6" md="2">
                  <h4 class="text-subtitle-1 font-weight-bold text-cyan-accent-2 mb-4 text-uppercase glow-text">Phi hành gia</h4>
                  <div class="d-flex flex-column gap-3">
                    <router-link to="/profile" class="star-link">Hồ sơ cá nhân</router-link>
                    <router-link to="/my-loans" class="star-link">Lịch sử mượn</router-link>
                    <router-link to="/favorites" class="star-link">Tủ sách yêu thích</router-link>
                    <router-link to="/help" class="star-link">Trạm hỗ trợ</router-link>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 font-weight-bold text-cyan-accent-2 mb-4 text-uppercase glow-text">Trạm liên lạc</h4>
                  <div class="contact-item mb-3 d-flex align-start">
                    <v-icon color="cyan-lighten-3" size="small" class="mt-1 mr-3">mdi-map-marker-star</v-icon>
                    <span class="text-grey-lighten-3">Khu II, Đ. 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ</span>
                  </div>
                  <div class="contact-item mb-3 d-flex align-center">
                    <v-icon color="cyan-lighten-3" size="small" class="mr-3">mdi-rocket-launch</v-icon>
                    <span class="text-grey-lighten-3 text-h6 font-weight-bold">+84 123 456 789</span>
                  </div>
                  <div class="mt-6">
                    <div class="text-caption text-cyan-lighten-4 mb-2">Đăng ký nhận tin:</div>
                    <div class="d-flex align-center glass-input rounded-pill pa-1">
                       <input type="text" placeholder="Email..." class="flex-grow-1 px-4 text-white" style="outline: none; background: transparent; min-width: 0;">
                       <v-btn color="cyan-accent-3" class="rounded-pill text-blue-grey-darken-4 font-weight-bold" elevation="5" size="small">Gửi</v-btn>
                    </div>
                  </div>
                </v-col>

              </v-row>
            </v-container>
          </div>

          <v-divider class="border-opacity-25 border-cyan"></v-divider>
          <div class="bg-black-transparent py-4 w-100">
             <v-container class="py-0 mx-auto" style="max-width: 1200px;">
                <div class="text-caption text-grey d-flex flex-column flex-sm-row justify-space-between align-center">
                  <span>&copy; {{ new Date().getFullYear() }} <strong>Library Nexus</strong>. Designed for the stars.</span>
                  <div class="mt-2 mt-sm-0">
                     <a href="#" class="text-grey text-decoration-none mr-3 hover-glow">Privacy</a>
                     <a href="#" class="text-grey text-decoration-none hover-glow">Terms</a>
                  </div>
                </div>
             </v-container>
          </div>
        </div>

      </div>
    </v-footer>

    <ChatWidget />

  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; 
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api.service';
import ChatWidget from '@/components/ChatWidget.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const drawer = ref(false);
const unreadCount = ref(0);

const logout = async () => {
  await authStore.logout();
  drawer.value = false;
  router.push('/home');
};

const fetchUnreadCount = async () => {
  if (authStore.isAuthenticated) {
    try {
      const res = await api.get('/notifications');
      if (Array.isArray(res.data)) {
        unreadCount.value = res.data.filter(n => !n.isRead).length;
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  } else {
    unreadCount.value = 0;
  }
};

onMounted(() => {
  fetchUnreadCount();
});

watch(() => route.path, () => {
    fetchUnreadCount();
});
</script>

<style scoped>
.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem; 
  transition: color 0.2s ease, padding-left 0.2s ease;
}

.footer-link:hover {
  color: #ffffff;
  padding-left: 5px; 
}

.hover-white:hover {
  color: #ffffff !important;
  text-decoration: underline !important;
}

.footer-social {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 50%;
}
.footer-social:hover {
  background-color: rgba(255,255,255,0.1);
  border-color: #ffffff;
}
.gap-2 { gap: 8px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.gap-3 { gap: 12px; }
.cursor-pointer { cursor: pointer; }
.glow-text {
  text-shadow: 0 0 10px rgba(100, 255, 218, 0.4);
  letter-spacing: 1px;
}

.glow-icon {
  filter: drop-shadow(0 0 5px rgba(100, 255, 218, 0.6));
}

.star-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
}

.star-link:hover {
  color: #64ffda; 
  padding-left: 10px; 
  text-shadow: 0 0 8px rgba(100, 255, 218, 0.5);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.social-btn {
  border-radius: 50%;
  border: 1px solid rgba(100, 255, 218, 0.3);
}
.social-btn:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: #64ffda;
  transform: translateY(-3px); 
}

.glass-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 255, 218, 0.2);
}
.glass-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.footer-universe {
  background-image: url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.footer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(5, 11, 20, 1) 0%, rgba(10, 25, 47, 0.9) 50%, rgba(13, 71, 161, 0.6) 100%);
  z-index: 1; 
}

.footer-content {
  z-index: 2;
}
.tracking-wider { letter-spacing: 0.05em; }
.bg-black-transparent { background-color: rgba(0,0,0,0.6); }
.gap-3 { gap: 12px; }
</style>