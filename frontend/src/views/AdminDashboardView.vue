<!-- frontend/src/views/AdminDashboardView.vue -->
<template>
  <v-container>
    <h1 class="text-h4 mb-6">Admin Dashboard</h1>

    <v-tabs v-model="activeTab" grow class="mb-6">
      <v-tab value="users">User Management</v-tab>
      <v-tab value="books">Book Management</v-tab>
      <v-tab value="categories">Category Management</v-tab>
      <v-tab value="publishers">Publisher Management</v-tab>
      <v-tab value="loans">Loan Management</v-tab>
      <v-tab value="payments">Payment History</v-tab>
      <v-tab value="reports">Reports</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="users">
        <UserManagement />
      </v-window-item>
      <v-window-item value="books">
        <BookManagement />
      </v-window-item>
      <v-window-item value="categories">
        <CategoryManagement />
      </v-window-item>
      <v-window-item value="publishers">
        <PublisherManagement />
      </v-window-item>
      <v-window-item value="loans">
        <LoanManagement />
      </v-window-item>
      <v-window-item value="payments">
        <PaymentHistory />
      </v-window-item>
      <v-window-item value="reports">
        <ReportsView />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import UserManagement from '../components/admin/UserManagement.vue';
import BookManagement from '../components/admin/BookManagement.vue';
import CategoryManagement from '../components/admin/CategoryManagement.vue';
import PublisherManagement from '../components/admin/PublisherManagement.vue';
import LoanManagement from '../components/admin/LoanManagement.vue';
import PaymentHistory from '../components/admin/PaymentHistory.vue';
import ReportsView from '../components/admin/ReportsView.vue';

const activeTab = ref('users'); // Tab mặc định khi vào dashboard
</script>

<style scoped>
/* Your styles here */
</style>