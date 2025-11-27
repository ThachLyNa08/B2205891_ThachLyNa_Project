<template>
  <div class="review-management-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="amber-accent-3" class="mr-2">mdi-star-circle</v-icon>
             Review Management
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Monitor user feedback and ratings</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Search content, user, book..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 250px;"
           ></v-text-field>
           
           <div style="width: 160px;">
             <v-select
                v-model="filterRating"
                :items="ratingOptions"
                label="Rating"
                prepend-inner-icon="mdi-filter-outline"
                variant="solo-filled"
                density="compact"
                bg-color="rgba(255,255,255,0.05)"
                hide-details
                clearable
                class="rounded-lg"
             ></v-select>
           </div>
        </div>
      </div>

      <v-row class="mb-4">
         <v-col cols="12" sm="4">
            <v-card class="bg-indigo-darken-3 rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-70 text-uppercase">Total Reviews</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ allReviews.length }}</div>
                  <v-icon size="large" class="opacity-50">mdi-comment-multiple-outline</v-icon>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="4">
            <v-card class="bg-amber-darken-4 rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-70 text-uppercase">Average Score</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ averageRating }}</div>
                  <v-rating :model-value="Number(averageRating)" color="white" density="compact" size="small" readonly half-increments></v-rating>
               </div>
            </v-card>
         </v-col>
         <v-col cols="12" sm="4">
            <v-card class="bg-teal-darken-3 rounded-lg pa-4 border border-opacity-10" elevation="2">
               <div class="text-caption font-weight-bold text-white opacity-70 text-uppercase">5-Star Reviews</div>
               <div class="d-flex align-center justify-space-between mt-1">
                  <div class="text-h4 font-weight-black text-white">{{ fiveStarCount }}</div>
                  <v-icon size="large" class="opacity-50">mdi-trophy-outline</v-icon>
               </div>
            </v-card>
         </v-col>
      </v-row>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent" elevation="0">
         <v-data-table
            :headers="headers"
            :items="filteredReviews"
            :loading="loading"
            :items-per-page="8"
            class="bg-transparent text-white custom-table flex-grow-1"
            density="comfortable"
            hover
         >
            <template v-slot:item.userId="{ item }">
               <div class="d-flex align-center py-2">
                  <v-avatar color="primary" size="32" class="mr-3 font-weight-bold text-subtitle-2 border">
                     {{ item.userId?.username?.charAt(0).toUpperCase() || '?' }}
                  </v-avatar>
                  <div class="font-weight-bold text-body-2">{{ item.userId?.username || 'Deleted User' }}</div>
               </div>
            </template>

            <template v-slot:item.bookId="{ item }">
               <div class="d-flex align-center" style="max-width: 200px;">
                  <v-icon size="small" class="mr-2 text-grey">mdi-book</v-icon>
                  <span class="text-body-2 text-truncate font-weight-medium text-blue-lighten-4" :title="item.bookId?.tenSach">
                      {{ item.bookId?.tenSach || 'Book Removed' }}
                  </span>
               </div>
            </template>

            <template v-slot:item.rating="{ item }">
               <div class="d-flex align-center">
                   <span class="font-weight-bold text-amber mr-2 text-h6">{{ item.rating }}</span>
                   <v-rating :model-value="item.rating" color="amber" density="compact" size="x-small" readonly></v-rating>
               </div>
            </template>

            <template v-slot:item.comment="{ item }">
                <div class="text-body-2 text-grey-lighten-1 py-1" style="min-width: 200px; max-width: 350px;">
                    <div class="text-truncate">
                        <v-icon size="x-small" class="mr-1 mb-1">mdi-format-quote-open</v-icon>
                        {{ item.comment }}
                    </div>
                </div>
            </template>

            <template v-slot:item.createdAt="{ item }">
                <div class="text-caption text-grey">{{ formatDate(item.createdAt) }}</div>
            </template>

            <template v-slot:item.actions="{ item }">
               <div class="d-flex justify-end">
                  <v-btn icon="mdi-delete" variant="text" color="red-lighten-2" size="small" @click="confirmDelete(item)" title="Remove Review"></v-btn>
               </div>
            </template>

            <template v-slot:no-data>
               <div class="text-center py-8">
                  <v-icon size="64" color="grey-darken-2">mdi-comment-off-outline</v-icon>
                  <div class="text-grey mt-2">No reviews found.</div>
               </div>
            </template>
         </v-data-table>
      </v-card>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-error px-6 py-4 text-h6 font-weight-bold d-flex align-center">
           <v-icon start>mdi-alert-octagon</v-icon> Delete Review
        </v-card-title>
        <v-card-text class="pt-6 pb-4 text-center">
           Are you sure you want to delete this review by <br/>
           <strong class="text-red-lighten-2">{{ reviewToDelete?.userId?.username }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-center pb-6">
          <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="executeDelete" class="px-6 font-weight-bold">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">{{ snackbar.message }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api.service';

const allReviews = ref([]);
const loading = ref(true);
const search = ref('');
const filterRating = ref(null);
const deleteDialog = ref(false);
const reviewToDelete = ref(null);
const snackbar = ref({ show: false, message: '', color: '' });

const ratingOptions = [
    { title: '5 Stars', value: 5 },
    { title: '4 Stars', value: 4 },
    { title: '3 Stars', value: 3 },
    { title: '2 Stars', value: 2 },
    { title: '1 Star', value: 1 },
];

const headers = [
    { title: 'User', key: 'userId', align: 'start', width: '15%' },
    { title: 'Book', key: 'bookId', width: '20%' },
    { title: 'Rating', key: 'rating', width: '15%' },
    { title: 'Comment', key: 'comment', width: '30%' },
    { title: 'Date', key: 'createdAt', width: '10%' },
    { title: '', key: 'actions', sortable: false, align: 'end', width: '10%' },
];

// Computed Stats
const averageRating = computed(() => {
    if (allReviews.value.length === 0) return 0;
    const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0);
    return (sum / allReviews.value.length).toFixed(1);
});

const fiveStarCount = computed(() => {
    return allReviews.value.filter(r => r.rating === 5).length;
});

// Filter Logic
const filteredReviews = computed(() => {
    let result = allReviews.value;

    // Filter by Rating
    if (filterRating.value) {
        result = result.filter(r => r.rating === filterRating.value);
    }

    // Filter by Search (User, Book, Comment)
    if (search.value) {
        const q = search.value.toLowerCase();
        result = result.filter(r => 
            r.comment?.toLowerCase().includes(q) ||
            r.userId?.username?.toLowerCase().includes(q) ||
            r.bookId?.tenSach?.toLowerCase().includes(q)
        );
    }
    return result;
});

const fetchAllReviews = async () => {
    loading.value = true;
    try {
        const res = await api.get('/reviews/all');
        allReviews.value = res.data;
    } catch (e) { 
        console.error(e);
        snackbar.value = { show: true, message: 'Failed to load reviews', color: 'error' };
    } finally { 
        loading.value = false; 
    }
};

const confirmDelete = (item) => {
    reviewToDelete.value = item;
    deleteDialog.value = true;
};

const executeDelete = async () => {
    try {
        await api.delete(`/reviews/${reviewToDelete.value._id}`);
        snackbar.value = { show: true, message: 'Review deleted', color: 'success' };
        // Xóa trực tiếp khỏi mảng local để đỡ gọi lại API
        allReviews.value = allReviews.value.filter(r => r._id !== reviewToDelete.value._id);
        deleteDialog.value = false;
    } catch (e) { 
        snackbar.value = { show: true, message: 'Delete failed', color: 'error' };
    }
};

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

onMounted(fetchAllReviews);
</script>

<style scoped>
.gap-3 { gap: 12px; }

/* Table Override */
:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { 
    color: #94a3b8 !important; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    font-weight: 700;
}
:deep(.custom-table td) { 
    border-bottom: 1px solid rgba(255,255,255,0.08) !important; 
    padding-top: 12px !important; 
    padding-bottom: 12px !important; 
}
:deep(.custom-table tbody tr:hover) { 
    background-color: rgba(255,255,255,0.03) !important; 
}
</style>