<template>
  <div v-if="!book" class="d-flex justify-center align-center py-12" style="min-height: 400px;">
     <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>

  <v-container class="py-12" v-else>
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

    <v-dialog v-model="dialog" max-width="600" persistent transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden">
        
        <div class="dialog-header bg-primary d-flex align-center px-6 py-4">
           <v-icon color="white" start class="mr-3">mdi-book-clock-outline</v-icon>
           <div class="text-h6 font-weight-bold text-white">
              {{ currentStep === 1 ? 'Xác nhận mượn sách' : 'Thanh toán & Hoàn tất' }}
           </div>
           <v-spacer></v-spacer>
           <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="dialog = false"></v-btn>
        </div>

        <v-card-text class="pa-0 bg-grey-lighten-5">
          <div v-if="currentStep === 1" class="pa-6">
            
            <div class="d-flex gap-4 mb-6 align-start">
               <v-img 
                  :src="book.coverUrl" 
                  width="80" 
                  height="120" 
                  cover 
                  class="rounded-lg elevation-3 flex-grow-0"
               ></v-img>
               <div>
                  <div class="text-h6 font-weight-bold text-primary mb-1 line-clamp-2">{{ book.tenSach }}</div>
                  <div class="text-body-2 text-medium-emphasis mb-1">{{ book.tacGia.join(', ') }}</div>
                  <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">
                     <v-icon start size="small">mdi-check-circle</v-icon> Sẵn sàng
                  </v-chip>
               </div>
            </div>

            <v-divider class="mb-6 border-dashed"></v-divider>

            <div class="mb-6">
               <label class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-2 d-block">Ngày trả dự kiến</label>
               <v-text-field
                  v-model="returnDate"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  color="primary"
                  :min="minDate"
                  @change="calculateRent"
                  prepend-inner-icon="mdi-calendar-range"
                  hide-details
                  class="rounded-lg"
               ></v-text-field>
               <div class="text-caption text-grey mt-2 ml-1">
                  <v-icon size="small" start>mdi-information-outline</v-icon>
                  Phí thuê được tính theo số ngày bạn giữ sách.
               </div>
            </div>

            <v-card variant="outlined" color="grey-lighten-2" class="bg-white rounded-lg pa-4 bill-card">
               <div class="d-flex justify-space-between mb-2 text-body-2">
                  <span class="text-grey-darken-1">Đơn giá thuê/ngày</span>
                  <span class="font-weight-medium">{{ formatCurrency(book.pricePerDay || 2000) }}</span>
               </div>
               <div class="d-flex justify-space-between mb-3 text-body-2">
                  <span class="text-grey-darken-1">Thời gian thuê</span>
                  <span class="font-weight-medium">{{ duration }} ngày</span>
               </div>
               
               <v-divider class="border-dashed my-3"></v-divider>
               
               <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-1 font-weight-bold text-grey-darken-3">Tổng cộng</span>
                  <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(estimatedCost) }}</span>
               </div>
            </v-card>

          </div>

          <div v-else-if="currentStep === 2" class="pa-6 text-center">
             <div class="mb-6">
                <v-avatar color="success-lighten-4" size="80" class="mb-4">
                   <v-icon color="success" size="40">mdi-check-decagram</v-icon>
                </v-avatar>
                <h3 class="text-h5 font-weight-bold text-grey-darken-3">Tạo phiếu thành công!</h3>
                <p class="text-body-2 text-grey">Vui lòng hoàn tất thanh toán để nhận sách.</p>
             </div>

             <div class="text-left">
                <v-text-field 
                  v-model="billingName" 
                  label="Tên người thanh toán" 
                  variant="outlined" density="compact" bg-color="white" class="mb-3 rounded-lg"
                  prepend-inner-icon="mdi-account"
                ></v-text-field>
                <v-text-field 
                  v-model="billingPhone" 
                  label="Số điện thoại" 
                  variant="outlined" density="compact" bg-color="white" class="mb-4 rounded-lg"
                  prepend-inner-icon="mdi-phone"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-2">Phương thức thanh toán</div>
                <v-radio-group v-model="paymentMethod" color="primary" hide-details class="payment-methods mb-6">
                   <v-card variant="outlined" class="mb-2 pa-2 rounded-lg" :class="{'border-primary bg-blue-lighten-5': paymentMethod === 'e-wallet'}" @click="paymentMethod = 'e-wallet'">
                      <div class="d-flex align-center">
                         <v-radio value="e-wallet" class="flex-grow-0 mr-2"></v-radio>
                         <v-icon start color="purple">mdi-wallet</v-icon> 
                         <span class="font-weight-medium">Ví điện tử (Momo/ZaloPay)</span>
                      </div>
                   </v-card>
                   <v-card variant="outlined" class="pa-2 rounded-lg" :class="{'border-primary bg-blue-lighten-5': paymentMethod === 'credit_card'}" @click="paymentMethod = 'credit_card'">
                      <div class="d-flex align-center">
                         <v-radio value="credit_card" class="flex-grow-0 mr-2"></v-radio>
                         <v-icon start color="blue-darken-2">mdi-credit-card</v-icon> 
                         <span class="font-weight-medium">Thẻ tín dụng / Ghi nợ</span>
                      </div>
                   </v-card>
                </v-radio-group>
             </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 bg-white border-t">
           <div v-if="currentStep === 1" class="d-flex w-100 gap-3">
              <v-btn 
                 variant="outlined" 
                 color="grey-darken-1" 
                 height="48" 
                 class="flex-grow-1 rounded-lg font-weight-bold text-capitalize"
                 @click="dialog = false"
              >
                 Hủy bỏ
              </v-btn>
              <v-btn 
                 color="primary" 
                 variant="flat" 
                 height="48" 
                 class="flex-grow-1 rounded-lg font-weight-bold text-capitalize shadow-lg"
                 @click="confirmLoan"
                 :loading="loanLoading"
                 :disabled="!returnDate"
              >
                 Xác nhận mượn
                 <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
           </div>

           <div v-else class="d-flex w-100 gap-3 flex-column">
              <v-btn 
                 block 
                 color="success" 
                 size="large" 
                 variant="flat"
                 class="rounded-lg font-weight-bold shadow-lg"
                 @click="processPayment" 
                 :loading="paymentLoading"
                 prepend-icon="mdi-lock"
              >
                 Thanh toán {{ formatCurrency(createdLoan?.rentCost || estimatedCost) }}
              </v-btn>
           </div>
        </v-card-actions>

      </v-card>
    </v-dialog>
    
    <v-card class="mt-6 rounded-xl elevation-1">
      <v-card-title class="font-weight-bold">Đánh giá & Bình luận</v-card-title>
      <v-card-text>
        <div v-if="authStore.isAuthenticated" class="mb-6 pa-4 bg-grey-lighten-5 rounded-lg">
           <div class="text-subtitle-2 mb-2">Viết đánh giá của bạn</div>
           <v-rating v-model="newReview.rating" color="amber" density="compact" hover size="small"></v-rating>
           <v-textarea 
              v-model="newReview.comment" 
              placeholder="Chia sẻ cảm nghĩ của bạn về cuốn sách này..." 
              variant="outlined" 
              bg-color="white" 
              rows="2" 
              auto-grow 
              class="mt-2"
           ></v-textarea>
           <div class="d-flex justify-end mt-2">
              <v-btn color="primary" @click="submitReview" :loading="submitting" :disabled="!newReview.rating || !newReview.comment">
                 Gửi đánh giá
              </v-btn>
           </div>
        </div>
        <div v-else class="text-center py-4 mb-4">
           <v-btn variant="text" color="primary" to="/login">Đăng nhập để viết đánh giá</v-btn>
        </div>

        <v-divider class="mb-4"></v-divider>

        <div v-if="reviews.length > 0">
           <div v-for="review in reviews" :key="review._id" class="d-flex mb-4">
              <v-avatar color="grey-lighten-3" class="mr-3">
                 <span class="text-primary font-weight-bold">{{ review.userId?.username?.charAt(0).toUpperCase() }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                 <div class="d-flex align-center">
                    <span class="font-weight-bold mr-2">{{ review.userId?.username }}</span>
                    <v-rating :model-value="review.rating" color="amber" density="compact" size="x-small" readonly></v-rating>
                    <span class="text-caption text-grey ml-2">{{ formatDate(review.createdAt) }}</span>
                 </div>
                 <div class="text-body-2 mt-1">{{ review.comment }}</div>
                 
                 <v-btn 
                    v-if="authStore.user?._id === review.userId?._id" 
                    variant="text" size="x-small" color="error" 
                    class="px-0 mt-1"
                    @click="deleteReview(review._id)"
                 >Xóa</v-btn>
              </div>
           </div>
        </div>
        <div v-else class="text-center text-grey py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
      </v-card-text>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const relatedBooks = ref([]);
const dialog = ref(false);
const currentStep = ref(1);
const createdLoan = ref(null);

const loanLoading = ref(false);
const paymentLoading = ref(false);

// STATE CHO REVIEW
const reviews = ref([]);
const newReview = reactive({ rating: 0, comment: '' });
const submitting = ref(false);

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

// ✅ HÀM CHÍNH: Fetch Book Detail
const fetchBook = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    book.value = res.data;
    
    const defDate = new Date();
    defDate.setDate(defDate.getDate() + 7);
    returnDate.value = defDate.toISOString().split('T')[0];
    calculateRent();
    fetchRelated();
  } catch (e) { 
    console.error('Error fetching book:', e); 
  }
};

const fetchRelated = async () => {
  try {
    const res = await api.get('/books?limit=6&page=2');
    relatedBooks.value = res.data.data;
  } catch(e) {
    console.error('Error fetching related books:', e);
  }
};

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
  
  billingName.value = authStore.user?.ten ? `${authStore.user.hoLot || ''} ${authStore.user.ten}`.trim() : authStore.user?.username;
  billingPhone.value = authStore.user?.dienThoai || '';
  paymentMethod.value = 'e-wallet';
  
  currentStep.value = 1;
  dialog.value = true;
};

const confirmLoan = async () => {
  loanLoading.value = true;
  try {
    const response = await api.post('/loans/request', {
      bookId: book.value._id,
      ngayHenTra: returnDate.value
    });
    
    createdLoan.value = response.data.loan;
    currentStep.value = 2;

  } catch (error) {
    alert(error.response?.data?.message || "Error borrowing book");
  } finally {
    loanLoading.value = false;
  }
};

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
      paymentType: 'rent_and_fine'
    });

    await api.post(`/payments/${intentRes.data.payment._id}/process`, {
      paymentMethod: paymentMethod.value,
      billingDetails: {
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

// FETCH REVIEWS
const fetchReviews = async () => {
  try {
    const res = await api.get(`/reviews/book/${route.params.id}`);
    reviews.value = res.data;
  } catch (e) { 
    console.error('Error fetching reviews:', e); 
  }
};

// SUBMIT REVIEW
const submitReview = async () => {
  submitting.value = true;
  try {
    await api.post('/reviews', {
      bookId: route.params.id,
      rating: newReview.rating,
      comment: newReview.comment
    });
    newReview.rating = 0;
    newReview.comment = '';
    await fetchReviews();
    alert('Cảm ơn bạn đã đánh giá!');
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi gửi đánh giá');
  } finally {
    submitting.value = false;
  }
};

// DELETE REVIEW
const deleteReview = async (id) => {
  if(!confirm('Xóa đánh giá này?')) return;
  try {
    await api.delete(`/reviews/${id}`);
    await fetchReviews();
  } catch(e) { 
    alert('Lỗi xóa'); 
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

onMounted(async () => {
  await fetchBook(route.params.id);
  await fetchReviews();
});

// --- PHẦN QUAN TRỌNG: Watcher để Reset dữ liệu khi ID đổi ---
watch(() => route.params.id, async (newId) => { 
  if (newId) {
    // 1. Reset dữ liệu cũ để UI hiện loading
    book.value = null;
    reviews.value = [];
    relatedBooks.value = [];
    
    // 2. Fetch dữ liệu mới
    await fetchBook(newId);
    await fetchReviews();
  }
});
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
/* Style cho Dialog mới */
.dialog-header {
  background: linear-gradient(135deg, #1565C0, #0D47A1); /* Gradient xanh đậm sang trọng */
}

.border-dashed {
  border-style: dashed !important;
  border-color: rgba(0,0,0,0.12) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bill-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}

.shadow-lg {
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
}

/* Hiệu ứng khi chọn phương thức thanh toán */
.payment-methods .v-card {
  cursor: pointer;
  transition: all 0.2s ease;
}
.payment-methods .v-card:hover {
  background-color: #F5F5F5;
}
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>