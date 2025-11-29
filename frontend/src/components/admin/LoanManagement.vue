<template>
  <div class="loan-management-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="blue-accent-2" class="mr-2">mdi-book-clock-outline</v-icon>
             Quản lý Mượn Trả
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Theo dõi sách, hạn trả và tiền phạt</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Tìm tên, sách, mã phiếu..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 300px;"
             @update:model-value="debouncedSearch"
           ></v-text-field>
           
           <v-btn icon variant="tonal" color="blue-lighten-3" @click="loadLoans" title="Làm mới">
              <v-icon>mdi-refresh</v-icon>
           </v-btn>
        </div>
      </div>

      <v-row class="mb-6">
         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card rounded-lg pa-4 position-relative overflow-hidden" elevation="4">
               <div class="bg-gradient-orange fill-height absolute-full"></div>
               <div class="position-relative z-10 d-flex justify-space-between align-center">
                  <div>
                     <div class="text-caption font-weight-bold text-white opacity-80">YÊU CẦU CHỜ DUYỆT</div>
                     <div class="text-h4 font-weight-black text-white mt-1">{{ stats.pending }}</div>
                  </div>
                  <v-avatar color="white/20" rounded class="backdrop-blur">
                     <v-icon color="white">mdi-timer-sand</v-icon>
                  </v-avatar>
               </div>
            </v-card>
         </v-col>

         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card rounded-lg pa-4 position-relative overflow-hidden" elevation="4">
               <div class="bg-gradient-blue fill-height absolute-full"></div>
               <div class="position-relative z-10 d-flex justify-space-between align-center">
                  <div>
                     <div class="text-caption font-weight-bold text-white opacity-80">ĐANG MƯỢN</div>
                     <div class="text-h4 font-weight-black text-white mt-1">{{ stats.borrowed }}</div>
                  </div>
                  <v-avatar color="white/20" rounded class="backdrop-blur">
                     <v-icon color="white">mdi-book-open-page-variant</v-icon>
                  </v-avatar>
               </div>
            </v-card>
         </v-col>

         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card rounded-lg pa-4 position-relative overflow-hidden" elevation="4">
               <div class="bg-gradient-red fill-height absolute-full"></div>
               <div class="position-relative z-10 d-flex justify-space-between align-center">
                  <div>
                     <div class="text-caption font-weight-bold text-white opacity-80">QUÁ HẠN</div>
                     <div class="text-h4 font-weight-black text-white mt-1">{{ stats.overdue }}</div>
                  </div>
                  <v-avatar color="white/20" rounded class="backdrop-blur">
                     <v-icon color="white">mdi-alert-octagon</v-icon>
                  </v-avatar>
               </div>
            </v-card>
         </v-col>

         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card rounded-lg pa-4 position-relative overflow-hidden" elevation="4">
               <div class="bg-gradient-purple fill-height absolute-full"></div>
               <div class="position-relative z-10 d-flex justify-space-between align-center">
                  <div>
                     <div class="text-caption font-weight-bold text-white opacity-80">PHẠT CHƯA THU</div>
                     <div class="text-h4 font-weight-black text-white mt-1">{{ stats.unpaidFines }}</div>
                  </div>
                  <v-avatar color="white/20" rounded class="backdrop-blur">
                     <v-icon color="white">mdi-cash-multiple</v-icon>
                  </v-avatar>
               </div>
            </v-card>
         </v-col>
      </v-row>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent border-t border-opacity-12 pt-4" elevation="0">
         
         <v-tabs v-model="activeTab" bg-color="transparent" color="white" class="mb-4 tab-modern" show-arrows>
            <v-tab value="pending" class="text-capitalize rounded-pill px-6 mr-2" selected-class="bg-orange-darken-4">Chờ duyệt</v-tab>
            <v-tab value="borrowed" class="text-capitalize rounded-pill px-6 mr-2" selected-class="bg-blue-darken-4">Đang mượn</v-tab>
            <v-tab value="overdue" class="text-capitalize rounded-pill px-6 mr-2" selected-class="bg-red-darken-4">Quá hạn</v-tab>
            <v-tab value="returned" class="text-capitalize rounded-pill px-6" selected-class="bg-green-darken-4">Lịch sử</v-tab>
         </v-tabs>

         <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="loans"
            :items-length="totalItems"
            :loading="loading"
            @update:options="loadLoans"
            class="bg-transparent text-white custom-table flex-grow-1"
            density="comfortable"
            hover
         >
            <template v-slot:item.userId="{ item }">
               <div class="d-flex align-center py-2">
                  <v-avatar size="36" class="mr-3 font-weight-bold bg-grey-darken-3 border elevation-2">
                     <v-img v-if="item.userId?.avatar" :src="item.userId.avatar" cover></v-img>
                     <span v-else class="text-white">{{ item.userId?.username?.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div>
                     <div class="font-weight-bold text-body-2">{{ item.userId?.username }}</div>
                     <div class="text-caption text-grey">{{ item.userId?.email }}</div>
                  </div>
               </div>
            </template>

            <template v-slot:item.bookId="{ item }">
               <div class="d-flex align-center">
                  <v-avatar rounded size="32" class="mr-3 bg-grey-lighten-4">
                      <v-img :src="item.bookId?.coverUrl || ''" cover></v-img>
                  </v-avatar>
                  <div>
                      <div class="text-body-2 font-weight-medium text-blue-lighten-4 text-truncate" style="max-width: 200px;">
                          {{ item.bookId?.tenSach || 'Sách đã xóa' }}
                      </div>
                      <div class="text-caption text-grey">ID: ...{{ item._id.slice(-4) }}</div>
                  </div>
               </div>
            </template>

            <template v-slot:item.ngayHenTra="{ item }">
               <div class="d-flex flex-column py-2" style="min-width: 160px;">
                  <div class="d-flex justify-space-between text-caption text-grey mb-1">
                     <span>{{ formatDate(item.ngayMuon) }}</span>
                     <v-icon size="x-small" icon="mdi-arrow-right-thin"></v-icon>
                     <span :class="isOverdue(item) ? 'text-red-accent-2 font-weight-bold' : ''">
                        {{ item.status === 'returned' ? formatDate(item.ngayTraThucTe) : formatDate(item.ngayHenTra) }}
                     </span>
                  </div>
                  <v-progress-linear
                     :model-value="item.status === 'returned' ? 100 : (isOverdue(item) ? 100 : 60)"
                     :color="isOverdue(item) ? 'red-accent-2' : (item.status === 'returned' ? 'success' : 'blue')"
                     height="6"
                     rounded
                     striped
                     class="opacity-80"
                  ></v-progress-linear>
                  
                  <div v-if="isOverdue(item)" class="text-caption text-red-accent-2 mt-1 font-weight-bold d-flex align-center">
                     <v-icon size="x-small" start>mdi-clock-alert</v-icon> 
                     Trễ {{ getDaysOverdue(item.ngayHenTra) }} ngày
                  </div>
                  <div v-else-if="item.status === 'returned'" class="text-caption text-success mt-1">
                     Đã trả xong
                  </div>
               </div>
            </template>

            <template v-slot:item.phatTien="{ item }">
               <div v-if="item.phatTien > 0">
                  <div class="text-subtitle-2 font-weight-black text-red-accent-2">{{ formatCurrency(item.phatTien) }}</div>
                  <div v-if="item.isFinePaid">
                      <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold px-2" style="height: 20px;">ĐÃ THANH TOÁN</v-chip>
                  </div>
                  <div v-else class="d-flex align-center mt-1">
                      <v-btn 
                        size="x-small" 
                        color="purple-accent-3" 
                        variant="flat" 
                        class="font-weight-bold px-3"
                        prepend-icon="mdi-cash-register"
                        @click="openFineDialog(item)"
                      >Thu tiền</v-btn>
                  </div>
               </div>
               <span v-else class="text-grey text-caption opacity-50">-</span>
            </template>

            <template v-slot:item.status="{ item }">
               <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold text-uppercase px-3 border" label>
                  {{ translateStatus(item.status) }}
               </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
               <div class="d-flex justify-end gap-1">
                  <v-btn v-if="item.status === 'pending'" icon="mdi-check" color="success" variant="tonal" size="small" @click="openConfirmDialog(item)" title="Duyệt"></v-btn>
                  <v-btn v-if="item.status === 'pending'" icon="mdi-close" color="error" variant="tonal" size="small" @click="openCancelDialog(item)" title="Từ chối"></v-btn>
                  
                  <v-btn v-if="['borrowed', 'overdue'].includes(item.status)" color="blue-lighten-2" variant="tonal" size="small" class="px-3 font-weight-bold" @click="openReturnDialog(item)">
                     <v-icon start>mdi-keyboard-return</v-icon> Trả sách
                  </v-btn>
                  
                  <v-btn v-if="['returned', 'cancelled'].includes(item.status)" icon="mdi-delete-outline" color="grey-darken-1" variant="text" size="small" @click="confirmDeleteLoan(item)" title="Xóa lịch sử"></v-btn>
               </div>
            </template>
         </v-data-table-server>
      </v-card>

      <v-dialog v-model="confirmDialog.show" max-width="400">
         <v-card color="#1e293b" class="text-white rounded-lg border border-success">
            <v-card-title class="bg-success-darken-1 px-4 py-3 text-body-1 font-weight-bold d-flex align-center">
               <v-icon start>mdi-check-decagram</v-icon> Xác nhận cho mượn
            </v-card-title>
            <v-card-text class="pt-6 pb-4 text-center">
               Cho phép <strong>{{ confirmDialog.loan?.userId?.username }}</strong> mượn sách <br/>
               <span class="text-h6 text-blue-lighten-3 mt-2 d-block">"{{ confirmDialog.loan?.bookId?.tenSach }}"</span>
            </v-card-text>
            <v-card-actions class="justify-center pb-4">
               <v-btn variant="text" color="grey" @click="confirmDialog.show = false">Hủy</v-btn>
               <v-btn color="success" variant="elevated" @click="executeConfirmLoan" class="px-6 font-weight-bold">Đồng ý</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <v-dialog v-model="returnDialog.show" max-width="450">
         <v-card color="#1e293b" class="text-white rounded-lg border border-primary">
            <v-card-title class="bg-blue-darken-2 px-4 py-3 text-body-1 font-weight-bold">
               <v-icon start>mdi-book-check</v-icon> Xác nhận Trả Sách
            </v-card-title>
            <v-card-text class="pt-6">
               <div class="d-flex align-center mb-4 bg-grey-darken-4 pa-3 rounded border border-opacity-12">
                  <v-avatar color="blue" size="40" class="mr-3 font-weight-bold">{{ returnDialog.loan?.userId?.username?.charAt(0) }}</v-avatar>
                  <div>
                     <div class="font-weight-bold">{{ returnDialog.loan?.userId?.username }}</div>
                     <div class="text-caption text-blue-lighten-3">{{ returnDialog.loan?.bookId?.tenSach }}</div>
                  </div>
               </div>

               <div v-if="previewFine > 0" class="bg-red-darken-4 pa-4 rounded-lg border border-red-accent-2 text-center elevation-4">
                  <div class="text-overline text-red-lighten-4 mb-1">PHẠT QUÁ HẠN</div>
                  <div class="text-h4 font-weight-black text-white">{{ formatCurrency(previewFine) }}</div>
                  <div class="text-caption text-white mt-1 opacity-80">Trễ {{ previewDays }} ngày</div>
               </div>
               <div v-else class="bg-green-darken-4 pa-4 rounded-lg border border-green-accent-3 text-center elevation-4">
                  <v-icon size="large" class="mb-2">mdi-check-circle</v-icon>
                  <div class="font-weight-bold">Trả đúng hạn</div>
                  <div class="text-caption text-white opacity-80">Không có phí phạt</div>
               </div>
            </v-card-text>
            <v-card-actions class="justify-end px-6 pb-4">
               <v-btn variant="text" color="grey" @click="returnDialog.show = false">Hủy</v-btn>
               <v-btn color="blue-lighten-1" variant="elevated" @click="executeProcessReturn" class="px-6 font-weight-bold">Hoàn tất trả sách</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <v-dialog v-model="fineDialog.show" max-width="400">
         <v-card color="#1e293b" class="text-white rounded-lg border border-purple">
            <v-card-title class="bg-purple-darken-3 px-4 py-3 text-body-1 font-weight-bold">
               <v-icon start>mdi-cash-register</v-icon> Thu Tiền Phạt
            </v-card-title>
            <v-card-text class="pt-6 text-center">
               <div class="text-grey-lighten-1 mb-1">Xác nhận thu tiền mặt từ</div>
               <div class="text-h6 font-weight-bold text-white mb-4">{{ fineDialog.loan?.userId?.username }}</div>
               
               <v-sheet color="purple-darken-4" class="pa-4 rounded-lg border border-purple-accent-2">
                  <div class="text-caption text-uppercase text-purple-lighten-4">Tổng tiền thu</div>
                  <div class="text-h3 font-weight-black text-white mt-1">{{ formatCurrency(fineDialog.loan?.phatTien) }}</div>
               </v-sheet>
            </v-card-text>
            <v-card-actions class="justify-center pb-6">
               <v-btn variant="text" color="grey" @click="fineDialog.show = false">Hủy</v-btn>
               <v-btn color="purple-accent-2" variant="elevated" @click="executeCollectFine" class="px-6 font-weight-bold text-grey-darken-4">Đã thu tiền</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">{{ snackbar.message }}</v-snackbar>
    </v-card>
  </div>
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
const activeTab = ref('pending');

// Stats
const stats = reactive({ pending: 0, borrowed: 0, overdue: 0, returned: 0, unpaidFines: 0 });

// Dialogs
const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });
const fineDialog = ref({ show: false, loan: null });
const snackbar = ref({ show: false, message: '', color: '' });

const previewFine = ref(0);
const previewDays = ref(0);

const headers = [
  { title: 'Người mượn', key: 'userId', sortable: false, width: '20%' },
  { title: 'Sách', key: 'bookId', sortable: false, width: '25%' },
  { title: 'Thời gian', key: 'ngayHenTra', width: '25%' },
  { title: 'Phí & Phạt', key: 'phatTien', align: 'left', width: '15%' },
  { title: 'Trạng thái', key: 'status', align: 'center', width: '10%' },
  { title: '', key: 'actions', align: 'end', sortable: false, width: '10%' },
];

// --- LOGIC GIỮ NGUYÊN ---
const loadLoans = debounce(async () => {
    loading.value = true;
    try {
        let statusParam = '';
        if (activeTab.value === 'fines') statusParam = ''; 
        else if (activeTab.value !== 'all') statusParam = activeTab.value;

        const params = { page: currentPage.value, limit: itemsPerPage.value, status: statusParam, search: search.value };
        const response = await api.get('/loans', { params });
        
        let data = response.data.data;
        if (activeTab.value === 'fines') {
            data = data.filter(l => l.phatTien > 0);
        }
        
        //unpaidFinesCount.value = data.filter(l => l.phatTien > 0 && !l.isFinePaid).length;
        loans.value = data;
        totalItems.value = response.data.total;
        fetchStats();
    } catch (error) { showSnackbar('Lỗi tải dữ liệu', 'error'); } 
    finally { loading.value = false; }
}, 300);

const fetchStats = async () => {
    try {
        const res = await api.get('/loans/stats');
        if (res.data) {
            // Tự động map tất cả key (bao gồm unpaidFines vừa thêm ở backend)
            Object.assign(stats, res.data);
        }
    } catch (e) {}
};

const openConfirmDialog = (item) => { confirmDialog.value = { show: true, loan: item }; }
const executeConfirmLoan = async () => {
    try { await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`); showSnackbar('Đã duyệt!', 'success'); confirmDialog.value.show = false; loadLoans(); } catch (error) { showSnackbar('Lỗi', 'error'); }
}

const openReturnDialog = (item) => { 
    returnDialog.value.loan = item; 
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(item.ngayHenTra); due.setHours(0,0,0,0);
    if (today > due) { const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24)); previewDays.value = diff; previewFine.value = diff * 5000; } 
    else { previewDays.value = 0; previewFine.value = 0; }
    returnDialog.value.show = true; 
}

const executeProcessReturn = async () => {
    try {
        const res = await api.put(`/loans/${returnDialog.value.loan._id}/return`);
        if (res.data.phat && res.data.phat.coPhat) showSnackbar(`Đã trả. Phạt: ${formatCurrency(res.data.phat.soTien)}`, 'warning');
        else showSnackbar('Trả sách thành công!', 'success');
        returnDialog.value.show = false; loadLoans();
    } catch (error) { showSnackbar('Lỗi trả sách', 'error'); }
}

const openFineDialog = (item) => { fineDialog.value = { show: true, loan: item }; }
const executeCollectFine = async () => {
    try {
        await api.put(`/loans/${fineDialog.value.loan._id}/pay-fine`);
        showSnackbar('Đã thu tiền thành công!', 'success');
        fineDialog.value.show = false;
        loadLoans();
    } catch (e) { showSnackbar('Lỗi thu tiền', 'error'); }
};

const openCancelDialog = async (item) => { if(!confirm("Từ chối yêu cầu này?")) return; try { await api.put(`/loans/${item._id}/cancel`); showSnackbar('Đã từ chối', 'info'); loadLoans(); } catch(e) { showSnackbar('Lỗi', 'error'); } }
const confirmDeleteLoan = async (item) => { if(!confirm("Xóa lịch sử này?")) return; try { await api.delete(`/loans/${item._id}`); showSnackbar('Đã xóa', 'success'); loadLoans(); } catch(e) { showSnackbar('Lỗi', 'error'); } }

const showSnackbar = (msg, color) => { snackbar.value = { show: true, message: msg, color: color }; }
const debouncedSearch = debounce(() => { currentPage.value = 1; loadLoans(); }, 500);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const isOverdue = (item) => item.status === 'overdue' || (item.status === 'borrowed' && new Date(item.ngayHenTra) < new Date());

const getStatusColor = (s) => {
    if(s==='pending') return 'orange';
    if(s==='returned') return 'success';
    if(s==='overdue') return 'red';
    if(s==='cancelled') return 'grey';
    return 'blue';
};
const translateStatus = (s) => ({'borrowed':'Đang mượn','returned':'Đã trả','overdue':'Quá hạn','pending':'Chờ duyệt','cancelled':'Từ chối'}[s] || s);
const getDaysOverdue = (dateString) => { if (!dateString) return 0; const due = new Date(dateString); const now = new Date(); const diffTime = now - due; if (diffTime <= 0) return 0; return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); };

watch(activeTab, () => { currentPage.value = 1; loadLoans(); });
onMounted(() => { loadLoans(); });
</script>

<style scoped>
.gap-1 { gap: 4px; } .gap-3 { gap: 12px; }
.stat-card { transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.3) !important; }
.absolute-full { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.backdrop-blur { backdrop-filter: blur(10px); }

/* Gradients */
.bg-gradient-orange { background: linear-gradient(135deg, #FF9800, #F57C00); }
.bg-gradient-blue { background: linear-gradient(135deg, #2196F3, #1565C0); }
.bg-gradient-red { background: linear-gradient(135deg, #F44336, #D32F2F); }
.bg-gradient-purple { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }

:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-top: 16px !important; padding-bottom: 16px !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.03) !important; }
.tab-modern .v-tab--selected { color: white !important; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); }
</style>