<template>
  <div class="profile-page-wrapper fill-height bg-grey-lighten-5 pa-md-4 pa-0">
    
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
    </v-overlay>

    <v-container v-if="userProfile" class="max-width-1100 pa-0 pa-md-4">
      
      <v-card class="rounded-xl overflow-visible elevation-6 mb-6 border-0">
        
        <div class="position-relative group">
           <input type="file" ref="coverInput" class="d-none" accept="image/*" @change="handleCoverUpload" />
           <input type="file" ref="avatarInput" class="d-none" accept="image/*" @change="handleAvatarUpload" />

           <v-img
             :src="userProfile.coverImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2400&auto=format&fit=crop'"
             height="320"
             cover
             class="rounded-t-xl align-end"
             gradient="to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%"
           >
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

             <div class="d-md-none px-4 pb-4 text-white">
                <h1 class="text-h5 font-weight-bold">{{ userProfile.hoLot }} {{ userProfile.ten }}</h1>
                <div class="text-caption opacity-80">@{{ userProfile.username }}</div>
             </div>
           </v-img>

           <div class="profile-bar d-flex flex-column flex-md-row align-center align-md-end px-6 mt-n16 position-relative z-index-10">
                
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

                <div class="d-flex gap-4 mb-4 mt-4 mt-md-0">
                   <v-card width="100" class="text-center py-2 rounded-lg" elevation="2">
                      <div class="text-h6 font-weight-bold text-primary">{{ userLoans.length }}</div>
                      <div class="text-caption text-grey">Mượn/Trả</div>
                   </v-card>
                   <v-card width="100" class="text-center py-2 rounded-lg" elevation="2">
                      <div class="text-h6 font-weight-bold text-pink">{{ authStore.favorites.length }}</div>
                      <div class="text-caption text-grey">Đã thích</div>
                   </v-card>
                </div>
           </div>
       </div>

       <div class="mt-2 px-2">
          <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b ml-md-16 pl-md-16">
             <v-tab value="info" class="text-capitalize font-weight-bold letter-spacing-1 px-6">Thông tin cá nhân</v-tab>
             <v-tab value="loans" class="text-capitalize font-weight-bold letter-spacing-1 px-6">Mượn/trả</v-tab>
             <v-tab value="favorites" class="text-capitalize font-weight-bold letter-spacing-1 px-6 text-pink">Yêu thích</v-tab>
             <v-tab value="security" class="text-capitalize font-weight-bold letter-spacing-1 px-6 text-red-lighten-1">Mật khẩu</v-tab>
          </v-tabs>
       </div>
     </v-card>

     <v-row>
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
              <div class="text-h6 font-weight-bold mb-2">Library Pro</div>
              <p class="text-caption mb-4 opacity-90">Unlock unlimited borrowing and exclusive events.</p>
              <v-btn block color="white" variant="outlined" class="text-capitalize">Upgrade Now</v-btn>
           </v-card>
        </v-col>

        <v-col cols="12" md="8">
           <v-window v-model="activeTab">
              
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
                          <v-col cols="12" sm="6">
                             <v-text-field v-model="userProfile.hoLot" label="First Name" variant="outlined" color="primary" density="comfortable"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                             <v-text-field v-model="userProfile.ten" label="Last Name" variant="outlined" color="primary" density="comfortable"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                             <v-text-field v-model="userProfile.dienThoai" label="Phone Number" variant="outlined" color="primary" density="comfortable" prepend-inner-icon="mdi-phone"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-select v-model="userProfile.gioiTinh" :items="['M', 'F', 'Other']" label="Gender" variant="outlined" color="primary" density="comfortable"></v-select>
                          </v-col>
                          <v-col cols="12">
                             <v-text-field v-model="userProfile.diaChi" label="Address" variant="outlined" color="primary" density="comfortable" prepend-inner-icon="mdi-map-marker"></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                              <v-text-field v-model="userProfile.ngaySinh" label="Birthday" type="date" variant="outlined" color="primary" density="comfortable"></v-text-field>
                          </v-col>
                       </v-row>
                       <button ref="profileFormButton" type="submit" class="d-none"></button>
                    </v-form>
                 </v-card>
              </v-window-item>

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
                    <v-btn block variant="tonal" color="primary" class="mt-2" to="/my-loans">Xem tất cả</v-btn>
                 </div>
                 <v-sheet v-else class="rounded-xl pa-8 text-center border border-dashed bg-transparent">
                    <v-icon size="60" color="grey-lighten-2">mdi-bookshelf</v-icon>
                    <div class="text-body-1 text-grey mt-2">No active loans found.</div>
                    <v-btn color="primary" variant="flat" class="mt-4 rounded-pill" to="/books">Borrow Books</v-btn>
                 </v-sheet>
              </v-window-item>

              <v-window-item value="favorites" class="h-100">
               <v-card class="rounded-xl shadow-card border-none h-100 bg-transparent" elevation="0">
                  <div class="d-flex align-center justify-space-between mb-4">
                     <h3 class="text-h5 font-weight-bold text-blue-grey-darken-3">Sách đã thích</h3>
                     <v-btn to="/books?filter=favorites" variant="text" color="primary" append-icon="mdi-arrow-right">Xem tất cả</v-btn>
                  </div>
                  
                  <div v-if="authStore.favorites.length > 0">
                      <v-slide-group
                        show-arrows
                        class="pa-0"
                      >
                        <template v-slot:next>
                           <v-btn icon="mdi-chevron-right" color="white" class="bg-primary elevation-2" size="small"></v-btn>
                        </template>
                        <template v-slot:prev>
                           <v-btn icon="mdi-chevron-left" color="white" class="bg-primary elevation-2" size="small"></v-btn>
                        </template>

                        <v-slide-group-item
                          v-for="book in authStore.favorites"
                          :key="book._id"
                        >
                          <div class="mr-4 my-2" style="width: 200px;">
                             <BookCard :book="book" />
                          </div>
                        </v-slide-group-item>
                      </v-slide-group>
                  </div>

                  <div v-else class="text-center py-12 bg-white rounded-xl border-dashed">
                      <v-icon size="64" color="grey-lighten-2" class="mb-2">mdi-heart-broken</v-icon>
                      <div class="text-grey">Your wishlist is empty.</div>
                      <v-btn to="/books" color="primary" variant="text" class="mt-2">Explore Books</v-btn>
                  </div>
               </v-card>
            </v-window-item>

              <v-window-item value="security">
                 <v-card class="rounded-xl pa-6 elevation-2 border-red-top">
                    <div class="d-flex align-center mb-6">
                       <v-avatar color="red-lighten-5" size="48" class="mr-4">
                          <v-icon color="red" size="24">mdi-lock-alert</v-icon>
                       </v-avatar>
                       <div>
                          <div class="text-h6 font-weight-bold">Đổi mật khẩu</div>
                          <div class="text-caption text-grey">Secure your account with a strong password.</div>
                       </div>
                    </div>

                    <v-form ref="passwordForm" @submit.prevent="updatePassword">
                       <v-text-field 
                          v-model="pass.newPassword" 
                          label="New Password" 
                          type="password" 
                          variant="outlined" density="comfortable" 
                          prepend-inner-icon="mdi-lock-outline"
                          class="mb-2"
                       ></v-text-field>
                       <v-text-field 
                          v-model="pass.confirmPassword" 
                          label="Confirm Password" 
                          type="password" 
                          variant="outlined" density="comfortable" 
                          prepend-inner-icon="mdi-lock-check-outline"
                       ></v-text-field>
                       
                       <div class="d-flex justify-end mt-4">
                          <v-btn type="submit" color="red" block size="large" :loading="passwordLoading" class="mt-4 font-weight-bold text-white rounded-lg">
                             Update Password
                          </v-btn>
                       </div>
                    </v-form>
                 </v-card>
              </v-window-item>

           </v-window>
        </v-col>
     </v-row>

   </v-container>
   
   <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
       {{ snackbar.message }}
       <template v-slot:actions><v-btn variant="text" @click="snackbar.show = false">Close</v-btn></template>
   </v-snackbar>
 </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api.service';
import BookCard from '@/components/BookCard.vue'; // Import component BookCard

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
const pass = reactive({ newPassword: '', confirmPassword: '' });

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
   if (pass.newPassword !== pass.confirmPassword) return showSnack('Passwords do not match', 'error');
   if (pass.newPassword.length < 6) return showSnack('Password too short', 'error');

   passwordLoading.value = true;
   try {
       await api.put(`/users/${authStore.user._id}/password`, { newPassword: pass.newPassword });
       showSnack('Password updated successfully', 'success');
       pass.newPassword = ''; pass.confirmPassword = '';
   } catch (e) {
       showSnack(e.response?.data?.message || 'Failed', 'error');
   } finally {
       passwordLoading.value = false;
   }
};

const handleAvatarUpload = async (event) => {
   const file = event.target.files[0];
   if (!file) return;
   uploadingAvatar.value = true;
   const formData = new FormData();
   formData.append('avatar', file);

   try {
       const res = await api.post(`/users/${authStore.user._id}/avatar`, formData, { headers: {'Content-Type': 'multipart/form-data'} });
       userProfile.value.avatar = res.data.avatar;
       authStore.updateUser({ avatar: res.data.avatar }); 
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
       authStore.updateUser({ coverImage: res.data.coverImage }); 
       showSnack('Cover updated!', 'success');
   } catch (e) { showSnack('Upload failed', 'error'); } 
   finally { uploadingCover.value = false; }
};

const showSnack = (msg, color) => { snackbar.value = { show: true, message: msg, color }; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const getLoanStatusColor = (s) => ({'borrowed':'info','returned':'success','overdue':'error','pending':'warning'}[s] || 'grey');

onMounted(async () => {
   if(authStore.isAuthenticated) {
       await authStore.fetchUser();
       await authStore.fetchFavorites(); // Load danh sách yêu thích
       fetchUserProfile();
       fetchUserLoans();
   }
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