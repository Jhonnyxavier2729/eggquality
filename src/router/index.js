import { createRouter, createWebHistory } from 'vue-router';  
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';

const routes = [
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
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }, // Indica que esta ruta requiere autenticación
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found' // Redirige a la página 404 para rutas no encontradas
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia global para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const user = authStore.user?.value; // Verifica si user está definido antes de acceder a .value

  if (to.path === "/login" && user) {
    next("/dashboard"); // Redirige al dashboard si el usuario ya está autenticado
  } else if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !user
  ) {
    next("/login"); // Redirige al login si la ruta requiere autenticación y no hay usuario
  } else {
    next(); // Permite la navegación a rutas públicas como /register y /login
  }
});

export default router;