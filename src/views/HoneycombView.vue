// src/views/HoneycombView.vue

<template>
  <div class="page-content form-container">
    <h2>{{ isEditing ? 'Editar Panal de Huevos' : 'Registro y Control de Panales de Huevos' }}</h2>

    <form @submit.prevent="handleSubmit" class="registro-form" novalidate>
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
              :disabled="isEditing"
              :class="{ 'is-invalid': formErrors.idPanal }"
            />
             <div v-if="formErrors.idPanal" class="field-error-message">{{ formErrors.idPanal }}</div>
          </div>
            <button type="button" @click="generarIdAutomatico" class="generate-btn" v-if="!isEditing">
              Generar Automático
            </button>
        </div>

        <div class="form-group">
          <label for="tipoHuevo">Tipo de Huevo</label>
           <select
              id="tipoHuevo"
              v-model="formData.tipoHuevo"
              class="form-input"
              required
              :class="{ 'is-invalid': formErrors.tipoHuevo }"
          >
            <option value="" disabled selected>Seleccione</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="AA">AA</option>
            <option value="AAA">AAA</option>
            <option value="Yumbo">Yumbo</option>
          </select>
           <div v-if="formErrors.tipoHuevo" class="field-error-message">{{ formErrors.tipoHuevo }}</div>
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
            :class="{ 'is-invalid': formErrors.cantidadHuevos }"
          />
           <div v-if="formErrors.cantidadHuevos" class="field-error-message">{{ formErrors.cantidadHuevos }}</div>
        </div>

        <div class="form-group">
          <label for="galponLote">Galpón o Lote</label>
           <input
              id="galponLote"
              v-model="formData.galponLote"
              type="text"
              class="form-input"
              required
              :class="{ 'is-invalid': formErrors.galponLote }"
          />
           <div v-if="formErrors.galponLote" class="field-error-message">{{ formErrors.galponLote }}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="fechaInicio">Fecha de Inicio</label>
           <input
              id="fechaInicio"
              v-model="formData.fechaInicio"
              type="date"
              class="form-input"
              required
              :class="{ 'is-invalid': formErrors.fechaInicio || dateError }"
          />
           <div v-if="formErrors.fechaInicio" class="field-error-message">{{ formErrors.fechaInicio }}</div>
        </div>

        <div class="form-group">
          <label for="fechaVencimiento">Fecha de Vencimiento</label>
           <input
              id="fechaVencimiento"
              v-model="formData.fechaVencimiento"
              type="date"
              class="form-input"
              required
              :class="{ 'is-invalid': formErrors.fechaVencimiento || dateError }"
          />
          <div class="mensaje-recomendacion">
               <small><strong>Recomendación: </strong> La fecha de vencimiento no debe superar los 28 días desde la postura.</small>
           </div>
           <div v-if="dateError" class="field-error-message">{{ dateError }}</div> <div v-if="formErrors.fechaVencimiento" class="field-error-message">{{ formErrors.fechaVencimiento }}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" v-if="isEditing">
          <label for="estado">Estado</label>
           <select
              id="estado"
              v-model="formData.estado"
              class="form-input"
              required
              :class="{ 'is-invalid': formErrors.estado }"
          >
            <!-- las opciones para la versiona edicion  -->
              <option value="Activo">Activo</option>
              <option value="Vencido">Vencido</option>
              <option value="Vendido">Vendido</option>

          </select>
           <div v-if="formErrors.estado" class="field-error-message">{{ formErrors.estado }}</div>
        </div>

         <div class="form-group submit-group">
            <button type="submit" class="submit-btn" :disabled="panalesStore.loading">
              <span v-if="!panalesStore.loading">{{ isEditing ? 'GUARDAR CAMBIOS' : 'GUARDAR PANAL' }}</span>
              <span v-else>
                <span class="loading-spinner"></span> {{ isEditing ? 'Guardando Cambios...' : 'Guardando Panal...' }}
              </span>
            </button>
         </div>
      </div>

      <p v-if="panalesStore.error" class="general-error-message">{{ panalesStore.error }}</p>

    </form>


    <!-- {/* === Añadir el componente ConfirmModal para Guardar Cambios (en edición) === */} -->
    <!-- {/* Se mostrará cuando showSaveConfirm sea true */} -->
    <ConfirmModal
      v-if="showSaveConfirm"
      title="Confirmar Guardar Cambios"
      message="¿Estás seguro de que quieres guardar los cambios realizados en este panal?"
      confirmButtonText="Sí, Guardar"
      cancelButtonText="Cancelar"
      @confirm="executeSave"
      @cancel="cancelSave"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePanalesStore } from '@/stores/panalesStore';
import { useRoute, useRouter } from 'vue-router'; // Importa useRoute y useRouter
// === Importa el componente ConfirmModal ===
import ConfirmModal from '@/components/auth/ConfirmModal.vue'; // Asegúrate de la ruta correcta
// =======================================

const showSaveConfirm = ref(false);
const panalesStore = usePanalesStore();
const route = useRoute();
const router = useRouter(); // Usar el router para navegar



// Estado reactivo para los datos del formulario
const formData = ref({
  idPanal: '',
  tipoHuevo: '',
  cantidadHuevos: null,
  galponLote: '',
  fechaInicio: '',
  fechaVencimiento: '',
  estado: 'Activo',
});

// Estado para saber si estamos en modo edición y guardar el ID del panal (Firestore ID)
const isEditing = computed(() => !!route.params.id); // Es true si hay un parámetro 'id' en la ruta
const currentPanalId = computed(() => route.params.id || null); // Guarda el ID si está en la ruta

// Nuevo estado para errores de validación por campo
const formErrors = ref({});
// Estado para el error de validación de fechas locales
const dateError = ref(null);
// Contador para generar ID automático (reactivo)
const contadorID = ref(1);


// --- Lógica para cargar los datos del panal si estamos en modo edición ---
onMounted(async () => {
    // Limpiar errores del store y de la vista
    panalesStore.error = null;
    dateError.value = null;
    formErrors.value = {};

    // Si hay un ID en los parámetros de la ruta, estamos en modo edición
    if (isEditing.value) {
        console.log('Modo edición detectado. ID del panal:', currentPanalId.value);

        // ===> Lógica para cargar los datos del panal usando la acción del store <===
        const panalToEdit = await panalesStore.fetchSinglePanal(currentPanalId.value);

        if (panalToEdit) {
            // Carga los datos del panal encontrado en el formulario
            formData.value = {
                idPanal: panalToEdit.idPanal,
                tipoHuevo: panalToEdit.tipoHuevo,
                cantidadHuevos: panalToEdit.cantidadHuevos,
                galponLote: panalToEdit.galponLote,
                fechaInicio: panalToEdit.fechaInicio,
                fechaVencimiento: panalToEdit.fechaVencimiento,
                estado: panalToEdit.estado,
                // No necesitas userId ni createdAt en el formData para editar
            };

        } else {
             // Si el panal no se encuentra (ej: ID inválido en la URL), redirigir o mostrar error
             console.error('Error: Panal con ID', currentPanalId.value, 'no encontrado.');
             // El error ya se establece en el store por fetchSinglePanal.
             // Opcional: redirigir a la lista
             // router.replace({ name: 'honeycomb-list' });
        }
    } else {
         // Si NO estamos en modo edición (es un nuevo registro), resetea el formulario
         resetForm();
    }
});


// --- Función de validación local ---
const validateForm = () => {
    formErrors.value = {};
    let isValid = true;

    if (!formData.value.idPanal) { formErrors.value.idPanal = 'El ID del Panal es obligatorio.'; isValid = false; }
    if (!formData.value.tipoHuevo) { formErrors.value.tipoHuevo = 'El Tipo de Huevo es obligatorio.'; isValid = false; }
    if (formData.value.cantidadHuevos === null || formData.value.cantidadHuevos <= 0) { formErrors.value.cantidadHuevos = 'La Cantidad de Huevos debe ser un número positivo.'; isValid = false; }
    if (!formData.value.galponLote) { formErrors.value.galponLote = 'El Galpón o Lote es obligatorio.'; isValid = false; }
    if (!formData.value.fechaInicio) { formErrors.value.fechaInicio = 'La Fecha de Inicio es obligatoria.'; isValid = false; }
    if (!formData.value.fechaVencimiento) { formErrors.value.fechaVencimiento = 'La Fecha de Vencimiento es obligatoria.'; isValid = false; }

    const fechaInicio = new Date(formData.value.fechaInicio);
    const fechaVencimiento = new Date(formData.value.fechaVencimiento);

     if (fechaVencimiento < fechaInicio && !formErrors.value.fechaVencimiento && !formErrors.value.fechaInicio) {
        dateError.value = 'La fecha de vencimiento debe ser igual o posterior a la fecha de inicio.';
        isValid = false;
    } else {
         dateError.value = null;
    }

     if (formData.value.fechaInicio && formData.value.fechaVencimiento && !dateError.value) {
        const diffTime = Math.abs(fechaVencimiento.getTime() - fechaInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 28) {
             console.warn('Recomendación: Fecha de vencimiento excede los 28 días.');
        }
     }

    return isValid;
};


// --- Función para generar ID automático ---
const generarIdAutomatico = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const fechaFormateada = `${year}${month}${day}`;
    formData.value.idPanal = `EGG-${contadorID.value}-${fechaFormateada}`;
    contadorID.value++;

     if (formErrors.value.idPanal) {
         formErrors.value.idPanal = null;
     }
};

// --- Función para manejar el envío del formulario (MODIFICADA para usar Modal en Edición) ---
const handleSubmit = async () => {
  // Limpiar errores previos
  panalesStore.error = null;
  dateError.value = null;
  formErrors.value = {};

  // Validar el formulario localmente
  if (!validateForm()) {
    console.log('Validación del formulario fallida.');
    return; // Detiene el proceso si la validación falla
  }

  console.log('Formulario validado. Intentando guardar/actualizar panal con datos:', formData.value);

  // === Si estamos en modo EDICIÓN, mostramos el modal de confirmación ===
  if (isEditing.value) {
    console.log('Modo edición: Mostrando modal de confirmación para guardar cambios.');
    showSaveConfirm.value = true; // Muestra el modal de guardar cambios
  } else {
    // === Si estamos en modo REGISTRO, guarda directamente ===
    console.log('Modo registro: Llamando a savePanal directamente.');
    try {
      const docId = await panalesStore.savePanal(formData.value);
      console.log('Panal guardado con ID:', docId);
      resetForm(); // Resetear el formulario después de guardar un nuevo panal
      // Opcional: Redirigir a la lista después de guardar un nuevo
      // router.push({ name: 'honeycomb-list' });
    } catch (error) {
      console.error('Error al guardar panal desde la vista:', error);
      // El error se muestra desde el store
    }
  }
};
// Función llamada cuando el usuario confirma en el modal de guardar cambios
const executeSave = async () => {
  console.log('Confirmado guardar cambios. Ejecutando updatePanal.');
   // Limpiamos el error del store antes de la operación (si quieres)
   panalesStore.error = null;

  try {
    const updatedData = { ...formData.value };
    await panalesStore.updatePanal(currentPanalId.value, updatedData);
    console.log('Panal actualizado con ID:', currentPanalId.value);
    showSaveConfirm.value = false; // Oculta el modal después de guardar
    // Redirigir a la lista después de actualizar
    router.push({ name: 'honeycomb-list' });

  } catch (error) {
    console.error('Error al actualizar panal desde la vista:', error);
    // El error ya se muestra desde el store (toast)
    showSaveConfirm.value = false; // Oculta el modal incluso si hay error
  }
};

// Función llamada cuando el usuario cancela en el modal de guardar cambios
const cancelSave = () => {
  console.log('Guardar cambios cancelado por el usuario.');
  showSaveConfirm.value = false; // Oculta el modal
};

// --- Fin Funciones Modal Guardar Cambios ---
// --- Función para resetear el formulario ---
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
    dateError.value = null;
    formErrors.value = {};
    panalesStore.error = null;
};

// Opcional: Observar cambios en la ruta para resetear el formulario si navegas de /honeycomb/some-id a /honeycomb
watch(() => route.params.id, (newId, oldId) => {
   console.log('Cambio de ID en ruta:', oldId, '->', newId);
   if (!newId && oldId) {
      console.log('Detectado cambio de modo edición a registro. Reseteando formulario.');
      resetForm();
   }
});





// Exportar variables/funciones si necesitas acceder a ellas desde fuera
// export { formData, generarIdAutomatico, handleSubmit, resetForm, isEditing, currentPanalId, formErrors, dateError, goToList };

</script>
<style scoped>
/* --- ESTILOS BASE (para móviles pequeños, por defecto < 600px) --- */
.page-content {
    position: relative;
    /* Padding general si lo necesita el contenedor de toda la página */
    padding: 1rem; /* Padding base */
}

.form-container {
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0rem auto; /* Margen vertical y centrado */
    padding: 1rem; /* Padding interno base */
    width: 100%;
    background-color: white;
    border-radius: 8px; /* Bordes un poco menos redondeados */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra más suave */
    border: 1px solid #eee9e7; /* Borde más delgado */
    position: relative;
}

.mensaje-recomendacion {
    height: 1.2em; /* espacio reservado */
    margin-top: 4px;
    color: #555;
    font-size: 12px;
}

.mensaje-recomendacion small {
    color: inherit;
    font-size: inherit;
}

.mensaje-error {
    height: 1.2em; /* espacio reservado */
    margin-top: 4px;
    color: red;
    font-size: 12px;
}

h2 {
    text-align: center;
    color: white;
    margin-bottom: 1rem; /* Reduce margen inferior */
    font-size: 1.3rem; /* Tamaño de fuente base */
    background-color: #ff753a;
    padding: 0.8rem; /* Padding base */
    border-radius: 5px;
    letter-spacing: 0.5px; /* Reduce letter-spacing */
}

/* Contenedor principal del formulario */
.registro-form {
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Espacio entre filas (form-row) */
}

/* Contenedor de una fila de campos (usa grid) */
.form-row {
    display: grid;
    /* En móviles, por defecto 1 columna */
    grid-template-columns: 1fr;
    gap: 1rem; /* Espacio entre columnas (en 1 columna, es entre elementos dentro de la fila) */
}

/* Asegura que la última fila se vea bien con el botón */
.form-row:last-child {
    grid-template-columns: 1fr; /* Una columna */
    gap: 1rem;
    align-items: flex-start; /* Alinea items al inicio */
}

/* Contenedor de un grupo de campo (label + input/select + error/recomendación) */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px; /* Espacio entre label y input/select */
}

/* Estilos específicos para el grupo del botón submit */
.form-group.submit-group {
    justify-content: center; /* Centra el botón horizontalmente */
    align-items: center; /* Centra el botón verticalmente */
    /* margin-top: auto; */ /* Puede ayudar a empujar hacia abajo si el padre es flex column */
}

/* Elementos del formulario */
label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem; /* Tamaño de fuente base para label */
    margin-left: 0; /* Elimina margen izquierdo fijo */
}

/* Estilos para los inputs y selects */
.form-input {
    font-size: 1rem; /* Tamaño de fuente base para input/select */
    padding: 0.75rem; /* Padding base */
    border: 1px solid #ff753a; /* Borde más delgado por defecto */
    border-radius: 4px; /* Bordes menos redondeados */
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #ff5c1a;
    box-shadow: 0 0 0 2px rgba(255, 117, 58, 0.3); /* Sombra más suave */
}

.form-input.is-invalid {
    border-color: red;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}


/* Contenedor para input y botón "Generar Automático" */
.input-group {
    display: flex;
    flex-direction: column; /* Apilado por defecto en móviles */
    gap: 0.8rem; /* Espacio entre input y botón apilados */
    width: 100%;
}

.input-group input {
    flex-grow: 1;
    /* Hereda estilos de .form-input */
}

/* Estilos para el botón "Generar Automático" */
.generate-btn {
    padding: 0.75rem 1.2rem; /* Padding base */
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem; /* Tamaño de fuente base */
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); /* Sombra más suave */
    flex-shrink: 0;
    width: 100%; /* Ocupa todo el ancho en móviles */
}

.generate-btn:hover {
    background-color: #ff5c1a;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(255, 117, 58, 0.3);
}


/* Estilos para el botón "Guardar Panal" / "Guardar Cambios" */
.submit-btn {
    padding: 0.8rem 1.5rem; /* Padding base */
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem; /* Tamaño de fuente base */
    margin-top: 0.5rem; /* Espacio superior */
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: auto; /* Ancho automático por defecto */
}

.submit-btn:hover {
    background-color: #ff5c1a;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(255, 117, 58, 0.3);
}

.submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Estilos para el spinner dentro del botón cuando está cargando */
.loading-spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #fff;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 6px;
    vertical-align: middle;
}

/* Estilos para mensajes de error locales por campo */
.field-error-message {
    color: red;
    font-size: 11px; /* Tamaño de fuente más pequeño */
    margin-top: -4px;
    /* height: 1.2em; */ /* Opcional: reservar espacio */
}

/* Estilos para mensajes de error generales que vienen del store */
.general-error-message {
    grid-column: 1 / -1;
    color: red;
    margin-top: 0.8rem; /* Reduce margen superior */
    text-align: center;
    font-weight: bold;
    padding: 0.8rem; /* Reduce padding */
    border: 1px dashed red;
    background-color: #ffe5e5;
    border-radius: 4px;
    font-size: 0.9rem; /* Reduce tamaño de fuente */
}


/* --- Media Query para Móviles Grandes y Tablets pequeñas ( >= 600px ) --- */
@media (min-width: 600px) {
    .form-container {
        padding: 1.5rem; /* Aumenta padding interno */
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #eee9e7;
    }

    h2 {
        font-size: 1.5rem; /* Aumenta tamaño de fuente h2 */
        padding: 1rem;
    }

    .registro-form {
        gap: 1.2rem; /* Espacio entre filas */
    }

    .form-row {
        /* Ahora permite múltiples columnas si caben, minmax 250px */
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem; /* Espacio entre columnas y filas */
    }

     .form-row:last-child {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        align-items: flex-start;
    }

    .form-group {
        gap: 8px;
    }

    label {
        font-size: 1rem; /* Aumenta tamaño de label */
    }

    .form-input {
        font-size: 1rem; /* Tamaño de input */
        padding: 0.8rem;
        border: 1px solid #ff753a;
        border-radius: 6px;
    }

    .input-group {
        flex-direction: row; /* Vuelve a poner input y botón en fila */
        gap: 10px; /* Espacio entre input y botón */
    }

    .generate-btn {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        width: auto; /* Ancho automático */
    }

    .submit-btn {
        padding: 1rem 20px;
        font-size: 1rem;
        margin-top: 1rem;
    }

    .field-error-message {
        font-size: 12px;
    }

     .general-error-message {
        padding: 1rem;
        font-size: 1rem;
    }
}


/* --- Media Query para Tablets Grandes y Escritorios ( >= 768px ) --- */
@media (min-width: 768px) {
    .form-container {
        padding: 2rem; /* Aumenta padding interno */
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 2px solid #eee9e7; /* Borde base más grueso */
        max-width: 700px; /* Max-width típico para tablet/escritorio pequeño */
    }

    h2 {
        font-size: 1.8rem; /* Aumenta tamaño de fuente h2 */
        padding: 1.2rem;
    }

    .registro-form {
        gap: 1.5rem; /* Espacio entre filas */
    }

    .form-row {
        /* Puede ser 1fr si prefieres una columna grande, o seguir con auto-fit */
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Permite columnas más anchas */
        gap: 20px; /* Espacio entre columnas y filas */
    }

     .form-row:last-child {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        align-items: flex-start;
    }


    label {
        font-size: 1rem;
    }

    .form-input {
        font-size: 1rem;
        padding: 1rem;
        border: 2px solid #ff753a;
        border-radius: 6px;
    }

     .input-group {
        gap: 10px;
    }

    .generate-btn {
        padding: 1rem 1.8rem;
        font-size: 1rem;
    }


    .submit-btn {
        padding: 1rem 25px;
        font-size: 1rem;
        margin-top: 1.2rem;
    }

    .field-error-message {
        font-size: 12px;
    }

    .general-error-message {
        padding: 1rem;
        font-size: 1rem;
    }
}

/* --- Media Query para Escritorios Grandes ( >= 1024px ) --- */
@media (min-width: 1024px) {
    .form-container {
        padding: 2.5rem; /* Aumenta padding interno */
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 2px solid #eee9e7;
        max-width: 1000px; /* Max-width típico para escritorio */
        margin-top: 4rem;
    }

    h2 {
        font-size: 2rem; /* Aumenta tamaño de fuente h2 */
        padding: 1.5rem;
         margin-bottom: 30px;
    }

    .registro-form {
        gap: 20px; /* Espacio entre filas */
    }


    .form-row {
        /* 2 columnas de tamaño igual */
        grid-template-columns: repeat(2, 1fr);
        gap: 30px; /* Espacio entre columnas y filas */
    }

     .form-row:last-child {
        grid-template-columns: repeat(2, 1fr); /* 2 columnas */
        gap: 30px;
        align-items: flex-start;
         /* Si quieres que el botón esté debajo de uno de los campos en esta fila,
            podrías ajustar el grid-template-columns o la alineación solo para
            el submit-group dentro de esta media query. */
     }


    label {
        font-size: 1rem;
         margin-left: 5px; /* Restaurar el margen izquierdo si lo prefieres */
    }

    .form-input {
        font-size: 1rem;
        padding: 12px;
    }

     .input-group {
         /* flex-direction: row; ya está */
         gap: 10px;
     }

    .generate-btn {
        padding: 12px 18px;
        font-size: 1rem;
         width: auto;
    }

    .submit-btn {
        padding: 12px 25px;
        font-size: 1.1rem; /* Aumenta tamaño de fuente del botón */
        margin-top: 15px; /* Restaurar margen superior */
    }

     .field-error-message {
        font-size: 12px;
    }

    .general-error-message {
        padding: 10px;
        font-size: 1rem;
         margin-top: 1rem;
    }
}


/* --- Media Query para Pantallas Ultra Grandes ( >= 2500px ) --- */
@media (min-width: 2500px) {
    .form-container {
        padding: 4rem; /* Mucho más padding interno */
        border-radius: 16px; /* Bordes más redondeados */
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
        border: 3px solid #dcdcdc; /* Borde más grueso */
        /* Adaptar al tamaño de pantalla: usa un porcentaje para max-width */
        max-width: 80%; /* Ejemplo: El contenedor no será más ancho del 60% del viewport */
        margin-top: 6rem;
    }

    h2 {
        font-size: 2.5rem; /* Tamaño de fuente mucho más grande h2 */
        padding: 2rem;
        margin-bottom: 40px;
        border-radius: 8px;
    }

    .registro-form {
        gap: 30px; /* Espacio entre filas */
    }

    .form-row {
        /* Puedes mantener 2 columnas o intentar 3 si el contenido lo permite y se ve bien */
        grid-template-columns: repeat(2, 1fr); /* Mantener 2 columnas grandes */
        /* grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); */ /* O 3 columnas muy anchas */
        gap: 40px; /* Mucho más espacio entre columnas y filas */
    }

     .form-row:last-child {
         grid-template-columns: repeat(2, 1fr); /* Mantener 2 columnas */
         gap: 40px;
         align-items: flex-start;
     }


    label {
        font-size: 1.1rem; /* Tamaño de label */
        margin-left: 8px;
    }

    .form-input {
        font-size: 1.1rem; /* Tamaño de input/select */
        padding: 1.5rem; /* Mucho más padding en inputs */
        border: 2px solid #ff753a;
        border-radius: 8px;
    }

    .input-group {
         gap: 15px; /* Espacio entre input y botón */
    }

    .generate-btn {
        padding: 1.5rem 2rem; /* Botón más grande */
        font-size: 1.1rem;
        border-radius: 8px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    }


    .submit-btn {
        padding: 1.5rem 30px; /* Botón más grande */
        font-size: 1.2rem; /* Tamaño de fuente del botón */
        margin-top: 20px; /* Más margen superior */
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .loading-spinner {
        width: 20px;
        height: 20px;
        border-width: 5px;
    }

     .field-error-message {
        font-size: 13px;
    }

    .general-error-message {
        padding: 1.5rem;
        font-size: 1.1rem;
        margin-top: 1.5rem;
    }
}
</style>

