<template>
  <div class="honeycomb-list-view">
    <div class="title-container">
      <h2>Lista de Panales</h2>
    </div>

    <div class="controls">
      <input
        type="text"
        placeholder="Buscar panal..."
        v-model="searchQuery"
      >
      <button class="filter-btn" @click="toggleFilters">
        <i class="fas fa-search"></i> Buscar
      </button>
    </div>

    <table class="honeycomb-table">
      <thead>
        <tr>
          <th>ID del panal</th>
          <th>Tipo de huevo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredHoneycombs" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.tipo }}</td>

          <td>
            <span :class="'status-' + item.status.toLowerCase()">
              {{ item.status }}
            </span>
          </td>
          <td>
              <button class="action-btn" @click="viewDetails(item.id)" title="Ver detalles">
                <i class="fas fa-eye"></i> <!-- Ícono para ver detalles -->
              </button>
              <button class="action-btn" @click="editItem(item.id)" title="Editar">
                <i class="fas fa-edit"></i> <!-- Ícono para editar -->
              </button>
              <button class="action-btn" @click="deleteItem(item.id)" title="Eliminar">
                <i class="fas fa-trash"></i> <!-- Ícono para eliminar -->
              </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal para ver detalles -->
  <div v-if="selectedHoneycomb" class="modal">
    <div class="modal-content">
      <h3>Detalles del Panal</h3>
      <p><strong>ID:</strong> {{ selectedHoneycomb.id }}</p>
      <p><strong>Tipo de Huevo:</strong> {{ selectedHoneycomb.tipo }}</p>
      <p><strong>Estado:</strong> {{ selectedHoneycomb.status }}</p>
      <button @click="closeModal">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const showFilters = ref(false)

const honeycombs = ref([
  { id: 'HC-001', tipo: 'B', status: 'Activo' },
  { id: 'HC-002', tipo: 'A',  status: 'Activo' },
  { id: 'HC-003', tipo: 'AA', status: 'Vencido' },
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

const selectedHoneycomb = ref(null);

const viewDetails = (id) => {
  selectedHoneycomb.value = honeycombs.value.find((item) => item.id === id);
};

const closeModal = () => {
  selectedHoneycomb.value = null;
};

const editItem = (id) => {
  console.log('Editar panal con ID:', id);
  // Lógica para editar el panal
};

const deleteItem = (id) => {
  console.log('Eliminar panal con ID:', id);
  // Lógica para eliminar el panal
};
</script>

// Codigo CSS

<style scoped>
.honeycomb-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center; /* Centra el texto */
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

.honeycomb-table th ,
.honeycomb-table td {
  padding: 0.5rem;
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
  color: #555;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #ff753a; /* Cambia el color al pasar el cursor */
}

.action-btn i {
  margin-right: 0.5rem; /* Espaciado entre íconos */
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
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
