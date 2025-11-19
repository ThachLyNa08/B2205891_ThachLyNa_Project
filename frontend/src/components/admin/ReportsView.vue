<!-- frontend/src/components/admin/ReportsView.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5">Reports and Statistics</v-card-title>
        <v-card-text>
            <p>This section will contain various reports and statistics about the library system.</p>
            <v-list>
                <v-list-item>Total Books: <strong>{{ totalBooks }}</strong></v-list-item>
                <v-list-item>Total Users: <strong>{{ totalUsers }}</strong></v-list-item>
                <v-list-item>Active Loans: <strong>{{ activeLoans }}</strong></v-list-item>
                <v-list-item>Overdue Loans: <strong>{{ overdueLoans }}</strong></v-list-item>
            </v-list>

            <h3 class="text-h6 mt-4">Books borrowed per month (Graph Placeholder)</h3>
            <v-sheet
                class="d-flex align-center justify-center flex-wrap text-center mx-auto px-2"
                elevation="4"
                height="200"
                rounded
            >
                <p class="text-h6 text-grey">Chart will be displayed here</p>
            </v-sheet>
            
            <h3 class="text-h6 mt-4">Most popular books (List Placeholder)</h3>
            <v-list density="compact">
                <v-list-item v-for="i in 3" :key="i">
                    <v-list-item-title>Book Title {{ i }}</v-list-item-title>
                    <v-list-item-subtitle>Borrowed <strong>{{ 10 - i }}</strong> times</v-list-item-subtitle>
                </v-list-item>
            </v-list>

            <v-btn color="secondary" class="mt-4" @click="generateReport">
                <v-icon left>mdi-file-chart</v-icon> Generate Full Report (PDF/Excel)
            </v-btn>

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
import { ref, onMounted } from 'vue';
import api from '../services/api.service';

const totalBooks = ref(0);
const totalUsers = ref(0);
const activeLoans = ref(0);
const overdueLoans = ref(0);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const fetchStats = async () => {
    try {
        // TODO: Cần tạo các API backend cho thống kê
        // Ví dụ:
        // const bookStats = await api.get('/reports/book-count');
        // totalBooks.value = bookStats.data.count;
        // const userStats = await api.get('/reports/user-count');
        // totalUsers.value = userStats.data.count;
        // const loanStats = await api.get('/reports/loan-stats'); // active, overdue
        // activeLoans.value = loanStats.data.active;
        // overdueLoans.value = loanStats.data.overdue;

        // Mock data for now
        totalBooks.value = 150;
        totalUsers.value = 85;
        activeLoans.value = 30;
        overdueLoans.value = 5;

    } catch (error) {
        console.error('Error')};
};
</script setup>