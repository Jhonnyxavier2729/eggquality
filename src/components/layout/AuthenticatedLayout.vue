// src/layouts/AuthenticatedLayout.vue

<template>
  <div class="authenticated-layout">
    <SidebarMenu />

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Importa tu componente de barra lateral
import SidebarMenu from '@/components/layout/SidebarMenu.vue'; // <-- Ajusta la ruta si es necesario

// No se necesita más lógica aquí a menos que el layout en sí la requiera
</script>

// src/layouts/AuthenticatedLayout.vue - Sección

// src/layouts/AuthenticatedLayout.vue - Sección 

<style scoped>
.authenticated-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f7f6; /* O el color que prefieras para el fondo del contenido */
}

.main-content {
  flex-grow: 1;
  padding: 1.5rem;
  /* Margen izquierdo base para pantallas grandes (coincide con ancho de sidebar fijo) */
  margin-left: 250px;
  width: calc(100% - 250px); /* Ocupa el resto del ancho */
  overflow-y: auto;
  /* overflow-x: hidden; */
}

/* === Media Query para Responsividad === */
/* Aplica cuando la pantalla es 768px o menor (debe coincidir con la de SidebarMenu.vue) */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0; /* ¡Quita el margen izquierdo en pantallas pequeñas! */
    width: 100%; /* Ocupa todo el ancho */
    /* Añade padding arriba para que el contenido no quede detrás de la sidebar horizontal superior */
    /* Ajusta el valor (50px) según la altura real de tu sidebar en móvil + padding */
    padding-top: calc(1.5rem + 60px); /* Ejemplo: 1.5rem de padding + ~60px de altura de sidebar */
  }
}

/* Otros estilos de layout si los tienes... */
</style>