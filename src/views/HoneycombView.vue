<template>
  <div class="page-content" :class="{ 'sidebar-hidden': !isSidebarOpen }">
    <div class="form-wrapper">
      <div class="form-container">
        <h2>{{ isEditing ? 'Editar Panal de Huevos' : 'Registro y Control de Panales' }}</h2>

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
                <button type="button" @click="generarIdAutomatico" class="generate-btn" v-if="!isEditing">
                  Generar Automático
                </button>
                <div v-if="formErrors.idPanal" class="field-error-message">{{ formErrors.idPanal }}</div>
              </div>
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
              <label for="cantidadPanales">Cantidad de Panales</label>
              <input
                id="cantidadPanales"
                v-model.number="formData.cantidadPanales"
                type="number"
                min="1"
                class="form-input"
                required
                :class="{ 'is-invalid': formErrors.cantidadPanales }"
              />
              <div v-if="formErrors.cantidadPanales" class="field-error-message">{{ formErrors.cantidadPanales }}</div>
            </div>
          </div>

          <div class="form-row">
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
          </div>

          <div class="form-row last-form-row">
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
                <small><strong>Recomendación: </strong>La fecha de vencimiento no debe superar los 28 días desde la postura.</small>
              </div>
              <div v-if="dateError" class="field-error-message">{{ dateError }}</div>
              <div v-if="formErrors.fechaVencimiento" class="field-error-message">{{ formErrors.fechaVencimiento }}</div>
            </div>

            <div class="form-group action-or-state-group">
              <template v-if="isEditing">
                <label for="estado">Estado</label>
                <select
                  id="estado"
                  v-model="formData.estado"
                  class="form-input"
                  required
                  :class="{ 'is-invalid': formErrors.estado }"
                >
                  <option value="Activo">Activo</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Vendido">Vendido</option>
                </select>
                <div v-if="formErrors.estado" class="field-error-message">{{ formErrors.estado }}</div>
                <div class="mensaje-recomendacion placeholder-height"></div>
              </template>

              <template v-else>
                <div class="placeholder-label-height"></div>

                <button type="submit" class="submit-btn full-width-btn" :disabled="panalesStore.loading">
                  <span v-if="!panalesStore.loading">GUARDAR PANAL</span>
                  <span v-else>
                    <span class="loading-spinner"></span> Guardando Panal...
                  </span>
                </button>

                <div class="mensaje-recomendacion placeholder-height"></div>
                <div class="field-error-message placeholder-height"></div>
              </template>
            </div>
          </div>

          <div class="form-row submit-button-row-editing" v-if="isEditing">
            <div class="form-group submit-group-editing">
              <button type="submit" class="submit-btn" :disabled="panalesStore.loading">
                <span v-if="!panalesStore.loading">GUARDAR CAMBIOS</span>
                <span v-else>
                  <span class="loading-spinner"></span> Guardando Cambios...
                </span>
              </button>
            </div>
          </div>
        </form>

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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePanalesStore } from '@/stores/panalesStore';
import { useRoute, useRouter } from 'vue-router';
import ConfirmModal from '@/components/auth/ConfirmModal.vue';

defineProps({
  isSidebarOpen: Boolean
});

const showSaveConfirm = ref(false);
const panalesStore = usePanalesStore();
const route = useRoute();
const router = useRouter();

const formData = ref({
  idPanal: '',
  tipoHuevo: '',
  cantidadHuevos: null,
  cantidadPanales: null,
  galponLote: '',
  fechaInicio: '',
  fechaVencimiento: '',
  estado: 'Activo',
});

const isEditing = computed(() => !!route.params.id);
const currentPanalId = computed(() => route.params.id || null);

const formErrors = ref({});
const dateError = ref(null);
const contadorID = ref(1);

onMounted(async () => {
  panalesStore.error = null;
  dateError.value = null;
  formErrors.value = {};

  if (isEditing.value) {
    console.log('Modo edición detectado. ID del panal:', currentPanalId.value);
    const panalToEdit = await panalesStore.fetchSinglePanal(currentPanalId.value);
    if (panalToEdit) {
      formData.value = {
        idPanal: panalToEdit.idPanal,
        tipoHuevo: panalToEdit.tipoHuevo,
        cantidadHuevos: panalToEdit.cantidadHuevos,
        cantidadPanales: panalToEdit.cantidadPanales,
        galponLote: panalToEdit.galponLote,
        fechaInicio: panalToEdit.fechaInicio,
        fechaVencimiento: panalToEdit.fechaVencimiento,
        estado: panalToEdit.estado,
      };
    } else {
      console.error('Error: Panal con ID', currentPanalId.value, 'no encontrado.');
    }
  } else {
    resetForm();
  }
});

const validateForm = () => {
  formErrors.value = {};
  let isValid = true;

  if (!formData.value.idPanal) { formErrors.value.idPanal = 'El ID del Panal es obligatorio.'; isValid = false; }
  if (!formData.value.tipoHuevo) { formErrors.value.tipoHuevo = 'El Tipo de Huevo es obligatorio.'; isValid = false; }
  if (formData.value.cantidadHuevos === null || formData.value.cantidadHuevos <= 0) { formErrors.value.cantidadHuevos = 'La Cantidad de Huevos debe ser un número positivo.'; isValid = false; }
  if (formData.value.cantidadPanales === null || formData.value.cantidadPanales <= 0) { formErrors.value.cantidadPanales = 'La Cantidad de Panales debe ser un número positivo.'; isValid = false; }
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

const handleSubmit = async () => {
  panalesStore.error = null;
  dateError.value = null;
  formErrors.value = {};

  if (!validateForm()) {
    console.log('Validación del formulario fallida.');
    return;
  }

  console.log('Formulario validado. Intentando guardar/actualizar panal con datos:', formData.value);

  if (isEditing.value) {
    console.log('Modo edición: Mostrando modal de confirmación para guardar cambios.');
    showSaveConfirm.value = true;
  } else {
    console.log('Modo registro: Llamando a savePanal directamente.');
    try {
      const docId = await panalesStore.savePanal(formData.value);
      console.log('Panal guardado con ID:', docId);
      resetForm();
    } catch (error) {
      console.error('Error al guardar panal desde la vista:', error);
    }
  }
};

const executeSave = async () => {
  console.log('Confirmado guardar cambios. Ejecutando updatePanal.');
  panalesStore.error = null;

  try {
    const updatedData = { ...formData.value };
    await panalesStore.updatePanal(currentPanalId.value, updatedData);
    console.log('Panal actualizado con ID:', currentPanalId.value);
    showSaveConfirm.value = false;
    router.push({ name: 'honeycomb-list' });
  } catch (error) {
    console.error('Error al actualizar panal desde la vista:', error);
    showSaveConfirm.value = false;
  }
};

const cancelSave = () => {
  console.log('Guardar cambios cancelado por el usuario.');
  showSaveConfirm.value = false;
};

const resetForm = () => {
  formData.value = {
    idPanal: '',
    tipoHuevo: '',
    cantidadHuevos: null,
    cantidadPanales: null,
    galponLote: '',
    fechaInicio: '',
    fechaVencimiento: '',
    estado: 'Activo',
  };
  dateError.value = null;
  formErrors.value = {};
  panalesStore.error = null;
};

watch(() => route.params.id, (newId, oldId) => {
  console.log('Cambio de ID en ruta:', oldId, '->', newId);
  if (!newId && oldId) {
    console.log('Detectado cambio de modo edición a registro. Reseteando formulario.');
    resetForm();
  }
});
</script>
<style scoped>
/* --- ESTILOS BASE (para móviles pequeños, por defecto < 600px) --- */

.page-content {
    position: relative;
    padding: 1rem;
    transition: margin-left 0.3s ease;
}

.form-wrapper {
    max-width: 100%; /* Por defecto, ocupa todo el ancho disponible */
    margin: 0rem auto; /* Centra el contenido horizontalmente en pantallas pequeñas */
    transition: max-width 0.3s ease;
}

.form-container {
    padding: 1rem;
    width: 100%; /* Asegura que ocupe todo el ancho de su padre .form-wrapper */
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #eee9e7;
    position: relative;}

.mensaje-recomendacion {
    height: 1.2em;
    min-height: 1.2em;
    margin-top: 4px;
    color: #555;
    font-size: 12px;
}

.mensaje-recomendacion small {
    color: inherit;
    font-size: inherit;
}

.field-error-message {
    color: red;
    font-size: 11px;
    margin-top: 6px;
    min-height: 1.2em;
}

/* Nuevos placeholders para simular la altura de la etiqueta y el input */
.placeholder-label-height {
    visibility: hidden;
    min-height: 0.9rem; /* Altura de la etiqueta. Ajustar si el font-size de label es diferente */
    margin-bottom: 6px; /* Misma que el gap del form-group */
}

.placeholder-input-height {
    visibility: hidden;
    min-height: calc(0.75rem + 1rem + 0.75rem + 1px + 1px); /* Aprox 1rem = 16px. 0.75rem = 12px. 12+16+12+1+1 = 42px */
    margin-bottom: 4px; /* Misma que el gap del form-group o entre input y mensaje */
}

.placeholder-height { /* Este placeholder ya existía para simular altura de mensajes */
    visibility: hidden;
    min-height: 1.2em; /* Asegura altura mínima */
    margin-top: 4px;
}
h2 {
    text-align: center;
    color: rgb(12, 3, 3);
    font-size: 1.5rem;
    padding: 0.8rem;
    letter-spacing: 0.5px;
}

.registro-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr; /* Móviles, apilado */
    gap: 1rem; /* Espacio entre los form-group dentro de una fila */
    align-items: start;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px; /* Espacio entre label, input y mensajes dentro del form-group */
}

label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
    margin-left: 0;
}

.form-input {
    font-size: 1rem;
    padding: 0.75rem;
    border: 1.5px solid #ff753a;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #ff5c1a;
    box-shadow: 0 0 0 2px rgba(255, 117, 58, 0.3);
}

.form-input.is-invalid {
    border-color: red;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

.input-group {
    display: flex;
    flex-direction: column; /* Apilado por defecto en móviles */
    gap: 0.8rem;
    width: 100%;
}

.input-group input {
    flex-grow: 1;
}

.generate-btn {
    padding: 0.75rem 1.2rem;
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    width: 100%; /* Ocupa todo el ancho en móviles */
}

.generate-btn:hover {
    background-color: #ff5c1a;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(255, 117, 58, 0.3);
}

.submit-btn {
    padding: 0.8rem 1.5rem;
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
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

.general-error-message {
    grid-column: 1 / -1;
    color: red;
    margin-top: 0.8rem;
    text-align: center;
    font-weight: bold;
    padding: 0.8rem;
    border: 1px dashed red;
    background-color: #ffe5e5;
    border-radius: 4px;
    font-size: 0.9rem;
}

/* --- ESTILOS ESPECÍFICOS PARA LA ÚLTIMA FILA DEL FORMULARIO --- */
.form-row.last-form-row {
    display: grid;
    grid-template-columns: 1fr; /* Móviles, apilado */
    gap: 1rem;
    align-items: start;
}

.form-row.last-form-row > .form-group {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
}

.submit-btn.full-width-btn {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
}

.form-row.submit-button-row-editing {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
    grid-column: 1 / -1;
}

.form-group.submit-group-editing {
    width: 100%;
    max-width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}


/* --- Media Query para Móviles Grandes y Tablets pequeñas ( >= 600px ) --- */
@media (min-width: 600px) {
    .page-content {
        padding: 1.5rem;
    }
    .form-container {
        padding: 1.5rem;
    }
    .form-wrapper {
        max-width: 90%; /* Ejemplo para tablets */
    }

    h2 {
        font-size: 1.5rem;
        padding: 1rem;
    }

    .registro-form {
        gap: 1.2rem;
    }

    .form-row {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .form-row.last-form-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .input-group {
        flex-direction: row;
        gap: 10px;
    }

    .generate-btn {
        width: auto;
    }
}


/* --- Media Query para Tablets Grandes y Escritorios ( >= 768px ) --- */
@media (min-width: 768px) {
    .page-content {
        padding: 2rem;
    }
    .form-container {
        padding: 2rem;
    }
    .form-wrapper {
        max-width: 80%; /* Ejemplo para tablets grandes */
    }

    h2 {
        font-size: 1.5rem;
    }

    .registro-form {
        gap: 1.5rem;
    }

    .form-row {
        gap: 20px;
    }

    .form-row.last-form-row {
        gap: 20px;
    }

    label {
        font-size: 1rem;
    }
}

/* --- Media Query para Escritorios ( >= 1024px ) --- */
@media (min-width: 1024px) {
    .page-content {
        margin-left: 280px;
        padding: 2rem; /* Mantén tu padding base aquí */
    }

    /* El .form-wrapper manejará el max-width y centrado dentro del .page-content */
    .form-wrapper {
        max-width: 900px; /* Ancho deseado cuando el sidebar está PRESENTE */
        margin: 0rem auto 0; /* Centra el form-wrapper horizontalmente dentro de page-content */
    }

    /* ESTADO ALTERNATIVO (SIDEBAR OCULTO) */
    .page-content.sidebar-hidden {
        margin-left: 0; /* Cuando el sidebar está oculto, el margen se va a cero */
    }

    /* Cuando el sidebar está OCULTO, el form-wrapper se ensancha */
    .page-content.sidebar-hidden .form-wrapper {
        max-width: 1100px; /* Ancho deseado cuando el sidebar está OCULTO */
    }
    h2 {
        font-size: 1.5rem;
        margin-bottom: 2rem;
    }

    .registro-form {
        gap: 25px;
    }

    .form-row {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .form-row.last-form-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }

    label {
        margin-left: 5px;
    }
}

/* --- Media Query para Pantallas Ultra Grandes ( >= 2500px ) --- */
@media (min-width: 2500px) {
    .form-wrapper {
        margin-top: 4rem; /* Ajusta el margen superior si lo deseas */
        max-width: 1400px; /* Ancho máximo para el formulario en pantallas muy grandes */
    }
    .page-content.sidebar-hidden .form-wrapper {
        max-width: 1600px; /* Ejemplo: se ensancha aún más cuando el sidebar está oculto */
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
