<template>
    <div class="report-container">
      <h2>Reporte de Panales</h2>
  
      <div id="reportContent">
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
              <th>Eliminado?</th> </tr>
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
              <td>{{ panal.isDeleted ? 'Sí' : 'No' }}</td>
            </tr>
            <tr v-if="reportPanales.length === 0 && !panalesStore.loading">
               <td colspan="9">No hay datos de panales para mostrar en el reporte.</td>
            </tr>
          </tbody>
        </table>
        </div>
  
      <button @click="downloadReport">Descargar Reporte PDF</button>
  
      <p v-if="panalesStore.loading">Cargando datos del reporte...</p>
      <p v-if="panalesStore.error">{{ panalesStore.error }}</p>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { usePanalesStore } from '@/stores/panalesStore';
  import html2pdf from 'html2pdf.js'; // Importa la librería
  
  const panalesStore = usePanalesStore();
  const reportPanales = ref([]);
  
  onMounted(async () => {
      // Cargar todos los panales del usuario para el reporte
      try {
         reportPanales.value = await panalesStore.fetchPanalesForReport();
      } catch (err) {
         console.error('Error al cargar datos para reporte:', err);
         // El error ya se maneja en el store y se muestra en la UI
      }
  });
  
  const downloadReport = () => {
    const element = document.getElementById('reportContent'); // Obtiene el elemento HTML que contiene el reporte
    const opt = {
      margin:       10,
      filename:     `reporte_panales_${new Date().toISOString().split('T')[0]}.pdf`, // Nombre del archivo PDF
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 }, // Escala para mejorar la resolución
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } // Configuración del PDF (milímetros, A4, vertical)
    };
  
    // Usa html2pdf para generar y descargar el PDF
    html2pdf().from(element).set(opt).save();
  };
  </script>
  
  <style scoped>
  /* Estilos para tu tabla y reporte */
  .report-container {
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 1000px;
      margin: 20px auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  </style>