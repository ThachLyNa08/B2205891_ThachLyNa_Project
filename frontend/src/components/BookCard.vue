<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card 
        v-bind="props"
        class="book-card rounded-lg h-100 d-flex flex-column position-relative cursor-pointer" 
        :elevation="isHovering ? 8 : 2"
        @click="goToDetail"
    >
      <div class="position-absolute top-0 right-0 z-10 ma-2">
          <v-btn 
              icon 
              density="compact" 
              :color="isLiked ? 'pink' : 'white'"
              :variant="isLiked ? 'flat' : 'elevated'"
              class="like-btn"
              @click.stop="toggleLike" 
          >
              <v-icon size="small">{{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>
      </div>

      <v-img 
          :src="book.coverUrl || 'https://placehold.co/200x250?text=No+Cover'" 
          height="240" 
          cover
          class="bg-grey-lighten-4"
      >
          <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
              </div>
          </template>
      </v-img>
      
      <div class="pa-3 flex-grow-1 d-flex flex-column">
          <div class="text-subtitle-2 font-weight-bold text-truncate-2 mb-1" :title="book.tenSach">
              {{ book.tenSach }}
          </div>
          <div class="text-caption text-grey text-truncate mb-3">
              {{ book.tacGia?.join(', ') || 'Unknown Author' }}
          </div>
          
          <div class="mt-auto d-flex align-center justify-space-between">
              <div class="d-flex gap-1">
                  <v-chip 
                      v-if="firstCategory"
                      size="x-small" 
                      :color="categoryColor" 
                      variant="flat"
                      class="font-weight-bold"
                  >
                      {{ firstCategory }}
                  </v-chip>
                  <v-chip v-if="book.categories?.length > 1" size="x-small" variant="tonal">
                      +{{ book.categories.length - 1 }}
                  </v-chip>
              </div>

              <span 
                  class="text-caption font-weight-bold"
                  :class="book.availableCopies > 0 ? 'text-success' : 'text-error'"
              >
                  {{ book.availableCopies > 0 ? 'Available' : 'Out of Stock' }}
              </span>
          </div>
      </div>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  book: { type: Object, required: true }
});

const router = useRouter();
const authStore = useAuthStore();

// Computed
const isLiked = computed(() => authStore.isFavorite(props.book._id));

const firstCategory = computed(() => {
    const cat = props.book.categories?.[0];
    return typeof cat === 'object' ? cat.tenTheLoai : cat;
});

const categoryColor = computed(() => {
    const name = firstCategory.value;
    if (!name) return 'grey';
    const colors = ['#FFC107', '#2196F3', '#9C27B0', '#4CAF50', '#FF5722', '#607D8B'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
});

// Actions
const goToDetail = () => {
    router.push(`/books/${props.book._id}`);
};

const toggleLike = async () => {
    if (!authStore.isAuthenticated) {
        router.push('/login');
        return;
    }
    await authStore.toggleFavorite(props.book);
};
</script>

<style scoped>
.book-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}
.book-card:hover { transform: translateY(-4px); }
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.z-10 { z-index: 10; }
.cursor-pointer { cursor: pointer; }
.gap-1 { gap: 4px; }
.like-btn { transition: transform 0.2s; }
.like-btn:active { transform: scale(0.8); }
</style>