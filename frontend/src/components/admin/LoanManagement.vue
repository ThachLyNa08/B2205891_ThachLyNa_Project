<template>
  <v-container fluid>
    <!-- HEADER & TÌM KIẾM -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6 gap-4">
      <div>
        <h2 class="text-h4 font-weight-bold text-white">Quản lý Mượn Trả</h2>
        <div class="text-subtitle-1 text-grey">Theo dõi sách và yêu cầu mượn</div>
      </div>
      
      <!-- Ô tìm kiếm -->
      <div style="min-width: 300px;">
        <v-text-field
          v-model="search"
          placeholder="Tìm theo tên người hoặc sách..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          bg-color="#1e293b"
          class="rounded-lg"
          @update:model-value="debouncedSearch"
        ></v-text-field>
      </div>
    </div>

    <!-- THỐNG KÊ NHANH (STATS) -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card color="blue-darken-4" class="pa-4 rounded-lg" elevation="0">
          <div class="text-overline text-blue-lighten-4">Đang mượn</div>
          <div class="text-h4 font-weight-bold">{{ stats.borrowed }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="orange-darken-4" class="pa-4 rounded-lg" elevation="0">
          <div class="text-overline text-orange-lighten-4">Chờ duyệt</div>
          <div class="text-h4 font-weight-bold">{{ stats.pending }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="red-darken-4" class="pa-4 rounded-lg" elevation="0">
          <div class="text-overline text-red-lighten-4">Quá hạn</div>
          <div class="text-h4 font-weight-bold">{{ stats.overdue }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="green-darken-4" class="pa-4 rounded-lg" elevation="0">
          <div class="text-overline text-green-lighten-4">Đã trả</div>
          <div class="text-h4 font-weight-bold">{{ stats.returned }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- BẢNG DỮ LIỆU CHÍNH -->
    <v-card color="#1e293b" class="rounded-xl elevation-0 border-opacity-12">
      
      <!-- TABS LỌC TRẠNG THÁI -->
      <v-tabs v-model="activeTab" bg-color="transparent" color="primary" show-arrows>
        <v-tab value="pending" class="text-capitalize font-weight-bold">
           <v-icon start>mdi-timer-sand</v-icon> Chờ duyệt
           <v-badge v-if="stats.pending > 0" color="warning" :content="stats.pending" inline></v-badge>
        </v-tab>
        <v-tab value="borrowed" class="text-capitalize font-weight-bold">
           <v-icon start>mdi-book-open-page-variant</v-icon> Đang mượn
        </v-tab>
        <v-tab value="overdue" class="text-capitalize font-weight-bold text-error">
           <v-icon start>mdi-alert-circle</v-icon> Quá hạn
        </v-tab>
        <v-tab value="returned" class="text-capitalize font-weight-bold">
           <v-icon start>mdi-history</v-icon> Lịch sử
        </v-tab>
      </v-tabs>

      <v-divider class="border-opacity-12"></v-divider>

      <!-- DATA TABLE -->
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        :headers="headers"
        :items="loans"
        :items-length="totalItems"
        :loading="loading"
        @update:options="loadLoans"
        class="bg-transparent text-white custom-table"
        hover
      >
        <!-- Cột: Người mượn -->
        <template v-slot:item.userId="{ item }">
          <div class="d-flex align-center py-2">
             <v-avatar color="primary" size="32" class="mr-3 font-weight-bold">
                {{ item.userId?.username?.charAt(0).toUpperCase() }}
             </v-avatar>
             <div>
                <div class="font-weight-bold">{{ item.userId?.username }}</div>
                <div class="text-caption text-grey">{{ item.userId?.email }}</div>
             </div>
          </div>
        </template>

        <!-- Cột: Sách -->
        <template v-slot:item.bookId="{ item }">
           <div v-if="item.bookId" class="font-weight-medium text-blue-lighten-3">
              {{ item.bookId.tenSach }}
           </div>
           <span v-else class="text-grey font-italic">Sách đã bị xóa</span>
        </template>

        <!-- Cột: Trạng thái -->
        <template v-slot:item.status="{ item }">
           <v-chip :color="getStatusColor(item.status)" size="small" label class="font-weight-bold text-uppercase">
              {{ translateStatus(item.status) }}
           </v-chip>
        </template>

        <!-- Cột: Thanh toán -->
        <template v-slot:item.isPaid="{ item }">
            <v-icon v-if="item.isPaid" color="success" size="small">mdi-check-circle</v-icon>
            <v-icon v-else color="grey" size="small">mdi-circle-outline</v-icon>
        </template>

        <!-- Cột: Ngày trả/Hạn trả -->
        <template v-slot:item.ngayHenTra="{ item }">
           <!-- Nếu đã trả, hiện ngày trả thực tế -->
           <div v-if="item.status === 'returned'">
              <div class="text-success font-weight-bold">{{ formatDate(item.ngayTraThucTe) }}</div>
              <div class="text-caption text-grey">Ngày trả</div>
           </div>
           
           <!-- Nếu chưa trả, hiện hạn trả -->
           <div v-else :class="isOverdue(item) ? 'text-error font-weight-bold' : ''">
             {{ formatDate(item.ngayHenTra) }}
             <div v-if="isOverdue(item)" class="text-caption text-error">
                Quá hạn {{ getDaysOverdue(item.ngayHenTra) }} ngày
             </div>
           </div>
        </template>

        <!-- Cột: Thao tác (SỬA LỖI ĐÈ NHAU TẠI ĐÂY) -->
        <template v-slot:item.actions="{ item }">
           <div class="d-flex justify-end gap-2">
              
              <!-- Nút Duyệt (Chỉ hiện khi Pending) -->
              <v-tooltip text="Duyệt yêu cầu" location="top" v-if="item.status === 'pending'">
                 <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="success" icon="mdi-check" size="small" variant="flat" @click="openConfirmDialog(item)"></v-btn>
                 </template>
              </v-tooltip>

              <!-- Nút Từ chối (Chỉ hiện khi Pending) -->
              <v-tooltip text="Từ chối" location="top" v-if="item.status === 'pending'">
                 <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="error" icon="mdi-close" size="small" variant="tonal" @click="openCancelDialog(item)"></v-btn>
                 </template>
              </v-tooltip>

              <!-- Nút Trả Sách (Hiện khi Đang mượn / Quá hạn) -->
              <v-tooltip text="Xác nhận trả sách" location="top" v-if="['borrowed', 'overdue'].includes(item.status)">
                 <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="primary" icon="mdi-keyboard-return" size="small" variant="flat" @click="openReturnDialog(item)"></v-btn>
                 </template>
              </v-tooltip>

              <!-- Nút Xóa (Chỉ hiện ở Lịch sử) -->
              <v-tooltip text="Xóa bản ghi" location="top" v-if="['returned', 'cancelled'].includes(item.status)">
                 <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="grey" icon="mdi-delete" size="small" variant="text" @click="confirmDeleteLoan(item)"></v-btn>
                 </template>
              </v-tooltip>

           </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- DIALOG 1: DUYỆT YÊU CẦU -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
        <v-card color="#1e293b" class="text-white">
            <v-card-title class="bg-success text-white">Duyệt yêu cầu mượn</v-card-title>
            <v-card-text class="pt-4 text-grey-lighten-2">
                Cho phép <strong>{{ confirmDialog.loan?.userId?.username }}</strong> mượn cuốn: <br/>
                <span class="text-white font-weight-bold">"{{ confirmDialog.loan?.bookId?.tenSach }}"</span>?
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="grey" variant="text" @click="confirmDialog.show = false">Hủy</v-btn>
                <v-btn color="success" variant="elevated" @click="executeConfirmLoan">Đồng ý</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- DIALOG 2: TRẢ SÁCH (CÓ TÍNH PHẠT) -->
    <v-dialog v-model="returnDialog.show" max-width="450">
        <v-card color="#1e293b" class="text-white rounded-lg">
            <v-card-title class="bg-primary text-white d-flex align-center">
                <v-icon start>mdi-book-check</v-icon> Xác nhận Trả sách
            </v-card-title>
            <v-card-text class="pt-4">
                <div class="mb-4 text-center">
                    Độc giả: <strong>{{ returnDialog.loan?.userId?.username }}</strong> <br/>
                    Sách: <strong>{{ returnDialog.loan?.bookId?.tenSach }}</strong>
                </div>

                <!-- Khung cảnh báo phạt -->
                <v-alert v-if="previewFine > 0" type="error" variant="tonal" class="border-red bg-red-darken-4">
                    <div class="text-h6 font-weight-bold text-center mb-1">QUÁ HẠN: {{ previewDays }} NGÀY</div>
                    <div class="text-center text-caption">Vui lòng thu tiền phạt:</div>
                    <div class="text-h4 font-weight-black text-center mt-1">{{ formatCurrency(previewFine) }}</div>
                </v-alert>

                <v-alert v-else type="success" variant="tonal" class="border-green bg-green-darken-4 text-center">
                    <v-icon start>mdi-check-circle</v-icon> Trả đúng hạn. Không có phạt.
                </v-alert>
            </v-card-text>
            <v-card-actions class="justify-end pb-4 px-4">
                <v-btn color="grey" variant="text" @click="returnDialog.show = false">Hủy</v-btn>
                <v-btn color="primary" variant="elevated" @click="executeProcessReturn" class="px-6 font-weight-bold">
                    Xác nhận Đã Trả
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Thông báo Toast -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
        {{ snackbar.message }}
        <template v-slot:actions><v-btn text @click="snackbar.show = false">Đóng</v-btn></template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import api from '@/services/api.service'; 
import debounce from 'lodash.debounce';

const loans = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const activeTab = ref('pending'); // Tab mặc định

// Stats
const stats = reactive({ pending: 0, borrowed: 0, overdue: 0, returned: 0 });

// Dialogs
const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });
const snackbar = ref({ show: false, message: '', color: '' });

// Preview Fine Variables
const previewFine = ref(0);
const previewDays = ref(0);

const headers = [
  { title: 'Người mượn', key: 'userId', sortable: false },
  { title: 'Tên sách', key: 'bookId', sortable: false },
  { title: 'Ngày mượn', key: 'ngayMuon' },
  { title: 'Hạn trả', key: 'ngayHenTra' },
  { title: 'Trạng thái', key: 'status', align: 'center' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false, width: '140px' },
];

// --- LOAD DATA ---
const loadLoans = debounce(async () => {
    loading.value = true;
    try {
        // Map Tab sang Status backend
        let statusParam = '';
        switch (activeTab.value) {
            case 'pending': statusParam = 'pending'; break;
            case 'borrowed': statusParam = 'borrowed'; break;
            case 'overdue': statusParam = 'overdue'; break; 
            case 'returned': statusParam = 'returned'; break; 
            default: statusParam = ''; 
        }

        const params = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            status: statusParam,
            search: search.value
        };

        const response = await api.get('/loans', { params });
        loans.value = response.data.data;
        totalItems.value = response.data.total;
        
        // Load lại số liệu thống kê
        fetchStats();
        
    } catch (error) {
        showSnackbar('Lỗi tải dữ liệu', 'error');
    } finally {
        loading.value = false;
    }
}, 300);

const fetchStats = async () => {
    try {
        const res = await api.get('/loans/stats');
        if (res.data) {
            stats.pending = res.data.pending || 0;
            stats.borrowed = res.data.borrowed || 0;
            stats.overdue = res.data.overdue || 0;
            stats.returned = res.data.returned || 0;
        }
    } catch (e) {}
};

// --- ACTIONS ---

// 1. Duyệt
const openConfirmDialog = (item) => { confirmDialog.value = { show: true, loan: item }; }
const executeConfirmLoan = async () => {
    try {
        await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`);
        showSnackbar('Đã duyệt yêu cầu mượn!', 'success');
        confirmDialog.value.show = false;
        loadLoans();
    } catch (error) { showSnackbar('Lỗi khi duyệt.', 'error'); }
}

// 2. Trả sách (Có tính phạt)
const openReturnDialog = (item) => { 
    returnDialog.value.loan = item; 
    
    // Logic tính phạt tại Frontend (Preview)
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(item.ngayHenTra); due.setHours(0,0,0,0);
    
    if (today > due) {
        const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
        previewDays.value = diff;
        previewFine.value = diff * 5000; // 5k/ngày
    } else {
        previewDays.value = 0; previewFine.value = 0;
    }
    
    returnDialog.value.show = true; 
}

const executeProcessReturn = async () => {
    try {
        const res = await api.put(`/loans/${returnDialog.value.loan._id}/return`);
        // Check nếu có phạt thật từ backend trả về
        if (res.data.phat && res.data.phat.coPhat) {
             showSnackbar(`Đã trả sách. Phí phạt: ${formatCurrency(res.data.phat.soTien)}`, 'warning');
        } else {
             showSnackbar('Đã trả sách thành công!', 'success');
        }
        returnDialog.value.show = false;
        loadLoans();
    } catch (error) { showSnackbar('Lỗi trả sách', 'error'); }
}

// 3. Từ chối / Hủy
const openCancelDialog = async (item) => {
    if(!confirm("Từ chối yêu cầu mượn này?")) return;
    try {
        await api.put(`/loans/${item._id}/cancel`);
        showSnackbar('Đã từ chối yêu cầu', 'info');
        loadLoans();
    } catch(e) { showSnackbar('Lỗi', 'error'); }
}

// 4. Xóa
const confirmDeleteLoan = async (item) => {
    if(!confirm("Xóa vĩnh viễn bản ghi này?")) return;
    try { await api.delete(`/loans/${item._id}`); showSnackbar('Đã xóa', 'success'); loadLoans(); } 
    catch(e) { showSnackbar('Lỗi xóa', 'error'); }
}

// --- HELPERS ---
const showSnackbar = (msg, color) => { snackbar.value = { show: true, message: msg, color: color }; }
const debouncedSearch = debounce(() => { currentPage.value = 1; loadLoans(); }, 500);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

// Helper tính trạng thái màu sắc
const getStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning','cancelled':'grey'}[s] || 'grey');

// Helper dịch trạng thái
const translateStatus = (s) => ({'borrowed':'Đang mượn','returned':'Đã trả','overdue':'Quá hạn','pending':'Chờ duyệt','cancelled':'Đã hủy'}[s] || s);

// Helper kiểm tra quá hạn (cho hiển thị màu đỏ)
const isOverdue = (item) => item.status === 'borrowed' && new Date(item.ngayHenTra) < new Date();

// --- ĐÂY LÀ HÀM BẠN ĐANG THIẾU ---
const getDaysOverdue = (dateString) => {
    if (!dateString) return 0;
    const due = new Date(dateString);
    const now = new Date();
    const diffTime = now - due;
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Watchers
watch(activeTab, () => { currentPage.value = 1; loadLoans(); });

onMounted(() => {
    loadLoans();
});
</script>

<style scoped>
.gap-4 { gap: 16px; }
.gap-2 { gap: 8px; }
/* Table Styling */
:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-top: 12px !important; padding-bottom: 12px !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.05) !important; }

.border-red { border: 1px solid #ff5252 !important; }
.border-green { border: 1px solid #4caf50 !important; }
</style>