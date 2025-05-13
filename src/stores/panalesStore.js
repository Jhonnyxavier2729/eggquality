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
  updateDoc, // Necesitas updateDoc para la "eliminación lógica"
  // deleteDoc, // Ya NO necesitas deleteDoc para la eliminación lógica
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

import { useAuthStore } from '@/stores/auth';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/firebase/config';


const toast = useToast();
const authStore = useAuthStore();
const functions = getFunctions(app);
const addPanalCallable = httpsCallable(functions, 'addPanal');


export const usePanalesStore = defineStore('panales', () => {
  const panales = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // --- Acciones del Store ---

  // savePanal - (Ya modificada para usar Cloud Function addPanal)
  const savePanal = async (panalData) => {
    // ... (Código de savePanal que llama a la Cloud Function addPanal) ...
    loading.value = true;
    error.value = null;
    try {
      console.log('Llamando a la Cloud Function addPanal con datos:', panalData);
      const result = await addPanalCallable(panalData);
      console.log('Resultado de la Cloud Function addPanal:', result.data);
      toast.success(result.data.message || 'Panal guardado correctamente.');
      fetchPanales(); // Refrescar la lista principal después de guardar
      return result.data.documentId;
    } catch (err) {
      console.error('Error al guardar panal a través de Cloud Function:', err);
      if (err.code) {
         error.value = err.message;
         toast.error(err.message);
      } else {
         error.value = 'Error inesperado al guardar panal.';
         toast.error('Error inesperado al guardar panal.');
      }
      throw err;

    } finally {
      loading.value = false;
    }
  };


  // MODIFICADA: Acción para cargar los panales del usuario logueado (solo los NO eliminados)
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
      // Crear la consulta: filtrar por usuario, NO eliminados, y ordenar
      const q = query(
        panalesCollection,
        where("userId", "==", userId),
        where("isDeleted", "==", false), // <--- AÑADIR ESTE FILTRO
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const fetchedPanales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      panales.value = fetchedPanales;
      console.log('Panales activos (no eliminados) cargados:', panales.value);
    } catch (err) {
      console.error('Error al cargar los panales (no eliminados):', err);
      error.value = err.message || 'Error desconocido al cargar los panales.';
      toast.error('Error al cargar los panales.');
      throw err; // Relanza el error
    } finally {
      loading.value = false;
    }
  };


  // fetchSinglePanal - (Client-side, no necesita cambio en la lógica de fetch en sí, solo las consultas que listan)
  const fetchSinglePanal = async (panalId) => {
      // ... (código de fetchSinglePanal que tenías) ...
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
              const authStore = useAuthStore();
              // Seguridad client-side: verifica que el panal pertenezca al usuario
              // y que NO esté marcado como eliminado si solo quieres ver activos
              // Si quieres poder ver panales eliminados para editar o restaurar, quita la validación de isDeleted aquí.
              // Para un reporte, querrías poder fetchear incluso si isDeleted es true.
              const panalData = panalDocSnap.data();
              if (panalData.userId !== authStore.user?.uid) {
                   console.warn('Intento de acceder a panal que no pertenece al usuario.');
                   error.value = 'No tienes permiso para ver este panal.';
                   toast.error('No tienes permiso.');
                   return null;
              }
               // Si solo quieres poder editar panales NO eliminados, podrías añadir:
               // if (panalData.isDeleted === true) {
               //     console.warn('Intento de acceder a panal eliminado.');
               //     error.value = 'Este panal ha sido eliminado.';
               //     toast.error('Panal eliminado.');
               //     return null;
               // }


              console.log("Datos del documento encontrado:", panalData);
              return { id: panalDocSnap.id, ...panalData };
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

  // updatePanal - (Client-side, no necesita cambio en la lógica de update en sí)
  // Se usará para actualizar campos como estado ('Vendido'), no para "eliminar".
  const updatePanal = async (panalId, newData) => {
    loading.value = true;
    error.value = null;

    // ... (Validación de fechas y verificación de pertenencia del usuario - como tenías) ...
     if (newData.fechaVencimiento && newData.fechaInicio && new Date(newData.fechaVencimiento) < new Date(newData.fechaInicio)) {
         const msg = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.';
         error.value = msg;
         toast.error(msg);
         loading.value = false;
         throw new Error(msg);
     }

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

      // Asegurarse de que 'isDeleted' no pueda ser cambiado a false por el usuario aquí, si ya fue marcado.
      // O si se quiere permitir restaurar, se maneja con otra función.
      // Por simplicidad, asumimos que updatePanal es para otros campos.
      if ('isDeleted' in newData) {
         delete newData.isDeleted; // Previene que el usuario cambie isDeleted desde esta acción
         console.warn('Intento de cambiar isDeleted a través de updatePanal. Operación bloqueada.');
      }


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


  // MODIFICADA: Acción para "eliminar" un panal (Soft Delete)
  // Ya NO borra el documento, lo marca como eliminado.
  const deletePanal = async (panalId) => {
    loading.value = true;
    error.value = null;

     // Opcional: verifica que el panal pertenezca al usuario antes de intentar eliminarlo lógicamente client-side
     const authStore = useAuthStore();
     const panalDocSnap = await getDoc(doc(db, 'panales', panalId));
     if (!panalDocSnap.exists() || panalDocSnap.data().userId !== authStore.user?.uid) {
         console.warn('Intento de eliminar (lógicamente) panal que no pertenece al usuario.');
         error.value = 'No tienes permiso para eliminar este panal.';
         toast.error('No tienes permiso.');
         loading.value = false;
         throw new Error('Permission denied');
     }

    try {
      // Crea una referencia al documento a "eliminar" lógicamente
      const panalDocRef = doc(db, 'panales', panalId);

      // Actualiza el documento para marcarlo como eliminado lógicamente
      await updateDoc(panalDocRef, {
         isDeleted: true, // <--- Marca el documento como eliminado
         deletedAt: new Date().toISOString() // <--- Opcional: Añade una marca de tiempo de cuándo fue eliminado (string ISO)
         // Opcional: deletedBy: authStore.user?.uid // Quién lo eliminó
      });

      console.log('Documento de panal marcado como eliminado (lógicamente):', panalId);
      toast.success('Panal eliminado correctamente.'); // El usuario percibe como eliminado

      // Remover el panal de la lista local en el store (porque ya no cumple el filtro 'isDeleted == false')
      panales.value = panales.value.filter(panal => panal.id !== panalId);

    } catch (err) {
      console.error('Error al eliminar (lógicamente) el panal:', err);
      console.error('Error al eliminar el panal:', err);
      error.value = err.message || 'Error desconocido al eliminar el panal.';
      toast.error('Error al eliminar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };


    // === NUEVA ACCIÓN: Para cargar panales para reportes (incluye eliminados lógicamente) ===
    const fetchPanalesForReport = async () => {
         loading.value = true;
         error.value = null;
         // No limpiamos 'panales.value' porque esta acción es para reportes, no para la lista principal
         let reportPanales = [];

         const authStore = useAuthStore();
         const userId = authStore.user?.uid;

         if (!userId) {
             error.value = 'Usuario no autenticado. No se pueden cargar los panales para reporte.';
             toast.error(error.value);
             loading.value = false;
             throw new Error('Usuario no autenticado.');
         }

         try {
             const panalesCollection = collection(db, 'panales');
             // Consulta para obtener TODOS los panales del usuario (sin filtro isDeleted)
             const q = query(
                 panalesCollection,
                 where("userId", "==", userId),
                 // Puedes añadir ordenación si la necesitas para el reporte
                 orderBy("createdAt", "asc") // O asc, o por fechaVencimiento, según el reporte
             );

             const querySnapshot = await getDocs(q);

             reportPanales = querySnapshot.docs.map(doc => ({
                 id: doc.id, // Añade el ID del documento
                 ...doc.data() // Copia todos los datos (incluyendo estado, fechaVencimiento, isDeleted)
             }));

             console.log('Panales cargados para reporte:', reportPanales);
             // Retorna la lista completa para que la vista del reporte la procese
             return reportPanales;

         } catch (err) {
             console.error('Error al cargar los panales para reporte:', err);
             error.value = err.message || 'Error desconocido al cargar los panales para reporte.';
             toast.error('Error al cargar los panales para reporte.');
             throw err;
         } finally {
             loading.value = false;
         }
    };


  // --- Retornar todos los estados y acciones ---
  return {
    panales, // Lista principal (solo no eliminados)
    loading,
    error,
    savePanal,
    fetchPanales, // Carga solo no eliminados
    updatePanal,
    deletePanal, // Ahora es soft delete
    fetchSinglePanal,
    fetchPanalesForReport // Nueva acción para reportes
  };
});