import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue'

// Variable para mostrar pantalla de carga inicial
const isInitialAppLoading = ref(true)

onAuthStateChanged(auth, () => {
  setTimeout(() => {
    isInitialAppLoading.value = false
  }, 0)
})

export const useInitialAppLoading = () => isInitialAppLoading

const routes = [
  // Rutas públicas
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },

  // Rutas protegidas con layout autenticado
  {
    path: '/',
    component: AuthenticatedLayout,
    children: [
      {
        path: 'inicio',
        name: 'inicio',
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'egg-analysis',
        name: 'egg-analysis',
        component: () => import('@/views/EggAnalysisView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'honeycomb/:id?', // <-- Añadir :id? para parámetro opcional
        name: 'honeycomb',
        component: () => import('@/views/HoneycombView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'honeycomb-list',
        name: 'honeycomb-list',
        component: () => import('@/views/HoneycombListView.vue'),
        meta: { requiresAuth: true },
      },
      // router/index.js (ejemplo, añadirías esta ruta a tu array 'routes')
      {
        path: '/reports', // La URL para tus reportes
        name: 'reports', // Un nombre para la ruta
        component: () => import('@/views/ReportView.vue'), // Tu componente de vista de reportes
        meta: { requiresAuth: true }, // Requiere autenticación
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Redirección raíz
  { path: '/', redirect: '/dashboard' },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/not-found' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guardián global
router.beforeEach(async (to, from, next) => {
  if (isInitialAppLoading.value) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (!isInitialAppLoading.value) {
          clearInterval(check)
          resolve()
        }
      }, 50)

      setTimeout(() => {
        clearInterval(check)
        console.error('Timeout en carga inicial de auth')
        resolve() // Permitir avanzar de todas formas
      }, 10000)
    })
  }

  const authStore = useAuthStore()
  const user = authStore.user

  if (to.matched.some((record) => record.meta.requiresAuth) && !user?.uid) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
