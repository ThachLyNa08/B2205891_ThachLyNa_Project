<template>
  <div class="chat-widget-container">
    
    <v-scale-transition>
      <div v-if="!isOpen" class="fab-wrapper">
        <div class="pulse-ring"></div>
        
        <v-btn
          icon
          color="primary"
          size="x-large"
          class="chat-fab elevation-8"
          @click="isOpen = true"
        >
          <v-icon size="32" class="swing-icon">mdi-robot-excited-outline</v-icon>
          <v-tooltip activator="parent" location="start">Hỏi AI về sách ngay!</v-tooltip>
        </v-btn>
        
        <v-badge content="1" color="red" floating offset-x="10" offset-y="10" class="notification-badge"></v-badge>
      </div>
    </v-scale-transition>

    <v-slide-y-reverse-transition>
      <v-card
        v-if="isOpen"
        class="chat-window rounded-xl elevation-12 d-flex flex-column"
        width="380"
        height="500"
      >
        <v-toolbar color="primary" density="compact" flat>
          <v-icon class="ml-4 mr-2">mdi-robot</v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold">Nexus AI</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false"></v-btn>
        </v-toolbar>

        <div class="chat-messages flex-grow-1 pa-4 bg-grey-lighten-4" ref="chatContainer">
          <div class="message-wrapper ai">
             <v-avatar color="primary" size="32" class="mr-2">
                <v-icon size="18" color="white">mdi-robot</v-icon>
             </v-avatar>
             <div class="message-bubble bg-white text-grey-darken-3 elevation-1">
                Xin chào! Tôi là AI của thư viện Nexus. Tôi có thể giúp gì cho bạn?
             </div>
          </div>

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
                :class="msg.isUser ? 'bg-primary text-white rounded-br-0' : 'bg-grey-lighten-4 text-grey-darken-3 rounded-bl-0'"
             >
               <div v-if="!msg.isUser" v-html="parseMessage(msg.text)" class="ai-content" @click="handleLinkClick"></div>
               <div v-else>{{ msg.text }}</div>
            </div>
          </div>
          
          <div v-if="loading" class="message-wrapper ai">
             <v-avatar color="primary" size="32" class="mr-2 mt-1"><v-icon size="18" color="white">mdi-robot</v-icon></v-avatar>
             <div class="message-bubble bg-grey-lighten-4 rounded-bl-0 pa-2">
                <v-progress-circular indeterminate color="primary" size="20" width="2"></v-progress-circular>
             </div>
          </div>
        </div>

        <div class="chat-input-area pa-2 bg-white border-t">
          <v-text-field
            v-model="inputMessage"
            placeholder="Type your question..."
            variant="outlined" density="compact" hide-details rounded="pill" bg-color="grey-lighten-5"
            @keyup.enter="sendMessage"
            :disabled="loading"
          >
            <template v-slot:append-inner>
               <v-btn icon="mdi-send" size="small" variant="text" color="primary" @click="sendMessage" :loading="loading" :disabled="!inputMessage.trim()"></v-btn>
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
import { useRouter } from 'vue-router';

const router = useRouter(); 
const isOpen = ref(false);
const inputMessage = ref('');
const loading = ref(false);
const messages = ref([]);
const chatContainer = ref(null);

const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href').startsWith('/')) {
        event.preventDefault(); 
        router.push(link.getAttribute('href')); 
    }
};

const parseMessage = (text) => {
    if (!text) return '';
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(linkRegex, (match, title, url) => {
        return `<a href="${url}" class="chat-link" target="_self" data-internal>${title}</a>`;
    });
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return;
  const userText = inputMessage.value;
  
  messages.value.push({ role: 'user', text: userText, isUser: true });
  inputMessage.value = '';
  scrollToBottom();

  loading.value = true;
  try {
    const history = messages.value.filter(m => m.role).map(m => ({
        role: m.isUser ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    const response = await api.post('/ai/chat', { 
        message: userText,
        history: history.slice(-10)
    });

    messages.value.push({ role: 'ai', text: response.data.reply, isUser: false });
  } catch (error) {
    messages.value.push({ role: 'ai', text: 'Xin lỗi, tôi đang gặp sự cố kết nối.', isUser: false });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

watch(isOpen, (val) => { if (val) scrollToBottom(); });
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
  pointer-events: none; 
}

.fab-wrapper, .chat-window {
  pointer-events: auto;
}

.fab-wrapper { position: relative; display: inline-block; }

.chat-fab {
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  border: 2px solid white;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-fab:hover { transform: scale(1.1) translateY(-5px); }

.swing-icon { animation: swing 3s infinite ease-in-out; transform-origin: bottom center; }
@keyframes swing { 
    0%, 100% { transform: rotate(0deg); } 
    20% { transform: rotate(15deg); } 
    40% { transform: rotate(-10deg); } 
    60% { transform: rotate(5deg); } 
    80% { transform: rotate(-5deg); } 
}

.pulse-ring {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 100%; height: 100%; border-radius: 50%;
    border: 2px solid #42A5F5;
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
@keyframes pulse-ring {
    0% { width: 100%; height: 100%; opacity: 1; }
    100% { width: 200%; height: 200%; opacity: 0; }
}

.notification-badge { position: absolute; top: 0; right: 0; z-index: 10; animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% {transform: translateY(0);} 50% {transform: translateY(-6px);} }

.chat-window {
  width: 380px;
  height: 500px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.chat-messages {
  overflow-y: auto;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column; 
  gap: 12px; 
}

.message-wrapper {
  display: flex;
  align-items: flex-end; 
  width: 100%;
}

.message-wrapper.ai {
  justify-content: flex-start;
}

.message-wrapper.user {
  justify-content: flex-end; 
  flex-direction: row-reverse; 
}

.message-bubble {
  padding: 10px 14px;
  max-width: 80%;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  position: relative;
}

.message-wrapper.ai .message-bubble {
  background-color: #F5F5F5;
  color: #333;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 4px; 
}

.message-wrapper.user .message-bubble {
  background-color: #1976D2;
  color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px; 
}

.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 3px; }

:deep(.ai-content a) {
    color: #1565C0 !important;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
}
:deep(.ai-content a:hover) { color: #0D47A1; }
.message-wrapper {
  display: flex;
  width: 100%; 
  align-items: flex-end; 
}

.message-wrapper.user {
  justify-content: flex-end; 
}

.message-wrapper.user .message-bubble {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  color: white;
  border-radius: 16px 16px 4px 16px; 
  margin-left: auto; 
}

.message-wrapper.ai {
  justify-content: flex-start; 
}
</style>