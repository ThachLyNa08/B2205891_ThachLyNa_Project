<template>
  <div class="home-wrapper">
    <section class="hero-section position-relative">
      <v-img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop"
        cover class="hero-bg"
      >
        <div class="hero-overlay fill-height d-flex flex-column align-center justify-center text-center px-4">
          <div class="animate-fade-up">
            <h1 class="text-h3 text-md-h2 font-serif text-white mb-2 font-weight-bold text-uppercase ls-2 text-shadow">
              Library Nexus
            </h1>
            <p class="text-h6 text-grey-lighten-3 mb-6 font-weight-light text-shadow-sm" style="max-width: 700px;">
              "Ngày hôm nay đọc một trang sách, ngày mai khác biệt một tư duy."
            </p>
          </div>
          <v-card width="100%" max-width="700" class="glass-search rounded-pill pa-2 d-flex align-center elevation-10 animate-fade-up delay-100">
            <v-icon icon="mdi-magnify" color="white" class="ml-3" size="large"></v-icon>
            <input v-model="searchQuery" type="text" class="search-input ml-3 flex-grow-1 text-white" :placeholder="isListening ? 'Đang nghe...' : 'Search for titles, authors, genres...'" @keyup.enter="handleSearch"/>
            <v-btn icon variant="text" size="small" class="mr-2" :color="isListening ? 'red-accent-2' : 'white'" :class="{ 'listening-pulse': isListening }" @click="startVoiceSearch">
              <v-icon>{{ isListening ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
            </v-btn>
            <v-btn color="white" icon="mdi-arrow-right" variant="flat" class="rounded-circle text-primary font-weight-bold" @click="handleSearch"></v-btn>
          </v-card>
          <div class="mt-4 animate-fade-up delay-200 d-none d-sm-flex align-center gap-2">
            <span class="text-grey-lighten-2 text-caption font-weight-bold mr-2">Popular:</span>
            <v-chip v-for="tag in popularTags" :key="tag" size="small" variant="outlined" color="white" class="glass-chip" @click="searchByTag(tag)">{{ tag }}</v-chip>
          </div>
        </div>
      </v-img>
    </section>

    <v-container class="mt-n16 position-relative" style="z-index: 100;">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="d-flex flex-wrap justify-center gap-6">
            <v-hover v-slot="{ isHovering, props }" v-for="action in quickActions" :key="action.text">
              <v-card v-bind="props" width="200" class="action-card rounded-xl pa-4 text-center cursor-pointer elevation-6 bg-white" :class="{'on-hover': isHovering}" @click="handleActionClick(action)">
                <v-avatar :color="action.bgColor" size="64" class="mb-3"><v-icon :color="action.iconColor" size="32">{{ action.icon }}</v-icon></v-avatar>
                <div class="font-weight-bold text-body-1 text-grey-darken-3">{{ action.text }}</div>
                <div class="text-caption text-grey">{{ action.subtext }}</div>
              </v-card>
            </v-hover>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="mt-12 mb-6">
      <div class="d-flex justify-space-between align-end mb-6 border-b pb-2" style="border-color: #e0e0e0;">
        <div>
          <h2 class="text-h4 font-serif text-primary mb-1 font-weight-bold">TOP THỊNH HÀNH</h2>
          <div class="text-subtitle-1 text-grey-darken-1">Sách được mượn nhiều nhất trong tuần qua</div>
        </div>
        <v-btn color="primary" variant="text" append-icon="mdi-arrow-right" to="/books" class="font-weight-bold">Xem tất cả</v-btn>
      </div>

      <v-row v-if="loading">
        <v-col cols="6" sm="4" md="3" lg="2" v-for="n in 6" :key="n"><v-skeleton-loader type="card" class="rounded-lg"></v-skeleton-loader></v-col>
      </v-row>

      <div v-else class="position-relative book-slider-container">
        <v-slide-group
          show-arrows
          center-active
          class="pa-2"
        >
          <template v-slot:next>
             <v-btn icon="mdi-chevron-right" color="white" class="bg-primary elevation-3" size="small"></v-btn>
          </template>
          <template v-slot:prev>
             <v-btn icon="mdi-chevron-left" color="white" class="bg-primary elevation-3" size="small"></v-btn>
          </template>

          <v-slide-group-item v-for="book in trendingBooks" :key="book._id">
            <div class="ma-3" style="width: 220px; height: 100%;">
               <div class="book-hover-wrapper h-100">
                  <BookCard :book="book" />
               </div>
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </v-container>

    <v-container class="my-6 position-relative z-index-10">
      <v-hover v-slot="{ isHovering, props }">
        <v-card v-bind="props" class="rounded-lg elevation-4 overflow-hidden cursor-pointer" :elevation="isHovering ? 10 : 4" to="/books">
          <v-img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop" height="240" cover class="align-center" gradient="to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1) 100%">
            <div class="d-flex flex-column justify-center fill-height px-6 px-md-12">
              <div class="animate-fade-right">
                <div class="text-overline text-amber font-weight-bold mb-0">EVENT OF THE MONTH</div>
                <h2 class="text-h4 font-serif font-weight-bold text-white mb-2 text-shadow">Reading Challenge 2025</h2>
                <p class="text-body-1 text-grey-lighten-3 font-weight-light mb-4 opacity-90" style="max-width: 600px;">Join 500+ readers. Borrow 5 books to win a Kindle Paperwhite!</p>
                <div class="d-flex align-center text-white font-weight-bold text-decoration-underline">Explore Now <v-icon end size="small" class="ml-1">mdi-arrow-right</v-icon></div>
              </div>
            </div>
          </v-img>
        </v-card>
      </v-hover>
    </v-container>
    
    <div class="bg-grey-lighten-5 py-8">
      <v-container>
        <div class="d-flex justify-space-between align-end mb-6">
          <div>
            <h2 class="text-h4 font-serif text-blue-grey-darken-4 mb-1 font-weight-bold">GỢI Ý CHO BẠN</h2>
            <div class="text-subtitle-1 text-blue-grey">Có thể bạn sẽ thích</div>
          </div>
          <v-btn color="blue-grey-darken-3" variant="text" append-icon="mdi-arrow-right" to="/books">Explore More</v-btn>
        </div>

        <v-row v-if="loading">
           <v-col cols="6" sm="4" md="3" lg="2" v-for="n in 6" :key="n"><v-skeleton-loader type="card"></v-skeleton-loader></v-col>
        </v-row>

        <div v-else class="position-relative book-slider-container">
            <v-slide-group
              show-arrows
              center-active
              class="pa-2"
            >
              <template v-slot:next>
                 <v-btn icon="mdi-chevron-right" color="white" class="bg-blue-grey-darken-3 elevation-3" size="small"></v-btn>
              </template>
              <template v-slot:prev>
                 <v-btn icon="mdi-chevron-left" color="white" class="bg-blue-grey-darken-3 elevation-3" size="small"></v-btn>
              </template>

              <v-slide-group-item v-for="book in recommendedBooks" :key="book._id">
                <div class="ma-3" style="width: 220px; height: 100%;">
                   <div class="book-hover-wrapper h-100">
                      <BookCard :book="book" />
                   </div>
                </div>
              </v-slide-group-item>
            </v-slide-group>
        </div>

      </v-container>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import BookCard from '@/components/BookCard.vue';

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const trendingBooks = ref([]);
const recommendedBooks = ref([]);
const loading = ref(true);
const isListening = ref(false);

const popularTags = ['Fantasy', 'Science Fiction', 'History', 'Romance', 'Self-help'];
const quickActions = [
  { text: 'Tủ sách', subtext: 'Bạn đã đọc gì?', icon: 'mdi-book-clock', bgColor: '#E3F2FD', iconColor: '#1976D2', route: '/my-loans' }, 
  { text: 'Favorites', subtext: 'Sách yêu thích của bạn?', icon: 'mdi-heart', bgColor: '#FFEBEE', iconColor: '#E53935', route: '/books?filter=favorites' },       
  { text: 'Bảng xếp hạng', subtext: 'Bạn top mấy?', icon: 'mdi-podium-gold', bgColor: '#E8F5E9', iconColor: '#43A047', route: '/leaderboard' }, 
  { text: 'Lịch sử', subtext: 'Lịch sử bạn đã mượn?', icon: 'mdi-history', bgColor: '#FFF3E0', iconColor: '#FB8C00', route: '/history' },              
];

// --- CÁC HÀM SỰ KIỆN ---
const handleActionClick = (action) => { if (action.route) router.push(action.route); else alert("Coming soon!"); };
const handleSearch = () => { if (searchQuery.value) router.push({ name: 'books', query: { search: searchQuery.value } }); };
const searchByTag = (tag) => { router.push({ name: 'books', query: { search: tag } }); }

const startVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { alert('Trình duyệt không hỗ trợ Voice Search.'); return; }
  if (isListening.value) { isListening.value = false; return; }

  const recognition = new SpeechRecognition();
  recognition.lang = 'vi-VN';
  recognition.onstart = () => { isListening.value = true; };
  recognition.onresult = (event) => {
    searchQuery.value = event.results[0][0].transcript;
    setTimeout(() => handleSearch(), 800);
  };
  recognition.onspeechend = () => { recognition.stop(); isListening.value = false; };
  recognition.start();
};

onMounted(async () => {
  loading.value = true;
  try {
    if (authStore.isAuthenticated) await authStore.fetchFavorites();

    const [trendingRes, recommendRes] = await Promise.all([
        api.get('/books?limit=12&page=1'),
        api.get('/books?limit=12&page=2')
    ]);
    
    trendingBooks.value = trendingRes.data.data;
    recommendedBooks.value = recommendRes.data.data;

  } catch (error) { 
    if (error.code !== 'ECONNABORTED') console.error('Error:', error); 
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-wrapper { width: 100%; background-color: #f8f9fa; min-height: 100vh; font-family: 'Roboto', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.hero-section { height: 600px; width: 100%; }
.hero-bg { width: 100%; height: 100%; }
.hero-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7)); }
.ls-2 { letter-spacing: 2px; }
.text-shadow { text-shadow: 2px 2px 10px rgba(0,0,0,0.8); }
.text-shadow-sm { text-shadow: 1px 1px 5px rgba(0,0,0,0.8); }

.glass-search { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
.search-input { border: none; outline: none; font-size: 1.1rem; background: transparent; }
.search-input::placeholder { color: rgba(255, 255, 255, 0.7); }
.listening-pulse { animation: pulse-red 1.5s infinite; }
@keyframes pulse-red { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); } }
.glass-chip { backdrop-filter: blur(5px); background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.3) !important; cursor: pointer; }
.glass-chip:hover { background: rgba(255,255,255,0.3) !important; }
.z-index-10 { z-index: 10; } .gap-6 { gap: 24px; } .gap-2 { gap: 8px; }
.action-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.05); }
.on-hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important; border-color: var(--v-primary-base); }
.animate-fade-up { animation: fadeUp 1s ease-out forwards; opacity: 0; transform: translateY(30px); }
.delay-100 { animation-delay: 0.3s; } .delay-200 { animation-delay: 0.5s; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.animate-fade-right { animation: fadeRight 1s ease-out forwards; opacity: 0; transform: translateX(-30px); }
@keyframes fadeRight { to { opacity: 1; transform: translateX(0); } }

.book-slider-container { background: transparent; }
.book-hover-wrapper { transition: transform 0.3s ease; }
.book-hover-wrapper:hover { transform: translateY(-10px); }
:deep(.v-slide-group__content) { padding-bottom: 10px; }

::-webkit-scrollbar { width: 0px; background: transparent; } 
</style>