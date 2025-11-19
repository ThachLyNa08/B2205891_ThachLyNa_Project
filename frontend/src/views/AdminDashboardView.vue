<template>
  <v-container fluid class="admin-container pa-0 fill-height align-start">
    <div class="w-100 pa-6">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold text-white">
          <v-icon start color="primary">mdi-shield-crown</v-icon> Admin Dashboard
        </h1>
        </div>

      <v-card color="#1e293b" class="rounded-lg mb-6 elevation-4 border-opacity-12">
        <v-tabs v-model="activeTab" bg-color="transparent" color="primary" align-tabs="start" show-arrows>
          <v-tab value="loans" class="text-capitalize">Loan Management</v-tab> <v-tab value="books" class="text-capitalize">Book Management</v-tab>
          <v-tab value="users" class="text-capitalize">Users</v-tab>
          <v-tab value="categories" class="text-capitalize">Categories</v-tab>
          <v-tab value="publishers" class="text-capitalize">Publishers</v-tab>
          <v-tab value="payments" class="text-capitalize">Payments</v-tab>
        </v-tabs>
      </v-card>

      <v-window v-model="activeTab" class="bg-transparent">
        <v-window-item value="loans">
          <LoanManagement />
        </v-window-item>
        <v-window-item value="books">
          <BookManagement />
        </v-window-item>
        <v-window-item value="users">
          <UserManagement />
        </v-window-item>
        <v-window-item value="categories">
          <CategoryManagement />
        </v-window-item>
        <v-window-item value="publishers">
          <PublisherManagement />
        </v-window-item>
        <v-window-item value="payments">
          <PaymentHistory />
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
// Import các component con
import UserManagement from '../components/admin/UserManagement.vue';
import BookManagement from '../components/admin/BookManagement.vue';
import CategoryManagement from '../components/admin/CategoryManagement.vue';
import PublisherManagement from '../components/admin/PublisherManagement.vue';
import LoanManagement from '../components/admin/LoanManagement.vue';
import PaymentHistory from '../components/admin/PaymentHistory.vue';

const activeTab = ref('loans'); // Mặc định vào Loans để giống hình
</script>

<style scoped>
.admin-container {
  background-color: #0f172a; /* Màu nền xanh đen đậm (Dark Slate) */
  min-height: 100vh;
}

/* Tùy chỉnh thanh cuộn cho đẹp trên nền tối */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a; 
}
::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}
</style>