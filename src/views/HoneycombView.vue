// src/views/HoneycombView.vue

<template>
  <div class="form-container">
    <h2>Registro y Control de Panales de Huevos</h2>
    <form @submit.prevent="handleSubmit" class="registro-form">
      <div class="form-row">
        <div class="form-group">
          <label for="idPanal">ID del Panal</label>
          <div class="input-group">
            <input
              id="idPanal"
              v-model="formData.idPanal"
              type="text"
              class="form-input"
              placeholder="Ingrese ID"
              autocomplete="off"
              required
              ref="idPanalInput"
              />

            <button type="button" @click="generarIdAutomatico" class="generate-btn">
              Generar Automático
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="tipoHuevo">Tipo de Huevo</label>
           <select id="tipoHuevo" v-model="formData.tipoHuevo" class="form-input" required>
            <option value="" disabled >Seleccione</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="AA">AA</option>
            <option value="AAA">AAA</option>
            <option value="Yumbo">Yumbo</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="cantidadHuevos">Cantidad de Huevos</label>
           <input
            id="cantidadHuevos"
            v-model.number="formData.cantidadHuevos"
            type="number"
            min="1"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="galponLote">Galpón o Lote</label>
           <input id="galponLote" v-model="formData.galponLote" type="text" class="form-input" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="fechaInicio">Fecha de Inicio</label>
           <input id="fechaInicio" v-model="formData.fechaInicio" type="date" class="form-input" required />
        </div>

        <div class="form-group">
          <label>Fecha de Vencimiento</label>
          <input v-model="formData.fechaVencimiento" type="date" class="form-input" required />
          <div class="mensaje-error">
             <small><strong>Recomendación: </strong> La fecha de vencimiento no debe superar los 28 días desde la postura.</small>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Estado</label>
          <select v-model="formData.estado" class="form-input" required>
            <option value="Activo">Activo</option>
          </select>
        </div>

         <!-- //El botón de submit no necesita estar en un form-group separado, pero puede ser un div  -->
         <div class="form-group submit-group"> <!-- Añadir clase para centrar o alinear si es necesario -->
            <button type="submit" class="submit-btn" :disabled="panalesStore.loading">
              <span v-if="!panalesStore.loading">GUARDAR PANAL</span>
              <span v-else>Guardando...</span>
            </button>
         </div>
      </div>

      <p v-if="panalesStore.error" class="error-message">{{ panalesStore.error }}</p>


    </form>
  </div>
</template>

<script setup>
import { ref, nextTick} from 'vue'; // Importa ref
import { usePanalesStore } from '@/stores/panalesStore'; // Importa tu store de panales

const panalesStore = usePanalesStore(); // Usa el store
const idPanalInput = ref(null);

// Estado reactivo para los datos del formulario (Composition API)
// Usamos nombres de claves que coincidan con lo que el store espera (idPanal, cantidadHuevos, etc.)
const formData = ref({
  idPanal: '',
  tipoHuevo: '',
  cantidadHuevos: null, // Usar null para campos numéricos/vacíos
  galponLote: '', // Cambiado a galponLote para que coincida con el store
  fechaInicio: '',
  fechaVencimiento: '',
  estado: 'Activo', // Valor por defecto
});

const contadorID = ref(1); // Contador para generar ID automático (ahora reactivo)
const dateError = ref(null); // Estado para el error de validación de fechas


// Función para generar ID automático (Composition API)
const generarIdAutomatico = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaFormateada = `${year}${month}${day}`;

  // Generar ID con número secuencial y fecha
  formData.value.idPanal = `EGG-${contadorID.value}-${fechaFormateada}`;

  // Incrementar el contador
  contadorID.value++;
};

// Función para manejar el envío del formulario (Composition API)
const handleSubmit = async () => {
    // Limpiar errores previos del store y de la vista
    panalesStore.error = null;
    dateError.value = null;

    // --- Validaciones antes de guardar ---
    // Validar que todos los campos requeridos tienen valor (los inputs 'required' ya ayudan con la validación básica del navegador)

    // Validar que la fecha de vencimiento no sea anterior a la de inicio
    const fechaInicio = new Date(formData.value.fechaInicio);
    const fechaVencimiento = new Date(formData.value.fechaVencimiento);

     if (fechaVencimiento < fechaInicio) {
        dateError.value = 'La fecha de vencimiento debe ser igual o posterior a la fecha de inicio.';
        // alert('¡La fecha de vencimiento debe ser igual o posterior a la fecha de inicio!'); // Opcional: usar alert
        return; // Detiene el proceso si hay error de fecha
    }

    // Opcional: Validar que no supere 28 días desde la fecha de inicio
    const diffTime = Math.abs(fechaVencimiento - fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 28) {
         // dateError.value = 'La fecha de vencimiento recomendada no debe superar los 28 días desde la fecha de inicio.';
         // Opcional: Mostrar una advertencia en lugar de detener
         console.warn('Recomendación: Fecha de vencimiento excede los 28 días.');
         // Puedes mostrar una notificación o un mensaje en la vista sin detener el guardado
    }


    console.log('Datos a guardar:', formData.value);

    try {
        // Llama a la acción del store para guardar los datos en Firestore
        // Pasa los datos del formulario
        const docId = await panalesStore.savePanal(formData.value);
        console.log('Panal guardado con ID:', docId);

        // Mostrar notificación de éxito (el store también lo hace, puedes elegir dónde mostrarla)
        // toast.success('Panal guardado exitosamente!');

        // Resetear el formulario después de guardar con éxito
        resetForm();

    } catch (error) {
       console.error('Error al guardar panal en la vista:', error);
       // El store ya guarda el error en panalesStore.error y muestra un toast
       // Puedes añadir manejo extra aquí si quieres
    }
};

// Función para resetear el formulario
const resetForm = () => {
    formData.value = {
        idPanal: '',
        tipoHuevo: '',
        cantidadHuevos: null,
        galponLote: '',
        fechaInicio: '',
        fechaVencimiento: '',
        estado: 'Activo',
    };
    contadorID.value = 1; // Opcional: resetear el contador ID si es necesario
    dateError.value = null; // Limpiar error de fecha
    panalesStore.error = null; // Limpiar error del store

    // 👇 Esto asegura que el focus ocurra después de que el DOM se haya actualizado
  nextTick(() => {
    idPanalInput.value?.focus();
  });

};
</script>

<style scoped>
/* Estilos base */
.form-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 25px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #eee9e7; /* Borde naranja */
}

.mensaje-recomendacion {
  /* Estilos para el texto de recomendación de fecha */
 height: 1.2em; /* espacio reservado */
 margin-top: 4px;
 color: #555; /* Color gris oscuro para recomendación */
 font-size: 12px;
}

.mensaje-recomendacion small {
 color: inherit;
 font-size: inherit;
}


.mensaje-error {
  /* Estilos para mensajes de error de validación locales */
  height: 1.2em; /* espacio reservado */
  margin-top: 4px;
  color:red; /* Color rojo para errores */
  font-size: 12px;
}

.mensaje-error small {
    color: inherit;
    font-size: inherit;
}


h2 {
  text-align: center;
  color: white;
  margin-bottom: 25px;
  font-size: 1.5rem;
  background-color: #ff753a; /* Naranja como principal */
  padding: 12px;
  border-radius: 5px;
  letter-spacing: 1px;
}

/* Diseño horizontal */
.registro-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 80px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Asegura que el grupo del botón submit también use gap */
.form-group.submit-group {
    justify-content: center; /* Centra el botón verticalmente en la fila */
    align-items: center; /* Centra el botón horizontalmente si no es de ancho completo */
    /* gap: 0; */ /* No necesitas gap extra aquí */
}


/* Elementos del formulario */
label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-left: 5px;
}

.form-input {
  font-size: 14px;
  padding: 12px;
  border: 2px solid #ff753a;
  border-radius: 6px;
}

.form-input:focus {
  outline: none;
  border-color: #ff753a;
  box-shadow: 0 0 0 3px rgba(255, 117, 58, 0.2);
}

.input-group {
  display: flex;
  gap: 10px;
}

/* Botones */
.generate-btn {
  padding: 12px 18px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* Evita que se encoja en la fila */
}

.generate-btn:hover {
  background-color: #ff5c1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}

.submit-btn {
  /* padding: 12px; Ya definido en form-input */
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  margin:20px auto 0 auto; /* Margen para centrar */
  padding: 12px 25px; /* Añadir padding horizontal para tamaño */
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  /* flex-grow: 1; */ /* Puedes hacerlo crecer si quieres que ocupe el espacio */
  width: auto; /* Ocupa el ancho necesario */
}

.submit-btn:hover {
  background-color: #ff5c1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}

/* Esto ya no es necesario con submit-group display: flex y justify-content: center */
/* .form-group:last-child {
  display: flex;
  justify-content: center;
} */

/* Validación visual (ejemplo básico, CSS nativo también ayuda) */
/* input:invalid,
select:invalid {
  border-color: #ff753a;
} */ /* El border-color already uses #ff753a */


/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-container {
    padding: 15px;
    margin: 15px; /* Ajustar margen */
  }

  h2 {
    font-size: 1.3rem;
    padding: 10px;
  }

  .registro-form {
    gap: 25px; /* Ajusta el espacio entre las filas */
  }
}

/* Responsive: Cambia a vertical en móviles */
@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .input-group {
    flex-direction: column; /* Apila el input y el botón */
    gap: 10px; /* Espacio entre el input y el botón */
  }

  .generate-btn {
    width: 100%; /* Botón ocupa todo el ancho */
  }
}
</style>

