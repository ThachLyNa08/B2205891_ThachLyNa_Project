import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 1. Import Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' 

// 2. Tạo instance Vuetify với Theme tùy chỉnh
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',   // Xanh dương chủ đạo
          secondary: '#424242', // Xám đậm
          background: '#FFFFFF',
          surface: '#FFFFFF',
          
          // Các màu tùy chỉnh theo hình ảnh bạn gửi:
          fantasy: '#7E57C2',   // Tím (Fantasy)
          mystery: '#00897B',   // Xanh Teal (Mystery)
          history: '#FB8C00',   // Cam (History)
          scifi: '#1E88E5',     // Xanh dương sáng (Sci-Fi)
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify) 

app.mount('#app')