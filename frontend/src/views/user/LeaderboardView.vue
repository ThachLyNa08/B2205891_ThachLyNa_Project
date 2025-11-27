<template>
  <div class="leaderboard-page bg-grey-lighten-5 min-vh-100 py-12 position-relative overflow-hidden">
    
    <div class="absolute-circle circle-1"></div>
    <div class="absolute-circle circle-2"></div>

    <v-container class="position-relative z-index-10">
        <div class="text-center mb-12">
            <div class="d-inline-flex align-center bg-white px-4 py-1 rounded-pill mb-4 elevation-1">
                <v-icon color="amber" size="small" class="mr-2">mdi-trophy</v-icon>
                <span class="text-caption font-weight-bold text-uppercase text-grey-darken-2">Hall of Fame</span>
            </div>
            <h1 class="text-h3 font-serif font-weight-bold text-blue-grey-darken-4 mb-2">BẢNG VÀNG THƯ VIỆN</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Vinh danh những cuốn sách & độc giả xuất sắc nhất tháng này</p>
        </div>

        <div v-if="loading" class="d-flex justify-center my-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>

        <v-row v-else>
            <v-col cols="12" md="6">
                <v-card class="rounded-xl elevation-6 h-100 overflow-hidden border-none">
                    <div class="bg-amber-darken-3 px-6 py-6 d-flex align-center header-pattern">
                        <div class="mr-4 bg-white rounded-circle pa-3 elevation-3">
                             <v-icon size="32" color="amber-darken-4">mdi-book-open-page-variant</v-icon>
                        </div>
                        <div>
                            <div class="text-h5 font-weight-bold text-white">Top Sách Thịnh Hành</div>
                            <div class="text-caption text-amber-lighten-4 opacity-80">Được mượn đọc nhiều nhất</div>
                        </div>
                    </div>
                    
                    <v-list class="py-0" lines="two">
                        <template v-for="(book, i) in topBorrowedBooks" :key="i">
                            <v-list-item class="px-6 py-4 rank-item bg-white">
                                <template v-slot:prepend>
                                    <div class="rank-badge mr-5" :class="'rank-' + (i+1)">{{ i + 1 }}</div>
                                    <v-avatar size="56" rounded="lg" class="elevation-2 mr-4 book-cover-avatar">
                                        <v-img :src="book.coverUrl || 'https://placehold.co/50x75'" cover></v-img>
                                    </v-avatar>
                                </template>
                                
                                <v-list-item-title class="font-weight-bold text-body-1 text-blue-grey-darken-3 mb-1">
                                    {{ book.tenSach }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-caption d-flex align-center">
                                    <v-icon size="small" class="mr-1">mdi-account-edit</v-icon>
                                    {{ Array.isArray(book.tacGia) ? book.tacGia.join(', ') : book.tacGia }}
                                </v-list-item-subtitle>

                                <template v-slot:append>
                                    <div class="text-right ml-2">
                                        <div class="text-h5 font-weight-black text-amber-darken-3 lh-1">{{ book.borrowedCount }}</div>
                                        <div class="text-caption font-weight-bold text-grey-lighten-1" style="font-size: 10px;">LƯỢT</div>
                                    </div>
                                </template>
                            </v-list-item>
                            <v-divider v-if="i < topBorrowedBooks.length - 1" class="border-opacity-10 mx-4"></v-divider>
                        </template>
                    </v-list>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="rounded-xl elevation-6 h-100 overflow-hidden border-none">
                    <div class="bg-cyan-darken-3 px-6 py-6 d-flex align-center header-pattern-2">
                        <div class="mr-4 bg-white rounded-circle pa-3 elevation-3">
                             <v-icon size="32" color="cyan-darken-4">mdi-account-star</v-icon>
                        </div>
                        <div>
                            <div class="text-h5 font-weight-bold text-white">Độc Giả Tích Cực</div>
                            <div class="text-caption text-cyan-lighten-4 opacity-80">Thành viên mượn sách chăm chỉ</div>
                        </div>
                    </div>

                    <v-list class="py-0" lines="two">
                        <template v-for="(reader, i) in topActiveReaders" :key="i">
                            <v-list-item class="px-6 py-4 rank-item bg-white">
                                <template v-slot:prepend>
                                    <div class="rank-badge mr-5" :class="'rank-' + (i+1)">{{ i + 1 }}</div>
                                    <v-avatar size="56" class="elevation-2 mr-4 border-2 border-white">
                                        <v-img v-if="reader.avatar" :src="reader.avatar" cover></v-img>
                                        <span v-else class="text-h5 font-weight-bold text-cyan-darken-3">{{ reader.username?.charAt(0).toUpperCase() }}</span>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="font-weight-bold text-body-1 text-blue-grey-darken-3 mb-1">
                                    {{ reader.username }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-caption text-cyan-darken-2 font-weight-medium d-flex align-center">
                                    <v-icon size="small" class="mr-1">mdi-medal</v-icon> Super Reader
                                </v-list-item-subtitle>

                                <template v-slot:append>
                                    <div class="text-right ml-2">
                                        <v-chip color="cyan-lighten-5" class="text-cyan-darken-3 font-weight-bold" size="small" label>
                                            {{ reader.borrowedCount }} Sách
                                        </v-chip>
                                    </div>
                                </template>
                            </v-list-item>
                            <v-divider v-if="i < topActiveReaders.length - 1" class="border-opacity-10 mx-4"></v-divider>
                        </template>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api.service';

const topBorrowedBooks = ref([]);
const topActiveReaders = ref([]);
const loading = ref(true);

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const [topBooksRes, topReadersRes] = await Promise.all([
        api.get('/books/top-borrowed'),
        api.get('/users/top-readers')
    ]);
    topBorrowedBooks.value = topBooksRes.data;
    topActiveReaders.value = topReadersRes.data;
  } catch (e) {
    console.error("Lỗi tải bảng xếp hạng:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLeaderboard);
</script>

<style scoped>
.min-vh-100 { min-height: 100vh; }
.font-serif { font-family: 'Playfair Display', serif; }

/* Hình tròn trang trí nền */
.absolute-circle { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 1; opacity: 0.4; }
.circle-1 { width: 400px; height: 400px; background: #FFC107; top: -100px; left: -100px; }
.circle-2 { width: 500px; height: 500px; background: #00BCD4; bottom: -150px; right: -150px; }

/* Huy hiệu số thứ tự */
.rank-badge {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.1rem;
    color: #546E7A; background: #F5F7FA;
    border: 2px solid #CFD8DC;
}

/* Màu sắc Top 1-2-3 */
.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA000); color: white; border: none; box-shadow: 0 4px 12px rgba(255, 160, 0, 0.4); transform: scale(1.2); }
.rank-2 { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); color: white; border: none; box-shadow: 0 4px 12px rgba(158, 158, 158, 0.4); transform: scale(1.1); }
.rank-3 { background: linear-gradient(135deg, #D7CCC8, #8D6E63); color: white; border: none; box-shadow: 0 4px 12px rgba(141, 110, 99, 0.4); transform: scale(1.05); }

/* Hiệu ứng hover item */
.rank-item { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.rank-item:hover { transform: translateX(5px); background-color: #FAFAFA !important; }

.lh-1 { line-height: 1; }
.header-pattern { background-image: radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%); }
.header-pattern-2 { background-image: radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%); }
</style>