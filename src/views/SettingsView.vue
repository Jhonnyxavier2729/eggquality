<template>
  <div class="config-container">

    <!-- CONTENEDOR NUEVO -->
    <div class="form-container">
    <h2>Configuración de Usuario</h2>
      <div class="form-wrapper">
        <section class="form-section user-data-section">
          <h3>Datos de Usuario</h3>
          <label>
            Correo Electrónico:
            <input type="email" :value="emailUsuario" disabled class="form-input" />
          </label>

          <h3 style="margin-top: 1.5rem">Preferencias de Notificación</h3>
          <label class="notificacion-label">
            Quiero recibir notificaciones por correo sobre vencimiento de panales.
            <input type="checkbox" v-model="recibirNotificaciones" />
          </label>
          <button class="notificacion-btn" @click="guardarPreferencias" :disabled="authStore.loading">
            Guardar Preferencias
          </button>
        </section>

        <section class="form-section password-section">
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
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const toast = useToast()
const authStore = useAuthStore()

// --- Estados para el formulario de Cambio de Contraseña ---
const contrasenaActual = ref('')
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')

// --- Estados para el formulario de Preferencias ---
const recibirNotificaciones = ref(false)

// --- Computed para mostrar el correo del usuario ---
const emailUsuario = computed(() => authStore.user?.email || '')

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

// --- Lógica para Guardar Preferencias ---
const guardarPreferencias = async () => {
  authStore.error = null

  if (!authStore.user) {
    toast.error('No hay usuario autenticado para guardar preferencias.')
    return
  }

  try {
    console.log(
      'Simulando guardado de preferencia "recibirNotificaciones":',
      recibirNotificaciones.value,
    )
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success('Preferencias guardadas correctamente.')
  } catch (error) {
    console.error('Error al guardar preferencias:', error)
    const errorMessage =
      authStore.error || error.message || 'Error desconocido al guardar preferencias.'
    toast.error(`Error al guardar preferencias: ${errorMessage}`)
  }
}
</script>

<style scoped>
/* --- ESTILOS BASE (para móviles pequeños, por defecto < 600px) --- */
.config-container {
    max-width: 100%; /* Ocupa el 100% del padre en móviles */
    margin: 0.1rem auto;  /*Margen vertical y centrado */
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
    text-align: center;
    margin-bottom: 1.5rem; /* Reduce margen inferior */
    color: #ff753a;
    font-size: 1.5rem; /* Tamaño de fuente base */
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
}

/* Estilos de borde por sección */
.user-data-section,.password-section,.notificaciones-section {
    background-color: #ffffff; /* Mantener background si se cambia en .form-section */
    border: 1px solid #ff753a; /* Borde más delgado */
}

.user-data-section {
    background-color: #f9f9f9;
}

.notificacion-label {
    display: flex;
    align-items: center;
    gap: 8px; /* Reduce espacio */
    font-weight: 500;
    color: #333;
    flex-wrap: wrap;
    font-size: 0.9rem; /* Tamaño de fuente base */
}

input[type='checkbox'] {
    width: auto;
    height: auto;
    margin: 0;
    padding: 0;
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
}

.notificacion-btn:hover {
    background-color: #e44d0e;
}
.notificacion-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
input[type='email'],
input[type='password'],
input[type='text'] {
  margin-top: 5px;
  padding: 0.8rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ff753a; /* Borde naranja normal */
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Añade transición para suavizar */
}

input[type='email']:hover,
input[type='password']:hover,
input[type='text']:hover {
  border-color: #c97a60; /* Cambia a un naranja más oscuro al pasar el ratón */
  cursor: text;
}
input[type='email']:focus,
input[type='password']:focus,
input[type='text']:focus {
  outline: none; /* 
  border-color: #ff753a; /* Puedes usar tu naranja principal para el borde al enfocar */
  box-shadow: 0 0 5px rgba(255, 117, 58, 0.6); /* Agrega una sombra suave del mismo color naranja para un efecto visual de enfoque */
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
}

.centered-button:hover {
    background-color: #e44d0e;
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
        font-size: 1.8rem;
        margin-bottom: 2rem;
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
        gap: 10px;
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
         align-self: flex-start; /* Alinear a la izquierda si el padre es flex column */
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
    }
}
/* --- Media Query para Tablets Grandes y Escritorios pequeños ( >= 768px ) --- */
@media (min-width: 768px) {
    .config-container {
        padding: 2rem;
        max-width: 1000px; /*  para dar más espacio al padre */
    }

    .form-container {
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #e6e2e2;
        max-width: 950px;
        margin: 0 auto; /* Centrado */
        z-index: 1;
    }

    h2 {
        font-size: 2rem;
        margin-bottom: 2.5rem;
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
        border: 2px solid #ff753a;
    }
    .notificacion-label {
        gap: 12px;
        font-size: 1rem;
    }

     .notificacion-btn {
        margin-top: 1.5rem;
        padding: 1rem 1.8rem;
        border-radius: 6px;
        width: auto;
        max-width: 250px;
        font-size: 1.1rem;
        align-self: flex-start;
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
    }

/* --- Media Query para Escritorios Grandes ( >= 1024px ) --- */
@media (min-width: 1024px) {
    .config-container {
        padding: 2.5rem;
        max-width: 1000px; /* Max-width estándar */
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
        font-size: 2rem;
        margin-bottom: 25px;
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
        gap: 10px; /* Reducido de 15px */
        font-size: 0.9rem; /* Reducido de 1rem para textos más pequeños */
    }

    .notificacion-btn {
        margin-top: 10px; /* Reducido de 15px */
        padding: 0.8rem 1.5rem; /* Reducido de 1.1rem 2rem para botón más compacto */
        border-radius: 6px;
        width: auto;
        max-width: 250px; /* Reducido de 280px */
        font-size: 1rem; /* Reducido de 1.1rem */
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
        /* --- Para que el CONTENEDOR principal se expanda --- */
        /* Usa un porcentaje para max-width */
        max-width: 70%; /* Ejemplo: No más del 70% del viewport */
        /* margin: auto; ya está para centrar */
    }

    h2 {
        font-size: 3rem; /* Tamaño de fuente mucho más grande h2 */
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
    }
}
</style>
