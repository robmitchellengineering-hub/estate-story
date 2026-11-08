/* One Verified Constraint at a Time — animations */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  function stagger(items, cls, delay, step) {
    items.forEach((el, i) => {
      setTimeout(() => el.classList.add(cls), delay + i * (step || 120));
    });
  }
  function rafLoop(fn) {
    let id, running = true;
    function tick(t) { if (running) { fn(t); id = requestAnimationFrame(tick); } }
    id = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(id); };
  }

  /* ---------- stars ---------- */
  function stars(canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, starsArr = [];
    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(r.width * dpr); h = canvas.height = Math.floor(r.height * dpr);
      const n = Math.floor((w * h) / 9000);
      starsArr = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3, tw: Math.random() * Math.PI * 2, sp: 0.02 + Math.random() * 0.06
      }));
    }
    resize();
    window.addEventListener("resize", resize);
    ctx.fillStyle = "#0a0e16";
    const stop = rafLoop(() => {
      ctx.clearRect(0, 0, w, h);
      for (const s of starsArr) {
        s.tw += s.sp; s.y += s.sp * 0.4; if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,205,235," + a.toFixed(2) + ")"; ctx.fill();
      }
    });
    return stop;
  }

  /* ---------- geomesh ---------- */
  function geomesh(canvas) {
    const ctx = canvas.getContext("2d");
    let w, h;
    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.max(240, Math.floor(r.width * dpr));
      h = canvas.height = Math.max(140, Math.floor(r.height * dpr));
    }
    resize();
    window.addEventListener("resize", resize);
    const nodes = [
      [-1.9, 0.35, 0], [-0.6, -0.7, 0.5], [0.6, -0.6, -0.4], [1.9, 0.3, 0],
      [-1.0, 0.75, -0.7], [1.1, 0.7, 0.6], [0, 0.02, 0.15]
    ];
    const sizes = [0.5, 0.4, 0.42, 0.5, 0.38, 0.4, 0.32];
    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[0,4],[1,5],[2,5]];
    const stop = rafLoop((t) => {
      ctx.clearRect(0, 0, w, h);
      const PAD = 46;
      const S = Math.min((w - 2 * PAD) / 4.3, (h - 2 * PAD) / 1.7);
      const cx = w / 2, cy = h / 2;
      const rot = t * 0.00011, cs = Math.cos(rot), sn = Math.sin(rot);
      const P = p => {
        const [x, y, z] = p;
        const xr = x * cs - z * sn, zr = x * sn + z * cs;
        const persp = 1 / (2.1 - zr * 0.6);
        return [cx + xr * S * persp, cy + y * S * persp, persp];
      };
      const pts = nodes.map(P);
      const lw = Math.max(1, S * 0.015);
      // links with data pulses
      ctx.lineWidth = lw;
      edges.forEach((e, i) => {
        const a = pts[e[0]], b = pts[e[1]];
        ctx.strokeStyle = "rgba(74,222,128,0.34)";
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        const f = (t * 0.00035 + i * 0.11) % 1;
        const px = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f;
        ctx.beginPath(); ctx.arc(px, py, Math.max(1.6, S * 0.013), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74,222,128,0.9)"; ctx.fill();
      });
      // nodes as wireframe boxes
      nodes.forEach((n, i) => {
        const [x, y, p] = pts[i];
        const sz = sizes[i] * S * p;
        const half = sz / 2, k = 0.7;
        const alpha = 0.62 + 0.33 * Math.sin(t * 0.001 + i * 1.3);
        ctx.strokeStyle = "rgba(154,205,235," + alpha.toFixed(2) + ")";
        ctx.lineWidth = lw;
        const f = [[x - half, y - half * k], [x + half, y - half * k], [x + half, y + half * k], [x - half, y + half * k]];
        const q = [[x - half * k, y - half * k * k], [x + half * k, y - half * k * k], [x + half * k, y + half * k * k], [x - half * k, y + half * k * k]];
        ctx.beginPath(); f.forEach((pt, j) => j ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); q.forEach((pt, j) => j ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])); ctx.closePath(); ctx.stroke();
        f.forEach((pt, j) => { ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(q[j][0], q[j][1]); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.8, S * 0.016), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74,222,128,0.9)"; ctx.fill();
      });
    });
    return stop;
  }

  /* ---------- climate chart ---------- */
  const MODELS = [
    ["CNRM-ESM2-1", 1.40], ["CNRM-CM6-1", 1.34], ["IPSL-CM6A-LR", 0.75], ["BCC-CSM2-MR", -0.64],
    ["BCC-ESM1", -0.42], ["MPI-ESM1-2-LR", 0.42], ["MPI-ESM-1-2-HAM", 0.35], ["ACCESS-ESM1-5", -0.24],
    ["MPI-ESM1-2-HR", 0.20], ["ACCESS-CM2", 0.19], ["E3SM-1-1", -0.07], ["HadGEM3-GC31-LL", 0.07],
    ["EC-Earth3-Veg", -0.07], ["UKESM1-0-LL", 0.05], ["EC-Earth3", -0.05], ["GFDL-CM4", 0.04],
    ["GISS-E2-1-G-CC", 0.02], ["GISS-E2-1-G", 0.02], ["E3SM-1-0", -0.02]
  ];
  function climateChart(container) {
    const MAX = 1.5;
    let html = '<div class="heatchart">';
    html += '<div class="heatchart__row heatchart__head"><span class="heatchart__name">model</span><span class="heatchart__track heatchart__track--head">leak → &nbsp;&nbsp;|&nbsp;&nbsp; ← gain</span><span class="heatchart__val heatchart__val--head">W/m²</span></div>';
    MODELS.forEach((m, i) => {
      const v = m[1];
      const pct = (Math.abs(v) / MAX * 50).toFixed(2);
      const delay = i * 25;
      const bar = v >= 0
        ? '<i class="heatchart__bar heatchart__bar--leak" data-w="' + pct + '" style="transition-delay:' + delay + 'ms"></i>'
        : '<i class="heatchart__bar heatchart__bar--gain" data-w="' + pct + '" style="transition-delay:' + delay + 'ms"></i>';
      html += '<div class="heatchart__row">' +
        '<span class="heatchart__name">' + m[0] + '</span>' +
        '<span class="heatchart__track">' + bar + '<i class="heatchart__zero"></i><i class="heatchart__ref"></i></span>' +
        '<span class="heatchart__val">' + (v >= 0 ? "+" : "") + v.toFixed(2) + '</span>' +
        '</div>';
    });
    html += '<div class="heatchart__legend">red = leaking heat · blue = gaining it · amber dashed = measured 0.77 W/m²</div>';
    html += '</div>';
    container.innerHTML = html;
    return () => {
      container.classList.add("on");
      $$(".heatchart__bar", container).forEach(b => { b.style.width = b.getAttribute("data-w") + "%"; });
    };
  }

  /* ---------- sextant board ---------- */
  const FRAMEWORKS = ["LQG spinfoam", "String", "Asymptotic safety", "Causal sets", "CDT", "Group field"];
  function sextant(container) {
    const rows = 13;
    // deterministic mix: each framework KILLED by at least one condition, rest U/S
    const kills = [[4, "K"], [9, "K"], [2, "K"], [6, "K"], [11, "K"], [7, "K"]];
    const survs = { 0: [1, 6, 10], 1: [0, 5, 8], 2: [1, 7, 12], 3: [0, 3, 9], 4: [2, 5, 8], 5: [1, 4, 10] };
    let html = '<div class="sx head"></div>' + FRAMEWORKS.map(f => '<div class="sx head">' + f + "</div>").join("");
    for (let r = 0; r < rows; r++) {
      html += '<div class="sx head">C' + (r + 1) + "</div>";
      for (let f = 0; f < 6; f++) {
        let cls = "u", label = "U";
        if (kills[f][0] === r) { cls = "k"; label = "K"; }
        else if (survs[f].includes(r)) { cls = "s"; label = "S"; }
        html += '<div class="sx ' + cls + '">' + label + "</div>";
      }
    }
    container.innerHTML = html;
    const cells = $$(".sx", container);
    stagger(cells, "on", 0, 14);
    const note = document.createElement("p");
    note.className = "stampnote";
    note.innerHTML = '<span class="stamp stamp--verified">✅ VERIFIED, the real result</span> no framework survives all thirteen — each is <strong>KILLED</strong> by at least one condition, and <strong>UNKNOWN</strong> wherever no verifier has run. Cells shown are the three verdict kinds; the live board is generated at <a href="https://github.com/robmitchellengineering-hub/pacland/blob/main/docs/energy-sextant.md" target="_blank" rel="noopener">pacland/docs/energy-sextant.md</a>.';
    container.after(note);
  }

  /* ---------- A/B trial loop ---------- */
  function abLoop(container) {
    const A = $(".ab-slot__dot--a", container), B = $(".ab-slot__dot--b", container), V = $("#abVerdict");
    let stopped = false, timer, i = 0;
    function set(a, bState, txt) {
      A.className = "ab-slot__dot ab-slot__dot--a" + (a ? " on" : "");
      B.className = "ab-slot__dot ab-slot__dot--b" + (bState === "off" ? "" : " " + bState);
      V.textContent = txt;
    }
    const steps = [
      () => set(true, "trial", "healthy A · trying B…"),
      () => set(true, "trial", "B on trial…"),
      () => set(false, "good", "B healthy → committed ✓"),
      () => set(true, "trial", "reset · trying B again…"),
      () => set(true, "trial", "B on trial…"),
      () => set(true, "fail", "B unhealthy → falling back to A ✓")
    ];
    const waits = [1200, 1100, 1300, 1200, 1100, 1600];
    function run() {
      if (stopped) return;
      steps[i % steps.length]();
      timer = setTimeout(() => { i++; run(); }, waits[i % waits.length]);
    }
    run();
    return () => { stopped = true; clearTimeout(timer); };
  }

  /* ---------- band ---------- */
  function band(container) {
    const observed = $(".band__observed", container), marker = $("#bandMarker");
    // axis 2.0 → 4.2 ; observed 2.6–3.9 ; marker 3.08
    const lo = ((2.6 - 2.0) / 2.2) * 100, hi = ((3.9 - 2.0) / 2.2) * 100, m = ((3.08 - 2.0) / 2.2) * 100;
    setTimeout(() => {
      observed.style.left = lo + "%"; observed.style.width = (hi - lo) + "%";
      marker.style.left = m + "%"; marker.style.opacity = "1";
    }, 150);
  }

  /* ---------- Tsirelson bound ---------- */
  function tbound(container) {
    setTimeout(() => {
      $(".tbound__classical", container).style.width = "50%";
      $(".tbound__quantum", container).style.width = "20.7%";
      $(".tbound__pr", container).style.width = "29.3%";
    }, 150);
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1400, t0 = performance.now();
    function fmt(v) {
      if (decimals) return prefix + v.toFixed(decimals) + suffix;
      return prefix + Math.round(v).toLocaleString("en-US") + suffix;
    }
    function frame(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- observer wiring ---------- */
  const stops = [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      const anim = el.getAttribute("data-anim");
      if (anim === "spine") { stagger($$(".spine__node", el), "on", 0, 220); }
      else if (anim === "pipeline") { stagger($$(".pipeline__step", el), "on", 0, 180); }
      else if (anim === "chain") { stagger($$(".chain__node", el), "on", 0, 220); }
      else if (anim === "stars") { if (!reduceMotion) stops.push(stars(el)); }
      else if (anim === "geomesh") { stops.push(geomesh(el)); }

      else if (anim === "ab") { if (!reduceMotion) stops.push(abLoop(el)); }
      else if (anim === "band") { band(el); }
      else if (anim === "tbound") { tbound(el); }
      else if (anim === "sextant") { sextant(el); }
      else if (anim === "cert") { $(".cert__card", el).classList.add("on"); }
    });
  }, { threshold: 0.22 });

  $$("[data-anim]").forEach((el) => io.observe(el));

  // climate chart (id, not data-anim)
  const cc = $("#climateChart");
  if (cc) {
    const reveal = climateChart(cc);
    const ccio = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { ccio.unobserve(cc); reveal(); } });
    }, { threshold: 0.2 });
    ccio.observe(cc);
  }

  // count-ups
  const cio = new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) { cio.unobserve(en.target); countUp(en.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  // progress bar
  const pb = $("#progressBar");
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    pb.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
