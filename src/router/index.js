// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/firebase/config'; // Asegúrate de la ruta correcta
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue'; // <-- Asegúrate de la ruta correcta

// --- Definición de Rutas ---
const routes = [
  // Rutas públicas (no requieren autenticación)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/not-found', // Página 404
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue') // Asegúrate de crear esta vista
  },

  // --- Ruta padre para el Layout Autenticado ---
  // Este es UN ÚNICO objeto dentro del array 'routes'.
  {
    // Esta ruta padre usará el AuthenticatedLayout.
    // Las rutas hijas se renderizarán DENTRO de su <router-view>.
    path: '/', // Usando '/' como base para que las rutas hijas sean /dashboard, /settings, etc.
               // Si prefieres que sean /app/dashboard, usa path: '/app' aquí.
    component: AuthenticatedLayout, // <-- ¡Usa tu componente de layout aquí!

    children: [
      // --- Tus Rutas Protegidas (definidas como hijas de este layout) ---
      // Estas rutas deben tener `meta: { requiresAuth: true }` para tu guardián.
      {
        path: 'dashboard', // El path efectivo será /dashboard
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'), // <-- La vista del dashboard
        meta: { requiresAuth: true }, // <-- Mantén esto
      },
      // ===> AÑADE TUS OTRAS RUTAS PROTEGIDAS AQUÍ COMO HIJAS <===
      // Asegúrate de que sus 'name' coincidan con los 'name' en tu SidebarMenu.vue
      {
        path: 'egg-analysis', // El path efectivo será /egg-analysis
        name: 'egg-analysis',
        component: () => import('@/views/EggAnalysisView.vue'), // <-- Tu vista de análisis
        meta: { requiresAuth: true },
      },
       {
          path: 'honeycomb', // El path efectivo será /honeycomb
          name: 'honeycomb',
          component: () => import('@/views/HoneycombView.vue'), // <-- Tu vista de panales
          meta: { requiresAuth: true },
       },
       {
          path: 'honeycomb-list', // El path efectivo será /honeycomb-list
          name: 'honeycomb-list',
          component: () => import('@/views/HoneycombListView.vue'), // <-- Tu vista de lista de panales
          meta: { requiresAuth: true },
       },
       {
          path: 'settings', // El path efectivo será /settings
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'), // <-- Tu vista de configuración
          meta: { requiresAuth: true },
       },
      // ... agrega todas tus otras rutas protegidas aquí como objetos dentro de este array children ...
    ],
  },

  // --- Redirección para la ruta raíz '/' ---
  // Si la ruta padre del layout es '/', esta redirección es útil si alguien va solo a '/'.
  // Lo enviamos al dashboard por defecto (el guardián protegerá si no está autenticado).
  { path: '/', redirect: '/dashboard' },


  // --- Redirección catch-all al final ---
  // Esta debe ser la ÚLTIMA ruta en el array principal 'routes'.
  { path: '/:pathMatch(.*)*', redirect: '/not-found' },
];

// --- Crear Instancia del Router ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // O process.env.BASE_URL
  routes // <-- Usa el array de rutas definido arriba
});


// --- Estado de Carga Inicial de la Aplicación (para evitar parpadeo) ---
// Variable reactiva para controlar la visualización de la pantalla de carga inicial en App.vue
const isInitialAppLoading = ref(true); // <-- Empieza como verdadero (cargando)

// Listener que se dispara la primera vez que Firebase resuelve el estado inicial
onAuthStateChanged(auth, () => {
  // Una vez que Firebase Auth ha determinado el estado inicial,
  // establecemos la variable de carga inicial a falso después de un micro-tick.
   setTimeout(() => {
      isInitialAppLoading.value = false; // <-- ¡Esto pone la variable a falso!
   }, 0);

   // Desuscribir este listener después de la primera ejecución
   // Esto lo haremos en main.js, ya que main.js espera por esto.
   // Aquí solo definimos la lógica y la variable.

});

// Exporta esta variable reactiva para que App.vue pueda usarla
export const useInitialAppLoading = () => isInitialAppLoading;


// --- Guardián Global de Navegación ---
// Este guardián se ejecuta ANTES de cada navegación.
router.beforeEach(async (to, from, next) => {
  // Si el estado inicial de Firebase aún no se ha resuelto (usando la bandera de carga de App), esperar.
   if (isInitialAppLoading.value) {
     // Esperamos hasta que la bandera indique que la carga inicial terminó
      await new Promise(resolve => {
          const checkLoading = setInterval(() => {
              if (!isInitialAppLoading.value) {
                  clearInterval(checkLoading);
                  resolve();
              }
          }, 50); // Chequea cada 50ms

          // Timeout de seguridad para evitar bucles infinitos (opcional, pero recomendado)
          const timeout = setTimeout(() => {
              clearInterval(checkLoading);
              console.error('Error: La carga de autenticación inicial superó el tiempo límite.');
              // Opcional: redirigir a una página de error o al login si falla la carga inicial
              // next({ name: 'login' });
          }, 10000); // Ejemplo: esperar máximo 10 segundos para la carga inicial
      });
   }

  // Ahora, Firebase ya debería haber determinado si hay un usuario o no,
  // y el estado en el store DEBERÍA estar correcto.
  const authStore = useAuthStore();
  const user = authStore.user;

  // Logs para depuración
  console.log('🚦 Guardia de Ruta:');
  console.log('  Ruta destino:', to.path);
  console.log('  Usuario autenticado en Store:', user && user.uid ? 'Sí' : 'No');
  console.log('  Ruta requiere autenticación:', to.matched.some((record) => record.meta.requiresAuth));


  // *** REGLAS DE NAVEGACIÓN ***

  // 1. Si la ruta destino requiere autenticación Y NO hay usuario (después de esperar la carga inicial): redirigir al login
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !(user && user.uid)
  ) {
    console.log('  ➡️ Guardia: Ruta protegida sin autenticar, redirigiendo a /login');
    next({ name: 'login' });
  }
  // 2. Si la ruta destino es /login O /register Y SÍ hay usuario (después de esperar la carga inicial):
  //    Permitimos el acceso a /login y /register para usuarios autenticados.
   else if (
       (to.path === "/login" || to.path === "/register") &&
       (user && user.uid)
   ) {
       console.log('  ➡️ Guardia: Autenticado en /login o /register, permitiendo navegación');
       next();
   }
  // 3. En cualquier otro caso (ruta pública que no es login/register O ruta protegida Y hay usuario): permitir navegación
  else {
    console.log('  ➡️ Guardia: Permitiendo navegación');
    next();
  }

});

// --- FIN GUARDÍAN Y ESTADO DE CARGA INICIAL ---


export default router;