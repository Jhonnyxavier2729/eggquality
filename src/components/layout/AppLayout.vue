<template>
  <div class="app-container">
    <SidebarMenu ref="sidebarRef" />
    <main :class="['main-content', { 'sidebar-open': isSidebarOpen }]">

      <router-view /> 
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from './SidebarMenu.vue' // Asegúrate de que la ruta sea correcta
import { ref, computed } from 'vue'




const sidebarRef = ref(null)

// Computa el estado del sidebar desde SidebarMenu
const isSidebarOpen = computed(() => sidebarRef.value?.isSidebarOpen)
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  transition: margin-left 0.3s ease-in-out;
}


.main-content.collapsed {
  margin-left: 0;}
</style>
