import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile, // <-- NUEVO: Importa updateProfile para el nombre de usuario
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null); // Objeto de usuario de Firebase Auth
  const userProfile = ref(null); // <-- NUEVO: Datos adicionales del perfil del usuario desde Firestore
  const userPreferences = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const toast = useToast();
  const isAuthInitialized = ref(false);

  // === NUEVO: Getter para verificar si el usuario está autenticado y tiene perfil cargado ===
  const isAuthenticated = computed(() => !!user.value);
  const hasProfileLoaded = computed(() => !!userProfile.value);
  const hasPreferencesLoaded = computed(() => !!userPreferences.value);

 //Observador de autenticación
  onAuthStateChanged(auth, async (currentUser) => {
  console.log('Estado de autenticación cambiado:', currentUser);
  user.value = currentUser;

  if (currentUser) {
    await fetchUserProfile(currentUser.uid);
  } else {
    userProfile.value = null;
  }

  isAuthInitialized.value = true; // Aquí es donde se establece
  console.log('Auth initialized:', isAuthInitialized.value); // Agrega este log
});

  // ===> Acción de REGISTRO (Ahora acepta 'username' como parte de los datos) <===
  const register = async (email, password, username) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Intentando registrar usuario con correo:', email, 'y nombre:', username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;

      // --- NUEVO: Actualizar el displayName en Firebase Auth ---
      await updateProfile(userCredential.user, {
        displayName: username,
      });
      console.log('displayName actualizado en Firebase Auth.');

      // --- NUEVO: Guardar datos adicionales en Firestore ---
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userData = {
        email: email,
        username: username,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, userData);
      userProfile.value = userData;
      console.log('Perfil de usuario guardado en Firestore.');

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
    error.value = null;
    try {
      console.log('Intentando iniciar sesión con correo:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;

      // --- NUEVO: Al iniciar sesión, carga también el perfil de Firestore ---
      await fetchUserProfile(userCredential.user.uid);

    } catch (err) {
      console.error('Error en authStore al iniciar sesión:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          error.value = 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
          break;
        case 'auth/user-not-found':
          error.value = 'El usuario no existe.';
          break;
        case 'auth/wrong-password':
          error.value = 'Contraseña incorrecta.';
          break;
        case 'auth/invalid-email':
          error.value = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/user-disabled':
          error.value = 'Tu cuenta ha sido deshabilitada.';
          break;
        default:
          error.value = err.message || 'Error al iniciar sesión, inténtalo de nuevo.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    error.value = null;
    loading.value = true;
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
      loading.value = false;
    }
  };

  // --- NUEVO: Acción para cargar el perfil del usuario desde Firestore ---
  const fetchUserProfile = async (uid) => {
    loading.value = true;
    error.value = null;
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        userProfile.value = docSnap.data();
        console.log('Perfil de usuario cargado desde Firestore:', userProfile.value);
      } else {
        console.warn('No se encontró perfil de usuario en Firestore para UID:', uid);
        userProfile.value = null;
      }
    } catch (err) {
      console.error('Error al cargar el perfil de usuario desde Firestore:', err);
      error.value = err.message;
      userProfile.value = null;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserPreferences = async (uid) => {
    console.log('fetchUserPreferences: Intentando cargar preferencias para UID:', uid);
    try {
      const preferencesRef = doc(db, 'userPreferences', uid);
      const docSnap = await getDoc(preferencesRef);
      if (docSnap.exists()) {
        userPreferences.value = docSnap.data();
        console.log('fetchUserPreferences: Preferencias cargadas:', userPreferences.value);
      } else {
        console.warn('fetchUserPreferences: No se encontraron preferencias para UID:', uid);
        userPreferences.value = null;
      }
    } catch (err) {
      console.error('fetchUserPreferences: ERROR al cargar preferencias:', err);
      userPreferences.value = null;
      throw err; // <<-- ¡IMPORTANTE! Relanza el error
    }
  };


  // --- ¡NUEVA ACCIÓN: Guardar preferencias del usuario! ---
  const saveUserPreferences = async (uid, preferences) => {
    loading.value = true; // Inicia la carga
    error.value = null;   // Limpia errores previos
    try {
      const userPrefsRef = doc(db, 'userPreferences', uid);
      await setDoc(userPrefsRef, preferences, { merge: true });
      userPreferences.value = preferences; // Actualiza el estado local del store
      console.log('Auth Store: Preferencias de usuario guardadas con éxito para UID:', uid);
      return true; // Indicador de éxito
    } catch (err) {
      console.error('Auth Store: Error al guardar preferencias:', err);
      error.value = err.message; // Guarda el error en el store
      throw err; // Propaga el error para que el componente lo capture
    } finally {
      loading.value = false; // Finaliza la carga, siempre
    }
  };

  return {
    user,
    userProfile,
    userPreferences,
    error,
    loading,
    isAuthInitialized,
    isAuthenticated,
    hasProfileLoaded,
    hasPreferencesLoaded,
    register,
    login,
    logout,
    recoverPassword,
    updateUserPasswordWithReauth,
    fetchUserProfile,
    fetchUserPreferences,
    saveUserPreferences
  };
});
