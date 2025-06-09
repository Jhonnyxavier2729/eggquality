<template>
  <div class="contenedor-principal-general">
    <div class="dashboard-view">


      <div class="graficas-contenedor">
        <GraficaPreciosHuevos />

        <GraficaTamanoHuevos />
      </div>
    </div>
  </div>
</template>
<script setup>
import GraficaPreciosHuevos from '@/components/graficos/GraficaHuevos.vue';
import GraficaTamanoHuevos from '@/components/graficos/GraficaTamanoHuevos.vue';
</script>

<style scoped>
/* Estilos aplicados directamente desde tu ejemplo CSS */

/* Nuevo estilo para el contenedor principal que envuelve todo */
.contenedor-principal-general {
  width: 100%; /* Ocupa todo el ancho disponible */
  min-height: 100vh; /* Asegura que el contenedor tenga al menos la altura de la ventana del navegador */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra todo el contenido horizontalmente */
  background-color: #f5f7fa; /* Un color de fondo suave para toda la página */
  padding: 20px 0; /* Espacio superior e inferior para el contenido general */
}

.dashboard-view {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido principal horizontalmente */
  gap: 2rem;
  /* Elimina el width: 100% si el contenedor principal ya lo maneja bien */
  /* Considera un max-width aquí si quieres limitar el ancho del contenido interno */
  max-width: 1800px; /* Ejemplo: limita el ancho de todo el dashboard-view */
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

/* --- Nuevos estilos para el contenedor de gráficas --- */
.graficas-contenedor {
  width: 98%; /* Ocupa la mayor parte del ancho disponible */
  max-width: 1600px; /* Limita el ancho máximo para que no se extienda demasiado */
  display: flex; /* Permite que las gráficas se coloquen una al lado de la otra */
  flex-wrap: wrap; /* Permite que las gráficas salten a la siguiente línea en pantallas pequeñas */
  justify-content: center; /* Centra las gráficas horizontalmente dentro del contenedor */
  gap: 2rem; /* Espacio entre las dos gráficas */
  padding: 2rem; /* Relleno alrededor de las gráficas dentro del contenedor */
  background-color: white; /* Fondo blanco para el contenedor de las gráficas */
  border-radius: 12px; /* Bordes redondeados */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
  border: 1px solid #eee9e7; /* Borde ligero */
}
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

/* --- Media Queries para diferentes tamaños de pantalla --- */

/* Pantallas muy pequeñas (ej. móviles en vertical, ~320px - 480px) */
@media (max-width: 767px) {
  .dashboard-view {
    padding: 1rem; /* Reduce el padding general en pantallas muy pequeñas */
    gap: 1rem; /* Reduce el espacio entre secciones */
  }

  .graficas-contenedor {
    flex-direction: column; /* Apila las gráficas verticalmente en móviles */
    gap: 1.5rem; /* Espacio entre gráficas apiladas */
    padding: 1rem; /* Reduce el padding interno del contenedor de gráficas */
  }

  .graficas-contenedor > :deep(div) {
    flex: 1 1 100%; /* Cada gráfica ocupa todo el ancho disponible */
    min-width: unset; /* Reinicia el min-width */
  }

  .dashboard-header h1 {
    font-size: 1.8rem; /* Títulos más pequeños para móviles */
  }

  .dashboard-header p {
    font-size: 0.9rem; /* Texto más pequeño */
  }
}

/* Pantallas medianas (ej. tabletas, ~768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .dashboard-view {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .graficas-contenedor {
    flex-direction: row; /* Asegura que estén en fila */
    flex-wrap: wrap; /* Permitir envolver */
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .graficas-contenedor > :deep(div) {
    flex: 1 1 48%; /* Ajusta para que dos quepan cómodamente */
    min-width: 350px;
  }
}

/* Pantallas grandes (escritorio, > 1024px) - Estos son tus estilos base pero explícitos */
@media (min-width: 1025px) {
  .graficas-contenedor {
    flex-direction: row; /* Gráficas en fila */
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
  }

  .graficas-contenedor > :deep(div) {
    flex: 1 1 45%; /* Dos gráficas por fila con espacio */
    min-width: 400px; /* Asegura un tamaño mínimo decente */
  }
}


/* Tus estilos para cards y otros elementos (sin cambios, ya que no estaban en el template proporcionado) */
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
/* Estos se mantienen, pero considera si son redundantes con los nuevos media queries */
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
