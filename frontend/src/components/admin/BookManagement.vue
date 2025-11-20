<template>
  <div class="book-management-wrapper">
    <v-tabs v-model="currentTab" color="primary" align-tabs="start" class="mb-6 border-b border-opacity-12">
      <v-tab value="all" class="text-capitalize"><v-icon start>mdi-book-multiple</v-icon> All Books</v-tab>
      <v-tab value="by-category" class="text-capitalize"><v-icon start>mdi-shape-outline</v-icon> Books by Category</v-tab>
      <v-tab value="categories" class="text-capitalize"><v-icon start>mdi-cog-outline</v-icon> Category Settings</v-tab>
      <v-tab value="publishers" class="text-capitalize"><v-icon start>mdi-domain</v-icon> Publisher Settings</v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
      
      <v-window-item value="all">
        <v-card class="pa-4 rounded-lg" color="#1e293b" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h6 text-white">Overview</h2>
            <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">Add Book</v-btn>
          </div>

          <v-text-field
            v-model="search"
            placeholder="Search by title, author, ISBN..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            bg-color="#0f172a"
            color="white"
            hide-details
            class="mb-4 rounded-lg"
            @input="debouncedLoad"
          />

          <v-data-table-server
            :headers="headers"
            :items="books"
            :items-length="totalBooks"
            :loading="loading"
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            @update:options="loadBooks"
            class="elevation-1 bg-transparent text-white custom-table"
            hover
          >
            <template v-slot:item.coverUrl="{ item }">
              <v-avatar size="40" rounded="sm" class="my-2 cursor-pointer">
                <v-img :src="item.coverUrl || 'https://via.placeholder.com/40'" @click="showImagePreview(item.coverUrl)" />
              </v-avatar>
            </template>
            <template v-slot:item.maNXB="{ item }"> {{ item.maNXB?.tenNXB || 'N/A' }} </template>
            
            <template v-slot:item.categories="{ item }">
              <div class="d-flex flex-wrap gap-1">
                <template v-for="cat in item.categories" :key="cat._id || cat">
                  <v-chip 
                    v-if="cat && cat.tenTheLoai"
                    :color="getCategoryColor(cat.tenTheLoai)" 
                    variant="flat" 
                    size="x-small" 
                    class="font-weight-bold text-white"
                  >
                    {{ cat.tenTheLoai }}
                  </v-chip>
                </template>
              </div>
            </template>

            <template v-slot:item.availableCopies="{ item }">
              <v-chip :color="item.availableCopies > 0 ? 'success' : 'error'" size="small" variant="tonal" class="font-weight-bold">
                {{ item.availableCopies }} / {{ item.soQuyen }}
              </v-chip>
            </template>
            <template v-slot:item.donGia="{ item }"> {{ formatCurrency(item.donGia) }} </template>
            <template v-slot:item.actions="{ item }">
              <v-icon small class="mr-2" color="primary" @click="editBook(item)">mdi-pencil</v-icon>
              <v-icon small color="error" @click="confirmDeleteBook(item)">mdi-delete</v-icon>
            </template>
          </v-data-table-server>
        </v-card>
      </v-window-item>

      <v-window-item value="by-category">
        <v-row class="match-height">
          <v-col cols="12" md="3">
            <v-card color="#1e293b" class="h-100 rounded-lg pa-2" elevation="0">
              <v-list bg-color="transparent" density="compact" nav>
                <v-list-subheader class="text-uppercase text-caption text-grey mb-2">Select Category</v-list-subheader>
                
                <v-list-item
                  value="all_cat"
                  active-color="primary"
                  :active="!selectedCategoryFilter"
                  @click="filterByCategory(null)"
                  rounded="lg"
                  class="mb-1 text-white"
                >
                  <template v-slot:prepend><v-icon size="small">mdi-apps</v-icon></template>
                  <v-list-item-title>All Categories</v-list-item-title>
                </v-list-item>

                <v-divider class="my-2 border-opacity-12"></v-divider>

                <v-list-item
                  v-for="cat in categories"
                  :key="cat._id"
                  :value="cat.tenTheLoai"
                  active-color="primary"
                  :active="selectedCategoryFilter === cat.tenTheLoai"
                  @click="filterByCategory(cat.tenTheLoai)"
                  rounded="lg"
                  class="mb-1 text-white"
                >
                   <template v-slot:prepend>
                      <v-icon size="small" :color="getCategoryColor(cat.tenTheLoai)">mdi-circle</v-icon>
                   </template>
                   <v-list-item-title>{{ cat.tenTheLoai }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="9">
            <v-card color="#1e293b" class="h-100 rounded-lg pa-4" elevation="0">
              <div class="d-flex justify-space-between align-center mb-4">
                 <h3 class="text-h6 text-white">
                    <v-icon start :color="getCategoryColor(selectedCategoryFilter)">mdi-bookshelf</v-icon>
                    {{ selectedCategoryFilter || 'All Books' }}
                 </h3>
                 <v-chip size="small" color="primary" variant="flat">{{ totalBooks }} books</v-chip>
              </div>

              <v-data-table-server
                :headers="headers"
                :items="books"
                :items-length="totalBooks"
                :loading="loading"
                v-model:items-per-page="itemsPerPage"
                v-model:page="currentPage"
                @update:options="loadBooks"
                class="elevation-1 bg-transparent text-white custom-table"
                hover
              >
                <template v-slot:item.coverUrl="{ item }">
                  <v-avatar size="40" rounded="sm" class="my-2 cursor-pointer">
                    <v-img :src="item.coverUrl || 'https://via.placeholder.com/40'" @click="showImagePreview(item.coverUrl)" />
                  </v-avatar>
                </template>
                <template v-slot:item.maNXB="{ item }"> {{ item.maNXB?.tenNXB || 'N/A' }} </template>
                
                <template v-slot:item.categories="{ item }">
                  <div class="d-flex flex-wrap gap-1">
                    <template v-for="cat in item.categories" :key="cat._id || cat">
                      <v-chip 
                        v-if="cat && cat.tenTheLoai"
                        :color="getCategoryColor(cat.tenTheLoai)" 
                        variant="flat" 
                        size="x-small" 
                        class="font-weight-bold text-white"
                      >
                        {{ cat.tenTheLoai }}
                      </v-chip>
                    </template>
                  </div>
                </template>

                <template v-slot:item.availableCopies="{ item }">
                  <v-chip :color="item.availableCopies > 0 ? 'success' : 'error'" size="small" variant="tonal" class="font-weight-bold">
                    {{ item.availableCopies }} / {{ item.soQuyen }}
                  </v-chip>
                </template>
                <template v-slot:item.donGia="{ item }"> {{ formatCurrency(item.donGia) }} </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon small class="mr-2" color="primary" @click="editBook(item)">mdi-pencil</v-icon>
                  <v-icon small color="error" @click="confirmDeleteBook(item)">mdi-delete</v-icon>
                </template>
              </v-data-table-server>

            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="categories"> <CategoryManagement /> </v-window-item>
      <v-window-item value="publishers"> <PublisherManagement /> </v-window-item>
    </v-window>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title><span class="text-h5">{{ formTitle }}</span></v-card-title>
        <v-card-text>
          <v-form ref="bookForm" @submit.prevent="saveBook">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.tenSach" label="Book Title" variant="outlined" density="compact" :rules="[v => !!v || 'Required']" />
                <v-text-field v-if="editedItem.tacGia" v-model="editedItem.tacGia[0]" label="Author" variant="outlined" density="compact" :rules="[v => !!v || 'Required']" />
                <v-text-field v-model="editedItem.isbn" label="ISBN" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.namXuatBan" label="Year" type="number" variant="outlined" density="compact" />
                <v-select v-model="editedItem.maNXB" :items="publishers" item-title="tenNXB" item-value="_id" label="Publisher" variant="outlined" density="compact" :rules="[v => !!v || 'Required']" />
                <v-select v-model="editedItem.categories" :items="categories" item-title="tenTheLoai" item-value="_id" label="Categories" multiple chips variant="outlined" density="compact" :rules="[v => v && v.length > 0 || 'Required']" />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="editedItem.moTa" label="Description" variant="outlined" rows="3" />
                <v-text-field v-model="editedItem.donGia" label="Price" type="number" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.soQuyen" label="Total Copies" type="number" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.coverUrl" label="Image URL" variant="outlined" density="compact" />
                <v-img :src="editedItem.coverUrl || 'https://via.placeholder.com/150'" height="120" contain class="mt-2 bg-grey-lighten-4 rounded" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveBook">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
       <v-card>
          <v-card-title>Confirm Delete</v-card-title>
          <v-card-text>Delete "{{ bookToDelete?.tenSach }}"?</v-card-text>
          <v-card-actions>
             <v-spacer></v-spacer>
             <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancel</v-btn>
             <v-btn color="error" variant="flat" @click="deleteBook">Delete</v-btn>
          </v-card-actions>
       </v-card>
    </v-dialog>

    <v-dialog v-model="imageDialog" max-width="500"><v-img :src="previewImageUrl" cover /></v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '../../services/api.service';
import debounce from 'lodash.debounce';
import CategoryManagement from './CategoryManagement.vue';
import PublisherManagement from './PublisherManagement.vue';

// --- STATE ---
const currentTab = ref('all');
const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const loading = ref(true);
const totalBooks = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const selectedCategoryFilter = ref(null);

// Dialogs
const dialog = ref(false);
const deleteDialog = ref(false);
const imageDialog = ref(false);
const previewImageUrl = ref('');
const snackbar = ref({ show: false, message: '', color: '' });

// Edit State
const editedIndex = ref(-1);
const editedItem = ref({ tacGia: [''], categories: [] });
const defaultItem = {
    tenSach: '', moTa: '', donGia: 0, soQuyen: 1, namXuatBan: null,
    maNXB: null, tacGia: [''], categories: [], isbn: '', coverUrl: '',
};
const bookToDelete = ref(null);
const bookForm = ref(null);
const dialogError = ref(null);

const headers = [
    { title: 'Cover', key: 'coverUrl', sortable: false, width: '60px' },
    { title: 'Title', key: 'tenSach', width: '200px' },
    { title: 'Publisher', key: 'maNXB' },
    { title: 'Categories', key: 'categories' },
    { title: 'Stock', key: 'availableCopies', align: 'center' },
    { title: 'Price', key: 'donGia', align: 'end' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Book' : 'Edit Book'));

// --- HELPERS ---
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

// HÀM MÀU SẮC ĐÃ ĐƯỢC KHÔI PHỤC ĐẦY ĐỦ
const getCategoryColor = (catName) => {
    if (!catName) return 'grey';
    const lower = catName.toLowerCase();
    if (lower.includes('fantasy')) return '#8E24AA'; // Tím
    if (lower.includes('sci')) return '#1E88E5';     // Xanh dương
    if (lower.includes('history') || lower.includes('lịch sử')) return '#F57C00'; // Cam
    if (lower.includes('mystery')) return '#00897B'; // Xanh Teal
    if (lower.includes('thiếu nhi')) return '#43A047'; // Xanh lá
    if (lower.includes('văn học')) return '#D81B60'; // Hồng đậm
    if (lower.includes('kinh tế')) return '#5D4037'; // Nâu
    if (lower.includes('tâm lý') || lower.includes('kỹ năng')) return '#00ACC1'; // Cyan
    if (lower.includes('truyện tranh') || lower.includes('comic')) return '#FFC107'; // Vàng
    return 'primary'; // Mặc định
};

// --- LOAD DATA ---
const loadBooks = debounce(async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: search.value,
            category: selectedCategoryFilter.value,
        };
        Object.keys(params).forEach(key => !params[key] && delete params[key]);

        const response = await api.get('/books', { params });
        books.value = response.data.data;
        totalBooks.value = response.data.total;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
}, 300);

const fetchMetadata = async () => {
    try {
        const [catRes, pubRes] = await Promise.all([api.get('/categories'), api.get('/publishers')]);
        categories.value = catRes.data;
        publishers.value = pubRes.data;
    } catch (e) {}
};

// --- ACTIONS ---
const filterByCategory = (catName) => {
    selectedCategoryFilter.value = catName;
    currentPage.value = 1;
    loadBooks();
};

const debouncedLoad = debounce(() => { currentPage.value = 1; loadBooks(); }, 500);

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem, tacGia: [''], categories: [] };
    editedIndex.value = -1;
    dialog.value = true;
};
const editBook = (item) => {
    editedIndex.value = books.value.indexOf(item);
    const copy = JSON.parse(JSON.stringify(item));
    editedItem.value = {
        ...copy,
        maNXB: copy.maNXB?._id || copy.maNXB,
        categories: copy.categories.map(c => c._id || c),
        tacGia: copy.tacGia?.length ? copy.tacGia : ['']
    };
    dialog.value = true;
};
const saveBook = async () => {
     try {
        const payload = { ...editedItem.value };
        if (payload.tacGia) payload.tacGia = payload.tacGia.filter(a => a.trim());
        delete payload._id;

        if (editedIndex.value > -1) {
            await api.put(`/books/${editedItem.value._id}`, payload);
            snackbar.value = { show: true, message: 'Updated!', color: 'success' };
        } else {
            await api.post('/books', payload);
            snackbar.value = { show: true, message: 'Created!', color: 'success' };
        }
        dialog.value = false;
        loadBooks();
    } catch (e) {
        dialogError.value = e.response?.data?.message || "Error";
    }
};
const confirmDeleteBook = (item) => { bookToDelete.value = item; deleteDialog.value = true; };
const deleteBook = async () => {
     try {
        await api.delete(`/books/${bookToDelete.value._id}`);
        deleteDialog.value = false;
        loadBooks();
    } catch(e) {}
};
const showImagePreview = (url) => { previewImageUrl.value = url; imageDialog.value = true; };

// Watcher
watch(currentTab, () => {
    search.value = '';
    selectedCategoryFilter.value = null;
    currentPage.value = 1;
    loadBooks();
});

onMounted(() => {
    fetchMetadata();
    loadBooks();
});
</script>

<style scoped>
.gap-1 { gap: 4px; }
.custom-table { color: white !important; }
:deep(.custom-table td) { border-bottom: 1px solid #334155 !important; }
:deep(.custom-table tbody tr:hover) { background-color: #1e293b !important; }
</style>