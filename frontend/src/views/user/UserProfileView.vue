<template>
  <div class="profile-page-wrapper fill-height bg-grey-lighten-5 pa-md-4 pa-0">
    
    <!-- LOADING OVERLAY -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
    </v-overlay>

    <v-container v-if="userProfile" class="max-width-1100 pa-0 pa-md-4">
      
      <!-- 1. PROFILE HEADER CARD -->
      <v-card class="rounded-xl overflow-visible elevation-6 mb-6 border-0">
        
        <!-- COVER IMAGE AREA -->
        <div class="position-relative group">
            <!-- Input ẩn -->
            <input type="file" ref="coverInput" class="d-none" accept="image/*" @change="handleCoverUpload" />
            <input type="file" ref="avatarInput" class="d-none" accept="image/*" @change="handleAvatarUpload" />

            <v-img
              :src="userProfile.coverImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2400&auto=format&fit=crop'"
              height="320"
              cover
              class="rounded-t-xl align-end"
              gradient="to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%"
            >
              <!-- Nút đổi ảnh bìa (Hiện khi hover) -->
              <v-btn 
                position="absolute" 
                top="20" right="20" 
                color="white" variant="elevated" size="small" 
                prepend-icon="mdi-camera"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                :loading="uploadingCover"
                @click="$refs.coverInput.click()"
              >
                 Change Cover
              </v-btn>

              <!-- USER INFO ON COVER (Mobile Layout) -->
              <div class="d-md-none px-4 pb-4 text-white">
                 <h1 class="text-h5 font-weight-bold">{{ userProfile.hoLot }} {{ userProfile.ten }}</h1>
                 <div class="text-caption opacity-80">@{{ userProfile.username }}</div>
              </div>
            </v-img>

            <!-- AVATAR & DESKTOP INFO -->
            <div class="profile-bar d-flex flex-column flex-md-row align-center align-md-end px-6 mt-n16 position-relative z-index-10">
                 
                 <!-- AVATAR -->
                 <div class="position-relative">
                    <v-avatar size="160" class="profile-avatar elevation-10 bg-white pa-1">
                       <v-img 
                          :src="userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.username}&background=0D8ABC&color=fff`" 
                          cover
                          class="rounded-circle bg-grey-lighten-3"
                       ></v-img>
                    </v-avatar>
                    <v-btn 
                        icon="mdi-camera-plus" 
                        size="small" 
                        color="primary" 
                        class="avatar-edit-btn elevation-4"
                        :loading="uploadingAvatar"
                        @click="$refs.avatarInput.click()"
                    ></v-btn>
                 </div>

                 <!-- INFO TEXT (Desktop) -->
                 <div class="d-none d-md-block mb-4 ml-6 text-shadow-dark">
                    <h1 class="text-h4 font-weight-bold text-black mb-1">{{ userProfile.hoLot }} {{ userProfile.ten }}</h1>
                    <div class="d-flex align-center text-white opacity-90">
                       <v-chip size="small" color="blue" variant="outlined" class="mr-2 font-weight-bold text-uppercase">
                          {{ userProfile.role }}
                       </v-chip>
                       <span class="text-subtitle-1">@{{ userProfile.username }}</span>
                    </div>
                 </div>

                 <v-spacer></v-spacer>

                 <!-- QUICK STATS -->
                 <div class="d-flex gap-4 mb-4 mt-4 mt-md-0">
                    <v-card width="100" class="text-center py-2 rounded-lg" elevation="2">
                       <div class="text-h6 font-weight-bold text-primary">{{ userLoans.length }}</div>
                       <div class="text-caption text-grey">Loans</div>
                    </v-card>
                    <v-card width="100" class="text-center py-2 rounded-lg" elevation="2">
                       <div class="text-h6 font-weight-bold text-success">{{ formatCurrencyCompact(totalPaid) }}</div>
                       <div class="text-caption text-grey">Paid</div>
                    </v-card>
                 </div>
            </div>
        </div>

        <!-- NAVIGATION TABS -->
        <div class="mt-2 px-2">
           <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b ml-md-16 pl-md-16">
              <v-tab value="info" class="text-capitalize font-weight-bold letter-spacing-1 px-6">Personal Info</v-tab>
              <v-tab value="loans" class="text-capitalize font-weight-bold letter-spacing-1 px-6">My Loans</v-tab>
              <v-tab value="billing" class="text-capitalize font-weight-bold letter-spacing-1 px-6">Billing</v-tab>
              <v-tab value="security" class="text-capitalize font-weight-bold letter-spacing-1 px-6 text-red-lighten-1">Security</v-tab>
           </v-tabs>
        </div>
      </v-card>

      <!-- 2. MAIN CONTENT SECTION -->
      <v-row>
         <!-- LEFT COLUMN: MENU OR WIDGETS (Optional - Hidden on small screens) -->
         <v-col cols="12" md="4" class="d-none d-md-block">
            <v-card class="rounded-xl pa-4 mb-4 elevation-2" title="Contact Info">
               <v-list density="compact">
                  <v-list-item prepend-icon="mdi-email-outline">
                     <v-list-item-title class="text-body-2">{{ userProfile.email }}</v-list-item-title>
                     <v-list-item-subtitle>Email</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item prepend-icon="mdi-phone-outline">
                     <v-list-item-title class="text-body-2">{{ userProfile.dienThoai || 'N/A' }}</v-list-item-title>
                     <v-list-item-subtitle>Phone</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item prepend-icon="mdi-map-marker-outline">
                     <v-list-item-title class="text-body-2">{{ userProfile.diaChi || 'N/A' }}</v-list-item-title>
                     <v-list-item-subtitle>Address</v-list-item-subtitle>
                  </v-list-item>
               </v-list>
            </v-card>
            
            <v-card class="rounded-xl pa-4 bg-gradient-primary text-white elevation-4">
               <div class="text-h6 font-weight-bold mb-2">Upgrade to Pro?</div>
               <p class="text-caption mb-4 opacity-90">Unlock unlimited book loans and priority support.</p>
               <v-btn block color="white" variant="outlined" class="text-capitalize">Learn More</v-btn>
            </v-card>
         </v-col>

         <!-- RIGHT COLUMN: TAB CONTENT -->
         <v-col cols="12" md="8">
            <v-window v-model="activeTab">
               
               <!-- TAB INFO -->
               <v-window-item value="info">
                  <v-card class="rounded-xl pa-6 elevation-2">
                     <div class="d-flex justify-space-between align-center mb-6">
                        <h3 class="text-h6 font-weight-bold text-grey-darken-3">Edit Profile</h3>
                        <v-btn 
                           color="primary" 
                           variant="flat" 
                           prepend-icon="mdi-content-save" 
                           class="text-capitalize"
                           :loading="updateLoading"
                           @click="$refs.profileFormButton.click()"
                        >Save</v-btn>
                     </div>

                     <v-form ref="profileForm" @submit.prevent="updateUserProfile">
                        <v-row>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.hoLot" label="First Name" variant="outlined" color="primary" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.ten" label="Last Name" variant="outlined" color="primary" density="comfortable"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.dienThoai" label="Phone Number" variant="outlined" color="primary" density="comfortable" prepend-inner-icon="mdi-phone"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                               <v-select v-model="userProfile.gioiTinh" :items="['M', 'F', 'Other']" label="Gender" variant="outlined" color="primary" density="comfortable"></v-select>
                           </v-col>
                           <v-col cols="12">
                              <v-text-field v-model="userProfile.diaChi" label="Address" variant="outlined" color="primary" density="comfortable" prepend-inner-icon="mdi-map-marker"></v-text-field>
                           </v-col>
                           <v-col cols="12" md="6">
                               <v-text-field v-model="userProfile.ngaySinh" label="Birthday" type="date" variant="outlined" color="primary" density="comfortable"></v-text-field>
                           </v-col>
                        </v-row>
                        <!-- Hidden submit button to trigger form submit -->
                        <button ref="profileFormButton" type="submit" class="d-none"></button>
                     </v-form>
                  </v-card>
               </v-window-item>

               <!-- TAB LOANS -->
               <v-window-item value="loans">
                  <div v-if="userLoans.length > 0">
                     <v-card v-for="loan in userLoans" :key="loan._id" class="mb-3 rounded-xl border elevation-1 hover-elevate">
                        <div class="d-flex pa-3">
                           <v-img 
                              :src="loan.bookId?.coverUrl || 'https://via.placeholder.com/100'" 
                              width="80" height="120" cover 
                              class="rounded-lg bg-grey-lighten-3 mr-4"
                           ></v-img>
                           <div class="flex-grow-1 py-1">
                              <div class="d-flex justify-space-between">
                                 <div class="text-subtitle-1 font-weight-bold text-primary text-truncate" style="max-width: 200px;">
                                    {{ loan.bookId?.tenSach || 'Unknown Book' }}
                                 </div>
                                 <v-chip :color="getLoanStatusColor(loan.status)" size="x-small" label class="font-weight-bold text-uppercase">
                                    {{ loan.status }}
                                 </v-chip>
                              </div>
                              <div class="text-caption text-grey mb-2">Borrowed: {{ formatDate(loan.ngayMuon) }}</div>
                              
                              <div class="d-flex align-center gap-2 mt-2">
                                 <v-chip size="small" variant="outlined" color="grey-darken-2" prepend-icon="mdi-calendar-clock">
                                    Due: {{ formatDate(loan.ngayHenTra) }}
                                 </v-chip>
                                 <v-chip v-if="loan.phatTien > 0" size="small" color="error" variant="flat">
                                    Fine: {{ formatCurrency(loan.phatTien) }}
                                 </v-chip>
                              </div>
                           </div>
                        </div>
                     </v-card>
                     <v-btn block variant="tonal" color="primary" class="mt-2" to="/my-loans">View All Loans</v-btn>
                  </div>
                  <v-sheet v-else class="rounded-xl pa-8 text-center border border-dashed bg-transparent">
                     <v-icon size="60" color="grey-lighten-2">mdi-bookshelf</v-icon>
                     <div class="text-body-1 text-grey mt-2">No active loans found.</div>
                     <v-btn color="primary" variant="flat" class="mt-4 rounded-pill" to="/books">Borrow Books</v-btn>
                  </v-sheet>
               </v-window-item>

               <!-- TAB BILLING -->
               <v-window-item value="billing">
                  <v-card class="rounded-xl elevation-2 overflow-hidden">
                     <v-data-table
                        :headers="paymentHeaders"
                        :items="paymentHistory"
                        :loading="loadingPayments"
                        class="text-body-2"
                     >
                        <template v-slot:item.amount="{ item }">
                           <span class="font-weight-bold" :class="item.type === 'fine' ? 'text-red' : 'text-grey-darken-3'">
                              {{ formatCurrency(item.amount) }}
                           </span>
                        </template>
                        <template v-slot:item.status="{ item }">
                           <v-icon v-if="item.status === 'completed'" color="success" size="small">mdi-check-circle</v-icon>
                           <span class="ml-2">{{ item.status }}</span>
                        </template>
                        <template v-slot:item.date="{ item }">{{ formatDate(item.date) }}</template>
                     </v-data-table>
                  </v-card>
               </v-window-item>

               <!-- TAB SECURITY -->
               <v-window-item value="security">
                  <v-card class="rounded-xl pa-6 elevation-2 border-red-top">
                     <div class="d-flex align-center mb-6">
                        <v-avatar color="red-lighten-5" size="48" class="mr-4">
                           <v-icon color="red" size="24">mdi-lock-alert</v-icon>
                        </v-avatar>
                        <div>
                           <div class="text-h6 font-weight-bold">Change Password</div>
                           <div class="text-caption text-grey">Secure your account with a strong password.</div>
                        </div>
                     </div>

                     <v-form ref="passwordForm" @submit.prevent="updatePassword">
                        <v-text-field 
                           v-model="newPassword" 
                           label="New Password" 
                           prepend-inner-icon="mdi-lock-outline" 
                           type="password" 
                           variant="outlined" 
                           color="primary"
                        ></v-text-field>
                        
                        <v-text-field 
                           v-model="confirmNewPassword" 
                           label="Confirm Password" 
                           prepend-inner-icon="mdi-lock-check-outline" 
                           type="password" 
                           variant="outlined" 
                           color="primary"
                        ></v-text-field>

                        <v-btn type="submit" color="red" block size="large" :loading="passwordLoading" class="mt-4 font-weight-bold text-white rounded-lg">
                           Update Password
                        </v-btn>
                     </v-form>
                  </v-card>
               </v-window-item>

            </v-window>
         </v-col>
      </v-row>

    </v-container>
    
    <!-- SNACKBAR -->
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

// Form & Password
const updateLoading = ref(false);
const passwordLoading = ref(false);
const newPassword = ref('');
const confirmNewPassword = ref('');

// Payment
const loadingPayments = ref(false);
const paymentHistory = ref([]);
const paymentHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Description', key: 'description' },
    { title: 'Amount', key: 'amount', align: 'end' },
    { title: 'Status', key: 'status', align: 'center' },
];

const totalPaid = computed(() => paymentHistory.value.reduce((sum, p) => sum + p.amount, 0));

// --- API CALLS ---

const fetchUserProfile = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/users/${authStore.user._id}`);
        userProfile.value = response.data;
        if (userProfile.value.ngaySinh) {
            userProfile.value.ngaySinh = new Date(userProfile.value.ngaySinh).toISOString().split('T')[0];
        }
    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
};

const fetchUserLoans = async () => {
    try {
        const response = await api.get(`/loans?userId=${authStore.user._id}&limit=3`);
        userLoans.value = response.data.data;
    } catch (e) {}
};

const updateUserProfile = async () => {
    updateLoading.value = true;
    try {
        const payload = { ...userProfile.value };
        // Clean payload
        ['username', 'email', 'password', 'role', '_id', 'createdAt', 'updatedAt'].forEach(k => delete payload[k]);

        const response = await api.put(`/users/${authStore.user._id}`, payload);
        authStore.updateUser(payload); // Update store
        showSnack(response.data.message, 'success');
    } catch (e) {
        showSnack(e.response?.data?.message || 'Update failed', 'error');
    } finally {
        updateLoading.value = false;
    }
};

const updatePassword = async () => {
    if (newPassword.value !== confirmNewPassword.value) return showSnack('Passwords do not match', 'error');
    if (newPassword.value.length < 6) return showSnack('Password too short', 'error');

    passwordLoading.value = true;
    try {
        await api.put(`/users/${authStore.user._id}/password`, { newPassword: newPassword.value });
        showSnack('Password updated successfully', 'success');
        newPassword.value = ''; confirmNewPassword.value = '';
    } catch (e) {
        showSnack(e.response?.data?.message || 'Failed', 'error');
    } finally {
        passwordLoading.value = false;
    }
};

// --- FIX: UPDATE STORE SAU KHI UPLOAD ---
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    uploadingAvatar.value = true;
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await api.post(`/users/${authStore.user._id}/avatar`, formData, { headers: {'Content-Type': 'multipart/form-data'} });
        userProfile.value.avatar = res.data.avatar;
        authStore.updateUser({ avatar: res.data.avatar }); // Cập nhật store
        showSnack('Avatar updated!', 'success');
    } catch (e) { showSnack('Upload failed', 'error'); } 
    finally { uploadingAvatar.value = false; }
};

const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    uploadingCover.value = true;
    const formData = new FormData();
    formData.append('cover', file);

    try {
        const res = await api.post(`/users/${authStore.user._id}/cover`, formData, { headers: {'Content-Type': 'multipart/form-data'} });
        userProfile.value.coverImage = res.data.coverImage;
        
        // --- FIX QUAN TRỌNG: CẬP NHẬT COVER VÀO STORE ---
        authStore.updateUser({ coverImage: res.data.coverImage }); 
        // -------------------------------------------------
        
        showSnack('Cover updated!', 'success');
    } catch (e) { showSnack('Upload failed', 'error'); } 
    finally { uploadingCover.value = false; }
};

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

const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatCurrencyCompact = (v) => new Intl.NumberFormat('en', { notation: "compact" }).format(v || 0);
const getLoanStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning'}[s] || 'grey');

onMounted(() => {
    fetchUserProfile();
    fetchUserLoans();
    fetchPaymentHistory();
});
</script>

<style scoped>
.profile-page-wrapper { font-family: 'Inter', sans-serif; }
.max-width-1100 { max-width: 1100px; margin: 0 auto; }
.gap-4 { gap: 16px; }
.z-index-10 { z-index: 10; }
.text-shadow-dark { text-shadow: 0 2px 10px rgba(0,0,0,0.6); }

/* Avatar Styles */
.profile-avatar { border: 4px solid white; }
.avatar-edit-btn { position: absolute; bottom: 5px; right: 5px; border: 2px solid white; z-index: 20; }

/* Cover Hover Effect */
.group:hover .opacity-0 { opacity: 1 !important; }
.transition-opacity { transition: opacity 0.3s ease; }

/* Gradient Backgrounds */
.bg-gradient-primary { background: linear-gradient(135deg, #1976D2, #64B5F6); }
.border-red-top { border-top: 4px solid #EF5350 !important; }

.hover-elevate { transition: transform 0.2s; }
.hover-elevate:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; border-color: #1976D2 !important; }

.letter-spacing-1 { letter-spacing: 0.5px; }
</style>