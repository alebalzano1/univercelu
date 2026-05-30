// Galaxy Animated 3D Background for Univercelu
// Replicates the brand logo with a 3D flying warp effect ("coming towards us")
// and beautiful, glowing lila/violet nebulae.

(function () {
  const canvas = document.getElementById('galaxy-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Resize listener
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNebulae(); // Re-initialize nebulae dynamically
  });

  // --- Configuration ---
  const isMobile = window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 40 : 120; // Optimizado para 60 FPS estables en todas las pantallas
  const NEBULA_COUNT = isMobile ? 1 : 2;  // Reducción masiva de renderizado de gradientes radiales
  const PARTICLE_COUNT = isMobile ? 6 : 12;

  const stars = [];
  const particles = [];
  const nebulae = [];

  const FOV = 160; // Field of view projection factor

  // --- 3D Star Class ---
  class Star3D {
    constructor() {
      this.reset(true);
    }

    reset(randomZ = false) {
      // Coordinates relative to the center of the screen
      this.x = (Math.random() - 0.5) * width * 1.5;
      this.y = (Math.random() - 0.5) * height * 1.5;
      // Start depth (Z coordinate)
      this.z = randomZ ? Math.random() * 1000 : 1000;
      this.size = 0.8 + Math.random() * 2.0;
      // Twinkle phase
      this.phase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.05 + Math.random() * 0.08;
    }

    update() {
      // Move closer (decrement Z)
      this.z -= 1.5; // Speed of star travel

      // If star passes the viewer, recycle it to the background
      if (this.z <= 0) {
        this.reset(false);
      }
    }

    draw(time) {
      // Perspective projection
      const k = FOV / this.z;
      const px = this.x * k + width / 2;
      const py = this.y * k + height / 2;

      // Draw only if within canvas bounds
      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = this.size * k * 1.5;
        // Pulse opacity for twinkling
        const opacity = (0.3 + 0.7 * Math.abs(Math.sin(time * this.twinkleSpeed + this.phase))) * (1 - this.z / 1000);
        
        // Lilas and whites for stars
        ctx.fillStyle = `rgba(226, 217, 243, ${opacity})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- Space Dust / Lila Particle Class ---
  // Moving outward from center, creating floating dust coming at you
  class Particle3D {
    constructor() {
      this.reset(true);
    }

    reset(randomZ = false) {
      this.x = (Math.random() - 0.5) * width * 0.8;
      this.y = (Math.random() - 0.5) * height * 0.8;
      this.z = randomZ ? Math.random() * 1000 : 1000;
      this.size = 2.0 + Math.random() * 4.0;
      // Vibrant lila, violet, rose colors
      const r = Math.random();
      if (r < 0.6) {
        this.color = 'rgba(168, 85, 247, '; // Lila vibrante (#A855F7)
      } else if (r < 0.8) {
        this.color = 'rgba(124, 58, 237, '; // Violeta medio (#7C3AED)
      } else {
        this.color = 'rgba(247, 37, 133, ';  // Rosa vibrante
      }
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
      this.z -= 0.6; // Moves a bit slower than the stars to create parallax depth
      if (this.z <= 0) {
        this.reset(false);
      }
    }

    draw(time) {
      const k = FOV / this.z;
      const px = this.x * k + width / 2;
      const py = this.y * k + height / 2;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = this.size * k * 0.8;
        const opacity = (0.4 + 0.6 * Math.abs(Math.sin(time * this.pulseSpeed + this.phase))) * (1 - this.z / 1000);
        
        ctx.fillStyle = this.color + opacity + ')';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- Floating Lila Nebulae ---
  function initNebulae() {
    nebulae.length = 0;
    
    // We increase the lila/violet presence dramatically
    const colors = [
      'rgba(168, 85, 247, ', // Lila vibrante (#A855F7) - Dominant
      'rgba(168, 85, 247, ', // Lila vibrante (#A855F7) - Dominant
      'rgba(124, 58, 237, ', // Violeta medio (#7C3AED)
      'rgba(247, 37, 133, ', // Rosa brillante
      'rgba(45, 27, 105, '   // Violeta oscuro profundo
    ];

    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 250 + Math.random() * 350,
        color: colors[i % colors.length],
        // Increased opacities for vibrant highlights
        opacity: 0.15 + Math.random() * 0.15,
        // Drift movement vectors
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        // Scale pulse factor
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.001 + Math.random() * 0.002
      });
    }
  }

  // --- Initialize ---
  function init() {
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(new Star3D());
    }
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle3D());
    }
    initNebulae();
  }

  // --- Animation loop ---
  let frame = 0;
  function animate() {
    frame++;

    // Deep space black base background
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, width, height);

    // Render & animate Nebulae (gentle float and pulse)
    ctx.globalCompositeOperation = 'screen';
    for (const neb of nebulae) {
      // Slow float drift
      neb.x += neb.vx;
      neb.y += neb.vy;

      // Wrap nebulae boundaries
      if (neb.x < -neb.r) neb.x = width + neb.r;
      if (neb.x > width + neb.r) neb.x = -neb.r;
      if (neb.y < -neb.r) neb.y = height + neb.r;
      if (neb.y > height + neb.r) neb.y = -neb.r;

      // Pulse size gently
      const pulseSize = neb.r * (1 + 0.15 * Math.sin(frame * neb.pulseSpeed + neb.pulsePhase));

      const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, pulseSize);
      grad.addColorStop(0, neb.color + neb.opacity + ')');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Render & update Stars
    for (const star of stars) {
      star.update();
      star.draw(frame);
    }

    // Render & update Particles
    for (const p of particles) {
      p.update();
      p.draw(frame);
    }

    requestAnimationFrame(animate);
  }

  init();
  animate();
})();
