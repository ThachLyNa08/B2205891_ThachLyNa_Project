<!-- frontend/src/components/admin/LoanManagement.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5">Loan Management</v-card-title>
        <v-card-text>
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="search"
                        label="Search by Book/User"
                        prepend-inner-icon="mdi-magnify"
                        clearable
                        @input="debouncedSearch"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                    <v-select
                        v-model="filterStatus"
                        :items="loanStatuses"
                        label="Filter by Status"
                        clearable
                        @update:model-value="loadLoans({ page: 1 })"
                    ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                    <v-checkbox
                        v-model="filterOverdue"
                        label="Show Overdue Only"
                        @update:model-value="loadLoans({ page: 1 })"
                    ></v-checkbox>
                </v-col>
            </v-row>

            <v-data-table-server
                :headers="headers"
                :items="loans"
                :items-length="totalLoans"
                :loading="loading"
                v-model:items-per-page="itemsPerPage"
                v-model:page="currentPage"
                @update:options="loadLoans"
                class="elevation-1"
            >
                <template v-slot:item.bookId="{ item }">
                    <router-link :to="`/books/${item.bookId?._id}`" class="text-primary text-decoration-none">
                        {{ item.bookId?.tenSach || 'N/A' }}
                    </router-link>
                </template>
                <template v-slot:item.userId="{ item }">
                    {{ item.userId?.username || 'N/A' }} ({{ item.userId?.hoLot }} {{ item.userId?.ten }})
                </template>
                <template v-slot:item.ngayMuon="{ item }">
                    {{ formatDate(item.ngayMuon) }}
                </template>
                <template v-slot:item.ngayHenTra="{ item }">
                    {{ formatDate(item.ngayHenTra) }}
                </template>
                <template v-slot:item.ngayTraThucTe="{ item }">
                    {{ item.ngayTraThucTe ? formatDate(item.ngayTraThucTe) : 'N/A' }}
                </template>
                <template v-slot:item.status="{ item }">
                    <v-chip :color="getLoanStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
                </template>
                <template v-slot:item.phatTien="{ item }">
                    {{ formatCurrency(item.phatTien) }}
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                        small
                        class="mr-2"
                        @click="confirmLoan(item)"
                        v-if="item.status === 'pending'"
                        color="success"
                        title="Confirm Loan"
                    >
                        mdi-check
                    </v-icon>
                    <v-icon
                        small
                        class="mr-2"
                        @click="processReturn(item)"
                        v-if="item.status === 'borrowed' || item.status === 'overdue'"
                        color="warning"
                        title="Process Return"
                    >
                        mdi-book-arrow-left
                    </v-icon>
                    <v-icon small @click="confirmDeleteLoan(item)" v-if="item.status === 'returned' || item.status === 'cancelled'" color="error" title="Delete Loan">
                        mdi-delete
                    </v-icon>
                </template>
                <template v-slot:no-data>
                    <v-alert type="info">No loans found.</v-alert>
                </template>
            </v-data-table-server>
        </v-card-text>

        <!-- Confirm Loan Dialog (if using pending status) -->
        <v-dialog v-model="confirmDialog.show" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirm Loan</v-card-title>
                <v-card-text>Are you sure you want to confirm the loan for "{{ confirmDialog.loan?.bookId?.tenSach }}" by "{{ confirmDialog.loan?.userId?.username }}"?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="confirmDialog.show = false">Cancel</v-btn>
                    <v-btn color="success darken-1" text @click="executeConfirmLoan">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Process Return Dialog -->
        <v-dialog v-model="returnDialog.show" max-width="600px">
            <v-card>
                <v-card-title class="text-h5">Process Book Return</v-card-title>
                <v-card-text>
                    <p>Book: <strong>{{ returnDialog.loan?.bookId?.tenSach }}</strong></p>
                    <p>Borrower: <strong>{{ returnDialog.loan?.userId?.username }}</strong></p>
                    <p>Due Date: <strong>{{ formatDate(returnDialog.loan?.ngayHenTra) }}</strong></p>
                    <p v-if="returnDialog.loan?.ngayHenTra && new Date() > new Date(returnDialog.loan.ngayHenTra)">
                        <v-alert type="warning" dense outlined class="mt-2">
                            This loan is overdue! Fine will be calculated.
                        </v-alert>
                    </p>
                    <v-alert v-if="returnError" type="error" class="mb-4">{{ returnError }}</v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="returnDialog.show = false">Cancel</v-btn>
                    <v-btn color="warning darken-1" text @click="executeProcessReturn">Process Return</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog.show" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this loan record (Book: {{ deleteDialog.loan?.bookId?.tenSach }})? This action cannot be undone.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="deleteDialog.show = false">Cancel</v-btn>
                    <v-btn color="error darken-1" text @click="executeDeleteLoan">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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
import api from '../../services/api';
import debounce from 'lodash.debounce';

const loans = ref([]);
const loading = ref(true);
const totalLoans = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const filterStatus = ref(null);
const filterOverdue = ref(false);
const loanStatuses = ['pending', 'borrowed', 'returned', 'overdue', 'cancelled'];

const confirmDialog = ref({ show: false, loan: null });
const returnDialog = ref({ show: false, loan: null });
const deleteDialog = ref({ show: false, loan: null });
const returnError = ref(null);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const headers = [
    { title: 'Book Title', key: 'bookId' },
    { title: 'Borrower', key: 'userId' },
    { title: 'Borrow Date', key: 'ngayMuon' },
    { title: 'Due Date', key: 'ngayHenTra' },
    { title: 'Return Date', key: 'ngayTraThucTe' },
    { title: 'Status', key: 'status' },
    { title: 'Fine', key: 'phatTien' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getLoanStatusColor = (status) => {
    switch (status) {
        case 'borrowed': return 'info';
        case 'returned': return 'success';
        case 'overdue': return 'error';
        case 'pending': return 'warning';
        case 'cancelled': return 'secondary';
        default: return 'grey';
    }
};

const loadLoans = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            status: filterStatus.value,
            overdue: filterOverdue.value,
            search: search.value, // Backend search by book title/user username
        };
        Object.keys(params).forEach(key => params[key] === null || params[key] === '' || params[key] === undefined && delete params[key]);

        const response = await api.get('/loans', { params });
        loans.value = response.data.data;
        totalLoans.value = response.data.total;
        loading.value = false;
    } catch (error) {
        console.error('Error loading loans:', error);
        snackbar.value = { show: true, message: 'Failed to load loans.', color: 'error' };
        loading.value = false;
    }
}, 300);

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  loadLoans();
}, 500);

const confirmLoan = (loan) => {
    confirmDialog.value.loan = loan;
    confirmDialog.value.show = true;
};

const executeConfirmLoan = async () => {
    try {
        await api.put(`/loans/${confirmDialog.value.loan._id}/confirm`);
        snackbar.value = { show: true, message: 'Loan confirmed successfully.', color: 'success' };
        loadLoans({}); // Refresh list
    } catch (error) {
        snackbar.value = { show: true, message: error.response?.data?.message || 'Failed to confirm loan.', color: 'error' };
        console.error('Error confirming loan:', error);
    } finally {
        confirmDialog.value.show = false;
        confirmDialog.value.loan = null;
    }
};

const processReturn = (loan) => {
    returnDialog.value.loan = loan;
    returnDialog.value.show = true;
    returnError.value = null;
};

const executeProcessReturn = async () => {
    try {
        const response = await api.put(`/loans/${returnDialog.value.loan._id}/return`);
        snackbar.value = { show: true, message: 'Book returned successfully.' + (response.data.loan.phatTien > 0 ? ` Fine: ${formatCurrency(response.data.loan.phatTien)}` : ''), color: 'success' };
        loadLoans({}); // Refresh list
    } catch (error) {
        returnError.value = error.response?.data?.message || 'Failed to process return.';
        snackbar.value = { show: true, message: returnError.value, color: 'error' };
        console.error('Error processing return:', error);
    } finally {
        returnDialog.value.show = false;
        returnDialog.value.loan = null;
    }
};

const confirmDeleteLoan = (loan) => {
    deleteDialog.value.loan = loan;
    deleteDialog.value.show = true;
};

const executeDeleteLoan = async () => {
    try {
        await api.delete(`/loans/${deleteDialog.value.loan._id}`);
        snackbar.value = { show: true, message: 'Loan record deleted successfully.', color: 'success' };
        loadLoans({}); // Refresh list
    } catch (error) {
        snackbar.value = { show: true, message: error.response?.data?.message || 'Failed to delete loan record.', color: 'error' };
        console.error('Error deleting loan:', error);
    } finally {
        deleteDialog.value.show = false;
        deleteDialog.value.loan = null;
    }
};


onMounted(() => {
    loadLoans({});
});

watch([filterStatus, filterOverdue], () => {
    currentPage.value = 1;
    loadLoans({});
});
</script>