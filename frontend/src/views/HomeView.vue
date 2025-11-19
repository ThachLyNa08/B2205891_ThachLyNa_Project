<template>
  <div class="home-wrapper">
    <section class="hero-section position-relative d-flex align-center justify-center">
      <v-img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop"
        cover
        class="hero-bg"
      >
        <div class="hero-overlay fill-height d-flex flex-column align-center justify-center text-center px-4">
          
          <h1 class="text-h3 text-md-h2 font-weight-bold text-white mb-2 text-uppercase" style="letter-spacing: 2px;">
            Find Your Next Adventure
          </h1>
          <p class="text-h6 text-grey-lighten-2 mb-8" style="max-width: 600px;">
            Explore thousands of books, audiobooks, and magazines from our vast collection.
          </p>

          <v-card width="100%" max-width="700" class="rounded-pill pa-2 d-flex align-center elevation-12">
            <v-icon icon="mdi-magnify" class="ml-3 text-grey"></v-icon>
            <input 
              v-model="search" 
              type="text" 
              class="search-input ml-2 flex-grow-1" 
              placeholder="Search for books, authors, genres..." 
            />
            <v-btn color="primary" icon="mdi-microphone" variant="flat" class="rounded-circle"></v-btn>
          </v-card>

        </div>
      </v-img>
    </section>

    <v-container class="category-container mt-n8 position-relative" style="z-index: 10;">
      <v-row justify="center">
        <v-sheet class="d-flex flex-wrap justify-center gap-4 py-4 px-8 rounded-xl elevation-6 bg-white">
          <v-chip 
            v-for="cat in categories" 
            :key="cat.text"
            :color="cat.color"
            size="x-large"
            variant="flat"
            class="px-6 font-weight-bold text-white cursor-pointer category-chip"
            elevation="2"
          >
            {{ cat.text }}
          </v-chip>
        </v-sheet>
      </v-row>
    </v-container>

    <v-container class="my-12 py-6">
      <div class="d-flex justify-space-between align-end mb-8 border-b pb-2">
        <div>
          <h2 class="text-h5 font-weight-bold text-primary">Trending Now</h2>
          <div class="text-caption text-medium-emphasis">Most borrowed books this week</div>
        </div>
        <v-btn color="primary" variant="text" size="small" append-icon="mdi-arrow-right">View All</v-btn>
      </div>

      <v-row dense>
        <v-col cols="6" sm="4" md="3" lg="2" v-for="book in trendingBooks" :key="book._id">
          <v-hover v-slot="{ isHovering, props }">
            <v-card 
              v-bind="props"
              :elevation="isHovering ? 8 : 1"
              class="book-card rounded-lg h-100 d-flex flex-column transition-swing bg-white"
              :to="`/books/${book._id}`"
              density="compact"
            >
              <div class="img-wrapper position-relative rounded-t-lg overflow-hidden">
                <v-img
                  :src="book.coverUrl || 'https://via.placeholder.com/300x450'"
                  aspect-ratio="2/3"
                  cover
                  class="align-end book-cover"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                      <v-progress-circular indeterminate color="grey-lighten-2" size="20"></v-progress-circular>
                    </div>
                  </template>
                  
                  <v-expand-transition>
                    <div v-if="isHovering" class="d-flex transition-fast-in-fast-out bg-primary-opacity text-white" style="height: 100%; position: absolute; top: 0; width: 100%;">
                       <v-btn size="small" variant="flat" color="white" class="ma-auto text-primary font-weight-bold text-capitalize">
                         + Borrow
                       </v-btn>
                    </div>
                  </v-expand-transition>
                </v-img>
              </div>

              <v-card-item class="pa-3 flex-grow-1">
                <v-card-title class="font-weight-bold text-body-2 text-truncate mb-1" :title="book.tenSach">
                  {{ book.tenSach }}
                </v-card-title>
                <v-card-subtitle class="text-caption text-truncate">
                  {{ book.tacGia.join(', ') }}
                </v-card-subtitle>
              </v-card-item>
              
              <v-card-actions class="px-3 pb-3 pt-0">
                <v-chip 
                  size="x-small" 
                  :color="getCategoryColor(book.categories[0]?.tenTheLoai)" 
                  variant="flat" 
                  class="font-weight-bold text-white"
                  style="height: 20px;"
                >
                  {{ book.categories[0]?.tenTheLoai || 'General' }}
                </v-chip>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                  <v-icon size="x-small" color="amber" class="mr-1">mdi-star</v-icon>
                  <span class="text-caption font-weight-bold text-grey-darken-1">4.8</span>
                </div>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <div class="ai-chat-container">
      <v-btn
        icon
        size="x-large"
        class="ai-chat-btn elevation-10"
        @click="openChat"
      >
        <v-icon color="white" size="32">mdi-robot-excited-outline</v-icon>
      </v-btn>
      <div class="ai-chat-label">AI CHAT</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.service';

const search = ref('');
const trendingBooks = ref([]);

// Màu sắc giống thiết kế
const categories = [
  { text: 'Fantasy', color: '#7E57C2' }, // Tím
  { text: 'Mystery', color: '#00897B' }, // Xanh Teal
  { text: 'History', color: '#FB8C00' }, // Cam
  { text: 'Sci-Fi', color: '#1E88E5' },  // Xanh Dương
];

onMounted(async () => {
  try {
    const response = await api.get('/books?limit=4');
    trendingBooks.value = response.data.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    // Mock data nếu API lỗi để test giao diện
    if (trendingBooks.value.length === 0) {
        trendingBooks.value = [
            { _id: 1, tenSach: 'Harry Potter', tacGia: ['J.K. Rowling'], categories: [{tenTheLoai: 'Fantasy'}], coverUrl: 'https://m.media-amazon.com/images/I/81q77Q39nEL._AC_UF1000,1000_QL80_.jpg' },
            { _id: 2, tenSach: 'The Hobbit', tacGia: ['J.R.R. Tolkien'], categories: [{tenTheLoai: 'Adventure'}], coverUrl: 'https://m.media-amazon.com/images/I/71jGIfP8pIL._AC_UF1000,1000_QL80_.jpg' },
            { _id: 3, tenSach: 'Dune', tacGia: ['Frank Herbert'], categories: [{tenTheLoai: 'Sci-Fi'}], coverUrl: 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg' },
            { _id: 4, tenSach: '1984', tacGia: ['George Orwell'], categories: [{tenTheLoai: 'Dystopian'}], coverUrl: 'https://m.media-amazon.com/images/I/71NCJdr1tIL._AC_UF1000,1000_QL80_.jpg' },
        ]
    }
  }
});
const openChat = () => {
  alert("Tính năng Chat AI đang phát triển!");
};
</script>

<style scoped>
.home-wrapper {
  width: 100%;
  background-color: #f4f6f8; /* Màu nền xám rất nhạt cho toàn trang */
  min-height: 100vh;
}

.hero-section {
  height: 550px; /* Chiều cao cố định cho banner */
  width: 100%;
  overflow: hidden;
}

.hero-bg {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
  width: 100%;
}

/* Custom input style để bỏ border mặc định */
.search-input {
  border: none;
  outline: none;
  font-size: 1.1rem;
  color: #333;
}

.category-chip {
  transition: transform 0.2s;
}
.category-chip:hover {
  transform: translateY(-3px);
}

.book-card {
  border: 1px solid rgba(0,0,0,0.05);
}

.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.9;
  position: absolute;
  width: 100%;
}
.ai-chat-container {
  position: fixed;
  bottom: 40px; /* Cách đáy nhiều hơn để không bị footer che */
  right: 40px;  /* Cách phải nhiều hơn để không bị dính lề */
  z-index: 9999; /* Lớp cao nhất để luôn nổi */
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.ai-chat-container:hover {
  transform: translateY(-5px); /* Hiệu ứng bay lên khi di chuột */
}

.ai-chat-btn {
  /* Màu Gradient xanh ngọc - xanh dương giống thiết kế */
  background: linear-gradient(135deg, #00C6FF, #0072FF) !important;
  width: 65px !important;
  height: 65px !important;
  border: 3px solid white; /* Viền trắng tạo độ nổi */
}

.ai-chat-label {
  margin-top: 8px;
  font-weight: 900;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>