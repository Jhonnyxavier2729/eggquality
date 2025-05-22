<template>
  <div :class="['analysis-view', { 'shifted-left': !isSidebarOpen }]">
    <!-- Contenedor principal -->
    <div class="content-container">
      <h2 class="titulo-centrado">Análisis de Huevos</h2>

      <div class="action-bar">
        <button class="primary-btn" @click="startNewAnalysis">
          <span>➕</span> Nuevo Análisis
        </button>
      </div>

      <!-- Contenedor para el formulario y las tarjetas -->
      <div class="analysis-form" v-if="showForm">
        <!-- Formulario de análisis -->
        <div class="form-group">
          <label>Tipo de Análisis</label>
          <select v-model="analysisType">
            <option value="interno">Interno</option>
            <option value="externo">Externo</option>
          </select>
        </div>

        <button class="submit-btn" @click="submitAnalysis">Enviar</button>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <h4>Análisis Hoy</h4>
          <div class="value">8</div>
        </div>
        <div class="stat-card">
          <h4>Calidad Promedio</h4>
          <div class="value">AA</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

// Inyecta el estado del sidebar proporcionado por SidebarMenu.vue
const isSidebarOpen = inject('isSidebarOpen', ref(true)) // Valor predeterminado: true


const showForm = ref(false)
const analysisType = ref('interno')

const startNewAnalysis = () => {
  showForm.value = true
}

const submitAnalysis = () => {
  // Lógica para enviar análisis
  showForm.value = false
}
</script>

<style scoped>
/* --- ESTILOS BASE (para móviles pequeños hasta ~768px) --- */
/* Estos estilos se aplican por defecto y sirven como base para pantallas pequeñas */

.analysis-view {
  max-width: 100%; /* Ocupa el 100% del padre en móviles */
  margin: 0 auto; /* Centra el contenido */
  padding: 1rem; /* Padding base para móviles */
  transition: margin-left 0.3s ease-in-out; /* Transición suave para el sidebar si aplica */
}

/* Ajusta esto para que no mueva el contenido si el sidebar no existe o se oculta en móviles */
.analysis-view.shifted-left {
   /* margin-left: -250px; /* Esto probablemente no lo quieres en móviles */
   /* Puedes definir esto en una media query para pantallas donde el sidebar es visible */
}


.content-container {
  position: relative;
  background-color: white;
  padding: 1.5rem; /* Padding base un poco reducido para móviles */
  border-radius: 8px; /* Bordes un poco menos redondeados */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra más suave */
  border: 1px solid #eaeaea; /* Borde más delgado */
  max-width: 100%; /* Ocupa el 100% del padre en móviles */
  margin: 0 auto;
  z-index: 1;
  overflow: hidden;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem; /* Reduce el margen inferior */
  font-size: 1.5rem; /* Tamaño de fuente base para h2 */
}

.action-bar {
  margin-bottom: 1.5rem; /* Reduce el margen inferior */
  margin-left: 0; /* **Importante:** Elimina el margen fijo izquierdo en móviles */
  text-align: center; /* Centra el botón o contenido si es necesario */
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex; /* Usa inline-flex para que no ocupe todo el ancho si el padre es más ancho */
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem; /* Tamaño de fuente base del botón */
}

.analysis-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem; /* Reduce el margen inferior */
  box-shadow: 0 1px 6px rgba(0,0,0,0.05); /* Sombra más suave */
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1rem; /* Tamaño de fuente base para labels */
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem; /* Tamaño de fuente base para selects */
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem; /* Tamaño de fuente base del botón */
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Mínimo más pequeño para móviles si es necesario */
  gap: 1rem; /* Espacio más pequeño entre tarjetas en móviles */
  margin: 1.5rem auto; /* Margen base para móviles */
  max-width: 100%; /* Ocupa todo el ancho disponible del padre */
  padding: 0; /* Elimina padding horizontal en móviles */
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1rem; /* Padding interno más pequeño */
  box-shadow: 0 1px 6px rgba(109, 26, 26, 0.05);
  /* max-width: 100%; */ /* No es necesario con grid y width: 100% */
  border: 1px solid #eeeeee; /* Borde sutil */
}

.stat-card:hover {
  transform: translateY(-3px); /* Menor desplazamiento al pasar el mouse */
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.stat-card h4 {
  margin-top: 0;
  color: #7f8c8d;
  font-size: 0.9rem; /* Tamaño de fuente más pequeño */
}

.stat-card .value {
  font-size: 1.4rem; /* Tamaño de fuente más pequeño */
  font-weight: bold;
  color: #ff753a;
  margin: 0.3rem 0; /* Reduce margen vertical */
}

.titulo-centrado {
  text-align:center;
  margin: 0 auto 1.5rem auto; /* Ajusta margen inferior */
  max-width: 90%; /* Permite que ocupe más ancho si es necesario */
  color: #050505;
  font-size: 1.1rem; /* Tamaño de fuente más pequeño */
}

/* --- Media Query para Tablets y Escritorios pequeños ( >= 768px ) --- */
@media (min-width: 768px) {
  .analysis-view {
      padding: 2rem; /* Más padding en pantallas más grandes */
  }

   /* Si el sidebar es visible a partir de 768px, aplica el shift */
  .analysis-view.shifted-left {
     margin-left: -250px; /* Ajusta según el ancho de tu sidebar */
  }


  .content-container {
    padding: 2rem; /* Aumenta el padding interno */
    border-radius: 12px; /* Bordes más redondeados */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra más pronunciada */
    border: 2px solid #eaeaea; /* Borde más pronunciado */
    max-width: 800px; /* Un max-width típico para tablets/escritorios pequeños */
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.8rem; /* Aumenta el tamaño de fuente del h2 */
  }

  .action-bar {
    margin-bottom: 2rem;
    /* Si el action-bar está afectado por el sidebar, ajusta el margen izquierdo aquí
       dependiendo de si está shift-left o no. Esto puede requerir lógica Vue/JS.
       Como alternativa, puedes eliminar el margin-left fijo y usar flexbox/grid
       en el contenedor padre si necesitas alinear el action-bar con otros elementos.
    */
     margin-left: 0; /* Mantener sin margen fijo a menos que sea necesario por el layout */
     text-align: left; /* Alinear a la izquierda de nuevo */
  }

  .primary-btn {
    font-size: 1rem; /* Mantener o ajustar tamaño de fuente */
    display: inline-flex;
  }

  .analysis-form {
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

   .form-group label {
      font-size: 1rem;
   }

   .form-group select {
     font-size: 1rem;
   }

   .submit-btn {
      font-size: 1rem;
   }


  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Ajusta minmax para tablets/escritorios pequeños */
    gap: 1.5rem; /* Espacio base entre tarjetas */
    margin: 2rem auto;
    max-width: 700px; /* Un max-width adecuado para el grid de tarjetas */
    padding: 0 1rem;
  }

  .stat-card {
    padding: 1.5rem; /* Padding interno base */
    box-shadow: 0 2px 10px rgba(109, 26, 26, 0.05);
    border: 1px solid #eeeeee;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .stat-card h4 {
    font-size: 1rem;
  }

  .stat-card .value {
    font-size: 1.6rem; /* Aumenta un poco el tamaño del valor */
  }

  .titulo-centrado {
    margin: 0 auto 2rem auto;
    max-width: 500px; /* Ajusta el max-width del título */
    font-size: 1.2rem;
  }
}

/* --- Media Query para Escritorios ( >= 1024px o 1200px ) --- */
@media (min-width: 1024px) { /* Usamos 1024px como ejemplo, ajusta si prefieres 1200px */
   .analysis-view {
      /* Puedes ajustar el padding si es necesario */
      padding: 2rem;
      max-width: 100%; /* Permitir que ocupe el 100% del padre, el content-container manejará su ancho */
   }

    .analysis-view.shifted-left {
       margin-left: -250px; /* Mantener el shift si el sidebar sigue visible */
    }

  .content-container {
    padding: 2.5rem; /* Más padding interno */
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 2px solid #eaeaea;
    max-width: 1000px; /* Aumenta el max-width para escritorios */
  }

  h2 {
    margin-bottom: 2rem;
    font-size: 2rem; /* Tamaño de fuente más grande para h2 */
  }

  .action-bar {
     margin-bottom: 2.5rem;
     margin-left: 0; /* Asegurar que no haya margen fijo */
     text-align: left;
  }

   .primary-btn {
    padding: 0.9rem 1.8rem; /* Botón más grande */
    font-size: 1.1rem;
   }

  .analysis-form {
    padding: 2.5rem;
    margin-bottom: 2.5rem;
  }

   .form-group label {
      font-size: 1.1rem;
   }

   .form-group select {
     padding: 0.9rem;
     font-size: 1.1rem;
   }

    .submit-btn {
     padding: 0.9rem 1.8rem;
     font-size: 1.1rem;
   }

  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Tarjetas más anchas */
    gap: 2rem; /* Más espacio entre tarjetas */
    margin: 2.5rem auto;
    max-width: 850px; /* Aumenta el max-width del grid de tarjetas */
    padding: 0 2rem; /* Más padding horizontal */
  }

  .stat-card {
    padding: 2rem; /* Más padding interno */
  }

  .stat-card h4 {
    font-size: 1.1rem; /* Tamaño de fuente un poco más grande */
  }

  .stat-card .value {
    font-size: 1.8rem; /* Tamaño de fuente más grande */
  }

  .titulo-centrado {
    margin: 0 auto 2.5rem auto;
    max-width: 600px; /* Aumenta el max-width del título */
    font-size: 1.5rem; /* Tamaño de fuente más grande */
  }
}


/* --- Media Query para Pantallas Ultra Grandes ( >= 2500px ) --- */
@media (min-width: 2500px) {
   .analysis-view {
      padding: 3rem; /* Aún más padding */
      /* max-width: 100%; ya está */
   }

    .analysis-view.shifted-left {
       margin-left: -250px; /* Mantener el shift si el sidebar sigue visible */
    }


  .content-container {
    padding: 3rem; /* Mucho más padding interno */
    border-radius: 16px; /* Bordes más redondeados */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
    border: 3px solid #dcdcdc; /* Borde más grueso */
    max-width: 90%;
  }

  h2 {
    margin-bottom: 3rem;
    font-size: 2.5rem; /* Tamaño de fuente mucho más grande para h2 */
  }

  .action-bar {
     margin-bottom: 3rem;
     margin-left: 0; /* Asegurar que no haya margen fijo */
     text-align: left;
  }

   .primary-btn {
    padding: 1rem 2rem; /* Botón aún más grande */
    font-size: 1.2rem;
   }


  .analysis-form {
    padding: 3rem;
    margin-bottom: 3rem;
    box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  }

   .form-group {
       margin-bottom: 1.5rem;
   }

   .form-group label {
      font-size: 1.2rem;
   }

   .form-group select {
     padding: 1rem;
     font-size: 1.2rem;
   }

    .submit-btn {
     padding: 1rem 2rem;
     font-size: 1.2rem;
   }


  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Tarjetas mucho más anchas */
    gap: 3rem; /* Mucho más espacio entre tarjetas */
    margin: 3rem auto;
    max-width: 1200px; /* Aumenta considerablemente el max-width del grid */
    /* Opcional: Que ocupe el 100% del padre si el padre tiene un max-width generoso */
    /* max-width: 100%; */
    padding: 0 3rem; /* Mucho más padding horizontal */
  }

  .stat-card {
    padding: 2.5rem; /* Mucho más padding interno */
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border: 2px solid #dddddd; /* Borde un poco más pronunciado */
  }

   .stat-card h4 {
    font-size: 1.2rem; /* Tamaño de fuente más grande */
  }

  .stat-card .value {
    font-size: 2.2rem; /* Tamaño de fuente mucho más grande */
  }

  .titulo-centrado {
    margin: 0 auto 3rem auto;
    max-width: 800px; /* Aumenta considerablemente el max-width del título */
    font-size: 1.8rem; /* Tamaño de fuente mucho más grande */
  }
}

</style>
