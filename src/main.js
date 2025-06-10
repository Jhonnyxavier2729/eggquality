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

// Crea la instancia de Pinia y la app ANTES de onAuthStateChanged
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Obtén el store de autenticación
const authStore = useAuthStore();

// Usa una bandera para controlar el montaje de la aplicación/router
let isAppMounted = false;

// onAuthStateChanged se disparará cuando el estado de autenticación inicial sea conocido
onAuthStateChanged(auth, async (user) => {
    // Actualiza el estado de autenticación en tu store
    authStore.user = user;
    authStore.isLoading = false; // Asume que tienes un isLoading en tu store para indicar que la auth está cargada

    console.log("Estado de autenticación actualizado en store:", user ? user.uid : null);

    if (!isAppMounted) { // Asegura que solo se monta una vez
        app.use(router); // Instala el router

        // Esperar a que el router esté listo antes de proceder con la navegación
        await router.isReady();

        // --- Lógica de redirección inicial más robusta ---
        const initialPath = window.location.pathname; // Ruta a la que intentó acceder el usuario
        const targetRoute = router.resolve(initialPath); // Resuelve la ruta para ver sus propiedades

        // Si la ruta inicial es protegida Y el usuario NO está logueado
        if (targetRoute.matched.some(record => record.meta.requiresAuth) && !user) {
            console.log('Main.js: Usuario no autenticado para ruta inicial protegida, redirigiendo a /login');
            router.replace('/login');
        }
        // Si la ruta inicial es '/' (root) Y el usuario SÍ está logueado, redirige a /inicio
        else if (initialPath === '/' && user) {
            console.log('Main.js: Usuario autenticado en /, redirigiendo a /inicio');
            router.replace('/inicio');
        }
        // Si la ruta inicial es '/' (root) Y el usuario NO está logueado, redirige a /login
        else if (initialPath === '/' && !user) {
            console.log('Main.js: Usuario no autenticado en /, redirigiendo a /login');
            router.replace('/login');
        }
        // Si el usuario está logueado y ya está en una ruta válida protegida, o en una pública válida, no hace nada
        else {
            console.log('Main.js: Navegación inicial permitida a', initialPath);
            // No se necesita router.replace aquí, el router ya está en la ruta correcta.
        }
        // --- Fin Lógica de redirección inicial ---

        app.use(Toast, toastOptions);
        app.component('font-awesome-icon', FontAwesomeIcon);

        app.mount('#app'); // Monta la aplicación
        isAppMounted = true;
    }
});

// Nota: Elimina cualquier lógica de 'index.js' que haga un setTimeout
// para "carga inicial de auth", ya que onAuthStateChanged en main.js
// es el lugar correcto para manejar esto.