<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu correo electrónico para recibir un enlace de recuperación.</p>
      <input
        type="email"
        v-model="email"
        placeholder="tu@email.com"
        required
        class="input-field"
      />
      <div class="modal-actions">
        <button @click="recoverPassword" :disabled="loading" class="btn-primary">
          {{ loading ? 'Enviando...' : 'Enviar' }}
        </button>
        <button @click="closeModal" class="btn-secondary">Cancelar</button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
// Importa useToast si lo usas para mostrar errores desde el componente, aunque el store ya lo hace
// import { useToast } from 'vue-toast-notification'; 

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const email = ref('');
const loading = ref(false);
const error = ref(null);

const authStore = useAuthStore();
// Si usas useToast aquí, asegúrate de que esté configurado globalmente en main.js
// const $toast = useToast(); 

const recoverPassword = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.recoverPassword(email.value);
    // ¡¡¡ ESTA LÍNEA ES LA QUE DEBES ELIMINAR !!!
    // alert('Se ha enviado un enlace de recuperación a tu correo.'); 
    closeModal();
  } catch (err) {
    // El 'authStore.recoverPassword' ya maneja la notificación toast de error.
    // Solo necesitas manejar la asignación del mensaje de error local si quieres que se muestre
    // también en el <p v-if="error"> del modal.
    switch (err.code) {
      case 'auth/invalid-email':
        error.value = 'El correo ingresado no es válido.';
        break;
      case 'auth/user-not-found':
        error.value = 'No existe un usuario registrado con este correo.';
        break;
      default:
        error.value = 'Ocurrió un error al intentar recuperar la contraseña. Inténtalo de nuevo.';
        // También puedes usar err.message si Firebase proporciona un mensaje más específico
        // error.value = err.message || 'Ocurrió un error al intentar recuperar la contraseña. Inténtalo de nuevo.';
    }
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = null;
  email.value = '';
  emit('close');
};
</script>

<style scoped>
/* Tus estilos CSS existentes */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}

.input-field {
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #ff753a;
  box-shadow: 0 0 4px rgba(255, 117, 58, 0.5);
}

.btn-primary {
  background-color: #ff753a; /* Naranja */
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #e56732; /* Naranja más oscuro */
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #e2e6ea;
}

.error-message {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>