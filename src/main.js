// src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Importa la instancia del router
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

// Esperamos a que Firebase Auth determine el estado inicial
onAuthStateChanged(auth, async (user) => { // Hacemos esta función async
  if (!app) { // Nos aseguramos de crear/montar la app una sola vez
    app = createApp(App);
    app.use(createPinia());
    app.use(router); // Instala el router
    app.use(Toast, toastOptions);

    // --- Navegación Inicial Explícita Basada en Autenticación ---

    // Obtenemos la ruta a la que el usuario intentó acceder (la URL actual)
    const initialPath = window.location.pathname;

    // Resolvemos la ruta para poder verificar sus metadatos
    // Usamos await router.isReady() para asegurar que el router está listo para resolver rutas
     await router.isReady(); // Esperar a que el router esté listo


    const targetRoute = router.resolve(initialPath);

    // Si la ruta inicial requiere autenticación Y el usuario NO está autenticado
    if (targetRoute.matched.some(record => record.meta.requiresAuth) && !user) {
        console.log('Main.js: Usuario no autenticado para ruta inicial protegida, redirigiendo a /login');
        // Redirigimos inmediatamente al login ANTES de que el router intente ir a la ruta protegida
        // Usamos replace para que el usuario no pueda volver atrás a la página protegida con el botón del navegador
        router.replace('/login');
    } else {
         // Si la ruta inicial es pública O si el usuario SÍ está autenticado:
         // Permitimos la navegación a la ruta solicitada por el usuario.
         // Usamos replace para que esta sea la primera entrada en el historial.
         console.log('Main.js: Navegación inicial permitida a', initialPath);
         router.replace(initialPath); // Navega a la ruta que el usuario pidió
    }

    // --- Fin Navegación Inicial Explícita ---


    app.mount('#app'); // Monta la aplicación en el DOM
  }
});

// El guardián en index.js sigue siendo necesario para manejar las navegaciones
// posteriores *después* de la carga inicial (ej: navegación entre páginas, clics en enlaces).
// El guardián ahora se ejecutará *después* de que onAuthStateChanged en main.js
// haya resuelto y potencialmente ya haya empujado una ruta inicial.