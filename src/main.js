import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '@/assets/main.css';
import { auth } from '@/firebase/config'; // Importa la configuración de Firebase
import { onAuthStateChanged } from 'firebase/auth';

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
};

let app;

// Verifica el estado de autenticación antes de montar la aplicación
onAuthStateChanged(auth, () => {
  if (!app) {
    app = createApp(App);
    app.use(createPinia());
    app.use(router);
    app.use(Toast, toastOptions);
    app.mount('#app');
  }
});