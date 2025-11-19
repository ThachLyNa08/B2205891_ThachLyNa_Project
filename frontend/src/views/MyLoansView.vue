<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">My Loan History</h1>

    <v-card elevation="2" class="rounded-lg">
      <v-data-table
        :headers="headers"
        :items="loans"
        :loading="loading"
        class="elevation-0"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            class="font-weight-bold text-uppercase"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.bookId="{ item }">
          <router-link 
            :to="`/books/${item.bookId?._id}`" 
            class="text-decoration-none font-weight-medium text-primary"
          >
            {{ item.bookId?.tenSach || 'Unknown Book' }}
          </router-link>
        </template>

        <template v-slot:item.ngayMuon="{ item }">
          {{ formatDate(item.ngayMuon) }}
        </template>
        <template v-slot:item.ngayHenTra="{ item }">
          <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
            {{ formatDate(item.ngayHenTra) }}
          </span>
        </template>

        <template v-slot:no-data>
          <v-alert type="info" variant="tonal" class="mt-4">
            You haven't borrowed any books yet. 
            <router-link to="/books">Browse Catalog</router-link>
          </v-alert>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.service';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const loans = ref([]);
const loading = ref(true);

const headers = [
  { title: 'Book Title', key: 'bookId', align: 'start' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Return Date', key: 'ngayTraThucTe' },
  { title: 'Status', key: 'status' },
  { title: 'Fine', key: 'phatTien' },
];

const fetchLoans = async () => {
  loading.value = true;
  try {
    // Gọi API lấy danh sách mượn của user hiện tại
    const response = await api.get(`/loans?userId=${authStore.user._id}`);
    loans.value = response.data.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'borrowed': return 'info';
    case 'returned': return 'success';
    case 'overdue': return 'error';
    case 'pending': return 'warning';
    default: return 'grey';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const isOverdue = (item) => {
  if (item.status === 'returned') return false;
  return new Date(item.ngayHenTra) < new Date();
};

onMounted(() => {
  fetchLoans();
});
</script>