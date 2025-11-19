<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 d-flex justify-space-between align-center">
      Book Management
      <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">
        Add New Book
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-text-field
        v-model="search"
        label="Search Books"
        prepend-inner-icon="mdi-magnify"
        single-line
        hide-details
        clearable
        variant="outlined"
        density="compact"
        class="mb-4"
        @click:clear="clearSearch"
      />

      <v-data-table-server
        :headers="headers"
        :items="books"
        :items-length="totalBooks"
        :loading="loading"
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        @update:options="loadBooks"
        class="elevation-1"
        hover
      >
        <!-- Cover -->
        <template #item.coverUrl="{ item }">
          <v-avatar size="40" rounded="sm" class="my-2 cursor-pointer">
            <v-img
              :src="item.coverUrl || 'https://via.placeholder.com/40'"
              cover
              @click="showImagePreview(item.coverUrl)"
            />
          </v-avatar>
        </template>

        <!-- Publisher -->
        <template #item.maNXB="{ item }">
          {{ item.maNXB?.tenNXB || 'N/A' }}
        </template>

        <!-- Categories -->
        <template #item.categories="{ item }">
          <div class="d-flex flex-wrap gap-1" v-if="item.categories?.length">
            <template v-for="cat in item.categories" :key="cat._id || cat">
              <v-chip
                v-if="typeof cat === 'object' && cat.tenTheLoai"
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

        <!-- Stock -->
        <template #item.availableCopies="{ item }">
          <v-chip
            :color="item.availableCopies > 0 ? 'success' : 'error'"
            size="small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.availableCopies }} / {{ item.soQuyen }}
          </v-chip>
        </template>

        <!-- Price -->
        <template #item.donGia="{ item }">
          {{ formatCurrency(item.donGia) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-icon size="small" class="mr-2" color="primary" @click="editBook(item)">mdi-pencil</v-icon>
          <v-icon size="small" color="error" @click="confirmDeleteBook(item)">mdi-delete</v-icon>
        </template>

        <!-- No Data -->
        <template #no-data>
          <v-alert type="info" variant="tonal" class="mt-2">
            No books found.
          </v-alert>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <!-- Create/Edit Dialog -->
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="bookForm" @submit.prevent="saveBook">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedItem.tenSach"
                label="Book Title"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Title is required']"
              />

              <v-text-field
                v-if="editedItem.tacGia"
                v-model="editedItem.tacGia[0]"
                label="Author (Main)"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Author is required']"
              />

              <v-text-field v-model="editedItem.isbn" label="ISBN" variant="outlined" density="compact" />
              <v-text-field
                v-model="editedItem.namXuatBan"
                label="Publication Year"
                type="number"
                variant="outlined"
                density="compact"
              />

              <v-select
                v-model="editedItem.maNXB"
                :items="publishers"
                item-title="tenNXB"
                item-value="_id"
                label="Publisher"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Publisher is required']"
              />

              <v-select
                v-model="editedItem.categories"
                :items="categories"
                item-title="tenTheLoai"
                item-value="_id"
                label="Categories"
                multiple
                chips
                variant="outlined"
                density="compact"
                :rules="[v => v?.length > 0 || 'At least one category is required']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="editedItem.moTa"
                label="Description"
                variant="outlined"
                rows="3"
              />

              <v-text-field
                v-model="editedItem.donGia"
                label="Price"
                type="number"
                variant="outlined"
                density="compact"
                :rules="[v => v >= 0 || 'Invalid price']"
              />

              <v-text-field
                v-model="editedItem.soQuyen"
                label="Total Copies"
                type="number"
                variant="outlined"
                density="compact"
                :rules="[v => v > 0 || 'Invalid copies']"
              />

              <v-text-field
                v-model="editedItem.coverUrl"
                label="Cover Image URL"
                variant="outlined"
                density="compact"
              />

              <v-img
                :src="editedItem.coverUrl || 'https://via.placeholder.com/150'"
                height="120"
                contain
                class="mt-2 bg-grey-lighten-4 rounded"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="dialogError"
            type="error"
            class="mb-4"
            density="compact"
          >
            {{ dialogError }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey-darken-1" @click="closeDialog">Cancel</v-btn>
        <v-btn variant="flat" color="primary" @click="saveBook">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Confirm Deletion</v-card-title>
      <v-card-text>
        Delete book "<strong>{{ bookToDelete?.tenSach }}</strong>"?
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="closeDeleteDialog">Cancel</v-btn>
        <v-btn variant="flat" color="error" @click="deleteBook">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Image Preview -->
  <v-dialog v-model="imageDialog" max-width="500">
    <v-card>
      <v-img :src="previewImageUrl" cover />
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
    <template #actions>
      <v-btn text @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>


<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '../../services/api.service';
import debounce from 'lodash.debounce';

const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const loading = ref(true);
const totalBooks = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');

const dialog = ref(false);
const deleteDialog = ref(false);
const imageDialog = ref(false);
const previewImageUrl = ref('');

const editedIndex = ref(-1);
const editedItem = ref({ tacGia: [''], categories: [] });
const defaultItem = {
    tenSach: '', moTa: '', donGia: 0, soQuyen: 1, namXuatBan: null,
    maNXB: null, tacGia: [''], categories: [], isbn: '', coverUrl: '',
};
const bookToDelete = ref(null);
const dialogError = ref(null);
const bookForm = ref(null);

const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
    { title: 'Cover', key: 'coverUrl', sortable: false, width: '60px' },
    { title: 'Title', key: 'tenSach', width: '250px' },
    { title: 'Publisher', key: 'maNXB' },
    { title: 'Categories', key: 'categories' },
    { title: 'Stock', key: 'availableCopies', align: 'center' },
    { title: 'Price', key: 'donGia', align: 'end' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Book' : 'Edit Book'));

const getCategoryColor = (catName) => {
    if (!catName) return 'grey';
    const lower = catName.toLowerCase();
    if (lower.includes('fantasy')) return '#8E24AA';
    if (lower.includes('sci')) return '#1E88E5';
    if (lower.includes('history')) return '#F57C00';
    if (lower.includes('mystery')) return '#00897B';
    if (lower.includes('thiếu nhi')) return '#43A047';
    if (lower.includes('văn học')) return '#D81B60';
    if (lower.includes('kinh tế')) return '#5D4037';
    return 'primary';
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const loadBooks = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value,
        };
        const response = await api.get('/books', { params });
        books.value = response.data.data;
        totalBooks.value = response.data.total;
    } catch (error) {
        console.error('Error loading books:', error);
        snackbar.value = { show: true, message: 'Failed to load books.', color: 'error' };
    } finally {
        loading.value = false;
    }
}, 300);

const fetchCatsAndPubs = async () => {
    try {
        const [catRes, pubRes] = await Promise.all([api.get('/categories'), api.get('/publishers')]);
        categories.value = catRes.data;
        publishers.value = pubRes.data;
    } catch (e) { console.error(e); }
};

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem, tacGia: [''], categories: [] };
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => bookForm.value?.resetValidation());
};

const editBook = (item) => {
    editedIndex.value = books.value.indexOf(item);
    const itemCopy = JSON.parse(JSON.stringify(item));
    const authors = (itemCopy.tacGia && itemCopy.tacGia.length > 0) ? itemCopy.tacGia : [''];
    const cats = itemCopy.categories ? itemCopy.categories.map(cat => cat._id || cat) : [];

    editedItem.value = {
        ...itemCopy,
        maNXB: itemCopy.maNXB?._id || itemCopy.maNXB,
        categories: cats,
        tacGia: authors
    };
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => bookForm.value?.resetValidation());
};

const closeDialog = () => { dialog.value = false; };

const saveBook = async () => {
    const { valid } = await bookForm.value.validate();
    if (!valid) return;
    dialogError.value = null;
    try {
        const payload = { ...editedItem.value };
        if (payload.tacGia && Array.isArray(payload.tacGia)) {
             payload.tacGia = payload.tacGia.filter(a => a && a.trim() !== '');
        }
        delete payload._id;

        if (editedIndex.value > -1) {
            await api.put(`/books/${editedItem.value._id}`, payload);
            snackbar.value = { show: true, message: 'Updated successfully', color: 'success' };
        } else {
            await api.post('/books', payload);
            snackbar.value = { show: true, message: 'Created successfully', color: 'success' };
        }
        closeDialog();
        loadBooks();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save.';
    }
};

const confirmDeleteBook = (item) => { bookToDelete.value = item; deleteDialog.value = true; };
const closeDeleteDialog = () => { deleteDialog.value = false; bookToDelete.value = null; };

const deleteBook = async () => {
    try {
        await api.delete(`/books/${bookToDelete.value._id}`);
        snackbar.value = { show: true, message: 'Deleted successfully', color: 'success' };
        closeDeleteDialog();
        loadBooks();
    } catch (error) {
        snackbar.value = { show: true, message: 'Delete failed', color: 'error' };
    }
};

const showImagePreview = (url) => {
    if(url) {
        previewImageUrl.value = url;
        imageDialog.value = true;
    }
}

const clearSearch = () => {
    search.value = '';
    currentPage.value = 1;
    loadBooks();
};

watch(search, () => { currentPage.value = 1; loadBooks(); });

onMounted(() => {
    fetchCatsAndPubs();
});
</script>

<style scoped>
.gap-1 { gap: 4px; }
.cursor-pointer { cursor: pointer; }
</style>