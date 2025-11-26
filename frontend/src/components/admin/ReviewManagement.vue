<template>
  <v-container fluid>
    <h2 class="text-h5 font-weight-bold text-white mb-4">Quản lý Đánh giá</h2>
    
    <v-card color="#1e293b" class="rounded-xl border-opacity-12">
      <v-data-table
         :headers="headers"
         :items="allReviews"
         :loading="loading"
         class="bg-transparent text-white custom-table"
      >
         <!-- Cột Sách -->
         <template v-slot:item.bookId="{ item }">
            <span class="font-weight-bold text-primary">{{ item.bookId?.tenSach }}</span>
         </template>

         <!-- Cột Rating -->
         <template v-slot:item.rating="{ item }">
            <v-rating :model-value="item.rating" color="amber" density="compact" size="x-small" readonly></v-rating>
         </template>

         <!-- Cột User -->
         <template v-slot:item.userId="{ item }">
            {{ item.userId?.username }}
         </template>

         <!-- Cột Hành động -->
         <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="deleteAdminReview(item._id)"></v-btn>
         </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api.service';

const allReviews = ref([]);
const loading = ref(true);

const headers = [
    { title: 'Sách', key: 'bookId' },
    { title: 'Người dùng', key: 'userId' },
    { title: 'Điểm', key: 'rating', width: '120px' },
    { title: 'Nội dung', key: 'comment' },
    { title: 'Ngày', key: 'createdAt' },
    { title: 'Xóa', key: 'actions', align: 'end' },
];

const fetchAllReviews = async () => {
    loading.value = true;
    try {
        const res = await api.get('/reviews/all');
        allReviews.value = res.data;
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
};

const deleteAdminReview = async (id) => {
    if(!confirm('Xóa bình luận này?')) return;
    try {
        await api.delete(`/reviews/${id}`);
        fetchAllReviews();
    } catch (e) { alert('Lỗi xóa'); }
};

onMounted(fetchAllReviews);
</script>

<style scoped>
:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.1) !important; color: white; }
</style>