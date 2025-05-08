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

  // / ===> Acción de REGISTRO (Corregida: no muestra Toast de error, mapea errores) <===
  const register = async (email, password) => {
    loading.value = true;
    error.value = null; // Limpiar error al inicio
    try {
      console.log('Intentando registrar usuario con correo:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user; // Actualiza el estado del usuario

      // Opcional: Mostrar toast de ÉXITO desde el store, O la vista puede mostrarlo.
      // Si la vista llama a la acción y redirige, quizás la vista debería mostrar el de éxito después de la redirección.
      // Para consistencia con la gestión de errores, dejemos que la vista también maneje el éxito (toast y redirección).
      // toast.success('Registro exitoso'); // <--- Considera mover este a la vista que llama a 'register'

    } catch (err) {
      console.error('Error en authStore al registrar:', err);
      // ===> Manejamos los errores específicos de REGISTRO y establecemos error.value <===
      if (err.code === 'auth/email-already-in-use') {
        error.value = 'El correo electrónico ya está registrado.'; // Mensaje amigable en español
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        // Aunque validamos en front, Firebase puede tener otras reglas o validarlo de nuevo
        error.value = 'La contraseña es demasiado débil.';
      }
      // Puedes añadir otros casos si encuentras otros códigos de error relevantes
      else {
        // Para otros errores desconocidos de Firebase Auth o de red durante el registro
        error.value = err.message || 'Ocurrió un error al intentar registrarse.'; // Mensaje genérico
      }
      // =========================================================

      // ===> IMPORTANTE: NO mostramos toast.error AQUÍ. Solo establecemos error.value <===
      // toast.error('Error al registrarse: ' + err.message); // <--- ELIMINA O COMENTA ESTA LÍNEA

      // Relanzamos el error para que el componente que llamó a esta acción lo capture y muestre el Toast.
      throw err;

    } finally {
      loading.value = false; // Asegurar que el loading se desactive
    }
  };
  // === Fin Acción de REGISTRO ===

  // Fragmento corregido de la función 'login' en src/stores/authStore.js

const login = async (email, password) => {
      loading.value = true;
      error.value = null; // Limpiar error al inicio
      try {
        console.log('Intentando iniciar sesión con correo:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user.value = userCredential.user;
  
        // Considera mover este toast de ÉXITO a la vista que llama a 'login'
        // toast.success('Inicio de sesión exitoso'); // <-- ELIMINA O COMENTA
  
      } catch (err) {
        console.error('Error en authStore al iniciar sesión:', err);
        // ===> Manejamos los errores específicos de LOGIN y establecemos error.value <===
        switch (err.code) {
          case 'auth/invalid-credential':
           error.value = 'Credenciales inválidas. Por favor verifica tu correo y contraseña.'; // <--- ¡Asigna a error.value!
           break;
          case 'auth/user-not-found':
            error.value = 'El usuario no existe.'; // <--- ¡Asigna a error.value!
            break;
          case 'auth/wrong-password':
            error.value = 'Contraseña incorrecta.'; // <--- ¡Asigna a error.value!
            break;
          case 'auth/invalid-email':
            error.value = 'El formato del correo electrónico no es válido.'; // <--- ¡Asigna a error.value!
            break;
          case 'auth/user-disabled': // Otro error común
              error.value = 'Tu cuenta ha sido deshabilitada.'; // <--- ¡Asigna a error.value!
              break;
          default:
            error.value = err.message || 'Error al iniciar sesión, inténtalo de nuevo.'; // <--- ¡Asigna a error.value!
        }
        // =======================================================
  
        // ===> IMPORTANTE: NO mostramos toast.error AQUÍ <===
        // toast.error('Error al iniciar sesión: ...'); // <-- ELIMINA O COMENTA ESTA LÍNEA
  
        // Relanzamos el error para que el componente que llamó a esta acción lo capture
        throw err;
  
      } finally {
        loading.value = false; // Asegurar que el loading se desactive
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
