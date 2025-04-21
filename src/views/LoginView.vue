<template>
  <AuthLayout>
    <AuthForm :isLogin="true" @submit="login" @toggle-auth-mode="goToRegister" />
    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/components/auth/AuthLayout.vue';
import AuthForm from '@/components/auth/AuthForm.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const goToRegister = () => {
  router.push('/register'); // Redirige a la página de registro
};

const login = async (formData) => {
  try {
    await authStore.login(formData.email, formData.password);
    router.push('/dashboard'); // Redirige al dashboard solo si el inicio de sesión es exitoso
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    
  }
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>