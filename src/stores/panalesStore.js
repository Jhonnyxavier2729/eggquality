// src/stores/panalesStore.js

// Importa las funciones necesarias de Pinia y Vue
import { defineStore } from 'pinia';
import { ref } from 'vue';

// Importa la librería de notificaciones Toast
import { useToast } from 'vue-toastification';

// Importa las funciones y objetos necesarios de Firebase Firestore
import {
  // Funciones para interactuar con colecciones y documentos
  collection, // Para obtener referencia a una colección
  doc, // Para obtener referencia a un documento específico
  getDoc, // Para obtener un solo documento
  getDocs, // Para obtener múltiples documentos de una consulta
  updateDoc, // Para actualizar un documento (usado en la eliminación lógica)
  // deleteDoc, // Ya no es necesario para la eliminación lógica

  // Funciones para construir consultas
  query, // Para construir una consulta compleja
  where, // Para añadir condiciones de filtro (igualdad, rango, etc.)
  orderBy // Para añadir criterios de ordenamiento
} from 'firebase/firestore';

// Importa la instancia de la base de datos Firestore y la aplicación Firebase desde tu archivo de configuración
// Asegúrate de que en '@/firebase/config' se exporte 'db' (Firestore) y 'app' (la aplicación Firebase)
import { db, app } from '@/firebase/config';

// Importa el store de autenticación para obtener el ID del usuario logueado
import { useAuthStore } from '@/stores/auth';

// Importa las funciones necesarias para interactuar con Cloud Functions (si usas funciones llamables)
// Asegúrate de que en '@/firebase/config' se exporte 'app' para inicializar getFunctions
import { getFunctions, httpsCallable } from 'firebase/functions';

// Inicializa la librería de notificaciones Toast
const toast = useToast();

// Obtiene una instancia del store de autenticación
//const authStore = useAuthStore();

// Obtiene una instancia del servicio de Cloud Functions, conectada a la aplicación Firebase
const functions = getFunctions(app);

// Crea una referencia a la función llamable específica 'addPanal'
// Asegúrate de que 'addPanal' sea el nombre correcto de tu función callable en Firebase
const addPanalCallable = httpsCallable(functions, 'addPanal');

// Define y exporta tu store de Pinia llamado 'panales'
export const usePanalesStore = defineStore('panales', () => {
  // --- Estados reactivos del Store ---
  // Estos estados mantendrán el estado de la aplicación relacionado con los panales
  const panales = ref([]); // Array para almacenar la lista principal de panales (solo los no eliminados en la vista de lista)
  const loading = ref(false); // Estado global para indicar si una operación asíncrona está en curso en el store
  const error = ref(null); // Estado global para almacenar mensajes de error del store

  // --- Acciones del Store ---
  // Las acciones son funciones que realizan operaciones (ej. guardar, cargar, eliminar) y pueden modificar el estado

  // Acción para guardar o actualizar un panal. Usa una Cloud Function llamable.
  // Espera un objeto panalData con los datos del panal a guardar.
  const savePanal = async (panalData) => {
  loading.value = true; // Activa el estado de carga global del store
  error.value = null; // Limpia errores anteriores (este es para el mensaje INLINE, que pondremos a null al final del catch)

  try {
    console.log('Llamando a la Cloud Function addPanal con datos:', panalData);
    // Llama a la función en la nube (o al emulador si está configurado) pasando los datos del panal
    const result = await addPanalCallable(panalData);
    console.log('Resultado de la Cloud Function addPanal:', result.data); // Los datos de respuesta están en result.data

    // Muestra un mensaje de éxito basado en la respuesta de la función o un mensaje por defecto
    toast.success(result.data.message || 'Panal guardado correctamente.');

    // Opcional: Refresca la lista principal de panales después de guardar para que la UI se actualice
    // Asume que fetchPanales carga la lista principal que se muestra en HoneycombListView.vue
    fetchPanales(); // Considera si realmente necesitas recargar toda la lista aquí

    // Retorna el ID del documento creado o actualizado si la función lo proporciona en la respuesta
    return result.data.documentId;
  } catch (err) {
    // Captura y maneja errores durante la llamada a la función (ej. errores de red, errores lanzados por la función)
    console.error('Error al guardar panal a través de Cloud Function:', err);

    let displayMessage = 'Ocurrió un error inesperado al guardar el panal.'; // Mensaje por defecto

    if (err.code && err.message) {
      const firebaseErrorPrefix = `functions/${err.code}: `;
      if (err.message.startsWith(firebaseErrorPrefix)) {
        displayMessage = err.message.substring(firebaseErrorPrefix.length);
      } else {
        displayMessage = err.message;
      }
    }

    // Muestra el mensaje de error limpio en el toast (notificación superior)
    toast.error(displayMessage);

    // IMPORTANTE: Para que el mensaje de error debajo del botón NO APAREZCA:
    error.value = null; // Reinicia 'error.value' a null para que el v-if del <p> no se active

    throw err; // Relanza el error para que pueda ser capturado en el componente llamante si es necesario
  } finally {
    loading.value = false; // Desactiva el estado de carga global al finalizar (siempre)
  }
};

  // Acción para cargar la lista principal de panales del usuario logueado para la vista principal
  // Solo carga los panales que NO están marcados como eliminados lógicamente
  const fetchPanales = async () => {
    loading.value = true; // Activa carga global
    error.value = null; // Limpia errores
    panales.value = []; // Limpia la lista principal (panales.value) antes de cargar nuevos datos

    const authStore = useAuthStore();
    const userId = authStore.user?.uid; // Obtiene el ID del usuario actual

    // Si no hay usuario logueado, no se pueden cargar panales. Muestra error y sale.
    if (!userId) {
      console.warn('fetchPanales llamado sin usuario autenticado.');
      error.value = 'Usuario no autenticado. No se pueden cargar los panales.';
      toast.error(error.value);
      loading.value = false;
      // Considera si quieres lanzar un error aquí o simplemente dejar la lista vacía.
      return; // Sale de la función si no hay usuario
    }

    try {
      // 1. Obtiene la referencia a la colección 'panales'
      const panalesCollection = collection(db, 'panales');

      // 2. Crea la consulta para la lista principal:
      const q = query(
        panalesCollection,
        where("userId", "==", userId), // Filtra para obtener solo los panales del usuario actual
        where("isDeleted", "==", false), // <--- Filtra para obtener solo los panales NO eliminados lógicamente
        orderBy("createdAt", "desc") // Ordena por fecha de creación descendente (más recientes primero)
      );

      // 3. Ejecuta la consulta a Firestore
      const querySnapshot = await getDocs(q);

      // 4. Mapea los documentos retornados a objetos JavaScript y añádeles el ID del documento
      const fetchedPanales = querySnapshot.docs.map(doc => ({
        id: doc.id, // Añade el ID del documento al objeto panal
        ...doc.data() // Copia todos los campos del documento en el objeto
      }));

      // 5. Actualiza el estado reactivo 'panales' del store con los resultados
      panales.value = fetchedPanales;
      console.log('Panales activos (no eliminados) cargados para la lista principal:', panales.value);
    } catch (err) {
      // Captura y maneja errores durante la consulta a Firestore
      console.error('Error al cargar los panales (no eliminados):', err);
      error.value = err.message || 'Error desconocido al cargar los panales.';
      toast.error('Error al cargar los panales.');
      throw err; // Relanza el error para manejo superior
    } finally {
      loading.value = false; // Desactiva el estado de carga
    }
  };

  // Acción para obtener un solo panal por su ID
  // Usada principalmente para cargar datos en la vista de edición/detalle
  const fetchSinglePanal = async (panalId) => {
    // Verifica si se proporcionó un ID de panal
    if (!panalId) {
      console.warn('fetchSinglePanal llamado sin ID.');
      error.value = 'Se requiere un ID para cargar un solo panal.';
      return null; // Retorna null si no hay ID
    }

    loading.value = true; // Activa estado de carga global
    error.value = null; // Limpia errores

    try {
      // 1. Crea una referencia al documento específico en la colección 'panales' por su ID
      const panalDocRef = doc(db, 'panales', panalId);
      // 2. Obtiene el snapshot del documento
      const panalDocSnap = await getDoc(panalDocRef);

      // 3. Verifica si el documento existe en Firestore
      if (panalDocSnap.exists()) {
        const authStore = useAuthStore();
        const panalData = panalDocSnap.data();

        // 4. Seguridad adicional (client-side): verifica que el panal pertenezca al usuario logueado
        if (panalData.userId !== authStore.user?.uid) {
          console.warn('Intento de acceder a panal que no pertenece al usuario.');
          error.value = 'No tienes permiso para ver este panal.';
          toast.error('No tienes permiso.');
          return null; // Retorna null si no tiene permiso
        }
        // 5. Opcional: Podrías añadir aquí una verificación para no cargar panales eliminados lógicamente
        // si fetchSinglePanal solo es para editar/ver panales activos.
        // if (panalData.isDeleted === true) {
        //   console.warn('Intento de acceder a panal eliminado.');
        //   error.value = 'Este panal ha sido eliminado.';
        //   toast.error('Panal eliminado.');
        //   return null;
        // }

        console.log("Datos del documento encontrado en Firestore:", panalData);
        // Retorna el objeto panal con su ID y datos
        return { id: panalDocSnap.id, ...panalData };
      } else {
        // Si el documento no existe
        console.log("Documento con ID", panalId, "no encontrado en Firestore!");
        error.value = `Panal con ID ${panalId} no encontrado.`;
        return null; // Retorna null si no se encuentra
      }
    } catch (err) {
      // Captura y maneja errores durante la obtención del documento
      console.error("Error al obtener documento con ID", panalId, ":", err);
      error.value = err.message || 'Error desconocido al obtener el panal.';
      throw err; // Relanza el error para manejo superior
    } finally {
      loading.value = false; // Desactiva carga
    }
  };

  // Acción para actualizar un panal existente
  // Espera el ID del panal a actualizar y un objeto con los nuevos datos
  const updatePanal = async (panalId, newData) => {
    loading.value = true; // Activa carga global
    error.value = null; // Limpia errores

    // Validaciones antes de actualizar (ej. fechas, pertenencia al usuario)
    if (newData.fechaVencimiento && newData.fechaInicio && new Date(newData.fechaVencimiento) < new Date(newData.fechaInicio)) {
      const msg = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.';
      error.value = msg;
      toast.error(msg);
      loading.value = false;
      throw new Error(msg);
    }

    const authStore = useAuthStore();
    const panalDocSnap = await getDoc(doc(db, 'panales', panalId));
    // Verifica que el panal exista y pertenezca al usuario antes de permitir la actualización
    if (!panalDocSnap.exists() || panalDocSnap.data().userId !== authStore.user?.uid) {
      console.warn('Intento de actualizar panal que no pertenece al usuario.');
      error.value = 'No tienes permiso para editar este panal.';
      toast.error('No tienes permiso.');
      loading.value = false;
      throw new Error('Permission denied');
    }

    try {
      // 1. Crea una referencia al documento
      const panalDocRef = doc(db, 'panales', panalId);

      // 2. Opcional: Previene que ciertos campos sean actualizados por esta acción si no deberían serlo (ej. isDeleted)
      if ('isDeleted' in newData) {
        delete newData.isDeleted; // Elimina el campo isDeleted si viene en newData para prevenir actualización no deseada
        console.warn('Intento de cambiar isDeleted a través de updatePanal. Operación bloqueada.');
      }

      // 3. Actualiza el documento con los nuevos datos
      await updateDoc(panalDocRef, newData);

      console.log('Documento de panal actualizado en Firestore:', panalId);
      toast.success('Panal actualizado correctamente.');

      // 4. Opcional: Actualiza la lista local en el store si es necesario (ej. la lista 'panales')
      // Encuentra el índice del panal actualizado en la lista principal
      const index = panales.value.findIndex(p => p.id === panalId);
      if (index !== -1) {
        // Fusiona los nuevos datos con los datos existentes del panal en la lista
        panales.value[index] = { ...panales.value[index], ...newData };
      }
    } catch (err) {
      // Captura y maneja errores durante la actualización
      console.error('Error al actualizar el panal:', err);
      error.value = err.message || 'Error desconocido al actualizar el panal.';
      toast.error('Error al actualizar el panal.');
      throw err; // Relanza el error para manejo superior
    } finally {
      loading.value = false; // Desactiva carga global
    }
  };

  // Acción para "eliminar" lógicamente un panal (Soft Delete)
  // En lugar de borrar el documento, lo marca con el campo isDeleted = true
  const deletePanal = async (panalId) => {
    loading.value = true; // Activa carga global
    error.value = null; // Limpia errores

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
      // 1. Crea una referencia al documento a marcar como eliminado
      const panalDocRef = doc(db, 'panales', panalId);

      // 2. Actualiza el documento para marcarlo como eliminado lógicamente
      await updateDoc(panalDocRef, {
        isDeleted: true, // <--- Establece el campo isDeleted a true
        deletedAt: new Date().toISOString() // <--- Opcional: Añade una marca de tiempo de cuándo fue eliminado (en formato ISO string)
        // Opcional: deletedBy: authStore.user?.uid // Quién lo eliminó (si es relevante)
      });

      console.log('Documento de panal marcado como eliminado (lógicamente) en Firestore:', panalId);
      toast.success('Panal eliminado correctamente.'); // Muestra mensaje al usuario

      // 3. Opcional: Remover el panal de la lista local principal en el store
      // Esto es útil para que desaparezca de la lista principal (que solo muestra no eliminados) sin recargar
      panales.value = panales.value.filter(panal => panal.id !== panalId);
    } catch (err) {
      // Captura y maneja errores durante la eliminación lógica
      console.error('Error al eliminar (lógicamente) el panal:', err);
      error.value = err.message || 'Error desconocido al eliminar el panal.';
      toast.error('Error al eliminar el panal.');
      throw err; // Relanza el error para manejo superior
    } finally {
      loading.value = false; // Desactiva carga global
    }
  };

  // === Acción: Para cargar panales para reportes con filtros ===
  // **MODIFICADA**: AHORA ACEPTA EL OBJETO 'filters' Y CONSTRUYE LA CONSULTA DINÁMICAMENTE
  // Esta acción carga panales para el módulo de reportes, permitiendo aplicar filtros de estado y fecha.
  // Por defecto, carga todos los panales del usuario (incluyendo lógicamente eliminados) si no se aplican filtros.
  const fetchPanalesForReport = async (filters = {}) => { // <--- Acepta el objeto filters
    loading.value = true; // Activa el estado de carga del store
    error.value = null; // Limpia errores anteriores
    let reportPanales = []; // Usamos una variable local para los resultados de este reporte específico

    const authStore = useAuthStore();
    const userId = authStore.user?.uid; // Obtiene el ID del usuario actual

    // Verifica si hay usuario autenticado
    if (!userId) {
      console.warn('fetchPanalesForReport llamado sin usuario autenticado.');
      error.value = 'Usuario no autenticado. No se pueden cargar los panales para reporte.';
      toast.error(error.value);
      loading.value = false;
      throw new Error('Usuario no autenticado.'); // Lanza error si no hay usuario
    }

    // === LOG: Muestra los filtros que recibió esta acción ===
    console.log("fetchPanalesForReport action called with filters:", filters);

    try {
      // 1. Obtiene la referencia a la colección 'panales'
      const panalesCollection = collection(db, 'panales');

      // --- Construir la consulta dinámicamente basada en los filtros recibidos ---
      // Empezamos con la consulta base: siempre filtrar por el usuario logueado
      let q = query(
        panalesCollection,
        where("userId", "==", userId) // Filtro de igualdad por userId (siempre aplicado)
      );

      // 2. Añadir filtro por estado si está definido en los filters y no es 'Todos'
      // En ReportView.vue pasamos undefined si selectedEstado es 'Todos'.
      if (filters.estado !== undefined) {
        q = query(q, where("estado", "==", filters.estado)); // Filtro de igualdad por estado
        console.log("Filtro de estado añadido:", filters.estado);
      }

      // === 3. Añadir filtro por tipoHuevo si está definido en los filters y no es 'Todos' ===
      // En ReportView.vue pasamos undefined si selectedTipoHuevo es 'Todos'.
      if (filters.tipoHuevo !== undefined) {
        q = query(q, where("tipoHuevo", "==", filters.tipoHuevo)); // Filtro de igualdad por tipoHuevo
        console.log("Filtro de tipoHuevo añadido:", filters.tipoHuevo);
      }
      // ==============================================================================

      // === 4. Añadir UN filtro por rango de fecha (SOLO Fecha Inicio ahora) ===
      let dateRangeField = null; // Variable para rastrear qué campo se usó para el filtro de rango

      // Determinar si se ha proporcionado un rango de fecha de Inicio válido
      const hasInicioRange = filters.fechaInicioStart !== undefined || filters.fechaInicioEnd !== undefined;
      // === ELIMINADO: ya no verificamos hasVencimientoRange ===
      // const hasVencimientoRange = filters.fechaVencimientoStart !== undefined || filters.fechaVencimientoEnd !== undefined;

      if (hasInicioRange) {
        // Si hay fechas para el rango de Inicio, aplicar ese filtro
        if (filters.fechaInicioStart && filters.fechaInicioEnd) {
          q = query(q, where("fechaInicio", ">=", filters.fechaInicioStart), where("fechaInicio", "<=", filters.fechaInicioEnd));
          dateRangeField = "fechaInicio"; // Marcar que se usó fechaInicio para el rango
          console.log("Filtros de fechaInicio (rango) añadidos:", { start: filters.fechaInicioStart, end: filters.fechaInicioEnd });
        } else if (filters.fechaInicioStart) { // Solo Fecha Inicio Desde
          q = query(q, where("fechaInicio", ">=", filters.fechaInicioStart));
          dateRangeField = "fechaInicio";
          console.log("Filtro de fechaInicio (desde) añadido:", filters.fechaInicioStart);
        } else if (filters.fechaInicioEnd) { // Solo Fecha Inicio Hasta
          q = query(q, where("fechaInicio", "<=", filters.fechaInicioEnd));
          dateRangeField = "fechaInicio";
          console.log("Filtro de fechaInicio (hasta) añadido:", filters.fechaInicioEnd);
        }
        // === ELIMINADO: ya no hay 'else if (hasVencimientoRange)' ===
      } else {
        // Si no se proporcionó ningún rango de fechas (y ahora solo consideramos Inicio)
        console.log("Ningún filtro de rango de fechas (Inicio) aplicado.");
      }
      // ================================================================================

      // 5. Añadir ordenamiento
      // IMPORTANT: Ajustar el ordenamiento según si se usó el filtro de rango de fechaInicio.
      // Si se aplicó el filtro de rango en 'fechaInicio', debemos ordenar por ese mismo campo.
      // Si no se aplicó filtro de rango de fechas, podemos ordenar por createdAt (o el orden por defecto deseado).

      if (dateRangeField) { // dateRangeField solo será "fechaInicio" si se usó ese rango
        // Si se aplicó un filtro de rango de fechaInicio, ordenar por fechaInicio.
        // Debes elegir la dirección (asc/desc). Un orden ascendente es común para fechas.
        q = query(q, orderBy(dateRangeField, "asc")); // Ordena por el campo que se filtró por rango (fechaInicio)
        console.log(`Ordenando por ${dateRangeField} (ascendente) debido al filtro de rango aplicado.`);
      } else {
        // Si NO se aplicó ningún filtro de rango de fechas (solo filtros de igualdad), usar el ordenamiento por defecto (createdAt).
        // Nota: Combinar filtros de igualdad en userId, estado, tipoHuevo con ordenamiento por createdAt
        // puede requerir un índice compuesto (ej: userId ASC, estado ASC, tipoHuevo ASC, createdAt ASC, __name__ ASC)
        q = query(q, orderBy("createdAt", "asc")); // Ordenamiento por defecto
        console.log("Ordenando por createdAt (ascendente) (sin filtro de rango de fechas aplicado).");
      }

      // === LOG: Muestra la consulta final construida (el objeto 'q') ===
      console.log("Consulta final construida (Firestore Query Object):", q);

      // 6. Ejecutar la consulta a Firestore
      const querySnapshot = await getDocs(q);
      // === LOG: Muestra cuántos documentos retornó la consulta ===
      console.log("Consulta ejecutada. Número de documentos encontrados:", querySnapshot.size);

      // 7. Mapear los documentos retornados a objetos JavaScript
      reportPanales = querySnapshot.docs.map(doc => ({
        id: doc.id, // Añade el ID del documento
        ...doc.data() // Copia todos los campos del documento (incluyendo estado, fechaVencimiento, isDeleted)
      }));

      // === LOG: Muestra los datos mapeados y listos para retornar ===
      console.log('Panales cargados para reporte (mapeados):', reportPanales);

      // 8. Retorna la lista filtrada y ordenada de panales para que el componente la use
      return reportPanales;
    } catch (err) {
      // === MANEJO DE ERRORES ===
      console.error('Error EN LA ACCIÓN fetchPanalesForReport (Firestore Query Falló):', err);
      // Muestra el error en el estado del store y como notificación toast
      error.value = err.message || 'Error desconocido al cargar los panales para reporte.';
      toast.error('Error al cargar los panales para reporte.');

      // **¡MUY IMPORTANTE!** Si el error es de índice, el mensaje de error lo indicará aquí
      if (err.message && err.message.includes('The query requires an index')) {
        console.error("¡ERROR DE ÍNDICE DE FIRESTORE DETECTADO! Revisa el mensaje completo del error en la consola del navegador o la terminal de emuladores. Debes crear un índice compuesto para esta combinación de filtros y ordenamiento.");
        // El mensaje de error completo del emulador o la nube debería contener el enlace para crear el índice necesario.
      }

      throw err; // Relanza el error para que pueda ser capturado en el componente ReportView.vue si es necesario
    } finally {
      loading.value = false; // Desactiva el estado de carga del store al finalizar (siempre)
    }
  };

  // --- Retornar todos los estados y acciones expuestos por el store ---
  // Estos elementos serán accesibles desde cualquier componente que use usePanalesStore()
  return {
    // Estados
    panales, // Lista principal de panales (solo no eliminados para HoneycombListView)
    loading, // Estado: Indica si el store está cargando (ejecutando una acción asíncrona)
    error, // Estado: Contiene el último mensaje de error del store

    // Acciones
    savePanal, // Acción para guardar/actualizar panales (usa Cloud Function)
    fetchPanales, // Acción para cargar la lista principal (filtrada por usuario y no eliminados)
    updatePanal, // Acción para actualizar campos de un panal existente
    deletePanal, // Acción para eliminación lógica de un panal
    fetchSinglePanal, // Acción para cargar un solo panal por ID
    fetchPanalesForReport // Acción para cargar panales con filtros para reportes
  };
});
