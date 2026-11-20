// ファーストビューのジャケット枠に「滲む、響く。」の演出を描く。
// ・色の玉がゆっくり漂いながら重なり合い、にじむ（滲む）
// ・タップ/クリックすると波紋が広がり、色が揺れる（響く）
// メインビジュアル画像が設定されている場合、canvas は出力されないので何もしない。
(() => {
  const canvas = document.getElementById("bleed-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLORS = [
    [232, 183, 160], // 暖かい桃色
    [159, 183, 224], // 青
    [214, 196, 132], // 黄土
    [150, 190, 175], // 青緑
    [186, 150, 205], // 藤色
  ];

  let size = 0;
  let blobs = [];
  const ripples = [];
  let t = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!blobs.length) {
      blobs = COLORS.map((c, i) => ({
        c,
        x: Math.random(), y: Math.random() * 0.8,
        r: 0.35 + Math.random() * 0.25,
        sx: 0.6 + Math.random() * 0.8, sy: 0.6 + Math.random() * 0.8,
        phase: i * 1.7,
        push: 0,
      }));
    }
    draw();
  }

  function draw() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#121216";
    ctx.fillRect(0, 0, size, size);

    ctx.globalCompositeOperation = "screen";
    for (const b of blobs) {
      const x = (b.x + Math.sin(t * 0.0003 * b.sx + b.phase) * 0.18) * size;
      const y = (b.y + Math.cos(t * 0.00025 * b.sy + b.phase) * 0.18) * size;
      const r = b.r * size * (1 + b.push * 0.25);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const [cr, cg, cb] = b.c;
      g.addColorStop(0, `rgba(${cr},${cg},${cb},0.55)`);
      g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.22)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      b.push *= 0.96;
    }

    // 波紋（響く）
    ctx.globalCompositeOperation = "source-over";
    for (const rp of ripples) {
      for (let k = 0; k < 3; k++) {
        const rr = rp.r - k * 18;
        if (rr <= 0) continue;
        ctx.strokeStyle = `rgba(236,235,230,${rp.life * (0.35 - k * 0.1)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function loop(now) {
    t = now;
    for (const rp of ripples) { rp.r += size * 0.006; rp.life -= 0.008; }
    while (ripples.length && ripples[0].life <= 0) ripples.shift();
    draw();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1 });
    for (const b of blobs) b.push = 1;
    if (reduceMotion) draw();
  });
  window.addEventListener("resize", resize);

  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
