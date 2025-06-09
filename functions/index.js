// functions/index.js

// Importa function triggers from their respective submodules (sintaxis v2)
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");

// Importa defineSecret para usar Firebase Secret Manager (desde firebase-functions/params)
const { defineSecret } = require('firebase-functions/params');

// Para acceso a HttpsError y FieldPath (ya que FieldPath de admin se usa)
const functions = require('firebase-functions'); // Mantenemos esta para HttpsError y otras utilidades v1

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
const sgMail = require('@sendgrid/mail');

// Define los secretos que tus funciones usarán.
const sendgridApiKey = defineSecret('SENDGRID_API_KEY');
const sendgridSenderEmail = defineSecret('SENDGRID_SENDER_EMAIL');
const sendgridTemplateId = defineSecret('SENDGRID_EXPIRATION_TEMPLATE_ID'); // Asegúrate de que este secreto exista

logger.info("SendGrid configuration will use Secret Manager.");

// --- Cloud Function Callable (v2) para guardar un nuevo panal con verificación de unicidad ---
// Tu función addPanal original sin cambios
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
// Tu función updateExpiredPanals original sin cambios en la lógica
exports.updateExpiredPanals = onSchedule(
  {
    schedule: '0 0 1 * *', // Tu programación mensual, mantenida según tu solicitud
    timeZone: 'America/Bogota'
  },
  async (context) => {
    logger.info('Ejecutando tarea programada updateExpiredPanals en America/Bogota (mensual).');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establece la hora a medianoche para comparaciones de fecha
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
      logger.error('Error en la Cloud Function programada updateExpiredPanals:', error);
      throw error;
    }
  }
);


// --- Cloud Function Programada (v2) para enviar alertas por correo electrónico ---
exports.sendExpirationAlerts = onSchedule(
  {
    schedule: '0 0 1 * *', // Tu programación mensual, mantenida según tu solicitud
    timeZone: 'America/Bogota',
    secrets: [sendgridApiKey, sendgridSenderEmail, sendgridTemplateId]
  },
  async (context) => {
    logger.info('Ejecutando tarea programada sendExpirationAlerts en America/Bogota (mensual).');

    // Accede a los secretos USANDO .value()
    const actualSendGridApiKey = sendgridApiKey.value();
    const actualSendGridSenderEmail = sendgridSenderEmail.value();
    const actualSendGridTemplateId = sendgridTemplateId.value();

    if (!actualSendGridApiKey || !actualSendGridSenderEmail || !actualSendGridTemplateId) {
      logger.error("SendGrid API Key, Sender Email, or Template ID is NOT available from Secret Manager. Skipping email alerts.");
      return null;
    }

    sgMail.setApiKey(actualSendGridApiKey);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establece la hora a medianoche para comparaciones de fecha

    try {
      const panalesRef = db.collection('panales');
      const allActivePanalesSnapshot = await panalesRef.where('estado', '==', 'Activo').get();

      if (allActivePanalesSnapshot.empty) {
        logger.info('No se encontraron panales activos.');
        return null;
      }

      logger.info(`Se encontraron ${allActivePanalesSnapshot.size} panales activos. Evaluando preferencias.`);

      let sentEmailsCount = 0;
      const panalesAgrupadosPorUsuario = new Map();

      // Paso 1: Agrupar panales por userId y precargar preferencias
      const userIdsToFetch = new Set();
      for (const doc of allActivePanalesSnapshot.docs) {
        const panalData = doc.data();
        const userId = panalData.userId;
        const userEmail = panalData.userEmail;

        if (userId && userEmail) {
          if (!panalesAgrupadosPorUsuario.has(userId)) {
            panalesAgrupadosPorUsuario.set(userId, { email: userEmail, panales: [] });
            userIdsToFetch.add(userId);
          }
          panalesAgrupadosPorUsuario.get(userId).panales.push(panalData);
        } else {
          logger.warn(`Panal ${doc.id} no tiene userId o userEmail. Será ignorado.`);
        }
      }

      // Paso 2: Obtener las preferencias de notificación para todos los usuarios únicos
      const userPreferencesMap = new Map();
      if (userIdsToFetch.size > 0) {
        const userPrefsRef = db.collection('userPreferences');
        // Aquí usamos admin.firestore.FieldPath.documentId() que es el estándar para el Admin SDK
        const userPrefsSnapshot = await userPrefsRef.where(admin.firestore.FieldPath.documentId(), 'in', Array.from(userIdsToFetch)).get();
        userPrefsSnapshot.forEach(doc => {
          userPreferencesMap.set(doc.id, doc.data());
        });
      }

      // Paso 3: Iterar sobre los usuarios y sus panales para enviar correos
      for (const [userId, userData] of panalesAgrupadosPorUsuario.entries()) {
        const userEmail = userData.email;
        const userPanales = userData.panales;
        const userPrefs = userPreferencesMap.get(userId) || { recibirNotificacionesCorreo: true, diasAnticipacionNotificacion: 7 };

        if (!userPrefs.recibirNotificacionesCorreo) {
          logger.info(`Usuario ${userEmail} (${userId}) ha deshabilitado las notificaciones. Saltando.`);
          continue;
        }

        let diasAnticipacionUsuario = userPrefs.diasAnticipacionNotificacion;
        if (typeof diasAnticipacionUsuario !== 'number' || diasAnticipacionUsuario <= 0) {
            logger.warn(`Preferencias de días de anticipación inválidas para ${userEmail} (${userId}). Usando 7 días por defecto.`);
            diasAnticipacionUsuario = 7;
        }

        const fechaAlertaUsuario = new Date(hoy);
        fechaAlertaUsuario.setDate(hoy.getDate() + diasAnticipacionUsuario);
        const fechaAlertaStringUsuario = fechaAlertaUsuario.toISOString().split('T')[0];

        const panalesParaEsteUsuario = userPanales.filter(panal => {
          return panal.fechaVencimiento === fechaAlertaStringUsuario;
        });

        if (panalesParaEsteUsuario.length > 0) {
          logger.info(`Usuario ${userEmail} (${userId}) tiene ${panalesParaEsteUsuario.length} panales que vencen en ${diasAnticipacionUsuario} días.`);

          // Prepara los detalles de los panales para pasarlos a la plantilla
          const panalesDetalles = panalesParaEsteUsuario.map(panal => ({
            idPanal: panal.idPanal,
            fechaVencimiento: panal.fechaVencimiento,
            tipoHuevo: panal.tipoHuevo,
            galponLote: panal.galponLote,
          }));

          const msg = {
            to: userEmail,
            from: actualSendGridSenderEmail,
            templateId: actualSendGridTemplateId,
            dynamicTemplateData: {
              nombreUsuario: userPrefs.nombreUsuario || userEmail, // Asegúrate de tener 'nombreUsuario' en userPreferences
              diasRestantes: diasAnticipacionUsuario,
              panales: panalesDetalles, // Pasa el array de panales para que la plantilla itere
            },
          };

          try {
            await sgMail.send(msg);
            logger.info(`Alerta de vencimiento combinada enviada a ${userEmail} para ${panalesParaEsteUsuario.length} panales.`);
            sentEmailsCount++;
          } catch (error) {
            logger.error(`Error al enviar correo combinado para usuario ${userEmail}: ${error.message}`, { error });
          }
        } else {
            logger.info(`Usuario ${userEmail} (${userId}) no tiene panales que venzan en ${diasAnticipacionUsuario} día(s).`);
        }
      }

      logger.info(`Envío de alertas de vencimiento completado. Se enviaron ${sentEmailsCount} correos.`);
      return null;
    } catch (error) {
      logger.error(`Error en la Cloud Function programada sendExpirationAlerts: ${error.message}`, { error });
      // Usamos functions.https.HttpsError para relanzar errores de manera consistente
      throw new functions.https.HttpsError('internal', 'Error al ejecutar la tarea programada de alertas.', error.message);
    }
  }
);

  //Analisis de huevos precion Dane
 // ... (tus imports y funciones existentes) ...

// Analisis de huevos precion Dane
// ... (tus imports y funciones existentes) ...

// Analisis de huevos precion Dane
const soap = require("soap");
const cors = require("cors")({ origin: true });

const WSDL_URL = "http://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL";

// Cloud Function Callable (v2) para obtener precios de huevos del DANE
exports.obtenerPreciosHuevos = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // El codProducto '0231201' parece ser el que engloba a todos los tipos de huevo
      // Si el frontend no envía un codProducto, usamos este por defecto.
      const productCode = req.query.codProducto || '0231201';

      // Parámetros de filtro desde el frontend (opcionales)
      const ciudadesDeseadas = req.query.ciudades ? req.query.ciudades.split(',') : []; // Array de ciudades (ej: "Bogotá,Pereira")
      const tiposHuevoDeseados = req.query.tiposHuevo ? req.query.tiposHuevo.split(',') : []; // Array de tipos de huevo (ej: "Rojo AA,Rojo A")

      logger.info(`Consultando precios para codProducto: ${productCode}`);
      if (ciudadesDeseadas.length > 0) logger.info(`Filtrando por ciudades: ${ciudadesDeseadas.join(', ')}`);
      if (tiposHuevoDeseados.length > 0) logger.info(`Filtrando por tipos de huevo: ${tiposHuevoDeseados.join(', ')}`);

      const client = await soap.createClientAsync(WSDL_URL);

      const args = {
        codProducto: Number(productCode)
      };

      const [result] = await client.promediosSipsaCiudadAsync(args);

      if (result && result.return && Array.isArray(result.return)) {
        let huevos = result.return;

        // Filtra por el nombre del producto si se especifican tipos de huevo deseados
        if (tiposHuevoDeseados.length > 0) {
          huevos = huevos.filter(item =>
            item.producto && tiposHuevoDeseados.some(tipo => item.producto.toLowerCase().includes(tipo.toLowerCase()))
          );
        } else {
            // Si no se especifican tipos de huevo, aún filtramos para asegurarnos de que sea "huevo"
            huevos = huevos.filter(item =>
                item.producto && item.producto.toLowerCase().includes("huevo")
            );
        }


        // Filtra por ciudad si se especifican ciudades deseadas
        if (ciudadesDeseadas.length > 0) {
          huevos = huevos.filter(item =>
            item.ciudad && ciudadesDeseadas.some(ciudad => item.ciudad.toLowerCase().includes(ciudad.toLowerCase()))
          );
        }

        if (huevos.length === 0) {
          logger.info(`No se encontraron datos para el codProducto ${productCode} con los filtros aplicados.`);
          return res.status(200).json([]);
        }

        logger.info(`Datos de huevos obtenidos exitosamente. Registros: ${huevos.length}`);
        res.json(huevos);

      } else {
        logger.error("Respuesta inesperada del servicio DANE:", result);
        res.status(500).json({ error: "Formato de respuesta inesperado del DANE. Posiblemente un error en el servicio remoto o datos no encontrados." });
      }

    } catch (error) {
      logger.error("Error en la Cloud Function obtenerPreciosHuevos:", error);
      res.status(500).json({ error: "No se pudo consultar el DANE", details: error.message });
    }
  });
});




