<!-- frontend/src/components/admin/PublisherManagement.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5 d-flex justify-space-between align-center">
            Publisher Management
            <v-btn color="primary" @click="openCreateDialog">
                <v-icon left>mdi-plus</v-icon> Create New Publisher
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-text-field
                v-model="search"
                label="Search Publishers"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
                clearable
                class="mb-4"
            ></v-text-field>

            <v-data-table-server
                :headers="headers"
                :items="publishers"
                :items-length="totalPublishers"
                :loading="loading"
                v-model:items-per-page="itemsPerPage"
                v-model:page="currentPage"
                @update:options="loadPublishers"
                class="elevation-1"
            >
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editPublisher(item)">mdi-pencil</v-icon>
                    <v-icon small @click="confirmDeletePublisher(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:no-data>
                    <v-alert type="info">No publishers found.</v-alert>
                </template>
            </v-data-table-server>
        </v-card-text>

        <!-- Create/Edit Publisher Dialog -->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="publisherForm" @submit.prevent="savePublisher">
                        <v-text-field v-model="editedItem.tenNXB" label="Publisher Name" :rules="[v => !!v || 'Publisher name is required']"></v-text-field>
                        <v-text-field v-model="editedItem.diaChi" label="Address"></v-text-field>
                        <v-text-field v-model="editedItem.dienThoai" label="Phone"></v-text-field>
                        <v-text-field v-model="editedItem.email" label="Email" type="email" :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email must be valid']"></v-text-field>

                        <v-alert v-if="dialogError" type="error" class="mb-4">{{ dialogError }}</v-alert>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="savePublisher">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete the publisher "{{ publisherToDelete?.tenNXB }}"?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
                    <v-btn color="error darken-1" text @click="deletePublisher">Delete</v-btn>
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
import { ref, computed, nextTick, watch } from 'vue';
import api from '../../services/api';
import debounce from 'lodash.debounce';

const publishers = ref([]);
const loading = ref(true);
const totalPublishers = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref(''); // TODO: backend search for publishers

const dialog = ref(false);
const deleteDialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = {
    tenNXB: '',
    diaChi: '',
    dienThoai: '',
    email: ''
};
const publisherToDelete = ref(null);
const dialogError = ref(null);
const publisherForm = ref(null);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const headers = [
    { title: 'Publisher Name', key: 'tenNXB' },
    { title: 'Address', key: 'diaChi' },
    { title: 'Phone', key: 'dienThoai' },
    { title: 'Email', key: 'email' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Create New Publisher' : 'Edit Publisher'));

const loadPublishers = debounce(async ({ page, itemsPerPage: perPage }) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value, // Pass search query
        };
        const response = await api.get('/publishers', { params }); // Assuming backend supports search/pagination
        publishers.value = response.data;
        totalPublishers.value = response.data.length; // Adjust if backend returns total
        loading.value = false;
    } catch (error) {
        console.error('Error loading publishers:', error);
        snackbar.value = { show: true, message: 'Failed to load publishers.', color: 'error' };
        loading.value = false;
    }
}, 300);

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => publisherForm.value?.resetValidation());
};

const editPublisher = (item) => {
    editedIndex.value = publishers.value.indexOf(item);
    editedItem.value = { ...item };
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => publisherForm.value?.resetValidation());
};

const closeDialog = () => {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem };
        editedIndex.value = -1;
        dialogError.value = null;
    });
};

const savePublisher = async () => {
    const { valid } = await publisherForm.value.validate();
    if (!valid) return;

    dialogError.value = null;
    try {
        if (editedIndex.value > -1) { // Edit existing publisher
            const publisherId = editedItem.value._id;
            const payload = { ...editedItem.value };
            delete payload._id;
            const response = await api.put(`/publishers/${publisherId}`, payload);
            Object.assign(publishers.value[editedIndex.value], response.data.publisher);
            snackbar.value = { show: true, message: 'Publisher updated successfully.', color: 'success' };
        } else { // Create new publisher
            const response = await api.post('/publishers', editedItem.value);
            publishers.value.push(response.data.publisher);
            totalPublishers.value++;
            snackbar.value = { show: true, message: 'Publisher created successfully.', color: 'success' };
        }
        closeDialog();
        loadPublishers({}); // Refresh list
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save publisher.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error saving publisher:', error);
    }
};

const confirmDeletePublisher = (item) => {
    publisherToDelete.value = item;
    deleteDialog.value = true;
};

const closeDeleteDialog = () => {
    deleteDialog.value = false;
    publisherToDelete.value = null;
};

const deletePublisher = async () => {
    try {
        await api.delete(`/publishers/${publisherToDelete.value._id}`);
        publishers.value = publishers.value.filter(p => p._id !== publisherToDelete.value._id);
        totalPublishers.value--;
        snackbar.value = { show: true, message: 'Publisher deleted successfully.', color: 'success' };
        closeDeleteDialog();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to delete publisher.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error deleting publisher:', error);
        closeDeleteDialog();
    }
};

watch(search, (newVal) => {
    currentPage.value = 1;
    loadPublishers({});
});

loadPublishers({});
</script>