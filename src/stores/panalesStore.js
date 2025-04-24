// src/stores/panalesStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
// Importa las funciones necesarias de Firestore
import {
  collection,
  addDoc,
  getDocs, // Para obtener múltiples documentos
  query,   // Para construir consultas (filtrar, ordenar)
  where,   // Para filtrar en consultas
  doc,     // Para referenciar un documento específico
  updateDoc, // Para actualizar un documento
  deleteDoc, // Para eliminar un documento
  serverTimestamp, // Para la fecha del servidor
  orderBy // Para ordenar los resultados (opcional)
} from 'firebase/firestore';
import { db } from '@/firebase/config'; // Importa la instancia de Firestore (db)
import { useAuthStore } from '@/stores/auth'; // Importa el store de auth para obtener el user UID


export const usePanalesStore = defineStore('panales', () => {
  // --- Estados del Store ---
  const panales = ref([]); // Para guardar la lista de panales del usuario
  const loading = ref(false); // Indicador de carga
  const error = ref(null); // Errores
  const toast = useToast(); // Notificaciones

  // --- Acciones del Store ---

  // Crear: Guarda un nuevo registro de panal
  const savePanal = async (panalData) => {
    loading.value = true;
    error.value = null;

    const authStore = useAuthStore();
    const userId = authStore.user?.uid;

    if (!userId) {
      error.value = 'Usuario no autenticado. No se puede guardar el panal.';
      toast.error(error.value);
      loading.value = false;
      throw new Error('Usuario no autenticado.');
    }

    try {
      const panalesCollection = collection(db, 'panales');

      // Añadir un nuevo documento
      const docRef = await addDoc(panalesCollection, {
        ...panalData,
        userId: userId, // <-- Asocia el panal al usuario
        createdAt: serverTimestamp() // Fecha/hora de creación del servidor
      });

      console.log('Documento de panal guardado con ID:', docRef.id);
      toast.success('Panal guardado correctamente.');

      // Opcional: Actualizar la lista local después de guardar si la estás mostrando
      // fetchPanales(); // Esto volvería a leer todos los panales

      return docRef.id;
    } catch (err) {
      console.error('Error al guardar el panal:', err);
      error.value = err.message;
      toast.error('Error al guardar el panal.');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Leer: Obtiene la lista de panales del usuario logueado
  const fetchPanales = async () => {
     loading.value = true;
     error.value = null;
     panales.value = []; // Limpiar la lista actual mientras carga

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

       // Crear una consulta:
       // 1. Filtra por el userId del usuario logueado
       // 2. Opcional: Ordena por fecha de creación descendente
       const q = query(
         panalesCollection,
         where("userId", "==", userId), // <-- Filtra por tu propio userId
         orderBy("createdAt", "desc") // <-- Ordena (requiere índice en Firestore)
       );

       // Obtener los documentos que coinciden con la consulta
       const querySnapshot = await getDocs(q);

       // Mapear los documentos a un array de objetos
       // Incluimos el ID del documento (.id) junto con los datos (.data())
       const fetchedPanales = querySnapshot.docs.map(doc => ({
         id: doc.id, // <-- ID del documento en Firestore
         ...doc.data() // <-- Datos del documento
       }));

       panales.value = fetchedPanales; // Actualiza el estado reactivo con la lista obtenida
       console.log('Panales cargados:', panales.value);

     } catch (err) {
       console.error('Error al cargar los panales:', err);
       error.value = err.message;
       toast.error('Error al cargar los panales.');
       throw err;
     } finally {
       loading.value = false;
     }
  };

  // Actualizar: Modifica un registro de panal existente
  const updatePanal = async (panalId, newData) => {
      loading.value = true;
      error.value = null;

      // Nota: No necesitamos verificar el userId aquí porque las reglas de seguridad de Firestore
      // solo permitirán la actualización si el usuario autenticado es el dueño del documento con ese panalId.
      // Sin embargo, es buena práctica obtener el userId si la lógica de negocio en el store lo requiere.
      // const authStore = useAuthStore();
      // const userId = authStore.user?.uid;


      try {
          // Obtener una referencia al documento específico por su ID
          const panalDocRef = doc(db, 'panales', panalId);

          // Actualizar el documento con los nuevos datos. Merge true es útil para no sobrescribir todo.
          await updateDoc(panalDocRef, newData);

          console.log('Documento de panal actualizado:', panalId);
          toast.success('Panal actualizado correctamente.');

          // Opcional: Actualizar la lista local después de actualizar
          // fetchPanales(); // Volver a leer toda la lista
          // O mejor: Actualizar solo el panal en el array local 'panales.value'
           const index = panales.value.findIndex(p => p.id === panalId);
           if (index !== -1) {
              // Mezclar los datos actualizados con los datos existentes en el array
             panales.value[index] = { ...panales.value[index], ...newData };
           }


      } catch (err) {
          console.error('Error al actualizar el panal:', err);
          error.value = err.message;
          toast.error('Error al actualizar el panal.');
          throw err;
      } finally {
          loading.value = false;
      }
  };

  // Eliminar: Borra un registro de panal
  const deletePanal = async (panalId) => {
       loading.value = true;
       error.value = null;

       // Nota: Igual que en update, las reglas de seguridad verificarán que eres el dueño.
       // const authStore = useAuthStore();
       // const userId = authStore.user?.uid;

       try {
           // Obtener una referencia al documento específico por su ID
           const panalDocRef = doc(db, 'panales', panalId);

           // Eliminar el documento
           await deleteDoc(panalDocRef);

           console.log('Documento de panal eliminado:', panalId);
           toast.success('Panal eliminado correctamente.');

           // Opcional: Eliminar el panal del array local 'panales.value'
           panales.value = panales.value.filter(panal => panal.id !== panalId);

       } catch (err) {
           console.error('Error al eliminar el panal:', err);
           error.value = err.message;
           toast.error('Error al eliminar el panal.');
           throw err;
       } finally {
           loading.value = false;
       }
  };


  // --- Retorna estados y acciones ---
  return { panales, loading, error, savePanal, fetchPanales, updatePanal, deletePanal };
});