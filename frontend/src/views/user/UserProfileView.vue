<template>
  <div class="profile-wrapper bg-grey-lighten-4 fill-height pa-md-6 pa-2">
    <!-- LOADING -->
    <v-container v-if="loading" class="fill-height justify-center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-container>

    <v-container v-else-if="userProfile" class="max-width-1000">
      <v-card class="rounded-xl overflow-visible elevation-4 border-opacity-10" color="white">
        
        <!-- 1. HERO COVER & HEADER -->
        <div class="position-relative">
            <input type="file" ref="coverInput" class="d-none" accept="image/*" @change="handleCoverUpload" />
            <input type="file" ref="avatarInput" class="d-none" accept="image/*" @change="handleAvatarUpload" />

            <v-img
              :src="userProfile.coverImage || 'https://images.unsplash.com/photo-1507842217153-eae850688719?q=80&w=2000&auto=format&fit=crop'"
              height="280"
              cover
              class="rounded-t-xl align-end group-hover-parent"
              gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)"
            >
              <v-btn 
                position="absolute" 
                top="20" right="20" 
                color="white" variant="flat" size="small" 
                prepend-icon="mdi-camera"
                class="elevation-2"
                :loading="uploadingCover"
                @click="$refs.coverInput.click()"
              >
                 Edit Cover
              </v-btn>

              <div class="d-flex flex-column flex-md-row align-center align-md-end px-6 pb-6 gap-4">
                 <div class="profile-avatar-wrapper mt-n12 position-relative">
                    <v-avatar size="150" color="white" class="elevation-6 border-white">
                       <v-img 
                          :src="userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.username}&background=random`" 
                          alt="Avatar"
                          cover
                       ></v-img>
                    </v-avatar>
                    <v-btn 
                        icon="mdi-camera" size="small" color="primary" 
                        class="avatar-edit-btn elevation-3"
                        :loading="uploadingAvatar"
                        @click="$refs.avatarInput.click()"
                    ></v-btn>
                 </div>

                 <div class="text-center text-md-left text-white mb-2 flex-grow-1">
                    <h1 class="text-h4 font-weight-bold text-shadow">{{ userProfile.hoLot }} {{ userProfile.ten }}</h1>
                    <div class="text-subtitle-1 opacity-90 d-flex align-center justify-center justify-md-start">
                       <v-icon size="small" class="mr-1">mdi-at</v-icon>{{ userProfile.username }}
                       <span class="mx-2">•</span>
                       <v-chip size="small" color="white/20" variant="outlined" class="font-weight-bold text-white">
                          {{ userProfile.role === 'admin' ? 'Administrator' : 'Library Member' }}
                       </v-chip>
                    </div>
                 </div>
              </div>
            </v-img>
        </div>

        <!-- 2. TABS NAVIGATION -->
        <div class="px-4 mt-2">
           <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b">
              <v-tab value="info" class="text-capitalize font-weight-bold"><v-icon start>mdi-account-details</v-icon> Info</v-tab>
              <v-tab value="loans" class="text-capitalize font-weight-bold"><v-icon start>mdi-book-open-variant</v-icon> Loans</v-tab>
              <v-tab value="billing" class="text-capitalize font-weight-bold"><v-icon start>mdi-receipt-text</v-icon> Billing</v-tab>
              <v-tab value="security" class="text-capitalize font-weight-bold"><v-icon start>mdi-shield-lock</v-icon> Security</v-tab>
           </v-tabs>
        </div>

        <!-- 3. TABS CONTENT -->
        <v-card-text class="pa-6 bg-grey-lighten-5 rounded-b-xl">
          <v-window v-model="activeTab">
            
            <!-- TAB 1: INFO -->
            <v-window-item value="info">
               <v-row justify="center">
                  <v-col cols="12" md="10">
                     <!-- FORM CHÍNH: LỖI CỦA BẠN NẰM Ở ĐÂY NẾU THIẾU HÀM updateUserProfile -->
                     <v-form ref="profileForm" @submit.prevent="updateUserProfile">
                        <div class="text-overline text-grey-darken-1 mb-4 font-weight-bold">Basic Information</div>
                        <v-row>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.hoLot" label="Họ Lót" variant="outlined" bg-color="white" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.ten" label="Tên" variant="outlined" bg-color="white" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.username" label="Username" variant="outlined" bg-color="grey-lighten-4" density="comfortable" readonly></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.email" label="Email" variant="outlined" bg-color="grey-lighten-4" density="comfortable" readonly></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.dienThoai" label="Số điện thoại" variant="outlined" bg-color="white" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.diaChi" label="Địa chỉ" variant="outlined" bg-color="white" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                               <v-select v-model="userProfile.gioiTinh" :items="['M', 'F', 'Other']" label="Giới tính" variant="outlined" bg-color="white" density="comfortable"></v-select>
                           </v-col>
                           <v-col cols="12" md="6">
                               <v-text-field v-model="userProfile.ngaySinh" label="Ngày sinh" type="date" variant="outlined" bg-color="white" density="comfortable"></v-text-field>
                           </v-col>
                        </v-row>

                        <v-alert v-if="profileUpdateSuccess" type="success" variant="tonal" class="mt-4">{{ profileUpdateSuccess }}</v-alert>
                        <v-alert v-if="profileUpdateError" type="error" variant="tonal" class="mt-4">{{ profileUpdateError }}</v-alert>

                        <div class="d-flex justify-end mt-6">
                           <v-btn type="submit" color="primary" size="large" :loading="updateLoading" class="px-8 font-weight-bold rounded-pill">
                              Save Changes
                           </v-btn>
                        </div>
                     </v-form>
                  </v-col>
               </v-row>
            </v-window-item>

            <!-- TAB 2: LOANS -->
            <v-window-item value="loans">
               <div v-if="userLoans.length > 0">
                  <v-row dense>
                     <v-col cols="12" v-for="loan in userLoans" :key="loan._id">
                        <v-card variant="flat" class="border rounded-lg mb-2 bg-white">
                           <div class="d-flex align-center pa-3">
                              <v-avatar color="primary-lighten-5" size="56" class="rounded mr-4">
                                 <v-icon color="primary" size="30">mdi-book-open-page-variant</v-icon>
                              </v-avatar>
                              <div class="flex-grow-1">
                                 <div class="d-flex justify-space-between align-start">
                                    <h3 class="text-subtitle-1 font-weight-bold text-primary mb-1">
                                       {{ loan.bookId?.tenSach || 'Unknown Book' }}
                                    </h3>
                                    <v-chip :color="getLoanStatusColor(loan.status)" size="small" label class="font-weight-bold text-uppercase">
                                       {{ loan.status }}
                                    </v-chip>
                                 </div>
                                 <div class="text-caption text-grey-darken-1">
                                    Due: {{ formatDate(loan.ngayHenTra) }}
                                    <span v-if="loan.phatTien > 0" class="text-error font-weight-bold ml-2">Fine: {{ formatCurrency(loan.phatTien) }}</span>
                                 </div>
                              </div>
                           </div>
                        </v-card>
                     </v-col>
                  </v-row>
               </div>
               <div v-else class="text-center py-10 text-grey">No active loans.</div>
            </v-window-item>

            <!-- TAB 3: BILLING -->
            <v-window-item value="billing">
               <v-card variant="flat" class="border">
                  <v-data-table
                     :headers="paymentHeaders"
                     :items="paymentHistory"
                     :loading="loadingPayments"
                     class="bg-white"
                  >
                     <template v-slot:item.amount="{ item }">
                        <span class="font-weight-bold">{{ formatCurrency(item.amount) }}</span>
                     </template>
                     <template v-slot:item.date="{ item }">
                        {{ formatDate(item.date) }}
                     </template>
                  </v-data-table>
               </v-card>
            </v-window-item>

            <!-- TAB 4: SECURITY -->
            <v-window-item value="security">
               <v-row justify="center">
                  <v-col cols="12" md="8">
                     <v-form ref="passwordForm" @submit.prevent="updatePassword">
                        <v-text-field v-model="newPassword" label="New Password" type="password" variant="outlined" color="primary"></v-text-field>
                        <v-text-field v-model="confirmNewPassword" label="Confirm New Password" type="password" variant="outlined" color="primary"></v-text-field>
                        
                        <v-alert v-if="passwordSuccess" type="success" variant="tonal" class="mt-4">{{ passwordSuccess }}</v-alert>
                        <v-alert v-if="passwordError" type="error" variant="tonal" class="mt-4">{{ passwordError }}</v-alert>

                        <v-btn type="submit" color="warning" block size="large" :loading="passwordLoading" class="mt-6 font-weight-bold">Update Password</v-btn>
                     </v-form>
                  </v-col>
               </v-row>
            </v-window-item>

          </v-window>
        </v-card-text>
      </v-card>
    </v-container>
    
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
        {{ snackbar.message }}
        <template v-slot:actions><v-btn variant="text" @click="snackbar.show = false">Close</v-btn></template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api.service';

const authStore = useAuthStore();
const userProfile = ref(null);
const userLoans = ref([]);
const loading = ref(true);
const activeTab = ref('info');
const snackbar = ref({ show: false, message: '', color: '' });

// Upload Refs
const uploadingAvatar = ref(false);
const uploadingCover = ref(false);
const avatarInput = ref(null);
const coverInput = ref(null);

// Form update states
const updateLoading = ref(false);
const profileUpdateError = ref(null);
const profileUpdateSuccess = ref(null);

// Password states
const passwordLoading = ref(false);
const passwordError = ref(null);
const passwordSuccess = ref(null);
const newPassword = ref('');
const confirmNewPassword = ref('');

// Payment states
const loadingPayments = ref(false);
const paymentHistory = ref([]);
const paymentHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Description', key: 'description' },
    { title: 'Type', key: 'type' },
    { title: 'Amount', key: 'amount' },
    { title: 'Status', key: 'status' },
];

const totalPaid = computed(() => {
    return paymentHistory.value
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
});

// --- API CALLS ---

const fetchUserProfile = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/users/${authStore.user._id}`);
        userProfile.value = response.data;
        if (userProfile.value.ngaySinh) {
            userProfile.value.ngaySinh = new Date(userProfile.value.ngaySinh).toISOString().split('T')[0];
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const fetchUserLoans = async () => {
    try {
        const response = await api.get(`/loans?userId=${authStore.user._id}&limit=5`);
        userLoans.value = response.data.data;
    } catch (error) {
        console.error('Error fetching user loans:', error);
    }
};

// --- ĐÂY LÀ HÀM BỊ THIẾU TRONG CODE CŨ CỦA BẠN ---
const updateUserProfile = async () => {
    updateLoading.value = true;
    profileUpdateError.value = null;
    profileUpdateSuccess.value = null;
    try {
        const payload = { ...userProfile.value };
        delete payload.username;
        delete payload.email;
        delete payload.password;
        delete payload.role;
        delete payload._id;
        delete payload.createdAt;
        delete payload.updatedAt;

        const response = await api.put(`/users/${authStore.user._id}`, payload);
        profileUpdateSuccess.value = response.data.message;
        authStore.user = { ...authStore.user, ...payload };
    } catch (error) {
        profileUpdateError.value = error.response?.data?.message || 'Failed to update profile.';
    } finally {
        updateLoading.value = false;
    }
};

// Hàm đổi mật khẩu
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
    } finally {
        passwordLoading.value = false;
    }
};

// Upload Avatar
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    uploadingAvatar.value = true;
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        
        const res = await api.post(`/users/${authStore.user._id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        userProfile.value.avatar = res.data.avatar;
        authStore.updateUser({ avatar: res.data.avatar }); 
        snackbar.value = { show: true, message: 'Avatar updated!', color: 'success' };
    } catch (error) {
        snackbar.value = { show: true, message: 'Failed to upload', color: 'error' };
    } finally {
        uploadingAvatar.value = false;
    }
};

// Upload Cover
const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    uploadingCover.value = true;
    const formData = new FormData();
    formData.append('cover', file);

    try {
        const res = await api.post(`/users/${authStore.user._id}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        userProfile.value.coverImage = res.data.coverImage;
        snackbar.value = { show: true, message: 'Cover updated!', color: 'success' };
    } catch (error) {
        snackbar.value = { show: true, message: 'Failed to upload', color: 'error' };
    } finally {
        uploadingCover.value = false;
    }
};

// Payment history giả lập
const fetchPaymentHistory = async () => {
    loadingPayments.value = true;
    setTimeout(() => {
        paymentHistory.value = [
            { date: '2023-11-20', description: 'Rental Fee', type: 'rental', amount: 50000, status: 'completed' },
            { date: '2023-10-15', description: 'Late Fine', type: 'fine', amount: 15000, status: 'completed' },
        ];
        loadingPayments.value = false;
    }, 500);
};

// Helpers
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const getLoanStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning'}[s] || 'grey');

onMounted(() => {
    fetchUserProfile();
    fetchUserLoans();
    fetchPaymentHistory();
});
</script>

<style scoped>
.profile-wrapper { font-family: 'Roboto', sans-serif; }
.max-width-1000 { max-width: 1000px; margin: 0 auto; }
.border-white { border: 4px solid white !important; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.profile-avatar-wrapper { position: relative; }
.avatar-edit-btn { position: absolute; bottom: 5px; right: 5px; border: 2px solid white; }
</style>