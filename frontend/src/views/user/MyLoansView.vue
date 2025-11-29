<template>
  <v-container class="py-6 fill-height align-start">
    
    <div class="d-flex flex-column flex-md-row justify-space-between align-md-end mb-6 w-100 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary d-flex align-center">
          <v-icon start size="large" color="primary">mdi-library-shelves</v-icon>
          Tủ Sách Của Tôi
        </h1>
        <div class="text-subtitle-1 text-grey">Theo dõi quá trình đọc sách và trạng thái mượn</div>
      </div>
      
      <div class="d-flex gap-3 overflow-x-auto pb-1">
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-blue-lighten-5">
            <v-icon color="blue" size="large" class="mr-3">mdi-book-open-variant</v-icon>
            <div>
                <div class="text-caption text-blue-darken-2 font-weight-bold text-uppercase">Đang mượn</div>
                <div class="text-h6 font-weight-bold text-blue line-height-1">{{ stats.active }}</div>
            </div>
         </v-card>
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-orange-lighten-5">
            <v-icon color="orange" size="large" class="mr-3">mdi-clock-outline</v-icon>
            <div>
                <div class="text-caption text-orange-darken-3 font-weight-bold text-uppercase">Chờ duyệt</div>
                <div class="text-h6 font-weight-bold text-orange line-height-1">{{ stats.pending }}</div>
            </div>
         </v-card>
         <v-card flat class="border rounded-lg px-4 py-2 d-flex align-center bg-red-lighten-5" v-if="stats.fine > 0">
            <v-icon color="red" size="large" class="mr-3">mdi-alert-circle</v-icon>
            <div>
                <div class="text-caption text-red-darken-3 font-weight-bold text-uppercase">Tiền phạt</div>
                <div class="text-h6 font-weight-bold text-red line-height-1">{{ stats.fine }}</div>
            </div>
         </v-card>
      </div>
    </div>

    <v-card class="rounded-xl border-0 bg-transparent w-100">
      <v-tabs v-model="currentTab" color="primary" align-tabs="start" class="mb-4 border-b">
        <v-tab value="active" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-book-clock</v-icon> Đang mượn
        </v-tab>
        <v-tab value="pending" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-timer-sand</v-icon> Chờ duyệt
        </v-tab>
        <v-tab value="unpaid" class="text-capitalize font-weight-bold px-6">
           <v-badge v-if="stats.fine > 0" color="error" dot inline>
              <v-icon start>mdi-cash-multiple</v-icon> Phạt chưa đóng
           </v-badge>
           <span v-else><v-icon start>mdi-cash-check</v-icon> Phí phạt</span>
        </v-tab>
        <v-tab value="history" class="text-capitalize font-weight-bold px-6">
           <v-icon start>mdi-history</v-icon> Lịch sử
        </v-tab>
      </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item v-for="tab in ['active', 'pending', 'unpaid', 'history']" :key="tab" :value="tab">
          
          <v-row v-if="loading">
             <v-col cols="12" md="6" lg="4" v-for="n in 3" :key="n">
                <v-skeleton-loader type="image, list-item-two-line" class="rounded-xl border"></v-skeleton-loader>
             </v-col>
          </v-row>

          <div v-else-if="paginatedLoans.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed">
             <v-avatar color="grey-lighten-5" size="120" class="mb-4">
                <v-icon size="60" color="grey-lighten-1">mdi-bookshelf</v-icon>
             </v-avatar>
             <div class="text-h6 text-grey-darken-1">Chưa có dữ liệu</div>
             <div class="text-body-2 text-grey mb-6">Không tìm thấy sách nào trong mục này.</div>
             <v-btn v-if="tab !== 'history'" color="primary" to="/books" rounded="pill" variant="flat" class="px-8 font-weight-bold">
                Tìm Sách Ngay
             </v-btn>
          </div>

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
                       <div class="book-cover-wrapper mr-4 rounded-lg overflow-hidden elevation-2 flex-shrink-0 position-relative">
                          <v-img 
                            :src="loan.bookId?.coverUrl || 'https://placehold.co/150'" 
                            width="100" height="150" cover
                            class="bg-grey-lighten-3"
                          ></v-img>
                          <div class="status-badge text-caption font-weight-bold px-2 py-1 rounded-br-lg text-white" :class="getStatusColorClass(loan)">
                             {{ translateStatus(loan.status) }}
                          </div>
                       </div>

                       <div class="flex-grow-1 min-w-0 d-flex flex-column">
                          <router-link :to="`/books/${loan.bookId?._id}`" class="text-decoration-none">
                             <h3 class="text-subtitle-1 font-weight-bold text-primary text-truncate-2 mb-1 cursor-pointer hover-underline line-height-1-2">
                                {{ loan.bookId?.tenSach || 'Sách không tồn tại' }}
                             </h3>
                          </router-link>
                          
                          <div class="text-caption text-grey mb-3">
                             Mã phiếu: #{{ loan._id.slice(-6).toUpperCase() }}
                          </div>

                          <div class="mt-auto d-flex flex-column gap-1 text-body-2">
                             <div class="d-flex align-center text-grey-darken-1">
                                <v-icon size="small" class="mr-2" color="grey">mdi-calendar-arrow-right</v-icon> 
                                Mượn: {{ formatDate(loan.ngayMuon) }}
                             </div>
                             
                             <div class="d-flex align-center" :class="isOverdue(loan) ? 'text-error font-weight-bold' : 'text-grey-darken-1'">
                                <v-icon size="small" class="mr-2" :color="isOverdue(loan) ? 'error' : 'grey'">
                                   {{ tab === 'history' ? 'mdi-calendar-check' : 'mdi-calendar-clock' }}
                                </v-icon>
                                {{ tab === 'history' ? 'Trả: ' + formatDate(loan.ngayTraThucTe) : 'Hạn: ' + formatDate(loan.ngayHenTra) }}
                                <span v-if="isOverdue(loan)" class="ml-1 text-caption">(Quá hạn)</span>
                             </div>

                             <div v-if="loan.phatTien > 0" class="d-flex align-center mt-1 text-error">
                                <v-icon size="small" class="mr-2">mdi-cash-remove</v-icon>
                                <span class="font-weight-bold">Phạt: {{ formatCurrency(loan.phatTien) }}</span>
                                <v-chip v-if="loan.isFinePaid" size="x-small" color="success" class="ml-2 font-weight-bold" variant="flat">ĐÃ TRẢ</v-chip>
                                <v-chip v-else size="x-small" color="error" class="ml-2 font-weight-bold" variant="flat">CHƯA TRẢ</v-chip>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div class="pa-3 bg-grey-lighten-5 border-t d-flex justify-end align-center gap-2">
                       
                       <v-btn 
                          v-if="loan.status === 'pending'"
                          color="error" size="small" variant="tonal"
                          prepend-icon="mdi-close-circle"
                          @click="cancelRequest(loan)"
                       >
                          Hủy Yêu Cầu
                       </v-btn>

                       <v-btn 
                          v-if="['borrowed', 'overdue'].includes(loan.status)"
                          color="primary" size="small" variant="flat"
                          prepend-icon="mdi-keyboard-return"
                          @click="returnBook(loan)"
                          :loading="processingId === loan._id"
                       >
                          Trả Sách
                       </v-btn>

                       <v-btn 
                          v-if="!loan.isFinePaid && loan.phatTien > 0"
                          color="error" size="small" variant="elevated"
                          prepend-icon="mdi-credit-card-outline"
                          @click="openPaymentDialog(loan)"
                       >
                          Đóng Phạt
                       </v-btn>

                       <div v-if="tab === 'history'" class="text-caption text-grey font-italic">
                          {{ loan.status === 'cancelled' ? 'Đã Hủy' : 'Đã Trả Thành Công' }}
                       </div>

                    </div>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>

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

    <v-dialog v-model="payDialog" max-width="450" persistent>
       <v-card class="rounded-xl overflow-hidden">
          <div class="bg-gradient-success pa-4 text-white text-center">
             <div class="text-overline opacity-90 mb-1">THANH TOÁN AN TOÀN</div>
             <div class="text-h4 font-weight-bold">{{ formatCurrency(paymentInfo.amount) }}</div>
             <div class="text-caption mt-1">Thanh toán tiền phạt quá hạn</div>
          </div>
          <v-card-text class="pa-5">
             <div class="text-subtitle-2 font-weight-bold mb-3">Chọn phương thức thanh toán</div>
             <v-radio-group v-model="paymentInfo.method" hide-details class="mb-4">
                <v-radio value="momo" class="mb-2 border rounded px-3 py-2 payment-radio" color="pink">
                   <template v-slot:label><span class="font-weight-medium text-grey-darken-3 ml-2">Ví MoMo</span></template>
                </v-radio>
                <v-radio value="card" class="border rounded px-3 py-2 payment-radio" color="blue">
                   <template v-slot:label><span class="font-weight-medium text-grey-darken-3 ml-2">Thẻ Visa / MasterCard</span></template>
                </v-radio>
             </v-radio-group>
             <v-checkbox v-model="paymentInfo.agree" color="primary" density="compact" hide-details>
                <template v-slot:label><span class="text-caption">Tôi đồng ý với Điều khoản dịch vụ</span></template>
             </v-checkbox>
          </v-card-text>
          <v-card-actions class="px-5 pb-5 pt-0">
             <v-btn variant="text" color="grey-darken-1" @click="payDialog = false" class="flex-grow-1">Hủy</v-btn>
             <v-btn color="success" variant="elevated" class="flex-grow-1 font-weight-bold rounded-lg" height="44" :loading="paymentLoading" :disabled="!paymentInfo.agree" @click="processPayment">Xác Nhận Thanh Toán</v-btn>
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
const allLoans = ref([]); 
const loading = ref(true);
const currentTab = ref('active');
const page = ref(1);
const itemsPerPage = 6; 
const processingId = ref(null);

const stats = reactive({ active: 0, pending: 0, fine: 0 });

const payDialog = ref(false);
const paymentLoading = ref(false);
const selectedLoan = ref(null);
const paymentInfo = reactive({ method: 'momo', amount: 0, agree: true });
const snackbar = ref({ show: false, message: '', color: '' });

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
            list = allLoans.value.filter(l => l.phatTien > 0 && !l.isFinePaid);
            break;
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

const pageCount = computed(() => Math.ceil(filteredList.value.length / itemsPerPage));

const paginatedLoans = computed(() => {
    const start = (page.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredList.value.slice(start, end);
});

const fetchLoans = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/loans?userId=${authStore.user._id}&limit=1000`);
    allLoans.value = response.data.data || [];
    
    stats.active = allLoans.value.filter(l => ['borrowed', 'overdue'].includes(l.status)).length;
    stats.pending = allLoans.value.filter(l => l.status === 'pending').length;
    stats.fine = allLoans.value.filter(l => l.phatTien > 0 && !l.isFinePaid).length;

  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
};

// Actions
const cancelRequest = async (loan) => {
    if(!confirm("Bạn có chắc muốn hủy yêu cầu mượn này?")) return;
    try {
        await api.put(`/loans/${loan._id}/cancel`);
        showSnack('Đã hủy yêu cầu thành công', 'info');
        await fetchLoans();
    } catch (e) { showSnack('Hủy thất bại', 'error'); }
};

const returnBook = async (loan) => {
    if (!confirm(`Xác nhận trả cuốn "${loan.bookId?.tenSach}"?`)) return;
    
    processingId.value = loan._id;
    try {
        const res = await api.put(`/loans/${loan._id}/return`);
        
        if (res.data.phat && res.data.phat.coPhat) {
            openPaymentDialog(loan, res.data.phat.soTien);
            showSnack('Sách đã trả. Vui lòng thanh toán phí phạt quá hạn!', 'warning');
        } else {
            showSnack('Trả sách thành công!', 'success');
            await fetchLoans();
        }
    } catch (e) { 
        showSnack(e.response?.data?.message || 'Lỗi trả sách', 'error'); 
    } finally { 
        processingId.value = null; 
    }
};

const openPaymentDialog = (loan, amountOverride = null) => {
    selectedLoan.value = loan;
    if (amountOverride !== null) {
        paymentInfo.amount = amountOverride;
    } else {
        paymentInfo.amount = loan.phatTien || 0;
    }
    payDialog.value = true;
};

const processPayment = async () => {
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
                name: authStore.user?.username || 'User', 
                phone: authStore.user?.dienThoai || '' 
            }
        });

        payDialog.value = false;
        showSnack('Thanh toán thành công!', 'success');
        currentTab.value = 'history'; 
        await fetchLoans();
    } catch (e) { 
        showSnack(e.response?.data?.message || 'Thanh toán thất bại', 'error'); 
    } finally { 
        paymentLoading.value = false; 
    }
};

const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => {
    return item.status === 'overdue' || 
           (item.status === 'borrowed' && item.ngayHenTra && new Date(item.ngayHenTra) < new Date());
};

const getStatusColorClass = (loan) => {
    if (loan.status === 'pending') return 'bg-orange';
    if (loan.status === 'returned') return 'bg-success';
    if (loan.status === 'cancelled') return 'bg-grey';
    if (isOverdue(loan)) return 'bg-red-accent-2'; 
    return 'bg-blue-darken-2';
};

const translateStatus = (status) => {
    const map = {
        'pending': 'Chờ Duyệt',
        'borrowed': 'Đang Mượn',
        'returned': 'Đã Trả',
        'overdue': 'Quá Hạn',
        'cancelled': 'Đã Hủy'
    };
    return map[status] || status;
};

watch(currentTab, () => { page.value = 1; }); 

onMounted(fetchLoans);
</script>

<style scoped>
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.line-height-1 { line-height: 1; }
.line-height-1-2 { line-height: 1.2; }
.min-w-0 { min-width: 0; }
.text-truncate-2 { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.hover-underline:hover { text-decoration: underline; }
.cursor-pointer { cursor: pointer; }
.status-badge { position: absolute; top: 0; left: 0; z-index: 2; font-size: 0.7rem; }
.bg-gradient-success { background: linear-gradient(135deg, #43A047, #66BB6A); }
.payment-radio { border: 1px solid #e0e0e0; transition: all 0.2s; }
.payment-radio:hover { border-color: #43A047 !important; background-color: #F1F8E9; }
</style>