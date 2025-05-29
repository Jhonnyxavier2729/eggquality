// functions/index.js
// Importa function triggers from their respective submodules (sintaxis v2)
const {onCall} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {logger} = require("firebase-functions");
// Importa defineSecret para usar Firebase Secret Manager
const { defineSecret } = require('firebase-functions/params');// <-- NUEVA LÍNEA
// Para acceso a variables de entorno (todavía se usa de v1) y HttpsError
const functions = require('firebase-functions');

const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK si no lo has hecho ya
try {
  admin.initializeApp();
  logger.info('Firebase Admin SDK initialized successfully');
} catch (e) {
  if (!e.message.includes('already exists')) {
    logger.error('Firebase Admin initialisation error', e);
  } else {
    logger.info('Firebase Admin SDK already initialized');
  }
}

const db = admin.firestore();

// === Configuración de SendGrid con Secret Manager ===
// Debes instalar el paquete en tu carpeta functions: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');

// 1. Define los secretos que tus funciones usarán.
// El nombre del secreto debe coincidir con el que configuraste con `firebase functions:secrets:set`.
const sendgridApiKey = defineSecret('SENDGRID_API_KEY');         // <-- NUEVA LÍNEA
const sendgridSenderEmail = defineSecret('SENDGRID_SENDER_EMAIL'); // <-- NUEVA LÍNEA, si también lo usas como secreto

logger.info("SendGrid configuration will use Secret Manager.");
// ===============================


// --- Cloud Function Callable (v2) para guardar un nuevo panal con verificación de unicidad ---
// Esta función no necesita acceso directo a SendGrid, por lo que no añadimos 'secrets' aquí.
exports.addPanal = onCall(async (request) => {
    logger.info('Cloud Function addPanal (v2) llamada.', request.data);

    if (!request.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'La operación requiere autenticación.'
        );
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email || null;
    const panalData = request.data;

    logger.info(`Usuario ${userId} (${userEmail}) intentando añadir panal con datos:`, panalData);

    if (!panalData.idPanal || typeof panalData.idPanal !== 'string' || panalData.idPanal.trim() === '') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'El campo ID del Panal es obligatorio.'
        );
    }
    if (!panalData.tipoHuevo) throw new functions.https.HttpsError('invalid-argument', 'El tipo de huevo es obligatorio.');
    if (panalData.cantidadHuevos == null || panalData.cantidadHuevos <= 0) throw new functions.https.HttpsError('invalid-argument', 'La cantidad de huevos debe ser positiva.');
    if (panalData.cantidadPanales == null || panalData.cantidadPanales <= 0) throw new functions.https.HttpsError('invalid-argument', 'La cantidad de panales debe ser positiva.');
    if (!panalData.galponLote) throw new functions.https.HttpsError('invalid-argument', 'El Galpón o Lote es obligatorio.');
    if (!panalData.fechaInicio) throw new functions.https.HttpsError('invalid-argument', 'La Fecha de Inicio es obligatoria.');
    if (!panalData.fechaVencimiento) throw new functions.https.HttpsError('invalid-argument', 'La Fecha de Vencimiento es obligatoria.');

    const fechaInicioObj = new Date(panalData.fechaInicio);
    const fechaVencimientoObj = new Date(panalData.fechaVencimiento);

    if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaVencimientoObj.getTime())) {
        throw new functions.https.HttpsError('invalid-argument', 'El formato de fecha es inválido.');
    }

    if (fechaVencimientoObj < fechaInicioObj) {
        throw new functions.https.HttpsError('invalid-argument', 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
    }

    try {
        const duplicateCheckSnapshot = await db.collection('panales')
            .where('userId', '==', userId)
            .where('idPanal', '==', panalData.idPanal.trim())
            .limit(1)
            .get();

        if (!duplicateCheckSnapshot.empty) {
            logger.warn(`Intento de añadir idPanal duplicado '${panalData.idPanal}' por usuario ${userId}`);
            throw new functions.https.HttpsError(
                'already-exists',
                 `Ya existe un panal con el ID '${panalData.idPanal.trim()}' registrado.`
            );
        }

        logger.info(`ID de Panal '${panalData.idPanal}' es único para el usuario ${userId}. Procediendo a guardar.`);

        const panalToSave = {
            ...panalData,
            idPanal: panalData.idPanal.trim(),
            userId: userId,
            userEmail: userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            estado: panalData.estado || 'Activo',
            cantidadHuevos: Number(panalData.cantidadHuevos),
            cantidadPanales: Number(panalData.cantidadPanales),
            fechaInicio: panalData.fechaInicio,
            fechaVencimiento: panalData.fechaVencimiento,
            isDeleted: false
        };

        const newPanalRef = await db.collection('panales').add(panalToSave);

        logger.info(`Nuevo panal añadido con ID de documento Firestore: ${newPanalRef.id} para usuario: ${userId}`);

        return { documentId: newPanalRef.id, message: 'Panal guardado con éxito.' };

    } catch (error) {
        logger.error("Error en la Cloud Function addPanal:", error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Ocurrió un error inesperado al guardar el panal.'
        );
    }
});


// --- Cloud Function Programada (v2) para actualizar estado a 'Vencido' ---
exports.updateExpiredPanals = onSchedule('0 0 * * *', { timeZone: 'America/Bogota' }, async (context) => {
    logger.info('Ejecutando tarea programada updateExpiredPanals en America/Bogota.');

    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0];

    try {
        const expiredPanalesQuery = db.collection('panales')
            .where('estado', '==', 'Activo')
            .where('fechaVencimiento', '<=', hoyString);

        const snapshot = await expiredPanalesQuery.get();

        if (snapshot.empty) {
            logger.info('No se encontraron panales vencidos hoy o antes.');
            return null;
        }

        logger.info(`Se encontraron ${snapshot.size} panales vencidos para actualizar.`);

        const batch = db.batch();
        let updatedCount = 0;

        snapshot.forEach(doc => {
            const panalRef = db.collection('panales').doc(doc.id);
            batch.update(panalRef, {
                estado: 'Vencido',
            });
            updatedCount++;
        });

        await batch.commit();

        logger.info(`Actualización de estado a 'Vencido' completada para ${updatedCount} panales.`);
        return { status: 'success', updatedCount: updatedCount };

    } catch (error) {
        logger.error('Error en la Cloud Function programada updateExpiredPanales:', error);
        throw error;
    }
});


// --- Cloud Function Programada (v2) para enviar alertas por correo electrónico ---
// Añade los secretos a las opciones de la función para que estén disponibles en process.env
exports.sendExpirationAlerts = onSchedule('0 0 * * *', { timeZone: 'America/Bogota', secrets: [sendgridApiKey, sendgridSenderEmail] }, async (context) => { // <-- MODIFICADA
    logger.info('Ejecutando tarea programada sendExpirationAlerts en America/Bogota.');

    // Accede a los secretos a través de process.env
    const actualSendGridApiKey = process.env.SENDGRID_API_KEY;
    const actualSendGridSenderEmail = process.env.SENDGRID_SENDER_EMAIL || 'jj8760207@gmail.com'; // Usa tu valor por defecto si el secreto no está configurado o es el caso

    if (!actualSendGridApiKey) {
        logger.error("SendGrid API Key (from Secret Manager) is NOT available. Skipping email alerts.");
        return null;
    }

    sgMail.setApiKey(actualSendGridApiKey); // Setear la clave justo antes de usarla

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaAlerta = new Date(hoy);
    fechaAlerta.setDate(hoy.getDate() + 7);
    const fechaAlertaString = fechaAlerta.toISOString().split('T')[0];

    try {
        const panalesToAlertQuery = db.collection('panales')
            .where('estado', '==', 'Activo')
            .where('fechaVencimiento', '==', fechaAlertaString);

        const snapshot = await panalesToAlertQuery.get();

        if (snapshot.empty) {
            logger.info('No se encontraron panales que venzan en 7 días.');
            return null;
        }

        logger.info(`Se encontraron ${snapshot.size} panales próximos a vencer en 7 días.`);

        let sentCount = 0;

        for (const doc of snapshot.docs) {
            const panal = doc.data();
            const panalIdFirestore = doc.id;
            const panalIdApp = panal.idPanal;
            const userEmail = panal.userEmail;

            if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
                logger.warn(`Panal ${panalIdFirestore} (ID: ${panalIdApp}) no tiene un email de usuario válido (${userEmail}). No se puede enviar alerta.`);
                continue;
            }

            const msg = {
                to: userEmail,
                from: actualSendGridSenderEmail, // Usar el email del remitente del secreto o el por defecto
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
            }
        }

        logger.info(`Envío de alertas de vencimiento completado. Se enviaron ${sentCount} correos.`);
        return { status: 'success', sentCount: sentCount };

    } catch (error) {
        logger.error('Error en la Cloud Function programada sendExpirationAlerts (consulta principal):', error);
        throw error;
    }
});

// functions/index.js

// ... (todo tu código existente: imports, admin.initializeApp, db, sendgrid config, addPanal, updateExpiredPanals, sendExpirationAlerts) ...

// --- NUEVA FUNCIÓN DE PRUEBA: testSchedulerFunction ---
exports.testSchedulerFunction = onSchedule('every 5 minutes', { timeZone: 'America/Bogota' }, async (context) => {
    logger.info('¡Función de prueba de scheduler (testSchedulerFunction) ejecutada con éxito!');
    return { status: 'success', message: 'Test function ran successfully' };
});
// --- FIN DE LA NUEVA FUNCIÓN DE PRUEBA ---

// functions/index.js

// ... (tus imports de v2: onCall, onSchedule, logger, defineSecret) ...

// Importa funciones de la v1 específicamente para esta prueba
// Asegúrate de que esta línea esté presente y apunte a 'firebase-functions' general.

// ... (admin.initializeApp, db, sgMail, defineSecrets) ...

