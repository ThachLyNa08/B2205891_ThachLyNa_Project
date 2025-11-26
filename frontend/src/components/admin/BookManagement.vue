<template>
  <div class="book-management-wrapper h-100">
    <!-- TABS NAVIGATION -->
    <v-tabs v-model="currentTab" color="primary" align-tabs="start" class="mb-4 border-b border-opacity-12">
      <v-tab value="all" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-book-multiple</v-icon> All Books
      </v-tab>
      <v-tab value="by-category" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-shape-outline</v-icon> By Category
      </v-tab>
      <v-tab value="categories" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-tag-multiple</v-icon> Categories
      </v-tab>
      <v-tab value="publishers" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-domain</v-icon> Publishers
      </v-tab>
    </v-tabs>

    <v-window v-model="currentTab" class="h-100">
      
      <!-- TAB 1: ALL BOOKS (GRID VIEW) -->
      <v-window-item value="all" class="h-100">
        <v-card class="pa-4 rounded-lg fill-height d-flex flex-column" color="#1e293b" elevation="0">
          
          <!-- Toolbar -->
          <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
            <div class="d-flex align-center" style="min-width: 300px; flex-grow: 1; max-width: 500px;">
               <v-text-field
                v-model="search"
                placeholder="Search books..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                bg-color="rgba(255,255,255,0.05)"
                hide-details
                class="rounded-lg w-100"
                @input="debouncedLoad"
              />
            </div>
            <v-btn color="success" @click="openCreateDialog" prepend-icon="mdi-plus" height="40">Add Book</v-btn>
          </div>

          <!-- Book Grid -->
          <div class="flex-grow-1 overflow-y-auto pr-2 custom-scrollbar">
             <v-row v-if="loading">
                <v-col cols="6" sm="4" md="3" lg="2" v-for="n in 12" :key="n">
                   <v-skeleton-loader type="card" class="bg-transparent rounded-lg"></v-skeleton-loader>
                </v-col>
             </v-row>
             
             <v-row v-else dense>
               <v-col cols="6" sm="4" md="3" lg="2" v-for="book in books" :key="book._id">
                 <v-hover v-slot="{ isHovering, props }">
                   <v-card 
                     v-bind="props"
                     class="book-card rounded-lg transition-swing h-100 d-flex flex-column"
                     color="rgba(255,255,255,0.03)"
                     :elevation="isHovering ? 8 : 0"
                     :class="{'border-primary': isHovering}"
                   >
                     <!-- Ảnh bìa -->
                     <div class="book-cover-wrapper position-relative">
                       <v-img 
                         :src="book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'" 
                         aspect-ratio="2/3" 
                         cover
                       >
                          <!-- Overlay Actions -->
                          <v-expand-transition>
                            <div v-if="isHovering" class="d-flex align-center justify-center fill-height action-overlay">
                               <v-btn icon="mdi-pencil" size="small" color="white" variant="flat" class="mr-2" @click="editBook(book)"></v-btn>
                               <v-btn icon="mdi-delete" size="small" color="red" variant="flat" @click="confirmDeleteBook(book)"></v-btn>
                            </div>
                          </v-expand-transition>
                       </v-img>
                       <!-- Badge tồn kho -->
                       <div class="stock-badge text-caption font-weight-bold px-2 py-0 rounded" :class="book.availableCopies > 0 ? 'bg-success' : 'bg-error'">
                          {{ book.availableCopies }} left
                       </div>
                     </div>
                     
                     <!-- Thông tin -->
                     <div class="pa-3 flex-grow-1 d-flex flex-column">
                       <div class="text-subtitle-2 font-weight-bold text-white text-truncate mb-1" :title="book.tenSach">
                         {{ book.tenSach }}
                       </div>
                       <div class="text-caption text-grey text-truncate mb-2">
                         {{ book.tacGia?.join(', ') || 'Unknown' }}
                       </div>
                       <div class="mt-auto d-flex justify-space-between align-center">
                         <span class="text-primary font-weight-bold text-caption">{{ formatCurrency(book.donGia) }}</span>
                         <v-chip size="x-small" variant="outlined" color="grey" v-if="book.maNXB">
                            {{ book.maNXB.tenNXB }}
                         </v-chip>
                       </div>
                     </div>
                   </v-card>
                 </v-hover>
               </v-col>
             </v-row>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-center pt-4 border-t border-opacity-12 mt-2">
             <v-pagination
                v-model="currentPage"
                :length="Math.ceil(totalBooks / itemsPerPage)"
                :total-visible="5"
                density="compact"
                color="primary"
                @update:model-value="loadBooks"
             ></v-pagination>
          </div>

        </v-card>
      </v-window-item>

      <!-- TAB 2: FILTER BY CATEGORY -->
      <v-window-item value="by-category" class="h-100">
        <v-row class="h-100 ma-0">
          <!-- Sidebar Categories -->
          <v-col cols="12" md="3" class="border-r border-opacity-12 pa-0 h-100 overflow-y-auto custom-scrollbar">
            <v-list bg-color="transparent" density="compact" nav class="pa-2">
              <v-list-subheader class="text-uppercase text-caption text-grey mb-2">Categories</v-list-subheader>
              
              <!-- FIX: Đổi active-color thành color -->
              <v-list-item 
                  value="all_cat" 
                  color="primary" 
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
                  color="primary"
                  :active="selectedCategoryFilter === cat.tenTheLoai" 
                  @click="filterByCategory(cat.tenTheLoai)" 
                  rounded="lg" 
                  class="mb-1 text-white"
              >
                 <template v-slot:prepend><v-icon size="small" :color="getCategoryColor(cat.tenTheLoai)">mdi-circle-medium</v-icon></template>
                 <v-list-item-title>{{ cat.tenTheLoai }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- Book List (Table View for this tab) -->
          <v-col cols="12" md="9" class="pa-4 h-100 d-flex flex-column">
            <div class="d-flex justify-space-between align-center mb-4">
               <h3 class="text-h6 text-white d-flex align-center">
                  <v-icon start :color="getCategoryColor(selectedCategoryFilter)">mdi-bookshelf</v-icon>
                  {{ selectedCategoryFilter || 'All Books' }}
               </h3>
               <v-chip size="small" color="primary" variant="flat">{{ totalBooks }} books found</v-chip>
            </div>
            
            <v-data-table-server
              :headers="headers"
              :items="books"
              :items-length="totalBooks"
              :loading="loading"
              v-model:items-per-page="itemsPerPage"
              v-model:page="currentPage"
              @update:options="loadBooks"
              class="bg-transparent text-white custom-table flex-grow-1"
              density="compact"
              hover
            >
              <template v-slot:item.coverUrl="{ item }">
                <v-avatar size="36" rounded="sm" class="my-1 cursor-pointer border">
                  <v-img :src="item.coverUrl || 'https://placehold.co/100x150'" @click="showImagePreview(item.coverUrl)" cover />
                </v-avatar>
              </template>
              <template v-slot:item.categories="{ item }">
                <div class="d-flex gap-1 flex-wrap">
                    <v-chip v-for="cat in item.categories" :key="cat._id" size="x-small" label :color="getCategoryColor(cat.tenTheLoai)" class="font-weight-bold">
                        {{ cat.tenTheLoai }}
                    </v-chip>
                </div>
              </template>
              <template v-slot:item.actions="{ item }">
                <div class="d-flex justify-end">
                    <v-btn icon="mdi-pencil" size="x-small" color="primary" variant="text" @click="editBook(item)"></v-btn>
                    <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="confirmDeleteBook(item)"></v-btn>
                </div>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="categories"> <CategoryManagement /> </v-window-item>
      <v-window-item value="publishers"> <PublisherManagement /> </v-window-item>
    </v-window>

    <!-- ============================================ -->
    <!-- CREATE / EDIT DIALOG (Đã Fix Upload) -->
    <!-- ============================================ -->
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card color="#1e293b" class="text-white rounded-xl">
        <v-card-title class="bg-primary text-white d-flex align-center px-6 py-4">
            <v-icon start>{{ editedIndex === -1 ? 'mdi-book-plus' : 'mdi-book-edit' }}</v-icon> 
            {{ formTitle }}
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 max-h-80vh overflow-y-auto">
          <v-form ref="bookForm" @submit.prevent="saveBook">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field 
                    v-model="editedItem.tenSach" 
                    label="Book Title" 
                    variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)"
                    :rules="[v => !!v || 'Required']" 
                />
                
                <v-row dense>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="editedItem.tacGia[0]" 
                            label="Author" 
                            variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)"
                            :rules="[v => !!v || 'Required']" 
                        />
                    </v-col>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="editedItem.isbn" 
                            label="ISBN" 
                            variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)"
                        />
                    </v-col>
                </v-row>

                <v-row dense>
                    <v-col cols="6">
                        <v-select 
                            v-model="editedItem.maNXB" 
                            :items="publishers" 
                            item-title="tenNXB" 
                            item-value="_id" 
                            label="Publisher" 
                            variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)"
                            :rules="[v => !!v || 'Required']" 
                        />
                    </v-col>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="editedItem.namXuatBan" 
                            label="Year" type="number" 
                            variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)"
                        />
                    </v-col>
                </v-row>

                <v-autocomplete
                    v-model="editedItem.categories"
                    :items="categories"
                    item-title="tenTheLoai"
                    item-value="_id"
                    label="Categories"
                    multiple chips closable-chips
                    variant="outlined" bg-color="rgba(255,255,255,0.05)"
                    :rules="[v => v && v.length > 0 || 'Select at least one']"
                ></v-autocomplete>

                <v-textarea 
                    v-model="editedItem.moTa" 
                    label="Description" 
                    variant="outlined" bg-color="rgba(255,255,255,0.05)"
                    rows="3" auto-grow
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-3 text-center border-dashed mb-4" color="grey">
                    <div class="text-caption mb-2 text-white">Cover Image</div>
                    <v-img 
                      :src="previewUploadUrl || editedItem.coverUrl || 'https://placehold.co/150x220?text=Preview'" 
                      height="200" contain 
                      class="bg-grey-darken-4 rounded mb-3"
                    />
                    <!-- FIX: Sử dụng v-model="fileInput" (mảng file) -->
                    <v-file-input
                        v-model="fileInput"
                        label="Change Cover"
                        variant="filled" density="compact"
                        prepend-icon="" prepend-inner-icon="mdi-camera"
                        accept="image/*"
                        class="mb-0" hide-details
                        @update:modelValue="handleFileChange"
                    ></v-file-input>
                </v-card>

                <v-card color="rgba(255,255,255,0.05)" class="pa-3 rounded-lg" elevation="0">
                    <div class="text-subtitle-2 font-weight-bold mb-2 text-white">Inventory</div>
                    <v-text-field 
                        v-model="editedItem.donGia" 
                        label="Price" type="number" 
                        variant="outlined" density="compact" prefix="₫"
                        hide-details class="mb-3"
                    />
                    <v-text-field 
                        v-model="editedItem.soQuyen" 
                        label="Total Stock" type="number" 
                        variant="outlined" density="compact" prepend-inner-icon="mdi-counter"
                        hide-details
                    />
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-lighten-1" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" class="px-6 font-weight-bold" @click="saveBook" :loading="loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
       <v-card color="#1e293b" class="text-white">
          <v-card-title class="bg-error text-white">Delete Book</v-card-title>
          <v-card-text class="pt-4">Delete "<strong>{{ bookToDelete?.tenSach }}</strong>"?</v-card-text>
          <v-card-actions class="justify-end pb-4 px-4">
             <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancel</v-btn>
             <v-btn color="error" variant="elevated" @click="deleteBook">Delete</v-btn>
          </v-card-actions>
       </v-card>
    </v-dialog>

    <v-dialog v-model="imageDialog" max-width="500"><v-img :src="previewImageUrl" cover class="rounded-lg" /></v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">{{ snackbar.message }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api.service';
import debounce from 'lodash.debounce';
import CategoryManagement from './CategoryManagement.vue';
import PublisherManagement from './PublisherManagement.vue';

const currentTab = ref('all');
const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const loading = ref(true);
const totalBooks = ref(0);
const itemsPerPage = ref(12);
const currentPage = ref(1);
const search = ref('');
const selectedCategoryFilter = ref(null);

// File Upload State
const fileInput = ref([]); // Vuetify file input model is array
const selectedFile = ref(null);
const previewUploadUrl = ref(null);

const dialog = ref(false);
const deleteDialog = ref(false);
const imageDialog = ref(false);
const previewImageUrl = ref('');
const snackbar = ref({ show: false, message: '', color: '' });

const editedIndex = ref(-1);
// Initialize tacGia as array with empty string to bind to v-model
const editedItem = ref({ tacGia: [''], categories: [] });
const defaultItem = {
    tenSach: '', moTa: '', donGia: 0, soQuyen: 1, namXuatBan: new Date().getFullYear(),
    maNXB: null, tacGia: [''], categories: [], isbn: '', coverUrl: '',
};
const bookToDelete = ref(null);
const bookForm = ref(null);

const headers = [
    { title: 'Cover', key: 'coverUrl', sortable: false, width: '50px' },
    { title: 'Title', key: 'tenSach', width: '30%' },
    { title: 'Publisher', key: 'maNXB' },
    { title: 'Categories', key: 'categories' },
    { title: 'Stock', key: 'availableCopies', align: 'center' },
    { title: 'Price', key: 'donGia', align: 'end' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Book' : 'Edit Book'));
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const getCategoryColor = (catName) => {
    if (!catName) return 'grey';
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    let hash = 0;
    for (let i = 0; i < catName.length; i++) hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

// --- FIX: XỬ LÝ FILE CHUẨN CHO VUETIFY 3 ---
const handleFileChange = (files) => {
    // files là mảng các file do v-model trả về
    if (files && files.length > 0) {
        const file = files[0];
        selectedFile.value = file;
        // Tạo preview URL
        if (previewUploadUrl.value) URL.revokeObjectURL(previewUploadUrl.value);
        previewUploadUrl.value = URL.createObjectURL(file);
    } else {
        selectedFile.value = null;
        if (previewUploadUrl.value) URL.revokeObjectURL(previewUploadUrl.value);
        previewUploadUrl.value = null;
    }
};

const loadBooks = debounce(async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: search.value,
            category: selectedCategoryFilter.value,
        };
        const response = await api.get('/books', { params });
        books.value = response.data.data;
        totalBooks.value = response.data.total;
    } catch (error) { 
        showSnack('Failed to load books', 'error');
    } 
    finally { loading.value = false; }
}, 300);

const fetchMetadata = async () => {
    try {
        const [catRes, pubRes] = await Promise.all([
            api.get('/categories'),
            api.get('/publishers')
        ]);
        categories.value = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || []);
        publishers.value = Array.isArray(pubRes.data) ? pubRes.data : (pubRes.data.data || []);
    } catch (e) { console.error(e); }
};

const debouncedLoad = debounce(() => { currentPage.value = 1; loadBooks(); }, 500);
const filterByCategory = (catName) => { selectedCategoryFilter.value = catName; currentPage.value = 1; loadBooks(); };

const openCreateDialog = async () => {
    await fetchMetadata();
    editedItem.value = JSON.parse(JSON.stringify(defaultItem));
    fileInput.value = []; // Reset file input
    selectedFile.value = null;
    previewUploadUrl.value = null;
    editedIndex.value = -1;
    dialog.value = true;
};

const editBook = async (item) => {
    await fetchMetadata();
    editedIndex.value = books.value.indexOf(item);
    const copy = JSON.parse(JSON.stringify(item));
    
    editedItem.value = {
        ...copy,
        maNXB: copy.maNXB?._id || copy.maNXB,
        categories: copy.categories.map(c => c._id || c),
        tacGia: copy.tacGia?.length ? copy.tacGia : ['']
    };
    
    fileInput.value = []; // Reset file input
    selectedFile.value = null;
    previewUploadUrl.value = null;
    dialog.value = true;
};

const saveBook = async () => {
    const { valid } = await bookForm.value.validate();
    if (!valid) return;
    
    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('tenSach', editedItem.value.tenSach);
        
        // Các trường optional
        if(editedItem.value.maNXB) formData.append('maNXB', editedItem.value.maNXB);
        formData.append('donGia', editedItem.value.donGia || 0);
        formData.append('soQuyen', editedItem.value.soQuyen || 0);
        if(editedItem.value.isbn) formData.append('isbn', editedItem.value.isbn);
        if(editedItem.value.namXuatBan) formData.append('namXuatBan', editedItem.value.namXuatBan);
        if(editedItem.value.moTa) formData.append('moTa', editedItem.value.moTa);

        // Array Fields (JSON.stringify)
        const validAuthors = editedItem.value.tacGia.filter(a => a && a.trim());
        formData.append('tacGia', JSON.stringify(validAuthors));
        
        if (editedItem.value.categories?.length) {
             formData.append('categories', JSON.stringify(editedItem.value.categories));
        }

        // File Upload
        if (selectedFile.value) {
            formData.append('coverImage', selectedFile.value);
        }

        if (editedIndex.value > -1) {
            await api.put(`/books/${editedItem.value._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showSnack('Book updated successfully!', 'success');
        } else {
            await api.post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showSnack('Book created successfully!', 'success');
        }
        
        dialog.value = false;
        loadBooks();
    } catch (e) {
        showSnack(e.response?.data?.message || "Error saving book", 'error');
    } finally {
        loading.value = false;
    }
};

const confirmDeleteBook = (item) => { bookToDelete.value = item; deleteDialog.value = true; };
const deleteBook = async () => {
     try {
        await api.delete(`/books/${bookToDelete.value._id}`);
        showSnack('Deleted successfully', 'success');
        deleteDialog.value = false;
        loadBooks();
    } catch (e) { showSnack('Delete failed', 'error'); }
};

const showImagePreview = (url) => { if(url) { previewImageUrl.value = url; imageDialog.value = true; } };
const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };

watch(currentTab, () => { search.value = ''; selectedCategoryFilter.value = null; currentPage.value = 1; loadBooks(); });
onMounted(() => { fetchMetadata(); loadBooks(); });
</script>

<style scoped>
.gap-2 { gap: 8px; }
.border-dashed { border-style: dashed !important; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.max-h-80vh { max-height: 80vh; }

/* Card Styles */
.book-card { border: 1px solid rgba(255,255,255,0.05); }
.border-primary { border-color: #2196F3 !important; box-shadow: 0 0 15px rgba(33,150,243,0.3); }
.action-overlay { background: rgba(0,0,0,0.6); position: absolute; top:0; width:100%; }
.stock-badge { position: absolute; top: 8px; right: 8px; z-index: 2; }

/* Table Fixes */
:deep(.custom-table) { color: white !important; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.05) !important; }
.cursor-pointer { cursor: pointer; }
</style>