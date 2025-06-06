// src/views/HoneycombListView.vue
<template>
  <div class="page-content honeycomb-list-view">
    <!-- Contenedor general para todo el contenido -->
    <div class="content-container">
      <h2>Lista de Panales</h2>

      <div class="controls">
        <div class="search-box">
          <font-awesome-icon icon="search" class="search-icon" />
          <input
            type="text"
            placeholder="Buscar panal por ID, Huevo, Galpon o Estado"
            v-model="searchQuery"
            class="search-input"
          />
        </div>
      </div>

      <p v-if="panalesStore.loading" class="status-message">Cargando panales...</p>
      <p v-else-if="panalesStore.error" class="error-message">
        Error al cargar panales: {{ panalesStore.error }}
      </p>
      <p
        v-else-if="
          panalesStore.panales.length === 0 && !panalesStore.loading && !panalesStore.error
        "
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

      <Teleport to="body">
        <PanalDetailsModal
          v-if="showDetailsModal"
          :panal="selectedPanal"
          @close="showDetailsModal = false"
        />

          <ConfirmModal
            v-if="showDeleteConfirm"
            title="Eliminar"
            :message="`¿Estás seguro de que quieres eliminar el panal?`"
            confirmButtonText="Sí, Eliminar"
            cancelButtonText="Cancelar"
            @confirm="executeDelete"
            @cancel="cancelDelete"
          />
      </Teleport>
    </div>
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
      panal.estado?.toLowerCase().includes(query) ||
      panal.tipoHuevo?.toLowerCase().includes(query) 
    // Añade otros campos si quieres que se puedan buscar
    // (panal.tipoHuevo?.toLowerCase().includes(query))
  )
})

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
</script>

<style scoped>
/* --- ESTILOS BASE (para móvils pequeños, por defecto < 600px) --- */
.honeycomb-list-view {
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0 auto; /* Centra el contenido si el padre es más ancho */
    padding: 1rem; /* Padding base general de la vista */
}

.content-container {
    position: relative;
    background-color: white;
    padding: 1rem; /* Padding interno base */
    border-radius: 8px; /* Bordes menos redondeados */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra más suave */
    border: 1px solid #eaeaea; /* Borde más delgado */
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0 auto;
    z-index: 1;
    overflow: hidden;
}

h2 {
    color: #2c3e50;
    margin-bottom: 1rem; /* Reduce margen inferior */
    text-align: center;
    font-size: 1.5rem; /* Tamaño de fuente base */
}

.controls {
    display: flex;
    flex-direction: column; /* Apilados por defecto en móviles */
    align-items: stretch; /* Estira elementos al ancho completo */
    gap: 1rem; /* Espacio entre elementos apilados */
    margin-bottom: 1rem; /* Reduce margen inferior */
    ;
}
.controls :focus {
    outline: none;
    box-shadow: 0 0 0 1px rgb(232, 139, 69);
}

.search-box {
  position: relative;
  width: 100%; /* Asegura que la caja de búsqueda ocupe el ancho completo */
  display: flex; /* Para alinear el icono y el input */
  align-items: center;
}

.search-input {
    width: 100%; /* Ocupa todo el ancho del search-box */
    padding: 0.5rem 0.75rem 0.5rem 2rem; /* espacio para ícono a la izquierda */
    border: 1.8px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box; /* Incluir padding y borde en el ancho */
    border-color: #ff753a;
}

.search-icon {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    color: #888;
    font-size: 1rem;
}

.filter-btn {
    padding: 0.75rem 1.5rem;
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex; /* Mantener flex para ícono y texto */
    justify-content: center; /* Centra contenido del botón */
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    transition: background-color 0.3s ease;
    width: 100%; /* Ocupa todo el ancho disponible en móviles */
}
.filter-btn:hover {
    background-color: #ff5c1a;
}

.panales-list-container {
    overflow-x: auto; /* Permite scroll horizontal para la tabla */
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05); /* Sombra más suave */
    border-radius: 8px;
}

.honeycomb-table {
    width: 100%;
    min-width: 400px; /* Ancho mínimo para evitar que se vea apretada */
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

.honeycomb-table th,
.honeycomb-table td {
    padding: 0.8rem; /* Padding base en celdas */
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.9rem; /* Tamaño de fuente base para celdas */
}

.honeycomb-table th {
    background-color: #f5f7fa;
    color: #2c3e50;
    font-weight: 600;
    font-size: 0.8rem; /* Tamaño de fuente base para encabezados */
    text-transform: uppercase;
}

.honeycomb-table tbody tr:last-child td {
    border-bottom: none;
}

/* Estilos para el estado en la tabla */
.status-activo { color: #4caf50; font-weight: bold; }
.status-vencido { color: #f44336; font-weight: bold; }
.status-vendido { color: #ff9800; font-weight: bold; }

/* Estilos para los botones/íconos de Acción */
.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem; /* Tamaño de los íconos base */
    padding: 0.2rem; /* Espaciado alrededor del ícono clickeable */
    margin: 0 1px; /* Pequeño margen */
    transition: color 0.3s ease;
}

.action-btn:hover { color: #ff753a; }
.edit-btn { color: #615f5e; }
.delete-btn { color: #e57373; }

/* Estilo para mensajes de estado */
.status-message,.error-message {
    text-align: center;
    margin-top: 1.5rem; /* Reduce margen superior */
    font-size: 1rem; /* Tamaño de fuente base */
}
.error-message { color: red; font-weight: bold; }


/* --- Media Query para Móviles Grandes y Tablets pequeñas ( >= 600px ) --- */
@media (min-width: 600px) {
    .honeycomb-list-view {
        padding: 1.5rem; /* Aumenta padding general */
    }

    .content-container {
        padding: 1.5rem; /* Aumenta padding interno */
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #eaeaea;
    }

    h2 {
        font-size: 1.5rem; /* Aumenta tamaño de fuente h2 */
        margin-bottom: 1.2rem;
    }

    .controls {
        flex-direction: row; /* Controles en fila */
        justify-content: flex-start; /* Alinear a la izquierda */
        align-items: center;
        gap: 1rem; /* Espacio entre elementos en fila */
        margin-bottom: 1.2rem;
    }

    .search-box {
        width: 250px; /* Ancho fijo o ajusta según prefieras */
    }

     .search-input {
         font-size: 1rem;
     }


    .filter-btn {
        width: auto; /* Ancho automático */
        font-size: 1rem;
    }

    .honeycomb-table {
       min-width: 550px; /* Aumenta mínimo de tabla */
    }

    .honeycomb-table th,
    .honeycomb-table td {
        padding: 0.9rem;
        font-size: 0.9rem;
    }

    .honeycomb-table th {
        font-size: 0.8rem;
    }

    .action-btn {
        font-size: 1rem;
        padding: 0.2rem;
    }

     .status-message, .error-message {
         margin-top: 1.8rem;
         font-size: 1rem;
     }
}


/* --- Media Query para Tablets Grandes y Escritorios ( >= 768px ) --- */
@media (min-width: 768px) {
     .honeycomb-list-view {
        padding: 2rem; /* Aumenta padding general */
    }

    .content-container {
        padding: 2rem; /* Aumenta padding interno */
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #eaeaea; /* Borde más grueso */
        max-width: 1000px; /* Max-width típico para tablet/escritorio pequeño */
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .controls {
        gap: 1.5rem; /* Más espacio entre controles */
        margin-bottom: 1.5rem;
    }

    .search-box {
        width: 250px; /* Ancho estándar para búsqueda */
    }

    .search-input {
         font-size: 1rem;
     }

    .filter-btn {
        font-size: 1rem;
    }

    .honeycomb-table {
       min-width: 600px; /* Aumenta mínimo de tabla */
    }

    .honeycomb-table th,
    .honeycomb-table td {
        padding: 1rem; /* Padding estándar en celdas */
        font-size: 1rem;
    }

     .honeycomb-table th {
        font-size: 0.9rem;
    }

    .action-btn {
        font-size: 1.1rem; /* Tamaño de los íconos estándar */
        padding: 0.3rem;
        margin: 0 2px;
    }

    .status-message, .error-message {
         margin-top: 2rem;
         font-size: 1.1rem;
     }
}

/* --- Media Query para Escritorios Grandes ( >= 1024px ) --- */
@media (min-width: 1024px) {
     .honeycomb-list-view {
        padding: 2rem; /* Aumenta padding general */
        max-width: 100%; /* Permite que el content-container controle el ancho */
    }

    .content-container {
        padding: 2.5rem; /* Aumenta padding interno */
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #eaeaea;
        max-width: 1400px; /* Max-width típico para escritorio */
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 2rem;
    }

    .controls {
        gap: 2rem; /* Más espacio entre controles */
        margin-bottom: 2rem;
         /* Puedes justificar de forma diferente si es necesario, ej: space-between */
         /* justify-content: space-between; */
    }

     .search-box {
         width: 355px; /* Ancho un poco mayor para búsqueda */
     }

     .search-input {
         font-size: 1.1rem;
         padding: 0.75rem 1rem 0.75rem 2.5rem; /* Ajusta padding para ícono */
     }

    .search-icon {
        left: 12px; /* Ajusta posición de ícono */
        font-size: 1.1rem;
    }


    .filter-btn {
        font-size: 1.1rem;
        padding: 0.9rem 1.8rem;
    }

    .honeycomb-table {
       min-width: 700px; /* Aumenta mínimo de tabla */
    }

    .honeycomb-table th,
    .honeycomb-table td {
        padding: 1.2rem; /* Más padding en celdas */
        font-size: 1rem;
    }

     .honeycomb-table th {
        font-size: 0.9rem;
    }

    .action-btn {
        font-size: 1.2rem;
        padding: 0.4rem;
        margin: 0 3px;
    }

    .status-message, .error-message {
         margin-top: 2.5rem;
         font-size: 1.2rem;
     }
}


/* --- Media Query para Pantallas Ultra Grandes ( >= 2500px ) --- */
@media (min-width: 2500px) {
     .honeycomb-list-view {
        padding: 3rem; /* Mucho más padding general */
    }

    .content-container {
        padding: 3rem; /* Mucho más padding interno */
        border-radius: 16px; /* Bordes más redondeados */
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
        border: 3px solid #dcdcdc; /* Borde más grueso */
        max-width: 80%;
    }

    h2 {
        font-size: 1.5rem; /* Tamaño de fuente mucho más grande h2 */
        margin-bottom: 2.5rem;
    }

    .controls {
        gap: 2.5rem; /* Mucho más espacio entre controles */
        margin-bottom: 2.5rem;
        /* justify-content: flex-start; */ /* o ajusta según prefieras */
    }

    .search-box {
         width: 350px; /* Ancho considerable para búsqueda */
     }

    .search-input {
         font-size: 1.2rem;
         padding: 1rem 1.5rem 1rem 3rem; /* Aumenta padding para ícono grande */
         border-width: 2px;
    }

    .search-icon {
        left: 15px; /* Ajusta posición de ícono */
        font-size: 1.2rem;
    }

    .filter-btn {
        font-size: 1.2rem;
        padding: 1.2rem 2rem;
        border-radius: 8px;
    }


    .panales-list-container {
         box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
         border-radius: 12px;

         /* La tabla misma tiene width: 100%, así que si el contenedor es más estrecho, la tabla lo seguirá */
         /* Si quieres centrar la tabla dentro de un contenedor más amplio, puedes ponerle max-width y margin: auto a la tabla */
    }


    .honeycomb-table {
       min-width: 00px; /* Ancho mínimo considerable para tabla */
        /* Opcional: Limita el ancho máximo de la tabla si no quieres que ocupe el 70% del viewport */
        max-width: 1600px; /* Ejemplo: La tabla no será más ancha de 1600px */
        margin: 0 auto; /* Centra la tabla si tiene un max-width */
    }

    .honeycomb-table th,
    .honeycomb-table td {
        padding: 1.5rem 2rem; /* Mucho más padding en celdas */
        font-size: 1.1rem; /* Tamaño de fuente para celdas */
    }

     .honeycomb-table th {
        font-size: 1rem; /* Tamaño de fuente para encabezados */
        padding: 1.2rem 2rem;
    }


    .action-btn {
        font-size: 1.4rem; /* Tamaño de los íconos grande */
        padding: 0.5rem;
        margin: 0 4px;
    }

     .status-message, .error-message {
         margin-top: 3rem;
         font-size: 1.4rem;
     }
}
</style>
