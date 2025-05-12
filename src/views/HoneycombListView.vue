// src/views/HoneycombListView.vue

<template>
  <div class="page-content honeycomb-list-view">
    <h2>Lista de Panales</h2>

    <div class="controls">
      <input
        type="text"
        placeholder="Buscar panal por ID, Galpon o Estado"
        v-model="searchQuery"
        class="search-input"
      />
    </div>

    <p v-if="panalesStore.loading" class="status-message">Cargando panales...</p>
    <p v-else-if="panalesStore.error" class="error-message">
      Error al cargar panales: {{ panalesStore.error }}
    </p>
    <p
      v-else-if="panalesStore.panales.length === 0 && !panalesStore.loading && !panalesStore.error"
      class="status-message"
    >
      No hay panales registrados para tu usuario.
    </p>

    <div v-else class="panales-list-container">
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
          <tr v-for="item in filteredPanales" :key="item.id">
            <td>{{ item.idPanal }}</td>
            <td>{{ item.tipoHuevo }}</td>
            <td>
              <span :class="'status-' + item.estado.toLowerCase()">
                {{ item.estado }}
              </span>
            </td>
            <td>
              <button class="action-btn view-btn" @click="viewDetails(item.id)">
                <font-awesome-icon :icon="['fas', 'eye']" />
              </button>

              <button class="action-btn edit-btn" @click="editPanal(item.id)">
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>

              <button class="action-btn delete-btn" @click="confirmDelete(item.id)">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PanalDetailsModal
      v-if="showDetailsModal"
      :panal="selectedPanal"
      @close="showDetailsModal = false"
    />
    <!--   Añadir el componente ConfirmModal aquí  -->
    <!--  Se mostrará cuando showDeleteConfirm sea true  -->

    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Eliminar"
      :message="`¿Estás seguro de que quieres eliminar el panal?`"
      confirmButtonText="Sí, Eliminar"
      cancelButtonText="Cancelar"
      @confirm="executeDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePanalesStore } from '@/stores/panalesStore'
// Importa el nuevo componente Modal
import PanalDetailsModal from '@/components/panal/PanalDetailsModal.vue'
// Si necesitas el router para navegar a páginas de edición/detalle, impórtalo
import { useRouter } from 'vue-router'

import ConfirmModal from '@/components/auth/ConfirmModal.vue'

const panalesStore = usePanalesStore()
const router = useRouter()

// === Mover estas declaraciones al principio ===
const showDeleteConfirm = ref(false)
const panalToDelete = ref(null)
// ===

const searchQuery = ref('')

// --- Estado para el Modal de Detalles ---
const showDetailsModal = ref(false) // Controla si el modal está visible
const selectedPanal = ref(null) // Guarda los datos del panal a mostrar en el modal
// --- Fin Estado Modal ---

// --- Computada para filtrar los panales del store ---
const filteredPanales = computed(() => {
  // Obtiene la lista de panales del store
  const panalesList = panalesStore.panales // Ya es reactivo

  const query = searchQuery.value.toLowerCase()

  // Si la búsqueda está vacía, retorna la lista completa del store
  if (!query) {
    return panalesList
  }

  // Filtra la lista del store basada en el query de búsqueda
  return panalesList.filter(
    (panal) =>
      // Asegúrate de que los campos existan antes de llamar toLowerCase()
      panal.idPanal?.toLowerCase().includes(query) ||
      panal.galponLote?.toLowerCase().includes(query) ||
      panal.estado?.toLowerCase().includes(query),
    // Añade otros campos si quieres que se puedan buscar
    // (panal.tipoHuevo?.toLowerCase().includes(query))
  )
})

// --- Lógica para cargar los panales cuando el componente se monta ---
// --- Lógica para cargar los panales cuando el componente se monta ---
onMounted(() => {
  console.log('HoneycombListView mounted. Fetching panales...')
  // Llama A LA ACCIÓN DEL STORE PARA CARGAR LOS PANALES DEL USUARIO
  // SIEMPRE que se monte el componente, para asegurar datos recientes.
  panalesStore.fetchPanales() // <-- MODIFICADO: Eliminada la condición
})
// --- Lógica para Ver Detalles (Actualizada para mostrar Modal) ---
const viewDetails = (panalId) => {
  console.log('Intentando ver detalles del panal:', panalId)
  // Buscar el panal en la lista cargada en el store por su ID de Firestore
  const panal = panalesStore.panales.find((p) => p.id === panalId)

  if (panal) {
    selectedPanal.value = panal // Guarda el panal encontrado en el estado
    showDetailsModal.value = true // Muestra el modal
    console.log('Mostrando modal para panal:', panalId)
  } else {
    console.error('Panal no encontrado en la lista local:', panalId)
    // Opcional: Mostrar un mensaje de error al usuario (usando toast si lo tienes configurado)
    // toast.error('No se pudieron cargar los detalles del panal.');
  }
}

// --- Lógica para Editar Panal (Se mantiene como placeholder por ahora) ---

// --- Lógica para Editar Panal (Actualizada para navegar) ---
const editPanal = (panalId) => {
  console.log('Navegando a editar panal con ID:', panalId)
  // Navega a la ruta 'honeycomb' (la vista de registro)
  // Pasando el panalId como un parámetro de ruta llamado 'id'
  router.push({ name: 'honeycomb', params: { id: panalId } })
}

// --- Lógica para Eliminar Panal (MODIFICADA para usar ConfirmModal) ---
const confirmDelete = (panalId) => {
  // En lugar de usar el confirm nativo, mostramos nuestro modal personalizado
  console.log('Mostrando modal de confirmación para eliminar panal con ID:', panalId)
  panalToDelete.value = panalId // Guardamos el ID del panal a eliminar
  showDeleteConfirm.value = true // Mostramos el modal
}

const cancelDelete = () => {
  // Función llamada cuando el usuario cancela en el modal
  console.log('Eliminación cancelada.')
  showDeleteConfirm.value = false // Ocultamos el modal
  panalToDelete.value = null // Limpiamos el ID
}

const executeDelete = async () => {
  // Función llamada cuando el usuario confirma en el modal
  if (panalToDelete.value) {
    console.log('Ejecutando eliminación del panal con ID:', panalToDelete.value)
    await panalesStore.deletePanal(panalToDelete.value) // Llamamos a la acción del store
    showDeleteConfirm.value = false // Ocultamos el modal
    panalToDelete.value = null // Limpiamos el ID después de eliminar
  }
}

// --- Fin Lógica Eliminar Panal ---

// Exportar variables/funciones si necesitas acceder a ellas desde fuera (generalmente no en vistas)
// export { searchQuery, filteredPanales, toggleFilters, viewDetails, editPanal, confirmDelete, showDetailsModal, selectedPanal };
</script>

<style scoped>
.honeycomb-list-view {
  max-width: 1200px; /* Ancho máximo del contenido */
  margin: 0 auto; /* Centra el contenido */
  /* Puedes añadir padding si no lo pones en page-content */
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Permite que los controles se envuelvan */
  justify-content: center; /* Centra los controles en pantallas pequeñas */
}
.controls :focus {
  outline: none;
  border-color: #ff5c1a; /* Naranja más oscuro al enfocar */
  box-shadow: 0 0 0 3px rgba(255, 117, 58, 0.3); /* Sombra al enfocar */
}

.search-input {
  flex-grow: 1; /* Permite que el input crezca */
  min-width: 200px; /* Ancho mínimo para el input */
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  background-color: #ff753a; /* Verde */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}
.filter-btn:hover {
  background-color: #ff5c1a; /* Verde más oscuro */
}

.panales-list-container {
  overflow-x: auto; /* Agrega scroll horizontal si la tabla es más ancha que la pantalla */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.honeycomb-table {
  width: 100%;
  border-collapse: collapse; /* Elimina espacio entre bordes */
  background: white;
  border-radius: 8px; /* Bordes redondeados */
  overflow: hidden; /* Esconde contenido que sobresale de bordes redondeados */
}

.honeycomb-table th,
.honeycomb-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0; /* Línea entre filas */
}

.honeycomb-table th {
  background-color: #f5f7fa; /* Fondo para encabezados */
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
.status-vendido {
  /* Estilo para estado Vendido */
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
  margin: 0 2px; /* Pequeño margen entre botones de acción */
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #ff753a; /* Cambiar color al pasar el ratón (naranja principal) */
}

.view-btn {
  color: #5e35b1; /* Ejemplo: Morado para ver */
}
.view-btn:hover {
  color: #4527a0; /* Morado oscuro */
}

.edit-btn {
  color: #64b5f6; /* Azul claro para editar */
}
.edit-btn:hover {
  color: #2196f3; /* Azul más oscuro */
}

.delete-btn {
  color: #e57373; /* Rojo claro para eliminar */
}
.delete-btn:hover {
  color: #f44336; /* Rojo más oscuro al pasar el ratón */
}

/* Estilo para mensajes de estado */
.status-message,
.error-message {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
}
.error-message {
  color: red;
  font-weight: bold;
}

/* Opcional: Responsividad básica para la tabla */
@media (max-width: 768px) {
  .honeycomb-table th,
  .honeycomb-table td {
    padding: 0.75rem; /* Reducir padding */
    font-size: 0.9rem;
  }

  .action-btn {
    font-size: 1rem; /* Reducir tamaño de íconos */
    padding: 0.2rem;
  }
  /* Considerar ocultar algunas columnas en pantallas muy pequeñas */
}
</style>
