<template>
    <div class="auth-layout">
      <div class="logo-container">
        <img src="@/assets/logo1.png" alt="Logo" class="logo">

      </div>
      <div class="auth-container">
        <slot></slot>
      </div>
    </div>
  </template>

  <!-- rops = defineProps({
    isLoading: Boolean, // Define la prop isLoading
  })-->
  <style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(to right, #f9faf9 , #f9f9f9); /* Degradado de blanco a morado */
}

.logo-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: transparent; /* Ya no necesita color sólido */
}

.logo {
  max-width: 500px;
  margin-bottom: 2rem;
  background-color: transparent;
}

h1 {
  color: #000000;
  font-size: 2.5rem;
  font-weight: 700;
}

.auth-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: transparent; /* Fondo transparente para que se vea el gradiente */
}

@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }

  .logo-container {
    padding: 1rem;
  }

  .logo {
    max-width: 120px;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>

