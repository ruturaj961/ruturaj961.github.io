// Interactive point-cloud model in the hero.
// Each model (car, robot arm, gyroscope, beam) is built from simple parametric surfaces,
// sampled into points plus wireframe edges, projected with basic perspective, and drawn
// on a 2D canvas. The buttons morph the points from one model to the next. No libraries.
(function () {
  const canvas = document.querySelector(".hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  const GROUND = -0.42;
  const TAU = Math.PI * 2;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- geometry builders ----------
  function Builder() {
    this.pts = [];
    this.edges = [];
  }
  Builder.prototype.add = function (x, y, z) {
    this.pts.push({ x, y, z });
    return this.pts.length - 1;
  };
  Builder.prototype.edge = function (a, b) {
    if (a >= 0 && b >= 0) this.edges.push(a, b);
  };

  // Sample f(u, v) on an nu x nv grid and connect neighbours with edges.
  // f returns [x, y, z] or null (a hole). wrapU / wrapV close the surface.
  function grid(b, nu, nv, f, wrapU, wrapV) {
    const idx = [];
    for (let i = 0; i < nu; i++) {
      idx.push([]);
      for (let j = 0; j < nv; j++) {
        const p = f(i / (wrapU ? nu : nu - 1), j / (wrapV ? nv : nv - 1));
        idx[i].push(p ? b.add(p[0], p[1], p[2]) : -1);
      }
    }
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = idx[i][j];
        if (a < 0) continue;
        if (i + 1 < nu || wrapU) b.edge(a, idx[(i + 1) % nu][j]);
        if (j + 1 < nv || wrapV) b.edge(a, idx[i][(j + 1) % nv]);
      }
    }
  }

  // Straight run of points from p to q.
  function line(b, p, q, n) {
    let prev = -1;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const k = b.add(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t);
      b.edge(prev, k);
      prev = k;
    }
  }

  // Cylinder of radius r (or r0 -> r1) from point p to q.
  function cylinder(b, p, q, r0, r1, nu, nv) {
    const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const ax = d.map((c) => c / len);
    const ref = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const e1 = norm(cross(ax, ref));
    const e2 = cross(ax, e1);
    grid(b, nu, nv, (u, v) => {
      const r = r0 + (r1 - r0) * u;
      const a = v * TAU;
      const c = Math.cos(a) * r, s = Math.sin(a) * r;
      return [
        p[0] + d[0] * u + e1[0] * c + e2[0] * s,
        p[1] + d[1] * u + e1[1] * c + e2[1] * s,
        p[2] + d[2] * u + e1[2] * c + e2[2] * s,
      ];
    }, false, true);
  }

  // Torus centred at c. axis: "x" | "y" | "z" is the ring's normal.
  function torus(b, c, R, r, axis, nu, nv) {
    grid(b, nu, nv, (u, v) => {
      const th = u * TAU, ph = v * TAU;
      const rr = R + r * Math.cos(ph);
      const a = rr * Math.cos(th), bb = rr * Math.sin(th), n = r * Math.sin(ph);
      if (axis === "z") return [c[0] + a, c[1] + bb, c[2] + n];
      if (axis === "x") return [c[0] + n, c[1] + a, c[2] + bb];
      return [c[0] + a, c[1] + n, c[2] + bb];
    }, true, true);
  }

  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smooth(t) { return t * t * (3 - 2 * t); }

  // Piecewise-smooth curve through [x, y] keys.
  function keyed(keys, x) {
    if (x <= keys[0][0]) return keys[0][1];
    for (let k = 0; k < keys.length - 1; k++) {
      const [x0, y0] = keys[k], [x1, y1] = keys[k + 1];
      if (x <= x1) return y0 + (y1 - y0) * smooth((x - x0) / (x1 - x0));
    }
    return keys[keys.length - 1][1];
  }

  // ---------- the four models ----------
  function car() {
    const b = new Builder();
    const L = 1.12, bottom = -0.3;
    // side profile: bumper, hood, windshield, roof, rear glass, deck
    const roofline = [[-1.12, -0.17], [-1.0, -0.06], [-0.42, 0.0], [-0.08, 0.27], [0.36, 0.26], [0.78, 0.05], [1.08, 0.0], [1.12, -0.12]];
    const axles = [-0.68, 0.7];
    const wheelY = GROUND + 0.2;
    grid(b, 46, 26, (u, v) => {
      const x = -L + 2 * L * u;
      const top = keyed(roofline, x);
      const a = v * TAU;
      const s = Math.sin(a), c = Math.cos(a);
      const sy = Math.sign(s) * Math.pow(Math.abs(s), 0.55);
      const sz = Math.sign(c) * Math.pow(Math.abs(c), 0.55);
      const y = (top + bottom) / 2 + ((top - bottom) / 2) * sy;
      const taper = 1 - 0.3 * Math.pow(Math.abs(x) / L, 5);
      const greenhouse = 1 - 0.32 * clamp((y + 0.02) / 0.29, 0, 1);
      const z = 0.46 * taper * greenhouse * sz;
      for (const wx of axles) {
        if (Math.hypot(x - wx, y - wheelY) < 0.255 && Math.abs(z) > 0.2) return null; // wheel arch
      }
      return [x, y, z];
    }, false, true);
    for (const wx of axles) {
      for (const wz of [-0.4, 0.4]) {
        torus(b, [wx, wheelY, wz], 0.15, 0.055, "z", 28, 8);
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          line(b, [wx, wheelY, wz], [wx + Math.cos(a) * 0.12, wheelY + Math.sin(a) * 0.12, wz], 5);
        }
      }
    }
    return b;
  }

  function robotArm() {
    const b = new Builder();
    const s = 1.15, ox = -0.42;
    const P = (x, y, z) => [ox + x * s, GROUND + (y - GROUND) * s, z * s];
    const base = P(0, GROUND, 0), j1 = P(0, -0.27, 0), j2 = P(0, 0.12, 0),
      j3 = P(0.3, 0.46, 0), j4 = P(0.66, 0.34, 0), j5 = P(0.78, 0.1, 0);
    cylinder(b, base, P(0, -0.32, 0), 0.2 * s, 0.17 * s, 5, 26);
    cylinder(b, P(0, -0.32, 0), j1, 0.12 * s, 0.1 * s, 4, 20);
    cylinder(b, j1, j2, 0.09 * s, 0.085 * s, 12, 18);
    cylinder(b, j2, j3, 0.085 * s, 0.075 * s, 12, 18);
    cylinder(b, j3, j4, 0.075 * s, 0.065 * s, 11, 16);
    cylinder(b, j4, j5, 0.06 * s, 0.05 * s, 8, 14);
    for (const j of [j2, j3, j4]) {
      cylinder(b, [j[0], j[1], j[2] - 0.12 * s], [j[0], j[1], j[2] + 0.12 * s], 0.1 * s, 0.1 * s, 6, 20);
    }
    // gripper: palm and two fingers
    cylinder(b, j5, [j5[0], j5[1] - 0.06 * s, j5[2]], 0.08 * s, 0.08 * s, 3, 16);
    for (const fz of [-0.045, 0.045]) {
      cylinder(b, [j5[0], j5[1] - 0.06 * s, j5[2] + fz * s], [j5[0], j5[1] - 0.18 * s, j5[2] + fz * s], 0.022 * s, 0.018 * s, 6, 8);
    }
    return b;
  }

  function gyroscope() {
    const b = new Builder();
    const cy = 0.08;
    torus(b, [0, cy, 0], 0.5, 0.028, "z", 72, 6);   // outer frame (vertical, faces z)
    torus(b, [0, cy, 0], 0.43, 0.024, "x", 64, 6);  // gimbal ring (vertical, faces x)
    // rotor: a disc with a rim, spinning about y
    grid(b, 30, 7, (u, v) => {
      const a = u * TAU, r = 0.06 + v * 0.28;
      return [Math.cos(a) * r, cy + 0.035, Math.sin(a) * r];
    }, true, false);
    grid(b, 30, 7, (u, v) => {
      const a = u * TAU, r = 0.06 + v * 0.28;
      return [Math.cos(a) * r, cy - 0.035, Math.sin(a) * r];
    }, true, false);
    cylinder(b, [0, cy - 0.035, 0], [0, cy + 0.035, 0], 0.34, 0.34, 3, 40);
    line(b, [0, cy - 0.5, 0], [0, cy + 0.58, 0], 22);                 // spin axle
    cylinder(b, [0, GROUND, 0], [0, cy - 0.5, 0], 0.12, 0.015, 4, 18); // pedestal
    return b;
  }

  function beam() {
    const b = new Builder();
    const x0 = -0.9, x1 = 0.95, h = 0.2, d = 0.3, cy = 0.16;
    const sag = (x) => { const t = (x - x0) / (x1 - x0); return -0.3 * t * t * (3 - t) / 2; };
    // rectangular tube following the deflected shape (Euler-Bernoulli cantilever)
    grid(b, 42, 24, (u, v) => {
      const x = x0 + (x1 - x0) * u;
      const taper = 1 - 0.35 * u; // graded section, thinner toward the tip
      const p = v * 4, side = Math.floor(p), f = p - side;
      const hy = (h / 2) * taper, hz = d / 2;
      let y, z;
      if (side === 0) { y = -hy + 2 * hy * f; z = hz; }
      else if (side === 1) { y = hy; z = hz - 2 * hz * f; }
      else if (side === 2) { y = hy - 2 * hy * f; z = -hz; }
      else { y = -hy; z = -hz + 2 * hz * f; }
      return [x, cy + y + sag(x), z];
    }, false, true);
    // fixed support wall
    grid(b, 9, 9, (u, v) => [x0 - 0.04, GROUND + u * 0.95, -0.36 + v * 0.72], false, false);
    // load arrow at the tip
    const tipY = cy + sag(x1) + h * 0.33;
    line(b, [x1 - 0.02, tipY + 0.42, 0], [x1 - 0.02, tipY + 0.02, 0], 12);
    line(b, [x1 - 0.02, tipY + 0.02, 0], [x1 - 0.09, tipY + 0.11, 0], 4);
    line(b, [x1 - 0.02, tipY + 0.02, 0], [x1 + 0.05, tipY + 0.11, 0], 4);
    return b;
  }

  const MODELS = { car: car(), arm: robotArm(), gyro: gyroscope(), beam: beam() };

  // Every model must have the same number of points so they can morph into each other.
  // Shorter models are padded by repeating their own points (duplicates overlap exactly).
  const N = Math.max(...Object.values(MODELS).map((m) => m.pts.length));
  for (const m of Object.values(MODELS)) {
    const n = m.pts.length;
    for (let i = n; i < N; i++) m.pts.push({ ...m.pts[(i * 7919) % n] });
  }

  // ---------- view state ----------
  // start on whichever button is marked aria-pressed="true" in the HTML
  const startOn = document.querySelector('.lens[aria-pressed="true"]');
  let current = startOn && MODELS[startOn.dataset.shape] ? startOn.dataset.shape : "car";
  let pts = MODELS[current].pts.map((p) => ({ ...p }));
  let morph = null;            // { from, to, start }
  let yaw = -0.6, pitch = 0.32;
  let drag = null;             // { id, x, y, yaw, pitch }
  let idleAt = 0;              // resume auto-rotate after this time
  let w = 0, h = 0, colors = {};
  let visible = true, raf = 0;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors = {
      accent: cs.getPropertyValue("--accent").trim() || "#2f5a47",
      line: cs.getPropertyValue("--line-strong").trim() || "#ccc",
      ink: cs.getPropertyValue("--ink").trim() || "#111",
    };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function project(p, cy, sy, cp, sp, scale) {
    const x = p.x * cy + p.z * sy;
    const z1 = -p.x * sy + p.z * cy;
    const y = (p.y - 0.02) * cp - z1 * sp;
    const z = (p.y - 0.02) * sp + z1 * cp;
    const k = scale * 3.6 / (3.6 - z);
    return { x: w / 2 + x * k, y: h * 0.5 - y * k, z };
  }

  function draw() {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scale = Math.min(w * 0.36, h * 0.46);
    const P = (p) => project(p, cy, sy, cp, sp, scale);

    // floor grid
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = colors.line;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    const G = 1.4;
    for (let i = -4; i <= 4; i++) {
      const t = (i / 4) * G;
      let a = P({ x: t, y: GROUND, z: -G }), c = P({ x: t, y: GROUND, z: G });
      ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
      a = P({ x: -G, y: GROUND, z: t }); c = P({ x: G, y: GROUND, z: t });
      ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
    }
    ctx.stroke();

    // wireframe edges of the target model
    const proj = pts.map(P);
    const edges = MODELS[current].edges;
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 0; i < edges.length; i += 2) {
      const a = proj[edges[i]], c = proj[edges[i + 1]];
      ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
    }
    ctx.stroke();

    // points, far to near; nearer points are larger and stronger
    const order = proj.map((p, i) => i).sort((a, b) => proj[a].z - proj[b].z);
    for (const i of order) {
      const p = proj[i];
      const t = clamp((p.z + 1.3) / 2.6, 0, 1);
      ctx.globalAlpha = 0.22 + 0.78 * t;
      ctx.fillStyle = i % 19 === 0 ? colors.ink : colors.accent;
      const r = 0.55 + 1.05 * t;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    let active = false;
    if (morph) {
      const t = clamp((now - morph.start) / 1100, 0, 1), e = smooth(t);
      const { from, to } = morph;
      for (let i = 0; i < N; i++) {
        pts[i].x = from[i].x + (to[i].x - from[i].x) * e;
        pts[i].y = from[i].y + (to[i].y - from[i].y) * e;
        pts[i].z = from[i].z + (to[i].z - from[i].z) * e;
      }
      if (t < 1) active = true; else morph = null;
    }
    if (!drag && !reduceMotion.matches && now > idleAt) {
      yaw += 0.0028;
      active = true;
    }
    draw();
    if (active) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  // ---------- model switching ----------
  const lenses = [...document.querySelectorAll(".lens")];
  const figNum = document.querySelector(".fig-num");
  const related = document.querySelector(".lens-link");

  function select(name, animate) {
    if (!MODELS[name] || name === current) return;
    current = name;
    const to = MODELS[name].pts;
    if (animate && !reduceMotion.matches) {
      morph = { from: pts.map((p) => ({ ...p })), to, start: performance.now() };
    } else {
      morph = null;
      pts = to.map((p) => ({ ...p }));
    }
    lenses.forEach((l, i) => {
      const on = l.dataset.shape === name;
      l.setAttribute("aria-pressed", String(on));
      if (on) {
        if (figNum) figNum.textContent = `Fig. 0${i + 1} / ${l.querySelector("strong").textContent}`;
        if (related && l.dataset.project) related.href = `#/project/${l.dataset.project}`;
        canvas.setAttribute("aria-label", `Rotating point-cloud model: ${l.dataset.label}. Drag or use the arrow keys to rotate.`);
      }
    });
    kick();
  }

  lenses.forEach((l, i) => {
    l.addEventListener("click", () => select(l.dataset.shape, true));
    l.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = lenses[(i + step + lenses.length) % lenses.length];
      next.focus();
      select(next.dataset.shape, true);
    });
  });

  // ---------- drag and keyboard rotation ----------
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !e.isPrimary) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw, pitch };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.009;
    pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.15, 1.1);
    draw();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    idleAt = performance.now() + 2500;
    kick();
  };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => canvas.addEventListener(t, endDrag));

  canvas.addEventListener("keydown", (e) => {
    const k = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) return;
    e.preventDefault();
    if (k === "ArrowLeft") yaw -= 0.2;
    if (k === "ArrowRight") yaw += 0.2;
    if (k === "ArrowUp") pitch = clamp(pitch - 0.12, -0.15, 1.1);
    if (k === "ArrowDown") pitch = clamp(pitch + 0.12, -0.15, 1.1);
    idleAt = performance.now() + 2500;
    draw();
    kick();
  });

  // ---------- lifecycle ----------
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) kick();
  }, { rootMargin: "50px" }).observe(canvas);
  document.addEventListener("visibilitychange", kick);
  // re-read colours when light/dark mode changes
  new MutationObserver(() => { readColors(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  reduceMotion.addEventListener("change", kick);

  // ?model=arm (or car, gyro, beam) opens on a specific model
  const requested = new URLSearchParams(location.search).get("model");
  if (requested) select(requested, false);

  readColors();
  resize();
  kick();
})();
