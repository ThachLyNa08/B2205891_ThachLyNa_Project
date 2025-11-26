<template>
  <v-container class="py-6 max-width-800">
    
    <!-- HEADER: Bỏ nút Back, chỉ giữ tiêu đề và nút Đọc tất cả -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h4 font-weight-bold text-primary">Thông báo</h2>
        <div class="text-subtitle-1 text-grey">Cập nhật tin tức và trạng thái sách</div>
      </div>
      <v-btn 
        v-if="unreadCount > 0"
        variant="tonal" 
        color="primary" 
        prepend-icon="mdi-check-all"
        size="small"
        class="text-capitalize"
        @click="markAllRead"
      >
        Đọc tất cả
      </v-btn>
    </div>

    <!-- BỘ LỌC (TABS) -->
    <v-tabs v-model="currentFilter" color="primary" align-tabs="start" class="mb-6 border-b">
      <v-tab value="all" class="text-capitalize font-weight-bold">Tất cả</v-tab>
      <v-tab value="unread" class="text-capitalize font-weight-bold">
        Chưa đọc
        <v-chip v-if="unreadCount > 0" size="x-small" color="error" class="ml-2 font-weight-bold" variant="flat">
          {{ unreadCount }}
        </v-chip>
      </v-tab>
      <v-tab value="read" class="text-capitalize font-weight-bold">Đã đọc</v-tab>
    </v-tabs>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-10">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="filteredList.length === 0" class="text-center py-12 text-grey bg-white rounded-xl border border-dashed">
        <v-avatar color="grey-lighten-5" size="80" class="mb-3">
           <v-icon size="40" color="grey-lighten-1">mdi-bell-off</v-icon>
        </v-avatar>
        <div class="text-body-1">Không có thông báo nào ở mục này.</div>
    </div>

    <!-- DANH SÁCH THÔNG BÁO -->
    <div v-else>
      <v-slide-y-transition group>
        <v-card 
          v-for="item in displayedList" 
          :key="item._id"
          class="mb-3 rounded-lg border transition-swing cursor-pointer hover-card"
          :class="{'bg-blue-lighten-5 border-blue': !item.isRead, 'bg-white': item.isRead}"
          elevation="0"
          @click="handleClickNotification(item)"
        >
          <div class="d-flex pa-4 align-start">
             <!-- Icon -->
             <v-avatar :color="getTypeColor(item.type).bg" size="40" class="mr-4 elevation-1">
                <v-icon :color="getTypeColor(item.type).text">{{ getTypeIcon(item.type) }}</v-icon>
             </v-avatar>
             
             <!-- Content -->
             <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-space-between align-start">
                   <div class="font-weight-bold text-subtitle-2 text-truncate pr-2" :class="!item.isRead ? 'text-primary' : 'text-grey-darken-3'">
                      {{ item.title }}
                   </div>
                   <span class="text-caption text-grey flex-shrink-0">{{ formatDate(item.createdAt) }}</span>
                </div>
                <div class="text-body-2 text-grey-darken-1 mt-1 line-clamp-2">{{ item.message }}</div>
             </div>
             
             <!-- Dot -->
             <div v-if="!item.isRead" class="align-self-center ml-3">
                <v-icon color="primary" size="x-small">mdi-circle</v-icon>
             </div>
          </div>
        </v-card>
      </v-slide-y-transition>

      <!-- LOAD MORE -->
      <div class="text-center mt-6" v-if="hasMore">
         <v-btn variant="text" color="primary" class="text-capitalize" @click="loadMore" :loading="loadingMore">
            Xem thêm tin cũ
         </v-btn>
      </div>
    </div>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api.service';
import { useRouter } from 'vue-router';

// ... (Giữ nguyên toàn bộ phần Script Logic như cũ không cần sửa gì)
// Copy lại phần script từ câu trả lời trước
const router = useRouter();
const notifications = ref([]);
const loading = ref(true);
const currentFilter = ref('all');
const displayLimit = ref(10);
const loadingMore = ref(false);

const filteredList = computed(() => {
    if (!notifications.value) return [];
    return notifications.value.filter(item => {
        if (currentFilter.value === 'unread') return !item.isRead;
        if (currentFilter.value === 'read') return item.isRead;
        return true;
    });
});

const displayedList = computed(() => filteredList.value.slice(0, displayLimit.value));
const hasMore = computed(() => displayedList.value.length < filteredList.value.length);
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

const fetchNotifications = async () => {
    loading.value = true;
    try {
        const res = await api.get('/notifications'); 
        notifications.value = res.data;
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
};

const loadMore = () => {
    loadingMore.value = true;
    setTimeout(() => { displayLimit.value += 10; loadingMore.value = false; }, 300);
};

const markAllRead = async () => {
    try {
        await api.put('/notifications/read-all');
        notifications.value.forEach(n => n.isRead = true);
    } catch (e) {}
};

const handleClickNotification = (item) => {
    if (item.link) router.push(item.link);
};

const getTypeColor = (type) => {
    switch(type) {
        case 'warning': return { bg: 'orange-lighten-5', text: 'orange-darken-3' };
        case 'error': return { bg: 'red-lighten-5', text: 'red-darken-3' };
        default: return { bg: 'blue-lighten-5', text: 'blue-darken-3' };
    }
};

const getTypeIcon = (type) => {
    switch(type) {
        case 'warning': return 'mdi-clock-fast';
        case 'error': return 'mdi-alert-circle-outline';
        default: return 'mdi-information-variant';
    }
};

const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
};

watch(currentFilter, () => { displayLimit.value = 10; });
onMounted(fetchNotifications);
</script>

<style scoped>
.max-width-800 { max-width: 800px; margin: 0 auto; }
.border-blue { border: 1px solid #2196F3 !important; }
.hover-card:hover { background-color: #fafafa; }
.min-w-0 { min-width: 0; }
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>