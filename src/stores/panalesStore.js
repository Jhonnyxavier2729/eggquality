// src/stores/panalesStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc, // Importar 'doc' para referenciar un documento específico
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  getDoc // Importar 'getDoc' para leer un solo documento
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/auth';

export const usePanalesStore = defineStore('panales', () => {
  // --- Estados reactivos ---
  const panales = ref([]); // Lista de panales del usuario
  const loading = ref(false); // Indicador de carga para operaciones generales/lista
  const error = ref(null); // Estado para mensajes de error
  const toast = useToast(); // Instancia de Vue-Toastification

  // --- Acciones del Store ---

  // Acción para guardar un nuevo panal en Firestore
  const savePanal = async (panalData) => {
    loading.value = true;
    error.value = null;

    const authStore = useAuthStore();
    const userId = authStore.user?.uid;

    if (!userId) {
      error.value = 'Usuario no autenticado. No se puede guardar el panal.';
      toast.error(error.value);
      loading.value = false;
      // Es buena práctica lanzar el error para que la vista pueda manejarlo si necesita
      throw new Error('Usuario no autenticado.');
    }

    try {
      // Validación adicional (opcional, también se puede hacer en la vista)
      if (new Date(panalData.fechaVencimiento) < new Date(panalData.fechaInicio)) {
        const msg = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.';
        error.value = msg;
        toast.error(msg);
        throw new Error(msg);
      }

      const panalesCollection = collection(db, 'panales');

      // Añadir el documento a la colección
      const docRef = await addDoc(panalesCollection, {
        ...panalData, // Copia los datos del formulario
        estado: 'Activo', // <--- ¡Añade o sobrescribe el estado para asegurar que siempre sea 'Activo' al crear!
        userId: userId, // Añade el ID del usuario logueado
        createdAt: serverTimestamp() // Añade la marca de tiempo del servidor
      });

      console.log('Documento de panal guardado con ID:', docRef.id);
      // Mostrar notificación de éxito
      toast.success('Panal guardado correctamente.');

      // Opcional: Añadir el nuevo panal a la lista local si está cargada (para mantener la UI actualizada sin refetch completo)
      // Esto puede ser complejo con ordenamiento, podrías decidir solo refetch la lista completa en la vista después de guardar
      // panales.value.push({ id: docRef.id, ...panalData, userId: userId, createdAt: new Date() }); // Usar new Date() para aproximar si no necesitas el timestamp exacto del servidor en la lista

      return docRef.id; // Retorna el ID del documento guardado
    } catch (err) {
      console.error('Error al guardar el panal:', err);
      // Establecer error en el store y mostrar notificación de error
      error.value = err.message || 'Error desconocido al guardar el panal.';
      toast.error('Error al guardar el panal.');
      // Propagar el error
      throw err;
    } finally {
      // Restablecer estado de carga
      loading.value = false;
    }
  };

  // Acción para cargar los panales del usuario logueado desde Firestore
  const fetchPanales = async () => {
    loading.value = true;
    error.value = null;
    panales.value = []; // Limpiar la lista actual antes de cargar

    const authStore = useAuthStore();
    const userId = authStore.user?.uid;

    if (!userId) {
      error.value = 'Usuario no autenticado. No se pueden cargar los panales.';
      toast.error(error.value);
      loading.value = false;
      throw new Error('Usuario no autenticado.');
    }

    try {
      const panalesCollection = collection(db, 'panales');
      // Crear la consulta: filtrar por usuario y ordenar por fecha de creación
      const q = query(
        panalesCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      // Ejecutar la consulta
      const querySnapshot = await getDocs(q);

      // Mapear los documentos a objetos JavaScript, añadiendo el ID del documento
      const fetchedPanales = querySnapshot.docs.map(doc => ({
        id: doc.id, // Añade el ID del documento de Firestore
        ...doc.data() // Copia los datos del documento
      }));

      // Actualizar el estado 'panales' del store
      panales.value = fetchedPanales;
      console.log('Panales cargados:', panales.value);
    } catch (err) {
      console.error('Error al cargar los panales:', err);
      // Establecer error en el store y mostrar notificación
      error.value = err.message || 'Error desconocido al cargar los panales.';
      toast.error('Error al cargar los panales.');
      throw err;
    } finally {
      // Restablecer estado de carga
      loading.value = false;
    }
  };


  // Nueva acción: Obtiene un solo panal por su ID de Firestore
  const fetchSinglePanal = async (panalId) => {
      if (!panalId) {
          console.warn('fetchSinglePanal llamado sin ID.');
          error.value = 'Se requiere un ID para cargar un solo panal.';
          return null;
      }

      // Usar el mismo estado de carga o uno específico si prefieres
      loading.value = true;
      error.value = null; // Limpiar errores previos

      try {
          const panalDocRef = doc(db, 'panales', panalId); // Crea una referencia al documento específico
          const panalDocSnap = await getDoc(panalDocRef); // Obtiene el snapshot del documento

          if (panalDocSnap.exists()) {
              // Si el documento existe, retorna un objeto con su ID y sus datos
              console.log("Datos del documento encontrado:", panalDocSnap.data());
              return { id: panalDocSnap.id, ...panalDocSnap.data() };
          } else {
              // Si el documento no existe
              console.log("Documento con ID", panalId, "no encontrado en Firestore!");
              error.value = `Panal con ID ${panalId} no encontrado.`; // Establecer error en el store
              return null; // Retorna null para indicar que no se encontró
          }
      } catch (err) {
          console.error("Error al obtener documento con ID", panalId, ":", err);
          error.value = err.message || 'Error desconocido al obtener el panal.'; // Establecer error
          throw err; // Propagar el error
      } finally {
          loading.value = false; // Restablecer estado de carga
      }
  };


  // Acción para actualizar un panal existente en Firestore
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


    try {
      // Crea una referencia al documento a actualizar usando su ID de Firestore
      const panalDocRef = doc(db, 'panales', panalId);

      // Actualiza el documento con los nuevos datos
      await updateDoc(panalDocRef, newData);

      console.log('Documento de panal actualizado:', panalId);
      // Mostrar notificación de éxito
      toast.success('Panal actualizado correctamente.');

      // Actualizar la lista local en el store para reflejar los cambios inmediatamente en la UI de lista
      const index = panales.value.findIndex(p => p.id === panalId);
      if (index !== -1) {
        // Mezcla los datos existentes con los nuevos datos
        panales.value[index] = { ...panales.value[index], ...newData };
      }
    } catch (err) {
      console.error('Error al actualizar el panal:', err);
      // Establecer error y mostrar notificación
      error.value = err.message || 'Error desconocido al actualizar el panal.';
      toast.error('Error al actualizar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Acción para eliminar un panal existente en Firestore
  const deletePanal = async (panalId) => {
    loading.value = true;
    error.value = null;

    try {
      // Crea una referencia al documento a eliminar
      const panalDocRef = doc(db, 'panales', panalId);

      // Elimina el documento
      await deleteDoc(panalDocRef);

      console.log('Documento de panal eliminado:', panalId);
      // Mostrar notificación de éxito
      toast.success('Panal eliminado correctamente.');

      // Remover el panal de la lista local en el store para actualizar la UI
      panales.value = panales.value.filter(panal => panal.id !== panalId);
    } catch (err) {
      console.error('Error al eliminar el panal:', err);
      // Establecer error y mostrar notificación
      error.value = err.message || 'Error desconocido al eliminar el panal.';
      toast.error('Error al eliminar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // --- Retornar todos los estados y acciones para que estén disponibles ---
  return {
    panales,
    loading,
    error,
    savePanal,
    fetchPanales,
    updatePanal,
    deletePanal,
    fetchSinglePanal // ¡Ahora fetchSinglePanal también está disponible!
  };
});