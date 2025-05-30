<template>
    <!-- {/* Overlay oscuro que cubre la pantalla */} -->
    <div class="modal-overlay" @click.self="$emit('cancel')"> <!--{/* Cierra al hacer clic fuera */} -->
     <!-- {/* Contenedor del modal */} -->
      <div class="modal-container">
        <!-- {/* Icono (opcional, como el signo de pregunta) */} -->
        <div class="modal-icon">
            <font-awesome-icon :icon="iconType" style="color: #ff7b00;" size="3x"  />
            
        </div>
  
        <!-- {/* Título del modal (viene de las props) */} -->
        <h3 class="modal-title">{{ title }}</h3>
  
        <!-- {/* Mensaje del modal (viene de las props) */} -->
        <p class="modal-message">{{ message }}</p>
  
        <!-- {/* Contenedor de botones */} -->
        <div class="modal-actions">
          <!-- {/* Botón de Confirmar */} -->
          <button @click="$emit('confirm')" class="confirm-button">
            {{ confirmButtonText }}
          </button>
          <!-- {/* Botón de Cancelar */} -->
          <button @click="$emit('cancel')" class="cancel-button">
            {{ cancelButtonText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

  const iconType = faQuestionCircle;
  
  // Definir las propiedades que el componente recibirá
  const props = defineProps({
    title: { // Título del modal (ej: "¿Quieres salir?")
      type: String,
      required: true
    },
    message: { // Mensaje principal (ej: "La sesión se cerrará...")
      type: String,
      required: true
    },
    confirmButtonText: { // Texto del botón de confirmar (ej: "Sí, salir")
      type: String,
      default: 'Confirmar' // Texto por defecto
    },
    cancelButtonText: { // Texto del botón de cancelar (ej: "Cancelar")
      type: String,
      default: 'Cancelar' // Texto por defecto
    }
  });
  
  // Definir los eventos que el componente puede emitir
  const emit = defineEmits(['confirm', 'cancel']);
  
  </script>
  
  <style >
  /* Estilos para el Overlay (fondo oscuro) */
  .modal-overlay {
    position: fixed; /* Fijo en la ventana */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Fondo semi-transparente oscuro */
    display: flex;
    justify-content: center; /* Centrar horizontalmente */
    align-items: center; /* Centrar verticalmente */
    z-index: 99999; /* Asegurar que esté por encima de otros elementos */
  }
  
  /* Estilos para el Contenedor del Modal */
  .modal-container {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    text-align: center; /* Centrar texto y elementos internos */
    max-width: 400px; /* Ancho máximo del modal */
    width: 90%; /* Ocupar el 90% del ancho en pantallas pequeñas */
    position: relative; /* Necesario si quieres posicionar algo absoluto dentro */
    opacity: 0; /* Inicia invisible */
    transform: translateY(-20px); /* Inicia ligeramente arriba */
    animation: slideIn 0.3s ease forwards; /* Animación de entrada */
  }
  
  /* Animación de entrada */
  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Estilos para el Icono del Modal (si lo usas) */
  .modal-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px auto;
    /* Color y borde, puedes usar los colores de tu proyecto */
    color: #ff753a; /* Ejemplo: color naranja del proyecto */
    border: 2px solid #ff753a; /* Borde con color naranja */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}


/* === Define la animación de volteo horizontal === */
@keyframes flip-horizontal {
  0% { transform: rotateY(0deg); }     /* Inicio: Orientación normal */
  50% { transform: rotateY(180deg); }  /* Mitad: Volteado horizontalmente */
  100% { transform: rotateY(360deg); } /* Fin: Vuelve a la orientación normal (360deg es lo mismo que 0deg) */
}
/* Puedes simplificar el 100% a rotateY(0deg) si quieres, pero 360deg es más explícito del ciclo completo */
/* =============================================== */


/* === Aplica la animación de volteo al icono dentro del contenedor === */
.modal-icon svg {
  animation: flip-horizontal 2s ease-in-out ; /* Nombre, duración, tipo de aceleración, repetición */
  /*
    flip-horizontal: Nombre de la nueva animación
    2s: Duración de cada ciclo de animación (2 segundos para ir y volver)
    ease-in-out: La animación inicia y termina suavemente, más rápida en el medio
    infinite: La animación se repite indefinidamente
  */
}
/* ================================================================== */
  
  
  /* Estilos para el Título */
  .modal-title {
    margin-top: 0;
    color: #333;
    font-size: 1.4rem;
    margin-bottom: 10px;
  }
  
  /* Estilos para el Mensaje */
  .modal-message {
    color: #555;
    font-size: 1rem;
    margin-bottom: 25px;
    line-height: 1.5;
  }
  
  /* Estilos para el Contenedor de Botones */
  .modal-actions {
    display: flex;
    justify-content: center; /* Centrar botones */
    gap: 15px; /* Espacio entre botones */
  }
  
  /* Estilos Base para los Botones */
  .modal-actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background-color 0.3s ease, opacity 0.3s ease;
  }
  
  /* Estilos para el Botón de Confirmar (ej: color primario del proyecto) */
  .confirm-button {
    background-color: #ff753a; /* Naranja de tu proyecto */
    color: white;
  }
  
  .confirm-button:hover {
    background-color: #ff5c1a; /* Naranja más oscuro al pasar el ratón */
  }
  
  /* Estilos para el Botón de Cancelar (ej: color secundario o neutro) */
  .cancel-button {
    background-color: #ccc; /* Gris neutro */
    color: #333;
  }
  
  .cancel-button:hover {
    background-color: #bbb; /* Gris más oscuro */
  }
  
  /* Opcional: Estilo si un botón está deshabilitado */
  .modal-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
  }
  
  </style>