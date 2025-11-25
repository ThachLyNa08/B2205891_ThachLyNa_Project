<template>
  <div class="w-100 fill-height">
    <!-- 1. HEADER & WELCOME -->
    <div class="mb-6 d-flex justify-space-between align-center">
      <div>
        <h1 class="text-h4 font-weight-bold text-white d-flex align-center">
          <v-icon start color="primary" class="mr-3">mdi-view-dashboard</v-icon>
          Dashboard Overview
        </h1>
        <div class="text-subtitle-1 text-grey">Management System & Statistics</div>
      </div>
      <!-- Nút hành động nhanh -->
      <div class="d-none d-md-flex gap-2">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="mr-2">New Book</v-btn>
        <v-btn color="success" variant="tonal" prepend-icon="mdi-account-plus">Add User</v-btn>
      </div>
    </div>

    <!-- 2. STATS CARDS (THẺ THỐNG KÊ) -->
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="(stat, index) in stats" :key="index">
        <v-card color="#1e293b" class="pa-4 rounded-lg elevation-4 border-opacity-12" hover>
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-grey text-caption font-weight-bold text-uppercase mb-1">{{ stat.title }}</div>
              <div class="text-h4 font-weight-bold text-white">{{ stat.value }}</div>
            </div>
            <v-sheet :color="stat.color" class="pa-3 rounded-lg" bg-color="transparent">
              <v-icon :icon="stat.icon" size="x-large" color="white"></v-icon>
            </v-sheet>
          </div>
          <v-divider class="my-3 border-opacity-12"></v-divider>
          <div class="d-flex align-center text-caption">
            <v-icon :color="stat.isUp ? 'success' : 'error'" size="small" class="mr-1">
              {{ stat.isUp ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
            </v-icon>
            <span :class="stat.isUp ? 'text-green' : 'text-red'" class="font-weight-bold mr-1">
              {{ stat.percent }}%
            </span>
            <span class="text-grey">since last month</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 3. MAIN CONTENT ROW -->
    <v-row class="mt-2">
      <!-- Cột Trái: Top Sách (Chiếm 8 phần) -->
      <v-col cols="12" md="8">
        <v-card color="#1e293b" class="rounded-lg elevation-4 h-100">
          <v-card-title class="text-white d-flex align-center py-4 px-6">
            <v-icon start color="warning">mdi-star-circle-outline</v-icon>
            Trending Books
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" color="primary">View All</v-btn>
          </v-card-title>
          
          <v-table class="bg-transparent text-white">
            <thead>
              <tr>
                <th class="text-left text-grey">Book Title</th>
                <th class="text-left text-grey">Author</th>
                <th class="text-center text-grey">Borrowed</th>
                <th class="text-center text-grey">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in topBooks" :key="book.id">
                <td class="font-weight-medium">{{ book.title }}</td>
                <td class="text-grey-lighten-1">{{ book.author }}</td>
                <td class="text-center">{{ book.borrowedCount }} times</td>
                <td class="text-center">
                  <v-chip :color="book.stock > 0 ? 'success' : 'error'" size="small" variant="flat">
                    {{ book.stock > 0 ? 'Available' : 'Out of Stock' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- Cột Phải: Hoạt động gần đây (Chiếm 4 phần) -->
      <v-col cols="12" md="4">
        <v-card color="#1e293b" class="rounded-lg elevation-4 h-100">
          <v-card-title class="text-white py-4 px-6">
            <v-icon start color="info">mdi-clock-outline</v-icon> Recent Activity
          </v-card-title>
          
          <div class="px-4 pb-4">
             <v-timeline density="compact" align="start" truncate-line="both">
                <v-timeline-item 
                  v-for="(activity, i) in activities" 
                  :key="i" 
                  :dot-color="activity.color" 
                  size="x-small"
                >
                  <div class="mb-1">
                    <div class="font-weight-bold text-white">{{ activity.user }}</div>
                    <div class="text-caption text-grey">{{ activity.action }}</div>
                  </div>
                  <div class="text-caption text-grey-darken-1">{{ activity.time }}</div>
                </v-timeline-item>
             </v-timeline>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 1. Dữ liệu giả lập cho Cards Thống kê
const stats = ref([
  { title: 'Total Books', value: '1,250', icon: 'mdi-book-open-page-variant', color: 'primary', percent: 12.5, isUp: true },
  { title: 'Active Users', value: '340', icon: 'mdi-account-group', color: 'success', percent: 8.2, isUp: true },
  { title: 'Books On Loan', value: '45', icon: 'mdi-hand-coin', color: 'warning', percent: 2.1, isUp: false },
  { title: 'Overdue', value: '12', icon: 'mdi-alert-circle', color: 'error', percent: 5.4, isUp: true }, // isUp true ở đây là xấu, nhưng demo hiển thị số thôi :D
]);

// 2. Dữ liệu giả lập cho Bảng Top Books
const topBooks = ref([
  { id: 1, title: 'Harry Potter & The Stone', author: 'J.K. Rowling', borrowedCount: 128, stock: 5 },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', borrowedCount: 95, stock: 0 },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', borrowedCount: 82, stock: 12 },
  { id: 4, title: 'Doraemon Vol 1', author: 'Fujiko F. Fujio', borrowedCount: 76, stock: 3 },
  { id: 5, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', borrowedCount: 50, stock: 1 },
]);

// 3. Dữ liệu giả lập cho Timeline hoạt động
const activities = ref([
  { user: 'Nguyen Van A', action: 'Borrowed "Clean Code"', time: '10 mins ago', color: 'blue' },
  { user: 'Tran Thi B', action: 'Returned "Doraemon"', time: '45 mins ago', color: 'green' },
  { user: 'Le Van C', action: 'Registered new account', time: '2 hours ago', color: 'purple' },
  { user: 'Admin System', action: 'Added 5 new books', time: '5 hours ago', color: 'orange' },
]);
</script>

<style scoped>
/* Tùy chỉnh CSS nếu cần, hiện tại dùng class utility của Vuetify là đủ đẹp */
</style>