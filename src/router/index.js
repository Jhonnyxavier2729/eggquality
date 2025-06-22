// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue'

// Esta variable es para la pantalla de carga, su uso está bien.
const isInitialAppLoading = ref(true)

onAuthStateChanged(auth, () => {
    setTimeout(() => {
        // *** AQUÍ ESTABA EL ERROR DE TIPEO, YA CORREGIDO ***
        isInitialAppLoading.value = false
    }, 50)
})

export const useInitialAppLoading = () => isInitialAppLoading

const routes = [
    // --- Rutas Públicas ---
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/LandingView.vue'),
        meta: { requiresAuth: false },
    },
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
        meta: { requiresAuth: false },
    },

    // --- Rutas Protegidas ---
    {
        path: '/app',
        component: AuthenticatedLayout,
        meta: { requiresAuth: true }, // Protegemos todas las rutas hijas desde aquí
        children: [
            {
                // Esta ruta ahora será /app/inicio
                path: 'inicio',
                name: 'inicio',
                component: () => import('@/views/InicioView.vue'),
            },
            {
                path: 'egg-analysis',
                name: 'egg-analysis',
                component: () => import('@/views/EggAnalysisView.vue'),
            },
            {
                path: 'honeycomb/:id?',
                name: 'honeycomb',
                component: () => import('@/views/HoneycombView.vue'),
            },
            {
                path: 'honeycomb-list',
                name: 'honeycomb-list',
                component: () => import('@/views/HoneycombListView.vue'),
            },
            {
                path: 'reports',
                name: 'reports',
                component: () => import('@/views/ReportView.vue'),
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('@/views/SettingsView.vue'),
            },
        ],
    },

    // Catch-all: Redirige cualquier ruta no encontrada
    { path: '/:pathMatch(.*)*', redirect: '/not-found' },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// Guardián global
router.beforeEach(async (to, from, next) => {
    // La lógica de espera de carga está bien
    if (isInitialAppLoading.value) {
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (!isInitialAppLoading.value) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
            setTimeout(() => {
                clearInterval(check);
                resolve();
            }, 5000);
        })
    }

    const authStore = useAuthStore()
    const user = authStore.user
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !user?.uid) {
        // Si la ruta requiere autenticación y no hay usuario -> a login
        next({ name: 'login' });
    } else if (user?.uid && (to.name === 'login' || to.name === 'register' || to.name === 'landing')) {
        // Si el usuario SÍ está logueado y trata de ir a login, register o la landing...
        // ...lo redirigimos a la página principal de la app.
        next({ name: 'inicio' }); // Esto lo llevará a /app/inicio
    }
    else {
        // En todos los demás casos, permite la navegación
        next();
    }
})

export default router