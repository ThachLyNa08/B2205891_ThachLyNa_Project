<template>
  <v-container class="py-6 fill-height align-start">
    
    <!-- 1. HEADER & THỐNG KÊ -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-md-end mb-6 w-100 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary d-flex align-center">
          <v-icon start size="large" color="primary">mdi-library-shelves</v-icon>
          My Bookshelf
        </h1>
        <div class="text-subtitle-1 text-grey">Track your reading journey and loan status</div>
      </div>
      
      <!-- Stats Cards Mini -->
      <div class="d-flex gap-3 overflow-x-auto pb-1">
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-blue-lighten-5">
            <v-icon color="blue" size="large" class="mr-3">mdi-book-open-variant</v-icon>
            <div>
                <div class="text-caption text-blue-darken-2 font-weight-bold text-uppercase">Active</div>
                <div class="text-h6 font-weight-bold text-blue line-height-1">{{ stats.active }}</div>
            </div>
         </v-card>
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-orange-lighten-5">
            <v-icon color="orange" size="large" class="mr-3">mdi-clock-outline</v-icon>
            <div>
                <div class="text-caption text-orange-darken-3 font-weight-bold text-uppercase">Pending</div>
                <div class="text-h6 font-weight-bold text-orange line-height-1">{{ stats.pending }}</div>
            </div>
         </v-card>
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-red-lighten-5" v-if="stats.fine > 0">
            <v-icon color="red" size="large" class="mr-3">mdi-alert-circle</v-icon>
            <div>
                <div class="text-caption text-red-darken-3 font-weight-bold text-uppercase">Fines</div>
                <div class="text-h6 font-weight-bold text-red line-height-1">{{ stats.fine }}</div>
            </div>
         </v-card>
      </div>
    </div>

    <!-- 2. TABS PHÂN LOẠI -->
    <v-card class="rounded-xl border-0 bg-transparent w-100">
      <v-tabs v-model="currentTab" color="primary" align-tabs="start" class="mb-4 border-b">
        <v-tab value="active" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-book-clock</v-icon> Active Loans
        </v-tab>
        <v-tab value="pending" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-timer-sand</v-icon> Pending
        </v-tab>
        <v-tab value="unpaid" class="text-capitalize font-weight-bold px-6">
           <v-badge v-if="stats.fine > 0" color="error" dot inline>
              <v-icon start>mdi-cash-multiple</v-icon> Unpaid Fines
           </v-badge>
           <span v-else><v-icon start>mdi-cash-check</v-icon> Payments</span>
        </v-tab>
        <v-tab value="history" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-history</v-icon> History
        </v-tab>
      </v-tabs>

      <!-- 3. NỘI DUNG DANH SÁCH (Grid View) -->
      <v-window v-model="currentTab">
        <v-window-item v-for="tab in ['active', 'pending', 'unpaid', 'history']" :key="tab" :value="tab">
          
          <!-- Loading -->
          <v-row v-if="loading">
             <v-col cols="12" md="6" lg="4" v-for="n in 3" :key="n">
                <v-skeleton-loader type="image, list-item-two-line" class="rounded-xl border"></v-skeleton-loader>
             </v-col>
          </v-row>

          <!-- Empty State -->
          <div v-else-if="paginatedLoans.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed">
             <v-avatar color="grey-lighten-5" size="120" class="mb-4">
                <v-icon size="60" color="grey-lighten-1">mdi-bookshelf</v-icon>
             </v-avatar>
             <div class="text-h6 text-grey-darken-1">Nothing here yet</div>
             <div class="text-body-2 text-grey mb-6">You have no books in {{ tab }} section.</div>
             <v-btn v-if="tab !== 'history'" color="primary" to="/books" rounded="pill" variant="flat" class="px-8 font-weight-bold">
                Browse Catalog
             </v-btn>
          </div>

          <!-- Danh sách Card -->
          <div v-else>
            <v-row>
              <v-col cols="12" md="6" lg="4" v-for="loan in paginatedLoans" :key="loan._id">
                <v-hover v-slot="{ isHovering, props }">
                  <v-card 
                    v-bind="props"
                    class="loan-card rounded-xl border h-100 d-flex flex-column transition-swing"
                    :elevation="isHovering ? 8 : 0"
                    :class="{'border-primary': isHovering}"
                  >
                    <div class="d-flex pa-4 flex-grow-1">
                       <!-- Ảnh bìa sách -->
                       <div class="book-cover-wrapper mr-4 rounded-lg overflow-hidden elevation-2 flex-shrink-0 position-relative">
                          <v-img 
                            :src="loan.bookId?.coverUrl || 'https://placehold.co/150'" 
                            width="100" height="150" cover
                            class="bg-grey-lighten-3"
                          ></v-img>
                          <!-- Status Label trên ảnh -->
                          <div class="status-badge text-caption font-weight-bold px-2 py-1 rounded-br-lg text-white" :class="getStatusColorClass(loan)">
                             {{ loan.status }}
                          </div>
                       </div>

                       <!-- Thông tin -->
                       <div class="flex-grow-1 min-w-0 d-flex flex-column">
                          <router-link :to="`/books/${loan.bookId?._id}`" class="text-decoration-none">
                             <h3 class="text-subtitle-1 font-weight-bold text-primary text-truncate-2 mb-1 cursor-pointer hover-underline line-height-1-2">
                                {{ loan.bookId?.tenSach || 'Unknown Book' }}
                             </h3>
                          </router-link>
                          
                          <div class="text-caption text-grey mb-3">
                             Request ID: #{{ loan._id.slice(-6).toUpperCase() }}
                          </div>

                          <div class="mt-auto d-flex flex-column gap-1 text-body-2">
                             <!-- Ngày mượn -->
                             <div class="d-flex align-center text-grey-darken-1">
                                <v-icon size="small" class="mr-2" color="grey">mdi-calendar-arrow-right</v-icon> 
                                {{ formatDate(loan.ngayMuon) }}
                             </div>
                             
                             <!-- Hạn trả / Ngày trả -->
                             <div class="d-flex align-center" :class="isOverdue(loan) ? 'text-error font-weight-bold' : 'text-grey-darken-1'">
                                <v-icon size="small" class="mr-2" :color="isOverdue(loan) ? 'error' : 'grey'">
                                   {{ tab === 'history' ? 'mdi-calendar-check' : 'mdi-calendar-clock' }}
                                </v-icon>
                                {{ tab === 'history' ? formatDate(loan.ngayTraThucTe) : formatDate(loan.ngayHenTra) }}
                                <span v-if="isOverdue(loan)" class="ml-1 text-caption">(Overdue)</span>
                             </div>

                             <!-- Phí phạt -->
                             <div v-if="loan.phatTien > 0" class="d-flex align-center mt-1 text-error">
                                <v-icon size="small" class="mr-2">mdi-cash-remove</v-icon>
                                <span class="font-weight-bold">Fine: {{ formatCurrency(loan.phatTien) }}</span>
                                <v-chip v-if="loan.isFinePaid" size="x-small" color="success" class="ml-2 font-weight-bold" variant="flat">PAID</v-chip>
                                <v-chip v-else size="x-small" color="error" class="ml-2 font-weight-bold" variant="flat">UNPAID</v-chip>
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- Actions Footer -->
                    <div class="pa-3 bg-grey-lighten-5 border-t d-flex justify-end align-center gap-2">
                       
                       <!-- Nút Hủy (Cho Pending) -->
                       <v-btn 
                          v-if="loan.status === 'pending'"
                          color="error" size="small" variant="tonal"
                          prepend-icon="mdi-close-circle"
                          @click="cancelRequest(loan)"
                       >
                          Cancel Request
                       </v-btn>

                       <!-- Nút Trả Sách (Cho Active/Overdue) -->
                       <v-btn 
                          v-if="['borrowed', 'overdue'].includes(loan.status)"
                          color="primary" size="small" variant="flat"
                          prepend-icon="mdi-keyboard-return"
                          @click="returnBook(loan)"
                          :loading="processingId === loan._id"
                       >
                          Return
                       </v-btn>

                       <!-- Nút Thanh Toán (Cho Unpaid) -->
                       <v-btn 
                          v-if="(!loan.isPaid && loan.rentCost > 0) || (!loan.isFinePaid && loan.phatTien > 0)"
                          color="success" size="small" variant="elevated"
                          prepend-icon="mdi-credit-card-outline"
                          @click="openPaymentDialog(loan)"
                       >
                          Pay Now
                       </v-btn>

                       <!-- Badge cho History -->
                       <div v-if="tab === 'history'" class="text-caption text-grey font-italic">
                          {{ loan.status === 'cancelled' ? 'Cancelled by You/Admin' : 'Successfully Returned' }}
                       </div>

                    </div>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>

            <!-- 4. PHÂN TRANG (PAGINATION) -->
            <div class="d-flex justify-center mt-8">
               <v-pagination
                  v-model="page"
                  :length="pageCount"
                  :total-visible="5"
                  color="primary"
                  rounded="circle"
                  class="shadow-pagination"
               ></v-pagination>
            </div>
          </div>

        </v-window-item>
      </v-window>
    </v-card>

    <!-- ============================================ -->
    <!-- PAYMENT DIALOG (Giữ nguyên đẹp như cũ) -->
    <!-- ============================================ -->
    <v-dialog v-model="payDialog" max-width="450" persistent>
       <v-card class="rounded-xl overflow-hidden">
          <div class="bg-gradient-success pa-4 text-white text-center">
             <div class="text-overline opacity-90 mb-1">SECURE PAYMENT</div>
             <div class="text-h4 font-weight-bold">{{ formatCurrency(paymentInfo.amount) }}</div>
             <div class="text-caption mt-1">Fee & Fine Settlement</div>
          </div>
          <v-card-text class="pa-5">
             <div class="text-subtitle-2 font-weight-bold mb-3">Select Payment Method</div>
             <v-radio-group v-model="paymentInfo.method" hide-details class="mb-4">
                <v-radio value="momo" class="mb-2 border rounded px-3 py-2 payment-radio" color="pink">
                   <template v-slot:label><span class="font-weight-medium text-grey-darken-3 ml-2">Momo Wallet</span></template>
                </v-radio>
                <v-radio value="card" class="border rounded px-3 py-2 payment-radio" color="blue">
                   <template v-slot:label><span class="font-weight-medium text-grey-darken-3 ml-2">Visa / MasterCard</span></template>
                </v-radio>
             </v-radio-group>
             <v-checkbox v-model="paymentInfo.agree" color="primary" density="compact" hide-details>
                <template v-slot:label><span class="text-caption">I agree to the Terms of Service</span></template>
             </v-checkbox>
          </v-card-text>
          <v-card-actions class="px-5 pb-5 pt-0">
             <v-btn variant="text" color="grey-darken-1" @click="payDialog = false" class="flex-grow-1">Cancel</v-btn>
             <v-btn color="success" variant="elevated" class="flex-grow-1 font-weight-bold rounded-lg" height="44" :loading="paymentLoading" :disabled="!paymentInfo.agree" @click="processPayment">Confirm Payment</v-btn>
          </v-card-actions>
       </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top">{{ snackbar.message }}</v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const allLoans = ref([]); // Chứa toàn bộ dữ liệu lấy về
const loading = ref(true);
const currentTab = ref('active');
const page = ref(1);
const itemsPerPage = 6; // Số lượng thẻ trên mỗi trang
const processingId = ref(null);

// Stats
const stats = reactive({ active: 0, pending: 0, fine: 0 });

// Payment States
const payDialog = ref(false);
const paymentLoading = ref(false);
const selectedLoan = ref(null);
const paymentInfo = reactive({ method: 'momo', amount: 0, agree: true });
const snackbar = ref({ show: false, message: '', color: '' });

// --- FILTER & PAGINATION LOGIC ---

// 1. Lọc danh sách theo Tab hiện tại
const filteredList = computed(() => {
    if (!allLoans.value) return [];
    let list = [];
    switch(currentTab.value) {
        case 'active': 
            list = allLoans.value.filter(l => ['borrowed', 'overdue'].includes(l.status));
            break;
        case 'pending': 
            list = allLoans.value.filter(l => l.status === 'pending');
            break;
        case 'history': 
            list = allLoans.value.filter(l => ['returned', 'cancelled'].includes(l.status));
            break;
        case 'unpaid': 
            // Lọc ra sách chưa trả tiền thuê HOẶC chưa trả tiền phạt
            list = allLoans.value.filter(l => (!l.isPaid && l.rentCost > 0) || (!l.isFinePaid && l.phatTien > 0));
            break;
    }
    // Sắp xếp mới nhất lên đầu
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

// 2. Tính tổng số trang
const pageCount = computed(() => Math.ceil(filteredList.value.length / itemsPerPage));

// 3. Cắt danh sách theo trang (Client-side Pagination)
const paginatedLoans = computed(() => {
    const start = (page.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredList.value.slice(start, end);
});

// --- API ---
const fetchLoans = async () => {
  loading.value = true;
  try {
    // Lấy hết về rồi lọc client-side cho mượt (User thường ít khi có >100 khoản vay)
    const response = await api.get(`/loans?userId=${authStore.user._id}&limit=1000`);
    allLoans.value = response.data.data || [];
    
    // Update Stats
    stats.active = allLoans.value.filter(l => ['borrowed', 'overdue'].includes(l.status)).length;
    stats.pending = allLoans.value.filter(l => l.status === 'pending').length;
    stats.fine = allLoans.value.filter(l => l.phatTien > 0 && !l.isFinePaid).length;

  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
};

// Actions
const cancelRequest = async (loan) => {
    if(!confirm("Cancel this book request?")) return;
    try {
        await api.put(`/loans/${loan._id}/cancel`);
        showSnack('Request cancelled', 'info');
        await fetchLoans();
    } catch (e) { showSnack('Failed to cancel', 'error'); }
};

const returnBook = async (loan) => {
    if(!confirm(`Return "${loan.bookId?.tenSach}"?`)) return;
    processingId.value = loan._id;
    try {
        await api.put(`/loans/${loan._id}/return`);
        showSnack('Book returned successfully!', 'success');
        await fetchLoans();
    } catch (e) { showSnack('Failed to return', 'error'); }
    finally { processingId.value = null; }
};

const openPaymentDialog = (loan) => {
    selectedLoan.value = loan;
    
    // Tính tổng tiền: Thuê (nếu chưa trả) + Phạt (nếu chưa trả)
    let total = 0;
    if (!loan.isPaid) total += (loan.rentCost || 0);
    if (!loan.isFinePaid) total += (loan.phatTien || 0);
    
    paymentInfo.amount = total;
    payDialog.value = true;
};

const processPayment = async () => {
    paymentLoading.value = true;
    try {
        // 1. Tạo Payment Intent
        const intentRes = await api.post('/payments/create-intent', {
            loanId: selectedLoan.value._id,
            amount: paymentInfo.amount,
            paymentType: 'rent_and_fine'
        });

        // 2. Xử lý thanh toán
        await api.post(`/payments/${intentRes.data.payment._id}/process`, {
            paymentMethod: paymentInfo.method,
            billingDetails: { 
                name: authStore.user?.username || 'User', 
                phone: authStore.user?.dienThoai || '' 
            }
        });

        payDialog.value = false;
        showSnack('Payment Successful!', 'success');
        await fetchLoans(); // Load lại danh sách để cập nhật trạng thái
    } catch (e) { 
        showSnack(e.response?.data?.message || 'Payment Failed', 'error'); 
    } finally { 
        paymentLoading.value = false; 
    }
};

// Helpers & Watchers
const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => item.status === 'borrowed' && item.ngayHenTra && new Date(item.ngayHenTra) < new Date();

const getStatusColorClass = (loan) => {
    if (loan.status === 'pending') return 'bg-orange';
    if (loan.status === 'returned') return 'bg-success';
    if (loan.status === 'cancelled') return 'bg-grey';
    if (isOverdue(loan)) return 'bg-error';
    return 'bg-primary';
};

watch(currentTab, () => { page.value = 1; }); // Reset trang khi đổi tab

onMounted(fetchLoans);
</script>

<style scoped>
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.line-height-1 { line-height: 1; }
.line-height-1-2 { line-height: 1.2; }
.min-w-0 { min-width: 0; }
.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.hover-underline:hover { text-decoration: underline; }
.cursor-pointer { cursor: pointer; }

/* Status Badge trên ảnh */
.status-badge {
    position: absolute;
    top: 0; left: 0;
    z-index: 2;
    font-size: 0.7rem;
}

/* Gradient Background */
.bg-gradient-success { background: linear-gradient(135deg, #43A047, #66BB6A); }

.payment-radio { border: 1px solid #e0e0e0; transition: all 0.2s; }
.payment-radio:hover { border-color: #43A047 !important; background-color: #F1F8E9; }
</style>