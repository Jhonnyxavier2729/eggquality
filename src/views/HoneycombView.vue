// src/views/HoneycombView.vue

<template>
  <div class="page-content form-container">
    <!-- <button v-if="isEditing" @click="goToList" class="back-to-list-btn">
      ← Regresar a la Lista
    </button> -->

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
import { useAuthStore } from '@/stores/auth';
// === Importa el componente ConfirmModal ===
import ConfirmModal from '@/components/auth/ConfirmModal.vue'; // Asegúrate de la ruta correcta
// =======================================

const showSaveConfirm = ref(false);
const panalesStore = usePanalesStore();
const route = useRoute();
const router = useRouter(); // Usar el router para navegar
const authStore = useAuthStore();


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

// --- Funciones para manejar el Modal de Guardar Cambios ---

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


// --- Función para navegar de regreso a la lista ---
const goToList = () => {
    console.log('Navegando de regreso a la lista de panales.');
    router.push({ name: 'honeycomb-list' }); // Navega a la ruta de la lista
};


// Exportar variables/funciones si necesitas acceder a ellas desde fuera
// export { formData, generarIdAutomatico, handleSubmit, resetForm, isEditing, currentPanalId, formErrors, dateError, goToList };

</script>

<style scoped>
/* Asegúrate de que esta clase reciba el padding del layout principal */
.page-content {
    /* padding: 1.5rem; */ /* Asegúrate de que el padding esté en el layout principal */
    position: relative; /* Necesario para posicionar el botón de regreso absolutamente */
}

.form-container {
  max-width: 1000px;
  margin: 20px auto; /* Centrar y dar margen vertical */
  padding: 25px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #eee9e7; /* Borde naranja */
  position: relative;
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
  color: red; /* Color rojo para errores */
  font-size: 12px;
}

/* Estilo para el título del formulario */
h2 {
  text-align: center;
  color: white;
  margin-bottom: 25px;
  font-size: 1.5rem;
  background-color: #ff753a; /* Naranja */
  padding: 12px;
  border-radius: 5px;
  letter-spacing: 1px;
}

/* Contenedor principal del formulario */
.registro-form {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Espacio entre filas (form-row) */
}

/* Contenedor de una fila de campos (usa grid) */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Columnas responsivas */
  gap: 25px; /* Espacio entre columnas dentro de una fila */
}

/* Asegura que la última fila se vea bien con el botón */
.form-row:last-child {
     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Misma estructura */
     gap: 25px; /* Mismo gap */
     align-items: flex-start; /* Alinea items al inicio */
}

/* Contenedor de un grupo de campo (label + input/select + error/recomendación) */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Espacio entre label y input/select */
}

/* Estilos específicos para el grupo del botón submit */
.form-group.submit-group {
    /* flex-direction: row; */ /* Si quieres el botón al lado del campo estado en desktop */
    justify-content: center; /* Centra el botón horizontalmente */
    align-items: flex-end; /* Alinea el botón a la base de la fila si está en grid */
    /* margin-top: auto; */ /* Puede ayudar a empujar hacia abajo */
}

/* Elementos del formulario */
label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-left: 5px;
}

/* Estilos para los inputs y selects */
.form-input {
  font-size: 14px;
  padding: 12px;
  border: 2px solid #ff753a; /* Borde naranja por defecto */
  border-radius: 6px;
  width: 100%; /* Asegura que input/select ocupen todo el ancho del form-group */
  box-sizing: border-box; /* Incluye padding y borde en el ancho */
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Transición suave */
}

.form-input:focus {
  outline: none;
  border-color: #ff5c1a; /* Naranja más oscuro al enfocar */
  box-shadow: 0 0 0 3px rgba(255, 117, 58, 0.3); /* Sombra al enfocar */
}

/* Estilo para inputs/selects con errores de validación */
.form-input.is-invalid {
    border-color: red; /* Borde rojo para campos inválidos */
    box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.2); /* Sombra roja */
}


/* Contenedor para input y botón "Generar Automático" */
.input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.input-group input {
    flex-grow: 1; /* Permite que el input crezca en el grupo */
    /* Hereda los estilos de .form-input */
}


/* Estilos para el botón "Generar Automático" */
.generate-btn {
  padding: 12px 18px;
  background-color: #ff753a; /* Naranja */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* Evita que se encoja */
}

.generate-btn:hover {
  background-color: #ff5c1a; /* Naranja más oscuro */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}


/* Estilos para el botón "Guardar Panal" / "Guardar Cambios" */
.submit-btn {
  padding: 12px 25px;
  background-color: #ff753a; /* Naranja */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  margin-top: 15px; /* Espacio superior para alineación en grid */
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: auto; /* Ancho automático */
  /* width: 100%; */ /* Si quieres que ocupe todo el ancho disponible */
}

.submit-btn:hover {
  background-color: #ff5c1a; /* Naranja más oscuro */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}

.submit-btn:disabled {
    background-color: #ccc; /* Gris */
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Estilos para el spinner dentro del botón cuando está cargando */
.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite; /* Animación de giro */
  display: inline-block;
  margin-right: 8px; /* Espacio entre spinner y texto */
  vertical-align: middle; /* Alinea verticalmente con el texto */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* Estilo para el texto de recomendación de fecha */
.mensaje-recomendacion {
 /* height: 1.2em; */ /* Remover si el error puede ser más alto */
 margin-top: 4px;
 color: #555;
 font-size: 12px;
}

.mensaje-recomendacion small {
 color: inherit;
 font-size: inherit;
}

/* Estilos para los mensajes de error locales por campo */
.field-error-message {
  color: red; /* Rojo */
  font-size: 12px;
  margin-top: -4px; /* Ajusta el margen para que esté cerca del input */
  /* height: 1.2em; */ /* Opcional: reservar espacio */
}

/* Estilos para mensajes de error generales que vienen del store */
.general-error-message {
    grid-column: 1 / -1; /* Ocupa todas las columnas en grid */
    color: red;
    margin-top: 1rem;
    text-align: center;
    font-weight: bold;
    padding: 10px;
    border: 1px dashed red;
    background-color: #ffe5e5; /* Fondo rojo claro */
    border-radius: 4px;
}


/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
    gap: 20px; /* Reducir gap entre filas */
  }

   /* Ajusta el gap en la última fila también */
  .form-row:last-child {
       grid-template-columns: 1fr;
       gap: 20px;
       align-items: stretch; /* Estirar items */
  }

  .form-container {
    padding: 15px;
    margin: 15px auto; /* Ajustar margen y centrar */
  }

  h2 {
    font-size: 1.3rem;
    padding: 10px;
  }

  .registro-form {
    gap: 25px; /* Espacio entre filas */
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

