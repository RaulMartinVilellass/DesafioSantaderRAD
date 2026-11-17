/* ═══════════════════════════════════════════════
   ranking-bg.js  –  Fondo interactivo Ranking
   • Parallax de imagen al mover el ratón
   • Estrellas de 4 puntas con ciclo aparece/desaparece
   • Spotlight azul/dorado que sigue al cursor
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const fondoImg = document.getElementById('fondo-imagen-rank');
  const canvas   = document.getElementById('canvas-rank');
  const ctx      = canvas.getContext('2d');

  /* ── Tamaño canvas ── */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── Parallax ── */
  let mouseX = 0.5, mouseY = 0.5;
  let currentX = 0, currentY = 0;
  const STRENGTH = 20;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  /* ── Estrella de 4 puntas ── */
  function drawStar4(x, y, size, alpha, golden, rot) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    const spikes = 4;
    const outerR = size;
    const innerR = size * 0.25;
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
              : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fillStyle   = golden ? '#f5c842' : '#c8d8ff';
    ctx.shadowColor = golden ? '#f5c842' : '#6ea8fe';
    ctx.shadowBlur  = golden ? 12 : 7;
    ctx.fill();
    ctx.restore();
  }

  /* ── Estados del ciclo de vida ── */
  const STATE = { FADE_IN: 0, VISIBLE: 1, FADE_OUT: 2 };

  /* ── Partículas ── */
  const NUM = 80;
  const particles = [];

  class Star {
    constructor(stagger) {
      this.spawn(stagger);
    }

    spawn(stagger = false) {
      this.x       = Math.random() * canvas.width;
      this.y       = Math.random() * canvas.height;
      this.size    = Math.random() * 5.5 + 1.5;
      this.golden  = Math.random() < 0.28;
      this.rot     = Math.random() * Math.PI;
      this.rotSpd  = (Math.random() - 0.5) * 0.008;

      /* Tiempos aleatorios (en frames a 60fps) */
      this.fadeInDur  = 40  + Math.random() * 60;   // 0.6 – 1.6 s
      this.visibleDur = 80  + Math.random() * 160;  // 1.3 – 4 s
      this.fadeOutDur = 40  + Math.random() * 60;   // 0.6 – 1.6 s

      this.maxAlpha = Math.random() * 0.65 + 0.3;
      this.alpha    = 0;
      this.state    = STATE.FADE_IN;
      this.timer    = 0;

      /* Para el efecto inicial, stagger el estado de partida */
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
      this.rot += this.rotSpd;

      switch (this.state) {
        case STATE.FADE_IN:
          this.alpha = (this.timer / this.fadeInDur) * this.maxAlpha;
          if (this.timer >= this.fadeInDur) { this.state = STATE.VISIBLE; this.timer = 0; }
          break;

        case STATE.VISIBLE:
          this.alpha = this.maxAlpha;
          /* pequeño pulso suave mientras es visible */
          this.alpha *= (0.85 + 0.15 * Math.sin(this.timer * 0.05));
          if (this.timer >= this.visibleDur) { this.state = STATE.FADE_OUT; this.timer = 0; }
          break;

        case STATE.FADE_OUT:
          this.alpha = (1 - this.timer / this.fadeOutDur) * this.maxAlpha;
          if (this.timer >= this.fadeOutDur) this.spawn(); // renace en otro sitio
          break;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      drawStar4(this.x, this.y, this.size, this.alpha, this.golden, this.rot);
    }
  }

  for (let i = 0; i < NUM; i++) particles.push(new Star(true));

  /* ── Spotlight cursor ── */
  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;
  let tgX = glowX, tgY = glowY;
  document.addEventListener('mousemove', (e) => { tgX = e.clientX; tgY = e.clientY; });

  /* ── Loop ── */
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Parallax */
    currentX += (((mouseX - 0.5) * STRENGTH * 2) - currentX) * 0.06;
    currentY += (((mouseY - 0.5) * STRENGTH * 2) - currentY) * 0.06;
    fondoImg.style.transform = `translate(${-currentX}px, ${-currentY}px)`;

    /* Spotlight suave */
    glowX += (tgX - glowX) * 0.07;
    glowY += (tgY - glowY) * 0.07;

    const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 220);
    grad.addColorStop(0,   'rgba(100, 160, 255, 0.12)');
    grad.addColorStop(0.3, 'rgba(245, 200, 60,  0.06)');
    grad.addColorStop(1,   'rgba(0,   0,   0,   0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Estrellas */
    particles.forEach(p => { p.update(); p.draw(); });
  }

  animate();
})();
