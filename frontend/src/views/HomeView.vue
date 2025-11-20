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
              v-model="searchQuery" 
              type="text" 
              class="search-input ml-2 flex-grow-1" 
              placeholder="Search for books, authors, genres..." 
              @keyup.enter="handleSearch"
            />
            <v-btn color="primary" icon="mdi-microphone" variant="flat" class="rounded-circle"></v-btn>
          </v-card>
        </div>
      </v-img>
    </section>

    <v-container class="category-container mt-n10 position-relative" style="z-index: 10;">
      <v-row justify="center">
        <v-card class="py-4 px-6 rounded-xl elevation-6 bg-white w-100" max-width="900">
          <div class="d-flex flex-wrap justify-space-around gap-4">
            <v-btn
              v-for="action in quickActions" 
              :key="action.text"
              :color="action.color"
              variant="flat"
              class="text-capitalize font-weight-bold px-6"
              rounded="pill"
              :prepend-icon="action.icon"
              @click="handleActionClick(action)"
            >
              {{ action.text }}
            </v-btn>
          </div>
        </v-card>
      </v-row>
    </v-container>

    <v-container class="mt-12 mb-6">
      <div class="d-flex justify-space-between align-end mb-6 border-b pb-2">
        <div>
          <h2 class="text-h5 font-weight-bold text-primary">🔥 Trending Now</h2>
          <div class="text-caption text-medium-emphasis">Most borrowed books this week</div>
        </div>
        <v-btn color="primary" variant="text" size="small" append-icon="mdi-arrow-right" to="/books">View All</v-btn>
      </div>

      <v-row v-if="loading">
        <v-col cols="6" sm="4" md="3" lg="2" v-for="n in 6" :key="n">
           <v-skeleton-loader type="image, article"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row dense v-else>
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
                  <template v-slot:error>
                      <v-img src="https://via.placeholder.com/300x450?text=No+Cover" cover class="fill-height"></v-img>
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

    <v-container class="mb-12">
      <div class="d-flex justify-space-between align-end mb-6 border-b pb-2">
        <div>
          <h2 class="text-h5 font-weight-bold text-secondary">✨ Recommended For You</h2>
          <div class="text-caption text-medium-emphasis">Books based on your interests</div>
        </div>
        <v-btn color="secondary" variant="text" size="small" append-icon="mdi-arrow-right" to="/books">Explore More</v-btn>
      </div>

      <v-row dense v-if="!loading">
        <v-col cols="6" sm="4" md="3" lg="2" v-for="book in recommendedBooks" :key="book._id">
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
                   <template v-slot:error>
                      <v-img src="https://via.placeholder.com/300x450?text=No+Cover" cover class="fill-height"></v-img>
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

    <!-- <div class="ai-chat-container">
      <v-btn icon size="x-large" class="ai-chat-btn elevation-10" @click="openChat">
        <v-icon color="white" size="32">mdi-robot-excited-outline</v-icon>
      </v-btn>
      <div class="ai-chat-label">AI CHAT</div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api.service';

const router = useRouter();
const searchQuery = ref('');
const trendingBooks = ref([]);
const recommendedBooks = ref([]);
const loading = ref(true);

const quickActions = [
  { text: 'Sách Đã Mượn', icon: 'mdi-book-arrow-left', color: '#4CAF50', route: '/my-loans' }, 
  { text: 'Sách Yêu Thích', icon: 'mdi-heart', color: '#E91E63', route: '/favorites' },       
  { text: 'Đang Đọc', icon: 'mdi-book-open-page-variant', color: '#2196F3', route: '/reading' }, 
  { text: 'Lịch Sử', icon: 'mdi-history', color: '#FF9800', route: '/history' },              
];

const handleActionClick = (action) => {
  if (action.route) {
    // Kiểm tra đơn giản nếu route có trong cấu hình
    const resolved = router.resolve(action.route);
    if (resolved.matched.length > 0 && resolved.name !== 'NotFound') {
       router.push(action.route);
    } else {
       alert(`Chức năng "${action.text}" đang được phát triển!`);
    }
  }
};

// const openChat = () => {
//   alert("Tính năng Chat AI đang phát triển!");
// };

const handleSearch = () => {
    if (searchQuery.value) {
        router.push({ name: 'books', query: { search: searchQuery.value } });
    }
};

const getCategoryColor = (catName) => {
    if (!catName) return 'grey';
    const lower = catName.toLowerCase();
    if (lower.includes('fantasy')) return '#7E57C2';
    if (lower.includes('sci')) return '#1E88E5';
    if (lower.includes('history')) return '#FB8C00';
    if (lower.includes('mystery')) return '#00897B';
    return 'primary';
};

onMounted(async () => {
  loading.value = true;
  try {
    // Gọi API song song
    const [trendingRes, recommendRes] = await Promise.all([
        api.get('/books?limit=6&page=1'),
        api.get('/books?limit=12&page=2')
    ]);
    
    trendingBooks.value = trendingRes.data.data;
    recommendedBooks.value = recommendRes.data.data;
  } catch (error) {
    console.error('Error fetching books:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* CSS Giữ nguyên như cũ */
.home-wrapper { width: 100%; background-color: #f4f6f8; min-height: 100vh; }
.hero-section { height: 450px; width: 100%; overflow: hidden; }
.hero-bg { width: 100%; height: 100%; }
.hero-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); width: 100%; }
.search-input { border: none; outline: none; font-size: 1rem; color: #333; }

.gap-4 { gap: 16px; }

.book-card { border: 1px solid rgba(0,0,0,0.05); transition: all 0.3s ease; }
.book-card:hover { transform: translateY(-5px); }
.img-wrapper { width: 100%; padding-top: 150%; position: relative; }
.book-cover { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.bg-primary-opacity { background-color: rgba(25, 118, 210, 0.85); display: flex; align-items: center; justify-content: center; }

.ai-chat-container { position: fixed; bottom: 40px; right: 40px; z-index: 9999; display: flex; flexDirection: column; alignItems: center; cursor: pointer; transition: transform 0.3s ease; }
.ai-chat-container:hover { transform: translateY(-5px); }
.ai-chat-btn { background: linear-gradient(135deg, #00C6FF, #0072FF) !important; width: 65px !important; height: 65px !important; border: 3px solid white; }
.ai-chat-label { margin-top: 8px; font-weight: 900; color: #333; background-color: rgba(255, 255, 255, 0.9); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
</style>