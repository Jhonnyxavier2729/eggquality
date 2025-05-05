<template>
  <div class="config-container">
    <h2>Configuración de Usuario</h2>
    <div class="form-wrapper">

      <section class="form-section user-data-section">
        <h3>Datos de Usuario</h3>
        <!-- Este formulario estaba vacío, se eliminó -->
        <label>
          Correo Electrónico:
          <input type="email" :value="emailUsuario" disabled class="form-input" />
        </label>
      </section>

      <section class="form-section password-section">
        <h3>Cambiar Contraseña</h3>
        <form @submit.prevent="cambiarContrasena">
          <label>
            Contraseña Actual:
            <input v-model="contrasenaActual" type="password" required class="form-input" />
          </label>
          <label>
            Nueva Contraseña:
            <input v-model="nuevaContrasena" type="password" required class="form-input" />
          </label>
          <label>
            Confirmar Nueva Contraseña:
            <input v-model="confirmarContrasena" type="password" required class="form-input" />
          </label>
          <button type="submit" class="centered-button" :disabled="authStore.loading">
            {{ textoBotonGuardarContrasena }}
          </button>
        </form>
      </section>

      <section class="form-section notificaciones-section">
        <h3>Preferencias de Notificación</h3>
        <label class="notificacion-label">
          Quiero recibir notificaciones por correo sobre vencimiento de panales.
          <input type="checkbox" v-model="recibirNotificaciones" />
        </label>
        <button class="notificacion-btn" @click="guardarPreferencias" :disabled="authStore.loading">
          Guardar Preferencias
        </button>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed /* onMounted */ } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const authStore = useAuthStore();

const contrasenaActual = ref('');
const nuevaContrasena = ref('');
const confirmarContrasena = ref('');

const recibirNotificaciones = ref(false);

const emailUsuario = computed(() => authStore.user?.email || '');

const cambiarContrasena = async () => {
  authStore.error = null;

  if (!authStore.user) {
    toast.error('No hay usuario autenticado.');
    return;
  }

  if (!contrasenaActual.value || !nuevaContrasena.value || !confirmarContrasena.value) {
    toast.warning('Por favor, completa todos los campos de contraseña.');
    return;
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    toast.error('Las nuevas contraseñas no coinciden.');
    return;
  }

  try {
    // await authStore.reauthenticateUser(contrasenaActual.value); // Implementar en tu store si es necesario
    await authStore.updateUserPassword(nuevaContrasena.value);
    toast.success('Contraseña actualizada con éxito.');
    contrasenaActual.value = '';
    nuevaContrasena.value = '';
    confirmarContrasena.value = '';
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    const errorMessage = authStore.error || error.message || 'Error desconocido al cambiar contraseña.';
    toast.error(`Error al cambiar contraseña: ${errorMessage}`);
  }
};

const textoBotonGuardarContrasena = computed(() =>
  authStore.loading ? 'Guardando Contraseña...' : 'Guardar Cambios'
);

const guardarPreferencias = async () => {
  authStore.error = null;

  if (!authStore.user) {
    toast.error('No hay usuario autenticado para guardar preferencias.');
    return;
  }

  try {
    // await authStore.updateUserPreferences({ recibirNotificaciones: recibirNotificaciones.value });
    console.log('Simulando guardado:', recibirNotificaciones.value);
    await new Promise(resolve => setTimeout(resolve, 500)); // Quitar en producción
    toast.success('Preferencias guardadas correctamente.');
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    const errorMessage = authStore.error || error.message || 'Error desconocido al guardar preferencias.';
    toast.error(`Error al guardar preferencias: ${errorMessage}`);
  }
};

// onMounted(() => {
//   recibirNotificaciones.value = authStore.user?.preferences?.recibirNotificaciones || false;
// });
</script>

<style scoped>
.config-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #ff753a;
}

h3 {
  margin-bottom: 15px;
  color: #333333;
}

.form-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: nowrap;
}

.form-section {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(232, 7, 7, 0.1);
  box-sizing: border-box;
}

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

.notificacion-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #333;
  flex-wrap: wrap;
}

input[type='checkbox'] {
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
}

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

.notificacion-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

input[type='email'],
input[type='password'] {
  margin-top: 5px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ff753a;
}

input:disabled {
  background-color: #e9e9e9;
  color: #555;
  cursor: not-allowed;
}

form {
  display: flex;
  flex-direction: column;
}

form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

form input[type='password'],
form input[type='email'] {
  margin-bottom: 15px;
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
  align-self: center;
}

.centered-button:hover {
  background-color: #e44d0e;
}

@media (max-width: 768px) {
  .form-wrapper {
    flex-direction: column;
    gap: 15px;
  }

  .form-section {
    flex: 1 0 100%;
    min-width: auto;
  }

  .notificacion-label {
    flex-direction: column;
    align-items: flex-start;
  }

  .notificacion-btn {
    width: 100%;
    max-width: none;
  }

  form {
    gap: 10px;
    align-items: stretch;
  }

  form input[type='password'],
  form input[type='email'] {
    margin-bottom: 10px;
  }

  .centered-button {
    align-self: stretch;
  }
}
</style>
