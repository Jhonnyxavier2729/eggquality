// src/stores/panalesStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import {
  // Mantén los imports necesarios para las acciones que se quedan client-side (fetch, update, delete)
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  getDoc
  // ¡Ya NO necesitas addDoc ni serverTimestamp aquí para la acción savePanal!
} from 'firebase/firestore';
import { db } from '@/firebase/config'; // Asegúrate que la ruta a tu db sea correcta

import { useAuthStore } from '@/stores/auth';

// === Imports necesarios para llamar Cloud Functions ===
import { getFunctions, httpsCallable } from 'firebase/functions';
// Asegúrate de que tu archivo de configuración de Firebase (config.js o similar)
// exporte la instancia de la app de Firebase (ej: export const app = initializeApp(firebaseConfig);)
import { app } from '@/firebase/config'; // <-- Asume que 'app' se exporta desde tu config.js
// ==================================================


export const usePanalesStore = defineStore('panales', () => {
  // --- Estados reactivos ---
  const panales = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const toast = useToast();

  // --- Inicializar Firebase Functions y la referencia a la Callable Function ---
  const functions = getFunctions(app); // Obtiene la instancia de Cloud Functions
  // Obtén una referencia a la Cloud Function Callable para añadir panales
  // 'addPanal' debe coincidir exactamente con el nombre exportado en functions/index.js (v2)
  const addPanalCallable = httpsCallable(functions, 'addPanal');


  // --- Acciones del Store ---

  // MODIFICADA: Acción para guardar un nuevo panal llamando a la Cloud Function
  const savePanal = async (panalData) => {
    loading.value = true;
    error.value = null;

    // NOTA: La validación de fechas que tenías aquí puede quedarse o moverse a la vista.
    // La validación de unicidad ahora la hace la Cloud Function.
    // La autenticación y añadir userId/createdAt también los hace la Cloud Function.

    try {
      console.log('Llamando a la Cloud Function addPanal con datos:', panalData);
      // Llama a la función callable con los datos del formulario
      // La Cloud Function se encarga de validar unicidad, añadir userId/createdAt y guardar en Firestore
      const result = await addPanalCallable(panalData);

      // La Cloud Function retorna { documentId: ..., message: ... } si tiene éxito
      console.log('Resultado de la Cloud Function addPanal:', result.data);
      toast.success(result.data.message || 'Panal guardado correctamente.'); // Usa el mensaje de la CF

      // Después de guardar exitosamente, refresca la lista para incluir el nuevo panal
      // O considera añadirlo localmente si quieres una actualización más rápida (con caveats sobre orden/serverTimestamp)
      fetchPanales(); // Refrescar la lista completa es más seguro para reflejar el estado correcto

      // Retorna el ID del documento creado (devuelto por la Cloud Function)
      return result.data.documentId;

    } catch (err) {
      console.error('Error al guardar panal a través de Cloud Function:', err);
      // Maneja errores específicos lanzados por la Cloud Function (HttpsError)
      if (err.code) {
         // Asigna el error del store para mostrarlo en la UI si es necesario
         error.value = err.message;
         // Muestra un toast con el mensaje de error específico (ej. 'Ya existe un panal...')
         toast.error(err.message);
      } else {
         // Mensaje genérico para errores inesperados del cliente o red
         error.value = 'Error inesperado al guardar panal.';
         toast.error('Error inesperado al guardar panal.');
      }
      // Relanza el error para que la vista que llamó a savePanal sepa que falló
      throw err;

    } finally {
      loading.value = false; // Deshabilita el estado de carga al finalizar (éxito o error)
    }
  };

  // --- Las acciones fetchPanales, fetchSinglePanal, updatePanal, deletePanal pueden quedarse client-side ---
  // Tu código para fetchPanales, fetchSinglePanal, updatePanal, deletePanal parece correcto para operaciones client-side.
  // Solo necesitas asegurarte de que 'db' se importe correctamente desde tu archivo de configuración.

  // Acción para cargar los panales del usuario logueado desde Firestore (Client-side)
  // Tu código actual para fetchPanales está bien para leer los datos.
  const fetchPanales = async () => {
    loading.value = true;
    error.value = null;
    panales.value = [];

    const authStore = useAuthStore();
    const userId = authStore.user?.uid;

    if (!userId) {
      error.value = 'Usuario no autenticado. No se pueden cargar los panales.';
      toast.error(error.value);
      loading.value = false;
      // No lanzar aquí si quieres que la lista simplemente esté vacía para no autenticados
      return; // Sale de la función
    }

    try {
      const panalesCollection = collection(db, 'panales');
      // Crear la consulta: filtrar por usuario y ordenar por fecha de creación
      const q = query(
        panalesCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const fetchedPanales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      panales.value = fetchedPanales;
      console.log('Panales cargados:', panales.value);
    } catch (err) {
      console.error('Error al cargar los panales:', err);
      error.value = err.message || 'Error desconocido al cargar los panales.';
      toast.error('Error al cargar los panales.');
      throw err; // Relanza el error
    } finally {
      loading.value = false;
    }
  };

  // Acción: Obtiene un solo panal por su ID de Firestore (Client-side)
  // Tu código actual para fetchSinglePanal está bien.
  const fetchSinglePanal = async (panalId) => {
      // ... (código de fetchSinglePanal como lo proporcionaste) ...
      if (!panalId) {
          console.warn('fetchSinglePanal llamado sin ID.');
          error.value = 'Se requiere un ID para cargar un solo panal.';
          return null;
      }

      loading.value = true;
      error.value = null;

      try {
          const panalDocRef = doc(db, 'panales', panalId);
          const panalDocSnap = await getDoc(panalDocRef);

          if (panalDocSnap.exists()) {
              // Opcional: verificar que el panal pertenezca al usuario actual para seguridad client-side
              const authStore = useAuthStore();
              if (panalDocSnap.data().userId !== authStore.user?.uid) {
                   console.warn('Intento de acceder a panal que no pertenece al usuario.');
                   error.value = 'No tienes permiso para ver este panal.';
                   toast.error('No tienes permiso.');
                   return null;
              }

              console.log("Datos del documento encontrado:", panalDocSnap.data());
              return { id: panalDocSnap.id, ...panalDocSnap.data() };
          } else {
              console.log("Documento con ID", panalId, "no encontrado en Firestore!");
              error.value = `Panal con ID ${panalId} no encontrado.`;
              return null;
          }
      } catch (err) {
          console.error("Error al obtener documento con ID", panalId, ":", err);
          error.value = err.message || 'Error desconocido al obtener el panal.';
          throw err;
      } finally {
          loading.value = false;
      }
  };

  // Acción para actualizar un panal existente en Firestore (Client-side)
  // Tu código actual para updatePanal está bien.
  const updatePanal = async (panalId, newData) => {
    loading.value = true;
    error.value = null;

    // Opcional: Validación adicional antes de actualizar
     if (newData.fechaVencimiento && newData.fechaInicio && new Date(newData.fechaVencimiento) < new Date(newData.fechaInicio)) {
         const msg = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.';
         error.value = msg;
         toast.error(msg);
         loading.value = false;
         throw new Error(msg);
     }

     // Opcional: verifica que el panal pertenezca al usuario antes de intentar actualizarlo client-side
     const authStore = useAuthStore();
     const panalDocSnap = await getDoc(doc(db, 'panales', panalId));
     if (!panalDocSnap.exists() || panalDocSnap.data().userId !== authStore.user?.uid) {
         console.warn('Intento de actualizar panal que no pertenece al usuario.');
         error.value = 'No tienes permiso para editar este panal.';
         toast.error('No tienes permiso.');
         loading.value = false;
         throw new Error('Permission denied');
     }


    try {
      const panalDocRef = doc(db, 'panales', panalId);

      await updateDoc(panalDocRef, newData);

      console.log('Documento de panal actualizado:', panalId);
      toast.success('Panal actualizado correctamente.');

      // Actualizar la lista local
      const index = panales.value.findIndex(p => p.id === panalId);
      if (index !== -1) {
        panales.value[index] = { ...panales.value[index], ...newData };
      }
    } catch (err) {
      console.error('Error al actualizar el panal:', err);
      error.value = err.message || 'Error desconocido al actualizar el panal.';
      toast.error('Error al actualizar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Acción para eliminar un panal existente en Firestore (Client-side)
  // Tu código actual para deletePanal está bien.
  const deletePanal = async (panalId) => {
    loading.value = true;
    error.value = null;

     // Opcional: verifica que el panal pertenezca al usuario antes de intentar eliminarlo client-side
     const authStore = useAuthStore();
     const panalDocSnap = await getDoc(doc(db, 'panales', panalId));
     if (!panalDocSnap.exists() || panalDocSnap.data().userId !== authStore.user?.uid) {
         console.warn('Intento de eliminar panal que no pertenece al usuario.');
         error.value = 'No tienes permiso para eliminar este panal.';
         toast.error('No tienes permiso.');
         loading.value = false;
         throw new Error('Permission denied');
     }


    try {
      const panalDocRef = doc(db, 'panales', panalId);

      await deleteDoc(panalDocRef);

      console.log('Documento de panal eliminado:', panalId);
      toast.success('Panal eliminado correctamente.');

      // Remover de la lista local
      panales.value = panales.value.filter(panal => panal.id !== panalId);
    } catch (err) {
      console.error('Error al eliminar el panal:', err);
      error.value = err.message || 'Error desconocido al eliminar el panal.';
      toast.error('Error al eliminar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // --- Retornar todos los estados y acciones ---
  return {
    panales,
    loading,
    error,
    savePanal, // Esta es la acción modificada para usar la Cloud Function
    fetchPanales,
    updatePanal,
    deletePanal,
    fetchSinglePanal
  };
});