<template>
  <div class="dashboard-view">
    <div class="contenedor-tablas">
      <DashboardCards />
      <RecentActivity />
    </div>
  </div>
</template>

<script setup>
import DashboardCards from '@/components/dashboard/DashboardCards.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: center;
  /*min-height: 100vh;*/
}

/* Este contenedor centraliza y controla el contenido principal */
.contenedor-tablas {
  width: 100%;
  max-width: 1600px; /* ← Aumentado para pantallas grandes */
  background-color: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e6e2e2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 1;
  overflow: hidden;
  min-height: calc(100vh - (2 * 4rem)); /* 100vh - padding-top - padding-bottom */


}
.contenedor-tablas > * {
    flex: 1;
  }

/* Para pantallas muy grandes, por ejemplo, mayores a 2000px */
@media (min-width: 2000px) {
  .contenedor-tablas {
    max-width: 80%; /* Aumenta el max-width para que ocupe más espacio */
    padding: 3rem;
    min-height: calc(100vh - (2 * 3rem));
    gap: 3rem;
  }
}
@media (min-width: 2500px) {
    .contenedor-tablas {
        max-width: 75%; /* Ocupa el 75% del ancho en pantallas ultra grandes */
        padding: 4rem;
         min-height: calc(100vh - (2 * 4rem));
        gap: 4rem;
    }
}

</style>
