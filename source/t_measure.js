/* ===== Measurement ===== */

tool({
  id: 'ruler', name: 'Ruler', strand: 'meas', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 640,
  desc: 'A 15 or 30 cm ruler to move and turn, with lots of objects to measure and a pencil for drawing lines.',
  tags: 'length cm mm measure draw lines',
  icon: '<rect x="4" y="16" width="40" height="14" rx="2"/><path d="M10 16v5M16 16v8M22 16v5M28 16v8M34 16v5M40 16v8"/>',
  guide: ['Drag the ruler to move it. Drag the round handle at its end to turn it. Reset puts it back in the middle if it goes off the board.', 'Add an object, then drag it so its left end lines up with the 0 on the ruler. The ruler flashes green when it is lined up, and the object clicks into place.', 'Choose whole centimetres, half centimetres or millimetres to make the lengths easier or harder to read.', 'Choose Draw a line and tap two points. The length of the line is shown in centimetres.'],
  mount(c) {
    const { svg, P } = c;
    const U = 32; // px per cm
    let rx = 30, ry = 380, rot = 0, kind = 'plastic', len = 30, objs = [], lines = [], drawMode = false, pend = null, showLens = false, prec = 'half', aligned = new Set();
    c.persist(() => ({ rx, ry, rot, kind, len, objs, lines, showLens, prec }), s => ({ rx, ry, rot, kind, len, objs, lines, showLens, prec } = Object.assign({ rx, ry, rot, kind, len, objs, lines, showLens, prec }, s)));
    const bg = S('rect', { x: 0, y: 0, width: 1100, height: 640, fill: 'transparent' }, svg);
    const og = S('g', {}, svg), lg = S('g', {}, svg), rg = S('g', {}, svg);
    const defs = S('defs', {}, svg); const pat = S('pattern', { id: 'woodgrain', width: 60, height: 12, patternUnits: 'userSpaceOnUse' }, defs); S('path', { d: 'M0 6 Q15 2 30 6 T60 6', fill: 'none', stroke: 'var(--orange)', 'stroke-width': 2 }, pat);
    const W = () => len * U + 40;
    // ---------- objects ----------
    const OBJ = {
      pencil: { n: 'Pencil', r: [6, 18], h: 26 }, crayon: { n: 'Crayon', r: [5, 10], h: 24 }, ribbon: { n: 'Ribbon', r: [4, 26], h: 20 }, cubes: { n: 'Cubes', r: [2, 12], h: 34, whole: 1 },
      clip: { n: 'Paper clip', r: [3, 5], h: 18 }, key: { n: 'Key', r: [4, 8], h: 34 }, leaf: { n: 'Leaf', r: [4, 12], h: 40 }, feather: { n: 'Feather', r: [8, 20], h: 34 },
      nail: { n: 'Nail', r: [3, 9], h: 18 }, car: { n: 'Toy car', r: [6, 12], h: 40 }, spoon: { n: 'Spoon', r: [10, 18], h: 34 }, worm: { n: 'Worm', r: [5, 15], h: 30 },
      rubber: { n: 'Rubber', r: [3, 7], h: 26 }, straw: { n: 'Straw', r: [12, 22], h: 14 }, brush: { n: 'Paintbrush', r: [12, 22], h: 20 }, comb: { n: 'Comb', r: [10, 18], h: 30 },
      caterpillar: { n: 'Caterpillar', r: [3, 9], h: 30 }, fish: { n: 'Fish', r: [5, 14], h: 40 },
    };
    function shape(g, o) {
      const w = o.L * U, h = OBJ[o.type].h, cl = col(o.c), cs = col(o.c + '-s'), ink = 'var(--ink)', sw = 1.6;
      const P2 = (d, f, extra = {}) => S('path', Object.assign({ d, fill: f, stroke: ink, 'stroke-width': sw, 'stroke-linejoin': 'round' }, extra), g);
      switch (o.type) {
        case 'pencil': S('rect', { x: 0, y: 0, width: w - 40, height: h, fill: cl, stroke: ink, 'stroke-width': sw }, g); S('rect', { x: 0, y: 0, width: 16, height: h, fill: 'var(--pink)', stroke: ink, 'stroke-width': sw }, g); P2(`M${w - 40} 0 L${w} ${h / 2} L${w - 40} ${h} Z`, 'var(--orange-s)'); P2(`M${w - 12} ${h / 2 - 5.5} L${w} ${h / 2} L${w - 12} ${h / 2 + 5.5} Z`, ink); break;
        case 'crayon': P2(`M0 3 H${w - 28} L${w} ${h / 2} L${w - 28} ${h - 3} H0 Z`, cl); S('rect', { x: w * .2, y: 3, width: w * .45, height: h - 6, fill: 'none', stroke: '#fff', 'stroke-opacity': .6, 'stroke-width': 3 }, g); break;
        case 'ribbon': P2(`M0 0 H${w} L${w - 8} ${h / 2} L${w} ${h} H0 Z`, cl); break;
        case 'cubes': for (let k = 0; k < Math.round(o.L); k++) { S('rect', { x: k * U, y: 0, width: U, height: h, fill: col(['red', 'blue', 'green', 'yellow', 'purple', 'orange'][k % 6]), stroke: ink, 'stroke-width': sw }, g); S('rect', { x: k * U + 9, y: 8, width: U - 18, height: h - 16, rx: 3, fill: '#fff', opacity: .25 }, g); } break;
        case 'clip': P2(`M${w - 6} 3 H6 a6 6 0 0 0 0 12 H${w - 4} a3.5 3.5 0 0 0 0 -7 H10`, 'none', { stroke: 'var(--ink-2)', 'stroke-width': 3, 'stroke-linecap': 'round' }); break;
        case 'key': S('circle', { cx: h / 2, cy: h / 2, r: h / 2 - 1, fill: 'var(--yellow)', stroke: ink, 'stroke-width': sw }, g); S('circle', { cx: h / 2, cy: h / 2, r: h / 6, fill: 'var(--board)', stroke: ink, 'stroke-width': sw }, g); P2(`M${h - 1} ${h / 2 - 4} H${w} V${h / 2 + 4} H${w - 6} v8 h-6 v-6 h-6 v8 h-6 v-10 H${h - 1} Z`, 'var(--yellow)'); break;
        case 'leaf': P2(`M0 ${h / 2} H${w * .16} Q${w * .5} ${-h * .25} ${w} ${h / 2} Q${w * .5} ${h * 1.25} ${w * .16} ${h / 2}`, 'var(--green)'); S('path', { d: `M${w * .16} ${h / 2} H${w * .93}`, stroke: 'var(--green-s)', 'stroke-width': 2, fill: 'none' }, g); break;
        case 'feather': P2(`M0 ${h / 2} H${w * .15} Q${w * .55} ${-h * .1} ${w} ${h / 2} Q${w * .55} ${h * 1.1} ${w * .15} ${h / 2} Z`, cs); S('path', { d: `M0 ${h / 2} H${w - 2}`, stroke: cl, 'stroke-width': 2.5, fill: 'none' }, g); for (let k = 1; k < 9; k++) { const x = w * (.18 + k * .085); S('path', { d: `M${x} ${h / 2} l${-8} -${h * .3} M${x} ${h / 2} l-8 ${h * .3}`, stroke: cl, 'stroke-width': 1.2, fill: 'none' }, g); } break;
        case 'nail': S('rect', { x: 0, y: 0, width: 5, height: h, rx: 1.5, fill: 'var(--ink-3)', stroke: ink, 'stroke-width': sw }, g); P2(`M5 ${h / 2 - 3.5} H${w - 10} L${w} ${h / 2} L${w - 10} ${h / 2 + 3.5} H5 Z`, 'var(--line-2)'); break;
        case 'car': P2(`M0 ${h * .75} V${h * .45} Q2 ${h * .3} ${w * .2} ${h * .28} L${w * .32} ${h * .02} H${w * .66} L${w * .8} ${h * .28} Q${w} ${h * .32} ${w} ${h * .5} V${h * .75} Z`, cl); P2(`M${w * .36} ${h * .26} L${w * .42} ${h * .1} H${w * .62} L${w * .7} ${h * .26} Z`, 'var(--blue-s)'); [.24, .76].forEach(f => S('circle', { cx: w * f, cy: h * .78, r: h * .2, fill: ink }, g)); break;
        case 'spoon': P2(`M0 ${h / 2 - 3} H${w * .62} Q${w * .7} ${h / 2 - 3} ${w * .72} ${h * .12} Q${w * .86} 0 ${w} ${h / 2} Q${w * .86} ${h} ${w * .72} ${h * .88} Q${w * .7} ${h / 2 + 3} ${w * .62} ${h / 2 + 3} H0 Z`, 'var(--line-2)'); break;
        case 'worm': { let d = `M8 ${h / 2}`; const n = Math.max(2, Math.round(o.L / 2)); for (let k = 0; k < n; k++) d += ` q${(w - 16) / n / 2} ${k % 2 ? 9 : -9} ${(w - 16) / n} 0`; S('path', { d, stroke: ink, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, g); S('path', { d, stroke: 'var(--pink)', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, g); S('circle', { cx: w - 10, cy: h / 2 - 2, r: 2, fill: ink }, g); break; }
        case 'rubber': S('rect', { x: 0, y: 0, width: w, height: h, rx: 4, fill: cs, stroke: ink, 'stroke-width': sw }, g); S('rect', { x: w * .55, y: 0, width: w * .45, height: h, rx: 4, fill: cl, stroke: ink, 'stroke-width': sw }, g); break;
        case 'straw': S('rect', { x: 0, y: 0, width: w, height: h, rx: 3, fill: 'var(--board)', stroke: ink, 'stroke-width': sw }, g); for (let x = 6; x < w; x += 18) S('path', { d: `M${x} 0 l8 ${h}`, stroke: cl, 'stroke-width': 6 }, g); S('rect', { x: 0, y: 0, width: w, height: h, rx: 3, fill: 'none', stroke: ink, 'stroke-width': sw }, g); break;
        case 'brush': P2(`M0 ${h / 2 - 5} Q0 ${h / 2 - 7} ${w * .55} ${h / 2 - 6} V${h / 2 + 6} Q0 ${h / 2 + 7} 0 ${h / 2 + 5} Z`, cl); S('rect', { x: w * .55, y: h / 2 - 7, width: w * .17, height: 14, fill: 'var(--line-2)', stroke: ink, 'stroke-width': sw }, g); P2(`M${w * .72} ${h / 2 - 7} Q${w * .9} ${h / 2 - 9} ${w} ${h / 2} Q${w * .9} ${h / 2 + 9} ${w * .72} ${h / 2 + 7} Z`, 'var(--ink-2)'); break;
        case 'comb': S('rect', { x: 0, y: 0, width: w, height: 10, rx: 3, fill: cl, stroke: ink, 'stroke-width': sw }, g); for (let x = 4; x < w - 2; x += 7) S('rect', { x, y: 9, width: 3.4, height: h - 10, fill: cl, stroke: ink, 'stroke-width': .8 }, g); break;
        case 'caterpillar': { const n = Math.max(3, Math.round(o.L * 1.2)), rr = Math.min(h / 2, w / (n + 1) * .9); for (let k = 0; k < n; k++) S('circle', { cx: rr + k * (w - 2 * rr) / (n - 1), cy: h / 2, r: rr, fill: k === n - 1 ? 'var(--orange)' : 'var(--green)', stroke: ink, 'stroke-width': sw }, g); S('circle', { cx: w - rr * .7, cy: h / 2 - rr * .3, r: 2, fill: ink }, g); break; }
        case 'fish': P2(`M0 ${h * .2} L${w * .22} ${h / 2} L0 ${h * .8} Z`, cl); P2(`M${w * .18} ${h / 2} Q${w * .55} ${-h * .5} ${w} ${h / 2} Q${w * .55} ${h * 1.5} ${w * .18} ${h / 2} Z`, cl); S('circle', { cx: w * .85, cy: h * .42, r: 3, fill: ink }, g); break;
      }
    }
    // ---------- ruler ----------
    let flashEl = null;
    function drawRuler() {
      clear(rg); const Wd = W();
      const g = S('g', { transform: `translate(${rx},${ry}) rotate(${rot})`, cls: 'grab' }, rg);
      S('rect', { x: 0, y: 0, width: Wd, height: 84, rx: 6, fill: kind === 'wood' ? 'var(--yellow)' : 'var(--blue-s)', 'fill-opacity': kind === 'wood' ? 1 : .6, stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      if (kind === 'wood') S('rect', { x: 0, y: 0, width: Wd, height: 84, rx: 6, fill: 'url(#woodgrain)', opacity: .25 }, g);
      flashEl = S('rect', { x: 0, y: 0, width: Wd, height: 84, rx: 6, fill: 'var(--green)', opacity: 0, style: 'transition:opacity .25s', 'pointer-events': 'none' }, g);
      for (let mm = 0; mm <= len * 10; mm++) { const x = 20 + mm * U / 10, h = mm % 10 === 0 ? 30 : mm % 5 === 0 ? 20 : 12; S('line', { x1: x, y1: 0, x2: x, y2: h, stroke: 'var(--ink)', 'stroke-width': mm % 10 ? 1 : 1.8 }, g); if (mm % 10 === 0) text(g, x, 46, String(mm / 10), { 'font-size': 17, 'font-weight': 700, cls: 'num', fill: mm === 0 ? 'var(--red)' : 'var(--ink)' }); }
      text(g, Wd - 30, 70, 'cm', { 'font-size': 13, fill: 'var(--ink-2)' });
      const h = S('g', { cls: 'grab' }, g); S('circle', { cx: Wd + 26, cy: 42, r: 18, fill: 'var(--ink)' }, h); S('path', { d: `M${Wd + 17} 40 a9 9 0 1 1 9 11`, fill: 'none', stroke: 'var(--board)', 'stroke-width': 3 }, h);
      c.drag(h, { move: p => { rot = Math.round(Math.atan2(p.y - ry, p.x - rx) * 180 / Math.PI); drawRuler(); }, end: () => checkAll() });
      let ox, oy; c.drag(g, { start: p => { if (drawMode) return false; ox = p.x - rx; oy = p.y - ry; }, move: p => { rx = p.x - ox; ry = p.y - oy; g.setAttribute('transform', `translate(${rx},${ry}) rotate(${rot})`); }, end: () => checkAll() });
    }
    function flash() { if (!flashEl) return; flashEl.style.opacity = .55; setTimeout(() => { if (flashEl) flashEl.style.opacity = 0; }, 420); }
    // zero point of the ruler and whether an object is lined up with it
    function zero() { const a = rot * Math.PI / 180; return { x: rx + 20 * Math.cos(a), y: ry + 20 * Math.sin(a) }; }
    function near(o) { if (Math.abs(((rot % 360) + 360) % 360) > 1.5 && Math.abs(((rot % 360) + 360) % 360 - 360) > 1.5) return false; const z = zero(), h = OBJ[o.type].h, bottom = o.y + h; return Math.abs(o.x - z.x) < 9 && bottom > z.y - 26 && o.y < z.y + 84; }
    function checkAll(snapObj) {
      let any = false;
      objs.forEach(o => {
        const k = o.id, is = near(o);
        if (is) { const z = zero(); o.x = z.x; if (o === snapObj) { const h = OBJ[o.type].h; if (o.y + h > z.y + 4) { o.y = z.y - h - 2; } } if (!aligned.has(k)) { aligned.add(k); any = true; } }
        else aligned.delete(k);
      });
      drawObjs(); if (any) flash();
    }
    function drawObjs() {
      clear(og);
      objs.forEach(o => {
        const g = S('g', { transform: `translate(${o.x},${o.y})`, cls: 'grab' }, og);
        shape(g, o);
        if (aligned.has(o.id)) S('path', { d: `M0 -6 V${OBJ[o.type].h + 4}`, stroke: 'var(--green)', 'stroke-width': 3, 'stroke-dasharray': '4 3' }, g);
        if (showLens) text(g, o.L * U / 2, -16, nf(o.L) + ' cm' + (prec === 'mm' ? ` (${Math.round(o.L * 10)} mm)` : ''), { 'font-size': 18, 'font-weight': 700, cls: 'num' });
        let ox, oy; c.drag(g, { start: p => { if (drawMode) return false; ox = p.x - o.x; oy = p.y - o.y; og.append(g); }, move: p => { o.x = p.x - ox; o.y = p.y - oy; g.setAttribute('transform', `translate(${o.x},${o.y})`); }, end: p => { if (p.x > 1085 || p.y > 632 || p.x < 5) { objs.splice(objs.indexOf(o), 1); } checkAll(o); } });
      });
    }
    function drawLines() { clear(lg); lines.forEach(([a, b]) => { S('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-linecap': 'round' }, lg); const L = Math.hypot(b.x - a.x, b.y - a.y) / U; text(lg, (a.x + b.x) / 2, (a.y + b.y) / 2 - 18, nf(+L.toFixed(1)) + ' cm', { 'font-size': 18, 'font-weight': 700, cls: 'num', fill: 'var(--accent)' }); }); if (pend) S('circle', { cx: pend.x, cy: pend.y, r: 6, fill: 'var(--accent)' }, lg); }
    bg.addEventListener('click', e => { if (!drawMode) return; const p = c.pt(e); if (!pend) pend = { x: p.x, y: p.y }; else { lines.push([pend, { x: p.x, y: p.y }]); pend = null; } drawLines(); });
    let uid = objs.reduce((m, o) => Math.max(m, o.id || 0), 0);
    function add(type) {
      const t = OBJ[type], [a, b] = t.r; let L;
      if (t.whole || prec === 'cm') L = rnd(a, b); else if (prec === 'half') L = rnd(a * 2, b * 2) / 2; else L = rnd(a * 10, b * 10) / 10;
      if (L * U + 60 > 1060) L = Math.floor(1000 / U);
      const slot = objs.length % 5;
      objs.push({ id: ++uid, type, L, x: rnd(40, 200), y: 40 + slot * 64, c: ['green', 'blue', 'purple', 'red', 'teal', 'orange'][uid % 6] });
      drawObjs();
    }
    P.section('Ruler');
    P.seg({ options: [['plastic', 'Plastic'], ['wood', 'Wooden']], value: kind, onChange: v => { kind = v; drawRuler(); } });
    P.seg({ label: 'Length', options: [[15, '15 cm'], [30, '30 cm']], value: len, onChange: v => { len = v; drawRuler(); } });
    P.buttons([['Straighten', () => { rot = 0; rx = clamp(rx, 10, 1100 - W() - 60); ry = clamp(ry, 20, 540); drawRuler(); checkAll(); }], ['Reset the ruler', () => { rot = 0; rx = 30; ry = 380; drawRuler(); checkAll(); }]]);
    P.section('Objects to measure');
    P.seg({ label: 'Lengths in', options: [['cm', 'Whole cm'], ['half', 'Half cm'], ['mm', 'mm']], value: prec, onChange: v => prec = v });
    const host = H('div', { cls: 'objpick' });
    Object.entries(OBJ).forEach(([k, o]) => host.append(H('button', { cls: 'btn', text: o.n, on: { click: () => add(k) } })));
    P.raw(host);
    P.buttons([['Random object', () => add(shuffle(Object.keys(OBJ))[0]), 'primary'], ['Remove all', () => { objs = []; aligned.clear(); drawObjs(); }]]);
    P.toggle({ label: 'Show lengths', value: showLens, onChange: v => { showLens = v; drawObjs(); } });
    P.section('Draw');
    P.toggle({ label: 'Draw a line', value: drawMode, onChange: v => { drawMode = v; pend = null; drawLines(); } });
    P.button('Rub out lines', () => { lines = []; pend = null; drawLines(); });
    drawRuler(); drawLines(); checkAll();
  }
});

tool({
  id: 'thermometer', name: 'Thermometer', strand: 'meas', years: [2, 3, 4, 5, 6], w: 1000, h: 660,
  desc: 'A thermometer with negative numbers, a marker for the last reading and the change between them.',
  tags: 'temperature negative numbers scale rise fall degrees',
  icon: '<path d="M20 30V8a4 4 0 0 1 8 0v22a8 8 0 1 1-8 0z"/><circle cx="24" cy="36" r="4" fill="currentColor"/><path d="M24 34V16"/>',
  guide: ['Drag the red liquid, or use the buttons, to set the temperature.', 'The grey marker remembers the previous reading. Tap Fix marker to set it to the current temperature.', 'Show the change to see the rise or fall between the marker and the current reading.', 'Change the scale and the interval between labelled marks to practise reading scales.'],
  mount(c) {
    const { svg, P } = c;
    let lo = -20, hi = 40, iv = 5, t = 18, prev = 6, showVal = true, showDiff = true, unit = 1;
    const g = S('g', {}, svg);
    const y0 = 580, y1 = 70, Y = v => y0 - (v - lo) / (hi - lo) * (y0 - y1);
    function draw() {
      clear(g);
      const x = 300;
      S('rect', { x: x - 30, y: y1 - 30, width: 60, height: y0 - y1 + 60, rx: 30, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      S('circle', { cx: x, cy: y0 + 40, r: 44, fill: 'var(--red)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      S('rect', { x: x - 14, y: Y(t), width: 28, height: y0 + 20 - Y(t), fill: 'var(--red)' }, g);
      for (let v = lo; v <= hi; v += unit) {
        const lab = v % iv === 0, yy = Y(v);
        S('line', { x1: x + 36, y1: yy, x2: x + 36 + (lab ? 30 : 14), y2: yy, stroke: 'var(--ink)', 'stroke-width': lab ? 2.5 : 1.2 }, g);
        S('line', { x1: x - 36, y1: yy, x2: x - 36 - (lab ? 30 : 14), y2: yy, stroke: 'var(--ink)', 'stroke-width': lab ? 2.5 : 1.2 }, g);
        if (lab) text(g, x + 96, yy, nf(v), { 'font-size': 20, 'font-weight': v === 0 ? 800 : 700, cls: 'num', fill: v < 0 ? 'var(--blue)' : 'var(--ink)' });
      }
      text(g, x - 100, y1 - 20, '°C', { 'font-size': 24, 'font-weight': 700 });
      // marker
      const mk = S('g', { cls: 'grab' }, g);
      S('path', { d: `M${x - 70} ${Y(prev)} l-26 -14 v28 z`, fill: 'var(--ink-3)' }, mk);
      c.drag(mk, { move: p => { prev = clamp(Math.round(lo + (y0 - p.y) / (y0 - y1) * (hi - lo)), lo, hi); draw(); } });
      const hd = S('g', { cls: 'grab' }, g);
      S('rect', { x: x - 40, y: Y(t) - 14, width: 80, height: 28, rx: 14, fill: 'var(--red)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, hd);
      S('path', { d: `M${x - 12} ${Y(t) - 4} h24 M${x - 12} ${Y(t) + 4} h24`, stroke: 'var(--board)', 'stroke-width': 2.5 }, hd);
      c.drag(hd, { move: p => { t = clamp(Math.round(lo + (y0 - p.y) / (y0 - y1) * (hi - lo)), lo, hi); draw(); } });
      if (showVal) { text(g, 680, 200, nf(t) + '°C', { 'font-size': 92, 'font-weight': 800, cls: 'disp num', fill: t < 0 ? 'var(--blue)' : 'var(--red)' }); text(g, 680, 270, t < 0 ? `${Math.abs(t)} degrees below zero` : t === 0 ? 'freezing point of water' : `${t} degrees above zero`, { 'font-size': 22, fill: 'var(--ink-2)' }); }
      if (showDiff && prev !== t) {
        const d = t - prev;
        S('path', { d: `M${x - 120} ${Y(prev)} V${Y(t)}`, stroke: d > 0 ? 'var(--orange)' : 'var(--blue)', 'stroke-width': 5, 'marker-end': 'url(#arr)' }, g);
        text(g, 680, 380, `${d > 0 ? 'A rise' : 'A fall'} of ${Math.abs(d)}°`, { 'font-size': 40, 'font-weight': 800, cls: 'disp num', fill: d > 0 ? 'var(--orange)' : 'var(--blue)' });
        text(g, 680, 430, `from ${nf(prev)}°C to ${nf(t)}°C`, { 'font-size': 24, cls: 'num' });
        text(g, 680, 470, `${nf(prev)} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${nf(t)}`, { 'font-size': 24, cls: 'num', fill: 'var(--ink-2)' });
      }
    }
    const defs = S('defs', {}, svg); const m = S('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto-start-reverse' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-2)' }, m);
    P.section('Temperature');
    P.buttons([['− 5', () => { t = Math.max(lo, t - 5); draw(); }], ['− 1', () => { t = Math.max(lo, t - 1); draw(); }], ['+ 1', () => { t = Math.min(hi, t + 1); draw(); }], ['+ 5', () => { t = Math.min(hi, t + 5); draw(); }]]);
    P.button('Fix marker here', () => { prev = t; draw(); });
    P.button('Random temperature', () => { t = rnd(lo, hi); draw(); });
    P.section('Scale');
    P.stepper({ label: 'Lowest', value: lo, min: -50, max: 30, step: 10, onChange: v => { lo = v; if (hi <= lo) hi = lo + 10; t = clamp(t, lo, hi); prev = clamp(prev, lo, hi); draw(); } });
    P.stepper({ label: 'Highest', value: hi, min: -10, max: 110, step: 10, onChange: v => { hi = Math.max(v, lo + 10); t = clamp(t, lo, hi); prev = clamp(prev, lo, hi); draw(); } });
    P.seg({ label: 'Label every', options: [[1, '1°'], [2, '2°'], [5, '5°'], [10, '10°']], value: iv, onChange: v => { iv = v; unit = v >= 5 && hi - lo > 60 ? 2 : 1; draw(); } });
    P.section('Show');
    P.toggle({ label: 'Reading', value: showVal, onChange: v => { showVal = v; draw(); } });
    P.toggle({ label: 'Change from marker', value: showDiff, onChange: v => { showDiff = v; draw(); } });
    draw();
  }
});

tool({
  id: 'measuring-cylinder', name: 'Measuring cylinder', strand: 'meas', years: [2, 3, 4, 5, 6], w: 1000, h: 660,
  desc: 'Pour to a target, mark an amount with the arrow, read the scale, and compare the same amount in vessels of different widths.',
  tags: 'capacity volume ml litre scale reading measuring jug cylinder compare',
  icon: '<path d="M14 6h20M16 6v34a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V6"/><path d="M16 26h16" /><path d="M32 14h-4M32 20h-4M32 32h-4"/>',
  guide: ['Pour to a target: tap an amount and Pour in or Pour out using the buttons under the cylinder. When you hit the target, the board shows the pours as a calculation.', 'Mark the amount: drag the red arrow up or down the scale to the amount asked for, then tap Check.', 'Read the scale: the cylinder has some liquid in it. Type how much and tap Check.', 'Compare vessels: the same amount is poured into vessels of different widths and shapes, so you can see it reaches different heights.', 'Change what the cylinder holds and the number of small marks to make the scale harder or easier to read.'],
  mount(c) {
    const { svg, P, wrap } = c;
    let mode = 'target', max = 500, sub = 5, vol = 0, target = 0, log = [], ask = 0, markAt = 0, readV = 0, result = null, showVol = true, set = 'widths', cv = 0, showScale = true, amtSel = null;
    c.persist(() => ({ mode, max, sub, vol, target, log, ask, markAt, readV, showVol, set, cv, showScale }), s => ({ mode, max, sub, vol, target, log, ask, markAt, readV, showVol, set, cv, showScale } = Object.assign({ mode, max, sub, vol, target, log, ask, markAt, readV, showVol, set, cv, showScale }, s)));
    const IV = { 100: 10, 250: 50, 500: 50, 1000: 100, 2000: 250 };
    const iv = () => IV[max], small = () => iv() / sub;
    const g = S('g', {}, svg);
    const ovl = H('div', { cls: 'ovl mcbar' }); wrap.append(ovl);
    const cx = 330, top = 90, bot = 520, w = 170, Y = v => bot - v / max * (bot - top);
    let flowing = 0, stopFlow = null;
    const chips = () => max <= 100 ? [5, 10, 20, 50] : max <= 250 ? [5, 10, 25, 50, 100] : max <= 500 ? [10, 25, 50, 100, 250] : max <= 1000 ? [25, 50, 100, 250, 500] : [50, 100, 250, 500, 1000];
    // ---------- one cylinder ----------
    function cylinder(liquid) {
      S('rect', { x: cx - w / 2, y: Y(liquid), width: w, height: bot - Y(liquid), fill: 'var(--blue)', 'fill-opacity': .55 }, g);
      if (liquid > 0) S('ellipse', { cx, cy: Y(liquid), rx: w / 2, ry: 7, fill: 'var(--blue)', 'fill-opacity': .4 }, g);
      S('path', { d: `M${cx - w / 2 - 14} ${top - 24} h14 V${bot} a10 10 0 0 0 10 10 H${cx + w / 2 - 10} a10 10 0 0 0 10 -10 V${top - 24} h14`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      S('rect', { x: cx - w / 2 - 50, y: bot + 10, width: w + 100, height: 18, rx: 6, fill: 'var(--ink-2)' }, g);
      for (let k = 0; k <= Math.round(max / small()); k++) {
        const v = k * small(), lab = Math.abs(v / iv() - Math.round(v / iv())) < 1e-9, yy = Y(v), mid = !lab && sub % 2 === 0 && k % (sub / 2) === 0;
        S('line', { x1: cx + w / 2, y1: yy, x2: cx + w / 2 - (lab ? 50 : mid ? 34 : 22), y2: yy, stroke: 'var(--ink)', 'stroke-width': lab ? 2.5 : 1.2 }, g);
        if (lab && v) text(g, cx + w / 2 + 14, yy, big(v), { 'font-size': 18, 'font-weight': 700, cls: 'num', 'text-anchor': 'start' });
      }
      text(g, cx + w / 2 + 14, top - 40, 'ml', { 'font-size': 18, 'text-anchor': 'start', fill: 'var(--ink-2)' });
    }
    function panelText(lines, y0 = 120) { lines.forEach(([t, o], i) => text(g, 790, y0 + i * 44, t, Object.assign({ 'font-size': 24, 'font-weight': 700, cls: 'num' }, o || {}))); }
    function banner(ok, msg, y = 600) { const lines = msg.split('\n'); const wd = Math.min(440, Math.max(...lines.map(l => l.length)) * 11 + 50); S('rect', { x: 770 - wd / 2, y: y - 30, width: wd, height: 28 + lines.length * 28, rx: 16, fill: ok ? 'var(--green)' : 'var(--orange)' }, g); lines.forEach((l, i) => text(g, 770, y - 2 + i * 28, l, { 'font-size': 20, 'font-weight': 800, fill: '#fff', cls: 'num' })); }
    const calcText = () => log.length ? log.map((a, i) => (i ? (a < 0 ? ' − ' : ' + ') : (a < 0 ? '−' : '')) + big(Math.abs(a))).join('') + ` = ${big(vol)} ml` : '';
    function fewest(t) { const cs = chips(), best = Array(t + 1).fill(Infinity); best[0] = 0; for (let v = 1; v <= t; v++) for (const ch of cs) if (ch <= v && best[v - ch] + 1 < best[v]) best[v] = best[v - ch] + 1; return best[t]; }
    // ---------- compare vessels ----------
    const SHAPES = { narrow: { n: 'Narrow', hw: () => 34 }, medium: { n: 'Medium', hw: () => 55 }, wide: { n: 'Wide', hw: () => 92 }, flask: { n: 'Flask', hw: t => 92 - 70 * t }, vase: { n: 'Vase', hw: t => 36 + 34 * Math.sin(Math.PI * Math.min(1, t * 1.15)) } };
    const SETS = { widths: ['narrow', 'medium', 'wide'], all: ['narrow', 'medium', 'wide', 'flask'], shapes: ['medium', 'flask', 'vase', 'wide'] };
    const VH = 400, K = 1000 / (Math.PI * 55 * 55 * VH);
    const TAB = {};
    const tab = sh => TAB[sh] || (TAB[sh] = (() => { const t = [0]; for (let y = 0; y < VH; y++) { const r = SHAPES[sh].hw((y + .5) / VH); t.push(t[y] + Math.PI * r * r * K); } return t; })());
    const cap = sh => tab(sh)[VH];
    const levelOf = (sh, v) => { const t = tab(sh); let lo = 0, hi = VH; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (t[m] < v) lo = m; else hi = m; } const a = t[lo], b2 = t[hi]; return lo + (b2 > a ? clamp((v - a) / (b2 - a), 0, 1) : 0); };
    function drawCompare() {
      const list = SETS[set], n = list.length, gap = 900 / n, base = 520;
      const mx = Math.min(...list.map(cap));
      list.forEach((sh, i) => {
        const x = 50 + gap * i + gap / 2, prof = SHAPES[sh].hw, lvl = levelOf(sh, cv);
        // liquid
        let dL = `M${x - prof(0)} ${base}`; for (let y = 0; y <= lvl; y += 4) dL += ` L${x - prof(y / VH)} ${base - y}`; dL += ` L${x - prof(lvl / VH)} ${base - lvl} L${x + prof(lvl / VH)} ${base - lvl}`; for (let y = lvl; y >= 0; y -= 4) dL += ` L${x + prof(y / VH)} ${base - y}`; dL += ` L${x + prof(0)} ${base} Z`;
        if (cv > 0) S('path', { d: dL, fill: 'var(--blue)', 'fill-opacity': .55 }, g);
        let d = `M${x - prof(1) - 10} ${base - VH - 4}`; for (let y = VH; y >= 0; y -= 4) d += ` L${x - prof(y / VH)} ${base - y}`; for (let y = 0; y <= VH; y += 4) d += ` L${x + prof(y / VH)} ${base - y}`; d += ` L${x + prof(1) + 10} ${base - VH - 4}`;
        S('path', { d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
        S('rect', { x: x - 70, y: base + 6, width: 140, height: 14, rx: 5, fill: 'var(--ink-2)' }, g);
        if (showScale) { const step = cap(sh) > 1500 ? 250 : 100; for (let v = step; v < cap(sh); v += step) { const yy = base - levelOf(sh, v), xr = x + prof((base - yy) / VH); S('line', { x1: xr - 16, y1: yy, x2: xr, y2: yy, stroke: 'var(--ink)', 'stroke-width': 1.5 }, g); text(g, xr - 20, yy, String(v), { 'font-size': 12, 'text-anchor': 'end', fill: 'var(--ink-2)', cls: 'num' }); } }
        if (cv > 0) { S('line', { x1: 40, y1: base - lvl, x2: 960, y2: base - lvl, stroke: 'var(--blue)', 'stroke-width': 1, 'stroke-dasharray': '3 6', opacity: .5 }, g); }
        text(g, x, base + 40, SHAPES[sh].n, { 'font-size': 18, 'font-weight': 800, cls: 'disp' });
        if (cv > 0) text(g, x - prof(lvl / VH) - 8, base - lvl, `${big(Math.round(cv))} ml`, { 'font-size': 15, 'font-weight': 800, fill: 'var(--blue)', cls: 'num', 'text-anchor': 'end' });
      });
      text(g, 500, 50, cv ? `Every vessel has ${big(Math.round(cv))} ml in it. Why are the heights different?` : 'Pour the same amount into every vessel', { 'font-size': 24, 'font-weight': 800, cls: 'disp num' });
      return mx;
    }
    // ---------- draw ----------
    function draw() {
      clear(g); result && result.mode !== mode && (result = null);
      if (mode === 'compare') { drawCompare(); buildBar(); return; }
      const liquid = mode === 'read' ? readV : mode === 'mark' ? 0 : vol;
      if (flowing > 0) { S('rect', { x: cx - 160, y: 20, width: 170, height: 30, rx: 10, fill: 'var(--ink-2)' }, g); S('rect', { x: cx - 10, y: 20, width: 30, height: 50, rx: 6, fill: 'var(--ink-2)' }, g); S('rect', { x: cx - 2, y: 70, width: 14, height: Y(liquid) - 70, fill: 'var(--blue)', opacity: .8 }, g); }
      if (flowing < 0) S('path', { d: `M${cx + w / 2 + 6} ${bot - 10} q40 0 50 60`, stroke: 'var(--blue)', 'stroke-width': 10, fill: 'none', opacity: .8 }, g);
      cylinder(liquid);
      if (mode === 'free' || mode === 'target') {
        if (mode === 'target' && target) {
          S('line', { x1: cx - w / 2 - 34, y1: Y(target), x2: cx + w / 2, y2: Y(target), stroke: 'var(--yellow)', 'stroke-width': 4, 'stroke-dasharray': '10 6' }, g);
          S('path', { d: `M${cx - w / 2 - 34} ${Y(target)} l-24 -14 v28 z`, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
          panelText([[`Fill the cylinder to`, { 'font-size': 22, fill: 'var(--ink-2)' }], [`${big(target)} ml`, { 'font-size': 52, 'font-weight': 800, cls: 'disp num', fill: 'var(--orange)' }]], 110);
        }
        if (showVol) { text(g, 790, mode === 'target' ? 280 : 200, big(Math.round(vol)) + ' ml', { 'font-size': 52, 'font-weight': 800, cls: 'disp num', fill: 'var(--blue)' }); if (vol >= 1000) text(g, 790, (mode === 'target' ? 280 : 200) + 46, `${nf(vol / 1000)} litres`, { 'font-size': 22, fill: 'var(--ink-2)', cls: 'num' }); }
        if (log.length) { text(g, 790, 380, 'Pours so far', { 'font-size': 16, fill: 'var(--ink-3)', 'font-weight': 700 }); const ct = calcText(); text(g, 790, 414, ct, { 'font-size': ct.length > 30 ? 18 : 24, 'font-weight': 800, cls: 'num' }); }
        if (mode === 'target' && target && !flowing && Math.round(vol) === target) { const f = fewest(target), n = log.filter(a => a > 0).length + log.filter(a => a < 0).length; banner(true, `You hit ${big(target)} ml!\n${calcText()}\n${n === f ? `${n} pour${n === 1 ? '' : 's'}: the fewest possible` : `${n} pours. Can you do it in ${f}?`}`, 500); }
        else if (mode === 'target' && target && !flowing && vol > target) banner(false, `Too much! ${big(Math.round(vol))} ml is ${big(Math.round(vol) - target)} ml over.\nPour some out.`, 520);
        text(g, 790, 470 + (mode === 'target' ? 0 : -40), `Each small mark is ${nf(small())} ml`, { 'font-size': 18, fill: 'var(--ink-3)' });
      }
      if (mode === 'mark') {
        panelText([[`Drag the red arrow to`, { 'font-size': 22, fill: 'var(--ink-2)' }], [`${big(ask)} ml`, { 'font-size': 52, 'font-weight': 800, cls: 'disp num', fill: 'var(--red)' }], [`Each small mark is ${nf(small())} ml`, { 'font-size': 18, fill: 'var(--ink-3)', 'font-weight': 400 }]], 110);
        const ar = S('g', { cls: 'grab' }, g), yy = Y(markAt);
        S('rect', { x: cx - w / 2 - 110, y: yy - 26, width: w + 110, height: 52, fill: 'transparent' }, ar);
        S('line', { x1: cx - w / 2 - 30, y1: yy, x2: cx + w / 2, y2: yy, stroke: 'var(--red)', 'stroke-width': 3 }, ar);
        S('path', { d: `M${cx - w / 2 - 30} ${yy} l-36 -18 v12 h-34 v12 h34 v12 z`, fill: 'var(--red)', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, ar);
        c.drag(ar, { start: () => { result = null; }, move: p => { markAt = clamp(Math.round((bot - p.y) / (bot - top) * max / small()) * small(), 0, max); draw(); } });
        if (result) { if (!result.ok) { const yc = Y(ask); S('line', { x1: cx - w / 2, y1: yc, x2: cx + w / 2, y2: yc, stroke: 'var(--green)', 'stroke-width': 4, 'stroke-dasharray': '8 5' }, g); text(g, cx - w / 2 - 8, yc - 14, `${big(ask)} ml is here`, { 'font-size': 14, fill: 'var(--green)', 'text-anchor': 'end', 'font-weight': 800 }); } banner(result.ok, result.msg, 470); }
      }
      if (mode === 'read') {
        panelText([[`How much liquid is in`, { 'font-size': 22, fill: 'var(--ink-2)' }], [`the cylinder?`, { 'font-size': 22, fill: 'var(--ink-2)' }], [`Each small mark is ${nf(small())} ml`, { 'font-size': 18, fill: 'var(--ink-3)', 'font-weight': 400 }]], 110);
        if (result) banner(result.ok, result.msg, 470);
      }
      buildBar();
    }
    // ---------- on-board controls ----------
    let barKey = '';
    function buildBar() {
      const key = mode + '|' + max + '|' + (amtSel || '');
      if (key === barKey && mode !== 'read') return; barKey = key; clear(ovl);
      if (mode === 'free' || mode === 'target' || mode === 'compare') {
        const cs = mode === 'compare' ? [25, 50, 100, 250] : chips(); if (!cs.includes(amtSel)) amtSel = cs[Math.min(2, cs.length - 1)];
        ovl.append(H('span', { cls: 'lbl', text: 'Amount' }));
        cs.forEach(a => ovl.append(H('button', { cls: 'chip' + (a === amtSel ? ' on' : ''), text: `${big(a)} ml`, on: { click: () => { amtSel = a; barKey = ''; buildBar(); } } })));
        ovl.append(H('button', { text: 'Pour out', on: { click: () => pour(-1) } }), H('button', { cls: 'primary', text: 'Pour in', on: { click: () => pour(1) } }), H('button', { text: 'Empty', on: { click: () => { if (mode === 'compare') cv = 0; else { vol = 0; log = []; } draw(); } } }));
        if (mode === 'target') ovl.append(H('button', { text: 'New target', on: { click: newTask } }));
      } else if (mode === 'mark') {
        ovl.append(H('button', { cls: 'primary', text: 'Check', on: { click: () => { result = markAt === ask ? { mode, ok: true, msg: `Yes! That is ${big(ask)} ml.` } : { mode, ok: false, msg: `Not quite. The arrow is at ${big(markAt)} ml.\nThe green line shows ${big(ask)} ml.` }; draw(); } } }), H('button', { text: 'New amount', on: { click: newTask } }));
      } else if (mode === 'read') {
        const inp = H('input', { type: 'number', inputmode: 'numeric', placeholder: 'ml', 'aria-label': 'Your reading in ml' });
        const chk = () => { const v = +inp.value; if (!inp.value) return c.toast('Type how many ml'); result = v === readV ? { mode, ok: true, msg: `Yes! It is ${big(readV)} ml.` } : { mode, ok: false, msg: `Not quite. It is ${big(readV)} ml.\n${v < readV ? 'Count the small marks again.' : 'You read a bit too high.'}` }; draw(); };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') chk(); });
        ovl.append(inp, H('button', { cls: 'primary', text: 'Check', on: { click: chk } }), H('button', { text: 'New amount', on: { click: newTask } }));
      }
    }
    function pour(d) {
      if (flowing) return;
      if (mode === 'compare') {
        const mx = Math.min(...SETS[set].map(cap)), end = clamp(cv + d * amtSel, 0, Math.floor(mx));
        if (end === cv) return c.toast(d > 0 ? 'The smallest vessel is full' : 'They are empty');
        flowing = d; const rate = 260;
        stopFlow = c.raf(dt => { cv = d > 0 ? Math.min(end, cv + rate * dt) : Math.max(end, cv - rate * dt); if (cv === end) { flowing = 0; draw(); return false; } draw(); });
        return;
      }
      const end = clamp(vol + d * amtSel, 0, max); if (end === vol) return c.toast(d > 0 ? 'The cylinder is full' : 'The cylinder is empty');
      log.push(d * Math.abs(end - vol)); flowing = d; const rate = Math.max(amtSel, max / 6) / 1.1;
      stopFlow = c.raf(dt => { vol = d > 0 ? Math.min(end, vol + rate * dt) : Math.max(end, vol - rate * dt); vol = +vol.toFixed(2); if (vol === end) { flowing = 0; vol = Math.round(vol); draw(); return false; } draw(); });
    }
    function newTask() {
      result = null;
      const st = small(), n = Math.round(max / st);
      if (mode === 'target') { const unit = Math.max(chips()[0], st); do target = Math.round(rnd(2, Math.floor(max / unit) - 1) * unit); while (target <= 0 || target >= max); vol = 0; log = []; }
      if (mode === 'mark') { do ask = rnd(1, n - 1) * st; while (sub > 1 && ask % iv() === 0 && Math.random() < .8); ask = +ask.toFixed(2); markAt = 0; }
      if (mode === 'read') { do readV = rnd(2, n - 1) * st; while (sub > 1 && readV % iv() === 0 && Math.random() < .8); readV = +readV.toFixed(2); barKey = ''; }
      draw();
    }
    // ---------- panel ----------
    const dk = () => [...svg.closest('.work').querySelector('.dock').children];
    P.section('Activity');
    P.seg({ options: [['target', 'Pour to a target'], ['mark', 'Mark the amount'], ['read', 'Read the scale'], ['free', 'Free pouring'], ['compare', 'Compare vessels']], value: mode, onChange: v => { if (stopFlow) stopFlow(); flowing = 0; mode = v; barKey = ''; scaleBits.forEach(e => e.hidden = v === 'compare'); cmpBits.forEach(e => e.hidden = v !== 'compare'); if (v === 'free') { vol = 0; log = []; draw(); } else if (v === 'compare') { cv = 0; draw(); } else newTask(); } });
    let before = new Set(dk());
    P.section('Scale');
    P.seg({ label: 'Cylinder holds', options: [[100, '100 ml'], [250, '250 ml'], [500, '500 ml'], [1000, '1 litre'], [2000, '2 litres']], value: max, onChange: v => { max = v; vol = 0; log = []; barKey = ''; if (mode === 'free') draw(); else newTask(); } });
    P.seg({ label: 'Small marks between numbers', options: [[1, 'None'], [2, '2'], [5, '5'], [10, '10']], value: sub, onChange: v => { sub = v; if (mode === 'free') draw(); else newTask(); } });
    P.toggle({ label: 'Show the reading (pouring)', value: showVol, onChange: v => { showVol = v; draw(); } });
    const scaleBits = dk().filter(k => !before.has(k)); before = new Set(dk());
    P.section('Vessels');
    P.seg({ options: [['widths', '3 widths'], ['all', 'Widths and a flask'], ['shapes', 'Different shapes']], value: set, onChange: v => { set = v; cv = Math.min(cv, Math.floor(Math.min(...SETS[v].map(cap)))); draw(); } });
    P.toggle({ label: 'Scales on the vessels', value: showScale, onChange: v => { showScale = v; draw(); } });
    const cmpBits = dk().filter(k => !before.has(k));
    scaleBits.forEach(e => e.hidden = mode === 'compare'); cmpBits.forEach(e => e.hidden = mode !== 'compare');
    c.onClean(() => ovl.remove());
    if (mode === 'target' && !target) newTask(); else draw();
  }
});

tool({
  id: 'weighing-scales', name: 'Weighing scales', strand: 'meas', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 660,
  desc: 'Drag coloured weights onto kitchen or bathroom scales, or read a speedometer. Practise reading dials and scales.',
  tags: 'mass weight grams kilograms dial scale reading speedometer mph km/h',
  icon: '<path d="M12 12h24"/><path d="M24 12v4"/><rect x="8" y="16" width="32" height="26" rx="4"/><circle cx="24" cy="30" r="8"/><path d="M24 30l4-5"/>',
  guide: ['Choose a kind of scale: kitchen scales, bathroom scales or a speedometer.', 'Drag a weight from the side onto the pan. The side never runs out. Drag a weight off the pan to take it away.', 'For the speedometer, drag the needle or use Speed up and Slow down.', 'Move the red marker to set a target, hide the pointer for a harder task, and change how many marks sit between the numbers.'],
  mount(c) {
    const { svg, P } = c;
    const TYPES = {
      k500: { name: 'Kitchen 500 g', max: 500, major: 50, unit: 'g', weights: [200, 100, 50, 20, 10, 5], kind: 'w' },
      k1000: { name: 'Kitchen 1 kg', max: 1000, major: 100, unit: 'g', weights: [500, 200, 100, 50, 20, 10], kind: 'w' },
      k5000: { name: 'Kitchen 5 kg', max: 5000, major: 500, unit: 'g', kg: true, weights: [2000, 1000, 500, 200, 100, 50], kind: 'w' },
      bath: { name: 'Bathroom', max: 150, major: 10, unit: 'kg', weights: [50, 20, 10, 5, 2, 1], kind: 'w' },
      mph: { name: 'Speedometer mph', max: 80, major: 10, unit: 'mph', kind: 's' },
      kmh: { name: 'Speedometer km/h', max: 140, major: 20, unit: 'km/h', kind: 's' },
    };
    const WCOL = ['red', 'blue', 'green', 'orange', 'purple', 'teal'];
    let type = 'k1000', on = [], speed = 0, mark = null, showPtr = true, digital = false, between = 5, ang = null;
    const g = S('g', {}, svg), pg = S('g', {}, svg), dg = S('g', {}, svg);
    const T = () => TYPES[type];
    const cx = 600, cy = 400, R = 180;
    const sweep = () => T().kind === 's' ? 240 : 300, start = () => -90 - sweep() / 2;
    const A = v => (start() + clamp(v, 0, T().max) / T().max * sweep()) * Math.PI / 180;
    const total = () => T().kind === 's' ? speed : on.reduce((s, v) => s + v, 0);
    const wName = w => T().unit === 'g' && w >= 1000 ? nf(w / 1000) + ' kg' : w + ' ' + T().unit;
    const wSize = w => { const ws = T().weights; const i = ws.indexOf(w); return 64 - i * 6; };
    function weightShape(layer, x, y, w, cl) { const s = wSize(w), h = s * .7; const gg = S('g', {}, layer); S('rect', { x: x - s * .16, y: y - h / 2 - s * .22, width: s * .32, height: s * .26, rx: 4, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, gg); S('path', { d: `M${x - s / 2} ${y + h / 2} L${x - s * .38} ${y - h / 2} H${x + s * .38} L${x + s / 2} ${y + h / 2} Z`, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, gg); text(gg, x, y + 4, wName(w), { 'font-size': Math.max(11, s * .22), 'font-weight': 800, fill: '#fff' }); return gg; }
    const panY = () => cy - R - 70;
    function draw() {
      clear(g); clear(dg); const t = T();
      if (t.kind === 'w') {
        // tray of weights
        S('rect', { x: 16, y: 20, width: 190, height: 620, rx: 18, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
        text(g, 111, 46, 'Drag a weight', { 'font-size': 15, fill: 'var(--ink-3)' });
        t.weights.forEach((w, i) => { const y = 100 + i * 92, el = weightShape(g, 111, y, w, WCOL[i]); el.setAttribute('class', 'grab'); let ghost;
          c.drag(el, { start: () => { ghost = S('g', {}, dg); }, move: p => { clear(ghost); weightShape(ghost, p.x, p.y, w, WCOL[i]); }, end: p => { ghost.remove(); if (p.x > 260 && p.y < cy) { if (total() + w > t.max) c.toast('That would go past the end of the scale'); else { on.push(w); draw(); } } } }); });
        // pan with weights
        const py = panY();
        S('rect', { x: cx - 26, y: py, width: 52, height: cy - R - py, fill: 'var(--ink-2)' }, g);
        S('path', { d: `M${cx - 190} ${py} h380 l-26 18 h-328 z`, fill: 'var(--ink-2)' }, g);
        let x = cx - 170, row = 0;
        const sorted = on.map((w, i) => [w, i]).sort((a2, b2) => b2[0] - a2[0]);
        sorted.forEach(([w, idx]) => { const s = wSize(w); if (x + s > cx + 180) { x = cx - 170; row++; } const el = weightShape(g, x + s / 2, py - s * .35 - row * 52, w, WCOL[t.weights.indexOf(w)]); el.setAttribute('class', 'grab'); x += s + 4; let sx, sy;
          c.drag(el, { start: p => { sx = p.x; sy = p.y; }, move: p => el.setAttribute('transform', `translate(${p.x - sx},${p.y - sy})`), end: p => { if (Math.hypot(p.x - sx, p.y - sy) > 30) { on.splice(on.indexOf(w), 1); draw(); } else el.removeAttribute('transform'); } }); });
      }
      // dial body
      if (t.kind === 'w') S('rect', { x: cx - R - 34, y: cy - R - 30, width: 2 * R + 68, height: 2 * R + 70, rx: 36, fill: type === 'bath' ? 'var(--teal-s)' : 'var(--red-s)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      else S('circle', { cx, cy, r: R + 26, fill: 'var(--ink)' }, g);
      S('circle', { cx, cy, r: R, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      const step = t.major / between;
      for (let k = 0; k <= Math.round(t.max / step); k++) { const v = k * step, a = A(v), isM = k % between === 0, mid = !isM && between % 2 === 0 && k % (between / 2) === 0, L = isM ? 26 : mid ? 18 : 10; S('line', { x1: cx + R * Math.cos(a), y1: cy + R * Math.sin(a), x2: cx + (R - L) * Math.cos(a), y2: cy + (R - L) * Math.sin(a), stroke: 'var(--ink)', 'stroke-width': isM ? 3 : 1.3 }, g); if (isM) text(g, cx + (R - 50) * Math.cos(a), cy + (R - 50) * Math.sin(a), t.kg ? nf(v / 1000) : nf(v), { 'font-size': 18, 'font-weight': 700, cls: 'num' }); }
      text(g, cx, cy + 70, t.kg ? 'kg' : t.unit, { 'font-size': 22, 'font-weight': 700, fill: 'var(--ink-2)' });
      if (mark != null) { const ma = A(mark), mg = S('g', { cls: 'grab' }, g); S('path', { d: `M${cx + (R + 3) * Math.cos(ma)} ${cy + (R + 3) * Math.sin(ma)} L${cx + (R + 28) * Math.cos(ma - .06)} ${cy + (R + 28) * Math.sin(ma - .06)} L${cx + (R + 28) * Math.cos(ma + .06)} ${cy + (R + 28) * Math.sin(ma + .06)} Z`, fill: 'var(--red)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, mg); c.drag(mg, { move: p => { mark = valAt(p); draw(); } }); }
      if (digital) { S('rect', { x: cx - 80, y: cy + 96, width: 160, height: 50, rx: 10, fill: 'var(--lcd)' }, g); text(g, cx, cy + 121, t.kg ? nf(total() / 1000) + ' kg' : big(total()) + ' ' + t.unit, { 'font-size': 26, 'font-weight': 800, cls: 'num', fill: 'var(--lcd-ink)' }); }
      text(g, 900, 120, 'Each small mark', { 'font-size': 16, fill: 'var(--ink-2)' }); text(g, 900, 150, `${t.kg ? nf(step / 1000) + ' kg' : nf(step) + ' ' + t.unit}`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num' });
      if (mark != null) { text(g, 900, 210, 'Red marker', { 'font-size': 16, fill: 'var(--ink-2)' }); text(g, 900, 240, `${t.kg ? nf(mark / 1000) + ' kg' : nf(mark) + ' ' + t.unit}`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num', fill: 'var(--red)' }); }
      drawPtr();
    }
    function valAt(p) { let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI; let t2 = a - start(); t2 = ((t2 % 360) + 360) % 360; if (t2 > sweep()) t2 = t2 > sweep() + (360 - sweep()) / 2 ? 0 : sweep(); const step = T().major / between; return clamp(Math.round(t2 / sweep() * T().max / step) * step, 0, T().max); }
    function drawPtr() {
      clear(pg); if (!showPtr) return; if (ang == null) ang = A(0);
      const pgrp = S('g', { cls: T().kind === 's' ? 'grab' : '' }, pg);
      S('line', { x1: cx - 24 * Math.cos(ang), y1: cy - 24 * Math.sin(ang), x2: cx + (R - 14) * Math.cos(ang), y2: cy + (R - 14) * Math.sin(ang), stroke: T().kind === 's' ? 'var(--orange)' : 'var(--ink)', 'stroke-width': 6, 'stroke-linecap': 'round' }, pgrp);
      S('circle', { cx, cy, r: 16, fill: 'var(--ink)' }, pgrp);
      if (T().kind === 's') { S('circle', { cx: cx + (R - 30) * Math.cos(ang), cy: cy + (R - 30) * Math.sin(ang), r: 24, fill: 'transparent' }, pgrp); c.drag(pgrp, { move: p => { speed = valAt(p); draw(); } }); }
    }
    c.raf(dt => { const tg = A(total()), d = tg - (ang ?? tg); if (ang == null) ang = tg; if (Math.abs(d) > .001) { ang += d * Math.min(1, dt * 6); drawPtr(); } });
    P.section('Scale');
    P.seg({ options: Object.entries(TYPES).map(([k, v]) => [k, v.name]), value: type, onChange: v => { type = v; on = []; speed = 0; mark = null; ang = null; speedBits.forEach(e => e.hidden = T().kind !== 's'); draw(); } });
    P.seg({ label: 'Marks between numbers', options: [[1, '1'], [2, '2'], [5, '5'], [10, '10']], value: between, onChange: v => { between = v; draw(); } });
    const speedBits = [P.buttons([['Slow down', () => { speed = Math.max(0, speed - 5); draw(); }], ['Speed up', () => { speed = Math.min(T().max, speed + 5); draw(); }, 'primary']])];
    speedBits.forEach(e => e.hidden = true);
    P.section('Show');
    P.toggle({ label: 'Pointer', value: showPtr, onChange: v => { showPtr = v; drawPtr(); } });
    P.toggle({ label: 'Digital display', value: digital, onChange: v => { digital = v; draw(); } });
    P.toggle({ label: 'Red target marker', value: false, onChange: v => { mark = v ? Math.round(T().max * .6 / T().major) * T().major : null; draw(); } });
    P.section();
    P.button('Take everything off', () => { on = []; speed = 0; draw(); });
    draw();
  }
});

tool({
  id: 'clock', name: 'Tell the time', strand: 'meas', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 680,
  desc: 'Teaching clock faces (five minutes, quarters, past and to, Roman numerals, 24 hour) linked to a digital clock, with time problems on a timeline.',
  tags: 'time clock analogue digital 24 hour past to duration roman numerals quarter timeline problems elapsed',
  icon: '<circle cx="24" cy="24" r="18"/><path d="M24 12v12l8 5"/>',
  guide: ['Drag the long hand round. The hour hand and the digital clock move with it. You can also drag the hour hand.', 'Choose a teaching face: five minute intervals, quarters, past and to, Roman numerals, 24 hour, or no numbers. Turn the minute marks off to make it easier.', 'Add or take away time with the jump buttons. Each jump is drawn on the clock.', 'Time problems use the jump size you have chosen. Tap Next jump to count on along the timeline while the clock moves, then Show answer.'],
  mount(c) {
    const { svg, P } = c;
    let m = 9 * 60 + 25, showA = true, showD = true, h24 = false, words = true, mins = true, step = 15, face = 'std', ticks = true, arcs = [], prob = null;
    c.persist(() => ({ m, showA, showD, h24, words, mins, step, face, ticks, prob }), s => ({ m, showA, showD, h24, words, mins, step, face, ticks, prob } = Object.assign({ m, showA, showD, h24, words, mins, step, face, ticks, prob }, s)));
    const g = S('g', {}, svg);
    const cx = 270, cy = 268, R = 200, RX = 790;
    const ws = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
    const ROM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    function inWords(t) { const h = Math.floor(t / 60) % 24, mm = t % 60; const hh = h % 12; const nx = (hh + 1) % 12; const num = n => ({ 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'quarter', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty', 30: 'half' })[n] || (n > 20 ? 'twenty-' + ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n - 20] : ''); const mw = n => n === 15 || n === 30 ? num(n) : num(n) + (n % 5 ? (n === 1 ? ' minute' : ' minutes') : ''); if (mm === 0) return ws[hh] + " o'clock"; if (mm <= 30) return `${mw(mm)} past ${ws[hh]}`; return `${mw(60 - mm)} to ${ws[nx]}`; }
    const digi = t => { t = ((t % 1440) + 1440) % 1440; const hh = Math.floor(t / 60), mm = t % 60; return h24 ? `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` : `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`; };
    const dur = d => { const h = Math.floor(d / 60), mm = d % 60; return [h ? `${h} hour${h > 1 ? 's' : ''}` : '', mm ? `${mm} minute${mm > 1 ? 's' : ''}` : ''].filter(Boolean).join(' '); };
    const at = (r, k) => { const a = k * 6 * Math.PI / 180 - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const sector = (r0, r1, k0, k1, fill, op = 1) => { const a0 = k0 * 6 * Math.PI / 180 - Math.PI / 2, a1 = k1 * 6 * Math.PI / 180 - Math.PI / 2, lg = (k1 - k0) > 30 ? 1 : 0; S('path', { d: `M${cx + r0 * Math.cos(a0)} ${cy + r0 * Math.sin(a0)} L${cx + r1 * Math.cos(a0)} ${cy + r1 * Math.sin(a0)} A${r1} ${r1} 0 ${lg} 1 ${cx + r1 * Math.cos(a1)} ${cy + r1 * Math.sin(a1)} L${cx + r0 * Math.cos(a1)} ${cy + r0 * Math.sin(a1)} ${r0 ? `A${r0} ${r0} 0 ${lg} 0 ${cx + r0 * Math.cos(a0)} ${cy + r0 * Math.sin(a0)}` : ''} Z`, fill, opacity: op }, g); };
    function drawFace() {
      const ring = face === 'quarters' ? 54 : face === '5min' || face === 'pastto' || mins ? 40 : 14;
      S('circle', { cx, cy, r: R + ring, fill: 'var(--ink)' }, g);
      S('circle', { cx, cy, r: R, fill: 'var(--board)' }, g);
      if (face === 'quarters') { [['var(--blue-s)', 0], ['var(--green-s)', 15], ['var(--yellow-s)', 30], ['var(--pink-s)', 45]].forEach(([f, k]) => sector(0, R - 2, k, k + 15, f)); }
      if (face === '5min') for (let k = 0; k < 12; k++) sector(R * .78, R - 2, k * 5, k * 5 + 5, k % 2 ? 'var(--blue-s)' : 'var(--yellow-s)');
      if (face === 'pastto') { sector(0, R - 2, 0, 30, 'var(--green-s)'); sector(0, R - 2, 30, 60, 'var(--orange-s)'); text(g, cx + R * .3, cy - R * .3, 'past', { 'font-size': 22, 'font-weight': 800, fill: 'var(--green)' }); text(g, cx - R * .3, cy - R * .3, 'to', { 'font-size': 22, 'font-weight': 800, fill: 'var(--orange)' }); }
      // arcs for jumps
      arcs.forEach((a, i) => { const span = a.d / 60 * 360, r = R - 52 - (i % 3) * 12; if (Math.abs(a.d) >= 60) return; const a1 = (a.from % 60) / 60 * 360 - 90; const p = d => [cx + r * Math.cos(d * Math.PI / 180), cy + r * Math.sin(d * Math.PI / 180)]; const [x1, y1] = p(a1), [x2, y2] = p(a1 + span); S('path', { d: `M${x1} ${y1} A${r} ${r} 0 ${Math.abs(span) > 180 ? 1 : 0} ${span > 0 ? 1 : 0} ${x2} ${y2}`, fill: 'none', stroke: a.d > 0 ? 'var(--accent)' : 'var(--purple)', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: .7 }, g); });
      for (let k = 0; k < 60; k++) { const five = k % 5 === 0; if (!five && !ticks) continue; const [x1, y1] = at(R * .95, k), [x2, y2] = at(R * .95 - (five ? 20 : 9), k); S('line', { x1, y1, x2, y2, stroke: 'var(--ink)', 'stroke-width': five ? 4 : 1.5 }, g); }
      // outer ring labels
      const ringT = (k, t, fs = 15) => { const [x, y] = at(R + 21, k); text(g, x, y, t, { 'font-size': fs, 'font-weight': 800, fill: 'var(--bg)', cls: 'num' }); };
      if (face === '5min') for (let k = 0; k < 12; k++) ringT(k * 5, k ? String(k * 5) : "o'clock", k ? 16 : 12);
      else if (face === 'pastto') ['o\'clock', '5', '10', '¼', '20', '25', '½', '25', '20', '¼', '10', '5'].forEach((t, k) => ringT(k * 5, t, k ? 17 : 12));
      else if (face === 'quarters') [["o'clock", 0], ['quarter\npast', 15], ['half past', 30], ['quarter\nto', 45]].forEach(([t, k]) => { const [x, y] = at(R + 27, k); t.split('\n').forEach((l, i, arr) => text(g, x, y + (i - (arr.length - 1) / 2) * 15, l, { 'font-size': 13, 'font-weight': 800, fill: 'var(--bg)' })); });
      else if (mins) for (let k = 0; k < 12; k++) ringT(k * 5, String(k * 5));
      // hour numbers
      if (face !== 'blank') for (let k = 1; k <= 12; k++) {
        const [x, y] = at(R * .68, k * 5), t = face === 'roman' ? ROM[k] : String(k);
        text(g, x, y, t, { 'font-size': face === 'roman' ? (t.length > 3 ? 24 : 30) : 38, 'font-weight': 800, cls: 'disp num', fill: face === 'roman' ? 'var(--ink)' : 'var(--ink)' });
        if (face === '24h') { const [x2, y2] = at(R * .44, k * 5); text(g, x2, y2, String(k + 12 === 24 ? '00' : k + 12), { 'font-size': 18, 'font-weight': 800, cls: 'num', fill: 'var(--red)' }); }
      }
      if (face === '5min') for (let k = 0; k < 12; k++) { const [x, y] = at(R * .87, k * 5 + 2.5); text(g, x, y, '5', { 'font-size': 11, fill: 'var(--ink-3)', 'font-weight': 700 }); }
    }
    function drawHands() {
      const mm = m % 60, hh = Math.floor(m / 60) % 24;
      const ha = ((hh % 12) * 60 + mm) / 720 * 2 * Math.PI - Math.PI / 2, ma = mm / 60 * 2 * Math.PI - Math.PI / 2;
      const hg = S('g', { cls: 'grab' }, g);
      S('line', { x1: cx, y1: cy, x2: cx + R * .5 * Math.cos(ha), y2: cy + R * .5 * Math.sin(ha), stroke: 'var(--red)', 'stroke-width': 13, 'stroke-linecap': 'round' }, hg);
      const mg = S('g', { cls: 'grab' }, g);
      S('line', { x1: cx, y1: cy, x2: cx + R * .82 * Math.cos(ma), y2: cy + R * .82 * Math.sin(ma), stroke: 'var(--blue)', 'stroke-width': 8, 'stroke-linecap': 'round' }, mg);
      S('circle', { cx: cx + R * .82 * Math.cos(ma), cy: cy + R * .82 * Math.sin(ma), r: 22, fill: 'transparent' }, mg);
      S('circle', { cx, cy, r: 12, fill: 'var(--ink)' }, g);
      let lastM = mm;
      c.drag(mg, { start: () => { lastM = m % 60; arcs = []; }, move: p => { let a = Math.atan2(p.y - cy, p.x - cx) + Math.PI / 2; if (a < 0) a += 2 * Math.PI; const nm = Math.round(a / (2 * Math.PI) * 60) % 60; let d = nm - lastM; if (d > 30) d -= 60; if (d < -30) d += 60; if (d) { m = (m + d + 1440) % 1440; lastM = nm; draw(); } } });
      c.drag(hg, { start: () => { arcs = []; }, move: p => { let a = Math.atan2(p.y - cy, p.x - cx) + Math.PI / 2; if (a < 0) a += 2 * Math.PI; const t = Math.round(a / (2 * Math.PI) * 720 / 5) * 5 % 720; const pm = Math.floor(m / 60) >= 12 ? 720 : 0; m = (pm + t) % 1440; draw(); } });
    }
    function drawProblem() {
      if (!prob) return;
      const { text: q, from, d, dir, shown, reveal } = prob;
      // question
      const lines = []; let line = ''; q.split(' ').forEach(w => { if ((line + ' ' + w).length > 78) { lines.push(line.trim()); line = w; } else line += ' ' + w; }); lines.push(line.trim());
      lines.forEach((l, i) => text(g, 500, 540 + i * 28 - (lines.length - 1) * 14, l, { 'font-size': 22, 'font-weight': 800, cls: 'num' }));
      // timeline
      const n = Math.round(d / step), y = 620, x0 = 70, x1 = 930, X = k => x0 + k / n * (x1 - x0);
      S('line', { x1: x0 - 20, y1: y, x2: x1 + 20, y2: y, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      const tAt = k => dir > 0 ? from + k * step : from - (n - k) * step;
      for (let k = 0; k <= n; k++) {
        const known = dir > 0 ? (k === 0 || k <= shown || (prob.kind === 'dur' && k === n)) : (k === n || k >= n - shown);
        S('line', { x1: X(k), y1: y - 8, x2: X(k), y2: y + 8, stroke: 'var(--ink)', 'stroke-width': 2 }, g);
        if (known || reveal) text(g, X(k), y + 24, digi(tAt(k)), { 'font-size': n > 8 ? 12 : 15, 'font-weight': 700, cls: 'num', fill: (k === 0 && dir > 0) || (k === n && dir < 0) ? 'var(--ink)' : 'var(--accent)' });
      }
      const jumps = reveal ? n : shown;
      for (let j = 0; j < jumps; j++) { const k0 = dir > 0 ? j : n - j - 1, a = dir > 0 ? X(k0) : X(k0 + 1), b = dir > 0 ? X(k0 + 1) : X(k0), mid = (a + b) / 2; S('path', { d: `M${a} ${y - 6} Q${mid} ${y - 42} ${b} ${y - 6}`, fill: 'none', stroke: dir > 0 ? 'var(--accent)' : 'var(--purple)', 'stroke-width': 3, 'marker-end': 'url(#clkArr)' }, g); text(g, mid, y - 34, (dir > 0 ? '+' : '−') + (step >= 60 ? step / 60 + 'h' : step), { 'font-size': n > 8 ? 12 : 15, 'font-weight': 800, fill: dir > 0 ? 'var(--accent)' : 'var(--purple)' }); }
      if (reveal) { const ans = prob.kind === 'end' ? digi(from + d) : prob.kind === 'start' ? digi(from - d) : dur(d); S('rect', { x: RX - 150, y: 420, width: 300, height: 64, rx: 16, fill: 'var(--green)' }, g); text(g, RX, 453, `Answer: ${ans}`, { 'font-size': 24, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
    }
    function draw() {
      clear(g);
      const defs = S('defs', {}, g), mk = S('marker', { id: 'clkArr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-2)' }, mk);
      if (showA) { drawFace(); drawHands(); }
      const mm = m % 60, hh = Math.floor(m / 60) % 24;
      if (showD) {
        const dh = h24 ? String(hh).padStart(2, '0') : String(hh % 12 || 12), ds = `${dh}:${String(mm).padStart(2, '0')}`;
        S('rect', { x: RX - 140, y: 70, width: 280, height: 120, rx: 20, fill: 'var(--lcd)' }, g);
        text(g, RX, 132, ds, { 'font-size': 78, 'font-weight': 800, cls: 'disp num', fill: 'var(--lcd-ink)' });
        if (!h24) text(g, RX, 216, hh < 12 ? 'am (morning)' : 'pm (afternoon or evening)', { 'font-size': 19, fill: 'var(--ink-2)' });
      }
      if (words) text(g, RX, 268, inWords(m), { 'font-size': 25, 'font-weight': 700 });
      if (arcs.length) { const tot = arcs.reduce((s, a) => s + a.d, 0); text(g, RX, 340, `${tot > 0 ? '+' : '−'} ${dur(Math.abs(tot))}`, { 'font-size': 28, 'font-weight': 800, fill: tot > 0 ? 'var(--accent)' : 'var(--purple)', cls: 'num' }); }
      drawProblem();
    }
    function addT(d) { arcs.push({ from: m, d }); m = (m + d + 1440) % 1440; draw(); }
    const ACT = [['The film', 'watching'], ['Swimming club', 'at swimming'], ['The train journey', 'on the train'], ['The school trip', 'on the trip'], ['Baking a cake', 'baking'], ['The football match', 'at the match'], ['The bus ride', 'on the bus'], ['Forest school', 'in the forest']];
    function newProblem() {
      const kind = ['end', 'dur', 'start'][rnd(0, 2)], [act] = ACT[rnd(0, ACT.length - 1)];
      const n = step >= 60 ? rnd(1, 4) : step >= 30 ? rnd(2, 6) : step >= 15 ? rnd(2, 8) : step >= 5 ? rnd(3, 10) : rnd(4, 12);
      const d = n * step, s0 = (rnd(7 * 12, 18 * 12) * 5);
      const st = step === 1 ? s0 + rnd(0, 4) : s0;
      let q, from, dir = 1;
      if (kind === 'end') { q = `${act} starts at ${digi(st)}. It lasts ${dur(d)}. What time does it finish?`; from = st; }
      else if (kind === 'dur') { q = `${act} starts at ${digi(st)} and finishes at ${digi(st + d)}. How long does it last?`; from = st; }
      else { q = `${act} finishes at ${digi(st + d)}. It lasted ${dur(d)}. What time did it start?`; from = st + d; dir = -1; }
      prob = { kind, text: q, from, d, dir, shown: 0, reveal: false };
      m = ((from % 1440) + 1440) % 1440; arcs = []; draw();
    }
    function nextJump() { if (!prob) return newProblem(); const n = Math.round(prob.d / step); if (prob.shown >= n) { prob.reveal = true; draw(); return; } prob.shown++; addT(prob.dir * step); if (prob.shown >= n && prob.kind !== 'dur') { } }
    P.section('Clock face');
    P.seg({ options: [['std', 'Numbers'], ['5min', '5 minutes'], ['quarters', 'Quarters'], ['pastto', 'Past and to'], ['roman', 'Roman'], ['24h', '24 hour'], ['blank', 'No numbers']], value: face, onChange: v => { face = v; draw(); } });
    P.toggle({ label: 'Minute marks', value: ticks, onChange: v => { ticks = v; draw(); } });
    P.toggle({ label: 'Minutes round the edge', value: mins, onChange: v => { mins = v; draw(); } });
    P.section('Jumps');
    P.seg({ label: 'Jump by', options: [[1, '1 min'], [5, '5 min'], [10, '10 min'], [15, '15 min'], [30, '30 min'], [60, '1 hour']], value: step, onChange: v => { step = v; if (prob) { prob = null; } draw(); } });
    P.buttons([['Take away', () => addT(-step)], ['Add on', () => addT(step), 'primary']]);
    P.buttons([['Clear jumps', () => { arcs = []; draw(); }], ['Random time', () => { m = rnd(0, 287) * 5; arcs = []; draw(); }]]);
    P.section('Time problems');
    P.button('New time problem', newProblem, 'primary');
    P.buttons([['Next jump', nextJump], ['Show answer', () => { if (!prob) return; const n = Math.round(prob.d / step); while (prob.shown < n) { prob.shown++; arcs.push({ from: m, d: prob.dir * step }); m = (m + prob.dir * step + 1440) % 1440; } prob.reveal = true; draw(); }]]);
    c.pulseWhen(c.btn('Next jump'), () => prob && !prob.reveal);
    P.button('Clear the problem', () => { prob = null; arcs = []; draw(); });
    P.section('Show');
    P.toggle({ label: 'Analogue clock', value: showA, onChange: v => { showA = v; draw(); } });
    P.toggle({ label: 'Digital clock', value: showD, onChange: v => { showD = v; draw(); } });
    P.toggle({ label: '24 hour digital', value: h24, onChange: v => { h24 = v; draw(); } });
    P.toggle({ label: 'Time in words', value: words, onChange: v => { words = v; draw(); } });
    draw();
  }
});

tool({
  id: 'stopwatch', name: 'Stopwatch and timer', strand: 'meas', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 600,
  desc: 'A large stopwatch with laps, and a countdown timer for classroom tasks.',
  tags: 'time seconds lap countdown timer',
  icon: '<circle cx="24" cy="27" r="16"/><path d="M24 27V18M20 5h8M24 5v6M38 13l3-3"/>',
  guide: ['Tap Start to run the stopwatch, and Lap to record split times.', 'Switch to Timer, set the minutes and seconds, and start the countdown. Choose how the time running out is shown: a ring, a bar, a tube, a sand timer, a candle, a battery or a pizza being eaten.', 'Use the stopwatch to time investigations, such as how long a ball takes to roll down a ramp.'],
  mount(c) {
    const { svg, P } = c;
    let mode = 'watch', run = false, t0 = 0, acc = 0, laps = [], tset = 120, done = false;
    let sound = store.get('timerSound', 'bell'), actx = null;
    const audio = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { } return actx; };
    function ring(kind = sound) {
      const a = audio(); if (!a || kind === 'off') return; const t = a.currentTime;
      const tone = (type, f, at, len, vol) => { const o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(vol, at + .01); gn.gain.exponentialRampToValueAtTime(.0001, at + len); o.connect(gn); gn.connect(a.destination); o.start(at); o.stop(at + len + .05); };
      if (kind === 'bell') for (let r = 0; r < 3; r++) [[1, .32], [2.76, .14], [5.4, .07], [.5, .12]].forEach(([mul, v]) => tone('sine', 784 * mul, t + r * .85, 1.8, v));
      else if (kind === 'buzzer') for (let r = 0; r < 3; r++) { tone('square', 150, t + r * .6, .45, .18); tone('sawtooth', 151, t + r * .6, .45, .1); }
      else for (let r = 0; r < 4; r++) [0, .14].forEach(d => tone('triangle', 1320, t + r * .5 + d, .1, .25));
    }
    c.onClean(() => { try { actx && actx.close(); } catch (e) { } });
    const g = S('g', {}, svg);
    const now = () => acc + (run ? performance.now() - t0 : 0);
    const fmt = ms => { const s = Math.floor(ms / 1000), mm = Math.floor(s / 60), ss = s % 60, cs = Math.floor(ms % 1000 / 10); return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
    let tStyle = store.get('timerStyle', 'ring'), wStyle = store.get('watchStyle', 'dial');
    const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    function bigTime(x, y, s, left, fs = 96) { text(g, x, y, mmss(s), { 'font-size': fs, 'font-weight': 800, cls: 'disp num', fill: left === 0 ? 'var(--red)' : 'var(--ink)' }); text(g, x, y + fs * .7, left === 0 ? 'Time is up' : run ? 'remaining' : 'ready', { 'font-size': 22, fill: 'var(--ink-2)' }); }
    const lvlCol = f => f < .2 ? 'var(--red)' : f < .5 ? 'var(--orange)' : 'var(--green)';
    function drawTimer(f, left) {
      const s = Math.ceil(left / 1000), tnow = performance.now();
      if (tStyle === 'ring') {
        const cx = 360, cy = 300, R = 230, a = -Math.PI / 2 + f * 2 * Math.PI, r = R - 30;
        S('circle', { cx, cy, r: R, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 6 }, g); S('rect', { x: cx - 30, y: cy - R - 50, width: 60, height: 36, rx: 8, fill: 'var(--ink)' }, g);
        S('circle', { cx, cy, r, fill: 'none', stroke: 'var(--line)', 'stroke-width': 30 }, g);
        if (f > 0) S('path', { d: f >= .9999 ? `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - .01} ${cy - r}` : `M${cx} ${cy - r} A${r} ${r} 0 ${f > .5 ? 1 : 0} 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`, fill: 'none', stroke: lvlCol(f), 'stroke-width': 30, 'stroke-linecap': 'round' }, g);
        text(g, cx, cy, mmss(s), { 'font-size': 110, 'font-weight': 800, cls: 'disp num', fill: left === 0 ? 'var(--red)' : 'var(--ink)' });
        text(g, cx, cy + 90, left === 0 ? 'Time is up' : run ? 'remaining' : 'ready', { 'font-size': 24, fill: 'var(--ink-2)' });
        return;
      }
      if (tStyle === 'bar') {
        const x0 = 60, w = 880, y = 200, h = 110;
        S('rect', { x: x0, y, width: w, height: h, rx: 24, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 4 }, g);
        if (f > 0) S('rect', { x: x0 + 6, y: y + 6, width: Math.max(0, (w - 12) * f), height: h - 12, rx: 18, fill: lvlCol(f) }, g);
        for (let k = 1; k < 10; k++) S('line', { x1: x0 + w * k / 10, y1: y + h, x2: x0 + w * k / 10, y2: y + h + 14, stroke: 'var(--ink-3)', 'stroke-width': 2 }, g);
        bigTime(500, 430, s, left); return;
      }
      if (tStyle === 'tube') {
        const x = 230, w = 150, top = 60, bot = 540, h = bot - top;
        S('rect', { x, y: top, width: w, height: h, rx: 30, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 5 }, g);
        if (f > 0) S('rect', { x: x + 8, y: bot - 8 - (h - 16) * f, width: w - 16, height: (h - 16) * f, rx: 22, fill: lvlCol(f) }, g);
        for (let k = 1; k < 10; k++) S('line', { x1: x + w, y1: top + h * k / 10, x2: x + w + 18, y2: top + h * k / 10, stroke: 'var(--ink-3)', 'stroke-width': 2 }, g);
        bigTime(720, 290, s, left); return;
      }
      if (tStyle === 'sand') {
        const cx = 330, top = 60, mid = 300, bot = 540, W = 170, sand = 'var(--yellow)';
        const gp = S('g', {}, g);
        S('rect', { x: cx - W - 20, y: top - 22, width: 2 * W + 40, height: 22, rx: 8, fill: '#B9773F', stroke: 'var(--ink)', 'stroke-width': 3 }, gp); S('rect', { x: cx - W - 20, y: bot, width: 2 * W + 40, height: 22, rx: 8, fill: '#B9773F', stroke: 'var(--ink)', 'stroke-width': 3 }, gp);
        const glass = `M${cx - W} ${top} L${cx + W} ${top} C${cx + W} ${mid - 80} ${cx + 18} ${mid - 30} ${cx + 14} ${mid} C${cx + 18} ${mid + 30} ${cx + W} ${bot - 80} ${cx + W} ${bot} L${cx - W} ${bot} C${cx - W} ${bot - 80} ${cx - 18} ${mid + 30} ${cx - 14} ${mid} C${cx - 18} ${mid - 30} ${cx - W} ${mid - 80} ${cx - W} ${top} Z`;
        S('path', { d: glass, fill: 'var(--blue-s)', 'fill-opacity': .4 }, gp);
        const clipId = 'sandclip'; const cp = S('clipPath', { id: clipId }, gp); S('path', { d: glass }, cp);
        const sg = S('g', { 'clip-path': `url(#${clipId})` }, gp);
        const topH = (mid - top - 10) * f * .85; if (f > 0) S('rect', { x: cx - W, y: mid - 10 - topH, width: 2 * W, height: topH + 10, fill: sand }, sg);
        const botH = (bot - mid - 10) * (1 - f) * .85; S('path', { d: `M${cx - W} ${bot} L${cx - W} ${bot - botH * .6} Q${cx} ${bot - botH * 1.4} ${cx + W} ${bot - botH * .6} L${cx + W} ${bot} Z`, fill: sand }, sg);
        if (run && f > 0) S('rect', { x: cx - 3, y: mid - 4, width: 6, height: bot - mid - botH, fill: sand }, sg);
        S('path', { d: glass, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 4 }, gp);
        bigTime(760, 290, s, left); return;
      }
      if (tStyle === 'candle') {
        const cx = 330, base = 540, maxH = 400, h = 20 + maxH * f, top = base - h;
        S('ellipse', { cx, cy: base + 6, rx: 130, ry: 22, fill: 'var(--line-2)' }, g);
        S('rect', { x: cx - 60, y: top, width: 120, height: h, rx: 10, fill: 'var(--pink-s)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
        S('path', { d: `M${cx - 40} ${top} q0 30 8 46 q8 -10 6 -46`, fill: 'var(--pink-s)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
        S('line', { x1: cx, y1: top, x2: cx, y2: top - 18, stroke: 'var(--ink)', 'stroke-width': 4 }, g);
        if (left > 0) { const fl = 1 + Math.sin(tnow / 90) * .08; S('path', { d: `M${cx} ${top - 18 - 70 * fl} Q${cx + 26} ${top - 40} ${cx} ${top - 14} Q${cx - 26} ${top - 40} ${cx} ${top - 18 - 70 * fl} Z`, fill: 'var(--orange)', stroke: 'var(--red)', 'stroke-width': 2 }, g); S('path', { d: `M${cx} ${top - 30 - 30 * fl} Q${cx + 10} ${top - 30} ${cx} ${top - 18} Q${cx - 10} ${top - 30} ${cx} ${top - 30 - 30 * fl} Z`, fill: 'var(--yellow)' }, g); }
        else S('path', { d: `M${cx} ${top - 20} q20 -30 0 -60 q-20 -30 0 -60`, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 4, opacity: .6 }, g);
        bigTime(740, 290, s, left); return;
      }
      if (tStyle === 'battery') {
        const x = 90, y = 190, w = 520, h = 220, n = 10, on = Math.ceil(f * n - 1e-9);
        S('rect', { x, y, width: w, height: h, rx: 26, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 8 }, g);
        S('rect', { x: x + w, y: y + h / 2 - 40, width: 30, height: 80, rx: 8, fill: 'var(--ink)' }, g);
        const sw = (w - 40) / n; for (let k = 0; k < n; k++) S('rect', { x: x + 20 + k * sw + 3, y: y + 20, width: sw - 6, height: h - 40, rx: 6, fill: k < on ? lvlCol(f) : 'var(--line)', opacity: k === on - 1 && run ? .75 + .25 * Math.sin(tnow / 200) : 1 }, g);
        text(g, x + w / 2, y + h + 40, `${Math.round(f * 100)}% left`, { 'font-size': 24, 'font-weight': 800, fill: lvlCol(f), cls: 'num' });
        bigTime(810, 290, s, left, 84); return;
      }
      if (tStyle === 'pizza') {
        const cx = 320, cy = 300, R = 220, n = 8;
        S('circle', { cx, cy, r: R + 6, fill: 'var(--board-2)', stroke: 'var(--line-2)', 'stroke-width': 3 }, g);
        if (f > 0) {
          const a0 = -Math.PI / 2, a1 = a0 + f * 2 * Math.PI, p = a => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
          const [x1, y1] = p(a0), [x2, y2] = p(a1);
          const d = f >= .9999 ? `M${cx - R} ${cy} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0` : `M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${f > .5 ? 1 : 0} 1 ${x2} ${y2} Z`;
          S('path', { d, fill: '#E9A84B', stroke: '#B9773F', 'stroke-width': 10 }, g);
          const cp = S('clipPath', { id: 'pizzaclip' }, g); S('path', { d }, cp);
          const tg = S('g', { 'clip-path': 'url(#pizzaclip)' }, g);
          S('circle', { cx, cy, r: R - 22, fill: '#F2C94C' }, tg);
          [[.2, .3], [.55, -.2], [-.4, .4], [-.3, -.5], [.1, -.6], [.6, .5], [-.65, -.05], [.25, .75], [-.1, .1], [.7, .05]].forEach(([u, v]) => S('circle', { cx: cx + u * R * .8, cy: cy + v * R * .8, r: 20, fill: '#C0392B' }, tg));
          for (let k = 0; k < n; k++) { const a = a0 + k * 2 * Math.PI / n; if (k / n < f) S('line', { x1: cx, y1: cy, x2: cx + R * Math.cos(a), y2: cy + R * Math.sin(a), stroke: '#B9773F', 'stroke-width': 3 }, tg); }
        }
        bigTime(770, 290, s, left); return;
      }
    }
    function drawWatch(t) {
      if (wStyle === 'digital') {
        S('rect', { x: 90, y: 140, width: 820, height: 260, rx: 40, fill: 'var(--lcd)' }, g);
        text(g, 500, 272, fmt(t), { 'font-size': 150, 'font-weight': 800, cls: 'disp num', fill: 'var(--lcd-ink)' });
        laps.slice(-4).forEach((l, i, arr) => text(g, 150 + i * 230, 470, `Lap ${laps.length - arr.length + i + 1}: ${fmt(l)}`, { 'font-size': 22, cls: 'num', 'font-weight': 700 }));
        return;
      }
      if (wStyle === 'track') {
        const cx = 360, cy = 300, a = 250, b = 150, sec = t / 1000, ang = (sec % 60) / 60 * 2 * Math.PI - Math.PI / 2;
        S('ellipse', { cx, cy, rx: a + 30, ry: b + 30, fill: '#C0563A' }, g); S('ellipse', { cx, cy, rx: a - 30, ry: b - 30, fill: 'var(--green)' }, g);
        for (let k = 0; k < 4; k++) S('ellipse', { cx, cy, rx: a - 30 + k * 20, ry: b - 30 + k * 20, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: .6 }, g);
        S('line', { x1: cx, y1: cy - b - 30, x2: cx, y2: cy - b + 30, stroke: '#fff', 'stroke-width': 5 }, g);
        const rx = cx + a * Math.cos(ang), ry = cy + b * Math.sin(ang);
        S('circle', { cx: rx, cy: ry, r: 18, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 3 }, g); text(g, rx, ry + 1, '🏃', { 'font-size': 18 });
        text(g, cx, cy - 10, fmt(t), { 'font-size': 52, 'font-weight': 800, cls: 'disp num', fill: '#fff' });
        text(g, cx, cy + 40, `${Math.floor(sec / 60)} lap${Math.floor(sec / 60) === 1 ? '' : 's'} (one lap = 1 minute)`, { 'font-size': 18, fill: '#fff', 'font-weight': 700 });
      } else {
        const cx = 360, cy = 300, R = 230, ang = (t / 1000 % 60) / 60 * 2 * Math.PI - Math.PI / 2;
        S('circle', { cx, cy, r: R, fill: 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 6 }, g); S('rect', { x: cx - 30, y: cy - R - 50, width: 60, height: 36, rx: 8, fill: 'var(--ink)' }, g);
        for (let k = 0; k < 60; k++) { const aa = k * Math.PI / 30 - Math.PI / 2, bb = k % 5 === 0; S('line', { x1: cx + (R - 12) * Math.cos(aa), y1: cy + (R - 12) * Math.sin(aa), x2: cx + (R - (bb ? 34 : 22)) * Math.cos(aa), y2: cy + (R - (bb ? 34 : 22)) * Math.sin(aa), stroke: 'var(--ink)', 'stroke-width': bb ? 3 : 1.2 }, g); if (bb) text(g, cx + (R - 58) * Math.cos(aa), cy + (R - 58) * Math.sin(aa), String(k), { 'font-size': 18, 'font-weight': 700, cls: 'num' }); }
        S('line', { x1: cx, y1: cy, x2: cx + (R - 40) * Math.cos(ang), y2: cy + (R - 40) * Math.sin(ang), stroke: 'var(--red)', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
        S('circle', { cx, cy, r: 10, fill: 'var(--red)' }, g);
        text(g, cx, cy + 90, fmt(t), { 'font-size': 46, 'font-weight': 800, cls: 'disp num' });
      }
      text(g, 820, 70, 'Laps', { 'font-size': 22, 'font-weight': 700, fill: 'var(--ink-2)' });
      laps.slice(-10).forEach((l, i, arr) => text(g, 820, 110 + i * 40, `${laps.length - arr.length + i + 1}.  ${fmt(l)}`, { 'font-size': 24, cls: 'num' }));
    }
    function draw() {
      clear(g);
      if (mode === 'watch') drawWatch(now());
      else {
        const left = Math.max(0, tset * 1000 - now()), f = left / (tset * 1000 || 1);
        if (left === 0 && run && !done) { done = true; run = false; acc = tset * 1000; ring(); sb.textContent = 'Start'; }
        drawTimer(f, left);
      }
    }
    c.raf(() => { if (run || (mode === 'timer' && tStyle === 'candle')) draw(); });
    const startBtn = () => { audio(); if (run) { acc = now(); run = false; } else { if (mode === 'timer' && acc >= tset * 1000) { acc = 0; done = false; } t0 = performance.now(); run = true; } sb.textContent = run ? 'Pause' : 'Start'; draw(); };
    P.section('Mode');
    P.seg({ options: [['watch', 'Stopwatch'], ['timer', 'Timer']], value: mode, onChange: v => { mode = v; run = false; acc = 0; laps = []; done = false; sb.textContent = 'Start'; draw(); } });
    P.section('Controls');
    const sb = P.button('Start', startBtn, 'primary');
    P.buttons([['Lap', () => { if (mode === 'watch' && run) { laps.push(now()); draw(); } }], ['Reset', () => { run = false; acc = 0; laps = []; done = false; sb.textContent = 'Start'; draw(); }]]);
    P.section('Look');
    const stW = P.seg({ label: 'Stopwatch style', options: [['dial', 'Dial'], ['digital', 'Big digits'], ['track', 'Running track']], value: wStyle, onChange: v => { wStyle = v; store.set('watchStyle', v); draw(); } });
    const stT = P.seg({ label: 'Timer style', options: [['ring', 'Ring'], ['bar', 'Bar'], ['tube', 'Tube'], ['sand', 'Sand timer'], ['candle', 'Candle'], ['battery', 'Battery'], ['pizza', 'Pizza']], value: tStyle, onChange: v => { tStyle = v; store.set('timerStyle', v); draw(); } });
    P.section('When time is up');
    P.seg({ options: [['bell', 'Bell'], ['buzzer', 'Buzzer'], ['beeps', 'Beeps'], ['off', 'No sound']], value: sound, onChange: v => { sound = v; store.set('timerSound', v); ring(v); } });
    P.button('Test the sound', () => ring());
    P.section('Timer length');
    P.stepper({ label: 'Minutes', value: 2, min: 0, max: 60, onChange: v => { tset = v * 60 + tset % 60; acc = 0; done = false; draw(); } });
    P.stepper({ label: 'Seconds', value: 0, min: 0, max: 55, step: 5, onChange: v => { tset = Math.floor(tset / 60) * 60 + v; acc = 0; done = false; draw(); } });
    draw();
  }
});

tool({
  id: 'money', name: 'Money', strand: 'meas', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Drag coins and notes onto the mat to count, make amounts and give change, with counting up on a number line. Pounds, euros or US dollars.',
  tags: 'money coins notes pounds pence change shop count amounts sterling euros cents dollars currency',
  icon: '<circle cx="18" cy="26" r="12"/><circle cx="18" cy="26" r="7"/><rect x="24" y="10" width="20" height="13" rx="2"/>',
  guide: ['Drag coins and notes up from the tray onto the mat. Drag them back to the tray to remove them.', 'Free play shows the total. Sort the money lines everything up from biggest to smallest so it is easy to count.', 'Make an amount: make the amount shown, then tap Check. It tells you if you used the fewest coins and notes possible.', 'Give change: something costs a price and you pay with a note or coin. Put the change on the mat and tap Check. Show counting up draws the shopkeeper’s method on a number line.'],
  mount(c) {
    const { svg, P } = c;
    const CURS = {
      gbp: { sym: '£', sub: 'p', denoms: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000], noteMin: 500, mm: { 1: 20.3, 2: 25.9, 5: 18, 10: 24.5, 20: 21.4, 50: 27.3, 100: 23.4, 200: 28.4 }, note: { 500: '#2FA59A', 1000: '#D9772B', 2000: '#7E57C2', 5000: '#D9434F' } },
      eur: { sym: '€', sub: 'c', denoms: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000], noteMin: 500, mm: { 1: 16.25, 2: 18.75, 5: 21.25, 10: 19.75, 20: 22.25, 50: 24.25, 100: 23.25, 200: 25.75 }, note: { 500: '#8C9298', 1000: '#C8464E', 2000: '#3D6FB6', 5000: '#E08A2E' } },
      usd: { sym: '$', sub: '¢', denoms: [1, 5, 10, 25, 100, 500, 1000, 2000], noteMin: 100, mm: { 1: 19.05, 5: 21.21, 10: 17.91, 25: 24.26 }, note: { 100: '#5E8C61', 500: '#6E8F6A', 1000: '#7A9A62', 2000: '#4F7D57' } }
    };
    let items = [], uid = 0, mode = 'free', notes = true, showTotal = true, task = null, upOn = false, range = 500, checked = null, cur = 'gbp';
    c.persist(() => ({ items, uid, mode, notes, showTotal, task, upOn, range, cur }), s => ({ items, uid, mode, notes, showTotal, task, upOn, range, cur } = Object.assign({ items, uid, mode, notes, showTotal, task, upOn, range, cur }, s)));
    const C = () => CURS[cur] || CURS.gbp, isNote = v => v >= C().noteMin;
    const bgG = S('g', {}, svg), tg = S('g', {}, svg), mg = S('g', {}, svg), og = S('g', {}, svg), trayG = S('g', {}, svg), dragG = S('g', {}, svg);
    const MAT = { x: 20, y: 165, w: 1060, h: 355 }, TRAY_Y = 548;
    const fmt = p => p >= 100 ? C().sym + (p / 100).toFixed(2).replace(/\.00$/, '') : p + C().sub;
    const fmt2 = p => p >= 100 ? C().sym + (p / 100).toFixed(2) : p + C().sub;
    const total = () => items.reduce((s, i) => s + i.v, 0);
    const fewest = n => { let k = 0; for (const v of [...C().denoms].reverse()) { if (!notes && isNote(v)) continue; k += Math.floor(n / v); n %= v; } return k; };
    function poly(n, r, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; p.push((r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
    function money(g, v, x, y, sc = 1) {
      const grp = S('g', { transform: `translate(${x},${y}) scale(${sc})` }, g);
      if (isNote(v)) {
        const w = 150, h = 80, c1 = C().note[v];
        S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: c1, stroke: 'var(--ink)', 'stroke-width': 2 }, grp);
        S('rect', { x: -w / 2 + 6, y: -h / 2 + 6, width: w - 12, height: h - 12, rx: 5, fill: 'none', stroke: '#fff', 'stroke-opacity': .5, 'stroke-width': 1.5 }, grp);
        S('circle', { cx: w / 2 - 34, cy: 0, r: 22, fill: '#fff', opacity: .25 }, grp);
        text(grp, -w / 2 + 44, 2, C().sym + v / 100, { 'font-size': 34, 'font-weight': 800, fill: '#fff', cls: 'disp num' });
        text(grp, w / 2 - 34, 1, C().sym + v / 100, { 'font-size': 14, 'font-weight': 800, fill: '#fff', cls: 'num' });
        return grp;
      }
      const r = C().mm[v] * 1.15 * (cur === 'gbp' ? 1 : 1.08), copper = cur === 'usd' ? v === 1 : v <= (cur === 'eur' ? 5 : 2), gold = v >= 100;
      const face = copper ? '#C77B45' : '#C5CCD6', edge = copper ? '#8A4B22' : '#7C8592';
      if (cur === 'eur') {
        const GOLD = '#D9B54A', GE = '#94721A', SIL = '#D3D8DF', SE = '#7C8592';
        if (v === 100) { S('circle', { r, fill: SIL, stroke: SE, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .68, fill: GOLD, stroke: GE, 'stroke-width': 1.5 }, grp); }
        else if (v === 200) { S('circle', { r, fill: GOLD, stroke: GE, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .7, fill: SIL, stroke: SE, 'stroke-width': 1.5 }, grp); }
        else if (v >= 10) { S('circle', { r, fill: GOLD, stroke: GE, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .8, fill: 'none', stroke: GE, 'stroke-width': 1, opacity: .6 }, grp); }
        else { S('circle', { r, fill: face, stroke: edge, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .8, fill: 'none', stroke: edge, 'stroke-width': 1, opacity: .6 }, grp); }
      }
      else if (cur === 'usd') { S('circle', { r, fill: face, stroke: edge, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .82, fill: 'none', stroke: edge, 'stroke-width': 1, opacity: .6, 'stroke-dasharray': v === 1 ? 'none' : '2 2' }, grp); }
      else if (v === 20 || v === 50) { S('polygon', { points: poly(7, r, -Math.PI / 2), fill: face, stroke: edge, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, grp); S('polygon', { points: poly(7, r * .8, -Math.PI / 2), fill: 'none', stroke: edge, 'stroke-width': 1, opacity: .6 }, grp); }
      else if (v === 100) { S('polygon', { points: poly(12, r, 0), fill: '#E2B73F', stroke: '#9A7416', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, grp); S('circle', { r: r * .62, fill: '#D3D8DF', stroke: '#9A7416', 'stroke-width': 1.5 }, grp); }
      else if (v === 200) { S('circle', { r, fill: '#E2B73F', stroke: '#9A7416', 'stroke-width': 2.5 }, grp); S('circle', { r: r * .68, fill: '#D3D8DF', stroke: '#9A7416', 'stroke-width': 1.5 }, grp); }
      else { S('circle', { r, fill: face, stroke: edge, 'stroke-width': 2.5 }, grp); S('circle', { r: r * .8, fill: 'none', stroke: edge, 'stroke-width': 1, opacity: .6 }, grp); }
      S('ellipse', { cx: -r * .3, cy: -r * .42, rx: r * .35, ry: r * .16, fill: '#fff', opacity: .35 }, grp);
      text(grp, 0, 1, fmt(v), { 'font-size': r * (fmt(v).length > 2 ? .62 : .78), 'font-weight': 800, fill: copper ? '#4A220A' : '#2B2F36', cls: 'disp num' });
      return grp;
    }
    const inMat = p => p.x > MAT.x && p.x < MAT.x + MAT.w && p.y > MAT.y && p.y < MAT.y + MAT.h;
    function drawTray() {
      clear(trayG);
      S('rect', { x: 14, y: TRAY_Y - 18, width: 1072, height: 140, rx: 18, fill: 'var(--board-2)', stroke: 'var(--line)' }, trayG);
      const list = C().denoms.filter(v => notes || !isNote(v)); let x = 24;
      list.forEach(v => {
        const w = isNote(v) ? 108 : 62, sc = isNote(v) ? .7 : .9, src = S('g', { cls: 'grab' }, trayG);
        money(src, v, x + w / 2, TRAY_Y + 52, sc); x += w + (isNote(v) ? 6 : 2);
        let gh = null;
        c.drag(src, { start: () => { gh = S('g', {}, dragG); checked = null; }, move: p => { clear(gh); money(gh, v, p.x, p.y); }, end: p => { gh.remove(); if (inMat(p)) { items.push({ id: ++uid, v, x: clamp(p.x, MAT.x + 40, MAT.x + MAT.w - 40), y: clamp(p.y, MAT.y + 40, MAT.y + MAT.h - 40) }); draw(); } } });
      });
      text(trayG, 60, TRAY_Y - 2, 'Drag money up onto the mat. Drag it back here to remove it.', { 'font-size': 13, fill: 'var(--ink-3)', 'text-anchor': 'start' });
    }
    function sortItems() {
      const sorted = items.slice().sort((a, b) => b.v - a.v); let x = MAT.x + 30, y = MAT.y + 60, rowH = 0, lastV = null;
      sorted.forEach(it => { const w = isNote(it.v) ? 160 : C().mm[it.v] * 2.5 + 8, h = isNote(it.v) ? 90 : C().mm[it.v] * 2.5 + 8; if (lastV != null && it.v !== lastV) x += 18; if (x + w > MAT.x + MAT.w - 20) { x = MAT.x + 30; y += rowH + 10; rowH = 0; } it.x = x + w / 2; it.y = y + h / 2 - 30; x += w; rowH = Math.max(rowH, h); lastV = it.v; });
      draw();
    }
    function newTask() {
      checked = null; items = [];
      if (mode === 'make') { let v; do v = range <= 100 ? rnd(5, 99) : range <= 500 ? rnd(105, 499) : rnd(120, 1999); while (v % 100 === 0); if (range > 100) v = Math.round(v / 5) * 5 || 105; task = { kind: 'make', v }; }
      else if (mode === 'change') { let paid = range <= 100 ? 100 : range <= 500 ? [200, 500][rnd(0, 1)] : [1000, 2000][rnd(0, 1)]; if (!C().denoms.includes(paid)) paid = 500; let price; do price = rnd(Math.max(5, Math.round(paid * .15)), paid - 1); while (price % 100 === 0); price = Math.round(price / (range <= 100 ? 1 : 5)) * (range <= 100 ? 1 : 5); if (price >= paid) price = paid - 15; const things = ['a comic', 'a pencil case', 'a football', 'a sandwich', 'a toy car', 'a book', 'some stickers', 'a drink']; task = { kind: 'change', price, paid, thing: things[rnd(0, things.length - 1)] }; }
      else task = null;
      draw();
    }
    function check() {
      const t = total();
      if (!task) return;
      const want = task.kind === 'make' ? task.v : task.paid - task.price;
      if (t === want) { const f = fewest(want); checked = { ok: true, msg: items.length === f ? `Well done! ${fmt2(want)}, using the fewest possible (${f}).` : `Well done! That is ${fmt2(want)}. You used ${items.length}; it can be done with ${f}.` }; }
      else checked = { ok: false, msg: t < want ? `Not yet: you have ${fmt2(t)}. You need ${fmt2(want - t)} more.` : `Too much: you have ${fmt2(t)}. That is ${fmt2(t - want)} too much.` };
      draw();
    }
    function countingUp(y) {
      const { price, paid } = task, stops = [price]; let cur = price;
      if (cur % 10) { cur = Math.ceil(cur / 10) * 10; stops.push(cur); }
      if (cur % 100 && cur < paid) { cur = Math.min(Math.ceil(cur / 100) * 100, paid); stops.push(cur); }
      if (cur < paid) stops.push(paid);
      const x0 = 120, x1 = 980, X = v => x0 + (v - price) / (paid - price) * (x1 - x0);
      S('line', { x1: x0 - 20, y1: y, x2: x1 + 20, y2: y, stroke: 'var(--ink)', 'stroke-width': 3 }, tg);
      stops.forEach((v, i) => { S('line', { x1: X(v), y1: y - 9, x2: X(v), y2: y + 9, stroke: 'var(--ink)', 'stroke-width': 3 }, tg); text(tg, X(v), y + 24, fmt2(v), { 'font-size': 16, 'font-weight': 700, cls: 'num' }); if (i) { const a = stops[i - 1], m = (X(a) + X(v)) / 2, ah = Math.min(90, 34 + (X(v) - X(a)) * .12); S('path', { d: `M${X(a)} ${y - 6} Q${m} ${y - ah} ${X(v)} ${y - 6}`, fill: 'none', stroke: 'var(--green)', 'stroke-width': 3 }, tg); text(tg, m, y - ah / 2 - 14, '+' + fmt2(v - a), { 'font-size': 17, 'font-weight': 800, fill: 'var(--green)', cls: 'num' }); } });
      text(tg, 1040, y - 30, `= ${fmt2(paid - price)}`, { 'font-size': 20, 'font-weight': 800, cls: 'num', fill: 'var(--green)' });
    }
    function draw() {
      clear(bgG); clear(tg); clear(mg); clear(og);
      S('rect', { x: MAT.x, y: MAT.y, width: MAT.w, height: MAT.h, rx: 22, fill: 'var(--green-s)', stroke: 'var(--green)', 'stroke-width': 2, opacity: .7 }, bgG);
      // task header
      if (task && task.kind === 'make') { text(tg, 550, 52, `Make ${fmt2(task.v)}`, { 'font-size': 44, 'font-weight': 800, cls: 'disp num' }); }
      if (task && task.kind === 'change') {
        text(tg, 550, 40, `${task.thing[0].toUpperCase() + task.thing.slice(1)} costs ${fmt2(task.price)}. You pay with ${fmt2(task.paid)}.`, { 'font-size': 28, 'font-weight': 800, cls: 'disp num' });
        if (!upOn) text(tg, 550, 84, 'Put the change on the mat.', { 'font-size': 20, fill: 'var(--ink-2)' });
        else countingUp(122);
      }
      if (!task) text(tg, 550, 60, items.length ? '' : 'Drag coins and notes onto the mat', { 'font-size': 26, 'font-weight': 700, fill: 'var(--ink-3)' });
      items.forEach(it => {
        const el = money(mg, it.v, it.x, it.y); el.classList.add('grab');
        let sx, sy;
        c.drag(el, { start: p => { sx = p.x; sy = p.y; mg.append(el); checked = null; }, move: p => el.setAttribute('transform', `translate(${it.x + p.x - sx},${it.y + p.y - sy})`), end: p => { const nx = it.x + p.x - sx, ny = it.y + p.y - sy; if (ny > TRAY_Y - 20) items.splice(items.indexOf(it), 1); else { it.x = clamp(nx, MAT.x + 30, MAT.x + MAT.w - 30); it.y = clamp(ny, MAT.y + 30, MAT.y + MAT.h - 30); } draw(); } });
      });
      if (showTotal && items.length && (!task || checked)) { S('rect', { x: MAT.x + MAT.w - 200, y: MAT.y + 12, width: 186, height: 60, rx: 14, fill: 'var(--board)', stroke: 'var(--line-2)' }, og); text(og, MAT.x + MAT.w - 107, MAT.y + 43, fmt2(total()), { 'font-size': 34, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' }); }
      if (checked) { const w = Math.min(900, checked.msg.length * 12 + 60); S('rect', { x: 550 - w / 2, y: MAT.y + MAT.h - 64, width: w, height: 48, rx: 16, fill: checked.ok ? 'var(--green)' : 'var(--orange)' }, og); text(og, 550, MAT.y + MAT.h - 39, checked.msg, { 'font-size': 20, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
    }
    const dk = () => [...svg.closest('.work').querySelector('.dock').children];
    P.section('Currency');
    P.seg({ options: [['gbp', '£ Pounds'], ['eur', '€ Euros'], ['usd', '$ US dollars']], value: cur, onChange: v => { cur = v; items = []; checked = null; drawTray(); newTask(); } });
    P.section('Activity');
    P.seg({ options: [['free', 'Free play'], ['make', 'Make an amount'], ['change', 'Give change']], value: mode, onChange: v => { mode = v; taskBits.forEach(e => e.hidden = v === 'free'); chBits.forEach(e => e.hidden = v !== 'change'); upOn = false; upT.set(false, true); newTask(); } });
    let before = new Set(dk());
    const amtSeg = P.seg({ label: 'Amounts up to', options: [[100, 'up to 1'], [500, 'up to 5'], [2000, 'up to 20']], value: range, onChange: v => { range = v; newTask(); } });
    P.buttons([['Check', check, 'primary'], ['New question', newTask]]);
    const taskBits = dk().filter(k => !before.has(k)); before = new Set(dk());
    const upT = P.toggle({ label: 'Show counting up', value: upOn, onChange: v => { upOn = v; draw(); } });
    const chBits = dk().filter(k => !before.has(k));
    P.section('Mat');
    P.buttons([['Sort the money', sortItems], ['Clear the mat', () => { items = []; checked = null; draw(); }]]);
    P.section('Show');
    P.toggle({ label: 'Total (after Check in activities)', value: showTotal, onChange: v => { showTotal = v; draw(); } });
    P.toggle({ label: 'Notes in the tray', value: notes, onChange: v => { notes = v; drawTray(); } });
    taskBits.forEach(e => e.hidden = mode === 'free'); chBits.forEach(e => e.hidden = mode !== 'change');
    drawTray(); draw();
  }
});

tool({
  id: 'conversions', name: 'Converting units', strand: 'meas', years: [3, 4, 5, 6], w: 1100, h: 680,
  desc: 'See how to convert length, mass, capacity and money on a double number line and a place value chart, then solve conversion problems with the working shown.',
  tags: 'convert conversion units length mass weight capacity volume mm cm m km g kg ml l litres money pounds pence euros dollars exchange rate place value multiply divide 10 100 1000',
  icon: '<path d="M6 16h30M30 10l6 6-6 6"/><path d="M42 32H12M18 26l-6 6 6 6"/>',
  guide: ['Choose length, mass, capacity or money, then the units to convert from and to. Type a value or tap Random.', 'The double number line shows the two units side by side. The place value chart shows every digit moving places: × 10 is one place, × 100 two places and × 1000 three places. Zeros fill the empty places.', 'Money includes pence and pounds, and euros and US dollars with an exchange rate you can change.', 'Problems: choose a level and tap New problem. Use Next step to reveal the working one line at a time, and Show answer at the end.'],
  mount(c) {
    const { svg, P } = c;
    const Q = { length: { name: 'Length', u: { mm: 1, cm: 10, m: 1000, km: 1e6 }, long: { mm: 'millimetres', cm: 'centimetres', m: 'metres', km: 'kilometres' } }, mass: { name: 'Mass', u: { g: 1, kg: 1000 }, long: { g: 'grams', kg: 'kilograms' } }, capacity: { name: 'Capacity', u: { ml: 1, l: 1000 }, long: { ml: 'millilitres', l: 'litres' } }, money: { name: 'Money', u: { p: 1, '£': 100, '€': null, '$': null }, long: { p: 'pence', '£': 'pounds', '€': 'euros', '$': 'US dollars' } } };
    let q = 'mass', from = 'kg', to = 'g', val = null, rangeM = 10, rE = 1.2, rU = 1.3, mode = 'explore', level = 'easy', prob = null, step = 0, shown = false;
    c.persist(() => ({ q, from, to, val, rangeM, rE, rU, mode, level, prob, step, shown }), s => ({ q, from, to, val, rangeM, rE, rU, mode, level, prob, step, shown } = Object.assign({ q, from, to, val, rangeM, rE, rU, mode, level, prob, step, shown }, s)));
    const g = S('g', {}, svg);
    // ---------- maths ----------
    const pennies = (u, v) => u === '£' ? v * 100 : u === 'p' ? v : u === '€' ? v / rE * 100 : v / rU * 100;
    const fromPennies = (u, p) => u === '£' ? p / 100 : u === 'p' ? p : u === '€' ? p / 100 * rE : p / 100 * rU;
    function factor(qq, a, b) { if (qq === 'money') return null; return Q[qq].u[a] / Q[qq].u[b]; }
    function convert(qq, a, b, v) { if (qq === 'money') return fromPennies(b, pennies(a, v)); return v * factor(qq, a, b); }
    const clean = v => +(+v).toFixed(6);
    function fmt(v, u) { v = clean(v); const money = u === '£' || u === '€' || u === '$'; let s = money ? v.toFixed(2) : String(v); let [a, b] = s.split('.'); a = a.replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = a + (b ? '.' + b : ''); return money ? u + s : u === 'p' ? s + 'p' : s + ' ' + u; }
    const isPow10 = f => f && [10, 100, 1000, 1e4, 1e5, 1e6].includes(Math.round(f > 1 ? f : 1 / f)) && Math.abs((f > 1 ? f : 1 / f) - Math.round(f > 1 ? f : 1 / f)) < 1e-9;
    // ---------- explore drawing ----------
    function ruleText(a, b) {
      if (q === 'money' && (a === '€' || a === '$' || b === '€' || b === '$')) return a === '£' ? `£1 = ${b}${(b === '€' ? rE : rU).toFixed(2)}, so £ to ${b} is × ${(b === '€' ? rE : rU).toFixed(2)}` : b === '£' ? `£1 = ${a}${(a === '€' ? rE : rU).toFixed(2)}, so ${a} to £ is ÷ ${(a === '€' ? rE : rU).toFixed(2)}` : `£1 = €${rE.toFixed(2)} = $${rU.toFixed(2)}. Change to £ first.`;
      const f = factor(q, a, b) || pennies(a, 1) / pennies(b, 1), big = f > 1 ? a : b, small = f > 1 ? b : a, k = Math.round(f > 1 ? f : 1 / f).toLocaleString('en-GB');
      return `1 ${big} = ${k} ${small}, so ${a} to ${b} is ${f > 1 ? '×' : '÷'} ${k}`;
    }
    function header(a, b, v) {
      if (v == null) { text(g, 40, 50, `Type a number of ${Q[q].long[a]}, or drag the blue dot`, { 'font-size': 30, 'font-weight': 800, cls: 'disp', 'text-anchor': 'start', fill: 'var(--ink-3)' }); text(g, 40, 92, ruleText(a, b), { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'start', fill: 'var(--accent)', cls: 'num' }); return null; }
      const r = convert(q, a, b, v), eq = `${fmt(v, a)} = ${fmt(r, b)}`;
      text(g, 40, 50, eq, { 'font-size': eq.length > 26 ? 36 : 46, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'start' });
      text(g, 40, 92, ruleText(a, b), { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'start', fill: 'var(--accent)', cls: 'num' });
      return r;
    }
    function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v * 1.05) return m * p; return 10 * p; }
    function numberLine(a, b, v, y, fixedM, onDrag) {
      const x0 = 70, x1 = 1030, M = fixedM || niceMax(v), X = t => x0 + t / M * (x1 - x0);
      S('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      S('line', { x1: x0, y1: y + 70, x2: x1, y2: y + 70, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      text(g, 30, y, a, { 'font-size': 20, 'font-weight': 800, fill: 'var(--blue)' }); text(g, 30, y + 70, b, { 'font-size': 20, 'font-weight': 800, fill: 'var(--orange)' });
      for (let i = 0; i <= 10; i++) { const t = M * i / 10, x = X(t); S('line', { x1: x, y1: y - 8, x2: x, y2: y + 8, stroke: 'var(--ink)', 'stroke-width': 2 }, g); S('line', { x1: x, y1: y + 62, x2: x, y2: y + 78, stroke: 'var(--ink)', 'stroke-width': 2 }, g); if (i % 2 === 0 || M < 100) { text(g, x, y - 22, fmt(t, a).replace(' ' + a, ''), { 'font-size': 14, cls: 'num', fill: 'var(--blue)' }); text(g, x, y + 96, fmt(convert(q, a, b, t), b).replace(' ' + b, ''), { 'font-size': 14, cls: 'num', fill: 'var(--orange)' }); } }
      if (v != null) { const xv = X(v); S('line', { x1: xv, y1: y - 4, x2: xv, y2: y + 74, stroke: 'var(--accent)', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g); S('circle', { cx: xv, cy: y + 70, r: 9, fill: 'var(--orange)', stroke: 'var(--board)', 'stroke-width': 3 }, g); }
      const hx = X(v == null ? 0 : Math.min(v, M)), h = S('g', { cls: onDrag ? 'grab' : '' }, g);
      if (onDrag) S('circle', { cx: hx, cy: y, r: 24, fill: 'transparent' }, h);
      S('circle', { cx: hx, cy: y, r: onDrag ? 13 : 9, fill: 'var(--blue)', stroke: 'var(--board)', 'stroke-width': 3, opacity: v == null ? .55 : 1 }, h);
      if (onDrag && v != null) S('rect', { x: hx - 3, y: y - 4, width: 6, height: 8, rx: 2, fill: '#fff', 'pointer-events': 'none' }, h);
      if (onDrag) { const raw = M / 100, p = Math.pow(10, Math.floor(Math.log10(raw))), stp = [1, 2, 5, 10].map(k => k * p).find(k => k >= raw * .99); c.drag(h, { move: m => { const t = clamp(Math.round(((m.x - x0) / (x1 - x0) * M) / stp) * stp, 0, M); onDrag(clean(t)); } }); }
    }
    function pvChart(a, b, v, r, y, blank) {
      const f = q === 'money' ? (isPow10(pennies(a, 1) / pennies(b, 1)) ? pennies(a, 1) / pennies(b, 1) : null) : factor(q, a, b);
      if (!f || !isPow10(f)) { ratioTable(a, b, v, y); return; }
      const COLS = ['M', 'HTh', 'TTh', 'Th', 'H', 'T', 'O', 't', 'h', 'th'], PL = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3], cw = 82, x0 = 550 - cw * 5;
      const digits = n => { const st = clean(n).toFixed(3).replace(/\.?0+$/, ''), [ip, dp = ''] = st.split('.'), out = {}; [...ip].reverse().forEach((d, i) => out[i] = d); [...dp].forEach((d, i) => out[-(i + 1)] = d); return out; };
      const dA = blank ? {} : digits(v), dB = blank ? {} : digits(r), shift = Math.round(Math.log10(f));
      if (Object.keys(dB).some(p => +p > 6) || Object.keys(dA).some(p => +p < -3) || Object.keys(dB).some(p => +p < -3)) { text(g, 550, y + 80, 'This conversion needs more place value columns than fit here.', { 'font-size': 18, fill: 'var(--ink-3)' }); return; }
      COLS.forEach((cl, i) => { const x = x0 + i * cw; S('rect', { x, y, width: cw - 4, height: 36, rx: 8, fill: i < 4 ? 'var(--purple)' : i < 7 ? 'var(--blue)' : 'var(--green)', opacity: .85 }, g); text(g, x + cw / 2 - 2, y + 19, cl, { 'font-size': 16, 'font-weight': 800, fill: '#fff' }); S('rect', { x, y: y + 42, width: cw - 4, height: 66, rx: 8, fill: 'var(--board-2)', stroke: 'var(--line)' }, g); S('rect', { x, y: y + 160, width: cw - 4, height: 66, rx: 8, fill: 'var(--board-2)', stroke: 'var(--line)' }, g); });
      const dotX = x0 + 7 * cw - 4; [y + 75, y + 193].forEach(yy => S('circle', { cx: dotX, cy: yy + 18, r: 6, fill: 'var(--ink)' }, g));
      const colX = p => x0 + PL.indexOf(p) * cw + cw / 2 - 2;
      Object.entries(dA).forEach(([p, d]) => { p = +p; text(g, colX(p), y + 76, d, { 'font-size': 40, 'font-weight': 800, cls: 'disp num', fill: 'var(--blue)' }); const np = p + shift; if (PL.includes(np) && dB[np] !== undefined) S('line', { x1: colX(p), y1: y + 112, x2: colX(np), y2: y + 156, stroke: 'var(--ink-3)', 'stroke-width': 2.5, 'marker-end': 'url(#cvarr)' }, g); });
      Object.entries(dB).forEach(([p, d]) => { p = +p; const moved = dA[p - shift] !== undefined; text(g, colX(p), y + 194, d, { 'font-size': 40, 'font-weight': 800, cls: 'disp num', fill: moved ? 'var(--orange)' : 'var(--ink-3)' }); });
      text(g, x0 - 16, y + 76, a, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: 'var(--blue)' }); text(g, x0 - 16, y + 194, b, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: 'var(--orange)' });
      const k = Math.round(f > 1 ? f : 1 / f);
      if (!blank) text(g, 550, y + 134, `${f > 1 ? '×' : '÷'} ${k.toLocaleString('en-GB')}: every digit moves ${Math.abs(shift)} place${Math.abs(shift) > 1 ? 's' : ''} ${f > 1 ? 'left' : 'right'}`, { 'font-size': 18, 'font-weight': 800, fill: 'var(--accent)', stroke: 'var(--board)', 'stroke-width': 5, 'paint-order': 'stroke' });
    }
    function ratioTable(a, b, v, y) {
      const rows = [1, 2, 5, 10, v].filter((x, i, arr) => arr.indexOf(x) === i).sort((m, n) => m - n), x0 = 250, cw = Math.min(130, 600 / rows.length);
      text(g, 550, y + 6, 'Ratio table: multiply both rows by the same number', { 'font-size': 17, 'font-weight': 800, fill: 'var(--ink-2)' });
      rows.forEach((t, i) => { const x = x0 + i * cw, hl = Math.abs(t - v) < 1e-9; S('rect', { x, y: y + 30, width: cw - 6, height: 60, rx: 10, fill: hl ? 'var(--blue)' : 'var(--board-2)', stroke: 'var(--line)' }, g); text(g, x + cw / 2 - 3, y + 61, fmt(t, a), { 'font-size': 18, 'font-weight': 800, cls: 'num', fill: hl ? '#fff' : 'var(--ink)' }); S('rect', { x, y: y + 110, width: cw - 6, height: 60, rx: 10, fill: hl ? 'var(--orange)' : 'var(--board-2)', stroke: 'var(--line)' }, g); text(g, x + cw / 2 - 3, y + 141, fmt(convert(q, a, b, t), b), { 'font-size': 18, 'font-weight': 800, cls: 'num', fill: hl ? '#fff' : 'var(--ink)' }); });
      text(g, x0 - 16, y + 61, a, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: 'var(--blue)' }); text(g, x0 - 16, y + 141, b, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: 'var(--orange)' });
    }
    // ---------- problems ----------
    const pick = a => a[rnd(0, a.length - 1)];
    function makeProblem() {
      const Ls = level;
      const metric = [['length', 'cm', 'mm'], ['length', 'm', 'cm'], ['length', 'km', 'm'], ['mass', 'kg', 'g'], ['capacity', 'l', 'ml']];
      const [qq, big, small] = pick(metric), k = factor(qq, big, small);
      const wholeBig = Ls === 'easy' ? rnd(2, 9) : rnd(11, 95) / 10, smallV = Ls === 'easy' ? rnd(2, 9) * k : rnd(12, 98) * k / 10;
      if (Ls === 'easy') return pick([
        { q: `Convert ${fmt(wholeBig, big)} to ${Q[qq].long[small]}.`, qq, a: big, b: small, v: wholeBig, ans: fmt(wholeBig * k, small), work: [`1 ${big} = ${k.toLocaleString('en-GB')} ${small}`, `${big} to ${small}: multiply by ${k.toLocaleString('en-GB')}`, `${wholeBig} × ${k.toLocaleString('en-GB')} = ${(wholeBig * k).toLocaleString('en-GB')}`] },
        { q: `Convert ${fmt(smallV, small)} to ${Q[qq].long[big]}.`, qq, a: small, b: big, v: smallV, ans: fmt(smallV / k, big), work: [`1 ${big} = ${k.toLocaleString('en-GB')} ${small}`, `${small} to ${big}: divide by ${k.toLocaleString('en-GB')}`, `${smallV.toLocaleString('en-GB')} ÷ ${k.toLocaleString('en-GB')} = ${clean(smallV / k)}`] },
        { q: `How many pence are in £${rnd(2, 9)}.${rnd(1, 9)}0?`, qq: 'money', a: '£', b: 'p', v: null, money: true }
      ]);
      if (Ls === 'medium') return pick([
        { q: `Convert ${fmt(wholeBig, big)} to ${Q[qq].long[small]}.`, qq, a: big, b: small, v: wholeBig, ans: fmt(wholeBig * k, small), work: [`1 ${big} = ${k.toLocaleString('en-GB')} ${small}`, `Multiply by ${k.toLocaleString('en-GB')}: the digits move ${Math.log10(k)} places left`, `${wholeBig} × ${k.toLocaleString('en-GB')} = ${clean(wholeBig * k).toLocaleString('en-GB')}`] },
        { q: `Convert ${fmt(smallV, small)} to ${Q[qq].long[big]}.`, qq, a: small, b: big, v: smallV, ans: fmt(smallV / k, big), work: [`1 ${big} = ${k.toLocaleString('en-GB')} ${small}`, `Divide by ${k.toLocaleString('en-GB')}: the digits move ${Math.log10(k)} places right`, `${clean(smallV).toLocaleString('en-GB')} ÷ ${k.toLocaleString('en-GB')} = ${clean(smallV / k)}`] },
        (() => { const a1 = wholeBig, b1 = clean(a1 * k + pick([-1, 1]) * rnd(1, 4) * k / 10); const bigger = b1 > a1 * k; const word = { length: 'longer', mass: 'heavier', capacity: 'more' }[qq]; return { q: `Which is ${word}: ${fmt(a1, big)} or ${fmt(b1, small)}?`, qq, a: big, b: small, v: a1, ans: bigger ? fmt(b1, small) : fmt(a1, big), work: [`Change them to the same unit: ${fmt(a1, big)} = ${fmt(a1 * k, small)}`, `Compare ${fmt(a1 * k, small)} with ${fmt(b1, small)}`, `${fmt(Math.max(a1 * k, b1), small)} is ${word}`] }; })(),
        (() => { const p = rnd(4, 40) * 5, e = clean(p * rE); return { q: `£1 = €${rE.toFixed(2)}. How many euros do you get for £${p}?`, qq: 'money', a: '£', b: '€', v: p, ans: '€' + e.toFixed(2), work: [`Each pound is worth €${rE.toFixed(2)}`, `£${p} × ${rE.toFixed(2)} = €${e.toFixed(2)}`] }; })()
      ]);
      return pick([
        (() => { const tot = rnd(12, 30) / 10, used = rnd(2, 9) * 50; const left = clean(tot * 1000 - used); return { q: `A bottle holds ${tot} l of water. Sam pours out ${used} ml. How much is left, in millilitres?`, qq: 'capacity', a: 'l', b: 'ml', v: tot, ans: fmt(left, 'ml'), work: [`Change ${tot} l to ml: ${tot} × 1,000 = ${clean(tot * 1000).toLocaleString('en-GB')} ml`, `${clean(tot * 1000).toLocaleString('en-GB')} − ${used} = ${left.toLocaleString('en-GB')} ml`] }; })(),
        (() => { const n = rnd(3, 8), each = rnd(15, 45) * 10; const tot = n * each; return { q: `A recipe uses ${each} g of flour for one cake. How many kilograms of flour are needed for ${n} cakes?`, qq: 'mass', a: 'g', b: 'kg', v: tot, ans: fmt(tot / 1000, 'kg'), work: [`${n} × ${each} g = ${tot.toLocaleString('en-GB')} g`, `g to kg: divide by 1,000`, `${tot.toLocaleString('en-GB')} ÷ 1,000 = ${clean(tot / 1000)} kg`] }; })(),
        (() => { const laps = rnd(3, 9), lap = rnd(25, 80) * 10; const m = laps * lap; return { q: `A running track is ${lap} m long. Mia runs ${laps} laps. How far does she run in kilometres?`, qq: 'length', a: 'm', b: 'km', v: m, ans: fmt(m / 1000, 'km'), work: [`${laps} × ${lap} m = ${m.toLocaleString('en-GB')} m`, `m to km: divide by 1,000`, `${m.toLocaleString('en-GB')} ÷ 1,000 = ${clean(m / 1000)} km`] }; })(),
        (() => { const d = rnd(10, 60) * 2, pnds = clean(d / rU); return { q: `£1 = $${rU.toFixed(2)}. A game costs $${d} in New York. How much is that in pounds, to the nearest penny?`, qq: 'money', a: '$', b: '£', v: d, ans: '£' + pnds.toFixed(2), work: [`Dollars to pounds: divide by ${rU.toFixed(2)}`, `${d} ÷ ${rU.toFixed(2)} = ${pnds.toFixed(4)}…`, `To the nearest penny: £${pnds.toFixed(2)}`] }; })(),
        (() => { const a1 = rnd(12, 48) / 10, a2 = rnd(150, 900); const tot = clean(a1 * 1000 + a2); return { q: `A parcel weighs ${a1} kg and another weighs ${a2} g. What is their total mass in kilograms?`, qq: 'mass', a: 'g', b: 'kg', v: tot, ans: fmt(tot / 1000, 'kg'), work: [`Use the same unit. ${a1} kg = ${clean(a1 * 1000).toLocaleString('en-GB')} g`, `${clean(a1 * 1000).toLocaleString('en-GB')} + ${a2} = ${tot.toLocaleString('en-GB')} g`, `${tot.toLocaleString('en-GB')} g ÷ 1,000 = ${clean(tot / 1000)} kg`] }; })()
      ]);
    }
    function newProblem() { let p = makeProblem(); if (p.money && p.v == null) { const pd = rnd(2, 9) + rnd(1, 9) / 10; p = { q: `How many pence are in £${pd.toFixed(2)}?`, qq: 'money', a: '£', b: 'p', v: pd, ans: fmt(pd * 100, 'p'), work: ['£1 = 100p', `£ to p: multiply by 100`, `${pd.toFixed(2)} × 100 = ${clean(pd * 100)}p`] }; } prob = p; step = 0; shown = false; draw(); }
    function wrapT(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function draw() {
      clear(g);
      const defs = S('defs', {}, g), mk = S('marker', { id: 'cvarr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-3)' }, mk);
      if (mode === 'explore') { const r = header(from, to, val); numberLine(from, to, val, 190, rangeM, t => { val = t; valIn.value = String(t); draw(); }); if (val != null) pvChart(from, to, val, r, 340); else pvChart(from, to, 0, 0, 340, true); return; }
      if (!prob) return newProblem();
      const old = [q, from, to]; q = prob.qq;
      let y = 44; wrapT(prob.q, 52).forEach(l => { text(g, 40, y, l, { 'font-size': 26, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'start' }); y += 34; });
      const x = 40; y += 6;
      prob.work.slice(0, step).forEach((w, i) => { text(g, x, y, `${i + 1}. ${w}`, { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'start', fill: 'var(--ink-2)', cls: 'num' }); y += 28; });
      if (shown) { S('rect', { x, y: y - 6, width: Math.max(220, prob.ans.length * 16 + 60), height: 46, rx: 14, fill: 'var(--green)' }, g); text(g, x + 20, y + 17, 'Answer: ' + prob.ans, { 'font-size': 22, 'font-weight': 800, fill: '#fff', cls: 'num', 'text-anchor': 'start' }); y += 50; }
      if (step > 0 || shown) { const r = convert(prob.qq, prob.a, prob.b, prob.v); numberLine(prob.a, prob.b, prob.v, Math.max(y + 50, 300)); if (y < 260) pvChart(prob.a, prob.b, prob.v, r, 440); }
      else text(g, 550, 380, 'Use Next step to reveal the working', { 'font-size': 18, fill: 'var(--ink-3)' });
      [q, from, to] = old;
    }
    // ---------- menu ----------
    const unitOpts = () => Object.keys(Q[q].u).map(u => [u, u]);
    P.section('Mode');
    P.seg({ options: [['explore', 'Explore'], ['prob', 'Problems']], value: mode, onChange: v => { mode = v; eG.hidden = v !== 'explore'; pG.hidden = v !== 'prob'; (v === 'explore' ? eG : pG).open = true; draw(); } });
    P.group('Explore', { open: mode === 'explore' }); const eG = P.lastGroup;
    const DEFU = { length: ['m', 'cm'], mass: ['kg', 'g'], capacity: ['l', 'ml'], money: ['£', 'p'] };
    const DEFM = { mm: 100, cm: 100, m: 10, km: 10, g: 1000, kg: 10, ml: 1000, l: 10, p: 1000, '£': 10, '€': 10, '$': 10 };
    const setVal = (v, refit) => { val = v; if (v != null && (refit || v > rangeM)) rangeM = niceMax(v); valIn.value = v == null ? '' : String(v); draw(); };
    P.seg({ label: 'Measure', options: [['length', 'Length'], ['mass', 'Mass'], ['capacity', 'Capacity'], ['money', 'Money']], value: q, onChange: v => { q = v; [from, to] = DEFU[v]; rangeM = DEFM[from]; buildUnitButtons(); setVal(null); } });
    const valIn = H('input', { type: 'number', step: 'any', min: '0', value: val == null ? '' : String(val), placeholder: 'Number', cls: 'cvnum', 'aria-label': 'Number to convert' });
    valIn.addEventListener('input', () => { const n = parseFloat(valIn.value); if (valIn.value === '') { val = null; draw(); } else if (!isNaN(n) && n >= 0 && n < 1e7) { val = n; if (n > rangeM || n < rangeM / 20) rangeM = niceMax(n); draw(); } });
    const unitBox = H('div', { cls: 'cvbox' }); P.raw(unitBox);
    function buildUnitButtons() {
      unitBox.innerHTML = '';
      const row = (lab, get, set, lead) => { const r = H('div', { cls: 'cvrow' }); r.append(H('span', { cls: 'cvlab', text: lab })); if (lead) r.append(lead); const bs = H('div', { cls: 'cvunits' }); unitOpts().forEach(([u]) => bs.append(H('button', { cls: 'btn' + (get() === u ? ' primary' : ''), text: u, on: { click: () => { set(u); if (from === to) { const ks = Object.keys(Q[q].u); to = ks.find(k => k !== from); } buildUnitButtons(); draw(); } } }))); r.append(bs); unitBox.append(r); };
      row('Convert', () => from, u => { from = u; rangeM = val != null ? niceMax(val) : DEFM[u]; }, valIn);
      row('into', () => to, u => to = u);
    }
    P.buttons([['⇅ Swap', () => { if (val != null) { const r = convert(q, from, to, val); [from, to] = [to, from]; buildUnitButtons(); setVal(clean(r), true); } else { [from, to] = [to, from]; rangeM = DEFM[from]; buildUnitButtons(); draw(); } }], ['Clear', () => setVal(null)]]);
    P.button('Random number', () => { const f = q === 'money' ? 1 : Q[q].u[from]; let v = f >= 1000 ? rnd(11, 99) / 10 : f >= 10 ? rnd(12, 480) / (from === 'cm' ? 1 : 10) : rnd(150, 9800); if (q === 'money') v = from === 'p' ? rnd(105, 950) : rnd(120, 2000) / 100; setVal(clean(v), true); }, 'primary');
    P.note('Drag the blue dot along the top line to change the number.');
    P.group('Exchange rate settings');
    P.field({ label: '£1 in euros (€)', value: String(rE), type: 'number', stepAttr: '0.01', onChange: v => { const n = parseFloat(v); if (n > 0) { rE = n; draw(); } } });
    P.field({ label: '£1 in US dollars ($)', value: String(rU), type: 'number', stepAttr: '0.01', onChange: v => { const n = parseFloat(v); if (n > 0) { rU = n; draw(); } } });
    P.note('Round numbers make the calculations easier. Real rates change every day.');
    P.group('Problems', { open: mode === 'prob' }); const pG = P.lastGroup;
    P.seg({ options: [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], value: level, onChange: v => { level = v; newProblem(); } });
    P.button('New problem', newProblem, 'primary');
    P.buttons([['Next step', () => { if (!prob) return newProblem(); if (step < prob.work.length) step++; else shown = true; draw(); }], ['Show answer', () => { if (!prob) return; step = prob.work.length; shown = true; draw(); }]]);
    c.pulseWhen(c.btn('Next step'), () => mode === 'prob' && prob && !shown);
    eG.hidden = mode !== 'explore'; pG.hidden = mode !== 'prob';
    buildUnitButtons(); draw();
  }
});

tool({
  id: 'time-problems', name: 'Time problems', strand: 'meas', years: [3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Work out time differences on a time line with jumps to the next hour, then read bus and train timetables and answer questions about them.',
  tags: 'time difference duration elapsed time line jumps timetable bus train 12-hour 24-hour clock how long start end later earlier',
  icon: '<path d="M4 30h40"/><path d="M8 30q6-14 12 0M20 30q8-16 16 0" /><circle cx="8" cy="30" r="2.5" fill="currentColor"/><circle cx="36" cy="30" r="2.5" fill="currentColor"/><rect x="6" y="36" width="36" height="8" rx="2"/>',
  guide: ['Time line: tap New problem, or set your own start and end times. Next jump adds one jump at a time: first to the next full hour, then whole hours, then the minutes left. The jumps are added up at the end.', 'Choose the type of question: how long between two times, what time something finishes, or what time it started (counting back).', 'Timetables: choose bus or train and Easy, Medium or Hard. Some services miss stops, shown with a dash, like express buses and trains.', 'Tap New question for a question about the timetable. Next step shows the working and highlights the times to use. For a journey time, Show on the time line draws it with jumps.', 'Switch between the 12-hour and 24-hour clock at any time.'],
  mount(c) {
    const { svg, P } = c;
    let view = 'line', fmt24 = false, level = 'medium', qtype = 'diff', prob = null, shown = 0, clocks = true, ttKind = 'bus', ttLevel = 'medium', tt = null, tq = null, tstep = 0, tans = false, line = 'any', ttLine = false;
    c.persist(() => ({ view, fmt24, level, qtype, prob, shown, clocks, ttKind, ttLevel, tt, tq, tstep, tans, line, ttLine }), s => ({ view, fmt24, level, qtype, prob, shown, clocks, ttKind, ttLevel, tt, tq, tstep, tans, line, ttLine } = Object.assign({ view, fmt24, level, qtype, prob, shown, clocks, ttKind, ttLevel, tt, tq, tstep, tans, line, ttLine }, s)));
    const g = S('g', {}, svg);
    // ---------- time helpers ----------
    const T = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; if (fmt24) return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; const h12 = h % 12 || 12; return `${h12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
    const D = m => { const h = Math.floor(m / 60), mm = m % 60; return [h ? `${h} hour${h > 1 ? 's' : ''}` : '', mm ? `${mm} minute${mm > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ') || '0 minutes'; };
    const Ds = m => { const h = Math.floor(m / 60), mm = m % 60; return [h ? `${h} hr` : '', mm ? `${mm} min` : ''].filter(Boolean).join(' ') || '0 min'; };
    function jumpsFwd(s, e) { const out = []; let t = s; if (t % 60 && Math.ceil(t / 60) * 60 <= e) { const n = Math.ceil(t / 60) * 60; out.push([t, n]); t = n; } while (t + 60 <= e) { out.push([t, t + 60]); t += 60; } if (t < e) out.push([t, e]); return out; }
    function jumpsBack(e, s) { const out = []; let t = e; if (t % 60 && Math.floor(t / 60) * 60 >= s) { const n = Math.floor(t / 60) * 60; out.push([t, n]); t = n; } while (t - 60 >= s) { out.push([t, t - 60]); t -= 60; } if (t > s) out.push([t, s]); return out; }
    function clockFace(x, y, r, m) {
      S('circle', { cx: x, cy: y, r, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; S('line', { x1: x + Math.sin(a) * r * .82, y1: y - Math.cos(a) * r * .82, x2: x + Math.sin(a) * r * .95, y2: y - Math.cos(a) * r * .95, stroke: 'var(--ink)', 'stroke-width': 2 }, g); }
      const h = (m / 60) % 12, mm = m % 60, ha = h * Math.PI / 6, ma = mm * Math.PI / 30;
      S('line', { x1: x, y1: y, x2: x + Math.sin(ha) * r * .5, y2: y - Math.cos(ha) * r * .5, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      S('line', { x1: x, y1: y, x2: x + Math.sin(ma) * r * .78, y2: y - Math.cos(ma) * r * .78, stroke: 'var(--red)', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      S('circle', { cx: x, cy: y, r: 3.5, fill: 'var(--ink)' }, g);
    }
    // ---------- time line ----------
    function drawLine(p, k, y0, compact) {
      const lo = Math.min(p.s, p.e), hi = Math.max(p.s, p.e), pad = Math.max(10, (hi - lo) * .04), x0 = compact ? 60 : 90, x1 = compact ? 1040 : 1010, X = t => x0 + (t - lo + pad) / (hi - lo + 2 * pad) * (x1 - x0);
      const back = p.type === 'start', js = back ? jumpsBack(p.e, p.s) : jumpsFwd(p.s, p.e), known = back ? p.e : p.s, unknown = back ? p.s : p.e, hideEnd = p.type !== 'diff' && k < js.length;
      S('line', { x1: x0 - 20, y1: y0, x2: x1 + 20, y2: y0, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      for (let t = Math.ceil(lo / 60) * 60; t <= hi; t += 60) { S('line', { x1: X(t), y1: y0 - 10, x2: X(t), y2: y0 + 10, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g); if (Math.abs(X(t) - X(lo)) > 70 && Math.abs(X(t) - X(hi)) > 70 && js.slice(0, k).some(j => j[1] === t || j[0] === t)) text(g, X(t), y0 + 32, T(t), { 'font-size': 16, 'font-weight': 700, cls: 'num', fill: 'var(--ink-2)' }); }
      const mark = (t, cl, lab) => { S('circle', { cx: X(t), cy: y0, r: 10, fill: col(cl), stroke: 'var(--board)', 'stroke-width': 3 }, g); text(g, X(t), y0 + 34, lab, { 'font-size': 20, 'font-weight': 800, cls: 'num', fill: col(cl) }); };
      mark(known, 'blue', T(known)); mark(unknown, 'orange', hideEnd ? '?' : T(unknown));
      js.slice(0, k).forEach(([a, b], i) => { const xa = X(a), xb = X(b), m = (xa + xb) / 2, ht = Math.min(130, 40 + Math.abs(xb - xa) * .35); S('path', { d: `M${xa} ${y0 - 8} Q${m} ${y0 - ht} ${xb} ${y0 - 8}`, fill: 'none', stroke: col(['green', 'purple', 'teal', 'red', 'blue'][i % 5]), 'stroke-width': 4, 'marker-end': 'url(#tparr)' }, g); const d = Math.abs(b - a); text(g, m, y0 - ht / 2 - 18, (back ? '− ' : '+ ') + Ds(d), { 'font-size': 18, 'font-weight': 800, fill: col(['green', 'purple', 'teal', 'red', 'blue'][i % 5]), cls: 'num', stroke: 'var(--board)', 'stroke-width': 5, 'paint-order': 'stroke' }); });
      if (clocks) { clockFace(X(known), y0 + 110, 46, known); if (!hideEnd) clockFace(X(unknown), y0 + 110, 46, unknown); else { S('circle', { cx: X(unknown), cy: y0 + 110, r: 46, fill: 'var(--board-2)', stroke: 'var(--ink-3)', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g); text(g, X(unknown), y0 + 111, '?', { 'font-size': 34, 'font-weight': 800, fill: 'var(--ink-3)' }); } }
      // working
      const parts = js.slice(0, k).map(([a, b]) => Ds(Math.abs(b - a))), total = js.slice(0, k).reduce((t, [a, b]) => t + Math.abs(b - a), 0), done = k >= js.length;
      let wy = y0 + (clocks ? 196 : compact ? 58 : 76);
      if (k && !compact) { const line = parts.join(' + '); text(g, 550, wy, line.length > 70 ? `${k} jumps` : line, { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: 'var(--ink-2)' }); wy += 34; }
      if (done && k) {
        const lens = js.map(([a, b]) => Math.abs(b - a)), hrs = lens.filter(d => d % 60 === 0), mins = lens.filter(d => d % 60 !== 0), H = hrs.reduce((t, d) => t + d, 0) / 60, M = mins.reduce((t, d) => t + d, 0);
        const L = (lab, body, cl) => { if (compact && lab === 'Regroup:') body = body.replace(' is more than 60, so', ' →'); text(g, 380, wy, lab, { 'font-size': compact ? 16 : 20, 'font-weight': 800, fill: col(cl), 'text-anchor': 'end' }); text(g, 392, wy, body, { 'font-size': compact ? 16 : 20, 'font-weight': 700, cls: 'num', 'text-anchor': 'start' }); wy += compact ? 22 : 30; };
        if (hrs.length) L('Hours:', `${hrs.map(d => d / 60 + ' hr').join(' + ')} = ${H} hr`, 'purple');
        if (mins.length) L('Minutes:', `${mins.map(d => d + ' min').join(' + ')} = ${M} min`, 'green');
        if (M >= 60) L('Regroup:', `${M} min is more than 60, so ${M} min = ${Math.floor(M / 60)} hr ${M % 60 ? M % 60 + ' min' : ''}`.trim(), 'orange');
        L('Total:', `${Ds(H * 60 + M)}`, 'accent');
      }
      return js.length;
    }
    const CTX = {
      diff: [(s, e) => `It is ${T(e)} now. How long has passed since ${T(s)}?`, (s, e) => `A film starts at ${T(s)} and ends at ${T(e)}. How long is the film?`, (s, e) => `Sports day started at ${T(s)} and finished at ${T(e)}. How long did it last?`, (s, e) => `A coach leaves at ${T(s)} and arrives at ${T(e)}. How long is the journey?`],
      end: [(s, d) => `A cake goes in the oven at ${T(s)} and bakes for ${D(d)}. What time does it come out?`, (s, d) => `A football match kicks off at ${T(s)} and lasts ${D(d)}, including half time. What time does it finish?`, (s, d) => `A train leaves at ${T(s)}. The journey takes ${D(d)}. What time does it arrive?`],
      start: [(e, d) => `A train arrives at ${T(e)} after a journey of ${D(d)}. What time did it set off?`, (e, d) => `Tom's swimming lesson finished at ${T(e)}. It lasted ${D(d)}. What time did it start?`, (e, d) => `A play ends at ${T(e)}. It lasted ${D(d)}. What time did it begin?`]
    };
    function newProblem() {
      const step = level === 'easy' ? 30 : level === 'medium' ? 5 : 1;
      let s = rnd(7, level === 'hard' ? 22 : 17) * 60 + rnd(0, 59 / step | 0) * step, d = level === 'easy' ? rnd(1, 6) * 30 : level === 'medium' ? rnd(7, 50) * 5 : rnd(40, 420);
      if (level === 'easy' && s % 60 === 0 && d % 60 === 0) d += 30;
      const e = s + d, k = rnd(0, CTX[qtype].length - 1);
      prob = { type: qtype, s, e, k }; shown = 0; draw();
    }
    function qText(p) { const f = CTX[p.type][p.k % CTX[p.type].length]; return p.type === 'diff' ? f(p.s, p.e) : p.type === 'end' ? f(p.s, p.e - p.s) : f(p.e, p.e - p.s); }
    function wrapT(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function drawLineView() {
      if (!prob) return newProblem();
      let y = 50; wrapT(qText(prob), 58).forEach(l => { text(g, 550, y, l, { 'font-size': 28, 'font-weight': 800, cls: 'disp num' }); y += 36; });
      const n = drawLine(prob, shown, 300);
      if (shown >= n) { const ans = prob.type === 'diff' ? D(prob.e - prob.s) : prob.type === 'end' ? T(prob.e) : T(prob.s); const w = ans.length * 15 + 160; S('rect', { x: 1060 - w, y: 612, width: w, height: 50, rx: 16, fill: 'var(--green)' }, g); text(g, 1060 - w / 2, 638, 'Answer: ' + ans, { 'font-size': 24, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
      else text(g, 550, 640, `Next jump to add jump ${shown + 1} of ${n}`, { 'font-size': 16, fill: 'var(--ink-3)' });
    }
    // ---------- timetables ----------
    const STOPS = { bus: ['Bus Station', 'Market Square', 'Library', 'Church Lane', 'Primary School', 'Village Green', 'Mill Road', 'Hospital', 'Retail Park', 'Railway Station'] };
    const LINES = { river: ['Riverside Line', ['Kingsford', 'Elmstead', 'Ashby Junction', 'Hollowbrook', 'Marsh End', 'Westerby', 'Crowfield', 'Northport']], coast: ['Coastal Line', ['Harbourside', 'Pebble Bay', 'Cliff Top', 'Saltmarsh', 'Gullhaven', 'Lighthouse Point', 'Dunmore', 'Seabrook']], moor: ['Moorland Line', ['Highmoor', 'Heather Cross', 'Stonebridge', 'Fellside', 'Kestrel Wood', 'Peat Hollow', 'Crag End', 'Tarn Gate']], city: ['City Line', ['Central', 'Museum Quarter', 'University', 'Riverside Park', 'Old Town', 'Stadium', 'Airport Parkway', 'Airport']] };
    function newTimetable() {
      const L = ttLevel, nS = L === 'easy' ? 4 : L === 'medium' ? 6 : 8, nV = L === 'easy' ? 3 : L === 'medium' ? 4 : 5;
      const lk = line === 'any' ? Object.keys(LINES)[rnd(0, 3)] : line, names = (ttKind === 'bus' ? STOPS.bus : LINES[lk][1]).slice(0, nS), gaps = names.slice(1).map(() => ttKind === 'bus' ? rnd(L === 'easy' ? 1 : 3, 9) * (L === 'easy' ? 5 : 1) : rnd(6, 22));
      const start = (ttKind === 'bus' ? rnd(7, 9) : rnd(6, 8)) * 60 + (L === 'easy' ? rnd(0, 3) * 15 : rnd(0, 11) * 5);
      const services = []; let t = start;
      for (let v = 0; v < nV; v++) {
        const express = L !== 'easy' && (v === 1 || (L === 'hard' && v === 3)), village = L === 'hard' && v === nV - 1;
        const skip = new Set(); if (express) for (let i = 1; i < nS - 1; i++) if (i % 2 === (v % 2) || Math.random() < .3) skip.add(i); if (village) skip.add(nS - 1);
        const col = []; let cur = t;
        for (let i = 0; i < nS; i++) { if (i) cur += Math.round(gaps[i - 1] * (express ? .8 : 1)); col.push(skip.has(i) ? null : cur); }
        services.push({ times: col, label: express ? 'Express' : village ? (ttKind === 'bus' ? 'Village' : 'Stopping') : '', name: '' });
        t += L === 'easy' ? 30 : rnd(4, 9) * 5 + (L === 'hard' ? rnd(0, 4) : 0);
      }
      const nums = shuffle([12, 15, 21, 24, 32, 36, 41, 47, 53, 58, 64, 71]); let ni = 0;
      services.forEach((sv, i) => { sv.name = ttKind === 'bus' ? (sv.label === 'Express' ? 'X' + rnd(1, 9) : sv.label === 'Village' ? 'V' + rnd(1, 9) : String(nums[ni++])) : 'Train ' + 'ABCDEFG'[i]; });
      tt = { kind: ttKind, stops: names, services, title: ttKind === 'bus' ? 'Town buses' : LINES[lk][0] }; ttLine = false; tq = null; tstep = 0; tans = false; draw();
    }
    function cellsOf(si) { return tt.services[si].times; }
    function newTQ() {
      if (!tt) newTimetable();
      const nS = tt.stops.length, nV = tt.services.length, vName = tt.kind === 'bus' ? 'bus' : 'train', N = si => tt.kind === 'bus' ? `number ${tt.services[si].name} bus` : tt.services[si].name, Nc = si => N(si)[0].toUpperCase() + N(si).slice(1); ttLine = false;
      const opts = [];
      // journey time
      for (let k = 0; k < 6; k++) { const si = rnd(0, nV - 1), c2 = cellsOf(si), idx = c2.map((t, i) => t != null ? i : -1).filter(i => i >= 0); if (idx.length < 2) continue; const a = idx[rnd(0, idx.length - 2)], b = idx[rnd(idx.indexOf(a) + 1, idx.length - 1)]; opts.push({ q: `How long does the ${N(si)} take to get from ${tt.stops[a]} to ${tt.stops[b]}?`, hl: [[si, a], [si, b]], work: [`Find the column for the ${N(si)}.`, `It leaves ${tt.stops[a]} at ${T(c2[a])} and reaches ${tt.stops[b]} at ${T(c2[b])}.`, `From ${T(c2[a])} to ${T(c2[b])} is ${D(c2[b] - c2[a])}.`], ans: D(c2[b] - c2[a]), line: { s: c2[a], e: c2[b] } }); break; }
      // which does not stop
      const skipS = tt.services.map((s2, si) => s2.times.findIndex((t, i) => t == null && i > 0)).map((i, si) => [i, si]).filter(([i]) => i > 0);
      if (skipS.length) { const [i, si] = skipS[rnd(0, skipS.length - 1)]; const first = cellsOf(si)[0]; opts.push({ q: `Which ${vName} does not stop at ${tt.stops[i]}?`, hl: [[si, i], [si, 0]], work: [`Look along the row for ${tt.stops[i]}.`, `A dash means the ${vName} does not stop there.`, `The dash is in the column for the ${N(si)}.`], ans: `The ${N(si)}` }); void first; }
      // arrive by
      { const b = nS - 1, arrs = tt.services.map((s2, si) => [s2.times[b], si]).filter(([t]) => t != null); if (arrs.length >= 2) { const pickI = rnd(1, arrs.length - 1), target = arrs[pickI][0] + rnd(2, 8), si = arrs[pickI][1]; const dep = cellsOf(si).find(t => t != null); opts.push({ q: `You need to be at ${tt.stops[b]} by ${T(target)}. Which is the latest ${vName} you can catch from ${tt.stops[0]}?`, hl: [[si, b], [si, 0]], work: [`Look along the ${tt.stops[b]} row for times before ${T(target)}.`, `The latest one is ${T(arrs[pickI][0])}.`, `That is the ${N(si)}. It leaves ${tt.stops[0]} at ${dep != null ? T(dep) : '…'}.`], ans: `The ${N(si)}${dep != null ? `, leaving at ${T(dep)}` : ''}` }); } }
      // wait for next
      { const row = rnd(0, Math.min(2, nS - 1)), times = tt.services.map((s2, si) => [s2.times[row], si]).filter(([t]) => t != null); if (times.length >= 2) { const j = rnd(1, times.length - 1), arrive = times[j][0] - rnd(4, 19); opts.push({ q: `You get to ${tt.stops[row]} at ${T(arrive)}. How long do you wait for the next ${vName}?`, hl: [[times[j][1], row]], work: [`Look along the ${tt.stops[row]} row for the first time after ${T(arrive)}.`, `The next one is the ${N(times[j][1])} at ${T(times[j][0])}.`, `From ${T(arrive)} to ${T(times[j][0])} is ${D(times[j][0] - arrive)}.`], ans: D(times[j][0] - arrive), line: { s: arrive, e: times[j][0] } }); } }
      // late
      { const si = rnd(0, nV - 1), c2 = cellsOf(si), idx = c2.map((t, i) => t != null ? i : -1).filter(i => i >= 0), late = rnd(2, 5) * 5; if (idx.length >= 2) { const b = idx[idx.length - 1]; opts.push({ q: `The ${N(si)} is running ${late} minutes late. What time will it reach ${tt.stops[b]}?`, hl: [[si, idx[0]], [si, b]], work: [`It should reach ${tt.stops[b]} at ${T(c2[b])}.`, `${T(c2[b])} + ${late} minutes = ${T(c2[b] + late)}.`], ans: T(c2[b] + late), line: { s: c2[b], e: c2[b] + late } }); } }
      // fastest
      if (ttLevel !== 'easy') { const durs = tt.services.map((s2, si) => { const t0 = s2.times[0], t1 = s2.times[nS - 1]; return t0 != null && t1 != null ? [t1 - t0, si] : null; }).filter(Boolean); if (durs.length >= 2) { durs.sort((a, b) => a[0] - b[0]); const [d, si] = durs[0]; const tie = durs[1][0] === d; opts.push({ q: `Which ${vName} has the quickest journey from ${tt.stops[0]} to ${tt.stops[nS - 1]}? How long does it take?`, hl: durs.map(([, s3]) => [s3, nS - 1]).concat(durs.map(([, s3]) => [s3, 0])), work: [`Work out each journey: the time at ${tt.stops[nS - 1]} take away the time at ${tt.stops[0]}.`, durs.map(([dd, s3]) => `${tt.services[s3].name}: ${Ds(dd)}`).join(', '), tie ? `The ${N(si)} and the ${N(durs[1][1])} both take ${Ds(d)}.` : `The quickest is the ${N(si)}.`], ans: tie ? `A tie: the ${N(si)} and the ${N(durs[1][1])}, ${D(d)} each` : `The ${N(si)}, taking ${D(d)}`, line: { s: cellsOf(si)[0], e: cellsOf(si)[nS - 1] } }); } }
      tq = opts[rnd(0, opts.length - 1)]; tstep = 0; tans = false; draw();
    }
    function drawTimetable() {
      if (!tt) return newTimetable();
      const nS = tt.stops.length, nV = tt.services.length, x0 = 30, nameW = 220, cw = Math.min(130, (640 - nameW) / nV), showL = ttLine && tq && tq.line, rh = Math.min(showL ? 40 : 58, (showL ? 380 : 600) / (nS + 1.4)), y0 = 20, hh = rh * 1.4;
      const hlSet = new Set((tq && tstep >= 1 ? tq.hl : []).map(([s2, r]) => s2 + ',' + r));
      S('rect', { x: x0, y: y0, width: nameW + cw * nV, height: hh + rh * nS + 8, rx: 14, fill: 'var(--board)', stroke: 'var(--ink-2)', 'stroke-width': 2 }, g);
      S('rect', { x: x0, y: y0, width: nameW + cw * nV, height: hh, rx: 14, fill: tt.kind === 'bus' ? 'var(--orange)' : 'var(--blue)' }, g);
      text(g, x0 + 16, y0 + hh / 2, tt.title || (tt.kind === 'bus' ? 'Town buses' : 'Riverside Line'), { 'font-size': 18, 'font-weight': 800, fill: '#fff', 'text-anchor': 'start' });
      tt.services.forEach((sv, si) => { const x = x0 + nameW + cw * si + cw / 2; text(g, x, y0 + hh / 2 - (sv.label ? 9 : 0), (tt.kind === 'bus' ? 'Bus ' : '') + (sv.name || (tt.kind === 'bus' ? '' : 'Train')).replace('Train ', 'Train '), { 'font-size': 16, 'font-weight': 800, fill: '#fff' }); if (sv.label) text(g, x, y0 + hh / 2 + 11, sv.label, { 'font-size': 12, 'font-weight': 700, fill: '#fff', opacity: .9 }); });
      tt.stops.forEach((st, r) => {
        const y = y0 + hh + rh * r + 4;
        if (r % 2 === 0) S('rect', { x: x0 + 2, y, width: nameW + cw * nV - 4, height: rh, fill: 'var(--board-2)' }, g);
        text(g, x0 + 16, y + rh / 2, st, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'start' });
        tt.services.forEach((sv, si) => { const t = sv.times[r], x = x0 + nameW + cw * si + cw / 2, hl = hlSet.has(si + ',' + r); if (hl) S('rect', { x: x - cw / 2 + 4, y: y + 3, width: cw - 8, height: rh - 6, rx: 8, fill: 'var(--yellow)', stroke: 'var(--orange)', 'stroke-width': 2 }, g); text(g, x, y + rh / 2, t == null ? '—' : T(t).replace(' am', 'am').replace(' pm', 'pm'), { 'font-size': 17, 'font-weight': t == null ? 400 : 700, cls: 'num', fill: t == null ? 'var(--ink-3)' : 'var(--ink)' }); });
      });
      if (showL) { const sv = clocks; clocks = false; text(g, 40, 470, `On a time line: ${T(tq.line.s)} to ${T(tq.line.e)}`, { 'font-size': 16, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start' }); drawLine({ type: 'diff', s: tq.line.s, e: tq.line.e }, 99, 540, true); clocks = sv; }
      // question panel
      const px = 700; let y = 50;
      if (!tq) { text(g, px, y, 'Read the timetable', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp' }); y += 34; ['Each column is one ' + (tt.kind === 'bus' ? 'bus' : 'train') + '.', 'Read down a column to follow it.', 'A dash — means it does not stop.', 'Tap New question to start.'].forEach(l => { text(g, px, y, l, { 'font-size': 16, fill: 'var(--ink-2)', 'text-anchor': 'start' }); y += 26; }); return; }
      wrapT(tq.q, 30).forEach(l => { text(g, px, y, l, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp num' }); y += 27; });
      y += 14;
      tq.work.slice(0, tstep).forEach((w, i) => { const ls = wrapT(w, 36); ls.forEach((l, j) => { text(g, px + (j ? 22 : 0), y, (j ? '' : `${i + 1}. `) + l, { 'font-size': 16, 'text-anchor': 'start', fill: 'var(--ink-2)', 'font-weight': 600, cls: 'num' }); y += 22; }); y += 6; });
      if (tans) { y += 4; const ls = wrapT('Answer: ' + tq.ans, 26); S('rect', { x: px, y: y - 18, width: 370, height: 30 * ls.length + 14, rx: 14, fill: 'var(--green)' }, g); ls.forEach((l, j) => text(g, px + 16, y + 4 + j * 30, l, { 'font-size': 20, 'font-weight': 800, fill: '#fff', 'text-anchor': 'start', cls: 'num' })); }
    }
    function draw() { clear(g); const defs = S('defs', {}, g), mk = S('marker', { id: 'tparr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-2)' }, mk); if (view === 'line') drawLineView(); else drawTimetable(); }
    // ---------- menu ----------
    const sync = () => { lG.hidden = view !== 'line'; tG.hidden = view !== 'tt'; (view === 'line' ? lG : tG).open = true; };
    P.section('Show');
    const vSeg = P.seg({ options: [['line', 'Time line'], ['tt', 'Timetables']], value: view, onChange: v => { view = v; sync(); draw(); } });
    P.seg({ label: 'Clock', options: [[false, '12-hour (am/pm)'], [true, '24-hour']], value: fmt24, onChange: v => { fmt24 = v; draw(); } });
    P.group('Time line', { open: view === 'line' }); const lG = P.lastGroup;
    P.seg({ label: 'Question', options: [['diff', 'How long?'], ['end', 'What time after?'], ['start', 'What time before?']], value: qtype, onChange: v => { qtype = v; newProblem(); } });
    P.seg({ label: 'Level', options: [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], value: level, onChange: v => { level = v; newProblem(); } });
    P.button('New problem', newProblem, 'primary');
    P.buttons([['Next jump', () => { if (!prob) return newProblem(); const n = (prob.type === 'start' ? jumpsBack(prob.e, prob.s) : jumpsFwd(prob.s, prob.e)).length; if (shown < n) shown++; draw(); }], ['Show all', () => { if (!prob) return; shown = 99; draw(); }]]);
    c.pulseWhen(c.btn('Next jump'), () => view === 'line' && prob && shown < (prob.type === 'start' ? jumpsBack(prob.e, prob.s) : jumpsFwd(prob.s, prob.e)).length);
    P.button('Start again', () => { shown = 0; draw(); });
    P.toggle({ label: 'Clock faces', value: clocks, onChange: v => { clocks = v; draw(); } });
    P.note('Set your own times:');
    const hm = (lab, get, set) => P.stepper({ label: lab, value: get(), min: 0, max: 1439, step: 5, fmt: v => T(v), onChange: v => { set(v); shown = 0; draw(); } });
    hm('Start', () => prob ? prob.s : 540, v => { prob = prob || { type: qtype, s: 540, e: 640, k: 0 }; prob.s = Math.min(v, prob.e - 5); prob.k = 0; });
    hm('End', () => prob ? prob.e : 640, v => { prob = prob || { type: qtype, s: 540, e: 640, k: 0 }; prob.e = Math.max(v, prob.s + 5); prob.k = 0; });
    P.group('Timetables', { open: view === 'tt' }); const tG = P.lastGroup;
    P.seg({ options: [['bus', 'Bus'], ['train', 'Train']], value: ttKind, onChange: v => { ttKind = v; lineSeg.el.hidden = v !== 'train'; newTimetable(); } });
    const lineSeg = P.seg({ label: 'Train line', options: [['any', 'Any line'], ['river', 'Riverside'], ['coast', 'Coastal'], ['moor', 'Moorland'], ['city', 'City']], value: line, onChange: v => { line = v; newTimetable(); } });
    P.seg({ label: 'Level', options: [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], value: ttLevel, onChange: v => { ttLevel = v; newTimetable(); } });
    P.buttons([['New timetable', newTimetable], ['New question', newTQ, 'primary']]);
    P.buttons([['Next step', () => { if (!tq) return newTQ(); if (tstep < tq.work.length) tstep++; else tans = true; draw(); }], ['Show answer', () => { if (!tq) return; tstep = tq.work.length; tans = true; draw(); }]]);
    P.button('Show on a time line', () => { if (!tq || !tq.line) return c.toast('This question is not about a length of time'); ttLine = !ttLine; draw(); });
    c.pulseWhen(c.btn('Next step'), () => view === 'tt' && tq && !tans);
    if (lineSeg.el) lineSeg.el.hidden = ttKind !== 'train';
    sync(); draw();
  }
});

tool({
  id: 'world-time', name: 'World time', strand: 'meas', years: [4, 5, 6], w: 1100, h: 680,
  desc: 'See how the time changes around the world, compare time zones, and solve problems about flights that take off in one time zone and land in another.',
  tags: 'world time zones time difference ahead behind flights departures arrivals flight time cities day night international',
  icon: '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c-7 8-7 28 0 36M24 6c7 8 7 28 0 36"/><path d="M38 8v6h6" />',
  guide: ['Change the time in London and watch every city change with it. Cities to the east are ahead of London, cities to the west are behind. Night is shaded dark.', 'Pick two cities to compare. The arrow shows how many hours ahead or behind the second city is.', 'Flights board: a departures board with flight times. Tap New problem for a question about a flight, then use Next step for the working: work out the time at the start, then change it to the time where the plane lands.', 'Times are shown without summer time (daylight saving), so the differences stay the same all year.'],
  mount(c) {
    const { svg, P } = c;
    const CITIES = [['Honolulu', -10], ['Los Angeles', -8], ['Mexico City', -6], ['New York', -5], ['Rio de Janeiro', -3], ['London', 0], ['Paris', 1], ['Cairo', 2], ['Moscow', 3], ['Dubai', 4], ['Delhi', 5.5], ['Bangkok', 7], ['Beijing', 8], ['Tokyo', 9], ['Sydney', 10], ['Auckland', 12]];
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let lon = 12 * 60, fmt24 = false, ca = null, cb = null, showAll = false, view = 'map', level = 'medium', prob = null, step = 0, ans = false, flights = null;
    c.persist(() => ({ lon, fmt24, ca, cb, showAll, view, level, prob, step, ans, flights }), s => ({ lon, fmt24, ca, cb, showAll, view, level, prob, step, ans, flights } = Object.assign({ lon, fmt24, ca, cb, showAll, view, level, prob, step, ans, flights }, s)));
    const g = S('g', {}, svg);
    const off = n => (CITIES.find(x => x[0] === n) || CITIES[5])[1];
    const T = m => { const mm = ((m % 1440) + 1440) % 1440, h = Math.floor(mm / 60), mi = mm % 60; if (fmt24) return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`; return `${h % 12 || 12}:${String(mi).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
    const dayOf = m => DAYS[(1 + Math.floor(m / 1440) + 70) % 7]; // London starts on Monday
    const H2 = h => { const a = Math.abs(h), w = Math.floor(a), half = a - w; return `${w ? w + ' hour' + (w > 1 ? 's' : '') : ''}${half ? (w ? ' ' : '') + '30 minutes' : ''}` || '0 hours'; };
    const D = m => { const h = Math.floor(m / 60), mi = m % 60; return [h ? `${h} hour${h > 1 ? 's' : ''}` : '', mi ? `${mi} minutes` : ''].filter(Boolean).join(' '); };
    const local = (m, n) => m + off(n) * 60;
    function clock(x, y, r, m, night) {
      S('circle', { cx: x, cy: y, r, fill: night ? '#22305a' : 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, g);
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; S('line', { x1: x + Math.sin(a) * r * .8, y1: y - Math.cos(a) * r * .8, x2: x + Math.sin(a) * r * .94, y2: y - Math.cos(a) * r * .94, stroke: night ? '#cfd8ff' : 'var(--ink)', 'stroke-width': 1.5 }, g); }
      const mm = ((m % 1440) + 1440) % 1440, ha = (mm / 60 % 12) * Math.PI / 6, ma = (mm % 60) * Math.PI / 30;
      S('line', { x1: x, y1: y, x2: x + Math.sin(ha) * r * .5, y2: y - Math.cos(ha) * r * .5, stroke: night ? '#fff' : 'var(--ink)', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
      S('line', { x1: x, y1: y, x2: x + Math.sin(ma) * r * .76, y2: y - Math.cos(ma) * r * .76, stroke: 'var(--red)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    }
    const isNight = m => { const h = (((m % 1440) + 1440) % 1440) / 60; return h < 6 || h >= 19; };
    // ---------- map view ----------
    // a time line from one city's time to another's, jumping to the next hour first
    function timeline(nA, nB, tA, y, showEnd) {
      const d = (off(nB) - off(nA)) * 60, tB = tA + d, lo = Math.min(tA, tB), hi = Math.max(tA, tB), back = d < 0;
      const x0 = 70, x1 = 1030, span = Math.max(60, hi - lo), X = t => x0 + (t - lo) / span * (x1 - x0);
      S('line', { x1: x0 - 20, y1: y, x2: x1 + 20, y2: y, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      const js = []; let t = back ? tA : tA;
      if (!back) { if (t % 60 && Math.ceil(t / 60) * 60 <= tB) { js.push([t, Math.ceil(t / 60) * 60]); t = Math.ceil(t / 60) * 60; } const hrs = Math.floor((tB - t) / 60); if (hrs > 6) { js.push([t, t + hrs * 60]); t += hrs * 60; } else for (let i = 0; i < hrs; i++) { js.push([t, t + 60]); t += 60; } if (t < tB) js.push([t, tB]); }
      else { if (t % 60 && Math.floor(t / 60) * 60 >= tB) { js.push([t, Math.floor(t / 60) * 60]); t = Math.floor(t / 60) * 60; } const hrs = Math.floor((t - tB) / 60); if (hrs > 6) { js.push([t, t - hrs * 60]); t -= hrs * 60; } else for (let i = 0; i < hrs; i++) { js.push([t, t - 60]); t -= 60; } if (t > tB) js.push([t, tB]); }
      const cols = ['green', 'purple', 'teal', 'red', 'blue'];
      js.forEach(([a, b], i) => { const xa = X(a), xb = X(b), m = (xa + xb) / 2, ht = Math.min(90, 30 + Math.abs(xb - xa) * .3); S('path', { d: `M${xa} ${y - 8} Q${m} ${y - ht} ${xb} ${y - 8}`, fill: 'none', stroke: col(cols[i % 5]), 'stroke-width': 3.5, 'marker-end': 'url(#wtarr2)' }, g); const dd = Math.abs(b - a); text(g, m, y - ht / 2 - 14, (back ? '− ' : '+ ') + (dd >= 60 ? (dd / 60) + ' hr' : '') + (dd % 60 ? (dd >= 60 ? ' ' : '') + dd % 60 + ' min' : ''), { 'font-size': 16, 'font-weight': 800, fill: col(cols[i % 5]), stroke: 'var(--board)', 'stroke-width': 4, 'paint-order': 'stroke', cls: 'num' }); if (i < js.length - 1 && Math.abs(X(b) - X(tA)) > 60 && Math.abs(X(b) - X(tB)) > 60) { S('line', { x1: X(b), y1: y - 8, x2: X(b), y2: y + 8, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g); text(g, X(b), y + 26, T(b), { 'font-size': 14, 'font-weight': 700, fill: 'var(--ink-2)', cls: 'num' }); } });
      const mark = (tt, cl, name, lab) => { S('circle', { cx: X(tt), cy: y, r: 9, fill: col(cl), stroke: 'var(--board)', 'stroke-width': 3 }, g); text(g, X(tt), y + 28, lab, { 'font-size': 18, 'font-weight': 800, fill: col(cl), cls: 'num' }); text(g, X(tt), y + 50, name, { 'font-size': 14, 'font-weight': 800, fill: 'var(--ink-3)' }); };
      mark(tA, 'blue', nA, T(tA)); mark(tB, 'orange', nB, showEnd ? T(tB) : '?');
    }
    function card(n, x, y, w, h, hide) {
      const m = local(lon, n), night = isNight(m);
      S('rect', { x, y, width: w, height: h, rx: 18, fill: night ? '#2a3a6e' : 'var(--board-2)', stroke: 'var(--orange)', 'stroke-width': 3 }, g);
      text(g, x + w / 2, y + 24, n, { 'font-size': 18, 'font-weight': 800, fill: night ? '#fff' : 'var(--ink)' });
      if (hide) { S('circle', { cx: x + w / 2, cy: y + h * .45, r: 52, fill: 'var(--board)', stroke: 'var(--ink-3)', 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g); text(g, x + w / 2, y + h * .45 + 1, '?', { 'font-size': 40, 'font-weight': 800, fill: 'var(--ink-3)' }); return; }
      clock(x + w / 2, y + h * .45, 52, m, night); text(g, x + w / 2, y + h - 46, T(m), { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: night ? '#fff' : 'var(--ink)' }); text(g, x + w / 2, y + h - 20, dayOf(m), { 'font-size': 15, fill: night ? '#cfd8ff' : 'var(--ink-3)' });
    }
    function drawMap() {
      const x0 = 50, x1 = 1050, oLo = -11, oHi = 13, X = o => x0 + (o - oLo) / (oHi - oLo) * (x1 - x0), y0 = 84, bh = 120;
      text(g, 550, 30, `When it is ${T(lon)} on ${dayOf(lon)} in London…`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num' });
      for (let o = oLo; o < oHi; o += .25) { const m = lon + o * 60, h = (((m % 1440) + 1440) % 1440) / 60, k = h < 5 || h >= 21 ? 0 : h < 7 ? (h - 5) / 2 : h >= 19 ? (21 - h) / 2 : 1; S('rect', { x: X(o), y: y0, width: X(o + .25) - X(o) + .6, height: bh, fill: `color-mix(in srgb, #ffe7a3 ${Math.round(k * 100)}%, #1f2b55)` }, g); }
      S('rect', { x: x0, y: y0, width: x1 - x0, height: bh, rx: 4, fill: 'none', stroke: 'var(--ink-2)', 'stroke-width': 2 }, g);
      for (let o = -10; o <= 12; o += 2) { S('line', { x1: X(o), y1: y0 + bh, x2: X(o), y2: y0 + bh + 8, stroke: 'var(--ink-3)', 'stroke-width': 2 }, g); text(g, X(o), y0 + bh + 22, (o > 0 ? '+' : o < 0 ? '−' : '') + Math.abs(o) + (o ? ' h' : ' London'), { 'font-size': 13, fill: 'var(--ink-3)', 'font-weight': 700 }); }
      text(g, x0, y0 - 12, '◀ West: behind London', { 'font-size': 14, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'start' }); text(g, x1, y0 - 12, 'East: ahead of London ▶', { 'font-size': 14, 'font-weight': 800, fill: 'var(--ink-3)', 'text-anchor': 'end' });
      CITIES.forEach(([n, o], i) => { const x = X(o), m = local(lon, n), night = isNight(m), yy = y0 + 22 + (i % 3) * 36, on = n === ca || n === cb, el = S('g', { cls: 'hit' }, g); const tw = n.length * 7.6 + 22; S('rect', { x: o >= 11 ? x - tw : x - 10, y: yy - 14, width: tw, height: 28, rx: 14, fill: on ? 'var(--orange)' : 'transparent' }, el); S('circle', { cx: x, cy: yy, r: 6, fill: on ? '#fff' : night ? '#fff' : 'var(--ink)' }, el); text(el, x + (o >= 11 ? -9 : 9), yy, n, { 'font-size': 13, 'font-weight': 800, fill: on || night ? '#fff' : 'var(--ink)', 'text-anchor': o >= 11 ? 'end' : 'start' }); el.addEventListener('click', () => pickCity(n)); });
      const below = y0 + bh + 40;
      if (prob && !prob.row) { if (step >= 1) timeline(ca, cb, local(lon, ca), below + 70, ans); [ca, cb].forEach((n, i) => card(n, 40 + i * 190, 400, 170, 250, i === 1 && !ans && /What time|ahead or behind/.test(prob.q))); drawQuestion(440, 420, 46); return; }
      if (showAll) { const cols = 8, cw = 128, chh = 150, gx = 550 - cols * cw / 2, gy = below + 10; CITIES.forEach(([n], i) => { const x = gx + (i % cols) * cw, y = gy + Math.floor(i / cols) * (chh + 10), m = local(lon, n), night = isNight(m), hl = n === ca || n === cb; S('rect', { x: x + 4, y, width: cw - 8, height: chh, rx: 14, fill: night ? '#2a3a6e' : 'var(--board-2)', stroke: hl ? 'var(--orange)' : 'var(--line)', 'stroke-width': hl ? 3 : 1.5 }, g); text(g, x + cw / 2, y + 18, n, { 'font-size': 14, 'font-weight': 800, fill: night ? '#fff' : 'var(--ink)' }); clock(x + cw / 2, y + 66, 32, m, night); text(g, x + cw / 2, y + 118, T(m), { 'font-size': 17, 'font-weight': 800, cls: 'num', fill: night ? '#fff' : 'var(--ink)' }); text(g, x + cw / 2, y + 138, dayOf(m), { 'font-size': 13, fill: night ? '#cfd8ff' : 'var(--ink-3)', 'font-weight': dayOf(m) !== dayOf(lon) ? 800 : 500 }); const hit = S('rect', { x: x + 4, y, width: cw - 8, height: chh, fill: 'transparent', cls: 'hit' }, g); hit.addEventListener('click', () => pickCity(n)); }); return; }
      if (ca && cb) {
        const d = off(cb) - off(ca), msg = d === 0 ? `${cb} has the same time as ${ca}` : `${cb} is ${H2(d)} ${d > 0 ? 'ahead of' : 'behind'} ${ca}`;
        timeline(ca, cb, local(lon, ca), below + 70, true);
        card(ca, 40, 400, 170, 250); card(cb, 230, 400, 170, 250);
        text(g, 440, 440, msg, { 'font-size': 24, 'font-weight': 800, fill: 'var(--orange)', 'text-anchor': 'start' });
        [`${ca}: ${T(local(lon, ca))} on ${dayOf(local(lon, ca))}`, `${cb}: ${T(local(lon, cb))} on ${dayOf(local(lon, cb))}`, d > 0 ? `Going east, add ${H2(d)}.` : d < 0 ? `Going west, take away ${H2(-d)}.` : ''].forEach((l, i) => text(g, 440, 486 + i * 32, l, { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'start', cls: 'num', fill: 'var(--ink-2)' }));
        return;
      }
      text(g, 550, below + 90, ca ? `Now tap a second city to compare with ${ca}` : 'Tap two cities on the strip to compare their times', { 'font-size': 22, 'font-weight': 800, fill: 'var(--ink-3)' });
      text(g, 550, below + 126, 'Use the London time control to move the day and night across the world.', { 'font-size': 16, fill: 'var(--ink-3)' });
    }
    function pickCity(n) { if (prob && !prob.row) prob = null; if (n === ca) { ca = cb; cb = null; } else if (n === cb) cb = null; else if (!ca) ca = n; else if (!cb) cb = n; else { ca = cb; cb = n; } showAll = false; draw(); }
    // ---------- flights ----------
    const AIRLINES = ['Skyway', 'Northwind', 'Bluejet', 'Aurora Air'];
    function newFlights() {
      const routes = [['London', 'New York', 450], ['London', 'Dubai', 410], ['London', 'Tokyo', 720], ['Paris', 'Cairo', 270], ['London', 'Delhi', 540], ['New York', 'Los Angeles', 360], ['Sydney', 'Auckland', 190], ['London', 'Bangkok', 700], ['Beijing', 'Moscow', 450], ['Rio de Janeiro', 'London', 690], ['Dubai', 'Sydney', 830], ['Mexico City', 'New York', 270]];
      flights = shuffle(routes).slice(0, 6).map((r, i) => { const dep = rnd(6, 22) * 60 + rnd(0, 11) * 5; return { code: `${AIRLINES[i % 4]} ${rnd(101, 989)}`, from: r[0], to: r[1], dep, dur: r[2] + rnd(-2, 2) * 5 }; });
      prob = null; step = 0; ans = false; draw();
    }
    const arr = f => f.dep + f.dur + (off(f.to) - off(f.from)) * 60;
    function newProblem() {
      if (view === 'flights') { newFlights(); }
      const L = level, kinds = view === 'flights' ? ['land', 'dur', ...(L === 'easy' ? [] : ['land', 'dep'])] : ['conv', 'conv', 'diff', ...(L === 'easy' ? [] : ['conv2'])];
      const k = kinds[rnd(0, kinds.length - 1)];
      const pool = L === 'easy' ? CITIES.filter(x => Number.isInteger(x[1]) && Math.abs(x[1]) <= 5) : L === 'medium' ? CITIES.filter(x => Number.isInteger(x[1])) : CITIES;
      const pickC = () => pool[rnd(0, pool.length - 1)][0];
      if (k === 'conv') { const n = pickC() === 'London' ? 'Tokyo' : pickC(), t = rnd(L === 'easy' ? 9 : 0, L === 'easy' ? 15 : 23) * 60 + (L === 'easy' ? 0 : rnd(0, 3) * 15), d = off(n), r = t + d * 60; prob = { q: `It is ${T(t)} in London. What time is it in ${n}?`, work: [`${n} is ${H2(d)} ${d > 0 ? 'ahead of' : 'behind'} London.`, `${T(t)} ${d > 0 ? '+' : '−'} ${H2(d)} = ${T(r)}${dayOf(r) !== dayOf(t) ? ` on ${dayOf(r) === dayOf(t + 1440) ? 'the next day' : 'the day before'}` : ''}.`], ans: T(r) + (dayOf(r) !== dayOf(t) ? (r > t ? ' (next day)' : ' (day before)') : ''), show: { lon: t, ca: 'London', cb: n } }; }
      if (k === 'conv2') { let a = pickC(), b = pickC(); while (b === a) b = pickC(); const t = rnd(0, 23) * 60 + rnd(0, 3) * 15, d = off(b) - off(a), r = t + d * 60; prob = { q: `It is ${T(t)} in ${a}. What time is it in ${b}?`, work: [`${a} is ${H2(off(a))} ${off(a) >= 0 ? 'ahead of' : 'behind'} London; ${b} is ${H2(off(b))} ${off(b) >= 0 ? 'ahead of' : 'behind'} London.`, `So ${b} is ${H2(d)} ${d >= 0 ? 'ahead of' : 'behind'} ${a}.`, `${T(t)} ${d >= 0 ? '+' : '−'} ${H2(d)} = ${T(r)}${Math.floor(r / 1440) !== 0 ? (r >= 1440 ? ' the next day' : ' the day before') : ''}.`], ans: T(r) + (r >= 1440 ? ' (next day)' : r < 0 ? ' (day before)' : ''), show: { lon: t - off(a) * 60, ca: a, cb: b } }; }
      if (k === 'diff') { let a = pickC(), b = pickC(); while (b === a) b = pickC(); const d = off(b) - off(a); prob = { q: `How many hours ahead or behind ${a} is ${b}?`, work: [`${a}: ${off(a) === 0 ? 'London time' : H2(off(a)) + (off(a) > 0 ? ' ahead of' : ' behind') + ' London'}.`, `${b}: ${off(b) === 0 ? 'London time' : H2(off(b)) + (off(b) > 0 ? ' ahead of' : ' behind') + ' London'}.`, `Difference: ${H2(d)}.`], ans: `${H2(d)} ${d > 0 ? 'ahead' : 'behind'}`, show: { lon, ca: a, cb: b } }; }
      const f = flights ? flights[rnd(0, flights.length - 1)] : null;
      if (f && k === 'land') { const a2 = arr(f), atFrom = f.dep + f.dur, d = off(f.to) - off(f.from); prob = { q: `${f.code} leaves ${f.from} at ${T(f.dep)} and the flight takes ${D(f.dur)}. What is the local time in ${f.to} when it lands?`, row: f, hide: 'arr', work: [`Time in ${f.from} when it lands: ${T(f.dep)} + ${D(f.dur)} = ${T(atFrom)}.`, `${f.to} is ${H2(d)} ${d >= 0 ? 'ahead of' : 'behind'} ${f.from}.`, `${T(atFrom)} ${d >= 0 ? '+' : '−'} ${H2(d)} = ${T(a2)} in ${f.to}${a2 >= 1440 ? ' the next day' : ''}.`], ans: T(a2) + (a2 >= 1440 ? ' (next day)' : '') }; }
      if (f && k === 'dur') { const a2 = arr(f), d = off(f.to) - off(f.from); prob = { q: `${f.code} leaves ${f.from} at ${T(f.dep)} local time and lands in ${f.to} at ${T(a2)} local time${a2 >= 1440 ? ' the next day' : ''}. How long is the flight?`, row: f, hide: 'dur', work: [`Change the landing time to ${f.from} time. ${f.to} is ${H2(d)} ${d >= 0 ? 'ahead of' : 'behind'} ${f.from}.`, `${T(a2)} ${d >= 0 ? '−' : '+'} ${H2(d)} = ${T(f.dep + f.dur)} in ${f.from}.`, `From ${T(f.dep)} to ${T(f.dep + f.dur)} is ${D(f.dur)}.`], ans: D(f.dur) }; }
      if (f && k === 'dep') { const a2 = arr(f), d = off(f.to) - off(f.from); prob = { q: `${f.code} must land in ${f.to} at ${T(a2)} local time. The flight takes ${D(f.dur)}. What time must it leave ${f.from}, in ${f.from} time?`, row: f, hide: 'dep', work: [`Change the landing time to ${f.from} time: ${T(a2)} ${d >= 0 ? '−' : '+'} ${H2(d)} = ${T(f.dep + f.dur)}.`, `Count back the flight time: ${T(f.dep + f.dur)} − ${D(f.dur)} = ${T(f.dep)}.`], ans: T(f.dep) }; }
      step = 0; ans = false; showAll = false; if (prob && prob.show && view !== 'map') { view = 'map'; viewSeg.set('map', true); } if (prob && prob.show) ({ lon, ca, cb } = Object.assign({ lon, ca, cb }, prob.show, { lon: ((prob.show.lon % 1440) + 1440) % 1440 })); syncSel(); draw();
    }
    function wrapT(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function drawFlights() {
      if (!flights) return newFlights();
      const x0 = 30, w = 1040, rh = 46, y0 = 24;
      S('rect', { x: x0, y: y0, width: w, height: rh * 7 + 10, rx: 16, fill: '#1c2433' }, g);
      const cols = [['Flight', 20], ['From', 190], ['To', 380], ['Departs (local)', 570], ['Flight time', 740], ['Arrives (local)', 890]];
      cols.forEach(([h, x]) => text(g, x0 + x, y0 + 28, h, { 'font-size': 15, 'font-weight': 800, fill: '#ffcb3d', 'text-anchor': 'start' }));
      flights.forEach((f, i) => { const y = y0 + rh * (i + 1) + 26, hide = prob && prob.row && prob.row.code === f.code && !ans ? prob.hide : null, a2 = arr(f), hl = prob && prob.row && prob.row.code === f.code; if (hl) S('rect', { x: x0 + 6, y: y - 22, width: w - 12, height: rh - 4, rx: 10, fill: '#33415c' }, g); const cells = [f.code, f.from, f.to, hide === 'dep' ? '?' : T(f.dep), hide === 'dur' ? '?' : D(f.dur).replace(' hours', ' h').replace(' hour', ' h').replace(' minutes', ' min'), hide === 'arr' ? '?' : T(a2) + (a2 >= 1440 ? ' +1' : '')]; cells.forEach((t, j) => text(g, x0 + cols[j][1], y, t, { 'font-size': 18, 'font-weight': 700, fill: t === '?' ? '#ff8a7a' : '#f2f5ff', 'text-anchor': 'start', cls: 'num' })); });
      text(g, x0 + w - 16, y0 + rh * 7 + 30, '+1 means the next day', { 'font-size': 13, fill: 'var(--ink-3)', 'text-anchor': 'end' });
      // strip of the two zones for the selected flight
      if (prob && prob.row) { const f = prob.row, d = off(f.to) - off(f.from); text(g, 550, 400, `${f.to} is ${H2(d)} ${d >= 0 ? 'ahead of' : 'behind'} ${f.from}`, { 'font-size': 18, 'font-weight': 800, fill: 'var(--orange)' }); }
      drawQuestion(60, 440, 70);
    }
    function drawQuestion(x, y, wrapN) {
      if (!prob) { text(g, 550, y + 40, 'Tap New problem', { 'font-size': 18, fill: 'var(--ink-3)' }); return; }
      wrapT(prob.q, wrapN).forEach(l => { text(g, x, y, l, { 'font-size': 21, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp num' }); y += 28; });
      y += 8; prob.work.slice(0, step).forEach((w2, i) => { wrapT(`${i + 1}. ${w2}`, wrapN + 14).forEach(l => { text(g, x, y, l, { 'font-size': 17, 'text-anchor': 'start', fill: 'var(--ink-2)', 'font-weight': 600, cls: 'num' }); y += 23; }); });
      if (ans) { y += 6; S('rect', { x, y: y - 18, width: Math.max(260, prob.ans.length * 14 + 120), height: 40, rx: 12, fill: 'var(--green)' }, g); text(g, x + 16, y + 2, 'Answer: ' + prob.ans, { 'font-size': 20, 'font-weight': 800, fill: '#fff', 'text-anchor': 'start', cls: 'num' }); }
    }
    function draw() {
      clear(g); const defs = S('defs', {}, g), mk = S('marker', { id: 'wtarr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--orange)' }, mk); const mk2 = S('marker', { id: 'wtarr2', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-2)' }, mk2);
      if (view === 'map') drawMap(); else drawFlights();
    }
    // ---------- menu ----------
    const syncSel = () => { if (lonS) lonS.set(lon, true); };
    P.section('Show');
    const viewSeg = P.seg({ options: [['map', 'Time zones'], ['flights', 'Flights board']], value: view, onChange: v => { view = v; prob = null; draw(); } });
    P.seg({ label: 'Clock', options: [[false, '12-hour'], [true, '24-hour']], value: fmt24, onChange: v => { fmt24 = v; draw(); } });
    P.group('Time zones', { open: true, solo: false });
    const lonS = P.stepper({ label: 'London time', value: lon, min: -15, max: 1440, step: 15, fmt: v => T(v), onChange: v => { if (v < 0) v = 1425; if (v >= 1440) v = 0; lon = v; lonS.set(v, true); draw(); } });
    P.buttons([['Show all clocks', () => { view = 'map'; viewSeg.set('map', true); prob = null; showAll = !showAll; draw(); }], ['Reset', () => { view = 'map'; viewSeg.set('map', true); prob = null; ca = cb = null; showAll = false; lon = 12 * 60; lonS.set(lon, true); draw(); }]]);
    P.note('Tap two cities on the strip to compare them.');
    P.group('Problems', { open: true, solo: false });
    P.seg({ options: [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], value: level, onChange: v => { level = v; newProblem(); } });
    P.button('New problem', newProblem, 'primary');
    P.buttons([['Next step', () => { if (!prob) return newProblem(); if (step < prob.work.length) step++; else ans = true; draw(); }], ['Show answer', () => { if (!prob) return; step = prob.work.length; ans = true; draw(); }]]);
    c.pulseWhen(c.btn('Next step'), () => prob && !ans);
    P.note('Times are shown without summer time (daylight saving).');
    draw();
  }
});

