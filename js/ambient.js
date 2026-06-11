(function () {
  const canvas = document.getElementById('petals');
  const stage = document.querySelector('.stage');
  const ctx = canvas.getContext('2d');
  const STILL = location.search.indexOf('still') >= 0;
  const W = 1920, H = 1080;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const TINTS = ['#F2A0C0', '#F7B8CE', '#FAD9E6', '#EE9FBE', '#9ECB5A', '#F4C56B'];
  const N = 30;
  const petals = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  for (let i = 0; i < N; i++) {
    petals.push({
      x: rnd(0, W), y: rnd(-H, H),
      s: rnd(7, 16),
      vy: rnd(14, 34),
      vx: rnd(8, 26),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-1.2, 1.2),
      sway: rnd(18, 46),
      ph: rnd(0, Math.PI * 2),
      color: TINTS[(Math.random() * TINTS.length) | 0],
      a: rnd(.45, .9)
    });
  }

  function petalPath(p) {
    ctx.beginPath();
    const s = p.s;
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * .8, -s * .7, s * .7, s * .6, 0, s);
    ctx.bezierCurveTo(-s * .7, s * .6, -s * .8, -s * .7, 0, -s);
    ctx.closePath();
  }

  let last = 0, paused = false;
  function frame(t) {
    const dt = Math.min((t - last) / 1000, .05) || 0;
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.ph += dt * 1.4;
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(p.ph) * p.sway) * dt;
      p.rot += p.vr * dt;
      if (p.y > H + 30) { p.y = -30; p.x = rnd(0, W); }
      if (p.x > W + 40) p.x = -40;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.color;
      petalPath(p);
      ctx.fill();
      ctx.restore();
    }
    if (!paused) requestAnimationFrame(frame);
  }
  if (STILL) frame(0); else requestAnimationFrame(frame);

  window.__freeze = function (on) {
    paused = !!on;
    document.body.classList.toggle('frozen', !!on);
    if (!on) { last = 0; requestAnimationFrame(frame); }
  };

  const SPIDER = `
  <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <g stroke="#0B0A0C" stroke-width="3.4" stroke-linecap="round" fill="none">
      <path class="leg" d="M52 56 L30 44 L12 52"/>
      <path class="leg" d="M52 62 L26 60 L8 70"/>
      <path class="leg" d="M52 68 L28 76 L12 90"/>
      <path class="leg" d="M54 74 L36 90 L26 106"/>
      <path class="leg" d="M68 56 L90 44 L108 52"/>
      <path class="leg" d="M68 62 L94 60 L112 70"/>
      <path class="leg" d="M68 68 L92 76 L108 90"/>
      <path class="leg" d="M66 74 L84 90 L94 106"/>
    </g>
    <ellipse cx="60" cy="70" rx="20" ry="24" fill="#0B0A0C"/>
    <circle cx="60" cy="48" r="12" fill="#0B0A0C"/>
    <circle cx="56" cy="46" r="2.2" fill="#E0532E"/>
    <circle cx="64" cy="46" r="2.2" fill="#E0532E"/>
  </svg>`;

  const roamer = document.createElement('div');
  roamer.className = 'spider';
  roamer.style.opacity = '0';
  roamer.innerHTML = SPIDER;
  stage.appendChild(roamer);

  const CREEPY = { concept: 1, enemies: 1 };
  let lastAnim = null;
  function scuttle() {
    if (lastAnim) lastAnim.cancel();
    roamer.style.opacity = '1';
    const yA = 760, yB = 700, yC = 820;
    lastAnim = roamer.animate([
      { transform: 'translate(-180px,' + yA + 'px) rotate(8deg) scale(.9)', opacity: 0 },
      { transform: 'translate(360px,' + yB + 'px) rotate(2deg) scale(1)', opacity: 1, offset: .22 },
      { transform: 'translate(980px,' + yC + 'px) rotate(-3deg) scale(1.05)', opacity: 1, offset: .6 },
      { transform: 'translate(2080px,' + yA + 'px) rotate(6deg) scale(.92)', opacity: 0 }
    ], { duration: 5200, easing: 'cubic-bezier(.5,.05,.5,.95)', fill: 'forwards' });
  }

  document.addEventListener('deck:change', (e) => {
    if (STILL) return;
    if (CREEPY[e.detail.id]) setTimeout(scuttle, 650);
    else { roamer.style.opacity = '0'; if (lastAnim) lastAnim.cancel(); }
  });

  const EXTS = ['jpg', 'png', 'webp', 'jpeg'];
  document.querySelectorAll('.shot[data-shot]').forEach((shot) => {
    const name = shot.getAttribute('data-shot');
    const img = shot.querySelector('img') || document.createElement('img');
    if (!img.parentNode) shot.insertBefore(img, shot.firstChild);
    let i = 0;
    const tryNext = () => {
      if (i >= EXTS.length) { shot.classList.add('is-empty'); return; }
      img.onload = () => { shot.classList.add('is-filled'); };
      img.onerror = () => { i++; tryNext(); };
      img.src = 'assets/shots/' + name + '.' + EXTS[i] + '?v=1';
    };
    tryNext();
  });
})();
