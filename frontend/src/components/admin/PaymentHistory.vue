<template>
  <div class="payment-history-wrapper">
    <v-card class="pa-4 rounded-lg" color="#1e293b" elevation="0">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h6 font-weight-bold text-white">
            <v-icon start color="success">mdi-cash-multiple</v-icon> Payment History
          </h2>
          <div class="text-caption text-grey">Track all financial transactions</div>
        </div>
        <v-chip color="primary" variant="flat" size="small">
          Total Records: {{ totalPayments }}
        </v-chip>
      </div>

      <v-row class="mb-2">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search user or loan ref..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            bg-color="#0f172a"
            color="white"
            hide-details
            class="rounded-lg"
            @input="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="3">
           <v-select
            v-model="filterStatus"
            :items="paymentStatuses"
            label="Filter Status"
            prepend-inner-icon="mdi-filter-outline"
            variant="outlined"
            density="compact"
            bg-color="#0f172a"
            color="white"
            hide-details
            clearable
            class="rounded-lg"
            @update:model-value="loadPayments({ page: 1 })"
          ></v-select>
        </v-col>
      </v-row>

      <v-data-table-server
        :headers="headers"
        :items="payments"
        :items-length="totalPayments"
        :loading="loading"
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        @update:options="loadPayments"
        class="elevation-1 bg-transparent text-white custom-table"
        hover
      >
        <template v-slot:item.userId="{ item }">
           <div class="d-flex align-center">
             <v-avatar color="primary" size="32" class="mr-2">
               <span class="text-white font-weight-bold">{{ item.userId?.username?.charAt(0).toUpperCase() || '?' }}</span>
             </v-avatar>
             <div>
               <div class="font-weight-bold">{{ item.userId?.username || 'Guest' }}</div>
               <div class="text-caption text-grey">{{ item.userId?.email }}</div>
             </div>
           </div>
        </template>

        <template v-slot:item.billingDetails="{ item }">
            <div v-if="item.billingDetails && item.billingDetails.name">
                <div class="text-subtitle-2 font-weight-bold">{{ item.billingDetails.name }}</div>
                <div class="text-caption text-info">
                    <v-icon size="x-small" start>mdi-phone</v-icon>{{ item.billingDetails.phone }}
                </div>
            </div>
            <span v-else class="text-grey font-italic">N/A</span>
        </template>

        <template v-slot:item.amount="{ item }">
            <span class="text-h6 font-weight-bold text-success">{{ formatCurrency(item.amount) }}</span>
        </template>

        <template v-slot:item.paidAt="{ item }">
            <div v-if="item.paidAt">
                <div class="font-weight-medium">{{ formatDate(item.paidAt) }}</div>
                <div class="text-caption text-grey">{{ formatTime(item.paidAt) }}</div>
            </div>
            <span v-else class="text-grey font-italic">-</span>
        </template>

        <template v-slot:item.paymentType="{ item }">
            <v-chip size="x-small" variant="outlined" class="text-white text-uppercase">
                {{ item.paymentType }}
            </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
            <v-chip 
              :color="getPaymentStatusColor(item.status)" 
              size="small" 
              label 
              class="text-uppercase font-weight-bold"
            >
              <v-icon start size="small" v-if="item.status === 'completed'">mdi-check-circle</v-icon>
              <v-icon start size="small" v-if="item.status === 'failed'">mdi-alert-circle</v-icon>
              {{ item.status }}
            </v-chip>
        </template>

        <template v-slot:no-data>
            <v-alert type="info" variant="tonal" class="mt-2">No transaction history found.</v-alert>
        </template>
      </v-data-table-server>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn text @click="snackbar.show = false">Close</v-btn>
        </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api.service';
import debounce from 'lodash.debounce';

const payments = ref([]);
const loading = ref(true);
const totalPayments = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const filterStatus = ref(null);
const paymentStatuses = ['pending', 'completed', 'failed'];

const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
    { title: 'User Account', key: 'userId', align: 'start' },
    { title: 'Billing Info', key: 'billingDetails' },
    { title: 'Amount', key: 'amount', align: 'end' },
    { title: 'Type', key: 'paymentType', align: 'center' },
    { title: 'Paid Date', key: 'paidAt' },
    { title: 'Status', key: 'status', align: 'end' },
];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'failed': return 'error';
        default: return 'grey';
    }
};

const loadPayments = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            status: filterStatus.value,
            search: search.value, // Backend cần hỗ trợ search nếu muốn dùng
        };
        Object.keys(params).forEach(key => !params[key] && delete params[key]);

        const response = await api.get('/payments', { params });
        payments.value = response.data.data;
        totalPayments.value = response.data.total;
    } catch (error) {
        console.error('Error loading payments:', error);
        snackbar.value = { show: true, message: 'Failed to load payments.', color: 'error' };
    } finally {
        loading.value = false;
    }
}, 300);

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    loadPayments();
}, 500);

onMounted(() => { loadPayments({}); });

watch(filterStatus, () => {
    currentPage.value = 1;
    loadPayments({});
});
</script>

<style scoped>
/* Style tối giống các trang quản lý khác */
.custom-table { color: white !important; }
:deep(.custom-table th) { 
    color: #94a3b8 !important; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    font-weight: 600;
}
:deep(.custom-table td) { 
    border-bottom: 1px solid #334155 !important; 
    padding-top: 12px !important;
    padding-bottom: 12px !important;
}
:deep(.custom-table tbody tr:hover) { 
    background-color: #1e293b !important; 
}
</style>