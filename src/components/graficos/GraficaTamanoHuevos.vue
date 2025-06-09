<template>
  <div class="egg-size-container form-container">
    <h2>{{ eggSizeData.titulo }}</h2>
    <p class="text-info">{{ eggSizeData.textoNormativa }}</p>
    <p v-if="eggSizeData.normativaFuente" class="text-source">
      Fuente: {{ eggSizeData.normativaFuente }}
    </p>

    <div class="chart-type-selector">
      <button
        @click="setChartType('BarVertical')"
        :class="{ 'active': currentChartType === 'BarVertical' }"
        class="chart-type-button"
      >
        Barras Verticales
      </button>
      <button
        @click="setChartType('BarHorizontal')"
        :class="{ 'active': currentChartType === 'BarHorizontal' }"
        class="chart-type-button"
      >
        Barras Horizontales
      </button>
    </div>

    <div v-if="chartData.labels.length > 0" class="chart-wrapper">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="no-data-message">
      No hay datos de tamaño de huevos disponibles.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

// Registrar los elementos necesarios para el gráfico de barras
ChartJS.register(
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
)

// Estado para controlar el tipo de gráfico actual (horizontal o vertical)
// *** CAMBIO AQUÍ: Inicia con gráfico de barras vertical ***
const currentChartType = ref('BarVertical');

// Función para cambiar el tipo de gráfico
const setChartType = (type) => {
  currentChartType.value = type;
  updateChartOptions(); // Actualiza las opciones del gráfico
};

const eggSizeData = ref({
  titulo: 'Clasificación de Huevos por Tamaño (Colombia)',
  textoNormativa: 'Según la normativa colombiana Icontec NTC 1240:2011, los huevos se clasifican por su peso en gramos, lo que determina su tamaño. Esto asegura un estándar de calidad y presentación en el mercado. Las categorías comunes incluyen Jumbo, AAA, AA, A, B y C.',
  normativaFuente: 'Normativa vigente Icontec NTC 1240:2011',
  datosGrafica: []
})

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Rango de Peso (gramos)',
    data: [],
    backgroundColor: [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)'
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
  }]
})

// Opciones de gráfico que se ajustarán dinámicamente
const chartOptions = ref({});

// Función para actualizar las opciones del gráfico según el tipo
const updateChartOptions = () => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Clasificación de Huevos por Tamaño (Peso en Gramos)' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = eggSizeData.value.datosGrafica[context.dataIndex];
            if (item) {
              if (item.tamano === 'JUMBO') {
                return `Peso: > ${item.pesoMinGr} gramos`;
              } else if (item.tamano === 'C') {
                return `Peso: < ${item.pesoMaxGr} gramos`;
              }
              return `Peso: ${item.pesoMinGr} - ${item.pesoMaxGr} gramos`;
            }
            return context.label;
          }
        }
      }
    },
    scales: {
      // Las escalas se definirán dinámicamente
    }
  };

  if (currentChartType.value === 'BarHorizontal') {
    baseOptions.indexAxis = 'y'; // Barras horizontales
    baseOptions.scales = {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Peso (gramos)' }
      },
      y: {
        title: { display: true, text: 'Tamaño' }
      }
    };
  } else if (currentChartType.value === 'BarVertical') {
    baseOptions.indexAxis = 'x'; // Barras verticales (por defecto, pero explícito)
    baseOptions.scales = {
      x: {
        title: { display: true, text: 'Tamaño' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Peso (gramos)' }
      }
    };
  }
  chartOptions.value = baseOptions;
};

const fetchEggSizeData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tamanoHuevos'));

    const loadedData = [];
    querySnapshot.forEach((doc) => {
      loadedData.push({
        tamano: doc.id,
        ...doc.data()
      });
    });

    const order = ['JUMBO', 'AAA', 'AA', 'A', 'B', 'C'];
    loadedData.sort((a, b) => order.indexOf(a.tamano) - order.indexOf(b.tamano));

    eggSizeData.value.datosGrafica = loadedData;

    chartData.value.labels = eggSizeData.value.datosGrafica.map(d => d.tamano);

    chartData.value.datasets[0].data = eggSizeData.value.datosGrafica.map(d => {
      if (d.tamano === 'JUMBO') return 80;
      if (d.tamano === 'C') return d.pesoMaxGr;
      return d.pesoMaxGr;
    });

    if (chartData.value.datasets[0].backgroundColor.length < loadedData.length) {
      console.warn("Advertencia: No hay suficientes colores definidos para todas las categorías de huevos en la gráfica.");
    }

  } catch (error) {
    console.error("Error al obtener datos de tamaño de huevos desde Firestore:", error);
    eggSizeData.value.titulo = 'Error al cargar información de tamaño de huevos';
    eggSizeData.value.textoNormativa = `Detalle del error: ${error.message}`;
  } finally {
    updateChartOptions();
  }
}

onMounted(() => {
  fetchEggSizeData();
});
</script>

<style scoped>
/* Tus estilos CSS se mantienen igual */
.egg-size-container {
  width: 100%;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee9e7;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

.text-info {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 1rem;
}

.text-source {
  font-size: 0.9rem;
  color: #777;
  font-style: italic;
  margin-bottom: 1.5rem;
}

.chart-type-selector {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 10px;
}

.chart-type-button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f0f0f0;
  cursor: pointer;
  font-weight: bold;
  color: #555;
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

.chart-type-button:hover {
  background-color: #e0e0e0;
}

.chart-type-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.chart-wrapper {
  width: 100%;
  max-width: 600px; /* Limita el ancho de esta gráfica */
  height: 350px; /* Altura fija para la gráfica de tamaños */
  margin-top: 1rem;
}

.no-data-message {
  padding: 1rem;
  border-radius: 8px;
  background-color: #fffde7;
  color: #fbc02d;
  width: 100%;
  text-align: center;
}
</style>