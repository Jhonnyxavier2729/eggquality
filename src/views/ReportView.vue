<template>
  <div class="report-container" :class="{ 'sidebar-hidden': !isSidebarOpen }">
    <h2>Reporte de Panales</h2>

    <div class="filter-controls">
      <div class="filter-group">
        <label for="filterEstado">Estado:</label>
        <select id="filterEstado" v-model="selectedEstado">
          <option value="Todos">Todos los Estados</option>
          <option value="Activo">Activo</option>
          <option value="Vencido">Vencido</option>
          <option value="Vendido">Vendido</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filterTipoHuevo">Tipo Huevo:</label>
        <select id="filterTipoHuevo" v-model="selectedTipoHuevo">
          <option value="Todos">Todos los Tipos</option>
          <option value="B">B</option>
          <option value="A">A</option>
          <option value="AA">AA</option>
          <option value="AAA">AAA</option>
          <option value="Yumbo">Yumbo</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filterInicioStart">Fecha Inicio Desde:</label>
        <input type="date" id="filterInicioStart" v-model="fechaInicioStart" />
      </div>

      <div class="filter-group">
        <label for="filterInicioEnd">Hasta:</label>
        <input type="date" id="filterInicioEnd" v-model="fechaInicioEnd" />
      </div>

      <button @click="loadReport" class="apply-filters-btn" :disabled="reportLoading">
        Aplicar Filtros
      </button>
    </div>

    <div v-if="reportLoading" class="loading-indicator">
      <font-awesome-icon :icon="['fas', 'egg']" size="3x" class="egg-spinner" />
      <p>Cargando resultados...</p>
    </div>

    <div id="reportContent" v-if="!reportLoading && reportPanales.length > 0">
      <h3>Datos de Panales</h3>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID Panal</th>
              <th>Tipo Huevo</th>
              <th>Cantidad Huevos</th>
              <th>Cantidad Panales</th>
              <th>Galpón/Lote</th>
              <th>Fecha Inicio</th>
              <th>Fecha Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="panal in reportPanales" :key="panal.id">
              <td data-label="ID Panal">{{ panal.idPanal }}</td>
              <td data-label="Tipo Huevo">{{ panal.tipoHuevo }}</td>
              <td data-label="Cantidad Huevos">{{ panal.cantidadHuevos }}</td>
              <td data-label="Cantidad Panales">{{ panal.cantidadPanales }}</td>
              <td data-label="Galpón/Lote">{{ panal.galponLote }}</td>
              <td data-label="Fecha Inicio">{{ panal.fechaInicio }}</td>
              <td data-label="Fecha Vencimiento">{{ panal.fechaVencimiento }}</td>
              <td data-label="Estado">{{ panal.estado }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-else-if="!reportLoading && reportPanales.length === 0 && !panalesStore.error">
      No hay datos de panales que coincidan con los filtros seleccionados.
    </p>

    <div class="download-btn-container">
      <button
        @click="downloadReport"
        :disabled="
          reportPanales.length === 0 || reportLoading || panalesStore.loading || panalesStore.error
        "
        class="download-report-btn"
      >
        <font-awesome-icon :icon="['fas', 'file-pdf']" class="icon" />
        <span>Descargar Reporte</span>
      </button>
    </div>

    <p v-if="panalesStore.error" class="error-message">{{ panalesStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePanalesStore } from '@/stores/panalesStore'
import html2pdf from 'html2pdf.js'

const panalesStore = usePanalesStore()
const reportPanales = ref([])
const reportLoading = ref(false)

const selectedEstado = ref('Todos')
const selectedTipoHuevo = ref('Todos')
const fechaInicioStart = ref('')
const fechaInicioEnd = ref('')

const loadReport = async () => {
  reportLoading.value = true

  const filters = {
    estado: selectedEstado.value !== 'Todos' ? selectedEstado.value : undefined,
    tipoHuevo: selectedTipoHuevo.value !== 'Todos' ? selectedTipoHuevo.value : undefined,
    fechaInicioStart: fechaInicioStart.value || undefined,
    fechaInicioEnd: fechaInicioEnd.value || undefined,
  }

  try {
    reportPanales.value = await panalesStore.fetchPanalesForReport(filters)
  } catch (err) {
    console.error('Error al cargar reporte:', err)
  } finally {
    reportLoading.value = false
  }
}

onMounted(() => {
  loadReport()
})

const downloadReport = () => {
  const element = document.getElementById('reportContent')
  const opt = {
    margin: 10,
    filename: `reporte_panales_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf().from(element).set(opt).save()
}
</script>

<style scoped>
/* --- ESTILOS BASE (Mobile-First) --- */
.report-container {
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 1rem auto;
  position: relative;
  min-height: 300px;
}

.report-container h2 {
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 2rem;
  color: #050303;
  margin-bottom: 3rem;
  display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
  width: 50%; /* Mantén tu ancho deseado para el bloque del título */
  text-align: center; /* Centra el texto dentro del h2 */
  margin-left: auto; /* Centra el h2 horizontalmente */
  margin-right: auto; /* Centra el h2 horizontalmente */
  max-width: 600px;
}

.report-container h3 {
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

/* --- Filtros en Móvil --- */
.filter-controls {
  display: flex;
  flex-direction: column; /* Apilados verticalmente */
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-controls label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}

.filter-controls select,
.filter-controls input[type='date'] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.apply-filters-btn,
.download-report-btn {
  padding: 12px 15px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%; /* Ocupan todo el ancho en móvil */
}

.apply-filters-btn:hover,
.download-report-btn:hover {
  background-color: #ff5c1a;
  transform: translateY(-2px);
}

.apply-filters-btn:disabled,
.download-report-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.download-report-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-report-btn .icon {
  margin-right: 8px;
}

/* Contenedor para el botón de descarga para controlarlo mejor */
.download-btn-container {
  display: flex;
  justify-content: center; /* Centrado en móvil */
  margin-top: 20px;
}

/* --- Magia para la Tabla Responsiva en Móvil --- */
.table-wrapper {
  overflow-x: auto; /* Fallback por si acaso */
}

table {
  width: 100%;
  border: none;
  border-collapse: collapse;
}

table thead {
  /* Ocultamos los encabezados, se mostrarán en cada celda */
  display: none;
}

table tr {
  display: block; /* Cada fila es un bloque/tarjeta */
  margin-bottom: 1rem;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
}

table td {
  display: block; /* Las celdas se apilan */
  text-align: right; /* Alineamos el dato a la derecha */
  padding: 8px 0;
  border-bottom: 1px dotted #ccc;
  font-size: 0.9rem;
}

table td:last-child {
  border-bottom: none; /* La última celda de una tarjeta no tiene borde inferior */
}

table td::before {
  /* Usamos el atributo data-label para mostrar el encabezado */
  content: attr(data-label);
  float: left; /* Lo alineamos a la izquierda */
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #333;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
  font-size: 1.2rem;
  color: #555;
}

.egg-spinner {
  animation: spin 2s linear infinite;
  color: #ff753a;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@media(max-width: 600px) {
  .report-container h2 {
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  color: #050303;
  margin-bottom: 3rem;
  display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
  width: 90%; /* Mantén tu ancho deseado para el bloque del título */
  text-align: center; /* Centra el texto dentro del h2 */
  margin-left: auto; /* Centra el h2 horizontalmente */
  margin-right: auto; /* Centra el h2 horizontalmente */
  max-width: 600px;
}
}

/* --- Media Query para Tablets (>= 768px) --- */
@media (min-width: 768px) {
  .report-container {
    padding: 1.5rem;
  }

  .report-container h2 {
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 2rem;
  color: #050303;
  margin-bottom: 3rem;
  display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
  width: 50%; /* Mantén tu ancho deseado para el bloque del título */
  text-align: center; /* Centra el texto dentro del h2 */
  margin-left: auto; /* Centra el h2 horizontalmente */
  margin-right: auto; /* Centra el h2 horizontalmente */
  max-width: 600px;
}
  /* Devolvemos los filtros a una fila */
  .filter-controls {
    flex-direction: row;
    flex-wrap: wrap; /* Permite que los elementos salten de línea si no caben */
    align-items: flex-end; /* Alinea los elementos en la parte inferior */
    gap: 1rem;
  }

  .filter-group {
    flex: 1 1 100px; /* Crecen, se encogen, con una base de 180px */
  }

  .apply-filters-btn {
    flex-grow: 0; /* No crece */
    width: auto; /* Ancho automático */
    align-self: flex-end; /* Se alinea con los inputs */
  }

  /* Devolvemos la tabla a su estado normal */
  table {
    border: 1px solid #ddd;
  }

  table thead {
    display: table-header-group; /* Mostramos los encabezados de nuevo */
  }

  table tr {
    display: table-row; /* Las filas vuelven a ser filas */
    box-shadow: none;
    border: none;
    padding: 0;
    margin: 0;
  }

  table td {
    display: table-cell; /* Las celdas vuelven a ser celdas */
    text-align: left; /* Alineación por defecto */
    border: 1px solid #ddd;
    padding: 10px;
    border-bottom: none; /* Quitamos la regla de móvil */
  }

  table td::before {
    display: none; /* Ocultamos los pseudo-elementos */
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
    padding: 12px;
    border: 1px solid #ddd;
  }

  .download-btn-container {
    justify-content: center;
    margin-top: 20px;
  }
  .download-report-btn {
    width: auto;
    max-width: 200px; /* <---para limitar el ancho */
  }
}
/* ... Tus estilos existentes ... */

/* --- Media Query para Escritorios (>= 1024px) --- */
@media (min-width: 1024px) {
  .report-container {
    padding: 2rem;
    max-width: 1300px; /* Un ancho máximo generoso para pantallas grandes */
    margin: 2rem 2rem 1rem 280px;
    transition: margin-left 0.35s ease-in-out;
  }
  .report-container.sidebar-hidden {

    /* El contenedor se ensancha hacia la izquierda al reducir su margen. */
    margin-left: 2rem;
  }
  .filter-controls {
    gap: 1.5rem;
  }

  .download-btn-container {
    justify-content: center;
    margin-top: 20px;
  }

  .download-report-btn {
    width: auto;
    max-width: 200px;
  }
}
</style>
