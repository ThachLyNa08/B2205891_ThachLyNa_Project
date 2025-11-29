<template>
  <v-container>
    <h1 class="text-h4 mb-6 font-weight-bold text-primary">
      {{ showFavorites ? 'My Favorite Books' : 'Thư viện sách của chúng tôi' }}
    </h1>

    <v-row class="mb-4 align-center">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="searchQuery"
          label="Tìm kiếm sách tại đây"
          placeholder="Title, author..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="handleSearchInput"
        ></v-text-field>
      </v-col>

      <v-col cols="6" md="3">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          item-title="tenTheLoai"
          item-value="tenTheLoai" 
          label="Thể loại"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="handleFilterChange"
        ></v-select> 
      </v-col>

      <v-col cols="6" md="2">
        <v-text-field
          v-model="filterAuthor"
          label="Author"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="handleFilterChange"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="2" class="d-flex justify-end">
        <v-btn 
          color="pink"
          :variant="showFavorites ? 'flat' : 'outlined'"
          :prepend-icon="showFavorites ? 'mdi-heart' : 'mdi-heart-outline'"
          height="40"
          width="100%"
          class="text-capitalize font-weight-bold border-pink"
          @click="toggleFavoritesMode"
        >
          {{ showFavorites ? 'Yêu thích' : 'Yêu thích' }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col v-for="n in 12" :key="n" cols="6" sm="4" md="3" lg="2">
        <v-skeleton-loader type="card" class="rounded-lg"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="!books || books.length === 0">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">
            {{ showFavorites ? 'mdi-heart-broken' : 'mdi-book-open-page-variant-outline' }}
        </v-icon>
        <h3 class="text-h6 text-grey">
            {{ showFavorites ? 'Chưa có sách nào được yêu thích,' : 'Không tìm thấy sách nào dựa trên tìm kiếm của bạn.' }}
        </h3>
        <v-btn v-if="showFavorites" variant="text" color="primary" @click="toggleFavoritesMode">
            Browse all books
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-else dense> 
      <v-col cols="6" sm="4" md="3" lg="2" v-for="book in books" :key="book._id">
        <BookCard :book="book" />
      </v-col>
    </v-row>

    <v-pagination
      v-if="!showFavorites && pages > 1"
      v-model="currentPage"
      :length="pages"
      @update:model-value="fetchBooks"
      class="mt-8"
      color="primary"
      rounded="circle"
    ></v-pagination>

  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';
import debounce from 'lodash.debounce';
import BookCard from '@/components/BookCard.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const books = ref([]);
const allFavorites = ref([]); 
const categories = ref([]);
const loading = ref(true);

const searchQuery = ref(route.query.search || ''); 
const selectedCategory = ref(route.query.category || null);
const filterAuthor = ref('');
const showFavorites = ref(false);

const currentPage = ref(1);
const pages = ref(1);
const limit = 18; 

const filterFavoritesLocally = () => {
    let result = [...allFavorites.value];
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(b => 
            b.tenSach?.toLowerCase().includes(query) || 
            b.tacGia?.some(a => a.toLowerCase().includes(query)) ||
            b.isbn?.includes(query)
        );
    }
    if (selectedCategory.value && selectedCategory.value !== 'All Categories') {
        result = result.filter(b => 
            b.categories?.some(c => c.tenTheLoai === selectedCategory.value)
        );
    }
    if (filterAuthor.value) {
        const authQuery = filterAuthor.value.toLowerCase();
        result = result.filter(b => 
            b.tacGia?.some(a => a.toLowerCase().includes(authQuery))
        );
    }
    books.value = result;
};

const fetchBooks = async () => {
  loading.value = true;
  try {
    if (showFavorites.value) {
        if (!authStore.isAuthenticated) { router.push('/login'); return; }
        const response = await api.get('/users/favorites'); 
        allFavorites.value = response.data; 
        filterFavoritesLocally();
    } else {
        const catFilter = selectedCategory.value === 'All Categories' ? null : selectedCategory.value;
        const params = {
            page: currentPage.value,
            limit: limit,
            search: searchQuery.value,
            category: catFilter, 
            author: filterAuthor.value,
        };
        Object.keys(params).forEach(key => (params[key] === null || params[key] === '') && delete params[key]);
        const response = await api.get('/books', { params });
        books.value = response.data.data;
        pages.value = response.data.pages;
    }
  } catch (error) { console.error('Error fetching books:', error); } 
  finally { loading.value = false; }
};

const handleSearchInput = debounce(() => { if(showFavorites.value) filterFavoritesLocally(); else { currentPage.value = 1; fetchBooks(); } }, 500);
const handleFilterChange = () => { if(showFavorites.value) filterFavoritesLocally(); else { currentPage.value = 1; fetchBooks(); } };
const toggleFavoritesMode = () => { if (!authStore.isAuthenticated) { router.push('/login'); return; } showFavorites.value = !showFavorites.value; currentPage.value = 1; fetchBooks(); };

const fetchCategories = async () => { try { const response = await api.get('/categories'); const cats = Array.isArray(response.data) ? response.data : response.data.data; categories.value = [{ _id: 'all', tenTheLoai: 'All Categories' }, ...cats]; } catch (error) { console.error(error); } };

watch(() => route.query, (newQuery) => {
    if (newQuery.filter === 'favorites') {
        showFavorites.value = true; searchQuery.value = ''; selectedCategory.value = null; filterAuthor.value = ''; currentPage.value = 1; fetchBooks();
    } else if (newQuery.search || newQuery.category) {
        showFavorites.value = false; searchQuery.value = newQuery.search || ''; if (newQuery.category) selectedCategory.value = newQuery.category; currentPage.value = 1; fetchBooks();
    } else if (Object.keys(newQuery).length === 0) {
        showFavorites.value = false; searchQuery.value = ''; selectedCategory.value = null; fetchBooks();
    }
});

onMounted(async () => {
  if (authStore.isAuthenticated) await authStore.fetchFavorites();
  await fetchCategories();
  if (route.query.filter === 'favorites') showFavorites.value = true;
  await fetchBooks();
});
</script>

<style scoped>
.border-pink { border: 1px solid rgb(var(--v-theme-pink)) !important; }
</style>