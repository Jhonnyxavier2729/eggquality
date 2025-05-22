<template>
  <div class="report-container">
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
          <option value="YUMBO">YUMBO</option>
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

      <button @click="loadReport" class="apply-filters-btn" :disabled="reportLoading">Aplicar Filtros</button>
    </div>

    <div v-if="reportLoading" class="loading-indicator">
      <font-awesome-icon :icon="['fas', 'egg']" size="3x" class="egg-spinner" />
      <p>Cargando resultados...</p>
    </div>

    <div id="reportContent" v-if="!reportLoading && reportPanales.length > 0">
      <h3>Datos de Panales del Usuario</h3>
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
            <td>{{ panal.idPanal }}</td>
            <td>{{ panal.tipoHuevo }}</td>
            <td>{{ panal.cantidadHuevos }}</td>
            <td>{{ panal.cantidadPanales }}</td>
            <td>{{ panal.galponLote }}</td>
            <td>{{ panal.fechaInicio }}</td>
            <td>{{ panal.fechaVencimiento }}</td>
            <td>{{ panal.estado }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="!reportLoading && reportPanales.length === 0 && !panalesStore.error">
      No hay datos de panales que coincidan con los filtros seleccionados.
    </p>

    <button
      @click="downloadReport"
      :disabled="reportPanales.length === 0 || reportLoading || panalesStore.loading || panalesStore.error"
      class="download-report-btn"
    >
      <font-awesome-icon :icon="['fas', 'file-pdf']" class="icon" />
      <span>Descargar Reporte</span>
    </button>

    <p v-if="panalesStore.error" class="error-message">{{ panalesStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePanalesStore } from '@/stores/panalesStore';
import html2pdf from 'html2pdf.js';

const panalesStore = usePanalesStore();
const reportPanales = ref([]);
const reportLoading = ref(false);

const selectedEstado = ref('Todos');
const selectedTipoHuevo = ref('Todos');
const fechaInicioStart = ref('');
const fechaInicioEnd = ref('');

const loadReport = async () => {
  reportLoading.value = true;

  const filters = {
    estado: selectedEstado.value !== 'Todos' ? selectedEstado.value : undefined,
    tipoHuevo: selectedTipoHuevo.value !== 'Todos' ? selectedTipoHuevo.value : undefined,
    fechaInicioStart: fechaInicioStart.value || undefined,
    fechaInicioEnd: fechaInicioEnd.value || undefined
  };

  try {
    reportPanales.value = await panalesStore.fetchPanalesForReport(filters);
  } catch (err) {
    console.error('Error al cargar reporte:', err);
  } finally {
    reportLoading.value = false;
  }
};

onMounted(() => {
  loadReport();
});

const downloadReport = () => {
  const element = document.getElementById('reportContent');
  const opt = {
    margin: 10,
    filename: `reporte_panales_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
};
</script>

<style scoped>
.report-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 20px auto;
  position: relative;
  min-height: 300px;
}

.report-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

.report-container h3 {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
}

.filter-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
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
.filter-controls input[type="date"],
.filter-controls input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.apply-filters-btn,
.download-report-btn {
  padding: 10px 15px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.apply-filters-btn:hover,
.download-report-btn:hover {
  background-color: #ff5c1a;
}

.apply-filters-btn:disabled,
.download-report-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.download-report-btn {
  display: block;
  margin: 20px auto;
}

.download-report-btn .icon {
  margin-right: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  font-size: 0.9rem;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
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
</style>
