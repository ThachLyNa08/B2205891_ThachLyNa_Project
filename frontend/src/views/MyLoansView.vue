<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">My Loan History</h1>

    <v-card elevation="2" class="rounded-lg">
      <v-data-table :headers="headers" :items="loans" :loading="loading" class="elevation-0" hover>
        
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" class="font-weight-bold text-uppercase" label>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.bookId="{ item }">
          <div v-if="item.bookId">
             <router-link :to="`/books/${item.bookId._id}`" class="text-decoration-none font-weight-medium text-primary">
              {{ item.bookId.tenSach }}
            </router-link>
          </div>
          <span v-else class="text-grey font-italic">Book Deleted</span>
        </template>

        <template v-slot:item.ngayMuon="{ item }">
          {{ formatDate(item.ngayMuon) }}
        </template>

        <template v-slot:item.ngayHenTra="{ item }">
          <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
            {{ formatDate(item.ngayHenTra) }}
            <v-icon v-if="isOverdue(item)" color="error" size="small">mdi-alert-circle</v-icon>
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
    v-if="!item.isPaid && (item.rentCost > 0 || item.phatTien > 0) && item.status !== 'cancelled'"
    color="success" 
    size="small" 
    variant="flat"
    class="text-capitalize mr-2"
    @click="payLoan(item)"
    :loading="paymentLoading === item._id"
  >
    Pay {{ formatCurrency((item.rentCost || 0) + (item.phatTien || 0)) }}
  </v-btn>
  
  <v-btn
    v-if="['borrowed', 'overdue'].includes(item.status)"
    color="primary"
    size="small"
    variant="outlined"
    class="text-capitalize"
    @click="returnBook(item)"
    :loading="returnLoading === item._id"
  >
    Return Book
  </v-btn>

  <v-chip v-if="item.isPaid && item.status === 'returned'" color="success" size="small" variant="text">
    Completed
  </v-chip>
  
  <v-chip v-if="item.status === 'pending'" size="small" color="warning" variant="text">
    Pending
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
const paymentLoading = ref(null);
const returnLoading = ref(null);

const headers = [
  { title: 'Book Title', key: 'bookId', align: 'start', width: '25%' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Return Date', key: 'ngayTraThucTe' },
  { title: 'Status', key: 'status' },
  { title: 'Rent Fee', key: 'rentCost', align: 'end' },
  { title: 'Fine', key: 'phatTien', align: 'end' },
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

const payLoan = async (loan) => {
  if (!loan || !loan._id) return;

  const totalAmount = (loan.rentCost || 0) + (loan.phatTien || 0);
  if (!confirm(`Confirm payment of ${formatCurrency(totalAmount)}?`)) return;
  
  paymentLoading.value = loan._id;
  try {
    const intentRes = await api.post('/payments/create-intent', {
        loanId: loan._id,
        amount: totalAmount,
        paymentType: 'rent_and_fine'
    });
    
    await api.post(`/payments/${intentRes.data.payment._id}/process`, {
        paymentMethod: 'e-wallet'
    });
    
    alert("Payment successful! Thank you.");
    await fetchLoans(); // Tải lại để cập nhật trạng thái Paid

  } catch (error) {
    console.error("Payment failed:", error);
    alert(error.response?.data?.message || "Payment processing failed.");
  } finally {
    paymentLoading.value = null;
  }
};

// --- Helpers (Giữ nguyên) ---
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
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => item.status !== 'returned' && item.status !== 'cancelled' && item.ngayHenTra && new Date(item.ngayHenTra) < new Date();
const returnBook = async (loan) => {
  if (!confirm(`Return book "${loan.bookId?.tenSach}"?`)) return;

  returnLoading.value = loan._id;
  try {
    // Gọi API trả sách
    await api.put(`/loans/${loan._id}/return`);
    
    alert("Book returned successfully!");
    await fetchLoans(); // Load lại danh sách để cập nhật trạng thái
  } catch (error) {
    console.error("Return failed:", error);
    alert(error.response?.data?.message || "Failed to return book.");
  } finally {
    returnLoading.value = null;
  }
};
onMounted(fetchLoans);
</script>