// ヒーロー部分のインタラクティブな光の粒子。
// ポインター（マウス・指）に粒子が引き寄せられ、クリック/タップで波紋が広がります。
(() => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  const pointer = { x: -9999, y: -9999, active: false };
  const ripples = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(220, (width * height) / 6000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      hue: 190 + Math.random() * 90,
    }));
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }

  canvas.addEventListener("pointermove", setPointer);
  canvas.addEventListener("pointerdown", (e) => {
    setPointer(e);
    ripples.push({ x: pointer.x, y: pointer.y, r: 0, life: 1 });
  });
  canvas.addEventListener("pointerleave", () => { pointer.active = false; });
  window.addEventListener("resize", resize);

  function step() {
    ctx.fillStyle = "rgba(7, 7, 13, 0.25)";
    ctx.fillRect(0, 0, width, height);

    for (const rp of ripples) {
      rp.r += 6;
      rp.life -= 0.015;
    }
    while (ripples.length && ripples[0].life <= 0) ripples.shift();

    for (const p of particles) {
      if (pointer.active) {
        const dx = pointer.x - p.x, dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 220) {
          const f = (1 - dist / 220) * 0.08;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
      }
      for (const rp of ripples) {
        const dx = p.x - rp.x, dy = p.y - rp.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (Math.abs(dist - rp.r) < 30) {
          p.vx += (dx / dist) * 1.2 * rp.life;
          p.vy += (dy / dist) * 1.2 * rp.life;
        }
      }
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x += width; else if (p.x > width) p.x -= width;
      if (p.y < 0) p.y += height; else if (p.y > height) p.y -= height;

      const speed = Math.min(Math.hypot(p.vx, p.vy), 4);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, ${60 + speed * 8}%, ${0.5 + speed * 0.12})`;
      ctx.arc(p.x, p.y, p.r + speed * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 近い粒子同士を線で結ぶ
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 70) {
          ctx.strokeStyle = `rgba(127, 216, 255, ${(1 - d / 70) * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  step();
})();
