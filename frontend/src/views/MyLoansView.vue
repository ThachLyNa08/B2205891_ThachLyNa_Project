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

        <template v-slot:item.rentCost="{ item }">
          {{ formatCurrency(item.rentCost) }}
        </template>

        <template v-slot:item.phatTien="{ item }">
          <span :class="item.phatTien > 0 ? 'text-error font-weight-bold' : ''">
            {{ item.phatTien > 0 ? formatCurrency(item.phatTien) : '-' }}
          </span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn 
            v-if="!item.isPaid && (item.rentCost > 0 || item.phatTien > 0) && item.status !== 'pending'"
            color="success" 
            size="small" 
            variant="flat"
            class="text-capitalize"
            @click="payLoan(item)"
            :loading="paymentLoading === item._id"
          >
            Pay {{ formatCurrency((item.rentCost || 0) + (item.phatTien || 0)) }}
          </v-btn>
          
          <v-chip v-else-if="item.isPaid" color="success" size="small" variant="outlined">
            <v-icon start size="small">mdi-check-circle</v-icon> Paid
          </v-chip>
          
          <v-chip v-else-if="item.status === 'pending'" size="small" color="warning" variant="text">
            Pending Approval
          </v-chip>
        </template>

        <template v-slot:no-data>
          <v-alert type="info" variant="tonal" class="mt-4">
            You haven't borrowed any books yet. 
            <router-link to="/books" class="font-weight-bold text-decoration-none ml-1">Browse Catalog</router-link>
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
const paymentLoading = ref(null); // Theo dõi trạng thái loading của từng nút thanh toán

const headers = [
  { title: 'Book Title', key: 'bookId', align: 'start', width: '25%' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Return Date', key: 'ngayTraThucTe' },
  { title: 'Status', key: 'status' },
  { title: 'Rent Fee', key: 'rentCost', align: 'end' }, // Căn phải cho số tiền
  { title: 'Fine', key: 'phatTien', align: 'end' },      // Căn phải cho số tiền
  { title: 'Action', key: 'actions', align: 'center' }
];

const fetchLoans = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/loans?userId=${authStore.user._id}`);
    loans.value = response.data.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
  } finally {
    loading.value = false;
  }
};

// Hàm xử lý thanh toán giả lập (Frontend update trước)
const payLoan = async (loan) => {
  const totalAmount = (loan.rentCost || 0) + (loan.phatTien || 0);
  if (!confirm(`Confirm payment of ${formatCurrency(totalAmount)}?`)) return;
  
  paymentLoading.value = loan._id;
  try {
    // TODO: Gọi API tạo Payment thực tế (nếu đã làm phần Payment Backend)
    // await api.post('/payments/create-intent', { loanId: loan._id, amount: totalAmount, paymentType: 'rent_and_fine' });
    
    // Giả lập thành công: Update UI ngay lập tức
    loan.isPaid = true;
    
    // (Tùy chọn) Nếu có backend hỗ trợ update isPaid trong Loan, gọi API update
    // await api.put(`/loans/${loan._id}`, { isPaid: true });
    
    alert("Payment successful! Thank you.");
  } catch (error) {
    console.error("Payment failed:", error);
    alert("Payment processing failed. Please try again.");
  } finally {
    paymentLoading.value = null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'borrowed': return 'info';
    case 'returned': return 'success';
    case 'overdue': return 'error';
    case 'pending': return 'warning';
    case 'cancelled': return 'grey';
    default: return 'grey';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const isOverdue = (item) => {
  if (item.status === 'returned' || item.status === 'cancelled') return false;
  if (!item.ngayHenTra) return false;
  return new Date(item.ngayHenTra) < new Date();
};

onMounted(() => {
  fetchLoans();
});
</script>