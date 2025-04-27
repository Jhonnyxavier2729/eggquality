<template>
    <div class="dashboard-cards">
      <div class="card">
        <h4>Análisis Recientes</h4>
        <div class="value">5 realizados hoy</div>
      </div>

      <div class="card">
        <h4>Panales Activos</h4>
        <div class="value">12 en inventario</div>
      </div>

      <div class="card">
        <h4>Próximos a Vencer</h4>
        <div class="value">3 panales</div>
      </div>
    </div>
  </template>

  <script setup>
  </script>

  <style scoped>
  .dashboard-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .card h4 {
    margin-top: 0;
    color: #7f8c8d;
    font-size: 1rem;
  }

  .card .value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ff753a ;
    margin: 0.5rem 0;
  }
  </style>
