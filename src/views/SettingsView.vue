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
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const authStore = useAuthStore();

// --- Estados para el formulario de Cambio de Contraseña ---
const contrasenaActual = ref('');
const nuevaContrasena = ref('');
const confirmarContrasena = ref('');

// --- Estados para el formulario de Preferencias ---
const recibirNotificaciones = ref(false);

// --- Computed para mostrar el correo del usuario ---
const emailUsuario = computed(() => authStore.user?.email || '');

// ===> Lógica para Cambio de Contraseña <===
const cambiarContrasena = async () => {
  authStore.error = null;

  if (!contrasenaActual.value || !nuevaContrasena.value || !confirmarContrasena.value) {
    toast.warning('Por favor, completa todos los campos de contraseña.');
    return;
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    toast.error('La nueva contraseña y su confirmación no coinciden.');
    return;
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(nuevaContrasena.value);
  const hasLowerCase = /[a-z]/.test(nuevaContrasena.value);
  const hasNumbers = /[0-9]/.test(nuevaContrasena.value);

  if (nuevaContrasena.value.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
    let message = `La nueva contraseña debe tener al menos ${minLength} caracteres, incluyendo mayúsculas, minúsculas y números.`;
    if (nuevaContrasena.value.length < 12) {
      message += ' Recomendado: al menos 12 caracteres para mayor seguridad.';
    }
    toast.warning(message);
    return;
  }

  if (!authStore.user) {
    toast.error('No hay usuario autenticado.');
    return;
  }

  try {
    await authStore.updateUserPasswordWithReauth(contrasenaActual.value, nuevaContrasena.value);
    toast.success('Contraseña actualizada con éxito.');
    contrasenaActual.value = '';
    nuevaContrasena.value = '';
    confirmarContrasena.value = '';
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    const errorMessage = authStore.error || error.message || 'Ocurrió un error desconocido al cambiar la contraseña.';
    toast.error(`Error: ${errorMessage}`);
  }
};

// --- Computed para el texto dinámico del botón ---
const textoBotonGuardarContrasena = computed(() =>
  authStore.loading ? 'Guardando Contraseña...' : 'Guardar Cambios'
);

// --- Lógica para Guardar Preferencias ---
const guardarPreferencias = async () => {
  authStore.error = null;

  if (!authStore.user) {
    toast.error('No hay usuario autenticado para guardar preferencias.');
    return;
  }

  try {
    console.log('Simulando guardado de preferencia "recibirNotificaciones":', recibirNotificaciones.value);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Preferencias guardadas correctamente.');
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    const errorMessage = authStore.error || error.message || 'Error desconocido al guardar preferencias.';
    toast.error(`Error al guardar preferencias: ${errorMessage}`);
  }
};
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
  flex-wrap: wrap;
}

.form-section {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.user-data-section,
.password-section,
.notificaciones-section {
  background-color: #ffffff;
  border: 2px solid #ff753a;
}

.user-data-section {
  background-color: #f9f9f9;
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
