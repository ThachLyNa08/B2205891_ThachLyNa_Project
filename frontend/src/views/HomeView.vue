<!-- frontend/src/views/HomeView.vue -->
<template>
  <v-container fluid class="home-hero d-flex align-center justify-center text-center">
    <div>
      <h1 class="text-h2 font-weight-bold mb-4 text-white">Find Your Next Adventure</h1>
      <p class="text-h5 text-white mb-8">Discover and borrow books from our vast collection.</p>
      <v-btn color="primary" large to="/books">Explore Catalog</v-btn>
    </div>
  </v-container>

  <v-container class="mt-8">
    <h2 class="text-h4 text-center mb-6">Trending Books</h2>
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="book in trendingBooks" :key="book._id">
        <v-card class="book-card" :to="`/books/${book._id}`">
          <v-img :src="book.coverUrl || 'https://via.placeholder.com/150'" height="200px" cover></v-img>
          <v-card-title>{{ book.tenSach }}</v-card-title>
          <v-card-subtitle>{{ book.tacGia.join(', ') }}</v-card-subtitle>
          <v-card-text>
            <v-chip color="secondary" small class="mr-2">{{ book.categories[0]?.tenTheLoai || 'Uncategorized' }}</v-chip>
            <v-chip color="success" small v-if="book.availableCopies > 0">Available</v-chip>
            <v-chip color="error" small v-else>Out of Stock</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const trendingBooks = ref([]);

onMounted(async () => {
  try {
    // Gọi API để lấy một vài sách để hiển thị trên trang chủ
    const response = await api.get('/books?limit=4'); // Lấy 4 sách bất kỳ
    trendingBooks.value = response.data.data;
  } catch (error) {
    console.error('Error fetching trending books:', error);
  }
});
</script>

<style scoped>
.home-hero {
  background: url('https://picsum.photos/id/10/1920/1080') center center / cover no-repeat;
  height: 50vh; /* Chiều cao của banner */
  position: relative;
  color: white;
}
.home-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Lớp phủ đen trong suốt */
}
.home-hero > div {
  z-index: 1; /* Đảm bảo nội dung nằm trên lớp phủ */
}
.book-card {
  height: 100%; /* Đảm bảo các card có chiều cao bằng nhau */
}
</style>