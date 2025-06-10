// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout.vue'

// Esta variable es para la pantalla de carga, su uso está bien.
const isInitialAppLoading = ref(true)

// Este onAuthStateChanged en el router se dispara después del de main.js
// y no debería ser usado para la lógica de redirección inicial compleja.
// Su propósito principal aquí es solo deshabilitar la pantalla de carga.
onAuthStateChanged(auth, () => {
    // Un pequeño setTimeout para asegurar que la UI se renderice antes de quitar la carga
    setTimeout(() => {
        isInitialAppLoading.value = false
    }, 50) // Puedes ajustar este tiempo
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
        path: '/', // La ruta base ahora será solo para el layout
        component: AuthenticatedLayout,
        children: [
            {
                path: 'inicio', // Ruta relativa a '/'
                name: 'inicio',
                component: () => import('@/views/InicioView.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'egg-analysis', // Considera renombrar esto a 'statistics' o 'data-analysis' según el SRS
                name: 'egg-analysis', // Considera renombrar esto a 'statistics' o 'data-analysis'
                component: () => import('@/views/EggAnalysisView.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'honeycomb/:id?',
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
            {
                path: 'reports',
                name: 'reports',
                component: () => import('@/views/ReportView.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('@/views/SettingsView.vue'),
                meta: { requiresAuth: true },
            },
        ],
    },

    // *** ELIMINAR ESTA REDIRECCIÓN ***
    // { path: '/', redirect:'/inicio' }, // Esta es la que causaba la redirección prematura

    // Catch-all: Asegura que cualquier ruta no definida vaya a not-found
    { path: '/:pathMatch(.*)*', redirect: '/not-found' },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// Guardián global
router.beforeEach(async (to, from, next) => {
    // Si la aplicación aún está cargando el estado inicial de autenticación
    if (isInitialAppLoading.value) {
        // Espera a que se complete la carga inicial (manejada por onAuthStateChanged en router.js)
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (!isInitialAppLoading.value) {
                    clearInterval(check)
                    resolve()
                }
            }, 50)

            // Timeout para evitar bloqueos infinitos
            setTimeout(() => {
                clearInterval(check)
                console.error('Timeout en carga inicial de autenticación en router.beforeEach.')
                resolve() // Permite avanzar de todas formas, el beforeEach hará su trabajo después.
            }, 5000) // Reducido el timeout a 5 segundos, 10 era mucho
        })
    }

    const authStore = useAuthStore()
    const user = authStore.user // Obtiene el usuario del store (ya debería estar actualizado por main.js)

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !user?.uid) {
        // Si la ruta requiere autenticación y el usuario no está logueado
        if (to.name !== 'login' && to.name !== 'register') { // Evita bucle de redirección si ya estamos en login/register
            console.log(`Router: Redirigiendo a /login desde ${to.path}. Requiere autenticación.`);
            next({ name: 'login' });
        } else {
            next(); // Ya estamos en login/register, permitir
        }
    } else if (!requiresAuth && user?.uid && (to.name === 'login' || to.name === 'register')) {
        // Si el usuario está logueado y trata de ir a login o register, redirigirlo a inicio
        console.log(`Router: Usuario logueado intentando acceder a ${to.path}, redirigiendo a /inicio.`);
        next({ name: 'inicio' });
    }
    else {
        // Ruta permitida
        next();
    }
})

export default router