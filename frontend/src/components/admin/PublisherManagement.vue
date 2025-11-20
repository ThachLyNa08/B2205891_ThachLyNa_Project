<template>
  <div class="publisher-management">
    <v-card class="pa-4 rounded-lg" color="#1e293b" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
            <h2 class="text-h6 text-white">Publisher Settings</h2>
            <div class="text-caption text-grey">Manage book publishers</div>
        </div>
        <v-btn color="primary" @click="openDialog" prepend-icon="mdi-plus">Add Publisher</v-btn>
      </div>

      <v-text-field
        v-model="search"
        placeholder="Search publishers..."
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
        :items="publishers"
        :search="search"
        :loading="loading"
        class="elevation-1 bg-transparent text-white custom-table"
        hover
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" color="primary" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon small color="error" @click="confirmDelete(item)">mdi-delete</v-icon>
        </template>
        
        <template v-slot:no-data>
             <v-alert type="info" variant="tonal" class="mt-2">No publishers found.</v-alert>
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
              v-model="editedItem.tenNXB"
              label="Publisher Name *"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            
            <v-text-field
              v-model="editedItem.diaChi"
              label="Address"
              variant="outlined"
              density="compact"
            ></v-text-field>

            <v-text-field
              v-model="editedItem.email"
              label="Email"
              variant="outlined"
              density="compact"
            ></v-text-field>
            
             <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mb-2">
                {{ errorMsg }}
             </v-alert>
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
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>Delete publisher "{{ editedItem.tenNXB }}"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn text @click="snackbar.show = false">Close</v-btn>
        </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '../../services/api.service';

const publishers = ref([]);
const loading = ref(true);
const search = ref('');
const dialog = ref(false);
const dialogDelete = ref(false);
const errorMsg = ref('');
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Name', key: 'tenNXB', align: 'start' },
  { title: 'Address', key: 'diaChi' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const editedIndex = ref(-1);
const editedItem = ref({ tenNXB: '', diaChi: '', email: '' });
const defaultItem = { tenNXB: '', diaChi: '', email: '' };
const form = ref(null);

const formTitle = computed(() => editedIndex.value === -1 ? 'New Publisher' : 'Edit Publisher');

const fetchPublishers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/publishers');
    // Xử lý dữ liệu linh hoạt (mảng hoặc object)
    publishers.value = Array.isArray(response.data) ? response.data : (response.data.data || []);
  } catch (error) {
    console.error(error);
    snackbar.value = { show: true, message: 'Failed to load data', color: 'error' };
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    errorMsg.value = '';
    dialog.value = true;
};

const editItem = (item) => {
  editedIndex.value = publishers.value.indexOf(item);
  editedItem.value = { ...item };
  errorMsg.value = '';
  dialog.value = true;
};

const close = () => {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    errorMsg.value = '';
  });
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  
  errorMsg.value = '';

  try {
    if (editedIndex.value > -1) {
      // Update
      const res = await api.put(`/publishers/${editedItem.value._id}`, editedItem.value);
      Object.assign(publishers.value[editedIndex.value], res.data.publisher);
      snackbar.value = { show: true, message: 'Updated successfully', color: 'success' };
    } else {
      // Create
      const res = await api.post('/publishers', editedItem.value);
      publishers.value.push(res.data.publisher);
      snackbar.value = { show: true, message: 'Created successfully', color: 'success' };
    }
    close();
  } catch (error) {
    // BẮT LỖI "Publisher name already exists" VÀ HIỂN THỊ
    console.error(error);
    errorMsg.value = error.response?.data?.message || "An error occurred.";
  }
};

const confirmDelete = (item) => {
  editedIndex.value = publishers.value.indexOf(item);
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
    await api.delete(`/publishers/${editedItem.value._id}`);
    publishers.value.splice(editedIndex.value, 1);
    snackbar.value = { show: true, message: 'Deleted successfully', color: 'success' };
    closeDelete();
  } catch (error) {
    snackbar.value = { show: true, message: error.response?.data?.message || 'Delete failed', color: 'error' };
    closeDelete();
  }
};

onMounted(fetchPublishers);
</script>

<style scoped>
.custom-table { color: white !important; }
:deep(.custom-table td) { border-bottom: 1px solid #334155 !important; }
:deep(.custom-table tbody tr:hover) { background-color: #1e293b !important; }
</style>