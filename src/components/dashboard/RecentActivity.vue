<template>
  <div class="recent-activity">
    <h3 class="titulo-centrado">Actividad Reciente</h3>

    <!-- Vista tipo tabla para pantallas grandes -->
    <div class="tabla-responsive desktop-only">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in actividades" :key="index">
            <td>{{ item.id }}</td>
            <td>{{ item.tipo }}</td>
            <td>{{ item.fecha }}</td>
            <td>
              <span :class="['badge', item.resultado === 'Calidad AA' ? 'success' : 'error']">
                {{ item.resultado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista tipo tarjetas para móviles -->
    <div class="mobile-only">
      <div class="card-actividad" v-for="(item, index) in actividades" :key="'mobile-' + index">
        <p><strong>ID:</strong> {{ item.id }}</p>
        <p><strong>Tipo:</strong> {{ item.tipo }}</p>
        <p><strong>Fecha:</strong> {{ item.fecha }}</p>
        <p>
          <strong>Resultado:</strong>
          <span :class="['badge', item.resultado === 'Calidad AA' ? 'success' : 'error']">
            {{ item.resultado }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const actividades = [
  { id: '#001', tipo: 'Análisis Interno', fecha: '2023-11-15', resultado: 'Calidad AA' },
  { id: '#002', tipo: 'Análisis Externo', fecha: '2023-11-15', resultado: 'Grieta detectada' },
  { id: '#003', tipo: 'Análisis Interno', fecha: '2023-11-15', resultado: 'Calidad AA' },
]
</script>

<style scoped>
.recent-activity {
  width: 100%;
  background: white;
  margin: 0rem auto; /* Centra el componente si el contenedor padre es más ancho */
  border-radius: 8px;
  padding: 1.5rem; /* Padding base */
  box-shadow: 0 2px 10px rgba(178, 47, 47, 0.05);
  border: 2px solid #bbb8b8;

}

.titulo-centrado {
  text-align: center;
  margin-top: 0;
  margin-bottom: 2rem;
  color: #080808;
  font-size: 1.2rem; /* Tamaño de fuente base para el título */
}

.tabla-responsive {
  overflow-x: auto; /* Permite scroll horizontal si la tabla es muy ancha */
}

table {
  width: 100%;
  min-width: 600px; /* Ancho mínimo base de la tabla */
  border-collapse: collapse;
}

th,td {
  color: black;
  padding: 0.75rem; /* Padding base para celdas */
  text-align: left;
  border-bottom: 1px solid #dfd9d9; /* Línea divisoria entre filas */
}

th {
  color:  #ff753a;
  text-transform: uppercase;
  font-size: 0.9rem; /* Tamaño de fuente base para encabezados de tabla */
}

.card-actividad {
  /* Estilos para la vista móvil, si aplica */
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-actividad p {
  margin: 0.5rem 0;
}

/* Badges */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge.success {
  background-color: #d4edda;
  color: #155724;
}

.badge.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* === Responsive Helpers === */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Responsive desde 0 hasta 768px */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}

/* --- ESTILOS PARA PANTALLAS ULTRA GRANDES (2500px Y MÁS) --- */
@media (min-width: 2500px) {
  .recent-activity {
    padding: 2rem 4rem; /* Aumenta el padding general del componente */
  }

  .titulo-centrado {
    font-size: 2rem; /* Aumenta considerablemente el tamaño del título */
    margin-bottom: 2.5rem; /* Un poco más de espacio debajo del título */
  }
  th,td {
    font-size: 1.2rem; /* Aumenta el tamaño de fuente del contenido de la tabla */
    padding: 1rem 1.5rem; /* Aumenta el padding en las celdas para más espaciado */
  }

  th {
    font-size: 1rem; /* Aumenta un poco el tamaño de los encabezados de tabla también */
  }

  .badge {
    font-size: 0.9rem; /* Podrías hacer los badges un poco más grandes también */
    padding: 0.3rem 0.6rem;
  }
}
</style>
