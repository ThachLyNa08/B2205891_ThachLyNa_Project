<template>
    <v-card class="pa-4">
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
                <div class="font-weight-bold">{{ item.userId?.username || 'Guest' }}</div>
                <div class="text-caption text-grey">{{ item.userId?.email }}</div>
            </template>

            <template v-slot:item.billingDetails="{ item }">
                <div v-if="item.billingDetails?.name">
                    <div class="text-subtitle-2">{{ item.billingDetails.name }}</div>
                    <div class="text-caption text-primary">
                        <v-icon size="x-small" start>mdi-phone</v-icon>{{ item.billingDetails.phone }}
                    </div>
                </div>
                <span v-else class="text-grey font-italic">N/A</span>
            </template>

            <template v-slot:item.amount="{ item }">
                <span class="font-weight-bold text-success">{{ formatCurrency(item.amount) }}</span>
            </template>
            
            <template v-slot:item.paidAt="{ item }">
                <div v-if="item.paidAt">
                    <div class="font-weight-medium">{{ formatDate(item.paidAt) }}</div>
                    <div class="text-caption text-grey">{{ formatTime(item.paidAt) }}</div>
                </div>
                <span v-else class="text-grey">-</span>
            </template>

            <template v-slot:item.paymentDate="{ item }">
                {{ formatDate(item.createdAt || item.paymentDate) }}
            </template>

            <template v-slot:item.status="{ item }">
                <v-chip :color="getPaymentStatusColor(item.status)" size="small" label class="text-uppercase font-weight-bold">{{ item.status }}</v-chip>
            </template>
            
        </v-data-table-server>
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
    { title: 'Billing Info', key: 'billingDetails' },
    { title: 'Amount', key: 'amount' },
    { title: 'Method', key: 'paymentType' }, // Sửa key cho khớp model mới
    { title: 'Created Date', key: 'paymentDate' }, // Giữ cột cũ
    { title: 'Payment Date', key: 'paidAt' }, // THÊM CỘT MỚI
    { title: 'Status', key: 'status' },
    // { title: 'Description', key: 'description' },
];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

// Hàm mới để hiện giờ
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
        case 'pending': return 'warning'; // Đổi sang warning cho nổi
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