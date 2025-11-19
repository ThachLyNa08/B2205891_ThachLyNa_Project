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
                <div class="text-h3 font-weight-bold text-white">{{ totalLoans }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="small" start>mdi-arrow-up</v-icon> 12% vs last week
                </div>
             </div>
             <v-sparkline
                :model-value="[10, 15, 8, 12, 20, 18, 25]"
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
                <div class="text-h3 font-weight-bold text-white">{{ borrowedCount }}</div>
                <div class="text-caption text-white mt-1">Active loans</div>
             </div>
             <v-sparkline
                :model-value="[5, 8, 12, 15, 10, 8, 15]"
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
                <div class="text-h3 font-weight-bold text-white">{{ overdueCount }}</div>
                <div class="text-caption text-error mt-1">Needs attention</div>
             </div>
             <v-sparkline
                :model-value="[2, 4, 1, 5, 2, 6, 3]"
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
        <template v-slot:item.bookId="{ item }">
          <div class="font-weight-medium">{{ item.bookId?.tenSach || 'Unknown Book' }}</div>
          <div class="text-caption text-grey">{{ item.bookId?.maSach }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" label class="font-weight-bold text-uppercase">
            {{ item.status }}
          </v-chip>
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

    <v-dialog v-model="confirmDialog.show" max-width="400">
        <v-card color="#1e293b" class="text-white pa-4 rounded-lg">
            <v-card-title class="text-h6">Confirm Loan?</v-card-title>
            <v-card-text class="text-grey-lighten-2">
                Approve loan for book "{{ confirmDialog.loan?.bookId?.tenSach }}"?
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="grey" variant="text" @click="confirmDialog.show = false">Cancel</v-btn>
                <v-btn color="primary" variant="flat" @click="executeConfirmLoan">Approve</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

     <v-dialog v-model="returnDialog.show" max-width="400">
        <v-card color="#1e293b" class="text-white pa-4 rounded-lg">
            <v-card-title class="text-h6">Process Return</v-card-title>
            <v-card-text class="text-grey-lighten-2">
                Confirm return for "{{ returnDialog.loan?.bookId?.tenSach }}"?
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

  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '../../services/api.service'; // Đảm bảo import đúng
import debounce from 'lodash.debounce';

const loans = ref([]);
const loading = ref(true);
const totalLoans = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const filterStatus = ref(''); 

// Mock stats (Có thể tính từ API nếu backend hỗ trợ)
const borrowedCount = ref(850);
const overdueCount = ref(125);

const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });

// Headers cho v-data-table
const headers = [
  { title: 'User', key: 'userId.username', align: 'start' },
  { title: 'Book Title', key: 'bookId', align: 'start' },
  { title: 'Borrow Date', key: 'ngayMuon' },
  { title: 'Status', key: 'status' },
  { title: 'Due Date', key: 'ngayHenTra' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

// --- LOGIC CALL API ---
const loadLoans = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            status: filterStatus.value || undefined, // Nếu rỗng thì undefined để lấy all
            search: search.value
        };
        
        const response = await api.get('/loans', { params });
        loans.value = response.data.data;
        totalLoans.value = response.data.total;
        
        // Update stats giả lập từ dữ liệu thật (hoặc gọi API thống kê riêng)
        // borrowedCount.value = ...
    } catch (error) {
        console.error('Load loans error:', error);
    } finally {
        loading.value = false;
    }
}, 300);

const confirmLoan = (item) => {
    confirmDialog.value.loan = item;
    confirmDialog.value.show = true;
}

const executeConfirmLoan = async () => {
    try {
        await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`);
        confirmDialog.value.show = false;
        loadLoans();
    } catch(e) { console.error(e); }
}

const processReturn = (item) => {
    returnDialog.value.loan = item;
    returnDialog.value.show = true;
}

const executeProcessReturn = async () => {
    try {
        await api.put(`/loans/${returnDialog.value.loan._id}/return`);
        returnDialog.value.show = false;
        loadLoans();
    } catch(e) { console.error(e); }
}

const confirmDeleteLoan = async (item) => {
    if(!confirm("Delete this record?")) return;
    try {
        await api.delete(`/loans/${item._id}`);
        loadLoans();
    } catch(e) { console.error(e); }
}

// --- HELPERS ---
const debouncedSearch = debounce(() => { currentPage.value = 1; loadLoans(); }, 500);

const getStatusColor = (status) => {
  switch (status) {
    case 'borrowed': return 'info';
    case 'returned': return 'success';
    case 'overdue': return 'error';
    case 'pending': return 'warning';
    default: return 'grey';
  }
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
const isOverdue = (item) => item.status !== 'returned' && new Date(item.ngayHenTra) < new Date();

// Watch filter change
watch(filterStatus, () => {
    currentPage.value = 1;
    loadLoans();
});
</script>

<style scoped>
/* CSS tùy chỉnh cho giao diện tối */
.dark-btn-toggle {
  background-color: #0f172a !important;
  border: 1px solid #334155;
}
.dark-btn-toggle .v-btn--active {
  background-color: #334155 !important;
  color: white !important;
}

.border-left-primary { border-left: 4px solid #2196F3 !important; }
.border-left-success { border-left: 4px solid #4CAF50 !important; }
.border-left-error { border-left: 4px solid #FF5252 !important; }

.gap-4 { gap: 16px; }
.tracking-wide { letter-spacing: 1px; }

/* Tùy chỉnh bảng */
:deep(.custom-dark-table) {
  background-color: transparent !important;
  color: white !important;
}
:deep(.custom-dark-table th) {
  color: #94a3b8 !important; /* Màu xám nhạt cho header */
  text-transform: uppercase;
  font-size: 0.75rem;
}
:deep(.custom-dark-table td) {
  border-bottom: 1px solid #334155 !important;
}
:deep(.custom-dark-table tbody tr:hover) {
  background-color: #1e293b !important; /* Highlight khi hover dòng */
}
</style>