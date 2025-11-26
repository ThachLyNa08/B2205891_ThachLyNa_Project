<template>
  <div class="dashboard-container fill-height w-100">
    
    <!-- LOADING -->
    <div v-if="loading" class="d-flex justify-center align-center h-100">
       <v-progress-circular indeterminate color="cyan-accent-3" size="64"></v-progress-circular>
    </div>

    <div v-else class="pa-2">
      <!-- 1. HEADER -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-white">Dashboard Overview</h1>
          <div class="text-subtitle-1 text-grey-lighten-1">
             Welcome back, <span class="text-cyan-accent-3">{{ authStore.user?.username }}</span>
          </div>
        </div>
        <v-btn 
            color="cyan-accent-3" 
            variant="flat" 
            class="text-grey-darken-4 font-weight-bold" 
            prepend-icon="mdi-refresh" 
            @click="fetchData"
        >
            Refresh Data
        </v-btn>
      </div>

      <!-- 2. STATS CARDS (GRADIENT STYLE) -->
      <v-row>
        <v-col cols="12" sm="6" lg="3" v-for="(stat, i) in statsCards" :key="i">
          <v-card class="rounded-xl border-0 elevation-10 stat-card overflow-hidden position-relative">
            <!-- Background Gradient -->
            <div :class="`bg-gradient-${stat.color} fill-height absolute-full`"></div>
            
            <div class="pa-4 position-relative z-10">
              <div class="d-flex justify-space-between align-start">
                 <div>
                    <div class="text-caption text-white font-weight-bold opacity-80 text-uppercase">{{ stat.title }}</div>
                    <div class="text-h4 font-weight-black text-white mt-1">{{ stat.value }}</div>
                 </div>
                 <v-sheet color="white/20" class="pa-2 rounded-lg backdrop-blur">
                    <v-icon color="white" size="28">{{ stat.icon }}</v-icon>
                 </v-sheet>
              </div>
              
              <div class="mt-4 d-flex align-center">
                 <v-chip size="x-small" :color="stat.isUp ? 'white' : 'red-accent-2'" variant="flat" class="font-weight-bold text-grey-darken-4">
                    <v-icon start size="small">{{ stat.isUp ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                    {{ stat.percent }}%
                 </v-chip>
                 <span class="text-caption text-white ml-2 opacity-80">vs last month</span>
              </div>
            </div>
            
            <!-- Decor Circle -->
            <div class="decor-circle"></div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 3. CHARTS SECTION (KHU VỰC BIỂU ĐỒ) -->
      <v-row class="mt-2">
        <!-- Line Chart: Tăng trưởng mượn sách -->
        <v-col cols="12" lg="8">
          <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 pa-4 border-opacity-12">
            <div class="d-flex justify-space-between align-center mb-4">
               <div>
                  <h3 class="text-h6 font-weight-bold text-white">Loan Statistics</h3>
                  <div class="text-caption text-grey">Books borrowed over the last 6 months</div>
               </div>
               <v-btn size="small" variant="text" icon="mdi-dots-vertical" color="grey"></v-btn>
            </div>
            <div style="height: 300px; position: relative;">
               <Line :data="lineChartData" :options="lineChartOptions" />
            </div>
          </v-card>
        </v-col>

        <!-- Doughnut Chart: Phân bố trạng thái -->
        <v-col cols="12" lg="4">
          <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 pa-4 border-opacity-12">
            <h3 class="text-h6 font-weight-bold text-white mb-1">Loan Status</h3>
            <div class="text-caption text-grey mb-4">Distribution of current loans</div>
            
            <div style="height: 250px; position: relative;" class="d-flex justify-center">
               <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
            </div>
            
            <div class="d-flex justify-center gap-4 mt-4">
               <div class="text-center">
                  <div class="text-h5 font-weight-bold text-white">{{ totalLoans }}</div>
                  <div class="text-caption text-grey">Total Records</div>
               </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 4. BOTTOM SECTION: Trending & Activity -->
      <v-row class="mt-2">
         <v-col cols="12" md="8">
            <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 border-opacity-12">
               <div class="d-flex align-center pa-5 border-b border-opacity-12">
                  <v-icon color="amber" class="mr-2">mdi-fire</v-icon>
                  <h3 class="text-h6 font-weight-bold text-white">Top Trending Books</h3>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" size="small" color="primary" to="/admin-portal/books">View All</v-btn>
               </div>
               <v-table class="bg-transparent text-white">
                  <thead>
                     <tr>
                        <th class="text-grey">Book</th>
                        <th class="text-grey">Author</th>
                        <th class="text-center text-grey">Borrows</th>
                        <th class="text-center text-grey">Stock</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="book in topBooks" :key="book.title" class="hover-row">
                        <td class="font-weight-bold">{{ book.title }}</td>
                        <td class="text-grey-lighten-1">{{ book.author?.[0] || book.author }}</td>
                        <td class="text-center">
                           <v-chip size="small" color="cyan" variant="tonal" class="font-weight-bold">{{ book.borrowedCount }}</v-chip>
                        </td>
                        <td class="text-center">
                           <v-progress-linear 
                              :model-value="(book.stock / (book.stock + 5)) * 100" 
                              :color="book.stock > 0 ? 'success' : 'error'" 
                              height="6" 
                              rounded
                           ></v-progress-linear>
                           <div class="text-caption mt-1">{{ book.stock }} in stock</div>
                        </td>
                     </tr>
                  </tbody>
               </v-table>
            </v-card>
         </v-col>

         <v-col cols="12" md="4">
            <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 border-opacity-12">
               <div class="pa-5 border-b border-opacity-12">
                  <h3 class="text-h6 font-weight-bold text-white">Recent Activities</h3>
               </div>
               <div class="pa-4">
                  <v-timeline density="compact" align="start" truncate-line="both" side="end">
                     <v-timeline-item 
                        v-for="(act, i) in activities" 
                        :key="i" 
                        :dot-color="act.color" 
                        size="x-small"
                        fill-dot
                     >
                        <div class="mb-1">
                           <span class="font-weight-bold text-white mr-1">{{ act.user }}</span>
                           <span class="text-caption text-grey">{{ act.action }}</span>
                        </div>
                        <div class="text-caption text-grey-darken-1">{{ formatDate(act.time) }}</div>
                     </v-timeline-item>
                  </v-timeline>
               </div>
            </v-card>
         </v-col>
      </v-row>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'vue-chartjs';

// Đăng ký các thành phần biểu đồ
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const authStore = useAuthStore();
const loading = ref(true);
const statsCards = ref([]);
const topBooks = ref([]);
const activities = ref([]);
const totalLoans = ref(0);

// Chart Data Refs
const lineChartData = ref({ labels: [], datasets: [] });
const doughnutChartData = ref({ labels: [], datasets: [] });

// Chart Options (Cấu hình giao diện biểu đồ)
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { display: false } }
};

const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { position: 'bottom', labels: { color: '#fff', usePointStyle: true } } 
    }
};

// FETCH DATA
const fetchData = async () => {
    loading.value = true;
    try {
        const res = await api.get('/dashboard');
        
        // --- SỬA ĐOẠN NÀY: Thêm || [] để tránh lỗi undefined ---
        const stats = res.data.stats || {};
        const trendingBooks = res.data.trendingBooks || [];
        const activitiesData = res.data.activities || [];
        const monthlyLoans = res.data.monthlyLoans || []; // <--- Quan trọng
        const statusDist = res.data.statusDist || [];     // <--- Quan trọng
        // -------------------------------------------------------

        // 1. Cards Data (Cần kiểm tra stats tồn tại)
        if (stats) {
             statsCards.value = [
                { title: 'Total Books', value: stats.totalBooks || 0, icon: 'mdi-book', color: 'purple', percent: stats.bookGrowth || 0, isUp: true },
                { title: 'Readers', value: stats.totalUsers || 0, icon: 'mdi-account-group', color: 'blue', percent: stats.userGrowth || 0, isUp: true },
                { title: 'Active Loans', value: stats.borrowedLoans || 0, icon: 'mdi-book-clock', color: 'orange', percent: 0, isUp: true },
                { title: 'Overdue', value: stats.overdueLoans || 0, icon: 'mdi-alert', color: 'red', percent: 0, isUp: false },
            ];
        }

        // 2. Line Chart Data (Giờ đã an toàn để map)
        const weeks = monthlyLoans.map(m => `Tuần ${m._id.week}`); 
        const counts = monthlyLoans.map(m => m.count);
        
        lineChartData.value = {
            labels: weeks.length ? weeks : ['W1', 'W2', 'W3', 'W4'], // Nhãn mặc định nếu chưa có data
            datasets: [{
                label: 'Loans per Week', // Đổi tên label
                backgroundColor: '#00E5FF',
                borderColor: '#00E5FF',
                data: counts.length ? counts : [0, 0, 0, 0],
                tension: 0.4,
                pointRadius: 4
            }]
        };

        // 3. Doughnut Chart Data
        const statusLabels = statusDist.map(s => (s._id ? s._id.toUpperCase() : 'UNKNOWN'));
        const statusData = statusDist.map(s => s.count);
        totalLoans.value = statusData.reduce((a,b) => a+b, 0);

        doughnutChartData.value = {
            labels: statusLabels.length ? statusLabels : ['Empty'],
            datasets: [{
                backgroundColor: ['#FFCA28', '#29B6F6', '#66BB6A', '#EF5350'],
                data: statusData.length ? statusData : [1], // Để 1 để hiện vòng tròn trống cho đẹp
                borderWidth: 0
            }]
        };

        // 4. Tables
        topBooks.value = trendingBooks;
        activities.value = activitiesData;

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    } finally {
        loading.value = false;
    }
};

const formatDate = (d) => {
   const date = new Date(d);
   const now = new Date();
   const diff = (now - date)/1000;
   if(diff < 60) return 'Just now';
   if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
   if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
   return date.toLocaleDateString('en-GB');
};

onMounted(fetchData);
</script>

<style scoped>
.absolute-full {
   position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}
.bg-gradient-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.bg-gradient-blue { background: linear-gradient(135deg, #2AFADF 0%, #4C83FF 100%); }
.bg-gradient-orange { background: linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%); }
.bg-gradient-red { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); }

.backdrop-blur { backdrop-filter: blur(10px); }
.decor-circle {
   position: absolute;
   top: -20px; right: -20px;
   width: 100px; height: 100px;
   background: rgba(255,255,255,0.1);
   border-radius: 50%;
   z-index: 1;
}

.hover-row:hover td { background-color: rgba(255,255,255,0.05); }
</style>