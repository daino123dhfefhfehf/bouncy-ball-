// ==========================================
// MOTOR DE PARTÍCULAS · estilo Unity (Shuriken) para canvas 2D
// - Pool de partículas (sin basura), sprites suaves cacheados y teñidos
// - Mezcla aditiva (luz) y normal (humo, escombros), capas detrás/delante de la bola
// - Color en 3 pasos, tamaño y opacidad en el tiempo, turbulencia, arrastre, gravedad
// - Chispas con estela, escombros con rebote, arcos eléctricos, órbitas, sub-emisores
// - Temblor de pantalla, destello de pantalla y calidad adaptativa según los FPS
// ==========================================
const FX = (() => {
    'use strict';
    const PI2 = Math.PI * 2, MAX = 2600;
    const act = [], libres = [], cacheSpr = new Map(), cacheCol = new Map(), accs = {};
    const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let q = 1, tiempo = 0, sacudida = 0, flashA = 0, flashC = [255, 255, 255], mediaDt = 0.016, suelo = 708, canvasEl = null;
    const tmp = [0, 0, 0];

    const rnd = (a, b) => a + Math.random() * (b - a);
    const R = (v, d) => v === undefined ? d : (Array.isArray(v) ? rnd(v[0], v[1]) : v);
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
    const hs = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
    const mix = (a, b, t) => { tmp[0] = a[0] + (b[0] - a[0]) * t; tmp[1] = a[1] + (b[1] - a[1]) * t; tmp[2] = a[2] + (b[2] - a[2]) * t; return tmp; };

    function rgb(c, def) {
        if (Array.isArray(c)) return c;
        if (typeof c !== 'string') return def || [255, 255, 255];
        let v = cacheCol.get(c);
        if (v) return v;
        let h = c[0] === '#' ? c.slice(1) : c;
        if (h.length === 3) h = h.split('').map(x => x + x).join('');
        const n = parseInt(h.slice(0, 6), 16);
        if (isNaN(n)) return def || [255, 255, 255];
        v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        cacheCol.set(c, v);
        return v;
    }
    function hsl(h, s, l) {
        h = ((h % 360) + 360) % 360 / 360;
        const a = s * Math.min(l, 1 - l);
        const f = n => { const k = (n + h * 12) % 12; return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255; };
        return [f(0), f(8), f(4)];
    }

    // ---------- Sprites suaves (se dibujan una vez por color y se reutilizan) ----------
    function sprite(forma, c) {
        const r = c[0] >> 4, g = c[1] >> 4, b = c[2] >> 4, key = forma + r + '_' + g + '_' + b;
        let cv = cacheSpr.get(key);
        if (cv) return cv;
        const S = 64, h = S / 2;
        cv = document.createElement('canvas'); cv.width = cv.height = S;
        const x = cv.getContext('2d'), col = (a) => `rgba(${Math.min(255, r * 17)},${Math.min(255, g * 17)},${Math.min(255, b * 17)},${a})`;
        if (forma === 'glow') {
            const gr = x.createRadialGradient(h, h, 0, h, h, h);
            gr.addColorStop(0, col(1)); gr.addColorStop(0.25, col(0.55)); gr.addColorStop(0.6, col(0.14)); gr.addColorStop(1, col(0));
            x.fillStyle = gr; x.fillRect(0, 0, S, S);
        } else if (forma === 'disco') {
            const gr = x.createRadialGradient(h, h, 0, h, h, h);
            gr.addColorStop(0, col(1)); gr.addColorStop(0.7, col(1)); gr.addColorStop(1, col(0));
            x.fillStyle = gr; x.fillRect(0, 0, S, S);
        } else if (forma === 'humo') {
            for (let i = 0; i < 9; i++) {
                const a = hs(i + 1) * PI2, d = hs(i + 9) * h * 0.38, rr = h * (0.35 + hs(i + 17) * 0.3), px = h + Math.cos(a) * d, py = h + Math.sin(a) * d;
                const gr = x.createRadialGradient(px, py, 0, px, py, rr);
                gr.addColorStop(0, col(0.4)); gr.addColorStop(1, col(0));
                x.fillStyle = gr; x.fillRect(0, 0, S, S);
            }
        } else if (forma === 'anillo') {
            const gr = x.createRadialGradient(h, h, 0, h, h, h);
            gr.addColorStop(0, col(0)); gr.addColorStop(0.6, col(0)); gr.addColorStop(0.82, col(0.95)); gr.addColorStop(0.93, col(0.35)); gr.addColorStop(1, col(0));
            x.fillStyle = gr; x.fillRect(0, 0, S, S);
        } else if (forma === 'estrella') {
            const gr = x.createRadialGradient(h, h, 0, h, h, h * 0.55);
            gr.addColorStop(0, col(1)); gr.addColorStop(0.4, col(0.4)); gr.addColorStop(1, col(0));
            x.fillStyle = gr; x.fillRect(0, 0, S, S);
            x.fillStyle = col(1); x.beginPath(); x.moveTo(h, 1);
            x.quadraticCurveTo(h, h, S - 1, h); x.quadraticCurveTo(h, h, h, S - 1); x.quadraticCurveTo(h, h, 1, h); x.quadraticCurveTo(h, h, h, 1); x.fill();
        }
        cacheSpr.set(key, cv);
        return cv;
    }

    // ---------- Emisor ----------
    // d: forma, add, capa(0 detrás/1 delante), ang, v, vida, s0, s1, c0, c1, c2, cs, a0, a1, gy, gx, drag, turb, stretch,
    //    rot, vr, suelo, reb, est(sub-emisor), orb, pr(radio de aparición), off, her(herencia de velocidad)
    // ov: { u: escala, r: radio de referencia, bvx, bvy }
    function cuenta(n) { const v = n * q, f = Math.floor(v); return f + (Math.random() < v - f ? 1 : 0); }

    function emit(d, x, y, n, ov, raw) {
        const cnt = raw ? n : cuenta(n), u = (ov && ov.u) || 1, rr = (ov && ov.r) || 1;
        for (let i = 0; i < cnt; i++) {
            if (act.length >= MAX) return;
            const p = libres.pop() || {};
            const ang = R(d.ang, rnd(0, PI2)), v = R(d.v, 0) * u;
            let px = x, py = y;
            if (d.pr) { const a = rnd(0, PI2), rad = Math.sqrt(Math.random()) * d.pr * rr; px += Math.cos(a) * rad; py += Math.sin(a) * rad; }
            if (d.off) { px += d.off[0] * rr; py += d.off[1] * rr; }
            p.x = px; p.y = py;
            p.vx = Math.cos(ang) * v + (ov && d.her ? ov.bvx * d.her : 0);
            p.vy = Math.sin(ang) * v + (ov && d.her ? ov.bvy * d.her : 0);
            p.max = Math.max(0.05, R(d.vida, 0.5)); p.t = 0;
            p.s0 = R(d.s0, 6) * u; p.s1 = R(d.s1, 0) * u;
            if (d.cs) { const c = rgb(d.cs[Math.floor(Math.random() * d.cs.length)]); p.c0 = c; p.c1 = c; p.c2 = null; }
            else { p.c0 = rgb(d.c0); p.c1 = d.c1 ? rgb(d.c1) : p.c0; p.c2 = d.c2 ? rgb(d.c2) : null; }
            p.a0 = d.a0 === undefined ? 0.8 : d.a0; p.a1 = d.a1 === undefined ? p.a0 : d.a1;
            p.fin = d.fin === undefined ? 0.03 : d.fin; p.fo = d.fo === undefined ? 0.65 : d.fo;
            p.forma = d.forma || 'glow'; p.add = d.add !== false; p.capa = d.capa === undefined ? 1 : d.capa;
            p.gy = d.gy || 0; p.gx = d.gx || 0; p.drag = d.drag === undefined ? 1 : d.drag;
            p.turb = d.turb || 0; p.tf = d.tf || 3; p.sd = Math.random() * 100;
            p.stretch = d.stretch || 0; p.rot = R(d.rot, rnd(0, PI2)); p.vr = R(d.vr, 0); p.eo = !!d.eo;
            p.suelo = d.suelo ? (d.suelo === true ? suelo : d.suelo) : undefined; p.reb = d.reb === undefined ? 0.4 : d.reb;
            p.est = d.est || null; p.acc = 0;
            p.pts = d.pts || null; p.nx = d.nx || 0; p.ny = d.ny || 0; p.jit = d.jit || 0;
            if (d.orb) {
                const rad = R(d.orb.rad, 60) * u;
                p.orb = { cx: x, cy: y, ang: rnd(0, PI2), rad, dr: d.orb.auto ? -rad / p.max * 1.05 : R(d.orb.dr, 0) * u, w: R(d.orb.w, 6) };
            } else p.orb = null;
            act.push(p);
        }
    }

    // ---------- Actualización ----------
    function actualizar(dt) {
        dt = Math.min(dt, 0.05);
        tiempo += dt;
        mediaDt = mediaDt * 0.95 + dt * 0.05;
        q = mediaDt > 0.026 ? Math.max(0.35, q - 0.01) : (mediaDt < 0.019 ? Math.min(1, q + 0.004) : q);
        let w = 0;
        for (let i = 0; i < act.length; i++) {
            const p = act[i];
            p.t += dt;
            if (p.t >= p.max) { libres.push(p); continue; }
            if (p.orb) {
                const o = p.orb;
                o.ang += o.w * dt; o.rad = Math.max(0, o.rad + o.dr * dt);
                p.x = o.cx + Math.cos(o.ang) * o.rad; p.y = o.cy + Math.sin(o.ang) * o.rad;
            } else {
                const dr = Math.exp(-p.drag * dt);
                p.vx = p.vx * dr + p.gx * dt; p.vy = p.vy * dr + p.gy * dt;
                if (p.turb) { const a = tiempo * p.tf + p.sd; p.vx += Math.sin(a) * p.turb * dt; p.vy += Math.cos(a * 1.3) * p.turb * 0.6 * dt; }
                p.x += p.vx * dt; p.y += p.vy * dt;
                if (p.suelo !== undefined && p.y > p.suelo) {
                    p.y = p.suelo;
                    if (p.vy > 60 && p.reb > 0) { p.vy *= -p.reb; p.vx *= 0.75; p.vr *= 0.6; } else { p.vy = 0; p.vx *= 0.82; p.vr *= 0.8; }
                }
            }
            p.rot += p.vr * dt;
            if (p.est) {
                p.acc += p.est.rate * dt;
                while (p.acc >= 1) { p.acc -= 1; emit(p.est.d, p.x, p.y, 1, null, true); }
            }
            act[w++] = p;
        }
        act.length = w;
        sacudida *= Math.pow(0.002, dt);
        flashA = Math.max(0, flashA - dt * 3.2);
        if (canvasEl) {
            if (sacudida > 0.35) canvasEl.style.translate = `${((Math.random() - 0.5) * 2 * sacudida).toFixed(1)}px ${((Math.random() - 0.5) * 2 * sacudida).toFixed(1)}px`;
            else if (canvasEl.style.translate) canvasEl.style.translate = '';
        }
    }

    // ---------- Dibujo ----------
    function dibujarP(g, p) {
        const k = p.t / p.max;
        let a = lerp(p.a0, p.a1, k) * Math.min(1, p.t / p.fin);
        if (k > p.fo) a *= (1 - k) / (1 - p.fo);
        if (a <= 0.004) return;
        const ke = p.eo ? 1 - (1 - k) * (1 - k) : k, s = Math.max(0.2, lerp(p.s0, p.s1, ke));
        const c = p.c2 ? (k < 0.5 ? mix(p.c0, p.c2, k * 2) : mix(p.c2, p.c1, (k - 0.5) * 2)) : mix(p.c0, p.c1, k);
        g.globalAlpha = a > 1 ? 1 : a;
        const f = p.forma;
        if (f === 'glow' || f === 'disco' || f === 'anillo') {
            const sp = sprite(f, c);
            if (p.stretch > 0) {
                const L = 1 + p.stretch * clamp(Math.hypot(p.vx, p.vy) / 400, 0, 1.5), an = Math.atan2(p.vy, p.vx);
                g.translate(p.x, p.y); g.rotate(an); g.drawImage(sp, -s * L, -s, s * 2 * L, s * 2); g.rotate(-an); g.translate(-p.x, -p.y);
            } else g.drawImage(sp, p.x - s, p.y - s, s * 2, s * 2);
        } else if (f === 'humo' || f === 'estrella') {
            const sp = sprite(f, c);
            g.translate(p.x, p.y); g.rotate(p.rot); g.drawImage(sp, -s, -s, s * 2, s * 2); g.rotate(-p.rot); g.translate(-p.x, -p.y);
        } else if (f === 'pixel') {
            g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            g.fillRect(Math.round(p.x - s), Math.round(p.y - s), Math.round(s * 2), Math.round(s * 2));
        } else if (f === 'casco') {
            g.translate(p.x, p.y); g.rotate(p.rot);
            g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            g.beginPath();
            for (let i = 0; i < 5; i++) { const an = i / 5 * PI2, rr = s * (0.65 + hs(p.sd + i) * 0.6); i ? g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
            g.closePath(); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.stroke();
            g.rotate(-p.rot); g.translate(-p.x, -p.y);
        } else if (f === 'esquirla') {
            g.translate(p.x, p.y); g.rotate(p.rot);
            g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            g.beginPath(); g.moveTo(s * 1.5, 0); g.lineTo(-s * 0.8, -s * 0.65); g.lineTo(-s * 0.5, s * 0.75); g.closePath(); g.fill();
            g.fillStyle = 'rgba(255,255,255,0.55)';
            g.beginPath(); g.moveTo(s * 1.5, 0); g.lineTo(-s * 0.8, -s * 0.65); g.lineTo(-s * 0.1, -s * 0.05); g.closePath(); g.fill();
            if (Math.sin(p.t * 22 + p.sd) > 0.88) { g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(s * 0.3, -s * 0.1, s * 0.5, 0, PI2); g.fill(); g.globalCompositeOperation = 'source-over'; }
            g.rotate(-p.rot); g.translate(-p.x, -p.y);
        } else if (f === 'hoja') {
            g.translate(p.x, p.y); g.rotate(p.rot);
            g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            g.beginPath(); g.ellipse(0, 0, s * 1.7, Math.max(0.4, s * 0.7 * Math.abs(Math.cos(p.t * 7 + p.sd))), 0, 0, PI2); g.fill();
            g.rotate(-p.rot); g.translate(-p.x, -p.y);
        } else if (f === 'arco') {
            const pts = p.pts, n = pts.length, fr = Math.floor(tiempo * 40), col = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            g.lineCap = 'round'; g.lineJoin = 'round';
            for (let pass = 0; pass < 3; pass++) {
                g.strokeStyle = pass === 2 ? '#ffffff' : col;
                g.lineWidth = pass === 0 ? s * 3.2 : (pass === 1 ? s * 1.3 : s * 0.5);
                g.globalAlpha = (pass === 0 ? 0.18 : (pass === 1 ? 0.6 : 1)) * (a > 1 ? 1 : a);
                g.beginPath();
                for (let i = 0; i < n; i++) {
                    const j = i > 0 && i < n - 1 ? (hs(fr * 7 + i * 3 + p.sd) - 0.5) * p.jit : 0;
                    const X = pts[i][0] + p.nx * j, Y = pts[i][1] + p.ny * j;
                    i ? g.lineTo(X, Y) : g.moveTo(X, Y);
                }
                g.stroke();
            }
        }
    }

    function dibujar(g, capa) {
        if (!g) return;
        g.save();
        let modo = '';
        for (let i = 0; i < act.length; i++) {
            const p = act[i];
            if (p.capa !== capa) continue;
            const m = p.add ? 'lighter' : 'source-over';
            if (m !== modo) { g.globalCompositeOperation = m; modo = m; }
            dibujarP(g, p);
        }
        if (capa === 1 && flashA > 0.01) {
            g.globalCompositeOperation = 'lighter';
            g.globalAlpha = 1;
            g.fillStyle = `rgba(${flashC[0] | 0},${flashC[1] | 0},${flashC[2] | 0},${flashA.toFixed(3)})`;
            g.fillRect(0, 0, g.canvas.width, g.canvas.height);
        }
        g.restore();
    }

    // ---------- Efectos de impacto ----------
    function sacudir(v) { if (!reducido) sacudida = Math.min(22, sacudida + v); }
    function destello(a, col) { flashA = Math.min(0.5, flashA + a * (reducido ? 0.3 : 1)); flashC = rgb(col); }

    // Impacto de un clic: destello, onda, chispas y motas
    function golpe(x, y, main, hi, dark, esc) {
        const ov = { u: esc || 1 }, m = rgb(main, [140, 150, 255]), h = rgb(hi, [255, 255, 255]), k = rgb(dark, [30, 30, 90]);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: m, vida: 0.16, s0: 18, s1: 74, a0: 0.9, drag: 0 }, x, y, 1, ov, true);
        emit({ forma: 'anillo', c0: h, c1: m, vida: [0.26, 0.34], s0: 8, s1: 76, a0: 0.8, eo: true, drag: 0 }, x, y, 1, ov, true);
        emit({ forma: 'glow', c0: [255, 255, 255], c2: m, c1: k, v: [140, 460], vida: [0.22, 0.5], s0: [2.5, 4.5], s1: 0.7, stretch: 5, gy: 520, drag: 2.2 }, x, y, 9, ov);
        emit({ forma: 'glow', c0: h, c1: m, v: [20, 110], vida: [0.4, 0.85], s0: [4, 8], s1: 0, drag: 2.5, gy: -30, a0: 0.6, turb: 40 }, x, y, 5, ov);
    }

    // Explosión: destello, bola de fuego, humo, chispas, escombros, onda de choque y brasas
    function explosion(x, y, o) {
        o = o || {};
        const E = o.esc || 1, col = rgb(o.col, [255, 122, 24]), ov = { u: E }, fuerza = Math.min(1.7, E);
        const claro = [lerp(col[0], 255, 0.6), lerp(col[1], 255, 0.6), lerp(col[2], 255, 0.6)], oscuro = [col[0] * 0.18, col[1] * 0.12, col[2] * 0.12];
        emit({ forma: 'glow', c0: [255, 255, 255], c1: col, vida: 0.2, s0: 40, s1: 210, a0: 1, drag: 0, eo: true }, x, y, 1, ov, true);
        emit({ forma: 'glow', c0: claro, c2: col, c1: oscuro, v: [40, 230], vida: [0.35, 0.75], s0: [22, 38], s1: 5, a0: 0.95, a1: 0.2, drag: 3.4, gy: -70, eo: true, turb: 60 }, x, y, 15 * fuerza, ov);
        emit({ forma: 'humo', add: false, capa: 0, c0: [95, 84, 78], c1: [18, 18, 20], v: [20, 100], vida: [1.1, 2.1], s0: [14, 24], s1: [56, 86], a0: 0.6, drag: 1.5, gy: -36, turb: 70, vr: [-1.2, 1.2], eo: true }, x, y, 10 * fuerza, ov);
        emit({ forma: 'glow', c0: [255, 255, 255], c2: claro, c1: col, v: [180, 640], vida: [0.45, 1.05], s0: [3, 5.5], s1: 0.8, stretch: 6, gy: 720, drag: 0.9, suelo: true, reb: 0.45, est: { rate: 18, d: { forma: 'glow', c0: claro, c1: oscuro, v: [0, 20], vida: [0.2, 0.4], s0: [2, 3.5], s1: 0.3, a0: 0.7 } } }, x, y, 26 * fuerza, ov);
        emit({ forma: 'casco', add: false, c0: [70, 58, 52], c1: [34, 30, 28], v: [120, 480], vida: [0.9, 1.7], s0: [4, 8], s1: 3, a0: 1, fo: 0.75, gy: 1150, drag: 0.3, suelo: true, reb: 0.35, vr: [-14, 14], est: { rate: 10, d: { forma: 'humo', add: false, capa: 0, c0: [90, 80, 74], c1: [30, 28, 28], v: [0, 15], vida: [0.5, 0.9], s0: [4, 6], s1: [14, 20], a0: 0.3, gy: -20 } } }, x, y, 12 * fuerza, ov);
        emit({ forma: 'anillo', c0: claro, c1: col, vida: 0.5, s0: 10, s1: 140, a0: 0.9, drag: 0, eo: true }, x, y, 1, ov, true);
        emit({ forma: 'glow', c0: [255, 240, 190], c1: col, v: [20, 140], vida: [1.1, 2.4], s0: [1.8, 3.4], s1: 0.4, a0: 1, gy: -70, drag: 0.8, turb: 120 }, x, y, 10 * fuerza, ov);
        sacudir(8 * E); destello(0.14 * Math.min(E, 2), col);
    }

    // Cristal que se quiebra
    function cristal(x, y) {
        emit({ forma: 'esquirla', add: false, cs: ['#ffffff', '#e8f3ff', '#bcd9f2', '#9ec5ff'], v: [120, 540], vida: [0.9, 1.6], s0: [3.5, 7.5], s1: 3, a0: 1, fo: 0.8, gy: 950, drag: 0.35, suelo: true, reb: 0.4, vr: [-18, 18] }, x, y, 26);
        emit({ forma: 'estrella', c0: [255, 255, 255], c1: [170, 210, 255], v: [30, 210], vida: [0.3, 0.7], s0: [9, 18], s1: 0, a0: 1, drag: 2.4, vr: [-5, 5] }, x, y, 9);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: [140, 180, 255], v: [30, 160], vida: [0.4, 0.8], s0: [8, 16], s1: 2, a0: 0.5, drag: 2 }, x, y, 8);
        emit({ forma: 'anillo', c0: [255, 255, 255], c1: [150, 200, 255], vida: 0.35, s0: 8, s1: 78, a0: 0.8, eo: true, drag: 0 }, x, y, 1, null, true);
        sacudir(2.5);
    }

    // Portal / teletransporte: vórtice que converge, anillos y chispas
    function portal(x, y, col) {
        const c = rgb(col, [0, 210, 211]);
        emit({ forma: 'glow', c0: c, c1: [255, 255, 255], vida: [0.45, 0.75], s0: [3, 6], s1: 0, a0: 0.95, orb: { rad: [50, 100], auto: true, w: [9, 15] } }, x, y, 30);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, vida: 0.22, s0: 20, s1: 90, a0: 0.9, drag: 0, eo: true }, x, y, 1, null, true);
        emit({ forma: 'anillo', c0: [255, 255, 255], c1: c, vida: 0.5, s0: 10, s1: 95, a0: 0.9, eo: true, drag: 0 }, x, y, 1, null, true);
        emit({ forma: 'anillo', c0: c, c1: c, vida: 0.75, s0: 6, s1: 140, a0: 0.6, eo: true, drag: 0 }, x, y, 1, null, true);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, v: [120, 380], vida: [0.25, 0.55], s0: [2, 4], s1: 0.5, stretch: 4, drag: 2.5 }, x, y, 12);
        sacudir(2);
    }

    // Arco eléctrico entre dos puntos
    function arco(x1, y1, x2, y2, col, u) {
        u = u || 1;
        const n = 7, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, pts = [];
        for (let i = 0; i <= n; i++) { const t = i / n, o = (i === 0 || i === n) ? 0 : (Math.random() - 0.5) * L * 0.2; pts.push([x1 + dx * t + nx * o, y1 + dy * t + ny * o]); }
        emit({ forma: 'arco', c0: col, c1: col, vida: [0.1, 0.2], s0: 3.2, s1: 1.2, a0: 1, fin: 0.005, fo: 0.4, pts, nx, ny, jit: L * 0.07 }, x1, y1, 1, { u }, true);
    }

    // Descarga eléctrica radial alrededor de la bola
    function descarga(x, y, r, col) {
        const c = rgb(col, [0, 255, 204]);
        for (let i = 0; i < 5; i++) {
            const a = rnd(0, PI2), sx = x + Math.cos(a) * r * 0.7, sy = y + Math.sin(a) * r * 0.7, L = rnd(r * 1.5, r * 3.2);
            arco(sx, sy, sx + Math.cos(a + rnd(-0.4, 0.4)) * L, sy + Math.sin(a + rnd(-0.4, 0.4)) * L, c, r / 55);
        }
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, vida: 0.2, s0: r * 0.6, s1: r * 2.1, a0: 0.8, drag: 0 }, x, y, 1, null, true);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, v: [120, 420], vida: [0.2, 0.5], s0: [2, 3.5], s1: 0.5, stretch: 5, drag: 2.5, gy: 200 }, x, y, 14);
        sacudir(2.5); destello(0.05, c);
    }

    // Rebote contra pared: chispas en abanico y un poco de polvo
    function rebote(x, y, col, ang, u) {
        const c = rgb(col, [200, 210, 255]), ov = { u: u || 1 };
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, vida: 0.12, s0: 10, s1: 36, a0: 0.8, drag: 0 }, x, y, 1, ov, true);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, ang: [ang - 1.1, ang + 1.1], v: [80, 330], vida: [0.18, 0.42], s0: [2, 3.6], s1: 0.6, stretch: 4, gy: 420, drag: 2.2 }, x, y, 7, ov);
        emit({ forma: 'humo', add: false, capa: 0, c0: [170, 160, 150], c1: [100, 95, 90], ang: [ang - 1, ang + 1], v: [20, 90], vida: [0.35, 0.7], s0: [5, 8], s1: [16, 26], a0: 0.28, drag: 2.5, gy: -10 }, x, y, 3, ov);
    }

    // Choque de un objeto contra el suelo: polvo, escombros y chispas
    function impactoSuelo(x, y, col, esc) {
        const c = rgb(col, [170, 160, 150]), ov = { u: esc || 1 }, osc = [c[0] * 0.35, c[1] * 0.35, c[2] * 0.35];
        emit({ forma: 'humo', add: false, capa: 0, c0: [150, 134, 114], c1: [84, 74, 64], ang: [-2.95, -0.2], v: [30, 150], vida: [0.5, 0.95], s0: [8, 14], s1: [26, 42], a0: 0.45, drag: 2.4, gy: -20, eo: true }, x, y, 8, ov);
        emit({ forma: 'casco', add: false, c0: c, c1: osc, ang: [-2.7, -0.45], v: [100, 340], vida: [0.6, 1.1], s0: [2.5, 5], s1: 2, a0: 1, fo: 0.7, gy: 1100, drag: 0.4, suelo: true, reb: 0.35, vr: [-14, 14] }, x, y, 9, ov);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, ang: [-2.9, -0.25], v: [140, 420], vida: [0.2, 0.45], s0: [2, 3.5], s1: 0.5, stretch: 4, gy: 700, drag: 1.6 }, x, y, 6, ov);
        emit({ forma: 'anillo', c0: [255, 255, 255], c1: c, vida: 0.3, s0: 6, s1: 46, a0: 0.5, eo: true, drag: 0 }, x, y, 1, ov, true);
    }

    // Caída de un rayo: columna de luz, onda en el suelo, arcos y chispas
    function rayoSuelo(x, piso, col, u) {
        const c = rgb(col, [255, 255, 200]), ov = { u: u || 1 };
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, vida: 0.28, s0: 30, s1: 150, a0: 1, drag: 0, eo: true }, x, piso, 1, ov, true);
        emit({ forma: 'anillo', c0: [255, 255, 255], c1: c, vida: 0.45, s0: 10, s1: 130, a0: 0.9, eo: true, drag: 0 }, x, piso, 1, ov, true);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, ang: [-3.0, -0.15], v: [150, 540], vida: [0.35, 0.8], s0: [2.5, 4.5], s1: 0.6, stretch: 5, gy: 800, drag: 1, suelo: true, reb: 0.4 }, x, piso, 18, ov);
        emit({ forma: 'glow', c0: [255, 255, 255], c1: c, v: [20, 120], vida: [0.2, 0.45], s0: [5, 9], s1: 0, a0: 0.9 }, x, piso * 0.5, 26, ov);
        for (let i = 0; i < 6; i++) { const dir = i % 2 ? 1 : -1; arco(x, piso - 4, x + dir * rnd(60, 200) * (u || 1), piso - rnd(2, 40), c, u || 1); }
        sacudir(7); destello(0.2, c);
    }

    // Un jefe carga un disparo: motas que convergen hacia él
    function carga(x, y, R, col, k) {
        emit({ forma: 'glow', c0: col, c1: [255, 255, 255], vida: 0.4, s0: [4, 8], s1: 0, a0: 0.9, orb: { rad: [R * 0.9, R * 1.6], auto: true, w: [-6, 6] } }, x, y, 1 + 4 * k);
    }

    // ---------- Auras continuas por skin y estelas de proyectiles ----------
    const E = (rate, d) => ({ rate, d });
    const FLAMA = (c0, c2, c1, rate, ex) => E(rate, Object.assign({ forma: 'glow', c0, c2, c1, v: [20, 60], vida: [0.35, 0.7], s0: [14, 24], s1: 3, gy: -260, drag: 1.5, pr: 0.7, turb: 120, a0: 0.9 }, ex));
    const HUMO = (c0, c1, rate, ex) => E(rate, Object.assign({ forma: 'humo', add: false, capa: 0, c0, c1, a0: 0.4, v: [5, 25], s0: [10, 18], s1: [38, 60], gy: -60, vida: [0.8, 1.4], pr: 0.6, turb: 50 }, ex));
    const BRASA = (c0, c1, rate, ex) => E(rate, Object.assign({ forma: 'glow', c0, c1, v: [30, 120], vida: [0.6, 1.3], s0: [1.8, 3.5], s1: 0.5, gy: -110, drag: 0.6, turb: 140, pr: 0.9, a0: 1 }, ex));
    const BRILLO = (c0, c1, rate, ex) => E(rate, Object.assign({ forma: 'estrella', c0, c1, v: [8, 50], vida: [0.35, 0.8], s0: [5, 11], s1: 0, vr: [-4, 4], pr: 0.95, a0: 0.95 }, ex));
    const MOTA = (c0, c1, rate, ex) => E(rate, Object.assign({ forma: 'glow', c0, c1, v: [8, 40], vida: [0.6, 1.2], s0: [4, 8], s1: 0, gy: -25, pr: 0.9, a0: 0.7 }, ex));
    const ARCOS = (c, rate) => ({ rate, arco: true, d: { c0: c } });

    const SKIN_FX = {
        clasica: [MOTA('#c7cbff', '#4e54c8', 12), BRILLO('#ffffff', '#8f94fb', 3, { s0: [4, 8] })],
        fuego: [FLAMA('#fff3a0', '#ff7a00', '#3a0500', 75), HUMO([80, 70, 65], [20, 18, 18], 12), BRASA('#ffd24a', '#ff3300', 12)],
        plasma: [E(30, { forma: 'glow', c0: '#ffffff', c1: '#00ffcc', v: [60, 240], vida: [0.1, 0.25], s0: [2, 4], s1: 0.6, stretch: 5, drag: 3, pr: 1 }), ARCOS('#00ffcc', 2.5), MOTA('#c8fff4', '#00ffcc', 10)],
        minecraft: est => est.cooldown
            ? [HUMO([110, 110, 110], [40, 40, 40], 18, { pr: 0.9, a0: 0.5 })]
            : [E(45, { forma: 'glow', c0: '#fff3a0', c1: '#ff6a00', ang: [-2.5, -0.64], v: [50, 170], gy: 380, vida: [0.25, 0.55], s0: [1.8, 3.4], s1: 0.4, stretch: 3, off: [0, -1.02], pr: 0.05 }), HUMO([70, 70, 70], [20, 20, 20], 8, { off: [0, -1], pr: 0.1, s1: [18, 28], a0: 0.35 })],
        goku: est => [E(85, { forma: 'glow', c0: '#ffffff', c1: est.fase.c2, ang: [-1.9, -1.24], v: [60, 150], gy: -300, vida: [0.3, 0.6], s0: [10, 18], s1: 2, pr: 0.95, stretch: 2.5, a0: 0.7 }), BRASA('#ffffff', est.fase.c2, 12, { gy: -60, vida: [0.4, 0.9] })],
        espejo: est => est.blindado ? [MOTA('#9fb4c4', '#52606c', 10), BRILLO('#ffffff', '#9fb4c4', 3)] : [BRILLO('#ffffff', '#bcd4ff', 9, { s0: [6, 13], vida: [0.25, 0.55], pr: 1 })],
        chicle: [E(5, { forma: 'anillo', c0: '#fff0fb', c1: '#ff9ff3', v: [8, 30], gy: -45, vida: [0.8, 1.5], s0: [3, 8], s1: [10, 17], pr: 1, a0: 0.85, drag: 0.8 }), MOTA('#ffd6f6', '#ff8fe6', 6)],
        iman: [E(32, { forma: 'glow', cs: ['#ff4757', '#6d86ff', '#ffffff'], vida: [0.4, 0.7], s0: [2.5, 5], s1: 0, a0: 0.9, orb: { rad: [85, 125], auto: true, w: [-7, 7] } }), MOTA('#ff9aa2', '#ff4757', 6)],
        antimateria: [E(45, { forma: 'glow', cs: ['#a55eea', '#4b7bec', '#d6b4ff'], vida: [0.5, 0.9], s0: [2.5, 5.5], s1: 0, a0: 0.95, orb: { rad: [70, 115], auto: true, w: [8, 13] } }), HUMO([60, 30, 110], [12, 6, 30], 7, { s1: [30, 46] })],
        cuantica: [E(30, { forma: 'glow', c0: '#ffffff', c1: '#00d2d3', vida: [0.5, 0.9], s0: [2, 4.5], s1: 0.5, a0: 0.95, orb: { rad: [56, 78], w: [4, 8] } }), BRILLO('#e6ffff', '#00d2d3', 4)],
        hielocorrupto: [MOTA('#ffffff', '#e056fd', 22, { s0: [2, 4], gy: 30 }), BRILLO('#ffffff', '#e056fd', 4), HUMO([170, 150, 255], [60, 40, 120], 7, { add: true, a0: 0.18 })],
        magma: [BRASA('#ffd24a', '#ff3300', 28), HUMO([60, 45, 40], [15, 12, 12], 7), E(6, { forma: 'glow', c0: '#ffe08a', c1: '#ff3300', v: [0, 20], gy: 520, vida: [0.5, 0.9], s0: [2, 3.8], s1: 1, pr: 0.9, drag: 0.2 })],
        meteoro: [FLAMA('#fff3a0', '#ff6a1a', '#2a0500', 95, { s0: [14, 26], gy: -30, v: [0, 40], vida: [0.45, 0.9], pr: 0.85 }), HUMO([90, 70, 60], [25, 20, 20], 26, { s1: [45, 70], a0: 0.45 }), BRASA('#ffbe76', '#ff4d4d', 20)],
        glitch: [E(40, { forma: 'pixel', cs: ['#00ff66', '#ff007f', '#ffffff', '#00e5ff'], v: [20, 120], vida: [0.15, 0.5], s0: [2, 5], s1: [2, 5], pr: 1.05, a0: 1, drag: 2.5, fo: 0.8 })],
        estrella: [BRILLO('#ffffff', '#70a1ff', 38), MOTA('#bcd8ff', '#1e90ff', 20, { s0: [6, 11] })],
        tiempo: [E(26, { forma: 'glow', c0: '#fff3c4', c1: '#d4a017', v: [4, 26], gy: 70, vida: [1, 1.8], s0: [1.6, 3.2], s1: 0.4, pr: 0.95, a0: 0.9 }), MOTA('#ffe9a0', '#d4a017', 6)],
        midas: [BRILLO('#fff6b0', '#ffd700', 34), MOTA('#ffeb85', '#d4a017', 16)],
        ninja: [HUMO([45, 35, 55], [6, 6, 12], 30, { a0: 0.55, s1: [30, 48], pr: 0.7 }), E(6, { forma: 'glow', c0: '#ff6b5a', c1: '#8a1010', v: [20, 90], vida: [0.3, 0.6], s0: [1.8, 3], s1: 0.4, gy: -20 })],
        dragon: [FLAMA('#ffd29c', '#e74c3c', '#2a0505', 60), HUMO([70, 40, 35], [18, 10, 10], 12), BRASA('#ffb347', '#e74c3c', 16)],
        solar: [E(55, { forma: 'glow', c0: '#ffffff', c2: '#ffb300', c1: '#d84315', v: [90, 210], vida: [0.4, 0.85], s0: [8, 14], s1: 1, stretch: 3.5, pr: 1.05, drag: 1.2, a0: 0.85 }), BRASA('#fff2a8', '#ff8a00', 14, { gy: -30 })],
        arcoiris: () => { const h = tiempo * 140; return [E(70, { forma: 'glow', c0: hsl(h, 0.95, 0.62), c1: hsl(h + 70, 0.95, 0.6), v: [10, 50], vida: [0.5, 0.9], s0: [9, 15], s1: 2, gy: -25, pr: 0.85, a0: 0.75 }), BRILLO('#ffffff', hsl(h, 0.9, 0.7), 8)]; },
        fantasma: [HUMO([205, 215, 255], [110, 120, 200], 24, { add: true, capa: 1, a0: 0.28, s0: [10, 18], s1: [30, 50], gy: -45, pr: 0.75 }), MOTA('#ffffff', '#cfd8ff', 6)],
        cosmos: [E(52, { forma: 'glow', cs: ['#9b59ff', '#00b4ff', '#ff46a0', '#ffffff'], v: [10, 70], vida: [0.9, 1.7], s0: [2, 5], s1: 0, pr: 1.1, drag: 0.5, a0: 0.9 }), BRILLO('#ffffff', '#b48cff', 9)]
    };

    const FRIO = [MOTA('#ffffff', '#7dd3fc', 30, { s0: [2.5, 5] }), HUMO([210, 235, 255], [140, 190, 235], 14, { s0: [5, 9], s1: [18, 28], a0: 0.3 })];
    const POLVO = [E(30, { forma: 'humo', add: false, capa: 0, c0: [150, 135, 115], c1: [80, 70, 60], v: [5, 40], vida: [0.4, 0.9], s0: [5, 9], s1: [20, 30], a0: 0.35, pr: 0.8, gy: 20 }), E(10, { forma: 'casco', add: false, c0: [110, 98, 85], c1: [70, 60, 52], v: [20, 80], gy: 700, vida: [0.4, 0.8], s0: [2, 3.5], s1: 1, vr: [-10, 10], pr: 0.8 })];
    const PROY_FX = {
        lava: [FLAMA('#fff3a0', '#ff7a18', '#3a0500', 70, { pr: 0.5, s0: [8, 14], s1: 2, v: [0, 20], gy: -80, vida: [0.3, 0.6] }), HUMO([80, 60, 55], [20, 18, 18], 18, { s0: [6, 10], s1: [24, 38], a0: 0.4, pr: 0.4 }), BRASA('#ffd24a', '#ff3300', 22)],
        electro: [E(40, { forma: 'glow', c0: '#ffffff', c1: '#67e8f9', v: [40, 200], vida: [0.1, 0.25], s0: [2, 3.5], s1: 0.5, stretch: 5, drag: 3, pr: 0.8 }), ARCOS('#67e8f9', 8)],
        hielo: FRIO, nieve: FRIO,
        tinta: [E(22, { forma: 'glow', c0: '#2dd4bf', c1: '#0f172a', v: [10, 50], vida: [0.3, 0.6], s0: [2, 4], gy: 380, pr: 0.8 }), HUMO([20, 35, 50], [5, 10, 20], 12, { s0: [6, 10], s1: [20, 30], a0: 0.5 })],
        hoja: [E(14, { forma: 'hoja', cs: ['#7bd957', '#4aa84f', '#a5ec7d'], v: [10, 60], vida: [0.5, 1], s0: [2.2, 3.6], s1: 1.5, gy: 60, vr: [-6, 6], pr: 1, add: false, a0: 0.9 })],
        esquirla: [BRILLO('#ffffff', '#8cc8f0', 22, { s0: [4, 8], pr: 0.9 })],
        aguijon: [E(30, { forma: 'glow', c0: '#f0abfc', c1: '#7e22ce', v: [10, 60], vida: [0.3, 0.6], s0: [3, 6], s1: 0.5, pr: 0.7, a0: 0.85 }), HUMO([120, 60, 170], [40, 10, 70], 8, { add: true, a0: 0.2, s0: [5, 9], s1: [16, 26] })],
        arena: [E(36, { forma: 'humo', add: false, capa: 0, c0: [225, 190, 110], c1: [150, 110, 50], v: [5, 40], vida: [0.4, 0.9], s0: [5, 9], s1: [20, 30], a0: 0.35, pr: 0.8, gy: 20 }), MOTA('#fff0b8', '#fcd34d', 16, { s0: [1.8, 3.5] })],
        roca: POLVO, estalactita: POLVO,
        pluma: [BRILLO('#ffffff', '#ffe9a8', 24)],
        orbe: [MOTA('#fff3c4', '#ffe58a', 40, { s0: [4, 8] }), BRILLO('#ffffff', '#ffe58a', 10)],
        rama: [E(14, { forma: 'hoja', cs: ['#7bd957', '#4aa84f'], v: [10, 60], vida: [0.5, 1], s0: [2.2, 3.6], s1: 1.5, gy: 60, vr: [-6, 6], pr: 1, add: false, a0: 0.9 })]
    };

    function correr(lista, clave, x, y, ov, dt) {
        for (let i = 0; i < lista.length; i++) {
            const e = lista[i], k = clave + '|' + i;
            let a = (accs[k] || 0) + e.rate * dt * q;
            let n = Math.floor(a);
            accs[k] = a - n;
            if (n > 6) n = 6;
            for (let j = 0; j < n; j++) {
                if (e.arco) {
                    const an = rnd(0, PI2), r = ov.r, sx = x + Math.cos(an) * r * 0.8, sy = y + Math.sin(an) * r * 0.8, L = rnd(r * 1.2, r * 2.6);
                    arco(sx, sy, sx + Math.cos(an) * L, sy + Math.sin(an) * L, e.d.c0, ov.u);
                } else emit(e.d, x, y, 1, ov, true);
            }
        }
    }

    function aura(key, est, x, y, r, bvx, bvy, dt) {
        let def = SKIN_FX[key];
        if (!def) return;
        if (typeof def === 'function') def = def(est || {});
        correr(def, key, x, y, { r, u: r / 55, bvx, bvy }, dt);
    }

    function proyectil(p, dt) {
        const def = PROY_FX[p.spr];
        if (!def) return;
        correr(def, 'p' + p.spr, p.x, p.y, { r: p.r, u: p.r / 16, bvx: p.vx || 0, bvy: p.vy || 0 }, dt);
    }

    // ---------- Clima ----------
    const climaEst = { tipo: null, w: 0, ps: [] };
    const N_CLIMA = { lluvia: 120, nieve: 90, hojas: 36, arena: 110, ceniza: 90, brisa: 26 };

    function clima(g, tipo, w, h, t, dt, vx, k) {
        if (!tipo || tipo === 'ninguno' || !N_CLIMA[tipo]) return;
        if (climaEst.tipo !== tipo || climaEst.w !== w) {
            climaEst.tipo = tipo; climaEst.w = w;
            climaEst.ps = Array.from({ length: N_CLIMA[tipo] }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 0.4 + Math.random() * 0.6, s: Math.random(), i }));
        }
        const ps = climaEst.ps, lim = Math.ceil(ps.length * (0.45 + q * 0.55)), sg = vx < 0 ? -1 : 1;
        g.save(); g.lineCap = 'round';
        if (tipo === 'ceniza' || tipo === 'brisa') g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < lim; i++) {
            const p = ps[i];
            if (tipo === 'lluvia') {
                const vy = 0.9 + 0.9 * p.z;
                p.y += vy * dt; p.x += vx * dt * (0.5 + p.z) * 0.6;
                if (p.y > 1) {
                    if (Math.random() < 0.3 && q > 0.5) {
                        const X = p.x * w, Y = h - 14;
                        emit({ forma: 'anillo', capa: 0, c0: [200, 220, 255], c1: [200, 220, 255], vida: 0.3, s0: 1, s1: 8 + 12 * p.z, a0: 0.5, drag: 0, eo: true }, X, Y, 1, { u: k }, true);
                        emit({ forma: 'glow', capa: 0, c0: [225, 235, 255], c1: [160, 190, 255], ang: [-2.4, -0.7], v: [60, 170], vida: [0.2, 0.4], s0: [1.2, 2], s1: 0.4, gy: 700, drag: 0.5, a0: 0.8 }, X, Y, 2, { u: k }, true);
                    }
                    p.y = -0.05; p.x = Math.random();
                }
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h, lx = vx * w * (0.5 + p.z) * 0.6 * 0.035, ly = vy * h * 0.035;
                g.strokeStyle = `rgba(200,220,255,${(0.2 + 0.35 * p.z).toFixed(2)})`; g.lineWidth = (0.8 + 1.5 * p.z) * k;
                g.beginPath(); g.moveTo(X, Y); g.lineTo(X - lx, Y - ly); g.stroke();
            } else if (tipo === 'nieve') {
                p.y += (0.05 + 0.09 * p.z) * dt; p.x += (vx * 0.5 * p.z + Math.sin(t * 0.8 + p.s * 6) * 0.03) * dt;
                if (p.y > 1.03) { p.y = -0.03; p.x = Math.random(); }
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h, s = (1.6 + 4.2 * p.z) * k;
                g.globalAlpha = 0.35 + 0.45 * p.z; g.drawImage(sprite('disco', [120, 165, 215]), X - s * 1.35, Y - s * 1.35, s * 2.7, s * 2.7);
                g.globalAlpha = 0.55 + 0.45 * p.z; g.drawImage(sprite('disco', [255, 255, 255]), X - s, Y - s, s * 2, s * 2);
            } else if (tipo === 'hojas') {
                p.y += (0.06 + 0.05 * p.z) * dt; p.x += (vx * 0.9 + Math.sin(t * 1.4 + p.s * 9) * 0.06) * dt * (0.6 + p.z);
                if (p.y > 1.04) { p.y = -0.04; p.x = Math.random(); }
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h + Math.sin(t * 2 + p.s * 7) * 8 * k;
                g.fillStyle = p.s > 0.66 ? '#d9a441' : (p.s > 0.33 ? '#6bbf59' : '#8fd36a');
                g.beginPath(); g.ellipse(X, Y, (5 + 4 * p.z) * k, Math.max(0.6, (3 + 2 * p.z) * k * Math.abs(Math.cos(t * 3 + p.s * 9))), t * 1.5 + p.s * 6, 0, PI2); g.fill();
            } else if (tipo === 'arena') {
                p.x += (vx * 2.5 + 0.35 * sg) * dt * (0.5 + p.z) * 0.6; p.y += Math.sin(t * 2 + p.s * 8) * 0.01 * dt;
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h, L = (12 + 22 * p.z) * k;
                g.strokeStyle = `rgba(255,232,185,${(0.25 + 0.45 * p.z).toFixed(2)})`; g.lineWidth = (1 + 1.6 * p.z) * k;
                g.beginPath(); g.moveTo(X, Y); g.lineTo(X - sg * L, Y + Math.sin(t * 5 + p.s * 9) * 1.5 * k); g.stroke();
            } else if (tipo === 'ceniza') {
                p.y -= (0.04 + 0.07 * p.z) * dt; p.x += (vx * 0.6 + Math.sin(t * 0.9 + p.s * 7) * 0.025) * dt;
                if (p.y < -0.04) { p.y = 1.03; p.x = Math.random(); }
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h, s = (1.5 + 2.6 * p.z) * k;
                if (p.s > 0.55) {
                    g.globalAlpha = (0.55 + 0.4 * Math.sin(t * 6 + p.s * 40)) * (0.5 + 0.5 * p.z);
                    g.drawImage(sprite('glow', [255, 150, 50]), X - s * 3, Y - s * 3, s * 6, s * 6);
                } else {
                    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.35 + 0.3 * p.z;
                    g.drawImage(sprite('disco', [175, 168, 168]), X - s, Y - s, s * 2, s * 2);
                    g.globalCompositeOperation = 'lighter';
                }
            } else if (tipo === 'brisa') {
                p.x += (vx * 1.2 + 0.05 * sg) * dt * (0.5 + p.z); p.y += Math.sin(t * 0.7 + p.s * 9) * 0.012 * dt;
                p.x = ((p.x % 1) + 1) % 1;
                const X = p.x * w, Y = p.y * h, fade = Math.sin(p.x * Math.PI), L = w * (0.04 + 0.04 * p.z) * sg;
                g.strokeStyle = `rgba(255,255,255,${(0.22 * fade * p.z).toFixed(3)})`; g.lineWidth = (1.4 + p.z) * k;
                g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X - L * 0.5, Y + Math.sin(t * 2 + p.s * 9) * 9 * k, X - L, Y + Math.sin(t * 2 + p.s * 9 + 0.8) * 7 * k); g.stroke();
                g.globalAlpha = 0.5 * fade * p.z; g.drawImage(sprite('glow', [255, 255, 255]), X - 5 * k, Y - 5 * k, 10 * k, 10 * k);
            }
        }
        g.restore();
        if (tipo === 'arena') { g.save(); g.fillStyle = 'rgba(230,170,90,0.14)'; g.fillRect(0, 0, w, h); g.restore(); }
    }

    return {
        iniciar(canvas) { canvasEl = canvas; },
        ajustar(w, h) { suelo = h - 12; },
        actualizar, dibujar, emit, sacudir, destello,
        golpe, explosion, cristal, portal, arco, descarga, rebote, impactoSuelo, rayoSuelo, carga,
        aura, proyectil, clima,
        limpiar() { while (act.length) libres.push(act.pop()); },
        cuantas: () => act.length,
        calidad: () => q
    };
})();
