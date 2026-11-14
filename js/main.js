/* Sithum Aluvihare — portfolio interactions (no dependencies) */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const mod = (k, n) => ((k % n) + n) % n;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----------------------------------------------------------
     Image slots
     Each .slot has data-src="assets/images/name" (no extension).
     If name.jpg / .jpeg / .png / .webp exists it is shown,
     otherwise a labelled placeholder stays in place.
     ---------------------------------------------------------- */
  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>';

  $$('.slot').forEach((slot) => {
    const base = slot.dataset.src;
    const label = slot.dataset.label || 'Image';
    const hint = slot.dataset.hint ? `<small>${slot.dataset.hint}</small>` : '';
    slot.innerHTML = `<div class="slot-ph">${ICON}<strong>${label}</strong><code>${base}.jpg</code>${hint}</div>`;

    let i = 0;
    const tryNext = () => {
      if (i >= EXTENSIONS.length) return;
      const img = new Image();
      img.alt = label;
      img.decoding = 'async';
      img.onload = () => {
        slot.innerHTML = '';
        slot.appendChild(img);
        slot.classList.add('is-filled');
      };
      img.onerror = () => { i += 1; tryNext(); };
      img.src = `${base}.${EXTENSIONS[i]}`;
    };
    tryNext();
  });

  /* ---------------------------------------------------------- nav */
  const nav = $('#nav');
  const menu = $('#menu');
  const toggle = $('#navToggle');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Placeholder links should not jump the page to the top.
  $$('a[data-todo][href="#"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  /* ---------------------------------------------------------- typed roles */
  const typedEl = $('#typed');
  const ROLES = ['embedded & IoT systems', 'custom PCB design', 'FPGA & digital design', 'multi-drone control', 'full-stack web apps'];
  if (typedEl && !reduceMotion) {
    let word = 0;
    let len = ROLES[0].length;
    let deleting = true;
    const step = () => {
      const text = ROLES[word];
      len += deleting ? -1 : 1;
      typedEl.textContent = text.slice(0, len);
      let delay = deleting ? 32 : 62;
      if (!deleting && len === text.length) { deleting = true; delay = 1900; }
      else if (deleting && len === 0) { deleting = false; word = (word + 1) % ROLES.length; delay = 320; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2400);
  }

  /* ---------------------------------------------------------- reveal, scramble, counters */
  const scramble = (el) => {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    const glyphs = '01<>/[]{}#%&$+=';
    let frame = 0;
    const tick = () => {
      let out = '';
      for (let i = 0; i < final.length; i += 1) {
        if (final[i] === ' ') out += ' ';
        else out += i < frame / 2 ? final[i] : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      frame += 1;
      if (frame / 2 <= final.length) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  };

  const countUp = (el) => {
    const target = Number(el.dataset.count) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = clamp((now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-in');
      if (el.hasAttribute('data-scramble') && !reduceMotion) scramble(el);
      $$('[data-count]', el).forEach(countUp);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-scramble]').forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------- project filters + tilt */
  const filterButtons = $$('.filters button');
  const projects = $$('.project');
  filterButtons.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    // A project can list several categories, e.g. data-cat="electronics networking".
    projects.forEach((p) => p.classList.toggle('is-hidden', f !== 'all' && !p.dataset.cat.split(' ').includes(f)));
  }));

  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const max = card.closest('.project-wide') ? 2.5 : 6;
        card.style.transform = `rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     Hero: animated PCB traces with travelling signal pulses
     ---------------------------------------------------------- */
  const pcb = (() => {
    const canvas = $('#pcb');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const bg = document.createElement('canvas');
    const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    let W = 0, H = 0, dpr = 1, traces = [], running = false, last = 0;

    const build = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (!W || !H) return;
      canvas.width = bg.width = Math.round(W * dpr);
      canvas.height = bg.height = Math.round(H * dpr);

      const G = 24;
      const count = Math.min(90, Math.round((W * H) / 20000));
      traces = [];
      for (let n = 0; n < count; n += 1) {
        let x = Math.round((Math.random() * W) / G) * G;
        let y = Math.round((Math.random() * H) / G) * G;
        let d = (Math.random() * 8) | 0;
        const pts = [[x, y]];
        const segs = 2 + ((Math.random() * 4) | 0);
        for (let s = 0; s < segs; s += 1) {
          const len = (2 + ((Math.random() * 7) | 0)) * G;
          x += DIRS[d][0] * len;
          y += DIRS[d][1] * len;
          pts.push([x, y]);
          d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
        }
        const lens = [];
        let total = 0;
        for (let k = 1; k < pts.length; k += 1) {
          const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
          lens.push(l);
          total += l;
        }
        traces.push({
          pts, lens, total,
          pos: Math.random() * total,
          speed: 50 + Math.random() * 110,
          live: Math.random() < 0.55,
          copper: Math.random() < 0.3,
        });
      }

      // Static copper layer, drawn once.
      const b = bg.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.clearRect(0, 0, W, H);
      b.lineJoin = 'round';
      b.lineWidth = 1.1;
      b.strokeStyle = 'rgba(224,164,88,0.2)';
      traces.forEach((t) => {
        b.beginPath();
        t.pts.forEach(([px, py], k) => (k ? b.lineTo(px, py) : b.moveTo(px, py)));
        b.stroke();
      });
      traces.forEach((t) => {
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(([px, py]) => {
          b.beginPath();
          b.arc(px, py, 3.2, 0, Math.PI * 2);
          b.fillStyle = '#05080a';
          b.fill();
          b.strokeStyle = 'rgba(224,164,88,0.45)';
          b.stroke();
        });
      });
      draw(0);
    };

    const pointAt = (t, d) => {
      let rest = d;
      for (let k = 0; k < t.lens.length; k += 1) {
        if (rest <= t.lens[k]) {
          const f = rest / t.lens[k];
          return [lerp(t.pts[k][0], t.pts[k + 1][0], f), lerp(t.pts[k][1], t.pts[k + 1][1], f)];
        }
        rest -= t.lens[k];
      }
      return t.pts[t.pts.length - 1];
    };

    const draw = (dt) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bg, 0, 0, W, H);
      traces.forEach((t) => {
        if (!t.live) return;
        t.pos += t.speed * dt;
        if (t.pos > t.total + 70) t.pos = -Math.random() * 500;
        const rgb = t.copper ? '255,196,120' : '61,255,162';
        for (let k = 0; k < 12; k += 1) {
          const d = t.pos - k * 5;
          if (d < 0 || d > t.total) continue;
          const [px, py] = pointAt(t, d);
          ctx.beginPath();
          ctx.arc(px, py, k === 0 ? 2.2 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${(1 - k / 12) * 0.9})`;
          if (k === 0) { ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 12; }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      requestAnimationFrame(loop);
    };

    let resizeTimer;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 180); });
    new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && !reduceMotion;
      if (visible && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
      else if (!visible) running = false;
    }).observe(canvas);

    build();
    return { build };
  })();

  /* ----------------------------------------------------------
     Domains: oscilloscope whose waveform morphs with scroll
     electrical sine -> analog signal -> AM carrier -> bits -> packets
     ---------------------------------------------------------- */
  const STAGES = [
    { name: 'ELECTRICAL', val: '230 V · 50 Hz', div: '5 ms/div', rgb: [255, 180, 84] },
    { name: 'ELECTRONICS', val: 'Analog · ADC sampled', div: '200 µs/div', rgb: [61, 255, 162] },
    { name: 'TELECOM', val: 'AM · carrier + envelope', div: '10 µs/div', rgb: [199, 146, 255] },
    { name: 'SOFTWARE', val: 'UART · 115200 baud', div: '8.7 µs/bit', rgb: [255, 122, 144] },
    { name: 'NETWORKING', val: 'TCP/IP · packets', div: '1 frame/div', rgb: [76, 201, 255] },
  ];
  const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0];
  const TAU = Math.PI * 2;

  const wave = (i, x, t) => {
    switch (i) {
      case 0: return 0.8 * Math.sin(TAU * (2 * x - t * 0.35));
      case 1: {
        const a = TAU * (3 * x - t * 0.45);
        return 0.52 * Math.sin(a) + 0.22 * Math.sin(3 * a + 0.6) + 0.1 * Math.sin(7 * a + 1.3);
      }
      case 2: return 0.82 * (0.55 + 0.45 * Math.sin(TAU * (1.5 * x - t * 0.22))) * Math.sin(TAU * (26 * x - t * 1.6));
      case 3: return BITS[mod(Math.floor(x * 16 + t * 1.2), BITS.length)] ? 0.55 : -0.55;
      default: return BITS[mod(Math.floor(x * 24 + t * 2.4), BITS.length)] ? 0.42 : -0.42;
    }
  };

  const chainEl = $('#domains');
  const scope = (() => {
    const canvas = $('#scope');
    if (!canvas || !chainEl) return null;
    const ctx = canvas.getContext('2d');
    const stageEls = $$('.stage');
    const stepEls = $$('#scopeSteps i');
    const scopeBox = $('.scope');
    const nameEl = $('#scopeName');
    const valEl = $('#scopeVal');
    const divEl = $('#scopeDiv');
    const N = STAGES.length;
    let W = 0, H = 0, dpr = 1, progress = 0, active = -1, running = false;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    new ResizeObserver(size).observe(canvas);

    const setActive = (i) => {
      if (i === active) return;
      active = i;
      const s = STAGES[i];
      stageEls.forEach((el, k) => el.classList.toggle('is-active', k === i));
      stepEls.forEach((el, k) => el.classList.toggle('is-on', k <= i));
      scopeBox.style.setProperty('--c', `rgb(${s.rgb.join(',')})`);
      nameEl.textContent = s.name;
      valEl.textContent = s.val;
      divEl.textContent = s.div;
    };

    const draw = (t) => {
      if (!W || !H) return;
      const seg = Math.min(N - 1e-6, progress * N);
      const cur = Math.floor(seg);
      const nxt = Math.min(N - 1, cur + 1);
      const blend = cur < N - 1 ? smooth(clamp((seg - cur - 0.7) / 0.3)) : 0;
      setActive(blend > 0.5 ? nxt : cur);
      const weight = (i) => (cur === nxt ? (i === cur ? 1 : 0) : i === cur ? 1 - blend : i === nxt ? blend : 0);
      const rgb = STAGES[cur].rgb.map((v, k) => Math.round(lerp(v, STAGES[nxt].rgb[k], blend)));
      const color = `rgb(${rgb.join(',')})`;
      const rgba = (a) => `rgba(${rgb.join(',')},${a})`;
      const mid = H / 2;
      const amp = H * 0.37;
      const y = (x) => mid - amp * lerp(wave(cur, x, t), wave(nxt, x, t), blend);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // graticule
      ctx.lineWidth = 1;
      for (let c = 0; c <= 10; c += 1) {
        ctx.strokeStyle = c === 5 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.055)';
        const gx = Math.round((c / 10) * W) + 0.5;
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let r = 0; r <= 8; r += 1) {
        ctx.strokeStyle = r === 4 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.055)';
        const gy = Math.round((r / 8) * H) + 0.5;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      for (let k = 0; k <= 50; k += 1) {
        const gx = (k / 50) * W;
        ctx.beginPath(); ctx.moveTo(gx, mid - 3); ctx.lineTo(gx, mid + 3); ctx.stroke();
      }

      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.textBaseline = 'middle';

      // overlay: mains peak markers
      let w = weight(0);
      if (w > 0.01) {
        ctx.globalAlpha = w;
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = rgba(0.5);
        [-1, 1].forEach((sgn) => {
          const py = mid - sgn * amp * 0.8;
          ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(0.9);
        ctx.textAlign = 'left';
        ctx.fillText('+325 V pk', 10, mid - amp * 0.8 - 11);
        ctx.fillText('-325 V pk', 10, mid + amp * 0.8 + 12);
        ctx.globalAlpha = 1;
      }

      // overlay: AM envelope
      w = weight(2);
      if (w > 0.01) {
        ctx.globalAlpha = w * 0.75;
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        [-1, 1].forEach((sgn) => {
          ctx.beginPath();
          for (let px = 0; px <= W; px += 4) {
            const e = 0.82 * (0.55 + 0.45 * Math.sin(TAU * (1.5 * (px / W) - t * 0.22)));
            const py = mid - sgn * amp * e;
            if (px) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'right';
        ctx.fillText('envelope = message', W - 10, 16);
        ctx.globalAlpha = 1;
      }

      // overlay: bit values
      w = weight(3);
      if (w > 0.01) {
        ctx.globalAlpha = w;
        const off = t * 1.2;
        const first = Math.floor(off);
        ctx.textAlign = 'center';
        for (let k = first; k <= first + 16; k += 1) {
          const x0 = ((k - off) / 16) * W;
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.beginPath(); ctx.moveTo(x0, H * 0.14); ctx.lineTo(x0, H * 0.86); ctx.stroke();
          ctx.fillStyle = rgba(0.95);
          ctx.fillText(String(BITS[mod(k, BITS.length)]), x0 + W / 32, H * 0.1);
        }
        ctx.globalAlpha = 1;
      }

      // overlay: packet frames
      w = weight(4);
      if (w > 0.01) {
        ctx.globalAlpha = w;
        const off = t * 2.4;
        const first = Math.floor(off);
        const cell = W / 24;
        const top = mid - amp * 0.42 - 26;
        const hgt = amp * 0.84 + 52;
        ctx.textAlign = 'left';
        for (let k = first - 8; k <= first + 24; k += 1) {
          if (mod(k, 8) !== 0) continue;
          const x0 = (k - off) * cell + 4;
          const wd = cell * 8 - 8;
          ctx.fillStyle = rgba(0.16);
          ctx.fillRect(x0, top, cell * 2, hgt);
          ctx.strokeStyle = rgba(0.85);
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x0, top, wd, hgt);
          ctx.beginPath(); ctx.moveTo(x0 + cell * 2, top); ctx.lineTo(x0 + cell * 2, top + hgt); ctx.stroke();
          ctx.fillStyle = rgba(0.95);
          ctx.fillText('HDR', x0 + 6, top + 12);
          ctx.fillText('PAYLOAD', x0 + cell * 2 + 6, top + 12);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText(`PKT 0x${mod(k / 8, 256).toString(16).toUpperCase().padStart(2, '0')}`, x0, top - 12);
        }
        ctx.globalAlpha = 1;
      }

      // trace: soft glow pass, then crisp pass
      const path = () => {
        ctx.beginPath();
        for (let px = 0; px <= W; px += 1) {
          const py = y(px / W);
          if (px) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
      };
      ctx.lineJoin = 'round';
      ctx.strokeStyle = rgba(0.16);
      ctx.lineWidth = 7;
      path(); ctx.stroke();
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      path(); ctx.stroke();
      ctx.shadowBlur = 0;

      // overlay: ADC sample points
      w = weight(1);
      if (w > 0.01) {
        ctx.globalAlpha = w;
        for (let k = 1; k < 32; k += 1) {
          const px = (k / 32) * W;
          const py = y(k / 32);
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, mid); ctx.lineTo(px, py); ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'right';
        ctx.fillText('ADC samples', W - 10, 16);
        ctx.globalAlpha = 1;
      }
    };

    const loop = (now) => {
      if (!running) return;
      draw(reduceMotion ? 0 : now / 1000);
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
      else if (!entry.isIntersecting) running = false;
    }).observe(chainEl);

    // Clicking a stage title scrolls to that part of the chain.
    stageEls.forEach((el, i) => {
      const btn = $('button', el);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const top = chainEl.getBoundingClientRect().top + scrollY;
        const span = chainEl.offsetHeight - innerHeight;
        scrollTo({ top: top + ((i + 0.3) / N) * span, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    size();
    setActive(0);
    return { setProgress: (p) => { progress = p; } };
  })();

  /* ----------------------------------------------------------
     One scroll handler drives everything position-based
     ---------------------------------------------------------- */
  const progressBar = $('#progressBar');
  const heroCopy = $('#heroCopy');
  const timeline = $('#timeline');
  const timelineFill = $('#timelineFill');
  const timelineItems = $$('.t-item');
  const reel = $('#reel');
  const reelRows = $$('.reel-row');
  const sections = $$('main section[id]');
  const menuLinks = $$('.menu a');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    nav.classList.toggle('is-scrolled', y > 30);

    if (heroCopy && !reduceMotion && y < vh * 1.2) {
      heroCopy.style.transform = `translateY(${y * 0.14}px)`;
      heroCopy.style.opacity = String(clamp(1 - y / (vh * 0.85)));
    }

    if (scope && chainEl) {
      const r = chainEl.getBoundingClientRect();
      scope.setProgress(clamp(-r.top / Math.max(1, r.height - vh)));
    }

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const line = vh * 0.62;
      timelineFill.style.transform = `scaleY(${clamp((line - r.top) / r.height)})`;
      timelineItems.forEach((item) => {
        item.classList.toggle('is-on', item.getBoundingClientRect().top + 28 < line);
      });
    }

    if (reel) {
      const r = reel.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh + r.height));
      reelRows.forEach((row) => {
        const travel = Math.max(0, row.scrollWidth - innerWidth);
        const f = row.dataset.dir === '1' ? 1 - t : t;
        row.style.transform = `translate3d(${-f * travel}px,0,0)`;
      });
    }

    let current = '';
    sections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= vh * 0.4 && r.bottom > vh * 0.4) current = s.id;
    });
    menuLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${current}`));
  };

  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate);
  addEventListener('load', requestUpdate);
  update();
})();
