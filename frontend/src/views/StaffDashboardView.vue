<!-- frontend/src/views/StaffDashboardView.vue -->
<template>
  <v-container>
    <h1 class="text-h4 mb-6">Staff Dashboard</h1>
    <v-alert type="info" class="mb-4">
      As a staff member, you can manage books, loans, categories, and publishers.
    </v-alert>

    <v-tabs v-model="activeTab" grow class="mb-6">
      <v-tab value="books">Book Management</v-tab>
      <v-tab value="categories">Category Management</v-tab>
      <v-tab value="publishers">Publisher Management</v-tab>
      <v-tab value="loans">Loan Management</v-tab>
      <v-tab value="payments">Payment History</v-tab>
      <!-- Staff thường không quản lý users hoặc reports chi tiết như admin -->
    </v-tabs>

    <v-window v-model="activeTab">
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
    </v-window>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import BookManagement from '../components/admin/BookManagement.vue';
import CategoryManagement from '../components/admin/CategoryManagement.vue';
import PublisherManagement from '../components/admin/PublisherManagement.vue';
import LoanManagement from '../components/admin/LoanManagement.vue';
import PaymentHistory from '../components/admin/PaymentHistory.vue';

const activeTab = ref('books');
</script>

