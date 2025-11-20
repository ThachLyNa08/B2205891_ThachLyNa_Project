<template>
  <div class="chat-widget-wrapper">
    <v-btn
      v-if="!isOpen"
      icon
      size="x-large"
      class="ai-chat-btn elevation-10"
      @click="isOpen = true"
    >
      <v-icon color="white" size="32">mdi-robot-excited-outline</v-icon>
    </v-btn>

    <v-scale-transition origin="bottom right">
      <v-card
        v-if="isOpen"
        class="chat-window elevation-12 rounded-xl d-flex flex-column"
        width="350"
        height="500"
      >
        <v-card-item class="bg-primary py-3 px-4">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center text-white">
              <v-icon class="mr-2">mdi-robot</v-icon>
              <span class="font-weight-bold">Nexus AI Assistant</span>
            </div>
            <v-btn icon variant="text" density="compact" color="white" @click="isOpen = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-item>

        <v-card-text class="chat-body flex-grow-1 pa-3 overflow-y-auto" ref="chatBody">
          
          <div class="d-flex mb-4 justify-start">
            <v-avatar color="primary" size="32" class="mr-2 mt-1">
                <v-icon size="20" color="white">mdi-robot</v-icon>
            </v-avatar>
            <div class="msg-content bot bg-grey-lighten-4 pa-3 rounded-lg">
              Xin chào! Tôi có thể giúp bạn tìm sách gì hôm nay?
            </div>
          </div>

          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="d-flex mb-4" 
            :class="msg.isUser ? 'justify-end' : 'justify-start'"
          >
            <v-avatar v-if="!msg.isUser" color="primary" size="32" class="mr-2 mt-1">
                <v-icon size="20" color="white">mdi-robot</v-icon>
            </v-avatar>

            <div 
              class="msg-content pa-3 rounded-lg text-body-2"
              :class="msg.isUser ? 'user bg-primary text-white' : 'bot bg-grey-lighten-4 text-black'"
            >
              <span style="white-space: pre-wrap;">{{ msg.text }}</span>
            </div>
          </div>

          <div v-if="isLoading" class="d-flex justify-start mb-2">
             <v-avatar color="primary" size="32" class="mr-2">
                <v-icon size="20" color="white">mdi-robot</v-icon>
            </v-avatar>
            <div class="bg-grey-lighten-4 pa-3 rounded-lg">
               <v-progress-circular indeterminate color="primary" size="20" width="2"></v-progress-circular>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>
        <div class="pa-3 d-flex align-center bg-white">
          <v-text-field
            v-model="userInput"
            placeholder="Ask me anything..."
            variant="outlined"
            density="compact"
            hide-details
            class="rounded-pill"
            @keyup.enter="sendMessage"
            :disabled="isLoading"
          ></v-text-field>
          <v-btn 
            icon="mdi-send" 
            color="primary" 
            variant="text" 
            class="ml-2" 
            @click="sendMessage"
            :disabled="!userInput.trim() || isLoading"
          ></v-btn>
        </div>
      </v-card>
    </v-scale-transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import api from '../services/api.service';

const isOpen = ref(false);
const userInput = ref('');
const isLoading = ref(false);
const messages = ref([]);
const chatBody = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
        // Access the DOM element from the VCardText component
        chatBody.value.$el.scrollTop = chatBody.value.$el.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  // 1. Add User Message
  const text = userInput.value;
  messages.value.push({ text, isUser: true });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    // 2. Call API
    const res = await api.post('/ai/chat', { message: text });
    
    // 3. Add Bot Response
    messages.value.push({ text: res.data.reply, isUser: false });
  } catch (error) {
    console.error(error);
    messages.value.push({ text: "Xin lỗi, tôi đang gặp sự cố kết nối.", isUser: false });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.chat-widget-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

.ai-chat-btn {
  background: linear-gradient(135deg, #00C6FF, #0072FF) !important;
  width: 60px !important;
  height: 60px !important;
  border: 2px solid white;
}

.chat-window {
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.msg-content {
  max-width: 80%;
  word-break: break-word;
}

.msg-content.user {
  border-bottom-right-radius: 2px !important;
}

.msg-content.bot {
  border-top-left-radius: 2px !important;
}
</style>