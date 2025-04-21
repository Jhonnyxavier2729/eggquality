<template>
    <div class="app-container">
      <NavSidebar @navigate="handleNavigation" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </template>
  
  <script setup>
  import NavSidebar from './NavSidebar.vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const handleNavigation = (routeName) => {
    router.push({ name: routeName })
  }
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
    margin-left: 250px; /* Ancho del sidebar */
  }
  </style>