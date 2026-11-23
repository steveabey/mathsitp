/* ===== Fractions, ratio and geometry ===== */

/* shared: draggable polygon "elastic band" */
function band(c, layer, pts, opt) {
  const g = S('g', {}, layer), maxPins = opt.max || 20;
  function draw() {
    clear(g);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + 'Z';
    S('path', { d, fill: col(opt.colour), 'fill-opacity': opt.fill === false ? 0 : .22, stroke: col(opt.colour), 'stroke-width': 5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g);
    if (opt.insert) pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const e = S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: 'transparent', 'stroke-width': 22, cls: 'hit' }, g);
      e.addEventListener('click', ev => {
        if (pts.length >= maxPins) return c.toast(`A band can have up to ${maxPins} pins`);
        const m = c.pt(ev), np = opt.snap(m.x, m.y); if (!np || pts.some(r => Math.abs(r[0] - np[0]) < 1 && Math.abs(r[1] - np[1]) < 1)) return c.toast('Tap a part of the edge between pins');
        pts.splice(i + 1, 0, np); draw(); opt.change && opt.change();
      });
    });
    const lab = S('g', { 'pointer-events': 'none' }, g);
    opt.after && opt.after(lab, pts);
    pts.forEach((p, i) => {
      const h = S('g', { cls: 'grab' }, g);
      S('circle', { cx: p[0], cy: p[1], r: 22, fill: 'transparent' }, h);
      S('circle', { cx: p[0], cy: p[1], r: 9, fill: col(opt.colour), stroke: 'var(--board)', 'stroke-width': 3 }, h);
      if (opt.labels) text(h, p[0] + 16, p[1] - 16, String.fromCharCode(65 + i), { 'font-size': 18, 'font-weight': 700, fill: col(opt.colour), 'pointer-events': 'none' });
      c.drag(h, { move: q => { const s2 = opt.snap(q.x, q.y); if (!s2) return; pts[i] = s2; draw(); opt.change && opt.change(); } });
    });
  }
  draw(); return { draw, pts, g };
}
function shoelace(p) { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; }
function angleAt(p, i) { const n = p.length, a = p[(i - 1 + n) % n], b = p[i], c2 = p[(i + 1) % n]; const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c2[0] - b[0], c2[1] - b[1]]; let ang = Math.atan2(v2[1], v2[0]) - Math.atan2(v1[1], v1[0]); ang = ang * 180 / Math.PI; return ang; }

/* shared: protractor that drags and rotates */
function protractor(c, layer, x, y, r = 200) {
  let rot = 0, flip = false;
  const g = S('g', { cls: 'grab' }, layer);
  function draw() {
    clear(g); g.setAttribute('transform', `translate(${x},${y}) rotate(${rot})`);
    S('path', { d: `M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`, fill: 'var(--blue-s)', 'fill-opacity': .55, stroke: 'var(--blue)', 'stroke-width': 2 }, g);
    for (let d = 0; d <= 180; d++) {
      const a = -d * Math.PI / 180, len = d % 10 === 0 ? 22 : d % 5 === 0 ? 14 : 8;
      S('line', { x1: r * Math.cos(a), y1: r * Math.sin(a), x2: (r - len) * Math.cos(a), y2: (r - len) * Math.sin(a), stroke: 'var(--ink)', 'stroke-width': d % 10 ? .8 : 1.5 }, g);
      if (d % 10 === 0) { const v = flip ? 180 - d : d; text(g, (r - 38) * Math.cos(a), (r - 38) * Math.sin(a), String(v), { 'font-size': 13, cls: 'num', fill: 'var(--ink)' }); text(g, (r - 60) * Math.cos(a), (r - 60) * Math.sin(a), String(180 - v), { 'font-size': 10, cls: 'num', fill: 'var(--ink-3)' }); }
    }
    S('line', { x1: -r, y1: 0, x2: r, y2: 0, stroke: 'var(--ink)', 'stroke-width': 1.5 }, g);
    S('circle', { r: 5, fill: 'var(--red)' }, g);
    const rh = S('g', { cls: 'grab' }, g); S('circle', { cx: r + 26, cy: -10, r: 16, fill: 'var(--blue)' }, rh); S('path', { d: `M${r + 18} -12 a8 8 0 1 1 8 10`, fill: 'none', stroke: 'var(--board)', 'stroke-width': 3 }, rh);
    c.drag(rh, { move: p => { rot = Math.atan2(p.y - y, p.x - x) * 180 / Math.PI; draw(); } });
  }
  let ox, oy;
  c.drag(g, { start: p => { ox = p.x - x; oy = p.y - y; }, move: p => { x = p.x - ox; y = p.y - oy; draw(); } });
  draw();
  return { g, flip() { flip = !flip; draw(); }, show(v) { g.style.display = v ? '' : 'none'; } };
}

tool({
  id: 'fractions', name: 'Fractions', strand: 'frac', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Fraction bars with decimals, percentages and ratios, plus adding and subtracting fractions and mixed numbers.',
  tags: 'equivalent fractions decimals percentages ratio bar wall add subtract mixed improper',
  icon: '<rect x="4" y="10" width="40" height="10" rx="2"/><path d="M14 10v10M24 10v10M34 10v10"/><rect x="4" y="10" width="20" height="10" fill="currentColor" opacity=".4"/><rect x="4" y="28" width="40" height="10" rx="2"/><path d="M17 28v10M30 28v10"/>',
  guide: ['Build your own wall: start with one whole bar, tap the dotted bar underneath to add another, use − and + to split a bar into parts, and × to remove it. Ready-made wall gives halves to tenths.', 'Tap a part to colour it. Each tap moves through red, blue, green and yellow, then back to blank. The fraction, decimal, percentage and ratio line up on the right.', 'When the coloured fraction of one bar equals another bar, both bars flash, for example 1/2 = 2/4, even if the coloured parts are not next to each other.', 'Use − and + beside a bar to change how many parts it has. Add bars to compare fractions and find equivalents.', 'Add and subtract: set two fractions, then tap Next step to change them to a common denominator and combine them.', 'Mixed numbers: set an improper fraction to see it as whole bars and a part, on bars and a number line.'],
  mount(c) {
    const { svg, P } = c;
    const PC = ['', 'red', 'blue', 'green', 'yellow'];
    let mode = 'bars', bars = [{ d: 1, on: [0] }], show = { f: true, d: false, p: false, r: false }, simplify = false, labels = true, eqFlash = true;
    let A = [1, 3], B = [1, 4], op = '+', stage = 1, MN = [7, 4], mixedView = true;
    c.persist(() => ({ mode, bars, show, simplify, A, B, op, stage, MN, labels, eqFlash }), s => ({ mode, bars, show, simplify, A, B, op, stage, MN, labels, eqFlash } = Object.assign({ mode, bars, show, simplify, A, B, op, stage, MN, labels, eqFlash }, s)));
    const g = S('g', {}, svg);
    const lcm = (a, b) => a / gcd(a, b) * b;
    function frac(x, y, a, b, fs = 24, cl) { text(g, x, y - fs * .62, String(a), { 'font-size': fs, 'font-weight': 800, cls: 'disp num', fill: cl }); S('line', { x1: x - fs * .75, y1: y, x2: x + fs * .75, y2: y, stroke: cl || 'var(--ink)', 'stroke-width': 3 }, g); text(g, x, y + fs * .68, String(b), { 'font-size': fs, 'font-weight': 800, cls: 'disp num', fill: cl }); }
    function bar(x, y, w, h, d, shaded, cl = 'red', opt = {}) { for (let i = 0; i < d; i++) S('rect', { x: x + i * w / d, y, width: w / d, height: h, fill: i < shaded ? col(opt.cols ? opt.cols[i] : cl) : 'var(--green-s)', stroke: 'var(--ink)', 'stroke-width': 2 }, g); }
    // ---------- bars ----------
    const X0 = 150, BW = 540, COLX = { f: 740, d: 815, p: 890, r: 960 };
    let flashUntil = 0, flashBars = [], flashMsg = '', flashT = null;
    const frOf = b => [b.on.filter(v => v).length, b.d];
    function checkEq(k) {
      if (!eqFlash) return;
      const [n, d] = frOf(bars[k]); if (!n) return;
      const same = bars.map((b, i) => i).filter(i => i !== k && (() => { const [n2, d2] = frOf(bars[i]); return n2 && n2 * d === n * d2; })());
      if (!same.length) return;
      flashBars = [k, ...same]; flashMsg = [k, ...same].map(i => frOf(bars[i]).join('/')).join(' = ') + (n === d ? ' = 1 whole' : '');
      flashUntil = performance.now() + 2600; clearTimeout(flashT); flashT = setTimeout(draw, 2700);
    }
    c.onClean(() => clearTimeout(flashT));
    function drawBars() {
      const cols = Object.keys(COLX).filter(k => show[k]), rows = bars.length + (bars.length < 10 ? 1 : 0);
      const gap = 24, bh = Math.min(64, (560 - gap * rows) / rows);
      cols.forEach(k => text(g, COLX[k], 22, { f: 'Fraction', d: 'Decimal', p: 'Percent', r: 'Ratio' }[k], { 'font-size': 14, 'font-weight': 800, fill: 'var(--ink-3)' }));
      const flashing = performance.now() < flashUntil;
      bars.forEach((b, k) => {
        const y = 44 + k * (bh + gap), w = BW / b.d;
        if (flashing && flashBars.includes(k)) S('rect', { x: X0 - 8, y: y - 8, width: BW + 16, height: bh + 16, rx: 10, fill: 'var(--yellow)', cls: 'eqflash' }, g);
        for (let i = 0; i < b.d; i++) {
          const part = S('rect', { x: X0 + i * w, y, width: w, height: bh, fill: b.on[i] ? col(PC[b.on[i]]) : 'var(--green-s)', stroke: 'var(--ink)', 'stroke-width': 2, cls: 'hit' }, g);
          part.addEventListener('click', () => { b.on[i] = (b.on[i] + 1) % 5; checkEq(k); draw(); });
          if (labels && b.d <= 12) text(g, X0 + i * w + w / 2, y + bh / 2 + 1, b.d === 1 ? '1' : '1/' + b.d, { 'font-size': Math.min(18, w * .3), fill: b.on[i] && b.on[i] !== 4 ? '#fff' : 'var(--ink-3)', 'pointer-events': 'none' });
        }
        const btn = (x, t, f, title) => { const bb = S('g', { cls: 'hit' }, g); S('circle', { cx: x, cy: y + bh / 2, r: 17, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, bb); text(bb, x, y + bh / 2 + 1, t, { 'font-size': t === '×' ? 20 : 24, 'font-weight': 700, fill: t === '×' ? 'var(--red)' : 'var(--ink)' }); const tt = S('title', {}, bb); tt.textContent = title; bb.addEventListener('click', f); };
        btn(24, '×', () => { bars.splice(k, 1); if (!bars.length) bars.push({ d: 1, on: [0] }); draw(); }, 'Remove this bar');
        btn(66, '−', () => setD(b, b.d - 1), 'Fewer parts'); btn(106, '+', () => setD(b, b.d + 1), 'More parts');
        const n = b.on.filter(v => v).length, ly = y + bh / 2, gg = simplify && n ? gcd(n, b.d) : 1;
        if (show.f) { if (bh >= 56) frac(COLX.f, ly, n / gg, b.d / gg, Math.min(24, bh * .32), n ? 'var(--ink)' : 'var(--ink-3)'); else text(g, COLX.f, ly, `${n / gg}/${b.d / gg}`, { 'font-size': 20, 'font-weight': 800, cls: 'num', fill: n ? 'var(--ink)' : 'var(--ink-3)' }); }
        if (show.d) text(g, COLX.d, ly, nf(+(n / b.d).toFixed(3)), { 'font-size': 19, 'font-weight': 700, cls: 'num' });
        if (show.p) text(g, COLX.p, ly, nf(+(n / b.d * 100).toFixed(1)) + '%', { 'font-size': 19, 'font-weight': 700, cls: 'num' });
        if (show.r) text(g, COLX.r, ly, `${n}:${b.d - n}`, { 'font-size': 19, 'font-weight': 700, cls: 'num' });
        const used = [1, 2, 3, 4].filter(cc => b.on.includes(cc));
        if (used.length > 1 && bh > 30) { let x = X0; used.forEach(cc => { const m = b.on.filter(v => v === cc).length, t = `${m}/${b.d} ${PC[cc]}`; S('rect', { x, y: y + bh + 2, width: t.length * 7.4 + 10, height: 17, rx: 6, fill: col(PC[cc]) }, g); text(g, x + (t.length * 7.4 + 10) / 2, y + bh + 10, t, { 'font-size': 12, 'font-weight': 800, fill: cc === 4 ? '#18202E' : '#fff' }); x += t.length * 7.4 + 16; }); }
      });
      if (bars.length < 10) {
        const y = 44 + bars.length * (bh + gap), gb = S('g', { cls: 'hit' }, g);
        S('rect', { x: X0, y, width: BW, height: bh, rx: 6, fill: 'var(--board-2)', stroke: 'var(--ink-3)', 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: .7 }, gb);
        text(gb, X0 + BW / 2, y + bh / 2 + 1, '+  Tap to add a bar', { 'font-size': Math.min(20, bh * .45), 'font-weight': 700, fill: 'var(--ink-3)' });
        gb.addEventListener('click', () => { bars.push({ d: 1, on: [0] }); draw(); });
      }
      if (flashing && flashMsg) { const w = flashMsg.length * 16 + 50; S('rect', { x: X0 + BW / 2 - w / 2, y: 596, width: w, height: 40, rx: 14, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2 }, g); text(g, X0 + BW / 2, 617, flashMsg, { 'font-size': 24, 'font-weight': 800, cls: 'disp num', fill: '#18202E' }); }
    }
    function setD(b, d) { d = clamp(d, 1, 24); const old = b.on; b.d = d; b.on = Array.from({ length: d }, (_, i) => old[i] || 0); draw(); }
    // ---------- add / subtract ----------
    function drawAdd() {
      const [a, b] = A, [cN, d] = B, L = lcm(b, d), Ax = a * L / b, Cx = cN * L / d, R = op === '+' ? Ax + Cx : Ax - Cx;
      const x0 = 200, w = 560, h = 56;
      const row = (y, lbl, num, den, n2, cl, dd) => { frac(110, y + h / 2, num, den, 22, col(cl)); bar(x0, y, w, h, dd, n2, cl); };
      row(40, '', a, b, a, 'orange', b); text(g, 840, 68, stage >= 2 ? `= ${Ax}/${L}` : '', { 'font-size': 24, 'font-weight': 800, cls: 'num', fill: 'var(--orange)', 'text-anchor': 'start' });
      text(g, 110, 140, op, { 'font-size': 40, 'font-weight': 800 });
      row(170, '', cN, d, cN, 'blue', d); text(g, 840, 198, stage >= 2 ? `= ${Cx}/${L}` : '', { 'font-size': 24, 'font-weight': 800, cls: 'num', fill: 'var(--blue)', 'text-anchor': 'start' });
      if (stage >= 2) { text(g, 500, 262, `Common denominator: ${L}. Each bar is cut into ${L} equal parts.`, { 'font-size': 18, fill: 'var(--ink-2)', 'font-weight': 700 }); [40, 170].forEach(y => { for (let i = 1; i < L; i++) S('line', { x1: x0 + i * w / L, y1: y, x2: x0 + i * w / L, y2: y + h, stroke: 'var(--ink)', 'stroke-width': 1, 'stroke-dasharray': '4 3' }, g); }); }
      if (stage >= 3) {
        if (R < 0) { text(g, 500, 340, 'The answer would be less than zero. Swap the fractions round.', { 'font-size': 22, fill: 'var(--red)', 'font-weight': 700 }); }
        else {
          const wholes = Math.max(1, Math.ceil(R / L)); const bw = Math.min(w, (w * 2 + 20) / wholes - 20);
          for (let k = 0; k < wholes; k++) { const sh = clamp(R - k * L, 0, L); const cols = []; for (let i = 0; i < L; i++) { const idx = k * L + i; cols.push(op === '+' ? (idx < Ax ? 'orange' : 'blue') : 'orange'); } bar(x0 + k * (bw + 20), 300, bw, h, L, sh, 'orange', { cols }); }
          frac(110, 328, R, L, 22);
        }
        const gg = gcd(R, L) || 1, w2 = Math.floor(R / L), r2 = R % L;
        let eq = `${a}/${b} ${op} ${cN}/${d} = ${Ax}/${L} ${op} ${Cx}/${L} = ${R}/${L}`;
        if (gg > 1 && R) eq += ` = ${R / gg}/${L / gg}`;
        if (R > L && r2) eq += ` = ${w2} ${r2 / gcd(r2, L)}/${L / gcd(r2, L)}`; else if (R >= L && !r2) eq += ` = ${w2}`;
        if (R >= 0) text(g, 500, 440, eq, { 'font-size': eq.length > 44 ? 26 : 32, 'font-weight': 800, cls: 'disp num' });
      }
      text(g, 500, 520, ['', 'Step 1 of 3: the two fractions', 'Step 2 of 3: change them to the same denominator', 'Step 3 of 3: combine the parts'][stage], { 'font-size': 20, 'font-weight': 700, fill: 'var(--ink-2)' });
    }
    // ---------- mixed ----------
    function drawMixed() {
      const [n, d] = MN, wholes = Math.max(1, Math.ceil(n / d)), w2 = Math.floor(n / d), r2 = n % d;
      const bw = Math.min(260, 900 / wholes - 16), x0 = 500 - (wholes * (bw + 16) - 16) / 2;
      for (let k = 0; k < wholes; k++) { bar(x0 + k * (bw + 16), 60, bw, 70, d, clamp(n - k * d, 0, d), 'purple'); if (clamp(n - k * d, 0, d) === d) text(g, x0 + k * (bw + 16) + bw / 2, 150, '1 whole', { 'font-size': 16, 'font-weight': 700, fill: 'var(--purple)' }); }
      // number line
      const L0 = 90, L1 = 910, X = v => L0 + v / wholes * (L1 - L0), y = 260;
      S('line', { x1: L0, y1: y, x2: L1, y2: y, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      for (let k = 0; k <= wholes * d; k++) { const v = k / d, major = k % d === 0; S('line', { x1: X(v), y1: y - (major ? 14 : 7), x2: X(v), y2: y + (major ? 14 : 7), stroke: 'var(--ink)', 'stroke-width': major ? 3 : 1.4 }, g); if (major) text(g, X(v), y + 34, String(k / d), { 'font-size': 20, 'font-weight': 700, cls: 'num' }); }
      S('circle', { cx: X(n / d), cy: y, r: 11, fill: 'var(--orange)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      // big statement
      frac(300, 420, n, d, 40, 'var(--purple)'); text(g, 380, 420, '=', { 'font-size': 48, 'font-weight': 800 });
      if (r2) { if (w2) text(g, 460, 420, String(w2), { 'font-size': 72, 'font-weight': 800, cls: 'disp num', fill: 'var(--orange)' }); frac(w2 ? 525 : 470, 420, r2, d, 32, 'var(--orange)'); }
      else text(g, 470, 420, String(w2), { 'font-size': 72, 'font-weight': 800, cls: 'disp num', fill: 'var(--orange)' });
      text(g, 500, 530, r2 ? `${n} ÷ ${d} = ${w2} remainder ${r2}, so ${n}/${d} = ${w2} whole${w2 === 1 ? '' : 's'} and ${r2}/${d}` : `${n} ÷ ${d} = ${w2}, so ${n}/${d} is exactly ${w2} whole${w2 === 1 ? '' : 's'}`, { 'font-size': 20, 'font-weight': 700, fill: 'var(--ink-2)' });
      text(g, 500, 565, `Back again: ${w2} × ${d} + ${r2} = ${n}, so the improper fraction is ${n}/${d}`, { 'font-size': 18, fill: 'var(--ink-3)' });
    }
    function draw() { clear(g); if (mode === 'bars') drawBars(); else if (mode === 'add') drawAdd(); else drawMixed(); }
    const dk = () => [...svg.closest('.work').querySelector('.dock').children];
    P.section('Mode');
    P.seg({ options: [['bars', 'Fraction bars'], ['add', 'Add and subtract'], ['mixed', 'Mixed numbers']], value: mode, onChange: v => { mode = v; [['bars', barBits], ['add', addBits], ['mixed', mixBits]].forEach(([m, bits]) => bits.forEach(e => e.hidden = m !== v)); draw(); } });
    let before = new Set(dk());
    P.section('Bars');
    P.note('Tap the dotted bar to add a bar. Use − and + to split a bar into parts, and × to remove it.');
    P.buttons([['Start a new wall', () => { bars = [{ d: 1, on: [0] }]; draw(); }, 'primary'], ['Ready-made wall', () => { bars = [1, 2, 3, 4, 5, 6, 8, 10].map(d => ({ d, on: Array(d).fill(0) })); draw(); }]]);
    P.button('Clear colours', () => { bars.forEach(b => b.on.fill(0)); draw(); });
    P.toggle({ label: 'Label the parts (1/4 and so on)', value: labels, onChange: v => { labels = v; draw(); } });
    P.toggle({ label: 'Flash when fractions are equivalent', value: eqFlash, onChange: v => eqFlash = v });
    P.section('Show for each bar');
    P.toggle({ label: 'Fraction', value: show.f, onChange: v => { show.f = v; draw(); } });
    P.toggle({ label: 'Simplest form', value: simplify, onChange: v => { simplify = v; draw(); } });
    P.toggle({ label: 'Decimal', value: show.d, onChange: v => { show.d = v; draw(); } });
    P.toggle({ label: 'Percentage', value: show.p, onChange: v => { show.p = v; draw(); } });
    P.toggle({ label: 'Ratio coloured : blank', value: show.r, onChange: v => { show.r = v; draw(); } });
    const barBits = dk().filter(k => !before.has(k)); before = new Set(dk());
    P.section('First fraction');
    P.stepper({ label: 'Numerator', value: A[0], min: 0, max: 24, onChange: v => { A[0] = v; draw(); } });
    P.stepper({ label: 'Denominator', value: A[1], min: 1, max: 12, onChange: v => { A[1] = v; draw(); } });
    P.seg({ options: [['+', 'Add +'], ['−', 'Subtract −']], value: op, onChange: v => { op = v; draw(); } });
    P.section('Second fraction');
    P.stepper({ label: 'Numerator', value: B[0], min: 0, max: 24, onChange: v => { B[0] = v; draw(); } });
    P.stepper({ label: 'Denominator', value: B[1], min: 1, max: 12, onChange: v => { B[1] = v; draw(); } });
    P.section('Steps');
    P.buttons([['Start again', () => { stage = 1; draw(); }], ['Next step', () => { stage = Math.min(3, stage + 1); draw(); }, 'primary']]);
    c.pulseWhen(c.btn('Next step'), () => mode === 'add' && stage < 3);
    const addBits = dk().filter(k => !before.has(k)); addBits.forEach(e => e.hidden = true); before = new Set(dk());
    P.section('Improper fraction');
    const mixSt = [P.stepper({ label: 'Numerator', value: MN[0], min: 1, max: 60, onChange: v => { MN[0] = v; draw(); } }),
    P.stepper({ label: 'Denominator', value: MN[1], min: 2, max: 12, onChange: v => { MN[1] = v; draw(); } })];
    P.button('Random improper fraction', () => { const d = rnd(2, 8); MN = [rnd(d + 1, d * 4), d]; mixSt.forEach((s2, i) => s2.set(MN[i], true)); draw(); });
    const mixBits = dk().filter(k => !before.has(k)); mixBits.forEach(e => e.hidden = true);
    [['bars', barBits], ['add', addBits], ['mixed', mixBits]].forEach(([m, bits]) => bits.forEach(e => e.hidden = m !== mode));
    draw();
  }
});

tool({
  id: 'ratio', name: 'Ratio and proportion', strand: 'frac', years: [5, 6], w: 1000, h: 680,
  desc: 'Model part : part : part = whole with bar models and counters, in liquids, weights, amounts and money, linked to fractions.',
  tags: 'ratio proportion scaling sharing bar model part whole fractions recipe mixing',
  icon: '<rect x="4" y="16" width="40" height="14" rx="2"/><path d="M14 16v14M24 16v14M34 16v14"/><rect x="4" y="16" width="20" height="14" fill="currentColor" opacity=".35"/><path d="M4 36q20 8 40 0"/>',
  guide: ['Choose what you are mixing or sharing: liquids in ml, weights in g, amounts of objects, or money in pounds.', 'Set 2, 3 or 4 parts and the ratio for each. The bar model shows every part as equal boxes, so you can see part : part : part = whole.', 'Set what one part is worth, or type a total to share. Each amount and its fraction of the whole is worked out in the table.', 'Switch to Counters to build the ratio up batch by batch. The table shows how the amounts grow while the fractions stay the same.'],
  mount(c) {
    const { svg, P } = c;
    const CTX = {
      liquid: { unit: 'ml', pre: '', step: 25, per: 50, names: ['Orange juice', 'Lemonade', 'Cranberry', 'Water'], noun: 'drink', verb: 'mixed' },
      weight: { unit: 'g', pre: '', step: 25, per: 50, names: ['Flour', 'Sugar', 'Butter', 'Oats'], noun: 'mixture', verb: 'mixed' },
      amount: { unit: '', pre: '', step: 1, per: 1, names: ['Red beads', 'Blue beads', 'Green beads', 'Yellow beads'], noun: 'bracelet', verb: 'used' },
      money: { unit: '', pre: '£', step: 1, per: 5, names: ['Amy', 'Ben', 'Cara', 'Dev'], noun: 'money', verb: 'shared' },
    };
    const COLS = ['orange', 'blue', 'green', 'purple'];
    let ctx = 'liquid', nParts = 2, ratio = [2, 3, 1, 2], names = CTX.liquid.names.slice(), per = 50, view = 'bar', batches = 1, simplify = true;
    c.persist(() => ({ ctx, nParts, ratio, names, per, view, batches, simplify }), s => ({ ctx, nParts, ratio, names, per, view, batches, simplify } = Object.assign({ ctx, nParts, ratio, names, per, view, batches, simplify }, s)));
    const g = S('g', {}, svg);
    const C = () => CTX[ctx];
    const fmtAmt = v => `${C().pre}${nf(+v.toFixed(2))}${C().unit ? ' ' + C().unit : ''}`;
    const parts = () => ratio.slice(0, nParts), sum = () => parts().reduce((a, b) => a + b, 0);
    function fracEl(x, y, a, b, fs, cl) { text(g, x, y - fs * .62, String(a), { 'font-size': fs, 'font-weight': 800, cls: 'num', fill: cl }); S('line', { x1: x - fs * .7, y1: y, x2: x + fs * .7, y2: y, stroke: cl || 'var(--ink)', 'stroke-width': 2.5 }, g); text(g, x, y + fs * .66, String(b), { 'font-size': fs, 'font-weight': 800, cls: 'num', fill: cl }); }
    function ratioLine(y) {
      const ps = parts(), seq = [];
      ps.forEach((v, i) => { if (i) seq.push([':', 'var(--ink-3)']); seq.push([String(v), col(COLS[i])]); });
      seq.push(['=', 'var(--ink-3)'], [String(sum()), 'var(--ink)'], ['parts', 'var(--ink-3)']);
      const w = seq.map(([t]) => t === 'parts' ? 80 : t.length * 30 + 22), tot = w.reduce((a, b) => a + b, 0); let x = 500 - tot / 2;
      seq.forEach(([t, cl], i) => { text(g, x + w[i] / 2, y, t, { 'font-size': t === 'parts' ? 24 : 50, 'font-weight': 800, cls: 'disp num', fill: cl }); x += w[i]; });
      const g2 = gcd(ps.reduce((a, b) => gcd(a, b)), 0) || 1; const red = ps.reduce((a, b) => gcd(a, b));
      if (red > 1) text(g, 500, y + 40, `In its simplest form: ${ps.map(v => v / red).join(' : ')}`, { 'font-size': 18, fill: 'var(--ink-2)' });
    }
    function drawBar() {
      const ps = parts(), T = sum(), x0 = 60, W = 880, bw = W / T, y = 130, h = 70;
      let k = 0;
      ps.forEach((v, i) => { for (let j = 0; j < v; j++, k++) { S('rect', { x: x0 + k * bw, y, width: bw, height: h, fill: col(COLS[i]), stroke: 'var(--ink)', 'stroke-width': 2 }, g); if (bw > 46) text(g, x0 + k * bw + bw / 2, y + h / 2, fmtAmt(per), { 'font-size': Math.min(16, bw * .22), 'font-weight': 800, fill: '#fff', cls: 'num' }); } });
      let kk = 0; ps.forEach((v, i) => { const xa = x0 + kk * bw, xb = xa + v * bw; S('path', { d: `M${xa + 4} ${y - 10} V${y - 18} H${xb - 4} V${y - 10}`, fill: 'none', stroke: col(COLS[i]), 'stroke-width': 3 }, g); text(g, (xa + xb) / 2, y - 30, names[i], { 'font-size': 16, 'font-weight': 800, fill: col(COLS[i]) }); kk += v; });
      S('path', { d: `M${x0} ${y + h + 10} V${y + h + 20} H${x0 + W} V${y + h + 10}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      text(g, 500, y + h + 44, `Whole: ${T} equal parts, each worth ${fmtAmt(per)}, so the whole is ${fmtAmt(per * T)}`, { 'font-size': 20, 'font-weight': 800 });
      // table
      const ty = 320, colsX = [70, 330, 470, 640, 820];
      ['Part', 'Ratio', 'Fraction of the whole', 'Working', 'Amount'].forEach((hd, i) => text(g, colsX[i], ty, hd, { 'font-size': 15, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': i ? 'middle' : 'start' }));
      ps.forEach((v, i) => {
        const yy = ty + 50 + i * 66, gg = simplify ? gcd(v, T) : 1;
        S('rect', { x: 50, y: yy - 30, width: 900, height: 60, rx: 12, fill: i % 2 ? 'var(--board)' : 'var(--board-2)' }, g);
        S('rect', { x: 70, y: yy - 11, width: 22, height: 22, rx: 5, fill: col(COLS[i]) }, g);
        text(g, 102, yy, names[i], { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'start' });
        text(g, colsX[1], yy, String(v), { 'font-size': 24, 'font-weight': 800, cls: 'num', fill: col(COLS[i]) });
        fracEl(colsX[2] - (gg > 1 ? 28 : 0), yy, v, T, 18, col(COLS[i]));
        if (gg > 1) { text(g, colsX[2], yy, '=', { 'font-size': 20, 'font-weight': 800 }); fracEl(colsX[2] + 28, yy, v / gg, T / gg, 18, col(COLS[i])); }
        text(g, colsX[3], yy, `${v} × ${fmtAmt(per)}`, { 'font-size': 18, cls: 'num' });
        text(g, colsX[4], yy, fmtAmt(v * per), { 'font-size': 22, 'font-weight': 800, cls: 'num' });
      });
      const yT = ty + 50 + ps.length * 66;
      S('line', { x1: 50, y1: yT - 26, x2: 950, y2: yT - 26, stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      text(g, 102, yT, 'Whole', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'start' }); text(g, colsX[1], yT, String(T), { 'font-size': 24, 'font-weight': 800, cls: 'num' }); fracEl(colsX[2], yT, T, T, 18); text(g, colsX[2] + 40, yT, '= 1', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'start' }); text(g, colsX[4], yT, fmtAmt(T * per), { 'font-size': 22, 'font-weight': 800, cls: 'num' });
    }
    function drawCounters() {
      const ps = parts(), T = sum(), maxB = 10, bw = Math.min(88, 880 / Math.max(batches, 4)), r = Math.min(11, bw / 7);
      const x0 = 500 - batches * bw / 2, y0 = 110;
      for (let b = 0; b < batches; b++) {
        const x = x0 + b * bw; let rowY = 0;
        const perRow = Math.max(1, Math.floor((bw - 16) / (r * 2.4))), rowsN = ps.reduce((t2, v) => t2 + Math.ceil(v / perRow) + .4, 0), bh = Math.min(250, 30 + rowsN * r * 2.4);
        S('rect', { x: x + 4, y: y0, width: bw - 8, height: bh, rx: 12, fill: 'var(--board-2)', stroke: 'var(--line-2)', 'stroke-dasharray': '6 5' }, g);
        text(g, x + bw / 2, y0 + bh + 18, `Batch ${b + 1}`, { 'font-size': 13, fill: 'var(--ink-3)' });
        ps.forEach((v, i) => { for (let j = 0; j < v; j++) { const cx = x + 12 + r + (j % perRow) * r * 2.4, cy = y0 + 16 + r + (rowY + Math.floor(j / perRow)) * r * 2.4; S('circle', { cx, cy, r, fill: col(COLS[i]), stroke: 'var(--ink)', 'stroke-width': 1.2 }, g); } rowY += Math.ceil(v / perRow) + .4; });
      }
      // table
      const ty = 410, cx = [110, ...ps.map((_, i) => 250 + i * 150), 250 + ps.length * 150];
      ['Batches', ...names.slice(0, nParts), 'Total'].forEach((hd, i) => text(g, cx[i], ty, hd, { 'font-size': 15, 'font-weight': 800, fill: i && i <= nParts ? col(COLS[i - 1]) : 'var(--ink-3)' }));
      const showRows = [1, batches].filter((v, i, a) => a.indexOf(v) === i);
      showRows.forEach((bb, k) => { const yy = ty + 36 + k * 40; text(g, cx[0], yy, String(bb), { 'font-size': 22, 'font-weight': 800, cls: 'num' }); ps.forEach((v, i) => text(g, cx[i + 1], yy, String(v * bb), { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: col(COLS[i]) })); text(g, cx[nParts + 1], yy, String(T * bb), { 'font-size': 22, 'font-weight': 800, cls: 'num' }); });
      const yF = ty + 36 + showRows.length * 40 + 30;
      ps.forEach((v, i) => { const gg = gcd(v * batches, T * batches); text(g, 500, yF + i * 30, `${names[i]}: ${v * batches} out of ${T * batches}  =  ${v * batches}/${T * batches}  =  ${v * batches / gg}/${T * batches / gg} of all the counters`, { 'font-size': 18, 'font-weight': 700, fill: col(COLS[i]) }); });
    }
    function draw() { clear(g); ratioLine(56); if (view === 'bar') drawBar(); else drawCounters(); }
    const nameHost = H('div');
    const rSteps = [];
    function rebuildParts() {
      clear(nameHost); rSteps.length = 0;
      for (let i = 0; i < nParts; i++) {
        const sub = Panel(nameHost);
        const inp = H('input', { value: names[i], 'aria-label': `Name of part ${i + 1}`, style: `height:36px;width:100%;box-sizing:border-box;border:2px solid var(--${COLS[i]});border-radius:10px;background:var(--board-2);padding:0 10px;margin-top:8px;font-weight:700` });
        inp.addEventListener('input', () => { names[i] = inp.value; draw(); }); nameHost.append(inp);
        rSteps.push(sub.stepper({ label: 'Parts', value: ratio[i], min: 1, max: 12, onChange: v => { ratio[i] = v; draw(); } }));
      }
    }
    P.section('View');
    P.seg({ options: [['bar', 'Bar model'], ['counters', 'Counters']], value: view, onChange: v => { view = v; barBits.forEach(e => e.hidden = v !== 'bar'); cntBits.forEach(e => e.hidden = v !== 'counters'); draw(); } });
    P.section('What are we mixing or sharing?');
    P.seg({ options: [['liquid', 'Liquid (ml)'], ['weight', 'Weight (g)'], ['amount', 'Amounts'], ['money', 'Money (£)']], value: ctx, onChange: v => { ctx = v; names = CTX[v].names.slice(); per = CTX[v].per; perS.set(per, true); rebuildParts(); draw(); } });
    P.section('Parts');
    P.seg({ options: [[2, '2 parts'], [3, '3 parts'], [4, '4 parts']], value: nParts, onChange: v => { nParts = v; rebuildParts(); draw(); } });
    P.raw(nameHost);
    const dk = () => [...svg.closest('.work').querySelector('.dock').children];
    let before = new Set(dk());
    P.section('Amounts');
    const perS = P.stepper({ label: 'One part is worth', value: per, min: 1, max: 1000, step: v => C().step, fmt: v => fmtAmt(v), onChange: v => { per = v; draw(); } });
    const tf = P.field({ label: 'Or type a total to share', value: '', type: 'number', live: false, onChange: v => { const t = +v; if (!t || t <= 0) return; per = +(t / sum()).toFixed(2); perS.set(per, true); draw(); } });
    P.toggle({ label: 'Simplify the fractions', value: simplify, onChange: v => { simplify = v; draw(); } });
    const barBits = dk().filter(k => !before.has(k)); before = new Set(dk());
    P.section('Batches');
    P.buttons([['Remove a batch', () => { batches = Math.max(1, batches - 1); draw(); }], ['Add a batch', () => { batches = Math.min(10, batches + 1); draw(); }, 'primary']]);
    const cntBits = dk().filter(k => !before.has(k)); barBits.forEach(e => e.hidden = view !== 'bar'); cntBits.forEach(e => e.hidden = view !== 'counters');
    rebuildParts(); draw();
  }
});

tool({
  id: 'area', name: 'Area and perimeter', strand: 'geom', years: [3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Build compound shapes from coloured squares, or stretch elastic bands, and see the area and perimeter.',
  tags: 'area perimeter compound shapes rectilinear geoboard elastic band squares units',
  icon: '<g fill="currentColor" stroke="none"><circle cx="8" cy="8" r="2"/><circle cx="24" cy="8" r="2"/><circle cx="40" cy="8" r="2"/><circle cx="8" cy="24" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="40" cy="24" r="2"/><circle cx="8" cy="40" r="2"/><circle cx="24" cy="40" r="2"/><circle cx="40" cy="40" r="2"/></g><path d="M8 8h16v16h16v16H8z"/>',
  guide: ['Pick a colour and tap squares to build a shape. The first square can go anywhere. Every square after that must join the shape along a side, so you always have one whole shape.', 'Use different colours for each part of a compound shape. The areas of the colours are added up for you, and the perimeter of the whole shape is always shown.', 'Choose the unit, such as cm or m, in the panel. With no unit chosen, area is in square units and perimeter in units.', 'Add an elastic band and drag its pins. Tap anywhere on a band’s edge to add a new pin there, up to 20 pins. Pins always snap to the grid.'],
  mount(c) {
    const { svg, P } = c;
    let n = 10, cells = {}, shape = 'sq', colour = 'blue', look = 'grid', bands = [], unit = 'units', showBandM = true;
    const g = S('g', {}, svg), bg = S('g', {}, svg), mg = S('g', {}, svg);
    const geo = () => { const s = 580 / n; return { s, x0: 30, y0: 30 }; };
    const snap = (x, y) => { const { s, x0, y0 } = geo(); return [x0 + clamp(Math.round((x - x0) / s), 0, n) * s, y0 + clamp(Math.round((y - y0) / s), 0, n) * s]; };
    const tri = { tl: [[0, 0], [1, 0], [0, 1]], tr: [[0, 0], [1, 0], [1, 1]], bl: [[0, 0], [0, 1], [1, 1]], br: [[1, 0], [1, 1], [0, 1]] };
    const corners = shp => shp === 'sq' ? [[0, 0], [1, 0], [1, 1], [0, 1]] : tri[shp];
    const ekey = (a, b) => { const [p, q] = [a, b].sort((u, v) => u[0] - v[0] || u[1] - v[1]); return p.join(',') + '|' + q.join(','); };
    function edgesOf(k, shp) { const [r, cc] = k.split(',').map(Number), cs = corners(shp).map(([x, y]) => [cc + x, r + y]); return cs.map((p, i) => { const q = cs[(i + 1) % cs.length]; return { k: ekey(p, q), diag: p[0] !== q[0] && p[1] !== q[1] }; }); }
    const sideSet = list => { const s2 = new Set(); list.forEach(([k, v]) => edgesOf(k, v.s).forEach(e => { if (!e.diag) s2.add(e.k); })); return s2; };
    const touches = (k, shp, others) => { const set = sideSet(others); return edgesOf(k, shp).some(e => !e.diag && set.has(e.k)); };
    function connected(map) { const keys = Object.keys(map); if (keys.length <= 1) return true; const seen = new Set([keys[0]]), q = [keys[0]]; while (q.length) { const k = q.shift(); keys.forEach(o => { if (!seen.has(o) && touches(o, map[o].s, [[k, map[k]]])) { seen.add(o); q.push(o); } }); } return seen.size === keys.length; }
    const uA = () => unit === 'units' ? 'sq units' : unit + '²', uP = () => unit;
    function perimeter() { const cnt = {}, len = {}; Object.entries(cells).forEach(([k, v]) => edgesOf(k, v.s).forEach(e => { cnt[e.k] = (cnt[e.k] || 0) + 1; len[e.k] = e.diag ? Math.SQRT2 : 1; })); let p = 0, d = 0; for (const k in cnt) if (cnt[k] === 1) { if (len[k] === 1) p += 1; else d++; } return { p, d }; }
    function tap(k) {
      const cur = cells[k];
      if (cur && cur.s === shape && cur.c === colour) { const next = Object.assign({}, cells); delete next[k]; if (!connected(next)) return c.toast('Removing that square would split the shape in two'); cells = next; draw(); return; }
      const next = Object.assign({}, cells); next[k] = { s: shape, c: colour };
      const others = Object.entries(cells).filter(([kk]) => kk !== k);
      if (others.length && !touches(k, shape, others)) return c.toast('Squares must join the shape along a side');
      if (!connected(next)) return c.toast('That change would split the shape in two');
      cells = next; draw();
    }
    function draw() {
      clear(g); const { s, x0, y0 } = geo();
      S('rect', { x: x0, y: y0, width: s * n, height: s * n, fill: 'var(--board)', stroke: look === 'grid' ? 'var(--ink-3)' : 'transparent', 'stroke-width': 1.5 }, g);
      for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
        const k = r + ',' + cc, x = x0 + cc * s, y = y0 + r * s, v = cells[k];
        const cell = S('g', { cls: 'hit' }, g);
        S('rect', { x, y, width: s, height: s, fill: 'transparent', stroke: look === 'grid' ? 'var(--line)' : 'transparent' }, cell);
        if (v) S('polygon', { points: corners(v.s).map(([a, b]) => `${x + a * s},${y + b * s}`).join(' '), fill: col(v.c), opacity: .85 }, cell);
        cell.addEventListener('click', () => tap(k));
      }
      // outline of whole shape
      const cnt = {}; Object.entries(cells).forEach(([k, v]) => edgesOf(k, v.s).forEach(e => cnt[e.k] = (cnt[e.k] || 0) + 1));
      for (const k in cnt) if (cnt[k] === 1) { const [p, q] = k.split('|').map(t => t.split(',').map(Number)); S('line', { x1: x0 + p[0] * s, y1: y0 + p[1] * s, x2: x0 + q[0] * s, y2: y0 + q[1] * s, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round', 'pointer-events': 'none' }, g); }
      for (let r = 0; r <= n; r++) for (let cc = 0; cc <= n; cc++) S('circle', { cx: x0 + cc * s, cy: y0 + r * s, r: look === 'pins' ? 4 : 2.2, fill: 'var(--ink-2)', 'pointer-events': 'none' }, g);
      measures();
    }
    function measures() {
      clear(mg); const { s } = geo();
      let y = 50; const X = 650;
      const head = t => { text(mg, X, y, t, { 'font-size': 20, 'font-weight': 800, cls: 'disp', 'text-anchor': 'start' }); y += 34; };
      const row = (l, v, cl) => { text(mg, X, y, l, { 'font-size': 17, fill: 'var(--ink-2)', 'text-anchor': 'start' }); text(mg, 975, y, v, { 'font-size': 22, 'font-weight': 800, cls: 'num', 'text-anchor': 'end', fill: cl || 'var(--ink)' }); y += 34; };
      const vals = Object.values(cells);
      if (vals.length) {
        head('Your shape');
        const byC = {}; vals.forEach(v => byC[v.c] = (byC[v.c] || 0) + (v.s === 'sq' ? 1 : .5));
        const keys = Object.keys(byC), total = keys.reduce((t, k) => t + byC[k], 0);
        if (keys.length > 1) { let x = X; keys.forEach((k, i) => { if (i) { text(mg, x + 6, y, '+', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'start' }); x += 24; } const t = nf(byC[k]); S('rect', { x, y: y - 16, width: t.length * 13 + 18, height: 32, rx: 8, fill: col(k) }, mg); text(mg, x + (t.length * 13 + 18) / 2, y + 1, t, { 'font-size': 19, 'font-weight': 800, fill: '#fff', cls: 'num' }); x += t.length * 13 + 22; }); text(mg, x + 8, y, `= ${nf(total)}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'start', cls: 'num' }); y += 40; }
        row('Area', `${nf(total)} ${uA()}`, 'var(--accent)');
        const { p, d } = perimeter();
        row('Perimeter', d ? `${p} + ${d}√2 ≈ ${nf(+(p + d * Math.SQRT2).toFixed(2))} ${uP()}` : `${p} ${uP()}`, 'var(--accent)');
        y += 14;
      } else { text(mg, X, y, 'Tap a square to start a shape', { 'font-size': 18, fill: 'var(--ink-3)', 'text-anchor': 'start' }); y += 44; }
      if (showBandM) bands.forEach((b, i) => {
        const p = b.pts, A = shoelace(p) / (s * s); let per = 0, straight = true;
        for (let j = 0; j < p.length; j++) { const q = p[(j + 1) % p.length], dx = (q[0] - p[j][0]) / s, dy = (q[1] - p[j][1]) / s; per += Math.hypot(dx, dy); if (dx && dy) straight = false; }
        head(`Band ${i + 1}  (${p.length} pins)`);
        row('Area', `${nf(+A.toFixed(2))} ${uA()}`, col(b.colour));
        row('Perimeter', straight ? `${nf(+per.toFixed(2))} ${uP()}` : `≈ ${nf(+per.toFixed(2))} ${uP()}`, col(b.colour));
        y += 8;
      });
    }
    function bandTool(pts, colourName) {
      const grp = S('g', {}, bg), obj = { pts, colour: colourName, g: grp };
      obj.draw = () => {
        clear(grp); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + 'Z';
        S('path', { d, fill: col(colourName), 'fill-opacity': .2, stroke: col(colourName), 'stroke-width': 5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, grp);
        pts.forEach((p, i) => {
          const q = pts[(i + 1) % pts.length];
          const e = S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: 'transparent', 'stroke-width': 22, cls: 'hit' }, grp);
          e.addEventListener('click', ev => { if (pts.length >= 20) return c.toast('A band can have up to 20 pins'); const m = c.pt(ev), np = snap(m.x, m.y); if (pts.some(r => r[0] === np[0] && r[1] === np[1])) return; pts.splice(i + 1, 0, np); obj.draw(); measures(); });
        });
        pts.forEach((p, i) => { const h = S('g', { cls: 'grab' }, grp); S('circle', { cx: p[0], cy: p[1], r: 20, fill: 'transparent' }, h); S('circle', { cx: p[0], cy: p[1], r: 9, fill: col(colourName), stroke: 'var(--board)', 'stroke-width': 3 }, h); c.drag(h, { move: m => { pts[i] = snap(m.x, m.y); obj.draw(); measures(); } }); });
      };
      obj.draw(); return obj;
    }
    function addBand() {
      const { s, x0, y0 } = geo(), k = Math.max(1, Math.floor(n / 5)), off = (bands.length % 3) * k;
      const pts = [[x0 + (k + off) * s, y0 + (k + off) * s], [x0 + (k * 3 + off) * s, y0 + (k + off) * s], [x0 + (k * 3 + off) * s, y0 + (k * 3 + off) * s], [x0 + (k + off) * s, y0 + (k * 3 + off) * s]].map(p => snap(...p));
      bands.push(bandTool(pts, colour)); measures();
    }
    P.section('Grid');
    const warn = H('div', { hidden: true, style: 'background:var(--yellow-s);border:1px solid var(--yellow);border-radius:12px;padding:10px 12px;margin:6px 0' });
    function resize(v) {
      const old = n, { s: os, x0, y0 } = geo();
      if (v > old) {
        const off = Math.floor((v - old) / 2), nc = {};
        for (const k in cells) { const [r, cc] = k.split(',').map(Number); nc[(r + off) + ',' + (cc + off)] = cells[k]; }
        cells = nc; n = v; const ns = geo().s;
        bands.forEach(b => b.pts.forEach((p, i) => { b.pts[i] = [x0 + ((p[0] - x0) / os + off) * ns, y0 + ((p[1] - y0) / os + off) * ns]; }));
      } else { n = v; cells = {}; clear(bg); bands = []; }
      warn.hidden = true; draw(); bands.forEach(b => b.draw()); measures();
    }
    const gridSeg = P.seg({ options: [[5, '5 \u00d7 5'], [10, '10 \u00d7 10'], [20, '20 \u00d7 20']], value: n, onChange: v => {
      if (v < n && (Object.keys(cells).length || bands.length)) {
        gridSeg.set(n, true); clear(warn); warn.hidden = false;
        warn.append(H('p', { cls: 'note', style: 'margin:0 0 8px;color:var(--ink)', text: 'A smaller grid clears the page. Your shape and bands will be removed.' }),
          H('div', { cls: 'btnrow' }, H('button', { cls: 'btn primary', text: 'Clear and change', on: { click: () => { gridSeg.set(v, true); resize(v); } } }), H('button', { cls: 'btn', text: 'Keep this grid', on: { click: () => { warn.hidden = true; } } })));
        return;
      }
      resize(v);
    } });
    P.raw(warn);
    P.seg({ options: [['grid', 'Squared grid'], ['pins', 'Pinboard']], value: look, onChange: v => { look = v; draw(); } });
    P.section('Units');
    P.seg({ options: [['units', 'None'], ['mm', 'mm'], ['cm', 'cm'], ['m', 'm'], ['km', 'km']], value: unit, onChange: v => { unit = v; measures(); } });
    P.section('Build a shape');
    P.seg({ options: [['sq', 'Square ■'], ['tl', '◤'], ['tr', '◥'], ['bl', '◣'], ['br', '◢']], value: shape, onChange: v => shape = v });
    P.swatches({ value: colour, colors: ['blue', 'green', 'yellow', 'purple', 'red', 'orange'], onChange: v => { colour = v; } });
    P.button('Clear the shape', () => { cells = {}; draw(); });
    P.section('Elastic bands');
    P.button('Add a band', addBand, 'primary');
    P.note('Tap a band’s edge to add a pin. Bands use the colour picked above.');
    P.buttons([['Remove last band', () => { const b = bands.pop(); if (b) b.g.remove(); measures(); }], ['Remove all bands', () => { clear(bg); bands = []; measures(); }]]);
    P.toggle({ label: 'Show band measurements', value: showBandM, onChange: v => { showBandM = v; measures(); } });
    P.section();
    P.button('Clear the page', () => { cells = {}; clear(bg); bands = []; draw(); }, 'primary');
    draw();
  }
});

tool({
  id: 'isometric', name: 'Isometric grid', strand: 'geom', years: [4, 5, 6], w: 1000, h: 640,
  desc: 'Colour triangles to draw 3D shapes, and stretch as many bands as you like between isometric dots.',
  tags: 'isometric 3d cubes triangles dotty paper',
  icon: '<path d="M24 6l16 9v18l-16 9-16-9V15z"/><path d="M24 24l16-9M24 24L8 15M24 24v18"/>',
  guide: ['Tap a triangle to colour it. Tap again to clear it. Use three shades to make cubes look solid.', 'Choose a colour, then tap Add a band. Every band is in the colour you picked, and you can add as many as you like.', 'Drag a band’s corners onto the dots to make shapes.', 'Use the size slider, or Large, Medium and Small, to change the spacing of the dots.'],
  mount(c) {
    const { svg, P } = c;
    let s = 44, cells = {}, colour = 'blue', look = 'lines', bands = [], bandPins = 4;
    const g = S('g', {}, svg), bg = S('g', {}, svg);
    const H3 = () => s * Math.sqrt(3) / 2;
    const counts = () => ({ cols: Math.floor(580 / (s / 2)), rows: Math.floor(940 / H3()) });
    const pt = (i, j) => [30 + j * H3(), 30 + i * s + (j % 2 ? s / 2 : 0)];
    const snap = (x, y) => { const { cols, rows } = counts(); const j = clamp(Math.round((x - 30) / H3()), 0, rows); const i = clamp(Math.round((y - 30 - (j % 2 ? s / 2 : 0)) / s), 0, Math.floor(cols / 2)); return pt(i, j); };
    function draw() {
      clear(g); const { cols, rows } = counts();
      for (let j = 0; j < rows; j++) for (let i = 0; i < Math.floor(cols / 2); i++) {
        const odd = j % 2, A = pt(i, j), B = pt(i + 1, j), Cc = odd ? pt(i + 1, j + 1) : pt(i, j + 1), D = odd ? pt(i, j + 1) : pt(i + 1, j + 1);
        const t1 = [A, B, Cc], t2 = odd ? [B, Cc, pt(i + 2, j + 1)] : [B, D, Cc];
        [[t1, 'd'], [t2, 'u']].forEach(([tp, k]) => {
          if (tp.some(q => q[1] > 625)) return;
          const key = `${i},${j},${k}`, v = cells[key];
          const p = S('polygon', { points: tp.map(q => q.join(',')).join(' '), fill: v ? col(v) : 'transparent', stroke: look === 'lines' ? 'var(--line)' : 'transparent', 'stroke-width': 1, cls: 'hit' }, g);
          p.addEventListener('click', () => { if (cells[key] === colour) delete cells[key]; else cells[key] = colour; draw(); });
        });
      }
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= Math.floor(cols / 2); i++) { const [x, y] = pt(i, j); if (y < 628 && x < 990) S('circle', { cx: x, cy: y, r: Math.max(2, s / 17), fill: 'var(--ink-2)', 'pointer-events': 'none' }, g); }
    }
    function rescale(ns) { const r = ns / s; bands.forEach(b => { b.pts.forEach((p, k) => { b.pts[k] = [30 + (p[0] - 30) * r, 30 + (p[1] - 30) * r]; }); }); s = ns; bands.forEach(b => b.pts.forEach((p, k) => b.pts[k] = snap(p[0], p[1]))); draw(); bands.forEach(b => b.draw()); slider.value = ns; }
    function addBand() {
      const k = bandPins, pts = [], cx = 320 + (bands.length % 4) * 110, cy = 300 + (bands.length % 3) * 40, r = Math.max(2, Math.round(120 / s)) * s;
      for (let i = 0; i < k; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / k; pts.push(snap(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
      bands.push(band(c, bg, pts, { colour: colour, snap, fill: false, insert: true, max: 20 }));
    }
    P.section('Colour');
    P.swatches({ value: colour, colors: ['blue', 'blue-s', 'teal', 'yellow', 'orange', 'red', 'green', 'purple'], onChange: v => colour = v });
    P.button('Clear coloured triangles', () => { cells = {}; draw(); });
    P.seg({ options: [['lines', 'Triangle grid'], ['dots', 'Dots only']], value: look, onChange: v => { look = v; draw(); } });
    P.section('Dot spacing');
    const sw = H('div', { cls: 'ctl' }, H('span', { cls: 'l', text: 'Spacing' }));
    const slider = H('input', { type: 'range', min: 24, max: 80, value: s, 'aria-label': 'Dot spacing', style: 'width:150px;accent-color:var(--accent)' });
    slider.addEventListener('input', () => rescale(+slider.value)); sw.append(slider); P.raw(sw);
    P.buttons([['Large', () => rescale(70)], ['Medium', () => rescale(44)], ['Small', () => rescale(30)]]);
    P.section('Elastic bands');
    P.seg({ label: 'Corners on a new band', options: [[3, '3'], [4, '4'], [5, '5'], [6, '6']], value: bandPins, onChange: v => bandPins = v });
    P.button('Add a band', addBand, 'primary');
    P.note('Each new band uses the colour picked above. Tap a band\u2019s edge to add a pin.');
    P.buttons([['Remove last band', () => { const b = bands.pop(); if (b) b.g.remove(); }], ['Remove all', () => { clear(bg); bands = []; }]]);
    const cube = (i, j) => { const k = (a, b, t) => `${a},${b},${t}`; cells[k(i - 2, j - 1, 'u')] = 'blue-s'; cells[k(i - 1, j - 1, 'd')] = 'blue-s'; cells[k(i - 1, j - 1, 'u')] = 'blue'; cells[k(i, j, 'd')] = 'blue'; cells[k(i - 1, j, 'd')] = 'teal'; cells[k(i - 1, j, 'u')] = 'teal'; };
    draw();
  }
});

tool({
  id: 'fix-points', name: 'Angles in shapes', strand: 'geom', years: [3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Explore the angles in regular and irregular shapes up to 12 sides, or draw your own. Angles start hidden so the class can predict, then measure with a protractor and reveal them.',
  tags: 'angles shapes polygon protractor measure interior total missing unknown regular irregular triangles quadrilateral fix points pinboard',
  icon: '<path d="M8 38L14 10L40 16L34 40z"/><g fill="currentColor" stroke="none"><circle cx="8" cy="38" r="3"/><circle cx="14" cy="10" r="3"/><circle cx="40" cy="16" r="3"/><circle cx="34" cy="40" r="3"/></g><path d="M14 18a8 8 0 0 0 7-6"/>',
  guide: ['The board starts blank. In Shapes, choose the type: Regular or Irregular (then the number of sides and Make the shape), or pick a named triangle or quadrilateral.', 'Ready-made shapes start with every angle hidden as ?. Tap a ? to reveal that angle, or use Show all angles in Reveal.', 'Show the total explains what the angles add up to by splitting the shape into triangles. Hide one gives a missing-angle problem, with the working when you want it.', 'Free draw: tap Start drawing, then tap the board for each corner. Drag corners to change the shape. Lock corners stops them moving.', 'Tools: turn on the protractor and use Protractor to next corner to line it up on each corner in turn. Reset clears the board.'],
  mount(c) {
    const { svg, P } = c;
    let pts = [], n = 10, grid = true, lock = false, hidden = {}, splitT = false, kind = '', drawing = false, working = false, nSides = 5, showTot = false, stype = 'regular', protOn = false, pr = { x: 340, y: 420, rot: 0, flip: false, corner: -1 };
    c.persist(() => ({ pts, n, grid, lock, hidden, splitT, kind, nSides, working, showTot, stype }), s => ({ pts, n, grid, lock, hidden, splitT, kind, nSides, working, showTot, stype } = Object.assign({ pts, n, grid, lock, hidden, splitT, kind, nSides, working, showTot, stype }, s)));
    const showAng = true, rightMarks = true;
    const bgG = S('g', {}, svg), g = S('g', {}, svg), pg = S('g', {}, svg);
    const X0 = 40, Y0 = 40, SZ = 560, cell = () => SZ / n;
    const NAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 11: 'hendecagon', 12: 'dodecagon' };
    const COLS = ['red', 'blue', 'green', 'orange', 'purple', 'teal', 'pink', 'yellow'];
    const snapF = (x, y) => { const s = cell(); x = clamp(x, X0, X0 + SZ); y = clamp(y, Y0, Y0 + SZ); return grid ? [X0 + Math.round((x - X0) / s) * s, Y0 + Math.round((y - Y0) / s) * s] : [x, y]; };
    // ---------- geometry ----------
    const area2 = p => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + (q[0] * r[1] - r[0] * q[1]); }, 0);
    function angles(p) {
      const k = p.length; if (k < 3) return [];
      const sg = Math.sign(area2(p)) || 1;
      return p.map((q, i) => { const a = p[(i - 1 + k) % k], b = p[(i + 1) % k], v1 = [a[0] - q[0], a[1] - q[1]], v2 = [b[0] - q[0], b[1] - q[1]]; let d = Math.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1[0] * v2[0] + v1[1] * v2[1]) * 180 / Math.PI; d = ((d * -sg) % 360 + 360) % 360; return d; });
    }
    const round1 = v => Math.round(v * 10) / 10;
    const fmtA = v => (Math.abs(v - Math.round(v)) < .05 ? Math.round(v) : round1(v)) + '°';
    const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]) / cell();
    // ---------- shapes ----------
    function regular(k) { const r = Math.min(250, SZ / 2 - 20), cx = X0 + SZ / 2, cy = Y0 + SZ / 2 + (k === 3 ? 30 : 0), off = k % 2 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / k; return Array.from({ length: k }, (_, i) => { const a = off + i * 2 * Math.PI / k; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }); }
    function irregular(k) {
      const cx = X0 + SZ / 2, cy = Y0 + SZ / 2; let best = null;
      for (let t = 0; t < 40; t++) {
        const angs = Array.from({ length: k }, (_, i) => (i + .5 + (Math.random() - .5) * .7) * 2 * Math.PI / k).sort((a, b) => a - b);
        const p = angs.map(a => { const r = 150 + Math.random() * 110; return snapF(cx + r * Math.cos(a), cy + r * Math.sin(a)); });
        const ok = p.every((q, i) => p.findIndex(r => r[0] === q[0] && r[1] === q[1]) === i) && angles(p).every(a => a > 25 && a < 335);
        if (ok) { best = p; break; }
      }
      return best || regular(k);
    }
    const u = v => X0 + v * cell(), w = v => Y0 + v * cell();
    function named(id) {
      const m = n; const q = (a, b) => [u(a * m / 10), w(b * m / 10)];
      const S2 = { rightTri: [q(2, 8), q(8, 8), q(2, 3)], isoTri: [q(2, 8), q(8, 8), q(5, 2)], equiTri: null, scalTri: [q(1, 8), q(9, 7), q(3, 2)], obtTri: [q(1, 7), q(9, 7), q(2, 3)], rect: [q(1, 7), q(9, 7), q(9, 3), q(1, 3)], square: [q(2, 8), q(8, 8), q(8, 2), q(2, 2)], para: [q(1, 7), q(7, 7), q(9, 3), q(3, 3)], rhombus: [q(5, 9), q(8, 5), q(5, 1), q(2, 5)], kite: [q(5, 9), q(8, 4), q(5, 2), q(2, 4)], trap: [q(1, 8), q(9, 8), q(7, 3), q(3, 3)], arrow: [q(5, 7), q(9, 9), q(5, 1), q(1, 9)], lshape: [q(2, 9), q(8, 9), q(8, 6), q(5, 6), q(5, 2), q(2, 2)] };
      return id === 'equiTri' ? regular(3) : S2[id];
    }
    const NAMED = { rightTri: 'Right-angled triangle', isoTri: 'Isosceles triangle', equiTri: 'Equilateral triangle', scalTri: 'Scalene triangle', obtTri: 'Obtuse-angled triangle', rect: 'Rectangle', square: 'Square', para: 'Parallelogram', rhombus: 'Rhombus', kite: 'Kite', trap: 'Trapezium', arrow: 'Arrowhead (concave)', lshape: 'L-shaped hexagon' };
    function setShape(p, name) { pts = p.map(q => q.slice()); kind = name; hidden = {}; p.forEach((_, i) => hidden[i] = true); showTot = false; working = false; drawing = false; pr.corner = -1; draw(); }
    // ---------- drawing ----------
    function drawBg() {
      clear(bgG);
      const hit = S('rect', { x: 0, y: 0, width: 680, height: 640, fill: 'transparent' }, bgG);
      hit.addEventListener('click', e => { if (!drawing) return; const p = c.pt(e); const q = snapF(p.x, p.y); if (pts.length >= 3 && Math.hypot(q[0] - pts[0][0], q[1] - pts[0][1]) < 14) { finishDraw(); return; } if (pts.some(r => Math.hypot(r[0] - q[0], r[1] - q[1]) < 4)) return; if (pts.length < 12) pts.push(q); draw(); });
      if (grid) { const s = cell(); for (let r = 0; r <= n; r++) for (let cc = 0; cc <= n; cc++) S('circle', { cx: X0 + cc * s, cy: Y0 + r * s, r: n > 12 ? 2.4 : 3.5, fill: 'var(--ink-3)', 'pointer-events': 'none' }, bgG); }
    }
    function finishDraw() { if (pts.length < 3) return c.toast('Place at least three corners'); drawing = false; showTot = false; kind = pts.length === 3 ? 'Triangle' : NAMES[pts.length] ? NAMES[pts.length][0].toUpperCase() + NAMES[pts.length].slice(1) : pts.length + ' sides'; hidden = {}; draw(); }
    function label(x, y, a, i) {
      const hid = hidden[i], t = S('g', { cls: 'hit' }, g), cl = COLS[i % COLS.length], txt = hid ? '?' : fmtA(a), wd = txt.length * 11 + 22;
      S('rect', { x: x - wd / 2, y: y - 17, width: wd, height: 34, rx: 10, fill: hid ? col(cl) : 'var(--board)', stroke: col(cl), 'stroke-width': 2.5 }, t);
      text(t, x, y + 1, txt, { 'font-size': 18, 'font-weight': 800, cls: 'num', fill: hid ? '#fff' : 'var(--ink)' });
      t.addEventListener('pointerdown', e => e.stopPropagation());
      t.addEventListener('click', e => { e.stopPropagation(); hidden[i] = !hidden[i]; draw(); });
    }
    function draw() {
      clear(g);
      const k = pts.length, A = angles(pts), total = (k - 2) * 180;
      if (k >= 2) {
        if (splitT && k >= 3 && !drawing) for (let j = 1; j < k - 1; j++) { const tri = [pts[0], pts[j], pts[j + 1]]; S('polygon', { points: tri.map(q => q.join(',')).join(' '), fill: col(COLS[(j - 1) % COLS.length]), 'fill-opacity': .14, stroke: 'none' }, g); }
        S(drawing ? 'polyline' : 'polygon', { points: pts.map(q => q.join(',')).join(' '), fill: drawing ? 'none' : 'var(--purple)', 'fill-opacity': .14, stroke: 'var(--purple)', 'stroke-width': 4.5, 'stroke-linejoin': 'round' }, g);
        if (splitT && k >= 3 && !drawing) { for (let j = 2; j < k - 1; j++) S('line', { x1: pts[0][0], y1: pts[0][1], x2: pts[j][0], y2: pts[j][1], stroke: 'var(--orange)', 'stroke-width': 3, 'stroke-dasharray': '9 6', 'pointer-events': 'none' }, g); for (let j = 1; j < k - 1; j++) { const cx = (pts[0][0] + pts[j][0] + pts[j + 1][0]) / 3, cy = (pts[0][1] + pts[j][1] + pts[j + 1][1]) / 3; text(g, cx, cy, '180°', { 'font-size': 15, 'font-weight': 800, fill: 'var(--orange)', 'pointer-events': 'none', stroke: 'var(--board)', 'stroke-width': 4, 'paint-order': 'stroke' }); } }
      }
      // side hit areas: tap to add a corner
      if (!drawing && !lock && k >= 3) pts.forEach((q, i) => { const r = pts[(i + 1) % k], ln = S('line', { x1: q[0], y1: q[1], x2: r[0], y2: r[1], stroke: 'transparent', 'stroke-width': 22, cls: 'hit' }, g); ln.addEventListener('click', e => { if (pts.length >= 12) return c.toast('Up to 12 corners'); const p = c.pt(e); pts.splice(i + 1, 0, snapF(p.x, p.y)); kind = NAMES[pts.length] ? NAMES[pts.length][0].toUpperCase() + NAMES[pts.length].slice(1) : kind; hidden = {}; draw(); }); });
      // angles
      if (k >= 3 && !drawing) {
        const cx = pts.reduce((t, p) => t + p[0], 0) / k, cy = pts.reduce((t, p) => t + p[1], 0) / k;
        pts.forEach((q, i) => {
          const a = A[i], prev = pts[(i - 1 + k) % k], nx = pts[(i + 1) % k];
          const v1 = [prev[0] - q[0], prev[1] - q[1]], v2 = [nx[0] - q[0], nx[1] - q[1]], l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
          let d = [v1[0] / l1 + v2[0] / l2, v1[1] / l1 + v2[1] / l2]; let dl = Math.hypot(...d);
          if (dl < .05) { d = [cx - q[0], cy - q[1]]; dl = Math.hypot(...d) || 1; }
          d = [d[0] / dl, d[1] / dl]; if (a > 180) d = [-d[0], -d[1]];
          if (rightMarks && !hidden[i] && Math.abs(a - 90) < .5) { const e1 = [v1[0] / l1 * 18, v1[1] / l1 * 18], e2 = [v2[0] / l2 * 18, v2[1] / l2 * 18]; S('path', { d: `M${q[0] + e1[0]} ${q[1] + e1[1]} l${e2[0]} ${e2[1]} l${-e1[0]} ${-e1[1]}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'pointer-events': 'none' }, g); }
          else if (showAng) { const st = Math.atan2(v1[1], v1[0]), en = Math.atan2(v2[1], v2[0]), r = 26; const delta = (((en - st) * 180 / Math.PI) % 360 + 360) % 360; const sw = Math.abs(delta - a) < 1 ? 1 : 0; const p1 = [q[0] + r * Math.cos(st), q[1] + r * Math.sin(st)], p2 = [q[0] + r * Math.cos(en), q[1] + r * Math.sin(en)]; S('path', { d: `M${p1[0]} ${p1[1]} A${r} ${r} 0 ${a > 180 ? 1 : 0} ${sw} ${p2[0]} ${p2[1]}`, fill: 'none', stroke: col(COLS[i % COLS.length]), 'stroke-width': 3, 'pointer-events': 'none' }, g); }
          if (showAng) label(q[0] + d[0] * 58, q[1] + d[1] * 58, a, i);
        });
      }
      // corners
      pts.forEach((q, i) => {
        const h = S('g', { cls: lock || drawing ? '' : 'grab' }, g);
        S('circle', { cx: q[0], cy: q[1], r: 18, fill: 'transparent' }, h);
        S('circle', { cx: q[0], cy: q[1], r: drawing && i === 0 && pts.length >= 3 ? 12 : 9, fill: drawing && i === 0 ? 'var(--green)' : lock ? 'var(--ink-2)' : 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, h);
        if (drawing) { if (i === 0) h.addEventListener('click', e => { e.stopPropagation(); finishDraw(); }); return; }
        if (!lock) c.drag(h, { move: m => { pts[i] = snapF(m.x, m.y); if (pr.corner === i) placeProt(i, true); draw(); } });
      });
      drawInfo(A, total);
      drawProt();
    }
    function drawInfo(A, total) {
      const k = pts.length, x = 676; let y = 50;
      const T = (t, o = {}) => { const gap = o.dy || 26; delete o.dy; text(g, x, y, t, Object.assign({ 'font-size': 17, fill: 'var(--ink-2)', 'text-anchor': 'start', cls: 'num' }, o)); y += gap; };
      if (drawing) { T('Free draw', { 'font-size': 26, 'font-weight': 800, cls: 'disp', fill: 'var(--ink)', dy: 36 }); ['Tap the board to place each corner.', 'Tap the green corner, or Finish', 'shape, to close it.', `${k} corner${k === 1 ? '' : 's'} so far`].forEach(l => T(l)); return; }
      if (k < 3) { T('Angles in shapes', { 'font-size': 26, 'font-weight': 800, cls: 'disp', fill: 'var(--ink)', dy: 40 }); ['Choose a shape from the menu,', 'or use Free draw to make your own.'].forEach(l => T(l)); return; }
      const nm = NAMES[k] || k + '-sided shape';
      T(kind, { 'font-size': kind.length > 20 ? 21 : 26, 'font-weight': 800, cls: 'disp', fill: 'var(--ink)', dy: 32 });
      T(`${k} sides and ${k} angles`, { dy: 36 });
      const hid = Object.keys(hidden).filter(i => hidden[i] && +i < k).map(Number);
      if (!showTot) { T(hid.length ? `Tap a ? on the shape to reveal that angle.` : 'Tap any angle to hide it again.', { 'font-size': 15, fill: 'var(--ink-3)' }); T('Use Show the total in the menu', { 'font-size': 15, fill: 'var(--ink-3)' }); T('to see what the angles add up to.', { 'font-size': 15, fill: 'var(--ink-3)' }); return; }
      T('The angles inside add up to', { dy: 40 });
      T(total + '°', { 'font-size': 44, 'font-weight': 800, cls: 'disp num', fill: 'var(--purple)', dy: 40 });
      T('Why? Split it into triangles', { 'font-size': 15, 'font-weight': 700 }); T('from one corner.', { 'font-size': 15, 'font-weight': 700 });
      T(`A ${nm} makes ${k - 2} triangle${k > 3 ? 's' : ''}.`, { 'font-size': 15 });
      if (k > 3) T(`(Always 2 fewer than the number of sides.)`, { 'font-size': 14, fill: 'var(--ink-3)' });
      T('Each triangle has 180°, so', { 'font-size': 15, 'font-weight': 700, fill: 'var(--orange)' }); T(`${k - 2} × 180° = ${total}°`, { 'font-size': 19, 'font-weight': 800, fill: 'var(--orange)', dy: 34 });
      const reg = A.every(a => Math.abs(a - A[0]) < .6) && pts.every((q, i) => Math.abs(len(q, pts[(i + 1) % k]) - len(pts[0], pts[1])) < .05);
      if (reg) { T('Regular: all the angles are equal.', { 'font-size': 15, 'font-weight': 700 }); T(`${total}° ÷ ${k} = ${fmtA(total / k)} each`, { 'font-size': 19, 'font-weight': 800, fill: 'var(--blue)', dy: 32 }); }
      if (working && hid.length === 1) {
        const i = hid[0], known = A.map((a, j) => j === i ? null : Math.round(a)).filter(v => v !== null), sum = known.reduce((s2, v) => s2 + v, 0);
        T('Missing angle', { 'font-size': 16, 'font-weight': 800, fill: col(COLS[i % COLS.length]) });
        T(known.length > 5 ? `The others add up to ${sum}°` : known.join(' + ') + ' = ' + sum + '°', { 'font-size': 16, 'font-weight': 700 });
        T(`${total} − ${sum} = ${total - sum}°`, { 'font-size': 16, 'font-weight': 700 });
      }
      if (lock) text(g, x, 625, 'Corners locked', { 'font-size': 14, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start' });
    }
    // ---------- protractor ----------
    function placeProt(i, quiet) {
      const k = pts.length; if (k < 3) return; const q = pts[i], nx = pts[(i + 1) % k], prev = pts[(i - 1 + k) % k];
      const a1 = Math.atan2(nx[1] - q[1], nx[0] - q[0]) * 180 / Math.PI, a2 = Math.atan2(prev[1] - q[1], prev[0] - q[0]) * 180 / Math.PI, A = angles(pts)[i];
      // the scale runs anticlockwise on screen from the base line, so put the base on the arm that has the other arm A° anticlockwise of it
      const d = ((a1 - a2) % 360 + 360) % 360; pr.rot = Math.abs(d - A) < 1 ? a1 : a2;
      pr.x = q[0]; pr.y = q[1]; pr.corner = i; if (!quiet) draw();
    }
    function drawProt() {
      clear(pg); if (!protOn) return;
      const r = 190, gg = S('g', { cls: 'grab', transform: `translate(${pr.x},${pr.y}) rotate(${pr.rot})` }, pg);
      S('path', { d: `M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`, fill: 'var(--blue-s)', 'fill-opacity': .5, stroke: 'var(--blue)', 'stroke-width': 2 }, gg);
      for (let d = 0; d <= 180; d++) { const a = -d * Math.PI / 180, l = d % 10 === 0 ? 22 : d % 5 === 0 ? 14 : 8; S('line', { x1: r * Math.cos(a), y1: r * Math.sin(a), x2: (r - l) * Math.cos(a), y2: (r - l) * Math.sin(a), stroke: 'var(--ink)', 'stroke-width': d % 10 ? .8 : 1.5 }, gg); if (d % 10 === 0) { const v = pr.flip ? 180 - d : d; text(gg, (r - 38) * Math.cos(a), (r - 38) * Math.sin(a), String(v), { 'font-size': 13, cls: 'num' }); text(gg, (r - 60) * Math.cos(a), (r - 60) * Math.sin(a), String(180 - v), { 'font-size': 10, cls: 'num', fill: 'var(--ink-3)' }); } }
      S('line', { x1: -r, y1: 0, x2: r, y2: 0, stroke: 'var(--ink)', 'stroke-width': 1.5 }, gg); S('circle', { r: 5, fill: 'var(--red)' }, gg);
      const rh = S('g', { cls: 'grab' }, gg); S('circle', { cx: r + 26, cy: -10, r: 16, fill: 'var(--blue)' }, rh); S('path', { d: `M${r + 18} -12 a8 8 0 1 1 8 10`, fill: 'none', stroke: 'var(--board)', 'stroke-width': 3 }, rh);
      c.drag(rh, { move: p => { pr.rot = Math.atan2(p.y - pr.y, p.x - pr.x) * 180 / Math.PI; pr.corner = -1; drawProt(); } });
      let ox, oy; c.drag(gg, { start: p => { ox = p.x - pr.x; oy = p.y - pr.y; }, move: p => { pr.x = p.x - ox; pr.y = p.y - oy; pr.corner = -1; drawProt(); } });
    }
    // ---------- menu ----------
    P.group('Shapes', { open: true });
    const typeSeg = P.seg({ label: 'Type of shape', options: [['regular', 'Regular'], ['irregular', 'Irregular'], ['tri', 'Triangle'], ['quad', 'Quadrilateral']], value: stype, onChange: v => { stype = v; syncType(); } });
    const sideSt = P.stepper({ label: 'Number of sides', value: nSides, min: 3, max: 12, onChange: v => nSides = v });
    const makeB = P.button('Make the shape', () => setShape(stype === 'regular' ? regular(nSides) : irregular(nSides), (stype === 'regular' ? 'Regular ' : 'Irregular ') + (stype === 'regular' && nSides === 4 ? 'quadrilateral (square)' : stype === 'regular' && nSides === 3 ? 'triangle (equilateral)' : NAMES[nSides])), 'primary');
    const triSeg = P.seg({ label: 'Which triangle?', options: [['rightTri', 'Right-angled'], ['isoTri', 'Isosceles'], ['equiTri', 'Equilateral'], ['scalTri', 'Scalene'], ['obtTri', 'Obtuse']], value: null, retrigger: true, onChange: v => setShape(named(v), NAMED[v]) });
    const quadSeg = P.seg({ label: 'Which quadrilateral?', options: [['square', 'Square'], ['rect', 'Rectangle'], ['para', 'Parallelogram'], ['rhombus', 'Rhombus'], ['kite', 'Kite'], ['trap', 'Trapezium'], ['arrow', 'Arrowhead']], value: null, retrigger: true, onChange: v => setShape(named(v), NAMED[v]) });
    function syncType() { const poly = stype === 'regular' || stype === 'irregular'; sideSt.el.hidden = !poly; makeB.hidden = !poly; triSeg.el.hidden = stype !== 'tri'; quadSeg.el.hidden = stype !== 'quad'; }
    P.group('Free draw');
    P.button('Start drawing', () => { pts = []; drawing = true; hidden = {}; showTot = false; lock = false; lockT.set(false, true); draw(); }, 'primary');
    P.buttons([['Finish shape', finishDraw], ['Undo corner', () => { if (drawing && pts.length) { pts.pop(); draw(); } }]]);
    P.note('Tap the board to place corners. Tap the first corner to close the shape.');
    P.group('Reveal');
    P.buttons([['Show all angles', () => { hidden = {}; draw(); }], ['Hide all angles', () => { pts.forEach((_, i) => hidden[i] = true); draw(); }]]);
    const totT = P.toggle({ label: 'Show the total', value: showTot, onChange: v => { showTot = v; draw(); } });
    P.toggle({ label: 'Split into triangles', value: splitT, onChange: v => { splitT = v; draw(); } });
    P.button('Hide one: find the missing angle', () => { if (pts.length < 3) return; hidden = {}; hidden[rnd(0, pts.length - 1)] = true; showTot = true; totT.set(true, true); working = false; wT.set(false, true); draw(); });
    const wT = P.toggle({ label: 'Show the working', value: working, onChange: v => { working = v; draw(); } });
    P.note('Tap any angle on the board to hide or reveal it.');
    P.section('Tools');
    const protT = P.toggle({ label: 'Protractor', value: protOn, onChange: v => { protOn = v; drawProt(); } });
    P.buttons([['Protractor to next corner', () => { if (pts.length < 3) return; protOn = true; protT.set(true, true); placeProt((pr.corner + 1) % pts.length); }], ['Flip scale', () => { pr.flip = !pr.flip; drawProt(); }]]);
    P.toggle({ label: 'Grid (corners snap to it)', value: grid, onChange: v => { grid = v; drawBg(); } });
    const lockT = P.toggle({ label: 'Lock corners', value: lock, onChange: v => { lock = v; draw(); } });
    P.button('Reset to a blank board', () => { pts = []; drawing = false; hidden = {}; showTot = false; totT.set(false, true); splitT = false; working = false; kind = ''; protOn = false; protT.set(false, true); drawProt(); draw(); });
    syncType();
    drawBg(); draw();
  }
});

tool({
  id: 'polygons', name: 'Polygons', strand: 'geom', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Regular polygons to resize, move and turn, with symmetry lines, diagonals and angles.',
  tags: 'regular polygon rotation turn symmetry diagonals interior angle',
  icon: '<path d="M24 5l17 12-6 21H13L7 17z"/>',
  guide: ['Choose the number of sides. Drag the shape from its centre to move it.', 'Turn the shape by the chosen amount. A faint outline shows where it started.', 'Show lines of symmetry, diagonals or the size of each interior angle.', 'Count how many turns it takes before the shape looks the same again for its order of rotational symmetry.'],
  mount(c) {
    const { svg, P } = c;
    let sides = 5, size = 180, rot = 0, unit = 15, x = 420, y = 330, sym = false, diag = false, ang = false, grid = true, ghost = true, colour = 'teal', anim = rot;
    const g = S('g', {}, svg);
    const pts = (rr = anim) => { const o = []; for (let i = 0; i < sides; i++) { const a = (-90 + rr + i * 360 / sides) * Math.PI / 180; o.push([x + size * Math.cos(a), y + size * Math.sin(a)]); } return o; };
    function draw() {
      clear(g);
      if (grid) { for (let gx = 0; gx <= 1000; gx += 40) S('line', { x1: gx, y1: 0, x2: gx, y2: 640, stroke: 'var(--line)', 'stroke-width': 1 }, g); for (let gy = 0; gy <= 640; gy += 40) S('line', { x1: 0, y1: gy, x2: 1000, y2: gy, stroke: 'var(--line)', 'stroke-width': 1 }, g); }
      if (ghost && rot) S('polygon', { points: pts(0).map(p => p.join(',')).join(' '), fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, g);
      const p = pts();
      if (sym) for (let i = 0; i < sides; i++) { const a = (-90 + anim + i * 180 / sides) * Math.PI / 180; S('line', { x1: x - (size + 40) * Math.cos(a), y1: y - (size + 40) * Math.sin(a), x2: x + (size + 40) * Math.cos(a), y2: y + (size + 40) * Math.sin(a), stroke: 'var(--red)', 'stroke-width': 2.5, 'stroke-dasharray': '10 6' }, g); }
      const sh = S('g', { cls: 'grab' }, g);
      S('polygon', { points: p.map(q => q.join(',')).join(' '), fill: col(colour), 'fill-opacity': .3, stroke: col(colour), 'stroke-width': 5, 'stroke-linejoin': 'round' }, sh);
      if (diag) for (let i = 0; i < sides; i++) for (let j = i + 2; j < sides; j++) { if (i === 0 && j === sides - 1) continue; S('line', { x1: p[i][0], y1: p[i][1], x2: p[j][0], y2: p[j][1], stroke: 'var(--purple)', 'stroke-width': 1.8 }, sh); }
      S('circle', { cx: x, cy: y, r: 10, fill: 'var(--ink)' }, sh);
      S('circle', { cx: p[0][0], cy: p[0][1], r: 8, fill: 'var(--orange)', stroke: 'var(--board)', 'stroke-width': 2 }, sh);
      let ox, oy; c.drag(sh, { start: q => { ox = q.x - x; oy = q.y - y; }, move: q => { x = clamp(q.x - ox, 60, 940); y = clamp(q.y - oy, 60, 580); draw(); } });
      const ia = (sides - 2) * 180 / sides;
      if (ang) p.forEach(q => { const dx = x - q[0], dy = y - q[1], L = Math.hypot(dx, dy); text(g, q[0] + dx / L * 38, q[1] + dy / L * 38, nf(+ia.toFixed(1)) + '°', { 'font-size': 16, 'font-weight': 700, cls: 'num' }); });
      const names = { 3: 'Equilateral triangle', 4: 'Square', 5: 'Regular pentagon', 6: 'Regular hexagon', 7: 'Regular heptagon', 8: 'Regular octagon', 9: 'Regular nonagon', 10: 'Regular decagon', 11: 'Regular hendecagon', 12: 'Regular dodecagon' };
      const info = S('g', {}, g);
      S('rect', { x: 760, y: 24, width: 220, height: 160, rx: 16, fill: 'var(--board)', stroke: 'var(--line)' }, info);
      text(info, 870, 54, names[sides], { 'font-size': 18, 'font-weight': 800, cls: 'disp' });
      [['Sides', sides], ['Lines of symmetry', sides], ['Interior angle', nf(+ia.toFixed(1)) + '°'], ['Turned', nf(((rot % 360) + 360) % 360) + '°']].forEach(([l, v], i) => { text(info, 776, 88 + i * 26, l, { 'font-size': 15, fill: 'var(--ink-2)', 'text-anchor': 'start' }); text(info, 964, 88 + i * 26, String(v), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', cls: 'num' }); });
    }
    function turn(d) { rot += d; const from = anim, to = rot, t0 = performance.now(); c.raf((dt, now) => { const t = clamp((now - t0) / 500, 0, 1), e = 1 - (1 - t) ** 3; anim = from + (to - from) * e; draw(); return t < 1; }); }
    P.section('Shape');
    P.stepper({ label: 'Sides', value: sides, min: 3, max: 12, onChange: v => { sides = v; draw(); } });
    P.stepper({ label: 'Size', value: size, min: 60, max: 280, step: 20, onChange: v => { size = v; draw(); } });
    P.swatches({ value: colour, colors: ['teal', 'blue', 'green', 'orange', 'purple', 'red'], onChange: v => { colour = v; draw(); } });
    P.section('Turn');
    P.seg({ label: 'Turn by', options: [[15, '15°'], [30, '30°'], [45, '45°'], [90, '90°'], ['n', '1/n turn']], value: unit, onChange: v => unit = v });
    P.buttons([['↺ Anticlockwise', () => turn(-(unit === 'n' ? 360 / sides : unit))], ['Clockwise ↻', () => turn(unit === 'n' ? 360 / sides : unit), 'primary']]);
    P.button('Back to start', () => { rot = 0; anim = 0; x = 420; y = 330; draw(); });
    P.toggle({ label: 'Show starting outline', value: ghost, onChange: v => { ghost = v; draw(); } });
    P.section('Show');
    P.toggle({ label: 'Lines of symmetry', value: sym, onChange: v => { sym = v; draw(); } });
    P.toggle({ label: 'Diagonals', value: diag, onChange: v => { diag = v; draw(); } });
    P.toggle({ label: 'Interior angles', value: ang, onChange: v => { ang = v; draw(); } });
    P.toggle({ label: 'Grid', value: grid, onChange: v => { grid = v; draw(); } });
    draw();
  }
});

tool({
  id: 'angles', name: 'Calculating angles', strand: 'geom', years: [4, 5, 6], w: 1000, h: 640,
  desc: 'Angles on a straight line, around a point and inside triangles, quadrilaterals and polygons.',
  tags: 'angles straight line point triangle quadrilateral rhombus hexagon missing angle protractor',
  icon: '<path d="M6 38h36M24 38L10 12M24 38L40 16"/><path d="M18 38a6 6 0 0 1 3-5"/>',
  guide: ['Choose a right angle, a straight line, a full turn or a shape.', 'Drag the yellow handles to change the angles. The total is shown in the middle and never changes.', 'Tap an angle label to hide it, then ask the class to work out the missing angle.', 'The rhombus and parallelogram keep their shape as you drag, so opposite angles stay equal.', 'Show the protractor to check by measuring.'],
  mount(c) {
    const { svg, P } = c;
    const SHAPES = { tri: 3, quad: 4, rhombus: 4, para: 4, pent: 5, hex: 6 };
    let mode = 180, arms = [60, 130], hidden = {}, prot, poly = null, rh = { cx: 500, cy: 340, p: 170, q: 110 }, pa = { x: 330, y: 470, w: 320, dx: 110, h: 220 };
    const colours = ['red', 'blue', 'green', 'orange', 'purple', 'teal'];
    const g = S('g', {}, svg), pg = S('g', {}, svg);
    const center = () => mode === 360 ? [500, 330] : mode === 90 ? [430, 470] : [500, 460];
    const R = () => mode === 360 ? 230 : 270;
    function label(x, y, v, k, cl) { const t = S('g', { cls: 'hit' }, g); S('rect', { x: x - 36, y: y - 20, width: 72, height: 40, rx: 10, fill: hidden[k] ? col(cl) : 'var(--board)', stroke: col(cl), 'stroke-width': 2.5 }, t); text(t, x, y + 1, hidden[k] ? '?' : Math.round(v) + '°', { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: hidden[k] ? '#fff' : 'var(--ink)' }); t.addEventListener('click', () => { hidden[k] = !hidden[k]; draw(); }); }
    function totalBadge(x, y, t) { S('circle', { cx: x, cy: y, r: 48, fill: 'var(--ink)' }, g); text(g, x, y - 10, 'total', { 'font-size': 14, fill: 'var(--bg)' }); text(g, x, y + 12, t + '°', { 'font-size': 26, 'font-weight': 800, cls: 'disp num', fill: 'var(--bg)' }); }
    function draw() {
      clear(g);
      if (SHAPES[mode]) return drawPoly();
      const O = center(), Rr = R(), total = mode, bounds = [0, ...arms, total];
      const wedge = (a1, a2, r, cl) => { const p = a => [O[0] + r * Math.cos(-a * Math.PI / 180), O[1] + r * Math.sin(-a * Math.PI / 180)]; const [x1, y1] = p(a1), [x2, y2] = p(a2); S('path', { d: `M${O[0]} ${O[1]} L${x1} ${y1} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${x2} ${y2} Z`, fill: col(cl), 'fill-opacity': .25, stroke: col(cl), 'stroke-width': 2 }, g); };
      for (let i = 0; i < bounds.length - 1; i++) wedge(bounds[i], bounds[i + 1], 80 + (i % 2) * 18, colours[i]);
      (mode === 360 ? [0, ...arms] : [0, ...arms, total]).forEach(a => S('line', { x1: O[0], y1: O[1], x2: O[0] + Rr * Math.cos(-a * Math.PI / 180), y2: O[1] + Rr * Math.sin(-a * Math.PI / 180), stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linecap': 'round' }, g));
      if (mode === 90) S('path', { d: `M${O[0] + 30} ${O[1]} V${O[1] - 30} H${O[0]}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      for (let i = 0; i < bounds.length - 1; i++) { const m = (bounds[i] + bounds[i + 1]) / 2 * Math.PI / 180, rr = Math.min(165, Rr - 50); label(O[0] + rr * Math.cos(-m), O[1] + rr * Math.sin(-m), bounds[i + 1] - bounds[i], i, colours[i]); }
      S('circle', { cx: O[0], cy: O[1], r: 8, fill: 'var(--ink)' }, g);
      arms.forEach((a, i) => { const h = S('g', { cls: 'grab' }, g), hx = O[0] + Rr * Math.cos(-a * Math.PI / 180), hy = O[1] + Rr * Math.sin(-a * Math.PI / 180); S('circle', { cx: hx, cy: hy, r: 18, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, h); c.drag(h, { move: p => { let d = Math.atan2(-(p.y - O[1]), p.x - O[0]) * 180 / Math.PI; if (d < 0) d += 360; const lo = (arms[i - 1] ?? 0) + 5, hi = (arms[i + 1] ?? total) - 5; arms[i] = clamp(Math.round(d), lo, hi); draw(); } }); });
      text(g, 500, 36, mode === 90 ? 'Angles in a right angle add up to 90°' : mode === 180 ? 'Angles on a straight line add up to 180°' : 'Angles around a point add up to 360°', { 'font-size': 24, 'font-weight': 700, cls: 'disp' });
      totalBadge(mode === 360 ? 860 : 860, mode === 360 ? 110 : 110, total);
    }
    function regular(k) { const out = []; for (let i = 0; i < k; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / k + (k === 4 ? Math.PI / 4 : 0); out.push([500 + 220 * Math.cos(a), 345 + 220 * Math.sin(a)]); } return out; }
    function polyPts() {
      if (mode === 'rhombus') return [[rh.cx, rh.cy - rh.q], [rh.cx + rh.p, rh.cy], [rh.cx, rh.cy + rh.q], [rh.cx - rh.p, rh.cy]];
      if (mode === 'para') return [[pa.x + pa.dx, pa.y - pa.h], [pa.x + pa.dx + pa.w, pa.y - pa.h], [pa.x + pa.w, pa.y], [pa.x, pa.y]];
      return poly;
    }
    function drawPoly() {
      const p = polyPts(), k = p.length;
      S('polygon', { points: p.map(q => q.join(',')).join(' '), fill: 'var(--teal-s)', stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      const sign = Math.sign(p.reduce((s, q, i) => { const r = p[(i + 1) % k]; return s + (q[0] * r[1] - r[0] * q[1]); }, 0)) || 1;
      const raw = p.map((q, i) => (((angleAt(p, i) * sign) % 360) + 360) % 360), flip = raw.reduce((s, v) => s + v, 0) > (k - 2) * 180 + 1;
      p.forEach((q, i) => { const a = flip ? 360 - raw[i] : raw[i], prev = p[(i - 1 + k) % k], nx = p[(i + 1) % k]; const v = [(prev[0] + nx[0]) / 2 - q[0], (prev[1] + nx[1]) / 2 - q[1]], L = Math.hypot(...v) || 1; let d = [v[0] / L, v[1] / L]; if (a > 180) d = [-d[0], -d[1]]; label(q[0] + d[0] * 62, q[1] + d[1] * 62, a, 'p' + i, colours[i % 6]); });
      const cx = p.reduce((s, q) => s + q[0], 0) / k, cy = p.reduce((s, q) => s + q[1], 0) / k;
      totalBadge(cx, cy, (k - 2) * 180);
      const names = { tri: 'triangle', quad: 'quadrilateral', rhombus: 'rhombus', para: 'parallelogram', pent: 'pentagon', hex: 'hexagon' };
      text(g, 500, 36, `Angles in a ${names[mode]} add up to ${(k - 2) * 180}°`, { 'font-size': 24, 'font-weight': 700, cls: 'disp' });
      // handles
      const handle = (x, y, fn) => { const h = S('g', { cls: 'grab' }, g); S('circle', { cx: x, cy: y, r: 16, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, h); c.drag(h, { move: m => { fn(m); draw(); } }); };
      if (mode === 'rhombus') { handle(p[1][0], p[1][1], m => rh.p = clamp(m.x - rh.cx, 40, 400)); handle(p[0][0], p[0][1], m => rh.q = clamp(rh.cy - m.y, 40, 260)); }
      else if (mode === 'para') { handle(p[0][0], p[0][1], m => { pa.dx = clamp(m.x - pa.x, -200, 300); pa.h = clamp(pa.y - m.y, 60, 380); }); handle(p[2][0], p[2][1], m => pa.w = clamp(m.x - pa.x, 80, 560)); }
      else p.forEach((q, i) => handle(q[0], q[1], m => { poly[i] = [clamp(m.x, 40, 960), clamp(m.y, 70, 610)]; }));
    }
    function setMode(v) {
      mode = v; hidden = {};
      if (v === 90) arms = [40]; else if (v === 180) arms = [60, 130]; else if (v === 360) arms = [80, 190, 280];
      else if (v === 'tri') poly = [[260, 520], [740, 540], [450, 140]];
      else if (v === 'quad') poly = [[230, 500], [300, 170], [720, 140], [790, 520]];
      else if (SHAPES[v] && v !== 'rhombus' && v !== 'para') poly = regular(SHAPES[v]);
      armBtns.hidden = !!SHAPES[v];
      draw();
    }
    P.section('Angles at a point');
    P.seg({ options: [[90, 'Right angle'], [180, 'Straight line'], [360, 'Full turn']], value: mode, retrigger: true, onChange: v => { shapeSeg.set(null, true); setMode(v); } });
    const armBtns = P.buttons([['Fewer arms', () => { if (arms.length > 1) { arms.pop(); hidden = {}; draw(); } }], ['More arms', () => { const last = arms[arms.length - 1]; if (arms.length < 4 && mode - last > 20) { arms.push(Math.round((last + mode) / 2)); draw(); } }]]);
    P.section('Angles in shapes');
    const shapeSeg = P.seg({ options: [['tri', 'Triangle'], ['quad', 'Quadrilateral'], ['rhombus', 'Rhombus'], ['para', 'Parallelogram'], ['pent', 'Pentagon'], ['hex', 'Hexagon']], value: null, retrigger: true, onChange: v => setMode(v) });
    P.section('Missing angle');
    P.button('Hide one at random', () => { hidden = {}; const k = SHAPES[mode] ? 'p' + rnd(0, polyPts().length - 1) : rnd(0, arms.length); hidden[k] = true; draw(); }, 'primary');
    P.button('Show all angles', () => { hidden = {}; draw(); });
    P.section('Measure');
    P.toggle({ label: 'Protractor', value: false, onChange: v => { if (!prot) prot = protractor(c, pg, 500, 440, 220); prot.show(v); } });
    P.button('Reverse protractor scale', () => prot && prot.flip());
    draw();
  }
});

tool({
  id: 'symmetry', name: 'Symmetry', strand: 'geom', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Colour squares on one side of a mirror line and see the reflection, or have a go at drawing the reflection of a given shape and check it.',
  tags: 'reflection mirror line symmetry pattern have a go check draw reflect',
  icon: '<path d="M24 4v40" stroke-dasharray="4 3"/><path d="M8 14h8v8H8zM16 22h4v8h-4z"/><path d="M32 14h8v8h-8zM28 22h4v8h-4z" opacity=".5"/>',
  guide: ['Explore: tap squares to colour them. Their reflection appears in the mirror line. Hide the reflection so the class can predict it, then show it.', 'Have a go: tap New shape. A shape appears on one side of the mirror. Tap squares to draw its reflection, then tap Check.', 'Check marks each square: a tick for a correct square, a cross for one that should not be coloured, and a dotted outline for a square that is missing. Show the answer reveals the correct reflection.', 'Choose a vertical, horizontal or diagonal mirror, or two mirrors at once. Bigger shapes and the diagonal mirror are harder.'],
  mount(c) {
    const { svg, P } = c;
    const N = 14; let cells = {}, mirror = 'v', showRef = true, colour = 'blue', mode = 'explore', given = {}, attempt = {}, checked = false, answer = false, size = 6, build = {}, tryCol = 'blue';
    c.persist(() => ({ cells, mirror, showRef, colour, mode, given, attempt, checked, answer, size, build, tryCol }), s => ({ cells, mirror, showRef, colour, mode, given, attempt, checked, answer, size, build, tryCol } = Object.assign({ cells, mirror, showRef, colour, mode, given, attempt, checked, answer, size, build, tryCol }, s)));
    const g = S('g', {}, svg);
    const s = 600 / N, x0 = 200, y0 = 20;
    const refl = (r, cc) => { const o = []; const v = () => [r, N - 1 - cc], h = () => [N - 1 - r, cc], d = () => [cc, r]; if (mirror === 'v') o.push(v()); if (mirror === 'h') o.push(h()); if (mirror === 'd') o.push(d()); if (mirror === 'vh') { o.push(v(), h(), [N - 1 - r, N - 1 - cc]); } return o; };
    const source = (r, cc) => mirror === 'v' ? cc < N / 2 : mirror === 'h' ? r < N / 2 : mirror === 'd' ? r > cc : r < N / 2 && cc < N / 2;
    function target() { const t = {}; for (const k in given) { const [r, cc] = k.split(',').map(Number); refl(r, cc).forEach(([a, b]) => { t[a + ',' + b] = given[k]; }); } return t; }
    function newShape() {
      for (let tries = 0; tries < 50; tries++) {
        const out = {}, cl = ['blue', 'red', 'green', 'purple', 'orange'][rnd(0, 4)];
        let r = rnd(1, N - 2), cc = rnd(1, N - 2), guard = 0;
        while (!source(r, cc) && guard++ < 200) { r = rnd(1, N - 2); cc = rnd(1, N - 2); }
        out[r + ',' + cc] = cl;
        while (Object.keys(out).length < size && guard++ < 400) {
          const ks = Object.keys(out), [br, bc] = ks[rnd(0, ks.length - 1)].split(',').map(Number), [dr, dc] = [[1, 0], [-1, 0], [0, 1], [0, -1]][rnd(0, 3)], nr = br + dr, nc = bc + dc;
          if (nr < 0 || nc < 0 || nr >= N || nc >= N || !source(nr, nc)) continue;
          out[nr + ',' + nc] = cl;
        }
        if (Object.keys(out).length >= size) { given = out; attempt = {}; checked = false; answer = false; tryCol = cl; trySw && trySw.set && trySw.set(cl, true); draw(); return; }
      }
    }
    function draw() {
      clear(g);
      const ref = {};
      if (mode === 'explore' && showRef) for (const k in cells) { const [r, cc] = k.split(',').map(Number); refl(r, cc).forEach(([a, b]) => { const kk = a + ',' + b; if (!cells[kk]) ref[kk] = cells[k]; }); }
      const tgt = mode === 'try' ? target() : {};
      for (let r = 0; r < N; r++) for (let cc = 0; cc < N; cc++) {
        const k = r + ',' + cc, x = x0 + cc * s, y = y0 + r * s;
        let fill = 'var(--board)', op = 1;
        if (mode === 'explore') { const v = cells[k] || ref[k]; if (v) { fill = col(v); op = cells[k] ? 1 : .5; } }
        else if (mode === 'build') { if (build[k]) fill = col(build[k]); else if (!source(r, cc)) fill = 'var(--board-2)'; }
        else if (given[k]) fill = col(given[k]);
        else if (attempt[k]) { fill = col(attempt[k]); op = .8; }
        else if (answer && tgt[k]) { fill = col(tgt[k]); op = .45; }
        const cell = S('rect', { x, y, width: s, height: s, fill, 'fill-opacity': op, stroke: 'var(--line-2)', 'stroke-width': 1, cls: 'hit' }, g);
        if (mode === 'try' && attempt[k] && !given[k]) S('rect', { x: x + 5, y: y + 5, width: s - 10, height: s - 10, rx: 3, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: .8, 'pointer-events': 'none' }, g);
        cell.addEventListener('click', () => {
          if (mode === 'explore') { if (cells[k] === colour) delete cells[k]; else cells[k] = colour; }
          else if (mode === 'build') { if (!source(r, cc)) return c.toast('Build the shape on this side of the mirror. The class draws the other side.'); if (build[k] === colour) delete build[k]; else build[k] = colour; }
          else { if (given[k]) return; if (attempt[k] === tryCol) delete attempt[k]; else attempt[k] = tryCol; checked = false; }
          draw();
        });
      }
      if (mode === 'try' && checked) {
        for (const k in attempt) { const [r, cc] = k.split(',').map(Number), x = x0 + cc * s + s / 2, y = y0 + r * s + s / 2; if (tgt[k] === attempt[k]) S('path', { d: `M${x - 10} ${y} l7 8 l13 -16`, fill: 'none', stroke: 'var(--green)', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g); else S('path', { d: `M${x - 9} ${y - 9} l18 18 M${x + 9} ${y - 9} l-18 18`, stroke: 'var(--red)', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, g); }
        if (!answer) for (const k in tgt) if (attempt[k] !== tgt[k] && !attempt[k] && !given[k]) { const [r, cc] = k.split(',').map(Number); S('rect', { x: x0 + cc * s + 4, y: y0 + r * s + 4, width: s - 8, height: s - 8, rx: 4, fill: 'none', stroke: 'var(--red)', 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, g); }
      }
      const m = { stroke: 'var(--red)', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' };
      if (mirror === 'v' || mirror === 'vh') S('line', Object.assign({ x1: x0 + 300, y1: y0 - 10, x2: x0 + 300, y2: y0 + 610 }, m), g);
      if (mirror === 'h' || mirror === 'vh') S('line', Object.assign({ x1: x0 - 10, y1: y0 + 300, x2: x0 + 610, y2: y0 + 300 }, m), g);
      if (mirror === 'd') S('line', Object.assign({ x1: x0 - 10, y1: y0 - 10, x2: x0 + 610, y2: y0 + 610 }, m), g);
      // side panel
      if (mode === 'build') { const tx = 900; let y = 60; text(g, tx, y, 'Build a shape', { 'font-size': 22, 'font-weight': 800, cls: 'disp' }); y += 34; ['Colour squares on', 'the white side.', 'Then tap Start', 'the challenge.'].forEach(l => { text(g, tx, y, l, { 'font-size': 16, fill: 'var(--ink-2)' }); y += 22; }); }
      if (mode === 'try') {
        const tx = 900; let y = 60;
        text(g, tx, y, 'Have a go', { 'font-size': 22, 'font-weight': 800, cls: 'disp' }); y += 34;
        if (!Object.keys(given).length) { text(g, tx, y, 'Tap New shape', { 'font-size': 16, fill: 'var(--ink-3)' }); return; }
        ['Draw the', 'reflection of', 'the shape'].forEach(l => { text(g, tx, y, l, { 'font-size': 16, fill: 'var(--ink-2)' }); y += 22; });
        if (checked) {
          const need = Object.keys(tgt).filter(k => !given[k]), right = need.filter(k => attempt[k] === tgt[k]).length, wrong = Object.keys(attempt).filter(k => attempt[k] !== tgt[k]).length, ok = right === need.length && !wrong;
          y += 24; S('rect', { x: tx - 80, y: y - 26, width: 160, height: ok ? 64 : 118, rx: 14, fill: ok ? 'var(--green)' : 'var(--board-2)', stroke: ok ? 'none' : 'var(--line)' }, g);
          if (ok) { text(g, tx, y - 6, 'All correct!', { 'font-size': 20, 'font-weight': 800, fill: '#fff' }); text(g, tx, y + 18, `${right} squares`, { 'font-size': 15, fill: '#fff' }); }
          else { text(g, tx, y - 4, `${right} of ${need.length}`, { 'font-size': 24, 'font-weight': 800, cls: 'num' }); text(g, tx, y + 20, 'correct', { 'font-size': 15, fill: 'var(--ink-2)' }); text(g, tx, y + 50, `${wrong} wrong`, { 'font-size': 15, fill: wrong ? 'var(--red)' : 'var(--ink-3)', 'font-weight': 700 }); text(g, tx, y + 72, `${need.length - right} missing`, { 'font-size': 15, fill: need.length - right ? 'var(--red)' : 'var(--ink-3)', 'font-weight': 700 }); }
        }
      }
    }
    function move(dr, dc) { const n = {}; for (const k in cells) { const [r, cc] = k.split(',').map(Number); const a = r + dr, b = cc + dc; if (a < 0 || b < 0 || a >= N || b >= N) return; n[a + ',' + b] = cells[k]; } cells = n; draw(); }
    P.section('Mirror line');
    P.seg({ options: [['v', 'Vertical'], ['h', 'Horizontal'], ['d', 'Diagonal'], ['vh', 'Two mirrors']], value: mirror, onChange: v => { mirror = v; if (mode === 'try') newShape(); else draw(); } });
    const modeSeg = P.seg({ label: 'Mode', options: [['explore', 'Explore'], ['try', 'Have a go'], ['build', 'Teacher builds']], value: mode, onChange: v => setMode(v) });
    function setMode(v) { mode = v; modeSeg.set(v, true); if (v === 'try' && !Object.keys(given).length) newShape(); else draw(); exG.hidden = v !== 'explore'; tryG.hidden = v !== 'try'; bG.hidden = v !== 'build'; ({ explore: exG, try: tryG, build: bG })[v].open = true; }
    P.group('Explore', { open: mode === 'explore' }); const exG = P.lastGroup;
    P.swatches({ value: colour, colors: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'], onChange: v => colour = v });
    P.toggle({ label: 'Show the reflection', value: showRef, onChange: v => { showRef = v; draw(); } });
    P.buttons([['←', () => move(0, -1)], ['↑', () => move(-1, 0)], ['↓', () => move(1, 0)], ['→', () => move(0, 1)]]);
    P.button('Clear', () => { cells = {}; draw(); });
    P.group('Have a go', { open: mode === 'try' }); const tryG = P.lastGroup;
    P.seg({ label: 'Shape size', options: [[4, 'Small'], [6, 'Medium'], [10, 'Large']], value: size, onChange: v => { size = v; newShape(); } });
    P.button('New shape', newShape, 'primary');
    P.note('Colour to draw with (it must match the square it reflects):');
    const trySw = P.swatches({ value: tryCol, colors: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'], onChange: v => tryCol = v });
    P.buttons([['Check', () => { if (!Object.keys(attempt).length) return c.toast('Tap squares to draw the reflection first'); checked = true; draw(); }, 'primary'], ['Show the answer', () => { answer = !answer; checked = true; draw(); }]]);
    P.button('Try again', () => { attempt = {}; checked = false; answer = false; draw(); });
    P.group('Teacher builds', { open: mode === 'build' }); const bG = P.lastGroup;
    P.swatches({ value: colour, colors: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'], onChange: v => colour = v });
    P.button('Start the challenge', () => { if (!Object.keys(build).length) return c.toast('Colour some squares first'); given = { ...build }; attempt = {}; checked = false; answer = false; tryCol = Object.values(given)[0]; trySw.set && trySw.set(tryCol, true); setMode('try'); }, 'primary');
    P.button('Clear', () => { build = {}; draw(); });
    exG.hidden = mode !== 'explore'; tryG.hidden = mode !== 'try'; bG.hidden = mode !== 'build';
    draw();
  }
});

tool({
  id: 'coordinates', name: 'Coordinates', strand: 'geom', years: [4, 5, 6], w: 1100, h: 660,
  desc: 'Plot shapes on one, two or four quadrants, then translate, reflect and rotate them. Includes SATs-style problems for finding unknown coordinates on axes without a grid.',
  tags: 'coordinates axes quadrants plot translate reflect rotate shapes unknown missing coordinates gridless sats',
  icon: '<path d="M8 4v36h36"/><circle cx="20" cy="22" r="3" fill="currentColor"/><circle cx="34" cy="14" r="3" fill="currentColor"/><path d="M20 22L34 14"/>',
  guide: ['Shape: choose Draw a shape and tap the grid to place corners A, B, C. Tap Finish shape when you are done, or use Random shape.', 'Tap any corner letter to show its coordinates. Tap it again to hide them. Display has switches to show or hide every coordinate at once.', 'Translate, Reflect and Rotate each open from the menu. Turn on Keep every new shape to build up several shapes: reflect in the x-axis and then in the y-axis to finish with four shapes, one in each quadrant.', 'Drag a corner of the original shape and every new shape follows it.', 'Find the missing coordinates gives SATs-style questions on axes without a grid. Use the side lengths and the coordinates you are given to work out the missing ones, then show the working one step at a time.'],
  mount(c) {
    const { svg, P } = c;
    let quad = 1, max = 10, grid = true, nums = true, shape = [], locked = false, imgs = [], keep = false, allXY = false, list = true, shown = {}, mode = 'draw', tdx = 3, tdy = 0, rc = [0, 0], picking = false, view = 'explore', prob = null, step = 0, answer = false, level = 'easy', probGrid = false, hist = [], qset = 'mixed', qnames = true;
    c.persist(() => ({ quad, max, grid, nums, shape, locked, imgs, keep, allXY, list, shown, mode, tdx, tdy, rc, view, prob, step, answer, level, qset, qnames }), s => ({ quad, max, grid, nums, shape, locked, imgs, keep, allXY, list, shown, mode, tdx, tdy, rc, view, prob, step, answer, level, qset, qnames } = Object.assign({ quad, max, grid, nums, shape, locked, imgs, keep, allXY, list, shown, mode, tdx, tdy, rc, view, prob, step, answer, level, qset, qnames }, s)));
    const g = S('g', {}, svg);
    const defs = S('defs', {}, svg); const mk = S('marker', { id: 'carr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-3)' }, mk);
    const mk2 = S('marker', { id: 'caxis', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink)' }, mk2);
    const COLS = ['blue', 'orange', 'green', 'purple', 'pink', 'teal', 'red', 'yellow'];
    const PRIMES = ['', '′', '″', '‴', '⁗'];
    const L = (i, gen) => String.fromCharCode(65 + i) + (gen < 5 ? PRIMES[gen] : '' + gen);
    const bounds = () => ({ xlo: quad === 1 ? 0 : -max, ylo: quad === 4 ? -max : 0 });
    const geo = () => { const { xlo, ylo } = bounds(), s = Math.min(600 / (max - xlo), (quad === 2 ? 300 : 580) / (max - ylo)), base = quad === 2 ? 470 : 620; return { xlo, ylo, s, X: v => 50 + (v - xlo) * s, Y: v => base - (v - ylo) * s, base }; };
    const inside = ([a, b]) => { const { xlo, ylo } = bounds(); return a >= xlo && a <= max && b >= ylo && b <= max; };
    const snapshot = () => { hist.push(JSON.stringify({ shape, locked, imgs, shown })); if (hist.length > 60) hist.shift(); };
    const undo = () => { const h = hist.pop(); if (!h) return c.toast('Nothing to undo'); ({ shape, locked, imgs, shown } = JSON.parse(h)); draw(); };
    // ---------- transformations ----------
    function apply(op, pts) {
      if (op.t === 'tr') return pts.map(([a, b]) => [a + op.dx, b + op.dy]);
      if (op.t === 'rx') return pts.map(([a, b]) => [a, -b]);
      if (op.t === 'ry') return pts.map(([a, b]) => [-a, b]);
      if (op.t === 'rot') { const [cx, cy] = op.c; return pts.map(([a, b]) => op.a === 90 ? [cx + (b - cy), cy - (a - cx)] : op.a === -90 ? [cx - (b - cy), cy + (a - cx)] : [2 * cx - a, 2 * cy - b]); }
      return pts;
    }
    function all() { // every shape on the board, recomputed from the original
      const out = [{ pts: shape, gen: 0, col: 'blue', op: null }];
      imgs.forEach((im, k) => { const src = out[im.src] || out[0]; out.push({ pts: apply(im.op, src.pts), gen: k + 1, col: COLS[(k + 1) % COLS.length], op: im.op, src: im.src }); });
      return out;
    }
    const same = (p, q) => p.length === q.length && p.every(([a, b]) => q.some(([x, y]) => x === a && y === b));
    function addImage(op, srcs) {
      if (shape.length < 2) return c.toast('Draw or make a shape first');
      snapshot(); locked = true; view = 'explore';
      if (!keep) { imgs = [{ src: 0, op }]; fitAxes(); draw(); return; }
      const cur = all(); let added = 0;
      (srcs === 'all' ? cur.map((_, i) => i) : [cur.length - 1]).forEach(i => {
        const pts = apply(op, cur[i].pts); if (cur.some(s => same(s.pts, pts)) || imgs.some((im, k) => same(all()[k + 1].pts, pts))) return;
        imgs.push({ src: i, op }); added++;
      });
      if (!added) c.toast('That shape is already on the grid');
      if (imgs.length > 7) imgs = imgs.slice(0, 7);
      fitAxes(); draw();
    }
    function fitAxes() { // open up more quadrants, or longer axes, so every new shape can be seen
      const pts = all().flatMap(q => q.pts); if (!pts.length) return;
      const negX = pts.some(p => p[0] < 0), negY = pts.some(p => p[1] < 0), big = Math.max(...pts.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1]))));
      let nq = quad, nm = max; if (negY) nq = 4; else if (negX && nq === 1) nq = 2; if (big > nm) nm = big <= 10 ? 10 : 20;
      if (nq !== quad || nm !== max) { const msg = nq !== quad ? `Showing ${nq} quadrants so you can see the new shape` : `Axes now go up to ${nm}`; quad = nq; max = nm; qSeg && qSeg.set(quad, true); mSeg && mSeg.set(max, true); c.toast(msg); }
    }
    function describe(s) {
      const op = s.op; if (!op) return '';
      if (op.t === 'tr') { const p = []; if (op.dx) p.push(`${Math.abs(op.dx)} ${op.dx > 0 ? 'right' : 'left'}`); if (op.dy) p.push(`${Math.abs(op.dy)} ${op.dy > 0 ? 'up' : 'down'}`); return `translated ${p.join(', ') || 'by 0'}`; }
      if (op.t === 'rx') return 'reflected in the x-axis';
      if (op.t === 'ry') return 'reflected in the y-axis';
      return `rotated ${op.a === 180 ? '180°' : '90° ' + (op.a === 90 ? 'clockwise' : 'anticlockwise')} about (${op.c[0]}, ${op.c[1]})`;
    }
    // ---------- explore view ----------
    function gridClick(e) {
      const { xlo, ylo, s, base } = geo(), p = c.pt(e), vx = Math.round(xlo + (p.x - 50) / s), vy = Math.round(ylo + (base - p.y) / s); if (!inside([vx, vy])) return;
      if (picking) { rc = [vx, vy]; picking = false; c.toast(`Centre of rotation set to (${vx}, ${vy})`); draw(); return; }
      if (locked || mode === 'mark') return;
      snapshot(); const i = shape.findIndex(q => q[0] === vx && q[1] === vy); if (i >= 0) shape.splice(i, 1); else if (shape.length < 12) shape.push([vx, vy]); imgs = []; draw();
    }
    function coordPill(x, y, t, cl, ux, uy) {
      const w = t.length * 9.6 + 16; x += ux * (w / 2 * Math.abs(ux) + 40); const yy = y + uy * 46 - 13;
      S('rect', { x: x - w / 2, y: yy, width: w, height: 26, rx: 13, fill: col(cl), 'pointer-events': 'none' }, g);
      text(g, x, yy + 13.5, t, { 'font-size': 15, 'font-weight': 800, fill: '#fff', cls: 'num', 'pointer-events': 'none' });
    }
    function drawExplore() {
      const { xlo, ylo, s, X, Y } = geo();
      const bg = S('rect', { x: X(xlo) - s / 2, y: Y(max) - s / 2, width: (max - xlo + 1) * s, height: (max - ylo + 1) * s, fill: 'transparent', cls: 'hit' }, g);
      bg.addEventListener('click', gridClick);
      const stp = max > 12 ? 2 : 1;
      for (let v = xlo; v <= max; v++) { if (grid) S('line', { x1: X(v), y1: Y(ylo), x2: X(v), y2: Y(max), stroke: 'var(--line)', 'pointer-events': 'none' }, g); if (nums && v % stp === 0 && v) text(g, X(v), Y(0) + 20, nf(v), { 'font-size': 14, cls: 'num', fill: 'var(--ink-2)', 'pointer-events': 'none' }); }
      for (let v = ylo; v <= max; v++) { if (grid) S('line', { x1: X(xlo), y1: Y(v), x2: X(max), y2: Y(v), stroke: 'var(--line)', 'pointer-events': 'none' }, g); if (nums && v % stp === 0 && v) text(g, X(0) - 16, Y(v), nf(v), { 'font-size': 14, cls: 'num', fill: 'var(--ink-2)', 'pointer-events': 'none' }); }
      text(g, X(0) - 12, Y(0) + 18, '0', { 'font-size': 14, fill: 'var(--ink-2)', 'pointer-events': 'none' });
      S('line', { x1: X(xlo), y1: Y(0), x2: X(max) + 16, y2: Y(0), stroke: 'var(--ink)', 'stroke-width': 3, 'pointer-events': 'none' }, g);
      S('line', { x1: X(0), y1: Y(ylo), x2: X(0), y2: Y(max) - 16, stroke: 'var(--ink)', 'stroke-width': 3, 'pointer-events': 'none' }, g);
      text(g, X(max) + 28, Y(0), 'x', { 'font-size': 22, 'font-weight': 700 }); text(g, X(0), Y(max) - 30, 'y', { 'font-size': 22, 'font-weight': 700 });
      if (qnames && quad > 1) { const qn = [['First quadrant', 1, 1], ['Second quadrant', -1, 1], ['Third quadrant', -1, -1], ['Fourth quadrant', 1, -1]].slice(0, quad === 2 ? 2 : 4); qn.forEach(([n, sx, sy]) => text(g, X(sx * max / 2), Y(sy * max * .9), n, { 'font-size': 18, 'font-weight': 800, fill: 'var(--ink-3)', opacity: .55, 'pointer-events': 'none' })); }
      const sh = all();
      // mirror lines and centres
      if (sh.some(q => q.op && q.op.t === 'rx')) S('line', { x1: X(xlo), y1: Y(0), x2: X(max), y2: Y(0), stroke: 'var(--red)', 'stroke-width': 6, opacity: .45, 'pointer-events': 'none' }, g);
      if (sh.some(q => q.op && q.op.t === 'ry')) S('line', { x1: X(0), y1: Y(ylo), x2: X(0), y2: Y(max), stroke: 'var(--red)', 'stroke-width': 6, opacity: .45, 'pointer-events': 'none' }, g);
      const showC = sh.some(q => q.op && q.op.t === 'rot') || picking;
      if (showC) { S('circle', { cx: X(rc[0]), cy: Y(rc[1]), r: 9, fill: 'var(--red)', stroke: 'var(--board)', 'stroke-width': 3, 'pointer-events': 'none' }, g); text(g, X(rc[0]) - 12, Y(rc[1]) + 22, 'centre', { 'font-size': 13, 'font-weight': 800, fill: 'var(--red)', 'text-anchor': 'end', 'pointer-events': 'none' }); }
      // translation arrows (newest translation only)
      const lastTr = [...sh].reverse().find(q => q.op && q.op.t === 'tr');
      if (lastTr) sh[lastTr.src].pts.forEach((p, i) => S('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(lastTr.pts[i][0]), y2: Y(lastTr.pts[i][1]), stroke: 'var(--ink-3)', 'stroke-width': 2, 'stroke-dasharray': '5 5', 'marker-end': 'url(#carr)', 'pointer-events': 'none' }, g));
      // shapes, newest underneath the original
      [...sh].reverse().forEach(q => { if (q.pts.length > 1) S(q.gen === 0 && !(locked && q.pts.length > 2) ? 'polyline' : 'polygon', { points: q.pts.map(([a, b]) => X(a) + ',' + Y(b)).join(' '), fill: q.gen === 0 && !(locked && q.pts.length > 2) ? 'none' : col(q.col), 'fill-opacity': .16, stroke: col(q.col), 'stroke-width': 4, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g); });
      const labels = [];
      sh.forEach((q, si) => q.pts.forEach(([a, b], i) => {
        const key = si + ':' + i, on = allXY || shown[key], cx = q.pts.reduce((t, p) => t + p[0], 0) / q.pts.length, cy = q.pts.reduce((t, p) => t + p[1], 0) / q.pts.length;
        const dx = a - cx, dy = b - cy, len = Math.hypot(dx, dy) || 1, lx = X(a) + dx / len * 20, ly = Y(b) - dy / len * 20;
        const h = S('g', { cls: si === 0 && locked ? 'grab' : 'hit' }, g);
        S('circle', { cx: X(a), cy: Y(b), r: 20, fill: 'transparent' }, h);
        S('circle', { cx: X(a), cy: Y(b), r: si === 0 && locked ? 9 : 7, fill: col(q.col), stroke: 'var(--board)', 'stroke-width': 2.5 }, h);
        S('circle', { cx: lx, cy: ly, r: 15, fill: 'transparent' }, h);
        text(h, lx, ly, L(i, q.gen), { 'font-size': 17, 'font-weight': 800, fill: col(q.col), stroke: 'var(--board)', 'stroke-width': 4, 'paint-order': 'stroke' });
        if (on) labels.push([X(a), Y(b), `(${nf(a)}, ${nf(b)})`, q.col, dx / len, -dy / len]);
        const toggle = () => { shown[key] = !shown[key]; if (allXY && !shown[key]) { allXY = false; sh.forEach((qq, sj) => qq.pts.forEach((_, j) => { if (sj + ':' + j !== key) shown[sj + ':' + j] = true; })); } draw(); };
        if (si === 0 && locked) { let moved = false; c.drag(h, { start: () => { moved = false; }, move: p => { const { xlo: xl, ylo: yl, s: ss, base } = geo(); const nx = Math.round(xl + (p.x - 50) / ss), ny = Math.round(yl + (base - p.y) / ss); if (!inside([nx, ny]) || (nx === shape[i][0] && ny === shape[i][1])) return; if (!moved) { snapshot(); moved = true; } shape[i] = [nx, ny]; draw(); }, end: () => { if (!moved) toggle(); } }); }
        else h.addEventListener('click', e => { e.stopPropagation(); toggle(); });
      }));
      labels.forEach(l => coordPill(...l));
      // right-hand panel
      const ix = 720; let y = 46;
      const head = picking ? 'Tap the grid to choose the centre' : !locked && mode === 'draw' ? 'Tap the grid to add corners' : sh.length > 1 ? 'Shapes' : 'Shape';
      text(g, ix, y, head, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp' }); y += 30;
      if (locked && !picking) { text(g, ix, y, 'Tap a letter to show its coordinates', { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'start' }); y += 28; }
      if (list) sh.forEach((q, si) => {
        if (y > 610) return;
        if (sh.length > 1) { const nm = q.pts.slice(0, 5).map((_, i) => L(i, q.gen)).join('') + (q.pts.length > 5 ? '…' : ''); text(g, ix, y, si === 0 ? `${nm}: original shape` : `${nm}: ${describe(q)}`, { 'font-size': 14, 'font-weight': 800, fill: col(q.col), 'text-anchor': 'start' }); y += 22; }
        const per = q.pts.length > 4 ? 3 : 2;
        q.pts.forEach(([a, b], i) => { const on = allXY || shown[si + ':' + i]; text(g, ix + (i % per) * (360 / per), y + Math.floor(i / per) * 24, `${L(i, q.gen)} ${on ? `(${nf(a)}, ${nf(b)})` : '( ?, ? )'}`, { 'font-size': 16, 'text-anchor': 'start', cls: 'num', fill: col(q.col), 'font-weight': 700 }); });
        y += Math.ceil(q.pts.length / per) * 24 + 10;
      });
      if (sh.slice(1).some(q => !q.pts.every(inside))) text(g, ix, Math.min(y + 6, 640), 'Part of a new shape is off the grid', { 'font-size': 15, 'font-weight': 700, fill: 'var(--red)', 'text-anchor': 'start' });
    }
    // ---------- find the missing coordinates ----------
    const R = (a, b) => rnd(a, b);
    function makeProblem(lv) {
      const SH = lv === 'easy' ? ['rectOpp', 'rectSides'] : lv === 'medium' ? ['square', 'iso', 'rectSides2', 'twoRects'] : ['negRect', 'negSquare', 'twoSquares'];
      const TR = lv === 'easy' ? ['ptTrans', 'ptTrans'] : lv === 'medium' ? ['ptTrans2', 'describe', 'triTrans'] : ['translate', 'triTransNeg', 'describeNeg'];
      const kinds = qset === 'shapes' ? SH : qset === 'trans' ? TR : SH.concat(TR);
      const k = kinds[R(0, kinds.length - 1)];
      let p = {};
      if (k === 'rectOpp') { const x1 = R(1, 5), y1 = R(1, 4), x2 = x1 + R(3, 7), y2 = y1 + R(2, 5); const ask = R(0, 1) ? 'B' : 'D'; p = { pts: { A: [x1, y1], B: [x2, y1], C: [x2, y2], D: [x1, y2] }, polys: [['A', 'B', 'C', 'D']], known: ['A', 'C'], sides: [], ask: [ask], q: `ABCD is a rectangle. Find the coordinates of ${ask}.`, work: ask === 'B' ? [`B is level with A, so it has the same y-coordinate as A: ${y1}.`, `B is directly below C, so it has the same x-coordinate as C: ${x2}.`] : [`D is directly above A, so it has the same x-coordinate as A: ${x1}.`, `D is level with C, so it has the same y-coordinate as C: ${y2}.`] }; }
      if (k === 'rectSides' || k === 'rectSides2') { const x1 = R(1, 5), y1 = R(1, 4), w = R(3, 8), h = R(2, 5), ask = k === 'rectSides' ? 'C' : ['B', 'C', 'D'][R(0, 2)]; p = { pts: { A: [x1, y1], B: [x1 + w, y1], C: [x1 + w, y1 + h], D: [x1, y1 + h] }, polys: [['A', 'B', 'C', 'D']], known: ['A'], sides: [['A', 'B', w], ['B', 'C', h]], ask: [ask], q: `ABCD is a rectangle. AB is ${w} units long and BC is ${h} units long. Find the coordinates of ${ask}.` }; const wk = { B: [`B is ${w} units to the right of A: ${x1} + ${w} = ${x1 + w}.`, `B is level with A, so y stays ${y1}.`], C: [`C is ${w} units to the right of A: ${x1} + ${w} = ${x1 + w}.`, `C is ${h} units above A: ${y1} + ${h} = ${y1 + h}.`], D: [`D is directly above A, so x stays ${x1}.`, `D is ${h} units above A: ${y1} + ${h} = ${y1 + h}.`] }; p.work = wk[ask]; }
      if (k === 'square' || k === 'negSquare') { const neg = k === 'negSquare', s = R(3, 6), x1 = neg ? R(-6, -2) : R(1, 5), y1 = neg ? R(-5, -1) : R(1, 4); const ask = neg ? 'C' : ['C', 'D'][R(0, 1)]; p = { pts: { A: [x1, y1], B: [x1 + s, y1], C: [x1 + s, y1 + s], D: [x1, y1 + s] }, polys: [['A', 'B', 'C', 'D']], known: ['A'], sides: [['A', 'B', s]], ask: [ask], q: `ABCD is a square with sides of ${s} units. Find the coordinates of ${ask}.`, work: ask === 'C' ? [`All sides of a square are equal, so every side is ${s} units.`, `C is ${s} right of A: ${x1} + ${s} = ${x1 + s}.`, `C is ${s} up from A: ${y1} + ${s} = ${y1 + s}.`] : [`All sides of a square are equal, so AD is ${s} units.`, `D is directly above A, so x stays ${x1}.`, `D is ${s} up from A: ${y1} + ${s} = ${y1 + s}.`] }; }
      if (k === 'iso') { const x1 = R(1, 4), y1 = R(1, 3), b = 2 * R(2, 4), h = R(3, 6); p = { pts: { A: [x1, y1], B: [x1 + b, y1], C: [x1 + b / 2, y1 + h] }, polys: [['A', 'B', 'C']], known: ['A', 'B'], sides: [], ask: ['C'], height: ['C', h], q: `Triangle ABC is isosceles, with AC = BC. C is ${h} units above the line AB. Find the coordinates of C.`, work: [`C is exactly halfway between A and B. AB is ${x1 + b} − ${x1} = ${b} units long.`, `Half of ${b} is ${b / 2}, so x = ${x1} + ${b / 2} = ${x1 + b / 2}.`, `C is ${h} units above AB: y = ${y1} + ${h} = ${y1 + h}.`] }; }
      if (k === 'twoRects') { const x1 = R(1, 3), y1 = R(1, 3), w1 = R(2, 4), w2 = R(2, 4), h1 = R(3, 5), h2 = R(1, h1 - 1); p = { pts: { A: [x1, y1], B: [x1 + w1, y1], C: [x1 + w1 + w2, y1], D: [x1 + w1 + w2, y1 + h2], E: [x1 + w1, y1 + h2], F: [x1 + w1, y1 + h1], G: [x1, y1 + h1] }, polys: [['A', 'B', 'E', 'F', 'G'], ['B', 'C', 'D', 'E']], known: ['A', 'D', 'F'], sides: [], ask: ['C'], q: `The shape is made from two rectangles. Find the coordinates of C.`, work: [`C is level with A, so it has the same y-coordinate as A: ${y1}.`, `C is directly below D, so it has the same x-coordinate as D: ${x1 + w1 + w2}.`] }; }
      if (k === 'negRect') { const x1 = R(-7, -2), y1 = R(-6, -2), w = R(4, 9), h = R(4, 8), ask = ['B', 'C', 'D'][R(0, 2)]; p = { pts: { A: [x1, y1], B: [x1 + w, y1], C: [x1 + w, y1 + h], D: [x1, y1 + h] }, polys: [['A', 'B', 'C', 'D']], known: ['A'], sides: [['A', 'B', w], ['B', 'C', h]], ask: [ask], q: `ABCD is a rectangle. AB = ${w} units and BC = ${h} units. Find the coordinates of ${ask}.` }; const wk = { B: [`B is ${w} units right of A: ${x1} + ${w} = ${x1 + w}.`, `B is level with A, so y stays ${y1}.`], C: [`C is ${w} units right of A: ${x1} + ${w} = ${x1 + w}.`, `C is ${h} units up from A: ${y1} + ${h} = ${y1 + h}.`], D: [`D is directly above A, so x stays ${x1}.`, `D is ${h} units up from A: ${y1} + ${h} = ${y1 + h}.`] }; p.work = wk[ask].concat(['Count carefully across zero: adding moves right or up, even from a negative number.']); }
      if (k === 'translate') { const x1 = R(-7, -3), y1 = R(1, 4), w = R(2, 4), h = R(2, 3), dx = R(5, 9), dy = -R(4, 8); p = { pts: { A: [x1, y1], B: [x1 + w, y1], C: [x1 + w, y1 + h], D: [x1, y1 + h], 'A′': [x1 + dx, y1 + dy], 'B′': [x1 + w + dx, y1 + dy], 'C′': [x1 + w + dx, y1 + h + dy], 'D′': [x1 + dx, y1 + h + dy] }, polys: [['A', 'B', 'C', 'D'], ['A′', 'B′', 'C′', 'D′']], known: ['A', 'C', 'A′'], sides: [], ask: ['C′'], q: `Rectangle ABCD is translated to A′B′C′D′. Find the coordinates of C′.`, work: [`From A to A′, x changes by ${x1 + dx} − (${x1}) = ${dx}. That is ${dx} to the right.`, `From A to A′, y changes by ${y1 + dy} − ${y1} = ${dy}. That is ${-dy} down.`, `Move C the same way: x = ${x1 + w} + ${dx} = ${x1 + w + dx}, y = ${y1 + h} − ${-dy} = ${y1 + h + dy}.`] }; }
      if (k === 'twoSquares') { const s = R(2, 4), t = R(2, 4), x1 = R(-6, -1), y1 = R(-5, -1); p = { pts: { A: [x1, y1], B: [x1 + s, y1], C: [x1 + s + t, y1], D: [x1 + s + t, y1 + t], E: [x1 + s, y1 + t], F: [x1 + s, y1 + s], G: [x1, y1 + s] }, polys: [['A', 'B', 'F', 'G'], ['B', 'C', 'D', 'E']], known: ['A'], sides: [['A', 'B', s], ['B', 'C', t]], ask: ['D'], q: `The shape is made from two squares side by side. AB = ${s} units and BC = ${t} units. Find the coordinates of D.`, work: [`AC = ${s} + ${t} = ${s + t}, so D is ${s + t} right of A: x = ${x1} + ${s + t} = ${x1 + s + t}.`, `The smaller square has sides of ${t}, so D is ${t} up from A: y = ${y1} + ${t} = ${y1 + t}.`] }; }
      const dir = (dx, dy) => [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(' and ');
      if (k === 'ptTrans' || k === 'ptTrans2') { const x = R(1, 5), y = R(1, 5), dx = k === 'ptTrans' ? R(2, 5) : R(2, 5) * (R(0, 1) ? 1 : -1), dy = k === 'ptTrans' ? R(1, 4) : R(1, 4) * (R(0, 1) ? 1 : -1); const nx = x + dx < 0 ? x + Math.abs(dx) : x + dx, ny = y + dy < 0 ? y + Math.abs(dy) : y + dy, ddx = nx - x, ddy = ny - y; p = { pts: { P: [x, y], 'P′': [nx, ny] }, polys: [], known: ['P'], sides: [], ask: ['P′'], arrows: [['P', 'P′']], q: `Point P is translated ${dir(ddx, ddy)} to P′. Find the coordinates of P′.`, work: [`Moving ${ddx > 0 ? 'right adds to' : 'left takes away from'} the x-coordinate: ${x} ${ddx > 0 ? '+' : '−'} ${Math.abs(ddx)} = ${nx}.`, `Moving ${ddy > 0 ? 'up adds to' : 'down takes away from'} the y-coordinate: ${y} ${ddy > 0 ? '+' : '−'} ${Math.abs(ddy)} = ${ny}.`] }; }
      if (k === 'triTrans' || k === 'triTransNeg') { const neg = k === 'triTransNeg', ax = neg ? R(-6, -3) : R(1, 3), ay = neg ? R(1, 3) : R(1, 3), bx = ax + R(3, 5), by = ay, cx2 = ax + R(1, 2), cy2 = ay + R(2, 4), dx = neg ? R(5, 9) : R(3, 6), dy = neg ? -R(4, 7) : R(1, 3); p = { pts: { A: [ax, ay], B: [bx, by], C: [cx2, cy2], 'A′': [ax + dx, ay + dy], 'B′': [bx + dx, by + dy], 'C′': [cx2 + dx, cy2 + dy] }, polys: [['A', 'B', 'C'], ['A′', 'B′', 'C′']], known: ['A', 'B', 'C'], sides: [], ask: ['C′'], arrows: [['C', 'C′']], q: `Triangle ABC is translated ${dir(dx, dy)} to make triangle A′B′C′. Find the coordinates of C′.`, work: [`C′ is C moved ${dir(dx, dy)}.`, `x: ${cx2} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${cx2 + dx}.`, `y: ${cy2} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${cy2 + dy}.`] }; }
      if (k === 'describe' || k === 'describeNeg') { const neg = k === 'describeNeg', ax = neg ? R(-6, -2) : R(1, 3), ay = neg ? R(-5, -1) : R(1, 3), dx = neg ? R(4, 8) : R(3, 6) * (R(0, 1) ? 1 : -1), dy = neg ? R(3, 7) : R(1, 4) * (R(0, 1) ? 1 : -1); const fx = dx < 0 && !neg ? ax - dx : ax, fy = dy < 0 && !neg ? ay - dy : ay; p = { pts: { A: [fx, fy], B: [fx + 3, fy], C: [fx, fy + 2], 'A′': [fx + dx, fy + dy], 'B′': [fx + 3 + dx, fy + dy], 'C′': [fx + dx, fy + 2 + dy] }, polys: [['A', 'B', 'C'], ['A′', 'B′', 'C′']], known: ['A', 'A′'], sides: [], ask: [], arrows: [['A', 'A′']], q: `Triangle ABC is translated to triangle A′B′C′. Describe the translation.`, work: [`Compare A and A′. Change in x: ${fx + dx} − ${fx < 0 ? `(${fx})` : fx} = ${dx}, so ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}.`, `Change in y: ${fy + dy} − ${fy < 0 ? `(${fy})` : fy} = ${dy}, so ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}.`], answerText: `${dir(dx, dy)}` }; }
      p.kind = k; return p;
    }
    const fw = p => p.known.map(n => `Mark what you know about ${n} (${p.pts[n][0]}, ${p.pts[n][1]}): draw dashed lines from ${n} to each axis and write x = ${p.pts[n][0]} and y = ${p.pts[n][1]} on the axes.`).concat(p.work);
    const mm = t => String(t).replace(/(^|[\s(,:=])-(\d)/g, '$1−$2');
    function newProblem() { prob = makeProblem(level); step = 0; answer = false; probGrid = false; view = 'unk'; draw(); }
    function wrap(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function drawProblem() {
      if (!prob) { newProblem(); return; }
      const pts = Object.values(prob.pts), xs = pts.map(p => p[0]).concat(0), ys = pts.map(p => p[1]).concat(0);
      const xlo = Math.min(...xs) - 1, xhi = Math.max(...xs) + 1.5, ylo = Math.min(...ys) - 1, yhi = Math.max(...ys) + 1.5;
      const s = Math.min(530 / (xhi - xlo), 540 / (yhi - ylo)), X = v => 120 + (v - xlo) * s, Y = v => 610 - (v - ylo) * s;
      if (probGrid) { for (let v = Math.ceil(xlo); v <= xhi; v++) S('line', { x1: X(v), y1: Y(ylo), x2: X(v), y2: Y(yhi), stroke: 'var(--line)' }, g); for (let v = Math.ceil(ylo); v <= yhi; v++) S('line', { x1: X(xlo), y1: Y(v), x2: X(xhi), y2: Y(v), stroke: 'var(--line)' }, g); }
      S('line', { x1: X(xlo), y1: Y(0), x2: X(xhi), y2: Y(0), stroke: 'var(--ink)', 'stroke-width': 3, 'marker-end': 'url(#caxis)' }, g);
      S('line', { x1: X(0), y1: Y(ylo), x2: X(0), y2: Y(yhi), stroke: 'var(--ink)', 'stroke-width': 3, 'marker-end': 'url(#caxis)' }, g);
      if (xlo < 0) S('line', { x1: X(0), y1: Y(0), x2: X(xlo), y2: Y(0), stroke: 'var(--ink)', 'stroke-width': 3, 'marker-end': 'url(#caxis)' }, g);
      if (ylo < 0) S('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(ylo), stroke: 'var(--ink)', 'stroke-width': 3, 'marker-end': 'url(#caxis)' }, g);
      text(g, X(xhi) + 4, Y(0) + 22, 'x', { 'font-size': 20, 'font-weight': 700 }); text(g, X(0) - 18, Y(yhi), 'y', { 'font-size': 20, 'font-weight': 700 }); text(g, X(0) - 12, Y(0) + 16, '0', { 'font-size': 16, 'font-weight': 700 });
      prob.polys.forEach((poly, i) => S('polygon', { points: poly.map(n => X(prob.pts[n][0]) + ',' + Y(prob.pts[n][1])).join(' '), fill: col(i ? 'orange' : 'blue'), 'fill-opacity': .14, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g));
      prob.sides.forEach(([a, b, l]) => { const [x1, y1] = prob.pts[a], [x2, y2] = prob.pts[b], mx = (X(x1) + X(x2)) / 2, my = (Y(y1) + Y(y2)) / 2, horiz = y1 === y2; text(g, mx + (horiz ? 0 : 22), my + (horiz ? 20 : 0), l + ' units', { 'font-size': 16, 'font-weight': 800, fill: 'var(--accent)', 'text-anchor': horiz ? 'middle' : 'start' }); });
      if (prob.height) { const [n, h] = prob.height, [cx, cy] = prob.pts[n]; S('line', { x1: X(cx), y1: Y(cy), x2: X(cx), y2: Y(cy - h), stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g); text(g, X(cx) + 8, (Y(cy) + Y(cy - h)) / 2, h + ' units', { 'font-size': 16, 'font-weight': 800, fill: 'var(--accent)', 'text-anchor': 'start' }); }
      const ann = (n, cl) => { const [a, b] = prob.pts[n]; S('line', { x1: X(a), y1: Y(b), x2: X(a), y2: Y(0), stroke: col(cl), 'stroke-width': 2.5, 'stroke-dasharray': '7 6' }, g); S('line', { x1: X(a), y1: Y(b), x2: X(0), y2: Y(b), stroke: col(cl), 'stroke-width': 2.5, 'stroke-dasharray': '7 6' }, g); S('line', { x1: X(a), y1: Y(0) - 7, x2: X(a), y2: Y(0) + 7, stroke: col(cl), 'stroke-width': 3 }, g); S('line', { x1: X(0) - 7, y1: Y(b), x2: X(0) + 7, y2: Y(b), stroke: col(cl), 'stroke-width': 3 }, g); text(g, X(a), Y(0) + (b < 0 ? -18 : 20), mm(String(a)), { 'font-size': 17, 'font-weight': 800, fill: col(cl), cls: 'num', stroke: 'var(--board)', 'stroke-width': 4, 'paint-order': 'stroke' }); text(g, X(0) + (a < 0 ? 12 : -12), Y(b), mm(String(b)), { 'font-size': 17, 'font-weight': 800, fill: col(cl), cls: 'num', 'text-anchor': a < 0 ? 'start' : 'end', stroke: 'var(--board)', 'stroke-width': 4, 'paint-order': 'stroke' }); };
      prob.known.slice(0, step).forEach(n => ann(n, 'blue'));
      if (answer) prob.ask.forEach(n => ann(n, 'green'));
      (prob.arrows || []).forEach(([a, b]) => { if (prob.ask.includes(b) && !answer && !prob.known.includes(b)) { /* arrow still shows the move */ } S('line', { x1: X(prob.pts[a][0]), y1: Y(prob.pts[a][1]), x2: X(prob.pts[b][0]), y2: Y(prob.pts[b][1]), stroke: 'var(--ink-3)', 'stroke-width': 2.5, 'stroke-dasharray': '8 6', 'marker-end': 'url(#carr)' }, g); });
      const cxm = pts.reduce((t, p) => t + p[0], 0) / pts.length, cym = pts.reduce((t, p) => t + p[1], 0) / pts.length;
      Object.entries(prob.pts).forEach(([n, [a, b]]) => {
        const isAsk = prob.ask.includes(n), isKnown = prob.known.includes(n);
        if (!isAsk && !isKnown && !answer) { /* plain letter */ }
        const dx0 = a - cxm, dy = b - cym, nearY = dx0 < -0.3 && a >= 0 && X(a) - X(0) < 130, dx = nearY ? Math.abs(dx0) : dx0, len = Math.hypot(dx, dy) || 1, lx = X(a) + dx / len * 26, ly = Y(b) - dy / len * 22 + (nearY ? (dy >= 0 ? -10 : 10) : 0);
        S('circle', { cx: X(a), cy: Y(b), r: 5, fill: 'var(--ink)' }, g);
        const lab = mm(isKnown || (isAsk && answer) ? `${n} (${a}, ${b})` : isAsk ? `${n} (?, ?)` : n);
        const anchor = dx < -0.3 ? 'end' : dx > 0.3 ? 'start' : 'middle';
        const t = text(g, lx, ly, lab, { 'font-size': 18, 'font-weight': 800, cls: 'num' + (isAsk ? ' hit' : ''), 'text-anchor': anchor, fill: isAsk ? (answer ? 'var(--green)' : 'var(--accent)') : 'var(--ink)', stroke: 'var(--board)', 'stroke-width': 5, 'paint-order': 'stroke' });
        if (isAsk) t.addEventListener('click', () => { answer = !answer; draw(); });
      });
      text(g, 40, 30, 'Not drawn to scale', { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'start', 'font-style': 'italic' });
      // question panel
      const ix = 720; let y = 46;
      text(g, ix, y, `SATs-style question · ${level[0].toUpperCase() + level.slice(1)}`, { 'font-size': 15, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start' }); y += 34;
      wrap(mm(prob.q), 34).forEach(l => { text(g, ix, y, l, { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp' }); y += 28; });
      y += 14;
      if (step) { text(g, ix, y, 'Working', { 'font-size': 15, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start' }); y += 26; }
      fw(prob).slice(0, step).forEach((w, i) => { text(g, ix, y, `${i + 1}.`, { 'font-size': 16, 'font-weight': 800, fill: 'var(--accent)', 'text-anchor': 'start' }); wrap(mm(w), 38).forEach(l => { text(g, ix + 22, y, l, { 'font-size': 16, 'text-anchor': 'start', fill: 'var(--ink-2)', 'font-weight': 600 }); y += 22; }); y += 8; });
      if (answer && prob.answerText) { y += 6; S('rect', { x: ix, y: y - 20, width: 340, height: 40, rx: 12, fill: 'var(--green)' }, g); text(g, ix + 170, y, prob.answerText, { 'font-size': 20, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
      else if (answer) { y += 6; prob.ask.forEach(n => { const [a, b] = prob.pts[n]; S('rect', { x: ix, y: y - 20, width: 240, height: 40, rx: 12, fill: 'var(--green)' }, g); text(g, ix + 120, y, mm(`${n} = (${a}, ${b})`), { 'font-size': 22, 'font-weight': 800, fill: '#fff', cls: 'num' }); y += 50; }); }
      else if (!step) text(g, ix, y, 'Tap the ? label, or use the menu, to reveal the answer.', { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'start' });
    }
    function draw() { clear(g); if (view === 'unk') drawProblem(); else drawExplore(); }
    function randomShape() {
      snapshot(); const { xlo, ylo } = bounds(); const sp = Math.max(2, Math.min(4, Math.round(max / 3)));
      const lo = quad === 1 ? 1 : 2, ox = rnd(lo, Math.max(lo, Math.round(max / 2) - 1)), oy = rnd(lo, Math.max(lo, Math.round(max / 2) - 1));
      const kinds = [[[0, 0], [sp, 0], [0, sp]], [[0, 0], [sp + 1, 0], [sp + 1, sp - 1], [0, sp - 1]], [[0, 0], [sp, 0], [sp - 1, sp], [1, sp]], [[1, 0], [sp, 1], [sp - 1, sp], [0, sp - 1]], [[0, 0], [sp, 0], [sp, 1], [1, 1], [1, sp], [0, sp]]];
      shape = kinds[rnd(0, kinds.length - 1)].map(([a, b]) => [clamp(ox + a, xlo, max), clamp(oy + b, ylo, max)]); locked = true; imgs = []; shown = {}; view = 'explore'; draw();
    }
    const explore = () => { if (view !== 'explore') { view = 'explore'; draw(); } };
    // ---------- menu ----------
    P.section('Axes');
    const qSeg = P.seg({ options: [[1, '1 quadrant'], [2, '2 quadrants'], [4, '4 quadrants']], value: quad, onChange: v => { quad = v; shape = shape.filter(inside); imgs = []; view = 'explore'; draw(); } });
    const mSeg = P.seg({ label: 'Axes go up to', options: [[5, '5'], [10, '10'], [20, '20']], value: max, onChange: v => { max = v; shape = shape.filter(inside); view = 'explore'; draw(); } });
    P.group('Shape', { open: true });
    P.seg({ options: [['draw', 'Draw a shape'], ['mark', 'Look only']], value: mode, onChange: v => { mode = v; explore(); draw(); } });
    P.buttons([['Finish shape', () => { if (shape.length < 2) return c.toast('Add at least two corners first'); snapshot(); locked = true; view = 'explore'; draw(); }, 'primary'], ['Change it', () => { snapshot(); locked = false; imgs = []; view = 'explore'; mode = 'draw'; draw(); }]]);
    P.buttons([['Random shape', randomShape], ['Undo', undo]]);
    P.button('Clear everything', () => { snapshot(); shape = []; imgs = []; shown = {}; locked = false; view = 'explore'; draw(); });
    P.group('Display');
    P.toggle({ label: 'Coordinates on every corner', value: allXY, onChange: v => { allXY = v; if (!v) shown = {}; explore(); draw(); } });
    P.toggle({ label: 'Coordinates list', value: list, onChange: v => { list = v; draw(); } });
    P.toggle({ label: 'Grid lines', value: grid, onChange: v => { grid = v; draw(); } });
    P.toggle({ label: 'Numbers on the axes', value: nums, onChange: v => { nums = v; draw(); } });
    P.toggle({ label: 'Quadrant names', value: qnames, onChange: v => { qnames = v; draw(); } });
    P.note('Tap a corner letter on the grid to show or hide just that coordinate.');
    P.group('Translate');
    P.stepper({ label: 'Right (+) or left (−)', value: tdx, min: -20, max: 20, onChange: v => { tdx = v; const last = imgs[imgs.length - 1]; if (!keep && last && last.op.t === 'tr') { last.op.dx = v; draw(); } } });
    P.stepper({ label: 'Up (+) or down (−)', value: tdy, min: -20, max: 20, onChange: v => { tdy = v; const last = imgs[imgs.length - 1]; if (!keep && last && last.op.t === 'tr') { last.op.dy = v; draw(); } } });
    P.button('Translate', () => addImage({ t: 'tr', dx: tdx, dy: tdy }), 'primary');
    P.group('Reflect');
    P.buttons([['In the x-axis', () => { if (quad !== 4) return c.toast('Use four quadrants to reflect in the x-axis'); addImage({ t: 'rx' }, 'all'); }], ['In the y-axis', () => { if (quad === 1) return c.toast('Use two or four quadrants to reflect in the y-axis'); addImage({ t: 'ry' }, 'all'); }]]);
    P.note('With Keep every new shape on, a reflection copies every shape on the grid. Reflect in x, then in y, to fill all four quadrants.');
    P.group('Rotate');
    P.buttons([['90° clockwise', () => { if (quad !== 4) c.toast('Four quadrants give the most room to rotate'); addImage({ t: 'rot', a: 90, c: rc.slice() }); }], ['90° anticlockwise', () => addImage({ t: 'rot', a: -90, c: rc.slice() })]]);
    P.button('Half turn (180°)', () => addImage({ t: 'rot', a: 180, c: rc.slice() }));
    P.buttons([['Choose the centre', () => { if (!locked) return c.toast('Finish the shape first'); picking = true; view = 'explore'; draw(); }], ['Centre at (0, 0)', () => { rc = [0, 0]; draw(); }]]);
    P.group('New shapes');
    P.toggle({ label: 'Keep every new shape', value: keep, onChange: v => { keep = v; } });
    P.buttons([['Remove new shapes', () => { snapshot(); imgs = []; draw(); }], ['Remove the last', () => { snapshot(); imgs.pop(); draw(); }]]);
    P.button('Make the newest shape the original', () => { const sh = all(); if (sh.length < 2) return; snapshot(); shape = sh[sh.length - 1].pts.map(p => p.slice()); imgs = []; shown = {}; draw(); });
    P.group('Find the missing coordinates', { hint: 'SATs style' });
    P.seg({ label: 'Questions about', options: [['shapes', 'Shapes'], ['trans', 'Translations'], ['mixed', 'Both']], value: qset, onChange: v => { qset = v; newProblem(); } });
    P.seg({ label: 'Level', options: [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], value: level, onChange: v => { level = v; newProblem(); } });
    P.button('New question', newProblem, 'primary');
    P.buttons([['Next step', () => { if (view !== 'unk') return newProblem(); if (step < fw(prob).length) step++; else answer = true; draw(); }], ['Show answer', () => { if (view !== 'unk') return; answer = true; step = fw(prob).length; draw(); }]]);
    c.pulseWhen(c.btn('Next step'), () => view === 'unk' && prob && !answer);
    P.buttons([['Grid on or off', () => { if (view !== 'unk') return; probGrid = !probGrid; draw(); }], ['Back to my shape', () => { view = 'explore'; draw(); }]]);
    P.note('The axes have no grid or scale, as in the SATs. Use the coordinates and side lengths you are given.');
    draw();
  }
});

tool({
  id: 'shape-reveal', name: 'Shape reveal', strand: 'geom', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 700,
  desc: 'Uncover a hidden 2D or 3D shape a tile at a time, or guess it from clues in What shape am I?',
  tags: 'guess shape properties reasoning 2d 3d reveal clues game points faces edges vertices',
  icon: '<rect x="6" y="6" width="36" height="36" rx="3"/><path d="M18 6v36M30 6v36M6 18h36M6 30h36"/><path d="M18 30l6-12 6 12z" fill="currentColor"/>',
  guide: ['Choose a game: Shape reveal hides a shape under tiles, What shape am I? gives clues one at a time.', 'Pick the shapes for your class by key stage, and choose 2D, 3D or both.', 'Tap a tile to lift it, or tap Next clue. When you think you know, tap a shape name at the bottom of the board.', 'With points on, each round starts at 100. Every tile or clue costs points and a wrong guess costs more, so the fewer you need the more you score. A correct guess adds what is left to the total.'],
  mount(c) {
    const { svg, P, wrap } = c;
    // ---------- drawing helpers ----------
    const CX = 500, CY = 270;
    const poly = (g, pts, fill, extra = {}) => S('polygon', Object.assign({ points: pts.map(p => p.join(',')).join(' '), fill, stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linejoin': 'round' }, extra), g);
    const reg = (n, r, rot = 0, cx = CX, cy = CY) => Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + rot + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
    const shade = (cl, k) => `color-mix(in srgb, ${col(cl)} ${k}%, #000)`;
    function prism(g, base, d, cl) { // base: front face points; d: depth vector
      const back = base.map(([x, y]) => [x + d[0], y + d[1]]);
      base.forEach((p, i) => { const q = base[(i + 1) % base.length]; poly(g, [p, q, back[(i + 1) % base.length], back[i]], shade(cl, 70 + (i % 3) * 10)); });
      poly(g, base, col(cl));
    }
    function pyramid(g, base, apex, cl) { poly(g, base, shade(cl, 60)); base.forEach((p, i) => { const q = base[(i + 1) % base.length]; poly(g, [p, q, apex], shade(cl, 75 + (i % 3) * 9)); }); }
    const D2 = {
      circle: g => S('circle', { cx: CX, cy: CY, r: 200, stroke: 'var(--ink)', 'stroke-width': 5 }, g),
      semicircle: g => S('path', { d: `M290 ${CY + 80} A210 210 0 0 1 710 ${CY + 80} Z`, stroke: 'var(--ink)', 'stroke-width': 5 }, g),
      oval: g => S('ellipse', { cx: CX, cy: CY, rx: 290, ry: 170, stroke: 'var(--ink)', 'stroke-width': 5 }, g),
      square: g => poly(g, [[300, 70], [700, 70], [700, 470], [300, 470]]),
      rectangle: g => poly(g, [[180, 130], [820, 130], [820, 410], [180, 410]]),
      triangle: g => poly(g, reg(3, 230, 0, CX, CY + 40)),
      'right-angled triangle': g => poly(g, [[260, 470], [260, 80], [760, 470]]),
      'isosceles triangle': g => poly(g, [[500, 50], [680, 480], [320, 480]]),
      'equilateral triangle': g => poly(g, reg(3, 240, 0, CX, CY + 50)),
      'scalene triangle': g => poly(g, [[200, 460], [810, 470], [620, 90]]),
      pentagon: g => poly(g, reg(5, 220)),
      hexagon: g => poly(g, reg(6, 220)),
      heptagon: g => poly(g, reg(7, 220)),
      octagon: g => poly(g, reg(8, 220, Math.PI / 8)),
      decagon: g => poly(g, reg(10, 220)),
      parallelogram: g => poly(g, [[320, 120], [840, 120], [680, 430], [160, 430]]),
      rhombus: g => poly(g, [[500, 40], [760, 270], [500, 500], [240, 270]]),
      trapezium: g => poly(g, [[360, 120], [640, 120], [820, 430], [180, 430]]),
      kite: g => poly(g, [[500, 40], [700, 210], [500, 500], [300, 210]]),
      star: g => poly(g, Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 95 : 230; return [CX + r * Math.cos(a), CY + 10 + r * Math.sin(a)]; })),
    };
    const D3 = {
      cube: (g, cl) => prism(g, [[330, 180], [610, 180], [610, 460], [330, 460]], [110, -110], cl),
      cuboid: (g, cl) => prism(g, [[220, 220], [680, 220], [680, 450], [220, 450]], [130, -120], cl),
      'triangular prism': (g, cl) => prism(g, [[220, 450], [440, 450], [330, 230]], [330, -110], cl),
      'pentagonal prism': (g, cl) => prism(g, reg(5, 150, 0, 360, 330), [260, -100], cl),
      'hexagonal prism': (g, cl) => prism(g, reg(6, 150, 0, 360, 330), [260, -100], cl),
      'square-based pyramid': (g, cl) => pyramid(g, [[260, 430], [600, 430], [720, 350], [380, 350]], [490, 50], cl),
      'triangular-based pyramid': (g, cl) => pyramid(g, [[270, 450], [700, 450], [540, 350]], [500, 50], cl),
      cylinder: (g, cl) => { S('rect', { x: 330, y: 110, width: 340, height: 320, fill: shade(cl, 80), stroke: 'none' }, g); S('path', { d: 'M330 110 V430 M670 110 V430', stroke: 'var(--ink)', 'stroke-width': 5 }, g); S('path', { d: 'M330 430 A170 50 0 0 0 670 430', fill: shade(cl, 80), stroke: 'var(--ink)', 'stroke-width': 5 }, g); S('ellipse', { cx: 500, cy: 110, rx: 170, ry: 50, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 5 }, g); },
      cone: (g, cl) => { S('path', { d: 'M500 50 L310 440 A190 55 0 0 0 690 440 Z', fill: shade(cl, 82), stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linejoin': 'round' }, g); S('path', { d: 'M310 440 A190 55 0 0 1 690 440', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }, g); },
      sphere: (g, cl) => { S('circle', { cx: CX, cy: CY, r: 210, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 5 }, g); S('path', { d: `M290 ${CY} A210 60 0 0 0 710 ${CY}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }, g); S('ellipse', { cx: 430, cy: 190, rx: 60, ry: 34, fill: '#fff', opacity: .35, stroke: 'none' }, g); },
      hemisphere: (g, cl) => { S('path', { d: `M290 220 A210 210 0 0 0 710 220 Z`, fill: shade(cl, 82), stroke: 'var(--ink)', 'stroke-width': 5 }, g); S('ellipse', { cx: CX, cy: 220, rx: 210, ry: 60, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 5 }, g); },
    };
    // ---------- shape data: [name, dim, first key stage band (1 = KS1, 2 = Lower KS2, 3 = Upper KS2), facts from vague to specific] ----------
    const SHAPES = [
      ['circle', 2, 1, ['I am a 2D shape.', 'I have no straight sides.', 'I have no corners at all.', 'Every point on my edge is the same distance from my centre.', 'I have one curved side that goes all the way round.']],
      ['square', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have 4 vertices.', 'All of my angles are right angles.', 'All 4 of my sides are the same length.']],
      ['rectangle', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have 4 vertices.', 'All of my angles are right angles.', 'I have 2 long sides and 2 short sides.']],
      ['triangle', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have fewer sides than a square.', 'I have 3 vertices.', 'I have 3 sides.']],
      ['pentagon', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have more sides than a square.', 'I have fewer sides than a hexagon.', 'I have 5 sides and 5 vertices.']],
      ['hexagon', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have more than 5 sides.', 'Honeycomb cells are this shape.', 'I have 6 sides and 6 vertices.']],
      ['semicircle', 2, 1, ['I am a 2D shape.', 'I have 2 sides.', 'One of my sides is curved.', 'One of my sides is straight.', 'I am half of a circle.']],
      ['oval', 2, 1, ['I am a 2D shape.', 'I have no corners.', 'My side is curved all the way round.', 'I am longer than I am wide.', 'I look like a stretched circle.']],
      ['star', 2, 1, ['I am a 2D shape.', 'All of my sides are straight.', 'I have 10 sides.', 'I have points that stick out.', 'I have 5 points.']],
      ['right-angled triangle', 2, 2, ['I am a 2D shape.', 'I have 3 vertices.', 'One of my angles is exactly 90°.', 'The other two angles add up to 90°.', 'I am a triangle with a right angle.']],
      ['isosceles triangle', 2, 2, ['I am a 2D shape.', 'I have 3 vertices.', 'Two of my angles are the same size.', 'I have 1 line of symmetry.', 'I am a triangle with exactly 2 equal sides.']],
      ['equilateral triangle', 2, 2, ['I am a 2D shape.', 'I am a regular polygon.', 'Each of my angles is 60°.', 'I have 3 lines of symmetry.', 'I am a triangle with 3 equal sides.']],
      ['scalene triangle', 2, 3, ['I am a 2D shape.', 'I have 3 vertices.', 'None of my angles are the same size.', 'I have no lines of symmetry.', 'I am a triangle with no equal sides.']],
      ['parallelogram', 2, 2, ['I am a 2D shape.', 'I am a quadrilateral.', 'My opposite angles are equal.', 'I have 2 pairs of parallel sides.', 'I have no right angles and my sides are not all equal.']],
      ['rhombus', 2, 2, ['I am a 2D shape.', 'I am a quadrilateral.', 'I have 2 pairs of parallel sides.', 'My diagonals cross at right angles.', 'All 4 of my sides are equal but I have no right angles.']],
      ['trapezium', 2, 2, ['I am a 2D shape.', 'I am a quadrilateral.', 'Not all of my sides are equal.', 'I have no right angles here.', 'I have exactly 1 pair of parallel sides.']],
      ['kite', 2, 2, ['I am a 2D shape.', 'I am a quadrilateral.', 'I have 1 line of symmetry.', 'My diagonals cross at right angles.', 'I have 2 pairs of equal sides next to each other.']],
      ['heptagon', 2, 2, ['I am a 2D shape.', 'All of my sides are straight.', 'I have an odd number of sides.', 'A 50p coin is based on this shape.', 'I have 7 sides.']],
      ['octagon', 2, 2, ['I am a 2D shape.', 'All of my sides are straight.', 'I have an even number of sides.', 'A stop sign is this shape.', 'I have 8 sides.']],
      ['decagon', 2, 3, ['I am a 2D shape.', 'I am a polygon.', 'My interior angles add up to 1440°.', 'Each of my angles is 144° when I am regular.', 'I have 10 sides.']],
      ['cube', 3, 1, ['I am a 3D shape.', 'I have 8 vertices.', 'I have 12 edges.', 'All of my faces are the same shape.', 'I have 6 square faces.']],
      ['cuboid', 3, 1, ['I am a 3D shape.', 'I have 8 vertices.', 'I have 12 edges.', 'I have 6 faces.', 'My faces are rectangles, and not all of them are squares.']],
      ['sphere', 3, 1, ['I am a 3D shape.', 'I have no edges.', 'I have no vertices.', 'I have 1 curved surface.', 'I am round like a ball.']],
      ['cylinder', 3, 1, ['I am a 3D shape.', 'I can roll.', 'I have 2 flat faces.', 'My flat faces are circles.', 'I have 1 curved surface joining 2 circles.']],
      ['cone', 3, 1, ['I am a 3D shape.', 'I can roll in a circle.', 'I have 1 flat face.', 'I have 1 vertex at my top.', 'I have a circle base and a point.']],
      ['square-based pyramid', 3, 1, ['I am a 3D shape.', 'I have 5 faces.', 'I have 8 edges.', '4 of my faces are triangles.', 'My base is a square.']],
      ['triangular prism', 3, 2, ['I am a 3D shape.', 'I have 6 vertices.', 'I have 9 edges.', 'I have 5 faces.', 'My two end faces are triangles.']],
      ['triangular-based pyramid', 3, 2, ['I am a 3D shape.', 'I have 4 vertices.', 'I have 6 edges.', 'I have 4 faces.', 'Every one of my faces is a triangle.']],
      ['hemisphere', 3, 2, ['I am a 3D shape.', 'I have 1 flat face.', 'I have 1 curved surface.', 'My flat face is a circle.', 'I am half of a sphere.']],
      ['pentagonal prism', 3, 3, ['I am a 3D shape.', 'I have 7 faces.', 'I have 15 edges.', 'I have 10 vertices.', 'My two end faces are pentagons.']],
      ['hexagonal prism', 3, 3, ['I am a 3D shape.', 'I have 8 faces.', 'I have 18 edges.', 'I have 12 vertices.', 'My two end faces are hexagons.']],
    ];
    const KS = { 1: 'KS1', 2: 'Lower KS2', 3: 'Upper KS2' };
    let gave = false, mode = 'tiles', band = 1, dims = 'both', cur = null, cols = 8, rows = 5, open = {}, clues = 0, solved = false, wrong = new Set(), points = true, round = 100, total = 0, showName = false, colour = 'orange', lastName = '';
    const g = S('g', {}, svg), tg = S('g', {}, svg), ui = S('g', {}, svg);
    const ovl = H('div', { cls: 'ovl' }); wrap.append(ovl);
    const pool = () => SHAPES.filter(s => s[2] <= band && (dims === 'both' || (dims === '2d' ? s[1] === 2 : s[1] === 3)));
    const cap = s => s[0].toUpperCase() + s.slice(1);
    function newRound() {
      const p = pool(); let pick; do pick = p[rnd(0, p.length - 1)]; while (p.length > 1 && pick[0] === lastName);
      cur = pick; lastName = pick[0]; gave = false; open = {}; clues = mode === 'clues' ? 1 : 0; solved = false; wrong = new Set(); round = 100; showName = false;
      colour = ['orange', 'yellow', 'green', 'red', 'purple', 'teal', 'blue'][rnd(0, 6)];
      draw(); buildOverlay();
    }
    const tileCost = () => Math.max(1, Math.round(100 / (cols * rows) * 1.6));
    function drawShape(layer) { const sh = S('g', {}, layer); if (cur[1] === 2) { sh.style.fill = col(colour); D2[cur[0]](sh); } else D3[cur[0]](sh, colour); return sh; }
    function draw() {
      clear(g); clear(tg); clear(ui);
      if (!cur) return;
      if (mode === 'tiles') {
        S('rect', { x: 20, y: 20, width: 960, height: 500, rx: 16, fill: 'var(--board-2)' }, g);
        const sh = drawShape(g); sh.setAttribute('transform', 'translate(0,0)');
        const tw = 960 / cols, th = 500 / rows;
        for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
          const k = r * cols + cc; if (open[k] || solved) continue;
          const t = S('rect', { x: 20 + cc * tw, y: 20 + r * th, width: tw + .6, height: th + .6, fill: (r + cc) % 2 ? 'var(--accent)' : 'var(--blue)', stroke: 'var(--board)', 'stroke-width': 1, cls: 'hit' }, tg);
          text(tg, 20 + cc * tw + tw / 2, 20 + r * th + th / 2, String(k + 1), { 'font-size': Math.min(22, th * .4), 'font-weight': 700, fill: '#fff', opacity: .55, 'pointer-events': 'none' });
          t.addEventListener('click', () => { open[k] = true; if (points) round = Math.max(0, round - tileCost()); draw(); });
        }
      } else {
        S('rect', { x: 20, y: 20, width: 600, height: 500, rx: 16, fill: 'var(--board-2)' }, g);
        text(g, 44, 58, 'What shape am I?', { 'font-size': 28, 'font-weight': 800, cls: 'disp', 'text-anchor': 'start' });
        cur[3].slice(0, clues).forEach((f, i) => { S('circle', { cx: 62, cy: 112 + i * 78, r: 20, fill: 'var(--accent)' }, g); text(g, 62, 113 + i * 78, String(i + 1), { 'font-size': 20, 'font-weight': 800, fill: 'var(--accent-ink)' }); const tt = text(g, 96, 112 + i * 78, f, { 'font-size': f.length > 44 ? 20 : 24, 'font-weight': 700, 'text-anchor': 'start' }); });
        if (clues < 5 && !solved) text(g, 96, 112 + clues * 78, `${5 - clues} more clue${5 - clues > 1 ? 's' : ''} to come`, { 'font-size': 18, fill: 'var(--ink-3)', 'text-anchor': 'start' });
        const box = S('g', {}, g); S('rect', { x: 640, y: 20, width: 340, height: 500, rx: 16, fill: solved ? 'var(--board)' : 'var(--accent)' }, box);
        if (solved) { const sh = drawShape(box); sh.setAttribute('transform', 'translate(810,270) scale(.6) translate(-500,-270)'); }
        else text(box, 810, 270, '?', { 'font-size': 160, 'font-weight': 800, cls: 'disp', fill: 'var(--accent-ink)' });
      }
      if (solved || showName) { S('rect', { x: 250, y: 528, width: 480, height: 44, rx: 12, fill: 'var(--ink)' }, ui); text(ui, 490, 551, cap(cur[0]), { 'font-size': 24, 'font-weight': 800, fill: 'var(--bg)', cls: 'disp' }); }
      if (points) { S('rect', { x: 770, y: 528, width: 210, height: 44, rx: 12, fill: 'var(--board-2)', stroke: 'var(--line)' }, ui); text(ui, 875, 551, `Round ${round}  \u00b7  Total ${total}`, { 'font-size': 17, 'font-weight': 800, cls: 'num' }); }
    }
    function guess(name, btn) {
      if (solved) return;
      if (name === cur[0]) { solved = true; if (points) total += round; draw(); buildOverlay(); c.toast(`Well done! It is a ${cur[0]}.${points ? ' +' + round + ' points' : ''}`); }
      else { wrong.add(name); if (points) round = Math.max(0, round - 15); btn.disabled = true; btn.textContent = 'Try again'; setTimeout(() => { btn.textContent = cap(name); }, 900); draw(); }
    }
    function buildOverlay() {
      clear(ovl); if (!cur) return;
      if (solved) { ovl.append(H('span', { cls: 'lbl', style: 'font-weight:800;color:var(--green)', text: gave ? `It is a ${cur[0]}.` : `Well done! It is a ${cur[0]}.` }), H('button', { cls: 'primary', text: 'Next shape', on: { click: newRound } })); return; }
      if (mode === 'clues') ovl.append(H('button', { cls: 'primary', text: clues < 5 ? 'Next clue' : 'No more clues', on: { click: e => { if (clues < 5) { clues++; if (points && clues > 1) round = Math.max(0, round - 18); draw(); if (clues >= 5) e.target.textContent = 'No more clues'; } } } }));
      const p = pool().map(s => s[0]).filter(n => n !== cur[0]);
      const sameDim = p.filter(n => SHAPES.find(s => s[0] === n)[1] === cur[1]);
      const options = shuffle([cur[0], ...shuffle(sameDim.length >= 5 ? sameDim : p).slice(0, 5)]);
      options.forEach(n => { const b = H('button', { text: cap(n), disabled: wrong.has(n), style: 'font-size:15px;padding:0 12px', on: { click: () => guess(n, b) } }); ovl.append(b); });
    }
    P.section('Game');
    P.seg({ options: [['tiles', 'Shape reveal'], ['clues', 'What shape am I?']], value: mode, onChange: v => { mode = v; tileBits.forEach(e => e.hidden = v !== 'tiles'); newRound(); } });
    P.section('Shapes');
    P.seg({ label: 'Key stage', options: [[1, 'KS1'], [2, 'Lower KS2'], [3, 'Upper KS2']], value: band, onChange: v => { band = v; newRound(); } });
    P.seg({ options: [['2d', '2D shapes'], ['3d', '3D shapes'], ['both', 'Both']], value: dims, onChange: v => { dims = v; newRound(); } });
    P.note('Each key stage includes the shapes from the stages before it.');
    P.button('New shape', newRound, 'primary');
    const tileBits = [];
    const before = new Set([...svg.closest('.work').querySelector('.dock').children]);
    P.section('Tiles');
    P.seg({ options: [['L', 'Large tiles'], ['M', 'Medium'], ['S', 'Small']], value: 'M', onChange: v => { [cols, rows] = { L: [4, 3], M: [8, 5], S: [12, 8] }[v]; open = {}; draw(); } });
    P.buttons([['Lift one at random', () => { const shut = [...Array(cols * rows).keys()].filter(k => !open[k]); if (shut.length) { open[shut[rnd(0, shut.length - 1)]] = true; if (points) round = Math.max(0, round - tileCost()); draw(); } }], ['Cover again', () => { open = {}; draw(); }]]);
    [...svg.closest('.work').querySelector('.dock').children].forEach(k => { if (!before.has(k)) tileBits.push(k); });
    P.section('Points');
    P.toggle({ label: 'Play for points', value: points, onChange: v => { points = v; draw(); } });
    P.button('Reset the total', () => { total = 0; draw(); });
    P.section('Answer');
    P.button('Show the answer', () => { if (solved) return; solved = true; gave = true; draw(); buildOverlay(); });
    newRound();
  }
});

tool({
  id: 'shapes-3d', name: '3D shapes', strand: 'geom', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Turn 3D shapes around, see them in everyday objects, sort them by what they do, and build towers to find which shapes stack. Faces, edges and vertices when you want them.',
  tags: '3d shapes solids cube cuboid sphere cylinder cone pyramid prism faces edges vertices roll stack sort build tower properties',
  icon: '<path d="M24 6 40 15v18L24 42 8 33V15z" stroke-linejoin="round"/><path d="M8 15l16 9 16-9M24 24v18" stroke-linejoin="round"/>',
  guide: ['Explore: choose a shape and drag it to turn it around. Spin turns it slowly by itself. Straighten up puts it back.', 'Everyday objects show where you might see the shape. Turn on Shape words to count faces, edges and vertices, and to highlight each one. Hidden edges show as faint dashed lines so every edge can be counted.', 'Sort: choose a question, tap a shape, then tap the box it belongs in. A wrong choice gives a hint.', 'Build a tower: tap shapes on the left to stack them. A shape with nothing flat on top, or nothing flat underneath, will not stay on. Drag to walk round the tower.'],
  mount(c) {
    const { svg, P } = c;
    // ---------- tiny 3D engine (camera looks along −z; +z comes towards you) ----------
    const TAU = Math.PI * 2, CAM = 16, normalise = v => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; }, dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const LIGHT = normalise([-0.35, 0.72, 0.9]);
    const spin = (p, rx, ry) => { const cy = Math.cos(ry), sy = Math.sin(ry), x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, cx = Math.cos(rx), sx = Math.sin(rx); return [x1, p[1] * cx - z1 * sx, p[1] * sx + z1 * cx]; };
    // distance from the camera shrinks things a little, so the far side looks a little smaller, never bigger
    const project = (p, cx, cy, scale) => { const d = CAM - p[2], f = scale * CAM / Math.max(d, .1); return [cx + p[0] * f, cy - p[1] * f, d]; };
    const normalOf = (verts, idx) => { const a = verts[idx[0]], b = verts[idx[1]], cc = verts[idx[2]], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [cc[0] - a[0], cc[1] - a[1], cc[2] - a[2]]; let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], mid = [0, 0, 0]; for (const i of idx) { mid[0] += verts[i][0]; mid[1] += verts[i][1]; mid[2] += verts[i][2]; } mid = mid.map(v => v / idx.length); if (dot(n, mid) < 0) n = [-n[0], -n[1], -n[2]]; return normalise(n); };
    function box(w, h, d){
      const x = w/2, y = h/2, z = d/2;
      const v = [[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z],[-x,y,-z],[x,y,-z],[x,y,z],[-x,y,z]];
      const polys = [
        {idx:[4,5,6,7], g:0}, {idx:[0,1,2,3], g:1},
        {idx:[0,1,5,4], g:2}, {idx:[2,3,7,6], g:3},
        {idx:[1,2,6,5], g:4}, {idx:[3,0,4,7], g:5}
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      return {v, polys, groups:6, curvedGroups:[], edges, corners:[0,1,2,3,4,5,6,7], h};
    }

    function ball(r, seg, ring){
      const v = [], polys = [];
      for (let i = 0; i <= ring; i++){
        const phi = Math.PI * i / ring;
        for (let j = 0; j < seg; j++){
          const th = TAU * j / seg;
          v.push([r*Math.sin(phi)*Math.cos(th), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(th)]);
        }
      }
      const at = (i,j) => i*seg + (j % seg);
      for (let i = 0; i < ring; i++){
        for (let j = 0; j < seg; j++){
          polys.push({idx:[at(i,j), at(i,j+1), at(i+1,j+1), at(i+1,j)], g:0});
        }
      }
      return {v, polys, groups:1, curvedGroups:[0], edges:[], corners:[], h:r*2};
    }

    function tube(r, h, seg){
      const v = [], polys = [];
      const y = h/2;
      for (let j = 0; j < seg; j++){
        const th = TAU * j / seg;
        v.push([r*Math.cos(th), -y, r*Math.sin(th)]);
      }
      for (let j = 0; j < seg; j++){
        const th = TAU * j / seg;
        v.push([r*Math.cos(th), y, r*Math.sin(th)]);
      }
      const lo = j => j % seg, hi = j => seg + (j % seg);
      for (let j = 0; j < seg; j++) polys.push({idx:[lo(j), lo(j+1), hi(j+1), hi(j)], g:0});   // curved side
      polys.push({idx:Array.from({length:seg}, (_,j) => hi(j)), g:1});                         // top
      polys.push({idx:Array.from({length:seg}, (_,j) => lo(j)), g:2});                         // bottom
      const rimLo = Array.from({length:seg}, (_,j) => j).concat([0]);
      const rimHi = Array.from({length:seg}, (_,j) => seg + j).concat([seg]);
      return {v, polys, groups:3, curvedGroups:[0], edges:[rimLo, rimHi], corners:[], h};
    }

    function cone(r, h, seg){
      const v = [], polys = [];
      const y = h/2;
      for (let j = 0; j < seg; j++){
        const th = TAU * j / seg;
        v.push([r*Math.cos(th), -y, r*Math.sin(th)]);
      }
      const apex = v.push([0, y, 0]) - 1;
      for (let j = 0; j < seg; j++) polys.push({idx:[j, (j+1) % seg, apex], g:0});  // curved side
      polys.push({idx:Array.from({length:seg}, (_,j) => j), g:1});                  // base
      const rim = Array.from({length:seg}, (_,j) => j).concat([0]);
      return {v, polys, groups:2, curvedGroups:[0], edges:[rim], corners:[apex], h};
    }

    function pyramid(b, h){
      const x = b/2, y = h/2;
      const v = [[-x,-y,-x],[x,-y,-x],[x,-y,x],[-x,-y,x],[0,y,0]];
      const polys = [
        {idx:[0,1,4], g:0}, {idx:[1,2,4], g:1}, {idx:[2,3,4], g:2}, {idx:[3,0,4], g:3},
        {idx:[0,1,2,3], g:4}
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
      return {v, polys, groups:5, curvedGroups:[], edges, corners:[0,1,2,3,4], h};
    }

    function prism(w, h, d){
      const x = w/2, y = h/2, z = d/2;
      // Triangular cross-section in the x-y plane, extruded along z.
      const v = [[-x,-y,-z],[x,-y,-z],[0,y,-z],[-x,-y,z],[x,-y,z],[0,y,z]];
      const polys = [
        {idx:[0,1,2], g:0}, {idx:[3,4,5], g:1},
        {idx:[0,1,4,3], g:2}, {idx:[1,2,5,4], g:3}, {idx:[2,0,3,5], g:4}
      ];
      const edges = [[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]];
      return {v, polys, groups:5, curvedGroups:[], edges, corners:[0,1,2,3,4,5], h};
    }


    const RGB = {
      red:[224,68,58], blue:[47,111,228], green:[31,157,99], yellow:[242,183,5],
      purple:[122,79,211], orange:[238,122,26], teal:[17,156,156], pink:[217,70,143]
    };

    const SHAPES = [
      {
        id:'cube', name:'Cube', colour:RGB.red, mesh:() => box(1.15, 1.15, 1.15),
        counts:{faces:6, edges:12, vertices:8},
        rolls:false, curved:false, flatTop:true, flatBottom:true,
        facts:['Every face is a square.','All of its edges are the same length.','It sits still — it will not roll.'],
        note:'A cube is a special cuboid: every one of its 12 edges is exactly the same length.',
        objects:['dice','giftbox','sugar']
      },
      {
        id:'cuboid', name:'Cuboid', colour:RGB.blue, mesh:() => box(1.7, 1.05, 0.8),
        counts:{faces:6, edges:12, vertices:8},
        rolls:false, curved:false, flatTop:true, flatBottom:true,
        facts:['Every face is a rectangle.','Its edges are not all the same length.','It has a flat top, so you can build on it.'],
        note:'Look at the three colours when you turn on edge lengths: a cuboid has long, medium and short edges.',
        objects:['cereal','book','brick']
      },
      {
        id:'sphere', name:'Sphere', colour:RGB.orange, mesh:() => ball(0.72, 28, 18),
        counts:{faces:1, edges:0, vertices:0},
        rolls:true, curved:true, flatTop:false, flatBottom:false,
        facts:['It is round all the way around.','It has one curved surface and no corners.','It rolls in every direction.'],
        note:'A sphere has one curved surface, no edges and no vertices. Nothing will balance on it.',
        objects:['football','orange','globe']
      },
      {
        id:'cylinder', name:'Cylinder', colour:RGB.teal, mesh:() => tube(0.62, 1.3, 30),
        counts:{faces:3, edges:2, vertices:0},
        rolls:true, curved:true, flatTop:true, flatBottom:true,
        facts:['It has a flat circle at the top and the bottom.','The side is curved and smooth.','Stood up it stacks. On its side it rolls.'],
        note:'The 2 edges of a cylinder are curved circles, so they are not measured like straight edges.',
        objects:['tin','drum','candle']
      },
      {
        id:'cone', name:'Cone', colour:RGB.yellow, mesh:() => cone(0.72, 1.35, 30),
        counts:{faces:2, edges:1, vertices:1},
        rolls:true, curved:true, flatTop:false, flatBottom:true,
        facts:['It has a flat circle at the bottom.','It comes up to a point at the top.','It can stand up, but nothing balances on the point.'],
        note:'The point at the top of a cone is its apex. Many schemes count it as the cone’s 1 vertex.',
        objects:['icecream','trafficcone','partyhat']
      },
      {
        id:'pyramid', name:'Square-based pyramid', colour:RGB.purple, mesh:() => pyramid(1.28, 1.2),
        counts:{faces:5, edges:8, vertices:5},
        rolls:false, curved:false, flatTop:false, flatBottom:true,
        facts:['The bottom face is a square.','The other four faces are triangles.','They all meet at one point at the top.'],
        note:'Its 4 base edges are one length and its 4 sloping edges are another — two different lengths.',
        objects:['pyramid','roof','teabag']
      },
      {
        id:'prism', name:'Triangular prism', colour:RGB.green, mesh:() => prism(1.0, 1.15, 1.75),
        counts:{faces:5, edges:9, vertices:6},
        rolls:false, curved:false, flatTop:false, flatBottom:true,
        facts:['The two ends are triangles that match.','The other three faces are rectangles.','The top is a ridge, like a roof.'],
        note:'Its edges come in three different lengths. Stood on a triangle end instead, it would have a flat top — the same shape can behave differently.',
        objects:['choc','tent','cheese']
      }
    ];


    const byId = id => SHAPES.find(s => s.id === id);
    for (const s of SHAPES) { s.m = s.mesh(); s.m.normals = s.m.polys.map(p => normalOf(s.m.v, p.idx)); }
    const OBJECTS = {
      dice:      ['Dice',        '<rect x="10" y="10" width="44" height="44" rx="9" fill="#fff" stroke="#18202E" stroke-width="3"/><circle cx="22" cy="22" r="4" fill="#E0443A"/><circle cx="42" cy="42" r="4" fill="#18202E"/><circle cx="32" cy="32" r="4" fill="#18202E"/><circle cx="42" cy="22" r="4" fill="#18202E"/><circle cx="22" cy="42" r="4" fill="#18202E"/>'],
      giftbox:   ['Gift box',    '<rect x="9" y="22" width="46" height="32" rx="4" fill="#2F6FE4" stroke="#18202E" stroke-width="3"/><rect x="27" y="22" width="10" height="32" fill="#F2B705" stroke="#18202E" stroke-width="2"/><path d="M32 22c-6-10-16-8-14-2 1 3 8 2 14 2zm0 0c6-10 16-8 14-2-1 3-8 2-14 2z" fill="#F2B705" stroke="#18202E" stroke-width="2.4" stroke-linejoin="round"/>'],
      sugar:     ['Sugar cube',  '<rect x="16" y="18" width="34" height="30" rx="4" fill="#fff" stroke="#18202E" stroke-width="3"/><path d="M16 26 28 18h22M28 18v30" stroke="#18202E" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M16 26v22h12" stroke="#18202E" stroke-width="2.4" fill="none"/><path d="M50 18 38 26H16" stroke="#18202E" stroke-width="0" fill="none"/>'],
      cereal:    ['Cereal box',  '<rect x="18" y="8" width="30" height="48" rx="3" fill="#EE7A1A" stroke="#18202E" stroke-width="3"/><rect x="23" y="17" width="20" height="13" rx="2" fill="#fff" stroke="#18202E" stroke-width="2"/><path d="M23 38h20M23 45h14" stroke="#18202E" stroke-width="2.6" stroke-linecap="round"/>'],
      book:      ['Book',        '<rect x="12" y="14" width="40" height="38" rx="3" fill="#7A4FD3" stroke="#18202E" stroke-width="3"/><path d="M19 14v38" stroke="#18202E" stroke-width="2.6"/><rect x="24" y="22" width="22" height="4" rx="2" fill="#fff"/><rect x="24" y="31" width="16" height="4" rx="2" fill="#fff" opacity=".7"/>'],
      brick:     ['Brick',       '<rect x="8" y="22" width="48" height="24" rx="3" fill="#D9468F" stroke="#18202E" stroke-width="3"/><path d="M8 34h48M24 22v12M40 34v12" stroke="#18202E" stroke-width="2.2"/>'],
      football:  ['Football',    '<circle cx="32" cy="32" r="22" fill="#fff" stroke="#18202E" stroke-width="3"/><path d="M32 20l8 6-3 10h-10l-3-10z" fill="#18202E"/><path d="M32 10v10M14 26l10 4M50 26l-10 4M21 50l6-8M43 50l-6-8" stroke="#18202E" stroke-width="2.4"/>'],
      orange:    ['Orange',      '<circle cx="32" cy="35" r="20" fill="#EE7A1A" stroke="#18202E" stroke-width="3"/><path d="M32 15c0-5 4-8 9-8-1 6-4 8-9 8z" fill="#1F9D63" stroke="#18202E" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 27a16 16 0 0 1 9-5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".65"/>'],
      globe:     ['Globe',       '<circle cx="32" cy="32" r="22" fill="#2F6FE4" stroke="#18202E" stroke-width="3"/><ellipse cx="32" cy="32" rx="9" ry="22" fill="none" stroke="#18202E" stroke-width="2.2"/><path d="M10 32h44M14 20h36M14 44h36" stroke="#18202E" stroke-width="2.2" fill="none"/>'],
      tin:       ['Tin of beans','<path d="M16 16h32v32a16 5 0 0 1-32 0z" fill="#119C9C" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="16" rx="16" ry="5" fill="#D5DDE7" stroke="#18202E" stroke-width="3"/><rect x="16" y="27" width="32" height="12" fill="#fff" opacity=".85"/>'],
      drum:      ['Drum',        '<path d="M14 20h36v24a18 5 0 0 1-36 0z" fill="#E0443A" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="20" rx="18" ry="5.5" fill="#FDF3E0" stroke="#18202E" stroke-width="3"/><path d="M16 26l10 14M32 24v18M48 26L38 40" stroke="#18202E" stroke-width="2" opacity=".55" fill="none"/>'],
      candle:    ['Candle',      '<rect x="23" y="24" width="18" height="30" rx="2" fill="#F2B705" stroke="#18202E" stroke-width="3"/><ellipse cx="32" cy="24" rx="9" ry="3.5" fill="#FDF3E0" stroke="#18202E" stroke-width="2.4"/><path d="M32 20c0-5 5-6 3-11 5 3 7 7 4 11z" fill="#EE7A1A" stroke="#18202E" stroke-width="2.2" stroke-linejoin="round"/>'],
      icecream:  ['Ice cream',   '<path d="M20 26h24L32 58z" fill="#EE7A1A" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M24 34l14 0M27 42l9 0" stroke="#18202E" stroke-width="1.8" opacity=".55"/><circle cx="32" cy="19" r="11" fill="#F8DDEB" stroke="#18202E" stroke-width="3"/>'],
      trafficcone:['Traffic cone','<path d="M22 48 32 10l10 38z" fill="#EE7A1A" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M26 32h12" stroke="#fff" stroke-width="5"/><rect x="13" y="48" width="38" height="8" rx="3" fill="#18202E"/>'],
      partyhat:  ['Party hat',   '<path d="M20 48 32 11l12 37z" fill="#7A4FD3" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M25 32h14M28 41h8" stroke="#F2B705" stroke-width="3.4" stroke-linecap="round"/><circle cx="32" cy="9" r="5" fill="#F2B705" stroke="#18202E" stroke-width="2.4"/>'],
      pyramid:   ['Pyramid',     '<path d="M8 50 32 12l24 38z" fill="#F2B705" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v38" stroke="#18202E" stroke-width="2.4"/><path d="M32 12 56 50H32z" fill="#18202E" opacity=".16"/><rect x="5" y="50" width="54" height="5" rx="2.5" fill="#EE7A1A"/>'],
      roof:      ['House roof',  '<path d="M10 34 32 16l22 18z" fill="#E0443A" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><rect x="16" y="34" width="32" height="18" fill="#FDF3E0" stroke="#18202E" stroke-width="3"/><rect x="28" y="40" width="9" height="12" fill="#18202E"/>'],
      teabag:    ['Tea bag',     '<path d="M18 46 32 18l14 28z" fill="#1F9D63" stroke="#18202E" stroke-width="3" stroke-linejoin="round" opacity=".85"/><path d="M32 18 46 46H32z" fill="#18202E" opacity=".14"/><path d="M32 18V8" stroke="#18202E" stroke-width="2.2"/><rect x="26" y="2" width="13" height="8" rx="2" fill="#FDF3E0" stroke="#18202E" stroke-width="2.2"/>'],
      choc:      ['Chocolate bar','<path d="M14 46 26 20h24L38 46z" fill="#9A5B2A" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M26 20 38 46" stroke="#18202E" stroke-width="2.2"/><path d="M50 20 38 46v8L50 28z" fill="#7A4421" stroke="#18202E" stroke-width="2.6" stroke-linejoin="round"/><path d="M14 46v8l24 0v-8" fill="#7A4421" stroke="#18202E" stroke-width="2.6" stroke-linejoin="round"/>'],
      tent:      ['Tent',        '<path d="M8 50 32 12l24 38z" fill="#1F9D63" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v38" stroke="#18202E" stroke-width="2.4"/><path d="M24 50 32 28l8 22z" fill="#18202E" opacity=".45"/>'],
      cheese:    ['Cheese wedge','<path d="M10 44 44 22v16L10 54z" fill="#F2B705" stroke="#18202E" stroke-width="3" stroke-linejoin="round"/><path d="M44 22l10 6v16l-10-6z" fill="#E0A505" stroke="#18202E" stroke-width="2.6" stroke-linejoin="round"/><circle cx="22" cy="44" r="3.4" fill="#FDF3E0" stroke="#18202E" stroke-width="1.6"/><circle cx="33" cy="37" r="2.6" fill="#FDF3E0" stroke="#18202E" stroke-width="1.6"/>']
    };


    const LENGTH_COLOURS = ['#2F6FE4', '#EE7A1A', '#7A4FD3', '#1F9D63'];
    const hsl = (h, s2, l) => { h /= 360; const f = n => { const k = (n + h * 12) % 12, a = s2 * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; };
    function gather(shape, rx, ry, scale, cx, cy, yOff, faces) {
      const m = shape.m, out = [], pts = m.v.map(p => spin([p[0], p[1] + yOff, p[2]], rx, ry)), flat = pts.map(p => project(p, cx, cy, scale));
      m.polys.forEach((poly, pi) => {
        const n = spin(m.normals[pi], rx, ry);
        // visible when the face points towards the camera (allowing for perspective)
        const p0 = pts[poly.idx[0]], toCam = [-p0[0], -p0[1], CAM - p0[2]]; if (dot(n, toCam) <= 0.0005) return;
        let z = 0; for (const i of poly.idx) z += flat[i][2];
        const base = faces ? hsl((poly.g * 47) % 360, .62, .55) : shape.colour, k = .5 + .5 * Math.max(0, dot(n, LIGHT));
        out.push({ pts: poly.idx.map(i => flat[i][0].toFixed(1) + ',' + flat[i][1].toFixed(1)).join(' '), z: z / poly.idx.length, fill: `rgb(${Math.round(base[0] * k)},${Math.round(base[1] * k)},${Math.round(base[2] * k)})`, pi });
      });
      return { polys: out, flat, pts };
    }
    function pool(group) { const els = []; let i = 0; return { begin() { i = 0; }, poly(pts, fill, op) { let e = els[i]; if (!e) { e = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); e.setAttribute('stroke-width', '1'); e.setAttribute('stroke-linejoin', 'round'); group.append(e); els.push(e); } e.setAttribute('points', pts); e.setAttribute('fill', fill); e.setAttribute('stroke', fill); e.setAttribute('opacity', op == null ? 1 : op); e.style.display = ''; i++; }, end() { for (let k = i; k < els.length; k++) els[k].style.display = 'none'; } }; }
    function paint(pl, polys, op) { polys.sort((a, b) => b.z - a.z); polys.forEach(p => pl.poly(p.pts, p.fill, op)); }
    function lengthGroups(shape) { const m = shape.m, lens = [], groups = []; for (const e of m.edges) { if (e.length !== 2) { lens.push(null); continue; } const a = m.v[e[0]], b = m.v[e[1]], d = Math.round(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100) / 100; lens.push(d); if (!groups.some(g2 => Math.abs(g2 - d) < .02)) groups.push(d); } groups.sort((a, b) => b - a); return { lens, groups }; }
    function adjacency(m) { if (m._adj) return m._adj; const edges = m.edges.map(e => { const segs = []; for (let k = 0; k < e.length - 1; k++) { const a = e[k], b = e[k + 1], adj = []; m.polys.forEach((p, pi) => { if (p.idx.includes(a) && p.idx.includes(b)) adj.push(pi); }); segs.push({ a, b, adj }); } return segs; }); const corners = m.corners.map(ci => { const adj = []; m.polys.forEach((p, pi) => { if (p.idx.includes(ci)) adj.push(pi); }); return { i: ci, adj }; }); return (m._adj = { edges, corners }); }
    // ---------- state ----------
    let mode = 'explore', cur = 'cube', rx = 0.42, ry = 0.62, spinning = true, vocab = false, hi = { faces: false, edges: false, verts: false, lengths: false }, ruleId = 'roll', left = SHAPES.map(s => s.id), sorted = [[], []], selected = null, msg = '', msgKind = '', tower = [], trx = 0.3, try_ = 0.5, falling = null, bmsg = '', bkind = '';
    c.persist(() => ({ mode, cur, vocab, hi, ruleId, left, sorted, tower, spinning }), s => ({ mode, cur, vocab, hi, ruleId, left, sorted, tower, spinning } = Object.assign({ mode, cur, vocab, hi, ruleId, left, sorted, tower, spinning }, s)));
    const RULES = [
      { id: 'roll', q: 'Does it roll?', bins: ['It rolls', 'It does not roll'], test: s => s.rolls ? 0 : 1, hint: 'Is any part of it round enough to turn?' },
      { id: 'curve', q: 'Curved or flat?', bins: ['Has a curved surface', 'Only flat faces'], test: s => s.curved ? 0 : 1, hint: 'Run your finger over it. Is any part of it smooth and round?' },
      { id: 'top', q: 'Can you build on it?', bins: ['Flat on top', 'Not flat on top'], test: s => s.flatTop ? 0 : 1, hint: 'Could you balance a brick on the very top?' },
      { id: 'vert', q: 'Has it got vertices?', bins: ['Has vertices', 'No vertices'], test: s => s.counts.vertices > 0 ? 0 : 1, vocabOnly: true, hint: 'A vertex is a pointed corner where edges meet.' }
    ];
    const rule = () => RULES.find(r => r.id === ruleId) || RULES[0];
    const PIECES = [{ id: 'cube' }, { id: 'cuboid' }, { id: 'cylinder' }, { id: 'cylinder', variant: 'lying', label: 'Cylinder on its side' }, { id: 'prism' }, { id: 'pyramid' }, { id: 'cone' }, { id: 'sphere' }];
    function rotateMesh(m, ax) { const out = Object.assign({}, m, { v: m.v.map(([x, y, z]) => [x, y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)]) }); let lo = Infinity, hi2 = -Infinity; for (const p of out.v) { lo = Math.min(lo, p[1]); hi2 = Math.max(hi2, p[1]); } out.h = hi2 - lo; out.normals = out.polys.map(p => normalOf(out.v, p.idx)); out._adj = null; return out; }
    for (const p of PIECES) { const base = byId(p.id); p.name = p.label || base.name; p.shape = p.variant === 'lying' ? Object.assign({}, base, { m: rotateMesh(base.m, Math.PI / 2), name: 'Cylinder on its side', flatTop: false, flatBottom: false, rolls: true, why: 'A cylinder on its side rests on its curved surface. It rolls straight off.' }) : base; }
    // ---------- layers ----------
    const bg = S('g', {}, svg), solidG = S('g', {}, svg), detailG = S('g', {}, svg), ui = S('g', {}, svg);
    const solids = pool(solidG);
    const wrapT = (t, n) => { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; };
    function objectArt(g, key, x, y, size) { const [label, art] = OBJECTS[key]; const gg = S('g', { transform: `translate(${x},${y}) scale(${size / 64})` }, g); gg.innerHTML = art; return label; }
    function thumb(g, shape, cx, cy, size) { const r = gather(shape, 0.4, 0.7, size * .32, cx, cy, 0, false); r.polys.sort((a, b) => b.z - a.z).forEach(p => S('polygon', { points: p.pts, fill: p.fill, stroke: p.fill, 'stroke-linejoin': 'round' }, g)); }
    function banner(g, text2, kind, y) { const w = Math.min(1060, text2.length * 10 + 60); S('rect', { x: 550 - w / 2, y, width: w, height: 46, rx: 14, fill: kind === 'good' ? '#E7F6EE' : kind === 'bad' ? '#FDECEA' : 'var(--board-2)', stroke: kind === 'good' ? '#A9DFC3' : kind === 'bad' ? '#F3BDB7' : 'var(--line)' }, g); text(g, 550, y + 24, text2, { 'font-size': 18, 'font-weight': 800, fill: kind === 'good' ? '#13613D' : kind === 'bad' ? '#9B2F26' : 'var(--ink-2)' }); }
    // ---------- explore ----------
    const shape = () => byId(cur) || SHAPES[0];
    function drawExploreStatic() {
      clear(bg); clear(ui);
      const s = shape();
      S('ellipse', { cx: 360, cy: 560, rx: 190, ry: 34, fill: 'rgba(24,32,46,.12)' }, bg);
      const hit = S('rect', { x: 0, y: 0, width: 700, height: 680, fill: 'transparent', cls: 'grab' }, bg);
      let last = null; c.drag(hit, { start: p => { last = p; spinning = false; spinT.set(false, true); }, move: p => { rx = clamp(rx + (p.y - last.y) * .01, -1.3, 1.3); ry += (p.x - last.x) * .01; last = p; }, end: () => { last = null; } });
      text(ui, 360, 40, s.name, { 'font-size': 34, 'font-weight': 800, cls: 'disp' });
      // info column
      const x0 = 720; let y = 40;
      S('rect', { x: x0, y: 20, width: 360, height: 640, rx: 18, fill: 'var(--board-2)', stroke: 'var(--line)' }, ui);
      text(ui, x0 + 20, y + 4, 'YOU MIGHT SEE ONE AS', { 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start', 'letter-spacing': '1.5' }); y += 22;
      s.objects.forEach((k, i) => { const bx = x0 + 20 + i * 110; S('rect', { x: bx, y, width: 100, height: 90, rx: 12, fill: 'var(--board)', stroke: 'var(--line)' }, ui); const lab = objectArt(ui, k, bx + 18, y + 9, 64); text(ui, bx + 50, y + 108, lab, { 'font-size': 13, 'font-weight': 700, fill: 'var(--ink-2)' }); });
      y += 140;
      text(ui, x0 + 20, y, 'WHAT IS IT LIKE?', { 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start', 'letter-spacing': '1.5' }); y += 28;
      s.facts.forEach(f => { S('circle', { cx: x0 + 26, cy: y - 1, r: 4, fill: 'var(--accent)' }, ui); wrapT(f, 36).forEach(l => { text(ui, x0 + 40, y, l, { 'font-size': 16, 'text-anchor': 'start' }); y += 22; }); y += 6; });
      if (vocab) {
        y += 10; text(ui, x0 + 20, y, 'SHAPE WORDS', { 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start', 'letter-spacing': '1.5' }); y += 16;
        [['faces', s.counts.faces], ['edges', s.counts.edges], ['vertices', s.counts.vertices]].forEach(([n, v], i) => { const bx = x0 + 20 + i * 110; S('rect', { x: bx, y, width: 100, height: 66, rx: 12, fill: 'var(--board)', stroke: 'var(--line)' }, ui); text(ui, bx + 50, y + 28, String(v), { 'font-size': 30, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' }); text(ui, bx + 50, y + 54, n, { 'font-size': 13, 'font-weight': 700, fill: 'var(--ink-2)' }); });
        y += 88;
        if (hi.lengths) { const lg = lengthGroups(s); if (!lg.groups.length) { wrapT('Curved edges are not straight, so they are not measured like this.', 40).forEach(l => { text(ui, x0 + 20, y, l, { 'font-size': 14, 'text-anchor': 'start', fill: 'var(--ink-2)' }); y += 20; }); } else { const words = lg.groups.length === 1 ? ['all the same'] : lg.groups.length === 2 ? ['longer', 'shorter'] : ['longest', 'middle', 'shortest']; lg.groups.forEach((gv, i) => { const n = lg.lens.filter(d => d !== null && Math.abs(d - gv) < .02).length; S('rect', { x: x0 + 20, y: y - 4, width: 26, height: 7, rx: 3, fill: LENGTH_COLOURS[i] }, ui); text(ui, x0 + 56, y, `${n} ${words[i] || 'other'} edge${n === 1 ? '' : 's'}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'start' }); y += 24; }); } y += 4; }
        wrapT(s.note, 42).forEach(l => { text(ui, x0 + 20, y, l, { 'font-size': 14, 'text-anchor': 'start', fill: 'var(--ink-2)' }); y += 20; });
      }
    }
    function frameExplore() {
      const s = shape(), scale = 175, cx = 360, cy = 330;
      const r = gather(s, rx, ry, scale, cx, cy, 0, vocab && hi.faces);
      solids.begin(); paint(solids, r.polys); solids.end();
      clear(detailG);
      if (!vocab || !(hi.edges || hi.lengths || hi.verts)) return;
      const m = s.m, adj = adjacency(m), front = new Set(r.polys.map(p => p.pi)), seen = list => list.some(pi => front.has(pi)), flat = r.flat;
      if (hi.edges || hi.lengths) { const lg = hi.lengths ? lengthGroups(s) : null; for (const pass of [0, 1]) adj.edges.forEach((segs, i) => { let colr = '#18202E'; if (lg) { const d = lg.lens[i]; colr = d === null ? '#7A8698' : LENGTH_COLOURS[lg.groups.findIndex(gv => Math.abs(gv - d) < .02) % 4]; } segs.forEach(sg => { const vis = seen(sg.adj); if ((pass === 0) === vis) return; S('line', { x1: flat[sg.a][0], y1: flat[sg.a][1], x2: flat[sg.b][0], y2: flat[sg.b][1], stroke: colr, 'stroke-width': vis ? 5 : 3, opacity: vis ? 1 : .35, 'stroke-dasharray': vis ? 'none' : '7 6', 'stroke-linecap': 'round', 'pointer-events': 'none' }, detailG); }); }); }
      if (hi.verts) adj.corners.forEach(cc => { const vis = seen(cc.adj); S('circle', { cx: flat[cc.i][0], cy: flat[cc.i][1], r: vis ? 9 : 6, fill: '#18202E', stroke: '#fff', 'stroke-width': 3, opacity: vis ? 1 : .35, 'pointer-events': 'none' }, detailG); });
    }
    // ---------- sort ----------
    function drawSort() {
      clear(bg); clear(ui); solids.begin(); solids.end(); clear(detailG);
      const R = rule();
      text(ui, 550, 30, R.q, { 'font-size': 28, 'font-weight': 800, cls: 'disp' });
      S('rect', { x: 20, y: 56, width: 1060, height: 140, rx: 18, fill: 'var(--board-2)', stroke: 'var(--line)' }, ui);
      if (!left.length) text(ui, 550, 126, 'All sorted. Choose another question, or start again.', { 'font-size': 18, 'font-weight': 700, fill: 'var(--ink-3)' });
      const cw = 128, x0 = 550 - left.length * cw / 2;
      left.forEach((id, i) => { const s = byId(id), x = x0 + i * cw, on = selected === id, g = S('g', { cls: 'hit' }, ui); S('rect', { x: x + 6, y: 66 - (on ? 6 : 0), width: cw - 12, height: 120, rx: 14, fill: 'var(--board)', stroke: on ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': on ? 4 : 2 }, g); thumb(g, s, x + cw / 2, 112 - (on ? 6 : 0), 80); text(g, x + cw / 2, 166 - (on ? 6 : 0), s.name.replace('Square-based pyramid', 'Pyramid').replace('Triangular prism', 'Prism'), { 'font-size': 14, 'font-weight': 800 }); g.addEventListener('click', () => { selected = selected === id ? null : id; msg = selected ? `Now tap the box where the ${s.name.toLowerCase()} belongs.` : ''; msgKind = ''; drawSort(); }); });
      R.bins.forEach((b, bi) => { const x = 20 + bi * 535, g = S('g', { cls: 'hit' }, ui); S('rect', { x, y: 214, width: 525, height: 380, rx: 18, fill: selected ? 'var(--accent-soft, #DCE6FB)' : 'var(--board)', stroke: selected ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': 3, 'stroke-dasharray': '10 8' }, g); text(g, x + 262, 244, b, { 'font-size': 20, 'font-weight': 800, cls: 'disp' }); sorted[bi].forEach((id, j) => { const s = byId(id), tx = x + 70 + (j % 4) * 125, ty = 330 + Math.floor(j / 4) * 130; S('rect', { x: tx - 55, y: ty - 60, width: 110, height: 116, rx: 12, fill: 'var(--board)', stroke: 'var(--green)', 'stroke-width': 2.5 }, g); thumb(g, s, tx, ty - 10, 76); text(g, tx, ty + 42, s.name.replace('Square-based pyramid', 'Pyramid').replace('Triangular prism', 'Prism'), { 'font-size': 13, 'font-weight': 800 }); }); g.addEventListener('click', () => place(bi)); });
      banner(ui, msg || 'Tap a shape, then tap the box it belongs in.', msgKind, 610);
    }
    function place(bi) {
      if (!selected) { msg = 'Tap a shape first, then tap a box.'; msgKind = ''; return drawSort(); }
      const s = byId(selected);
      if (rule().test(s) === bi) { left = left.filter(id => id !== selected); sorted[bi].push(selected); selected = null; msg = left.length ? `Yes, the ${s.name.toLowerCase()} goes there. ${left.length} to go.` : 'All sorted. Well done.'; msgKind = 'good'; }
      else { msg = 'Not that one. ' + rule().hint; msgKind = 'bad'; }
      drawSort();
    }
    function resetSort() { if (rule().vocabOnly && !vocab) ruleId = 'roll'; left = SHAPES.map(s => s.id); sorted = [[], []]; selected = null; msg = ''; msgKind = ''; drawSort(); }
    // ---------- build ----------
    function drawBuildStatic() {
      clear(bg); clear(ui); clear(detailG);
      PIECES.forEach((p, i) => { const y = 16 + i * 81, g = S('g', { cls: 'hit' }, bg); S('rect', { x: 16, y, width: 240, height: 74, rx: 12, fill: 'var(--board)', stroke: 'var(--line)', 'stroke-width': 1.5 }, g); thumb(g, p.shape, 56, y + 37, 70); text(g, 96, y + 37, p.name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'start' }); g.addEventListener('click', () => add(i)); });
      const hit = S('rect', { x: 266, y: 0, width: 834, height: 600, fill: 'transparent', cls: 'grab' }, bg);
      let last = null; c.drag(hit, { start: p => { last = p; }, move: p => { trx = clamp(trx + (p.y - last.y) * .01, -1.2, 1.2); try_ += (p.x - last.x) * .01; last = p; }, end: () => { last = null; } });
      text(ui, 960, 32, `${tower.length} shape${tower.length === 1 ? '' : 's'}`, { 'font-size': 18, 'font-weight': 800, fill: 'var(--accent)' });
      banner(ui, bmsg || (tower.length ? 'Drag to walk round your tower.' : 'Tap a shape on the left to start your tower.'), bkind, 618);
    }
    function add(i) {
      const p = PIECES[i], s = p.shape;
      if (!s.flatBottom) { falling = { shape: s, t: 0, dir: Math.random() < .5 ? -1 : 1 }; bmsg = s.why || `A ${s.name.toLowerCase()} has a curved surface underneath. It rolls away.`; bkind = 'bad'; return drawBuildStatic(); }
      if (tower.length) { const top = PIECES[tower[tower.length - 1]].shape; if (!top.flatTop) { falling = { shape: s, t: 0, dir: Math.random() < .5 ? -1 : 1 }; bmsg = `The ${top.name.toLowerCase()} has no flat face on top, so nothing will balance there.`; bkind = 'bad'; return drawBuildStatic(); } }
      tower.push(i); bmsg = `${s.name} added. Your tower is ${tower.length} shape${tower.length === 1 ? '' : 's'} tall.`; bkind = 'good'; drawBuildStatic();
    }
    function frameBuild() {
      const cx = 680, cy = 320; let total = 0; for (const i of tower) total += PIECES[i].shape.m.h; total = Math.max(total, 2.2);
      const scale = Math.min(210, 520 / total), baseY = -total / 2; let all = [], y = baseY; const labels = [];
      for (const i of tower) { const s = PIECES[i].shape, centre = y + s.m.h / 2, r = gather(s, trx, try_, scale, cx, cy, centre, false); all.push(r.polys); const a = project(spin([0, centre, 0], trx, try_), cx, cy, scale); labels.push([a[0], a[1], s.name === 'Cylinder on its side' ? 'Cylinder' : s.name]); y += s.m.h; }
      // stacked pieces: when looking down, lower pieces are hidden behind higher ones, so draw them first
      solids.begin(); (trx >= 0 ? all : all.slice().reverse()).forEach(ps => paint(solids, ps));
      if (falling) { falling.t += .03; const t = falling.t, fy = baseY + total + 1 - t * t * 7, fx = falling.dir * t * t * 9; const r = gather(falling.shape, trx + t * 1.6 * falling.dir, try_, scale, cx + fx * scale * .35, cy, fy, false); paint(solids, r.polys, Math.max(0, 1 - t * .8)); if (t > 1.25) falling = null; }
      solids.end(); clear(detailG);
      labels.forEach(([x, yy, t]) => { const w = t.length * 8.4 + 22; S('rect', { x: x - w / 2, y: yy - 13, width: w, height: 26, rx: 13, fill: 'rgba(255,255,255,.92)', stroke: 'rgba(24,32,46,.15)', 'pointer-events': 'none' }, detailG); text(detailG, x, yy + 1, t, { 'font-size': 14, 'font-weight': 800, fill: '#18202E', 'pointer-events': 'none' }); });
    }
    // ---------- loop and menu ----------
    function redraw() { if (mode === 'explore') drawExploreStatic(); else if (mode === 'sort') drawSort(); else drawBuildStatic(); }
    c.raf(dt => { if (mode === 'explore') { if (spinning) ry += dt * .35; frameExplore(); } else if (mode === 'build') frameBuild(); });
    const sync = () => { eG.hidden = mode !== 'explore'; sG.hidden = mode !== 'sort'; bG.hidden = mode !== 'build'; ({ explore: eG, sort: sG, build: bG })[mode].open = true; wG.hidden = !vocab || mode !== 'explore'; };
    P.section('Activity');
    P.seg({ options: [['explore', 'Explore'], ['sort', 'Sort'], ['build', 'Build a tower']], value: mode, onChange: v => { mode = v; if (v !== 'explore') { solids.begin(); solids.end(); } sync(); redraw(); } });
    P.toggle({ label: 'Shape words (faces, edges, vertices)', value: vocab, onChange: v => { vocab = v; if (!v) { hi = { faces: false, edges: false, verts: false, lengths: false }; hiT.forEach(t => t.set(false, true)); } ruleSeg.el.remove(); buildRuleSeg(); sync(); redraw(); } });
    P.group('Explore', { open: mode === 'explore' }); const eG = P.lastGroup;
    P.seg({ label: 'Shape', options: SHAPES.map(s => [s.id, s.name]), value: cur, onChange: v => { cur = v; redraw(); } });
    const spinT = P.toggle({ label: 'Spin', value: spinning, onChange: v => spinning = v });
    P.button('Straighten up', () => { rx = 0.42; ry = 0.62; });
    P.group('Shape words', { open: true, solo: false }); const wG = P.lastGroup;
    const hiT = [['faces', 'Show faces'], ['edges', 'Show edges'], ['verts', 'Show vertices'], ['lengths', 'Edge lengths']].map(([k, l]) => P.toggle({ label: l, value: hi[k], onChange: v => { hi[k] = v; redraw(); } }));
    P.group('Sort', { open: mode === 'sort' }); const sG = P.lastGroup;
    const ruleBox = H('div', {}); P.raw(ruleBox); let ruleSeg = { el: H('div') };
    function buildRuleSeg() { ruleBox.innerHTML = ''; const opts = RULES.filter(r => !r.vocabOnly || vocab).map(r => [r.id, r.q]); const host = H('div'); ruleBox.append(host); opts.forEach(([id, q]) => host.append(H('button', { cls: 'btn' + (id === ruleId ? ' primary' : ''), text: q, style: 'width:100%;margin:4px 0', on: { click: () => { ruleId = id; buildRuleSeg(); resetSort(); } } }))); ruleSeg = { el: host }; }
    buildRuleSeg();
    P.button('Start again', resetSort);
    P.group('Build a tower', { open: mode === 'build' }); const bG = P.lastGroup;
    P.buttons([['Take one off', () => { if (!tower.length) { bmsg = 'There is nothing to take off yet.'; bkind = ''; } else { tower.pop(); bmsg = `Taken off. ${tower.length} left.`; bkind = ''; } drawBuildStatic(); }], ['Start again', () => { tower = []; bmsg = 'Cleared. Choose a shape to start again.'; bkind = ''; drawBuildStatic(); }]]);
    P.button('Straighten up', () => { trx = 0.3; try_ = 0.5; });
    sync(); redraw();
  }
});

