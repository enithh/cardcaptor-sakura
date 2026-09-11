/**
 * ============================================================================
 * APP.JS - Orquestador Principal, Navegación, Canvas de Pétalos y Efectos
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Módulos Principales
  initCollectionModule();
  initGameModule();

  // 2. Inicializar Efectos Visuales y Navegación
  initNavigationObserver();
  initPetalsCanvas();
  initMagicAudio();
});

/**
 * Observador de intersección para resaltar el enlace activo del menú de navegación
 */
function initNavigationObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.getElementById('siteHeader');

  // Header scroll shadow effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // Intersection Observer para detectar sección activa
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // Smooth scroll click handler
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Generador de partículas de pétalos de sakura y destellos mágicos en Canvas 2D
 */
function initPetalsCanvas() {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalsCount = Math.min(Math.floor(window.innerWidth / 35), 38);
  const petals = [];

  for (let i = 0; i < petalsCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.5 - 0.2,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 2 - 1,
      opacity: Math.random() * 0.5 + 0.35,
      color: Math.random() > 0.4 ? '#FFB7D5' : '#FFD6E8'
    });
  }

  function renderPetals() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      // Dibujar forma de pétalo pixel/curva suave
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
      ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();

      // Actualizar posición
      p.x += p.speedX + Math.sin(p.y * 0.008) * 0.6;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      // Reiniciar cuando sale de pantalla
      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) {
        p.x = -20;
      }
    }

    requestAnimationFrame(renderPetals);
  }

  renderPetals();
}

/**
 * Efecto de sonido mágico sintentizado con Web Audio API
 */
function initMagicAudio() {
  const audioBtn = document.getElementById('audioToggle');
  let audioCtx = null;
  let isSoundActive = false;

  function playMagicChime() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.45);
      });
    } catch (e) {
      console.log('Audio ambient not enabled');
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      isSoundActive = !isSoundActive;
      playMagicChime();
      audioBtn.classList.toggle('active', isSoundActive);
      audioBtn.title = isSoundActive ? 'Sonido Mágico Activado' : 'Sonido Mágico Desactivado';
    });
  }

  // Reproducir sutil campana mágica al pulsar botones interactivos clave
  document.addEventListener('click', (e) => {
    if (isSoundActive && (e.target.closest('.pixel-btn') || e.target.closest('.card-item'))) {
      playMagicChime();
    }
  });
}
