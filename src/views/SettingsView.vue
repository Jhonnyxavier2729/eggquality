<template>
  <div class="config-container">
    <h2>Configuración de Usuario</h2>
    <div class="form-wrapper">

      <!-- DATOS DE USUARIO -->
      <section class="form-section user-data-section">
        <h3>Datos de Usuario</h3>
        <form @submit.prevent="guardarDatosUsuario">
          <label>
            Correo Electrónico:
            <input type="email" v-model="user.email" disabled />
          </label>
        </form>
      </section>

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
          <button type="submit" class="centered-button">Guardar Cambios</button>
        </form>
      </section>

      <!-- PREFERENCIAS DE NOTIFICACIÓN -->
      <section class="form-section notificaciones-section">
        <h3>Preferencias de Notificación</h3>
        <label class="notificacion-label">
          Quiero recibir notificaciones por correo sobre vencimiento de panales.
          <input type="checkbox" v-model="recibirNotificaciones" @change="guardarPreferencias"/>
        </label>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracionView',
  data() {
    return {
      user: {
        email: 'usuario@ejemplo.com', // Simulación de datos de usuario
      },
      contrasenaActual: '',
      nuevaContrasena: '',
      confirmarContrasena: '',
      recibirNotificaciones: false,
    }
  },
  methods: {
    guardarDatosUsuario() {
      console.log('Datos de usuario guardados:', this.user)
      alert('Datos de usuario guardados correctamente.')
    },
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
  display: flex; /* Flexbox para alinear en fila */
  justify-content: space-between; /* Espacio uniforme entre secciones */
  gap: 20px; /* Espaciado entre secciones */
  flex-wrap: nowrap; /* Evita que las secciones se apilen */
}

.form-section {
  flex: 1; /* Todas las secciones ocupan el mismo espacio */
  min-width: 300px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(232, 7, 7, 0.1);
  box-sizing: border-box;
}

/* Ajustes específicos para cada sección */
.user-data-section {
  background-color: #f9f9f9;
  border: 2px solid #ff753a;
}

.password-section {
  background-color: #ffffff;
  border: 2px solid #ff753a;
}

.notificaciones-section {
  background-color: #ffffff;
  border: 2px solid #ff753a;
}

/* Botones */
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

/* Campos de entrada */
input[type='email'],
input[type='password'] {
  margin-top: 5px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ff753a;
}

/* Centrar el botón dentro del formulario */
form {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido horizontalmente */
}

.centered-button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.centered-button:hover {
  background-color: #e44d0e;
}
/* Responsive */
@media (max-width: 768px) {
  .form-wrapper {
    flex-direction: column; /* Apila las secciones en pantallas pequeñas */
  }

  .form-section {
    flex: 1 0 100%; /* Cada sección ocupa todo el ancho */
  }
}
</style>
