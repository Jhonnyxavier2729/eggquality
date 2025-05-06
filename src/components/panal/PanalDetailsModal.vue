<template>
    <div class="modal-overlay" @click.self="closeModal"> <!-- Cierra si clicas fuera del contenido -->
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalles del Panal</h3>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="panal">
            <p><strong>ID del Panal:</strong> {{ panal.idPanal }}</p>
            <p><strong>Tipo de Huevo:</strong> {{ panal.tipoHuevo }}</p>
            <p><strong>Cantidad de Huevos:</strong> {{ panal.cantidadHuevos }}</p>
            <p><strong>Galpón o Lote:</strong> {{ panal.galponLote }}</p>
            <p><strong>Fecha de Inicio:</strong> {{ panal.fechaInicio }}</p>
            <p><strong>Fecha de Vencimiento:</strong> {{ panal.fechaVencimiento }}</p>
            <p><strong>Estado:</strong> {{ panal.estado }}</p>
            <p><strong>Creado en:</strong> {{ panal.createdAt ? new Date(panal.createdAt.seconds * 1000).toLocaleString() : 'N/A' }}</p> <!--  Formatear timestamp -->
            </div>
          <div v-else>
            <p>Cargando detalles...</p> <!--  Opcional: Indicador si panal prop aún no está listo  -->
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  // Definir las props que espera el componente
  const props = defineProps({
    panal: {
      type: Object, // Esperamos un objeto panal
      required: true // La prop panal es obligatoria
    }
  });
  
  // Definir los eventos que el componente puede emitir
  const emit = defineEmits(['close']); // Puede emitir un evento 'close'
  
  // Función para emitir el evento close (para cerrar el modal desde el padre)
  const closeModal = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  /* Estilos para el overlay (fondo oscuro) */
  .modal-overlay {
    position: fixed; /* Posición fija en la ventana */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Fondo semi-transparente */
    display: flex;
    justify-content: center; /* Centrar horizontalmente */
    align-items: center; /* Centrar verticalmente */
    z-index: 1000; /* Asegurarse de que esté por encima de otros elementos */
  }
  
  /* Estilos para el contenedor principal del contenido del modal */
  .modal-content {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    width: 90%; /* Ancho en móviles */
    max-width: 600px; /* Ancho máximo en pantallas grandes */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 90vh; /* Altura máxima para scroll si el contenido es largo */
    overflow-y: auto; /* Agrega scroll si el contenido excede la altura máxima */
  }
  
  /* Estilos para el encabezado del modal */
  .modal-header {
    display: flex;
    justify-content: space-between; /* Espacio entre título y botón de cerrar */
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  
  .modal-header h3 {
    margin: 0; /* Quita margen por defecto del h3 */
    color: #ff753a; /* Color del título */
  }
  
  /* Estilos para el botón de cerrar (X) */
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1; /* Ajusta la altura de línea */
    color: #555;
    transition: color 0.2s ease;
  }
  
  .close-button:hover {
    color: #ff5c1a; /* Naranja oscuro al pasar el ratón */
  }
  
  /* Estilos para el cuerpo del modal (donde se muestra la info) */
  .modal-body {
    flex-grow: 1; /* Permite que el cuerpo crezca */
    padding-right: 10px; /* Espacio para la barra de scroll si aparece */
  }
  
  .modal-body p {
      margin-bottom: 10px;
      line-height: 1.5;
      color: #333;
  }
  
  .modal-body strong {
      color: #2c3e50; /* Color más oscuro para las etiquetas */
  }
  
  
  /* Estilos para el pie de página del modal */
  .modal-footer {
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 20px;
    text-align: right; /* Alinea el botón a la derecha */
  }
  
  .modal-footer button {
    padding: 10px 20px; /* Padding */
    background-color: #ff753a; /* Fondo naranja */
    color: white; /* Texto blanco */
    border: none;
    border-radius: 6px; /* Bordes redondeados */
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease; /* Transición para hover/transform */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Sombra */
    letter-spacing: 0.5px; /* Opcional: espaciado entre letras */
}

.modal-footer button:hover {
    background-color: #ff5c1a; /* Naranja más oscuro al pasar el ratón */
    transform: translateY(-1px); /* Ligero movimiento hacia arriba */
    box-shadow: 0 4px 8px rgba(255, 117, 58, 0.3); /* Sombra al pasar el ratón */
}


/* Responsive básico para el modal */
@media (max-width: 600px) {
    .modal-content {
        padding: 15px; /* Reducir padding en móviles */
    }
    .modal-header h3 {
        font-size: 1.2rem;
    }
    .modal-body p {
        margin-bottom: 8px;
        font-size: 0.95rem;
    }
     .modal-body strong {
        min-width: 120px; /* Reducir ancho mínimo de etiquetas en móviles */
     }
    .modal-footer {
        padding-top: 10px;
        margin-top: 15px;
    }
    .modal-footer button {
         padding: 10px 15px; /* Ajustar padding del botón */
         font-size: 0.95rem;
    }
}
  
  </style>