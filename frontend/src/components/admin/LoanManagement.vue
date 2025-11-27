<template>
  <div class="loan-management-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="blue-accent-2" class="mr-2">mdi-book-clock</v-icon>
             Loan Management
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Track loans, returns, and overdue items</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Search user, book..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 300px;"
             @update:model-value="debouncedSearch"
           ></v-text-field>
           
           <v-btn icon variant="text" color="grey" @click="loadLoans">
              <v-icon>mdi-refresh</v-icon>
           </v-btn>
        </div>
      </div>

      <v-row class="mb-6">
         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card bg-orange-darken-4 rounded-lg pa-4" elevation="4">
               <div class="d-flex justify-space-between align-start">
                  <div>
                     <div class="text-caption font-weight-bold text-uppercase opacity-70">Pending Requests</div>
                     <div class="text-h4 font-weight-black mt-1">{{ stats.pending }}</div>
                  </div>
                  <v-icon size="large" class="opacity-50">mdi-clock-alert-outline</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card bg-blue-darken-4 rounded-lg pa-4" elevation="4">
               <div class="d-flex justify-space-between align-start">
                  <div>
                     <div class="text-caption font-weight-bold text-uppercase opacity-70">Active Loans</div>
                     <div class="text-h4 font-weight-black mt-1">{{ stats.borrowed }}</div>
                  </div>
                  <v-icon size="large" class="opacity-50">mdi-book-open-page-variant</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card bg-red-darken-4 rounded-lg pa-4" elevation="4">
               <div class="d-flex justify-space-between align-start">
                  <div>
                     <div class="text-caption font-weight-bold text-uppercase opacity-70">Overdue</div>
                     <div class="text-h4 font-weight-black mt-1">{{ stats.overdue }}</div>
                  </div>
                  <v-icon size="large" class="opacity-50">mdi-alert-octagon</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card bg-green-darken-4 rounded-lg pa-4" elevation="4">
               <div class="d-flex justify-space-between align-start">
                  <div>
                     <div class="text-caption font-weight-bold text-uppercase opacity-70">Completed</div>
                     <div class="text-h4 font-weight-black mt-1">{{ stats.returned }}</div>
                  </div>
                  <v-icon size="large" class="opacity-50">mdi-check-all</v-icon>
               </div>
            </v-card>
         </v-col>
      </v-row>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent border-t border-opacity-12 pt-4" elevation="0">
         
         <v-tabs v-model="activeTab" bg-color="transparent" color="white" class="mb-4 tab-modern">
            <v-tab value="pending" class="text-capitalize rounded-pill px-6 mr-2" :class="activeTab === 'pending' ? 'bg-orange-darken-4' : ''">Pending</v-tab>
            <v-tab value="borrowed" class="text-capitalize rounded-pill px-6 mr-2" :class="activeTab === 'borrowed' ? 'bg-blue-darken-4' : ''">Borrowed</v-tab>
            <v-tab value="overdue" class="text-capitalize rounded-pill px-6 mr-2" :class="activeTab === 'overdue' ? 'bg-red-darken-4' : ''">Overdue</v-tab>
            <v-tab value="returned" class="text-capitalize rounded-pill px-6" :class="activeTab === 'returned' ? 'bg-green-darken-4' : ''">History</v-tab>
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
                  <v-avatar size="36" class="mr-3 font-weight-bold bg-grey-darken-3 border">
                     <span class="text-white">{{ item.userId?.username?.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div>
                     <div class="font-weight-bold text-body-2">{{ item.userId?.username }}</div>
                     <div class="text-caption text-grey">{{ item.userId?.email }}</div>
                  </div>
               </div>
            </template>

            <template v-slot:item.bookId="{ item }">
               <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2 text-grey">mdi-book-outline</v-icon>
                  <span class="text-body-2 font-weight-medium text-blue-lighten-4">{{ item.bookId?.tenSach || 'Book Removed' }}</span>
               </div>
            </template>

            <template v-slot:item.status="{ item }">
               <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold text-uppercase px-3">
                  {{ translateStatus(item.status) }}
               </v-chip>
            </template>

            <template v-slot:item.ngayHenTra="{ item }">
               <div class="d-flex flex-column" style="min-width: 140px;">
                  <div class="d-flex justify-space-between text-caption text-grey mb-1">
                     <span>{{ formatDate(item.ngayMuon) }}</span>
                     <v-icon size="x-small" icon="mdi-arrow-right-thin"></v-icon>
                     <span :class="isOverdue(item) ? 'text-red font-weight-bold' : ''">{{ formatDate(item.ngayHenTra) }}</span>
                  </div>
                  <v-progress-linear
                     :model-value="item.status === 'returned' ? 100 : 60"
                     :color="isOverdue(item) ? 'red' : 'primary'"
                     height="4"
                     rounded
                  ></v-progress-linear>
                  <div v-if="isOverdue(item)" class="text-caption text-red mt-1 font-weight-bold">
                     <v-icon size="x-small" start>mdi-alert</v-icon> Late {{ getDaysOverdue(item.ngayHenTra) }} days
                  </div>
               </div>
            </template>

            <template v-slot:item.actions="{ item }">
               <div class="d-flex justify-end gap-1">
                  <v-btn v-if="item.status === 'pending'" icon="mdi-check" color="success" variant="tonal" size="small" @click="openConfirmDialog(item)" title="Approve"></v-btn>
                  <v-btn v-if="item.status === 'pending'" icon="mdi-close" color="error" variant="tonal" size="small" @click="openCancelDialog(item)" title="Reject"></v-btn>
                  <v-btn v-if="['borrowed', 'overdue'].includes(item.status)" color="primary" variant="flat" size="small" class="px-3" @click="openReturnDialog(item)">
                     <v-icon start>mdi-keyboard-return</v-icon> Return
                  </v-btn>
                  <v-btn v-if="['returned', 'cancelled'].includes(item.status)" icon="mdi-delete-outline" color="grey" variant="text" size="small" @click="confirmDeleteLoan(item)"></v-btn>
               </div>
            </template>
         </v-data-table-server>
      </v-card>

      <v-dialog v-model="confirmDialog.show" max-width="400">
         <v-card color="#1e293b" class="text-white rounded-lg">
            <v-card-title class="bg-success px-4 py-3 text-body-1 font-weight-bold d-flex align-center">
               <v-icon start>mdi-check-circle-outline</v-icon> Approve Request
            </v-card-title>
            <v-card-text class="pt-6 pb-4 text-center">
               Allow <strong>{{ confirmDialog.loan?.userId?.username }}</strong> to borrow <br/>
               <span class="text-h6 text-primary mt-2 d-block">"{{ confirmDialog.loan?.bookId?.tenSach }}"</span>
            </v-card-text>
            <v-card-actions class="justify-center pb-4">
               <v-btn variant="text" color="grey" @click="confirmDialog.show = false">Cancel</v-btn>
               <v-btn color="success" variant="elevated" @click="executeConfirmLoan" class="px-6">Confirm</v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <v-dialog v-model="returnDialog.show" max-width="450">
         <v-card color="#1e293b" class="text-white rounded-lg">
            <v-card-title class="bg-primary px-4 py-3 text-body-1 font-weight-bold">
               Process Return
            </v-card-title>
            <v-card-text class="pt-6">
               <div class="d-flex align-center mb-4 bg-grey-darken-4 pa-3 rounded">
                  <v-avatar color="primary" size="40" class="mr-3 font-weight-bold">{{ returnDialog.loan?.userId?.username?.charAt(0) }}</v-avatar>
                  <div>
                     <div class="font-weight-bold">{{ returnDialog.loan?.userId?.username }}</div>
                     <div class="text-caption text-blue-lighten-3">{{ returnDialog.loan?.bookId?.tenSach }}</div>
                  </div>
               </div>

               <div v-if="previewFine > 0" class="bg-red-darken-4 pa-4 rounded-lg border-red text-center">
                  <div class="text-overline text-red-lighten-4 mb-1">OVERDUE PENALTY</div>
                  <div class="text-h4 font-weight-black text-white">{{ formatCurrency(previewFine) }}</div>
                  <div class="text-caption text-red-lighten-3 mt-1">{{ previewDays }} days late</div>
               </div>
               <div v-else class="bg-green-darken-4 pa-4 rounded-lg border-green text-center">
                  <v-icon size="large" class="mb-2">mdi-check-decagram</v-icon>
                  <div class="font-weight-bold">No Late Fee</div>
               </div>
            </v-card-text>
            <v-card-actions class="justify-end px-6 pb-4">
               <v-btn variant="text" color="grey" @click="returnDialog.show = false">Cancel</v-btn>
               <v-btn color="primary" variant="elevated" @click="executeProcessReturn" class="px-6">Complete Return</v-btn>
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
const stats = reactive({ pending: 0, borrowed: 0, overdue: 0, returned: 0 });

// Dialogs
const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });
const snackbar = ref({ show: false, message: '', color: '' });

// Preview Fine Variables
const previewFine = ref(0);
const previewDays = ref(0);

const headers = [
  { title: 'User Info', key: 'userId', sortable: false, width: '20%' },
  { title: 'Book Title', key: 'bookId', sortable: false, width: '25%' },
  { title: 'Timeline & Due Date', key: 'ngayHenTra', width: '25%' },
  { title: 'Status', key: 'status', align: 'center', width: '15%' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false, width: '15%' },
];

// --- LOGIC GIỮ NGUYÊN (Copy lại từ file cũ của bạn) ---
// (Phần này tôi paste lại y nguyên logic của bạn để đảm bảo không lỗi)
const loadLoans = debounce(async () => {
    loading.value = true;
    try {
        let statusParam = '';
        switch (activeTab.value) {
            case 'pending': statusParam = 'pending'; break;
            case 'borrowed': statusParam = 'borrowed'; break;
            case 'overdue': statusParam = 'overdue'; break; 
            case 'returned': statusParam = 'returned'; break; 
            default: statusParam = ''; 
        }
        const params = { page: currentPage.value, limit: itemsPerPage.value, status: statusParam, search: search.value };
        const response = await api.get('/loans', { params });
        loans.value = response.data.data;
        totalItems.value = response.data.total;
        fetchStats();
    } catch (error) { showSnackbar('Error loading loans', 'error'); } 
    finally { loading.value = false; }
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

const openConfirmDialog = (item) => { confirmDialog.value = { show: true, loan: item }; }
const executeConfirmLoan = async () => {
    try { await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`); showSnackbar('Approved!', 'success'); confirmDialog.value.show = false; loadLoans(); } catch (error) { showSnackbar('Error', 'error'); }
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
        if (res.data.phat && res.data.phat.coPhat) showSnackbar(`Returned. Fine: ${formatCurrency(res.data.phat.soTien)}`, 'warning');
        else showSnackbar('Returned successfully!', 'success');
        returnDialog.value.show = false; loadLoans();
    } catch (error) { showSnackbar('Error returning book', 'error'); }
}

const openCancelDialog = async (item) => { if(!confirm("Reject request?")) return; try { await api.put(`/loans/${item._id}/cancel`); showSnackbar('Rejected', 'info'); loadLoans(); } catch(e) { showSnackbar('Error', 'error'); } }
const confirmDeleteLoan = async (item) => { if(!confirm("Delete record?")) return; try { await api.delete(`/loans/${item._id}`); showSnackbar('Deleted', 'success'); loadLoans(); } catch(e) { showSnackbar('Error', 'error'); } }

const showSnackbar = (msg, color) => { snackbar.value = { show: true, message: msg, color: color }; }
const debouncedSearch = debounce(() => { currentPage.value = 1; loadLoans(); }, 500);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const getStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning','cancelled':'grey'}[s] || 'grey');
const translateStatus = (s) => ({'borrowed':'Active','returned':'Returned','overdue':'Overdue','pending':'Pending','cancelled':'Rejected'}[s] || s);
const isOverdue = (item) => item.status === 'borrowed' && new Date(item.ngayHenTra) < new Date();
const getDaysOverdue = (dateString) => { if (!dateString) return 0; const due = new Date(dateString); const now = new Date(); const diffTime = now - due; if (diffTime <= 0) return 0; return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); };

watch(activeTab, () => { currentPage.value = 1; loadLoans(); });
onMounted(() => { loadLoans(); });
</script>

<style scoped>
.gap-1 { gap: 4px; } .gap-3 { gap: 12px; }
.stat-card { transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.3) !important; }

:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-top: 16px !important; padding-bottom: 16px !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.03) !important; }

/* Custom Tab Style */
.tab-modern .v-tab--selected { color: white !important; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
</style>