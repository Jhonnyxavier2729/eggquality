<template>
  <div class="page-content honeycomb-list-view">
    <h2>Lista de Panales</h2>

    <div class="controls">
      <input
        type="text"
        placeholder="Buscar panal..."
        v-model="searchQuery"
        class="search-input"
      > <!-- Añadir clase si aplica estilos específicos -->
      <button class="filter-btn" @click="toggleFilters">
        <span>🔍</span> Filtros
      </button>
      <!-- Opcional: Área de filtros extendida mostrada condicionalmente con v-if="showFilters" -->
    </div>

    <p v-if="panalesStore.loading" class="status-message">Cargando panales...</p>
    <p v-else-if="panalesStore.error" class="error-message">Error al cargar panales: {{ panalesStore.error }}</p>
    <p v-else-if="panalesStore.panales.length === 0" class="status-message">No hay panales registrados para tu usuario.</p>

    <div v-else class="panales-list-container"> <!-- Contenedor para la tabla/lista -->
      <table class="honeycomb-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo Huevo</th> <!-- Añadir Tipo Huevo -->
            <th>Cantidad</th> <!-- Añadir Cantidad -->
            <th>Galpón o Lote</th> <!-- Cambiar Ubicación a Galpón/Lote -->
            <th>Fecha Inicio</th> <!-- Fecha Instalación -->
            <th>Fecha Vencimiento</th> <!-- Añadir Fecha Vencimiento -->
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredPanales" :key="item.id"> <!-- Iterar sobre datos filtrados del store -->
            <td>{{ item.idPanal }}</td> <!-- Mostrar el ID ingresado por el usuario -->
            <td>{{ item.tipoHuevo }}</td> <!-- Mostrar Tipo Huevo -->
            <td>{{ item.cantidadHuevos }}</td> <!-- Mostrar Cantidad -->
            <td>{{ item.galponLote }}</td> <!-- Mostrar Galpón/Lote -->
            <td>{{ item.fechaInicio }}</td> <!-- Mostrar Fecha de Inicio -->
            <td>{{ item.fechaVencimiento }}</td> <!-- Mostrar Fecha de Vencimiento -->
            <td>
              <span :class="'status-' + item.estado.toLowerCase()">
                {{ item.estado }}
              </span>
            </td>
            <td>
              <button class="action-btn edit-btn" @click="editPanal(item.id)">
                ✏️ <!-- Ícono de editar -->
              </button>
              <button class="action-btn delete-btn" @click="confirmDelete(item.id)">
                🗑️ <!-- Ícono de eliminar -->
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Necesitarás crear un componente para el modal si quieres uno más elaborado que el confirm() nativo -->
    <!-- <DeleteConfirmModal v-if="showConfirmModal" @confirm="deletePanalConfirmed" @cancel="cancelDelete" /> -->

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; // Importa ref, computed, onMounted
import { usePanalesStore } from '@/stores/panalesStore'; // Importa tu store de panales
// Si necesitas el router para navegar a una página de edición, impórtalo
// import { useRouter } from 'vue-router';


const panalesStore = usePanalesStore(); // Usa el store
// const router = useRouter(); // Opcional: si navegas a una página de edición

const searchQuery = ref(''); // Estado reactivo para el campo de búsqueda
const showFilters = ref(false); // Estado reactivo para mostrar/ocultar filtros

// Eliminamos la data hardcodeada 'honeycombs' porque usaremos panalesStore.panales


// --- Computada para filtrar los panales del store ---
const filteredPanales = computed(() => {
  // Obtiene la lista de panales del store
  const panalesList = panalesStore.panales;
  const query = searchQuery.value.toLowerCase();

  // Si la búsqueda está vacía, retorna la lista completa del store
  if (!query) {
    return panalesList;
  }

  // Filtra la lista del store basada en el query de búsqueda
  return panalesList.filter(panal =>
    // Filtra por idPanal o galponLote (puedes añadir más campos si quieres)
    panal.idPanal.toLowerCase().includes(query) ||
    panal.galponLote.toLowerCase().includes(query) ||
    panal.estado.toLowerCase().includes(query)
     // Añade otros campos relevantes si quieres que se puedan buscar
     // (panal.tipoHuevo?.toLowerCase().includes(query)) // Usa ?. por si el campo es null/undefined
  );
});


// --- Lógica para cargar los panales cuando el componente se monta ---
onMounted(() => {
  // Llama a la acción del store para cargar los panales del usuario
  // Puedes poner una condición aquí si no quieres recargarla cada vez que visitas la página
  // if (panalesStore.panales.length === 0) {
       panalesStore.fetchPanales();
  // }
});


// --- Lógica para mostrar/ocultar filtros ---
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
  // Lógica adicional para aplicar filtros si es necesario
};


// --- Lógica para Eliminar Panal ---
const confirmDelete = (panalId) => {
    // panalId es el ID del documento de Firestore
    if (confirm('¿Estás seguro de que quieres eliminar este panal?')) {
        panalesStore.deletePanal(panalId); // Llama a la acción del store para eliminar
    }
    // Si usas un modal, aquí mostrarías el modal y la lógica de confirmación llamaría a deletePanal
};

// --- Lógica para Editar Panal (Esbozo) ---
const editPanal = (panalId) => {
    // panalId es el ID del documento de Firestore
    console.log('Intentar editar panal con ID:', panalId);
    // ===> Aquí necesitarás implementar la lógica para editar <===
    // Opciones:
    // 1. Navegar a una página de edición: router.push({ name: 'edit-panal', params: { id: panalId } });
    //    (Necesitarías una ruta '/edit-panal/:id' y una vista de edición)
    // 2. Abrir un modal de edición: Mostrar un modal que cargue los datos del panalId y permita editarlos.
    // Por ahora, solo hace un log.
};


// Lógica para ver detalles (si es diferente de editar, si no puedes eliminar viewDetails)
// const viewDetails = (id) => {
//   console.log('Ver detalles del panal:', id)
//   // Podría navegar a una página de detalles o mostrar un modal
// }


</script>

<style scoped>
.page-content {
    /* Asegúrate de que tenga el padding correcto del layout principal */
    /* padding: 1.5rem; */
}

.honeycomb-list-view {
  max-width: 1200px;
  margin: 0 auto; /* Centra el contenido si tiene max-width */
  /* Puedes añadir padding si no lo pones en page-content */
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Permite que los controles se envuelvan en pantallas pequeñas */
}

.search-input {
  flex: 1; /* Permite que el input de búsqueda crezca */
  min-width: 150px; /* Ancho mínimo para el input */
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b983; /* Color de ejemplo (verde) */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.honeycomb-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden; /* Necesario para bordes redondeados con thead/tbody */
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.honeycomb-table th,
.honeycomb-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.honeycomb-table th {
  background-color: #f5f7fa; /* Color de fondo para encabezados */
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.honeycomb-table tbody tr:last-child td {
  border-bottom: none; /* No mostrar borde en la última fila */
}

/* Estilos para el estado en la tabla */
.status-activo {
  color: #4caf50; /* Verde */
  font-weight: bold;
}

.status-vencido {
  color: #f44336; /* Rojo */
  font-weight: bold;
}
.status-vendido { /* Añadir estilo para estado Vendido */
   color: #ff9800; /* Naranja */
   font-weight: bold;
}


/* Estilos para los botones/íconos de Acción */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem; /* Tamaño de los íconos */
  padding: 0.3rem; /* Espaciado alrededor del ícono clickeable */
  transition: color 0.3s ease;
}

.action-btn:hover {
    color: #ff753a; /* Cambiar color al pasar el ratón */
}

.delete-btn {
    color: #e57373; /* Color base para eliminar (rojo claro) */
}
.delete-btn:hover {
    color: #f44336; /* Rojo más oscuro al pasar el ratón */
}

.edit-btn {
   color: #64b5f6; /* Color base para editar (azul claro) */
}
.edit-btn:hover {
   color: #2196f3; /* Azul más oscuro al pasar el ratón */
}


/* Estilo para mensajes de estado */
.status-message, .error-message {
    text-align: center;
    margin-top: 2rem;
    font-size: 1.1rem;
}
.error-message {
    color: red;
}

/* Opcional: Responsividad básica para la tabla */
@media (max-width: 768px) {
  .honeycomb-table th,
  .honeycomb-table td {
    padding: 0.75rem; /* Reducir padding en pantallas pequeñas */
    font-size: 0.9rem;
  }

  .action-btn {
      font-size: 1rem; /* Reducir tamaño de íconos */
      padding: 0.2rem;
  }

   /* Considerar ocultar algunas columnas en pantallas muy pequeñas o usar un diseño diferente */
}

</style>