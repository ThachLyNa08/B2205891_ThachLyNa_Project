<!-- frontend/src/views/BookDetailView.vue -->
<template>
  <v-container v-if="loading" class="text-center">
    <v-skeleton-loader type="article, actions"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="book">
    <v-row>
      <v-col cols="12" md="4" class="text-center">
        <v-img
          :src="book.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'"
          class="book-cover-detail elevation-5"
          max-height="400px"
          contain
        ></v-img>
        <v-btn
          v-if="authStore.isAuthenticated && book.availableCopies > 0 && authStore.isReader"
          color="primary"
          class="mt-4"
          block
          @click="requestLoan"
          :loading="loanLoading"
        >
          <v-icon left>mdi-book-arrow-right</v-icon> Borrow Now
        </v-btn>
        <v-alert v-else-if="book.availableCopies === 0" type="warning" class="mt-4">Out of Stock</v-alert>
        <v-alert v-else-if="!authStore.isAuthenticated" type="info" class="mt-4">Login to borrow this book.</v-alert>
        <v-alert v-if="loanError" type="error" class="mt-4">{{ loanError }}</v-alert>
        <v-alert v-if="loanSuccess" type="success" class="mt-4">{{ loanSuccess }}</v-alert>

      </v-col>
      <v-col cols="12" md="8">
        <h1 class="text-h3 mb-3">{{ book.tenSach }}</h1>
        <h2 class="text-h5 font-weight-regular mb-4">by {{ book.tacGia.join(', ') }}</h2>

        <v-chip-group class="mb-4">
          <v-chip v-for="cat in book.categories" :key="cat._id" color="secondary" variant="flat">
            {{ cat.tenTheLoai }}
          </v-chip>
        </v-chip-group>

        <p class="text-body-1 mb-4">{{ book.moTa }}</p>

        <v-list dense>
          <v-list-item>
            <v-list-item-title>Publisher:</v-list-item-title>
            <v-list-item-subtitle>{{ book.maNXB.tenNXB }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Published Year:</v-list-item-title>
            <v-list-item-subtitle>{{ book.namXuatBan }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>ISBN:</v-list-item-title>
            <v-list-item-subtitle>{{ book.isbn }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Available Copies:</v-list-item-title>
            <v-list-item-subtitle class="font-weight-bold" :class="{'text-success': book.availableCopies > 0, 'text-error': book.availableCopies === 0}">
              {{ book.availableCopies }} / {{ book.soQuyen }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Deposit (Estimated):</v-list-item-title>
            <v-list-item-subtitle>{{ formatCurrency(book.donGia * 0.1) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <!-- Phần gợi ý sách liên quan (TODO) -->
        <h3 class="text-h5 mt-8 mb-4">You might also like...</h3>
        <v-row>
            <v-col cols="12" sm="6" md="4" v-for="recBook in recommendedBooks" :key="recBook._id">
                <v-card :to="`/books/${recBook._id}`">
                    <v-img :src="recBook.coverUrl || 'https://via.placeholder.com/100'" height="150px" cover></v-img>
                    <v-card-title class="text-subtitle-2">{{ recBook.tenSach }}</v-card-title>
                    <v-card-subtitle>{{ recBook.tacGia.join(', ') }}</v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else class="text-center">
    <v-alert type="error">Book not found.</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const book = ref(null);
const loading = ref(true);
const loanLoading = ref(false);
const loanError = ref(null);
const loanSuccess = ref(null);
const recommendedBooks = ref([]); // Sách gợi ý

const fetchBook = async (id) => {
  loading.value = true;
  loanError.value = null;
  loanSuccess.value = null;
  try {
    const response = await api.get(`/books/${id}`);
    book.value = response.data;
    // Gọi hàm fetch sách gợi ý sau khi có thông tin sách
    // fetchRecommendedBooks(book.value); // TODO: Triển khai hàm này
    loading.value = false;
  } catch (error) {
    console.error('Error fetching book details:', error);
    book.value = null;
    loading.value = false;
  }
};

const requestLoan = async () => {
  loanLoading.value = true;
  loanError.value = null;
  loanSuccess.value = null;
  try {
    // Để đơn giản, đặt hạn trả là 7 ngày kể từ hôm nay
    const ngayHenTra = new Date();
    ngayHenTra.setDate(ngayHenTra.getDate() + 7);

    const response = await api.post('/loans/request', {
      bookId: book.value._id,
      ngayHenTra: ngayHenTra.toISOString().split('T')[0], // Gửi định dạng YYYY-MM-DD
    });
    loanSuccess.value = response.data.message;
    // Cập nhật lại số lượng sách có sẵn
    book.value.availableCopies -= 1;
  } catch (error) {
    loanError.value = error.response?.data?.message || 'Failed to request loan.';
    console.error('Error requesting loan:', error);
  } finally {
    loanLoading.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


onMounted(() => {
  fetchBook(route.params.id);
});

// Watch for route param changes to refetch book data
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBook(newId);
  }
});
</script>

<style scoped>
.book-cover-detail {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
}
</style>