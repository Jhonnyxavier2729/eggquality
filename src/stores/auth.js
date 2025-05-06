import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword, // <--- Importa updatePassword
  reauthenticateWithCredential, // <--- Importa reauthenticateWithCredential
  EmailAuthProvider // <--- Importa EmailAuthProvider
} from 'firebase/auth';
import { auth } from '@/firebase/config';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const toast = useToast();
  const isAuthInitialized = ref(false); // Variable añadida

  // Observador de autenticación
  onAuthStateChanged(auth, (currentUser) => {
    console.log('Estado de autenticación cambiado:', currentUser);
    user.value = currentUser;
    isAuthInitialized.value = true; // Ahora sí se indica que ya se inicializó
  });

  const register = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      toast.success('Registro exitoso');
    } catch (err) {
      error.value = err.message;
      toast.error('Error al registrarse: ' + err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      toast.success('Inicio de sesión exitoso');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          toast.error('El usuario no existe.');
          break;
        case 'auth/wrong-password':
          toast.error('Contraseña incorrecta.');
          break;
        case 'auth/invalid-email':
          toast.error('El correo no es válido.');
          break;
        default:
          toast.error('Error al iniciar sesión, inténtalo de nuevo.');
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    error.value = null; // Limpiar errores previos
    loading.value = true; // Opcional: mostrar estado de carga durante el logout
    try {
      await signOut(auth);
      // El listener onAuthStateChanged actualizará user.value a null automáticamente
      // user.value = null; // Esta línea es opcional si confías en onAuthStateChanged
      // Ya NO muestres el toast aquí
    } catch (err) {
      console.error('Error en auth.js al cerrar sesión:', err);
      error.value = 'Error interno al cerrar sesión'; // Opcional: establecer un error en el store
      // Ya NO muestres el toast aquí
      throw err; // <-- IMPORTANTE: Relanza el error para que el componente lo capture
    } finally {
        loading.value = false; // Opcional: finalizar estado de carga
    }
  };

  const recoverPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Se ha enviado un enlace para restablecer tu contraseña a tu correo.');
    } catch (err) {
      toast.error('Error al enviar el enlace de restablecimiento: ' + err.message);
      throw err;
    }
  };

  // ===> Actualizar contraseña con reautenticación <===
  const updateUserPasswordWithReauth = async (currentPassword, newPassword) => {
    loading.value = true;
    error.value = null;
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No hay usuario autenticado para cambiar la contraseña.');
      }

      // 1. Crear credenciales para reautenticación con la contraseña actual
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      console.log('Intentando reautenticar al usuario...');

      // 2. Reautenticar al usuario
      await reauthenticateWithCredential(currentUser, credential);
      console.log('Reautenticación exitosa. Procediendo a cambiar contraseña.');

      // 3. Si la reautenticación fue exitosa, actualizar la contraseña
      await updatePassword(currentUser, newPassword);
      console.log('Contraseña actualizada exitosamente en Firebase.');

      // No necesitas actualizar user.value aquí, solo se cambió la contraseña

    } catch (err) {
      console.error('Error en authStore al cambiar contraseña:', err);
      error.value = err.message; // Establecer el error en el store
      // Relanzar el error para que el componente que llamó a esta acción pueda manejarlo
      throw err;
    } finally {
      loading.value = false; // Asegurar que el loading se desactive
    }
  };
  // ==============================================================

  return {  user, error, loading, isAuthInitialized, register, login, logout, recoverPassword, updateUserPasswordWithReauth };
});
