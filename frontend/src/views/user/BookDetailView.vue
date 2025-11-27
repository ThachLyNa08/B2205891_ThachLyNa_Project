<template>
  <div class="book-detail-page bg-grey-lighten-5" style="min-height: 100vh;">
    
    <div v-if="!book" class="d-flex justify-center align-center" style="height: 80vh;">
       <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
    </div>

    <v-container class="py-8 py-md-12" v-else>
      
      <v-card elevation="0" class="rounded-xl overflow-hidden mb-8 bg-white shadow-soft">
          <v-row no-gutters>
            
            <v-col cols="12" md="4" lg="3" class="bg-blue-grey-lighten-5 d-flex align-center justify-center pa-8 position-relative">
              <div class="book-3d-wrapper">
                <v-img 
                  :src="book.coverUrl || 'https://placehold.co/300x450'" 
                  aspect-ratio="2/3" 
                  cover
                  class="rounded-lg elevation-10"
                  width="220"
                >
                   <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular indeterminate color="grey"></v-progress-circular>
                      </div>
                   </template>
                </v-img>
              </div>
            </v-col>

            <v-col cols="12" md="8" lg="9" class="pa-6 pa-md-10 d-flex flex-column">
                
                <div class="d-flex flex-wrap align-center justify-space-between mb-2">
                    <div class="d-flex align-center text-subtitle-1 font-weight-bold text-primary text-uppercase tracking-wide">
                        <v-icon size="small" class="mr-2">mdi-account-edit</v-icon>
                        {{ book.tacGia.join(', ') }}
                    </div>
                    
                    <div class="d-flex align-center">
                        <v-rating :model-value="4.5" color="amber" density="compact" half-increments readonly size="small"></v-rating>
                        <span class="text-caption text-grey ml-2 font-weight-medium">4.5/5 (User rating)</span>
                    </div>
                </div>

                <h1 class="text-h3 font-weight-bold text-blue-grey-darken-4 mb-4 title-font">
                  {{ book.tenSach }}
                </h1>

                <div class="d-flex flex-wrap gap-2 mb-6">
                  <v-chip v-for="cat in book.categories" :key="cat._id" size="small" color="primary" variant="tonal" class="font-weight-bold">
                    {{ cat.tenTheLoai }}
                  </v-chip>
                </div>

                <div class="info-grid py-4 mb-6 border-y border-opacity-10 d-flex align-center justify-space-between flex-wrap gap-4">
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Rental Price</div>
                        <div class="text-h5 font-weight-bold text-primary">{{ formatCurrency(book.pricePerDay || 2000) }}<span class="text-body-2 text-grey">/day</span></div>
                    </div>
                    <v-divider vertical class="hidden-xs-only" style="height: 40px;"></v-divider>
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Publisher</div>
                        <div class="text-subtitle-1 font-weight-medium">{{ book.maNXB?.tenNXB || 'Unknown' }}</div>
                    </div>
                    <v-divider vertical class="hidden-xs-only" style="height: 40px;"></v-divider>
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Published Year</div>
                        <div class="text-subtitle-1 font-weight-medium">{{ book.namXuatBan }}</div>
                    </div>
                    <v-divider vertical class="hidden-xs-only" style="height: 40px;"></v-divider>
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Availability</div>
                        <v-chip 
                            :color="book.availableCopies > 0 ? 'success' : 'error'" 
                            size="small" 
                            variant="flat" 
                            class="font-weight-bold"
                        >
                            {{ book.availableCopies > 0 ? `${book.availableCopies} In Stock` : 'Out of Stock' }}
                        </v-chip>
                    </div>
                </div>

                <div class="d-flex flex-column flex-sm-row gap-4 mt-auto">
                    <v-btn 
                      color="blue-darken-3" 
                      size="x-large" 
                      class="px-8 text-capitalize font-weight-bold flex-grow-1 flex-sm-grow-0 shadow-button"
                      prepend-icon="mdi-book-arrow-right"
                      rounded="pill"
                      height="56"
                      @click="openBorrowDialog"
                      :disabled="book.availableCopies === 0"
                    >
                      Borrow This Book
                    </v-btn>
                    
                    <v-btn 
                      :variant="isLiked ? 'flat' : 'outlined'" 
                      :color="isLiked ? 'pink' : 'blue-grey'" 
                      :class="isLiked ? 'text-white' : 'text-blue-grey-darken-1'"
                      size="x-large" 
                      class="px-6 text-capitalize flex-grow-1 flex-sm-grow-0"
                      :prepend-icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"
                      rounded="pill"
                      height="56"
                      @click="toggleMainFav"
                    >
                      {{ isLiked ? 'Saved to Favorites' : 'Add to Favorites' }}
                    </v-btn>
                </div>
            </v-col>
          </v-row>
      </v-card>

      <v-row>
        <v-col cols="12" md="8">
            <div class="mb-8">
                <h3 class="text-h5 font-weight-bold mb-4 text-blue-grey-darken-3 d-flex align-center">
                    <v-icon start color="teal" class="mr-2">mdi-text-box-outline</v-icon> Synopsis
                </h3>
                <v-card class="pa-6 rounded-xl border-none shadow-soft bg-white">
                    <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8; white-space: pre-line;">
                      {{ book.moTa || 'No description available for this book.' }}
                    </p>
                </v-card>
            </div>

            <div>
                <div class="d-flex justify-space-between align-end mb-4">
                    <h3 class="text-h5 font-weight-bold text-blue-grey-darken-3 d-flex align-center">
                        <v-icon start color="amber">mdi-star-circle-outline</v-icon> Community Reviews
                    </h3>
                    <v-chip color="blue-grey-lighten-4" size="small" variant="flat" class="text-blue-grey-darken-2 font-weight-bold">
                        {{ reviews.length }} Reviews
                    </v-chip>
                </div>

                <v-card class="pa-6 rounded-xl border-none shadow-soft bg-white">
                    <div v-if="authStore.isAuthenticated" class="mb-6 pa-4 bg-grey-lighten-4 rounded-lg border border-opacity-10">
                        <div class="d-flex align-center mb-2">
                            <v-avatar color="primary" size="32" class="mr-2 text-subtitle-2 font-weight-bold">
                                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                            </v-avatar>
                            <span class="font-weight-bold">Write your review</span>
                        </div>
                        <v-rating v-model="newReview.rating" color="amber" density="compact" hover size="small" class="mb-3"></v-rating>
                        <v-textarea 
                            v-model="newReview.comment" 
                            placeholder="What did you think about this book?" 
                            variant="outlined" 
                            bg-color="white" 
                            rows="2" 
                            auto-grow 
                            hide-details
                            class="mb-3"
                        ></v-textarea>
                        <div class="d-flex justify-end">
                            <v-btn color="primary" @click="submitReview" :loading="submitting" :disabled="!newReview.rating || !newReview.comment" class="text-capitalize px-6" rounded="lg" elevation="1">Post Review</v-btn>
                        </div>
                    </div>
                    <div v-else class="text-center py-6 mb-4 bg-grey-lighten-5 rounded-lg border-dashed">
                        <p class="text-grey mb-2">Want to share your thoughts?</p>
                        <v-btn variant="outlined" color="primary" to="/login" rounded="pill">Log in to Review</v-btn>
                    </div>

                    <div v-if="reviews.length > 0">
                        <div v-for="(review, index) in reviews" :key="review._id" class="review-item">
                            <v-divider v-if="index > 0" class="my-6 border-opacity-10"></v-divider>
                            <div class="d-flex align-start">
                                <v-avatar color="blue-grey-lighten-4" class="mr-4 text-blue-grey-darken-3 font-weight-bold">
                                    {{ review.userId?.username?.charAt(0).toUpperCase() }}
                                </v-avatar>
                                <div class="flex-grow-1">
                                    <div class="d-flex align-center justify-space-between mb-1">
                                        <span class="font-weight-bold text-body-1">{{ review.userId?.username }}</span>
                                        <span class="text-caption text-grey">{{ formatDate(review.createdAt) }}</span>
                                    </div>
                                    <v-rating :model-value="review.rating" color="amber" density="compact" size="x-small" readonly></v-rating>
                                    <p class="text-body-2 text-grey-darken-3 mt-2">{{ review.comment }}</p>
                                    
                                    <v-btn 
                                        v-if="authStore.user?._id === review.userId?._id" 
                                        variant="text" 
                                        size="small" 
                                        color="red-lighten-2" 
                                        class="px-0 mt-1 text-capitalize"
                                        @click="deleteReview(review._id)"
                                    >Delete</v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center text-grey py-8 d-flex flex-column align-center">
                        <v-icon size="48" color="grey-lighten-3" class="mb-2">mdi-comment-outline</v-icon>
                        Be the first to review this book!
                    </div>
                </v-card>
            </div>
        </v-col>

        <v-col cols="12" md="4">
            <v-card class="rounded-xl border-none shadow-soft bg-white pa-6 mb-8 sticky-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-4 text-uppercase text-grey ls-1">Book Details</h4>
                <v-list density="compact" class="pa-0">
                    <v-list-item class="px-0">
                        <template v-slot:prepend><v-icon size="small" class="mr-3 text-blue-grey-lighten-2">mdi-barcode</v-icon></template>
                        <v-list-item-title class="text-body-2 text-grey-darken-1">ISBN</v-list-item-title>
                        <template v-slot:append><span class="font-weight-medium">{{ book.isbn || 'N/A' }}</span></template>
                    </v-list-item>
                    <v-divider class="my-2 border-opacity-10"></v-divider>
                    <v-list-item class="px-0">
                        <template v-slot:prepend><v-icon size="small" class="mr-3 text-blue-grey-lighten-2">mdi-calendar-range</v-icon></template>
                        <v-list-item-title class="text-body-2 text-grey-darken-1">Publication Year</v-list-item-title>
                        <template v-slot:append><span class="font-weight-medium">{{ book.namXuatBan }}</span></template>
                    </v-list-item>
                    <v-divider class="my-2 border-opacity-10"></v-divider>
                    <v-list-item class="px-0">
                        <template v-slot:prepend><v-icon size="small" class="mr-3 text-blue-grey-lighten-2">mdi-domain</v-icon></template>
                        <v-list-item-title class="text-body-2 text-grey-darken-1">Publisher</v-list-item-title>
                        <template v-slot:append><span class="font-weight-medium text-truncate" style="max-width: 140px;">{{ book.maNXB?.tenNXB || 'Unknown' }}</span></template>
                    </v-list-item>
                </v-list>
            </v-card>

            <div>
               <h4 class="text-h6 font-weight-bold mb-4 text-blue-grey-darken-3">You Might Also Like</h4>
               <v-row dense>
                 <v-col cols="6" sm="4" md="6" v-for="relBook in relatedBooks" :key="relBook._id">
                    <BookCard :book="relBook" />
                 </v-col>
               </v-row>
            </div>
        </v-col>
      </v-row>

      <v-dialog v-model="dialog" max-width="600" persistent transition="dialog-bottom-transition">
        <v-card class="rounded-xl overflow-hidden">
          <div class="dialog-header bg-gradient-primary d-flex align-center px-6 py-4">
             <v-icon color="white" start class="mr-3">mdi-book-clock-outline</v-icon>
             <div class="text-h6 font-weight-bold text-white">
                {{ currentStep === 1 ? 'Confirm Rental' : 'Payment & Checkout' }}
             </div>
             <v-spacer></v-spacer>
             <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="dialog = false"></v-btn>
          </div>

          <v-card-text class="pa-0 bg-grey-lighten-5">
            <div v-if="currentStep === 1" class="pa-6">
              <div class="d-flex gap-4 mb-6 align-start bg-white pa-4 rounded-lg border-subtle">
                 <v-img :src="book.coverUrl" width="60" height="90" cover class="rounded elevation-2 flex-grow-0"></v-img>
                 <div>
                    <div class="text-subtitle-1 font-weight-bold text-primary mb-1 line-clamp-1">{{ book.tenSach }}</div>
                    <div class="text-caption text-medium-emphasis mb-1">{{ book.tacGia.join(', ') }}</div>
                    <div class="text-caption font-weight-bold text-success">In Stock</div>
                 </div>
              </div>
              
              <div class="mb-6">
                 <label class="text-caption font-weight-bold text-uppercase text-grey-darken-2 mb-2 d-block ml-1">Select Return Date</label>
                 <v-text-field
                    v-model="returnDate" type="date" variant="outlined" density="comfortable" bg-color="white"
                    :min="minDate" @change="calculateRent" prepend-inner-icon="mdi-calendar-arrow-right" hide-details class="rounded-lg"
                 ></v-text-field>
              </div>

              <v-card variant="flat" class="bg-blue-grey-lighten-5 rounded-lg pa-4 border-subtle">
                 <div class="d-flex justify-space-between mb-2 text-body-2">
                    <span class="text-grey-darken-2">Price per day</span>
                    <span class="font-weight-medium">{{ formatCurrency(book.pricePerDay || 2000) }}</span>
                 </div>
                 <div class="d-flex justify-space-between mb-3 text-body-2">
                    <span class="text-grey-darken-2">Duration</span>
                    <span class="font-weight-medium">{{ duration }} days</span>
                 </div>
                 <v-divider class="border-dashed my-3"></v-divider>
                 <div class="d-flex justify-space-between align-center">
                    <span class="text-subtitle-1 font-weight-bold text-grey-darken-3">Total Cost</span>
                    <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(estimatedCost) }}</span>
                 </div>
              </v-card>
            </div>

            <div v-else-if="currentStep === 2" class="pa-6">
               <div class="text-center mb-6">
                  <v-avatar color="green-lighten-5" size="80" class="mb-4"><v-icon color="green" size="40">mdi-check-decagram</v-icon></v-avatar>
                  <h3 class="text-h6 font-weight-bold text-grey-darken-3">Request Created Successfully!</h3>
               </div>
               <div class="text-left">
                  <v-text-field v-model="billingName" label="Billing Name" variant="outlined" density="compact" bg-color="white" class="mb-3 rounded-lg" prepend-inner-icon="mdi-account"></v-text-field>
                  <v-text-field v-model="billingPhone" label="Phone Number" variant="outlined" density="compact" bg-color="white" class="mb-4 rounded-lg" prepend-inner-icon="mdi-phone"></v-text-field>
                  <div class="text-caption font-weight-bold text-uppercase text-grey mb-2 ml-1">Payment Method</div>
                  <v-radio-group v-model="paymentMethod" color="primary" hide-details class="payment-methods mb-2">
                     <v-card variant="outlined" class="mb-2 pa-3 rounded-lg d-flex align-center cursor-pointer" :class="{'border-primary bg-blue-lighten-5': paymentMethod === 'e-wallet'}" @click="paymentMethod = 'e-wallet'">
                         <v-radio value="e-wallet" class="flex-grow-0 mr-3"></v-radio>
                         <div class="flex-grow-1 font-weight-medium text-body-2">E-Wallet (Momo/ZaloPay)</div>
                         <v-icon color="purple">mdi-wallet</v-icon>
                     </v-card>
                     <v-card variant="outlined" class="pa-3 rounded-lg d-flex align-center cursor-pointer" :class="{'border-primary bg-blue-lighten-5': paymentMethod === 'credit_card'}" @click="paymentMethod = 'credit_card'">
                        <v-radio value="credit_card" class="flex-grow-0 mr-3"></v-radio>
                        <div class="flex-grow-1 font-weight-medium text-body-2">Credit / Debit Card</div>
                        <v-icon color="blue-darken-2">mdi-credit-card</v-icon>
                     </v-card>
                  </v-radio-group>
               </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 bg-white border-t">
             <div v-if="currentStep === 1" class="d-flex w-100 gap-3">
                <v-btn variant="text" color="grey-darken-1" height="48" class="flex-grow-1 text-capitalize rounded-lg" @click="dialog = false">Cancel</v-btn>
                <v-btn color="primary" variant="flat" height="48" class="flex-grow-1 rounded-lg font-weight-bold shadow-button" @click="confirmLoan" :loading="loanLoading" :disabled="!returnDate">
                    Continue <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
             </div>
             <div v-else class="d-flex w-100 gap-3 flex-column">
                <v-btn block color="success" size="large" variant="flat" class="rounded-lg font-weight-bold shadow-button" @click="processPayment" :loading="paymentLoading">Pay {{ formatCurrency(createdLoan?.rentCost || estimatedCost) }}</v-btn>
                <v-btn block variant="text" color="grey-darken-1" class="text-capitalize" @click="finishProcess">Pay Later at Counter</v-btn>
             </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import BookCard from '@/components/BookCard.vue';

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

// Review State
const reviews = ref([]);
const newReview = reactive({ rating: 0, comment: '' });
const submitting = ref(false);

// Rental State
const returnDate = ref('');
const duration = ref(1);
const estimatedCost = ref(0);
const billingName = ref('');
const billingPhone = ref('');
const paymentMethod = ref('e-wallet');

const minDate = computed(() => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
});

const isLiked = computed(() => book.value && authStore.isFavorite(book.value._id));

const toggleMainFav = async () => {
    if (!authStore.isAuthenticated) { router.push('/login'); return; }
    await authStore.toggleFavorite(book.value);
};

const fetchBook = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    book.value = res.data;
    const defDate = new Date(); defDate.setDate(defDate.getDate() + 7);
    returnDate.value = defDate.toISOString().split('T')[0];
    calculateRent();
    fetchRelated();
  } catch (e) { console.error(e); }
};

const fetchRelated = async () => {
  try {
    const res = await api.get('/books?limit=8&page=1'); 
    relatedBooks.value = res.data.data
        .filter(b => b._id !== book.value._id) // Loại bỏ cuốn đang xem
        .slice(0, 4); // Chỉ lấy 4 cuốn 
  } catch(e) { console.error(e); }
};

const calculateRent = () => {
  if (!returnDate.value || !book.value) return;
  const start = new Date(); const end = new Date(returnDate.value);
  const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
  duration.value = diff; estimatedCost.value = diff * (book.value.pricePerDay || 2000);
};

const openBorrowDialog = () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  billingName.value = authStore.user?.ten ? `${authStore.user.hoLot || ''} ${authStore.user.ten}`.trim() : authStore.user?.username;
  billingPhone.value = authStore.user?.dienThoai || '';
  paymentMethod.value = 'e-wallet';
  currentStep.value = 1; dialog.value = true;
};

const confirmLoan = async () => {
  loanLoading.value = true;
  try {
    const response = await api.post('/loans/request', { bookId: book.value._id, ngayHenTra: returnDate.value });
    createdLoan.value = response.data.loan; currentStep.value = 2;
  } catch (error) { alert(error.response?.data?.message || "Error"); } finally { loanLoading.value = false; }
};

const processPayment = async () => {
  if (!createdLoan.value) return;
  paymentLoading.value = true;
  try {
    const intentRes = await api.post('/payments/create-intent', { loanId: createdLoan.value._id, amount: createdLoan.value.rentCost || estimatedCost.value, paymentType: 'rent_and_fine' });
    await api.post(`/payments/${intentRes.data.payment._id}/process`, { paymentMethod: paymentMethod.value, billingDetails: { name: billingName.value, phone: billingPhone.value } });
    alert("Payment Successful!"); router.push('/my-loans');
  } catch (error) { alert("Payment failed"); router.push('/my-loans'); } finally { paymentLoading.value = false; dialog.value = false; }
};

const finishProcess = () => { dialog.value = false; router.push('/my-loans'); };
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const fetchReviews = async () => { try { const res = await api.get(`/reviews/book/${route.params.id}`); reviews.value = res.data; } catch (e) {} };
const submitReview = async () => { submitting.value = true; try { await api.post('/reviews', { bookId: route.params.id, rating: newReview.rating, comment: newReview.comment }); newReview.rating = 0; newReview.comment = ''; await fetchReviews(); alert('Review submitted!'); } catch (e) { alert('Error'); } finally { submitting.value = false; } };
const deleteReview = async (id) => { if(!confirm('Delete?')) return; try { await api.delete(`/reviews/${id}`); await fetchReviews(); } catch(e) {} };
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

onMounted(async () => {
  if (authStore.isAuthenticated) await authStore.fetchFavorites();
  await fetchBook(route.params.id);
  await fetchReviews();
});

watch(() => route.params.id, async (newId) => { 
  if (newId) {
    book.value = null; reviews.value = []; relatedBooks.value = [];
    await fetchBook(newId); await fetchReviews();
  }
});
</script>

<style scoped>
.gap-4 { gap: 16px; } .gap-2 { gap: 8px; } .gap-6 { gap: 24px; }
.ls-1 { letter-spacing: 1px; } .tracking-wide { letter-spacing: 0.05em; }

/* Book 3D Effect */
.book-3d-wrapper { perspective: 1000px; transform: rotateY(-5deg); transition: transform 0.5s; }
.book-3d-wrapper:hover { transform: rotateY(0deg) scale(1.02); }

.shadow-soft { box-shadow: 0 4px 30px rgba(0,0,0,0.06) !important; }
.shadow-button { box-shadow: 0 8px 16px rgba(33, 150, 243, 0.25); }
.border-subtle { border: 1px solid rgba(0,0,0,0.08) !important; }
.border-dashed { border-style: dashed !important; border-color: rgba(0,0,0,0.12) !important; }
.border-none { border: none !important; }

.bg-gradient-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.cursor-pointer { cursor: pointer; }
.border-primary { border-color: rgb(var(--v-theme-primary)) !important; border-width: 2px !important; }
</style>