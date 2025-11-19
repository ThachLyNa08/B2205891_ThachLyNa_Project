<template>
  <v-container class="mt-8" v-if="book">
    <v-card class="pa-6 overflow-visible" elevation="0" color="transparent">
      <v-row>
        <v-col cols="12" md="4" lg="3" class="text-center">
          <v-card elevation="10" class="rounded-lg overflow-hidden mb-6 mx-auto" max-width="300">
            <v-img :src="book.coverUrl" aspect-ratio="2/3" cover></v-img>
          </v-card>
          
          <div class="d-flex flex-column gap-3">
             <v-btn 
              block 
              color="primary" 
              size="large" 
              @click="requestLoan"
              :disabled="book.availableCopies === 0"
              :loading="loanLoading"
            >
              {{ book.availableCopies > 0 ? 'Borrow Now' : 'Unavailable' }}
            </v-btn>
            <v-btn block variant="outlined" color="secondary" prepend-icon="mdi-heart-outline">
              Add to Wishlist
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="8" lg="9" class="pl-md-8">
          <div class="d-flex justify-space-between align-start">
            <div>
              <h1 class="text-h3 font-weight-bold text-primary mb-2">{{ book.tenSach }}</h1>
              <div class="text-h6 text-medium-emphasis mb-4">by {{ book.tacGia.join(', ') }}</div>
            </div>
            <v-chip :color="book.availableCopies > 0 ? 'success' : 'error'" prepend-icon="mdi-check-circle">
              {{ book.availableCopies > 0 ? 'AVAILABLE' : 'OUT OF STOCK' }}
            </v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <v-row class="my-2">
            <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis">Publisher</div>
              <div class="font-weight-medium">{{ book.maNXB?.tenNXB }}</div>
            </v-col>
             <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis">Year</div>
              <div class="font-weight-medium">{{ book.namXuatBan }}</div>
            </v-col>
             <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis">ISBN</div>
              <div class="font-weight-medium">{{ book.isbn }}</div>
            </v-col>
             <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis">Copies</div>
              <div class="font-weight-medium">{{ book.availableCopies }} / {{ book.soQuyen }}</div>
            </v-col>
          </v-row>

          <div class="mt-6">
            <h3 class="text-h5 font-weight-bold mb-3">Description</h3>
            <p class="text-body-1 text-grey-darken-1" style="line-height: 1.8;">
              {{ book.moTa || 'No description available.' }}
            </p>
          </div>

          <div class="mt-6">
            <v-chip-group>
              <v-chip v-for="cat in book.categories" :key="cat._id" color="secondary" variant="tonal">
                {{ cat.tenTheLoai }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-12"></v-divider>
      <h3 class="text-h5 font-weight-bold mb-6">You Might Also Like</h3>
      <v-row>
        <v-col cols="6" md="2" v-for="i in 4" :key="i">
           <v-card color="grey-lighten-4" height="200" class="d-flex align-center justify-center">
             <span class="text-caption">Book Suggestion {{ i }}</span>
           </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
// ... (Giữ nguyên script logic từ file cũ, chỉ thay đổi template)
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api.service';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const book = ref(null);
const loanLoading = ref(false);

const fetchBook = async () => {
  try {
    const res = await api.get(`/books/${route.params.id}`);
    book.value = res.data;
  } catch (e) { console.error(e); }
};
const requestLoan = async () => {
  // ... logic mượn sách cũ
};

onMounted(fetchBook);
</script>