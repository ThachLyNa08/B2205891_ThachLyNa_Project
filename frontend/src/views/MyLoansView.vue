<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">My Loan History</h1>

    <v-card elevation="2" class="rounded-lg">
      <v-data-table 
        :headers="headers" 
        :items="loans" 
        :loading="loading" 
        class="elevation-0" 
        hover
      >
        
        <template v-slot:item.status="{ item }">
          <v-chip 
            :color="getStatusColor(item.status)" 
            size="small" 
            class="font-weight-bold text-uppercase" 
            label
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.bookId="{ item }">
          <router-link 
            v-if="item.bookId" 
            :to="`/books/${item.bookId._id}`" 
            class="text-decoration-none font-weight-medium text-primary"
          >
            {{ item.bookId.tenSach }}
          </router-link>
          <span v-else class="text-grey font-italic">Book Deleted</span>
        </template>

        <template v-slot:item.ngayMuon="{ item }">
          {{ formatDate(item.ngayMuon) }}
        </template>

        <template v-slot:item.ngayHenTra="{ item }">
          <span :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
            {{ formatDate(item.ngayHenTra) }}
            <v-icon v-if="isOverdue(item)" color="error" size="small" class="ml-1">mdi-alert-circle</v-icon>
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
            class="text-capitalize mr-2 mb-1"
            @click="openPaymentDialog(item)"
          >
            Pay {{ formatCurrency((item.rentCost || 0) + (item.phatTien || 0)) }}
          </v-btn>
          
          <v-btn
            v-if="['borrowed', 'overdue'].includes(item.status)"
            color="primary" 
            size="small" 
            variant="outlined" 
            class="text-capitalize mb-1"
            @click="returnBook(item)" 
            :loading="returnLoading === item._id"
          >
            Return Book
          </v-btn>

          <v-chip v-if="item.isPaid && item.status === 'returned'" color="success" size="small" variant="outlined" class="font-weight-bold">
            <v-icon start size="small">mdi-check-circle</v-icon> Paid
          </v-chip>
          
          <v-chip v-if="item.status === 'pending'" size="small" color="warning" variant="text">
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

    <v-dialog v-model="payDialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold text-center">Secure Checkout</v-card-title>
        <v-card-text>
          <v-alert icon="mdi-shield-lock" type="info" variant="tonal" density="compact" class="mb-4 text-caption">
            Secure payment gateway. Your info is encrypted.
          </v-alert>

          <v-card variant="tonal" color="info" class="pa-3 mb-4 rounded-lg border-dashed">
             <div class="d-flex justify-space-between text-body-2">
                <span>Book:</span> <strong>{{ selectedLoan?.bookId?.tenSach }}</strong>
             </div>
             <div class="d-flex justify-space-between text-body-2 mt-1">
                <span>Due Date:</span> <strong>{{ formatDate(selectedLoan?.ngayHenTra) }}</strong>
             </div>
          </v-card>

          <v-form ref="paymentForm" @submit.prevent="processPayment">
            <div class="text-subtitle-2 font-weight-bold mb-2">Billing Information</div>
            <v-text-field 
                v-model="paymentInfo.name" 
                label="Full Name" 
                variant="outlined" 
                density="compact" 
                prepend-inner-icon="mdi-account" 
                :rules="[v => !!v || 'Required']"
            ></v-text-field>
            
            <v-text-field 
                v-model="paymentInfo.phone" 
                label="Phone Number" 
                variant="outlined" 
                density="compact" 
                prepend-inner-icon="mdi-phone" 
                :rules="[v => !!v || 'Required']"
            ></v-text-field>
            
            <div class="text-subtitle-2 font-weight-bold mb-2 mt-2">Payment Method</div>
            <v-radio-group v-model="paymentInfo.method" color="primary" inline density="compact">
              <v-radio value="e-wallet" label="E-Wallet"></v-radio>
              <v-radio value="credit_card" label="Credit Card"></v-radio>
            </v-radio-group>

            <v-card variant="outlined" class="pa-3 mt-2 bg-grey-lighten-5 text-center">
               <div class="text-caption text-uppercase">Total Amount</div>
               <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(paymentInfo.amount) }}</div>
            </v-card>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
           <v-btn variant="text" @click="payDialog = false">Cancel</v-btn>
           <v-btn color="success" variant="flat" size="large" class="px-6" @click="processPayment" :loading="paymentLoading">
             Confirm Payment
           </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '../services/api.service';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const loans = ref([]);
const loading = ref(true);
const returnLoading = ref(null);

// Payment State
const payDialog = ref(false);
const paymentLoading = ref(false);
const selectedLoan = ref(null);
const paymentInfo = reactive({ name: '', phone: '', method: 'e-wallet', amount: 0 });
const paymentForm = ref(null);

const headers = [
  { title: 'Book Title', key: 'bookId', align: 'start', width: '25%' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Status', key: 'status' },
  { title: 'Rent Fee', key: 'rentCost', align: 'end' },
  { title: 'Fine', key: 'phatTien', align: 'end' },
  { title: 'Action', key: 'actions', align: 'center', minWidth: '150px' }
];

const fetchLoans = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/loans?userId=${authStore.user._id}`);
    loans.value = response.data.data;
  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
};

const openPaymentDialog = (loan) => {
    selectedLoan.value = loan;
    paymentInfo.amount = (loan.rentCost || 0) + (loan.phatTien || 0);
    paymentInfo.name = authStore.user?.ten ? `${authStore.user.hoLot || ''} ${authStore.user.ten}`.trim() : authStore.user?.username;
    paymentInfo.phone = authStore.user?.dienThoai || '';
    payDialog.value = true;
};

const processPayment = async () => {
  const { valid } = await paymentForm.value.validate();
  if (!valid) return;

  paymentLoading.value = true;
  try {
    const intentRes = await api.post('/payments/create-intent', {
        loanId: selectedLoan.value._id,
        amount: paymentInfo.amount,
        paymentType: 'rent_and_fine'
    });
    
    await api.post(`/payments/${intentRes.data.payment._id}/process`, {
        paymentMethod: paymentInfo.method,
        billingDetails: { 
            name: paymentInfo.name,
            phone: paymentInfo.phone
        }
    });
    
    alert("Payment successful! Thank you.");
    payDialog.value = false;
    await fetchLoans();
  } catch (error) {
    alert(error.response?.data?.message || "Payment failed.");
  } finally {
    paymentLoading.value = false;
  }
};

// --- HÀM TRẢ SÁCH ---
const returnBook = async (loan) => {
  if (!confirm(`Return book "${loan.bookId?.tenSach}"?`)) return;
  returnLoading.value = loan._id;
  try {
    await api.put(`/loans/${loan._id}/return`);
    alert("Book returned successfully!");
    await fetchLoans();
  } catch (error) { 
      console.error(error);
      alert("Failed to return book. " + (error.response?.data?.message || "")); 
  } 
  finally { returnLoading.value = null; }
};

const getStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning','cancelled':'grey'}[s] || 'grey');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => item.status !== 'returned' && item.status !== 'cancelled' && item.ngayHenTra && new Date(item.ngayHenTra) < new Date();

onMounted(fetchLoans);
</script>