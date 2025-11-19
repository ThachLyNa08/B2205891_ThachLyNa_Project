<!-- frontend/src/components/admin/PaymentHistory.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5">Payment History</v-card-title>
        <v-card-text>
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="search"
                        label="Search by User/Loan ID"
                        prepend-inner-icon="mdi-magnify"
                        clearable
                        @input="debouncedSearch"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                    <v-select
                        v-model="filterStatus"
                        :items="paymentStatuses"
                        label="Filter by Status"
                        clearable
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
                class="elevation-1"
            >
                <template v-slot:item.userId="{ item }">
                    {{ item.userId?.username || 'N/A' }}
                </template>
                <template v-slot:item.loanId="{ item }">
                    <router-link :to="`/books/${item.loanId?.bookId?._id}`" class="text-primary text-decoration-none" v-if="item.loanId?.bookId?._id">
                        {{ item.loanId?.bookId?.tenSach || 'N/A' }}
                    </router-link>
                    <span v-else>N/A</span>
                </template>
                <template v-slot:item.amount="{ item }">
                    {{ formatCurrency(item.amount) }}
                </template>
                <template v-slot:item.paymentDate="{ item }">
                    {{ formatDate(item.paymentDate) }}
                </template>
                <template v-slot:item.status="{ item }">
                    <v-chip :color="getPaymentStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
                </template>
                <template v-slot:no-data>
                    <v-alert type="info">No payments found.</v-alert>
                </template>
            </v-data-table-server>
        </v-card-text>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="3000"
        >
            {{ snackbar.message }}
            <template v-slot:actions>
                <v-btn text @click="snackbar.show = false">Close</v-btn>
            </template>
        </v-snackbar>
    </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../../services/api.service';
import debounce from 'lodash.debounce';

const payments = ref([]);
const loading = ref(true);
const totalPayments = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref(''); // TODO: implement backend search for payments by user/loan
const filterStatus = ref(null);
const paymentStatuses = ['pending', 'completed', 'failed'];

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const headers = [
    { title: 'User', key: 'userId' },
    { title: 'Loan Ref', key: 'loanId' },
    { title: 'Amount', key: 'amount' },
    { title: 'Method', key: 'paymentMethod' },
    { title: 'Date', key: 'paymentDate' },
    { title: 'Status', key: 'status' },
    { title: 'Description', key: 'description' },
];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'info';
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
            // search: search.value, // Pass search query if backend supports it
        };
        Object.keys(params).forEach(key => params[key] === null || params[key] === '' || params[key] === undefined && delete params[key]);

        const response = await api.get('/payments', { params });
        payments.value = response.data.data;
        totalPayments.value = response.data.total;
        loading.value = false;
    } catch (error) {
        console.error('Error loading payments:', error);
        snackbar.value = { show: true, message: 'Failed to load payments.', color: 'error' };
        loading.value = false;
    }
}, 300);

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    loadPayments();
}, 500);

onMounted(() => {
    loadPayments({});
});

watch(filterStatus, () => {
    currentPage.value = 1;
    loadPayments({});
});
</script>