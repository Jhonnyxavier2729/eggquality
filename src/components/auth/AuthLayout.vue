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
  <style scoped>
.auth-layout {
    display: flex;
    min-height: 100vh;
    background-color: #ffffff;
  }

.logo-container {
    flex: 1;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
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
    background-color: #e67b49;
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

