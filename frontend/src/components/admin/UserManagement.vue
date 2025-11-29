<template>
  <div class="user-management-wrapper h-100">
    <v-card class="pa-6 rounded-xl h-100 d-flex flex-column" color="#1e293b" elevation="0">
      
      <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-white d-flex align-center">
             <v-icon start color="teal-accent-3" class="mr-2">mdi-account-group</v-icon>
             User Management
          </h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Manage system access and user profiles</div>
        </div>
        
        <div class="d-flex align-center gap-3 mt-4 mt-md-0 w-100 w-md-auto">
           <v-text-field
             v-model="search"
             placeholder="Search users..."
             prepend-inner-icon="mdi-magnify"
             variant="solo-filled"
             density="compact"
             bg-color="rgba(255,255,255,0.05)"
             hide-details
             class="rounded-lg search-field"
             style="min-width: 280px;"
             @update:model-value="debouncedLoad"
           ></v-text-field>
           
           <v-btn color="primary" class="text-capitalize font-weight-bold px-6" height="40" rounded="lg" @click="openCreateDialog">
              <v-icon start>mdi-account-plus</v-icon> Add User
           </v-btn>
        </div>
      </div>

      <div class="mb-4">
        <v-tabs v-model="currentTab" bg-color="transparent" color="teal-accent-3" show-arrows>
            <v-tab value="reader" class="text-capitalize font-weight-bold">
                <v-icon start>mdi-book-open-variant</v-icon> Readers
            </v-tab>
            <v-tab value="staff" class="text-capitalize font-weight-bold">
                <v-icon start>mdi-id-card</v-icon> Staff
            </v-tab>
            <v-tab value="admin" class="text-capitalize font-weight-bold">
                <v-icon start>mdi-shield-crown</v-icon> Admins
            </v-tab>
            <v-tab value="all" class="text-capitalize font-weight-bold">
                <v-icon start>mdi-account-multiple</v-icon> All Users
            </v-tab>
        </v-tabs>
        <v-divider class="border-opacity-12"></v-divider>
      </div>

      <v-card class="flex-grow-1 d-flex flex-column bg-transparent mt-2" elevation="0">
         <v-data-table-server
            :headers="headers"
            :items="users"
            :items-length="totalUsers"
            :loading="loading"
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            @update:options="loadUsers"
            class="bg-transparent text-white custom-table flex-grow-1"
            density="comfortable"
            hover
         >
            <template v-slot:item.username="{ item }">
               <div class="d-flex align-center py-2">
                  <v-avatar size="40" class="mr-3 font-weight-bold bg-gradient-primary elevation-2 border">
                     <span class="text-white text-h6">{{ item.username.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div>
                     <div class="font-weight-bold text-body-1">{{ item.username }}</div>
                     <div class="text-caption text-grey-lighten-1 d-flex align-center">
                        <v-icon size="x-small" class="mr-1">mdi-email-outline</v-icon> {{ item.email }}
                     </div>
                  </div>
               </div>
            </template>

            <template v-slot:item.fullName="{ item }">
               <span class="font-weight-medium text-grey-lighten-1">{{ item.hoLot }} {{ item.ten }}</span>
            </template>

            <template v-slot:item.role="{ item }">
               <v-chip :color="getRoleColor(item.role)" size="small" variant="tonal" class="font-weight-bold text-uppercase px-3" label>
                  <v-icon start size="small" v-if="item.role === 'admin'">mdi-shield-crown</v-icon>
                  <v-icon start size="small" v-if="item.role === 'staff'">mdi-id-card</v-icon>
                  <v-icon start size="small" v-if="item.role === 'reader'">mdi-book-open-variant</v-icon>
                  {{ item.role }}
               </v-chip>
            </template>

            <template v-slot:item.dienThoai="{ item }">
               <div v-if="item.dienThoai" class="text-body-2 text-grey-lighten-1">
                  {{ item.dienThoai }}
               </div>
               <span v-else class="text-caption text-grey font-italic">N/A</span>
            </template>

            <template v-slot:item.actions="{ item }">
               <div class="d-flex justify-end gap-1">
                  <v-btn icon="mdi-pencil" variant="text" color="blue-lighten-2" size="small" @click="editUser(item)" title="Edit"></v-btn>
                  <v-btn icon="mdi-delete" variant="text" color="red-lighten-2" size="small" @click="confirmDeleteUser(item)" title="Delete"></v-btn>
               </div>
            </template>
            
            <template v-slot:no-data>
               <div class="text-center py-8">
                  <v-icon size="64" color="grey-darken-2">mdi-account-off</v-icon>
                  <div class="text-grey mt-2">No users found matching your search.</div>
               </div>
            </template>
         </v-data-table-server>
      </v-card>
    </v-card>

    <v-dialog v-model="dialog" max-width="700px" transition="dialog-bottom-transition">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-primary px-6 py-4 text-h6 font-weight-bold d-flex align-center">
           <v-icon start class="mr-2">{{ editedIndex === -1 ? 'mdi-account-plus' : 'mdi-account-edit' }}</v-icon> 
           {{ formTitle }}
           <v-spacer></v-spacer>
           <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pt-6 px-6">
          <v-form ref="userForm" @submit.prevent="saveUser">
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold text-primary mb-3">Account Information</div>
                <v-text-field v-model="editedItem.username" label="Username" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-account" :rules="[v => !!v || 'Required']" :disabled="editedIndex > -1" class="mb-1" />
                <v-text-field v-model="editedItem.email" label="Email" type="email" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-email" :rules="[v => !!v || 'Required', v => /.+@.+\..+/.test(v) || 'Invalid email']" class="mb-1" />
                <v-text-field v-model="editedItem.password" label="Password" type="password" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-lock" :rules="passwordRules" :hint="editedIndex > -1 ? 'Leave empty to keep current password' : 'Min 6 characters'" persistent-hint class="mb-1" />
                <v-select v-model="editedItem.role" :items="['reader', 'staff', 'admin']" label="Role" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-shield-account" :rules="[v => !!v || 'Required']" />
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold text-primary mb-3">Personal Details</div>
                <v-row dense>
                   <v-col cols="6"><v-text-field v-model="editedItem.hoLot" label="Last Name" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" /></v-col>
                   <v-col cols="6"><v-text-field v-model="editedItem.ten" label="First Name" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" :rules="[v => !!v || 'Required']" /></v-col>
                </v-row>
                <v-text-field v-model="editedItem.dienThoai" label="Phone" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-phone" class="mb-1" />
                <v-text-field v-model="editedItem.diaChi" label="Address" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" prepend-inner-icon="mdi-map-marker" class="mb-1" />
                <v-row dense>
                   <v-col cols="6"><v-select v-model="editedItem.gioiTinh" :items="['M', 'F', 'Other']" label="Gender" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" /></v-col>
                   <v-col cols="6"><v-text-field v-model="editedItem.ngaySinh" label="Birthday" type="date" variant="outlined" density="comfortable" bg-color="rgba(255,255,255,0.05)" /></v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-4 border-red" density="compact" icon="mdi-alert-circle">
               {{ dialogError }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey-lighten-1" variant="text" @click="closeDialog" class="text-capitalize">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveUser" class="px-6 font-weight-bold text-capitalize">
             {{ editedIndex === -1 ? 'Create User' : 'Update Changes' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card color="#1e293b" class="text-white rounded-lg">
        <v-card-title class="bg-error px-6 py-4 text-h6 font-weight-bold d-flex align-center">
           <v-icon start>mdi-alert-octagon</v-icon> Confirm Deletion
        </v-card-title>
        <v-card-text class="pt-6 pb-4 text-center">
           Are you sure you want to delete user <br/>
           <strong class="text-h6 text-red-lighten-2">{{ userToDelete?.username }}</strong>?
           <div class="text-caption text-grey mt-2">This action cannot be undone.</div>
        </v-card-text>
        <v-card-actions class="justify-center pb-6">
          <v-btn color="grey" variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteUser" class="px-6 font-weight-bold">Delete User</v-btn>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '@/services/api.service';
import debounce from 'lodash.debounce';

const users = ref([]);
const loading = ref(true);
const totalUsers = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');
const currentTab = ref('reader'); 

const dialog = ref(false);
const deleteDialog = ref(false);
const dialogError = ref(null);
const snackbar = ref({ show: false, message: '', color: '' });

const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = {
    username: '', email: '', password: '', role: 'reader',
    hoLot: '', ten: '', ngaySinh: '', gioiTinh: 'Other', diaChi: '', dienThoai: ''
};
const userToDelete = ref(null);
const userForm = ref(null);

const headers = [
    { title: 'User Account', key: 'username', align: 'start', width: '30%' },
    { title: 'Full Name', key: 'fullName', width: '20%' },
    { title: 'Role', key: 'role', align: 'center', width: '15%' },
    { title: 'Contact', key: 'dienThoai', width: '20%' },
    { title: 'Actions', key: 'actions', align: 'end', sortable: false, width: '15%' },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Create New User' : 'Edit User'));

const passwordRules = computed(() => {
    const rules = [];
    if (editedIndex.value === -1) { 
        rules.push(v => !!v || 'Password is required');
        rules.push(v => (v && v.length >= 6) || 'Min 6 characters');
    } else { 
        if (editedItem.value.password) {
            rules.push(v => v.length >= 6 || 'Min 6 characters');
        }
    }
    return rules;
});

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'red-accent-2';
        case 'staff': return 'amber-accent-3';
        case 'reader': return 'teal-accent-3';
        default: return 'grey';
    }
};

const loadUsers = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value,
            role: currentTab.value 
        };
        const response = await api.get('/users', { params });
        
        // Xử lý response linh động
        if (Array.isArray(response.data)) {
             users.value = response.data;
             totalUsers.value = response.data.length; 
        } else {
             users.value = response.data.data || response.data;
             totalUsers.value = response.data.total || users.value.length;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        snackbar.value = { show: true, message: 'Failed to load users.', color: 'error' };
    } finally {
        loading.value = false;
    }
}, 300);

const openCreateDialog = () => {
    editedItem.value = { ...defaultItem };
    // Tự động set role theo tab đang đứng (nếu tab != all)
    if (currentTab.value !== 'all') {
        editedItem.value.role = currentTab.value;
    }
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => userForm.value?.resetValidation());
};

const editUser = (item) => {
    editedIndex.value = users.value.indexOf(item);
    editedItem.value = { ...item };
    if (editedItem.value.ngaySinh) {
        editedItem.value.ngaySinh = new Date(editedItem.value.ngaySinh).toISOString().split('T')[0];
    }
    editedItem.value.password = ''; 
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => userForm.value?.resetValidation());
};

const closeDialog = () => {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem };
        editedIndex.value = -1;
        dialogError.value = null;
    });
};

const saveUser = async () => {
    const { valid } = await userForm.value.validate();
    if (!valid) return;

    dialogError.value = null;
    try {
        const payload = { ...editedItem.value };
        if (!payload.password) delete payload.password;
        
        if (editedIndex.value > -1) { 
            const userId = payload._id;
            delete payload._id; 
            await api.put(`/users/${userId}`, payload);
            snackbar.value = { show: true, message: 'User updated successfully.', color: 'success' };
        } else { 
            await api.post('/users', payload);
            snackbar.value = { show: true, message: 'User created successfully.', color: 'success' };
        }
        closeDialog();
        loadUsers();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save user.';
    }
};

const confirmDeleteUser = (item) => { userToDelete.value = item; deleteDialog.value = true; };
const closeDeleteDialog = () => { deleteDialog.value = false; userToDelete.value = null; };

const deleteUser = async () => {
    try {
        await api.delete(`/users/${userToDelete.value._id}`);
        snackbar.value = { show: true, message: 'User deleted successfully.', color: 'success' };
        closeDeleteDialog();
        loadUsers();
    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to delete user.';
        snackbar.value = { show: true, message: msg, color: 'error' };
        closeDeleteDialog();
    }
};

const debouncedLoad = debounce(() => { currentPage.value = 1; loadUsers(); }, 500);

watch(currentTab, () => {
    search.value = '';
    currentPage.value = 1;
    loadUsers();
});

watch(search, () => { currentPage.value = 1; loadUsers(); });
onMounted(() => { loadUsers({}); });
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-3 { gap: 12px; }
.bg-gradient-primary { background: linear-gradient(135deg, #42a5f5, #1976d2); }
.border-red { border: 1px solid #ef5350 !important; }

:deep(.custom-table) { background-color: transparent !important; }
:deep(.custom-table th) { color: #94a3b8 !important; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
:deep(.custom-table td) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-top: 12px !important; padding-bottom: 12px !important; }
:deep(.custom-table tbody tr:hover) { background-color: rgba(255,255,255,0.03) !important; }
</style>