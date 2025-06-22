<template>
  <div class="landing-page">
    <!-- CAMBIO: Añadido un elemento decorativo de fondo -->
    <div class="background-shape"></div>

    <!-- NAVEGACIÓN SIMPLE -->
    <header class="main-header">
      <div class="container nav-container">
        <!-- Logo de la empresa -->
        <img :src="logoSrc" alt="EggQualitë Logo" class="logo-img">
        <div class="nav-actions">
            <router-link :to="{ name: 'login' }" class="nav-link login-link">
              Iniciar Sesión
            </router-link>
            <router-link :to="{ name: 'register' }" class="cta-button nav-cta">
              ¡Regístrate Gratis!
            </router-link>
        </div>
      </div>
    </header>

    <main>
      <!-- SECCIÓN HERO -->
      <section class="hero-section" ref="heroSectionRef">
        <div class="container hero-layout">
          <div class="hero-text">
            <!-- CAMBIO: Añadido span para acento de color -->
            <h1 class="animatable anim-fade-in-up">Digitaliza tu Granja, <span class="text-primary">Impulsa tus Ventas</span></h1>
            <p class="subtitle animatable anim-fade-in-up" style="transition-delay: 0.1s;">
              EggQualitë es la plataforma web diseñada para pequeños y medianos avicultores en Colombia. Gestiona tu producción, analiza datos clave y optimiza tus ganancias de forma sencilla e intuitiva.
            </p>
            <router-link :to="{ name: 'register' }" class="cta-button hero-cta animatable anim-fade-in-up" style="transition-delay: 0.2s;">
              Empieza a Gestionar tus Panales
            </router-link>
          </div>
          <!-- Contenedor con el video principal -->
          <div class="hero-video-container animatable anim-fade-in" style="transition-delay: 0.3s;">
             <video class="hero-video" autoplay loop muted playsinline>
                <source :src="videoSrc" type="video/mp4">
                Tu navegador no soporta el video. Considera usar una imagen de respaldo aquí.
             </video>
          </div>
        </div>
      </section>

      <!-- SECCIÓN DE BENEFICIOS -->
      <section class="benefits-section" ref="benefitsSectionRef">
        <div class="container">
          <h2 class="animatable anim-fade-in-up section-title">Todo lo que necesitas para crecer</h2>
          <!-- CAMBIO: Grid de beneficios actualizado para mejor alineación -->
          <div class="benefits-grid">
            <div class="benefit-card animatable anim-fade-in-up">
              <div class="benefit-icon">📈</div>
              <h3>Control de Inventario Detallado</h3>
              <p>Registra la producción diaria, clasifica los huevos por calidad y tamaño, y mantén un control exacto de tu stock en tiempo real.</p>
            </div>
            <div class="benefit-card animatable anim-fade-in-up" style="transition-delay: 0.1s;">
              <div class="benefit-icon">💰</div>
              <h3>Análisis de Precios de Mercado</h3>
              <p>Accede a datos actualizados de precios en tu región para tomar decisiones informadas y maximizar la rentabilidad de tu venta.</p>
            </div>
            <div class="benefit-card animatable anim-fade-in-up" style="transition-delay: 0.2s;">
              <div class="benefit-icon">🔔</div>
              <h3>Notificaciones Inteligentes</h3>
              <p>Recibe alertas sobre bajos niveles de inventario, cambios en precios del mercado o tareas de mantenimiento programadas.</p>
            </div>
            <div class="benefit-card animatable anim-fade-in-up" style="transition-delay: 0.3s;">
              <div class="benefit-icon">📊</div>
              <h3>Reportes Personalizados</h3>
              <p>Genera informes visuales sobre tu producción, ventas y rendimiento para entender mejor tu negocio y planificar a futuro.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN DE TESTIMONIOS -->
      <section class="testimonials-section" ref="testimonialsSectionRef">
        <div class="container">
          <h2 class="animatable anim-fade-in-up section-title">Lo que dicen nuestros avicultores</h2>
          <div class="testimonials-wrapper">
            <div class="testimonial animatable anim-fade-in-up">
              <blockquote>
                "Desde que uso EggQualitë, tengo el control total de mi producción. Los reportes me han ayudado a identificar mis semanas más productivas. ¡Totalmente recomendada!"
              </blockquote>
              <cite>– María F., Avicultora en Cundinamarca</cite>
            </div>
            <div class="testimonial animatable anim-fade-in-up" style="transition-delay: 0.1s;">
              <blockquote>
                "La función de análisis de precios es una maravilla. Ahora sé cuándo es el mejor momento para vender. Mi rentabilidad ha mejorado notablemente."
              </blockquote>
              <cite>– Carlos G., Pequeño productor en Antioquia</cite>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN FINAL / CTA REPETIDA -->
      <section id="cta-final" class="final-cta-section" ref="finalCtaSectionRef">
        <div class="container">
          <h2 class="animatable anim-fade-in">¿Listo para llevar tu granja al siguiente nivel?</h2>
          <p class="animatable anim-fade-in" style="transition-delay: 0.1s;">Únete a la comunidad de avicultores que ya están transformando su gestión.</p>
          <router-link :to="{ name: 'register' }" class="cta-button animatable anim-fade-in" style="transition-delay: 0.2s;">
            ¡Regístrate Gratis Ahora!
          </router-link>
        </div>
      </section>
    </main>

    <!-- CAMBIO: Footer rediseñado -->
    <footer class="main-footer-bottom">
      <div class="container">
        <p>&copy; 2025 <span class="text-primary">EggQualitë</span>. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// CAMBIO: Rutas de logo y video actualizadas.
import logoSrc from '@/assets/logo1.png';
import videoSrc from '@/assets/Jun_18__1209_20s_202506181301_0k6r3.mp4';


// Refs para cada sección que queremos observar
const heroSectionRef = ref(null);
const benefitsSectionRef = ref(null);
const testimonialsSectionRef = ref(null);
const finalCtaSectionRef = ref(null);

// Lógica del Intersection Observer para animaciones al desplazar
onMounted(() => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const animatableElements = entry.target.querySelectorAll('.animatable');
        animatableElements.forEach(el => {
            el.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  if (heroSectionRef.value) observer.observe(heroSectionRef.value);
  if (benefitsSectionRef.value) observer.observe(benefitsSectionRef.value);
  if (testimonialsSectionRef.value) observer.observe(testimonialsSectionRef.value);
  if (finalCtaSectionRef.value) observer.observe(finalCtaSectionRef.value);
});
</script>

<style scoped>
/* --- ESTILOS DE ANIMACIÓN --- */
.animatable {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.anim-fade-in-up {
  transform: translateY(30px);
}
.anim-fade-in {
  /* No necesita transform */
}
.animatable.visible {
  opacity: 1;
  transform: translateY(0);
}


/* --- CSS Variables and Global Component Styles --- */
:root {
  --primary-color: #ff753a;
  --primary-color-dark: #e66028;
  --primary-color-light: #fff0e9; /* CAMBIO: Tono naranja muy claro */
  --dark-blue: #0c1f3e;
  --text-color: #333;
  --text-color-light: #667085;
  --background-light: #f9fafb;
  --white-color: #ffffff;
  --border-color: #e5e7eb;
}

/* CAMBIO: Estilo para la selección de texto */
::selection {
    background-color: var(--primary-color);
    color: var(--white-color);
}

.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--white-color); /* Fondo principal blanco */
  line-height: 1.6;
  position: relative; /* Necesario para el fondo decorativo */
  z-index: 1;
}

/* CAMBIO: Forma decorativa de fondo */
.background-shape {
    position: absolute;
    top: 0;
    right: 0;
    width: 50vw;
    height: 100vh;
    background: linear-gradient(135deg, var(--primary-color-light), var(--white-color));
    clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
    z-index: -1;
    opacity: 0.5;
}


.container {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

h1, h2, h3 {
  color: var(--dark-blue);
  font-weight: 700;
  line-height: 1.3;
}

section {
  padding: 80px 0;
  overflow-x: hidden;
}

.text-primary {
    color: var(--primary-color);
}

.section-title {
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  margin-bottom: 50px !important;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background-color: var(--primary-color);
  border-radius: 2px;
}


/* --- Simple Navigation Header --- */
.main-header {
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-img {
  height: 100px;
  width: auto;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-link {
  font-weight: 600;
  color: var(--dark-blue);
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;
  padding-bottom: 5px;
}

/* CAMBIO: Efecto de subrayado al pasar el mouse */
.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-color);
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease-out;
}
.nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
}

/* --- Main Call-to-Action Button --- */
.cta-button {
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(255, 117, 58, 0.2);
  border: none;
  text-align: center;
}

.cta-button:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 117, 58, 0.4);
}

/* --- Hero Section --- */
.hero-section {
    background-color: transparent; /* Se hace transparente para ver el fondo decorativo */
}

.hero-layout {
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-text {
  flex: 1;
}

h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-color-light);
  margin-bottom: 30px;
}

.hero-cta {
  padding: 15px 30px;
  font-size: 18px;
}

.hero-video-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
}

.hero-video {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  /* CAMBIO: Borde sutil para integrar el video */
  border: 4px solid var(--white-color);
}


/* --- Benefits Section --- */
.benefits-section {
  text-align: center;
  background-color: var(--background-light);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.benefits-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
}

.benefit-card {
  padding: 25px;
  background: var(--white-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: left;
  flex-basis: 280px;
  flex-grow: 1;
  max-width: 320px;
}

.benefit-card:hover {
  transform: scale(1.03) translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  font-size: 36px;
  margin-bottom: 20px;
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: transform 0.3s ease;
}
.benefit-card:hover .benefit-icon {
    transform: rotate(10deg) scale(1.1);
}

.benefit-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.benefit-card p {
  color: var(--text-color-light);
}

/* --- Testimonials Section --- */
.testimonials-section {
  background-color: var(--white-color);
  text-align: center;
}

.testimonials-wrapper {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.testimonial {
  background: var(--background-light);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  max-width: 480px;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.testimonial:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}


.testimonial blockquote {
  font-style: italic;
  color: var(--text-color-light);
  margin: 0 0 15px 0;
  border-left: 4px solid var(--primary-color);
  padding-left: 20px;
  font-size: 16px;
}

.testimonial cite {
  font-weight: 600;
  color: var(--primary-color);
  font-style: normal;
}

/* --- Final CTA Section --- */
.final-cta-section {
  background: linear-gradient(45deg, var(--dark-blue), #1e3a8a); /* CAMBIO: Gradiente azul oscuro */
  color: var(--white-color);
  text-align: center;
  border-radius: 20px;
  margin: 0 20px 80px 20px;
  position: relative;
  overflow: hidden;
}

.final-cta-section .container {
    padding-top: 60px;
    padding-bottom: 60px;
}

.final-cta-section h2 {
  font-size: 36px;
  color: var(--white-color);
  margin-bottom: 15px;
}

.final-cta-section p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* --- Footer --- */
.main-footer-bottom {
  padding: 25px 0;
  text-align: center;
  font-size: 14px;
  color: var(--text-color-light);
  background-color: var(--background-light);
  border-top: 1px solid var(--border-color);
}

/* --- Responsive Design --- */
@media (max-width: 992px) {
  .hero-layout {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    order: 2;
  }

  .hero-video-container {
    order: 1;
    width: 100%;
    max-width: 450px;
    margin-bottom: 40px;
  }
  
  h1 {
    font-size: 40px;
  }

  .testimonials-wrapper {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  section {
    padding: 60px 0;
  }
  
  .nav-cta, .login-link {
    display: none;
  }

  h1 {
    font-size: 34px;
  }
  
  h2 {
    font-size: 30px;
  }

  .final-cta-section {
    margin-left: 10px;
    margin-right: 10px;
  }

  .background-shape {
      display: none; /* Ocultar forma en móviles para no sobrecargar */
  }
}
</style>
