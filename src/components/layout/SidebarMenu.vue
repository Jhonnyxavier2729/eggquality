<template>
  <div>
    <!-- Botón hamburguesa -->
    <button class="hamburger" @click="$emit('toggle')">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar con clase condicional -->
    <aside :class="['sidebar', { open: props.isSidebarOpen }]">
      <div>
        <img src="@/assets/logo1.png" alt="EggQuality Logo" class="logo-img" />
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

    <!-- {/* === Añadir el componente ConfirmModal aquí === */} -->
    <!-- {/* Se mostrará cuando showLogoutConfirm sea true */} -->
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
    <div :class="['main-content', { 'shifted-left': !props.isSidebarOpen }]">
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

const emit = defineEmits(['toggle'])


const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore(); // <-- Usa tu store
// --- Estado para controlar la visibilidad del modal de Cerrar Sesión ---
const showLogoutConfirm = ref(false);
// --- Fin Estado Modal Cerrar Sesión ---

const menuItems = [
  { text: 'Dashboard', name: 'dashboard', route: { name: 'dashboard' }, icon: 'fa-chart-line', completed: false },
  { text: 'Análisis de Huevos', name: 'egg-analysis', route: { name: 'egg-analysis' }, icon: 'fa-egg', completed: false },
  { text: 'Panales', name: 'honeycomb', route: { name: 'honeycomb' }, icon: 'fa-cube', completed: true },
  { text: 'Lista de Panales', name: 'honeycomb-list', route: { name: 'honeycomb-list' }, icon: 'fa-list', completed: false },
  { text: 'Reportes', name: 'reports', route: { name: 'reports' }, icon: 'fa-file-alt', completed: false }, // O 'fa-chart-bar', 'fa-file-pdf', etc. (elige un ícono relevante)
  { text: 'Configuración', name: 'settings', route: { name: 'settings' }, icon: 'fa-cog', completed: true },
];

const isActive = (itemName) => route.name === itemName

const navigate = (itemRoute) => {
  router.push(itemRoute)
  if (window.innerWidth <= 1024) {
    emit('toggle') // Oculta el sidebar en móvil
  }
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
.logo-img {
  max-width: 100%; /* Asegura que la imagen no exceda el ancho del contenedor */
  height: auto; /* Mantiene la proporción de la imagen */
  display: block; /* Centra la imagen dentro del contenedor */
  margin: 0 auto; /* Centra horizontalmente */
}

.sidebar {
  width: 250px; /* Ancho base para pantallas grandes */
  background-color: #d1cfcf; /* Fondo principal (lila/rosa claro) */
  color: #000000; /* Color del texto por defecto (negro) */
  padding: 1.5rem;
  position: fixed; /* Fija la barra lateral */
  left: 0; /* Fija desde la izquierda */
  height: 100vh; /* <-- Ocupa el alto completo de la ventana */
  display: flex;
  flex-direction: column; /* Items en columna */
  z-index: 1000; /* Asegura que esté encima de otros elementos */
  box-shadow: 2px 0 5px rgba(139, 55, 55, 0.1); /* Sombra ligera a la derecha */
  transition: transform 0.3s ease-in-out;
  transform: translateX(-100%);
}

.sidebar.open {
  transform: translateX(0);
}

.menu {
  flex: 1; /* Permite que el menú crezca y ocupe el espacio disponible */
  margin-top: 1rem;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li,.logout-btn {
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  cursor: pointer; /* Indica que es clickeable */
  transition: all 0.3s ease; /* Animación suave al pasar el ratón/activar */
  display: flex;
  align-items: center;
  color: inherit; /* Hereda el color del texto del .sidebar */
  background: transparent; /* Fondo transparente por defecto */
  border: none;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* Línea divisoria entre los items */
}

.menu li:last-child {
  border-bottom: none;
}

/* Estilos para los íconos */
.icon {
  font-size: 1.2rem; /* Aumenta el tamaño del ícono */
  margin-right: 1rem; /* Espaciado entre el ícono y el texto */
  color: #ff753a; /* Color naranja para los íconos */
}
/* Estilos para el estado HOVER (pasar el ratón) */
.menu li:hover,
.logout-btn:hover {
  background-color: rgba(255, 209, 71, 0.3);
}

/* Estilos para el estado ACTIVO (la página actual) */
.menu li.active {
  background-color: rgba(255, 209, 71, 1);
  font-weight: bold; /* Texto en negrita */
}

.logout-btn .icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.text {
  flex: 1; /* Permite que el texto ocupe el espacio restante */
}

.logout-btn {
  margin-top: auto; /* Empuja el botón de logout hacia abajo */
  margin-bottom: 1rem;
}

/* Ocultar sidebar en pantallas grandes si no está abierto */
.sidebar.hide-on-large {
  transform: translateX(-100%);
  display: block; /* Asegúrate de que el sidebar esté presente para la transición */
}

.hamburger {
  display: block;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  font-size: 2rem;
  background: none;
  border: none;
  color: #ff753a;
  cursor: pointer;
}

/* Estilos responsivos */
@media (max-width: 767px) {
  .sidebar {
    width: 80%;
    max-width: 300px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #d1cfcf;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .hamburger {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1100;
    background: none;
    border: none;
    font-size: 2rem;
    color: #ff753a;
    cursor: pointer;
  }
}

/* Estilos responsivos */
@media (min-width: 1024px) {
  .hamburger {
    display: block;
  }
  .sidebar {
    display: block;
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0); /* Visible cuando está abierto */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 70%;
    max-width: 320px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #d1cfcf;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .hamburger {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1100;
    background: none;
    border: none;
    font-size: 2rem;
    color: #ff753a;
    cursor: pointer;
  }
}
</style>
