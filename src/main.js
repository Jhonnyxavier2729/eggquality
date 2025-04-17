import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@/assets/main.css';

const app = createApp(App);

const toastOptions = {
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    icon: true,
  }

app.use(createPinia());
app.use(router);
app.use(Toast, toastOptions)

app.mount('#app');