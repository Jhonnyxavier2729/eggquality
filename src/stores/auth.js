import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/firebase/config'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const toast = useToast(); // Inicializa las notificaciones

  const register = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      toast.success('Registro exitoso'); // Notificación de éxito
    } catch (err) {
      toast.error('Error al registrarse: ' + err.message); // Notificación de error
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
      toast.success('Inicio de sesión exitoso'); // Notificación de éxito
    } catch (err) {
      // Manejo de errores de Firebase
      switch (err.code) {
        case 'auth/invalid-credential':
          toast.error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
          break;
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
          toast.error('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
      toast.success('Cierre de sesión exitoso'); // Notificación de éxito
    } catch (err) {
      toast.error('Error al cerrar sesión'); // Notificación de error
    }
  };

  const recoverPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Se ha enviado un enlace para restablecer tu contraseña a tu correo.');
    } catch (err) {
      // Lanza el error para que el componente lo maneje
      throw err;
    }
  };

  return { user, error, loading, register, login, logout, recoverPassword };
});