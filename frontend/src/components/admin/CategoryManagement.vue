<template>
  <div class="category-management">
    <v-card class="pa-4 rounded-lg" color="#1e293b" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="text-h6 text-white">Category Management</h2>
          <div class="text-caption text-grey">Manage book categories and genres</div>
        </div>
        <v-btn color="primary" @click="openDialog" prepend-icon="mdi-plus">
          Add Category
        </v-btn>
      </div>

      <v-text-field
        v-model="search"
        placeholder="Search categories..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        bg-color="#0f172a"
        color="white"
        hide-details
        class="mb-4 rounded-lg"
      />

      <v-data-table
        :headers="headers"
        :items="categories"
        :search="search"
        :loading="loading"
        class="elevation-1 bg-transparent text-white custom-table"
        hover
      >
        <template v-slot:item.tenTheLoai="{ item }">
          <v-chip 
            :color="getCategoryColor(item.tenTheLoai)" 
            variant="flat" 
            size="small" 
            class="font-weight-bold text-white"
          >
            {{ item.tenTheLoai }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" color="primary" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon small color="error" @click="confirmDelete(item)">mdi-delete</v-icon>
        </template>
        
        <template v-slot:no-data>
          <v-alert type="info" variant="tonal" class="mt-2">No categories found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.tenTheLoai"
              label="Category Name *"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'Name is required']"
              placeholder="e.g., Fantasy, Science Fiction"
            ></v-text-field>
            
            <div class="mt-2" v-if="editedItem.tenTheLoai">
               <span class="text-caption text-grey mr-2">Preview Color:</span>
               <v-chip :color="getCategoryColor(editedItem.tenTheLoai)" size="small" class="text-white font-weight-bold">
                  {{ editedItem.tenTheLoai }}
               </v-chip>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>Delete category "<strong>{{ editedItem.tenTheLoai }}</strong>"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '../../services/api.service';

const categories = ref([]);
const loading = ref(true);
const search = ref('');
const dialog = ref(false);
const dialogDelete = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Category Name', key: 'tenTheLoai', align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const editedIndex = ref(-1);
const editedItem = ref({ tenTheLoai: '' });
const defaultItem = { tenTheLoai: '' };
const form = ref(null);

const formTitle = computed(() => editedIndex.value === -1 ? 'New Category' : 'Edit Category');

// Hàm lấy màu (Dùng chung logic với BookManagement)
const getCategoryColor = (catName) => {
    if (!catName || typeof catName !== 'string') return 'grey';
    const lower = catName.toLowerCase();
    if (lower.includes('fantasy')) return '#8E24AA';
    if (lower.includes('sci')) return '#1E88E5';
    if (lower.includes('history') || lower.includes('lịch sử')) return '#F57C00';
    if (lower.includes('mystery')) return '#00897B';
    if (lower.includes('thiếu nhi')) return '#43A047';
    if (lower.includes('văn học')) return '#D81B60';
    if (lower.includes('kinh tế')) return '#5D4037';
    if (lower.includes('tâm lý') || lower.includes('kỹ năng')) return '#00ACC1';
    if (lower.includes('truyện tranh') || lower.includes('comic')) return '#FFC107';
    return 'primary';
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (error) {
    console.error(error);
    snackbar.value = { show: true, message: 'Failed to load categories', color: 'error' };
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    dialog.value = true;
    nextTick(() => form.value?.resetValidation());
};

const editItem = (item) => {
  editedIndex.value = categories.value.indexOf(item);
  editedItem.value = { ...item };
  dialog.value = true;
};

const close = () => {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  try {
    if (editedIndex.value > -1) {
      const res = await api.put(`/categories/${editedItem.value._id}`, { tenTheLoai: editedItem.value.tenTheLoai });
      Object.assign(categories.value[editedIndex.value], res.data.category);
      snackbar.value = { show: true, message: 'Updated successfully', color: 'success' };
    } else {
      const res = await api.post('/categories', { tenTheLoai: editedItem.value.tenTheLoai });
      categories.value.push(res.data.category);
      snackbar.value = { show: true, message: 'Created successfully', color: 'success' };
    }
    close();
  } catch (error) {
    const msg = error.response?.data?.message || "An error occurred";
    snackbar.value = { show: true, message: msg, color: 'error' };
  }
};

const confirmDelete = (item) => {
  editedIndex.value = categories.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const closeDelete = () => {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const deleteItemConfirm = async () => {
  try {
    await api.delete(`/categories/${editedItem.value._id}`);
    categories.value.splice(editedIndex.value, 1);
    snackbar.value = { show: true, message: 'Deleted successfully', color: 'success' };
    closeDelete();
  } catch (error) {
    snackbar.value = { show: true, message: 'Delete failed', color: 'error' };
    closeDelete();
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.custom-table { color: white !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; }
:deep(.custom-table td) { border-bottom: 1px solid #334155 !important; }
:deep(.custom-table tbody tr:hover) { background-color: #1e293b !important; }
</style>