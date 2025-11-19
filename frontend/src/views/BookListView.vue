<!-- frontend/src/views/BookListView.vue -->
<template>
  <v-container>
    <h1 class="text-h4 mb-6">Our Book Catalog</h1>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Search Books"
          prepend-inner-icon="mdi-magnify"
          clearable
          @input="debouncedSearch"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          item-title="tenTheLoai"
          item-value="_id"
          label="Filter by Category"
          clearable
          @update:model-value="fetchBooks"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filterAuthor"
          label="Filter by Author"
          clearable
          @input="debouncedFilter"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="3">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="books.length > 0">
      <v-col cols="12" sm="6" md="3" v-for="book in books" :key="book._id">
        <v-card class="book-card" :to="`/books/${book._id}`" elevation="2">
          <v-img :src="book.coverUrl || 'https://via.placeholder.com/200x250?text=No+Cover'" height="250px" cover></v-img>
          <v-card-title class="text-subtitle-1 font-weight-bold">{{ book.tenSach }}</v-card-title>
          <v-card-subtitle>{{ book.tacGia.join(', ') }}</v-card-subtitle>
          <v-card-text>
            <v-chip
              v-for="cat in book.categories"
              :key="cat._id"
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 mb-1"
            >
              {{ cat.tenTheLoai }}
            </v-chip>
            <v-chip :color="book.availableCopies > 0 ? 'success' : 'error'" variant="outlined" size="small" class="mt-2">
              {{ book.availableCopies > 0 ? `Available (${book.availableCopies})` : 'Out of Stock' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert type="info" prominent text>No books found matching your criteria.</v-alert>
      </v-col>
    </v-row>

    <v-pagination
      v-if="pages > 1"
      v-model="currentPage"
      :length="pages"
      @update:model-value="fetchBooks"
      class="mt-8"
    ></v-pagination>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api.service';
import debounce from 'lodash.debounce'; // npm install lodash.debounce

const books = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref(null);
const filterAuthor = ref('');
const currentPage = ref(1);
const pages = ref(1);
const limit = 8; // Số sách trên mỗi trang

// Hàm fetch books
const fetchBooks = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: limit,
      search: searchQuery.value,
      category: selectedCategory.value,
      author: filterAuthor.value,
    };
    // Loại bỏ các tham số null/undefined
    Object.keys(params).forEach(key => params[key] === null || params[key] === '' || params[key] === undefined && delete params[key]);

    const response = await api.get('/books', { params });
    books.value = response.data.data;
    pages.value = response.data.pages;
    loading.value = false;
  } catch (error) {
    console.error('Error fetching books:', error);
    loading.value = false;
  }
};

// Hàm fetch categories
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = [{ _id: null, tenTheLoai: 'All Categories' }, ...response.data]; // Thêm tùy chọn "All"
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Debounced search input
const debouncedSearch = debounce(() => {
  currentPage.value = 1; // Reset về trang 1 khi tìm kiếm
  fetchBooks();
}, 500); // Đợi 500ms sau khi người dùng ngừng gõ

const debouncedFilter = debounce(() => {
    currentPage.value = 1;
    fetchBooks();
}, 500);


onMounted(() => {
  fetchCategories();
  fetchBooks();
});
</script>

<style scoped>
.book-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.book-card .v-img {
  border-bottom: 1px solid #eee;
}
</style>