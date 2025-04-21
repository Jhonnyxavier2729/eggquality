<template>
    <div class="honeycomb-view">
      <h2>Gestión de Panales</h2>
      
      <div class="honeycomb-stats">
        <div class="stat-item">
          <span class="stat-label">Total Panales:</span>
          <span class="stat-value">24</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Activos:</span>
          <span class="stat-value">12</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Próximos a vencer:</span>
          <span class="stat-value">3</span>
        </div>
      </div>
      
      <div class="honeycomb-grid">
        <!-- Visualización de panales -->
        <div 
          v-for="i in 12" 
          :key="i" 
          class="honeycomb-cell"
          :class="{ 'expiring': i <= 3 }"
        >
          <span>Panal #{{ i }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .honeycomb-view {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }
  
  .honeycomb-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
  }
  
  .stat-label {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #42b983;
  }
  
  .honeycomb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .honeycomb-cell {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    text-align: center;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    border: 2px solid #42b983;
  }
  
  .honeycomb-cell:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .honeycomb-cell.expiring {
    border-color: #ff9800;
    background-color: #fff3e0;
  }
  </style>