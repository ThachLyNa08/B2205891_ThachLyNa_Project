<template>
  <v-container class="mt-8" v-if="book">
    <v-card class="pa-6" elevation="0">
      <v-row>
        <v-col cols="12" md="4" lg="3">
          <v-card elevation="10" class="rounded-lg mb-6">
            <v-img :src="book.coverUrl" aspect-ratio="2/3" cover></v-img>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4 mb-4">
            <div class="text-subtitle-2 mb-2 font-weight-bold">Rental Details</div>
            
            <v-text-field
              v-model="returnDate"
              label="Return Date"
              type="date"
              variant="outlined"
              density="compact"
              bg-color="white"
              :min="minDate"
              @change="calculateRent"
            ></v-text-field>

            <v-divider class="my-3"></v-divider>
            
            <div class="d-flex justify-space-between text-caption">
              <span>Price/Day:</span>
              <strong>{{ formatCurrency(book.pricePerDay || 2000) }}</strong>
            </div>
            <div class="d-flex justify-space-between text-caption">
              <span>Duration:</span>
              <strong>{{ duration }} days</strong>
            </div>
            <div class="d-flex justify-space-between mt-2 text-h6 text-primary font-weight-bold">
              <span>Total:</span>
              <span>{{ formatCurrency(estimatedCost) }}</span>
            </div>
          </v-card>

          <v-btn 
            block color="primary" size="large" 
            @click="requestLoan"
            :loading="loanLoading"
            :disabled="book.availableCopies === 0 || !returnDate"
          >
            Confirm & Borrow
          </v-btn>
        </v-col>

        <v-col cols="12" md="8" lg="9">
           <h1>{{ book.tenSach }}</h1>
           </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api.service';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const loanLoading = ref(false);

// Logic tính ngày & tiền
const returnDate = ref('');
const duration = ref(1);
const estimatedCost = ref(0);

// Ngày tối thiểu là ngày mai
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

const calculateRent = () => {
  if (!returnDate.value || !book.value) return;
  
  const start = new Date();
  const end = new Date(returnDate.value);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  duration.value = diffDays;
  estimatedCost.value = diffDays * (book.value.pricePerDay || 2000);
};

const fetchBook = async () => {
  try {
    const res = await api.get(`/books/${route.params.id}`);
    book.value = res.data;
    // Default set ngày trả là 7 ngày sau
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    returnDate.value = defaultDate.toISOString().split('T')[0];
    calculateRent();
  } catch (e) { console.error(e); }
};

const requestLoan = async () => {
  if(!authStore.isAuthenticated) return router.push('/auth/login');

  loanLoading.value = true;
  try {
    await api.post('/loans/request', {
      bookId: book.value._id,
      ngayHenTra: returnDate.value
    });
    alert("Borrow request successful! Please wait for approval.");
    router.push('/my-loans');
  } catch (error) {
    alert(error.response?.data?.message || "Error borrowing book");
  } finally {
    loanLoading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(fetchBook);
</script>