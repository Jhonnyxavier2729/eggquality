<template>
  <div>
    <aside :class="['sidebar', { open: props.isSidebarOpen }]">
      <div class="header-sidebar">
        <button class="hamburger" @click="$emit('toggle')">
          <i class="fas fa-bars"></i>
        </button>
        <img v-show="props.isSidebarOpen" src="@/assets/logo1.png" alt="EggQuality Logo" class="logo-img" /></div>
      <div class="user-info" v-show="props.isSidebarOpen && authStore.isAuthenticated">
        <div class="user-avatar">
          <font-awesome-icon :icon="['fas', 'user-circle']" class="user-icon" />
        </div>

        <div class="user-details">
          <span class="welcome-text">Bienvenido</span>
          <span class="username-display">
            {{ authStore.user?.displayName || authStore.user?.email || 'Usuario' }}
          </span>
        </div>
      </div>

        <nav class="menu">
          <ul>
            <li
              v-for="item in menuItems"
              :key="item.name"
              :class="{ active: isActive(item.name) }"
              @click="navigate(item.route)"
            >
              <span class="icon">
                <font-awesome-icon :icon="item.icon" />
              </span>
              <span class="text">{{ item.text }}</span>
            </li>
          </ul>
        </nav>

        <button class="logout-btn" @click="confirmLogout">
          <span class="icon">
            <font-awesome-icon :icon="['fas', 'power-off']" />
          </span>
          <span class="text">Cerrar Sesión</span>
        </button>
    </aside>

      <ConfirmModal
        v-if="showLogoutConfirm"
        title="Confirmar Cierre de Sesión"
        message="¿Estás seguro de que quieres cerrar tu sesión actual? "
        confirmButtonText="Sí, cerrar sesión"
        cancelButtonText="Cancelar"
        @confirm="executeLogout"
        @cancel="cancelLogout"
      />

      <!-- Contenido principal con desplazamiento condicional -->
      <div :class="['main-content', { 'content-shifted': props.isSidebarOpen }]">

        <slot />
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/auth/ConfirmModal.vue';


// Props y eventos
const props = defineProps({
  isSidebarOpen: Boolean,
})

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore(); // <-- Usa tu store
// --- Estado para controlar la visibilidad del modal de Cerrar Sesión ---
const showLogoutConfirm = ref(false);
/// --- Fin Estado Modal Cerrar Sesión ---

const menuItems = [
  { text: 'Inicio', name: 'inicio', route: { name: 'inicio' }, icon: 'fa-house', completed: false },
  { text: 'Estadisticas', name: 'egg-analysis', route: { name: 'egg-analysis' }, icon: 'fa-chart-simple', completed: false },
  { text: 'Panales', name: 'honeycomb', route: { name: 'honeycomb' }, icon: 'fa-cube', completed: true },
  { text: 'Lista de Panales', name: 'honeycomb-list', route: { name: 'honeycomb-list' }, icon: 'fa-list', completed: false },
  { text: 'Reportes', name: 'reports', route: { name: 'reports' }, icon: 'fa-file-alt', completed: false }, // O 'fa-chart-bar', 'fa-file-pdf', etc. (elige un ícono relevante)
  { text: 'Configuración', name: 'settings', route: { name: 'settings' }, icon: 'fa-cog', completed: true },
];

const isActive = (itemName) => route.name === itemName

// CÓDIGO CORREGIDO ✅
const navigate = (itemRoute) => {
  router.push(itemRoute)
}

// --- Lógica para el modal de Cerrar Sesión ---

// Función que se llama al hacer clic en el botón "Cerrar Sesión" en el template
const confirmLogout = () => {
  console.log('Clic en Cerrar Sesión, mostrando modal de confirmación.');
  showLogoutConfirm.value = true; // Muestra el modal
};

// Función que se llama cuando el usuario cancela en el modal
const cancelLogout = () => {
  console.log('Cierre de sesión cancelado.');
  showLogoutConfirm.value = false; // Oculta el modal
};

// Función que se llama cuando el usuario confirma en el modal
// Renombramos la anterior handleLogout a executeLogout
const executeLogout = async () => {
  console.log('Confirmada cierre de sesión, ejecutando logout.');
  try {
    // Llama a la acción de cerrar sesión de tu store de autenticación
    await authStore.logout();
    console.log('Sesión cerrada con éxito.');
    toast.success('Sesión cerrada correctamente');
    showLogoutConfirm.value = false; // Oculta el modal después de cerrar sesión

    // Redirigir a la página de login o a una página pública
    router.push({ name: 'login' }); // Asegúrate de que 'login' sea el nombre correcto de tu ruta de login

  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    toast.error('Error al cerrar sesión'); // Usa el toast si está disponible aquí
    showLogoutConfirm.value = false; // Ocultar el modal incluso si hay error
  }
};
// --- Fin Lógica Modal Cerrar Sesión ---
</script>
<style scoped>
/* --- Contenedor del Logo y Hamburguesa --- */
.header-sidebar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: -3rem;
  padding: 0.5rem 1rem 1rem 1rem;
  position: relative;
  top: -40px;
}

.sidebar:not(.open) .header-sidebar {
  top: 20px;
}

/* --- Logo --- */
.logo-img {
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0;
  transition: opacity 0.3s ease-out, max-width 0.3s ease-out;
}
/* --- Sidebar Principal --- */
.sidebar {
  width: 80px;
  background-color: #d1cfcf;
  color: #000000;
  padding: 1rem;
  position: fixed;
  left: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(139, 55, 55, 0.1);
  transition: width 0.5s cubic-bezier(0,0,0,1);
  box-sizing: border-box;
  overflow: hidden;
}

.sidebar.open {
  width: 250px;
}

.sidebar:not(.open) .text {
  display: none;
}
/* APLICAMOS EL CAMBIO AQUÍ: Bajamos el menú cuando el sidebar NO está abierto */
.sidebar:not(.open) .menu {
  margin-top: 13rem; /* Aumenta este valor para bajar más los íconos */
}

.sidebar:not(.open) .menu li,
.sidebar:not(.open) .logout-btn {
  justify-content: center;
}

.sidebar:not(.open) .icon {
  margin-right: 0;
}

/* --- Botón Hamburguesa --- */
.hamburger {
  background: none;
  border: none;
  color: #ff753a;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
}

/* --- Menú de Navegación --- */
.menu {
  flex-grow: 1;
  margin-top: 0rem;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li, .logout-btn {
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: transparent;
  border-top: none; border-left: none; border-right: none;
}

.menu li:last-child {
  border-bottom: none;
}

.icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  color: #ff753a;
  transition: margin 0.3s ease;
  min-width: 30px;
  text-align: center;
}

.menu li:hover,
.logout-btn:hover {
  background-color: rgba(255, 209, 71, 0.3);
}

.menu li.active {
  background-color: rgba(255, 209, 71, 1);
  font-weight: bold;
}

.text {
  flex: 1;
  white-space: nowrap;
  font-size: 1rem;
}

.logout-btn {
  margin-bottom: 1rem;
}

/* --- Contenido Principal --- */
.main-content {
  margin-left: 8px; /* Espacio para el sidebar */
  padding: 1.5rem;
  transition: margin-left 0.3s ease-in-out;
}

.main-content.content-shifted {
  margin-left: -35px;
}

/* --- Nuevo Estilo para la Información del Usuario --- */
.user-info {
  display: flex; /* Para alinear el ícono y el texto en una fila */
  align-items: center; /* Centrar verticalmente */
  gap: 0.8rem; /* Espacio entre el ícono y el texto */
  padding: 1rem 0; /* Padding superior e inferior, 0 a los lados */
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* Separador sutil */
  margin-bottom: 1rem; /* Espacio debajo del bloque de usuario */
  color: #333; /* Color de texto general */
  max-height: 100px; /* Un valor lo suficientemente grande para cuando está visible */
  opacity: 1; /* Completamente visible */
  pointer-events: auto; /* Permite interacciones */
  transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out, padding 0.4s ease-in-out, margin-bottom 0.4s ease-in-out;
}

/* Estilos para el contenedor del ícono */
.user-avatar {
  min-width: 40px; /* Asegura un tamaño mínimo para el ícono */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estilos para el ícono de usuario */
.user-icon {
  font-size: 2.2rem; /* Tamaño más grande para el ícono */
  color: #ff753a; /* Color naranja de tu tema */
}

/* Estilos para los detalles del usuario (texto) */
.user-details {
  display: flex;
  flex-direction: column; /* Texto de bienvenida y nombre uno debajo del otro */
  flex-grow: 1; /* Para que ocupe el espacio restante */
  overflow: hidden; /* Asegura que el texto largo no desborde */
}

.welcome-text {
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap; /* Evita que el texto se rompa en varias líneas */
}

.username-display {
  font-size: 1.1rem;
  font-weight: bold;
  color: #000; /* Color más oscuro para resaltar el nombre */
  white-space: nowrap; /* Evita que el texto se rompa en varias líneas */
  text-overflow: ellipsis; /* Añade puntos suspensivos si el texto es demasiado largo */
  overflow: hidden; /* Oculta el texto que excede el contenedor */
}

/* --- Ajuste para el sidebar contraído (solo íconos) --- */
/* Cuando el sidebar está contraído, el user-info debería desaparecer o solo mostrar el avatar */
.sidebar:not(.open) .user-info {
  display: none; /* Oculta completamente el user-info cuando el sidebar está cerrado */
}

/* ========== MEDIA QUERIES RESPONSIVE ========== */

/* Tablets (pantallas medianas) */
@media (max-width: 1024px) {
  .sidebar {
    width: 70px;
    padding: 0.5rem;
  }

  .sidebar.open {
    width: 220px;
  }

  .logo-img {
    max-width: 120px;
  }

  .hamburger {
    font-size: 1.4rem;
  }

  .main-content {
    padding: 1rem;
  }

  .main-content.content-shifted {
    margin-left: 200px;
  }
}

/* Teléfonos (pantallas pequeñas) */
@media (max-width: 767px) {
  .sidebar {
    width: 60px;
    padding: 0.5rem;
  }

  .sidebar.open {
    width: 200px;
  }

  .logo-img {
    max-width: 100px;
  }

  .hamburger {
    font-size: 1.3rem;
  }

  .header-sidebar {
    top: -20px;
    padding: 0.5rem;
  }

  .sidebar:not(.open) .header-sidebar {
    top: 15px;
  }

  .main-content {
    padding: 0.75rem;
  }

  .main-content.content-shifted {
    margin-left: 200px;
  }
}


</style>