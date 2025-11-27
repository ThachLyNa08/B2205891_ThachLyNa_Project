<template>
  <div class="publisher-management-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="amber-accent-3" class="mr-2">mdi-domain</v-icon>
             Publisher Settings
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Manage book publishers and contacts</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Search publishers..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 280px;"
           ></v-text-field>
           
           <v-btn color="primary" class="text-capitalize font-weight-bold px-6" height="40" rounded="lg" @click="openDialog">
              <v-icon start>mdi-plus</v-icon> Add Publisher
           </v-btn>
        </div>
      </div>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent mt-2" elevation="0">
         <v-data-table
            :headers="headers"
            :items="publishers"
            :search="search"
            :loading="loading"
            class="bg-transparent text-white custom-table flex-grow-1"
            density="comfortable"
            hover
         >
            <template v-slot:item.tenNXB="{ item }">
               <div class="font-weight-bold text-body-1 text-blue-lighten-4">
                  {{ item.raw ? item.raw.tenNXB : item.tenNXB }}
               </div>
            </template>

            <template v-slot:item.diaChi="{ item }">
               <div class="d-flex align-center text-grey-lighten-1">
                  <v-icon size="small" class="mr-2 opacity-50">mdi-map-marker</v-icon>
                  <span class="text-truncate" style="max-width: 300px;">
                      {{ (item.raw ? item.raw.diaChi : item.diaChi) || 'N/A' }}
                  </span>
               </div>
            </template>

            <template v-slot:item.email="{ item }">
               <div v-if="(item.raw ? item.raw.email : item.email)" class="d-flex align-center text-grey-lighten-1">
                  <v-icon size="small" class="mr-2 opacity-50">mdi-email</v-icon>
                  {{ item.raw ? item.raw.email : item.email }}
               </div>
               <span v-else class="text-caption text-grey font-italic pl-6">No email</span>
            </template>

            <template v-slot:item.actions="{ item }">
               <div class="d-flex justify-end gap-1">
                  <v-btn icon="mdi-pencil" variant="text" color="blue-lighten-2" size="small" @click="editItem(item)" title="Edit"></v-btn>
                  <v-btn icon="mdi-delete" variant="text" color="red-lighten-2" size="small" @click="confirmDelete(item)" title="Delete"></v-btn>
               </div>
            </template>
            
            <template v-slot:no-data>
               <div class="text-center py-8">
                  <v-icon size="64" color="grey-darken-2">mdi-office-building-off</v-icon>
                  <div class="text-grey mt-2">No publishers found.</div>
               </div>
            </template>
         </v-data-table>
      </v-card>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" transition="dialog-bottom-transition">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-primary px-6 py-4 text-h6 font-weight-bold d-flex align-center">
           <v-icon start class="mr-2">{{ editedIndex === -1 ? 'mdi-plus-box' : 'mdi-pencil-box' }}</v-icon> 
           {{ formTitle }}
           <v-spacer></v-spacer>
           <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
        </v-card-title>
        
        <v-card-text class="pt-6 px-6">
          <v-form ref="form" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.tenNXB"
              label="Publisher Name"
              variant="outlined"
              density="comfortable"
              bg-color="rgba(255,255,255,0.05)"
              prepend-inner-icon="mdi-domain"
              :rules="[v => !!v || 'Name is required']"
              class="mb-2"
            ></v-text-field>
            
            <v-text-field
              v-model="editedItem.diaChi"
              label="Address"
              variant="outlined"
              density="comfortable"
              bg-color="rgba(255,255,255,0.05)"
              prepend-inner-icon="mdi-map-marker"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editedItem.email"
              label="Email Contact"
              variant="outlined"
              density="comfortable"
              bg-color="rgba(255,255,255,0.05)"
              prepend-inner-icon="mdi-email"
            ></v-text-field>
            
            <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mt-4 border-red" icon="mdi-alert-circle">
               {{ errorMsg }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey-lighten-1" variant="text" @click="close" class="text-capitalize">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="save" class="px-6 font-weight-bold text-capitalize">
             {{ editedIndex === -1 ? 'Create' : 'Update' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-error px-6 py-4 text-h6 font-weight-bold d-flex align-center">
           <v-icon start>mdi-alert-octagon</v-icon> Confirm Delete
        </v-card-title>
        <v-card-text class="pt-6 pb-4 text-center">
           Delete publisher <br/>
           <strong class="text-h6 text-red-lighten-2">"{{ editedItem.tenNXB }}"</strong>?
           <div class="text-caption text-grey mt-2">This may affect books linked to this publisher.</div>
        </v-card-text>
        <v-card-actions class="justify-center pb-6">
          <v-btn color="grey" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteItemConfirm" class="px-6 font-weight-bold">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
        <v-icon start color="white">mdi-information</v-icon>
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn icon="mdi-close" variant="text" size="small" @click="snackbar.show = false"></v-btn>
        </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '@/services/api.service';

const publishers = ref([]);
const loading = ref(true);
const search = ref('');
const dialog = ref(false);
const dialogDelete = ref(false);
const errorMsg = ref('');
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Name', key: 'tenNXB', align: 'start', width: '30%' },
  { title: 'Address', key: 'diaChi', width: '35%' },
  { title: 'Contact Email', key: 'email', width: '20%' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '15%' },
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

// [SỬA QUAN TRỌNG] Hàm editItem phải xử lý item.raw nếu item là Wrapper
const editItem = (item) => {
  // Lấy dữ liệu thô (nếu item là wrapper thì lấy item.raw, không thì lấy item)
  const rawItem = item.raw || item;
  
  // Tìm index dựa trên dữ liệu thô
  editedIndex.value = publishers.value.findIndex(p => p._id === rawItem._id);
  editedItem.value = { ...rawItem };
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

// 1. Sửa hàm SAVE (Thêm/Sửa)
const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  
  errorMsg.value = '';

  try {
    if (editedIndex.value > -1) {
      // Update
      await api.put(`/publishers/${editedItem.value._id}`, editedItem.value);
      snackbar.value = { show: true, message: 'Updated successfully', color: 'success' };
    } else {
      // Create
      await api.post('/publishers', editedItem.value);
      snackbar.value = { show: true, message: 'Created successfully', color: 'success' };
    }
    
    // [QUAN TRỌNG] Tải lại danh sách từ server để đảm bảo dữ liệu mới nhất
    await fetchPublishers(); 
    
    close();
  } catch (error) {
    console.error(error);
    errorMsg.value = error.response?.data?.message || "An error occurred.";
  }
};

// [SỬA QUAN TRỌNG] Hàm confirmDelete cũng phải xử lý tương tự
const confirmDelete = (item) => {
  const rawItem = item.raw || item;
  editedIndex.value = publishers.value.findIndex(p => p._id === rawItem._id);
  editedItem.value = { ...rawItem };
  dialogDelete.value = true;
};

const closeDelete = () => {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

// 2. Sửa hàm DELETE (Xóa)
const deleteItemConfirm = async () => {
  try {
    await api.delete(`/publishers/${editedItem.value._id}`);
    
    // [QUAN TRỌNG] Tải lại danh sách ngay sau khi xóa
    await fetchPublishers();

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
.gap-3 { gap: 12px; }
.border-red { border: 1px solid #ef5350 !important; }

/* Table Styling */
:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-top: 12px !important; padding-bottom: 12px !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.03) !important; }
</style>