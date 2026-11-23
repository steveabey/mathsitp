/* ===== Number and place value ===== */

tool({
  id: 'counting', name: 'Counting', strand: 'number', years: [0, 1], w: 1000, h: 640,
  desc: 'Drag counters, hoops and ten frames onto a blank board to count, sort and group.',
  tags: 'objects hoops ten frame subitise sort colours',
  icon: '<circle cx="14" cy="14" r="5"/><circle cx="30" cy="12" r="5"/><circle cx="20" cy="30" r="5"/><circle cx="36" cy="32" r="5"/>',
  guide: ['Drag counters, a hoop or a ten frame from the tray at the bottom onto the board. Choose the shape of the counters in the panel.', 'Drop counters near a ten frame space and they snap in. Drag a ten frame by its dark tab, and resize it with the round handle at its corner. The counters inside grow and shrink with it.', 'Drag a hoop by its number tab and resize it with the handle on its rim. Objects inside move with the hoop.', 'Drop anything in the bin to remove it. A ten frame goes with the counters inside it. Clear the board removes everything.', 'Turn on Tap to count and tap each object in turn. The number track fills in the colours of the objects.'],
  mount(c) {
    const { svg, P } = c;
    const COLS = ['red', 'yellow', 'green', 'blue', 'purple', 'orange'];
    let hc = 'ink'; const hsoft = cl => cl === 'ink' ? 'var(--line)' : col(cl + '-s');
    let shape = 'circle', items = [], hoops = [], frames = [], tapMode = false, tapN = 0, showTotal = true, perColour = false, track = true, uid = 0;
    c.persist(() => ({ hc, shape, items, hoops, frames, tapMode, tapN, showTotal, perColour, track, uid }), s => ({ hc, shape, items, hoops, frames, tapMode, tapN, showTotal, perColour, track, uid } = Object.assign({ hc, shape, items, hoops, frames, tapMode, tapN, showTotal, perColour, track, uid }, s)));
    const bgG = S('g', {}, svg), hoopG = S('g', {}, svg), frameG = S('g', {}, svg), itemG = S('g', {}, svg), uiG = S('g', {}, svg), dragG = S('g', {}, svg);
    const bin = { x: 908, y: 552, w: 78, h: 78 }, trayY = 592;
    const inBin = p => p.x > bin.x - 24 && p.y > bin.y - 24;
    const cellPos = (f, k) => [f.x + (k % 5) * f.s + f.s / 2, f.y + Math.floor(k / 5) * f.s + f.s / 2];
    const scaleOf = it => { const f = frames.find(q => q.id === it.fid); return f ? f.s / 72 : 1; };
    function shapeEl(g, x, y, cl, sh = shape, sc = 1) {
      const f = col(cl), st = 'var(--ink)';
      if (sh === 'circle') S('circle', { cx: x, cy: y, r: 24 * sc, fill: f, stroke: st, 'stroke-width': 2 }, g);
      else if (sh === 'square') S('rect', { x: x - 22 * sc, y: y - 22 * sc, width: 44 * sc, height: 44 * sc, rx: 6 * sc, fill: f, stroke: st, 'stroke-width': 2 }, g);
      else if (sh === 'star') { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = (i % 2 ? 11 : 27) * sc; pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1)); } S('polygon', { points: pts.join(' '), fill: f, stroke: st, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); }
      else S('polygon', { points: `${x},${y - 26 * sc} ${x + 26 * sc},${y + 20 * sc} ${x - 26 * sc},${y + 20 * sc}`, fill: f, stroke: st, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    }
    const inHoop = (h, it) => !it.fid && Math.hypot(it.x - h.x, it.y - h.y) < h.r - 8;
    function snapCell(it) {
      let best = null, bd = Infinity;
      frames.forEach(f => { const used = new Set(items.filter(t => t !== it && t.fid === f.id).map(t => t.cell)); for (let k = 0; k < 10; k++) { if (used.has(k)) continue; const [x, y] = cellPos(f, k), d = Math.hypot(x - it.x, y - it.y); if (d < f.s * .7 && d < bd) { bd = d; best = [f, k]; } } });
      if (best) { it.fid = best[0].id; it.cell = best[1]; [it.x, it.y] = cellPos(best[0], best[1]); } else { it.fid = null; it.cell = -1; }
    }
    function trayDrag(el, make) { let ghost = null; c.drag(el, { start: () => { ghost = S('g', {}, dragG); }, move: p => { clear(ghost); make(ghost, p, true); }, end: p => { ghost.remove(); if (p.y < trayY - 40 && !inBin(p)) { make(null, p, false); draw(); } } }); }
    function draw() {
      [bgG, hoopG, frameG, itemG, uiG].forEach(clear);
      // tray
      S('rect', { x: 14, y: trayY - 38, width: 860, height: 76, rx: 16, fill: 'var(--board-2)', stroke: 'var(--line)' }, bgG);
      text(bgG, 30, trayY, 'Drag on', { 'font-size': 15, fill: 'var(--ink-3)', 'text-anchor': 'start' });
      COLS.forEach((cl, i) => { const px = 130 + i * 62, src = S('g', { cls: 'grab' }, uiG); shapeEl(src, px, trayY, cl, shape, .85); trayDrag(src, (gh, p, preview) => { if (preview) shapeEl(gh, p.x, p.y, cl); else { const it = { id: ++uid, x: p.x, y: p.y, c: cl, sh: shape, fid: null, cell: -1 }; snapCell(it); items.push(it); } }); });
      const hs = S('g', { cls: 'grab' }, uiG); S('circle', { cx: 540, cy: trayY, r: 26, fill: hsoft(hc), stroke: col(hc), 'stroke-width': 5 }, hs); text(hs, 540, trayY + 44, 'Hoop', { 'font-size': 12, fill: 'var(--ink-3)' });
      trayDrag(hs, (gh, p, preview) => { if (preview) S('circle', { cx: p.x, cy: p.y, r: 130, fill: hsoft(hc), 'fill-opacity': .4, stroke: col(hc), 'stroke-width': 5 }, gh); else hoops.push({ id: ++uid, x: p.x, y: p.y, r: 130, c: hc }); });
      const fs = S('g', { cls: 'grab' }, uiG); S('rect', { x: 606, y: trayY - 20, width: 100, height: 40, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, fs); for (let i = 1; i < 5; i++) S('line', { x1: 606 + i * 20, y1: trayY - 20, x2: 606 + i * 20, y2: trayY + 20, stroke: 'var(--ink)', 'stroke-width': 1.5 }, fs); S('line', { x1: 606, y1: trayY, x2: 706, y2: trayY, stroke: 'var(--ink)', 'stroke-width': 1.5 }, fs); text(fs, 656, trayY + 32, 'Ten frame', { 'font-size': 12, fill: 'var(--ink-3)' });
      trayDrag(fs, (gh, p, preview) => { if (preview) S('rect', { x: p.x - 180, y: p.y - 72, width: 360, height: 144, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-dasharray': '8 6' }, gh); else frames.push({ id: ++uid, x: clamp(p.x - 180, 0, 640), y: clamp(p.y - 72, 50, 400), s: 72 }); });
      S('rect', { x: bin.x, y: bin.y, width: bin.w, height: bin.h, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, bgG);
      S('path', { d: `M${bin.x + 22} ${bin.y + 24} h34 M${bin.x + 32} ${bin.y + 24} v-6 h14 v6 M${bin.x + 25} ${bin.y + 29} l3 34 h22 l3 -34`, stroke: 'var(--ink-2)', 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, bgG);
      // hoops
      hoops.forEach(h => {
        const g = S('g', {}, hoopG);
        S('circle', { cx: h.x, cy: h.y, r: h.r, fill: hsoft(h.c), 'fill-opacity': h.c === 'ink' ? .25 : .55, stroke: col(h.c), 'stroke-width': 6 }, g);
        const tab = S('g', { cls: 'grab' }, g);
        S('rect', { x: h.x - 34, y: h.y - h.r - 22, width: 68, height: 40, rx: 20, fill: col(h.c) }, tab);
        text(tab, h.x, h.y - h.r - 2, String(items.filter(it => inHoop(h, it)).length), { 'font-size': 26, 'font-weight': 700, fill: 'var(--board)', cls: 'disp num' });
        c.drag(tab, { start: p => { h.ox = p.x - h.x; h.oy = p.y - h.y; }, move: p => { const nx = clamp(p.x - h.ox, 30, 980), ny = clamp(p.y - h.oy, 40, 620), dx = nx - h.x, dy = ny - h.y; items.forEach(it => { if (inHoop(h, it)) { it.x += dx; it.y += dy; } }); h.x = nx; h.y = ny; draw(); }, end: p => { if (inBin(p) || inBin({ x: h.x, y: h.y })) { hoops.splice(hoops.indexOf(h), 1); draw(); } } });
        const hx = h.x + h.r * Math.SQRT1_2, hy = h.y + h.r * Math.SQRT1_2;
        const rs = S('g', { cls: 'grab' }, g); S('circle', { cx: hx, cy: hy, r: 15, fill: 'var(--board)', stroke: col(h.c), 'stroke-width': 4 }, rs); S('path', { d: `M${hx - 5} ${hy - 5} l10 10 M${hx + 1} ${hy + 5} h4 v-4 M${hx - 5} ${hy - 1} v-4 h4`, stroke: col(h.c), 'stroke-width': 2, fill: 'none' }, rs);
        c.drag(rs, { move: p => { h.r = clamp(Math.hypot(p.x - h.x, p.y - h.y), 60, 320); draw(); } });
      });
      // frames
      frames.forEach(f => {
        const g = S('g', {}, frameG), W5 = f.s * 5;
        S('rect', { x: f.x, y: f.y, width: W5, height: f.s * 2, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
        for (let i = 1; i < 5; i++) S('line', { x1: f.x + i * f.s, y1: f.y, x2: f.x + i * f.s, y2: f.y + f.s * 2, stroke: 'var(--ink)', 'stroke-width': 2 }, g);
        S('line', { x1: f.x, y1: f.y + f.s, x2: f.x + W5, y2: f.y + f.s, stroke: 'var(--ink)', 'stroke-width': 2 }, g);
        const tab = S('g', { cls: 'grab' }, g), n = items.filter(t => t.fid === f.id).length;
        S('rect', { x: f.x, y: f.y - 34, width: Math.max(120, W5 * .45), height: 32, rx: 10, fill: 'var(--ink)' }, tab);
        text(tab, f.x + Math.max(120, W5 * .45) / 2, f.y - 18, `✥  Ten frame  ${n}`, { 'font-size': 15, 'font-weight': 700, fill: 'var(--bg)' });
        let ox, oy; c.drag(tab, { start: p => { ox = p.x - f.x; oy = p.y - f.y; frameG.append(g); }, move: p => { f.x = clamp(p.x - ox, -W5 + 60, 960); f.y = clamp(p.y - oy, 36, 600); items.forEach(it => { if (it.fid === f.id) [it.x, it.y] = cellPos(f, it.cell); }); draw(); }, end: p => { if (inBin(p)) { items = items.filter(t => t.fid !== f.id); frames.splice(frames.indexOf(f), 1); draw(); } } });
        const rx = f.x + W5, ry = f.y + f.s * 2, rh = S('g', { cls: 'grab' }, g);
        S('circle', { cx: rx, cy: ry, r: 14, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, rh); S('path', { d: `M${rx - 5} ${ry - 5} l10 10 M${rx + 1} ${ry + 5} h4 v-4 M${rx - 5} ${ry - 1} v-4 h4`, stroke: 'var(--ink)', 'stroke-width': 2, fill: 'none' }, rh);
        c.drag(rh, { move: p => { f.s = clamp(Math.max((p.x - f.x) / 5, (p.y - f.y) / 2), 36, 120); items.forEach(it => { if (it.fid === f.id) [it.x, it.y] = cellPos(f, it.cell); }); draw(); } });
      });
      // items
      items.forEach(it => {
        const sc = it.fid ? scaleOf(it) : 1, g = S('g', { cls: 'grab' }, itemG); shapeEl(g, it.x, it.y, it.c, it.sh, sc);
        if (it.num) text(g, it.x, it.y + 1, String(it.num), { 'font-size': 22 * sc, 'font-weight': 800, fill: it.c === 'yellow' ? '#18202E' : '#fff', cls: 'disp num', 'pointer-events': 'none' });
        let moved = false, sx, sy;
        c.drag(g, {
          start: p => { moved = false; sx = p.x; sy = p.y; itemG.append(g); },
          move: p => { if (Math.hypot(p.x - sx, p.y - sy) > 4) moved = true; g.setAttribute('transform', `translate(${p.x - sx},${p.y - sy})`); },
          end: p => {
            if (!moved) { if (tapMode && !it.num) it.num = ++tapN; draw(); return; }
            if (inBin(p)) { items.splice(items.indexOf(it), 1); draw(); return; }
            it.x = clamp(it.x + p.x - sx, 20, 980); it.y = clamp(it.y + p.y - sy, 20, trayY - 44); snapCell(it); draw();
          }
        });
      });
      // track
      const order = tapMode && tapN ? items.filter(t => t.num).sort((a, b) => a.num - b.num) : COLS.flatMap(cl => items.filter(t => t.c === cl));
      if (track) {
        const len = Math.max(10, Math.min(30, Math.ceil(Math.max(items.length, 1) / 10) * 10)), tw = Math.min(44, 780 / len), x0 = 990 - len * tw;
        for (let i = 1; i <= len; i++) { const x = x0 + (i - 1) * tw, it = order[i - 1]; S('rect', { x, y: 12, width: tw, height: 46, fill: it ? col(it.c) : 'var(--board)', stroke: 'var(--ink-2)', 'stroke-width': 1.5 }, uiG); text(uiG, x + tw / 2, 35, String(i), { 'font-size': tw > 30 ? 18 : 13, cls: 'num', 'font-weight': it ? 800 : 400, fill: it ? (it.c === 'yellow' ? '#18202E' : '#fff') : 'var(--ink-3)' }); }
      }
      if (showTotal) { S('rect', { x: 18, y: 12, width: 92, height: 64, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line)' }, uiG); text(uiG, 64, 45, String(items.length), { 'font-size': 40, 'font-weight': 800, cls: 'disp num' }); }
      if (perColour) { const groups = []; ['circle', 'square', 'star', 'triangle'].forEach(sh => COLS.forEach(cl => { const n = items.filter(t => t.c === cl && t.sh === sh).length; if (n) groups.push([sh, cl, n]); })); groups.slice(0, 10).forEach(([sh, cl, n], row) => { shapeEl(uiG, 38, 106 + row * 44, cl, sh, .55); text(uiG, 66, 106 + row * 44, String(n), { 'font-size': 24, 'font-weight': 800, cls: 'num', 'text-anchor': 'start' }); }); }
      if (!items.length && !hoops.length && !frames.length) text(uiG, 500, 300, 'Drag counters, hoops or a ten frame up from the tray', { 'font-size': 24, fill: 'var(--ink-3)', 'font-weight': 700 });
    }
    P.section('Hoops');
    P.swatches({ label: 'Colour for new hoops', colors: ['ink', ...COLS], value: hc, onChange: v => { hc = v; draw(); } });
    P.section('Counters');
    P.seg({ label: 'Shape in the tray', options: [['circle', 'Counter'], ['square', 'Cube'], ['star', 'Star'], ['triangle', 'Triangle']], value: shape, onChange: v => { shape = v; draw(); } });
    P.section('Counting');
    P.toggle({ label: 'Tap to count', value: tapMode, onChange: v => { tapMode = v; if (!v) { items.forEach(i => i.num = 0); tapN = 0; } draw(); } });
    P.button('Start the count again', () => { items.forEach(i => i.num = 0); tapN = 0; draw(); });
    P.toggle({ label: 'Show total', value: showTotal, onChange: v => { showTotal = v; draw(); } });
    P.toggle({ label: 'Totals for each kind', value: perColour, onChange: v => { perColour = v; draw(); } });
    P.toggle({ label: 'Number track', value: track, onChange: v => { track = v; draw(); } });
    P.section();
    P.button('Clear the board', () => { items = []; hoops = []; frames = []; tapN = 0; draw(); }, 'primary');
    draw();
  }
});

tool({
  id: 'bead-string', name: 'Bead string', strand: 'number', years: [0, 1, 2, 3], w: 1160, h: 380,
  desc: 'A 10, 20 or 100 bead string in coloured groups for counting on and back. Tap or slide beads.',
  tags: 'count on back hundred bead bar',
  icon: '<path d="M4 24h40"/><circle cx="10" cy="24" r="4"/><circle cx="18" cy="24" r="4"/><circle cx="26" cy="24" r="4" fill="currentColor"/><circle cx="34" cy="24" r="4" fill="currentColor"/>',
  guide: ['Tap a bead to move it, and every bead after it, to the right. With 10 beads, tapping bead 8 moves beads 8, 9 and 10 across.', 'You can also slide beads: drag a bead to the right to push it and the beads after it across, or drag a bead on the right back to the left.', 'Use the +1, −1, +10 and −10 buttons to count on and back in ones and tens.', 'The number above shows how many beads are on the left. Hide it to ask the class.'],
  mount(c) {
    const { svg, P } = c;
    let N = 10, L = 10, showCount = true, showHover = true, group = 5;
    c.persist(() => ({ N, L, showCount, showHover, group }), s => ({ N, L, showCount, showHover, group } = Object.assign({ N, L, showCount, showHover, group }, s)));
    const g = S('g', {}, svg), lbl = S('g', {}, svg), hov = S('g', {}, svg);
    let beads = [], pos = [], target = [];
    const geo = () => { const d = Math.min(64, 1060 / (N + 4)), r = d * .47; return { d, r, x0: 40 + r, x1: 1120 - r }; };
    function layout() { const { d, x0, x1 } = geo(); target = []; for (let i = 0; i < N; i++) target[i] = i < L ? x0 + i * d : x1 - (N - 1 - i) * d; }
    function build() {
      clear(g); beads = [];
      const { r, d } = geo(); layout();
      S('line', { x1: 24, y1: 220, x2: 1136, y2: 220, stroke: 'var(--ink-3)', 'stroke-width': 3 }, g);
      S('rect', { x: 14, y: 190, width: 14, height: 60, rx: 4, fill: 'var(--ink-2)' }, g); S('rect', { x: 1132, y: 190, width: 14, height: 60, rx: 4, fill: 'var(--ink-2)' }, g);
      for (let i = 0; i < N; i++) {
        const cl = Math.floor(i / group) % 2 ? 'var(--bead-b)' : 'var(--bead-a)';
        const b = bead(g, 0, 220, r, cl, { cls: 'grab' }, Math.min(r * 1.9, 36));
        let sx, moved;
        c.drag(b, {
          start: p => { sx = p.x; moved = false; },
          move: p => { const dx = p.x - sx; if (Math.abs(dx) > 6) moved = true; if (dx > d * .5 && i < L) { L = i; update(); } else if (dx < -d * .5 && i >= L) { L = i + 1; update(); } },
          end: () => { if (!moved) { L = i; update(); } }
        });
        b.addEventListener('pointerenter', () => showHover && hoverAt(i));
        b.addEventListener('pointerleave', () => clear(hov));
        beads.push(b);
      }
      if (pos.length !== N) pos = target.slice();
      update();
    }
    function hoverAt(i) { clear(hov); const x = pos[i]; S('rect', { x: x - 26, y: 268, width: 52, height: 34, rx: 8, fill: 'var(--ink)' }, hov); text(hov, x, 285, String(i + 1), { fill: 'var(--board)', 'font-size': 18, 'font-weight': 700, cls: 'num' }); }
    function update() {
      layout(); clear(lbl); if (!showCount) return;
      const { d } = geo(), xe = L ? target[L - 1] + d / 2 : 40;
      if (L) S('path', { d: `M40 162 V152 H${xe} V162`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }, lbl);
      text(lbl, Math.max(100, Math.min(1060, (40 + xe) / 2)), 104, String(L), { 'font-size': 64, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' });
      if (N - L) text(lbl, 1090, 110, String(N - L), { 'font-size': 30, 'font-weight': 700, cls: 'disp num', fill: 'var(--ink-3)' });
    }
    c.raf(() => { for (let i = 0; i < N; i++) { const dx = target[i] - pos[i]; if (Math.abs(dx) > .2) pos[i] += dx * .22; else pos[i] = target[i]; beads[i] && beads[i].setAttribute('transform', `translate(${pos[i]},0)`); } });
    P.section('String');
    P.seg({ label: 'Beads on the string', options: [[10, '10'], [20, '20'], [50, '50'], [100, '100']], value: N, onChange: v => { N = v; L = Math.min(L, N); pos = []; build(); } });
    P.seg({ label: 'Colour change every', options: [[5, '5 beads'], [10, '10 beads']], value: group, onChange: v => { group = v; build(); } });
    P.section('Move beads');
    P.buttons([['− 10', () => { L = Math.max(0, L - 10); update(); }], ['− 1', () => { L = Math.max(0, L - 1); update(); }], ['+ 1', () => { L = Math.min(N, L + 1); update(); }], ['+ 10', () => { L = Math.min(N, L + 10); update(); }]]);
    P.buttons([['All left', () => { L = N; update(); }], ['All right', () => { L = 0; update(); }]]);
    P.section('Show');
    P.toggle({ label: 'Count on the left', value: showCount, onChange: v => { showCount = v; update(); } });
    P.toggle({ label: 'Bead number when pointing', value: showHover, onChange: v => { showHover = v; clear(hov); } });
    build();
  }
});

tool({
  id: 'bead-sticks', name: 'Bead sticks', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'An abacus from ones up to millions, with exchange and a step-by-step calculation.',
  tags: 'abacus spike place value exchange millions',
  icon: '<path d="M10 40V8M24 40V8M38 40V8M4 40h40"/><circle cx="10" cy="34" r="3.5" fill="currentColor"/><circle cx="24" cy="34" r="3.5" fill="currentColor"/><circle cx="24" cy="27" r="3.5" fill="currentColor"/><circle cx="38" cy="34" r="3.5" fill="currentColor"/>',
  guide: ['Tap + or − under a stick, or tap the stick itself, to add or take away a bead.', 'With exchange on, a tenth bead swaps for one bead on the next stick. Taking from an empty stick exchanges from the next stick along.', 'For a calculation: make the first number, tap Add or Subtract, then change the beads. The calculation builds at the top of the board.', 'Turn exchange off to let beads build up to 15, then tap Exchange ten to model regrouping.'],
  mount(c) {
    const { svg, P } = c;
    let sticks = 4, counts = [0, 0, 0, 0, 0, 0, 0], auto = true, showEach = true, showTotal = true, calc = null;
    const g = S('g', {}, svg);
    const total = () => counts.reduce((s, v, i) => s + v * 10 ** (6 - i), 0);
    function draw() {
      clear(g);
      const first = 7 - sticks, idx = [...Array(sticks).keys()].map(k => k + first), sp = 860 / sticks, bw = Math.min(68, sp * .66);
      S('rect', { x: 70, y: 490, width: 860, height: 24, rx: 8, fill: 'var(--ink-2)' }, g);
      idx.forEach((i, k) => {
        const p = 6 - i, x = 70 + sp * k + sp / 2, cl = PV_COLS[p];
        const sg = S('g', { cls: 'hit' }, g);
        S('rect', { x: x - 6, y: 150, width: 12, height: 342, rx: 6, fill: 'var(--line-2)' }, sg);
        S('rect', { x: x - sp / 2 + 6, y: 140, width: sp - 12, height: 352, fill: 'transparent' }, sg);
        sg.addEventListener('click', () => add(i, 1));
        for (let b = 0; b < counts[i]; b++) {
          const y = 476 - b * 21.5, bb = S('g', { opacity: b >= 10 ? .55 : 1 }, sg);
          S('rect', { x: x - bw / 2, y: y - 10, width: bw, height: 20, rx: 10, fill: col(cl), stroke: 'var(--bead-edge)', 'stroke-width': 1.3 }, bb);
          S('rect', { x: x - bw / 2 + 8, y: y - 7, width: bw * .3, height: 5, rx: 2.5, fill: '#fff', opacity: .4 }, bb);
        }
        text(g, x, 540, PV_NAMES[p], { 'font-size': sticks > 5 ? 22 : 28, 'font-weight': 700, cls: 'disp', fill: col(cl) });
        if (showEach) text(g, x, 125, String(counts[i]), { 'font-size': 32, 'font-weight': 800, cls: 'disp num', fill: col(cl) });
        const mk = (dx, t, d) => { const b = S('g', { cls: 'hit' }, g); S('circle', { cx: x + dx, cy: 594, r: 21, fill: d > 0 ? 'var(--accent)' : 'var(--board-2)', stroke: d > 0 ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': 1.5 }, b); text(b, x + dx, 595, t, { 'font-size': 26, 'font-weight': 800, fill: d > 0 ? 'var(--accent-ink)' : 'var(--ink)' }); b.addEventListener('click', () => add(i, d)); };
        mk(-25, '−', -1); mk(25, '+', 1);
      });
      const T = total();
      if (calc) {
        const d = T - calc.start, ok = calc.op === '+' ? d >= 0 : d <= 0;
        S('rect', { x: 120, y: 14, width: 760, height: 84, rx: 18, fill: 'var(--accent-soft)' }, g);
        const eq = d === 0 ? `${big(calc.start)} ${calc.op} ? = ?` : ok ? `${big(calc.start)} ${calc.op} ${big(Math.abs(d))} = ${big(T)}` : `${big(calc.start)} ${calc.op} ?`;
        text(g, 500, 48, eq, { 'font-size': 38, 'font-weight': 800, cls: 'disp num' });
        text(g, 500, 82, d === 0 ? (calc.op === '+' ? 'Now add beads with the + buttons' : 'Now take beads away with the − buttons') : ok ? 'Keep going, or tap Finish when the calculation is done' : (calc.op === '+' ? 'This is an addition: use the + buttons' : 'This is a subtraction: use the − buttons'), { 'font-size': 17, fill: 'var(--ink-2)' });
      } else if (showTotal) text(g, 500, 56, big(T), { 'font-size': 46, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' });
      stepNote.textContent = calc ? 'Step 3: change the beads. The calculation is on the board.' : 'Step 1: make the first number on the sticks. Step 2: tap Add or Subtract.';
    }
    function add(i, d) {
      const first = 7 - sticks;
      if (d > 0) {
        if (counts[i] >= (auto ? 9 : 15)) {
          if (!auto) return c.toast('Fifteen beads is the most a stick holds. Exchange ten first.');
          if (i === first) return c.toast('That is the biggest number these sticks can show');
          counts[i] = 0; add(i - 1, 1); return;
        }
        counts[i]++;
      } else {
        if (counts[i] === 0) {
          if (!auto) return;
          let j = i - 1; while (j >= first && counts[j] === 0) j--; if (j < first) return;
          counts[j]--; for (let k = j + 1; k < i; k++) counts[k] = 9; counts[i] = 9;
        } else counts[i]--;
      }
      draw();
    }
    const normal = () => { for (let i = 6; i > 0; i--) while (counts[i] > 9) { counts[i] -= 10; counts[i - 1]++; } };
    P.section('Sticks');
    P.stepper({ label: 'Columns', value: sticks, min: 2, max: 7, fmt: v => PV_NAMES[v - 1], onChange: v => { sticks = v; for (let i = 0; i < 7 - v; i++) counts[i] = 0; draw(); } });
    P.toggle({ label: 'Exchange automatically', value: auto, onChange: v => { auto = v; if (v) normal(); draw(); } });
    P.button('Exchange ten', () => { for (let i = 6; i > 7 - sticks; i--) if (counts[i] >= 10) { counts[i] -= 10; counts[i - 1]++; draw(); return; } c.toast('No stick has ten beads to exchange'); });
    P.section('Calculation');
    const stepNote = P.note('');
    P.buttons([['Add', () => { calc = { op: '+', start: total() }; draw(); }, 'primary'], ['Subtract', () => { calc = { op: '−', start: total() }; draw(); }, 'primary']]);
    P.button('Finish', () => { if (calc) { c.toast(calc.op === '+' ? 'Addition finished' : 'Subtraction finished'); calc = null; draw(); } });
    P.section('Show');
    P.toggle({ label: 'Beads on each stick', value: showEach, onChange: v => { showEach = v; draw(); } });
    P.toggle({ label: 'Total', value: showTotal, onChange: v => { showTotal = v; draw(); } });
    P.section();
    P.buttons([['Random number', () => { counts = counts.map((_, i) => i < 7 - sticks ? 0 : rnd(0, 9)); calc = null; draw(); }], ['Clear', () => { counts = counts.map(() => 0); calc = null; draw(); }]]);
    draw();
  }
});

tool({
  id: 'place-value', name: 'Place value', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 680,
  desc: 'Arrow cards up to millions that split and combine, with labelled place value blocks.',
  tags: 'arrow cards partition dienes base ten millions',
  icon: '<rect x="4" y="12" width="26" height="18" rx="3"/><rect x="18" y="18" width="18" height="18" rx="3"/><rect x="28" y="24" width="16" height="16" rx="3"/>',
  guide: ['Set each digit with the controls, or pick a random number.', 'Split pulls the arrow cards apart. Combine slides them back to make the number.', 'Drag any card to move it. It stays where you put it, even when you change other digits. Tap Tidy up to put every card back in line.', 'Blocks for ones, tens and hundreds are to scale. Thousands and above are labelled blocks, which are not to scale.'],
  mount(c) {
    const { svg, P } = c;
    let digits = [0, 0, 0, 0, 0, 0, 0], split = false, blocks = true, showWords = true, moved = {};
    c.persist(() => ({ digits, split, blocks, showWords, moved }), s => ({ digits, split, blocks, showWords, moved } = Object.assign({ digits, split, blocks, showWords, moved }, s)));
    const g = S('g', {}, svg), bg = S('g', {}, svg), wg = S('g', {}, svg);
    const value = () => digits.reduce((s, d, i) => s + d * 10 ** (6 - i), 0);
    function layout() {
      const parts = digits.map((d, i) => ({ d, i, p: 6 - i, len: 7 - i })).filter(q => q.d);
      if (!parts.length) parts.push({ d: 0, i: 6, p: 0, len: 1 });
      const nd = parts[0].len, sumLen = parts.reduce((t, q) => t + q.len, 0);
      let cw = nd <= 4 ? 88 : nd === 5 ? 80 : nd === 6 ? 70 : 62;
      if (split) cw = Math.min(cw, 1800 / (sumLen + parts.length * .5));
      const hgt = Math.round(cw * 1.4);
      const pos = {};
      if (!split) { const x0 = 500 - nd * cw / 2; parts.forEach(q => pos[q.i] = [x0 + (nd - q.len) * cw, 40]); }
      else { let x = 30, y = 40, rowW = []; parts.forEach(q => { const w = q.len * cw; if (x + w > 970) { x = 30; y += hgt + 40; } pos[q.i] = [x, y]; x += w + 26; }); const shiftRows = {}; parts.forEach(q => { const [px, py] = pos[q.i]; shiftRows[py] = Math.max(shiftRows[py] || 0, px + q.len * cw); }); parts.forEach(q => { const [px, py] = pos[q.i]; pos[q.i] = [px + (970 - shiftRows[py]) / 2 - 15 + 15, py]; }); }
      return { parts, cw, hgt, pos };
    }
    function draw() {
      clear(g); clear(bg); clear(wg);
      const { parts, cw, hgt, pos } = layout();
      parts.forEach(q => {
        const w = q.len * cw, [ax, ay] = moved[q.i] || pos[q.i], cl = PV_COLS[q.p];
        const grp = S('g', { cls: 'grab', style: `transform:translate(${ax}px,${ay}px);transition:transform .55s cubic-bezier(.3,.8,.3,1)` }, g);
        S('path', { d: `M0 10 Q0 0 10 0 H${w - 10} Q${w} 0 ${w} 10 V${hgt - 10} Q${w} ${hgt} ${w - 10} ${hgt} H${cw * .5 + 14} L${cw * .25 + 6} ${hgt + 16} L${cw * .25 + 6} ${hgt} H10 Q0 ${hgt} 0 ${hgt - 10} Z`, fill: 'var(--board)', stroke: col(cl), 'stroke-width': 3 }, grp);
        [...String(q.d * 10 ** q.p)].forEach((ch, k) => text(grp, k * cw + cw / 2, hgt / 2 + 3, ch, { 'font-size': cw * 1.05, 'font-weight': 800, cls: 'disp num', fill: k === 0 ? col(cl) : 'var(--ink)' }));
        let ox, oy, bx, by;
        c.drag(grp, { start: p => { [bx, by] = moved[q.i] || pos[q.i]; ox = p.x; oy = p.y; grp.style.transition = 'none'; g.append(grp); }, move: p => { grp.style.transform = `translate(${bx + p.x - ox}px,${by + p.y - oy}px)`; }, end: p => { moved[q.i] = [bx + p.x - ox, by + p.y - oy]; grp.style.transition = 'transform .55s cubic-bezier(.3,.8,.3,1)'; } });
      });
      const v = value();
      const bottom = Math.max(...parts.map(q => (moved[q.i] || pos[q.i])[1])) + hgt + 30;
      if (showWords) { text(wg, 500, Math.max(330, bottom + 10), big(v), { 'font-size': 30, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' }); text(wg, 500, Math.max(330, bottom + 10) + 32, numWords(v), { 'font-size': numWords(v).length > 70 ? 16 : 21, fill: 'var(--ink-2)' }); }
      if (blocks) drawBlocks();
    }
    function drawBlocks() {
      const u = 8, groups = [];
      digits.forEach((d, i) => { const p = 6 - i; if (!d) return; let w; if (p >= 3) w = (88 + (p - 3) * 10) + (d - 1) * 12; else if (p === 2) w = 10 * u + (d - 1) * 12; else if (p === 1) w = d * (u + 5); else w = Math.min(d, 5) * (u + 5); groups.push({ d, p, w }); });
      if (!groups.length) return;
      const tot = groups.reduce((s, q) => s + q.w, 0) + (groups.length - 1) * 34, sc = Math.min(1.25, 960 / tot);
      const root = S('g', { transform: `translate(${500 - tot * sc / 2},${640}) scale(${sc})` }, bg);
      let x = 0;
      const sq = (gx, gy, w, h, cl, grid) => { S('rect', { x: gx, y: gy, width: w, height: h, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 1.4 }, root); if (grid) { for (let j = 1; j < w / u; j++) S('line', { x1: gx + j * u, y1: gy, x2: gx + j * u, y2: gy + h, stroke: col(cl), 'stroke-width': .5 }, root); for (let j = 1; j < h / u; j++) S('line', { x1: gx, y1: gy + j * u, x2: gx + w, y2: gy + j * u, stroke: col(cl), 'stroke-width': .5 }, root); } };
      groups.forEach(({ d, p, w }) => {
        const cl = PV_COLS[p];
        if (p >= 3) {
          const s = 88 + (p - 3) * 10, dep = 14;
          for (let k = 0; k < d; k++) {
            const bx = x + k * 12, by = -s - k * 12;
            S('path', { d: `M${bx} ${by} l${dep} ${-dep} h${s} l${-dep} ${dep} Z`, fill: col(cl), opacity: .55 }, root);
            S('path', { d: `M${bx + s} ${by} l${dep} ${-dep} v${s} l${-dep} ${dep} Z`, fill: col(cl), opacity: .8 }, root);
            S('rect', { x: bx, y: by, width: s, height: s, rx: 4, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 2 }, root);
            if (k === d - 1) { text(root, bx + s / 2, by + s * .42, big(10 ** p), { 'font-size': s * (p >= 6 ? .17 : .2), 'font-weight': 800, cls: 'disp num', fill: col(cl) }); text(root, bx + s / 2, by + s * .66, PLACE_WORD[p], { 'font-size': Math.min(13, s * .13), 'font-weight': 700, fill: 'var(--ink-2)' }); }
          }
        } else if (p === 2) for (let k = 0; k < d; k++) sq(x + k * 12, -10 * u - k * 12, 10 * u, 10 * u, cl, true);
        else if (p === 1) for (let k = 0; k < d; k++) sq(x + k * (u + 5), -10 * u, u, 10 * u, cl, true);
        else for (let k = 0; k < d; k++) sq(x + (k % 5) * (u + 5), -u - Math.floor(k / 5) * (u + 5), u, u, cl, false);
        text(root, x + w / 2, 22, `${d} ${PLACE_WORD[p]}${d > 1 ? (p ? 's' : 's') : ''}`, { 'font-size': 15, 'font-weight': 700, fill: col(cl) });
        x += w + 34;
      });
    }
    P.section('Number');
    const st = ['Millions', 'Hundred thousands', 'Ten thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones'].map((l, i) => P.stepper({ label: l, value: digits[i], min: 0, max: 9, onChange: v => { digits[i] = v; if (!v) delete moved[i]; draw(); } }));
    P.seg({ label: 'Random number up to', options: [[100, '100'], [1000, '1,000'], [10000, '10,000'], [1e6, '1 million'], [1e7, '9,999,999']], value: null, retrigger: true, onChange: m => { const n = rnd(Math.ceil(m / 10), m - 1); [...String(n).padStart(7, '0')].forEach((d, i) => { digits[i] = +d; st[i].set(+d, true); }); moved = {}; draw(); } });
    P.section('Cards');
    P.seg({ options: [[false, 'Combine'], [true, 'Split']], value: split, retrigger: true, onChange: v => { split = v; moved = {}; draw(); } });
    P.button('Tidy up the cards', () => { moved = {}; draw(); });
    P.section('Show');
    P.toggle({ label: 'Place value blocks', value: blocks, onChange: v => { blocks = v; draw(); } });
    P.toggle({ label: 'Number in figures and words', value: showWords, onChange: v => { showWords = v; draw(); } });
    draw();
  }
});

tool({
  id: 'moving-digits', name: 'Moving digits', strand: 'number', years: [3, 4, 5, 6], w: 1000, h: 700,
  desc: 'Digits slide across a place value chart when you multiply or divide by 10, 100 and 1000, with Dienes blocks, ×10 arcs and rounding.',
  tags: 'multiply divide 10 100 1000 decimals rounding billion gattegno dienes base ten arcs',
  icon: '<path d="M6 10v28M18 10v28M30 10v28M42 10v28"/><path d="M34 24H12m0 0l5-5m-5 5l5 5"/>',
  guide: ['Type a number up to one billion, with up to three decimal places, or pick a Random number. Choose how big the random number should be, or how many decimal places.', 'Tap ×10, ×100, ÷10 or ÷100. The digits move columns while the decimal point stays still. Grey zeros are place holders.', 'Dienes blocks under each column show what each digit is worth. Ones, tens and hundreds are to scale. Thousands and bigger, and the decimal places, are labelled blocks.', 'Arcs above the chart show that each column is 10 times the one to its right. Choose arcs between next-door columns, or arcs from the ones column showing ×10, ×100, ×1,000 and so on.', 'Turn on rounding and choose what to round to. A number line shows the two multiples either side and the halfway point.'],
  mount(c) {
    const { svg, P } = c;
    let commas = true, v = 0, busy = false, labels = true, log = [], rOn = false, rTo = 100, dienes = true, arcs = true, arcMode = 'next';
    c.persist(() => ({ commas, v, labels, log, rOn, rTo, dienes, arcs, arcMode }), s => ({ commas, v, labels, log, rOn, rTo, dienes, arcs, arcMode } = Object.assign({ commas, v, labels, log, rOn, rTo, dienes, arcs, arcMode }, s)));
    const defs = S('defs', {}, svg);
    const MC = p => ['red', 'blue', 'green', 'purple', 'teal', 'orange', 'pink'][((p % 7) + 7) % 7];
    ['red', 'blue', 'green', 'purple', 'teal', 'orange', 'pink'].forEach(cl => { const m = S('marker', { id: 'mda-' + cl, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: col(cl) }, m); });
    const WORD = { 9: 'billion', 8: 'hundred million', 7: 'ten million', 6: 'million', 5: 'hundred thousand', 4: 'ten thousand', 3: 'thousand', 2: 'hundred', 1: 'ten', 0: 'one', '-1': 'tenth', '-2': 'hundredth', '-3': 'thousandth' };
    const pv = p => p >= 0 ? big(10 ** p) : '0.' + '0'.repeat(-p - 1) + '1';
    const g = S('g', {}, svg), ag = S('g', {}, svg), dg = S('g', {}, svg), rg = S('g', {}, svg), lg = S('g', {}, svg);
    const dig = (val, p) => Math.floor(val / 10 ** (p + 3)) % 10;
    const hiOf = val => { for (let p = 9; p >= 0; p--) if (dig(val, p)) return p; return 0; };
    const loOf = val => { for (let p = -3; p < 0; p++) if (dig(val, p)) return p; return 0; };
    const fmt = val => { const i = Math.floor(val / 1000), f = val % 1000; return (commas ? big(i) : String(i)) + (f ? '.' + String(f).padStart(3, '0').replace(/0+$/, '') : ''); };
    let geo;
    const BH = 168;
    function grid(top) {
      clear(g); clear(ag); const n = top + 4, cw = Math.min(112, 960 / n), x0 = 500 - n * cw / 2;
      const T = arcs ? 30 + Math.min(120, 26 + (arcMode === 'ones' ? 13 : 4) * n) : 24;
      const CH = 210 + (dienes ? BH : 0);
      geo = { top, cw, x0, T, CH, X: p => x0 + (top - p) * cw, bottom: T + CH };
      const rp = rOn ? Math.round(Math.log10(rTo)) : null;
      for (let p = top; p >= -3; p--) {
        const x = geo.X(p), isR = rp != null && p === rp, isD = rp != null && p === rp - 1;
        S('rect', { x, y: T, width: cw, height: CH, fill: isR ? 'var(--yellow-s)' : p < 0 ? 'var(--orange-s)' : ((top - p) % 2 ? 'var(--board-2)' : 'var(--board)'), stroke: isD ? 'var(--red)' : 'var(--line)', 'stroke-width': isD ? 4 : 1.5 }, g);
        if (labels) text(g, x + cw / 2, T + 28, PV_NAMES[p], { 'font-size': cw > 80 ? 24 : 18, 'font-weight': 700, cls: 'disp', fill: col(MC(p)) });
        if (dienes) S('line', { x1: x + 8, y1: T + 212, x2: x + cw - 8, y2: T + 212, stroke: 'var(--line)', 'stroke-dasharray': '4 4' }, g);
      }
      S('circle', { cx: geo.X(-1), cy: T + 180, r: 10, fill: 'var(--ink)' }, g);
      if (arcs) drawArcs();
    }
    function arc(p1, p2, h, cl, label, lx, ly) {
      const xa = geo.X(p1) + geo.cw / 2, xb = geo.X(p2) + geo.cw / 2, y = geo.T - 4;
      S('path', { d: `M${xa} ${y} C${xa} ${y - h * 1.3} ${xb} ${y - h * 1.3} ${xb} ${y - 3}`, fill: 'none', stroke: col(cl), 'stroke-width': 3, 'marker-end': `url(#mda-${cl})` }, ag);
      const t = text(ag, lx ?? (xa + xb) / 2, ly ?? y - h - 6, label, { 'font-size': 15, 'font-weight': 800, cls: 'num', fill: col(cl) });
      const bb = t.getBBox(); const r = S('rect', { x: bb.x - 4, y: bb.y - 1, width: bb.width + 8, height: bb.height + 2, rx: 6, fill: 'var(--board)' }, ag); ag.insertBefore(r, t);
    }
    function drawArcs() {
      const { top, cw, T } = geo, hMax = T - 34;
      if (arcMode === 'next') {
        for (let p = -3; p < top; p++) arc(p, p + 1, Math.min(hMax, cw * .32 + 10), MC(p + 1), '×10');
      } else {
        for (let p = 1; p <= top; p++) { const h = 18 + (hMax - 18) * (p / Math.max(top, 3)); arc(0, p, h, MC(p), '×' + big(10 ** p), geo.X(p) + cw / 2, T - 28); }
        for (let p = -1; p >= -3; p--) { const h = 18 + (hMax - 18) * (-p / Math.max(top, 3)); arc(0, p, h, MC(p), '÷' + big(10 ** -p), geo.X(p) + cw / 2, T - 28); }
      }
    }
    // ---------- Dienes ----------
    function cube(gp, x, y, s, cl, dep) {
      S('path', { d: `M${x} ${y} l${dep} ${-dep} h${s} l${-dep} ${dep} Z`, fill: col(cl), opacity: .5, stroke: col(cl), 'stroke-width': .8 }, gp);
      S('path', { d: `M${x + s} ${y} l${dep} ${-dep} v${s} l${-dep} ${dep} Z`, fill: col(cl), opacity: .8, stroke: col(cl), 'stroke-width': .8 }, gp);
      S('rect', { x, y, width: s, height: s, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 1.4 }, gp);
    }
    function blocks(gp, p, d, cx) {
      if (!d) return;
      const { cw, T } = geo, Y0 = T + 222, Y1 = T + 210 + BH - 26, cl = MC(p);
      const u = clamp(Math.floor(cw / 11), 6, 9);
      if (p === 0) {
        const s = u + 2, gap = 5, cols = 3, w = cols * (s + gap) - gap, x0 = cx - w / 2;
        for (let k = 0; k < d; k++) { const r = Math.floor(k / cols), q = k % cols; cube(gp, x0 + q * (s + gap), Y1 - (r + 1) * (s + gap) + 4, s, cl, 4); }
      } else if (p === 1) {
        const step = Math.min(u + 4, (cw - 20 - u) / Math.max(1, d - 1)), w = (d - 1) * step + u, x0 = cx - w / 2;
        for (let k = 0; k < d; k++) { const x = x0 + k * step; S('path', { d: `M${x} ${Y1 - 10 * u} l3 -3 h${u} l-3 3 Z M${x + u} ${Y1 - 10 * u} l3 -3 v${10 * u} l-3 3 Z`, fill: col(cl), opacity: .6 }, gp); S('rect', { x, y: Y1 - 10 * u, width: u, height: 10 * u, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 1.3 }, gp); for (let j = 1; j < 10; j++) S('line', { x1: x, y1: Y1 - j * u, x2: x + u, y2: Y1 - j * u, stroke: col(cl), 'stroke-width': .6 }, gp); }
      } else if (p === 2) {
        const s = 10 * u, off = Math.min(7, (Y1 - Y0 - s - 6) / Math.max(1, d - 1), (cw - 10 - s) / Math.max(1, d - 1)), x0 = cx - s / 2 - (d - 1) * off / 2;
        for (let k = 0; k < d; k++) { const x = x0 + k * off, y = Y1 - s - k * off; S('rect', { x, y, width: s, height: s, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 1.4 }, gp); if (k === d - 1) for (let j = 1; j < 10; j++) { S('line', { x1: x + j * u, y1: y, x2: x + j * u, y2: y + s, stroke: col(cl), 'stroke-width': .5 }, gp); S('line', { x1: x, y1: y + j * u, x2: x + s, y2: y + j * u, stroke: col(cl), 'stroke-width': .5 }, gp); } }
      } else {
        const s = p > 0 ? Math.min(cw - 40, 74) : Math.min(cw - 40, 58), dep = Math.round(s * .14), off = Math.max(1.5, Math.min(7, (Y1 - Y0 - s - dep - 4) / Math.max(1, d - 1), (cw - 8 - s - dep) / Math.max(1, d - 1)));
        const x0 = cx - (s + dep) / 2 - (d - 1) * off / 2;
        for (let k = 0; k < d; k++) cube(gp, x0 + k * off, Y1 - s - k * off, s, cl, dep);
        const tx = x0 + (d - 1) * off + s / 2, ty = Y1 - s - (d - 1) * off, lab = pv(p);
        text(gp, tx, ty + s * .4, lab, { 'font-size': Math.min(s * .26, s * 1.7 / lab.length), 'font-weight': 800, cls: 'disp num', fill: col(cl) });
        text(gp, tx, ty + s * .7, WORD[p], { 'font-size': Math.min(12, s * 1.6 / WORD[p].length), 'font-weight': 700, fill: 'var(--ink-2)' });
      }
      text(gp, cx, Y1 + 14, `${d} × ${pv(p)}`, { 'font-size': cw > 90 ? 15 : 12, 'font-weight': 700, fill: col(cl), cls: 'num' });
    }
    function drawDigits() {
      clear(dg);
      const hi = hiOf(v), lo = loOf(v), { T, cw } = geo;
      for (let p = hi; p >= lo; p--) {
        const d = dig(v, p), grp = S('g', { style: 'transform:translateX(0px);transition:transform .7s cubic-bezier(.4,0,.2,1)' }, dg); grp._p = p;
        text(grp, geo.X(p) + cw / 2, T + 138, String(d), { 'font-size': cw * .85, 'font-weight': 800, cls: 'disp num', fill: d === 0 ? 'var(--ink-3)' : 'var(--ink)' });
        if (dienes) blocks(grp, p, d, geo.X(p) + cw / 2);
      }
      if (commas) [3, 6, 9].forEach(p => { if (p <= hi) text(dg, geo.X(p) + cw, T + 166, ',', { 'font-size': cw * .7, 'font-weight': 800, cls: 'disp', fill: 'var(--red)' }); });
      text(dg, 500, geo.bottom + 42, fmt(v), { 'font-size': 44, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' });
    }
    function drawRound(y) {
      clear(rg); if (!rOn) return y;
      const U = Math.round(rTo * 1000), lo = Math.floor(v / U) * U, hi = lo + U, mid = lo + U / 2, r = v - lo >= U / 2 ? hi : lo;
      const x0 = 110, x1 = 890, X = q => x0 + (q - lo) / U * (x1 - x0); y += 70;
      S('line', { x1: x0 - 40, y1: y, x2: x1 + 40, y2: y, stroke: 'var(--ink)', 'stroke-width': 4 }, rg);
      for (let k = 0; k <= 10; k++) S('line', { x1: x0 + k * (x1 - x0) / 10, y1: y - (k % 5 ? 8 : 16), x2: x0 + k * (x1 - x0) / 10, y2: y + (k % 5 ? 8 : 16), stroke: 'var(--ink)', 'stroke-width': k % 5 ? 1.5 : 3 }, rg);
      [[lo, 'previous'], [hi, 'next']].forEach(([q, l]) => { text(rg, X(q), y + 40, fmt(q), { 'font-size': 24, 'font-weight': 800, cls: 'num', fill: q === r ? 'var(--green)' : 'var(--ink)' }); text(rg, X(q), y + 66, l + ' ' + big(rTo).replace(/^1$/, 'whole number'), { 'font-size': 15, fill: 'var(--ink-3)' }); });
      text(rg, X(mid), y + 40, fmt(mid), { 'font-size': 18, 'font-weight': 700, cls: 'num', fill: 'var(--ink-3)' }); text(rg, X(mid), y + 62, 'halfway', { 'font-size': 14, fill: 'var(--ink-3)' });
      const xv = X(v);
      S('path', { d: `M${xv} ${y - 8} l-12 -22 h24 z`, fill: 'var(--red)' }, rg);
      text(rg, xv, y - 46, fmt(v), { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: 'var(--red)' });
      if (v !== lo) S('path', { d: `M${xv} ${y - 60} Q${(xv + X(r)) / 2} ${y - 110} ${X(r)} ${y - 18}`, fill: 'none', stroke: 'var(--green)', 'stroke-width': 3, 'stroke-dasharray': '7 5' }, rg);
      const dp = Math.round(Math.log10(rTo)) - 1, dd = dig(v, dp);
      text(rg, 500, y + 104, v === lo ? `${fmt(v)} is already a multiple of ${big(rTo)}` : `${fmt(v)} rounded to the nearest ${rTo >= 1 ? big(rTo) : rTo === 0.1 ? 'tenth' : 'hundredth'} is ${fmt(r)}`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num' });
      text(rg, 500, y + 134, `Look at the ${PV_NAMES[dp]} digit, outlined in red: ${dd} is ${dd >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}`, { 'font-size': 17, fill: 'var(--ink-2)' });
      return y + 150;
    }
    function drawLog(y0) { clear(lg); const n = rOn ? 2 : 4; log.slice(0, n).forEach((l, i) => text(lg, 500, y0 + i * 32, l, { 'font-size': i ? 19 : 24, 'font-weight': i ? 400 : 700, fill: i ? 'var(--ink-3)' : 'var(--ink)', cls: 'num' })); return y0 + n * 32; }
    function full() {
      grid(Math.max(4, hiOf(v), rOn ? Math.round(Math.log10(rTo)) : 0)); drawDigits();
      let y = drawRound(geo.bottom + 70); y = drawLog(y + 34);
      svg.setAttribute('viewBox', `0 0 1000 ${Math.max(640, Math.ceil(y))}`);
    }
    function op(mult, k) {
      if (busy) return;
      const nv = mult ? v * 10 ** k : v / 10 ** k;
      if (nv > 1e12) return c.toast('That answer is bigger than one billion');
      if (!Number.isInteger(nv)) return c.toast('That answer needs more than three decimal places');
      busy = true;
      const top = Math.max(4, hiOf(v), hiOf(nv), rOn ? Math.round(Math.log10(rTo)) : 0);
      if (top !== geo.top) { full(); grid(top); drawDigits(); }
      const dx = (mult ? -1 : 1) * k * geo.cw;
      requestAnimationFrame(() => [...dg.children].forEach(ch => { if (ch._p != null) ch.style.transform = `translateX(${dx}px)`; }));
      const before = fmt(v);
      setTimeout(() => { v = nv; log.unshift(`${before} ${mult ? '×' : '÷'} ${big(10 ** k)} = ${fmt(v)}`); log = log.slice(0, 6); full(); busy = false; f.set(fmt(v)); }, 780);
    }
    const setV = n => { v = Math.round(n * 1000); f.set(fmt(v)); log = []; full(); };
    P.section('Number');
    const f = P.field({ label: 'Start number', value: v ? fmt(v) : '', live: false, onChange: s => { const n = parseFloat(String(s).replace(/,/g, '')); if (isNaN(n) || n < 0 || n > 1e9) return c.toast('Type a number from 0 to 1,000,000,000'); setV(n); } });
    const RANGES = { T: [10, 99], H: [100, 999], Th: [1000, 9999], TTh: [10000, 99999], HTh: [100000, 999999], M: [1000000, 9999999] };
    P.seg({ label: 'Random whole number up to', options: Object.keys(RANGES).map(k => [k, k]), value: null, retrigger: true, onChange: k => setV(rnd(...RANGES[k])) });
    const nz = (a, b) => { let n; do n = rnd(a, b); while (n % 10 === 0); return n; };
    P.seg({ label: 'Random decimal', options: [[1, '0.t'], [2, '0.th'], [3, '0.thth']], value: null, retrigger: true, onChange: k => setV(nz(1, 10 ** (k + 1) - 1) / 10 ** k) });
    P.section('Multiply');
    P.buttons([['× 10', () => op(1, 1), 'primary'], ['× 100', () => op(1, 2), 'primary'], ['× 1000', () => op(1, 3), 'primary']]);
    P.section('Divide');
    P.buttons([['÷ 10', () => op(0, 1)], ['÷ 100', () => op(0, 2)], ['÷ 1000', () => op(0, 3)]]);
    P.section('Show');
    P.toggle({ label: 'Dienes blocks under each column', value: dienes, onChange: x => { dienes = x; full(); } });
    P.toggle({ label: 'Arcs showing ×10', value: arcs, onChange: x => { arcs = x; full(); } });
    P.seg({ label: 'Arcs go', options: [['next', 'Next column ×10'], ['ones', 'From the ones ×10, ×100…']], value: arcMode, onChange: x => { arcMode = x; if (!arcs) { arcs = true; } full(); } });
    P.toggle({ label: 'Column headings', value: labels, onChange: x => { labels = x; full(); } });
    P.toggle({ label: 'Commas between thousands', value: commas, onChange: x => { commas = x; f.set(v ? fmt(v) : ''); full(); } });
    P.section('Rounding');
    const rT = P.toggle({ label: 'Show rounding', value: rOn, onChange: x => { rOn = x; full(); } });
    P.seg({ label: 'Round to the nearest', options: [[1e6, '1,000,000'], [1e5, '100,000'], [1e4, '10,000'], [1000, '1,000'], [100, '100'], [10, '10'], [1, '1'], [0.1, '0.1'], [0.01, '0.01']], value: rTo, onChange: x => { rTo = x; if (!rOn) { rOn = true; rT.set(true, true); } full(); } });
    P.section();
    P.button('Clear all', () => { v = 0; log = []; rOn = false; rT.set(false, true); f.set(''); full(); });
    full();
  }
});

tool({
  id: 'number-grid', name: 'Number grid', strand: 'number', years: [0, 1, 2, 3, 4, 5], w: 1000, h: 640,
  desc: 'A flexible hundred square with multiples, colouring, hidden numbers and a moving mask.',
  tags: 'hundred square 100 multiples mask pattern',
  icon: '<rect x="6" y="6" width="36" height="36" rx="3"/><path d="M18 6v36M30 6v36M6 18h36M6 30h36"/><rect x="18" y="18" width="12" height="12" fill="currentColor"/>',
  guide: ['Tap squares to colour them in the chosen colour. Tap again to clear.', 'Change columns, start number and step to make grids like 0–99 or counting in 0.1s.', 'Highlight multiples of two numbers. Common multiples show in a third colour.', 'Drag the mask to move it, or use the arrows. Press and hold the mask to see the numbers underneath. Spotlight shows only the numbers under the mask.', 'Guess the number hides all but a few random numbers. Tap a blank square to mark it, then tap again to reveal it.'],
  mount(c) {
    const { svg, P } = c;
    let cols = 10, rows = 10, start = 1, step = 1, paint = 'yellow', painted = {}, hideMode = 'none', clues = new Set(), revealed = {}, asked = {}, nClues = 10, seeThrough = false, holdT = null, mA = 0, mB = 0;
    let mask = { on: false, shape: 'plus', r: 3, c: 3, mode: 'cover', rot: 0 };
    const g = S('g', {}, svg), mg = S('g', {}, svg);
    const shapes = { plus: [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]], square: [[0, 0], [1, 0], [0, 1], [1, 1]], three: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]], L: [[0, -1], [0, 0], [0, 1], [1, 1]], T: [[-1, 0], [0, 0], [1, 0], [0, 1]], row: [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]] };
    const geom = () => { const s = Math.min(940 / cols, 600 / rows); return { s, x0: 500 - s * cols / 2, y0: 320 - s * rows / 2 }; };
    const val = i => +(start + i * step).toFixed(4);
    const isMul = (v, m) => m && Number.isInteger(v) && v !== 0 && v % m === 0;
    function cells() { return shapes[mask.shape].map(([x, y]) => { for (let k = 0; k < mask.rot; k++) [x, y] = [-y, x]; return [mask.c + x, mask.r + y]; }); }
    function draw() {
      clear(g); clear(mg);
      const { s, x0, y0 } = geom();
      const mset = mask.on ? new Set(cells().map(([x, y]) => y * cols + x)) : new Set();
      const spot = mask.on && mask.mode === 'spotlight';
      const fs = s * (Math.max(...[val(0), val(cols * rows - 1)].map(v => nf(v).length)) > 3 ? .3 : .42);
      for (let i = 0; i < cols * rows; i++) {
        const r = Math.floor(i / cols), cc = i % cols, v = val(i);
        const a = isMul(v, mA), b = isMul(v, mB);
        const fill = painted[i] ? col(painted[i]) : a && b ? 'var(--green)' : a ? 'var(--yellow)' : b ? 'var(--blue-s)' : 'var(--board)';
        const cell = S('g', { cls: 'hit' }, g);
        let vis = hideMode === 'none' || revealed[i] || (hideMode === 'guess' && clues.has(i));
        if (spot) vis = mset.has(i) || revealed[i];
        const ask = !vis && asked[i];
        S('rect', { x: x0 + cc * s, y: y0 + r * s, width: s, height: s, fill: ask ? 'var(--yellow)' : fill, stroke: 'var(--line-2)', 'stroke-width': 1.2 }, cell);
        if (ask) text(cell, x0 + cc * s + s / 2, y0 + r * s + s / 2 + 1, '?', { 'font-size': fs * 1.1, 'font-weight': 800, fill: 'var(--ink)' });
        if (vis) text(cell, x0 + cc * s + s / 2, y0 + r * s + s / 2 + 1, nf(v), { 'font-size': fs, 'font-weight': 700, cls: 'num', fill: painted[i] && ['blue', 'purple', 'red', 'green'].includes(painted[i]) ? 'var(--board)' : 'var(--ink)' });
        cell.addEventListener('click', () => { if (!vis) { if (!asked[i]) asked[i] = 1; else revealed[i] = 1; } else if (painted[i] === paint) delete painted[i]; else painted[i] = paint; draw(); });
      }
      if (mask.on) {
        const mgrp = S('g', { cls: 'grab' }, mg);
        cells().forEach(([x, y]) => { if (x < 0 || y < 0 || x >= cols || y >= rows) return; S('rect', { x: x0 + x * s + 1, y: y0 + y * s + 1, width: s - 2, height: s - 2, rx: 4, fill: spot ? 'transparent' : 'var(--purple)', opacity: spot ? 1 : seeThrough ? .3 : 1 }, mgrp); S('rect', { x: x0 + x * s, y: y0 + y * s, width: s, height: s, fill: 'transparent', stroke: 'var(--purple)', 'stroke-width': 4 }, mgrp); });
        c.drag(mgrp, {
          start: () => { clearTimeout(holdT); holdT = setTimeout(() => { if (!spot) { seeThrough = true; draw(); } }, 380); },
          move: p => { const nc = clamp(Math.floor((p.x - x0) / s), 0, cols - 1), nr = clamp(Math.floor((p.y - y0) / s), 0, rows - 1); if (nc !== mask.c || nr !== mask.r) { clearTimeout(holdT); mask.c = nc; mask.r = nr; draw(); } },
          end: () => { clearTimeout(holdT); if (seeThrough) { seeThrough = false; draw(); } }
        });
      }
    }
    P.section('Grid');
    P.stepper({ label: 'Columns', value: cols, min: 2, max: 15, onChange: v => { cols = v; painted = {}; draw(); } });
    P.stepper({ label: 'Rows', value: rows, min: 1, max: 12, onChange: v => { rows = v; painted = {}; draw(); } });
    P.stepper({ label: 'Start at', value: start, min: -100, max: 1000, step: (v, d) => (d > 0 ? v >= 10 : v > 10) ? 10 : 1, onChange: v => { start = v; draw(); } });
    P.stepper({ label: 'Count in', value: step, values: [0.01, 0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 25, 50, 100], onChange: v => { step = v; draw(); } });
    P.section('Colour squares');
    P.swatches({ value: paint, colors: ['yellow', 'red', 'green', 'blue', 'purple', 'orange'], onChange: v => paint = v });
    P.buttons([['Clear colours', () => { painted = {}; draw(); }]]);
    P.section('Multiples');
    P.stepper({ label: 'Multiples of (yellow)', value: mA, min: 0, max: 50, fmt: v => v || 'off', onChange: v => { mA = v; draw(); } });
    P.stepper({ label: 'Multiples of (blue)', value: mB, min: 0, max: 50, fmt: v => v || 'off', onChange: v => { mB = v; draw(); } });
    P.note('Squares that are multiples of both turn green.');
    P.section('Hide numbers');
    const newClues = () => { const n = cols * rows; clues = new Set(shuffle([...Array(n).keys()]).slice(0, Math.min(nClues, n))); revealed = {}; asked = {}; };
    P.seg({ options: [['none', 'Show all'], ['all', 'Hide all'], ['guess', 'Guess the number']], value: hideMode, onChange: v => { hideMode = v; newClues(); clueBits.forEach(e => e.hidden = v !== 'guess'); draw(); } });
    const clueBits = [P.stepper({ label: 'Numbers left showing', value: nClues, min: 0, max: 60, step: (v) => v >= 20 ? 5 : 1, onChange: v => { nClues = v; newClues(); draw(); } }).el, P.button('New random numbers', () => { newClues(); draw(); })];
    clueBits.forEach(e => e.hidden = true);
    P.note('Tap a blank square once to mark it with a question mark, then tap it again to reveal the number.');
    P.button('Hide revealed numbers again', () => { revealed = {}; asked = {}; draw(); });
    P.section('Mask');
    P.toggle({ label: 'Use the mask', value: mask.on, onChange: v => { mask.on = v; draw(); } });
    P.seg({ options: [['plus', 'Cross'], ['square', '2×2'], ['three', '3×3'], ['L', 'L'], ['T', 'T'], ['row', 'Row']], value: mask.shape, onChange: v => { mask.shape = v; draw(); } });
    P.seg({ options: [['cover', 'Covers numbers'], ['spotlight', 'Spotlight']], value: mask.mode, onChange: v => { mask.mode = v; revealed = {}; asked = {}; draw(); } });
    P.note('Drag the mask to move it. Press and hold it to see through. Spotlight shows only the numbers under the mask, so the class works out the ones around it.');
    P.buttons([['←', () => { mask.c = Math.max(0, mask.c - 1); draw(); }], ['↑', () => { mask.r = Math.max(0, mask.r - 1); draw(); }], ['↓', () => { mask.r = Math.min(rows - 1, mask.r + 1); draw(); }], ['→', () => { mask.c = Math.min(cols - 1, mask.c + 1); draw(); }], ['↻', () => { mask.rot = (mask.rot + 1) % 4; draw(); }]]);
    draw();
  }
});

tool({
  id: 'number-line', name: 'Number line', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 560,
  desc: 'A number line with two markers, a difference span and jumps for counting on and back.',
  tags: 'difference negative jumps empty number line',
  icon: '<path d="M4 30h40M8 26v8M18 26v8M28 26v8M38 26v8"/><path d="M8 24q10-14 20 0" /><path d="M24 20l4 4 1-6"/>',
  guide: ['Drag the red and blue markers anywhere along the line. Turn on snap to make them land on the marks.', 'Turn on the difference to see the gap between them and the matching calculation.', 'Set a jump size and tap Jump forward or Jump back to count on from the red marker in steps.', 'Tap any number on the line to hide it for a missing number question. Tap again to show it.', 'Change the start, end and step to use negatives or large numbers.'],
  mount(c) {
    const { svg, P } = c;
    let snapOn = false, mn = 0, mx = 20, st = 1, a = 4, b = 13, showNums = true, showDiff = true, showB = true, jump = 2, jumps = [], hiddenN = {}, blank = false;
    const g = S('g', {}, svg);
    const X = v => 70 + (v - mn) / (mx - mn) * 960;
    const V = x => mn + (x - 70) / 960 * (mx - mn);
    const snap = v => clamp(+(Math.round(v / st) * st).toFixed(6), mn, mx);
    function draw() {
      clear(g);
      const y = 330;
      S('line', { x1: 40, y1: y, x2: 1060, y2: y, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      S('path', { d: `M1064 ${y} l-16 -10 v20 z`, fill: 'var(--ink)' }, g); S('path', { d: `M36 ${y} l16 -10 v20 z`, fill: 'var(--ink)' }, g);
      const n = Math.round((mx - mn) / st), lbEvery = Math.ceil(n / 20);
      if (!blank) for (let i = 0; i <= n; i++) {
        const v = +(mn + i * st).toFixed(6), x = X(v), major = i % lbEvery === 0;
        S('line', { x1: x, y1: y - (major ? 18 : 10), x2: x, y2: y + (major ? 18 : 10), stroke: 'var(--ink)', 'stroke-width': major ? 3 : 2 }, g);
        if (showNums && major) {
          const t = S('g', { cls: 'hit' }, g);
          S('rect', { x: x - 26, y: y + 26, width: 52, height: 40, rx: 8, fill: hiddenN[v] ? 'var(--accent-soft)' : 'transparent' }, t);
          if (!hiddenN[v]) text(t, x, y + 46, nf(v), { 'font-size': n > 12 ? 22 : 28, 'font-weight': 700, cls: 'num' });
          else text(t, x, y + 46, '?', { 'font-size': 26, 'font-weight': 700, fill: 'var(--accent)' });
          t.addEventListener('click', () => { hiddenN[v] = !hiddenN[v]; draw(); });
        }
      }
      if (showDiff && showB) {
        const lo = Math.min(a, b), hi = Math.max(a, b), d = +(hi - lo).toFixed(6);
        S('rect', { x: X(lo), y: y - 64, width: X(hi) - X(lo), height: 12, rx: 6, fill: 'var(--green)', opacity: .85 }, g);
        text(g, (X(lo) + X(hi)) / 2, y - 90, nf(d), { 'font-size': 34, 'font-weight': 800, cls: 'disp num', fill: 'var(--green)' });
        text(g, 550, 500, b >= a ? `${nf(a)} + ${nf(d)} = ${nf(b)}` : `${nf(a)} − ${nf(d)} = ${nf(b)}`, { 'font-size': 36, 'font-weight': 700, cls: 'num' });
      }
      let cur = a;
      jumps.forEach((j, k) => {
        const x1 = X(cur), x2 = X(cur + j), h = Math.min(130, Math.abs(x2 - x1) * .7 + 30);
        S('path', { d: `M${x1} ${y - 8} Q${(x1 + x2) / 2} ${y - 8 - h * 1.6} ${x2} ${y - 8}`, fill: 'none', stroke: j > 0 ? 'var(--orange)' : 'var(--purple)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        S('path', { d: `M${x2} ${y - 8} l${j > 0 ? -12 : 12} -10 l${j > 0 ? 2 : -2} 12 z`, fill: j > 0 ? 'var(--orange)' : 'var(--purple)' }, g);
        text(g, (x1 + x2) / 2, y - 26 - h * .8, (j > 0 ? '+' : '−') + nf(Math.abs(j)), { 'font-size': 22, 'font-weight': 700, fill: j > 0 ? 'var(--orange)' : 'var(--purple)', cls: 'num' });
        cur = +(cur + j).toFixed(6);
      });
      const marker = (v, cl, set, lbl) => {
        const m = S('g', { cls: 'grab' }, g), x = X(v);
        S('path', { d: `M${x} ${y - 6} l-16 -26 a18 18 0 1 1 32 0 z`, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 1.5 }, m);
        text(m, x, y - 48, lbl ?? nf(v), { 'font-size': 15, 'font-weight': 700, fill: 'var(--board)', cls: 'num' });
        S('rect', { x: x - 30, y: y - 80, width: 60, height: 120, fill: 'transparent' }, m);
        c.drag(m, { move: p => { const raw = clamp(V(p.x), mn, mx); const dp = st >= 1 ? 1 : 2; const nv = snapOn ? snap(raw) : +raw.toFixed(dp); if (nv !== v) { set(nv); jumps = []; draw(); } } });
      };
      if (showB) marker(b, 'blue', v => b = v);
      marker(a, 'red', v => a = v);
    }
    function rebuild() { if (mx <= mn) mx = mn + st; a = snap(a); b = snap(b); jumps = []; hiddenN = {}; draw(); }
    P.section('Scale');
    const mnS = P.stepper({ label: 'Start', value: mn, min: -1000, max: 1000, step: (v, d) => Math.abs(v + d) >= 100 || Math.abs(v) >= 100 ? 50 : Math.abs(v) >= 20 ? 10 : 1, onChange: v => { mn = v; rebuild(); } });
    const mxS = P.stepper({ label: 'End', value: mx, min: -990, max: 10000, step: (v, d) => Math.abs(v) >= 100 ? 50 : Math.abs(v) >= 20 ? 10 : 1, onChange: v => { mx = v; rebuild(); } });
    P.stepper({ label: 'Marks every', value: st, values: [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100], onChange: v => { st = v; rebuild(); } });
    P.buttons([['0–10', () => { mnS.set(0, true); mxS.set(10, true); mn = 0; mx = 10; rebuild(); }], ['0–100', () => { mn = 0; mx = 100; mnS.set(0, true); mxS.set(100, true); st = 10; rebuild(); }], ['−10–10', () => { mn = -10; mx = 10; mnS.set(-10, true); mxS.set(10, true); rebuild(); }]]);
    P.section('Jumps from red marker');
    P.stepper({ label: 'Jump size', value: jump, values: [0.1, 0.5, 1, 2, 3, 4, 5, 10, 20, 25, 50, 100], onChange: v => jump = v });
    P.buttons([['Jump back', () => { const end = jumps.reduce((s, j) => s + j, a); if (end - jump < mn - 1e-9) return; jumps.push(-jump); draw(); }], ['Jump forward', () => { const end = jumps.reduce((s, j) => s + j, a); if (end + jump > mx + 1e-9) return; jumps.push(jump); draw(); }, 'primary']]);
    P.button('Clear jumps', () => { jumps = []; draw(); });
    P.section('Show');
    P.toggle({ label: 'Blue marker', value: showB, onChange: v => { showB = v; draw(); } });
    P.toggle({ label: 'Difference and calculation', value: showDiff, onChange: v => { showDiff = v; draw(); } });
    P.toggle({ label: 'Numbers', value: showNums, onChange: v => { showNums = v; draw(); } });
    P.toggle({ label: 'Empty line (no marks)', value: blank, onChange: v => { blank = v; draw(); } });
    P.section('Markers');
    P.toggle({ label: 'Snap markers to the marks', value: snapOn, onChange: v => { snapOn = v; if (v) { a = snap(a); b = snap(b); draw(); } } });
    P.note('With snap off, drag the markers anywhere along the line.');
    draw();
  }
});

tool({
  id: 'decimal-line', name: 'Decimal number line', strand: 'frac', years: [3, 4, 5, 6], w: 1100, h: 660,
  desc: 'Zoom into any interval of a number line to see tenths, hundredths and thousandths.',
  tags: 'decimals zoom tenths hundredths thousandths number line',
  icon: '<path d="M4 12h40M4 36h40"/><path d="M20 12L4 36M28 12l16 24"/><path d="M20 9v6M28 9v6"/>',
  guide: ['Tap between two marks on a line to zoom in. A new line opens below, split into ten.', 'Zoom three times to reach thousandths. Tap a different gap to zoom somewhere else.', 'Hide the numbers on the zoomed lines, then tap any mark to reveal its number, or reveal them all.', 'Change the start number or what each mark is worth. Your zooms stay where they are and the numbers change with them.', 'Clear all starts again.'],
  mount(c) {
    const { svg, P } = c;
    let start = 0, iv = 1, path = [], showTop = true, hideZoom = false, revealed = {};
    c.persist(() => ({ start, iv, path, showTop, hideZoom, revealed }), s => ({ start, iv, path, showTop, hideZoom, revealed } = Object.assign({ start, iv, path, showTop, hideZoom, revealed }, s)));
    const g = S('g', {}, svg);
    const L = 100, R = 1000, ys = [130, 280, 430, 580];
    const defs = S('defs', {}, svg); const mk = S('marker', { id: 'dlArr', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs); S('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink)' }, mk);
    const lines = () => { const out = [[start, iv]]; path.forEach(i => { const [s, st] = out[out.length - 1]; out.push([+(s + i * st).toFixed(8), st / 10]); }); return out; };
    function draw() {
      clear(g);
      const ls = lines();
      ls.forEach(([s, step], k) => {
        const y = ys[k];
        if (k > 0) { const i = path[k - 1]; const xa = L + i * (R - L) / 10, xb = xa + (R - L) / 10; S('rect', { x: xa, y: ys[k - 1] - 18, width: xb - xa, height: 36, rx: 6, fill: 'var(--accent-soft)', opacity: .9 }, g); S('path', { d: `M${xa} ${ys[k - 1] + 18} L${L} ${y - 16} M${xb} ${ys[k - 1] + 18} L${R} ${y - 16}`, stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '6 6', fill: 'none' }, g); }
        S('line', { x1: L - 50, y1: y, x2: R + 50, y2: y, stroke: 'var(--ink)', 'stroke-width': 4, 'marker-start': 'url(#dlArr)', 'marker-end': 'url(#dlArr)' }, g);
        for (let i = 0; i <= 10; i++) {
          const x = L + i * (R - L) / 10, v = +(s + i * step).toFixed(6);
          S('line', { x1: x, y1: y - 14, x2: x, y2: y + 14, stroke: 'var(--ink)', 'stroke-width': i % 5 ? 2 : 3 }, g);
          const key = k + ':' + i, hidden = k === 0 ? !showTop : hideZoom && !revealed[key];
          if (!hidden) text(g, x, y + 38, nf(v), { 'font-size': ls.length > 3 ? 19 : 22, 'font-weight': 700, cls: 'num', fill: k && revealed[key] && hideZoom ? 'var(--accent)' : 'var(--ink)' });
          else { const b = S('g', { cls: 'hit' }, g); S('rect', { x: x - 30, y: y + 22, width: 60, height: 32, rx: 8, fill: 'var(--board-2)', stroke: 'var(--line-2)', 'stroke-dasharray': '4 3' }, b); text(b, x, y + 38, '?', { 'font-size': 18, 'font-weight': 800, fill: 'var(--ink-3)' }); b.addEventListener('click', () => { if (k === 0) { showTop = true; topT.set(true, true); } else revealed[key] = true; draw(); }); }
          if (i < 10 && k < 3) { const h = S('rect', { x: x + 3, y: y - 26, width: (R - L) / 10 - 6, height: 44, fill: 'transparent', cls: 'hit' }, g); h.addEventListener('click', () => { path = path.slice(0, k); path.push(i); revealed = Object.fromEntries(Object.entries(revealed).filter(([kk]) => +kk.split(':')[0] <= k)); draw(); }); }
        }
        if (k === ls.length - 1 && k < 3) text(g, (L + R) / 2, y - 46, k === 0 ? 'Tap between two marks to zoom in' : 'Tap between two marks to zoom in again', { 'font-size': 18, 'font-weight': 700, fill: 'var(--accent)' });
      });
      if (ls.length > 1) { const [s, st] = ls[ls.length - 1]; text(g, 1080, 30, `Each mark on the last line is ${nf(st)}`, { 'font-size': 16, fill: 'var(--ink-3)', 'text-anchor': 'end' }); }
    }
    P.section('Top line');
    const stS = P.stepper({ label: 'Start number', value: start, min: -100, max: 1000, step: () => iv >= 10 ? iv : 1, onChange: v => { start = v; draw(); } });
    const ivS = P.seg({ label: 'Each mark is worth', options: [[1, '1'], [10, '10'], [100, '100'], [0.1, '0.1']], value: iv, onChange: v => { iv = v; draw(); } });
    const topT = P.toggle({ label: 'Numbers on the top line', value: showTop, onChange: v => { showTop = v; draw(); } });
    P.section('Zoomed lines');
    P.toggle({ label: 'Hide numbers (tap a mark to reveal)', value: hideZoom, onChange: v => { hideZoom = v; revealed = {}; draw(); } });
    P.buttons([['Reveal all numbers', () => { const ls = lines(); ls.forEach((_, k) => { for (let i = 0; i <= 10; i++) revealed[k + ':' + i] = true; }); showTop = true; topT.set(true, true); draw(); }], ['Close the last zoom', () => { path.pop(); draw(); }]]);
    P.section();
    P.button('Clear all', () => { start = 0; iv = 1; path = []; revealed = {}; stS.set(0, true); ivS.set(1, true); draw(); }, 'primary');
    draw();
  }
});

tool({
  id: 'twenty-cards', name: 'Number cards', strand: 'number', years: [0, 1, 2, 3], w: 1000, h: 640,
  desc: 'Deal, flip and move number cards to order, sort and compare.',
  tags: '20 cards ordering flip sort sequence',
  icon: '<rect x="6" y="10" width="16" height="22" rx="3"/><rect x="26" y="16" width="16" height="22" rx="3" fill="currentColor"/>',
  guide: ['Tap a card to turn it over. Drag a card to move it.', 'Deal a set face up or face down, in order or shuffled.', 'Turn on Snap to grid so cards line up neatly when dropped.', 'Make a single card with any number using the Make a card control.'],
  mount(c) {
    const { svg, P } = c;
    let cards = [], snapOn = true, from = 1, to = 20, face = true, order = 'shuffle', mk = 25;
    const g = S('g', {}, svg);
    const W = 82, Hh = 108;
    function deal() {
      let nums = range(from, to); if (order === 'shuffle') nums = shuffle(nums);
      const per = Math.min(10, nums.length), sp = Math.min(94, 940 / per);
      cards = nums.map((n, i) => ({ n, x: 500 - per * sp / 2 + (i % per) * sp + (sp - W) / 2, y: 90 + Math.floor(i / per) * 140, up: face }));
      draw();
    }
    function draw() {
      clear(g);
      if (snapOn) for (let x = 30; x < 990; x += 94) for (let y = 30; y < 620; y += 140) S('rect', { x: x - 2, y: y - 2, width: W + 4, height: Hh + 4, rx: 12, fill: 'none', stroke: 'var(--line)', 'stroke-dasharray': '4 6' }, g);
      cards.forEach(cd => {
        const grp = S('g', { cls: 'grab', transform: `translate(${cd.x},${cd.y})` }, g);
        if (cd.up) { S('rect', { width: W, height: Hh, rx: 12, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, grp); const s = nf(cd.n); text(grp, W / 2, Hh / 2 + 2, s, { 'font-size': s.length > 2 ? 34 : 50, 'font-weight': 800, cls: 'disp num', fill: cd.n < 0 ? 'var(--red)' : 'var(--ink)' }); }
        else { S('rect', { width: W, height: Hh, rx: 12, fill: 'var(--accent)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, grp); S('rect', { x: 8, y: 8, width: W - 16, height: Hh - 16, rx: 7, fill: 'none', stroke: 'var(--accent-ink)', 'stroke-width': 2, opacity: .5 }, grp); S('circle', { cx: W / 2, cy: Hh / 2, r: 12, fill: 'var(--accent-ink)', opacity: .5 }, grp); }
        let moved, ox, oy;
        c.drag(grp, { start: p => { moved = false; ox = p.x - cd.x; oy = p.y - cd.y; g.append(grp); cards.push(cards.splice(cards.indexOf(cd), 1)[0]); }, move: p => { moved = true; cd.x = clamp(p.x - ox, 0, 1000 - W); cd.y = clamp(p.y - oy, 0, 640 - Hh); grp.setAttribute('transform', `translate(${cd.x},${cd.y})`); }, end: () => { if (!moved) cd.up = !cd.up; else if (snapOn) { cd.x = 30 + Math.round((cd.x - 30) / 94) * 94; cd.y = 30 + Math.round((cd.y - 30) / 140) * 140; } draw(); } });
      });
    }
    P.section('Deal');
    P.stepper({ label: 'From', value: from, min: -50, max: 100, onChange: v => from = v });
    P.stepper({ label: 'To', value: to, min: -40, max: 120, onChange: v => to = v });
    P.seg({ options: [['shuffle', 'Shuffled'], ['order', 'In order']], value: order, onChange: v => order = v });
    P.seg({ options: [[true, 'Face up'], [false, 'Face down']], value: face, onChange: v => face = v });
    P.button('Deal the cards', () => { if (to < from) return c.toast('Set To to be bigger than From'); if (to - from > 39) return c.toast('Deal up to 40 cards at a time'); deal(); }, 'primary');
    P.section('Cards on the board');
    P.buttons([['Turn all up', () => { cards.forEach(x => x.up = true); draw(); }], ['Turn all down', () => { cards.forEach(x => x.up = false); draw(); }]]);
    P.toggle({ label: 'Snap to grid', value: snapOn, onChange: v => { snapOn = v; draw(); } });
    P.button('Clear the board', () => { cards = []; draw(); });
    P.section('Make a card');
    P.stepper({ label: 'Number', value: mk, min: -999, max: 9999, step: (v) => Math.abs(v) >= 100 ? 10 : 1, onChange: v => mk = v });
    P.button('Add card', () => { cards.push({ n: mk, x: 460, y: 500, up: true }); draw(); });
    draw();
  }
});

tool({
  id: 'number-scales', name: 'Number balance', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 680,
  desc: 'Drag number tiles onto a balance to explore equals, missing numbers and equal sums.',
  tags: 'scales equals equation missing number equivalence balance',
  icon: '<path d="M24 8v32M10 40h28M8 16h32"/><path d="M8 16l-5 10h10zM40 16l-5 10h10z"/>',
  guide: ['Drag number tiles from the tray onto either pan. The tray never runs out. The balance tips to the heavier side and levels when both sides are equal.', 'Drag a tile off a pan, back to the tray or the bin, to remove it.', 'Random missing number puts a calculation like 4 + ? = 7 on the scales. Drag tiles onto the left pan until it balances.', 'Random equal sums puts one sum on the left and some possible answers in the Try these box. Drag them onto the right pan to check which are equal.'],
  mount(c) {
    const { svg, P } = c;
    let top = 10, items = [], showTot = true, showCalc = true, ang = 0, task = null, uid = 0;
    const g = S('g', {}, svg), ig = S('g', {}, svg), dg = S('g', {}, svg);
    const TRAY = { y: 586, h: 80 }, BIN = { x: 902, y: 586, w: 80, h: 80 }, CAND = { x: 40, y: 496, w: 940, h: 70 };
    function evaluate(s) { const e = String(s).replace(/[x×]/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s/g, ''); if (!/^[\d+\-*/().]+$/.test(e)) return null; try { const v = Function('return (' + e + ')')(); return isFinite(v) ? +v.toFixed(6) : null; } catch (_) { return null; } }
    const trayVals = () => top === 10 ? range(1, 10) : top === 20 ? [...range(1, 10), 20] : top === 100 ? [...range(1, 10), ...range(20, 100, 10)] : [...range(1, 9), 10, 20, 50, 100, 200, 500, 1000];
    const tileCol = v => v >= 1000 ? 'pink' : v >= 100 ? 'purple' : v >= 10 ? 'orange' : ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'red', 'blue'][v - 1] || 'blue';
    const tot = s => items.filter(i => i.side === s).reduce((t, i) => t + i.v, 0);
    const mk = (label, side, extra = {}) => { const v = evaluate(label); if (v == null) return null; const it = Object.assign({ id: ++uid, label: String(label).replace(/\*/g, '×').replace(/x/g, '×').replace(/\//g, '÷').replace(/-/g, '−'), v, side }, extra); items.push(it); return it; };
    const tw = it => Math.max(58, it.label.length * 15 + 24);
    function place(ps) {
      ['L', 'R'].forEach((s, k) => { let x = 0, row = 0; const list = items.filter(i => i.side === s); list.forEach(it => { const w = tw(it); if (x + w > 250) { x = 0; row++; } it.px = ps[k].x - 125 + x; it.py = ps[k].y - 48 - row * 50; x += w + 4; }); });
      let x = CAND.x + 120; items.filter(i => i.side === 'C').forEach(it => { it.px = x; it.py = CAND.y + 11; x += tw(it) + 12; });
    }
    function calcText() {
      const side = s => items.filter(i => i.side === s).map(i => i.label);
      const L = side('L'), R = side('R'), l = tot('L'), r = tot('R'), eq = Math.abs(l - r) < 1e-9;
      if (task && task.type === 'missing') { const extra = L.slice(1); return eq && extra.length ? [`${L.join(' + ')} = ${R.join(' + ')}`, 'Balanced! The missing number is ' + nf(r - task.a)] : [`${task.a} + ? = ${task.c}`, 'Drag tiles onto the left pan until it balances']; }
      if (!L.length && !R.length) return ['', ''];
      const ls = L.length ? L.join(' + ') : '0', rs = R.length ? R.join(' + ') : '0';
      return [`${ls} ${eq ? '=' : l > r ? '>' : '<'} ${rs}`, eq ? 'Balanced: both sides are equal' : ''];
    }
    function draw() {
      clear(g); clear(ig);
      const ps = drawBalance(g, ang, { cy: 190, base: 470 });
      if (showTot) ps.forEach((p, k) => text(g, p.x, p.y + 58, nf(tot(k ? 'R' : 'L')), { 'font-size': 32, 'font-weight': 800, cls: 'disp num', fill: k ? 'var(--blue)' : 'var(--red)' }));
      if (showCalc) { const [a, b] = calcText(); text(g, 500, 44, a, { 'font-size': a.length > 30 ? 28 : 38, 'font-weight': 800, cls: 'disp num' }); if (b) text(g, 500, 82, b, { 'font-size': 18, fill: b.startsWith('Balanced') ? 'var(--green)' : 'var(--ink-2)', 'font-weight': 700 }); }
      if (items.some(i => i.side === 'C') || (task && task.type === 'equal')) { S('rect', Object.assign({ rx: 16, fill: 'var(--yellow-s)', stroke: 'var(--yellow)', 'stroke-width': 2 }, { x: CAND.x, y: CAND.y, width: CAND.w, height: CAND.h }), g); text(g, CAND.x + 58, CAND.y + 35, 'Try these', { 'font-size': 17, 'font-weight': 700, fill: 'var(--ink-2)' }); }
      // tray
      S('rect', { x: 18, y: TRAY.y, width: 870, height: TRAY.h, rx: 16, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      const vals = trayVals(), w = Math.min(64, (840 - vals.length * 6) / vals.length);
      vals.forEach((v, i) => {
        const x = 30 + i * (w + 6), src = S('g', { cls: 'grab' }, g);
        S('rect', { x, y: TRAY.y + 14, width: w, height: 52, rx: 10, fill: col(tileCol(v)), stroke: 'var(--ink)', 'stroke-width': 1.5 }, src);
        text(src, x + w / 2, TRAY.y + 41, String(v), { 'font-size': w < 44 ? 16 : 22, 'font-weight': 800, cls: 'disp num', fill: v >= 3 && v <= 4 ? '#18202E' : '#fff' });
        let it; c.drag(src, { start: p => { it = mk(String(v), null); it.drag = { x: p.x - w / 2, y: p.y - 24 }; drawItems(); }, move: p => { it.drag = { x: p.x - 30, y: p.y - 24 }; drawItems(); }, end: p => drop(it, p) });
      });
      S('rect', { x: BIN.x, y: BIN.y, width: BIN.w, height: BIN.h, rx: 16, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      S('path', { d: `M${BIN.x + 24} ${BIN.y + 26} h32 M${BIN.x + 34} ${BIN.y + 26} v-6 h12 v6 M${BIN.x + 27} ${BIN.y + 31} l3 34 h20 l3 -34`, stroke: 'var(--ink-3)', 'stroke-width': 3, fill: 'none' }, g);
      place(ps); drawItems();
    }
    function tile(layer, it, x, y) {
      const w = tw(it), grp = S('g', { cls: 'grab', transform: `translate(${x},${y})` }, layer);
      const isNum = /^\d+$/.test(it.label);
      S('rect', { width: w, height: 46, rx: 10, fill: it.hidden ? 'var(--purple)' : isNum ? col(tileCol(it.v)) : 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, grp);
      text(grp, w / 2, 24, it.hidden ? '?' : it.label, { 'font-size': 22, 'font-weight': 800, cls: 'disp num', fill: it.hidden ? '#fff' : isNum ? (it.v >= 3 && it.v <= 4 ? '#18202E' : '#fff') : 'var(--ink)' });
      return grp;
    }
    function drawItems() {
      clear(ig); clear(dg);
      items.forEach(it => {
        if (it.drag) { tile(dg, it, it.drag.x, it.drag.y); return; }
        if (it.side == null) return;
        const el = tile(ig, it, it.px, it.py);
        let ox, oy, moved;
        c.drag(el, { start: p => { ox = p.x - it.px; oy = p.y - it.py; moved = false; }, move: p => { moved = true; it.drag = { x: p.x - ox, y: p.y - oy }; drawItems(); }, end: p => { if (!moved) { if (it.hidden) { it.hidden = false; draw(); } return; } drop(it, p); } });
      });
    }
    function drop(it, p) {
      delete it.drag;
      if (p.y > TRAY.y - 6 || (p.x > BIN.x && p.y > BIN.y)) items.splice(items.indexOf(it), 1);
      else if (p.y > CAND.y - 10 && p.y < CAND.y + CAND.h + 10 && it.cand) it.side = 'C';
      else if (p.y > CAND.y - 10) items.splice(items.indexOf(it), 1);
      else it.side = p.x < 500 ? 'L' : 'R';
      draw();
    }
    c.raf(() => { const t = tiltFor(tot('L'), tot('R')), d = t - ang; if (Math.abs(d) > .03) { ang += d * .09; draw(); } });
    function missing() { items = []; const cMax = top === 10 ? 10 : top === 20 ? 20 : top === 100 ? 100 : 1000; const cc = rnd(Math.min(4, cMax), cMax), a = rnd(1, cc - 1); task = { type: 'missing', a, c: cc }; mk(String(a), 'L'); mk(String(cc), 'R'); draw(); }
    function equalSums() {
      items = []; task = { type: 'equal' };
      const lim = top === 10 ? 10 : top === 20 ? 20 : top === 100 ? 100 : 1000, step = lim >= 100 ? (lim === 100 ? 5 : 50) : 1;
      const T = rnd(Math.max(6, Math.ceil(lim * .4 / step)), lim / step) * step, a = rnd(1, T / step - 1) * step;
      mk(String(a), 'L'); mk(String(T - a), 'L');
      const right = [], wrong = [];
      for (let x = step; x <= T / 2; x += step) if (x !== a && x !== T - a) right.push(`${x}+${T - x}`);
      for (let x = step; x < T; x += step) { const off = step * (x % 3 === 0 ? 1 : x % 3 === 1 ? -1 : 2); const y = T - x + off; if (y > 0) wrong.push(`${x}+${y}`); }
      const out = [...shuffle(right).slice(0, 3), ...shuffle(wrong).slice(0, 2)];
      if (T % 2 === 0 && T / 2 <= 12) out.push(`2\u00d7${T / 2}`);
      shuffle(out).forEach(s => mk(s, 'C', { cand: true }));
      draw();
    }
    P.section('Tiles');
    P.seg({ label: 'Highest tile in the tray', options: [[10, '10'], [20, '20'], [100, '100'], [1000, '1000']], value: top, onChange: v => { top = v; draw(); } });
    P.section('Show');
    P.toggle({ label: 'Totals under the scales', value: showTot, onChange: v => { showTot = v; draw(); } });
    P.toggle({ label: 'Calculation above the scales', value: showCalc, onChange: v => { showCalc = v; draw(); } });
    P.section('Tasks');
    P.button('Random missing number', missing, 'primary');
    P.button('Random equal sums', equalSums, 'primary');
    P.note('Missing number and equal sums use numbers up to the highest tile.');
    P.section('Your own block');
    const f = P.field({ label: 'Number or calculation, e.g. 3+4 or 6×2', value: '3+4', live: false });
    P.buttons([['To the left', () => { if (!mk(f.get(), 'L')) c.toast('Type a number or a calculation such as 4+5'); draw(); }], ['To the right', () => { if (!mk(f.get(), 'R')) c.toast('Type a number or a calculation such as 4+5'); draw(); }]]);
    P.button('Hidden block on the left', () => { const it = mk(f.get(), 'L'); if (it) it.hidden = true; else c.toast('Type a number or a calculation such as 4+5'); draw(); });
    P.section();
    P.button('Clear the scales', () => { items = []; task = null; draw(); });
    draw();
  }
});

tool({
  id: 'function-machine', name: 'Function machine', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 620,
  desc: 'Type a number into the machine and watch it change as it passes through each block. KS1 and KS2 versions.',
  tags: 'function block input output rule inverse algebra',
  icon: '<rect x="14" y="14" width="20" height="20" rx="3"/><path d="M4 24h10M34 24h10M40 20l4 4-4 4"/>',
  guide: ['Type a number in the Input box on the board, or tap Random, then tap Start.', 'With Step through on, the number stops after each block so the class can see what that block did. Tap Next block to carry on.', 'When it finishes, tap Again to clear the output and type a new input. Every input and output is kept in the table.', 'Hide the rules to make it a guess-the-rule game, or hide the output so the class predicts it first.', 'Run backwards gives the output and works back to the input using the inverse of each block.'],
  mount(c) {
    const { svg, P } = c;
    let stage = 'ks1', nB = 1, ops = [['+', 3], ['×', 2], ['−', 1]], hideRule = false, hideOut = false, back = false, stepMode = true, trail = true;
    let rMin = 0, rMax = 20, rDec = false;
    let phase = 'input', hist = [], vals = [], pos = 0, cardX = 0, revealOut = false, inputVal = '';
    const g = S('g', {}, svg), ag = S('g', {}, svg), ui = S('g', {}, svg);
    const apply = (v, [o, n]) => o === '+' ? v + n : o === '−' ? v - n : o === '×' ? v * n : v / n;
    const inv = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
    const fmt = v => nf(+(+v).toFixed(3));
    const cols = ['var(--purple)', 'var(--teal)', 'var(--orange)'];
    let BW = 170;
    const SP = () => 700 / nB;
    const blockX = i => { BW = Math.min(170, SP() - 100); return 140 + i * SP() + SP() / 2 - BW / 2; };
    const gap = () => SP() - BW;
    const IN_X = 70, OUT_X = 880;
    const order = () => back ? [...Array(nB).keys()].reverse() : [...Array(nB).keys()];
    const stations = () => { const s = [back ? OUT_X : IN_X]; order().forEach(i => s.push(back ? blockX(i) - gap() / 2 : blockX(i) + BW + gap() / 2)); s[s.length - 1] = back ? IN_X : OUT_X; return s; };
    function btn(layer, x, y, w, label, fn, primary) { const b = S('g', { cls: 'hit' }, layer); S('rect', { x, y, width: w, height: 48, rx: 14, fill: primary ? 'var(--accent)' : 'var(--board-2)', stroke: primary ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': 1.5 }, b); text(b, x + w / 2, y + 25, label, { 'font-size': 20, 'font-weight': 800, fill: primary ? 'var(--accent-ink)' : 'var(--ink)' }); b.addEventListener('click', fn); return b; }
    function drawMachine() {
      clear(g);
      S('rect', { x: 40, y: 278, width: 880, height: 22, rx: 11, fill: 'var(--line)' }, g);
      for (let i = 0; i < 19; i++) S('path', { d: back ? `M${60 + i * 46} 282 l-8 7 l8 7` : `M${52 + i * 46} 282 l8 7 l-8 7`, stroke: 'var(--line-2)', 'stroke-width': 3, fill: 'none' }, g);
      for (let i = 0; i < nB; i++) {
        const x = blockX(i), [o, n] = ops[i];
        S('rect', { x, y: 190, width: BW, height: 150, rx: 20, fill: cols[i], stroke: 'var(--ink)', 'stroke-width': 2.5 }, g);
        S('rect', { x: x + 20, y: 222, width: BW - 40, height: 70, rx: 12, fill: 'var(--board)' }, g);
        text(g, x + BW / 2, 258, hideRule ? '?' : `${back ? inv[o] : o} ${fmt(n)}`, { 'font-size': BW < 150 ? 30 : 38, 'font-weight': 800, cls: 'disp num' });
        S('circle', { cx: x + 30, cy: 320, r: 6, fill: 'var(--board)', opacity: .6 }, g); S('circle', { cx: x + BW - 30, cy: 320, r: 6, fill: 'var(--board)', opacity: .6 }, g);
      }
      text(g, IN_X + 40, 140, back ? 'Input' : 'Input', { 'font-size': 22, 'font-weight': 700, fill: 'var(--ink-2)' });
      text(g, OUT_X, 140, 'Output', { 'font-size': 22, 'font-weight': 700, fill: 'var(--ink-2)' });
      // table
      S('rect', { x: 950, y: 30, width: 130, height: 560, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      text(g, 985, 60, 'In', { 'font-size': 18, 'font-weight': 700, fill: 'var(--ink-2)' }); text(g, 1045, 60, 'Out', { 'font-size': 18, 'font-weight': 700, fill: 'var(--ink-2)' });
      S('line', { x1: 1015, y1: 46, x2: 1015, y2: 580, stroke: 'var(--line)' }, g);
      hist.slice(-13).forEach(([a, b], i) => { text(g, 985, 98 + i * 37, fmt(a), { 'font-size': 21, cls: 'num' }); text(g, 1045, 98 + i * 37, fmt(b), { 'font-size': 21, cls: 'num', 'font-weight': 700 }); });
    }
    function card(x, v, hide) { const lbl = hide ? '?' : fmt(v), w = Math.max(78, lbl.length * 20 + 28); S('rect', { x: x - w / 2, y: 232, width: w, height: 54, rx: 12, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, ag); text(ag, x, 260, lbl, { 'font-size': 30, 'font-weight': 800, cls: 'disp num' }); }
    function drawAnim() {
      clear(ag); clear(ui);
      const st = stations(), ordr = order();
      if (phase === 'input') {
        const fx = (back ? OUT_X : IN_X + 40) - 80;
        const fo = S('foreignObject', { x: fx, y: 200, width: 160, height: 70 }, ui);
        const inp = H('input', { type: 'number', step: 'any', value: inputVal, placeholder: '?', 'aria-label': back ? 'Output number' : 'Input number', style: 'width:100%;height:100%;box-sizing:border-box;border-radius:14px;border:3px solid var(--accent);background:var(--board);color:var(--ink);font:800 34px var(--f-display);text-align:center' });
        inp.addEventListener('input', () => inputVal = inp.value); inp.addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
        fo.append(inp);
        btn(ui, fx, 380, 160, 'Random', () => { inputVal = String(randIn()); drawAnim(); });
        btn(ui, 420, 470, 220, 'Start the machine', start, true);
        return;
      }
      // trail values
      if (trail) for (let k = 1; k < Math.min(pos + 1, st.length - 1); k++) { const x = st[k]; text(ag, x, 360, fmt(vals[k]), { 'font-size': 20, 'font-weight': 700, cls: 'num', fill: 'var(--ink-2)' }); S('line', { x1: x, y1: 304, x2: x, y2: 344, stroke: 'var(--line-2)', 'stroke-dasharray': '4 4' }, ag); }
      // start card stays visible
      card(st[0], vals[0], false);
      const inside = ordr.some(i => cardX > blockX(i) + 10 && cardX < blockX(i) + BW - 10);
      const last = pos >= st.length - 1;
      if (!inside && Math.abs(cardX - st[0]) > 5) card(cardX, vals[Math.min(pos, vals.length - 1)], last && hideOut && !revealOut);
      if (phase === 'paused') btn(ui, cardX - 80, 400, 160, 'Next block', () => { phase = 'running'; leg(pos); }, true);
      if (phase === 'done') {
        if (hideOut && !revealOut) btn(ui, OUT_X - 90, 400, 180, 'Show output', () => { revealOut = true; drawAnim(); }, true);
        btn(ui, 420, 470, 220, 'Again', () => { phase = 'input'; inputVal = ''; revealOut = false; drawAnim(); }, !hideOut || revealOut);
      }
    }
    function randIn() { const v = rMin + Math.random() * (rMax - rMin); return rDec ? +v.toFixed(1) : Math.round(v); }
    function start() {
      if (inputVal === '' || isNaN(+inputVal)) { c.toast('Type a number in the box first, or tap Random'); return; }
      const ordr = order(); vals = [+inputVal];
      ordr.forEach(i => vals.push(+(back ? apply(vals[vals.length - 1], [inv[ops[i][0]], ops[i][1]]) : apply(vals[vals.length - 1], ops[i])).toFixed(6)));
      pos = 0; cardX = stations()[0]; phase = 'running'; leg(0);
    }
    function leg(k) {
      const st = stations(), from = st[k], to = st[k + 1], t0 = performance.now(), dur = 1100;
      c.raf((dt, now) => {
        const t = clamp((now - t0) / dur, 0, 1); cardX = from + (to - from) * t;
        if (t > .5) pos = k + 1;
        drawAnim();
        if (t >= 1) {
          if (k + 1 >= st.length - 1) { phase = 'done'; const io = back ? [vals[vals.length - 1], vals[0]] : [vals[0], vals[vals.length - 1]]; hist.push(io); drawMachine(); drawAnim(); }
          else if (stepMode) { phase = 'paused'; drawAnim(); }
          else leg(k + 1);
          return false;
        }
      });
    }
    function rebuild() { phase = 'input'; drawMachine(); drawAnim(); }
    const ruleCtl = [];
    function syncRules() { ops.forEach((o, i) => { if (ruleCtl[i]) { ruleCtl[i][0].set(o[0], true); ruleCtl[i][1].set(o[1], true); } }); }
    function setStage(s) {
      stage = s;
      const ks2 = s === 'ks2';
      ks2Bits.forEach(e => e.hidden = !ks2);
      if (!ks2) { nB = 1; ops[0] = [['+', '−'].includes(ops[0][0]) ? ops[0][0] : '+', Math.min(10, Math.max(1, Math.round(ops[0][1])))]; rMin = 0; rMax = 20; rDec = false; }
      ruleCtl.forEach(([sg], i) => { sg.el.querySelectorAll('button').forEach((b, k) => b.hidden = !ks2 && k > 1); });
      blocksSeg.set(nB, true); syncRules(); hist = []; rebuild();
    }
    P.section('Version');
    P.seg({ options: [['ks1', 'KS1: one block, + and −'], ['ks2', 'KS2: up to three blocks']], value: stage, onChange: setStage });
    const ks2Bits = [];
    const before = () => new Set([...svg.closest('.work').querySelector('.dock').children]);
    P.section('Blocks');
    let b0 = before();
    const blocksSeg = P.seg({ label: 'Number of blocks', options: [[1, '1'], [2, '2'], [3, '3']], value: nB, onChange: v => { nB = v; if (v === 3) { stepMode = true; stepT.set(true, true); } hist = []; rebuild(); } });
    [...svg.closest('.work').querySelector('.dock').children].forEach(k => { if (!b0.has(k)) ks2Bits.push(k); });
    for (let i = 0; i < 3; i++) {
      b0 = before();
      const sg = P.seg({ label: 'Block ' + (i + 1), options: [['+', '+'], ['−', '−'], ['×', '×'], ['÷', '÷']], value: ops[i][0], onChange: v => { ops[i][0] = v; hist = []; rebuild(); } });
      const n = P.stepper({ label: 'by', value: ops[i][1], values: [0.1, 0.5, ...range(1, 12), 15, 20, 25, 50, 100], onChange: v => { ops[i][1] = v; hist = []; rebuild(); } });
      ruleCtl.push([sg, n]);
      if (i > 0) [...svg.closest('.work').querySelector('.dock').children].forEach(k => { if (!b0.has(k)) ks2Bits.push(k); });
    }
    P.button('Random rules', () => { const ks2 = stage === 'ks2'; ops = ops.map(() => ks2 ? [['+', '−', '×', '÷'][rnd(0, 3)], rnd(2, 10)] : [['+', '−'][rnd(0, 1)], rnd(1, 10)]); syncRules(); hist = []; rebuild(); });
    P.section('Random input numbers');
    P.stepper({ label: 'From', value: rMin, min: -100, max: 1000, step: v => Math.abs(v) >= 100 ? 50 : Math.abs(v) >= 20 ? 10 : 1, onChange: v => rMin = Math.min(v, rMax - 1) });
    P.stepper({ label: 'To', value: rMax, min: -90, max: 10000, step: v => Math.abs(v) >= 100 ? 50 : Math.abs(v) >= 20 ? 10 : 1, onChange: v => rMax = Math.max(v, rMin + 1) });
    b0 = before();
    P.toggle({ label: 'Decimals (one place)', value: rDec, onChange: v => rDec = v });
    [...svg.closest('.work').querySelector('.dock').children].forEach(k => { if (!b0.has(k)) ks2Bits.push(k); });
    P.section('How it runs');
    const stepT = P.toggle({ label: 'Step through each block', value: stepMode, onChange: v => stepMode = v });
    P.toggle({ label: 'Show values between blocks', value: trail, onChange: v => { trail = v; drawAnim(); } });
    P.toggle({ label: 'Hide the rules', value: hideRule, onChange: v => { hideRule = v; drawMachine(); } });
    P.toggle({ label: 'Hide the output until shown', value: hideOut, onChange: v => hideOut = v });
    b0 = before();
    P.toggle({ label: 'Run backwards (inverse)', value: back, onChange: v => { back = v; hist = []; rebuild(); } });
    [...svg.closest('.work').querySelector('.dock').children].forEach(k => { if (!b0.has(k)) ks2Bits.push(k); });
    P.button('Clear the table', () => { hist = []; drawMachine(); });
    inputVal = ''; setStage('ks1');
  }
});

tool({
  id: 'estimation', name: 'Estimation', strand: 'number', years: [1, 2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Estimate how many objects there are, or what number an arrow points to on a line.',
  tags: 'estimate estimation number line objects guess approximate',
  icon: '<circle cx="12" cy="12" r="3"/><circle cx="22" cy="9" r="3"/><circle cx="17" cy="20" r="3"/><circle cx="30" cy="16" r="3"/><path d="M4 38h40"/><path d="M30 38v-6l-3 3m3-3l3 3"/>',
  guide: ['Objects: a set of objects appears. Drag the yellow marker along the number line to make an estimate, then tap Check.', 'Choose how long the objects stay on screen so the class has to estimate rather than count. Drag objects around to group them if you leave them showing.', 'Number line: an arrow points to a hidden number. Type your guess in the box and tap Check. The difference is shown, or a celebration if you are spot on.', 'Tap Hint to mark the halfway point, then tenths, then quarters.'],
  mount(c) {
    const { svg, P, wrap } = c;
    let mode = 'objects';
    // objects state
    let maxN = 50, objs = [], actual = 0, guess = 25, shown = true, checked = false, showFor = 0, timer = null, oShape = 'circle', mixed = false, sortLabels = null;
    // line state
    let lo = 0, hi = 100, target = 37, lineGuess = null, hint = 0, precision = 1, score = { r: 0, spot: 0 };
    const g = S('g', {}, svg), og = S('g', {}, svg), ug = S('g', {}, svg);
    const ovl = H('div', { cls: 'ovl' }); wrap.append(ovl);
    c.onClean(() => clearTimeout(timer));
    const X0 = 90, X1 = 910;
    function newObjects() {
      clearTimeout(timer);
      actual = rnd(Math.max(5, Math.round(maxN * .25)), maxN); objs = []; checked = false; shown = true; sortLabels = null;
      const r = maxN > 100 ? 9 : maxN > 50 ? 12 : 16, md = r * 2.2;
      for (let i = 0; i < actual; i++) { let p, t = 0; do { p = [40 + Math.random() * 920, 40 + Math.random() * 350]; t++; } while (t < 200 && objs.some(q => Math.hypot(q.x - p[0], q.y - p[1]) < md)); objs.push({ x: p[0], y: p[1], r, c: mixed ? ['red', 'blue', 'green', 'yellow', 'purple'][rnd(0, 4)] : 'orange' }); }
      guess = Math.round(maxN / 2);
      if (showFor) timer = setTimeout(() => { shown = false; drawObjects(); }, showFor * 1000);
      drawObjects(); buildOverlay();
    }
    function drawObjects() {
      clear(g); clear(og); clear(ug);
      S('rect', { x: 20, y: 20, width: 960, height: 390, rx: 18, fill: 'var(--board-2)' }, g);
      if ((shown || checked) && sortLabels && checked) sortLabels.forEach(L => text(og, 60, L.y, String(L.n), { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: col(L.c) }));
      if (shown || checked) objs.forEach(o => {
        const el = S('g', { cls: 'grab' }, og);
        if (oShape === 'circle') S('circle', { cx: o.x, cy: o.y, r: o.r, fill: col(o.c), stroke: 'var(--ink)', 'stroke-width': 1.5 }, el);
        else S('rect', { x: o.x - o.r, y: o.y - o.r, width: o.r * 2, height: o.r * 2, rx: 3, fill: col(o.c), stroke: 'var(--ink)', 'stroke-width': 1.5 }, el);
        let sx, sy, x0, y0; c.drag(el, { start: p => { sx = p.x - o.x; sy = p.y - o.y; x0 = o.x; y0 = o.y; og.append(el); sortLabels = null; }, move: p => { o.x = clamp(p.x - sx, 30, 970); o.y = clamp(p.y - sy, 30, 400); el.setAttribute('transform', `translate(${o.x - x0},${o.y - y0})`); }, end: () => drawObjects() });
      });
      else { text(g, 500, 210, 'How many were there?', { 'font-size': 40, 'font-weight': 800, cls: 'disp', fill: 'var(--ink-3)' }); }
      // estimate line
      const y = 520, X = v => X0 + v / maxN * (X1 - X0);
      S('line', { x1: X0, y1: y, x2: X1, y2: y, stroke: 'var(--ink)', 'stroke-width': 4 }, ug);
      const st = niceStep(maxN);
      for (let v = 0; v <= maxN; v += st / 2) { const major = Math.abs(v / st - Math.round(v / st)) < 1e-9; S('line', { x1: X(v), y1: y - (major ? 12 : 6), x2: X(v), y2: y + (major ? 12 : 6), stroke: 'var(--ink)', 'stroke-width': major ? 2.5 : 1.2 }, ug); if (major) text(ug, X(v), y + 32, nf(v), { 'font-size': 18, 'font-weight': 700, cls: 'num' }); }
      if (checked) { S('path', { d: `M${X(actual)} ${y + 8} l-14 26 h28 z`, fill: 'var(--green)' }, ug); text(ug, X(actual), y + 70, `${actual}`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num', fill: 'var(--green)' }); }
      const m = S('g', { cls: 'grab' }, ug);
      S('rect', { x: X(guess) - 34, y: y - 66, width: 68, height: 44, rx: 12, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2 }, m);
      S('path', { d: `M${X(guess) - 10} ${y - 23} L${X(guess)} ${y - 6} L${X(guess) + 10} ${y - 23} Z`, fill: 'var(--ink)' }, m);
      text(m, X(guess), y - 44, String(guess), { 'font-size': 24, 'font-weight': 800, cls: 'disp num' });
      S('rect', { x: X0 - 20, y: y - 70, width: X1 - X0 + 40, height: 90, fill: 'transparent' }, m);
      c.drag(m, { move: p => { if (checked) return; guess = clamp(Math.round((p.x - X0) / (X1 - X0) * maxN), 0, maxN); drawObjects(); } });
      if (checked) { const d = Math.abs(guess - actual), pct = d / actual, msg = d === 0 ? `Spot on! There are ${actual}.` : `There are ${actual}. Your estimate was ${d} away${pct <= .1 ? ', a very good estimate' : pct <= .25 ? ', a good estimate' : ''}.`, w = Math.min(900, msg.length * 12 + 60); if (d === 0) confetti(500, 300); S('rect', { x: 500 - w / 2, y: 412, width: w, height: 40, rx: 14, fill: d === 0 ? 'var(--green)' : 'var(--ink)', opacity: .94 }, ug); text(ug, 500, 433, msg, { 'font-size': 24, 'font-weight': 800, fill: d === 0 ? '#fff' : 'var(--bg)', cls: 'num' }); }
    }
    function confetti(cx, cy) { for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, r = 80 + Math.random() * 260; S('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a) * .6, r: 4 + Math.random() * 6, fill: col(PALETTE[i % 8]), opacity: .85 }, ug); } }
    function newLine() {
      const span = hi - lo; precision = span <= 2 ? .01 : span <= 20 ? (precisionPref === 'whole' ? 1 : .1) : 1;
      const n = Math.round(span / precision); target = +(lo + rnd(1, n - 1) * precision).toFixed(4);
      lineGuess = null; hint = 0; drawLine(); buildOverlay();
    }
    let precisionPref = 'whole';
    function drawLine() {
      clear(g); clear(og); clear(ug);
      const y = 300, X = v => X0 + (v - lo) / (hi - lo) * (X1 - X0);
      S('line', { x1: X0 - 50, y1: y, x2: X1 + 50, y2: y, stroke: 'var(--ink)', 'stroke-width': 5 }, g);
      S('path', { d: `M${X1 + 64} ${y} l-20 -12 v24 z M${X0 - 64} ${y} l20 -12 v24 z`, fill: 'var(--ink)' }, g);
      [[lo, X0], [hi, X1]].forEach(([v, x]) => { S('line', { x1: x, y1: y - 22, x2: x, y2: y + 22, stroke: 'var(--ink)', 'stroke-width': 4 }, g); text(g, x, y + 54, nf(v), { 'font-size': 32, 'font-weight': 800, cls: 'disp num' }); });
      if (hint >= 1) { const m = (lo + hi) / 2; S('line', { x1: X(m), y1: y - 18, x2: X(m), y2: y + 18, stroke: 'var(--purple)', 'stroke-width': 3 }, g); text(g, X(m), y + 46, nf(m), { 'font-size': 20, 'font-weight': 700, fill: 'var(--purple)', cls: 'num' }); }
      if (hint >= 2) for (let k = 1; k < 10; k++) if (k !== 5) S('line', { x1: X0 + k * (X1 - X0) / 10, y1: y - 10, x2: X0 + k * (X1 - X0) / 10, y2: y + 10, stroke: 'var(--ink-2)', 'stroke-width': 2 }, g);
      if (hint >= 3) [1, 3].forEach(k => { const v = lo + (hi - lo) * k / 4; S('line', { x1: X(v), y1: y - 16, x2: X(v), y2: y + 16, stroke: 'var(--teal)', 'stroke-width': 3 }, g); text(g, X(v), y + 46, nf(+v.toFixed(3)), { 'font-size': 18, fill: 'var(--teal)', cls: 'num', 'font-weight': 700 }); });
      const tx = X(target);
      S('path', { d: `M${tx} ${y - 10} l-16 -30 h10 v-50 h12 v50 h10 z`, fill: 'var(--red)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, g);
      text(g, tx, y - 110, lineGuess == null ? '?' : nf(target), { 'font-size': 36, 'font-weight': 800, cls: 'disp num', fill: 'var(--red)' });
      if (lineGuess != null) {
        const gx = X(clamp(lineGuess, lo - (hi - lo) * .06, hi + (hi - lo) * .06)), d = +Math.abs(lineGuess - target).toFixed(4);
        S('path', { d: `M${gx} ${y + 10} l-14 26 h28 z`, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, g);
        text(g, gx, y + 92, `You said ${nf(lineGuess)}`, { 'font-size': 18, 'font-weight': 700 });
        if (d > 0) { S('line', { x1: Math.min(gx, tx), y1: y - 6, x2: Math.max(gx, tx), y2: y - 6, stroke: 'var(--green)', 'stroke-width': 6, opacity: .6 }, g); }
        text(g, 500, 500, d === 0 ? 'Spot on! Brilliant.' : `It was ${nf(target)}. You were ${nf(d)} away.`, { 'font-size': 32, 'font-weight': 800, cls: 'disp', fill: d === 0 ? 'var(--green)' : 'var(--ink)' });
        if (d === 0) confetti(500, 220);
      }
      text(g, 950, 40, `${score.spot} spot on out of ${score.r}`, { 'font-size': 16, fill: 'var(--ink-3)', 'text-anchor': 'end' });
    }
    function buildOverlay() {
      clear(ovl);
      if (mode === 'objects') {
        const inp = H('input', { type: 'number', value: guess, 'aria-label': 'Your estimate' });
        inp.addEventListener('input', () => { guess = clamp(+inp.value || 0, 0, maxN); drawObjects(); });
        ovl.append(H('span', { cls: 'lbl', text: 'Estimate' }), inp, H('button', { cls: 'primary', text: 'Check', on: { click: () => { checked = true; clearTimeout(timer); drawObjects(); } } }), H('button', { text: 'New picture', on: { click: newObjects } }));
      } else {
        const inp = H('input', { type: 'number', step: 'any', placeholder: '?', 'aria-label': 'Your guess' });
        const check = () => { if (inp.value === '') return c.toast('Type your guess first'); lineGuess = +inp.value; score.r++; if (Math.abs(lineGuess - target) < 1e-9) score.spot++; drawLine(); };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
        ovl.append(H('span', { cls: 'lbl', text: 'The arrow points to' }), inp, H('button', { cls: 'primary', text: 'Check', on: { click: check } }), H('button', { text: 'Hint', on: { click: () => { hint = Math.min(3, hint + 1); drawLine(); } } }), H('button', { text: 'Next', on: { click: newLine } }));
        setTimeout(() => inp.focus(), 50);
      }
    }
    // panel
    P.section('Mode');
    P.seg({ options: [['objects', 'Objects'], ['line', 'Number line']], value: mode, onChange: v => { mode = v; oSec.forEach(e => e.hidden = v !== 'objects'); lSec.forEach(e => e.hidden = v !== 'line'); v === 'objects' ? newObjects() : newLine(); } });
    const oSec = [], lSec = [];
    const grab = (arr, fn) => { const before = new Set(dockKids()); fn(); dockKids().forEach(k => { if (!before.has(k)) arr.push(k); }); };
    const dockKids = () => [...(ovl.closest('.work') || document).querySelector('.dock').children];
    grab(oSec, () => {
      P.section('Objects');
      P.seg({ label: 'Up to', options: [[20, '20'], [50, '50'], [100, '100'], [200, '200'], [500, '500']], value: maxN, onChange: v => { maxN = v; newObjects(); } });
      P.seg({ label: 'Show the objects for', options: [[0, 'Always'], [3, '3 s'], [5, '5 s'], [10, '10 s']], value: showFor, onChange: v => { showFor = v; newObjects(); } });
      P.seg({ label: 'Objects', options: [['circle', 'Counters'], ['square', 'Squares']], value: oShape, onChange: v => { oShape = v; drawObjects(); } });
      P.toggle({ label: 'Mixed colours', value: mixed, onChange: v => { mixed = v; newObjects(); } });
      P.button('Sort into rows of ten', () => {
        const order = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const groups = order.map(cl => objs.filter(o => o.c === cl)).filter(gp => gp.length);
        const r0 = objs[0] ? objs[0].r : 14; let step = r0 * 2.5, fits = false;
        while (!fits && step > 8) { const blockW = step * 10.8, perRow = Math.max(1, Math.floor((900 - 50) / blockW)); const rows = groups.reduce((t, gp) => t + Math.ceil(Math.ceil(gp.length / 10) / perRow), 0); fits = 40 + rows * step * 1.25 + (groups.length - 1) * step * .5 < 395; if (!fits) step *= .9; }
        const sc = step / (r0 * 2.5), blockW = step * 10.8, perRow = Math.max(1, Math.floor((900 - 50) / blockW)); let y = 40 + step / 2;
        sortLabels = [];
        groups.forEach(gp => { sortLabels.push({ y, n: gp.length, c: gp[0].c }); gp.forEach((o, k) => { const ten = Math.floor(k / 10), kk = k % 10; o.r = r0 * Math.min(1, sc); o.x = 110 + (ten % perRow) * blockW + kk * step; o.y = y + Math.floor(ten / perRow) * step * 1.25; }); y += Math.ceil(Math.ceil(gp.length / 10) / perRow) * step * 1.25 + step * .5; });
        shown = true; drawObjects();
      });
      P.button('New picture', newObjects, 'primary');
    });
    grab(lSec, () => {
      P.section('Number line');
      P.seg({ label: 'Ready-made lines', options: [['0,10', '0–10'], ['0,20', '0–20'], ['0,100', '0–100'], ['0,1000', '0–1000'], ['0,1', '0–1'], ['-50,50', '−50–50'], ['100,200', '100–200'], ['250,750', '250–750']], value: '0,100', retrigger: true, onChange: v => { [lo, hi] = v.split(',').map(Number); f1.set(lo); f2.set(hi); newLine(); } });
      const f1 = P.field({ label: 'Start', value: lo, type: 'number', live: false, onChange: v => { if (+v < hi) { lo = +v; newLine(); } } });
      const f2 = P.field({ label: 'End', value: hi, type: 'number', live: false, onChange: v => { if (+v > lo) { hi = +v; newLine(); } } });
      P.button('Random start and end', () => { const spans = [10, 20, 50, 100, 200, 1000]; const sp = spans[rnd(0, spans.length - 1)]; lo = rnd(0, 9) * sp / 2; hi = lo + sp; f1.set(lo); f2.set(hi); newLine(); });
      P.seg({ label: 'For short lines, hidden numbers are', options: [['whole', 'Whole numbers'], ['tenths', 'Tenths']], value: precisionPref, onChange: v => { precisionPref = v; newLine(); } });
      P.button('Reset score', () => { score = { r: 0, spot: 0 }; drawLine(); });
    });
    lSec.forEach(e => e.hidden = true);
    newObjects();
  }
});

tool({
  id: 'subitising', name: 'Subitising', strand: 'number', years: [0, 1, 2], w: 1000, h: 640,
  desc: 'Flash dots, dice and ten frames for a moment and say how many without counting. Eight levels.',
  tags: 'subitise subitising dot patterns dice ten frame flash quick look game',
  icon: '<rect x="6" y="6" width="36" height="36" rx="8"/><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="32" cy="32" r="3" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor"/>',
  guide: ['Pick a level in the panel. Levels go from dice patterns of 1 to 3 up to mixed shapes and how many altogether.', 'Tap Flash. The pattern shows for a moment then hides, so children recognise it rather than count it.', 'Tap the number you saw. A correct answer earns a star; a wrong one shows the pattern again.', 'Make the flash shorter as children get quicker. Turn off the number buttons to answer aloud as a class, then tap Show me.', 'The same number never comes up twice in a row. Turn on Rounds of 10 for a scored round, and sounds for right and wrong answers.'],
  mount(c) {
    const { svg, P, wrap } = c;
    const LEVELS = [
      ['Dice patterns 1 to 3', 'dice', 1, 3], ['Dice patterns 1 to 6', 'dice', 1, 6], ['Ten frame 1 to 10', 'frame', 1, 10], ['Ten frame, two colours', 'frame2', 2, 10], ['Two ten frames, 11 to 20', 'frames20', 11, 20], ['Scattered dots 1 to 5', 'scatter', 1, 5],
      ['Two groups, how many altogether', 'parts', 2, 10], ['Doubles and near doubles', 'doubles', 2, 12], ['Dominoes', 'domino', 2, 12], ['How many squares?', 'mixed1', 1, 6], ['Squares, circles or altogether', 'mixed2', 2, 12]];
    let autoUp = true, levelUp = false, level = 0, flash = 1.5, buttons = true, q = null, phase = 'ready', stars = 0, streak = 0, timer = null, colour = 'blue', lastAns = null, rounds = false, round = { n: 0, right: 0 }, sounds = true, actx = null;
    const beep = ok => { if (!sounds) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime; (ok ? [[660, 0], [880, .12]] : [[220, 0]]).forEach(([f, d]) => { const o = actx.createOscillator(), gn = actx.createGain(); o.type = ok ? 'sine' : 'triangle'; o.frequency.value = f; gn.gain.setValueAtTime(.0001, t + d); gn.gain.exponentialRampToValueAtTime(.25, t + d + .02); gn.gain.exponentialRampToValueAtTime(.0001, t + d + (ok ? .35 : .4)); o.connect(gn); gn.connect(actx.destination); o.start(t + d); o.stop(t + d + .5); }); } catch (e) { } };
    c.onClean(() => { try { actx && actx.close(); } catch (e) { } });
    const g = S('g', {}, svg), fg = S('g', {}, svg);
    const ovl = H('div', { cls: 'ovl' }); wrap.append(ovl);
    c.onClean(() => clearTimeout(timer));
    const DICE = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    function make() {
      const [, kind, mn, mx] = LEVELS[level], items = [];
      let ans, ask = 'How many?';
      const dot = (x, y, cl = colour, sh = 'circle', r = 30) => items.push({ x, y, cl, sh, r });
      const dicePat = (n, cx, cy, s = 70, cl) => DICE[n].forEach(([a, b]) => dot(cx + a * s, cy + b * s, cl));
      if (kind === 'dice') { ans = rnd(mn, mx); dicePat(ans, 500, 290); }
      else if (kind === 'frame2') { const a = rnd(1, 9), b = rnd(1, 10 - a); ans = a + b; ask = 'How many altogether?'; for (let i = 0; i < ans; i++) dot(340 + (i % 5) * 80, 250 + Math.floor(i / 5) * 80, i < a ? 'red' : 'blue', 'circle', 30); items.frame = true; items.parts = [a, b]; }
      else if (kind === 'frames20') { ans = rnd(11, 20); for (let i = 0; i < ans; i++) { const f = Math.floor(i / 10), k = i % 10; dot(340 + (k % 5) * 80, 180 + f * 175 + Math.floor(k / 5) * 80, colour, 'circle', 30); } items.frames = 2; items.parts = [10, ans - 10]; }
      else if (kind === 'domino') { const a = rnd(1, 6), b = rnd(1, 6); ans = a + b; ask = 'How many spots altogether?'; dicePat(a, 400, 290, 46, 'ink'); dicePat(b, 600, 290, 46, 'ink'); items.domino = true; items.parts = [a, b]; }
      else if (kind === 'frame') { ans = rnd(mn, mx); for (let i = 0; i < ans; i++) dot(340 + (i % 5) * 80, 250 + Math.floor(i / 5) * 80, colour, 'circle', 30); items.frame = true; }
      else if (kind === 'scatter') { ans = rnd(mn, mx); const pts = []; let tr = 0; while (pts.length < ans && tr++ < 5000) { const p = [260 + Math.random() * 480, 160 + Math.random() * 290]; if (tr > 4000 || pts.every(o => Math.hypot(o[0] - p[0], o[1] - p[1]) > 90)) pts.push(p); } pts.forEach(p => dot(p[0], p[1])); }
      else if (kind === 'parts') { const a = rnd(1, 5), b = rnd(1, Math.min(5, 10 - a)); ans = a + b; ask = 'How many altogether?'; dicePat(a, 330, 290, 62, 'red'); dicePat(b, 670, 290, 62, 'blue'); items.parts = [a, b]; }
      else if (kind === 'doubles') { const a = rnd(1, 6), b = Math.min(6, a + rnd(0, 1)); ans = a + b; ask = 'How many altogether?'; dicePat(a, 330, 290, 62, 'green'); dicePat(b, 670, 290, 62, 'green'); }
      else {
        const ns = rnd(1, kind === 'mixed1' ? 6 : 6), nc = rnd(1, kind === 'mixed1' ? 5 : 6), pts = [];
        let tr = 0; while (pts.length < ns + nc && tr++ < 5000) { const p = [180 + Math.random() * 640, 160 + Math.random() * 290]; if (tr > 4000 || pts.every(o => Math.hypot(o[0] - p[0], o[1] - p[1]) > 84)) pts.push(p); }
        pts.forEach((p, i) => dot(p[0], p[1], i < ns ? 'orange' : 'teal', i < ns ? 'square' : 'circle', 28));
        const which = kind === 'mixed1' ? 's' : ['s', 'c', 'a'][rnd(0, 2)];
        ans = which === 's' ? ns : which === 'c' ? nc : ns + nc; ask = which === 's' ? 'How many squares?' : which === 'c' ? 'How many circles?' : 'How many altogether?';
        items.mix = [ns, nc];
      }
      return { items, ans, ask, max: mx };
    }
    function drawItems(show) {
      clear(fg);
      if (!q) return;
      if (q.items.frames) { for (let f = 0; f < 2; f++) for (let i = 0; i < 10; i++) S('rect', { x: 300 + (i % 5) * 80, y: 140 + f * 175 + Math.floor(i / 5) * 80, width: 80, height: 80, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, fg); }
      if (q.items.domino && show) { S('rect', { x: 290, y: 175, width: 420, height: 230, rx: 26, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 5 }, fg); S('line', { x1: 500, y1: 195, x2: 500, y2: 385, stroke: 'var(--ink)', 'stroke-width': 4 }, fg); }
      if (q.items.frame) { for (let i = 0; i < 10; i++) S('rect', { x: 300 + (i % 5) * 80, y: 210 + Math.floor(i / 5) * 80, width: 80, height: 80, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 3 }, fg); }
      if (!show) { S('rect', { x: 150, y: 90, width: 700, height: 400, rx: 30, fill: 'var(--accent)' }, fg); text(fg, 500, 290, phase === 'answer' ? q.ask : '', { 'font-size': 46, 'font-weight': 800, cls: 'disp', fill: 'var(--accent-ink)' }); return; }
      text(fg, 500, 124, q.ask, { 'font-size': 26, 'font-weight': 800, cls: 'disp', fill: 'var(--ink-2)' });
      q.items.forEach(o => { if (q.items.domino) o.r = 19; if (o.sh === 'square') S('rect', { x: o.x - o.r, y: o.y - o.r, width: o.r * 2, height: o.r * 2, rx: 5, fill: col(o.cl), stroke: 'var(--ink)', 'stroke-width': 2 }, fg); else S('circle', { cx: o.x, cy: o.y, r: o.r, fill: col(o.cl), stroke: 'var(--ink)', 'stroke-width': 2 }, fg); });
    }
    function drawFrame(msg, ok) {
      clear(g);
      S('rect', { x: 150, y: 90, width: 700, height: 400, rx: 30, fill: 'var(--board-2)' }, g);
      text(g, 40, 44, `Level ${level + 1}: ${LEVELS[level][0]}`, { 'font-size': 24, 'font-weight': 800, cls: 'disp', 'text-anchor': 'start' });
      for (let i = 0; i < 5; i++) { const x = 760 + i * 32; const on = i < streak; const p = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 13; p.push((x + r * Math.cos(a)) + ',' + (40 + r * Math.sin(a))); } S('polygon', { points: p.join(' '), fill: on ? 'var(--yellow)' : 'var(--line)', stroke: on ? 'var(--ink)' : 'none', 'stroke-width': 1 }, g); }
      text(g, 960, 40, `${stars} ★`, { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'end', fill: 'var(--orange)' });
      if (msg) text(g, 500, 540, msg, { 'font-size': 34, 'font-weight': 800, cls: 'disp', fill: ok ? 'var(--green)' : 'var(--ink)' });
      if (phase === 'ready' && !msg) text(g, 500, 290, 'Tap Flash when everyone is looking', { 'font-size': 30, 'font-weight': 700, fill: 'var(--ink-3)' });
    }
    function go() {
      if (levelUp) { levelUp = false; setLevel(level + 1); }
      if (rounds && round.n >= 10) round = { n: 0, right: 0 };
      clearTimeout(timer); let tries = 0; do q = make(); while (q.ans === lastAns && tries++ < 40); lastAns = q.ans; phase = 'flash'; drawFrame(); drawItems(true); buildOverlay();
      if (flash > 0) timer = setTimeout(() => { phase = 'answer'; drawItems(false); buildOverlay(); }, flash * 1000);
      else { phase = 'answer'; buildOverlay(); }
    }
    function answer(n) {
      if (!q || phase !== 'answer') return;
      const ok = n === q.ans; beep(ok); if (rounds) { round.n++; if (ok) round.right++; }
      const tail = rounds ? (round.n >= 10 ? `   Round over: ${round.right} out of 10!` : `   (${round.n} of 10)`) : '';
      if (ok) { streak = Math.min(5, streak + 1); stars++; phase = 'done'; let msg = praise(); if (streak >= 5 && autoUp && level < LEVELS.length - 1) { msg = `5 in a row! Next: level ${level + 2}`; levelUp = true; } drawFrame(msg + tail, true); drawItems(true); }
      else { streak = 0; phase = 'done'; drawFrame(`It was ${q.ans}. Look again.` + tail, false); drawItems(true); }
      buildOverlay();
    }
    const praise = () => ['Yes! ' + q.ans, 'Brilliant!', 'Spot on!', 'Well done!', 'Super seeing!'][rnd(0, 4)] + (q.items.parts ? `  ${q.items.parts[0]} and ${q.items.parts[1]} make ${q.ans}` : '');
    function buildOverlay() {
      clear(ovl);
      if (phase === 'answer' && buttons) { const top = Math.max(q.max, 6); for (let n = q.max > 12 ? 10 : 0; n <= top; n++) ovl.append(H('button', { cls: 'numb', text: String(n), on: { click: () => answer(n) } })); ovl.append(H('button', { text: 'Show me', on: { click: () => { phase = 'done'; drawFrame(`${q.ans}`, true); drawItems(true); buildOverlay(); } } })); }
      else if (phase === 'answer') ovl.append(H('button', { cls: 'primary', text: 'Show me', on: { click: () => { phase = 'done'; drawFrame(`It was ${q.ans}`, true); drawItems(true); buildOverlay(); } } }), H('button', { text: 'Flash again', on: { click: () => { phase = 'flash'; drawItems(true); timer = setTimeout(() => { phase = 'answer'; drawItems(false); buildOverlay(); }, flash * 1000); } } }));
      else if (phase !== 'flash') ovl.append(H('button', { cls: 'primary', text: phase === 'done' ? 'Next one' : 'Flash', on: { click: go } }));
      ovl.hidden = phase === 'flash';
    }
    P.section('Level');
    const lv = H('div', { style: 'display:flex;flex-direction:column;gap:4px' });
    const lbtns = LEVELS.map((L, i) => { const b = H('button', { cls: 'btn', style: 'text-align:left;padding:0 12px;font-weight:600;margin:0', text: `${i + 1}. ${L[0]}`, on: { click: () => { level = i; lbtns.forEach((x, k) => x.classList.toggle('primary', k === i)); streak = 0; phase = 'ready'; q = null; clear(fg); drawFrame(); buildOverlay(); } } }); lv.append(b); return b; });
    lbtns[0].classList.add('primary'); P.raw(lv);
    function setLevel(i) { level = i; lbtns.forEach((x, k) => x.classList.toggle('primary', k === i)); streak = 0; }
    P.section('Flash');
    P.seg({ label: 'Show the pattern for', options: [[0.5, '½ s'], [1, '1 s'], [1.5, '1½ s'], [2, '2 s'], [2.5, '2½ s'], [3, '3 s'], [0, 'Until answered']], value: flash, onChange: v => flash = v });
    P.seg({ label: 'Colour of dots', options: [['blue', 'Blue'], ['red', 'Red'], ['purple', 'Purple'], ['green', 'Green']], value: colour, onChange: v => colour = v });
    P.toggle({ label: 'Number buttons for answers', value: buttons, onChange: v => { buttons = v; buildOverlay(); } });
    P.toggle({ label: 'Move up a level after 5 in a row', value: autoUp, onChange: v => autoUp = v });
    P.toggle({ label: 'Rounds of 10 questions', value: rounds, onChange: v => { rounds = v; round = { n: 0, right: 0 }; } });
    P.toggle({ label: 'Sounds for right and wrong', value: sounds, onChange: v => sounds = v });
    P.button('Reset stars', () => { stars = 0; streak = 0; drawFrame(); });
    drawFrame(); buildOverlay();
  }
});

tool({
  id: 'algebra', name: 'Algebra balance', strand: 'number', years: [5, 6], w: 1000, h: 680,
  desc: 'Shapes or letters stand for hidden numbers. Balance them to find the unknowns and write the equation.',
  tags: 'algebra unknown equation balance letters shapes solve variables',
  icon: '<path d="M24 8v32M10 40h28M8 16h32"/><path d="M8 16l-5 10h10zM40 16l-5 10h10z"/><path d="M21 4h6l-3 5z"/>',
  guide: ['Each shape stands for a number. Set the numbers in the panel, then decide whether the class can see them.', 'Drag shapes and number tiles from the tray onto the pans. The tray never runs out. The equation is written above the scales as you build it.', 'Switch to letters to show the same equation in algebra: 2 triangles + 3 becomes 2b + 3.', 'Try a random puzzle. Take the same thing off both sides to keep it balanced, and work out what the shape is worth.', 'Type your answer in the box on the board and tap Check. Show the answer reveals it.'],
  mount(c) {
    const { svg, P, wrap } = c;
    const ovl = H('div', { cls: 'ovl', hidden: true, style: 'top:14%;bottom:auto;flex-wrap:nowrap;white-space:nowrap;padding:6px 10px' }); wrap.append(ovl);
    const SH = ['circle', 'triangle', 'square', 'star'], LET = { circle: 'a', triangle: 'b', square: 'c', star: 'd' }, SC = { circle: 'red', triangle: 'green', square: 'blue', star: 'orange' };
    let vals = { circle: 3, triangle: 2, square: 4, star: 5 }, showVals = true, letters = false, items = [], ang = 0, puzzle = null, uid = 0, showWork = false;
    const g = S('g', {}, svg), ig = S('g', {}, svg), dg = S('g', {}, svg);
    const TRAY = { y: 586, h: 80 }, BIN = { x: 902, y: 586, w: 80, h: 80 };
    const val = it => it.kind === 'num' ? it.n : vals[it.kind];
    const tot = s => items.filter(i => i.side === s).reduce((t, i) => t + val(i), 0);
    const W = it => it.kind === 'num' ? 52 : 58;
    function glyph(layer, kind, x, y, s, label = true, hide = false) {
      const f = col(SC[kind]), st = { fill: f, stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' };
      if (letters) { S('rect', Object.assign({ x: x - s / 2, y: y - s / 2, width: s, height: s, rx: 10 }, st), layer); text(layer, x, y + 1, LET[kind], { 'font-size': s * .6, 'font-weight': 800, fill: '#fff', cls: 'disp', 'font-style': 'italic' }); }
      else if (kind === 'circle') S('circle', Object.assign({ cx: x, cy: y, r: s / 2 }, st), layer);
      else if (kind === 'square') S('rect', Object.assign({ x: x - s / 2, y: y - s / 2, width: s, height: s, rx: 3 }, st), layer);
      else if (kind === 'triangle') S('polygon', Object.assign({ points: `${x},${y - s / 2} ${x + s / 2},${y + s * .42} ${x - s / 2},${y + s * .42}` }, st), layer);
      else { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .22 : s * .52; p.push((x + r * Math.cos(a)) + ',' + (y + r * Math.sin(a))); } S('polygon', Object.assign({ points: p.join(' ') }, st), layer); }
      if (label && showVals && !letters && !hide) text(layer, x, y + (kind === 'triangle' ? 7 : 1), String(vals[kind]), { 'font-size': s * .36, 'font-weight': 800, fill: '#fff', cls: 'num', 'pointer-events': 'none' });
    }
    function hiddenFor(kind) { return puzzle && puzzle.hide.includes(kind) && !puzzle.shown; }
    function piece(layer, it, x, y) {
      const grp = S('g', { cls: 'grab', transform: `translate(${x},${y})` }, layer);
      if (it.kind === 'num') { S('rect', { width: 52, height: 46, rx: 10, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, grp); text(grp, 26, 24, String(it.n), { 'font-size': 24, 'font-weight': 800, cls: 'disp num' }); }
      else glyph(grp, it.kind, 29, 23, 46, true, hiddenFor(it.kind));
      return grp;
    }
    function eqTokens(side) {
      const list = items.filter(i => i.side === side), out = [];
      SH.forEach(k => { const n = list.filter(i => i.kind === k).length; if (n) out.push({ k, n }); });
      const cst = list.filter(i => i.kind === 'num').reduce((t, i) => t + i.n, 0); if (cst || !out.length) out.push({ num: cst });
      return out;
    }
    function drawEquation(y) {
      const L = eqTokens('L'), R = eqTokens('R'), l = tot('L'), r = tot('R'), eq = Math.abs(l - r) < 1e-9;
      const seq = [];
      const pushSide = toks => toks.forEach((t, i) => { if (i) seq.push({ t: '+' }); if (t.num != null) seq.push({ t: String(t.num) }); else { if (t.n > 1) seq.push({ t: String(t.n), tight: true }); seq.push({ k: t.k }); } });
      pushSide(L); seq.push({ t: eq ? '=' : l > r ? '>' : '<', sign: true }); pushSide(R);
      const fs = 40, widths = seq.map(s => s.k ? (letters ? 26 : 40) : s.t.length * fs * .58 + (s.tight ? 2 : 18));
      let x = 500 - widths.reduce((a, b) => a + b, 0) / 2;
      seq.forEach((s, i) => {
        const w = widths[i];
        if (s.k) { if (letters) text(g, x + w / 2, y, LET[s.k], { 'font-size': fs, 'font-weight': 800, 'font-style': 'italic', cls: 'disp', fill: col(SC[s.k]) }); else glyph(g, s.k, x + w / 2, y, 32, false); }
        else text(g, x + w / 2, y, s.t, { 'font-size': fs, 'font-weight': 800, cls: 'disp num', fill: s.sign ? (eq ? 'var(--green)' : 'var(--ink-3)') : 'var(--ink)' });
        x += w;
      });
      if (showWork && !(puzzle && !puzzle.shown)) { const side = s => items.filter(i => i.side === s).map(val).join(' + ') || '0'; [['L', 230, 'red'], ['R', 770, 'blue']].forEach(([sd, x, cl]) => { const tt = `${side(sd)} = ${nf(sd === 'L' ? l : r)}`, w = Math.max(120, tt.length * 11 + 30); S('rect', { x: x - w / 2, y: y + 30, width: w, height: 38, rx: 12, fill: col(cl + '-s'), stroke: col(cl), 'stroke-width': 2 }, g); text(g, x, y + 50, tt, { 'font-size': 19, 'font-weight': 700, cls: 'num', fill: 'var(--ink)' }); }); }
      if (puzzle && puzzle.shown) text(g, 500, y + (showWork ? 96 : 44), puzzle.answer, { 'font-size': 20, 'font-weight': 700, fill: puzzle.shown ? 'var(--green)' : 'var(--purple)' });
    }
    function place(ps) { ['L', 'R'].forEach((s, k) => { let x = 0, row = 0; items.filter(i => i.side === s).forEach(it => { const w = W(it); if (x + w > 262) { x = 0; row++; } it.px = ps[k].x - 131 + x; it.py = ps[k].y - 48 - row * 50; x += w + 4; }); }); }
    function draw() {
      clear(g);
      const ps = drawBalance(g, ang, { cy: 200, base: 470 });
      drawEquation(50);
      S('rect', { x: 18, y: TRAY.y, width: 870, height: TRAY.h, rx: 16, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      const src = [...SH.map(k => ({ kind: k })), ...range(1, 10).map(n => ({ kind: 'num', n }))];
      src.forEach((s, i) => {
        const x = 30 + i * 61, el = piece(g, s, x, TRAY.y + 17);
        let it; c.drag(el, { start: p => { it = Object.assign({ id: ++uid, side: null }, s); items.push(it); it.drag = { x: p.x - 28, y: p.y - 24 }; drawItems(); }, move: p => { it.drag = { x: p.x - 28, y: p.y - 24 }; drawItems(); }, end: p => drop(it, p) });
      });
      S('rect', { x: BIN.x, y: BIN.y, width: BIN.w, height: BIN.h, rx: 16, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      S('path', { d: `M${BIN.x + 24} ${BIN.y + 26} h32 M${BIN.x + 34} ${BIN.y + 26} v-6 h12 v6 M${BIN.x + 27} ${BIN.y + 31} l3 34 h20 l3 -34`, stroke: 'var(--ink-3)', 'stroke-width': 3, fill: 'none' }, g);
      if (showVals && !(puzzle && !puzzle.shown)) { let x = 40; SH.forEach(k => { if (!items.some(i => i.kind === k)) return; glyph(g, k, x + 14, 545, 26, false); text(g, x + 34, 546, `= ${vals[k]}`, { 'font-size': 20, 'font-weight': 700, cls: 'num', 'text-anchor': 'start' }); x += 110; }); }
      place(ps); drawItems();
    }
    function drawItems() {
      clear(ig); clear(dg);
      items.forEach(it => {
        if (it.drag) { piece(dg, it, it.drag.x, it.drag.y); return; }
        if (!it.side) return;
        const el = piece(ig, it, it.px, it.py); let ox, oy;
        c.drag(el, { start: p => { ox = p.x - it.px; oy = p.y - it.py; }, move: p => { it.drag = { x: p.x - ox, y: p.y - oy }; drawItems(); }, end: p => { if (it.drag) drop(it, p); } });
      });
    }
    function drop(it, p) { delete it.drag; if (p.y > TRAY.y - 30) items.splice(items.indexOf(it), 1); else it.side = p.x < 500 ? 'L' : 'R'; checkSolved(); draw(); }
    function checkSolved() { }
    c.raf(() => { const t = tiltFor(tot('L'), tot('R')), d = t - ang; if (Math.abs(d) > .03) { ang += d * .09; draw(); } });
    const add = (side, kind, n) => items.push({ id: ++uid, side, kind, n });
    const name = k => letters ? LET[k] : 'the ' + k;
    function randomPuzzle() {
      items = []; const t = rnd(1, 3), ks = shuffle(SH);
      if (t === 1) { const X = ks[0], v = rnd(2, 9), k = rnd(1, 3), n = rnd(1, 9); vals[X] = v; for (let i = 0; i < k; i++) add('L', X); add('L', 'num', n); let m = k * v + n; while (m > 0) { const q = Math.min(10, m); add('R', 'num', q); m -= q; } puzzle = { hide: [X], ask: `What is ${name(X)} worth?`, answer: `${letters ? LET[X] : 'The ' + X} = ${v}` }; }
      else if (t === 2) { const X = ks[0], Y = ks[1], yv = rnd(2, 6), j = rnd(1, 3), k = [1, 2, 3].find(kk => (j * yv) % kk === 0 && kk !== j && (j * yv) / kk > 0) || 1; vals[Y] = yv; vals[X] = j * yv / k; for (let i = 0; i < k; i++) add('L', X); for (let i = 0; i < j; i++) add('R', Y); puzzle = { hide: [X], ask: `${letters ? LET[Y] : 'The ' + Y} is ${yv}. What is ${name(X)} worth?`, answer: `${letters ? LET[X] : 'The ' + X} = ${vals[X]}` }; }
      else { const X = ks[0], Y = ks[1], n = rnd(2, 9); vals[X] = n; vals[Y] = rnd(2, 9); add('L', X); add('L', Y); add('R', Y); add('R', 'num', n); puzzle = { hide: [X, Y], ask: `Take the same off both sides. What is ${name(X)} worth?`, answer: `${letters ? LET[X] : 'The ' + X} = ${n}  (${letters ? LET[Y] : 'the ' + Y} = ${vals[Y]})` }; }
      puzzle.key = puzzle.hide[0]; puzzle.val = vals[puzzle.key]; puzzle.tries = 0;
      syncSteppers(); draw(); answerBox();
    }
    function answerBox() {
      clear(ovl); ovl.hidden = !puzzle || puzzle.shown;
      if (ovl.hidden) return;
      const k = puzzle.key, sym = H('span', { cls: 'lbl', style: 'font-size:20px;font-weight:800' });
      sym.innerHTML = letters ? `<i style="font-family:var(--f-display);font-size:28px;color:var(--${SC[k]})">${LET[k]}</i> =` : `<svg width="34" height="34" viewBox="0 0 48 48" style="vertical-align:middle">${k === 'circle' ? '<circle cx="24" cy="24" r="20"' : k === 'square' ? '<rect x="4" y="4" width="40" height="40" rx="4"' : k === 'triangle' ? '<polygon points="24,3 45,42 3,42"' : '<polygon points="24,2 30,17 46,18 34,29 38,45 24,36 10,45 14,29 2,18 18,17"'} fill="var(--${SC[k]})" stroke="var(--ink)" stroke-width="3"/></svg> =`;
      const inp = H('input', { type: 'number', step: 'any', placeholder: '?', 'aria-label': 'Your answer' });
      const fb = H('span', { cls: 'lbl' });
      const check = () => { if (inp.value === '') return c.toast('Type your answer first'); puzzle.tries++; if (Math.abs(+inp.value - puzzle.val) < 1e-9) { puzzle.shown = true; syncSteppers(); draw(); answerBox(); c.toast('Correct! Well done.'); } else { fb.textContent = puzzle.tries > 1 ? 'Not yet. Take the same thing off both sides, then try again.' : 'Not yet. Try again.'; fb.style.color = 'var(--red)'; inp.select(); } };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      ovl.append(H('span', { cls: 'lbl', style: 'font-weight:700;color:var(--purple)', text: puzzle.ask.replace('Take the same off both sides. ', '') }), sym, inp, H('button', { cls: 'primary', text: 'Check', on: { click: check } }), fb);
    }
    P.section('What each shape is worth');
    const steps = SH.map(k => P.stepper({ label: `${k[0].toUpperCase() + k.slice(1)}  (${LET[k]})`, value: vals[k], min: 1, max: 20, onChange: v => { vals[k] = v; puzzle = null; draw(); answerBox(); } }));
    const syncSteppers = () => SH.forEach((k, i) => { steps[i].set(vals[k], true); if (hiddenFor(k)) steps[i].el.querySelector('output').textContent = '?'; });
    P.toggle({ label: 'Show the values', value: showVals, onChange: v => { showVals = v; draw(); } });
    P.toggle({ label: 'Show the working', value: showWork, onChange: v => { showWork = v; draw(); } });
    P.section('Write it as');
    P.seg({ options: [[false, 'Shapes'], [true, 'Letters']], value: letters, onChange: v => { letters = v; draw(); answerBox(); } });
    P.section('Puzzles');
    P.button('Random puzzle', randomPuzzle, 'primary');
    P.button('Show the answer', () => { if (puzzle) { puzzle.shown = true; syncSteppers(); draw(); answerBox(); } else c.toast('Start a random puzzle first'); });
    P.section();
    P.button('Clear the scales', () => { items = []; puzzle = null; draw(); answerBox(); });
    draw();
  }
});

tool({
  id: 'rekenrek', name: 'Rekenrek', strand: 'number', years: [0, 1, 2], w: 1100, h: 620,
  desc: 'A counting frame with rows of ten beads in fives, for numbers to 20, number bonds and finding the hidden part. Also a 100 bead version.',
  tags: 'rekenrek arithmetic rack counting frame beads fives tens doubles near doubles bonds hidden part subitise',
  icon: '<rect x="4" y="8" width="40" height="32" rx="3"/><path d="M4 19h40M4 31h40"/><circle cx="10" cy="19" r="3.4" fill="currentColor"/><circle cx="17" cy="19" r="3.4" fill="currentColor"/><circle cx="24" cy="19" r="3.4" fill="currentColor"/><circle cx="10" cy="31" r="3.4" fill="currentColor"/><circle cx="17" cy="31" r="3.4" fill="currentColor"/>',
  guide: ['The beads start on the left. The number is how many beads are on the left. Tap a bead on the left to send it, and the beads after it, to the right. Tap a bead on the right to bring it, and the beads before it, back.', 'You can also slide beads with your finger.', 'Hide the left side or the right side. Each row gets its own cover, so only that row’s beads are hidden. The class looks at the beads they can see and works out how many are hidden. Tap a cover to lift it.', 'Random makes a new number on each row and puts the covers back.'],
  mount(c) {
    const { svg, P } = c;
    let rows = 2, L = Array(10).fill(10), showRow = true, showTotal = true, showSum = true, hide = 'none', open = Array(10).fill(false);
    c.persist(() => ({ rows, L, showRow, showTotal, showSum, hide, open }), s => ({ rows, L, showRow, showTotal, showSum, hide, open } = Object.assign({ rows, L, showRow, showTotal, showSum, hide, open }, s)));
    const fg = S('g', {}, svg), bg = S('g', {}, svg), cg = S('g', {}, svg), lg = S('g', {}, svg);
    let beads = [], pos = [], target = [];
    const X0 = 120, X1 = 940;
    const geo = () => rows === 10 ? { r: 19, ys: range(0, 9).map(i => 160 + i * 41) } : rows === 2 ? { r: 32, ys: [250, 380] } : { r: 36, ys: [320] };
    const total = () => L.slice(0, rows).reduce((a, b) => a + b, 0);
    const covered = () => hide !== 'none' && range(0, rows - 1).some(k => !open[k]);
    function layout() {
      const { r } = geo(), d = 2 * r + 2;
      target = [];
      for (let k = 0; k < rows; k++) { target[k] = []; for (let i = 0; i < 10; i++) target[k][i] = i < L[k] ? X0 + r + 4 + i * d : X1 - r - 4 - (9 - i) * d; }
    }
    function build() {
      clear(fg); clear(bg); beads = [];
      const { r, ys } = geo(), d = 2 * r + 2, top = ys[0] - r - 26, bot = ys[ys.length - 1] + r + 26;
      layout();
      S('rect', { x: X0 - 34, y: top - 10, width: X1 - X0 + 68, height: bot - top + 20, rx: 22, fill: 'var(--board-2)', stroke: 'var(--line-2)', 'stroke-width': 2 }, fg);
      ys.forEach(y => S('line', { x1: X0 - 10, y1: y, x2: X1 + 10, y2: y, stroke: 'var(--ink-3)', 'stroke-width': 4, 'stroke-linecap': 'round' }, fg));
      [X0 - 24, X1 + 6].forEach(x => S('rect', { x, y: top - 22, width: 18, height: bot - top + 44, rx: 8, fill: '#B9773F', stroke: 'var(--ink)', 'stroke-width': 2.5 }, fg));
      S('rect', { x: X0 - 50, y: bot + 18, width: X1 - X0 + 100, height: 16, rx: 8, fill: '#B9773F', stroke: 'var(--ink)', 'stroke-width': 2.5 }, fg);
      for (let k = 0; k < rows; k++) {
        beads[k] = [];
        for (let i = 0; i < 10; i++) {
          const b = bead(bg, 0, ys[k], r, i < 5 ? 'var(--bead-a)' : 'var(--bead-b)', { cls: 'grab' }, r * 1.08);
          let sx, moved;
          c.drag(b, {
            start: p => { sx = p.x; moved = false; },
            move: p => { const dx = p.x - sx; if (Math.abs(dx) > 6) moved = true; if (dx > d * .5 && i < L[k]) { L[k] = i; update(); } else if (dx < -d * .5 && i >= L[k]) { L[k] = i + 1; update(); } },
            end: () => { if (!moved) { L[k] = i >= L[k] ? i + 1 : i; update(); } }
          });
          beads[k].push(b);
        }
      }
      if (pos.length !== rows || !pos[0]) pos = target.map(r2 => r2.slice());
      update();
    }
    function update() {
      layout(); clear(lg); clear(cg);
      const { r, ys } = geo(), d = 2 * r + 2, hidden = covered();
      // covers: one per row, so a cover never hides beads on another row
      if (hide !== 'none') ys.forEach((y, k) => {
        if (open[k]) return;
        let x1, x2;
        if (hide === 'left') { x1 = X0 - 12; x2 = L[k] < 10 ? target[k][L[k]] - r - 6 : X1 + 12; }
        else { x1 = L[k] > 0 ? target[k][L[k] - 1] + r + 6 : X0 - 12; x2 = X1 + 12; }
        const cv = S('g', { cls: 'hit' }, cg), h = rows === 10 ? 2 * r + 1 : 2 * r + 14;
        S('rect', { x: x1, y: y - h / 2, width: Math.max(10, x2 - x1), height: h, rx: 14, fill: 'var(--purple)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, cv);
        for (let x = x1 + 22; x < x2 - 10; x += 26) S('line', { x1: x, y1: y - h / 2 + 6, x2: x, y2: y + h / 2 - 6, stroke: '#fff', 'stroke-opacity': .14, 'stroke-width': 8 }, cv);
        if (x2 - x1 > 90) text(cv, (x1 + x2) / 2, y + 1, '?', { 'font-size': rows === 10 ? 22 : 36, 'font-weight': 800, fill: '#fff', cls: 'disp' });
        cv.addEventListener('click', () => { open[k] = true; update(); });
      });
      if (hidden) {
        text(lg, 550, rows === 10 ? 48 : 140, `There are 10 beads in each row. How many are hidden${rows > 1 ? ' on each row' : ''}?`, { 'font-size': 26, 'font-weight': 800, cls: 'disp', fill: 'var(--purple)' });
        text(lg, 550, rows === 10 ? 78 : 176, 'Tap a cover to check', { 'font-size': 16, fill: 'var(--ink-3)' });
        return;
      }
      if (showRow) ys.forEach((y, k) => { S('rect', { x: X1 + 50, y: y - 24, width: 64, height: 48, rx: 12, fill: 'var(--board)', stroke: 'var(--line-2)' }, lg); text(lg, X1 + 82, y + 1, String(L[k]), { 'font-size': rows === 10 ? 24 : 32, 'font-weight': 800, cls: 'disp num', fill: L[k] ? 'var(--ink)' : 'var(--ink-3)' }); });
      if (showTotal) { const t = total(); text(lg, 60, 42, String(t), { 'font-size': 56, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)', 'text-anchor': 'start' }); text(lg, 62, 80, t === 1 ? 'bead' : 'beads', { 'font-size': 17, fill: 'var(--ink-3)', 'text-anchor': 'start' }); }
      if (showSum && rows === 2) {
        const [a, b] = L, y = 520;
        text(lg, 550, y, `${a}  +  ${b}  =  ${a + b}`, { 'font-size': 44, 'font-weight': 800, cls: 'disp num' });
        if (a && a === b) text(lg, 550, y + 46, `Double ${a} is ${2 * a}`, { 'font-size': 20, fill: 'var(--green)', 'font-weight': 700 });
        else if (a && b && Math.abs(a - b) === 1) text(lg, 550, y + 46, `Near double: double ${Math.min(a, b)} and 1 more`, { 'font-size': 20, fill: 'var(--green)', 'font-weight': 700 });
        else if (a + b === 10) text(lg, 550, y + 46, 'A number bond to 10', { 'font-size': 20, fill: 'var(--green)', 'font-weight': 700 });
      }
      if (showSum && rows === 1 && hide !== 'none') text(lg, 550, 460, `${L[0]} + ${10 - L[0]} = 10`, { 'font-size': 40, 'font-weight': 800, cls: 'disp num' });
    }
    c.raf(() => { const R = Math.min(rows, beads.length); for (let k = 0; k < R; k++) for (let i = 0; i < 10; i++) { if (!pos[k]) continue; const dx = target[k][i] - pos[k][i]; if (Math.abs(dx) > .2) pos[k][i] += dx * .22; else pos[k][i] = target[k][i]; beads[k][i].setAttribute('transform', `translate(${pos[k][i]},0)`); } });
    const recover = () => { open = Array(10).fill(false); };
    P.section('Rekenrek');
    P.seg({ label: 'Rows of ten', options: [[1, '1 row'], [2, '2 rows'], [10, '10 rows (100)']], value: rows, onChange: v => { rows = v; L = L.map((x, i) => i < v ? x : 10); pos = []; recover(); build(); } });
    P.section('Beads');
    P.button('Random', () => { for (let k = 0; k < rows; k++) L[k] = rnd(0, 10); if (rows <= 2 && L.slice(0, rows).every(x => x === 10 || x === 0)) L[0] = rnd(1, 9); recover(); update(); if (hide !== 'none') pos = target.map(r2 => r2.slice()); }, 'primary');
    P.buttons([['All to the left', () => { L = L.map((x, i) => i < rows ? 10 : x); recover(); update(); }], ['All to the right', () => { L = L.map((x, i) => i < rows ? 0 : x); recover(); update(); }]]);
    P.section('Hide one side');
    P.seg({ options: [['none', 'Nothing hidden'], ['left', 'Hide the left'], ['right', 'Hide the right']], value: hide, onChange: v => { hide = v; recover(); update(); } });
    P.button('Cover again', () => { recover(); update(); });
    P.section('Show');
    P.toggle({ label: 'Total', value: showTotal, onChange: v => { showTotal = v; update(); } });
    P.toggle({ label: 'Count for each row', value: showRow, onChange: v => { showRow = v; update(); } });
    P.toggle({ label: 'Number sentence', value: showSum, onChange: v => { showSum = v; update(); } });
    build();
  }
});

tool({
  id: 'pv-counters', name: 'Place value counters', strand: 'number', years: [2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Counters worth 1, 10, 100 and more on a place value chart. Exchange ten for one, break one into ten, add and take away.',
  tags: 'place value counters exchange regroup partition column addition subtraction decimals tenths',
  icon: '<rect x="4" y="6" width="40" height="36" rx="3"/><path d="M17 6v36M30 6v36"/><circle cx="10.5" cy="18" r="4" fill="currentColor"/><circle cx="23.5" cy="18" r="4" fill="currentColor"/><circle cx="23.5" cy="28" r="4" fill="currentColor"/><circle cx="37" cy="18" r="4" fill="currentColor"/>',
  guide: ['Tap + or − on a column heading to add or take away a counter. Or type a number and tap Make.', 'Drag a counter one column to the left to exchange ten of them for one counter worth ten times as much. You need ten in the column first.', 'Drag a counter one column to the right to break it into ten counters worth a tenth as much.', 'Tap a counter to cross it out, then tap Take away the crossed out counters. Drag a counter off the chart to remove it.', 'Add a number puts in a second set of counters as outlines, so you can see two numbers being combined before you exchange.'],
  mount(c) {
    const { svg, P } = c;
    const SETS = { HTO: [2, 1, 0], Th: [3, 2, 1, 0], TTh: [4, 3, 2, 1, 0], HTh: [5, 4, 3, 2, 1, 0], d2: [1, 0, -1, -2], d3: [2, 1, 0, -1, -2, -3] };
    let set = 'Th', items = [], uid = 0, showDigits = true, showTotal = true;
    c.persist(() => ({ set, items, uid, showDigits, showTotal }), s => ({ set, items, uid, showDigits, showTotal } = Object.assign({ set, items, uid, showDigits, showTotal }, s)));
    const CX = 30, CY = 20, CW = 940, CH = 500;
    const chartG = S('g', {}, svg), ug = S('g', {}, svg);
    let busy = false;
    const places = () => SETS[set];
    const ofP = p => items.filter(i => i.p === p);
    const value = () => items.reduce((s, i) => s + (i.p >= 0 ? 10 ** i.p : 1 / 10 ** -i.p), 0);
    const fmtV = v => big(+v.toFixed(3));
    const cols = () => { const o = {}; places().forEach(p => o[p] = ofP(p)); return o; };
    const cc = CounterChart(c, chartG, {
      x: CX, y: CY, w: CW, h: CH, places: places(),
      decor(g, { W, X }) {
        places().forEach(p => {
          const x = X(p);
          [['−', x + 22, () => { const l = ofP(p); const it = l.find(i => i.mark) || l[l.length - 1]; if (it) { items.splice(items.indexOf(it), 1); render(); } }], ['+', x + W - 22, () => { if (ofP(p).length >= 40) return c.toast('That column is full'); items.push({ id: ++uid, p }); render(); }]].forEach(([t, bx, fn]) => {
            const b = S('g', { cls: 'hit' }, g); S('circle', { cx: bx, cy: CY + 22, r: 15, fill: 'var(--board)', stroke: col(PVC(p)), 'stroke-width': 2.5 }, b); text(b, bx, CY + 23, t, { 'font-size': 22, 'font-weight': 800, fill: col(PVC(p)) }); b.addEventListener('click', fn);
          });
        });
      },
      bind(el, it0) {
        const id = it0.id; let sx, sy, moved, base;
        c.drag(el, {
          start: p => { if (busy) return false; sx = p.x; sy = p.y; moved = false; base = cc.pos(id); el.style.transition = 'none'; },
          move: p => { if (Math.hypot(p.x - sx, p.y - sy) > 5) moved = true; if (moved) el.style.transform = `translate(${base[0] + p.x - sx}px,${base[1] + p.y - sy}px) scale(1.12)`; },
          end: p => {
            el.style.transition = 'transform .5s cubic-bezier(.3,.8,.3,1),opacity .4s';
            const it = items.find(i => i.id === id); if (!it) return;
            if (!moved) { it.mark = !it.mark; render(); return; }
            const x = base[0] + p.x - sx, y = base[1] + p.y - sy, q = cc.colAt(x);
            if (q == null || y < CY || y > CY + CH) { items.splice(items.indexOf(it), 1); render(); return; }
            const pl = places(), dIdx = pl.indexOf(q) - pl.indexOf(it.p);
            if (dIdx === 0) return render();
            if (dIdx === 1) return breakUp(it);
            if (dIdx === -1) return exchangeUp(it.p, it);
            c.toast('Move counters one column at a time'); render();
          }
        });
      }
    });
    function render(opt) {
      cc.set(cols(), opt); clear(ug);
      const { W, X } = cc.geo;
      places().forEach(p => {
        const n = ofP(p).length, x = X(p);
        if (n >= 10 && p < places()[0]) {
          const b = S('g', { cls: 'hit' }, ug), bw = Math.min(W - 16, 150);
          S('rect', { x: x + W / 2 - bw / 2, y: CY + CH - 44, width: bw, height: 34, rx: 17, fill: col(PVC(p + 1)), stroke: 'var(--ink)', 'stroke-width': 2 }, b);
          text(b, x + W / 2, CY + CH - 27, W > 150 ? `Exchange 10 → 1 ${PV_NAMES[p + 1]}` : `10 → ${pvVal(p + 1)}`, { 'font-size': 14, 'font-weight': 800, fill: '#fff' });
          b.addEventListener('click', () => exchangeUp(p));
        }
        if (showDigits) {
          S('rect', { x: x + 6, y: CY + CH + 10, width: W - 12, height: 60, rx: 12, fill: n >= 10 ? 'var(--red-s)' : 'var(--board-2)', stroke: n >= 10 ? 'var(--red)' : 'var(--line)', 'stroke-width': n >= 10 ? 3 : 1.5 }, ug);
          text(ug, x + W / 2, CY + CH + 41, String(n), { 'font-size': 38, 'font-weight': 800, cls: 'disp num', fill: n >= 10 ? 'var(--red)' : n ? 'var(--ink)' : 'var(--ink-3)' });
        }
      });
      // bin
      S('rect', { x: 990, y: CY + CH + 10, width: 80, height: 60, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, ug);
      S('path', { d: `M1013 ${CY + CH + 25} h34 M1023 ${CY + CH + 25} v-5 h14 v5 M1016 ${CY + CH + 29} l3 30 h22 l3 -30`, stroke: 'var(--ink-2)', 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, ug);
      if (showTotal) { const v = value(); text(ug, 500, 640, items.length ? fmtV(v) : 'Tap + on a column, or make a number', { 'font-size': items.length ? 42 : 22, 'font-weight': 800, cls: 'disp num', fill: items.length ? 'var(--accent)' : 'var(--ink-3)' }); }
      if (items.some(i => i.mark)) text(ug, 1030, 640, `${items.filter(i => i.mark).length} crossed out`, { 'font-size': 14, fill: 'var(--ink-3)' });
    }
    function exchangeUp(p, it) {
      const l = ofP(p); if (p >= places()[0]) return c.toast('There is no bigger column on this chart');
      if (l.length < 10) { render(); return c.toast(`You need ten ${pvVal(p)} counters to exchange for one ${pvVal(p + 1)}`); }
      const take = it ? [it, ...l.filter(i => i !== it).slice(-9)] : l.slice(-10), nu = { id: ++uid, p: p + 1 }, fly = {};
      take.forEach(t => { fly[t.id] = nu.id; items.splice(items.indexOf(t), 1); });
      items.push(nu); render({ fly });
    }
    function breakUp(it) {
      if (it.p <= places()[places().length - 1]) return c.toast('There is no smaller column on this chart');
      if (ofP(it.p - 1).length > 30) { render(); return c.toast('That column is too full to break another counter into it'); }
      const spawn = {}; items.splice(items.indexOf(it), 1);
      for (let k = 0; k < 10; k++) { const nu = { id: ++uid, p: it.p - 1, kind: it.kind }; spawn[nu.id] = it.id; items.push(nu); }
      render({ spawn });
    }
    function parse(s) { const n = parseFloat(String(s).replace(/,/g, '')); if (isNaN(n) || n < 0) return null; return n; }
    function addNumber(n, kind) {
      const pl = places(), lo = pl[pl.length - 1];
      if (n >= 10 ** (pl[0] + 1)) return c.toast(`That number is too big for this chart. Choose more columns`), false;
      if (Math.abs(Math.round(n * 10 ** -lo) - n * 10 ** -lo) > 1e-6) return c.toast('That number needs more decimal columns'), false;
      const k = Math.round(n * 10 ** -lo);
      pl.forEach(p => { const d = Math.floor(k / 10 ** (p - lo)) % 10; for (let j = 0; j < d; j++) items.push({ id: ++uid, p, kind }); });
      return true;
    }
    P.section('Chart');
    P.seg({ label: 'Columns', options: [['HTO', 'H T O'], ['Th', 'Th H T O'], ['TTh', 'TTh to O'], ['HTh', 'HTh to O'], ['d2', 'T O . t h'], ['d3', 'H T O . t h th']], value: set, onChange: v => { const keep = items.filter(i => SETS[v].includes(i.p)); if (keep.length < items.length) c.toast('Counters that do not fit the new chart were removed'); set = v; items = keep; cc.config(SETS[v]); render({ instant: true }); } });
    P.section('Make a number');
    const mf = P.field({ label: 'Number', value: '', placeholder: 'e.g. 2,435', live: false, onChange: () => { } });
    P.buttons([['Make', () => { const n = parse(mf.get()); if (n == null) return c.toast('Type a number first'); const old = items; items = []; if (!addNumber(n, 'a')) items = old; render(); }, 'primary'], ['Random', () => { const pl = places(), lo = pl[pl.length - 1]; const k = rnd(10 ** (pl.length - 2), 10 ** pl.length - 1); const n = k / 10 ** -lo; mf.set(big(n)); items = []; addNumber(n, 'a'); render(); }]]);
    const af = P.field({ label: 'Add a number (shown as outlines)', value: '', placeholder: 'e.g. 1,287', live: false, onChange: () => { } });
    P.button('Add these counters', () => { const n = parse(af.get()); if (n == null) return c.toast('Type a number to add'); if (addNumber(n, 'b')) render(); });
    P.section('Exchange and take away');
    P.button('Exchange every full ten', () => {
      if (busy) return; busy = true;
      const step = () => { const p = [...places()].reverse().find(q => q < places()[0] && ofP(q).length >= 10); if (p == null) { busy = false; return; } exchangeUp(p); setTimeout(step, 750); };
      step();
    }, 'primary');
    P.button('Take away the crossed out counters', () => { const n = items.filter(i => i.mark).length; if (!n) return c.toast('Tap counters to cross them out first'); items = items.filter(i => !i.mark); render(); });
    P.button('Clear the chart', () => { items = []; render(); });
    P.section('Show');
    P.toggle({ label: 'How many in each column', value: showDigits, onChange: v => { showDigits = v; render(); } });
    P.toggle({ label: 'Total value', value: showTotal, onChange: v => { showTotal = v; render(); } });
    render({ instant: true });
  }
});

tool({
  id: 'pv-calc', name: 'Place value adding and subtracting', strand: 'addsub', years: [2, 3, 4, 5, 6], w: 1100, h: 700,
  desc: 'Place value counters for adding and subtracting, step by step: counters join and exchange into the total row, or are exchanged and taken away.',
  tags: 'place value counters addition subtraction exchange regroup carry borrow column step by step animation',
  icon: '<rect x="4" y="6" width="40" height="36" rx="3"/><path d="M4 18h40M4 30h40M17 6v36M30 6v36"/><circle cx="10.5" cy="12" r="3" fill="currentColor"/><circle cx="23.5" cy="24" r="3" fill="currentColor"/><circle cx="37" cy="36" r="3" fill="currentColor"/>',
  guide: ['Choose Adding or Subtracting, then type two numbers or tap a Random size.', 'Adding: the first and second numbers are made with counters in two rows. Tap Next step and each column’s counters slide down into the total row. Ten counters join to make one counter in the next column.', 'Subtracting: the first number is made with counters and the number to take away shows as dotted circles. When there are not enough, one counter is exchanged for ten. Then the counters are taken away and what is left moves down.', 'The digit for each row is shown under its counters. Play runs every step for you.'],
  mount(c) {
    const { svg, P } = c;
    let op = 'add', aS = '', bS = '', step = 0, digitsOn = true, exch = true;
    c.persist(() => ({ op, aS, bS, step, digitsOn, exch }), s => ({ op, aS, bS, step, digitsOn, exch } = Object.assign({ op, aS, bS, step, digitsOn, exch }, s)));
    const chartG = S('g', {}, svg), mg = S('g', {}, svg);
    let res = null, rc = null, rcKey = '', playT = null;
    const parse = s => { const t = String(s).replace(/[, ]/g, ''); return /^\d*\.?\d+$/.test(t) ? t : null; };
    function build() {
      res = null; const A = parse(aS), B = parse(bS); if (A == null || B == null) return;
      if (pvDecs(A) > 2 || pvDecs(B) > 2) return c.toast('Use up to two decimal places');
      if (Math.max(+A, +B) >= 1e6) return c.toast('Use numbers under 1,000,000');
      if (op === 'sub' && +B > +A) { aS = B; bS = A; fA.set(aS); fB.set(bS); c.toast('The bigger number goes first, so the numbers were swapped'); return build(); }
      res = op === 'add' ? pvAddSteps(parse(aS), parse(bS)) : pvSubSteps(parse(aS), parse(bS));
    }
    function wrapText(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function draw(animate) {
      clear(mg);
      if (!res) { clear(chartG); rc = null; rcKey = ''; text(mg, 550, 330, 'Type two numbers, or tap a Random size', { 'font-size': 26, fill: 'var(--ink-3)', 'font-weight': 700 }); return; }
      step = clamp(step, 0, res.frames.length - 1);
      const f = res.frames[step], key = op + res.places.join(',') + digitsOn;
      const rows = op === 'add' ? [{ key: 'A', label: 'First number', sub: big(+aS) }, { key: 'B', label: 'Second number', sub: big(+bS), sign: '+' }, { key: 'T', label: 'Total', total: true }] : [{ key: 'A', label: 'Start with', sub: big(+aS) }, { key: 'B', label: 'Take away', sub: big(+bS), sign: '−' }, { key: 'T', label: 'What is left', total: true }];
      const lines = wrapText(f.msg, f.opt.end ? 60 : 92), bh = 26 + lines.length * 27, by = 690 - bh;
      if (rcKey !== key) { clear(chartG); rc = RowChart(c, chartG, { x: 20, y: 14, w: 1060, h: Math.min(560, by - 28), places: res.places, rows, labelW: 140, digits: digitsOn }); rcKey = key; animate = false; }
      rc.set(f.state, Object.assign({}, animate ? f.opt : { instant: true }, { hl: f.opt.end ? null : f.opt.hl, hot: f.opt.hot }));
      S('rect', { x: 20, y: by, width: 1060, height: bh, rx: 16, fill: f.opt.end ? 'var(--green-s)' : 'var(--board-2)', stroke: f.opt.end ? 'var(--green)' : 'var(--line-2)', 'stroke-width': 2 }, mg);
      lines.forEach((l, i) => text(mg, 550, by + 26 + i * 27, l, { 'font-size': f.opt.end ? 28 : 19, 'font-weight': f.opt.end ? 800 : 600, cls: f.opt.end ? 'disp num' : 'num' }));
      text(mg, 1072, by - 10, `Step ${step + 1} of ${res.frames.length}`, { 'font-size': 13, fill: 'var(--ink-3)', 'text-anchor': 'end' });
    }
    function go(d) { if (!res) return; const ns = clamp(step + d, 0, res.frames.length - 1); if (ns === step) return false; step = ns; draw(d === 1); return true; }
    function stopPlay() { clearInterval(playT); playT = null; }
    function rebuild() { stopPlay(); build(); step = 0; rcKey = ''; draw(false); }
    function randomize(size) {
      const R = n => rnd(10 ** (n - 1), 10 ** n - 1);
      const needEx = (x, y) => { if (!exch) return true; const dp = Math.max(pvDecs(String(x)), pvDecs(String(y))); const X1 = Math.round(x * 10 ** dp), Y1 = Math.round(y * 10 ** dp); for (let k = 0; k < 7; k++) { const d1 = Math.floor(X1 / 10 ** k) % 10, d2 = Math.floor(Y1 / 10 ** k) % 10; if (op === 'add' ? d1 + d2 >= 10 : d1 < d2) return true; } return false; };
      let a, b, t = 0;
      do { if (size === 'dec') { a = +(R(3) / 100).toFixed(2); b = +(R(rnd(2, 3)) / 100).toFixed(2); } else { a = R(size); b = R(rnd(Math.max(1, size - 1), size)); } if (op === 'sub' && b > a) [a, b] = [b, a]; } while (!needEx(a, b) && t++ < 80);
      aS = String(a); bS = String(b); fA.set(aS); fB.set(bS); rebuild();
    }
    P.section('Calculation');
    P.seg({ options: [['add', 'Adding'], ['sub', 'Subtracting']], value: op, onChange: v => { op = v; randomize(3); } });
    const fA = P.field({ label: 'First number', value: aS, live: false, onChange: v => { aS = v.trim(); rebuild(); } });
    const fB = P.field({ label: 'Second number', value: bS, live: false, onChange: v => { bS = v.trim(); rebuild(); } });
    P.seg({ label: 'Random', options: [[2, '2 digits'], [3, '3 digits'], [4, '4 digits'], ['dec', 'Decimals']], value: null, retrigger: true, onChange: randomize });
    P.toggle({ label: 'Random numbers need exchanging', value: exch, onChange: v => exch = v });
    P.section('Steps');
    P.buttons([['◀  Back', () => { stopPlay(); go(-1); }], ['Next step  ▶', () => { stopPlay(); go(1); }, 'primary']]);
    c.pulseWhen(c.btn('Next step  ▶'), () => res && step < res.frames.length - 1);
    P.buttons([['Start again', () => { stopPlay(); step = 0; draw(false); }], ['Play', () => { stopPlay(); if (res && step >= res.frames.length - 1) { step = 0; draw(false); } playT = setInterval(() => { if (!go(1)) stopPlay(); }, 1900); }]]);
    c.onClean(stopPlay);
    P.section('Show');
    P.toggle({ label: 'Digits under the counters', value: digitsOn, onChange: v => { digitsOn = v; rcKey = ''; draw(false); } });
    const key = e => { if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return; if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } };
    window.addEventListener('keydown', key); c.onClean(() => window.removeEventListener('keydown', key));
    if (aS && bS) { build(); draw(false); } else randomize(3);
  }
});

tool({
  id: 'number-shapes', name: 'Number shapes', strand: 'number', years: [0, 1, 2, 3], w: 1100, h: 720,
  desc: 'Coloured number plates from 1 to 10 with holes in pairs. Drag them onto the board to compare, combine, make ten and spot odd and even.',
  tags: 'number shapes plates pieces pegboard odd even pairs bonds make ten compare structured numbers',
  icon: '<rect x="6" y="20" width="14" height="22" rx="3"/><path d="M28 14h7v7h7v21H28z" stroke-linejoin="round"/><circle cx="13" cy="26" r="2"/><circle cx="13" cy="35" r="2"/><circle cx="31.5" cy="18" r="2"/><circle cx="31.5" cy="26" r="2"/><circle cx="38.5" cy="26" r="2"/><circle cx="31.5" cy="35" r="2"/><circle cx="38.5" cy="35" r="2"/>',
  guide: ['Drag a shape from the tray onto the board. Drag it again to move it.', 'Tap a shape to choose it. Buttons appear above it to turn it, flip it, copy it or remove it. You can also drag it to the bin.', 'Fit shapes together to make bigger numbers, find pairs that make ten, or see why odd numbers have one hole left over.', 'Mystery shape puts down a grey shape. The class works out its number from the holes, then tap it to show the colour.'],
  mount(c) {
    const { svg, P } = c;
    const U = 36, COL = ['', '#F28C28', '#3B82C4', '#4CAF50', '#F06FA4', '#F5C518', '#8E5BB5', '#F4F1EA', '#D9434F', '#7A8B3A', '#7FC8E8'];
    let pieces = [], uid = 0, labels = true, pegs = true, total = true, sel = null;
    c.persist(() => ({ pieces, uid, labels, pegs, total }), s => ({ pieces, uid, labels, pegs, total } = Object.assign({ pieces, uid, labels, pegs, total }, s)));
    const bgG = S('g', {}, svg), pg = S('g', {}, svg), uiG = S('g', {}, svg), dragG = S('g', {}, svg);
    const TRAY = 586, bin = { x: 1004, y: 8, w: 80, h: 90 };
    const inBin = p => p.x > bin.x - 20 && p.y < bin.y + bin.h + 20;
    const dims = n => [n === 1 ? U : 2 * U, Math.ceil(n / 2) * U];
    function poly(n) {
      const r = Math.floor(n / 2), w = 2 * U;
      if (n === 1) return `M0 0H${U}V${U}H0Z`;
      if (n % 2 === 0) return `M0 0H${w}V${r * U}H0Z`;
      return `M0 0H${U}V${U}H${w}V${(r + 1) * U}H0Z`;
    }
    function holes(n) { const out = [], r = Math.floor(n / 2), odd = n % 2; if (n === 1) return [[U / 2, U / 2]]; if (odd) out.push([U / 2, U / 2]); for (let i = 0; i < r; i++) { out.push([U / 2, (i + odd) * U + U / 2], [1.5 * U, (i + odd) * U + U / 2]); } return out; }
    // draw a shape centred at 0,0 in its own group
    function shape(g, n, o = {}) {
      const [w, h] = dims(n), t = S('g', { transform: `rotate(${(o.rot || 0) * 90}) scale(${o.flip ? -1 : 1},1) translate(${-w / 2},${-h / 2})` }, g);
      const d = poly(n), fill = o.mystery ? '#B8BCC6' : COL[n];
      S('path', { d, fill: 'none', stroke: o.sel ? 'var(--accent)' : '#2B2F36', 'stroke-width': o.sel ? 14 : 10, 'stroke-linejoin': 'round' }, t);
      S('path', { d, fill, stroke: fill, 'stroke-width': 6, 'stroke-linejoin': 'round' }, t);
      S('path', { d, fill: 'none', stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 2, transform: 'translate(1.5,1.5)' }, t);
      holes(n).forEach(([x, y]) => { S('circle', { cx: x, cy: y, r: U * .27, fill: 'var(--board)', stroke: '#2B2F36', 'stroke-opacity': .55, 'stroke-width': 1.5 }, t); S('path', { d: `M${x - U * .2} ${y - U * .12}a${U * .27} ${U * .27} 0 0 1 ${U * .4} 0`, fill: 'none', stroke: '#000', 'stroke-opacity': .18, 'stroke-width': 3 }, t); });
      if (o.label && !o.mystery) { const bw = (o.rot || 0) % 2 ? h : w, dark = n === 7 || n === 5 || n === 10; S('circle', { cx: bw / 2 + 19, cy: 0, r: 15, fill: COL[n], stroke: '#2B2F36', 'stroke-width': 2, 'pointer-events': 'none' }, g); text(g, bw / 2 + 19, 1, String(n), { 'font-size': n === 10 ? 14 : 17, 'font-weight': 800, cls: 'disp num', fill: dark ? '#2B2F36' : '#fff', 'pointer-events': 'none' }); }
      return t;
    }
    function bbox(p) { const [w, h] = dims(p.n); return p.rot % 2 ? [h, w] : [w, h]; }
    function snap(p) { if (!pegs) return; const [w, h] = bbox(p); p.x = Math.round((p.x - w / 2) / U) * U + w / 2; p.y = Math.round((p.y - h / 2 - 50) / U) * U + h / 2 + 50; }
    function keepIn(p) { const [w, h] = bbox(p); p.x = clamp(p.x, w / 2 + 8, 1092 - w / 2); p.y = clamp(p.y, h / 2 + 50, TRAY - h / 2 - 6); }
    function drawBg() {
      clear(bgG);
      if (pegs) for (let y = 50 + U / 2; y < TRAY - 10; y += U) for (let x = U / 2; x < 1100; x += U) S('circle', { cx: x, cy: y, r: 2.6, fill: 'var(--line-2)' }, bgG);
      S('rect', { x: 0, y: TRAY, width: 1100, height: 134, fill: 'var(--board-2)', stroke: 'var(--line)' }, bgG);
      S('rect', { x: bin.x, y: bin.y, width: bin.w, height: bin.h, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, bgG);
      const bx = bin.x + 23, by = bin.y + 28;
      S('path', { d: `M${bx} ${by} h34 M${bx + 10} ${by} v-6 h14 v6 M${bx + 3} ${by + 5} l3 38 h22 l3 -38`, stroke: 'var(--ink-2)', 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, bgG);
      // tray
      for (let n = 1; n <= 10; n++) {
        const tx = 62 + (n - 1) * 108, tg = S('g', { cls: 'grab', transform: `translate(${tx},${TRAY + 54}) scale(.5)` }, bgG);
        S('rect', { x: -70, y: -100, width: 140, height: 200, fill: 'transparent' }, tg);
        shape(tg, n, { label: true });
        c.drag(tg, {
          start: () => { sel = null; },
          move: p => { clear(dragG); const gg = S('g', { transform: `translate(${p.x},${p.y})`, opacity: .85 }, dragG); shape(gg, n, { label: labels }); },
          end: p => { clear(dragG); if (p.y < TRAY - 10 && !inBin(p)) { const q = { id: ++uid, n, x: p.x, y: p.y, rot: 0, flip: false }; keepIn(q); snap(q); pieces.push(q); sel = q.id; } draw(); }
        });
      }
    }
    function act(x, y, label, glyph, fn) {
      const b = S('g', { cls: 'hit', transform: `translate(${x},${y})` }, uiG);
      S('circle', { r: 19, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, b);
      S('path', { d: glyph, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b);
      S('title', { text: label }, b);
      b.addEventListener('pointerdown', e => e.stopPropagation());
      b.addEventListener('click', e => { e.stopPropagation(); fn(); draw(); });
    }
    function draw() {
      clear(pg); clear(uiG);
      pieces.forEach(p => {
        const g = S('g', { cls: 'grab', transform: `translate(${p.x},${p.y})` }, pg);
        shape(g, p.n, { rot: p.rot, flip: p.flip, label: labels, mystery: p.mystery, sel: p.id === sel });
        let moved = false, ox = 0, oy = 0;
        c.drag(g, {
          start: q => { moved = false; ox = q.x - p.x; oy = q.y - p.y; pieces.splice(pieces.indexOf(p), 1); pieces.push(p); pg.appendChild(g); clear(uiG); },
          move: q => { if (Math.hypot(q.x - ox - p.x, q.y - oy - p.y) > 3) moved = true; p.x = q.x - ox; p.y = q.y - oy; g.setAttribute('transform', `translate(${p.x},${p.y})`); },
          end: q => { if (inBin(q)) { pieces.splice(pieces.indexOf(p), 1); sel = null; } else if (!moved) { if (p.mystery) { p.mystery = false; sel = p.id; } else sel = sel === p.id ? null : p.id; } else { keepIn(p); snap(p); sel = p.id; } draw(); }
        });
      });
      const s = pieces.find(p => p.id === sel);
      if (s) {
        const [, h] = bbox(s), y = Math.max(72, s.y - h / 2 - 34);
        act(s.x - 66, y, 'Turn', 'M-7 4a8 8 0 1 0 1-10M-8-10v5h5', () => { s.rot = (s.rot + 1) % 4; keepIn(s); snap(s); });
        act(s.x - 22, y, 'Flip', 'M0-10v20M-4-7l-7 7 7 7zM4-7l7 7-7 7z', () => { s.flip = !s.flip; });
        act(s.x + 22, y, 'Copy', 'M-8-4h10v12h-10zM-3-9h10v12', () => { const q = Object.assign({}, s, { id: ++uid, x: s.x + U, y: s.y + U }); keepIn(q); snap(q); pieces.push(q); sel = q.id; });
        act(s.x + 66, y, 'Remove', 'M-6-6l12 12M6-6l-6 6-6 6', () => { pieces = pieces.filter(p => p !== s); sel = null; });
      }
      if (total && pieces.length) {
        const vis = pieces.filter(p => !p.mystery), sum = vis.reduce((a, p) => a + p.n, 0), myst = pieces.length - vis.length;
        const sorted = vis.map(p => p.n);
        const t = sorted.length > 1 && sorted.length <= 8 ? `${sorted.join(' + ')}${myst ? ' + ?' : ''} = ${myst ? '?' : sum}` : `Total: ${myst ? '?' : sum}`;
        S('rect', { x: 16, y: 8, width: Math.max(170, t.length * 15 + 30), height: 38, rx: 19, fill: 'var(--board-2)', stroke: 'var(--line)' }, uiG);
        text(uiG, 31, 27, t, { 'font-size': 22, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'start' });
      } else if (!pieces.length) text(uiG, 520, 290, 'Drag a shape up from the tray', { 'font-size': 24, fill: 'var(--ink-3)', 'font-weight': 700 });
    }
    const bgHit = S('rect', { x: 0, y: 0, width: 1100, height: TRAY, fill: 'transparent' }, svg); svg.insertBefore(bgHit, bgG.nextSibling);
    bgHit.addEventListener('click', () => { if (sel) { sel = null; draw(); } });
    function place(list) { pieces = []; list.forEach(([n, x, y, rot = 0, extra]) => { const q = Object.assign({ id: ++uid, n, x, y, rot, flip: false }, extra || {}); keepIn(q); snap(q); pieces.push(q); }); sel = null; draw(); }
    P.section('Set out');
    P.button('Staircase 1 to 10', () => place(range(1, 10).map(n => [36 + (n - 1) * 3 * U, TRAY - 20 - Math.ceil(n / 2) * U / 2]).map(([x, y], i) => [i + 1, x, y])));
    P.button('Pairs that make 10', () => { const l = [], base = 12 * U + 50; [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]].forEach(([a, b], i) => { const x = 3 * U + i * 6 * U, ha = Math.ceil(a / 2) * U, hb = Math.ceil(b / 2) * U; l.push([b, x, base - hb / 2], [a, a === 1 ? x + U / 2 : x, base - 5 * U + ha / 2, a % 2 ? 2 : 0]); }); place(l); });
    P.button('Odd and even', () => { const l = []; [2, 4, 6, 8, 10].forEach((n, i) => l.push([n, 120 + i * 120, 70 + Math.ceil(n / 2) * U / 2])); [1, 3, 5, 7, 9].forEach((n, i) => l.push([n, 120 + i * 120, 330 + Math.ceil(n / 2) * U / 2])); place(l); });
    P.section('Puzzles');
    P.button('Mystery shape', () => { pieces.forEach(p => p.mystery = false); const n = rnd(1, 10), q = { id: ++uid, n, x: 540, y: 300, rot: 0, flip: false, mystery: true }; snap(q); pieces.push(q); sel = null; draw(); }, 'primary');
    P.button('Show all colours', () => { pieces.forEach(p => p.mystery = false); draw(); });
    P.section('Show');
    P.toggle({ label: 'Numbers on shapes', value: labels, onChange: v => { labels = v; draw(); } });
    P.toggle({ label: 'Pegboard and snap', value: pegs, onChange: v => { pegs = v; drawBg(); pieces.forEach(snap); draw(); } });
    P.toggle({ label: 'Running total', value: total, onChange: v => { total = v; draw(); } });
    P.button('Clear the board', () => { pieces = []; sel = null; draw(); });
    drawBg(); draw();
  }
});

