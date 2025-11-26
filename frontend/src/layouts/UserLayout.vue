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
            <v-btn to="/login" variant="flat" color="white" size="small" class="text-primary font-weight-bold">Login</v-btn>
            <v-btn to="/register" variant="outlined" color="white" size="small">Register</v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list nav density="comfortable" class="mt-2">
        <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-2">EXPLORE</div>
        <v-list-item to="/home" prepend-icon="mdi-home-outline" title="Home" rounded="lg" color="primary"></v-list-item>
        <v-list-item to="/books" prepend-icon="mdi-bookshelf" title="Catalog" rounded="lg" color="primary"></v-list-item>
        
        <template v-if="authStore.isAuthenticated">
          <div class="text-caption text-grey ml-4 mb-1 font-weight-bold mt-4">MY LIBRARY</div>
          <v-list-item to="/profile" prepend-icon="mdi-account-outline" title="My Profile" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/my-loans" prepend-icon="mdi-book-clock-outline" title="My Loans" rounded="lg" color="primary"></v-list-item>
          <v-list-item to="/favorites" prepend-icon="mdi-heart-outline" title="Favorites" rounded="lg" color="pink"></v-list-item>
          <v-list-item to="/reading" prepend-icon="mdi-book-open-page-variant-outline" title="Reading" rounded="lg" color="info"></v-list-item>
          <v-list-item to="/history" prepend-icon="mdi-history" title="History" rounded="lg" color="warning"></v-list-item>
        </template>

        <v-divider class="my-4"></v-divider>
        <v-list-item v-if="authStore.isAuthenticated" @click="logout" prepend-icon="mdi-logout" title="Logout" base-color="error" rounded="lg"></v-list-item>
        <v-list-item v-else to="/login" prepend-icon="mdi-login" title="Login now" rounded="lg"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="#1565C0" elevation="2" class="px-2">
      <v-app-bar-nav-icon variant="text" color="white" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase font-weight-bold text-white cursor-pointer" @click="router.push('/home')">
        <div class="d-flex align-center">
            <v-icon start icon="mdi-library" class="mr-2"></v-icon>
            <span class="d-none d-sm-inline">Library Nexus</span>
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
                 <v-list-item to="/profile" prepend-icon="mdi-account-cog-outline" title="Profile"></v-list-item>
                 <v-list-item to="/my-loans" prepend-icon="mdi-book-clock" title="My Loans"></v-list-item>
                 <v-divider></v-divider>
                 <v-list-item @click="logout" title="Logout" prepend-icon="mdi-logout" class="text-error"></v-list-item>
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

    <v-footer app color="#0D47A1" class="text-center d-flex flex-column py-4 text-white">
      <div class="text-body-2 font-weight-light opacity-80">
        &copy; {{ new Date().getFullYear() }} — <strong>Library Nexus</strong>.
      </div>
    </v-footer>

    <ChatWidget />

  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Import GỘP 1 DÒNG
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.cursor-pointer { cursor: pointer; }
</style>