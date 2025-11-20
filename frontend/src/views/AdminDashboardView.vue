<template>
  <v-container fluid class="admin-container pa-0 fill-height align-start">
    <div class="w-100 pa-6">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold text-white">
          <v-icon start color="primary">mdi-shield-crown</v-icon> Admin Dashboard
        </h1>
      </div>

      <v-card color="#1e293b" class="rounded-lg mb-6 elevation-4 border-opacity-12">
        <v-tabs v-model="activeTab" bg-color="transparent" color="primary" align-tabs="start">
          <v-tab value="loans" class="text-capitalize">Loan Management</v-tab>
          <v-tab value="books" class="text-capitalize">Book Management Center</v-tab> 
          <v-tab value="users" class="text-capitalize">User Management</v-tab>
          <v-tab value="payments" class="text-capitalize">Payment History</v-tab>
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
import LoanManagement from '../components/admin/LoanManagement.vue';
import PaymentHistory from '../components/admin/PaymentHistory.vue';

// Không cần import Category và Publisher ở đây nữa

const activeTab = ref('loans');
</script>

<style scoped>
.admin-container {
  background-color: #0f172a; /* Màu nền tối */
  min-height: 100vh;
}
</style>