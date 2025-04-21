<template>
  <AuthLayout>
    <AuthForm :isLogin="false" @submit="register" @toggle-auth-mode="goToLogin" />
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

const goToLogin = () => {
  router.push('/login'); // Redirige a la página de inicio de sesión
};

const register = async (formData) => {
  try {
    await authStore.register(formData.email, formData.password);
    router.push('/dashboard'); // Redirige al dashboard después del registro exitoso
  } catch (error) {
    console.error('Error al registrarse:', error.message);
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