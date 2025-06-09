<template>
  <div class="dashboard-view">
    <div class="form-container">
      <div class="dashboard-header">
        <h1>Resumen de Panales</h1>
      </div>

      <div class="dashboard-cards-grid">
        <div class="card clickable" @click="goToPanalList('Activo')">
          <div class="card-icon"><i class="fas fa-check-circle"></i></div>
          <div class="card-content-wrapper">
            <h3>Panales Activos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesActivosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Vendido')">
          <div class="card-icon"><i class="fas fa-handshake"></i></div>
          <div class="card-content-wrapper">
            <h3>Panales Vendidos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesVendidosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Vencido')">
          <div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="card-content-wrapper">
            <h3>Panales Vencidos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesVencidosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Todos')">
          <div class="card-icon"><i class="fas fa-layer-group"></i></div>
          <div class="card-content-wrapper">
            <h3>Total Panales Creados</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.totalPanalesCreadosCount }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePanalesStore } from '@/stores/panalesStore';


const panalesStore = usePanalesStore();
const router = useRouter();

const goToPanalList = (filterType) => {
  let queryParams = {};

  if (filterType === 'Activo') {
    queryParams.estado = 'Activo';
  } else if (filterType === 'Vendido') {
    queryParams.estado = 'Vendido';
  } else if (filterType === 'Vencido') {
    queryParams.vencido = 'true';
  }

  router.push({ name: 'honeycomb-list', query: queryParams });
};

onMounted(() => {
  panalesStore.fetchDashboardCounts();
});
</script>

<style scoped>

.dashboard-view {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.form-container {
  padding: 2rem;
  width: 98%;
  max-width: 1600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee9e7;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius:  8px;
  display: inline-block;
  margin: 0 auto 1rem; /* centra horizontalmente */
  text-align: left;    /* para que el texto se alinee dentro del bloque */
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #050303;
  margin: 0;
}


.dashboard-cards-grid {
  width: 98%;
  max-width: 1600px;
  display: grid;
  /* Por defecto: 3 columnas para pantallas grandes */
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0.5rem;
  justify-content: center;
  align-items: start;
}

/* Regla para la cuarta tarjeta en pantallas grandes (3 columnas) */
.dashboard-cards-grid .card:nth-child(4) {
  grid-column: 1 / span 3; /* Ocupa las 3 columnas */
  justify-self: center; /* Centra la tarjeta horizontalmente */
  width: 50%; /* Define un ancho para la tarjeta */
  max-width: 400px; /* Limita el ancho máximo */
  margin-top: 1rem; /* Margen superior para separarla */
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1.4px solid #ff753a;
  text-align: center;
}

.card.clickable {
  cursor: pointer;
}

.card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2.8rem;
  color: #ff753a;
  margin-right: 0;
  margin-bottom: 0.5rem;
}

.card-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.card-content-wrapper h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  text-align: center;
}

.card-content-wrapper .count {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-top: 0.5rem;
  text-align: center;
}

/* --- Media Query para TABLETS (768px a 1200px) --- */
/* Incluye 768px para que se aplique en esa resolución y hacia arriba hasta 1200px */
@media (min-width: 768px) and (max-width: 1200px) {
  .dashboard-cards-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas */
    width: 95%;
    max-width: 800px; /* Ancho máximo para el grid 2x2 */
  }

  /* La cuarta tarjeta se comporta como una tarjeta normal en un grid de 2 columnas */
  .dashboard-cards-grid .card:nth-child(4) {
    grid-column: auto; /* Anula la regla de 3 columnas */
    justify-self: auto; /* Anula el centrado forzado */
    width: auto; /* Permite que el grid controle el ancho */
    max-width: none; /* Sin límite máximo de ancho específico */
    margin-top: 0; /* Elimina margen superior extra */
  }

  .card {
    padding: 1.2rem;
    max-width: 380px; /* Limita el ancho de cada tarjeta */
    margin-left: auto;
    margin-right: auto;
  }

  .card-icon {
    font-size: 2.5rem;
  }

  .card-content-wrapper h3 {
    font-size: 1.1rem;
  }

  .card-content-wrapper .count {
    font-size: 1.9rem;
  }
}

/* --- Media Query para MÓVILES (hasta 767px) --- */
/* Cambiado a max-width: 767px para no colisionar con la tablet query en 768px */
@media (max-width: 767px) {
  .dashboard-view {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.3rem;
  }

  .dashboard-cards-grid {
    grid-template-columns: 1fr; /* 1 columna para apilar verticalmente */
    gap: 1rem;
    width: 95%;
    max-width: 350px;
  }

  .card {
    padding: 1rem;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  /* La cuarta tarjeta también se apila */
  .dashboard-cards-grid .card:nth-child(4) {
    grid-column: auto;
    justify-self: center;
    width: 100%;
    max-width: 300px;
    margin-top: 0;
  }

  .card-icon {
    font-size: 2.2rem;
  }

  .card-content-wrapper h3 {
    font-size: 1.1rem;
  }

  .card-content-wrapper .count {
    font-size: 1.8rem;
  }
}

/* Para pantallas extra pequeñas (móviles muy compactos) */
@media (max-width: 480px) {
  .dashboard-view {
    padding: 0.5rem;
  }

  .form-container {
    padding: 0.8rem;
    width: 100%;
  }

  .dashboard-header h1 {
    font-size: 1rem;
  }

  .dashboard-cards-grid {
    gap: 0.8rem;
  }

  .card {
    padding: 0.8rem;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-content-wrapper h3 {
    font-size: 1rem;
  }

  .card-content-wrapper .count {
    font-size: 1.6rem;
  }
}

/* Media queries para .contenedor-tablas se mantienen si es necesario */
@media (min-width: 2000px) {
  .contenedor-tablas {
    max-width: 80%;
    padding: 3rem;
    gap: 3rem;
  }
}
@media (min-width: 2500px) {
  .contenedor-tablas {
    max-width: 75%;
    padding: 4rem;
    gap: 4rem;
  }
}
</style>
