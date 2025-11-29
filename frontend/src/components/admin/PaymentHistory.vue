<template>
  <div class="payment-history-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="green-accent-3" class="mr-2">mdi-finance</v-icon>
             Transaction History
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Monitor financial inflows and payment status</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Search transactions..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 250px;"
             @input="debouncedSearch"
           ></v-text-field>
           
           <div style="width: 180px;">
             <v-select
              v-model="filterStatus"
              :items="paymentStatuses"
              label="Status"
              variant="solo-filled"
              density="compact"
              bg-color="rgba(255,255,255,0.05)"
              hide-details
              clearable
              class="rounded-lg"
              @update:model-value="loadPayments({ page: 1 })"
            ></v-select>
           </div>
        </div>
      </div>

      <v-row class="mb-4">
         <v-col cols="12" sm="4">
            <v-card class="bg-gradient-green rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-80 text-uppercase">Total Transactions</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ totalPayments }}</div>
                  <v-icon size="large" color="white" class="opacity-50">mdi-receipt-text-outline</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="4">
            <v-card class="bg-gradient-blue rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-80 text-uppercase">Revenue (Current Page)</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ formatCurrency(currentPageRevenue) }}</div>
                  <v-icon size="large" color="white" class="opacity-50">mdi-cash-plus</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="4">
            <v-card class="bg-gradient-dark rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-80 text-uppercase">Success Rate</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ successRate }}%</div>
                  <v-progress-circular :model-value="successRate" color="white" size="40" width="4" class="opacity-80"></v-progress-circular>
               </div>
            </v-card>
         </v-col>
      </v-row>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent" elevation="0">
         <v-data-table-server
            :headers="headers"
            :items="payments"
            :items-length="totalPayments"
            :loading="loading"
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            @update:options="loadPayments"
            class="bg-transparent text-white custom-table flex-grow-1"
            density="comfortable"
            hover
         >
            <template v-slot:item.userId="{ item }">
               <div class="d-flex align-center py-2">
                 <v-avatar color="blue-grey-darken-3" size="36" class="mr-3 font-weight-bold border">
                   <span class="text-white">{{ item.userId?.username?.charAt(0).toUpperCase() || '?' }}</span>
                 </v-avatar>
                 <div>
                   <div class="font-weight-bold text-body-2">{{ item.userId?.username || 'Guest' }}</div>
                   <div class="text-caption text-grey">{{ item.userId?.email }}</div>
                 </div>
               </div>
            </template>

            <template v-slot:item.billingDetails="{ item }">
                <div v-if="item.billingDetails && item.billingDetails.name">
                    <div class="text-body-2 font-weight-medium">{{ item.billingDetails.name }}</div>
                    <div class="text-caption text-blue-lighten-4 d-flex align-center">
                        <v-icon size="x-small" start class="mr-1">mdi-phone</v-icon>{{ item.billingDetails.phone }}
                    </div>
                </div>
                <span v-else class="text-grey font-italic text-caption">No billing info</span>
            </template>

            <template v-slot:item.amount="{ item }">
                <span class="text-body-1 font-weight-black text-green-accent-3">{{ formatCurrency(item.amount) }}</span>
            </template>

            <template v-slot:item.paymentType="{ item }">
                <div class="d-flex align-center">
                    <v-icon v-if="item.paymentMethod === 'credit_card'" color="blue-lighten-2" class="mr-2">mdi-credit-card-outline</v-icon>
                    <v-icon v-else-if="item.paymentMethod === 'e-wallet'" color="purple-lighten-2" class="mr-2">mdi-wallet-outline</v-icon>
                    <v-icon v-else color="grey" class="mr-2">mdi-cash</v-icon>
                    <span class="text-capitalize text-body-2">{{ item.paymentMethod?.replace('_', ' ') || item.paymentType }}</span>
                </div>
            </template>

            <template v-slot:item.paidAt="{ item }">
                <div v-if="item.paidAt">
                    <div class="font-weight-medium text-body-2">{{ formatDate(item.paidAt) }}</div>
                    <div class="text-caption text-grey">{{ formatTime(item.paidAt) }}</div>
                </div>
                <span v-else class="text-grey font-italic text-caption">-</span>
            </template>

            <template v-slot:item.status="{ item }">
                <v-chip 
                  :color="getPaymentStatusColor(item.status)" 
                  size="small" 
                  variant="tonal"
                  class="text-uppercase font-weight-bold px-3"
                  label
                >
                  <v-icon start size="small" v-if="item.status === 'completed'">mdi-check-circle</v-icon>
                  <v-icon start size="small" v-else-if="item.status === 'failed'">mdi-alert-circle</v-icon>
                  <v-icon start size="small" v-else>mdi-clock-outline</v-icon>
                  {{ item.status }}
                </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-btn icon variant="text" color="grey-lighten-1" size="small" title="View Receipt">
                    <v-icon>mdi-file-document-outline</v-icon>
                </v-btn>
            </template>

            <template v-slot:no-data>
                <div class="text-center py-8">
                   <v-icon size="64" color="grey-darken-2">mdi-cash-remove</v-icon>
                   <div class="text-grey mt-2">No transaction history found.</div>
                </div>
            </template>
         </v-data-table-server>
      </v-card>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn icon="mdi-close" variant="text" size="small" @click="snackbar.show = false"></v-btn>
        </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
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

const currentPageRevenue = computed(() => {
    return payments.value
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
});

const successRate = computed(() => {
    if (payments.value.length === 0) return 0;
    const successCount = payments.value.filter(p => p.status === 'completed').length;
    return Math.round((successCount / payments.value.length) * 100);
});

const headers = [
    { title: 'User Account', key: 'userId', align: 'start', width: '20%' },
    { title: 'Billing Info', key: 'billingDetails', width: '20%' },
    { title: 'Amount', key: 'amount', align: 'end', width: '15%' },
    { title: 'Method', key: 'paymentType', align: 'start', width: '15%' },
    { title: 'Date', key: 'paidAt', width: '15%' },
    { title: 'Status', key: 'status', align: 'center', width: '10%' },
    { title: '', key: 'actions', sortable: false, align: 'end', width: '5%' },
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
            search: search.value, 
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
.bg-gradient-green { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
.bg-gradient-blue { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); }
.bg-gradient-dark { background: linear-gradient(135deg, #334155 0%, #475569 100%); }

.gap-3 { gap: 12px; }

:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { 
    color: #94a3b8 !important; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    font-weight: 700;
    letter-spacing: 0.5px;
}
:deep(.custom-table td) { 
    border-bottom: 1px solid rgba(255,255,255,0.08) !important; 
    padding-top: 16px !important;
    padding-bottom: 16px !important;
}
:deep(.custom-table tbody tr:hover) { 
    background-color: rgba(255,255,255,0.03) !important; 
}
</style>