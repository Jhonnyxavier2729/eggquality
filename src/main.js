// src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Importa el router
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '@/assets/main.css';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';

// Importa font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChartLine, faEgg, faCube, faList, faCog, faPowerOff, faQuestionCircle, faEye, faPen, faTrash, faFileAlt, faFilePdf, faSearch, faUserCircle, faHouse, faChartSimple} from '@fortawesome/free-solid-svg-icons';

library.add(faChartLine, faEgg, faCube, faList, faCog, faPowerOff, faQuestionCircle, faEye, faPen, faTrash, faFileAlt, faFilePdf, faSearch, faUserCircle, faHouse, faChartSimple);

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

// Crea la instancia de Pinia y la app
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Es importante obtener el store DESPUÉS de haber usado pinia en la app
const authStore = useAuthStore();

let isAppMounted = false;

// onAuthStateChanged se encarga de una sola cosa:
// actualizar el store de Pinia.
onAuthStateChanged(auth, (user) => {
    authStore.user = user;
    authStore.isLoading = false;

    console.log("main.js: Estado de autenticación actualizado en Pinia. UID:", user ? user.uid : 'ninguno');

    // La lógica de montaje se asegura de que la app no se monte
    // hasta que se conozca el estado de autenticación inicial.
    if (!isAppMounted) {
        // *** LÓGICA DE REDIRECCIÓN ELIMINADA DE AQUÍ ***
        // El archivo router/index.js se encargará de todas las redirecciones
        // a través de su guardián beforeEach.

        app.use(router); // Instala el router
        app.use(Toast, toastOptions);
        app.component('font-awesome-icon', FontAwesomeIcon);

        app.mount('#app'); // Monta la aplicación
        isAppMounted = true;
    }
});