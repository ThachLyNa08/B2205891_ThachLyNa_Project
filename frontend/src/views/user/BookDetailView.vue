<template>
  <div class="book-detail-page bg-grey-lighten-5" style="min-height: 100vh;">
    
    <div v-if="!book" class="d-flex justify-center align-center" style="height: 80vh;">
       <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
    </div>

    <v-container class="py-8 py-md-12" v-else>
      
      <v-card elevation="0" class="rounded-xl overflow-hidden mb-8 bg-white shadow-soft">
          <v-row no-gutters>
            <v-col cols="12" md="4" lg="3" class="bg-blue-grey-lighten-5 d-flex align-center justify-center pa-8 position-relative">
              <div class="book-3d-wrapper">
                <v-img 
                  :src="book.coverUrl || 'https://placehold.co/300x450'" 
                  aspect-ratio="2/3" cover class="rounded-lg elevation-10" width="220"
                >
                   <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height"><v-progress-circular indeterminate color="grey"></v-progress-circular></div>
                   </template>
                </v-img>
              </div>
            </v-col>

            <v-col cols="12" md="8" lg="9" class="pa-6 pa-md-10 d-flex flex-column">
                <div class="d-flex align-center mb-2">
                    <v-icon size="small" color="primary" class="mr-2">mdi-account-edit</v-icon>
                    <span class="text-subtitle-1 font-weight-bold text-primary text-uppercase tracking-wide">{{ book.tacGia.join(', ') }}</span>
                </div>
                <h1 class="text-h3 font-weight-bold text-blue-grey-darken-4 mb-4">{{ book.tenSach }}</h1>

                <div class="d-flex flex-wrap gap-2 mb-6">
                  <v-chip v-for="cat in book.categories" :key="cat._id" size="small" color="primary" variant="tonal" class="font-weight-bold">{{ cat.tenTheLoai }}</v-chip>
                </div>

                <div class="info-grid py-4 mb-6 border-y border-opacity-10 d-flex align-center justify-space-between flex-wrap gap-4">
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Giá phạt trễ hạn</div>
                        <div class="text-h5 font-weight-bold text-primary">{{ formatCurrency(book.pricePerDay || 5000) }}<span class="text-body-2 text-grey">/ngày</span></div>
                    </div>
                    <v-divider vertical class="hidden-xs-only" style="height: 40px;"></v-divider>
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">NXB</div>
                        <div class="text-subtitle-1 font-weight-medium">{{ book.maNXB?.tenNXB || 'Unknown' }}</div>
                    </div>
                    <v-divider vertical class="hidden-xs-only" style="height: 40px;"></v-divider>
                    <div>
                        <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Tình trạng sách</div>
                        <v-chip :color="book.availableCopies > 0 ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
                            {{ book.availableCopies > 0 ? `${book.availableCopies} In Stock` : 'Out of Stock' }}
                        </v-chip>
                    </div>
                </div>

                <div class="d-flex flex-column flex-sm-row gap-4 mt-auto">
                    <v-btn 
                      color="blue-darken-3" size="x-large" class="px-8 text-capitalize font-weight-bold flex-grow-1 flex-sm-grow-0 shadow-button"
                      prepend-icon="mdi-book-plus-multiple" rounded="pill" height="56"
                      @click="openBorrowDialog" :disabled="book.availableCopies === 0"
                    >Đăng Ký Mượn</v-btn>
                    
                    <v-btn 
                      :variant="isLiked ? 'flat' : 'outlined'" :color="isLiked ? 'pink' : 'blue-grey'" 
                      :class="isLiked ? 'text-white' : 'text-blue-grey-darken-1'"
                      size="x-large" class="px-6 text-capitalize flex-grow-1 flex-sm-grow-0"
                      :prepend-icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'" rounded="pill" height="56"
                      @click="toggleMainFav"
                    >{{ isLiked ? 'Đã Thích' : 'Yêu Thích' }}</v-btn>
                </div>
            </v-col>
          </v-row>
      </v-card>

      <v-divider class="my-8 border-opacity-10"></v-divider>

      <v-row>
        <v-col cols="12" md="8">
            <div class="mb-8">
                <h3 class="text-h5 font-weight-bold mb-4 text-blue-grey-darken-3 d-flex align-center">
                    <v-icon start color="primary">mdi-text-box-outline</v-icon> Tóm tắt nội dung
                </h3>
                <v-card class="pa-6 rounded-xl border-none shadow-soft bg-white">
                    <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8; white-space: pre-line;">{{ book.moTa || 'Chưa có mô tả cho cuốn sách này.' }}</p>
                </v-card>
            </div>

            <div>
                <div class="d-flex justify-space-between align-end mb-4">
                    <h3 class="text-h5 font-weight-bold text-blue-grey-darken-3 d-flex align-center">
                        <v-icon start color="amber">mdi-star-circle-outline</v-icon> Đánh giá ({{ reviews.length }})
                    </h3>
                </div>
                <v-card class="pa-6 rounded-xl border-none shadow-soft bg-white">
                    <div v-if="authStore.isAuthenticated" class="mb-6 pa-4 bg-grey-lighten-4 rounded-lg border border-opacity-10">
                        <div class="d-flex align-center mb-2">
                            <v-avatar color="primary" size="32" class="mr-2 text-subtitle-2 font-weight-bold">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</v-avatar>
                            <span class="font-weight-bold">Viết đánh giá của bạn</span>
                        </div>
                        <v-rating v-model="newReview.rating" color="amber" density="compact" hover size="small" class="mb-3"></v-rating>
                        <v-textarea v-model="newReview.comment" placeholder="Bạn cảm thấy cuốn sách này thế nào?" variant="outlined" bg-color="white" rows="2" auto-grow hide-details class="mb-3"></v-textarea>
                        <div class="d-flex justify-end">
                            <v-btn color="primary" @click="submitReview" :loading="submitting" :disabled="!newReview.rating || !newReview.comment" class="text-capitalize px-6" rounded="lg" elevation="1">Gửi đánh giá</v-btn>
                        </div>
                    </div>
                    <div v-else class="text-center py-6 mb-4 bg-grey-lighten-5 rounded-lg border-dashed">
                        <p class="text-grey mb-2">Muốn chia sẻ cảm nghĩ?</p>
                        <v-btn variant="outlined" color="primary" to="/login" rounded="pill">Đăng nhập để đánh giá</v-btn>
                    </div>
                    <div v-if="reviews.length > 0">
                        <div v-for="(review, index) in reviews" :key="review._id" class="review-item">
                            <v-divider v-if="index > 0" class="my-6 border-opacity-10"></v-divider>
                            <div class="d-flex align-start">
                                <v-avatar color="blue-grey-lighten-4" class="mr-4 text-blue-grey-darken-3 font-weight-bold">{{ review.userId?.username?.charAt(0).toUpperCase() }}</v-avatar>
                                <div class="flex-grow-1">
                                    <div class="d-flex align-center justify-space-between mb-1">
                                        <span class="font-weight-bold text-body-1">{{ review.userId?.username }}</span>
                                        <span class="text-caption text-grey">{{ formatDate(review.createdAt) }}</span>
                                    </div>
                                    <v-rating :model-value="review.rating" color="amber" density="compact" size="x-small" readonly></v-rating>
                                    <p class="text-body-2 text-grey-darken-3 mt-2">{{ review.comment }}</p>
                                    <v-btn v-if="authStore.user?._id === review.userId?._id" variant="text" size="small" color="red-lighten-2" class="px-0 mt-1 text-capitalize" @click="deleteReview(review._id)">Xóa</v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center text-grey py-8 d-flex flex-column align-center">
                        <v-icon size="48" color="grey-lighten-3" class="mb-2">mdi-comment-outline</v-icon>
                        Chưa có đánh giá nào. Hãy là người đầu tiên!
                    </div>
                </v-card>
            </div>
        </v-col>

        <v-col cols="12" md="4">
            <div class="sticky-card">
               <h4 class="text-h6 font-weight-bold mb-4 text-blue-grey-darken-3">Có thể bạn sẽ thích</h4>
               <v-row dense>
                 <v-col cols="6" sm="4" md="6" v-for="relBook in relatedBooks" :key="relBook._id">
                    <BookCard :book="relBook" />
                 </v-col>
               </v-row>
            </div>
        </v-col>
      </v-row>

      <v-dialog v-model="dialog" max-width="600" persistent transition="dialog-bottom-transition">
        <v-card class="rounded-xl overflow-hidden">
          <div class="dialog-header bg-gradient-primary d-flex align-center px-6 py-4">
             <v-icon color="white" start class="mr-3">mdi-file-document-edit-outline</v-icon>
             <div class="text-h6 font-weight-bold text-white">Phiếu Yêu Cầu Mượn Sách</div>
             <v-spacer></v-spacer>
             <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="dialog = false"></v-btn>
          </div>

          <v-card-text class="pa-0 bg-grey-lighten-5">
            <div class="pa-6">
              <div class="d-flex gap-4 mb-6 align-start bg-white pa-4 rounded-lg border-subtle">
                 <v-img :src="book.coverUrl" width="60" height="90" cover class="rounded elevation-2 flex-grow-0"></v-img>
                 <div>
                    <div class="text-subtitle-1 font-weight-bold text-primary mb-1 line-clamp-1">{{ book.tenSach }}</div>
                    <div class="text-caption text-medium-emphasis mb-1">{{ book.tacGia.join(', ') }}</div>
                    <div class="text-caption font-weight-bold text-success"><v-icon size="x-small" color="success" start>mdi-check-circle</v-icon> Còn hàng</div>
                 </div>
              </div>
              
              <div class="mb-6">
                 <div class="text-caption font-weight-bold text-uppercase text-grey-darken-2 mb-2 ml-1">Thời Gian Quy Định</div>
                 <v-sheet class="bg-white rounded-lg pa-3 border-subtle d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                       <v-icon color="primary" class="mr-3">mdi-calendar-clock</v-icon>
                       <div>
                          <div class="text-subtitle-2 font-weight-bold text-grey-darken-3">14 Ngày</div>
                          <div class="text-caption text-grey">Thời hạn mượn tối đa</div>
                       </div>
                    </div>
                    <div class="text-right">
                       <div class="text-caption text-grey">Hạn trả</div>
                       <div class="text-body-2 font-weight-bold text-primary">{{ formatDate(returnDate) }}</div>
                    </div>
                 </v-sheet>
              </div>

              <div class="mb-4">
                  <div class="text-caption font-weight-bold text-uppercase text-grey-darken-2 mb-2 ml-1">Thông Tin Người Mượn</div>
                  <v-text-field 
                    v-model="billingName" label="Họ và Tên" variant="outlined" density="comfortable" bg-color="white" class="mb-2 rounded-lg" prepend-inner-icon="mdi-account"
                  ></v-text-field>
                  <v-text-field 
                    v-model="billingPhone" label="Số điện thoại liên hệ" variant="outlined" density="comfortable" bg-color="white" class="rounded-lg" prepend-inner-icon="mdi-phone"
                  ></v-text-field>
              </div>
              
              <v-alert type="info" variant="tonal" density="compact" class="text-caption border-dashed mb-2">
                 <template v-slot:prepend><v-icon size="small">mdi-information</v-icon></template>
                 <div>Hãy đảm bảo bạn sẽ trả đúng hạn! Nếu trễ hạn trả sách, chúng tôi sẽ phạt 5000đ/ngày!</div>
              </v-alert>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 bg-white border-t">
             <div class="d-flex w-100 gap-3">
                <v-btn variant="text" color="grey-darken-1" height="48" class="flex-grow-1 text-capitalize rounded-lg" @click="dialog = false">Hủy bỏ</v-btn>
                
                <v-btn 
                  color="primary" variant="flat" height="48" class="flex-grow-1 rounded-lg font-weight-bold shadow-button" 
                  @click="confirmLoan" :loading="loanLoading" :disabled="!billingName || !billingPhone"
                >
                    Gửi Yêu Cầu <v-icon end>mdi-send</v-icon>
                </v-btn>
             </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import BookCard from '@/components/BookCard.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const relatedBooks = ref([]);
const dialog = ref(false);
const loanLoading = ref(false);

const reviews = ref([]);
const newReview = reactive({ rating: 0, comment: '' });
const submitting = ref(false);

const returnDate = ref('');
const estimatedCost = ref(0);
const billingName = ref('');
const billingPhone = ref('');

const isLiked = computed(() => book.value && authStore.isFavorite(book.value._id));

const toggleMainFav = async () => {
    if (!authStore.isAuthenticated) { router.push('/login'); return; }
    await authStore.toggleFavorite(book.value);
};

const fetchBook = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    book.value = res.data;
    
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 14);
    returnDate.value = end.toISOString().split('T')[0];
    estimatedCost.value = 14 * (book.value.pricePerDay || 2000);

    fetchRelated();
  } catch (e) { console.error(e); }
};

const fetchRelated = async () => {
  try {
    const res = await api.get('/books?limit=6&page=1'); 
    relatedBooks.value = res.data.data.filter(b => b._id !== book.value._id).slice(0, 4);
  } catch(e) { console.error(e); }
};

const openBorrowDialog = () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  
  billingName.value = authStore.user?.ten ? `${authStore.user.hoLot || ''} ${authStore.user.ten}`.trim() : authStore.user?.username;
  billingPhone.value = authStore.user?.dienThoai || '';
  
  dialog.value = true;
};

const confirmLoan = async () => {
  loanLoading.value = true;
  try {
    await api.post('/loans/request', { 
        bookId: book.value._id, 
        ngayHenTra: returnDate.value 
    });
    
    dialog.value = false;
    alert('Yêu cầu mượn đã được gửi! Vui lòng theo dõi trạng thái trong "Tủ sách của tôi".');
    router.push('/my-loans'); 
  } catch (error) { 
    alert(error.response?.data?.message || "Lỗi khi gửi yêu cầu"); 
  } finally { 
    loanLoading.value = false; 
  }
};

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

const fetchReviews = async () => { try { const res = await api.get(`/reviews/book/${route.params.id}`); reviews.value = res.data; } catch (e) {} };
const submitReview = async () => { submitting.value = true; try { await api.post('/reviews', { bookId: route.params.id, rating: newReview.rating, comment: newReview.comment }); newReview.rating = 0; newReview.comment = ''; await fetchReviews(); alert('Đã gửi đánh giá!'); } catch (e) { alert('Lỗi'); } finally { submitting.value = false; } };
const deleteReview = async (id) => { if(!confirm('Xóa?')) return; try { await api.delete(`/reviews/${id}`); await fetchReviews(); } catch(e) {} };

onMounted(async () => {
  if (authStore.isAuthenticated) await authStore.fetchFavorites();
  await fetchBook(route.params.id);
  await fetchReviews();
});

watch(() => route.params.id, async (newId) => { 
  if (newId) {
    book.value = null; reviews.value = []; relatedBooks.value = [];
    await fetchBook(newId); await fetchReviews();
  }
});
</script>

<style scoped>
.gap-4 { gap: 16px; } .gap-2 { gap: 8px; }
.tracking-wide { letter-spacing: 0.05em; }

.book-3d-wrapper { perspective: 1000px; transform: rotateY(-5deg); transition: transform 0.5s; }
.book-3d-wrapper:hover { transform: rotateY(0deg) scale(1.02); }

.shadow-soft { box-shadow: 0 4px 30px rgba(0,0,0,0.06) !important; }
.shadow-button { box-shadow: 0 8px 16px rgba(33, 150, 243, 0.25); }
.border-subtle { border: 1px solid rgba(0,0,0,0.08) !important; }
.border-dashed { border-style: dashed !important; border-color: rgba(0,0,0,0.12) !important; }
.border-none { border: none !important; }

.bg-gradient-primary { background: linear-gradient(135deg, #1565C0, #0D47A1); }
.line-clamp-1 { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.cursor-pointer { cursor: pointer; }
</style>