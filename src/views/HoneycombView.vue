<template>
  <div class="form-container">
    <h2>Registro de Panal de Huevos</h2>
    <form @submit.prevent="guardarPanal" class="registro-form">
      <!-- Fila 1: ID + Tipo Huevo -->
      <div class="form-row">
        <div class="form-group">
          <label for="idPanal">ID del Panal</label>
          <div class="input-group">
            <input
              id="idPanal"
              v-model="panal.id"
              type="text"
              class="form-input"
              placeholder="Ingrese ID"
              autocomplete="off"
            />
            <button type="button" @click="generarIdAutomaticoClick" class="generate-btn">
              Generar Automático
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Huevo</label>
          <select v-model="panal.tipoHuevo" class="form-input" required>
            <option value="" disabled selected>Seleccione</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="AA">AA</option>
            <option value="AAA">AAA</option>
            <option value="Yumbo">Yumbo</option>
          </select>
        </div>
      </div>

      <!-- Fila 2: Cantidad + Galpón -->
      <div class="form-row">
        <div class="form-group">
          <label>Cantidad de Huevos</label>
          <input
            v-model.number="panal.cantidad"
            type="number"
            min="1"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label>Galpón o Lote</label>
          <input v-model="panal.galpon" type="text" class="form-input" required />
        </div>
      </div>

      <!-- Fila 3: Fechas -->
      <div class="form-row">
        <div class="form-group">
          <label>Fecha de Inicio</label>
          <input v-model="panal.fechaInicio" type="date" class="form-input" required />
        </div>

        <div class="form-group">
          <label>Fecha de Vencimiento</label>
          <input v-model="panal.fechaVencimiento" type="date" class="form-input" required />
          <div class="mensaje-error">
             <small><strong>Recomendación: </strong> La fecha de vencimiento no debe superar los 28 días desde la postura.</small>
          </div>
        </div>
      </div>

      <!-- Fila 4: Estado + Botón -->
      <div class="form-row">
        <div class="form-group">
          <label>Estado</label>
          <select v-model="panal.estado" class="form-input" required>
            <option value="Activo">Activo</option>            git pull origin test
          </select>
        </div>

        <div class="form-group">
          <button type="submit" class="submit-btn">Guardar Panal</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      panal: {
        id: '',
        tipoHuevo: '',
        cantidad: null,
        galpon: '',
        fechaInicio: '',
        fechaVencimiento: '',
        estado: 'Activo',
      },
      contadorID: 1, // Contador para generar ID automático
    }
  },



  methods: {
    generarIdAutomaticoClick() {
      const fecha = new Date()
      const year = fecha.getFullYear()
      const month = String(fecha.getMonth() + 1).padStart(2, '0')
      const day = String(fecha.getDate()).padStart(2, '0')
      const fechaFormateada = `${year}${month}${day}`

      // Generar ID con número secuencial y fecha
      this.panal.id = `EGG-${this.contadorID}-${fechaFormateada}`

      // Incrementar el contador
      this.contadorID++
    },

    guardarPanal() {
      if (new Date(this.panal.fechaVencimiento) < new Date(this.panal.fechaInicio)) {
        alert('¡La fecha de vencimiento debe ser posterior!')
        return
      }

      console.log('Panal guardado:', this.panal)
      alert('Registro exitoso!')
    },
  },
}
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

.mensaje-error {
  height: 1.2em; /* espacio reservado para el mensaje */
  margin-top: 4px;
  color: #ff5c1a;
  font-size: 12px;
}

.mensaje-error small {
  color: #050200;
  font-size: 12px;
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
}

.generate-btn:hover {
  background-color: #ff5c1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}

.submit-btn {
  padding: 12px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  margin:20px auto 0 auto;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.submit-btn:hover {
  background-color: #ff5c1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3);
}

.form-group:last-child {
  display: flex;
  justify-content: center;
}

/* Validación visual */
input:invalid,
select:invalid {
  border-color: #ff753a;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-container {
    padding: 15px;
    margin: 15px;
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

