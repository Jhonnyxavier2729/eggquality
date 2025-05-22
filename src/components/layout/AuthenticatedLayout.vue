<template>
  <div class="authenticated-layout">
    <SidebarMenu :isSidebarOpen="isSidebarOpen" @toggle="toggleSidebar" />


    <main :class="['main-content', { 'shifted-left': !isSidebarOpen }]">
      <router-view />
    </main>
  </div>
</template>


<script setup>
import SidebarMenu from '@/components/layout/SidebarMenu.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const isSidebarOpen = ref(window.innerWidth > 1024)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Manejo de redimensionamiento
const handleResize = () => {
  isSidebarOpen.value = window.innerWidth > 1024
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>

.authenticated-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f7f6;
}

.main-content {
  flex-grow: 1;
  padding:0rem; /* Padding base */
  margin-left: 250px; /* Margen cuando sidebar está ABIERTO */
  overflow-y: auto; /* Permite scroll vertical si el contenido es largo */
  transition: margin-left 0.3s ease-in-out /* Añade padding a la transición */
}

/* --- ESTILOS CUANDO SIDEBAR ESTÁ CERRADO --- */
.main-content.shifted-left {
  margin-left: 0;
  /* --- >>> ¡LA CLAVE ESTÁ AQUÍ! <<< --- */
  /* Añade padding para el botón hamburguesa fijo */
  padding-left: 3rem;
  padding-top: 0rem;
  padding-right: 1.5rem;
  padding-bottom: 1.5rem;
}

@media (max-width: 1024px) {
  .main-content {
    /* En pantallas < 1024px, el sidebar estará cerrado por defecto (según tu JS) */
    /* Por lo tanto, aplicamos los estilos de 'shifted-left' directamente */
    margin-left: 0;
    padding-left: 1.5rem;  /* Mismo padding para el botón */
    padding-top: 0rem;   /* Mismo padding para el botón */
    padding-right: 1.5rem;
    padding-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .main-content {
        padding-left: 1rem; /* Incluso menos padding en pantallas muy pequeñas */
        padding-top: 0rem; /* O ajusta según tu diseño */
        padding-right: 1rem;
        padding-bottom: 1rem;
    }
}


}

</style>
