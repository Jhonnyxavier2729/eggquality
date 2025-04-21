<!-- filepath: c:\Users\jhonn\OneDrive\Documents\SENA 2025\eggquality-main\src\views\NotFoundView.vue -->
<template>
    <div class="not-found">
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <router-link to="/">Volver al inicio</router-link>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    text-align: center;
    margin-top: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    color: #ff6b6b;
  }
  
  p {
    margin: 1rem 0;
  }
  
  a {
    color: #42b983;
    text-decoration: none;
  }
  </style>