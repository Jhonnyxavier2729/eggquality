// src/components/layout/SidebarMenu.vue
<template>
  <div>
    <!-- Botón hamburguesa -->
    <button class="hamburger" @click="toggleSidebar">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar con clase condicional -->
    <aside :class="['sidebar', { open: isSidebarOpen }]">
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

      <button class="logout-btn" @click="handleLogout">
        <span class="icon">
          <i class="fas fa-power-off"></i>
        </span>
        <span class="text">Cerrar Sesión</span>
      </button>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

// Sidebar visible u oculto
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const menuItems = ref([
  { text: 'Dashboard', name: 'dashboard', route: { name: 'dashboard' }, icon: 'fa-chart-line', completed: false },
  { text: 'Análisis de Huevos', name: 'egg-analysis', route: { name: 'egg-analysis' }, icon: 'fa-egg', completed: false },
  { text: 'Panales', name: 'honeycomb', route: { name: 'honeycomb' }, icon: 'fa-cube', completed: true },
  { text: 'Lista de Panales', name: 'honeycomb-list', route: { name: 'honeycomb-list' }, icon: 'fa-list', completed: false },
  { text: 'Configuración', name: 'settings', route: { name: 'settings' }, icon: 'fa-cog', completed: true }
]);

const isActive = (itemName) => {
  return route.name === itemName;
};

const navigate = (itemRoute) => {
  router.push(itemRoute);
  isSidebarOpen.value = false; // Oculta el sidebar al navegar en móvil
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    toast.error('Error al cerrar sesión');
  }
};
</script>


// src/components/layout/SidebarMenu.vue - Sección

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

.menu li, .logout-btn {
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
  font-size: 1.5rem; /* Aumenta el tamaño del ícono */
  margin-right: 1rem;
  color: #ff753a; /* Color naranja para los íconos */
}

/* Estilos para el estado HOVER (pasar el ratón) */
.menu li:hover, .logout-btn:hover {
  background-color: rgba(255, 209, 71, 0.3); /* Usar el amarillo (#ffd147) con transparencia para el fondo */
}

/* Estilos para el estado ACTIVO (la página actual) */
.menu li.active {
  background-color: rgba(255, 209, 71, 1);
  font-weight: bold; /* Texto en negrita */
  /* color: inherit; */ /* Mantener el color del texto */
  /* Opcional: usar otro color para el texto en el elemento activo */
  /* color: #000000; */
}

.icon {
  margin-right: 10px;
  font-size: 1.1rem;
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


/* --- Ajustes de Responsividad (con Media Queries) --- */
/* Estos estilos se aplicarán cuando el ancho de la pantalla sea 768px o menor */
/* BOTÓN HAMBURGUESA - solo se muestra en móviles */
.hamburger {
  display: none;
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

/* Oculta sidebar en móviles si isOpen es false */
.hide-on-mobile {
  display: none;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .sidebar {
    width: 65%;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #d1cfcf;
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
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

  .main-content {
    margin-left: 0;
  }

}

/* Opcional: Ajustes de Responsividad para pantallas AÚN más pequeñas (ej: móviles) */
/* @media (max-width: 480px) { */
   /* Puedes ajustar aún más la distribución si es necesario */
   /* .sidebar .menu ul { ... } */
   /* .menu li, .logout-btn { ... } */
   /* .sidebar .text { ... } */
/* } */

</style>
