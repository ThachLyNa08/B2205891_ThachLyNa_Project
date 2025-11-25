<template>
  <div class="chat-widget-container">
    
    <!-- 1. Nút tròn để mở Chat (Fab Button) -->
    <v-scale-transition>
      <v-btn
        v-if="!isOpen"
        icon
        color="primary"
        size="x-large"
        class="chat-fab elevation-8"
        @click="isOpen = true"
      >
        <v-icon size="32">mdi-robot-excited-outline</v-icon>
        <v-tooltip activator="parent" location="start">Chat với AI</v-tooltip>
      </v-btn>
    </v-scale-transition>

    <!-- 2. Cửa sổ Chat -->
    <v-slide-y-reverse-transition>
      <v-card
        v-if="isOpen"
        class="chat-window rounded-xl elevation-12 d-flex flex-column"
        width="380"
        height="500"
      >
        <!-- Header -->
        <v-toolbar color="primary" density="compact" flat>
          <v-icon class="ml-4 mr-2">mdi-robot</v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold">Nexus AI Assistant</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false"></v-btn>
        </v-toolbar>

        <!-- Nội dung tin nhắn (Scrollable) -->
        <div class="chat-messages flex-grow-1 pa-4 bg-grey-lighten-4" ref="chatContainer">
          
          <!-- Tin nhắn chào mừng -->
          <div class="message-wrapper ai">
             <v-avatar color="primary" size="32" class="mr-2">
                <v-icon size="18" color="white">mdi-robot</v-icon>
             </v-avatar>
             <div class="message-bubble bg-white text-grey-darken-3 elevation-1">
                Xin chào! Tôi là AI của thư viện Nexus. Tôi có thể giúp gì cho bạn?
             </div>
          </div>

          <!-- List tin nhắn -->
          <div 
             v-for="(msg, index) in messages" 
             :key="index" 
             class="message-wrapper"
             :class="msg.role"
          >
             <v-avatar v-if="msg.role === 'ai'" color="primary" size="32" class="mr-2 mt-1">
                <v-icon size="18" color="white">mdi-robot</v-icon>
             </v-avatar>
             
             <div 
                class="message-bubble elevation-1"
                :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-grey-darken-3'"
             >
                <div v-if="msg.isLoading">
                   <v-progress-circular indeterminate size="16" width="2" color="grey"></v-progress-circular>
                </div>
                <div v-else>{{ msg.text }}</div>
             </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area pa-2 bg-white border-t">
          <v-text-field
            v-model="inputMessage"
            placeholder="Type your question..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            bg-color="grey-lighten-5"
            @keyup.enter="sendMessage"
            :disabled="loading"
          >
            <template v-slot:append-inner>
               <v-btn 
                  icon="mdi-send" 
                  size="small" 
                  variant="text" 
                  color="primary" 
                  @click="sendMessage"
                  :loading="loading"
                  :disabled="!inputMessage.trim()"
               ></v-btn>
            </template>
          </v-text-field>
        </div>
      </v-card>
    </v-slide-y-reverse-transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import api from '@/services/api.service';

const isOpen = ref(false);
const inputMessage = ref('');
const loading = ref(false);
const messages = ref([]);
const chatContainer = ref(null);

// Hàm cuộn xuống cuối
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return;

  const userText = inputMessage.value;
  
  // 1. Thêm tin nhắn user vào list
  messages.value.push({ role: 'user', text: userText });
  inputMessage.value = '';
  scrollToBottom();

  // 2. Thêm tin nhắn "Đang gõ..." của AI
  loading.value = true;
  messages.value.push({ role: 'ai', text: '', isLoading: true });
  scrollToBottom();

  try {
    // 3. Gọi API Backend (Không gọi trực tiếp Google)
    const history = messages.value
        .filter(m => !m.isLoading)
        .map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

    const response = await api.post('/ai/chat', { 
        message: userText,
        history: history.slice(-10) // Chỉ gửi 10 tin gần nhất để tiết kiệm token
    });

    // 4. Cập nhật tin nhắn AI
    messages.value.pop(); // Xóa cục loading
    messages.value.push({ role: 'ai', text: response.data.reply });

  } catch (error) {
    messages.value.pop();
    messages.value.push({ role: 'ai', text: 'Xin lỗi, tôi đang gặp sự cố kết nối.' });
    console.error(error);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

// Tự động focus hoặc scroll khi mở
watch(isOpen, (val) => {
    if (val) scrollToBottom();
});
</script>

<style scoped>
.chat-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-fab {
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-fab:hover { transform: scale(1.1) rotate(-10deg); }

.chat-window {
  box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

.chat-messages {
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}
.message-wrapper.user { justify-content: flex-end; }
.message-wrapper.ai { justify-content: flex-start; }

.message-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 80%;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-wrapper.ai .message-bubble { border-top-left-radius: 4px; }
.message-wrapper.user .message-bubble { border-bottom-right-radius: 4px; }

/* Custom Scrollbar */
.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 3px; }
</style>