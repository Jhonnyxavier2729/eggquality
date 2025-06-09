<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>PRECIOS</h1>
      <p>
        El propósito de este sistema de información es analizar el comportamiento de los precios de pollo y huevo en el canal mayorista – consumidor en las principales plazas de mercado a nivel nacional.
        <br>
        Fuente: Departamento Administrativo Nacional de Estadística –DANE-. Información pública. 
      </p>
    </div>

    <GraficaPreciosHuevos />

    <div class="info-section form-container">
      <h2>Clasificación y Normativa de Huevos</h2>
      <p class="section-description">
        En Colombia, la clasificación de los huevos se realiza principalmente por su peso, lo que define las categorías de tamaño. Esta estandarización es crucial para el comercio y la garantía de calidad al consumidor.
      </p>
      <GraficaTamanoHuevos />
    </div>

  </div>
</template>

<script setup>
import GraficaPreciosHuevos from '@/components/graficos/GraficaHuevos.vue';
import GraficaTamanoHuevos from '@/components/graficos/GraficaTamanoHuevos.vue';
</script>

<style scoped>
/* Estilos aplicados directamente desde tu ejemplo CSS */
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
  font-size: 2.2rem; /* Ajusta el tamaño de la fuente si es necesario */
  color: #2c3e50; /* Ajusta el color del título si es necesario */
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}

/* Sección de Información de Huevos */
.info-section {
  text-align: center;
}

.info-section h2 {
  color: #34495e;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 2rem;
}

/* Los siguientes estilos de tu ejemplo no son directamente usados por este setup,
   pero los mantengo para que veas dónde encajarían si tuvieras "cards" o una
   estructura de "grid" en esta vista. Los componentes de gráfica ya tienen sus
   propios estilos internos que usan algunas de estas ideas.
*/
.dashboard-cards-grid {
  width: 98%;
  max-width: 1600px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0.5rem;
  justify-content: center;
  align-items: start;
}

.dashboard-cards-grid .card:nth-child(4) {
  grid-column: 1 / span 3;
  justify-self: center;
  width: 50%;
  max-width: 400px;
  margin-top: 1rem;
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
  border: 1px solid #eee;
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

/* Media queries para .contenedor-tablas (asumo que se refiere a contenedores de gráficas o tablas) */
@media (min-width: 2000px) {
  .contenedor-tablas { /* Si applies a .form-container o .chart-container */
    max-width: 80%;
    padding: 3rem;
    gap: 3rem;
  }
}
@media (min-width: 2500px) {
  .contenedor-tablas { /* Si applies a .form-container o .chart-container */
    max-width: 75%;
    padding: 4rem;
    gap: 4rem;
  }
}
</style>