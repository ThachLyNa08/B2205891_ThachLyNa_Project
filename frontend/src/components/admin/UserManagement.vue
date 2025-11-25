<template>
  <div class="user-management-wrapper">
    <v-card class="pa-4 rounded-lg" color="#1e293b" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="text-h6 text-white">User Management</h2>
          <div class="text-caption text-grey">Manage system users and roles</div>
        </div>
        <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-account-plus">
          Add New User
        </v-btn>
      </div>

      <v-text-field
        v-model="search"
        placeholder="Search by username, email, or phone..."
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
        :items="users"
        :items-length="totalUsers"
        :loading="loading"
        v-model:items-per-page="itemsPerPage"
        v-model:page="currentPage"
        @update:options="loadUsers"
        class="elevation-1 bg-transparent text-white custom-table"
        hover
      >
        <template v-slot:item.username="{ item }">
          <div class="d-flex align-center">
             <v-avatar color="primary" size="32" class="mr-2">
               <span class="text-white font-weight-bold">{{ item.username.charAt(0).toUpperCase() }}</span>
             </v-avatar>
             <div>
               <div class="font-weight-bold">{{ item.username }}</div>
               <div class="text-caption text-grey">{{ item.email }}</div>
             </div>
          </div>
        </template>

        <template v-slot:item.fullName="{ item }">
           {{ item.hoLot }} {{ item.ten }}
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip :color="getRoleColor(item.role)" size="small" label class="font-weight-bold text-uppercase">
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" color="primary" @click="editUser(item)">mdi-pencil</v-icon>
          <v-icon small color="error" @click="confirmDeleteUser(item)">mdi-delete</v-icon>
        </template>
        
        <template v-slot:no-data>
          <v-alert type="info" variant="tonal" class="mt-2">No users found.</v-alert>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm" @submit.prevent="saveUser">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.username" label="Username *" variant="outlined" density="compact" :rules="[v => !!v || 'Required']" :disabled="editedIndex > -1" />
                <v-text-field v-model="editedItem.email" label="Email *" type="email" variant="outlined" density="compact" :rules="[v => !!v || 'Required', v => /.+@.+\..+/.test(v) || 'Invalid email']" />
                <v-text-field 
                    v-model="editedItem.password" 
                    label="Password" 
                    type="password" 
                    variant="outlined" 
                    density="compact" 
                    :rules="passwordRules" 
                    :hint="editedIndex > -1 ? 'Leave empty to keep current password' : ''"
                    persistent-hint
                />
                <v-select
                  v-model="editedItem.role"
                  :items="['reader', 'staff', 'admin']"
                  label="Role *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Required']"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.hoLot" label="Last Name" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.ten" label="First Name *" variant="outlined" density="compact" :rules="[v => !!v || 'Required']" />
                <v-text-field v-model="editedItem.dienThoai" label="Phone" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.diaChi" label="Address" variant="outlined" density="compact" />
                <v-select v-model="editedItem.gioiTinh" :items="['M', 'F', 'Other']" label="Gender" variant="outlined" density="compact" />
                <v-text-field v-model="editedItem.ngaySinh" label="Date of Birth" type="date" variant="outlined" density="compact" />
              </v-col>
            </v-row>

            <v-alert v-if="dialogError" type="error" class="mt-4" density="compact">{{ dialogError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete user "<strong>{{ userToDelete?.username }}</strong>"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteUser">Delete</v-btn>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '@/services/api.service'; // Import chuẩn
import debounce from 'lodash.debounce';

// State
const users = ref([]);
const loading = ref(true);
const totalUsers = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');

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
    { title: 'User Info', key: 'username', align: 'start' },
    { title: 'Full Name', key: 'fullName' },
    { title: 'Role', key: 'role' },
    { title: 'Phone', key: 'dienThoai' },
    { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Create New User' : 'Edit User'));

// Validate Password chỉ bắt buộc khi tạo mới
const passwordRules = computed(() => {
    const rules = [];
    if (editedIndex.value === -1) { // Create mode
        rules.push(v => !!v || 'Password is required');
        rules.push(v => (v && v.length >= 6) || 'Min 6 characters');
    } else { // Edit mode
        if (editedItem.value.password) {
            rules.push(v => v.length >= 6 || 'Min 6 characters');
        }
    }
    return rules;
});

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'error';   // Đỏ
        case 'staff': return 'warning'; // Cam/Vàng
        case 'reader': return 'success'; // Xanh lá
        default: return 'grey';
    }
};

// --- API CALLS ---
const loadUsers = debounce(async ({ page, itemsPerPage: perPage } = {}) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value,
        };
        const response = await api.get('/users', { params });
        
        // Xử lý data trả về (nếu backend trả mảng hoặc object {data, total})
        if (Array.isArray(response.data)) {
             users.value = response.data;
             totalUsers.value = response.data.length; // Tạm thời nếu backend chưa phân trang chuẩn
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
    editedIndex.value = -1;
    dialogError.value = null;
    dialog.value = true;
    nextTick(() => userForm.value?.resetValidation());
};

const editUser = (item) => {
    editedIndex.value = users.value.indexOf(item);
    editedItem.value = { ...item };
    // Format ngày sinh để hiện đúng trong input date
    if (editedItem.value.ngaySinh) {
        editedItem.value.ngaySinh = new Date(editedItem.value.ngaySinh).toISOString().split('T')[0];
    }
    editedItem.value.password = ''; // Xóa password để tránh hiện hash
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
        
        // Bỏ password nếu rỗng (khi edit)
        if (!payload.password) delete payload.password;
        
        if (editedIndex.value > -1) { // Update
            const userId = payload._id;
            delete payload._id; 
            await api.put(`/users/${userId}`, payload);
            snackbar.value = { show: true, message: 'User updated successfully.', color: 'success' };
        } else { // Create
            await api.post('/users', payload);
            snackbar.value = { show: true, message: 'User created successfully.', color: 'success' };
        }
        closeDialog();
        loadUsers();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save user.';
    }
};

const confirmDeleteUser = (item) => {
    userToDelete.value = item;
    deleteDialog.value = true;
};

const closeDeleteDialog = () => {
    deleteDialog.value = false;
    userToDelete.value = null;
};

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

watch(search, () => { currentPage.value = 1; loadUsers(); });

onMounted(() => { loadUsers({}); });
</script>

<style scoped>
.custom-table { color: white !important; }
:deep(.custom-table td) { border-bottom: 1px solid #334155 !important; }
:deep(.custom-table tbody tr:hover) { background-color: #1e293b !important; }
</style>