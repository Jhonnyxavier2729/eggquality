<template>
  <form @submit.prevent="submit" class="auth-form">
    <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>

    <div class="form-group">
      <label for="email">Correo Electrónico</label>
      <input
        id="email"
        type="email"
        v-model="email"
        required
        placeholder="tu@email.com"
      />
    </div>

    <div class="form-group">
      <label for="password">Contraseña</label>
      <input
        id="password"
        type="password"
        v-model="password"
        required
        placeholder="••••••••"
        
      />
    </div>

    <div v-if="!isLogin" class="form-group">
      <label for="confirmPassword">Confirmar Contraseña</label>
      <input
        id="confirmPassword"
        type="password"
        v-model="confirmPassword"
        required
        placeholder="••••••••"
        
      />
    </div>

    <button type="submit" :disabled="loading" class="submit-btn">
      <span v-if="!loading">{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</span>
      <span v-else>Procesando...</span>
    </button>

    <div v-if="isLogin" class="forgot-password">
      <a href="#" @click.prevent="openPasswordRecoveryModal">¿Olvidaste tu contraseña?</a>
    </div>

    <div class="auth-switch">
      <span>{{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}</span>
      <button type="button" @click="toggleAuthMode" class="switch-btn">
        {{ isLogin ? 'Regístrate' : 'Inicia Sesión' }}
      </button>
    </div>

    <PasswordRecoveryModal
      :isVisible="isPasswordRecoveryModalVisible"
      @close="isPasswordRecoveryModalVisible = false"
    />
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

import PasswordRecoveryModal from './PasswordRecoveryModal.vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['toggle-auth-mode', 'submit']);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPasswordRecoveryModalVisible = ref(false);

const authStore = useAuthStore();
const toast = useToast();

const error = computed(() => authStore.error);
const loading = computed(() => authStore.loading);

const toggleAuthMode = () => {
  emit('toggle-auth-mode');
};

const openPasswordRecoveryModal = () => {
  isPasswordRecoveryModalVisible.value = true;
};

const submit = async () => {
  if (!props.isLogin) {
    if (!email.value || !password.value || !confirmPassword.value) {
      toast.warning('Por favor, completa todos los campos del formulario.');
      return;
    }

    if (password.value !== confirmPassword.value) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password.value);
    const hasLowerCase = /[a-z]/.test(password.value);
    const hasNumbers = /[0-9]/.test(password.value);

    if (
      password.value.length < minLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumbers
    ) {
      let message = `La contraseña debe tener al menos ${minLength} caracteres, incluyendo mayúsculas, minúsculas y números.`;
      if (password.value.length < 12) {
      }
      toast.warning(message);
      return;
    }
  } else {
    if (!email.value || !password.value) {
      toast.warning('Por favor, ingresa tu correo y contraseña.');
      return;
    }
  }

  emit('submit', {
    email: email.value,
    password: password.value,
  });
};
</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #000;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #000;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus {
  border-color: #ff753a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 117, 58, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #ff753a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #e56732;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.switch-btn {
  background: none;
  border: none;
  color: #ffd147;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.5rem;
}

.switch-btn:hover {
  color: #ffc107;
}

.forgot-password {
  text-align: center;
  margin-top: 1rem;
}

.forgot-password a {
  color: #ff753a;
  text-decoration: none;
  cursor: pointer;
}

.forgot-password a:hover {
  color: #e56732;
}
</style>
