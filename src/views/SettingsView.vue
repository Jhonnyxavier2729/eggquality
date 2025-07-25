<template>
  <div class="config-container">

    <!-- CONTENEDOR NUEVO -->
    <div class="form-container">
    <h2>Configuración de Usuario</h2>
      <div class="form-wrapper">
        <section class="form-section user-data-section" v-if="preferenciasCargadas" >
          <h3>Datos de Usuario</h3>
          <label>
            Nombre de usuario:
            <input type="text" :value="nameUsuario" disabled class="form-input" />
          </label>
          <label>
            Correo Electrónico:
            <input type="email" :value="emailUsuario" disabled class="form-input" />
          </label>

          <h3>Preferencias de Notificación</h3>
            <label class="notificacion-label">
              <span class="notificacion-text">Quiero recibir notificaciones por correo sobre vencimiento de panales.</span>
              <input type="checkbox" v-model="recibirNotificaciones" />
            </label>

        <label class="notificacion-label notificacion-label--stacked" v-if="recibirNotificaciones">
          <span>Recibir alerta {{ diasAnticipacion }} días antes del vencimiento.</span>
            <select v-model="diasAnticipacion" class="form-input select-dias">
                <option :value="1">1 día</option>
                <option :value="2">2 días</option>
                <option :value="3">3 días</option>
                <option :value="4">4 días</option>
                <option :value="5">5 días</option>
                <option :value="6">6 días</option>
                <option :value="7">7 días (recomendado)</option>
                <option :value="8">8 días</option>
                <option :value="9">9 días</option>
                <option :value="10">10 días</option>
            </select>
          </label>
          <label class="notificacion-label" v-else>
            No recibir notificaciones por correo.
            <input type="checkbox" v-model="recibirNotificaciones" style="display: none;" />
        </label>


          <button class="notificacion-btn" @click="guardarPreferencias" :disabled="authStore.loading">
            <span v-if="!authStore.loading">Guardar Preferencias</span>
            <span v-else>Cargando...</span>
          </button>
        </section>
        <div v-if="!preferenciasCargadas" class="loader-preferencias">
          Cargando preferencias...
        </div>


        <section class="form-section password-section"  v-if="preferenciasCargadas">
          <h3>Cambiar Contraseña</h3>
          <form @submit.prevent="cambiarContrasena">
            <label>
              Contraseña Actual:
              <input v-model="contrasenaActual" type="password" required class="form-input" placeholder="••••••••" />
            </label>
            <label>
              Nueva Contraseña:
              <input v-model="nuevaContrasena" type="password" required class="form-input" placeholder="••••••••"/>
            </label>
            <label>
              Confirmar Nueva Contraseña:
              <input v-model="confirmarContrasena" type="password" required class="form-input" placeholder="••••••••"/>
            </label>
            <button type="submit" class="centered-button" :disabled="authStore.loading">
              {{ textoBotonGuardarContrasena }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'; // Asegúrate de importar tu instancia de Firestore
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importar funciones de Firestore


const toast = useToast()
const authStore = useAuthStore()

// --- Estados para el formulario de Cambio de Contraseña ---
const contrasenaActual = ref('')
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')

// --- Estados para el formulario de Preferencias ---
const recibirNotificaciones = ref(true)
const diasAnticipacion = ref(7) // Valor por defecto
const preferenciasCargadas = ref(false)
// --- Computed para mostrar el correo del usuario ---
const emailUsuario = computed(() => authStore.user?.email || '')
const nameUsuario = computed(() => authStore.userName);

// ===> Lógica para Cargar Preferencias al montar el componente <===
const cargarPreferencias = async () => {
    if (authStore.user) {
        const userPrefsRef = doc(db, 'userPreferences', authStore.user.uid);
        try {
            const docSnap = await getDoc(userPrefsRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                recibirNotificaciones.value = data.recibirNotificacionesCorreo ?? true;
                diasAnticipacion.value = data.diasAnticipacionNotificacion ?? 7;
            } else {
                // Si no existen preferencias, establece valores por defecto y créalas
                await setDoc(userPrefsRef, {
                    recibirNotificacionesCorreo: recibirNotificaciones.value,
                    diasAnticipacionNotificacion: diasAnticipacion.value
                }, { merge: true }); // Usar merge: true para no sobrescribir otros campos si los hubiera
            }
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
            toast.error('Error al cargar sus preferencias de notificación.');
            // En caso de error al cargar, mantenemos los valores por defecto definidos en ref()
            recibirNotificaciones.value = true;
            diasAnticipacion.value = 7;
        } finally {
             preferenciasCargadas.value = true // <-- Activar bandera después de cargar
        }
    } else {
        // Si no hay usuario, igualmente establecemos los valores por defecto visualmente
        recibirNotificaciones.value = true;
        diasAnticipacion.value = 7;
        preferenciasCargadas.value = true // <-- Activar aunque no haya usuario
    }
}


onMounted(() => {
  // Asegúrate de que el watch se ejecute una vez que el estado de autenticación se ha inicializado
  // y cuando el usuario cambia.
  watch(
    () => authStore.user,
    async (user) => {
      // Solo cargar preferencias si hay un usuario y la autenticación ya fue inicializada.
      // `authStore.isAuthInitialized` es clave para esperar a que Firebase haya revisado el estado de auth.
      if (user && authStore.isAuthInitialized) {
        await cargarPreferencias();
      } else if (!user && authStore.isAuthInitialized) {
          // Si no hay usuario después de la inicialización, muestra los valores por defecto.
          recibirNotificaciones.value = true;
          diasAnticipacion.value = 7;
          preferenciasCargadas.value = true;
      }
    },
    { immediate: true } // Ejecutar inmediatamente al montar
  );
});



// ===> Lógica para Guardar Preferencias <===
const guardarPreferencias = async () => {
    authStore.error = null;

    if (!authStore.user) {
        toast.error('No hay usuario autenticado para guardar preferencias.');
        return;
    }

    try {
        const userPrefsRef = doc(db, 'userPreferences', authStore.user.uid);
        await setDoc(userPrefsRef, {
            recibirNotificacionesCorreo: recibirNotificaciones.value,
            diasAnticipacionNotificacion: recibirNotificaciones.value ? diasAnticipacion.value : null, // Guarda null si no quiere recibir notificaciones
        }, { merge: true }); // Usar merge: true para no sobrescribir otros campos si los hubiera

        toast.success('Preferencias guardadas correctamente.');
    } catch (error) {
        console.error('Error al guardar preferencias:', error);
        const errorMessage =
            authStore.error || error.message || 'Error desconocido al guardar preferencias.';
        toast.error(`Error al guardar preferencias: ${errorMessage}`);
    }
}

// ===> Lógica para Cambio de Contraseña <===
const cambiarContrasena = async () => {
  authStore.error = null

  if (!contrasenaActual.value || !nuevaContrasena.value || !confirmarContrasena.value) {
    toast.warning('Por favor, completa todos los campos de contraseña.')
    return
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    toast.error('La nueva contraseña y su confirmación no coinciden.')
    return
  }

  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(nuevaContrasena.value)
  const hasLowerCase = /[a-z]/.test(nuevaContrasena.value)
  const hasNumbers = /[0-9]/.test(nuevaContrasena.value)

  if (nuevaContrasena.value.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
    let message = `La nueva contraseña debe tener al menos ${minLength} caracteres, incluyendo mayúsculas, minúsculas y números.`
    toast.warning(message)
    return
  }

  if (!authStore.user) {
    toast.error('No hay usuario autenticado.')
    return
  }

  try {
    await authStore.updateUserPasswordWithReauth(contrasenaActual.value, nuevaContrasena.value)
    toast.success('Contraseña actualizada con éxito.')
    contrasenaActual.value = ''
    nuevaContrasena.value = ''
    confirmarContrasena.value = ''
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    const errorMessage =
      authStore.error || error.message || 'Ocurrió un error desconocido al cambiar la contraseña.'
    toast.error(`Error: ${errorMessage}`)
  }
}

// --- Computed para el texto dinámico del botón ---
const textoBotonGuardarContrasena = computed(() =>
  authStore.loading ? 'Guardando Contraseña...' : 'Guardar Cambios',
)
</script>

<style scoped>
/* --- ESTILOS BASE (para móviles pequeños, por defecto < 600px) --- */
.config-container {
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0rem;  /*Margen vertical y centrado */
    padding: 1rem; /* Padding interno base */

}
.form-container {
    position: relative;
    background-color: white;
    padding: 1rem; /* Padding interno base */
    border-radius: 8px; /* Bordes menos redondeados */
    box-shadow: 0 2px 8px rgba(208, 106, 55, 0.1); /* Sombra más suave */
    border: 1px solid #e6e2e2; /* Borde más delgado */
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0 auto; /* Centrado */
    z-index: 1;

}

h2 {
  background-color: #ff753a10;
  border-left: 6px solid #ff753a;
  border-right: 6px solid #ff753a;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  color: #050303;
  margin-bottom: 3rem;
  display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
  width: 80%; /* Mantén tu ancho deseado para el bloque del título */
  text-align: center; /* Centra el texto dentro del h2 */
  margin-left: auto; /* Centra el h2 horizontalmente */
  margin-right: auto; /* Centra el h2 horizontalmente */
  max-width: 600px;
}

h3 {
    margin-bottom: 1rem; /* Reduce margen inferior */
    color: #333333;
    font-size: 1.2rem; /* Tamaño de fuente base */
}

/* Contenedor principal de las secciones del formulario */
.form-wrapper {
    display: flex;
    flex-direction: column; /* Apilados por defecto en móviles */
    gap: 1rem;
}

/* Contenedor de una sección individual del formulario */
.form-section {
    flex: 1 0 100%; /* Ocupa todo el ancho disponible apilado */
    min-width: auto; /* Elimina min-width fijo en móviles */
    padding: 1rem; /* Padding interno base de la sección */
    border-radius: 10px; /* Bordes menos redondeados */
    box-shadow: 0 0 6px rgba(120, 86, 86, 0.08); /* Sombra más suave */
    display: flex; /*cambios aqui*/
    flex-direction: column;
    gap: 0.5rem;
}

/* Estilos de borde por sección */
.user-data-section,.password-section,.notificaciones-section {
    background-color: #ffffff; /* Mantener background si se cambia en .form-section */
    border: 1px solid #ff753a; /* Borde más delgado */
}

.user-data-section {
    background-color: #f9f9f9;
    padding: 1rem; /* Un poco más de padding para que respire */
    box-shadow: 0 4px 10px rgba(255, 117, 58, 0.1); /* Sombra más pronunciada y con tu color */
    border: 2px solid #ff753a; /* Borde un poco más grueso y definido */
    border-radius: 12px;
}

.notificacion-label {
    display: flex;
    align-items: center;
    gap: 0px; /* Reduce espacio */
    font-weight: 500;
    color: #333;
    flex-wrap: nowrap;
    flex-shrink: 0;
    font-size: 0.9rem; /* Tamaño de fuente base */
}
.notificacion-label.notificacion-label--stacked {
  flex-direction: column; /* Apila los elementos verticalmente */
  align-items: flex-start; /* Alinea los elementos a la izquierda dentro de la columna */
  gap: 5px; /* Ajusta el espacio vertical entre el texto y el select */
}

.notificacion-label.notificacion-label--stacked span {
  margin-bottom: 2px; /* Opcional: pequeño espacio si el gap no es suficiente o quieres controlarlo distinto */
}

input[type='checkbox'] {
    width: auto;
    height: auto;
    margin: 0;
    padding: 0;
    transform: scale(1.3);/* Aumenta el tamaño del checkbox */
}

.notificacion-btn {
    margin-top: 1rem; /* Reduce margen superior */
    padding: 0.8rem 1.2rem; /* Padding base */
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px; /* Bordes menos redondeados */
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
    width: 100%; /* Ocupa todo el ancho disponible apilado */
    max-width: none; /* Elimina max-width fijo en móviles */
    font-size: 1rem; /* Tamaño de fuente base */
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.notificacion-btn:hover {
    background-color: #e44d0e;
    transform: translateY(-2px);
}
.notificacion-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
input[type='email'],
input[type='password'],
input[type='text'],
select.form-input{
  margin-top: 3px;
  padding: 0.3rem;
  width: 100%;
  border-radius: 6px;
  border: 1.7px solid #ff753a; /* Borde naranja normal */
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Añade transición para suavizar */

}

input[type='email']:hover,
input[type='password']:hover,
input[type='text']:hover,
select.form-input:hover { /* Añadimos select.form-input:hover */
border-color: #d88569; /* Naranja más oscuro al pasar el ratón */
cursor: pointer; /* Cambia a pointer para el select, ya que es clickeable */
}
input[type='email']:focus,
input[type='password']:focus,
input[type='text']:focus,
select.form-input:focus { /* Añadimos select.form-input:focus */
outline: none;
border-color: #ed6227; /* Un naranja un poco más intenso para el foco */
box-shadow: 0 0 2px rgba(255, 117, 58, 0.6);
}
input:disabled {
    background-color: #e9e9e9;
    color: #555;
    cursor: not-allowed;
}

form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem; /* Reduce espacio entre elementos del formulario */
}

form label {
    display: block;
    margin-bottom: 0.5rem; /* Reduce margen inferior */
    font-weight: 600;
    color: #333;
    font-size: 0.9rem; /* Tamaño de fuente base */

}

form input[type='password'],
form input[type='email'],
form input[type='text'] {
    margin-bottom: 0.8rem; /* Reduce margen inferior */
}

.centered-button {
    margin-top: 1rem; /* Reduce margen superior */
    padding: 0.8rem 1.5rem; /* Padding base */
    background-color: #ff753a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    align-self: stretch; /* Ocupa todo el ancho disponible apilado */
    font-size: 1rem; /* Tamaño de fuente base */
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.centered-button:hover {
    background-color: #e44d0e;
    transform: translateY(-2px);
}


/* --- Media Query para Móviles Grandes y Tablets pequeñas ( >= 600px ) --- */
@media (min-width: 600px) {
    .config-container {
        padding: 1.5rem;
    }

    .form-container {
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e6e2e2;
    }

    h2 {
        background-color: #ff753a10;
        border-left: 6px solid #ff753a;
        border-right: 6px solid #ff753a;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.5rem;
        color: #050303;
        margin-bottom: 3rem;
        display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
        width: 50%; /* Mantén tu ancho deseado para el bloque del título */
        text-align: center; /* Centra el texto dentro del h2 */
        margin-left: auto; /* Centra el h2 horizontalmente */
        margin-right: auto; /* Centra el h2 horizontalmente */
        max-width: 600px;
    }

     h3 {
        font-size: 1.3rem;
        margin-bottom: 1.2rem;
     }


    .form-wrapper {
        gap: 1.5rem; /* Espacio entre secciones apiladas */
    }

    .form-section {
         flex: 1 0 100%; /* Sigue ocupando todo el ancho apilado */
         padding: 1.2rem;
         border-radius: 8px;
         box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    }

    .notificacion-label {
        gap: 2px;
        font-size: 1rem;
        flex-direction: row; /* Vuelven a estar en fila */
        align-items: center;
    }

     .notificacion-btn {
        margin-top: 1.2rem;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        width: auto; /* Ancho automático */
        max-width: 200px; /* Opcional: un max-width para que no sean enormes */
        font-size: 1rem;
        align-self: center; /* Alinear a la izquierda si el padre es flex column */
        transition: background-color 0.3s ease, transform 0.2s ease;
     }


    input[type='email'],
    input[type='password'],
    input[type='text'] {
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #ff753a;
        font-size: 1rem;
    }

    form {
        gap: 1rem;
    }

    form label {
         margin-bottom: 0.8rem;
         font-size: 1rem;
    }

    form input[type='password'],
    form input[type='email'],
     form input[type='text'] {
        margin-bottom: 1rem;
     }
    .centered-button {
        margin-top: 1.5rem;
        padding: 1rem 1.8rem;
        border-radius: 6px;
        font-size: 1rem;
        align-self: center; /* Vuelve a centrarse */
        transition: background-color 0.3s ease, transform 0.2s ease;
    }
}
/* --- Media Query para Tablets Grandes y Escritorios pequeños ( >= 768px ) --- */
@media (min-width: 768px) {
    .config-container {
        padding: 2rem;
        max-width: 5000px; /*  para dar más espacio al padre */
    }

    .form-container {
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #e6e2e2;
        max-width: 100%;
        margin: 0 auto; /* Centrado */
        z-index: 1;
    }

    h2 {
        background-color: #ff753a10;
        border-left: 6px solid #ff753a;
        border-right: 6px solid #ff753a;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.8rem;
        color: #050303;
        margin-bottom: 3rem;
        display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
        width: 60%; /* Mantén tu ancho deseado para el bloque del título */
        text-align: center; /* Centra el texto dentro del h2 */
        margin-left: auto; /* Centra el h2 horizontalmente */
        margin-right: auto; /* Centra el h2 horizontalmente */
        max-width: 600px;
    }

     h3 {
        font-size: 1.4rem;
        margin-bottom: 1.5rem;
     }

    .form-wrapper {
        display: flex;
        flex-direction:row; /* <-- Correcto para ponerlos en fila */
        flex-wrap: wrap; /* Importante para que salten de línea si no caben */
        justify-content: center;
        gap: 20px;
    }

    .form-section {
        flex: 1 1 auto; /* Permite que crezcan/encojan y distribuyan espacio */

        min-width: 280px; /* Mínimo que ya tenías */
        max-width: 400px; /* Máximo que ya tenías */
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
        border: 2px solid #ff753a;
    }
}

    /* Ajustar bordes específicos si cambiaste el base */
    .user-data-section,.password-section,.notificaciones-section {
        border: 1px solid #ff753a;
    }
    .user-data-section label {
    margin-bottom: 0.5rem; /* Más espacio entre cada par label-input */
    }


     .notificacion-btn {
        margin-top: 1.5rem;
        padding: 1rem 1.8rem;
        border-radius: 6px;
        width: auto;
        max-width: 250px;
        font-size: 1.1rem;
        align-self: center;
        transition: background-color 0.3s ease, transform 0.2s ease;
     }


    input[type='email'],
    input[type='password'],
    input[type='text'] {
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #ff753a;
        font-size: 1rem;
    }

    form {
        gap: 1.2rem;
    }

    form label {
         margin-bottom: 8px;
         font-size: 1rem;
    }

    form input[type='password'],
    form input[type='email'],
    form input[type='text'] {
         margin-bottom: 1.5rem;
     }


    .centered-button {
        margin-top: 2rem;
        padding: 1rem 1.8rem;
        border-radius: 6px;
        font-size: 1.1rem;
        align-self: center;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

/* --- Media Query para Escritorios Grandes ( >= 1024px ) --- */
@media (min-width: 1024px) {
    .config-container {
        padding: 2.5rem;
        max-width:1400px; /* Max-width estándar */
        margin-top: -0.6rem; /* Probablemente este es el que necesitas ajustar */
        margin-left: auto;
        margin-right: auto;
    }

    .form-container {
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #e6e2e2;
        max-width: 100%; /* Permitir que el padre controle el ancho */
        margin: 0 auto;

    }

    h2 {
        background-color: #ff753a10;
        border-left: 6px solid #ff753a;
        border-right: 6px solid #ff753a;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 2rem;
        color: #050303;
        margin-bottom: 3rem;
        display: block; /* Asegura que sea un elemento de bloque para aplicar márgenes automáticos */
        width: 50%; /* Mantén tu ancho deseado para el bloque del título */
        text-align: center; /* Centra el texto dentro del h2 */
        margin-left: auto; /* Centra el h2 horizontalmente */
        margin-right: auto; /* Centra el h2 horizontalmente */
        max-width: 600px;
    }

    h3 {
        font-size: 1.3rem;
        margin-bottom: 15px;
    }

    .form-wrapper {
        gap: 25px; /* Espacio entre secciones */
    }

    .form-section {
        flex: 1 1 auto;
        /* ANCHO: Reducir min-width y max-width */
        min-width: 250px; /* Reducido de 280px para permitir que sean más pequeños */
        max-width: 350px; /* Reducido de 400px para limitar su tamaño máximo */
        /* LARGO: Reducir padding */
        padding: 0.8rem; /* Esto ya estaba reducido, lo cual ayuda con el largo */
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border: 2px solid #ff753a;
    }

    .notificacion-label {
        gap: 1px; /* Reducido de 15px */
        font-size: 0.9rem; /* Reducido de 1rem para textos más pequeños */
    }

    .notificacion-btn {
        margin-top: 10px; /* Reducido de 15px */
        padding: 0.8rem 1.5rem; /* Reducido de 1.1rem 2rem para botón más compacto */
        border-radius: 6px;
        width: auto;
        max-width: 250px; /* Reducido de 280px */
        font-size: 1rem; /* Reducido de 1.1rem */
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    input[type='email'],
    input[type='password'],
    input[type='text'] {
        padding: 0.8rem; /* Reducido de 1.1rem para inputs más cortos */
        border-radius: 6px;
        border: 2px solid #ff753a;
        font-size: 1rem; /* Reducido de 1.1rem */
    }

    form {
        gap: 1rem; /* Reducido de 1.5rem para que los elementos del formulario estén más juntos */
    }

    form label {
        margin-bottom: 0px; /* Ya estaba bien */
        font-size: 0.9rem; /* Reducido de 1rem */
    }

    form input[type='password'],
    form input[type='email'],
    form input[type='text'] {
        margin-bottom: 5px; /* Aumentado ligeramente de 2px para una mínima separación, pero puedes mantenerlo en 2px o reducirlo */
    }

    .centered-button {
        margin-top: 5px; /* Reducido de 10px */
        padding: 0.9rem 1.8rem; /* Reducido de 1.1rem 2rem */
        border-radius: 6px;
        font-size: 1.1rem; /* Reducido de 1.2rem */
        transition: background-color 0.3s ease, transform 0.2s ease;
    }
}

/* --- Media Query para Pantallas Ultra Grandes ( >= 2500px ) --- */
@media (min-width: 2500px) {
    .config-container {
        padding: 3rem; /* Mucho más padding general */
        max-width: 100%; /* Permitir que el padre controle el ancho */
    }

    .form-container {
        padding: 4rem; /* Mucho más padding interno */
        border-radius: 16px; /* Bordes más redondeados */
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        border: 3px solid #dcdcdc; /* Borde más grueso */
        max-width: 70%; /* Ejemplo: No más del 70% del viewport */
    }

    h2 {
        font-size: 1.5rem; /* Tamaño de fuente mucho más grande h2 */
        margin-bottom: 40px;
    }

    h3 {
        font-size: 1.8rem; /* Tamaño de fuente h3 más grande */
        margin-bottom: 20px;
    }

     .form-wrapper {
         gap: 40px; /* Mucho más espacio entre secciones */
     }

    .form-section {
         /* Para que las SECCIONES (formularios) sean más grandes */
         flex: 1 1 auto; /* Sigue permitiendo crecer y encoger */
         min-width: 350px; /* Aumenta considerablemente el mínimo para que sean más anchas */
         max-width: 550px; /* Aumenta considerablemente el máximo */
         padding: 3rem; /* Mucho más padding interno */
         border-radius: 10px;
         box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
         border: 3px solid #ff753a; /* Borde más grueso */
     }

    .notificacion-label {
        gap: 20px; /* Más espacio */
        font-size: 1.1rem; /* Tamaño de fuente más grande */
    }

     .notificacion-btn {
        margin-top: 30px; /* Más margen superior */
        padding: 1.2rem 2.5rem; /* Botón más grande */
        border-radius: 8px;
        width: auto;
        max-width: 350px; /* Aumenta max-width del botón */
         font-size: 1.2rem; /* Tamaño de fuente del botón más grande */
         transition: background-color 0.3s ease, transform 0.2s ease;
     }


    input[type='email'],
    input[type='password'],
    input[type='text'] {
        padding: 1.5rem; /* Mucho más padding en inputs */
        border-radius: 8px;
        border: 2px solid #ff753a;
        font-size: 1.2rem; /* Tamaño de fuente de inputs más grande */
    }

    form {
        gap: 20px; /* Más espacio entre elementos del formulario */
    }

    form label {
         margin-bottom: 10px; /* Más margen inferior */
         font-size: 1.1rem; /* Tamaño de fuente de label más grande */
    }

    form input[type='password'],
    form input[type='email'],
    form input[type='text'] {
         margin-bottom: 20px; /* Más margen inferior */
     }


    .centered-button {
        margin-top: 30px; /* Más margen superior */
        padding: 1.2rem 2.5rem; /* Botón más grande */
        border-radius: 8px;
        font-size: 1.3rem; /* Tamaño de fuente del botón más grande */
        transition: background-color 0.3s ease, transform 0.2s ease;
    }
}
</style>
