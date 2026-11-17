/* ═══════════════════════════════════════════════
   nosotros-bg.js  –  Fondo interactivo
   • Parallax de imagen al mover el ratón
   • Partículas de estrellas flotantes (canvas)
   • Brillo dorado que sigue al cursor
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const fondoImg = document.getElementById('fondo-imagen');
  const canvas   = document.getElementById('canvas-fondo');
  const ctx      = canvas.getContext('2d');

  /* ── Tamaño canvas ── */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── Parallax suave con mouse ── */
  let mouseX = 0.5, mouseY = 0.5;
  let currentX = 0, currentY = 0;
  const PARALLAX_STRENGTH = 22; // px máximo de desplazamiento

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  /* ── Partículas de estrellas ── */
  const NUM_STARS = 90;
  const stars = [];

  class Star {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = initial ? Math.random() * canvas.height : -4;
      this.size  = Math.random() * 1.8 + 0.3;
      this.speed = Math.random() * 0.3 + 0.08;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinkleDir   = Math.random() > 0.5 ? 1 : -1;
      // algunos son dorados como la imagen
      this.golden = Math.random() < 0.18;
    }

    update() {
      this.y += this.speed;
      this.alpha += this.twinkleSpeed * this.twinkleDir;
      if (this.alpha > 0.95 || this.alpha < 0.1) this.twinkleDir *= -1;
      if (this.y > canvas.height + 4) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.golden ? '#f5c842' : '#c8d8ff';
      ctx.shadowColor = this.golden ? '#f5c842' : '#6ea8fe';
      ctx.shadowBlur  = this.golden ? 8 : 4;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(new Star());
  }

  /* ── Brillo dorado que sigue al cursor ── */
  let glowX = window.innerWidth  / 2;
  let glowY = window.innerHeight / 2;
  let targetGlowX = glowX;
  let targetGlowY = glowY;

  document.addEventListener('mousemove', (e) => {
    targetGlowX = e.clientX;
    targetGlowY = e.clientY;
  });

  /* ── Loop de animación ── */
  function animate() {
    requestAnimationFrame(animate);

    /* Limpiar canvas */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Parallax suave (lerp) */
    currentX += (((mouseX - 0.5) * PARALLAX_STRENGTH * 2) - currentX) * 0.06;
    currentY += (((mouseY - 0.5) * PARALLAX_STRENGTH * 2) - currentY) * 0.06;
    fondoImg.style.transform = `translate(${-currentX}px, ${-currentY}px)`;

    /* Mover brillo suavemente */
    glowX += (targetGlowX - glowX) * 0.07;
    glowY += (targetGlowY - glowY) * 0.07;

    /* Dibujar brillo dorado radial */
    const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 180);
    grad.addColorStop(0,   'rgba(245, 200, 60, 0.13)');
    grad.addColorStop(0.4, 'rgba(100, 140, 255, 0.05)');
    grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Dibujar estrellas */
    stars.forEach(s => { s.update(); s.draw(); });
  }

  animate();
})();
