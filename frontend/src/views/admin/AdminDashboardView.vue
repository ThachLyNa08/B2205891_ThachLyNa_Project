<template>
  <div class="dashboard-container fill-height w-100">
    
    <div v-if="loading" class="d-flex justify-center align-center h-100">
       <v-progress-circular indeterminate color="cyan-accent-3" size="64"></v-progress-circular>
    </div>

    <div v-else class="pa-2">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-white">Tổng Quan Hệ Thống</h1>
          <div class="text-subtitle-1 text-grey-lighten-1">
              Chào mừng trở lại, <span class="text-cyan-accent-3">{{ authStore.user?.username }}</span>
          </div>
        </div>
        <v-btn 
            color="cyan-accent-3" 
            variant="flat" 
            class="text-grey-darken-4 font-weight-bold" 
            prepend-icon="mdi-refresh" 
            @click="fetchData"
        >
            Làm mới dữ liệu
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" sm="6" md="4" lg="2" v-for="(stat, i) in statsCards" :key="i">
          <v-card class="rounded-xl border-0 elevation-10 stat-card overflow-hidden position-relative h-100">
            <div :class="`bg-gradient-${stat.color} fill-height absolute-full`"></div>
            <div class="pa-4 position-relative z-10">
              <div class="d-flex justify-space-between align-start">
                 <div>
                    <div class="text-caption text-white font-weight-bold opacity-80 text-uppercase">{{ stat.title }}</div>
                    <div class="text-h5 font-weight-black text-white mt-1">{{ stat.isMoney ? formatCurrencyCompact(stat.value) : stat.value }}</div>
                 </div>
                 <v-sheet color="white/20" class="pa-2 rounded-lg backdrop-blur">
                    <v-icon color="white" size="24">{{ stat.icon }}</v-icon>
                 </v-sheet>
              </div>
              <div class="mt-2 d-flex align-center" v-if="!stat.isMoney">
                 <v-chip size="x-small" :color="stat.isUp ? 'white' : 'red-accent-2'" variant="flat" class="font-weight-bold text-grey-darken-4">
                    <v-icon start size="small">{{ stat.isUp ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                    {{ stat.percent }}%
                 </v-chip>
                 <span class="text-caption text-white ml-2 opacity-80">so với tháng trước</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" lg="8">
          <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 pa-4 border-opacity-12">
            <div class="d-flex justify-space-between align-center mb-4">
               <div>
                  <h3 class="text-h6 font-weight-bold text-white">Thống Kê Mượn Sách</h3>
                  <div class="text-caption text-grey">Số lượt mượn trong 6 tháng qua</div>
               </div>
            </div>
            <div style="height: 300px; position: relative;">
               <Line :data="lineChartData" :options="lineChartOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 pa-4 border-opacity-12">
            <h3 class="text-h6 font-weight-bold text-white mb-1">Trạng Thái Phiếu Mượn</h3>
            <div class="text-caption text-grey mb-4">Phân bố các trạng thái hiện tại</div>
            
            <div style="height: 250px; position: relative;" class="d-flex justify-center">
               <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
            </div>
            
            <div class="d-flex justify-center gap-4 mt-4">
               <div class="text-center">
                  <div class="text-h5 font-weight-bold text-white">{{ totalLoans }}</div>
                  <div class="text-caption text-grey">Tổng số phiếu</div>
               </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
         <v-col cols="12" md="8">
            <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 border-opacity-12">
               <div class="d-flex align-center pa-5 border-b border-opacity-12">
                  <v-icon color="amber" class="mr-2">mdi-fire</v-icon>
                  <h3 class="text-h6 font-weight-bold text-white">Sách Thịnh Hành Nhất</h3>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" size="small" color="primary" to="/admin-portal/books">Xem tất cả</v-btn>
               </div>
               <v-table class="bg-transparent text-white">
                  <thead>
                      <tr>
                         <th class="text-grey">Tên Sách</th>
                         <th class="text-grey">Tác Giả</th>
                         <th class="text-center text-grey">Lượt Mượn</th>
                         <th class="text-center text-grey">Tồn Kho</th>
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
                               height="6" rounded
                            ></v-progress-linear>
                            <div class="text-caption mt-1">{{ book.stock }} quyển</div>
                         </td>
                      </tr>
                   </tbody>
                </v-table>
            </v-card>
         </v-col>

         <v-col cols="12" md="4">
            <v-card color="#1e293b" class="rounded-xl elevation-4 h-100 border-opacity-12">
               <div class="pa-5 border-b border-opacity-12">
                  <h3 class="text-h6 font-weight-bold text-white">Hoạt Động Gần Đây</h3>
               </div>
               <div class="pa-4">
                  <v-timeline density="compact" align="start" truncate-line="both" side="end">
                      <v-timeline-item v-for="(act, i) in activities" :key="i" :dot-color="act.color" size="x-small" fill-dot>
                         <div class="mb-1">
                            <span class="font-weight-bold text-white mr-1">{{ act.user }}</span>
                            <span class="text-caption text-grey">{{ translateAction(act.action) }}</span>
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
import { ref, onMounted } from 'vue';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const authStore = useAuthStore();
const loading = ref(true);
const statsCards = ref([]);
const topBooks = ref([]);
const activities = ref([]);
const totalLoans = ref(0);
const totalFines = ref(0);

const lineChartData = ref({ labels: [], datasets: [] });
const doughnutChartData = ref({ labels: [], datasets: [] });

const lineChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(30,41,59,0.9)', titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 8, displayColors: false } },
    elements: { line: { tension: 0.4 } }
};

const doughnutChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#fff', usePointStyle: true, padding: 20 } } },
    cutout: '75%'
};

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await api.get('/dashboard/stats');
        const stats = res.data.stats || {};
        const trendingBooks = res.data.trendingBooks || [];
        const activitiesData = res.data.activities || [];
        const monthlyLoans = res.data.monthlyLoans || [];
        const statusDist = res.data.statusDist || [];
        
        const revenueStats = res.data.revenueStats || []; 
        totalFines.value = revenueStats.reduce((sum, item) => sum + item.totalAmount, 0);

        if (stats) {
             statsCards.value = [
                { title: 'Tổng Sách', value: stats.totalBooks || 0, icon: 'mdi-book', color: 'purple', percent: stats.bookGrowth || 0, isUp: true },
                { title: 'Độc Giả', value: stats.totalUsers || 0, icon: 'mdi-account-group', color: 'blue', percent: stats.userGrowth || 0, isUp: true },
                { title: 'Đang Mượn', value: stats.borrowedLoans || 0, icon: 'mdi-book-clock', color: 'orange', percent: 0, isUp: true },
                { title: 'Quá Hạn', value: stats.overdueLoans || 0, icon: 'mdi-alert', color: 'red', percent: 0, isUp: false },
                { 
                    title: 'Tổng Tiền Phạt', 
                    value: stats.totalFineCollected || 0, 
                    icon: 'mdi-cash-multiple', 
                    color: 'green', 
                    isMoney: true 
                } 
            ];
        }

        const weeks = monthlyLoans.map(m => `Tuần ${m._id.week}`); 
        const counts = monthlyLoans.map(m => m.count);
        
        lineChartData.value = {
            labels: weeks.length ? weeks : ['T1', 'T2', 'T3', 'T4', 'T5'],
            datasets: [{
                label: 'Lượt Mượn',
                backgroundColor: (ctx) => {
                    const canvas = ctx.chart.ctx;
                    const gradient = canvas.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
                    gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
                    return gradient;
                },
                borderColor: '#00E5FF', borderWidth: 3, pointBackgroundColor: '#1e293b', pointBorderColor: '#00E5FF', pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8, fill: true,
                data: counts.length ? counts : [12, 19, 8, 15, 22]
            }]
        };

        const colorMap = { 'pending': '#FFA726', 'borrowed': '#29B6F6', 'returned': '#66BB6A', 'overdue': '#EF5350', 'cancelled': '#BDBDBD' };
        const labelMap = { 'pending': 'Chờ Duyệt', 'borrowed': 'Đang Mượn', 'returned': 'Đã Trả', 'overdue': 'Quá Hạn', 'cancelled': 'Đã Hủy' };

        let statusLabels = [];
        let statusData = [];
        let statusColors = [];

        if (statusDist.length > 0) {
            statusDist.forEach(s => {
                statusLabels.push(labelMap[s._id] || s._id);
                statusData.push(s.count);
                statusColors.push(colorMap[s._id] || '#78909C');
            });
        } else {
            statusLabels = ['Chờ Duyệt', 'Đang Mượn', 'Đã Trả', 'Quá Hạn'];
            statusData = [5, 12, 8, 2];
            statusColors = ['#FFA726', '#29B6F6', '#66BB6A', '#EF5350'];
        }
        
        totalLoans.value = statusData.reduce((a,b) => a+b, 0);

        doughnutChartData.value = {
            labels: statusLabels,
            datasets: [{
                backgroundColor: statusColors, borderColor: '#1e293b', borderWidth: 4, data: statusData, hoverOffset: 4
            }]
        };

        topBooks.value = trendingBooks;
        activities.value = activitiesData;

    } catch (error) { console.error("Dashboard Load Error:", error); } 
    finally { loading.value = false; }
};

const formatDate = (d) => {
   const date = new Date(d);
   const now = new Date();
   const diff = (now - date)/1000;
   if(diff < 60) return 'Vừa xong';
   if(diff < 3600) return `${Math.floor(diff/60)} phút trước`;
   if(diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
   return date.toLocaleDateString('vi-VN');
};

const formatCurrencyCompact = (value) => {
   return new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short", currency: 'VND', style: 'currency' }).format(value);
};

const translateAction = (text) => {
    if(text.includes('requested')) return text.replace('requested', 'đã yêu cầu mượn');
    if(text.includes('borrowed')) return text.replace('borrowed', 'đang mượn');
    if(text.includes('returned')) return text.replace('returned', 'đã trả');
    if(text.includes('overdue')) return text.replace('is overdue on', 'bị quá hạn cuốn');
    return text;
};

onMounted(fetchData);
</script>

<style scoped>
.absolute-full { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.bg-gradient-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.bg-gradient-blue { background: linear-gradient(135deg, #2AFADF 0%, #4C83FF 100%); }
.bg-gradient-orange { background: linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%); }
.bg-gradient-red { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); }
.bg-gradient-green { background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%); } 

.backdrop-blur { backdrop-filter: blur(10px); }
.decor-circle { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1; }
.hover-row:hover td { background-color: rgba(255,255,255,0.05); }
</style>