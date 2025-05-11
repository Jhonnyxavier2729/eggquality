// functions/index.js
// Importa function triggers from their respective submodules (sintaxis v2)

// Para funciones llamables (Callable Functions)
const {onCall} = require("firebase-functions/v2/https");
// Para funciones programadas (Scheduled Functions)
const {onSchedule} = require("firebase-functions/v2/scheduler");
// Para acceso a logger (v2)
const {logger} = require("firebase-functions");
// Para acceso a variables de entorno (todavía se usa de v1)
const functions = require('firebase-functions');

const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK si no lo has hecho ya
// Usar admin.initializeApp() sin argumentos si estás en un ambiente de CF desplegado.
try {
  admin.initializeApp();
  logger.info('Firebase Admin SDK initialized successfully');
} catch (e) {
  // Puede que ya esté inicializado, ignora el error si es el de "app already exists"
  if (!e.message.includes('already exists')) {
     logger.error('Firebase Admin initialisation error', e);
  } else {
     logger.info('Firebase Admin SDK already initialized');
  }
}

const db = admin.firestore();

// === Configuración de SendGrid ===
// Debes instalar el paquete en tu carpeta functions: npm install @sendgrid/mail
// Debes configurar la variable de entorno: firebase functions:config:set sendgrid.apikey="TU_API_KEY_DE_SENDGRID"
// Opcional: configura el email del remitente: firebase functions:config:set sendgrid.sender_email="tu_email_verificado@ejemplo.com"
const sgMail = require('@sendgrid/mail');

// Verifica si la API key está configurada antes de usarla
if (!functions.config().sendgrid || !functions.config().sendgrid.apikey) {
    logger.error("SendGrid API Key not configured. Email sending will fail.");
    // Puedes lanzar un error o simplemente loguear y manejar el fallo más abajo
} else {
    sgMail.setApiKey(functions.config().sendgrid.apikey);
    logger.info("SendGrid API Key loaded successfully.");
}
// ===============================


// --- Cloud Function Callable (v2) para guardar un nuevo panal con verificación de unicidad ---
// Esta función será llamada desde tu frontend usando httpsCallable.
// En v2, el 'data' y 'context' de v1 se combinan en el objeto 'request'.
exports.addPanal = onCall(async (request) => {
    logger.info('Cloud Function addPanal (v2) llamada.', request.data);

    // 1. Verificar que el usuario esté autenticado
    if (!request.auth) {
        throw new functions.https.HttpsError( // HttpsError se sigue importando de v1 para compatibilidad
            'unauthenticated',
            'La operación requiere autenticación.'
        );
    }

    const userId = request.auth.uid; // UID del usuario autenticado
    // Obtiene el email del usuario autenticado. Con Google/Email/etc. providers suele estar en el token.
    const userEmail = request.auth.token.email || null;
    const panalData = request.data; // Los datos del formulario enviados desde el cliente

    logger.info(`Usuario ${userId} (${userEmail}) intentando añadir panal con datos:`, panalData);

    // 2. Validar los datos recibidos (validación básica)
    if (!panalData.idPanal || typeof panalData.idPanal !== 'string' || panalData.idPanal.trim() === '') {
         throw new functions.https.HttpsError(
            'invalid-argument',
            'El campo ID del Panal es obligatorio.'
        );
    }
    // Asegúrate de validar otros campos críticos aquí si no lo haces completamente en el frontend
    if (!panalData.tipoHuevo) throw new functions.https.HttpsError('invalid-argument', 'El tipo de huevo es obligatorio.');
    if (panalData.cantidadHuevos == null || panalData.cantidadHuevos <= 0) throw new functions.https.HttpsError('invalid-argument', 'La cantidad de huevos debe ser positiva.');
    if (panalData.cantidadPanales == null || panalData.cantidadPanales <= 0) throw new functions.https.HttpsError('invalid-argument', 'La cantidad de panales debe ser positiva.');
    if (!panalData.galponLote) throw new functions.https.HttpsError('invalid-argument', 'El Galpón o Lote es obligatorio.');
    if (!panalData.fechaInicio) throw new functions.https.HttpsError('invalid-argument', 'La Fecha de Inicio es obligatoria.');
    if (!panalData.fechaVencimiento) throw new functions.https.HttpsError('invalid-argument', 'La Fecha de Vencimiento es obligatoria.');

     // Validación de fechas a nivel de backend
     const fechaInicioObj = new Date(panalData.fechaInicio);
     const fechaVencimientoObj = new Date(panalData.fechaVencimiento);

     if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaVencimientoObj.getTime())) {
          throw new functions.https.HttpsError('invalid-argument', 'El formato de fecha es inválido.');
     }

     if (fechaVencimientoObj < fechaInicioObj) {
          throw new functions.https.HttpsError('invalid-argument', 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
     }


    // 3. Verificar si ya existe un panal con este idPanal para este usuario
    try {
        const duplicateCheckSnapshot = await db.collection('panales')
            .where('userId', '==', userId) // <-- Crucial: verifica solo para el usuario actual
            .where('idPanal', '==', panalData.idPanal.trim()) // <-- Verifica el ID enviado
            .limit(1) // Solo necesitamos encontrar uno si existe
            .get();

        if (!duplicateCheckSnapshot.empty) {
            // Si se encuentra algún documento, el idPanal ya existe para este usuario
            logger.warn(`Intento de añadir idPanal duplicado '${panalData.idPanal}' por usuario ${userId}`);
            throw new functions.https.HttpsError(
                'already-exists',
                `Ya existe un panal con el ID '${panalData.idPanal.trim()}' registrado.`
            );
        }

        // 4. Si el idPanal es único, proceder a guardar el nuevo panal
        logger.info(`ID de Panal '${panalData.idPanal}' es único para el usuario ${userId}. Procediendo a guardar.`);

        // Prepara los datos finales a guardar en Firestore
        const panalToSave = {
            ...panalData, // Incluye los datos del formulario enviados por el cliente
            idPanal: panalData.idPanal.trim(), // Asegura que el ID guardado esté limpio
            userId: userId, // Añade el UID del usuario autenticado (no confíes en datos del cliente)
            // Guarda el email del usuario para futuras alertas si está disponible
            userEmail: userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(), // Usa la marca de tiempo del servidor
            estado: panalData.estado || 'Activo', // Asegura que el estado tenga un valor, por defecto 'Activo'
            // Asegúrate de que los campos numéricos sean guardados como números
            cantidadHuevos: Number(panalData.cantidadHuevos),
            cantidadPanales: Number(panalData.cantidadPanales),
            // Guardar fechas como strings 'YYYY-MM-DD' como se espera del frontend
            fechaInicio: panalData.fechaInicio,
            fechaVencimiento: panalData.fechaVencimiento,
        };

        const newPanalRef = await db.collection('panales').add(panalToSave);

        logger.info(`Nuevo panal añadido con ID de documento Firestore: ${newPanalRef.id} para usuario: ${userId}`);

        // 5. Retornar el ID del documento creado y un mensaje de éxito al cliente
        return { documentId: newPanalRef.id, message: 'Panal guardado con éxito.' };

    } catch (error) {
        logger.error("Error en la Cloud Function addPanal:", error);

        if (error instanceof functions.https.HttpsError) {
            throw error; // Relanzar HttpsError específicos
        }

        throw new functions.https.HttpsError(
            'internal',
            'Ocurrió un error inesperado al guardar el panal.'
        );
    }
});


// --- Cloud Function Programada (v2) para actualizar estado a 'Vencido' ---
// Se ejecutará cada día a medianoche (o en el horario que definas con onSchedule).
// Requiere plan Blaze (pago por uso), aunque el nivel gratuito es generoso.
exports.updateExpiredPanals = onSchedule('0 0 * * *', async (context) => {
     // Sintaxis cron: '0 0 * * *' significa a las 00:00 (medianoche) cada día.
     // Puedes especificar zona horaria: onSchedule('0 0 * * *', { timeZone: 'America/Bogota' }, async (context) => { ... });

    logger.info('Ejecutando tarea programada updateExpiredPanals.');

    const hoy = new Date();
    // Formatear la fecha de hoy a 'YYYY-MM-DD' para comparar con el string en Firestore
    const hoyString = hoy.toISOString().split('T')[0];

    try {
        // Consultar panales activos que vencen hoy o antes
        const expiredPanalesQuery = db.collection('panales')
            .where('estado', '==', 'Activo') // Solo revisar panales activos
            // Filtrar por fecha de vencimiento <= hoy (comparación de strings 'YYYY-MM-DD')
            .where('fechaVencimiento', '<=', hoyString);


        const snapshot = await expiredPanalesQuery.get();

        if (snapshot.empty) {
            logger.info('No se encontraron panales vencidos hoy o antes.');
            return null; // No hay nada que actualizar
        }

        logger.info(`Se encontraron ${snapshot.size} panales vencidos para actualizar.`);

        // Usar un Batch Write para actualizar múltiples documentos eficientemente
        const batch = db.batch();
        let updatedCount = 0;

        snapshot.forEach(doc => {
            const panalRef = db.collection('panales').doc(doc.id);
            // Añadir la operación de actualización al batch
            batch.update(panalRef, {
                estado: 'Vencido',
                 // Opcional: puedes añadir una marca de tiempo de actualización si quieres
                 // updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            updatedCount++;
        });

        // Aplicar todas las actualizaciones en el batch
        await batch.commit();

        logger.info(`Actualización de estado a 'Vencido' completada para ${updatedCount} panales.`);
        return { status: 'success', updatedCount: updatedCount };

    } catch (error) {
        logger.error('Error en la Cloud Function programada updateExpiredPanals:', error);
        // Relanzar el error para que Cloud Functions registre la falla
        throw error;
    }
});


// --- Cloud Function Programada (v2) para enviar alertas por correo electrónico ---
// Se ejecutará cada día a medianoche (o en el horario que definas con onSchedule).
// Requiere configuración de SendGrid API Key como variable de entorno.
exports.sendExpirationAlerts = onSchedule('0 0 * * *', async (context) => {
     // Ejecutar a las 00:00 cada día.
     // Puedes usar otra hora si prefieres, o la misma que updateExpiredPanals.

    logger.info('Ejecutando tarea programada sendExpirationAlerts.');

     // Verificar si SendGrid está configurado
    if (!functions.config().sendgrid || !functions.config().sendgrid.apikey) {
        logger.error("SendGrid API Key is NOT configured. Skipping email alerts.");
        return null; // No intentar enviar correos sin API key
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio de hoy
    const fechaAlerta = new Date(hoy);
    fechaAlerta.setDate(hoy.getDate() + 7); // Ejemplo: Alertar si vence en EXACTAMENTE 7 días
     // Formatear la fecha de alerta a 'YYYY-MM-DD' para comparar con el string en Firestore
     const fechaAlertaString = fechaAlerta.toISOString().split('T')[0];


    try {
        // Consultar panales activos que vencen en exactamente 7 días
        // NOTA: Si quieres alertar en un rango (ej. 3 a 7 días), ajusta la consulta
        // .where('fechaVencimiento', '>=', fechaHoyStringParaRangoInicio)
        // .where('fechaVencimiento', '<=', fechaHoyStringParaRangoFin)
        const panalesToAlertQuery = db.collection('panales')
            .where('estado', '==', 'Activo') // Solo panales activos
            // Filtrar por fecha de vencimiento igual al string de la fecha de alerta
            .where('fechaVencimiento', '==', fechaAlertaString);


        const snapshot = await panalesToAlertQuery.get();

        if (snapshot.empty) {
            logger.info('No se encontraron panales que venzan en 7 días.');
            return null; // No hay alertas que enviar
        }

        logger.info(`Se encontraron ${snapshot.size} panales próximos a vencer en 7 días.`);

        let sentCount = 0;

        // Iterar sobre los panales encontrados y enviar un correo a cada usuario
        // El campo 'userEmail' debe estar guardado en el documento del panal (lo añadimos en addPanal).
        // El campo 'userEmail' debe ser una dirección real y verificada (o accesible si usas dominio propio)
        // para que SendGrid pueda enviar.
        for (const doc of snapshot.docs) {
             const panal = doc.data();
             const panalIdFirestore = doc.id; // ID del documento de Firestore
             const panalIdApp = panal.idPanal; // ID del Panal que ingresó el usuario

             const userEmail = panal.userEmail; // Email guardado en el documento del panal

             if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
                 logger.warn(`Panal ${panalIdFirestore} (ID: ${panalIdApp}) no tiene un email de usuario válido (${userEmail}). No se puede enviar alerta.`);
                 continue; // Saltar este panal si no tiene email válido
             }

             // Usar la dirección de correo verificada en SendGrid
             // Esto podría ser una variable de entorno 'sendgrid.sender_email' si la configuraste
             // o tu dirección verificada 'jj8760207@gmail.com' si usaste esa.
             const senderEmail = functions.config().sendgrid.sender_email || 'jj8760207@gmail.com'; // Usar la variable de entorno o el correo de gmail verificado

              // Verificar si el email del remitente está configurado (si se usa la variable de entorno)
            if (!senderEmail || senderEmail === 'default@tu-dominio.com') { // Ajustar la comparación si usas otro valor por defecto
                logger.error("SendGrid sender email is not configured or is the default placeholder.");
                // No continuar con el envío si el remitente no es válido/configurado
                return null;
            }


             // Preparar el contenido del correo
             const msg = {
               to: userEmail, // Email del destinatario (email del usuario asociado al panal)
               from: senderEmail, // <-- Dirección de correo verificada en SendGrid
               subject: `Alerta de vencimiento próximo para tu Panal ID ${panalIdApp}`,
               text: `Hola, te recordamos que tu panal con ID ${panalIdApp} vence pronto, en 7 días (${panal.fechaVencimiento}). Por favor, revisa su estado en la aplicación.`,
               html: `
                 <p>Hola,</p>
                 <p>Te recordamos que tu panal con ID <strong>${panalIdApp}</strong> está próximo a vencer.</p>
                 <p>La fecha de vencimiento registrada es el ${panal.fechaVencimiento}, lo que significa que vence en 7 días.</p>
                 <p>Por favor, ingresa a la aplicación para revisar el estado de este panal.</p>
                 <p>Gracias por usar nuestra aplicación.</p>
               `,
             };

             try {
                await sgMail.send(msg);
                logger.info(`Alerta de vencimiento enviada para Panal ID ${panalIdApp} (Firestore ID: ${panalIdFirestore}) a ${userEmail}`);
                sentCount++;
             } catch (emailError) {
                logger.error(`Error al enviar alerta por email para Panal ID ${panalIdApp} a ${userEmail}:`, emailError);
                // Loguear el error pero continuar con el siguiente panal
             }
        }

        logger.info(`Envío de alertas de vencimiento completado. Se enviaron ${sentCount} correos.`);
        return { status: 'success', sentCount: sentCount };

    } catch (error) {
        logger.error('Error en la Cloud Function programada sendExpirationAlerts (consulta principal):', error);
        throw error; // Relanzar para que Cloud Functions registre la falla
    }
});