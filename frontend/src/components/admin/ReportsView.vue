<template>
  <div class="reports-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="mb-8 d-flex justify-space-between align-center">
        <div>
            <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
            <v-icon start color="teal-accent-3" class="mr-2">mdi-file-chart</v-icon>
            Export Center
            </h2>
            <div class="text-subtitle-2 text-grey-lighten-1">Download system data reports</div>
        </div>
        <v-btn icon variant="text" color="grey" @click="fetchDashboardStats">
            <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>

      <v-row>
         <v-col cols="12" md="4">
            <v-card class="rounded-xl pa-6 bg-blue-grey-darken-4 border border-opacity-10 h-100 d-flex flex-column">
               <div class="d-flex justify-space-between align-start mb-4">
                  <v-avatar color="blue-darken-3" rounded="lg" size="56">
                     <v-icon size="32">mdi-book-clock</v-icon>
                  </v-avatar>
                  <div class="text-right">
                      <div class="text-h5 font-weight-bold text-white">{{ stats.borrowedLoans || 0 }}</div>
                      <div class="text-caption text-blue-lighten-4">Active Loans</div>
                  </div>
               </div>
               <h3 class="text-h6 font-weight-bold text-white mb-1">Transaction Report</h3>
               <p class="text-body-2 text-grey mb-6">
                  Export detailed history of borrowing, returns, overdue items, and fines.
               </p>
               <div class="mt-auto">
                  <v-btn 
                    block 
                    color="blue" 
                    variant="flat" 
                    prepend-icon="mdi-microsoft-excel" 
                    :loading="loading.loans"
                    @click="exportLoansReport"
                  >
                    Download .XLSX
                  </v-btn>
               </div>
            </v-card>
         </v-col>

         <v-col cols="12" md="4">
            <v-card class="rounded-xl pa-6 bg-blue-grey-darken-4 border border-opacity-10 h-100 d-flex flex-column">
               <div class="d-flex justify-space-between align-start mb-4">
                  <v-avatar color="teal-darken-3" rounded="lg" size="56">
                     <v-icon size="32">mdi-bookshelf</v-icon>
                  </v-avatar>
                  <div class="text-right">
                      <div class="text-h5 font-weight-bold text-white">{{ stats.totalBooks || 0 }}</div>
                      <div class="text-caption text-teal-lighten-4">Total Books</div>
                  </div>
               </div>
               <h3 class="text-h6 font-weight-bold text-white mb-1">Inventory Report</h3>
               <p class="text-body-2 text-grey mb-6">
                  Current stock levels, categories, publisher details, and availability status.
               </p>
               <div class="mt-auto">
                  <v-btn 
                    block 
                    color="teal" 
                    variant="flat" 
                    prepend-icon="mdi-microsoft-excel" 
                    :loading="loading.books"
                    @click="exportBooksReport"
                  >
                    Download .XLSX
                  </v-btn>
               </div>
            </v-card>
         </v-col>

         <v-col cols="12" md="4">
            <v-card class="rounded-xl pa-6 bg-blue-grey-darken-4 border border-opacity-10 h-100 d-flex flex-column">
               <div class="d-flex justify-space-between align-start mb-4">
                  <v-avatar color="purple-darken-3" rounded="lg" size="56">
                     <v-icon size="32">mdi-account-group</v-icon>
                  </v-avatar>
                  <div class="text-right">
                      <div class="text-h5 font-weight-bold text-white">{{ stats.totalUsers || 0 }}</div>
                      <div class="text-caption text-purple-lighten-4">Total Readers</div>
                  </div>
               </div>
               <h3 class="text-h6 font-weight-bold text-white mb-1">Member Registry</h3>
               <p class="text-body-2 text-grey mb-6">
                  List of all registered members, roles, contact info, and join dates.
               </p>
               <div class="mt-auto">
                  <v-btn 
                    block 
                    color="purple" 
                    variant="flat" 
                    prepend-icon="mdi-microsoft-excel" 
                    :loading="loading.users"
                    @click="exportUsersReport"
                  >
                    Download .XLSX
                  </v-btn>
               </div>
            </v-card>
         </v-col>
      </v-row>

      <v-divider class="my-8 border-opacity-12"></v-divider>

      <div class="d-flex align-center mb-4">
          <v-icon color="grey" size="small" class="mr-2">mdi-history</v-icon>
          <h3 class="text-subtitle-2 font-weight-bold text-grey">Recent Exports</h3>
      </div>
      
      <v-list bg-color="transparent" density="compact" class="py-0">
         <v-list-item v-for="(log, i) in exportLogs" :key="i" class="px-0 min-h-40">
            <template v-slot:prepend>
               <v-icon color="success" size="x-small" class="mr-3">mdi-check-circle-outline</v-icon>
            </template>
            <v-list-item-title class="text-caption text-grey-lighten-2">
                Exported <strong>{{ log.name }}</strong>
            </v-list-item-title>
            <template v-slot:append>
               <span class="text-caption text-grey font-italic">{{ log.time }}</span>
            </template>
         </v-list-item>
         <v-list-item v-if="exportLogs.length === 0" class="px-0">
            <span class="text-caption text-grey font-italic">No recent exports in this session.</span>
         </v-list-item>
      </v-list>

    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
        {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api.service';
import * as XLSX from 'xlsx'; 

const loading = reactive({
    loans: false,
    books: false,
    users: false
});

const stats = ref({});
const snackbar = ref({ show: false, message: '', color: '' });
const exportLogs = ref([]);

const fetchDashboardStats = async () => {
    try {
        const res = await api.get('/dashboard/stats');
        if(res.data && res.data.stats) {
            stats.value = res.data.stats;
        }
    } catch (e) {
        console.error("Không tải được thống kê:", e);
    }
};

const exportToExcel = (jsonData, fileName, sheetName) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(jsonData);
    
    const wscols = Object.keys(jsonData[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
};

const exportLoansReport = async () => {
    loading.loans = true;
    try {
        const res = await api.get('/loans?limit=10000');
        const loans = res.data.data || [];

        if (loans.length === 0) {
            showSnack('No data available to export.', 'warning');
            return;
        }

        const exportData = loans.map(loan => ({
            'Mã Phiếu': loan._id.slice(-6).toUpperCase(),
            'Người Mượn': loan.userId?.username || 'Unknown',
            'Email': loan.userId?.email || '',
            'Tên Sách': loan.bookId?.tenSach || 'Unknown',
            'Ngày Mượn': new Date(loan.ngayMuon).toLocaleDateString('vi-VN'),
            'Hạn Trả': new Date(loan.ngayHenTra).toLocaleDateString('vi-VN'),
            'Ngày Trả Thực Tế': loan.ngayTraThucTe ? new Date(loan.ngayTraThucTe).toLocaleDateString('vi-VN') : '-',
            'Trạng Thái': loan.status.toUpperCase(),
            'Phí Thuê': loan.rentCost || 0,
            'Tiền Phạt': loan.phatTien || 0,
            'Đã Thanh Toán': loan.isPaid ? 'Rồi' : 'Chưa'
        }));

        exportToExcel(exportData, 'Library_Transactions', 'Loans');
        addLog('Transactions Report');
        showSnack('Exported Loans Report successfully!', 'success');
    } catch (e) {
        showSnack('Failed to export loans.', 'error');
    } finally {
        loading.loans = false;
    }
};

const exportBooksReport = async () => {
    loading.books = true;
    try {
        const res = await api.get('/books?limit=10000');
        const books = res.data.data || [];

        const exportData = books.map(book => ({
            'Tên Sách': book.tenSach,
            'Tác Giả': Array.isArray(book.tacGia) ? book.tacGia.join(', ') : book.tacGia,
            'Nhà Xuất Bản': book.maNXB?.tenNXB || '',
            'Năm XB': book.namXuatBan,
            'Tổng Kho': book.soQuyen,
            'Đang Có Sẵn': book.availableCopies,
            'Giá Thuê/Ngày': book.pricePerDay,
            'ISBN': book.isbn || ''
        }));

        exportToExcel(exportData, 'Library_Inventory', 'Books');
        addLog('Inventory Report');
        showSnack('Exported Inventory Report successfully!', 'success');
    } catch (e) {
        showSnack('Failed to export books.', 'error');
    } finally {
        loading.books = false;
    }
};

const exportUsersReport = async () => {
    loading.users = true;
    try {
        const res = await api.get('/users');
        const users = Array.isArray(res.data) ? res.data : (res.data.data || []);

        const exportData = users.map(user => ({
            'Tài Khoản': user.username,
            'Họ Tên': `${user.hoLot || ''} ${user.ten || ''}`.trim(),
            'Email': user.email,
            'Vai Trò': user.role,
            'Điện Thoại': user.dienThoai || '',
            'Địa Chỉ': user.diaChi || '',
            'Ngày Tham Gia': new Date(user.createdAt).toLocaleDateString('vi-VN')
        }));

        exportToExcel(exportData, 'Library_Members', 'Users');
        addLog('Member Registry Report');
        showSnack('Exported Users Report successfully!', 'success');
    } catch (e) {
        showSnack('Failed to export users.', 'error');
    } finally {
        loading.users = false;
    }
};

// Helper Functions
const addLog = (name) => {
    exportLogs.value.unshift({ name: name, time: new Date().toLocaleTimeString() });
    if(exportLogs.value.length > 3) exportLogs.value.pop();
};

const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };

onMounted(() => {
    fetchDashboardStats();
});
</script>

<style scoped>
.border-opacity-10 { border-color: rgba(255,255,255,0.1) !important; }
.min-h-40 { min-height: 32px !important; }
</style>