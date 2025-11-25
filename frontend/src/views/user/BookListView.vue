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
          item-value="tenTheLoai" 
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
          <v-img :src="book.coverUrl || 'https://via.placeholder.com/200x250?text=No+Cover'" height="250px" cover>
             <template v-slot:error>
                <v-img src="https://via.placeholder.com/200x250?text=No+Cover" cover class="fill-height"></v-img>
             </template>
          </v-img>
          
          <v-card-title class="text-subtitle-1 font-weight-bold text-truncate">{{ book.tenSach }}</v-card-title>
          <v-card-subtitle class="text-truncate">{{ book.tacGia.join(', ') }}</v-card-subtitle>
          
          <v-card-text class="d-flex flex-column justify-space-between flex-grow-1 pt-2 pb-3">
             <div class="d-flex flex-wrap mb-2">
                <v-chip
                  v-for="cat in book.categories"
                  :key="cat._id"
                  :color="getCategoryColor(cat.tenTheLoai)"
                  variant="flat"
                  size="small"
                  class="mr-2 mb-1"
                >
                  {{ cat.tenTheLoai }}
                </v-chip>
             </div>
             <v-chip 
                :color="book.availableCopies > 0 ? 'success' : 'error'" 
                variant="outlined" 
                size="small" 
                class="align-self-start"
            >
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
import { ref, onMounted } from 'vue';
import api from '@/services/api.service';
import debounce from 'lodash.debounce';

const books = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref(null);
const filterAuthor = ref('');
const currentPage = ref(1);
const pages = ref(1);
const limit = 8;

// --- HÀM MỚI: Gán màu sắc cho từng thể loại ---
const getCategoryColor = (categoryName) => {
  if (!categoryName) return 'grey'; // Màu mặc định
  const normalizedName = categoryName.toLowerCase().trim();
  switch (normalizedName) {
    case 'thiếu nhi': return '#FFC107'; // Vàng
    case 'văn học': return '#2196F3'; // Xanh dương
    case 'comic-manga': return '#9C27B0'; // Tím
    case 'tâm lí - kỹ năng sống': return '#4CAF50'; // Xanh lá
    case 'kinh tế': return '#FF5722'; // Cam
    case 'ngoại văn - từ điển': return '#607D8B'; // Xám xanh
    case 'lịch sử': return '#795548'; // Nâu
    case 'khoa học': return '#00BCD4'; // Xanh ngọc
    default: return 'primary'; // Màu mặc định Vuetify
  }
};


const fetchBooks = async () => {
  loading.value = true;
  try {
    const catFilter = selectedCategory.value === 'All Categories' ? null : selectedCategory.value;

    const params = {
      page: currentPage.value,
      limit: limit,
      search: searchQuery.value,
      category: catFilter, 
      author: filterAuthor.value,
    };
    
    Object.keys(params).forEach(key => (params[key] === null || params[key] === '' || params[key] === undefined) && delete params[key]);

    const response = await api.get('/books', { params });
    books.value = response.data.data;
    pages.value = response.data.pages;
  } catch (error) {
    console.error('Error fetching books:', error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = [{ _id: 'all', tenTheLoai: 'All Categories' }, ...response.data];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  fetchBooks();
}, 500);

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
  /* Đảm bảo nội dung căn theo chiều dọc */
}
.book-card .v-img {
  border-bottom: 1px solid #eee;
}

/* Sửa khoảng cách và căn chỉnh cho chip trong v-card-text */
.v-card-text {
  display: flex;
  flex-direction: column; /* Đảm bảo các chip và text được xếp chồng */
  justify-content: space-between;
  flex-grow: 1; /* Cho phép card-text mở rộng để chiếm không gian */
  padding-top: 8px; /* Giảm padding trên để gọn hơn */
  padding-bottom: 12px; /* Tăng padding dưới */
}

.v-card-text .v-chip {
    margin-right: 8px; /* Khoảng cách giữa các chip thể loại */
    margin-bottom: 4px; /* Khoảng cách dưới nếu chip xuống dòng */
    height: 24px; /* Chiều cao cố định cho chip thể loại */
    font-size: 0.75rem; /* Kích thước chữ nhỏ hơn */
}

/* Căn chỉnh chip "Available/Out of Stock" */
.v-card-text .align-self-start {
    align-self: flex-start; /* Căn trái cho chip này */
    margin-top: 4px; /* Khoảng cách từ các chip thể loại */
}
</style>