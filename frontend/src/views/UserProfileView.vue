<!-- frontend/src/views/UserProfileView.vue -->
<template>
    <v-container>
        <h1 class="text-h4 mb-6">My Profile</h1>

        <v-row v-if="loading">
            <v-col cols="12" md="6">
                <v-skeleton-loader type="card-avatar, list-item-two-line, actions"></v-skeleton-loader>
            </v-col>
            <v-col cols="12" md="6">
                <v-skeleton-loader type="list-item-three-line, list-item-three-line"></v-skeleton-loader>
            </v-col>
        </v-row>

        <v-row v-else-if="userProfile">
            <v-col cols="12" md="6">
                <v-card class="pa-4">
                    <v-card-title class="text-h5">Personal Information</v-card-title>
                    <v-card-text>
                        <v-form ref="profileForm" @submit.prevent="updateUserProfile">
                            <v-text-field v-model="userProfile.username" label="Username" prepend-inner-icon="mdi-account" disabled></v-text-field>
                            <v-text-field v-model="userProfile.email" label="Email" prepend-inner-icon="mdi-email" type="email" disabled></v-text-field>
                            <v-text-field v-model="userProfile.hoLot" label="Họ lót" prepend-inner-icon="mdi-format-text"></v-text-field>
                            <v-text-field v-model="userProfile.ten" label="Tên" prepend-inner-icon="mdi-format-text"></v-text-field>
                            <v-text-field v-model="userProfile.dienThoai" label="Điện thoại" prepend-inner-icon="mdi-phone"></v-text-field>
                            <v-text-field v-model="userProfile.diaChi" label="Địa chỉ" prepend-inner-icon="mdi-map-marker"></v-text-field>
                            <v-select
                                v-model="userProfile.gioiTinh"
                                :items="['M', 'F', 'Other']"
                                label="Giới tính"
                                prepend-inner-icon="mdi-gender-male-female"
                            ></v-select>
                            <v-text-field
                                v-model="userProfile.ngaySinh"
                                label="Ngày sinh (YYYY-MM-DD)"
                                prepend-inner-icon="mdi-calendar"
                                type="date"
                            ></v-text-field>

                            <v-alert v-if="profileUpdateError" type="error" class="mb-4">{{ profileUpdateError }}</v-alert>
                            <v-alert v-if="profileUpdateSuccess" type="success" class="mb-4">{{ profileUpdateSuccess }}</v-alert>

                            <v-btn type="submit" color="primary" :loading="updateLoading">Update Profile</v-btn>
                        </v-form>

                        <v-divider class="my-6"></v-divider>

                        <h3 class="text-h6 mb-3">Change Password</h3>
                        <v-form ref="passwordForm" @submit.prevent="updatePassword">
                            <v-text-field
                                v-model="newPassword"
                                label="New Password"
                                prepend-inner-icon="mdi-lock"
                                type="password"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="confirmNewPassword"
                                label="Confirm New Password"
                                prepend-inner-icon="mdi-lock-check"
                                type="password"
                                required
                            ></v-text-field>

                            <v-alert v-if="passwordError" type="error" class="mb-4">{{ passwordError }}</v-alert>
                            <v-alert v-if="passwordSuccess" type="success" class="mb-4">{{ passwordSuccess }}</v-alert>

                            <v-btn type="submit" color="warning" :loading="passwordLoading">Change Password</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="pa-4">
                    <v-card-title class="text-h5">My Loans</v-card-title>
                    <v-card-text>
                        <v-list dense>
                            <v-list-item v-for="loan in userLoans" :key="loan._id">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        <router-link :to="`/books/${loan.bookId?._id}`" class="text-primary text-decoration-none">
                                            {{ loan.bookId?.tenSach || 'Unknown Book' }}
                                        </router-link>
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        Borrowed: {{ formatDate(loan.ngayMuon) }} | Due: {{ formatDate(loan.ngayHenTra) }} | Status:
                                        <v-chip :color="getLoanStatusColor(loan.status)" size="small">{{ loan.status }}</v-chip>
                                        <span v-if="loan.phatTien > 0"> | Fine: {{ formatCurrency(loan.phatTien) }}</span>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-if="userLoans.length === 0">
                                <v-list-item-content>
                                    <v-list-item-title>No active loans.</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                        <v-btn text color="primary" to="/my-loans">View all loans</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols="12" class="text-center">
                <v-alert type="error">Failed to load user profile.</v-alert>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const authStore = useAuthStore();
const userProfile = ref(null);
const userLoans = ref([]);
const loading = ref(true);
const updateLoading = ref(false);
const passwordLoading = ref(false);
const profileUpdateError = ref(null);
const profileUpdateSuccess = ref(null);
const passwordError = ref(null);
const passwordSuccess = ref(null);

const newPassword = ref('');
const confirmNewPassword = ref('');

const fetchUserProfile = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/users/${authStore.user._id}`);
        userProfile.value = response.data;
        // Format ngaySinh to YYYY-MM-DD for date input
        if (userProfile.value.ngaySinh) {
            userProfile.value.ngaySinh = new Date(userProfile.value.ngaySinh).toISOString().split('T')[0];
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    } finally {
        loading.value = false;
    }
};

const fetchUserLoans = async () => {
    try {
        const response = await api.get(`/loans?userId=${authStore.user._id}&limit=5`); // Lấy 5 khoản mượn gần nhất
        userLoans.value = response.data.data;
    } catch (error) {
        console.error('Error fetching user loans:', error);
    }
};

const updateUserProfile = async () => {
    updateLoading.value = true;
    profileUpdateError.value = null;
    profileUpdateSuccess.value = null;
    try {
        const payload = { ...userProfile.value };
        // Xóa các trường không được phép update hoặc disable
        delete payload.username;
        delete payload.email;
        delete payload.password;
        delete payload.role;
        delete payload._id;
        delete payload.createdAt;
        delete payload.updatedAt;

        const response = await api.put(`/users/${authStore.user._id}`, payload);
        profileUpdateSuccess.value = response.data.message;
        // Cập nhật lại user trong store nếu cần (ví dụ: họ tên)
        authStore.user = { ...authStore.user, ...payload };
    } catch (error) {
        profileUpdateError.value = error.response?.data?.message || 'Failed to update profile.';
        console.error('Error updating user profile:', error);
    } finally {
        updateLoading.value = false;
    }
};

const updatePassword = async () => {
    passwordLoading.value = true;
    passwordError.value = null;
    passwordSuccess.value = null;

    if (newPassword.value !== confirmNewPassword.value) {
        passwordError.value = 'New passwords do not match.';
        passwordLoading.value = false;
        return;
    }
    if (newPassword.value.length < 6) {
        passwordError.value = 'New password must be at least 6 characters.';
        passwordLoading.value = false;
        return;
    }

    try {
        const response = await api.put(`/users/${authStore.user._id}/password`, { newPassword: newPassword.value });
        passwordSuccess.value = response.data.message;
        newPassword.value = '';
        confirmNewPassword.value = '';
    } catch (error) {
        passwordError.value = error.response?.data?.message || 'Failed to update password.';
        console.error('Error updating password:', error);
    } finally {
        passwordLoading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getLoanStatusColor = (status) => {
    switch (status) {
        case 'borrowed': return 'info';
        case 'returned': return 'success';
        case 'overdue': return 'error';
        case 'pending': return 'warning';
        case 'cancelled': return 'secondary';
        default: return 'grey';
    }
};

onMounted(() => {
    fetchUserProfile();
    fetchUserLoans();
});
</script>