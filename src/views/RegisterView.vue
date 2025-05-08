<template>
  <AuthLayout>
    <!-- Asegúrate de que isLogin sea false para la vista de registro -->
    <AuthForm :isLogin="false" @submit="register" @toggle-auth-mode="goToLogin" />
  </AuthLayout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

import AuthLayout from '@/components/auth/AuthLayout.vue';
import AuthForm from '@/components/auth/AuthForm.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const goToLogin = () => {
  router.push('/login');
};

const register = async (formData) => {
  authStore.error = null;

  try {
    console.log('Vista de Registro: Llamando a authStore.register...');
    await authStore.register(formData.email, formData.password);

    toast.success('Registro exitoso.');
    console.log('Registro exitoso. Redirigiendo al dashboard.');
    router.push('/dashboard');
  } catch (error) {
    console.error('Vista de Registro: Error capturado al registrarse:', error);

    const errorMessage =
      authStore.error || error.message || 'Ocurrió un error inesperado durante el registro.';

    toast.error(`Error: ${errorMessage}`);
  }
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>
