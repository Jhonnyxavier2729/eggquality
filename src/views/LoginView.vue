<template>
  <AuthLayout>
    <AuthForm :isLogin="true" @submit="login" @toggle-auth-mode="goToRegister" />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/components/auth/AuthLayout.vue';
import AuthForm from '@/components/auth/AuthForm.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const goToRegister = () => {
  router.push('/register'); // Redirige a la página de registro
};

// ===> Función de LOGIN (Corregida para mostrar Toast) <===
const login = async (formData) => {
  // Limpiar error previo del store (AuthForm ya lo hace al inicio de su submit)
  authStore.error = null;

  // Opcional: Validar campos vacíos en el front-end (AuthForm ya lo hace si seguiste la última corrección)
  // if (!formData.email || !formData.password) {
  //    toast.warning('Por favor, ingresa tu correo y contraseña.');
  //    return;
  // }

  try {
    console.log('Vista de Login: Llamando a authStore.login...');
    await authStore.login(formData.email, formData.password);

    // Si la acción del store es exitosa (no lanza error), muestra el toast de éxito y redirige
    toast.success('Inicio de sesión exitoso.');
    console.log('Inicio de sesión exitoso. Redirigiendo al dashboard.');
    router.push('/dashboard'); // Redirige al dashboard solo si el inicio de sesión es exitoso

  } catch (error) {
    // ===> 3. Este catch recibe el error relanzado por la acción del store <===
    console.error('Vista de Login: Error capturado al iniciar sesión:', error); // Log del error completo

    // El store ya estableció authStore.error con el mensaje amigable (ej: 'Contraseña incorrecta.') si el error es conocido.
    // Usa ese mensaje (o el mensaje original del error si el store no lo mapeó) para mostrar UN SOLO Toast aquí.
    const errorMessage = authStore.error || error.message || 'Ocurrió un error inesperado durante el inicio de sesión.';

    // ===> Muestra el Toast de ERROR AQUÍ <===
    toast.error(`Error: ${errorMessage}`); // <--- Muestra el Toast de ERROR
  }
  // El estado de loading se maneja en el store (finally)
};
// ===> Fin Función de LOGIN <===
</script>

<style scoped>
.error {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>