<template>
  <div class="settings-view">
    <h2>Configuración</h2>
    
    <div class="settings-grid">
      <div class="settings-card">
        <h3>Perfil</h3>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" v-model="user.name" />
        </div>
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="user.email" disabled />
        </div>
        <button class="save-btn">Guardar Cambios</button>
      </div>
      
      <div class="settings-card">
        <h3>Seguridad</h3>
        <button class="change-password-btn" @click="changePassword">
          Cambiar Contraseña
        </button>
        <button class="logout-btn" @click="logout">
          Cerrar Sesión
        </button>
      </div>
      
      <div class="settings-card">
        <h3>Preferencias</h3>
        <div class="form-group">
          <label>Tema</label>
          <select v-model="theme">
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const user = ref({
  name: 'Usuario Ejemplo',
  email: authStore.user?.email || 'user@example.com'
});

const theme = ref('light');

const changePassword = () => {
  console.log('Función para cambiar contraseña no implementada.');
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.settings-view {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.settings-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-btn,
.change-password-btn,
.logout-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn {
  background-color: #f44336;
}
</style>