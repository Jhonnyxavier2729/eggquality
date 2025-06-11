# 🥚 EggQualitë: Sistema Web de Gestión y Análisis de Huevos

## ¡Bienvenido a EggQualitë! 🚀

EggQualitë es una aplicación web diseñada para revolucionar la gestión integral de panales de huevos y el análisis del comportamiento de precios del huevo en el mercado mayorista-consumidor a nivel nacional en Colombia. Nuestro objetivo es proporcionar a pequeños y medianos avicultores una herramienta robusta e intuitiva para digitalizar sus procesos de control de inventario y optimizar la toma de decisiones, reemplazando métodos manuales por una plataforma eficiente e intuitiva.

### ¿Para quién es EggQualitë?
Este sistema está pensado para pequeños y medianos avicultores en Colombia, incluyendo propietarios de granjas, gerentes de producción y personal administrativo encargado del inventario y la comercialización. Se espera que los usuarios tengan un nivel básico a intermedio de alfabetización digital y estén familiarizados con el uso de navegadores web y aplicaciones en línea.

## Características Principales 📋

EggQualitë ofrece una serie de funcionalidades clave para la gestión avícola:

* **Autenticación Segura de Usuarios:** Permite el registro, inicio y cierre de sesión, así como la recuperación de contraseña.
* **Visión General de Producción (Dashboard):** Un resumen ejecutivo del estado actual de tus panales (activos, vencidos, vendidos, totales) para una gestión rápida.
* **Análisis Interactivo de Precios de Mercado:** Visualiza estadísticas históricas de precios de huevos por tipo y ciudad en las principales plazas de mercado de Colombia. Fuente: Departamento Administrativo Nacional de Estadística –DANE-. Información pública.
* **Clasificación Oficial por Tamaño:** Consulta la clasificación oficial de huevos por tamaño según la normativa colombiana Icontec NTC 1240:2011.
* **Gestión Detallada de Panales:** Funcionalidades completas para el registro, consulta, edición y eliminación lógica de tus panales de huevos.
* **Generación de Reportes Personalizados:** Crea y descarga informes de panales en formato PDF con filtros por estado, tipo de huevo y rango de fechas.
* **Notificaciones Automatizadas de Vencimiento:** Recibe alertas por correo electrónico sobre la proximidad del vencimiento de tus panales.
* **Personalización de Usuario:** Configura tus preferencias de notificación y gestiona tu cuenta personal.

## Tecnologías Utilizadas 🛠️

EggQualitë está construido sobre una arquitectura moderna y robusta:

* **Frontend:** Aplicación web responsiva diseñada para navegadores modernos en cualquier dispositivo, utilizando las siguientes tecnologías:
    * **Vue.js:** Un framework progresivo para construir interfaces de usuario.
    * **JavaScript:** El lenguaje de programación principal para la interactividad web.
    * **CSS:** Para el diseño y la estilización de la interfaz de usuario.
* **Backend:** Construido sobre la infraestructura de Google **Firebase**.
    * **Firebase Authentication:** Para la gestión segura de usuarios.
    * **Firestore:** Base de datos NoSQL para el almacenamiento de datos en la nube.
    * **Cloud Functions:** Entorno de ejecución sin servidor para la lógica de negocio del backend y procesos automatizados (ej. notificaciones de vencimiento).

## Instalación y Configuración (Para Desarrolladores) ⚙️

Para poner EggQualitë en funcionamiento en tu entorno local, sigue estos pasos:

### Prerrequisitos

Asegúrate de tener instalado lo siguiente:

* **Node.js y npm:** Necesarios para ejecutar el proyecto JavaScript/TypeScript.
* **Git:** Para clonar el repositorio.
* **Una cuenta de Google Cloud / Firebase:** Deberás configurar un proyecto de Firebase.
* **Firebase CLI:** Para desplegar las Cloud Functions y gestionar tu proyecto de Firebase desde la terminal. Instálalo con:
    ```bash
    npm install -g firebase-tools
    ```

### Pasos de Instalación

1.  **Clona el Repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/EggQualite.git](https://github.com/tu-usuario/EggQualite.git)
    cd EggQualite
    ```
    *(Reemplaza `https://github.com/tu-usuario/EggQualite.git` con la URL real de tu repositorio.)*

2.  **Configura tu Proyecto Firebase:**
    * Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
    * Habilita **Firebase Authentication** (Métodos de inicio de sesión: Email/Contraseña).
    * Habilita **Firestore Database** (Modo de producción o de prueba, según prefieras, y establece las reglas de seguridad).
    * Habilita **Cloud Functions** y **Cloud Scheduler** (para las funciones programadas de notificaciones y actualización de estado).

3.  **Configura SendGrid (para Notificaciones por Correo Electrónico):**
    EggQualitë utiliza SendGrid para enviar notificaciones de vencimiento de panales. Deberás configurar tu cuenta de SendGrid y sus credenciales en Firebase Secret Manager para que las Cloud Functions puedan utilizarlas de forma segura.

    a.  **Crea una cuenta en SendGrid:**
        Si aún no tienes una, regístrate en [SendGrid](https://sendgrid.com/).

    b.  **Crea una API Key en SendGrid:**
        * En tu panel de SendGrid, navega a **Settings** > **API Keys**.
        * Haz clic en "Create API Key".
        * Asígnale un nombre descriptivo (ej. `EggQualite_API_Key`).
        * Dale los permisos adecuados para el envío de correo (mínimo: **Mail Send** con "Full Access" o "Restricted Access" solo a "Mail Send").
        * **Copia la API Key generada.** Solo se mostrará una vez.

    c.  **Configura el Sender Identity en SendGrid:**
        * Ve a **Settings** > **Sender Authentication**.
        * Configura un "Single Sender Verification" o "Domain Authentication" para verificar la dirección de correo electrónico que usarás como remitente de las notificaciones (ej. `notificaciones@tudominio.com`).
        * **Copia la dirección de correo electrónico verificada.**

    d.  **Crea una Plantilla Dinámica en SendGrid (opcional pero recomendado):**
        Si tu función `sendExpirationAlerts` utiliza una plantilla dinámica (como `sendgridTemplateId`), deberás crearla en SendGrid.
        * Ve a **Email API** > **Dynamic Templates**.
        * Haz clic en "Create a Dynamic Template".
        * Diseña tu plantilla. Asegúrate de usar las variables de sustitución adecuadas que tu función está pasando (ej. `{{nombreUsuario}}`, `{{diasRestantes}}`, `{{panales}}`). Para `panales`, necesitarás usar un bloque de iteración en la plantilla (ej. `{{#each panales}}...{{/each}}`).
        * **Copia el Template ID** (ej. `d-XXXXXXXXXXXXXX`).

    e.  **Guarda las credenciales de SendGrid en Firebase Secret Manager:**
        Desde la terminal, dentro de la carpeta `backend` (o donde estén tus Cloud Functions), ejecuta los siguientes comandos. Reemplaza los valores con tu API Key, el correo remitente y el ID de tu plantilla.

        ```bash
        firebase functions:secrets:set SENDGRID_API_KEY
        # Pega tu API Key de SendGrid cuando te lo solicite y presiona Enter

        firebase functions:secrets:set SENDGRID_SENDER_EMAIL
        # Pega tu correo electrónico verificado de SendGrid y presiona Enter

        firebase functions:secrets:set SENDGRID_EXPIRATION_TEMPLATE_ID
        # Pega el ID de tu plantilla dinámica de SendGrid y presiona Enter
        ```
        Para verificar que los secretos se han establecido correctamente:
        ```bash
        firebase functions:secrets:access SENDGRID_API_KEY --json
        firebase functions:secrets:access SENDGRID_SENDER_EMAIL --json
        firebase functions:secrets:access SENDGRID_EXPIRATION_TEMPLATE_ID --json
        ```

4.  **Configura el Frontend:**
    ```bash
    cd frontend # O el nombre de tu carpeta frontend
    npm install
    ```
    * Crea un archivo `.env.local` en la raíz de tu carpeta `frontend` y añade tus claves de configuración de Firebase (las encontrarás en la configuración de tu proyecto Firebase -> Configuración del proyecto -> Tus apps -> Añadir app -> Web). **Asegúrate de que las variables comiencen con `VITE_APP_` si usas Vite, o `VUE_APP_` si usas Vue CLI.** Por ejemplo:
        ```env
        VITE_APP_FIREBASE_API_KEY="AIza..."
        VITE_APP_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
        VITE_APP_FIREBASE_PROJECT_ID="tu-proyecto"
        VITE_APP_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
        VITE_APP_FIREBASE_MESSAGING_SENDER_ID="..."
        VITE_APP_FIREBASE_APP_ID="1:..."
        VITE_APP_FIREBASE_MEASUREMENT_ID="G-..."
        ```
    * Además, recuerda añadir `/.env.local` y `.env` a tu `.gitignore` en la raíz de la carpeta `frontend` para evitar subirlos al repositorio.

5.  **Configura el Backend (Cloud Functions):**
    ```bash
    cd backend # O el nombre de tu carpeta de funciones
    npm install
    firebase login # Inicia sesión con tu cuenta de Google
    firebase use --add # Selecciona el proyecto Firebase que creaste
    ```
    * Asegúrate de que tu `index.js` en las funciones está configurado para usar `defineSecret` como lo tienes en tu código para acceder a los secretos de SendGrid.

6.  **Despliega las Cloud Functions (¡con los secretos!):**
    Para que las funciones puedan acceder a los secretos de SendGrid y las variables de entorno, deberás desplegarlas.

    ```bash
    firebase deploy --only functions
    ```
    Cuando despliegas funciones que usan `defineSecret`, Firebase automáticamente asegura que los secretos estén disponibles para esas funciones.

7.  **Ejecuta el Frontend Localmente:**
    ```bash
    cd ../frontend # Si estabas en la carpeta backend
    npm install # Asegúrate de que todas las dependencias del frontend estén instaladas
    npm run dev # O npm start, dependiendo de tu script de inicio en package.json de Vue.js
    ```
    Esto debería abrir la aplicación en tu navegador en `http://localhost:5173` (si usas Vite) o `http://localhost:8080` (si usas Vue CLI).

## Uso de la Aplicación 🚀

Una vez que la aplicación esté corriendo, podrás:

1.  **Registrarte** como nuevo usuario.
2.  **Iniciar sesión** con tus credenciales.
3.  Explorar el **Inicio** para ver el resumen de tus panales.
4.  Navegar al módulo de **Estadísticas** para analizar precios y la clasificación de huevos.
5.  Gestionar tus **Panales** (registrar, ver, editar, eliminar lógicamente).
6.  Generar y descargar **Reportes** personalizados.
7.  Configurar tus **Preferencias de Notificación** y actualizar tu perfil.

## Contribución 🤝

¡Agradecemos cualquier contribución para mejorar EggQualitë! Si deseas colaborar, por favor:

1.  Haz un "fork" de este repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y commitea (`git commit -m 'feat: Añade nueva funcionalidad X'`).
4.  Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

## Autores 🧑‍💻👩‍💻

* **Jhonny Ramirez** [@jhonnyxavier2729](https://github.com/jhonnyxavier2729)
* **Adriana Guazaquillo** [@Adrianag99](https://github.com/Adrianag99)

## soporte o dudas 🧑‍💻👩‍💻
Para consultas, contáctanos en: [eggquality3@gmail.com](eggquality3@gmail.com)

