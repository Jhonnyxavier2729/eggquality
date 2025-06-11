
# 🥚 EggQualite: Sistema Web de Gestión y Análisis de Huevos

## ¡Bienvenido a EggQualitë! 🚀

EggQualitë es una aplicación web diseñada para revolucionar la gestión integral de panales de huevos y el análisis del comportamiento de precios del huevo en el mercado mayorista-consumidor a nivel nacional en Colombia.  Nuestro objetivo es proporcionar a pequeños y medianos avicultores una herramienta robusta e intuitiva para digitalizar sus procesos de control de inventario y optimizar la toma de decisiones, reemplazando métodos manuales por una plataforma eficiente. 

### ¿Para quién es EggQualitë?
Este sistema está pensado para pequeños y medianos avicultores en Colombia, incluyendo propietarios de granjas, gerentes de producción y personal administrativo encargado del inventario y la comercialización. 

## Características Principales 📋

EggQualitë ofrece una serie de funcionalidades clave para la gestión avícola:

* **Autenticación Segura de Usuarios:** Permite el registro, inicio y cierre de sesión, así como la recuperación de contraseña. 
* **Visión General de Producción:** Un resumen ejecutivo del estado actual de tus panales (activos, vencidos, vendidos, totales) para una gestión rápida. 
* **Análisis Interactivo de Precios de Mercado:** Visualiza estadísticas históricas de precios de huevos por tipo y ciudad en las principales plazas de mercado de Colombia Fuente: Departamento Administrativo Nacional de Estadística –DANE-. Información pública. 
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
    * ]**Firebase Authentication:** Para la gestión segura de usuarios. 
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
    *(Reemplaza `tu-usuario/EggQualite.git` con la URL real de tu repositorio.)*

2.  **Configura tu Proyecto Firebase:**
    * Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
    * Habilita **Firebase Authentication** (Métodos de inicio de sesión: Email/Contraseña).
    * Habilita **Firestore Database** (Modo de producción o de prueba, según prefieras, y establece las reglas de seguridad).
    * Habilita **Cloud Functions** y **Cloud Scheduler** (para las funciones programadas de notificaciones y actualización de estado).
    * Crea una cuenta de servicio de correo electrónico (ej. SendGrid, Nodemailer con Gmail, etc.) para las notificaciones, y configura sus credenciales de forma segura en tus Cloud Functions.

3.  **Configura el Frontend:**
    ```bash
    cd frontend # O el nombre de tu carpeta frontend
    npm install
    ```
    * Crea un archivo `.env` (o `.env.local`) en la raíz de tu carpeta `frontend` y añade tus claves de configuración de Firebase (las encontrarás en la configuración de tu proyecto Firebase -> Configuración del proyecto -> Tus apps ->      Añadir app -> Web). Por ejemplo:
        ```env
        REACT_APP_FIREBASE_API_KEY=AIza...
        REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
        REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto
        REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
        REACT_APP_FIREBASE_APP_ID=1:..
        REACT_APP_FIREBASE_MEASUREMENT_ID=G-...
        ```

4.  **Configura el Backend (Cloud Functions):**
    ```bash
    cd backend # O el nombre de tu carpeta de funciones
    npm install
    firebase login # Inicia sesión con tu cuenta de Google
    firebase use --add # Selecciona el proyecto Firebase que creaste
    ```
    * Necesitarás configurar variables de entorno para tus Cloud Functions (ej. credenciales de correo electrónico, etc.). Esto se hace con el Firebase CLI:
        ```bash
        firebase functions:config:set mail.api_key="TU_API_KEY_DE_CORREO" mail.sender_email="tu_correo@example.com"
        ```
        *(Asegúrate de que estas variables de entorno sean accesibles dentro de tus Cloud Functions, por ejemplo, usando `functions.config().mail.api_key`)*.

5.  **Despliega las Cloud Functions:**
    ```bash
    firebase deploy --only functions
    ```

6.  **Ejecuta el Frontend Localmente:**
    ```bash
    cd ../frontend # Si estabas en la carpeta backend
    npm start
    ```
    Esto debería abrir la aplicación en tu navegador en `http://localhost:3000` (o el puerto configurado por defecto).

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

## Licencia 📄

Este proyecto está bajo la Licencia [Especifícala aquí, ej. MIT, Apache 2.0]. Consulta el archivo `LICENSE` para más detalles.

## Autores 🧑‍💻👩‍💻

* **Jhonny Ramirez** 
* **Adriana Guazaquillo** 

---
