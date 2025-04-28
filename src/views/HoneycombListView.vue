<template>
  <div class="honeycomb-list-view">
    <h2>Lista de Panales</h2>

    <div class="controls">
      <input
        type="text"
        placeholder="Buscar panal..."
        v-model="searchQuery"
      >
      <button class="filter-btn" @click="toggleFilters">
        <span></span> Buscar
      </button>
    </div>

    <table class="honeycomb-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Ubicación</th>
          <th>Fecha Instalación</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredHoneycombs" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.location }}</td>
          <td>{{ item.installationDate }}</td>
          <td>
            <span :class="'status-' + item.status.toLowerCase()">
              {{ item.status }}
            </span>
          </td>
          <td>
            <button class="action-btn" @click="viewDetails(item.id)">
              👁️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const showFilters = ref(false)

const honeycombs = ref([
  { id: 'HC-001', location: 'Sector A', installationDate: '2023-10-15', status: 'Activo' },
  { id: 'HC-002', location: 'Sector B', installationDate: '2023-11-01', status: 'Activo' },
  { id: 'HC-003', location: 'Sector C', installationDate: '2023-09-20', status: 'Vencido' },
  // Más datos...
])

const filteredHoneycombs = computed(() => {
  return honeycombs.value.filter(honeycomb =>
    honeycomb.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    honeycomb.location.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const viewDetails = (id) => {
  console.log('Ver detalles del panal:', id)
}
</script>

<style scoped>
.honeycomb-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.controls input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-btn {
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

.honeycomb-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.honeycomb-table th,
.honeycomb-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.honeycomb-table th {
  background-color: #f5f7fa;
  color: #2c3e50;
  font-weight: 600;
}

.status-activo {
  color: #4caf50;
  font-weight: bold;
}

.status-vencido {
  color: #f44336;
  font-weight: bold;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
}

/* Responsive */
  @media (max-width: 480px) {

  .honeycomb-table {
  display: block; /* Cambia la tabla a un diseño de bloque */
}
  .controls {
    flex-direction: column; /* Cambia a diseño vertical */
    gap: 0.5rem; /* Reduce el espacio entre elementos */
  }

  .honeycomb-table th,
  .honeycomb-table td {
    padding: 0.5rem; /* Reduce el relleno en celdas */
    font-size: 0.9rem; /* Ajusta el tamaño del texto */
  }

  .honeycomb-table th::after {
  content: ':';
  margin-right: 0.5rem;
}
}
</style>