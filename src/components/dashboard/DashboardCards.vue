<template>
  <div class="dashboard-page-wrapper"> <h1 class="dashboard-title">Dashboard</h1>
    <div class="dashboard-cards">
      <div class="card">
        <h4>Análisis Recientes:</h4>
        <div class="value">5 realizados hoy</div>
      </div>

      <div class="card">
        <h4>Panales Activos:</h4>
        <div class="value">12 en inventario</div>
      </div>

      <div class="card">
        <h4>Próximos a Vencer:</h4>
        <div class="value">3 panales</div>
      </div>
    </div>
  </div>
  </template>

<script setup></script>

<style scoped>

.dashboard-page-wrapper {
  padding-top: 1rem; /* Ajusta este valor para el espacio deseado desde arriba */

/* Puede que necesites un margen para separarlo de los lados de la pantalla o del sidebar */
}
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem; /* Espacio base entre tarjetas */
  max-width: 100%; /* Ancho máximo base del contenedor de tarjetas */
  margin: 2rem auto; /* Margen base (centrado horizontalmente) */
  padding: 0 2rem; /* Padding horizontal base */;
}

.card {
  background: rgb(255, 255, 255);
  border-radius: 8px;
  padding: 1.5rem; /* Padding base interno de la tarjeta */
  box-shadow: 0 2px 10px rgba(118, 29, 29, 0.05);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: 2px solid #bbb8b8;

}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card h4 {/* Título de la tarjeta */
  margin-top: 0;
  color:  #ff753a;
  font-size: 0.9rem; /* Tamaño de fuente base */
}

.card .value {
  /* Valor principal en la tarjeta */
  font-size: 1.3rem; /* Tamaño de fuente base */
  font-weight: bold;
  color: #010100;
  margin: 0.5rem 0;
}
.dashboard-title {
  text-align: center;
  margin-top: 0; /* Asegura que el h1 no añada su propio margen superior por defecto */
  margin-bottom: 2rem; /* Margen positivo para separar el título de las tarjetas */
  color: #0b0b0b;
  font-size: 1.5rem;
}
/* --- ESTILOS PARA PANTALLAS ULTRA GRANDES (2560px Y MÁS) --- */
@media (min-width: 2500px) {
  .dashboard-cards {
    gap: 3rem; /* Aumenta el espacio entre tarjetas */
    padding: 0 3rem; /* Aumenta el padding horizontal del contenedor */
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .card {
    padding: 3rem; /* Aumenta el padding interno de cada tarjeta */
  }

  .card h4 {
    font-size: 1.2rem; /* Aumenta el tamaño del título de la tarjeta */
  }

  .card .value {
    font-size: 1.8rem; /* Aumenta significativamente el tamaño del valor principal */
  }
}
@media (min-width: 2000px) {
  /* O puedes usar 1000px, 1200px, etc. */
  .dashboard-cards {
    /* Aquí puedes ajustar los estilos para pantallas de escritorio típicas */
    grid-template-columns: repeat(
      auto-fit,
      minmax(600px, 1fr)
    ); /* Tarjetas un poco más anchas que el base */
    gap: 2.5rem; /* Un poco más de espacio entre tarjetas */
    padding: 0 3rem; /* Más padding horizontal */
    /* Puedes ajustar el padding interno de las tarjetas aquí si es necesario */
  }
  .card {
    padding: 2rem; /* Ejemplo: Ajustar padding interno de las tarjetas */
  }
  .card h4 {
    font-size: 1rem; /* Ejemplo: Ajustar tamaño de fuente si es necesario */
  }
  .card .value {
    font-size: 1.5rem; /* Ejemplo: Ajustar tamaño de fuente si es necesario */
  }
}

/* Tablets y móviles horizontales (hasta 768px) */
@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr; /* Una tarjeta por fila */
    padding: 0 1.5rem;
    gap: 1.5rem;
  }

  .card h4 {
    font-size: 1rem;
  }

  .card .value {
    font-size: 1.4rem;
  }
}

/* Móviles pequeños (hasta 400px) */
@media (max-width: 400px) {
  .dashboard-cards {
    /* grid-template-columns: 1fr; ya está heredado de max-width: 768px */
    padding: 0 1rem;
  }
  /* Podrías ajustar más los tamaños de fuente aquí si es necesario para móviles muy pequeños */
}
</style>
