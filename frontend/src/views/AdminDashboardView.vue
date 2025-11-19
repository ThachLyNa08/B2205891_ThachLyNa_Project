<template>
  <v-container fluid class="bg-grey-darken-4 fill-height align-start pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold text-white">Admin Dashboard</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" class="px-6">Create New Loan</v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="#1E1E1E" class="pa-4 rounded-xl" elevation="0" border>
          <div class="text-subtitle-2 text-grey mb-1">Total Loans</div>
          <div class="d-flex justify-space-between align-end">
            <div class="text-h3 font-weight-bold text-white">1,245</div>
            <v-sparkline
              :value="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]"
              color="primary"
              line-width="2"
              padding="16"
              height="50"
              width="100"
              auto-draw
            ></v-sparkline>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="#1E1E1E" class="pa-4 rounded-xl" elevation="0" border>
          <div class="text-subtitle-2 text-grey mb-1">Borrowed Books</div>
          <div class="d-flex justify-space-between align-end">
            <div class="text-h3 font-weight-bold text-white">850</div>
            <v-icon color="success" size="48">mdi-book-check</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="#1E1E1E" class="pa-4 rounded-xl" elevation="0" border>
          <div class="text-subtitle-2 text-grey mb-1">Overdue Books</div>
          <div class="d-flex justify-space-between align-end">
            <div class="text-h3 font-weight-bold text-white">125</div>
             <v-progress-linear model-value="70" color="error" height="8" rounded></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" class="mt-4">
        <v-card color="#1E1E1E" class="rounded-xl" elevation="0" border>
          <v-tabs v-model="activeTab" bg-color="transparent" color="primary" align-tabs="start">
            <v-tab value="users">Users</v-tab>
            <v-tab value="books">Books</v-tab>
            <v-tab value="loans">Loans Management</v-tab>
            <v-tab value="payments">Payments</v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="pa-4">
             <v-window-item value="users"><UserManagement /></v-window-item>
             <v-window-item value="books"><BookManagement /></v-window-item>
             <v-window-item value="loans"><LoanManagement /></v-window-item>
             <v-window-item value="payments"><PaymentHistory /></v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
// Import các component quản lý cũ
import UserManagement from '../components/admin/UserManagement.vue';
import BookManagement from '../components/admin/BookManagement.vue';
import LoanManagement from '../components/admin/LoanManagement.vue';
import PaymentHistory from '../components/admin/PaymentHistory.vue';

const activeTab = ref('loans');
</script>

<style scoped>
/* Custom dark styling adjustments */
.v-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>