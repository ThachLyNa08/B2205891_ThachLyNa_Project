<template>
  <div class="category-management h-100 d-flex flex-column">
    
    <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6 gap-4">
      <div>
        <h2 class="text-h5 font-weight-bold text-white">Category Management</h2>
        <div class="text-subtitle-2 text-grey">Organize book genres and tags</div>
      </div>
      
      <div class="d-flex gap-3 w-100 w-md-auto">
         <v-text-field
            v-model="search"
            placeholder="Find category..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            bg-color="rgba(255,255,255,0.05)"
            hide-details
            class="rounded-lg flex-grow-1"
            style="min-width: 250px;"
         ></v-text-field>
         
         <v-btn 
            color="success" 
            height="40"
            prepend-icon="mdi-plus" 
            class="text-capitalize font-weight-bold px-6"
            @click="openDialog"
         >
            Add New
         </v-btn>
      </div>
    </div>

    <v-card color="#1e293b" class="rounded-xl elevation-0 border-opacity-12 flex-grow-1 d-flex flex-column">
      
      <div class="px-6 py-3 border-b border-opacity-12 d-flex align-center">
         <div class="text-caption text-grey text-uppercase font-weight-bold">Total Categories:</div>
         <v-chip size="small" color="primary" class="ml-2 font-weight-bold">{{ categories.length }}</v-chip>
      </div>

      <div class="pa-6 flex-grow-1 overflow-y-auto custom-scrollbar">
         
         <v-row v-if="loading">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="n">
               <v-skeleton-loader type="list-item-avatar" class="bg-transparent rounded-lg border border-opacity-12"></v-skeleton-loader>
            </v-col>
         </v-row>

         <div v-else-if="filteredCategories.length === 0" class="text-center py-10">
            <v-icon size="64" color="grey-darken-2">mdi-shape-outline</v-icon>
            <div class="text-grey mt-2">No categories found matching "{{ search }}"</div>
         </div>

         <v-row v-else>
            <v-col 
               cols="12" sm="6" md="4" lg="3" 
               v-for="item in filteredCategories" 
               :key="item._id"
            >
               <v-hover v-slot="{ isHovering, props }">
                  <v-card 
                     v-bind="props"
                     class="category-card rounded-lg border transition-swing d-flex align-center px-4 py-3 cursor-pointer"
                     color="rgba(255,255,255,0.03)"
                     :elevation="isHovering ? 4 : 0"
                     :class="{'border-primary': isHovering}"
                     @click="editItem(item)"
                  >
                     <!-- Icon màu sắc đại diện -->
                     <v-avatar 
                        size="40" 
                        :color="getCategoryColor(item.tenTheLoai)" 
                        variant="tonal" 
                        class="mr-3 rounded-lg"
                     >
                        <span class="text-h6 font-weight-bold">
                           {{ item.tenTheLoai.charAt(0).toUpperCase() }}
                        </span>
                     </v-avatar>

                     <div class="flex-grow-1 min-w-0">
                        <div class="font-weight-bold text-white text-truncate" :title="item.tenTheLoai">
                           {{ item.tenTheLoai }}
                        </div>
                     </div>

                     <div v-if="isHovering" class="d-flex gap-1">
                        <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click.stop="editItem(item)"></v-btn>
                        <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click.stop="confirmDelete(item)"></v-btn>
                     </div>
                  </v-card>
               </v-hover>
            </v-col>
         </v-row>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="450px">
      <v-card color="#1e293b" class="text-white rounded-xl">
        <v-card-title class="bg-primary text-white px-6 py-4">
          <span class="text-h6 font-weight-bold">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text class="pt-6 px-6">
          <v-form ref="form" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.tenTheLoai"
              label="Category Name"
              variant="outlined"
              bg-color="rgba(255,255,255,0.05)"
              prepend-inner-icon="mdi-tag-text-outline"
              :rules="[v => !!v || 'Name is required']"
              placeholder="e.g., Science Fiction"
              autofocus
            ></v-text-field>
            
            <div class="d-flex align-center mt-2 pa-3 rounded bg-grey-darken-4 border border-dashed" v-if="editedItem.tenTheLoai">
               <span class="text-caption text-grey mr-3">Preview Style:</span>
               <v-chip :color="getCategoryColor(editedItem.tenTheLoai)" variant="flat" class="font-weight-bold">
                  {{ editedItem.tenTheLoai }}
               </v-chip>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn color="grey-lighten-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" class="px-6 font-weight-bold" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-error text-white px-6 py-3">Confirm Delete</v-card-title>
        <v-card-text class="pt-6 px-6">
           Are you sure you want to delete category <br/>
           <strong class="text-h6 text-white">"{{ editedItem.tenTheLoai }}"</strong>?
           <div class="text-caption text-grey mt-2">This action cannot be undone.</div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="elevated" class="px-6 font-weight-bold" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">{{ snackbar.message }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '@/services/api.service';

const categories = ref([]);
const loading = ref(true);
const search = ref('');
const dialog = ref(false);
const dialogDelete = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

const editedIndex = ref(-1);
const editedItem = ref({ tenTheLoai: '' });
const defaultItem = { tenTheLoai: '' };
const form = ref(null);

const formTitle = computed(() => editedIndex.value === -1 ? 'New Category' : 'Edit Category');

const filteredCategories = computed(() => {
    if (!search.value) return categories.value;
    return categories.value.filter(cat => 
        cat.tenTheLoai.toLowerCase().includes(search.value.toLowerCase())
    );
});

const getCategoryColor = (catName) => {
    if (!catName || typeof catName !== 'string') return 'grey';
    const lower = catName.toLowerCase();
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    let hash = 0;
    for (let i = 0; i < catName.length; i++) hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (error) {
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
  nextTick(() => { editedItem.value = { ...defaultItem }; editedIndex.value = -1; });
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
  nextTick(() => { editedItem.value = { ...defaultItem }; editedIndex.value = -1; });
};

const deleteItemConfirm = async () => {
  try {
    await api.delete(`/categories/${editedItem.value._id}`);
    categories.value.splice(editedIndex.value, 1);
    snackbar.value = { show: true, message: 'Thể loại đã được xóa thành công!', color: 'success' };
    closeDelete();
  } catch (error) {
    snackbar.value = { show: true, message: 'Thất bại!!! Không thể xóa do thể loại này đang có sách đang được mượn.', color: 'error' };
    closeDelete();
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.category-card { border: 1px solid rgba(255,255,255,0.08); }
.border-primary { border-color: #2196F3 !important; box-shadow: 0 0 10px rgba(33,150,243,0.2) !important; }
.border-dashed { border-style: dashed !important; }
.min-w-0 { min-width: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
</style>