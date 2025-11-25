<template>
  <div class="loan-management">
    <div class="d-flex justify-space-between align-center mb-8 flex-wrap gap-4">
      <div>
        <h2 class="text-h5 font-weight-bold text-white text-uppercase tracking-wide">Loan Management</h2>
        <div class="text-caption text-grey">Track and manage book loans</div>
      </div>
      
      <div class="d-flex align-center gap-4" style="min-width: 400px;">
        <v-text-field
          v-model="search"
          placeholder="Search loans..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          bg-color="#1e293b"
          color="primary"
          class="rounded-lg"
          @input="debouncedSearch"
        ></v-text-field>
        
        <v-btn 
          color="success" 
          height="40" 
          class="text-capitalize font-weight-bold px-6"
          prepend-icon="mdi-plus"
          @click="createLoanDialog = true"
        >
          Create New Loan
        </v-btn>
      </div>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card color="#1e293b" class="rounded-xl pa-4 h-100 border-left-primary" elevation="0">
          <div class="text-subtitle-2 text-grey-lighten-1 mb-1">Total Loans</div>
          <div class="d-flex justify-space-between align-end">
             <div>
                <div class="text-h3 font-weight-bold text-white">{{ stats.total }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="small" start>mdi-chart-bar</v-icon> All time records
                </div>
             </div>
             <v-sparkline
                :model-value="stats.chartData"
                color="primary"
                line-width="3"
                padding="10"
                height="60"
                width="120"
                smooth
                auto-draw
                stroke-linecap="round"
             ></v-sparkline>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="#1e293b" class="rounded-xl pa-4 h-100 border-left-success" elevation="0">
          <div class="text-subtitle-2 text-grey-lighten-1 mb-1">Borrowed Books</div>
          <div class="d-flex justify-space-between align-end">
             <div>
                <div class="text-h3 font-weight-bold text-white">{{ stats.borrowed }}</div>
                <div class="text-caption text-white mt-1">Active loans</div>
             </div>
             <v-sparkline
                :model-value="stats.chartData"
                color="success"
                type="bar"
                line-width="8"
                padding="10"
                height="60"
                width="120"
                auto-draw
             ></v-sparkline>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="#1e293b" class="rounded-xl pa-4 h-100 border-left-error" elevation="0">
          <div class="text-subtitle-2 text-grey-lighten-1 mb-1">Overdue Books</div>
          <div class="d-flex justify-space-between align-end">
             <div>
                <div class="text-h3 font-weight-bold text-white">{{ stats.overdue }}</div>
                <div class="text-caption text-error mt-1">Needs attention</div>
             </div>
             <v-sparkline
                :model-value="[0,0,0,0,0,0, stats.overdue]" 
                color="error"
                type="bar"
                line-width="8"
                padding="10"
                height="60"
                width="120"
                auto-draw
             ></v-sparkline>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card color="#1e293b" class="rounded-xl elevation-0 border-opacity-12">
      <div class="pa-4 border-b border-opacity-12 border-color-white">
        <v-btn-toggle v-model="filterStatus" mandatory rounded="lg" class="dark-btn-toggle" divided>
          <v-btn value="" class="text-capitalize px-6">All</v-btn>
          <v-btn value="pending" class="text-capitalize px-6">Pending</v-btn>
          <v-btn value="borrowed" class="text-capitalize px-6">Borrowed</v-btn>
          <v-btn value="overdue" class="text-capitalize px-6 text-error">Overdue</v-btn>
          <v-btn value="returned" class="text-capitalize px-6 text-success">Returned</v-btn>
        </v-btn-toggle>
      </div>

      <v-data-table-server
        :headers="headers"
        :items="loans"
        :items-length="totalLoans"
        :loading="loading"
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        @update:options="loadLoans"
        class="bg-transparent text-white custom-dark-table"
        hover
      >
        <template v-slot:item.userId="{ item }">
          <div class="font-weight-bold">{{ item.userId?.username }}</div>
          <div class="text-caption text-grey">{{ item.userId?.email }}</div>
        </template>

        <template v-slot:item.bookId="{ item }">
          <div v-if="item.bookId">
             <div class="font-weight-medium">{{ item.bookId.tenSach }}</div>
             <div class="text-caption text-grey">Code: {{ item.bookId.maSach }}</div>
          </div>
          <span v-else class="text-error font-italic">Book Deleted</span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" label class="font-weight-bold text-uppercase">
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.isPaid="{ item }">
            <v-chip :color="item.isPaid ? 'success' : 'warning'" size="x-small" label class="font-weight-bold">
                {{ item.isPaid ? 'PAID' : 'UNPAID' }}
            </v-chip>
             <v-tooltip v-if="item.status === 'pending' && item.rentCost > 0 && !item.isPaid" location="top">
                <template v-slot:activator="{ props }">
                   <v-icon v-bind="props" color="error" size="small" class="ml-2">mdi-alert-circle</v-icon>
                </template>
                <span>Unpaid Fee: {{ formatCurrency(item.rentCost) }}</span>
             </v-tooltip>
        </template>

        <template v-slot:item.ngayHenTra="{ item }">
           <div :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
             {{ formatDate(item.ngayHenTra) }}
             <v-icon v-if="isOverdue(item)" size="small" color="error" class="ml-1">mdi-alert-circle</v-icon>
           </div>
        </template>

        <template v-slot:item.actions="{ item }">
            <v-btn 
                v-if="item.status === 'pending'"
                color="primary" size="small" variant="flat" class="mr-2"
                @click="confirmLoan(item)"
            >
                Approve
            </v-btn>
            <v-btn 
                v-if="['borrowed', 'overdue'].includes(item.status)"
                color="success" size="small" variant="tonal" class="mr-2"
                @click="processReturn(item)"
            >
                Return
            </v-btn>
            <v-btn 
                icon size="small" variant="text" color="grey"
                @click="confirmDeleteLoan(item)"
            >
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="returnDialog.show" max-width="450">
        <v-card color="#1e293b" class="text-white pa-4 rounded-lg border-opacity-12">
            <v-card-title class="text-h6 d-flex align-center">
                <v-icon start color="success" class="mr-2">mdi-book-check</v-icon>
                Process Return
            </v-card-title>
            
            <v-card-text class="text-grey-lighten-2 pt-4">
                <div class="mb-4">
                    Confirm return for book: <br/>
                    <strong class="text-h6 text-white">{{ returnDialog.loan?.bookId?.tenSach }}</strong>
                </div>

                <!-- HIỂN THỊ CẢNH BÁO PHẠT (Dựa trên tính toán Preview) -->
                <v-expand-transition>
                    <div v-if="previewFine > 0" class="pa-3 rounded bg-red-darken-4 text-center border-red">
                        <div class="text-overline text-white mb-1">OVERDUE WARNING</div>
                        <div class="text-h4 font-weight-bold text-white mb-1">
                            {{ formatCurrency(previewFine) }}
                        </div>
                        <div class="text-caption text-white opacity-90">
                            Overdue by <strong>{{ previewDays }} days</strong>. Please collect fine from user.
                        </div>
                    </div>
                    <div v-else class="pa-3 rounded bg-green-darken-4 text-center border-green">
                        <v-icon color="white" class="mb-1">mdi-check-circle-outline</v-icon>
                        <div class="font-weight-bold">On Time Return</div>
                        <div class="text-caption">No fine required.</div>
                    </div>
                </v-expand-transition>
            </v-card-text>

            <v-card-actions class="justify-end pt-2">
                <v-btn color="grey-lighten-1" variant="text" @click="returnDialog.show = false">Cancel</v-btn>
                <v-btn 
                    color="success" 
                    variant="elevated" 
                    class="px-6 font-weight-bold"
                    @click="executeProcessReturn"
                >
                    Confirm & Return
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

     <v-dialog v-model="returnDialog.show" max-width="400">
        <v-card color="#1e293b" class="text-white pa-4 rounded-lg">
            <v-card-title class="text-h6">Process Return</v-card-title>
            <v-card-text class="text-grey-lighten-2">
                Confirm return for "<strong>{{ returnDialog.loan?.bookId?.tenSach }}</strong>"?
                <div v-if="returnDialog.loan?.phatTien > 0" class="mt-2 text-error font-weight-bold">
                    Fine Required: {{ formatCurrency(returnDialog.loan.phatTien) }}
                </div>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="grey" variant="text" @click="returnDialog.show = false">Cancel</v-btn>
                <v-btn color="success" variant="flat" @click="executeProcessReturn">Confirm Return</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
        {{ snackbar.message }}
        <template v-slot:actions><v-btn text @click="snackbar.show = false">Close</v-btn></template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '@/services/api.service'; 
import debounce from 'lodash.debounce';

const loans = ref([]);
const loading = ref(true);
const totalLoans = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const filterStatus = ref(''); 
const previewFine = ref(0);
const previewDays = ref(0);
// --- BIẾN THỐNG KÊ REAL-TIME (Không hardcode nữa) ---
const stats = ref({
    total: 0,
    borrowed: 0,
    overdue: 0,
    chartData: [0,0,0,0,0,0,0] // Khởi tạo mảng rỗng để chart không lỗi
});

const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'User', key: 'userId.username', align: 'start' },
  { title: 'Book Title', key: 'bookId', align: 'start' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Status', key: 'status' },
  { title: 'Payment', key: 'isPaid', align: 'center' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

// --- HÀM LẤY THỐNG KÊ ---
const fetchStats = async () => {
    try {
        const res = await api.get('/loans/stats');
        stats.value = res.data;
    } catch (e) { 
        console.error("Stats error:", e); 
    }
}

const loadLoans = debounce(async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            status: filterStatus.value || undefined,
            search: search.value
        };
        const response = await api.get('/loans', { params });
        loans.value = response.data.data;
        totalLoans.value = response.data.total;
        
        // Tự động cập nhật thống kê sau khi tải dữ liệu xong
        fetchStats();
        
    } catch (error) {
        showSnackbar('Failed to load data', 'error');
    } finally {
        loading.value = false;
    }
}, 300);

// Actions
const confirmLoan = (item) => { confirmDialog.value.loan = item; confirmDialog.value.show = true; }
const executeConfirmLoan = async () => {
    try {
        await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`);
        showSnackbar('Loan approved successfully!', 'success');
        confirmDialog.value.show = false;
        loadLoans(); // Reload bảng + Stats
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to approve.';
        showSnackbar(errorMsg, 'error');
        confirmDialog.value.show = false;
    }
}

const processReturn = (item) => { 
    returnDialog.value.loan = item; 
    
    // LOGIC TÍNH TOÁN DỰ KIẾN (PREVIEW)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const duKien = new Date(item.ngayHenTra);
    duKien.setHours(0,0,0,0);
    
    // Nếu quá hạn thì tính tiền phạt dự kiến để Admin báo khách
    if (today > duKien && item.status !== 'returned') {
        const diffTime = Math.abs(today - duKien);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        previewDays.value = diffDays;
        previewFine.value = diffDays * 5000; // 5000đ/ngày
    } else {
        previewDays.value = 0;
        previewFine.value = item.phatTien || 0; // Nếu đã có phạt cũ thì hiện, không thì 0
    }
    
    returnDialog.value.show = true; 
}
const executeProcessReturn = async () => {
    try {
        const res = await api.put(`/loans/${returnDialog.value.loan._id}/return`);
        
        // Kiểm tra kết quả trả về từ Backend xem có phạt thật không
        if (res.data.phat && res.data.phat.coPhat) {
            showSnackbar(`Trả sách thành công. Phí phạt: ${formatCurrency(res.data.phat.soTien)}`, 'warning');
        } else {
            showSnackbar('Trả sách thành công!', 'success');
        }
        
        returnDialog.value.show = false;
        loadLoans(); // Reload lại bảng
    } catch (error) {
        showSnackbar(error.response?.data?.message || 'Lỗi trả sách', 'error');
        returnDialog.value.show = false;
    }
}

const confirmDeleteLoan = async (item) => {
    if(!confirm("Delete this record?")) return;
    try { await api.delete(`/loans/${item._id}`); showSnackbar('Deleted', 'success'); loadLoans(); } 
    catch(e) { showSnackbar('Delete failed', 'error'); }
}

// Helpers
const showSnackbar = (msg, color) => { snackbar.value = { show: true, message: msg, color: color }; }
const debouncedSearch = debounce(() => { currentPage.value = 1; loadLoans(); }, 500);
const getStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning'}[s] || 'grey');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => item.status !== 'returned' && item.status !== 'cancelled' && new Date(item.ngayHenTra) < new Date();

watch(filterStatus, () => { currentPage.value = 1; loadLoans(); });

onMounted(() => {
    loadLoans();
});
</script>

<style scoped>
.dark-btn-toggle { background-color: #0f172a !important; border: 1px solid #334155; }
.dark-btn-toggle .v-btn--active { background-color: #334155 !important; color: white !important; }
.border-left-primary { border-left: 4px solid #2196F3 !important; }
.border-left-success { border-left: 4px solid #4CAF50 !important; }
.border-left-error { border-left: 4px solid #FF5252 !important; }
.gap-4 { gap: 16px; }
.tracking-wide { letter-spacing: 1px; }
:deep(.custom-dark-table) { background-color: transparent !important; color: white !important; }
:deep(.custom-dark-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; }
:deep(.custom-dark-table td) { border-bottom: 1px solid #334155 !important; }
:deep(.custom-dark-table tbody tr:hover) { background-color: #1e293b !important; }
.border-red { border: 1px solid #ff5252; }
.border-green { border: 1px solid #4caf50; }
</style>