<template>
    <div class="analysis-view">
      <h2>Análisis de Huevos</h2>

      <div class="action-bar">
        <button class="primary-btn" @click="startNewAnalysis">
          <span>➕</span> Nuevo Análisis
        </button>
      </div>

      <div class="analysis-form" v-if="showForm">
        <!-- Formulario de análisis -->
        <div class="form-group">
          <label>Tipo de Análisis</label>
          <select v-model="analysisType">
            <option value="interno">Interno</option>
            <option value="externo">Externo</option>
          </select>
        </div>

        <button class="submit-btn" @click="submitAnalysis">Enviar</button>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <h4>Análisis Hoy</h4>
          <div class="value">8</div>
        </div>
        <div class="stat-card">
          <h4>Calidad Promedio</h4>
          <div class="value">AA</div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'

  const showForm = ref(false)
  const analysisType = ref('interno')

  const startNewAnalysis = () => {
    showForm.value = true
  }

  const submitAnalysis = () => {
    // Lógica para enviar análisis
    showForm.value = false
  }
  </script>

  <style scoped>
  .analysis-view {
    max-width: 1200px;
    margin: 0 auto;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .action-bar {
    margin-bottom: 2rem;
  }

  .primary-btn {
    padding: 0.75rem 1.5rem;
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .analysis-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .submit-btn {
    padding: 0.75rem 1.5rem;
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .stat-card h4 {
    margin-top: 0;
    color: #7f8c8d;
    font-size: 1rem;
  }

  .stat-card .value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ff753a;
    margin: 0.5rem 0;
  }
  </style>
