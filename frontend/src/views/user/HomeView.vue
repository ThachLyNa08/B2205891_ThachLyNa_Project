<template>
  <div class="home-wrapper">
    <section class="hero-section position-relative">
      <v-img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop"
        cover
        class="hero-bg"
      >
        <div class="hero-overlay fill-height d-flex flex-column align-center justify-center text-center px-4">
          
          <div class="animate-fade-up">
            <h1 class="text-h3 text-md-h2 font-serif text-white mb-2 font-weight-bold text-uppercase ls-2 text-shadow">
              Library Nexus
            </h1>
            <p class="text-h6 text-grey-lighten-3 mb-6 font-weight-light text-shadow-sm" style="max-width: 700px;">
              "A room without books is like a body without a soul."
            </p>
          </div>

          <v-card 
            width="100%" 
            max-width="700" 
            class="glass-search rounded-pill pa-2 d-flex align-center elevation-10 animate-fade-up delay-100"
          >
            <v-icon icon="mdi-magnify" color="white" class="ml-3" size="large"></v-icon>
            
            <input 
              v-model="searchQuery" 
              type="text" 
              class="search-input ml-3 flex-grow-1 text-white" 
              :placeholder="isListening ? 'Đang nghe...' : 'Search for titles, authors, genres...'" 
              @keyup.enter="handleSearch"
            />

            <v-btn
              icon
              variant="text"
              size="small"
              class="mr-2"
              :color="isListening ? 'red-accent-2' : 'white'"
              :class="{ 'listening-pulse': isListening }"
              @click="startVoiceSearch"
            >
              <v-icon>{{ isListening ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
              <v-tooltip activator="parent" location="top">Tìm bằng giọng nói</v-tooltip>
            </v-btn>

            <v-btn 
              color="white" 
              icon="mdi-arrow-right" 
              variant="flat" 
              class="rounded-circle text-primary font-weight-bold"
              @click="handleSearch"
            ></v-btn>
          </v-card>

          <div class="mt-4 animate-fade-up delay-200 d-none d-sm-flex align-center gap-2">
            <span class="text-grey-lighten-2 text-caption font-weight-bold mr-2">Popular:</span>
            <v-chip 
              v-for="tag in popularTags" 
              :key="tag"
              size="small"
              variant="outlined"
              color="white"
              class="glass-chip"
              @click="searchByTag(tag)"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </v-img>
    </section>

    <v-container class="mt-n16 position-relative" style="z-index: 100;">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="d-flex flex-wrap justify-center gap-6">
            <v-hover v-slot="{ isHovering, props }" v-for="action in quickActions" :key="action.text">
              <v-card
                v-bind="props"
                width="200"
                class="action-card rounded-xl pa-4 text-center cursor-pointer elevation-6 bg-white"
                :class="{'on-hover': isHovering}"
                @click="handleActionClick(action)"
              >
                <v-avatar :color="action.bgColor" size="64" class="mb-3">
                  <v-icon :color="action.iconColor" size="32">{{ action.icon }}</v-icon>
                </v-avatar>
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
          <div class="text-subtitle-1 text-grey-darken-1">Most borrowed books this week</div>
        </div>
        <v-btn color="primary" variant="text" append-icon="mdi-arrow-right" to="/books" class="font-weight-bold">Xem tất cả</v-btn>
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
              class="book-card rounded-lg h-100 d-flex flex-column bg-white elevation-2"
              :class="{'elevation-12 translate-y': isHovering}"
              :to="`/books/${book._id}`"
            >
              <div class="img-wrapper position-relative rounded-t-lg overflow-hidden">
                <v-img
                  :src="book.coverUrl || 'https://placehold.co/300x450'"
                  aspect-ratio="2/3"
                  cover
                  class="align-end book-cover"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                      <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
                    </div>
                  </template>
                  
                  <v-expand-transition>
                    <div v-if="isHovering" class="d-flex align-center justify-center transition-fast-in-fast-out" style="height: 100%; position: absolute; top: 0; width: 100%; background: rgba(0,0,0,0.4);">
                       <v-btn size="small" variant="elevated" color="white" class="text-primary font-weight-bold rounded-pill">
                         View Details
                       </v-btn>
                    </div>
                  </v-expand-transition>
                </v-img>
              </div>

              <div class="pa-3 flex-grow-1">
                <div class="font-weight-bold text-body-2 text-truncate mb-1 text-primary-darken-2" :title="book.tenSach">
                  {{ book.tenSach }}
                </div>
                <div class="text-caption text-truncate text-grey-darken-1">
                  {{ book.tacGia.join(', ') }}
                </div>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

      <v-container class="my-6 position-relative z-index-10">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          class="rounded-lg elevation-4 overflow-hidden cursor-pointer"
          :elevation="isHovering ? 10 : 4"
          to="/books" 
        >
          <v-img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop"
            height="240"
            cover
            class="align-center"
            gradient="to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1) 100%"
          >
            <div class="d-flex flex-column justify-center fill-height px-6 px-md-12">
              
              <div class="animate-fade-right">
                <div class="text-overline text-amber font-weight-bold mb-0">
                   EVENT OF THE MONTH
                </div>
                
                <h2 class="text-h4 font-serif font-weight-bold text-white mb-2 text-shadow">
                  Reading Challenge 2025
                </h2>
                
                <p class="text-body-1 text-grey-lighten-3 font-weight-light mb-4 opacity-90" style="max-width: 600px;">
                  Join 500+ readers. Borrow 5 books to win a Kindle Paperwhite!
                </p>
                
                <div class="d-flex align-center text-white font-weight-bold text-decoration-underline">
                   Explore Now <v-icon end size="small" class="ml-1">mdi-arrow-right</v-icon>
                </div>
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
            <h2 class="text-h4 font-serif text-blue-grey-darken-4 mb-1 font-weight-bold">✨ Curated For You</h2>
            <div class="text-subtitle-1 text-blue-grey">Handpicked based on your taste</div>
          </div>
          <v-btn color="blue-grey-darken-3" variant="text" append-icon="mdi-arrow-right" to="/books">Explore More</v-btn>
        </div>

        <v-row dense v-if="!loading">
          <v-col cols="6" sm="4" md="3" lg="2" v-for="book in recommendedBooks" :key="book._id">
             <v-hover v-slot="{ isHovering, props }">
              <v-card 
                v-bind="props"
                class="book-card rounded-lg h-100 d-flex flex-column bg-white elevation-1"
                :class="{'elevation-10 translate-y': isHovering}"
                :to="`/books/${book._id}`"
              >
                <div class="img-wrapper position-relative rounded-t-lg overflow-hidden">
                  <v-img
                    :src="book.coverUrl || 'https://placehold.co/300x450'"
                    aspect-ratio="2/3"
                    cover
                    class="align-end book-cover"
                  >
                     <template v-slot:error>
                        <v-img src="https://placehold.co/300x450?text=No+Cover" cover class="fill-height"></v-img>
                    </template>
                  </v-img>
                </div>
                <div class="pa-3">
                  <div class="font-weight-bold text-body-2 text-truncate text-blue-grey-darken-3">{{ book.tenSach }}</div>
                  <div class="text-caption text-grey text-truncate">{{ book.tacGia[0] }}</div>
                  <div class="mt-1 d-flex align-center">
                      <v-icon color="amber" size="x-small" class="mr-1">mdi-star</v-icon>
                      <span class="text-caption font-weight-bold text-grey-darken-2">4.8</span>
                  </div>
                </div>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api.service';

const router = useRouter();
const searchQuery = ref('');
const trendingBooks = ref([]);
const recommendedBooks = ref([]);
const loading = ref(true);
const isListening = ref(false); // [MỚI] Trạng thái đang nghe

// [MỚI] Danh sách từ khóa nhanh
const popularTags = ['Fantasy', 'Science Fiction', 'History', 'Romance', 'Self-help'];

const quickActions = [
  { text: 'My Loans', subtext: 'Check deadlines', icon: 'mdi-book-clock', bgColor: '#E3F2FD', iconColor: '#1976D2', route: '/my-loans' }, 
  { text: 'Favorites', subtext: 'Your wishlist', icon: 'mdi-heart', bgColor: '#FFEBEE', iconColor: '#E53935', route: '/favorites' },       
  { text: 'Reading', subtext: 'Continue reading', icon: 'mdi-book-open-variant', bgColor: '#E8F5E9', iconColor: '#43A047', route: '/reading' }, 
  { text: 'History', subtext: 'Past journeys', icon: 'mdi-history', bgColor: '#FFF3E0', iconColor: '#FB8C00', route: '/history' },              
];

const handleActionClick = (action) => {
  if (action.route) {
    const resolved = router.resolve(action.route);
    if (resolved.matched.length > 0 && resolved.name !== 'NotFound') {
       router.push(action.route);
    } else {
       alert(`Chức năng "${action.text}" đang được phát triển!`);
    }
  }
};

const handleSearch = () => {
    if (searchQuery.value) {
        router.push({ name: 'books', query: { search: searchQuery.value } });
    }
};

const searchByTag = (tag) => {
    router.push({ name: 'books', query: { search: tag } });
}

// [MỚI] HÀM XỬ LÝ GIỌNG NÓI
const startVoiceSearch = () => {
  // Kiểm tra trình duyệt hỗ trợ
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói. Vui lòng dùng Chrome hoặc Edge.');
    return;
  }

  // Nếu đang nghe thì tắt đi
  if (isListening.value) {
    isListening.value = false;
    // Lưu ý: Việc gọi stop() ở đây phụ thuộc vào instance recognition, 
    // nhưng vì ta tạo mới mỗi lần click nên chỉ cần đổi state để UI cập nhật.
    // Để tối ưu hơn, có thể lưu instance recognition ra ngoài.
    window.location.reload(); // Cách đơn giản nhất để stop nếu đang kẹt
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'vi-VN'; // Thiết lập tiếng Việt
  recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchQuery.value = transcript; // Điền vào ô search
    // Tự động tìm sau 1s để người dùng kịp nhìn thấy chữ
    setTimeout(() => {
        handleSearch();
    }, 800);
  };

  recognition.onspeechend = () => {
    recognition.stop();
    isListening.value = false;
  };

  recognition.onerror = (event) => {
    console.error('Voice search error:', event.error);
    isListening.value = false; // Tắt hiệu ứng rung

    // Xử lý các loại lỗi cụ thể
    switch (event.error) {
        case 'not-allowed':
            alert('Bạn đã chặn quyền truy cập Micro. Vui lòng cho phép trong cài đặt trình duyệt.');
            break;
        case 'no-speech':
            alert('Không nghe thấy gì cả. Vui lòng nói to hơn hoặc kiểm tra micro.');
            break;
        case 'network':
            alert('Lỗi kết nối mạng. Cần có internet để nhận dạng giọng nói.');
            break;
        default:
            // Các lỗi khác (audio-capture, bad-grammar, v.v.)
            // alert('Có lỗi xảy ra: ' + event.error); 
            break;
    }
  };

  recognition.start();
};

onMounted(async () => {
  loading.value = true;
  try {
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
.home-wrapper {
  width: 100%;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.font-serif {
  font-family: 'Playfair Display', serif; /* Font chữ tiêu đề kiểu báo chí */
}

/* --- HERO SECTION --- */
.hero-section {
  height: 600px; /* Tăng chiều cao lên cho hoành tráng */
  width: 100%;
}
.hero-bg {
  width: 100%;
  height: 100%;
}
.hero-overlay {
  /* Overlay tối mờ để chữ nổi bật trên nền sách */
  background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
}
.ls-2 { letter-spacing: 2px; }
.text-shadow { text-shadow: 2px 2px 10px rgba(0,0,0,0.8); }
.text-shadow-sm { text-shadow: 1px 1px 5px rgba(0,0,0,0.8); }

/* --- GLASSMORPHISM SEARCH --- */
.glass-search {
  background: rgba(255, 255, 255, 0.15); /* Trong suốt */
  backdrop-filter: blur(12px); /* Hiệu ứng mờ nền sau kính */
  border: 1px solid rgba(255, 255, 255, 0.3); /* Viền sáng nhẹ */
}
.search-input {
  border: none;
  outline: none;
  font-size: 1.1rem;
  background: transparent;
}
.search-input::placeholder { color: rgba(255, 255, 255, 0.7); }

/* [MỚI] Hiệu ứng Pulse cho Micro */
.listening-pulse {
  animation: pulse-red 1.5s infinite;
}
@keyframes pulse-red {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
}

.glass-chip {
  backdrop-filter: blur(5px);
  background: rgba(255,255,255,0.1) !important;
  border-color: rgba(255,255,255,0.3) !important;
  cursor: pointer;
}
.glass-chip:hover {
  background: rgba(255,255,255,0.3) !important;
}

/* --- QUICK ACTIONS --- */
.z-index-10 { z-index: 10; }
.gap-6 { gap: 24px; }
.gap-2 { gap: 8px; }

.action-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.05);
}
.on-hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
  border-color: var(--v-primary-base);
}

/* --- BOOK CARDS --- */
.book-card {
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}
.translate-y { transform: translateY(-8px); }
.img-wrapper { width: 100%; padding-top: 150%; position: relative; }
.book-cover { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* --- STATS PARALLAX BANNER (MỚI) --- */
.stats-parallax {
  /* Dùng ảnh nền tối hoặc màu gradient đẹp */
  background: linear-gradient(45deg, #1565C0, #0D47A1); 
  /* Hoặc nếu thích ảnh: background-image: url('...'); */
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

/* --- ANIMATION --- */
.animate-fade-up {
  animation: fadeUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}
.delay-100 { animation-delay: 0.3s; }
.delay-200 { animation-delay: 0.5s; }

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .hero-section { height: 450px; }
  .text-h3 { font-size: 1.8rem !important; }
  .glass-search { max-width: 90%; }
}
.animate-fade-right {
  animation: fadeRight 1s ease-out forwards;
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes fadeRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>