<template>
  <form @submit.prevent="submit" class="auth-form">
    <h2>{{ isLogin ? 'Login' : 'Registrarse' }}</h2>

    <div v-if="!isLogin" class="form-group">
      <label for="username">Nombre de Usuario</label>
      <input
        id="username"
        type="text"
        v-model="username"
        required
        placeholder="Ej: Jhonnyx12"
      />
    </div>

    <div class="form-group">
      <label for="email">Correo Electrónico</label>
      <input
        id="email"
        type="email"
        v-model="email"
        required
        placeholder="Tu@email.com"
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

    <div v-if="isLogin" class="forgot-password">
      <a href="#" @click.prevent="openPasswordRecoveryModal">¿Restablecer contraseña?</a>
    </div>

    <button type="submit" :disabled="loading" class="submit-btn">
      <span v-if="!loading">{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</span>
      <span v-else>Procesando...</span>
    </button>

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

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPasswordRecoveryModalVisible = ref(false);

const authStore = useAuthStore();
const toast = useToast();

const loading = computed(() => authStore.loading);

const toggleAuthMode = () => {
  emit('toggle-auth-mode');
};

const openPasswordRecoveryModal = () => {
  isPasswordRecoveryModalVisible.value = true;
};

const submit = async () => {
  if (!props.isLogin) {
    if (!username.value || !email.value || !password.value || !confirmPassword.value) {
      toast.warning('Por favor, completa todos los campos del formulario, incluyendo el nombre de usuario.');
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
    username: username.value,
    isLogin: props.isLogin
  });
};
</script>

<style scoped>
/* Estilos Base (Escritorio - por defecto) */
.auth-form {
  width: 100%;
  max-width: 380px; /* Ancho máximo en escritorio */
  padding: 0; /* Tu padding original es 0 en el CSS base */
  box-sizing: border-box; /* Fundamental para la responsividad */
  /* Eliminado: background-color, border-radius, box-shadow */
}

h2 {
  color: #000;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem; /* Tu tamaño original */
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
  box-sizing: border-box; /* Fundamental para que el padding no desborde */
}

input:focus {
  border-color: #ff753a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 117, 58, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #fefdfd; /* Tu color original */
  color: rgb(8, 0, 0); /* Tu color original */
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #fdfcfb;
}

.submit-btn:disabled {
  background-color: #bbbab6;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  color: white;
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
  color:#ffd147;
}

.forgot-password {
  text-align: right;
  margin-top: 1rem;
}

.forgot-password a {
  color: #f6f3f2;
  text-decoration: none;
  cursor: pointer;
}



/* ======================================= */
/* MEDIA QUERIES PARA RESPONSIVIDAD */
/* (Solo ajustes de tamaño y espaciado) */
/* ======================================= */

/* --- Para pantallas de hasta 768px (móviles y tablets pequeñas) --- */
@media (max-width: 768px) {
  .auth-form {
    /* Permitimos que el formulario ocupe casi todo el ancho disponible */
    max-width: 90%; /* Ocupa el 90% del ancho del viewport */
    margin: 1.5rem auto; /* Centra el formulario y añade margen vertical */
    padding: 0 1rem; /* Reducir padding horizontal, manteniendo el vertical si lo tuvieras */
                     /* Si el formulario se encuentra dentro de un contenedor con padding,
                        este padding interno de 1rem es para que los elementos no se peguen a los bordes del form. */
  }

  h2 {
    font-size: 1.8rem; /* Reducir tamaño de título */
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.2rem; /* Reducir espacio entre grupos de formulario */
  }

  label {
    font-size: 0.9rem; /* Reducir tamaño de etiqueta */
    margin-bottom: 0.4rem;
  }

  input {
    padding: 10px 12px; /* Reducir padding de inputs */
    font-size: 0.9rem; /* Reducir tamaño del texto en los inputs */
  }

  .submit-btn {
    padding: 12px; /* Reducir padding del botón */
    font-size: 0.95rem; /* Reducir tamaño del texto del botón */
    margin-top: 1.2rem;
  }

  .auth-switch {
    margin-top: 1.2rem;
    font-size: 0.9rem; /* Reducir tamaño del texto de switch */
  }

  .switch-btn {
    font-size: 0.9rem; /* Asegura que el botón de switch también se adapte */
  }

  .forgot-password {
    font-size: 0.85rem; /* Reducir tamaño del texto de contraseña olvidada */
    margin-top: 0.8rem;
  }
}

/* --- Para pantallas de hasta 480px (móviles muy pequeños) --- */
@media (max-width: 480px) {
  .auth-form {
    padding: 0 0.5rem; /* Mínimo padding horizontal para pantallas muy pequeñas */
    max-width: 95%; /* Ocupa casi todo el ancho */
    margin: 1rem auto;
  }

  h2 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  label, input, .submit-btn, .auth-switch, .forgot-password {
    font-size: 0.8rem; /* Escalar todo un poco más */
  }
  .submit-btn {
    padding: 8px; /* Reducir un poco más el padding del botón */
  }
}
</style>
