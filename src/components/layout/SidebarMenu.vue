// src/components/layout/SidebarMenu.vue

<template>
  <aside class="sidebar">
    <div >
      <h1>EggQuality</h1>
    </div>

    <nav class="menu">
      <ul>
        <li
          v-for="item in menuItems"
          :key="item.name"
          :class="{ active: isActive(item.name) }" 
          @click="navigate(item.route)" 
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.text }}</span>
          <span v-if="item.completed" class="check">✓</span>
        </li>
      </ul>
    </nav>

    <button class="logout-btn" @click="handleLogout">
      <span class="icon">🔒</span>
      <span class="text">Cerrar Sesión</span>
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth'; // <-- Importa tu store

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore(); // <-- Usa tu store

const menuItems = ref([
  { text: 'Dashboard', name: 'dashboard', route: { name: 'dashboard' }, icon: '📊', completed: false },
  { text: 'Análisis de Huevos', name: 'egg-analysis', route: { name: 'egg-analysis' }, icon: '🥚', completed: false },
  { text: 'Panales', name: 'honeycomb', route: { name: 'honeycomb' }, icon: '🍯', completed: true },
  { text: 'Lista de Panales', name: 'honeycomb-list', route: { name: 'honeycomb-list' }, icon: '📋', completed: false },
  { text: 'Configuración', name: 'settings', route: { name: 'settings' }, icon: '⚙️', completed: true }
]);

const isActive = (itemName) => {
  return route.name === itemName;
};

const navigate = (itemRoute) => {
  router.push(itemRoute);
};

const handleLogout = async () => {
  try {
    await authStore.logout(); // <-- Usa la acción de logout de tu store
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
.sidebar {
  width: 250px; /* Ancho base para pantallas grandes */
  /* --- Aplicación de la Paleta de Colores --- */
  background-color: #efccff; /* Fondo principal (lila/rosa claro) */
  color: #000000; /* Color del texto por defecto (negro) */
  /* Puedes usar #fff (blanco) para el texto si prefieres un fondo más oscuro o contrastante */
  /* color: #fff; */

  padding: 1.5rem;
  position: fixed; /* Fija la barra lateral */
  top: 0; /* Fija desde arriba */
  left: 0; /* Fija desde la izquierda */
  height: 100vh; /* <-- Ocupa el alto completo de la ventana */
  display: flex;
  flex-direction: column; /* Items en columna */
  z-index: 1000; /* Asegura que esté encima de otros elementos */
  box-shadow: 2px 0 5px rgba(0,0,0,0.1); /* Sombra ligera a la derecha */
}

/* --- Estilos para el Título (Logo) --- */
.logo h1 {
  /* color: inherit; /* Heredaría el color del texto del .sidebar (#000000 o #fff) */
  color: #ff753a; /* Usar el color naranja para el título */
  margin: 0;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.1); /* Color del borde inferior (negro semi-transparente) */
  font-size: 1.8rem; /* Tamaño de fuente del título */
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
}

/* Estilos para el estado HOVER (pasar el ratón) */
.menu li:hover, .logout-btn:hover {
  background-color: rgba(255, 209, 71, 0.3); /* Usar el amarillo (#ffd147) con transparencia para el fondo */
  /* color: inherit; */ /* Mantener el color del texto */
}

/* Estilos para el estado ACTIVO (la página actual) */
.menu li.active {
  background-color: rgba(255, 209, 71, 0.5); /* Usar el amarillo (#ffd147) con más opacidad */
  font-weight: bold; /* Texto en negrita */
  /* color: inherit; */ /* Mantener el color del texto */
  /* Opcional: usar otro color para el texto en el elemento activo */
  /* color: #000000; */
}

.icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.text {
  flex: 1; /* Permite que el texto ocupe el espacio restante */
}

.check {
  color: #4CAF50; /* Mantendremos el color verde para el check de completado */
  margin-left: 5px;
}

.logout-btn {
  margin-top: auto; /* Empuja el botón de logout hacia abajo */
  margin-bottom: 1rem;
  /* Opcional: Estilizar el botón de logout de forma diferente, quizás con el color naranja */
  /* background-color: #ff753a; */
  /* color: white; */
  /* font-weight: bold; */
}


/* --- Ajustes de Responsividad (con Media Queries) --- */
/* Estos estilos se aplicarán cuando el ancho de la pantalla sea 768px o menor */
@media (max-width: 768px) {
  .sidebar {
    width: 100%; /* Ocupa todo el ancho */
    height: auto; /* La altura se ajusta al contenido */
    position: relative; /* Cambia de fijo a relativo (se mueve con el scroll) */
    padding: 1rem 0.5rem; /* Ajusta el espaciado interno */
    flex-direction: row; /* Coloca los elementos (logo, menú, logout) en fila */
    justify-content: space-between; /* Distribuye el espacio entre los elementos */
    align-items: center; /* Alinea verticalmente los elementos en la fila */
    box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Ajusta la sombra (abajo) */
    /* background-color: #efccff; */ /* Mantén el fondo o cámbialo si quieres */
  }

  .sidebar .logo h1 {
    padding-bottom: 0;
    border-bottom: none;
    margin-right: 1rem;
    font-size: 1.5rem; /* Ajusta el tamaño del título en pantallas pequeñas */
    /* color: #ff753a; */ /* Mantén el color naranja para el título */
  }

  .sidebar .menu {
    flex: none; /* Evita que el menú intente ocupar todo el espacio */
    margin-top: 0; /* Quita el margen superior */
  }

  .sidebar .menu ul {
      display: flex; /* Coloca los items del menú en fila */
      flex-direction: row;
      flex-wrap: wrap; /* Permite que los items salten de línea si no caben */
      justify-content: center; /* Centra los items en la fila */
  }

  /* Estilos para los elementos de la lista y el botón de logout en fila */
  .menu li, .logout-btn {
      padding: 0.5rem; /* Ajusta el espaciado de los items */
      margin: 0 0.25rem; /* Ajusta el margen horizontal entre items */
      width: auto; /* El ancho se ajusta al contenido */
      flex-direction: column; /* Coloca ícono arriba y texto abajo */
      text-align: center; /* Centra el texto */
  }

  .sidebar .icon {
      margin-right: 0; /* Quita el margen del ícono a la derecha */
      /* font-size: 1.2rem; */ /* Ajusta el tamaño del ícono si quieres */
  }

   /* Hace el texto visible en pantallas pequeñas */
  .sidebar .text {
      display: block; /* Muestra el texto */
      font-size: 0.8rem; /* Tamaño de fuente más pequeño para el texto */
      margin-top: 5px; /* Espacio entre el ícono y el texto */
      /* color: inherit; */ /* Hereda el color del texto del sidebar */
  }

  .sidebar .check {
       margin-left: 0; /* Ajusta margen */
  }

  /* Estilos para el botón de logout en pantallas pequeñas */
  .sidebar .logout-btn {
    margin-top: 0; /* Quita el margen superior */
    margin-left: 1rem; /* Añade margen a la izquierda para separarlo del menú */
    padding: 0.75rem; /* Mantén o ajusta el espaciado */
    /* background-color: #ff753a; */ /* Opcional: color naranja en móvil */
    /* color: white; */
  }

  /* IMPORTANTE: Necesitas ajustar el 'margin-left' del .main-content en tu AuthenticatedLayout.vue */
  /* para que sea 0px en pantallas pequeñas (<= 768px) donde la sidebar ya no es fija ni tiene 250px de ancho */
  /* @media (max-width: 768px) { .main-content { margin-left: 0; width: 100%; padding-top: ...; } } */
}

/* Opcional: Ajustes de Responsividad para pantallas AÚN más pequeñas (ej: móviles) */
/* @media (max-width: 480px) { */
   /* Puedes ajustar aún más la distribución si es necesario */
   /* .sidebar .menu ul { ... } */
   /* .menu li, .logout-btn { ... } */
   /* .sidebar .text { ... } */
/* } */

</style>