<template>
  <div class="book-management-wrapper h-100">
    
    <v-tabs v-model="currentTab" color="primary" align-tabs="start" class="mb-4 border-b border-opacity-12">
      <v-tab value="all" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-book-multiple</v-icon> All Books
      </v-tab>
      <v-tab value="by-category" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-shape-outline</v-icon> By Category
      </v-tab>
      <v-tab value="by-publisher" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-office-building-outline</v-icon> By Publisher
      </v-tab>
      <v-tab value="by-author" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-account-group-outline</v-icon> By Author
      </v-tab>
    </v-tabs>

    <v-window v-model="currentTab" class="h-100">
      
      <v-window-item value="all" class="h-100">
        <v-card class="pa-4 rounded-lg fill-height d-flex flex-column" color="#1e293b" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
            <div class="d-flex align-center" style="min-width: 300px; flex-grow: 1; max-width: 500px;">
               <v-text-field
                v-model="search"
                placeholder="Search title, ISBN..."
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
                     <div class="book-cover-wrapper position-relative">
                       <v-img 
                         :src="book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'" 
                         aspect-ratio="2/3" 
                         cover
                       >
                          <v-expand-transition>
                            <div v-if="isHovering" class="d-flex align-center justify-center fill-height action-overlay">
                               <v-btn icon="mdi-pencil" size="small" color="white" variant="flat" class="mr-2" @click="editBook(book)"></v-btn>
                               <v-btn icon="mdi-delete" size="small" color="red" variant="flat" @click="confirmDeleteBook(book)"></v-btn>
                            </div>
                          </v-expand-transition>
                       </v-img>
                       <div class="stock-badge text-caption font-weight-bold px-2 py-0 rounded" :class="book.availableCopies > 0 ? 'bg-success' : 'bg-error'">
                          {{ book.availableCopies }} left
                       </div>
                     </div>
                     <div class="pa-3 flex-grow-1 d-flex flex-column">
                       <div class="text-subtitle-2 font-weight-bold text-white text-truncate mb-1" :title="book.tenSach">{{ book.tenSach }}</div>
                       <div class="text-caption text-grey text-truncate mb-2">{{ book.tacGia?.join(', ') || 'Unknown' }}</div>
                       <div class="mt-auto d-flex justify-space-between align-center">
                         <span class="text-primary font-weight-bold text-caption">{{ formatCurrency(book.donGia) }}</span>
                         <v-chip size="x-small" variant="outlined" color="grey" v-if="book.maNXB">{{ book.maNXB?.tenNXB }}</v-chip>
                       </div>
                     </div>
                   </v-card>
                 </v-hover>
               </v-col>
             </v-row>
          </div>
          <div class="d-flex justify-center pt-4 border-t border-opacity-12 mt-2">
             <v-pagination v-model="currentPage" :length="Math.ceil(totalBooks / itemsPerPage)" :total-visible="5" density="compact" color="primary" @update:model-value="loadBooks"></v-pagination>
          </div>
        </v-card>
      </v-window-item>

      <v-window-item value="by-category" class="h-100">
        <v-row class="h-100 ma-0">
          <v-col cols="12" md="3" class="border-r border-opacity-12 pa-4 h-100 bg-slate-900">
            <div class="font-weight-bold text-white mb-4 d-flex align-center">
                <v-icon start color="primary">mdi-shape-outline</v-icon> FILTER CATEGORY
            </div>
            
            <v-autocomplete
                v-model="selectedFilter.category"
                :items="categories"
                item-title="tenTheLoai"
                item-value="tenTheLoai"
                label="Select Category"
                placeholder="Type to search..."
                variant="outlined"
                density="comfortable"
                bg-color="rgba(255,255,255,0.05)"
                clearable
                hide-details
                class="rounded-lg"
                @update:model-value="applyFilter('category', $event)"
            >
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.tenTheLoai">
                        <template v-slot:prepend>
                             <v-icon size="small" :color="getCategoryColor(item.raw.tenTheLoai)" class="mr-2">mdi-circle-medium</v-icon>
                        </template>
                    </v-list-item>
                </template>
            </v-autocomplete>

            <v-alert v-if="selectedFilter.category" type="info" variant="tonal" class="mt-4 text-caption" density="compact">
                Showing books in <strong>{{ selectedFilter.category }}</strong>
            </v-alert>
          </v-col>
          
          <v-col cols="12" md="9" class="pa-4 h-100 d-flex flex-column">
             <BookTable :books="books" :loading="loading" :total="totalBooks" title="Books by Category" icon="mdi-bookshelf" v-model:page="currentPage" v-model:limit="itemsPerPage" @refresh="loadBooks" @edit="editBook" @delete="confirmDeleteBook" />
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="by-publisher" class="h-100">
        <v-row class="h-100 ma-0">
          <v-col cols="12" md="3" class="border-r border-opacity-12 pa-4 h-100 bg-slate-900">
            <div class="font-weight-bold text-white mb-4 d-flex align-center">
                <v-icon start color="primary">mdi-office-building-outline</v-icon> FILTER PUBLISHER
            </div>
            
            <v-autocomplete
                v-model="selectedFilter.publisher"
                :items="publishers"
                item-title="tenNXB"
                item-value="_id"
                label="Select Publisher"
                placeholder="Find publisher..."
                variant="outlined"
                density="comfortable"
                bg-color="rgba(255,255,255,0.05)"
                clearable
                hide-details
                class="rounded-lg"
                @update:model-value="applyFilter('publisher', $event)"
            ></v-autocomplete>

            <v-alert v-if="selectedFilter.publisher" type="info" variant="tonal" class="mt-4 text-caption" density="compact">
                Filtering by selected publisher
            </v-alert>
          </v-col>
          
          <v-col cols="12" md="9" class="pa-4 h-100 d-flex flex-column">
             <BookTable :books="books" :loading="loading" :total="totalBooks" title="Books by Publisher" icon="mdi-office-building" v-model:page="currentPage" v-model:limit="itemsPerPage" @refresh="loadBooks" @edit="editBook" @delete="confirmDeleteBook" />
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="by-author" class="h-100">
        <v-row class="h-100 ma-0">
          <v-col cols="12" md="3" class="border-r border-opacity-12 pa-4 h-100 bg-slate-900">
            <div class="font-weight-bold text-white mb-4 d-flex align-center">
                <v-icon start color="primary">mdi-account-group-outline</v-icon> FILTER AUTHOR
            </div>
            
            <v-autocomplete
                v-model="selectedFilter.author"
                :items="extractedAuthors"
                label="Select Author"
                placeholder="Type name..."
                variant="outlined"
                density="comfortable"
                bg-color="rgba(255,255,255,0.05)"
                clearable
                hide-details
                class="rounded-lg"
                @update:model-value="applyFilter('author', $event)"
            ></v-autocomplete>

             <v-alert v-if="selectedFilter.author" type="info" variant="tonal" class="mt-4 text-caption" density="compact">
                Books by <strong>{{ selectedFilter.author }}</strong>
            </v-alert>
          </v-col>

          <v-col cols="12" md="9" class="pa-4 h-100 d-flex flex-column">
             <BookTable :books="books" :loading="loading" :total="totalBooks" title="Books by Author" icon="mdi-account-edit" v-model:page="currentPage" v-model:limit="itemsPerPage" @refresh="loadBooks" @edit="editBook" @delete="confirmDeleteBook" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card color="#1e293b" class="text-white rounded-xl">
        <v-card-title class="bg-primary text-white d-flex align-center px-6 py-4">
            <v-icon start>{{ editedIndex === -1 ? 'mdi-book-plus' : 'mdi-book-edit' }}</v-icon> {{ formTitle }}
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 max-h-80vh overflow-y-auto">
          <v-form ref="bookForm" @submit.prevent="saveBook">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field v-model="editedItem.tenSach" label="Book Title" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" :rules="[v => !!v || 'Required']" />
                <v-row dense>
                    <v-col cols="6">
                        <v-combobox v-model="editedItem.tacGia" label="Authors" multiple chips closable-chips variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)" hint="Press Enter to add multiple" persistent-hint></v-combobox>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="editedItem.isbn" label="ISBN" variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)" />
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col cols="6">
                        <v-select v-model="editedItem.maNXB" :items="publishers" item-title="tenNXB" item-value="_id" label="Publisher" variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)" :rules="[v => !!v || 'Required']" />
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="editedItem.namXuatBan" label="Year" type="number" variant="outlined" density="compact" bg-color="rgba(255,255,255,0.05)" />
                    </v-col>
                </v-row>
                <v-autocomplete v-model="editedItem.categories" :items="categories" item-title="tenTheLoai" item-value="_id" label="Categories" multiple chips closable-chips variant="outlined" bg-color="rgba(255,255,255,0.05)" :rules="[v => v && v.length > 0 || 'Select at least one']"></v-autocomplete>
                <v-textarea v-model="editedItem.moTa" label="Description" variant="outlined" bg-color="rgba(255,255,255,0.05)" rows="3" auto-grow />
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-3 text-center border-dashed mb-4" color="grey">
                    <div class="text-caption mb-2 text-white">Cover Image</div>
                    <v-img :src="previewUploadUrl || editedItem.coverUrl || 'https://placehold.co/150x220?text=Preview'" height="200" contain class="bg-grey-darken-4 rounded mb-3" />
                    <v-file-input 
    v-model="fileInput" 
    label="Change Cover" 
    variant="filled" 
    density="compact" 
    prepend-icon="" 
    prepend-inner-icon="mdi-camera" 
    accept="image/*" 
    class="mb-0" 
    hide-details 
    @update:modelValue="handleFileChange" 
></v-file-input>
                </v-card>
                <v-card color="rgba(255,255,255,0.05)" class="pa-3 rounded-lg" elevation="0">
                    <div class="text-subtitle-2 font-weight-bold mb-2 text-white">Inventory</div>
                    <v-text-field v-model="editedItem.donGia" label="Price" type="number" variant="outlined" density="compact" prefix="₫" hide-details class="mb-3" />
                    <v-text-field v-model="editedItem.soQuyen" label="Total Stock" type="number" variant="outlined" density="compact" prepend-inner-icon="mdi-counter" hide-details />
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
import { ref, computed, onMounted, watch, defineComponent, h } from 'vue';
import api from '@/services/api.service';
import debounce from 'lodash.debounce';
import { VDataTableServer, VBtn, VChip, VIcon, VAvatar, VImg } from 'vuetify/components';

// --- [FIX 1] DEFINE HELPER FUNCTION HERE SO IT'S AVAILABLE IN TEMPLATE ---
const getCategoryColor = (catName) => {
    if (!catName) return 'grey';
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B'];
    let hash = 0; for (let i = 0; i < catName.length; i++) hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

// --- IN-FILE COMPONENT: BookTable (Reusable) ---
const BookTable = defineComponent({
  props: ['books', 'loading', 'total', 'title', 'icon', 'page', 'limit'],
  emits: ['update:page', 'update:limit', 'refresh', 'edit', 'delete'],
  setup(props, { emit }) {
    const headers = [
      { title: 'Cover', key: 'coverUrl', sortable: false, width: '50px' },
      { title: 'Title', key: 'tenSach', width: '30%' },
      { title: 'Publisher', key: 'maNXB' },
      { title: 'Categories', key: 'categories' },
      { title: 'Stock', key: 'availableCopies', align: 'center' },
      { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
    ];
    
    return () => h('div', { class: 'd-flex flex-column h-100' }, [
      h('div', { class: 'd-flex justify-space-between align-center mb-4' }, [
         h('h3', { class: 'text-h6 text-white d-flex align-center' }, [
            h(VIcon, { start: true, color: 'primary' }, () => props.icon),
            props.title
         ]),
         h(VChip, { size: 'small', color: 'primary', variant: 'flat' }, () => `${props.total} books`)
      ]),
      h(VDataTableServer, {
        headers, items: props.books, itemsLength: props.total, loading: props.loading,
        itemsPerPage: props.limit, page: props.page,
        'onUpdate:itemsPerPage': (v) => emit('update:limit', v),
        'onUpdate:page': (v) => emit('update:page', v),
        'onUpdate:options': () => emit('refresh'),
        class: 'bg-transparent text-white custom-table flex-grow-1', density: 'compact', hover: true
      }, {
        'item.coverUrl': ({ item }) => h(VAvatar, { size: 36, rounded: 'sm', class: 'my-1 border' }, () => h(VImg, { src: item.coverUrl || 'https://placehold.co/100x150', cover: true })),
        'item.maNXB': ({ item }) => item.maNXB?.tenNXB || 'Unknown',
        'item.categories': ({ item }) => h('div', { class: 'd-flex gap-1 flex-wrap' }, item.categories.map(c => h(VChip, { size: 'x-small', label: true, color: getCategoryColor(c.tenTheLoai) }, () => c.tenTheLoai))),
        'item.actions': ({ item }) => h('div', { class: 'd-flex justify-end' }, [
            h(VBtn, { icon: 'mdi-pencil', size: 'x-small', color: 'primary', variant: 'text', onClick: () => emit('edit', item) }),
            h(VBtn, { icon: 'mdi-delete', size: 'x-small', color: 'error', variant: 'text', onClick: () => emit('delete', item) })
        ])
      })
    ]);
  }
});

// --- MAIN COMPONENT LOGIC ---
const currentTab = ref('all');
const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const extractedAuthors = ref([]); 
const loading = ref(true);
const totalBooks = ref(0);
const itemsPerPage = ref(12);
const currentPage = ref(1);
const search = ref('');

// Bộ lọc
const selectedFilter = ref({
    category: null,
    publisher: null,
    author: null
});

// File Upload
const fileInput = ref([]);
const selectedFile = ref(null);
const previewUploadUrl = ref(null);

const dialog = ref(false);
const deleteDialog = ref(false);
const imageDialog = ref(false);
const previewImageUrl = ref('');
const snackbar = ref({ show: false, message: '', color: '' });

const editedIndex = ref(-1);
const editedItem = ref({ tacGia: [], categories: [] });
const defaultItem = {
    tenSach: '', moTa: '', donGia: 0, soQuyen: 1, namXuatBan: new Date().getFullYear(),
    maNXB: null, tacGia: [], categories: [], isbn: '', coverUrl: '',
};
const bookToDelete = ref(null);
const bookForm = ref(null);

const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Book' : 'Edit Book'));
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

// --- METHODS ---
const handleFileChange = (files) => {
    // Vuetify 3 trả về mảng các file, ta lấy file đầu tiên
    const file = Array.isArray(files) ? files[0] : files;

    if (file) {
        selectedFile.value = file;
        // Xóa URL cũ để tránh rò rỉ bộ nhớ
        if (previewUploadUrl.value) {
            URL.revokeObjectURL(previewUploadUrl.value);
        }
        // Tạo URL tạm thời để hiển thị preview
        previewUploadUrl.value = URL.createObjectURL(file);
    } else {
        selectedFile.value = null;
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
            category: currentTab.value === 'by-category' ? selectedFilter.value.category : null,
            publisher: currentTab.value === 'by-publisher' ? selectedFilter.value.publisher : null,
            author: currentTab.value === 'by-author' ? selectedFilter.value.author : null,
        };
        Object.keys(params).forEach(k => params[k] == null && delete params[k]);

        const response = await api.get('/books', { params });
        books.value = response.data.data;
        totalBooks.value = response.data.total;
    } catch (error) { showSnack('Failed to load books', 'error'); } 
    finally { loading.value = false; }
}, 300);

const applyFilter = (type, val) => {
    selectedFilter.value[type] = val;
    currentPage.value = 1;
    loadBooks();
};

const fetchMetadata = async () => {
    try {
        const [catRes, pubRes, allBooksRes] = await Promise.all([
            api.get('/categories'),
            api.get('/publishers'),
            api.get('/books?limit=2000') 
        ]);
        categories.value = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || []);
        publishers.value = Array.isArray(pubRes.data) ? pubRes.data : (pubRes.data.data || []);
        
        const allBooks = allBooksRes.data.data || [];
        const authorSet = new Set();
        allBooks.forEach(b => {
            if (Array.isArray(b.tacGia)) b.tacGia.forEach(a => a && authorSet.add(a.trim()));
            else if (typeof b.tacGia === 'string') authorSet.add(b.tacGia);
        });
        extractedAuthors.value = Array.from(authorSet).sort();
    } catch (e) { console.error(e); }
};

const debouncedLoad = debounce(() => { currentPage.value = 1; loadBooks(); }, 500);

const openCreateDialog = async () => {
    await fetchMetadata();
    editedItem.value = JSON.parse(JSON.stringify(defaultItem));
    fileInput.value = []; selectedFile.value = null; previewUploadUrl.value = null;
    editedIndex.value = -1; dialog.value = true;
};

const editBook = async (item) => {
    await fetchMetadata();
    editedIndex.value = books.value.indexOf(item);
    const copy = JSON.parse(JSON.stringify(item));
    
    editedItem.value = {
        ...copy,
        maNXB: copy.maNXB?._id || copy.maNXB,
        categories: copy.categories.map(c => c._id || c),
        tacGia: Array.isArray(copy.tacGia) ? copy.tacGia : (copy.tacGia ? [copy.tacGia] : [])
    };
    
    fileInput.value = []; selectedFile.value = null; previewUploadUrl.value = null;
    dialog.value = true;
};

const saveBook = async () => {
    const { valid } = await bookForm.value.validate();
    if (!valid) return;
    
    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('tenSach', editedItem.value.tenSach);
        if(editedItem.value.maNXB) formData.append('maNXB', editedItem.value.maNXB);
        formData.append('donGia', editedItem.value.donGia || 0);
        formData.append('soQuyen', editedItem.value.soQuyen || 0);
        if(editedItem.value.isbn) formData.append('isbn', editedItem.value.isbn);
        if(editedItem.value.namXuatBan) formData.append('namXuatBan', editedItem.value.namXuatBan);
        if(editedItem.value.moTa) formData.append('moTa', editedItem.value.moTa);

        const validAuthors = editedItem.value.tacGia.filter(a => a && a.trim());
        formData.append('tacGia', JSON.stringify(validAuthors));
        
        if (editedItem.value.categories?.length) {
             formData.append('categories', JSON.stringify(editedItem.value.categories));
        }

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
        fetchMetadata(); 
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

watch(currentTab, () => { 
    search.value = ''; 
    currentPage.value = 1; 
    loadBooks(); 
});
onMounted(() => { fetchMetadata(); loadBooks(); });
</script>

<style scoped>
.gap-2 { gap: 8px; }
.border-dashed { border-style: dashed !important; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.max-h-80vh { max-height: 80vh; }
.bg-slate-900 { background-color: #0f172a; }

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