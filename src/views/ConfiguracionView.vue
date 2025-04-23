<template>
  <div class="config-container">
    <h2>Configuración de Usuario</h2>
    <div class="form-wrapper">

      <!-- CAMBIO DE CONTRASEÑA -->
      <section class="form-section password-section">
        <h3>Cambiar Contraseña</h3>
        <form @submit.prevent="cambiarContrasena">
          <label>
            Contraseña Actual:
            <input v-model="contrasenaActual" type="password" required />
          </label>
          <label>
            Nueva Contraseña:
            <input v-model="nuevaContrasena" type="password" required />
          </label>
          <label>
            Confirmar Nueva Contraseña:
            <input v-model="confirmarContrasena" type="password" required />
          </label>
          <button type="submit">Guardar Cambios</button>
        </form>
      </section>

      <!-- PREFERENCIAS DE NOTIFICACIÓN -->
      <section class="form-section notificaciones-section">
        <h3>Preferencias de Notificación</h3>
        <label class="notificacion-label">

          Quiero recibir notificaciones por correo sobre vencimiento de panales.
          <input type="checkbox" v-model="recibirNotificaciones" />
        </label>
        <button class="notificacion-btn" @click="guardarPreferencias">
          Guardar Preferencias
        </button>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracionView',
  data() {
    return {
      contrasenaActual: '',
      nuevaContrasena: '',
      confirmarContrasena: '',
      recibirNotificaciones: false,
    }
  },
  methods: {
    cambiarContrasena() {
      if (this.nuevaContrasena !== this.confirmarContrasena) {
        alert('Las contraseñas no coinciden')
        return
      }
      console.log('Contraseña cambiada correctamente')
      alert('Contraseña actualizada con éxito.')
    },
    guardarPreferencias() {
      console.log('Preferencia guardada:', this.recibirNotificaciones)
      alert('Preferencias guardadas correctamente.')
    },
  },
}
</script>

<style scoped>
/* Contenedor general */
.config-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

/* Títulos */
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #ff753a;
}

h3 {
  margin-bottom: 15px;
  color: #333333;
}

/* Secciones */
.form-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.form-section {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(232, 7, 7, 0.1);
  box-sizing: border-box;
}

/* Colores de fondo por sección */
.password-section {
  background-color: #ffffff;
  border: 2px solid #ff753a; /* Cambia el color del borde aquí */
  border-radius: 8px;
}

.notificaciones-section {
  background-color: fffff;
  border: 2px solid #ff753a;
}

/* Etiqueta de la notificación */
.notificacion-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #333;
  flex-wrap: wrap;
}

/* Estilo checkbox */
input[type='checkbox'] {
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
}

/* Botón */
.notificacion-btn {
  margin-top: 15px;
  padding: 10px 16px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 250px;
}

.notificacion-btn:hover {
  background-color: #e44d0e;
}

/* Campos de contraseña */
input[type='password'] {
  margin-top: 5px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ff753a;
}

/* Botones generales */
button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #e44d0e;
}

/* Responsive */
@media (max-width: 768px) {
  .form-wrapper {
    flex-direction: column;
  }

  .notificacion-label {
    flex-direction: column;
    align-items: flex-start;
  }

  .notificacion-btn {
    width: 100%;
  }
}
</style>
