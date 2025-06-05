<template>
  <div class="dashboard-view">
    <div class="form-container">
      <div class="dashboard-header">
        <h1>Resumen de Panales</h1>
      </div>

      <div class="dashboard-cards-grid">
        <div class="card clickable" @click="goToPanalList('Activo')">
          <div class="card-icon"><i class="fas fa-check-circle"></i></div>
          <div class="card-content">
            <h3>Panales Activos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesActivosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Vendido')">
          <div class="card-icon"><i class="fas fa-handshake"></i></div>
          <div class="card-content">
            <h3>Panales Vendidos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesVendidosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Vencido')">
          <div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="card-content">
            <h3>Panales Vencidos</h3>
            <p v-if="panalesStore.loading">Cargando...</p>
            <p v-else class="count">{{ panalesStore.panalesVencidosCount }}</p>
          </div>
        </div>

        <div class="card clickable" @click="goToPanalList('Todos')">
          <div class="card-icon"><i class="fas fa-layer-group"></i></div>
          <div class="card-content">
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
import { usePanalesStore } from '@/stores/panalesStore'; // Importa tu store de panales


const panalesStore = usePanalesStore();
const router = useRouter();

// Función para navegar a la lista de panales con un filtro
const goToPanalList = (filterType) => {
  let queryParams = {};

  if (filterType === 'Activo') {
    queryParams.estado = 'Activo';
  } else if (filterType === 'Vendido') {
    queryParams.estado = 'Vendido';
  } else if (filterType === 'Vencido') {
    queryParams.vencido = 'true'; // Usaremos un parámetro específico para vencidos
  }
  // Si filterType es 'Todos', no añadimos parámetros de estado ni vencido
  // La lista mostrará todos los panales por defecto si no hay filtros, o los del usuario.

  router.push({ name: 'honeycomb-list', query: queryParams });
};

// Cargar los contadores al montar el componente
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
  align-items: center; /* Centra el contenido principal horizontalmente */
  gap: 2rem;
}

/* Nuevos estilos para .form-container */
.form-container {
  padding: 2rem; /* Aumentado el padding para el contenido interno */
  width: 98%; /* Asegura que ocupe casi todo el ancho de su padre */
  max-width: 1600px; /* Limita el ancho máximo igual que el grid */
  background-color: white;
  border-radius: 12px; /* Un poco más de radio para que coincida con las cards */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra para que destaque un poco */
  border: 1px solid #eee9e7;
  position: relative; /* Necesario para z-index si lo usaras para superposición */
  /* z-index: -1; */ /* Solo si necesitas que este contenedor esté *realmente* detrás de otros elementos superpuestos */
  display: flex; /* Añadido para que el contenido dentro de él se alinee */
  flex-direction: column; /* Apila el header y las cards verticalmente */
  gap: 2rem; /* Espacio entre el header y el grid de cards */
}

.dashboard-header {
  width: 98%;
  max-width: 1600px;
  text-align: center; /* Centra el texto del título */
  margin-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 1.5rem; /* Ajusta el tamaño de la fuente si es necesario */
  color: #333; /* Ajusta el color del título si es necesario */
}

.dashboard-cards-grid {
  width: 98%;
  max-width: 1600px;
  display: grid;
  /* Utiliza repeat(auto-fit, minmax(250px, 1fr)) para una distribución flexible
     y justify-content: center; en el contenedor padre si no fuera un grid */
  grid-template-columns: repeat(3, 1fr); /* Min-width ajustado para mejor reparto */
  gap: 1.5rem; /* Espacio entre las tarjetas */
  padding: 0.5rem;
  /* Centrar el grid si no ocupa todo el ancho disponible */
  justify-content: center; /* Centra las tarjetas si hay espacio extra */
  align-items: start; /* Alinea las tarjetas al inicio de su fila */
}

.dashboard-cards-grid .card:nth-child(4) {
  /* Esta tarjeta ocupará las 3 columnas, forzándola a una nueva fila y centrándose */
  grid-column: 1 / span 3; /* Ocupa desde la columna 1 hasta la 3 */
  justify-self: center; /* Centra la tarjeta horizontalmente dentro de su espacio de grid */
  width: 50%; /* Opcional: Define un ancho para la tarjeta si no quieres que ocupe todo el ancho disponible */
  max-width: 400px; /* Opcional: Limita el ancho máximo para que no se vea demasiado grande */
  margin-top: 1rem; /* Pequeño margen superior para separarla de las de arriba */
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex; /* Mantenemos flex para alinear icono y contenido */
  flex-direction: column; /* Apila icono y contenido si quieres que el icono también se centre arriba */
  align-items: center; /* Centra los ítems (icono y wrapper) horizontalmente en la tarjeta */
  gap: 0.75rem; /* Espacio entre icono y contenido */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #eee;
  text-align: center; /* Centra el texto dentro de la tarjeta */
}

.card.clickable {
  cursor: pointer;
}

.card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2.8rem; /* Icono un poco más grande para destacar */
  color: #ff753a;
  margin-right: 0; /* Elimina el margen derecho si el icono está apilado */
  margin-bottom: 0.5rem; /* Pequeño margen inferior para separar del texto */
}

.card-content-wrapper { /* Nuevo estilo para el contenido envuelto */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el h3 y el p dentro del wrapper */
  width: 100%; /* Asegura que el wrapper ocupe todo el ancho disponible */
}

.card-content-wrapper h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  text-align: center; /* Asegura que el título dentro de wrapper esté centrado */
}

.card-content-wrapper .count {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-top: 0.5rem; /* Espacio entre el título y el número */
  text-align: center; /* Asegura que el número esté centrado */
}

/* El resto de tus estilos, como .contenedor-tablas y media queries, se mantienen */
/* ... */

/* Media queries para .contenedor-tablas se mantienen si es necesario */
@media (min-width: 2000px) {
  .contenedor-tablas {
    max-width: 80%;
    padding: 3rem;
    /* min-height: calc(100vh - (2 * 3rem)); */
    gap: 3rem;
  }
}
@media (min-width: 2500px) {
  .contenedor-tablas {
    max-width: 75%;
    padding: 4rem;
    /* min-height: calc(100vh - (2 * 4rem)); */
    gap: 4rem;
  }
}
</style>