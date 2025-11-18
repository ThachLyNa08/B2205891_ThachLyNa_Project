<!-- frontend/src/components/admin/BookManagement.vue -->
<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 d-flex justify-space-between align-center">
      Book Management
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon> Add New Book
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Search Books"
        prepend-inner-icon="mdi-magnify"
        single-line
        hide-details
        clearable
        class="mb-4"
      ></v-text-field>

      <v-data-table-server
        :headers="headers"
        :items="books"
        :items-length="totalBooks"
        :loading="loading"
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        @update:options="loadBooks"
        class="elevation-1"
      >
        <template v-slot:item.coverUrl="{ item }">
          <v-avatar size="40" rounded="0" class="my-2">
            <v-img :src="item.coverUrl || 'https://via.placeholder.com/40'"></v-img>
          </v-avatar>
        </template>
        <template v-slot:item.maNXB="{ item }">
          {{ item.maNXB?.tenNXB || 'N/A' }}
        </template>
        <template v-slot:item.categories="{ item }">
          <v-chip
            v-for="cat in item.categories"
            :key="cat._id"
            color="primary"
            variant="flat"
            size="x-small"
            class="mr-1 my-1"
          >
            {{ cat.tenTheLoai }}
          </v-chip>
        </template>
        <template v-slot:item.availableCopies="{ item }">
          <v-chip :color="item.availableCopies > 0 ? 'success' : 'error'" size="small">
            {{ item.availableCopies }} / {{ item.soQuyen }}
          </v-chip>
        </template>
        <template v-slot:item.donGia="{ item }">
          {{ formatCurrency(item.donGia) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editBook(item)">mdi-pencil</v-icon>
          <v-icon small @click="confirmDeleteBook(item)">mdi-delete</v-icon>
        </template>
        <template v-slot:no-data>
          <v-alert type="info">No books found.</v-alert>
        </template>
      </v-data-table-server>
    </v-card-text>

    <!-- Create/Edit Book Dialog -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="bookForm" @submit.prevent="saveBook">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.tenSach" label="Book Title" :rules="[v => !!v || 'Title is required']"></v-text-field>
                <v-text-field v-model="editedItem.tacGia[0]" label="Author (Main)" :rules="[v => !!v || 'Author is required']"></v-text-field>
                <v-text-field v-model="editedItem.isbn" label="ISBN" :rules="[v => !!v || 'ISBN is required']"></v-text-field>
                <v-text-field v-model="editedItem.namXuatBan" label="Publication Year" type="number"></v-text-field>
                <v-select
                  v-model="editedItem.maNXB"
                  :items="publishers"
                  item-title="tenNXB"
                  item-value="_id"
                  label="Publisher"
                  :rules="[v => !!v || 'Publisher is required']"
                ></v-select>
                <v-select
                  v-model="editedItem.categories"
                  :items="categories"
                  item-title="tenTheLoai"
                  item-value="_id"
                  label="Categories"
                  multiple
                  chips
                  :rules="[v => v && v.length > 0 || 'At least one category is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="editedItem.moTa" label="Description"></v-textarea>
                <v-text-field v-model="editedItem.donGia" label="Price (for deposit/loss)" type="number" :rules="[v => v >= 0 || 'Price must be non-negative']"></v-text-field>
                <v-text-field v-model="editedItem.soQuyen" label="Total Copies" type="number" :rules="[v => v > 0 || 'Total copies must be at least 1']"></v-text-field>
                <v-text-field v-model="editedItem.coverUrl" label="Cover Image URL"></v-text-field>
                <v-img :src="editedItem.coverUrl || 'https://via.placeholder.com/150'" v-if="editedItem.coverUrl" height="150px" contain class="mt-2"></v-img>
                <!-- TODO: Add file upload for cover image -->
              </v-col>
            </v-row>

            <v-alert v-if="dialogError" type="error" class="mb-4">{{ dialogError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveBook">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete the book "{{ bookToDelete?.tenSach }}"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="error darken-1" text @click="deleteBook">Delete</v-btn>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '../../services/api';
import debounce from 'lodash.debounce';

const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const loading = ref(true);
const totalBooks = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');

const dialog = ref(false);
const deleteDialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
    tacGia: [], // Đảm bảo là mảng
    categories: [] // Đảm bảo là mảng
});
const defaultItem = {
    tenSach: '',
    moTa: '',
    donGia: 0,
    soQuyen: 1,
    namXuatBan: null,
    maNXB: null,
    tacGia: [''],
    categories: [],
    isbn: '',
    coverUrl: '',
};
const bookToDelete = ref(null);
const dialogError = ref(null);
const bookForm = ref(null);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});

const headers = [
    { title: 'Cover', key: 'coverUrl', sortable: false },
    { title: 'Title', key: 'tenSach' },
    { title: 'Author', key: 'tacGia' },
    { title: 'ISBN', key: 'isbn' },
    { title: 'Publisher', key: 'maNXB' },
    { title: 'Categories', key: 'categories' },
    { title: 'Copies', key: 'availableCopies' },
    { title: 'Price', key: 'donGia' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Book' : 'Edit Book'));

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const loadBooks = debounce(async ({ page, itemsPerPage: perPage }) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value,
        };
        const response = await api.get('/books', { params });
        books.value = response.data.data;
        totalBooks.value = response.data.total;
        loading.value = false;
    } catch (error) {
        console.error('Error loading books:', error);
        snackbar.value = { show: true, message: 'Failed to load books.', color: 'error' };
        loading.value = false;
    }
}, 300);

const fetchCategoriesAndPublishers = async () => {
    try {
        const [catRes, pubRes] = await Promise.all([
            api.get('/categories'),
            api.get('/publishers')
        ]);
        categories.value = catRes.data;
        publishers.value = pubRes.data;
    } catch (error) {
        console.error('Error fetching categories or publishers:', error);
        snackbar.value = { show: true, message: 'Failed to load categories/publishers.', color: 'error' };
    }
};

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem, tacGia: [''], categories: [] };
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => bookForm.value?.resetValidation());
};

const editBook = (item) => {
    editedIndex.value = books.value.indexOf(item);
    // Tạo bản sao sâu và chuẩn hóa dữ liệu cho form
    const itemCopy = JSON.parse(JSON.stringify(item));
    editedItem.value = {
        ...itemCopy,
        maNXB: itemCopy.maNXB?._id, // Lấy chỉ ID
        categories: itemCopy.categories.map(cat => cat._id), // Lấy mảng ID
        tacGia: itemCopy.tacGia && itemCopy.tacGia.length > 0 ? itemCopy.tacGia : [''] // Đảm bảo có ít nhất 1 tác giả để bind vào textfield
    };
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => bookForm.value?.resetValidation());
};

const closeDialog = () => {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem, tacGia: [''], categories: [] };
        editedIndex.value = -1;
        dialogError.value = null;
    });
};

const saveBook = async () => {
    const { valid } = await bookForm.value.validate();
    if (!valid) return;

    dialogError.value = null;
    try {
        const bookPayload = { ...editedItem.value };
        // Đảm bảo tacGia là mảng, lọc bỏ chuỗi rỗng
        bookPayload.tacGia = bookPayload.tacGia.filter(author => author.trim() !== '');
        if (editedIndex.value > -1) { // Edit existing book
            const bookId = editedItem.value._id;
            delete bookPayload._id; // Không gửi _id trong body
            const response = await api.put(`/books/${bookId}`, bookPayload);
            // Cập nhật lại item trong bảng bằng data từ response để hiển thị đúng
            Object.assign(books.value[editedIndex.value], response.data.book);
            snackbar.value = { show: true, message: 'Book updated successfully.', color: 'success' };
        } else { // Create new book
            const response = await api.post('/books', bookPayload);
            books.value.unshift(response.data.book); // Thêm vào đầu bảng
            totalBooks.value++;
            snackbar.value = { show: true, message: 'Book added successfully.', color: 'success' };
        }
        closeDialog();
        loadBooks({}); // Refresh list to reflect changes with full populated data
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save book.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error saving book:', error);
    }
};

const confirmDeleteBook = (item) => {
    bookToDelete.value = item;
    deleteDialog.value = true;
};

const closeDeleteDialog = () => {
    deleteDialog.value = false;
    bookToDelete.value = null;
};

const deleteBook = async () => {
    try {
        await api.delete(`/books/${bookToDelete.value._id}`);
        books.value = books.value.filter(b => b._id !== bookToDelete.value._id);
        totalBooks.value--;
        snackbar.value = { show: true, message: 'Book deleted successfully.', color: 'success' };
        closeDeleteDialog();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to delete book.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error deleting book:', error);
        closeDeleteDialog();
    }
};

watch(search, (newVal) => {
    currentPage.value = 1;
    loadBooks({});
});

onMounted(() => {
    fetchCategoriesAndPublishers();
    loadBooks({});
});
</script>