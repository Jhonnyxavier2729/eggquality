// src/App.vue

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// En un App.vue básico, el script setup a menudo no necesita mucha lógica.
// Las importaciones y el uso de stores o router suelen hacerse en las vistas/páginas específicas.
</script>

<style>
/* Aquí van tus estilos globales para toda la aplicación */
/* Por ejemplo, estilos para body, html, o fuentes */

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* Evita scroll horizontal si no lo necesitas */
}

#app {
  /* Estilos para el contenedor principal de tu app */
  /* Puedes añadir padding, fuentes, colores base, etc. */
  font-family: sans-serif; /* Ejemplo de fuente */
  /* Elimina text-align y color si tus vistas los manejan individualmente */
  /* text-align: center; */
  /* color: #2c3e50; */
}

/* Otros estilos globales si los tienes... */
</style>