<template>
  <div class="chart-container form-container">
    <h2>Precios de Huevos por Ciudad y Tipo</h2>
    <div class="dashboard-header">
      <p>
       Analizamos el comportamiento de los precios del huevo en el canal mayorista-consumidor a nivel nacional.
      <br>
      <span class="text-fuente-dane">Fuente: DANE.</span>
      </p>
    </div>

    <div class="filters-panel">
      <div class="form-group">
        <label for="eggTypeSelector">Tipo de Huevo</label>
        <select
          id="eggTypeSelector"
          v-model="selectedEggType"
          class="form-input"
          required
          :class="{ 'is-invalid': formErrors.selectedEggType }"
        >
          <option v-for="eggType in availableEggTypes" :key="eggType" :value="eggType">
            {{ eggType }}
          </option>
        </select>
        <div v-if="formErrors.selectedEggType" class="field-error-message">{{ formErrors.selectedEggType }}</div>
      </div>
    </div>

    <div v-if="loadingPrices" class="loading-message">Cargando precios...</div>
    <div v-if="errorPrices" class="error-message">{{ errorPrices }}</div>

    <div v-if="!loadingPrices && !errorPrices && chartData.labels.length > 0" class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else-if="!loadingPrices && !errorPrices" class="no-data-message">
      No hay datos disponibles para la gráfica de precios. Selecciona un tipo de huevo.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale, BarElement
} from 'chart.js'
import 'chartjs-adapter-date-fns';

import { db } from '@/firebase/config';
import { collection, query, orderBy, getDocs, documentId } from 'firebase/firestore';

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale, TimeScale, BarElement
)

const loadingPrices = ref(false)
const errorPrices = ref(null)

const chartData = ref({
  labels: [],
  datasets: []
})

// Vuelve a ser una cadena para selección única
const selectedEggType = ref('');
const formErrors = ref({
  selectedEggType: ''
});

// ! IMPORTANTE: Esta es la lista FINAL de tipos de huevo que se mostrarán en el dropdown.
// Asegúrate de que estos nombres coincidan EXACTAMENTE con las claves en tus documentos de Firestore.
const availableEggTypes = ref([
  'Huevo rojo A',
  'Huevo rojo AA',
  'Huevo rojo B',
  'Huevo rojo extra',
]);

// ! IMPORTANTE: Esta es la lista FINAL de ciudades para las que buscarás datos.
// Asegúrate de que estos nombres coincidan EXACTamente con las claves en tus documentos de Firestore.
const CITIES_TO_DISPLAY = [
  "Armenia, Mercar",
  "Bogotá, D.C., Corabastos",
  "Bogotá, D.C., Paloquemao",
  "Cali, Siloé",
  "Medellín, Central Mayorista de Antioquia",
];

const getColor = (index) => {
  const colors = [
    'rgba(255, 99, 132, 1)', // Rojo
    'rgba(54, 162, 235, 1)', // Azul
    'rgba(255, 206, 86, 1)', // Amarillo
    'rgba(75, 192, 192, 1)', // Turquesa
    'rgba(153, 102, 255, 1)', // Morado
    'rgba(255, 159, 64, 1)', // Naranja
    'rgba(199, 199, 199, 1)', // Gris
    'rgba(83, 102, 255, 1)', // Azul claro
    'rgba(10, 200, 50, 1)', // Verde lima
    'rgba(200, 10, 150, 1)' // Magenta
  ];
  return colors[index % colors.length];
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Variación Mensual de Precios de Huevo por Ciudad' },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'category',
      title: { display: true, text: 'Mes y Año' },
      grid: {
        drawOnChartArea: false,
      }
    },
    y: {
      title: { display: true, text: 'Precio Promedio ($)' },
      beginAtZero: false,
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
        }
      }
    }
  }
}

const fetchEggPrices = async () => {
  loadingPrices.value = true
  errorPrices.value = null
  chartData.value.labels = []
  chartData.value.datasets = []
  formErrors.value.selectedEggType = ''; // Limpiar errores al intentar cargar

  if (!selectedEggType.value) {
    formErrors.value.selectedEggType = 'Por favor, selecciona un tipo de huevo.';
    loadingPrices.value = false;
    chartData.value.labels = [];
    chartData.value.datasets = [];
    return;
  }

  try {
    const eggPricesCollection = collection(db, 'eggPrices');
    const q = query(eggPricesCollection, orderBy(documentId(), 'asc'));
    const querySnapshot = await getDocs(q);

    const allMonthlyData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.datosPorCiudad && data.mesAnio) {
        allMonthlyData.push({
          docId: doc.id,
          mesAnio: data.mesAnio,
          datosPorCiudad: data.datosPorCiudad
        });
      }
    });

    console.log("Datos mensuales obtenidos de Firestore:", allMonthlyData);

    if (allMonthlyData.length === 0) {
      console.warn("No hay datos de precios disponibles en la colección 'eggPrices'.");
      return;
    }

    chartData.value.labels = allMonthlyData.map(d => d.mesAnio);
    console.log("Labels para el eje X:", chartData.value.labels);

    const datasetsMap = new Map();

    CITIES_TO_DISPLAY.forEach(city => {
      datasetsMap.set(city, {
        label: city,
        data: [],
        borderColor: '',
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 7,
      });
    });

    allMonthlyData.forEach(monthDoc => {
      CITIES_TO_DISPLAY.forEach(city => {
        const dataset = datasetsMap.get(city);
        if (dataset) {
          let priceForCityAndEggType = null;
          const cityData = monthDoc.datosPorCiudad[city];

          if (cityData) {
            // Ahora se espera un solo tipo de huevo seleccionado (selectedEggType.value)
            if (cityData[selectedEggType.value] !== undefined && typeof cityData[selectedEggType.value] === 'number') {
              priceForCityAndEggType = cityData[selectedEggType.value];
            } else {
              console.warn(`Tipo de huevo "${selectedEggType.value}" no encontrado o no es un número en "${city}" para el mes "${monthDoc.mesAnio}".`);
            }
          } else {
            console.warn(`Datos para la ciudad "${city}" no encontrados en el documento del mes "${monthDoc.mesAnio}".`);
          }
          dataset.data.push(priceForCityAndEggType);
        }
      });
    });

    console.log("Datasets antes de filtrar (con nulls):", Array.from(datasetsMap.values()));

    let colorIndex = 0;
    datasetsMap.forEach((dataset) => {
      if (dataset.data.some(price => price !== null)) {
        dataset.borderColor = getColor(colorIndex++);
        chartData.value.datasets.push(dataset);
      } else {
        console.warn(`Dataset para "${dataset.label}" no se añadirá porque no tiene datos válidos.`);
      }
    });

    console.log("Chart Data final:", chartData.value);

  } catch (error) {
    console.error("Error al obtener precios de huevos desde Firestore:", error);
    errorPrices.value = `Error al cargar los datos: ${error.message}`;
  } finally {
    loadingPrices.value = false;
  }
};

watch(selectedEggType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchEggPrices();
  }
});

onMounted(() => {
  // *** CAMBIO CLAVE AQUÍ: Preseleccionar "Huevo rojo AA" ***
  selectedEggType.value = 'Huevo rojo AA';
  // Llama a fetchEggPrices para cargar la gráfica con el tipo predeterminado
  fetchEggPrices();
});
</script>

<style scoped>
/* Estilos generales (que ya tienes y se aplican por defecto) */
.chart-container {
  width: 100%; /* Ocupa el ancho completo de su padre (.graficas-contenedor) */
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee9e7;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center; /* Centra el contenido horizontalmente dentro de la tarjeta */
}

/* Título principal de la gráfica (h2) */
.chart-container h2 { /* Selector más específico para evitar conflictos */
  width: 95%;
  text-align: center;
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 2rem; /* Tamaño base para pantallas grandes */
  color: #050303;
  margin-bottom: 3rem;
  box-sizing: border-box; /* Asegura que padding y border se incluyan en el 95% del ancho */
}

/* Header descriptivo (dashboard-header) */
.dashboard-header {
  width: 98%;
  max-width: 1600px;
  text-align: left;
  margin-bottom: 1rem;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}

.text-fuente-dane {
  color: #777;
  font-style: italic;
}

/* Panel de filtros */
.filters-panel {
  width: 100%; /* Ocupa todo el ancho del chart-container */
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column; /* Por defecto apila los elementos (para móviles) */
  align-items: flex-start;
  gap: 0.8rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%; /* Ocupa todo el ancho dentro del filters-panel */
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #fff;
  cursor: pointer;
  box-sizing: border-box; /* Importante para que el padding no desborde el 100% de width */
}

.form-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

/* Mensajes de estado */
.loading-message, .error-message, .no-data-message {
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.loading-message {
  background-color: #e0f7fa;
  color: #007bb6;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
}

.no-data-message {
  background-color: #fffde7;
  color: #fbc02d;
}

/* Contenedor del gráfico Line */
.chart-wrapper {
  width: 100%; /* Ocupa todo el ancho disponible en el .chart-container */
  height: 450px; /* Altura base para pantallas grandes */
  margin-top: 1.5rem;
  /* La gráfica de Chart.js dentro se adaptará automáticamente a este tamaño */
}

/* Pantallas muy pequeñas (ej. móviles en vertical, hasta 767px) */
@media (max-width: 767px) {
  .chart-container {
    padding: 1rem; /* Reduce el padding de la tarjeta */
    gap: 1rem; /* Reduce el espacio entre elementos */
  }

  .chart-container h2 {
    font-size: 1rem; /* Título más pequeño para móviles */
    padding: 0.8rem 1rem;
    width: 98%; /* Puede ocupar más ancho en móviles */
    border-left-width: 4px;
    border-right-width: 4px;
    margin-bottom: 1.5rem; /* Reduce el margen inferior */
  }

  .dashboard-header p {
    font-size: 0.95rem; /* Texto más pequeño */
  }

  .filters-panel {
    padding: 0.8rem; /* Reduce el padding del panel de filtros */
    gap: 0.6rem;
  }

  .form-group label {
    font-size: 0.9rem; /* Etiquetas más pequeñas */
  }

  .form-input {
    padding: 0.6rem; /* Reduce el padding del input/select */
    font-size: 0.9rem;
  }

  .chart-wrapper {
    height: 300px; /* Altura de la gráfica reducida para móviles */
    margin-top: 1rem;
  }
}

/* Pantallas medianas (tabletas, 768px a 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .chart-container {
    padding: 1.5rem;
    gap: 1.2rem;
  }

  .chart-container h2 {
    font-size: 1.8rem;
    padding: 0.9rem 1.5rem;
    margin-bottom: 2rem;
  }

  .dashboard-header p {
    font-size: 1rem;
  }

  .filters-panel {
    flex-direction: row; /* En tabletas, los filtros pueden ir en fila */
    justify-content: space-around; /* Distribuye el espacio entre ellos */
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .form-group {
    width: auto; /* Permite que los grupos de formulario ajusten su ancho */
    flex-grow: 1; /* Permite que crezcan para ocupar el espacio */
  }

  .form-input {
    min-width: 150px; /* Asegura un ancho mínimo para el select */
  }

  .chart-wrapper {
    height: 380px; /* Altura intermedia para tabletas */
    margin-top: 1.2rem;
  }
}

/* Pantallas grandes (escritorio, > 1024px) - Mantienen tus estilos base */
/* No es necesario un media query específico si los estilos base ya son para escritorio */
</style>
