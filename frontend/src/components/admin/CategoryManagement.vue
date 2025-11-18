<!-- frontend/src/components/admin/CategoryManagement.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5 d-flex justify-space-between align-center">
            Category Management
            <v-btn color="primary" @click="openCreateDialog">
                <v-icon left>mdi-plus</v-icon> Create New Category
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-text-field
                v-model="search"
                label="Search Categories"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
                clearable
                class="mb-4"
            ></v-text-field>

            <v-data-table-server
                :headers="headers"
                :items="categories"
                :items-length="totalCategories"
                :loading="loading"
                v-model:items-per-page="itemsPerPage"
                v-model:page="currentPage"
                @update:options="loadCategories"
                class="elevation-1"
            >
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editCategory(item)">mdi-pencil</v-icon>
                    <v-icon small @click="confirmDeleteCategory(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:no-data>
                    <v-alert type="info">No categories found.</v-alert>
                </template>
            </v-data-table-server>
        </v-card-text>

        <!-- Create/Edit Category Dialog -->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="categoryForm" @submit.prevent="saveCategory">
                        <v-text-field v-model="editedItem.tenTheLoai" label="Category Name" :rules="[v => !!v || 'Category name is required']"></v-text-field>
                        <v-textarea v-model="editedItem.moTa" label="Description"></v-textarea>

                        <v-alert v-if="dialogError" type="error" class="mb-4">{{ dialogError }}</v-alert>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="saveCategory">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete the category "{{ categoryToDelete?.tenTheLoai }}"?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
                    <v-btn color="error darken-1" text @click="deleteCategory">Delete</v-btn>
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

const categories = ref([]);
const loading = ref(true);
const totalCategories = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref(''); // TODO: backend search for categories

const dialog = ref(false);
const deleteDialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = {
    tenTheLoai: '',
    moTa: ''
};
const categoryToDelete = ref(null);
const dialogError = ref(null);
const categoryForm = ref(null);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const headers = [
    { title: 'Category Name', key: 'tenTheLoai' },
    { title: 'Description', key: 'moTa' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Create New Category' : 'Edit Category'));

const loadCategories = debounce(async ({ page, itemsPerPage: perPage }) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value, // Pass search query
        };
        const response = await api.get('/categories', { params }); // Assuming backend supports search/pagination
        categories.value = response.data;
        totalCategories.value = response.data.length; // Adjust if backend returns total
        loading.value = false;
    } catch (error) {
        console.error('Error loading categories:', error);
        snackbar.value = { show: true, message: 'Failed to load categories.', color: 'error' };
        loading.value = false;
    }
}, 300);

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => categoryForm.value?.resetValidation());
};

const editCategory = (item) => {
    editedIndex.value = categories.value.indexOf(item);
    editedItem.value = { ...item };
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => categoryForm.value?.resetValidation());
};

const closeDialog = () => {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem };
        editedIndex.value = -1;
        dialogError.value = null;
    });
};

const saveCategory = async () => {
    const { valid } = await categoryForm.value.validate();
    if (!valid) return;

    dialogError.value = null;
    try {
        if (editedIndex.value > -1) { // Edit existing category
            const categoryId = editedItem.value._id;
            const payload = { ...editedItem.value };
            delete payload._id;
            const response = await api.put(`/categories/${categoryId}`, payload);
            Object.assign(categories.value[editedIndex.value], response.data.category);
            snackbar.value = { show: true, message: 'Category updated successfully.', color: 'success' };
        } else { // Create new category
            const response = await api.post('/categories', editedItem.value);
            categories.value.push(response.data.category);
            totalCategories.value++;
            snackbar.value = { show: true, message: 'Category created successfully.', color: 'success' };
        }
        closeDialog();
        loadCategories({}); // Refresh list
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save category.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error saving category:', error);
    }
};

const confirmDeleteCategory = (item) => {
    categoryToDelete.value = item;
    deleteDialog.value = true;
};

const closeDeleteDialog = () => {
    deleteDialog.value = false;
    categoryToDelete.value = null;
};

const deleteCategory = async () => {
    try {
        await api.delete(`/categories/${categoryToDelete.value._id}`);
        categories.value = categories.value.filter(c => c._id !== categoryToDelete.value._id);
        totalCategories.value--;
        snackbar.value = { show: true, message: 'Category deleted successfully.', color: 'success' };
        closeDeleteDialog();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to delete category.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error deleting category:', error);
        closeDeleteDialog();
    }
};

watch(search, (newVal) => {
    currentPage.value = 1;
    loadCategories({});
});

loadCategories({});
</script>