<!-- frontend/src/components/admin/UserManagement.vue -->
<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5 d-flex justify-space-between align-center">
            User Management
            <v-btn color="primary" @click="openCreateDialog">
                <v-icon left>mdi-plus</v-icon> Create New User
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-text-field
                v-model="search"
                label="Search Users"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
                clearable
                class="mb-4"
            ></v-text-field>

            <v-data-table-server
                :headers="headers"
                :items="users"
                :items-length="totalUsers"
                :loading="loading"
                v-model:items-per-page="itemsPerPage"
                v-model:page="currentPage"
                @update:options="loadUsers"
                class="elevation-1"
            >
                <template v-slot:item.role="{ item }">
                    <v-chip :color="getRoleColor(item.role)" size="small">{{ item.role }}</v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editUser(item)">mdi-pencil</v-icon>
                    <v-icon small @click="confirmDeleteUser(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:no-data>
                    <v-alert type="info">No users found.</v-alert>
                </template>
            </v-data-table-server>
        </v-card-text>

        <!-- Create/Edit User Dialog -->
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="userForm" @submit.prevent="saveUser">
                        <v-text-field v-model="editedItem.username" label="Username" :rules="[v => !!v || 'Username is required']"></v-text-field>
                        <v-text-field v-model="editedItem.email" label="Email" type="email" :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"></v-text-field>
                        <v-text-field v-model="editedItem.password" label="Password" type="password" :rules="[v => (!!v && !editedItem._id) || (v.length >= 6 || 'Password must be at least 6 characters')]"></v-text-field>
                        <v-select
                            v-model="editedItem.role"
                            :items="['reader', 'staff', 'admin']"
                            label="Role"
                            :rules="[v => !!v || 'Role is required']"
                        ></v-select>
                        <v-text-field v-model="editedItem.hoLot" label="Họ lót"></v-text-field>
                        <v-text-field v-model="editedItem.ten" label="Tên"></v-text-field>
                        <v-text-field v-model="editedItem.dienThoai" label="Điện thoại"></v-text-field>
                        <v-text-field v-model="editedItem.diaChi" label="Địa chỉ"></v-text-field>
                        <v-select
                            v-model="editedItem.gioiTinh"
                            :items="['M', 'F', 'Other']"
                            label="Giới tính"
                        ></v-select>
                        <v-text-field
                            v-model="editedItem.ngaySinh"
                            label="Ngày sinh (YYYY-MM-DD)"
                            type="date"
                        ></v-text-field>

                        <v-alert v-if="dialogError" type="error" class="mb-4">{{ dialogError }}</v-alert>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="saveUser">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this user ({{ userToDelete?.username }})?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
                    <v-btn color="error darken-1" text @click="deleteUser">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="3000"
        >
            {{ snackbar.message }}
            <template v-slot:actions>
                <v-btn text @click="snackbar.show = false">Close</v-btn>
            </template>
        </v-snackbar>

    </v-card>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import api from '../../services/api';
import debounce from 'lodash.debounce';

const users = ref([]);
const loading = ref(true);
const totalUsers = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const search = ref('');

const dialog = ref(false);
const deleteDialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = {
    username: '',
    email: '',
    password: '',
    role: 'reader',
    hoLot: '',
    ten: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChi: '',
    dienThoai: ''
};
const userToDelete = ref(null);
const dialogError = ref(null);
const userForm = ref(null);

const snackbar = ref({
    show: false,
    message: '',
    color: ''
});


const headers = [
    { title: 'Username', key: 'username' },
    { title: 'Email', key: 'email' },
    { title: 'Role', key: 'role' },
    { title: 'Full Name', key: 'ten', value: item => `${item.hoLot || ''} ${item.ten || ''}` },
    { title: 'Phone', key: 'dienThoai' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => (editedIndex.value === -1 ? 'Create New User' : 'Edit User'));

const loadUsers = debounce(async ({ page, itemsPerPage: perPage, sortBy }) => {
    loading.value = true;
    try {
        const params = {
            page: page || currentPage.value,
            limit: perPage || itemsPerPage.value,
            search: search.value,
            // sortBy: sortBy.length ? sortBy[0].key : undefined, // TODO: Implement sort on backend
            // sortDesc: sortBy.length ? sortBy[0].order === 'desc' : undefined,
        };
        const response = await api.get('/users', { params });
        users.value = response.data;
        totalUsers.value = response.data.length; // Backend API currently doesn't return total count
        // For accurate pagination, backend should return total count
        // totalUsers.value = response.data.total;
        loading.value = false;
    } catch (error) {
        console.error('Error loading users:', error);
        snackbar.value = { show: true, message: 'Failed to load users.', color: 'error' };
        loading.value = false;
    }
}, 300);

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'red';
        case 'staff': return 'orange';
        case 'reader': return 'blue';
        default: return 'grey';
    }
};

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
    if (editedItem.value.ngaySinh) {
        editedItem.value.ngaySinh = new Date(editedItem.value.ngaySinh).toISOString().split('T')[0];
    }
    // Không hiển thị password trong edit
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
        if (editedIndex.value > -1) { // Edit existing user
            const userId = editedItem.value._id;
            const payload = { ...editedItem.value };
            delete payload._id; // Không gửi _id trong body
            // Nếu không có password, không gửi trường password
            if (!payload.password) {
                delete payload.password;
            }
            const response = await api.put(`/users/${userId}`, payload);
            Object.assign(users.value[editedIndex.value], response.data.user);
            snackbar.value = { show: true, message: 'User updated successfully.', color: 'success' };
        } else { // Create new user
            const response = await api.post('/users', editedItem.value);
            users.value.push(response.data.user);
            totalUsers.value++;
            snackbar.value = { show: true, message: 'User created successfully.', color: 'success' };
        }
        closeDialog();
        loadUsers({}); // Refresh list
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to save user.';
        console.error('Error saving user:', error);
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
        users.value = users.value.filter(u => u._id !== userToDelete.value._id);
        totalUsers.value--;
        snackbar.value = { show: true, message: 'User deleted successfully.', color: 'success' };
        closeDeleteDialog();
    } catch (error) {
        dialogError.value = error.response?.data?.message || 'Failed to delete user.';
        snackbar.value = { show: true, message: dialogError.value, color: 'error' };
        console.error('Error deleting user:', error);
        closeDeleteDialog();
    }
};

watch(search, (newVal) => {
    currentPage.value = 1;
    loadUsers({});
});

// Load users initially
loadUsers({});
</script>