<template>
  <v-container class="py-12" v-if="book">
    <v-card elevation="0" class="bg-transparent overflow-visible">
      <v-row>
        <v-col cols="12" md="4" lg="3">
          <v-card elevation="12" class="rounded-lg overflow-hidden book-cover-card mx-auto">
            <v-img 
              :src="book.coverUrl || 'https://placehold.co/300x450'" 
              aspect-ratio="2/3" 
              cover
            >
               <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                    <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
                  </div>
               </template>
            </v-img>
          </v-card>
        </v-col>

        <v-col cols="12" md="8" lg="9" class="pl-md-10">
          <div class="mb-4">
             <h1 class="text-h3 font-weight-bold text-primary mb-2" style="line-height: 1.2;">
              {{ book.tenSach }}
             </h1>
             <div class="text-h6 text-medium-emphasis">
               by <span class="text-high-emphasis">{{ book.tacGia.join(', ') }}</span>
             </div>
          </div>

          <div class="d-flex align-center flex-wrap gap-4 mb-6">
            <v-chip 
              :color="book.availableCopies > 0 ? 'success' : 'error'" 
              variant="flat" 
              class="font-weight-bold px-4"
            >
              <v-icon start size="small">{{ book.availableCopies > 0 ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
              {{ book.availableCopies > 0 ? 'AVAILABLE' : 'OUT OF STOCK' }}
            </v-chip>
            
            <span class="text-body-2 text-medium-emphasis">
              Available: <strong>{{ book.availableCopies }}</strong> / {{ book.soQuyen }}
            </span>
             <v-divider vertical class="mx-2"></v-divider>
             <span class="text-body-2 text-medium-emphasis">
               Year: <strong>{{ book.namXuatBan }}</strong>
             </span>
          </div>

          <div class="d-flex gap-4 mb-8">
            <v-btn 
              color="secondary" 
              size="x-large" 
              class="px-8 text-capitalize font-weight-bold"
              prepend-icon="mdi-book-arrow-right"
              rounded="pill"
              elevation="4"
              @click="openBorrowDialog"
              :disabled="book.availableCopies === 0"
            >
              Borrow Now
            </v-btn>
            
            <v-btn 
              variant="outlined" 
              color="grey-darken-1" 
              size="x-large" 
              class="px-6 text-capitalize"
              prepend-icon="mdi-heart-outline"
              rounded="pill"
            >
              Add to Wishlist
            </v-btn>
          </div>

          <div class="mb-6">
            <v-chip v-for="cat in book.categories" :key="cat._id" color="secondary" variant="tonal" class="mr-2 mb-2">
              {{ cat.tenTheLoai }}
            </v-chip>
          </div>

          <div class="mb-8">
            <h3 class="text-h5 font-weight-bold mb-3 text-primary">Description</h3>
            <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8; max-width: 800px;">
              {{ book.moTa || 'No description available.' }}
            </p>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-divider class="my-12"></v-divider>

    <section>
       <h3 class="text-h4 font-weight-bold mb-6 text-center text-uppercase" style="letter-spacing: 1px;">You Might Also Like</h3>
       <v-row>
         <v-col cols="6" sm="4" md="3" lg="2" v-for="relBook in relatedBooks" :key="relBook._id">
            <v-card :to="`/books/${relBook._id}`" class="book-card rounded-lg" hover elevation="1">
              <v-img :src="relBook.coverUrl" aspect-ratio="2/3" cover class="bg-grey-lighten-3"></v-img>
              <v-card-item class="pa-2">
                <v-card-title class="text-subtitle-2 font-weight-bold text-truncate">{{ relBook.tenSach }}</v-card-title>
              </v-card-item>
            </v-card>
         </v-col>
       </v-row>
    </section>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card class="rounded-xl pa-4">
        
        <div v-if="currentStep === 1">
          <v-card-title class="text-h5 font-weight-bold text-center">Rental Details</v-card-title>
          <v-card-text>
            <div class="text-center mb-4 text-medium-emphasis">
              Select a return date to calculate the fee.
            </div>

            <v-text-field
              v-model="returnDate"
              label="Return Date"
              type="date"
              variant="outlined"
              :min="minDate"
              @change="calculateRent"
              prepend-inner-icon="mdi-calendar"
              color="secondary"
            ></v-text-field>

            <v-card variant="tonal" color="secondary" class="pa-4 mt-2 rounded-lg">
              <div class="d-flex justify-space-between mb-2">
                <span>Price per Day:</span>
                <strong>{{ formatCurrency(book.pricePerDay || 2000) }}</strong>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span>Duration:</span>
                <strong>{{ duration }} days</strong>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between text-h6 font-weight-bold">
                <span>Total Cost:</span>
                <span>{{ formatCurrency(estimatedCost) }}</span>
              </div>
            </v-card>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
             <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
             <v-btn 
               color="primary" 
               variant="flat" 
               size="large" 
               class="px-6"
               @click="confirmLoan"
               :loading="loanLoading"
               :disabled="!returnDate"
             >
               Confirm & Borrow
             </v-btn>
          </v-card-actions>
        </div>

        <div v-else-if="currentStep === 2" class="py-4">
          <div class="text-center mb-4">
             <v-icon color="success" size="50">mdi-check-circle</v-icon>
             <h3 class="text-h6 font-weight-bold text-success">Loan Created!</h3>
          </div>

          <div class="px-4">
              <v-text-field 
                label="Billing Name" 
                v-model="billingName" 
                density="compact" 
                variant="outlined" 
                prepend-inner-icon="mdi-account"
                class="mb-2"
              ></v-text-field>
              
              <v-text-field 
                label="Phone Number" 
                v-model="billingPhone" 
                density="compact" 
                variant="outlined" 
                prepend-inner-icon="mdi-phone"
                class="mb-2"
              ></v-text-field>

              <div class="text-subtitle-2 font-weight-bold mb-1">Payment Method</div>
              <v-radio-group v-model="paymentMethod" color="primary" inline density="compact">
                <v-radio value="e-wallet" label="E-Wallet"></v-radio>
                <v-radio value="credit_card" label="Credit Card"></v-radio>
              </v-radio-group>
              
              <v-card variant="outlined" class="pa-3 mb-4 bg-grey-lighten-5 text-center">
                <div class="text-caption text-uppercase">Amount to Pay</div>
                <div class="text-h5 font-weight-bold text-primary">{{ formatCurrency(createdLoan?.rentCost || estimatedCost) }}</div>
              </v-card>

              <v-btn block color="success" size="large" @click="processPayment" :loading="paymentLoading" class="mb-2">
                 Pay Now
              </v-btn>
              <v-btn block variant="text" color="secondary" @click="finishProcess">
                 Pay Later
              </v-btn>
          </div>
        </div>

      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const relatedBooks = ref([]);
const dialog = ref(false);
const currentStep = ref(1); // 1: Borrow, 2: Payment
const createdLoan = ref(null);

const loanLoading = ref(false);
const paymentLoading = ref(false);

// Rental Logic
const returnDate = ref('');
const duration = ref(1);
const estimatedCost = ref(0);

// Payment Info
const billingName = ref('');
const billingPhone = ref('');
const paymentMethod = ref('e-wallet');

const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
});

const fetchBook = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    book.value = res.data;
    
    const defDate = new Date();
    defDate.setDate(defDate.getDate() + 7);
    returnDate.value = defDate.toISOString().split('T')[0];
    calculateRent();
    fetchRelated();
  } catch (e) { console.error(e); }
};

const fetchRelated = async () => {
  try {
      const res = await api.get('/books?limit=6&page=2');
      relatedBooks.value = res.data.data;
  } catch(e) {}
}

const calculateRent = () => {
  if (!returnDate.value || !book.value) return;
  const start = new Date();
  const end = new Date(returnDate.value);
  const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
  duration.value = diff;
  estimatedCost.value = diff * (book.value.pricePerDay || 2000);
};

const openBorrowDialog = () => {
  if (!authStore.isAuthenticated) return router.push('/auth/login');
  
  // Reset form thanh toán với thông tin user
  billingName.value = authStore.user?.ten ? `${authStore.user.hoLot || ''} ${authStore.user.ten}`.trim() : authStore.user?.username;
  billingPhone.value = authStore.user?.dienThoai || '';
  paymentMethod.value = 'e-wallet';
  
  currentStep.value = 1;
  dialog.value = true;
};

// --- BƯỚC 1: TẠO LOAN ---
const confirmLoan = async () => {
  loanLoading.value = true;
  try {
    const response = await api.post('/loans/request', {
      bookId: book.value._id,
      ngayHenTra: returnDate.value
    });
    
    createdLoan.value = response.data.loan;
    currentStep.value = 2; // Chuyển sang thanh toán

  } catch (error) {
    alert(error.response?.data?.message || "Error borrowing book");
  } finally {
    loanLoading.value = false;
  }
};

// --- BƯỚC 2: THANH TOÁN ---
const processPayment = async () => {
  if (!createdLoan.value) return;
  if (!billingName.value || !billingPhone.value) {
      alert("Please enter billing name and phone number.");
      return;
  }

  paymentLoading.value = true;

  try {
    const intentRes = await api.post('/payments/create-intent', {
        loanId: createdLoan.value._id,
        amount: createdLoan.value.rentCost || estimatedCost.value,
        paymentType: 'rent_and_fine' // Hoặc 'rent'
    });

    await api.post(`/payments/${intentRes.data.payment._id}/process`, {
        paymentMethod: paymentMethod.value, // Gửi phương thức thanh toán
        billingDetails: { // Gửi thông tin người dùng
            name: billingName.value,
            phone: billingPhone.value
        }
    });

    alert("Payment Successful! Book is yours.");
    router.push('/my-loans');

  } catch (error) {
    console.error("Payment Error:", error);
    alert("Payment failed, but your loan is saved. Please pay in 'My Loans'.");
    router.push('/my-loans');
  } finally {
    paymentLoading.value = false;
    dialog.value = false;
  }
};

const finishProcess = () => {
    dialog.value = false;
    router.push('/my-loans');
};

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

onMounted(() => fetchBook(route.params.id));
watch(() => route.params.id, (newId) => { if(newId) fetchBook(newId) });
</script>

<style scoped>
.gap-4 { gap: 16px; }
.gap-3 { gap: 12px; }
.book-cover-card {
  transition: transform 0.3s;
}
.book-cover-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}
.book-card {
    border: 1px solid rgba(0,0,0,0.05);
}
</style>