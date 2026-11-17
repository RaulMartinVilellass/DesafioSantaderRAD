/* ═══════════════════════════════════════════════
   nosotros-bg.js  –  Fondo interactivo
   • Parallax de imagen al mover el ratón
   • Estrellas circulares con ciclo aparece/desaparece
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
  const PARALLAX_STRENGTH = 22;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  /* ── Estados del ciclo de vida ── */
  const STATE = { FADE_IN: 0, VISIBLE: 1, FADE_OUT: 2 };

  /* ── Estrellas con ciclo de vida ── */
  const NUM_STARS = 100;
  const stars = [];

  class Star {
    constructor(stagger) {
      this.spawn(stagger);
    }

    spawn(stagger = false) {
      this.x        = Math.random() * canvas.width;
      this.y        = Math.random() * canvas.height;
      this.size     = Math.random() * 2.2 + 0.4;
      this.golden   = Math.random() < 0.20;

      /* Tiempos aleatorios (en frames) */
      this.fadeInDur  = 50  + Math.random() * 70;
      this.visibleDur = 90  + Math.random() * 180;
      this.fadeOutDur = 50  + Math.random() * 70;

      this.maxAlpha = Math.random() * 0.65 + 0.25;
      this.alpha    = 0;
      this.state    = STATE.FADE_IN;
      this.timer    = 0;

      /* Stagger: distribuir estrellas en distintas fases al arrancar */
      if (stagger) {
        const phase = Math.random();
        if (phase < 0.33) {
          this.state = STATE.FADE_IN;
          this.timer = Math.random() * this.fadeInDur;
          this.alpha = (this.timer / this.fadeInDur) * this.maxAlpha;
        } else if (phase < 0.66) {
          this.state = STATE.VISIBLE;
          this.timer = Math.random() * this.visibleDur;
          this.alpha = this.maxAlpha;
        } else {
          this.state = STATE.FADE_OUT;
          this.timer = Math.random() * this.fadeOutDur;
          this.alpha = (1 - this.timer / this.fadeOutDur) * this.maxAlpha;
        }
      }
    }

    update() {
      this.timer++;

      switch (this.state) {
        case STATE.FADE_IN:
          this.alpha = (this.timer / this.fadeInDur) * this.maxAlpha;
          if (this.timer >= this.fadeInDur) { this.state = STATE.VISIBLE; this.timer = 0; }
          break;

        case STATE.VISIBLE:
          /* pulso suave de brillo */
          this.alpha = this.maxAlpha * (0.80 + 0.20 * Math.sin(this.timer * 0.04));
          if (this.timer >= this.visibleDur) { this.state = STATE.FADE_OUT; this.timer = 0; }
          break;

        case STATE.FADE_OUT:
          this.alpha = (1 - this.timer / this.fadeOutDur) * this.maxAlpha;
          if (this.timer >= this.fadeOutDur) this.spawn(); // renace en otro punto
          break;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle   = this.golden ? '#f5c842' : '#c8d8ff';
      ctx.shadowColor = this.golden ? '#f5c842' : '#6ea8fe';
      ctx.shadowBlur  = this.golden ? 10 : 5;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < NUM_STARS; i++) stars.push(new Star(true));

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Parallax suave (lerp) */
    currentX += (((mouseX - 0.5) * PARALLAX_STRENGTH * 2) - currentX) * 0.06;
    currentY += (((mouseY - 0.5) * PARALLAX_STRENGTH * 2) - currentY) * 0.06;
    fondoImg.style.transform = `translate(${-currentX}px, ${-currentY}px)`;

    /* Brillo cursor */
    glowX += (targetGlowX - glowX) * 0.07;
    glowY += (targetGlowY - glowY) * 0.07;

    const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 180);
    grad.addColorStop(0,   'rgba(245, 200, 60, 0.13)');
    grad.addColorStop(0.4, 'rgba(100, 140, 255, 0.05)');
    grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Estrellas */
    stars.forEach(s => { s.update(); s.draw(); });
  }

  animate();
})();
