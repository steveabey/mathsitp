/* ===== Addition, subtraction, multiplication, division ===== */

tool({
  id: 'number-facts', name: 'Number facts', strand: 'addsub', years: [0, 1, 2], w: 1000, h: 600,
  desc: 'Number bonds to 20 on a bead bar or ten frames. Tap to change colour or take away.',
  tags: 'bonds fact family addition subtraction pairs ten frame',
  icon: '<path d="M4 20h40"/><circle cx="10" cy="20" r="4" fill="currentColor"/><circle cx="19" cy="20" r="4" fill="currentColor"/><circle cx="29" cy="20" r="4"/><circle cx="38" cy="20" r="4"/><path d="M14 32h20l-2 10H16z"/>',
  guide: ['Choose beads or ten frames. In Addition, tap a bead or square to switch its colour. The calculation shows the two parts and the whole.', 'Tap Fact family to step through all four related facts. It works in both modes.', 'In Subtraction, tap to take objects away into the bin. Tap the bin to see what was taken away.', 'Tap Next pair to step through every bond for the total.'],
  mount(c) {
    const { svg, P } = c;
    let N = 10, red = 10, mode = 'add', binned = 0, fam = 0, showSum = true, showBin = false, look = 'beads';
    const g = S('g', {}, svg);
    const click = i => { if (mode === 'add') red = i < red ? i : i + 1; else binned = N - i; fam = 0; draw(); };
    function draw() {
      clear(g);
      const kept = mode === 'sub' ? N - binned : N;
      if (look === 'beads') {
        const d = Math.min(72, 860 / N), r = d * .44, x0 = 500 - d * N / 2 + d / 2;
        S('line', { x1: x0 - d, y1: 230, x2: x0 + d * N - d / 2 + 20, y2: 230, stroke: 'var(--ink-3)', 'stroke-width': 4 }, g);
        for (let i = 0; i < kept; i++) { const b = bead(g, x0 + i * d, 230, r, mode === 'add' && i >= red ? 'var(--blue)' : 'var(--bead-a)', { cls: 'hit' }); b.addEventListener('click', () => click(i)); }
      } else {
        const s = 70, frames = Math.ceil(N / 10), fw = s * 5 + 30, x0 = 500 - (frames * fw - 30) / 2;
        for (let i = 0; i < frames * 10; i++) {
          const f = Math.floor(i / 10), k = i % 10, x = x0 + f * fw + (k % 5) * s, y = 160 + Math.floor(k / 5) * s;
          const cell = S('g', { cls: 'hit' }, g);
          S('rect', { x, y, width: s, height: s, fill: i < N ? 'var(--board)' : 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': i < N ? 2.5 : 1, opacity: i < N ? 1 : .4 }, cell);
          if (i < kept) S('circle', { cx: x + s / 2, cy: y + s / 2, r: s * .38, fill: mode === 'add' && i >= red ? 'var(--blue)' : 'var(--bead-a)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, cell);
          if (i < N) cell.addEventListener('click', () => click(i));
        }
      }
      const bin = S('g', { cls: 'hit' }, g);
      S('path', { d: 'M420 400 h160 l-16 130 h-128 z', fill: 'var(--board-2)', stroke: 'var(--ink-2)', 'stroke-width': 3 }, bin);
      S('rect', { x: 408, y: 386, width: 184, height: 16, rx: 6, fill: 'var(--ink-2)' }, bin);
      if (mode === 'sub') {
        if (showBin) for (let k = 0; k < binned; k++) bead(bin, 450 + (k % 5) * 25, 428 + Math.floor(k / 5) * 26, 11, 'var(--bead-a)');
        else if (binned) text(bin, 500, 465, '?', { 'font-size': 48, 'font-weight': 800, fill: 'var(--ink-3)' });
        bin.addEventListener('click', () => { showBin = !showBin; draw(); });
      } else bin.setAttribute('opacity', .2);
      if (showSum) {
        let s;
        if (mode === 'add') { const a = red, b = N - red; s = [`${a} + ${b} = ${N}`, `${b} + ${a} = ${N}`, `${N} − ${a} = ${b}`, `${N} − ${b} = ${a}`][fam]; }
        else { const k = binned, r = N - k, hide = !showBin && k; s = [`${N} − ${hide ? '?' : k} = ${r}`, `${N} − ${r} = ${hide ? '?' : k}`, `${r} + ${hide ? '?' : k} = ${N}`, `${hide ? '?' : k} + ${r} = ${N}`][fam]; }
        text(g, 500, 90, s, { 'font-size': 60, 'font-weight': 800, cls: 'disp num' });
        if (fam) text(g, 500, 132, `Fact family: ${fam + 1} of 4`, { 'font-size': 18, fill: 'var(--ink-3)' });
      }
    }
    const set = v => { N = v; red = Math.min(red, N); binned = Math.min(binned, N); fam = 0; nS.set(v, true); draw(); };
    P.section('Show as');
    P.seg({ options: [['beads', 'Bead bar'], ['frames', 'Ten frames']], value: look, onChange: v => { look = v; draw(); } });
    P.section('Total');
    const nS = P.stepper({ label: 'Total', value: N, min: 1, max: 20, onChange: v => { N = v; red = Math.min(red, N); binned = Math.min(binned, N); fam = 0; draw(); } });
    P.buttons([['5', () => set(5)], ['10', () => set(10)], ['20', () => set(20)]]);
    P.seg({ label: 'Mode', options: [['add', 'Addition'], ['sub', 'Subtraction']], value: mode, onChange: v => { mode = v; showBin = false; fam = 0; if (v === 'sub' && !binned) binned = Math.min(3, N); draw(); } });
    P.section('Facts');
    P.button('Fact family', () => { fam = (fam + 1) % 4; draw(); });
    P.button('Next pair', () => { if (mode === 'add') red = (red + 1) % (N + 1); else { binned = (binned + 1) % (N + 1); showBin = false; } fam = 0; draw(); }, 'primary');
    P.toggle({ label: 'Show calculation', value: showSum, onChange: v => { showSum = v; draw(); } });
    P.button('Reset', () => { red = N; binned = 0; showBin = false; fam = 0; draw(); });
    draw();
  }
});

tool({
  id: 'difference', name: 'Difference', strand: 'addsub', years: [1, 2, 3], w: 1000, h: 640,
  desc: 'Compare two sets of counters and see subtraction as finding the difference, in four clear steps.',
  tags: 'compare more fewer subtraction gap difference',
  icon: '<circle cx="8" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><circle cx="28" cy="16" r="4"/><circle cx="38" cy="16" r="4" fill="currentColor"/><circle cx="8" cy="32" r="4"/><circle cx="18" cy="32" r="4"/>',
  guide: ['The board starts with two sets of counters mixed up. Tap Next step to move through four steps: mix, line up, pair up, find the difference.', 'The step you are on is written at the top of the board.', 'At the last step the calculation appears. Tap Another way to write it to cycle through four ways of recording the same difference.', 'Tap New counters for a fresh, randomly mixed problem.'],
  mount(c) {
    const { svg, P } = c;
    let A = 0, B = 0, step = 0, ver = 0, showCalc = true, seeds = [];
    const g = S('g', {}, svg);
    const STEPS = ['Step 1 of 4: two sets of counters, all mixed up', 'Step 2 of 4: line each set up in a row', 'Step 3 of 4: match the counters in pairs', 'Step 4 of 4: the counters without a partner are the difference'];
    function scatter() { seeds = []; const pts = []; for (let i = 0; i < A + B; i++) { let p, t = 0; do { p = [90 + Math.random() * 820, 150 + Math.random() * 300]; t++; } while (t < 400 && pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 56)); pts.push(p); } seeds = shuffle(pts); }
    function draw() {
      clear(g);
      const n = Math.max(A, B, 1), d = Math.min(56, 860 / n), x0 = 500 - d * n / 2 + d / 2, sm = Math.min(A, B), big1 = Math.max(A, B), D = big1 - sm;
      text(g, 500, 42, STEPS[step], { 'font-size': 24, 'font-weight': 800, cls: 'disp' });
      for (let k = 0; k < 4; k++) S('circle', { cx: 440 + k * 40, cy: 78, r: 8, fill: k <= step ? 'var(--accent)' : 'var(--line)' }, g);
      const yA = 200, yB = 340;
      const row = (cnt, y, fill, k) => { for (let i = 0; i < cnt; i++) {
        const [sx, sy] = seeds[k === 'a' ? i : A + i] || [500, 300];
        const x = step === 0 ? sx : x0 + i * d, yy = step === 0 ? sy : y;
        const extra = step >= 3 && i >= sm && cnt === big1 && D > 0;
        const grp = S('g', { style: `transform:translate(${x}px,${yy}px);transition:transform .7s cubic-bezier(.3,.8,.3,1)` }, g);
        S('circle', { r: Math.min(24, d * .42), fill, stroke: extra ? 'var(--green)' : 'var(--ink)', 'stroke-width': extra ? 6 : 2 }, grp);
      } };
      if (step >= 2) for (let i = 0; i < sm; i++) S('line', { x1: x0 + i * d, y1: yA + 26, x2: x0 + i * d, y2: yB - 26, stroke: 'var(--ink-2)', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      row(A, yA, 'var(--yellow)', 'a'); row(B, yB, 'var(--board)', 'b');
      if (step >= 1) { text(g, 40, yA, String(A), { 'font-size': 34, 'font-weight': 800, cls: 'disp num', fill: 'var(--orange)' }); text(g, 40, yB, String(B), { 'font-size': 34, 'font-weight': 800, cls: 'disp num', fill: 'var(--ink-2)' }); }
      if (step >= 3 && D) { const xa = x0 + sm * d - d / 2, xb = x0 + (big1 - 1) * d + d / 2, y = A >= B ? yA - 50 : yB + 50; S('path', { d: A >= B ? `M${xa} ${y + 14} V${y} H${xb} V${y + 14}` : `M${xa} ${y - 14} V${y} H${xb} V${y - 14}`, fill: 'none', stroke: 'var(--green)', 'stroke-width': 4 }, g); text(g, (xa + xb) / 2, y + (A >= B ? -22 : 26), `difference ${D}`, { 'font-size': 26, 'font-weight': 800, cls: 'disp num', fill: 'var(--green)' }); }
      if (step >= 3 && !D) text(g, 500, 460, 'Every counter has a partner, so the difference is 0', { 'font-size': 24, 'font-weight': 700, fill: 'var(--green)' });
      if (showCalc && step >= 3) text(g, 500, 545, [`${big1} − ${sm} = ${D}`, `${sm} + ${D} = ${big1}`, `The difference between ${big1} and ${sm} is ${D}`, `${big1} − ${D} = ${sm}`][ver], { 'font-size': ver === 2 ? 36 : 54, 'font-weight': 800, cls: 'disp num' });
      if (showCalc && step >= 3) text(g, 500, 600, `Way ${ver + 1} of 4`, { 'font-size': 16, fill: 'var(--ink-3)' });
      stepNote.textContent = STEPS[step];
    }
    function fresh() { A = rnd(3, 20); B = rnd(1, 20); if (A === B) B = Math.max(1, B - rnd(1, 3)); aS.set(A, true); bS.set(B, true); step = 0; ver = 0; scatter(); draw(); }
    P.section('Counters');
    const aS = P.stepper({ label: 'Yellow counters', value: A, min: 0, max: 30, onChange: v => { A = v; step = 0; scatter(); draw(); } });
    const bS = P.stepper({ label: 'White counters', value: B, min: 0, max: 30, onChange: v => { B = v; step = 0; scatter(); draw(); } });
    P.buttons([['New counters', fresh, 'primary'], ['Mix up again', () => { step = 0; scatter(); draw(); }]]);
    P.section('Steps');
    const stepNote = P.note('');
    P.buttons([['Back a step', () => { step = Math.max(0, step - 1); draw(); }], ['Next step', () => { step = Math.min(3, step + 1); draw(); }, 'primary']]);
    c.pulseWhen(c.btn('Next step'), () => step < 3);
    P.section('Calculation');
    P.toggle({ label: 'Show calculation at the last step', value: showCalc, onChange: v => { showCalc = v; draw(); } });
    P.button('Another way to write it', () => { ver = (ver + 1) % 4; if (step < 3) step = 3; showCalc = true; draw(); });
    scatter(); draw();
  }
});

tool({
  id: 'grouping', name: 'Grouping and sharing', strand: 'muldiv', years: [1, 2, 3, 4], w: 1000, h: 660,
  desc: 'Division two ways: make groups of a number, or share between a number of hoops. Then check the answer against the picture.',
  tags: 'division grouping sharing remainder repeated subtraction',
  icon: '<circle cx="14" cy="14" r="9"/><circle cx="34" cy="14" r="9"/><circle cx="24" cy="35" r="9"/><circle cx="12" cy="14" r="2" fill="currentColor"/><circle cx="17" cy="15" r="2" fill="currentColor"/><circle cx="32" cy="12" r="2" fill="currentColor"/><circle cx="36" cy="16" r="2" fill="currentColor"/>',
  guide: ['The calculation is at the top. Set the numbers in the panel, or tap Random.', 'Grouping: drag counters into the circle to make a group. When a circle is full, a new empty circle appears for the next group.', 'Sharing: there is one hoop for each share. Deal the counters out one at a time.', 'Tap the answer box next to the calculation to show the answer. It also says whether the picture matches the answer.', 'One step and Play do the grouping or sharing for you.'],
  mount(c) {
    const { svg, P } = c;
    let N = 17, D = 5, mode = 'group', at = [], seeds = [], reveal = false, line = true, timer = null;
    c.persist(() => ({ N, D, mode, at, seeds, reveal, line }), s => ({ N, D, mode, at, seeds, reveal, line } = Object.assign({ N, D, mode, at, seeds, reveal, line }, s)));
    const g = S('g', {}, svg);
    const TRAY = { x: 60, y: 92, w: 880, h: 150 };
    const reseed = () => { seeds = []; for (let i = 0; i < N; i++) { let p, t = 0; do { p = [TRAY.x + 24 + Math.random() * (TRAY.w - 48), TRAY.y + 34 + Math.random() * (TRAY.h - 54)]; t++; } while (t < 300 && seeds.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 25)); seeds.push(p.map(v => Math.round(v))); } };
    const inC = k => at.filter(v => v === k).length;
    const placed = () => at.filter(v => v >= 0).length;
    const fullGroups = () => { let n = 0; for (let k = 0; k < 80; k++) { if (inC(k) === D) n++; } return n; };
    const nCircles = () => { if (mode === 'share') return D; let n = 0; while (inC(n) === D) n++; const left = N - placed(); const used = Math.max(n, ...at.filter(v => v >= 0).map(v => v + 1), 0); return Math.max(1, used + (left > 0 && used === n ? 1 : 0)); };
    const cap = () => mode === 'group' ? D : Infinity;
    function circ(k) {
      const n = nCircles(), perRow = Math.min(n, mode === 'share' ? 12 : 8), rows = Math.ceil(n / perRow), row = Math.floor(k / perRow), inRow = Math.min(perRow, n - row * perRow);
      const w = 920 / perRow, r = Math.min(mode === 'group' ? 66 : 76, w / 2 - 6, rows > 1 ? 58 : 99);
      return { cx: 500 + (k % perRow - (inRow - 1) / 2) * w, cy: 345 + row * (2 * r + 30) - (rows > 1 ? 40 : 0), r };
    }
    function pos(i) {
      if (at[i] < 0) return seeds[i] || [500, 160];
      const k = at[i], j = at.slice(0, i).filter(v => v === k).length, { cx, cy, r } = circ(k), cnt = Math.max(inC(k), 1);
      const cols = cnt <= 4 ? 2 : cnt <= 9 ? 3 : 4, sp = Math.min(26, (r * 1.5) / cols), rows = Math.ceil(cnt / cols);
      return [cx + ((j % cols) - (cols - 1) / 2) * sp, cy + (Math.floor(j / cols) - (rows - 1) / 2) * sp];
    }
    function status() {
      const q = Math.floor(N / D), r = N % D, left = N - placed();
      if (mode === 'group') {
        const full = fullGroups(), pk = [...Array(nCircles()).keys()].filter(k => inC(k) > 0 && inC(k) < D), partial = pk.length, inPart = pk.reduce((t, k) => t + inC(k), 0);
        const ok = full === q && left + inPart === r && partial <= 1;
        const now = `The picture shows ${full} group${full === 1 ? '' : 's'} of ${D}${partial ? ` and ${partial} group${partial === 1 ? '' : 's'} that ${partial === 1 ? 'is' : 'are'} not full` : ''}, with ${left} not in a group.`;
        return { ok, msg: ok ? `The picture matches: ${q} group${q === 1 ? '' : 's'} of ${D}${r ? `, with ${r} left over${inPart ? ' (not enough for another group)' : ''}` : ''}.` : `${now} It does not match the answer yet.` };
      }
      const cs = [...Array(D).keys()].map(inC), even = cs.every(v => v === cs[0]);
      const ok = even && cs[0] === q && left === r;
      return { ok, msg: ok ? `The picture matches: ${q} in each of the ${D} hoops${r ? `, with ${r} left over` : ''}.` : !even ? `The hoops do not all have the same number yet (${cs.join(', ')}). Sharing must be fair.` : `Each hoop has ${cs[0]}, with ${left} still to share. ${left >= D ? 'There are enough to give every hoop one more.' : ''} It does not match the answer yet.` };
    }
    function draw() {
      clear(g);
      // calculation and answer box
      const q = Math.floor(N / D), r = N % D, ans = `${q}${r ? ' r ' + r : ''}`;
      text(g, 430, 46, `${N} ÷ ${D} =`, { 'font-size': 50, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'end' });
      const ab = S('g', { cls: 'hit' }, g), bw = reveal ? Math.max(120, ans.length * 30 + 30) : 120;
      S('rect', { x: 448, y: 10, width: bw, height: 72, rx: 16, fill: reveal ? 'var(--green-s)' : 'var(--yellow-s)', stroke: reveal ? 'var(--green)' : 'var(--yellow)', 'stroke-width': 4, 'stroke-dasharray': reveal ? null : '8 6' }, ab);
      text(ab, 448 + bw / 2, 48, reveal ? ans : '?', { 'font-size': reveal ? 46 : 50, 'font-weight': 800, cls: 'disp num', fill: reveal ? 'var(--green)' : 'var(--ink-3)' });
      if (!reveal) text(g, 448 + bw + 14, 48, 'Tap the box to check', { 'font-size': 15, fill: 'var(--ink-3)', 'text-anchor': 'start' });
      ab.addEventListener('click', () => { reveal = !reveal; draw(); });
      text(g, 940, 46, mode === 'group' ? `Groups of ${D}` : `Share between ${D}`, { 'font-size': 20, 'font-weight': 800, fill: 'var(--purple)', 'text-anchor': 'end', cls: 'disp' });
      // tray
      S('rect', { x: TRAY.x, y: TRAY.y, width: TRAY.w, height: TRAY.h, rx: 20, fill: 'var(--board-2)', stroke: 'var(--line)', 'stroke-dasharray': '6 6' }, g);
      text(g, TRAY.x + 18, TRAY.y + 18, `Counters to place: ${N - placed()}`, { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'start', 'font-weight': 700 });
      // circles
      const nC = nCircles();
      for (let k = 0; k < nC; k++) {
        const { cx, cy, r } = circ(k), n = inC(k), full = mode === 'group' && n === D;
        S('circle', { cx, cy, r, fill: full ? 'var(--purple-s)' : 'var(--board)', stroke: 'var(--purple)', 'stroke-width': 4, 'stroke-dasharray': mode === 'group' && !full ? '8 6' : null }, g);
        text(g, cx, cy + r + 16, mode === 'group' ? (full ? `group ${k + 1}` : n ? `${n} of ${D}` : 'new group') : String(n), { 'font-size': 15, 'font-weight': 700, cls: 'num', fill: 'var(--purple)' });
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = pos(i), el = S('g', { cls: 'grab' }, g);
        S('circle', { cx: x, cy: y, r: 11, fill: 'var(--orange)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, el);
        let sx, sy;
        c.drag(el, { start: p => { sx = p.x; sy = p.y; stop(); g.append(el); }, move: p => el.setAttribute('transform', `translate(${p.x - sx},${p.y - sy})`), end: p => {
          let target = -1; for (let k = 0; k < nCircles(); k++) { const q2 = circ(k); if (Math.hypot(p.x - q2.cx, p.y - q2.cy) < q2.r + 10) target = k; }
          if (target >= 0 && at[i] !== target && inC(target) >= cap()) { c.toast(`A group holds ${D}. That circle is full.`); target = at[i]; }
          if (target < 0) seeds[i] = [clamp(p.x, TRAY.x + 16, TRAY.x + TRAY.w - 16), clamp(p.y, TRAY.y + 28, TRAY.y + TRAY.h - 14)];
          at[i] = target; tidy(); draw();
        } });
      }
      // number line for grouping
      const yl = 600;
      if (line && mode === 'group') {
        const x0 = 100, x1 = 900, X = v => x0 + v / N * (x1 - x0), full = fullGroups();
        S('line', { x1: x0, y1: yl, x2: x1, y2: yl, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
        for (let v = 0; v <= N; v++) S('line', { x1: X(v), y1: yl - 6, x2: X(v), y2: yl + 6, stroke: 'var(--ink-2)', 'stroke-width': 1.5 }, g);
        [0, N].forEach(v => text(g, X(v), yl + 24, String(v), { 'font-size': 18, cls: 'num' }));
        for (let k = 0; k < full; k++) { const a = X(k * D), b = X((k + 1) * D); S('path', { d: `M${a} ${yl - 4} Q${(a + b) / 2} ${yl - 50} ${b} ${yl - 4}`, fill: 'none', stroke: 'var(--purple)', 'stroke-width': 3 }, g); text(g, (a + b) / 2, yl - 36, String(D), { 'font-size': 16, 'font-weight': 700, fill: 'var(--purple)' }); text(g, b, yl + 24, String((k + 1) * D), { 'font-size': 18, cls: 'num' }); }
      }
      if (reveal) {
        const st = status(), w = Math.min(960, st.msg.length * 10.5 + 60), y = line && mode === 'group' ? 520 : 600;
        S('rect', { x: 500 - w / 2, y: y - 24, width: w, height: 48, rx: 16, fill: st.ok ? 'var(--green)' : 'var(--orange)' }, g);
        text(g, 500, y + 1, (st.ok ? '✓ ' : '') + st.msg, { 'font-size': 18, 'font-weight': 800, fill: '#fff', cls: 'num' });
      }
    }
    function tidy() { if (mode !== 'group') return; const used = [...new Set(at.filter(v => v >= 0))].sort((a, b) => a - b); const map = {}; used.forEach((k, i) => map[k] = i); at = at.map(v => v >= 0 ? map[v] : v); }
    function step() {
      if (mode === 'group') { const left = N - placed(); if (left < D) return false; let k = 0; while (inC(k) === D) k++; let need = D - inC(k); for (let i = 0; i < N && need; i++) if (at[i] < 0) { at[i] = k; need--; } }
      else { const left = N - placed(); const cs = [...Array(D).keys()].map(inC); if (left < D && cs.every(v => v === cs[0])) return false; const i = at.indexOf(-1); if (i < 0) return false; let best = 0; for (let k = 1; k < D; k++) if (inC(k) < inC(best)) best = k; at[i] = best; }
      draw(); return true;
    }
    function play() { stop(); timer = setInterval(() => { if (!step()) stop(); }, mode === 'share' ? 300 : 700); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    const reset = () => { stop(); at = Array(N).fill(-1); reveal = false; reseed(); draw(); };
    c.onClean(stop);
    P.section('Division');
    const nS = P.stepper({ label: 'Counters', value: N, min: 1, max: 60, onChange: v => { N = v; reset(); } });
    const dS = P.stepper({ label: 'Divide by', value: D, min: 2, max: 12, onChange: v => { D = v; reset(); } });
    P.seg({ label: 'Method', options: [['group', 'Grouping'], ['share', 'Sharing']], value: mode, onChange: v => { mode = v; reset(); } });
    P.seg({ label: 'Random', options: [['none', 'No remainder'], ['rem', 'With a remainder']], value: null, retrigger: true, onChange: k => { D = rnd(2, 6); const q = rnd(2, Math.min(8, Math.floor(40 / D))); N = q * D + (k === 'rem' ? rnd(1, D - 1) : 0); nS.set(N, true); dS.set(D, true); reset(); } });
    P.section('Steps');
    P.buttons([['One step', () => { stop(); step(); }], ['Play', play, 'primary']]);
    P.button('Start again', reset);
    P.section('Show');
    P.toggle({ label: 'Number line (grouping)', value: line, onChange: v => { line = v; draw(); } });
    if (at.length !== N || seeds.length !== N) reset(); else draw();
  }
});

tool({
  id: 'remainders', name: 'Remainders', strand: 'muldiv', years: [3, 4, 5, 6], w: 1000, h: 660,
  desc: 'Fill a grid row by row to see quotients and remainders as numbers, fractions or decimals.',
  tags: 'remainder division fraction decimal grid',
  icon: '<rect x="6" y="8" width="36" height="32" rx="3"/><path d="M18 8v32M30 8v32M6 24h36"/><circle cx="12" cy="16" r="3" fill="currentColor"/><circle cx="24" cy="16" r="3" fill="currentColor"/><circle cx="36" cy="16" r="3" fill="currentColor"/><circle cx="12" cy="32" r="3" fill="currentColor"/>',
  guide: ['The number of columns is the divisor: each full row is one group. Tap the next empty square to add a counter, or tap the last counter to take it away.', 'Counters in the unfinished row are the remainder.', 'Choose Fraction to see the remainder as part of a group. If 2 are left over and a group is 4, the remainder is 2 out of 4, so 2/4 of a group, which is the same as 1/2.', 'Choose Decimal to see the same part of a group as a decimal.'],
  mount(c) {
    const { svg, P } = c;
    let cols = 4, rows = 6, n = 0, rem = 'num', showCalc = true, grid = true, nRef = null;
    const g = S('g', {}, svg);
    const frac = (x, y, a, b, fs, cl) => { text(g, x, y - fs * .62, String(a), { 'font-size': fs, 'font-weight': 800, cls: 'num', fill: cl }); S('line', { x1: x - fs * .6, y1: y, x2: x + fs * .6, y2: y, stroke: cl || 'var(--ink)', 'stroke-width': 3 }, g); text(g, x, y + fs * .66, String(b), { 'font-size': fs, 'font-weight': 800, cls: 'num', fill: cl }); };
    function draw() {
      clear(g);
      const q = Math.floor(n / cols), r = n % cols;
      const s = Math.min(64, 760 / cols, 380 / rows), x0 = 500 - s * cols / 2, y0 = 30;
      for (let i = 0; i < cols * rows; i++) {
        const rr = Math.floor(i / cols), cc = i % cols, cell = S('g', { cls: 'hit' }, g);
        S('rect', { x: x0 + cc * s, y: y0 + rr * s, width: s, height: s, fill: q > rr ? 'var(--purple-s)' : rr === q && r ? 'var(--orange-s)' : 'var(--board)', stroke: grid ? 'var(--line-2)' : 'transparent', 'stroke-width': 1.5 }, cell);
        if (i < n) S('circle', { cx: x0 + cc * s + s / 2, cy: y0 + rr * s + s / 2, r: s * .36, fill: rr < q ? 'var(--purple)' : 'var(--orange)', stroke: 'var(--ink)', 'stroke-width': 1.5 }, cell);
        cell.addEventListener('click', () => { if (i === n) n++; else if (i === n - 1) n--; else if (i > n) n = i + 1; else n = i; nRef && nRef.set(n, true); draw(); });
      }
      for (let k = 0; k < q; k++) text(g, x0 + cols * s + 22, y0 + k * s + s / 2, `${k + 1}`, { 'font-size': 18, cls: 'num', fill: 'var(--purple)', 'font-weight': 700, 'text-anchor': 'start' });
      if (r) { const y = y0 + q * s + s / 2; text(g, x0 + cols * s + 22, y, `${r} out of ${cols}`, { 'font-size': 18, fill: 'var(--orange)', 'font-weight': 800, 'text-anchor': 'start' }); }
      if (q) text(g, x0 - 20, y0 + q * s / 2, `${q} group${q > 1 ? 's' : ''}`, { 'font-size': 18, fill: 'var(--purple)', 'font-weight': 700, 'text-anchor': 'end' });
      if (!showCalc || !n) { if (!n) text(g, 500, 520, 'Tap the first square to add a counter', { 'font-size': 22, fill: 'var(--ink-3)' }); return; }
      const gg = gcd(r, cols) || 1, yE = y0 + rows * s + 40;
      if (rem === 'num' || !r) {
        text(g, 500, 610, `${n} ÷ ${cols} = ${q}${r ? ' r ' + r : ''}`, { 'font-size': 50, 'font-weight': 800, cls: 'disp num' });
        text(g, 500, yE, r ? `${q} full group${q === 1 ? '' : 's'} of ${cols}, and ${r} left over` : `${q} full group${q === 1 ? '' : 's'} of ${cols}, nothing left over`, { 'font-size': 22, fill: 'var(--ink-2)' });
        return;
      }
      // explanation bar: one group with the remainder shaded
      const bw = Math.min(46, 320 / cols), bx = 120, by = yE - 20;
      text(g, bx, by - 14, 'One group of ' + cols, { 'font-size': 16, fill: 'var(--ink-3)', 'text-anchor': 'start' });
      for (let k = 0; k < cols; k++) S('rect', { x: bx + k * bw, y: by, width: bw, height: 38, fill: k < r ? 'var(--orange)' : 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      const ex = bx + cols * bw + 30;
      text(g, ex, by + 19, `${r} left over is ${r} out of ${cols}`, { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'start' });
      if (rem === 'frac') {
        const tx = ex + 300; frac(tx, by + 19, r, cols, 22, 'var(--orange)');
        if (gg > 1) { text(g, tx + 34, by + 19, '=', { 'font-size': 24, 'font-weight': 800 }); frac(tx + 68, by + 19, r / gg, cols / gg, 22, 'var(--orange)'); text(g, tx + 98, by + 19, 'of a group', { 'font-size': 18, fill: 'var(--ink-2)', 'text-anchor': 'start' }); }
        else text(g, tx + 30, by + 19, 'of a group', { 'font-size': 18, fill: 'var(--ink-2)', 'text-anchor': 'start' });
        const main = `${n} ÷ ${cols} = ${q}`; text(g, 470, 610, main, { 'font-size': 50, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'end' });
        frac(510, 610, r / gg, cols / gg, 30, 'var(--orange)');
        if (gg > 1) text(g, 560, 610, `(${r}/${cols} simplified)`, { 'font-size': 18, fill: 'var(--ink-3)', 'text-anchor': 'start' });
      } else {
        const tx = ex + 300; frac(tx, by + 19, r, cols, 22, 'var(--orange)'); text(g, tx + 34, by + 19, `= ${nf(+(r / cols).toFixed(3))}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'start', cls: 'num', fill: 'var(--orange)' });
        text(g, 500, 610, `${n} ÷ ${cols} = ${q} + ${nf(+(r / cols).toFixed(3))} = ${nf(+(n / cols).toFixed(3))}`, { 'font-size': 44, 'font-weight': 800, cls: 'disp num' });
      }
    }
    P.section('Grid');
    P.stepper({ label: 'Columns (divisor)', value: cols, min: 1, max: 12, onChange: v => { cols = v; n = Math.min(n, cols * rows); draw(); } });
    P.stepper({ label: 'Rows', value: rows, min: 1, max: 12, onChange: v => { rows = v; n = Math.min(n, cols * rows); draw(); } });
    const nS = nRef = P.stepper({ label: 'Counters', value: n, min: 0, max: 144, onChange: v => { n = Math.min(v, cols * rows); if (n !== v) nS.set(n, true); draw(); } });
    P.toggle({ label: 'Grid lines', value: grid, onChange: v => { grid = v; draw(); } });
    P.section('Show the remainder as');
    P.seg({ options: [['num', 'r 2'], ['frac', 'Fraction'], ['dec', 'Decimal']], value: rem, onChange: v => { rem = v; draw(); } });
    P.toggle({ label: 'Show calculation', value: showCalc, onChange: v => { showCalc = v; draw(); } });
    P.button('Remove all counters', () => { n = 0; nS.set(0, true); draw(); });
    draw();
  }
});

tool({
  id: 'array', name: 'Multiplication array', strand: 'muldiv', years: [2, 3, 4, 5], w: 1000, h: 640,
  desc: 'Build arrays and split them with movable lines to show the distributive law.',
  tags: 'array partition distributive commutative rows columns',
  icon: '<g fill="currentColor" stroke="none"><circle cx="10" cy="12" r="3"/><circle cx="20" cy="12" r="3"/><circle cx="30" cy="12" r="3"/><circle cx="10" cy="24" r="3"/><circle cx="20" cy="24" r="3"/><circle cx="30" cy="24" r="3"/><circle cx="10" cy="36" r="3"/><circle cx="20" cy="36" r="3"/><circle cx="30" cy="36" r="3"/></g><path d="M25 6v36" stroke-dasharray="3 3"/>',
  guide: ['Set the rows and columns to build an array.', 'Drag the dashed split lines into the array. Each part is coloured and the calculation shows how the parts add up.', 'Tap Turn round to swap rows and columns and see that 3 × 7 = 7 × 3.', 'Tap a counter to change its colour by hand.'],
  mount(c) {
    const { svg, P } = c;
    let R = 4, C = 7, vs = 5, hs = 0, showCalc = true, showNums = true, flips = {}, turned = false, gridOn = false;
    c.persist(() => ({ R, C, vs, hs, showCalc, showNums, flips, gridOn }), s2 => ({ R, C, vs, hs, showCalc, showNums, flips, gridOn } = Object.assign({ R, C, vs, hs, showCalc, showNums, flips, gridOn }, s2)));
    const g = S('g', {}, svg);
    const hues = [['blue', 'yellow'], ['green', 'red']];
    function draw() {
      clear(g);
      const s = gridOn ? Math.min(56, 400 / C, 400 / R) : Math.min(64, 760 / C, 440 / R), x0 = gridOn ? 70 + (420 - s * C) / 2 : 500 - s * C / 2, y0 = 70;
      for (let r = 0; r < R; r++) for (let cc = 0; cc < C; cc++) {
        const k = r + ',' + cc; let h = hues[hs && r >= hs ? 1 : 0][vs && cc >= vs ? 1 : 0];
        if (flips[k]) h = 'purple';
        const cnt = S('circle', { cx: x0 + cc * s + s / 2, cy: y0 + r * s + s / 2, r: s * .38, fill: col(h), stroke: 'var(--ink)', 'stroke-width': 1.5, cls: 'hit', style: 'transition:cx .5s, cy .5s' }, g);
        cnt.addEventListener('click', () => { flips[k] = !flips[k]; draw(); });
      }
      if (showNums) { for (let cc = 0; cc < C; cc++) text(g, x0 + cc * s + s / 2, y0 - 22, String(cc + 1), { 'font-size': 16, fill: 'var(--ink-3)', cls: 'num' }); for (let r = 0; r < R; r++) text(g, x0 - 24, y0 + r * s + s / 2, String(r + 1), { 'font-size': 16, fill: 'var(--ink-3)', cls: 'num' }); }
      if (gridOn) {
        const cs2 = vs ? [vs, C - vs] : [C], rs2 = hs ? [hs, R - hs] : [R], gx = 560, gy = 90, cw = Math.min(150, 380 / (cs2.length + 1)), ch = Math.min(110, 320 / (rs2.length + 1));
        const cell = (x, y, w, h, t, fill, fs, bold) => { S('rect', { x, y, width: w, height: h, fill, stroke: 'var(--ink)', 'stroke-width': 2 }, g); text(g, x + w / 2, y + h / 2 + 1, t, { 'font-size': fs, 'font-weight': bold ? 800 : 700, cls: 'disp num' }); };
        cell(gx, gy, cw, ch, '×', 'var(--board-2)', 34, true);
        cs2.forEach((b, j) => cell(gx + cw * (j + 1), gy, cw, ch, String(b), 'var(--board-2)', 34, true));
        rs2.forEach((a, i) => { cell(gx, gy + ch * (i + 1), cw, ch, String(a), 'var(--board-2)', 34, true); cs2.forEach((b, j) => cell(gx + cw * (j + 1), gy + ch * (i + 1), cw, ch, String(a * b), col(hues[hs && i ? 1 : 0][vs && j ? 1 : 0] + '-s'), 36, true)); });
        text(g, gx + cw * (cs2.length + 1) / 2, gy - 26, 'Multiplication grid', { 'font-size': 16, 'font-weight': 800, fill: 'var(--ink-3)' });
      }
      // split handles
      const vx = x0 + vs * s, hy = y0 + hs * s;
      const vh = S('g', { cls: 'grab' }, g);
      S('line', { x1: vx, y1: y0 - 10, x2: vx, y2: y0 + R * s + 10, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: vs ? 1 : .35 }, vh);
      S('rect', { x: vx - 14, y: y0 + R * s + 12, width: 28, height: 34, rx: 8, fill: 'var(--ink)' }, vh);
      S('rect', { x: vx - 20, y: y0 - 10, width: 40, height: R * s + 60, fill: 'transparent' }, vh);
      c.drag(vh, { move: p => { const v = clamp(Math.round((p.x - x0) / s), 0, C); if (v !== vs) { vs = v === C ? 0 : v; draw(); } } });
      const hh = S('g', { cls: 'grab' }, g);
      S('line', { x1: x0 - 10, y1: hy, x2: x0 + C * s + 10, y2: hy, stroke: 'var(--ink)', 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: hs ? 1 : .35 }, hh);
      S('rect', { x: x0 + C * s + 12, y: hy - 14, width: 34, height: 28, rx: 8, fill: 'var(--ink)' }, hh);
      S('rect', { x: x0 - 10, y: hy - 20, width: C * s + 60, height: 40, fill: 'transparent' }, hh);
      c.drag(hh, { move: p => { const v = clamp(Math.round((p.y - y0) / s), 0, R); if (v !== hs) { hs = v === R ? 0 : v; draw(); } } });
      if (showCalc) {
        const cs = vs ? [vs, C - vs] : [C], rs = hs ? [hs, R - hs] : [R];
        let parts = [];
        for (const a of rs) for (const b of cs) parts.push(`(${a} × ${b})`);
        let s1 = `${R} × ${C} = ${R * C}`;
        if (parts.length > 1) s1 = `${R} × ${C} = ${parts.join(' + ')} = ${R * C}`;
        text(g, 500, Math.max(y0 + R * s + 80, gridOn ? 540 : 0), s1, { 'font-size': parts.length > 2 ? 30 : 40, 'font-weight': 800, cls: 'disp num' });
        if (parts.length > 1) { const vals = []; for (const a of rs) for (const b of cs) vals.push(a * b); text(g, 500, Math.max(y0 + R * s + 80, gridOn ? 540 : 0) + 46, `= ${vals.join(' + ')} = ${R * C}`, { 'font-size': 24, fill: 'var(--ink-2)', cls: 'num', 'font-weight': 700 }); }
      }
    }
    P.section('Array');
    const rS = P.stepper({ label: 'Rows', value: R, min: 1, max: 12, onChange: v => { R = v; hs = hs >= R ? 0 : hs; flips = {}; draw(); } });
    const cS = P.stepper({ label: 'Columns', value: C, min: 1, max: 12, onChange: v => { C = v; vs = vs >= C ? 0 : vs; flips = {}; draw(); } });
    P.button('Turn round', () => { [R, C] = [C, R]; [hs, vs] = [vs, hs]; rS.set(R, true); cS.set(C, true); flips = {}; draw(); });
    P.section('Split lines');
    P.buttons([['Remove splits', () => { vs = 0; hs = 0; draw(); }], ['Split at 10', () => { vs = C > 10 ? 10 : vs; hs = R > 10 ? 10 : hs; draw(); }]]);
    P.note('Drag the dark handles to split the array.');
    P.section('Show');
    P.toggle({ label: 'Calculation', value: showCalc, onChange: v => { showCalc = v; draw(); } });
    P.toggle({ label: 'Row and column numbers', value: showNums, onChange: v => { showNums = v; draw(); } });
    P.toggle({ label: 'Multiplication grid with digits', value: gridOn, onChange: v => { gridOn = v; draw(); } });
    P.button('Reset colours', () => { flips = {}; draw(); });
    draw();
  }
});

tool({
  id: 'multiplication-board', name: 'Multiplication board', strand: 'muldiv', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'A 10 by 10 or 20 by 20 board with sliding covers to reveal any multiplication.',
  tags: 'curtain uncover board 100 400 area model',
  icon: '<rect x="6" y="6" width="36" height="36" rx="3"/><path d="M26 6v36M6 26h36"/><rect x="26" y="6" width="16" height="36" fill="currentColor" opacity=".35"/><rect x="6" y="26" width="20" height="16" fill="currentColor" opacity=".35"/>',
  guide: ['Drag the right cover left and the bottom cover up to reveal a rectangle of counters.', 'The revealed rows and columns, and their product, are shown beside the board.', 'Two colour mode shades the board in fives, so 7 can be seen as 5 and 2.', 'Switch to numbers to show the products in each square instead of counters.'],
  mount(c) {
    const { svg, P } = c;
    let n = 10, rc = 0, rr = 0, mode = 'counters', two = true, showCalc = true;
    const g = S('g', {}, svg), cv = S('g', {}, svg);
    const geom = () => { const s = 540 / n; return { s, x0: 120, y0: 40 }; };
    function draw() {
      clear(g); clear(cv);
      const { s, x0, y0 } = geom();
      S('rect', { x: x0, y: y0, width: s * n, height: s * n, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, g);
      for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
        const alt = two && ((Math.floor(r / 5) + Math.floor(cc / 5)) % 2);
        if (mode === 'counters') S('circle', { cx: x0 + cc * s + s / 2, cy: y0 + r * s + s / 2, r: s * .38, fill: alt ? 'var(--purple)' : 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': n > 10 ? .8 : 1.5 }, g);
        else { S('rect', { x: x0 + cc * s, y: y0 + r * s, width: s, height: s, fill: alt ? 'var(--purple-s)' : 'var(--yellow-s)', stroke: 'var(--line-2)', 'stroke-width': .8 }, g); text(g, x0 + cc * s + s / 2, y0 + r * s + s / 2 + 1, String((r + 1) * (cc + 1)), { 'font-size': s * (n > 10 ? .34 : .38), cls: 'num', 'font-weight': 700 }); }
      }
      for (let i = 1; i <= n; i++) { text(g, x0 + (i - .5) * s, y0 - 16, String(i), { 'font-size': n > 10 ? 11 : 16, fill: 'var(--ink-3)', cls: 'num' }); text(g, x0 - 16, y0 + (i - .5) * s, String(i), { 'font-size': n > 10 ? 11 : 16, fill: 'var(--ink-3)', cls: 'num' }); }
      // covers
      const rx = x0 + rc * s, by = y0 + rr * s;
      const right = S('g', { cls: 'grab' }, cv);
      S('rect', { x: rx, y: y0 - 2, width: x0 + n * s - rx + 2, height: n * s + 4, fill: 'var(--accent)', opacity: .96 }, right);
      S('rect', { x: rx - 6, y: y0 + n * s / 2 - 34, width: 12, height: 68, rx: 6, fill: 'var(--ink)' }, right); S('rect', { x: rx - 22, y: y0, width: 44, height: n * s, fill: 'transparent' }, right);
      c.drag(right, { move: p => { const v = clamp(Math.round((p.x - x0) / s), 0, n); if (v !== rc) { rc = v; draw(); } } });
      const bot = S('g', { cls: 'grab' }, cv);
      S('rect', { x: x0 - 2, y: by, width: rx - x0 + 2, height: y0 + n * s - by + 2, fill: 'var(--teal)', opacity: .96 }, bot);
      S('rect', { x: x0 + Math.max(rc * s / 2 - 34, 2), y: by - 6, width: Math.max(0, Math.min(68, rc * s - 4)), height: 12, rx: 6, fill: 'var(--ink)', opacity: rc ? 1 : 0 }, bot); S('rect', { x: x0, y: by - 22, width: rc * s, height: 44, fill: 'transparent' }, bot);
      c.drag(bot, { move: p => { const v = clamp(Math.round((p.y - y0) / s), 0, n); if (v !== rr) { rr = v; draw(); } } });
      if (showCalc) {
        text(cv, 830, 240, `${rr} × ${rc}`, { 'font-size': 56, 'font-weight': 800, cls: 'disp num' });
        text(cv, 830, 320, `= ${rr * rc}`, { 'font-size': 56, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' });
        text(cv, 830, 380, `${rr} rows of ${rc}`, { 'font-size': 20, fill: 'var(--ink-2)' });
      }
    }
    P.section('Board');
    P.seg({ options: [[10, '10 × 10'], [20, '20 × 20']], value: n, onChange: v => { n = v; rc = Math.min(rc, n); rr = Math.min(rr, n); draw(); } });
    P.seg({ label: 'Squares show', options: [['counters', 'Counters'], ['numbers', 'Products']], value: mode, onChange: v => { mode = v; draw(); } });
    P.toggle({ label: 'Two colours in fives', value: two, onChange: v => { two = v; draw(); } });
    P.section('Covers');
    P.stepper({ label: 'Columns showing', value: rc, min: 0, max: 20, onChange: v => { rc = Math.min(v, n); draw(); } });
    P.stepper({ label: 'Rows showing', value: rr, min: 0, max: 20, onChange: v => { rr = Math.min(v, n); draw(); } });
    P.buttons([['Cover all', () => { rc = 0; rr = 0; draw(); }], ['Random', () => { rc = rnd(2, n); rr = rnd(2, n); draw(); }]]);
    P.toggle({ label: 'Show calculation', value: showCalc, onChange: v => { showCalc = v; draw(); } });
    draw();
  }
});

tool({
  id: 'multiplication-facts', name: 'Multiplication facts', strand: 'muldiv', years: [1, 2, 3, 4], w: 1000, h: 640,
  desc: 'Rows of blocks with a matching number line of equal jumps.',
  tags: 'repeated addition times tables jumps',
  icon: '<rect x="6" y="8" width="8" height="8"/><rect x="16" y="8" width="8" height="8"/><rect x="26" y="8" width="8" height="8"/><rect x="6" y="18" width="8" height="8"/><rect x="16" y="18" width="8" height="8"/><rect x="26" y="18" width="8" height="8"/><path d="M4 40h40M6 38q7-10 14 0q7-10 14 0"/>',
  guide: ['Choose the rows and columns. Each row is one equal group.', 'The number line shows the same multiplication as repeated jumps.', 'Hide the product to ask the class, and show it when ready.', 'Show the rows one at a time with Build row by row to talk through repeated addition.'],
  mount(c) {
    const { svg, P } = c;
    let R = 3, C = 4, shape = 'block', showProd = true, showLine = true, shown = 99;
    const g = S('g', {}, svg);
    function draw() {
      clear(g);
      const vis = Math.min(R, shown);
      const s = Math.min(54, 760 / C, 300 / R), x0 = 500 - s * C / 2, y0 = 40;
      for (let r = 0; r < vis; r++) for (let cc = 0; cc < C; cc++) {
        const x = x0 + cc * s, y = y0 + r * s;
        if (shape === 'block') S('rect', { x: x + 2, y: y + 2, width: s - 4, height: s - 4, rx: 4, fill: col(['blue', 'orange', 'green', 'purple'][r % 4]), stroke: 'var(--ink)', 'stroke-width': 1.5 }, g);
        else S('circle', { cx: x + s / 2, cy: y + s / 2, r: s * .4, fill: col(['blue', 'orange', 'green', 'purple'][r % 4]), stroke: 'var(--ink)', 'stroke-width': 1.5 }, g);
      }
      for (let r = 0; r < vis; r++) text(g, x0 + C * s + 40, y0 + r * s + s / 2, String((r + 1) * C), { 'font-size': 22, cls: 'num', fill: 'var(--ink-3)' });
      if (showLine) {
        const T = R * C, x1 = 80, x2 = 920, y = 470, X = v => x1 + v / T * (x2 - x1);
        S('line', { x1, y1: y, x2, y2: y, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
        const lb = Math.ceil(T / 25);
        for (let v = 0; v <= T; v++) { S('line', { x1: X(v), y1: y - (v % C ? 6 : 10), x2: X(v), y2: y + (v % C ? 6 : 10), stroke: 'var(--ink-2)', 'stroke-width': v % C ? 1.2 : 2 }, g); if (v % C === 0) text(g, X(v), y + 28, String(v), { 'font-size': 20, cls: 'num', 'font-weight': 700 }); }
        for (let k = 0; k < vis; k++) { const a = X(k * C), b = X((k + 1) * C), h = Math.min(90, (b - a) * .6 + 20); S('path', { d: `M${a} ${y - 4} Q${(a + b) / 2} ${y - h * 1.7} ${b} ${y - 4}`, fill: 'none', stroke: col(['blue', 'orange', 'green', 'purple'][k % 4]), 'stroke-width': 4 }, g); }
      }
      const rep = Array(vis).fill(C).join(' + ');
      text(g, 500, 580, `${R} × ${C} = ${showProd ? R * C : '?'}`, { 'font-size': 52, 'font-weight': 800, cls: 'disp num' });
      if (vis <= 8 && vis) text(g, 500, 620, `${rep} = ${showProd || vis < R ? vis * C : '?'}`, { 'font-size': 22, fill: 'var(--ink-2)', cls: 'num' });
    }
    P.section('Groups');
    P.stepper({ label: 'Rows (groups)', value: R, min: 1, max: 12, onChange: v => { R = v; shown = 99; draw(); } });
    P.stepper({ label: 'Columns (in each)', value: C, min: 1, max: 12, onChange: v => { C = v; draw(); } });
    P.seg({ options: [['block', 'Blocks'], ['counter', 'Counters']], value: shape, onChange: v => { shape = v; draw(); } });
    P.section('Build');
    P.buttons([['Clear rows', () => { shown = 0; draw(); }], ['Add a row', () => { shown = Math.min(R, (shown > R ? R : shown) + 1); draw(); }, 'primary']]);
    P.section('Show');
    P.toggle({ label: 'Product', value: showProd, onChange: v => { showProd = v; draw(); } });
    P.toggle({ label: 'Number line', value: showLine, onChange: v => { showLine = v; draw(); } });
    draw();
  }
});

tool({
  id: 'times-tables', name: 'Multiplication tables', strand: 'muldiv', years: [2, 3, 4, 5, 6], w: 1000, h: 680,
  desc: 'Any times table, including decimals, with hide, reveal and shuffle for quick recall.',
  tags: 'times tables recall decimals mixed shuffle',
  icon: '<path d="M8 10h10M8 20h10M8 30h10M8 40h10M26 10h14M26 20h14M26 30h14M26 40h14"/>',
  guide: ['Choose a table. Decimal tables such as 0.5 and 0.1 are included.', 'Tap any part of a row to hide or show it.', 'Shuffle the order, or make mixed tables, then hide the answers for quick-fire recall.', 'Choose Multiplication, Division or Mixed. Mixed gives a random mix of × and ÷ facts, for one table or for mixed tables.'],
  mount(c) {
    const { svg, P } = c;
    let T = 7, upTo = 12, order = range(1, 12), hid = {}, div = false, mixed = null, facts = 'mul', kinds = range(1, 12).map(() => Math.random() < .5);
    const g = S('g', {}, svg);
    function draw() {
      clear(g);
      const rows = order.slice(0, upTo), half = Math.ceil(rows.length / 2), rh = Math.min(90, 600 / half);
      rows.forEach((m, i) => {
        const t = mixed ? mixed[i] : T;
        const cx = i < half ? 250 : 750, y = 40 + (i % half) * rh + rh / 2;
        const isDiv = facts === 'div' || (facts === 'mix' && kinds[i]); const parts = isDiv ? [nf(+(m * t).toFixed(6)), '÷', nf(t), '=', nf(m)] : [nf(m), '×', nf(t), '=', nf(+(m * t).toFixed(6))];
        const xs = [-170, -85, 0, 80, 180];
        S('rect', { x: cx - 230, y: y - rh / 2 + 4, width: 460, height: rh - 8, rx: 14, fill: i % 2 ? 'var(--board)' : 'var(--board-2)' }, g);
        parts.forEach((p, k) => {
          if (k === 1 || k === 3) { text(g, cx + xs[k], y, p, { 'font-size': rh * .45, fill: 'var(--ink-3)' }); return; }
          const key = i + ':' + k; const hide = hid[key] ?? (k === 4 && hid.all);
          const grp = S('g', { cls: 'hit' }, g);
          S('rect', { x: cx + xs[k] - 46, y: y - rh / 2 + 10, width: 92, height: rh - 20, rx: 10, fill: hide ? 'var(--accent)' : 'transparent' }, grp);
          if (!hide) text(grp, cx + xs[k], y + 1, p, { 'font-size': rh * .48, 'font-weight': k === 4 ? 800 : 700, cls: 'disp num', fill: k === 4 ? 'var(--accent)' : 'var(--ink)' });
          grp.addEventListener('click', () => { hid[key] = !hide; draw(); });
        });
      });
    }
    P.section('Table');
    P.stepper({ label: 'Times table', value: T, values: [0.1, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 50, 100], onChange: v => { T = v; mixed = null; draw(); } });
    P.stepper({ label: 'Rows', value: upTo, min: 5, max: 12, onChange: v => { upTo = v; order = range(1, 12); draw(); } });
    P.seg({ label: 'Facts', options: [['mul', 'Multiplication'], ['div', 'Division'], ['mix', 'Mixed × and ÷']], value: facts, onChange: v => { facts = v; kinds = range(1, 12).map(() => Math.random() < .5); hid = {}; draw(); } });
    P.section('Order');
    P.buttons([['In order', () => { order = range(1, 12); draw(); }], ['Shuffle', () => { order = shuffle(range(1, 12)); kinds = range(1, 12).map(() => Math.random() < .5); draw(); }, 'primary']]);
    P.buttons([['One table', () => { mixed = null; draw(); }], ['Mixed tables', () => { mixed = order.map(() => rnd(2, 12)); kinds = range(1, 12).map(() => Math.random() < .5); draw(); }]]);
    P.section('Hide');
    P.buttons([['Hide answers', () => { hid = { all: true }; draw(); }], ['Show all', () => { hid = {}; draw(); }]]);
    P.note('Tap any number to hide or show it.');
    draw();
  }
});

tool({
  id: 'grid-method', name: 'Multiplication grid', strand: 'muldiv', years: [3, 4, 5, 6], w: 1000, h: 640,
  desc: 'The grid method for multiplying, with partitioned numbers and partial products.',
  tags: 'grid method long multiplication partition decimals',
  icon: '<rect x="8" y="12" width="32" height="28" rx="2"/><path d="M26 12v28M8 26h32M8 6h32"/>',
  guide: ['Set the two numbers. Decimals to one place are allowed.', 'The numbers are partitioned along the top and side of the grid, and each box holds one partial product.', 'Tap any box, heading or total to hide or show it so the class can fill it in.', 'Hide all products to set the class a full calculation.'],
  mount(c) {
    const { svg, P } = c;
    let A = 47, B = 36, hid = {}, hideAll = false;
    const g = S('g', {}, svg);
    function parts(n) { const s = String(n); const [i, f] = s.split('.'); const out = []; [...i].forEach((d, k) => { if (+d) out.push(+d * 10 ** (i.length - 1 - k)); }); if (f) [...f].forEach((d, k) => { if (+d) out.push(+(+d / 10 ** (k + 1)).toFixed(4)); }); return out.length ? out : [0]; }
    function draw() {
      clear(g);
      const pa = parts(A), pb = parts(B);
      const cw = Math.min(170, 640 / pa.length), rh = Math.min(100, 380 / pb.length), x0 = 500 - (cw * pa.length + 120) / 2 + 120, y0 = 110;
      const cell = (key, x, y, w, h, val, style) => {
        const hide = hid[key] ?? (hideAll && style === 'p');
        const grp = S('g', { cls: 'hit' }, g);
        S('rect', { x, y, width: w, height: h, fill: style === 'h' ? 'var(--accent-soft)' : style === 't' ? 'var(--yellow-s)' : 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, grp);
        if (!hide) text(grp, x + w / 2, y + h / 2 + 1, big(val), { 'font-size': Math.min(42, h * .45), 'font-weight': style === 'p' ? 700 : 800, cls: 'disp num' });
        else text(grp, x + w / 2, y + h / 2 + 1, '?', { 'font-size': 36, fill: 'var(--ink-3)' });
        grp.addEventListener('click', () => { hid[key] = !hide; draw(); });
      };
      const tag = S('g', {}, g); S('rect', { x: x0 - 120, y: y0 - 70, width: 120, height: 70, fill: 'var(--ink)' }, tag); text(tag, x0 - 60, y0 - 35, '×', { 'font-size': 40, fill: 'var(--bg)', 'font-weight': 700 });
      pa.forEach((v, i) => cell('a' + i, x0 + i * cw, y0 - 70, cw, 70, v, 'h'));
      pb.forEach((v, j) => {
        cell('b' + j, x0 - 120, y0 + j * rh, 120, rh, v, 'h');
        let rowT = 0; pa.forEach((u, i) => { const p = +(u * v).toFixed(6); rowT += p; cell(`p${i}${j}`, x0 + i * cw, y0 + j * rh, cw, rh, p, 'p'); });
        if (pa.length > 1) cell('r' + j, x0 + pa.length * cw + 20, y0 + j * rh, 140, rh, +rowT.toFixed(6), 't');
      });
      const T = +(A * B).toFixed(6), yT = y0 + pb.length * rh + 30;
      text(g, 500, yT + 60, `${nf(A)} × ${nf(B)} =`, { 'font-size': 44, 'font-weight': 800, cls: 'disp num', 'text-anchor': 'end' });
      const tk = hid.T ?? hideAll; const tg = S('g', { cls: 'hit' }, g); S('rect', { x: 512, y: yT + 28, width: 220, height: 64, rx: 12, fill: tk ? 'var(--accent)' : 'var(--green-s)' }, tg);
      if (!tk) text(tg, 622, yT + 61, big(T), { 'font-size': 44, 'font-weight': 800, cls: 'disp num' });
      tg.addEventListener('click', () => { hid.T = !tk; draw(); });
    }
    P.section('Numbers');
    P.field({ label: 'First number', value: String(A), type: 'number', stepAttr: 'any', onChange: v => { const n = +v; if (n > 0 && n < 10000 && Math.round(n * 10) === n * 10) { A = n; hid = {}; draw(); } } });
    P.field({ label: 'Second number', value: String(B), type: 'number', stepAttr: 'any', onChange: v => { const n = +v; if (n > 0 && n < 1000 && Math.round(n * 10) === n * 10) { B = n; hid = {}; draw(); } } });
    P.note('Up to 4 digits by 3 digits. One decimal place is allowed.');
    P.section('Quick examples');
    P.buttons([['TO × O', () => setAB(rnd(12, 99), rnd(3, 9))], ['TO × TO', () => setAB(rnd(12, 99), rnd(12, 99))]]);
    P.buttons([['HTO × TO', () => setAB(rnd(120, 999), rnd(12, 99))], ['O.t × O', () => setAB(rnd(12, 99) / 10, rnd(3, 9))]]);
    function setAB(a, b) { A = a; B = b; const f = document.querySelectorAll('.dock .field input'); f[0].value = a; f[1].value = b; hid = {}; draw(); }
    P.section('Hide');
    P.toggle({ label: 'Hide all products', value: hideAll, onChange: v => { hideAll = v; hid = {}; draw(); } });
    P.note('Tap any box to hide or show it.');
    draw();
  }
});

tool({
  id: 'number-dial', name: 'Number dial', strand: 'muldiv', years: [2, 3, 4, 5, 6], w: 760, h: 680,
  desc: 'A dial of multiplication facts around a centre number, with hidden products to reveal.',
  tags: 'dial wheel times tables multiples',
  icon: '<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="7"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6"/>',
  guide: ['Change the centre number with + and −. Tap the centre to hide or show it.', 'Each outer segment shows the centre number multiplied by the number beside it. Tap a segment to hide or reveal its product.', 'Mix up the inner numbers to practise facts out of order.', 'Switch the range to work with tens, hundreds or tenths.', 'Mystery dial covers everything. Reveal it section by section, or tap any section, until the class can say the centre number.', 'Try a puzzle: Easy hides a few products, Medium more, Hard also hides some inner numbers, and Extra hard hides the centre number too. Every puzzle can be solved from what is left showing.'],
  mount(c) {
    const { svg, P } = c;
    let centre = 6, scale = 1, inner = range(1, 10), shown = {}, allShow = false, hideCentre = false, innerHid = {}, level = '', seq = null;
    const g = S('g', {}, svg);
    const cx = 380, cy = 340, R1 = 120, R2 = 220, R3 = 320;
    const arc = (r1, r2, a1, a2) => { const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]; const [x1, y1] = p(r2, a1), [x2, y2] = p(r2, a2), [x3, y3] = p(r1, a2), [x4, y4] = p(r1, a1); return `M${x1} ${y1} A${r2} ${r2} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 0 0 ${x4} ${y4} Z`; };
    function draw() {
      clear(g);
      const n = inner.length, da = Math.PI * 2 / n;
      inner.forEach((m, i) => {
        const a1 = -Math.PI / 2 - da / 2 + i * da, a2 = a1 + da, am = (a1 + a2) / 2;
        S('path', { d: arc(R1, R2, a1, a2), fill: i % 2 ? 'var(--blue-s)' : 'var(--board-2)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
        const ig = S('g', { cls: innerHid[i] ? 'hit' : '' }, g);
        if (innerHid[i]) { S('path', { d: arc(R1 + 4, R2 - 4, a1 + .02, a2 - .02), fill: 'var(--purple)', opacity: .9 }, ig); text(ig, cx + (R1 + R2) / 2 * Math.cos(am), cy + (R1 + R2) / 2 * Math.sin(am), '?', { 'font-size': 40, 'font-weight': 800, cls: 'disp', fill: '#fff' }); ig.addEventListener('click', () => { innerHid[i] = false; draw(); }); }
        else text(ig, cx + (R1 + R2) / 2 * Math.cos(am), cy + (R1 + R2) / 2 * Math.sin(am), nf(m), { 'font-size': 40, 'font-weight': 800, cls: 'disp num' });
        const seg = S('g', { cls: 'hit' }, g); const vis = shown[i] ?? allShow;
        S('path', { d: arc(R2 + 6, R3, a1, a2), fill: vis ? 'var(--yellow-s)' : 'var(--accent)', stroke: 'var(--ink)', 'stroke-width': 2 }, seg);
        const pv = +(m * centre * scale).toFixed(6);
        if (vis) text(seg, cx + (R2 + R3) / 2 * Math.cos(am), cy + (R2 + R3) / 2 * Math.sin(am), big(pv), { 'font-size': String(pv).length > 4 ? 28 : 38, 'font-weight': 800, cls: 'disp num' });
        seg.addEventListener('click', () => { shown[i] = !vis; draw(); });
      });
      const cg = S('g', { cls: 'hit' }, g);
      S('circle', { cx, cy, r: R1 - 8, fill: 'var(--orange)', stroke: 'var(--ink)', 'stroke-width': 3 }, cg);
      text(cg, cx, cy + 3, hideCentre ? '?' : nf(+(centre * scale).toFixed(6)), { 'font-size': 64, 'font-weight': 800, cls: 'disp num', fill: 'var(--board)' });
      cg.addEventListener('click', () => { hideCentre = !hideCentre; draw(); });
    }
    function puzzle(lv) {
      level = { easy: 'Easy', med: 'Medium', hard: 'Hard', xhard: 'Extra hard' }[lv];
      centre = rnd(2, 12); cS.set(centre, true);
      inner = lv === 'easy' ? range(1, 10) : shuffle(range(1, 12)).slice(0, 10);
      const idx = shuffle([...Array(10).keys()]); shown = {}; innerHid = {}; allShow = false; hideCentre = false;
      const hideP = new Set(), hideI = new Set();
      if (lv === 'easy') idx.slice(0, 3).forEach(k => hideP.add(k));
      else if (lv === 'med') idx.slice(0, 5).forEach(k => hideP.add(k));
      else if (lv === 'hard') { idx.slice(0, 6).forEach(k => hideP.add(k)); idx.slice(6, 8).forEach(k => hideI.add(k)); }
      else { hideCentre = true; idx.slice(1, 7).forEach(k => hideP.add(k)); idx.slice(7, 10).forEach(k => hideI.add(k)); }
      for (let k = 0; k < 10; k++) { shown[k] = !hideP.has(k); if (hideI.has(k)) innerHid[k] = true; }
      draw();
    }
    P.section('Centre');
    const cS = P.stepper({ label: 'Centre number', value: centre, min: 1, max: 12, onChange: v => { centre = v; hideCentre = false; draw(); } });
    P.seg({ label: 'Range', options: [[1, '1–12'], [10, 'Tens'], [100, 'Hundreds'], [0.1, 'Tenths']], value: scale, onChange: v => { scale = v; draw(); } });

    P.section('Mystery dial');
    P.note('Everything is covered. Reveal it one section at a time and ask the class to work out the centre number as soon as they can.');
    P.button('Cover everything', () => { centre = rnd(2, 12); cS.set(centre, true); inner = shuffle(range(1, 12)).slice(0, 10); hideCentre = true; allShow = false; shown = {}; innerHid = {}; for (let k = 0; k < 10; k++) { shown[k] = false; innerHid[k] = true; } seq = [...shuffle(range(0, 9)).map(k => ['p', k]), ...shuffle(range(0, 9)).map(k => ['i', k]), ['c']]; level = 'Mystery'; draw(); }, 'primary');
    P.buttons([['Reveal next section', () => { if (!seq || !seq.length) return c.toast('Tap Cover everything first'); let st; do { st = seq.shift(); } while (st && ((st[0] === 'i' && !innerHid[st[1]]) || (st[0] === 'p' && shown[st[1]]) || (st[0] === 'c' && !hideCentre))); if (!st) return; if (st[0] === 'i') innerHid[st[1]] = false; else if (st[0] === 'p') shown[st[1]] = true; else hideCentre = false; draw(); }], ['Reveal the centre', () => { hideCentre = false; draw(); }]]);
    P.section('Inner ring');
    P.buttons([['In order', () => { inner = range(1, 10); shown = {}; draw(); }], ['Mix up', () => { inner = shuffle(range(1, 12)).slice(0, 10); shown = {}; draw(); }, 'primary']]);
    P.section('Puzzles');
    P.note('Numbers are hidden around the dial. Work out each missing number, then tap it to check.');
    P.buttons([['Easy', () => puzzle('easy')], ['Medium', () => puzzle('med')]]);
    P.buttons([['Hard', () => puzzle('hard')], ['Extra hard', () => puzzle('xhard'), 'primary']]);
    P.section('Products');
    P.buttons([['Cover all', () => { allShow = false; shown = {}; draw(); }], ['Show all', () => { allShow = true; shown = {}; innerHid = {}; hideCentre = false; level = ''; draw(); }]]);
    draw();
  }
});

tool({
  id: 'column-methods', name: 'Column methods', strand: 'addsub', years: [3, 4, 5, 6], w: 1100, h: 700,
  desc: 'Column addition, subtraction, short and long multiplication and short division, one step at a time, with place value counters alongside.',
  tags: 'column addition subtraction exchange carry borrow formal written method short long multiplication short division bus stop remainder decimals',
  icon: '<path d="M14 10h22M14 20h22M8 20h4M10 18v4M10 30h28M10 38h28"/><path d="M30 6v10" opacity=".4"/>',
  guide: ['Choose the method, then type two numbers or tap a Random size. Adding and subtracting can use decimals with up to two decimal places.', 'Tap Next step (or press the right arrow key) to work through the method one column at a time. Back goes one step back.', 'Place value counters on the right show what is happening in each step: ten counters joining to make one, or one counter breaking into ten.', 'The box at the bottom explains each step in words, so the class can say it together.', 'For short division choose whether the answer has a remainder, a fraction or carries on as a decimal.'],
  mount(c) {
    const { svg, P } = c;
    let op = 'add', aS = '', bS = '', step = 0, showCounters = true, headings = true, remMode = 'r', exch = true;
    c.persist(() => ({ op, aS, bS, step, showCounters, headings, remMode, exch }), s => ({ op, aS, bS, step, showCounters, headings, remMode, exch } = Object.assign({ op, aS, bS, step, showCounters, headings, remMode, exch }, s)));
    const OPS = { add: 'Addition', sub: 'Subtraction', mul: 'Short multiplication', lmul: 'Long multiplication', div: 'Short division' };
    const wg = S('g', {}, svg), cgRoot = S('g', {}, svg), mg = S('g', {}, svg);
    let frames = [], shown = -1, cc = null, ccKey = '', meta = null;
    const sing = p => PV_LONG[p].toLowerCase().replace(/s$/, '');
    const plur = p => PV_LONG[p].toLowerCase();
    const decs = s => (s.split('.')[1] || '').length;
    const fmtN = (n, dp) => big(+(+n).toFixed(dp));
    const parseNum = s => { const t = String(s).replace(/[, ]/g, ''); if (!/^\d*\.?\d+$|^\d+\.?$/.test(t)) return null; return t.replace(/\.$/, ''); };
    // ---------- building the steps ----------
    function build() {
      frames = []; meta = null;
      const A = parseNum(aS), B = parseNum(bS);
      if (A == null || B == null) return;
      const ok = { add: mkAdd, sub: mkSub, mul: mkMul, lmul: mkMul, div: mkDiv }[op](A, B);
      if (ok === false) frames = [];
    }
    const dg = (N, p, lo) => Math.floor(N / 10 ** (p - lo)) % 10;
    const len = N => String(N).length;
    function world() { let id = 0; const cols = {}; return { cols, nid: () => ++id, snap: () => JSON.parse(JSON.stringify(cols)) }; }
    function mkAdd(As, Bs) {
      if (decs(As) > 2 || decs(Bs) > 2) { c.toast('Use up to two decimal places'); return false; }
      if (+As + +Bs >= 1e7) { c.toast('Use smaller numbers'); return false; }
      const r = pvAddSteps(As, Bs);
      meta = { lo: r.lo, hi: r.hi, rows: [['A', 1], ['B', 1], ['ANS', 1], ['CAR', .55]], lines: ['ANS'], dbl: 'CAR', sign: ['B', '+'], dp: r.dp, places: r.places, rc: 'add' };
      frames = r.frames;
    }
    function mkSub(As, Bs) {
      if (decs(As) > 2 || decs(Bs) > 2) { c.toast('Use up to two decimal places'); return false; }
      if (+Bs > +As) { [As, Bs] = [Bs, As]; aS = As; bS = Bs; fA.set(aS); fB.set(bS); c.toast('The bigger number goes on top, so the numbers were swapped'); }
      if (+As >= 1e7) { c.toast('Use smaller numbers'); return false; }
      const r = pvSubSteps(As, Bs);
      meta = { lo: r.lo, hi: r.hi, rows: [['X', .6], ['A', 1], ['B', 1], ['ANS', 1]], lines: ['ANS'], dbl: 'ANSB', sign: ['B', '−'], dp: r.dp, places: r.places, rc: 'sub' };
      frames = r.frames;
    }
    function mkMul(As, Bs) {
      if (As.includes('.') || Bs.includes('.')) { c.toast('Use whole numbers for multiplication'); return false; }
      const A = +As, Bn = +Bs, long = op === 'lmul';
      if (!long && (Bn < 2 || Bn > 12)) { c.toast('For short multiplication the second number should be 2 to 12'); return false; }
      if (long && (Bn < 10 || Bn > 99)) { c.toast('For long multiplication the second number should have 2 digits'); return false; }
      if (A >= 1e6) { c.toast('Use a smaller first number'); return false; }
      const Pd = A * Bn, hi = len(Pd) - 1, hiA = len(A) - 1, items = [], notes = [];
      const parts = range(0, hiA).reverse().map(p => dg(A, p, 0) * 10 ** p), gcells = {}, gtot = {}; let ghl = null, gfinal = null;
      const mults = long ? [Bn % 10, Math.floor(Bn / 10) * 10] : [Bn];
      const gridSnap = () => ({ cols: parts, rows: mults, cells: { ...gcells }, tot: { ...gtot }, hl: ghl, final: gfinal });
      const partLine = m => `${big(A)} × ${big(m)} = ${parts.map(v => `(${big(v)} × ${big(m)})`).join(' + ')}`;
      const valLine = m => `= ${parts.map(v => big(v * m)).join(' + ')} = ${big(A * m)}`;
      for (let p = 0; p <= hiA; p++) items.push({ r: 'A', p, t: String(dg(A, p, 0)) });
      String(Bn).split('').reverse().forEach((d, p) => items.push({ r: 'B', p, t: d }));
      const push = (msg, opt = {}) => { frames.push({ items: items.map(x => ({ ...x })), msg, notes: notes.slice(), grid: gridSnap(), opt }); ghl = null; };
      if (!long) {
        meta = { lo: 0, hi, rows: [['A', 1], ['B', 1], ['ANS', 1], ['CAR', .55]], lines: ['ANS'], dbl: 'CAR', sign: ['B', '×'], places: range(0, hi).reverse() };
        notes.push(partLine(Bn));
        push(`Write ${big(A)} on top and ${Bn} underneath, lined up with the ones. Multiply each digit by ${Bn}, starting with the ones.`);
        let carry = 0;
        for (let p = 0; p <= hiA; p++) {
          const d = dg(A, p, 0), s = d * Bn + carry;
          gcells[`0,${hiA - p}`] = d * 10 ** p * Bn; ghl = `0,${hiA - p}`;
          items.push({ r: 'ANS', p, t: String(s % 10), hot: 1 });
          if (s >= 10 && p < hiA) items.push({ r: 'CAR', p: p + 1, t: String(Math.floor(s / 10)), small: 1, hot: 1 });
          if (p === hiA && s >= 10) { String(Math.floor(s / 10)).split('').reverse().forEach((ch, k) => items.push({ r: 'ANS', p: p + 1 + k, t: ch, hot: 1 })); }
          push(`${PV_LONG[p]}: ${d} × ${Bn} = ${d * Bn}${carry ? `, add the ${carry} carried to make ${s}` : ''}. ${s >= 10 ? (p < hiA ? `Write ${s % 10} in the ${plur(p)} and carry ${Math.floor(s / 10)} into the ${plur(p + 1)}.` : `This is the last digit, so write ${s} in full.`) : `Write ${s} in the ${plur(p)}.`}`, { hl: p });
          carry = Math.floor(s / 10); items.forEach(x => x.hot = 0);
        }
        items.forEach(x => { if (x.r === 'ANS') x.done = 1; });
        notes.push(valLine(Bn)); gtot[0] = Pd; gfinal = Pd;
        push(`${big(A)} × ${Bn} = ${big(Pd)}`, { end: 1 });
        return;
      }
      const b0 = Bn % 10, b1 = Math.floor(Bn / 10), R1 = A * b0, R2 = A * b1 * 10;
      meta = { lo: 0, hi, rows: [['A', 1], ['B', 1], ['R1', 1], ['R2', 1], ['ANS', 1], ['CAR', .55]], lines: ['R1', 'ANS'], dbl: 'CAR', sign: ['B', '×'], plus: 'R2', places: range(0, hi).reverse() };
      notes.push(`${big(A)} × ${Bn} = (${big(A)} × ${b0}) + (${big(A)} × ${b1 * 10})`);
      push(`Write ${big(A)} on top and ${Bn} underneath. First multiply ${big(A)} by the ${b0} ones, then by the ${b1} tens, then add the two answers.`);
      const row = (r, m, shift, label) => {
        const ri = r === 'R1' ? 0 : 1;
        let carry = 0;
        for (let p = 0; p <= hiA; p++) {
          const d = dg(A, p, 0), s = d * m + carry, q = p + shift;
          gcells[`${ri},${hiA - p}`] = d * 10 ** p * m * 10 ** shift; ghl = `${ri},${hiA - p}`;
          items.push({ r, p: q, t: String(s % 10), hot: 1 });
          if (s >= 10 && p < hiA) items.push({ r, p: q + 1, t: String(Math.floor(s / 10)), tiny: 1, hot: 1 });
          if (p === hiA && s >= 10) String(Math.floor(s / 10)).split('').reverse().forEach((ch, k) => items.push({ r, p: q + 1 + k, t: ch, hot: 1 }));
          push(`${label}: ${d} × ${m} = ${d * m}${carry ? `, add the ${carry} carried to make ${s}` : ''}. ${s >= 10 ? (p < hiA ? `Write ${s % 10} and carry ${Math.floor(s / 10)}. The small carried digit goes in the next column.` : `This is the last digit, so write ${s} in full.`) : `Write ${s}.`}`, { hl: q });
          carry = Math.floor(s / 10); items.forEach(x => x.hot = 0);
        }
      };
      row('R1', b0, 0, `Multiply by ${b0}`);
      notes.push(partLine(b0), valLine(b0)); gtot[0] = R1;
      items.push({ r: 'R2', p: 0, t: '0', hot: 1, ph: 1 });
      push(`Now multiply by the ${b1} tens. We are multiplying by ${b1 * 10}, so put a zero in the ones column as a place holder first.`, { hl: 0 });
      items.forEach(x => x.hot = 0);
      row('R2', b1, 1, `Multiply by ${b1} tens`);
      notes.push(partLine(b1 * 10), valLine(b1 * 10)); gtot[1] = R2;
      push(`Now add the two rows: ${big(R1)} + ${big(R2)}.`);
      let carry = 0;
      for (let p = 0; p <= hi; p++) {
        const x1 = dg(R1, p, 0), x2 = dg(R2, p, 0), s = x1 + x2 + carry;
        items.push({ r: 'ANS', p, t: String(s % 10), hot: 1 });
        if (s >= 10) items.push({ r: 'CAR', p: p + 1, t: '1', small: 1, hot: 1 });
        push(`Add the ${plur(p)}: ${x1} + ${x2}${carry ? ' + 1 carried' : ''} = ${s}. ${s >= 10 ? `Write ${s % 10} and carry 1.` : `Write ${s}.`}`, { hl: p });
        carry = s >= 10 ? 1 : 0; items.forEach(x => x.hot = 0);
      }
      items.forEach(x => { if (x.r === 'ANS') x.done = 1; });
      notes.push(`${big(R1)} + ${big(R2)} = ${big(Pd)}`); gfinal = Pd;
      push(`${big(A)} × ${Bn} = ${big(Pd)}`, { end: 1 });
    }
    function mkDiv(As, Bs) {
      if (As.includes('.') || Bs.includes('.')) { c.toast('Use whole numbers for division'); return false; }
      const A = +As, Bn = +Bs;
      if (Bn < 2 || Bn > 12) { c.toast('Divide by a number from 2 to 12'); return false; }
      if (A >= 1e6) { c.toast('Use a smaller number to divide'); return false; }
      const hiA = len(A) - 1, maxDp = remMode === 'dec' ? 3 : 0;
      // work out how many decimal places are needed
      let rr = A % Bn, need = 0; while (remMode === 'dec' && rr && need < maxDp) { rr = rr * 10 % Bn; need++; }
      const lo = -need, items = [];
      meta = { lo, hi: hiA, rows: [['Q', 1], ['D', 1]], div: Bn, places: range(lo, hiA).reverse(), dp: need };
      const W = world(); meta.places.forEach(p => W.cols[p] = []);
      for (let p = 0; p <= hiA; p++) { const d = dg(A, p, 0); items.push({ r: 'D', p, t: String(d) }); for (let k = 0; k < d; k++) W.cols[p].push({ id: W.nid(), kind: 'a' }); }
      const layout = {};
      const push = (msg, opt = {}) => frames.push({ items: items.map(x => ({ ...x })), msg, cols: W.snap(), opt: { ...opt, layout: JSON.parse(JSON.stringify(layout)) } });
      push(`Write ${big(A)} inside the bus stop and ${Bn} outside. Share each column into ${Bn} equal groups, starting with the biggest place value: the ${plur(hiA)}.`);
      let r = 0, started = false, left = [];
      for (let p = hiA; p >= lo; p--) {
        const d = p >= 0 ? dg(A, p, 0) : 0;
        if (p === -1) { items.push({ r: 'D', p, t: '0', grey: 1, hot: 1 }, { r: 'D', dot: 1 }, { r: 'Q', dot: 1 }); }
        else if (p < -1) items.push({ r: 'D', p, t: '0', grey: 1, hot: 1 });
        const spawn = {};
        left.forEach(x => { const i = W.cols[p + 1].findIndex(y => y.id === x); const gone = W.cols[p + 1].splice(i, 1)[0]; for (let j = 0; j < 10; j++) { const nu = { id: W.nid(), kind: 'a' }; spawn[nu.id] = gone.id; W.cols[p].push(nu); } });
        const cur = r * 10 + d, q = Math.floor(cur / Bn), nr = cur % Bn;
        layout[p] = { rows: Bn, per: q, extra: nr };
        const lst = W.cols[p]; left = lst.slice(q * Bn).map(x => x.id); lst.slice(q * Bn).forEach(x => x.ring = true);
        if (q || started || p <= 0) { items.push({ r: 'Q', p, t: String(q), hot: 1 }); started = true; }
        if (nr && p > lo) items.push({ r: 'D', p: p - 1, t: String(nr), tiny: 1, hot: 1 });
        const has = r ? `${cur} ${plur(p)} (${d} and ${r * 10} exchanged)` : `${cur} ${cur === 1 ? sing(p) : plur(p)}`;
        let msg;
        if (!q && !started) msg = `${PV_LONG[p]}: we cannot share ${has} into ${Bn} groups without a remainder of all of them. Exchange the ${cur} ${cur === 1 ? sing(p) : plur(p)} for ${cur * 10} ${plur(p - 1)}, and write a small ${cur} next to the next digit.`;
        else msg = `${PV_LONG[p]}: share ${has} into ${Bn} groups. Each group gets ${q} (${q} × ${Bn} = ${q * Bn})${nr ? `, with ${nr} left over. ${p > lo ? `Exchange the ${nr} left over into the ${plur(p - 1)}.` : ''}` : '.'} Write ${q} above.`;
        if (p === -1) msg = `There is a remainder, so carry on into the decimal places. Put a decimal point after the ones in the answer and in the number, and add a zero. ` + msg;
        push(msg, { hl: p, spawn });
        r = nr; items.forEach(x => x.hot = 0);
      }
      const Q = Math.floor(A / Bn), R = A % Bn;
      if (R && remMode !== 'dec') items.push({ r: 'Q', p: lo - 1, t: remMode === 'r' ? `r ${R}` : `${R}/${Bn}`, wide: 1, hot: 1 });
      items.forEach(x => { if (x.r === 'Q') x.done = 1; });
      const ansTxt = !R ? big(Q) : remMode === 'r' ? `${big(Q)} r ${R}` : remMode === 'frac' ? `${big(Q)} ${R}/${Bn}` : (r ? `${(A / Bn).toFixed(3)}… (it keeps going)` : big(+(A / Bn).toFixed(3)));
      push(`${big(A)} ÷ ${Bn} = ${ansTxt}${R && remMode === 'frac' ? `. The remainder ${R} out of ${Bn} is the fraction ${R}/${Bn}` : ''}`, { end: 1 });
    }
    // ---------- drawing ----------
    function wrapText(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function draw(animate) {
      clear(wg); clear(mg);
      if (!frames.length) { text(wg, 550, 300, 'Type two numbers, or tap a Random size', { 'font-size': 26, fill: 'var(--ink-3)', 'font-weight': 700 }); if (cc) { clear(cgRoot); cc = null; ccKey = ''; } return; }
      step = clamp(step, 0, frames.length - 1);
      const f = frames[step], m = meta, usesCounters = showCounters && ['add', 'sub', 'div'].includes(op), notesPane = ['mul', 'lmul'].includes(op);
      const paneL = usesCounters || notesPane ? 470 : 1080, nCol = m.hi - m.lo + 2 + (op === 'div' ? 2 : 0) + (op === 'div' && remMode !== 'dec' ? 2 : 0);
      const cw = Math.min(64, (paneL - 60) / nCol), fsB = cw * .74;
      const rowH = r => (m.rows.find(x => x[0] === r) || [0, 1])[1] * cw * 1.12;
      let y = 70; const RY = {};
      m.rows.forEach(([r]) => { RY[r] = y; y += rowH(r); });
      const total = op === 'div' ? (m.hi - m.lo + 1 + (remMode !== 'dec' ? 2 : 0)) * cw : nCol * cw;
      const left = (paneL - total) / 2 + (op === 'div' ? cw * 1.5 : 0);
      const X = p => op === 'div' ? left + (m.hi - p) * cw : left + total - (p - m.lo + 1) * cw;
      const yTop = RY[m.rows[0][0]], yBot = y;
      // squared paper
      const gx0 = Math.max(10, left - cw * 2), gx1 = Math.min(paneL, left + total + cw);
      for (let x = gx0; x <= gx1; x += cw / 2) S('line', { x1: x, y1: yTop - 34, x2: x, y2: yBot + 10, stroke: 'var(--line)', 'stroke-width': .6 }, wg);
      for (let yy = yTop - 34; yy <= yBot + 10; yy += cw / 2) S('line', { x1: gx0, y1: yy, x2: gx1, y2: yy, stroke: 'var(--line)', 'stroke-width': .6 }, wg);
      if (f.opt.hl != null && !f.opt.end) S('rect', { x: X(f.opt.hl), y: yTop - 34, width: cw, height: yBot - yTop + 44, rx: 6, fill: 'var(--yellow)', opacity: .28 }, wg);
      if (headings) m.places.forEach(p => text(wg, X(p) + cw / 2, yTop - 18, PV_NAMES[p], { 'font-size': Math.min(17, cw * .36), 'font-weight': 800, fill: col(PVC(p)), cls: 'disp' }));
      const cy = r => RY[r] + rowH(r) / 2;
      // lines and signs
      (m.lines || []).forEach(r => S('line', { x1: X(m.hi) - cw * (m.sign ? 1 : 0) - 4, y1: RY[r] + 2, x2: X(m.lo) + cw + 4, y2: RY[r] + 2, stroke: 'var(--ink)', 'stroke-width': 3 }, wg));
      if (m.dbl) { const yb = m.dbl === 'ANSB' ? RY.ANS + rowH('ANS') : RY[m.dbl]; S('line', { x1: X(m.hi) - cw - 4, y1: yb - 1, x2: X(m.lo) + cw + 4, y2: yb - 1, stroke: 'var(--ink)', 'stroke-width': 3 }, wg); }
      if (m.sign) text(wg, X(m.hi) - cw / 2 - 4, cy(m.sign[0]), m.sign[1], { 'font-size': fsB * .9, 'font-weight': 800, cls: 'disp' });
      if (m.plus && step > 0 && f.items.some(x => x.r === 'R2')) text(wg, X(m.hi) - cw / 2 - 4, cy('R2'), '+', { 'font-size': fsB * .8, 'font-weight': 700, fill: 'var(--ink-3)' });
      if (m.dp) ['A', 'B', 'ANS'].forEach(r => { if (RY[r] != null) S('circle', { cx: X(-1), cy: RY[r] + rowH(r) * .8, r: cw * .08, fill: 'var(--ink)' }, wg); });
      if (op === 'div') {
        const bx = X(m.hi) - 6, by = RY.D + 4;
        S('path', { d: `M${bx - 4} ${by + rowH('D') - 6} Q${bx + 10} ${by + rowH('D') / 2} ${bx} ${by} H${X(m.lo) + cw + 8}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, wg);
        text(wg, bx - cw * .2 - String(m.div).length * fsB * .3, cy('D'), String(m.div), { 'font-size': fsB, 'font-weight': 800, cls: 'disp num', fill: 'var(--purple)' });
      }
      f.items.forEach(it => {
        if (it.dot) { if (m.dp) S('circle', { cx: X(-1), cy: RY[it.r] + rowH(it.r) * .8, r: cw * .08, fill: 'var(--ink)' }, wg); return; }
        const x = X(it.p), fill = it.hot ? 'var(--accent)' : it.done && f.opt.end ? 'var(--green)' : it.grey || it.ph ? 'var(--ink-3)' : 'var(--ink)';
        if (it.tiny) { text(wg, x + cw * .17, RY[it.r] + cw * .2, it.t, { 'font-size': cw * .3, 'font-weight': 800, cls: 'num', fill: it.hot ? 'var(--accent)' : 'var(--red)' }); return; }
        if (it.small) {
          const n = it.of || 1, k = it.sub || 0, xx = x + cw / 2 + (k - (n - 1) / 2) * cw * .42;
          const t = text(wg, xx, cy(it.r), it.t, { 'font-size': cw * .38, 'font-weight': 800, cls: 'num', fill: it.struck ? 'var(--ink-3)' : it.hot ? 'var(--accent)' : 'var(--red)' });
          if (it.struck) S('line', { x1: xx - cw * .2, y1: cy(it.r) + cw * .14, x2: xx + cw * .2, y2: cy(it.r) - cw * .14, stroke: 'var(--red)', 'stroke-width': 2 }, wg);
          return;
        }
        if (it.wide) { text(wg, x + cw * .1, cy(it.r), it.t, { 'font-size': fsB * .8, 'font-weight': 800, cls: 'disp num', fill, 'text-anchor': 'start' }); return; }
        text(wg, x + cw / 2, cy(it.r), it.t, { 'font-size': fsB, 'font-weight': 800, cls: 'disp num', fill });
        if (it.struck) S('line', { x1: x + cw * .18, y1: cy(it.r) + cw * .3, x2: x + cw * .82, y2: cy(it.r) - cw * .3, stroke: 'var(--red)', 'stroke-width': 3 }, wg);
      });
      // explanation box
      const lines = wrapText(f.msg, f.opt.end ? 60 : 92), bh = 26 + lines.length * 27, by = 690 - bh;
      S('rect', { x: 20, y: by, width: 1060, height: bh, rx: 16, fill: f.opt.end ? 'var(--green-s)' : 'var(--board-2)', stroke: f.opt.end ? 'var(--green)' : 'var(--line-2)', 'stroke-width': 2 }, mg);
      lines.forEach((l, i) => text(mg, 550, by + 26 + i * 27, l, { 'font-size': f.opt.end ? 26 : 19, 'font-weight': f.opt.end ? 800 : 600, cls: f.opt.end ? 'disp num' : 'num' }));
      text(mg, 1070, by - 14, `Step ${step + 1} of ${frames.length}`, { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'end' });
      // counters or notes pane
      const key = op + '|' + m.places.join(',') + '|' + usesCounters;
      if (usesCounters && op !== 'div') {
        const rows = op === 'add' ? [{ key: 'A', label: 'First' }, { key: 'B', label: 'Second', sign: '+' }, { key: 'T', label: 'Total', total: true }] : [{ key: 'A', label: 'Start' }, { key: 'B', label: 'Take', sign: '−' }, { key: 'T', label: 'Left', total: true }];
        if (ccKey !== key) { clear(cgRoot); cc = RowChart(c, cgRoot, { x: 480, y: 14, w: 600, h: Math.min(480, by - 26), places: m.places, rows, labelW: 62, digitsH: 28 }); ccKey = key; animate = false; }
        cc.set(f.state, Object.assign({}, animate ? f.opt : { instant: true }, { hl: f.opt.end ? null : f.opt.hl, hot: f.opt.hot }));
      } else if (usesCounters) {
        if (ccKey !== key) { clear(cgRoot); cc = CounterChart(c, cgRoot, { x: 490, y: 20, w: 590, h: Math.min(430, by - 40), places: m.places, long: false }); ccKey = key; animate = false; }
        cc.set(f.cols, Object.assign({}, animate ? f.opt : { instant: true, layout: f.opt.layout }, { hl: f.opt.end ? null : f.opt.hl }));
      } else { if (cc) { clear(cgRoot); cc = null; ccKey = ''; } }
      if (notesPane && f.grid) {
        const G = f.grid, nC = G.cols.length, nR = G.rows.length, gx = 494, gw = 580, hw = 74, tw = 112, cwG = Math.min(120, (gw - hw - tw) / nC), chG = 54, gy = 40;
        text(mg, gx, gy - 14, 'Grid method', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'start', fill: 'var(--ink-3)', cls: 'disp' });
        const cellG = (x, y, w, h, t, fill, bold, hot) => { S('rect', { x, y, width: w, height: h, fill: hot ? 'var(--yellow)' : fill, stroke: 'var(--ink)', 'stroke-width': 2 }, mg); if (t !== '') text(mg, x + w / 2, y + h / 2 + 1, t, { 'font-size': Math.min(24, w * 2.2 / Math.max(3, t.length)), 'font-weight': bold ? 800 : 700, cls: 'disp num' }); };
        cellG(gx, gy, hw, chG, '×', 'var(--board-2)', true);
        G.cols.forEach((v, j) => cellG(gx + hw + j * cwG, gy, cwG, chG, big(v), 'var(--board-2)', true));
        G.rows.forEach((mv, i) => {
          const y2 = gy + chG * (i + 1); cellG(gx, y2, hw, chG, big(mv), 'var(--board-2)', true);
          G.cols.forEach((v, j) => { const k = `${i},${j}`, val = G.cells[k]; cellG(gx + hw + j * cwG, y2, cwG, chG, val != null ? big(val) : '', val != null ? 'var(--blue-s)' : 'var(--board)', false, G.hl === k); });
          if (G.tot[i] != null) text(mg, gx + hw + nC * cwG + 12, y2 + chG / 2, '= ' + big(G.tot[i]), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'start', cls: 'num', fill: 'var(--accent)' });
        });
        if (G.final != null) text(mg, gx + hw + nC * cwG + 12, gy + chG * (nR + 1) + 24, (nR > 1 ? 'Total ' : '') + big(G.final), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'start', cls: 'num', fill: 'var(--green)' });
        const ny = gy + chG * (nR + 1) + 64;
        text(mg, gx, ny, 'Partitioning check', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp', fill: 'var(--ink-3)' });
        (f.notes || []).forEach((n, i) => text(mg, gx, ny + 32 + i * 30, n, { 'font-size': n.length > 52 ? 15 : 18, 'font-weight': i === f.notes.length - 1 && f.opt.end ? 800 : 600, 'text-anchor': 'start', cls: 'num', fill: i === f.notes.length - 1 && f.opt.end ? 'var(--accent)' : 'var(--ink)' }));
      }
      shown = step;
    }
    function go(d) { if (!frames.length) return; const ns = clamp(step + d, 0, frames.length - 1); if (ns === step) return; step = ns; draw(d === 1); }
    function rebuild(keepStep) { build(); if (!keepStep) step = 0; ccKey = ''; draw(false); }
    // ---------- random ----------
    function randomize(size) {
      const nd = size === 'dec' ? 3 : size;
      const R = n => rnd(10 ** (n - 1), 10 ** n - 1);
      let a, b, tries = 0;
      const needEx = (x, y, add) => { if (!exch) return true; const s1 = String(x), s2 = String(y); const dp = Math.max(decs(s1), decs(s2)); const X1 = Math.round(x * 10 ** dp), Y1 = Math.round(y * 10 ** dp); for (let k = 0; k < 7; k++) { const d1 = Math.floor(X1 / 10 ** k) % 10, d2 = Math.floor(Y1 / 10 ** k) % 10; if (add ? d1 + d2 >= 10 : d1 < d2) return true; } return false; };
      do {
        tries++;
        if (op === 'add' || op === 'sub') {
          if (size === 'dec') { const dpA = rnd(1, 2), dpB = rnd(1, 2); a = +(R(rnd(3, 4)) / 10 ** dpA).toFixed(dpA); b = +(R(rnd(2, 3)) / 10 ** dpB).toFixed(dpB); }
          else { a = R(nd); b = R(rnd(Math.max(1, nd - 1), nd)); }
          if (op === 'sub' && b > a) [a, b] = [b, a];
        } else if (op === 'mul') { a = R(Math.min(nd, 5)); b = rnd(3, 9); }
        else if (op === 'lmul') { a = R(Math.min(Math.max(nd, 2), 4)); b = rnd(12, 98); }
        else { b = rnd(2, 9); a = R(Math.max(2, Math.min(nd, 5))); if (remMode !== 'dec' && Math.random() < .5) a -= a % b; if (!a) a = b * 12; }
      } while ((op === 'add' || op === 'sub') && !needEx(a, b, op === 'add') && tries < 60);
      aS = String(a); bS = String(b); fA.set(aS); fB.set(bS); rebuild();
    }
    // ---------- panel ----------
    P.section('Method');
    const opSeg = P.seg({ options: Object.entries(OPS), value: op, onChange: v => { op = v; remBits.forEach(e => e.hidden = v !== 'div'); exBits.forEach(e => e.hidden = !['add', 'sub'].includes(v)); ctrBits.forEach(e => e.hidden = !['add', 'sub', 'div'].includes(v)); randomize(3); } });
    P.section('Numbers');
    const fA = P.field({ label: 'First number', value: aS, live: false, onChange: v => { aS = v.trim(); rebuild(); } });
    const fB = P.field({ label: 'Second number', value: bS, live: false, onChange: v => { bS = v.trim(); rebuild(); } });
    P.seg({ label: 'Random', options: [[2, '2 digits'], [3, '3 digits'], [4, '4 digits'], [5, '5 digits'], ['dec', 'Decimals']], value: null, retrigger: true, onChange: v => { if (v === 'dec' && !['add', 'sub'].includes(op)) return c.toast('Decimals are for adding and subtracting'); randomize(v); } });
    const dock = () => [...svg.closest('.work').querySelector('.dock').children];
    let before = new Set(dock());
    P.toggle({ label: 'Random numbers need exchanging', value: exch, onChange: v => exch = v });
    const exBits = dock().filter(k => !before.has(k)); before = new Set(dock());
    P.seg({ label: 'Answer for short division', options: [['r', 'Remainder'], ['frac', 'Fraction'], ['dec', 'Decimal']], value: remMode, onChange: v => { remMode = v; rebuild(); } });
    const remBits = dock().filter(k => !before.has(k));
    P.section('Steps');
    P.buttons([['◀  Back', () => go(-1)], ['Next step  ▶', () => go(1), 'primary']]);
    c.pulseWhen(c.btn('Next step  ▶'), () => frames.length && step < frames.length - 1);
    P.buttons([['Start again', () => { step = 0; draw(false); }], ['Show the answer', () => { step = frames.length - 1; draw(false); }]]);
    P.section('Show');
    before = new Set(dock());
    P.toggle({ label: 'Place value counters', value: showCounters, onChange: v => { showCounters = v; ccKey = ''; draw(false); } });
    const ctrBits = dock().filter(k => !before.has(k));
    P.toggle({ label: 'Column headings', value: headings, onChange: v => { headings = v; draw(false); } });
    remBits.forEach(e => e.hidden = op !== 'div'); exBits.forEach(e => e.hidden = !['add', 'sub'].includes(op)); ctrBits.forEach(e => e.hidden = !['add', 'sub', 'div'].includes(op));
    const key = e => { if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return; if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } };
    window.addEventListener('keydown', key); c.onClean(() => window.removeEventListener('keydown', key));
    if (aS && bS) { build(); draw(false); } else { draw(false); }
  }
});

tool({
  id: 'bar-model', name: 'Bar model', strand: 'addsub', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Build bar models for word problems: part–whole, comparison and equal parts, with labels, unknowns and braces.',
  tags: 'bar model singapore part whole comparison word problem reasoning fractions of amounts tape diagram',
  icon: '<rect x="4" y="12" width="40" height="10" rx="2"/><path d="M20 12v10M32 12v10"/><rect x="4" y="28" width="26" height="10" rx="2"/><path d="M4 8q20 -6 40 0"/>',
  guide: ['Type the word problem in the panel so it shows at the top of the board, or start from a ready-made model.', 'Tap any part of a bar to label it, colour it, split it into equal parts, add another part or mark it as the unknown with a question mark.', 'Drag the round handle on the right of a part to make it longer or shorter. Parts snap to whole units so equal parts stay equal.', 'Tap the brace label above a bar to write the whole. Turn on Difference to show how much more one bar is than another.', 'Save the model with Boards to use it again or share it as a link.'],
  mount(c) {
    const { svg, P, wrap } = c;
    const COLS = ['blue', 'orange', 'green', 'purple', 'pink', 'yellow', 'teal', 'red'];
    let question = '', bars = [], diff = { on: false, t: '?' }, grid = false, sol = null, solShown = false, lvl = 100;
    c.persist(() => ({ question, bars, diff, grid, sol, solShown, lvl }), s => ({ question, bars, diff, grid, sol, solShown, lvl } = Object.assign({ question, bars, diff, grid, sol, solShown, lvl }, s)));
    const g = S('g', {}, svg), hg = S('g', {}, svg);
    let sel = null, geoCache = null;
    const ed = H('div', { cls: 'bmed', hidden: true }); wrap.append(ed);
    const T = {
      pw: () => [{ label: '', parts: [{ w: 6, t: '', c: 'blue' }, { w: 4, t: '', c: 'orange' }], total: { on: true, t: '?' } }],
      pw3: () => [{ label: '', parts: [{ w: 4, t: '', c: 'blue' }, { w: 3, t: '', c: 'orange' }, { w: 3, t: '?', c: 'green', unk: true }], total: { on: true, t: '' } }],
      cmp: () => [{ label: 'A', parts: [{ w: 8, t: '', c: 'blue' }], total: { on: false, t: '' } }, { label: 'B', parts: [{ w: 5, t: '', c: 'orange' }], total: { on: false, t: '' } }],
      eq: () => [{ label: '', parts: Array.from({ length: 5 }, (_, i) => ({ w: 2, t: '', c: i < 3 ? 'purple' : 'purple', shade: i >= 3 })), total: { on: true, t: '' } }],
      mul: () => [{ label: '', parts: [{ w: 3, t: '', c: 'green' }], total: { on: false, t: '' } }, { label: '', parts: Array.from({ length: 4 }, () => ({ w: 3, t: '', c: 'teal' })), total: { on: true, t: '?' } }],
    };
    const units = b => b.parts.reduce((s, p) => s + p.w, 0);
    function geo() {
      const qLines = wrapQ(); const top = 30 + (qLines.length ? qLines.length * 34 + 30 : 0);
      const maxU = Math.max(10, ...bars.map(units)), X0 = 200, Wd = 830, U = Wd / maxU, BH = Math.min(78, Math.max(48, (640 - top - (diff.on ? 70 : 20)) / Math.max(bars.length, 1) - 64));
      const rows = []; let y = top + 54;
      bars.forEach(b => { rows.push(y); y += BH + 62; });
      return { top, X0, U, BH, rows, qLines, maxU };
    }
    function wrapQ() { if (!question.trim()) return []; const out = []; question.split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > 72) { out.push(line.trim()); line = w; } else line += ' ' + w; }); out.push(line.trim()); }); return out.slice(0, 5); }
    function brace(x1, x2, y, up, label, onTap, cl = 'var(--ink-2)') {
      const m = (x1 + x2) / 2, d = up ? -1 : 1, h = 14;
      S('path', { d: `M${x1} ${y} q0 ${d * h} ${h} ${d * h} H${m - h} q${h} 0 ${h} ${d * h} q0 ${-d * h} ${h} ${-d * h} H${x2 - h} q${h} 0 ${h} ${-d * h}`, fill: 'none', stroke: cl, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
      const ly = y + d * (h * 2 + 18), t = label || 'tap to label', bw = Math.max(70, t.length * 13 + 26);
      const b = S('g', { cls: 'hit' }, g);
      S('rect', { x: m - bw / 2, y: ly - 18, width: bw, height: 36, rx: 12, fill: label ? 'var(--board)' : 'transparent', stroke: label ? cl : 'var(--line-2)', 'stroke-width': 2, 'stroke-dasharray': label ? null : '5 4' }, b);
      text(b, m, ly + 1, t, { 'font-size': label ? 22 : 14, 'font-weight': 800, cls: 'disp num', fill: label ? 'var(--ink)' : 'var(--ink-3)' });
      b.addEventListener('click', e => { e.stopPropagation(); onTap(b); });
    }
    function draw() {
      clear(g); clear(hg); geoCache = geo(); const { X0, U, BH, rows, qLines } = geoCache;
      qLines.forEach((l, i) => text(g, 550, 40 + i * 34, l, { 'font-size': 24, 'font-weight': 700, cls: 'num' }));
      if (!bars.length) { text(g, 550, 330, 'Choose a model to start, or tap Add a bar', { 'font-size': 26, 'font-weight': 700, fill: 'var(--ink-3)' }); return; }
      if (grid) { const y0 = rows[0] - 20, y1 = rows[rows.length - 1] + BH + 20; for (let u = 0; u <= geoCache.maxU; u++) S('line', { x1: X0 + u * U, y1: y0, x2: X0 + u * U, y2: y1, stroke: 'var(--line)', 'stroke-dasharray': '3 5' }, g); }
      bars.forEach((b, bi) => {
        const y = rows[bi]; let x = X0;
        // row label
        const lb = S('g', { cls: 'hit' }, g);
        S('rect', { x: 20, y: y + BH / 2 - 22, width: 160, height: 44, rx: 12, fill: b.label ? 'var(--board-2)' : 'transparent', stroke: b.label ? 'var(--line-2)' : 'var(--line)', 'stroke-dasharray': b.label ? null : '5 4' }, lb);
        text(lb, 100, y + BH / 2 + 1, b.label || 'name', { 'font-size': b.label ? 22 : 14, 'font-weight': 800, fill: b.label ? 'var(--ink)' : 'var(--ink-3)', cls: 'disp' });
        lb.addEventListener('click', e => { e.stopPropagation(); openEd({ bi, kind: 'label' }, lb); });
        b.parts.forEach((pt, pi) => {
          const w = pt.w * U, isSel = sel && sel.bi === bi && sel.pi === pi;
          const pg = S('g', { cls: 'hit' }, g);
          S('rect', { x, y, width: w, height: BH, fill: pt.unk ? 'var(--board)' : col(pt.c + '-s'), stroke: col(pt.c), 'stroke-width': isSel ? 5 : 3, 'stroke-dasharray': pt.unk ? '9 6' : null }, pg);
          if (pt.shade) S('rect', { x: x + 3, y: y + 3, width: w - 6, height: BH - 6, fill: col(pt.c), opacity: .55 }, pg);
          const lab = pt.unk ? (pt.t || '?') : pt.t;
          if (lab) text(pg, x + w / 2, y + BH / 2 + 1, lab, { 'font-size': Math.min(BH * .42, w * 1.6 / Math.max(lab.length, 1), 30), 'font-weight': 800, cls: 'disp num', fill: pt.unk ? col(pt.c) : 'var(--ink)' });
          else if (w > 70 && !isSel) text(pg, x + w / 2, y + BH / 2 + 1, 'tap to type', { 'font-size': 13, fill: 'var(--ink-3)', opacity: .8 });
          pg.addEventListener('click', e => { e.stopPropagation(); sel = { bi, pi }; openEd({ bi, pi, kind: 'part' }, pg); draw(); });
          // resize handle
          const hx = x + w, hy = y + BH / 2, hd = S('g', { cls: 'grab' }, hg);
          S('circle', { cx: hx, cy: hy, r: 11, fill: 'var(--board)', stroke: col(pt.c), 'stroke-width': 3 }, hd);
          S('path', { d: `M${hx - 3} ${hy - 5} v10 M${hx + 3} ${hy - 5} v10`, stroke: col(pt.c), 'stroke-width': 2 }, hd);
          let x0;
          c.drag(hd, { start: () => { x0 = X0 + b.parts.slice(0, pi).reduce((s, q) => s + q.w, 0) * U; closeEd(); }, move: p => { const nw = Math.max(1, Math.round((p.x - x0) / U)); if (nw !== pt.w) { pt.w = nw; draw(); } } });
          x += w;
        });
        // add part button
        const ab = S('g', { cls: 'hit' }, hg);
        S('circle', { cx: x + 30, cy: y + BH / 2, r: 16, fill: 'var(--board-2)', stroke: 'var(--line-2)', 'stroke-width': 2 }, ab); text(ab, x + 30, y + BH / 2 + 1, '+', { 'font-size': 24, 'font-weight': 800, fill: 'var(--ink-2)' });
        ab.addEventListener('click', e => { e.stopPropagation(); const last = b.parts[b.parts.length - 1]; b.parts.push({ w: last ? last.w : 3, t: '', c: COLS[(b.parts.length + bi) % COLS.length] }); draw(); });
        if (b.total.on) brace(X0, x, y - 6, true, b.total.t, el => openEd({ bi, kind: 'total' }, el));
      });
      if (diff.on && bars.length >= 2) {
        const e1 = X0 + units(bars[0]) * U, e2 = X0 + units(bars[1]) * U, y = rows[1] + BH + 8;
        if (Math.abs(e1 - e2) > 4) { S('line', { x1: Math.min(e1, e2), y1: rows[0], x2: Math.min(e1, e2), y2: y, stroke: 'var(--red)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g); brace(Math.min(e1, e2), Math.max(e1, e2), y, false, diff.t, el => openEd({ kind: 'diff' }, el), 'var(--red)'); }
      }
      if (sol && solShown) { const w = Math.min(1000, sol.length * 11 + 60); S('rect', { x: 550 - w / 2, y: 610, width: w, height: 50, rx: 16, fill: 'var(--green)' }, g); text(g, 550, 636, sol, { 'font-size': 20, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
    }
    // ---------- floating editor ----------
    function closeEd() { ed.hidden = true; if (sel) { sel = null; draw(); } }
    function openEd(target, el) {
      clear(ed); ed.hidden = false;
      const r = el.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      let get, setT;
      if (target.kind === 'part') { const pt = bars[target.bi].parts[target.pi]; get = () => pt.t; setT = v => pt.t = v; }
      else if (target.kind === 'label') { const b = bars[target.bi]; get = () => b.label; setT = v => b.label = v; }
      else if (target.kind === 'total') { const b = bars[target.bi]; get = () => b.total.t; setT = v => b.total.t = v; }
      else { get = () => diff.t; setT = v => diff.t = v; }
      const inp = H('input', { type: 'text', value: get() || '', placeholder: target.kind === 'label' ? 'Name' : 'e.g. 45 or ?', 'aria-label': 'Label', maxlength: 24 });
      inp.addEventListener('input', () => { setT(inp.value); draw(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') closeEd(); });
      const btn = (t, fn, title, cls) => H('button', { text: t, title: title || t, cls: cls || '', on: { click: e => { e.stopPropagation(); fn(); } } });
      ed.append(inp);
      if (target.kind === 'part') {
        const b = bars[target.bi], pt = b.parts[target.pi];
        const row1 = H('div', { cls: 'r' });
        row1.append(btn('?', () => { pt.unk = !pt.unk; if (pt.unk && !pt.t) { pt.t = '?'; inp.value = '?'; } draw(); }, 'Mark as the unknown'));
        row1.append(btn('Shade', () => { pt.shade = !pt.shade; draw(); }, 'Shade this part'));
        const sp = H('span', { cls: 'spl' }, H('span', { text: 'Split into' }));
        [2, 3, 4, 5, 10].forEach(n => sp.append(btn(String(n), () => { const nw = pt.w / n; if (nw < 1 && Math.abs(nw * 2 - Math.round(nw * 2)) > 1e-6) { /* allow fractional */ } const parts = Array.from({ length: n }, () => ({ w: +(pt.w / n).toFixed(4), t: '', c: pt.c, shade: pt.shade })); b.parts.splice(target.pi, 1, ...parts); closeEd(); draw(); }, `Split into ${n} equal parts`)));
        const sw = H('div', { cls: 'sw' }); COLS.forEach(cl => sw.append(H('button', { cls: 'dot', style: `background:var(--${cl})`, 'aria-label': cl, on: { click: e => { e.stopPropagation(); pt.c = cl; draw(); } } })));
        const row2 = H('div', { cls: 'r' }, btn('Join next', () => { const nx = b.parts[target.pi + 1]; if (!nx) return c.toast('There is no part to the right'); pt.w += nx.w; b.parts.splice(target.pi + 1, 1); closeEd(); draw(); }, 'Join with the part on the right'), btn('Delete', () => { b.parts.splice(target.pi, 1); if (!b.parts.length) bars.splice(target.bi, 1); closeEd(); draw(); }, 'Delete this part', 'danger'));
        ed.append(row1, sp, sw, row2);
      }
      if (target.kind === 'label') ed.append(H('div', { cls: 'r' }, btn('Move up', () => { const i = target.bi; if (i > 0) { [bars[i - 1], bars[i]] = [bars[i], bars[i - 1]]; closeEd(); draw(); } }), btn('Delete bar', () => { bars.splice(target.bi, 1); closeEd(); draw(); }, 'Delete this bar', 'danger')));
      if (target.kind === 'total') ed.append(H('div', { cls: 'r' }, btn('Hide brace', () => { bars[target.bi].total.on = false; closeEd(); draw(); })));
      ed.append(H('button', { cls: 'done', text: 'Done', on: { click: e => { e.stopPropagation(); closeEd(); } } }));
      const ew = 300; let left = r.left - wr.left + r.width / 2 - ew / 2, top = r.bottom - wr.top + 10;
      left = clamp(left, 8, wr.width - ew - 8); if (top + 220 > wr.height) top = Math.max(8, r.top - wr.top - 230);
      ed.style.left = left + 'px'; ed.style.top = top + 'px';
      setTimeout(() => inp.focus(), 30);
    }
    svg.addEventListener('click', () => closeEd());
    // ---------- panel ----------

    // ---------- random worked problems ----------
    const NM = ['Amy', 'Ben', 'Cara', 'Dev', 'Ella', 'Finn', 'Grace', 'Hari', 'Isla', 'Jay', 'Kai', 'Lily', 'Mo', 'Noor', 'Olly', 'Priya', 'Sam', 'Zara'];
    const ITEM = ['stickers', 'marbles', 'cards', 'sweets', 'stamps', 'beads', 'shells', 'books'];
    const unk = (w, c2, ans) => ({ w, t: '?', c: c2, unk: true, ans });
    const part = (w, t, c2) => ({ w, t: String(t), c: c2 });
    const GEN = {
      add() { const [a, b] = shuffle(NM), it = ITEM[rnd(0, 7)], x = rnd(lvl / 10 + 2, lvl * .6 | 0), y = rnd(lvl / 10 + 2, lvl * .6 | 0); return { q: `${a} has ${x} ${it}. ${b} has ${y} ${it}. How many ${it} do they have altogether?`, bars: [{ label: '', parts: [part(x, x, 'blue'), part(y, y, 'orange')], total: { on: true, t: '?', ans: x + y } }], sol: `${x} + ${y} = ${x + y} ${it}` }; },
      sub() { const it = ITEM[rnd(0, 7)], tot = rnd(lvl * .4 | 0, lvl), x = rnd(tot * .2 | 0 || 1, tot * .7 | 0); return { q: `There are ${tot} ${it} in a box. ${x} are red and the rest are blue. How many are blue?`, bars: [{ label: '', parts: [part(x, x, 'red'), unk(tot - x, 'blue', tot - x)], total: { on: true, t: String(tot) } }], sol: `${tot} − ${x} = ${tot - x} blue ${it}` }; },
      cmp() { const [a, b] = shuffle(NM), it = ITEM[rnd(0, 7)], x = rnd(lvl * .4 | 0, lvl * .9 | 0), d = rnd(Math.max(2, lvl * .08 | 0), x * .6 | 0), more = Math.random() < .5; if (more) return { q: `${a} has ${x} ${it}. ${b} has ${d} more than ${a}. How many ${it} does ${b} have?`, bars: [{ label: a, parts: [part(x, x, 'blue')], total: { on: false, t: '' } }, { label: b, parts: [part(x, '', 'orange'), part(d, d, 'orange')], total: { on: true, t: '?', ans: x + d } }], diff: false, sol: `${x} + ${d} = ${x + d} ${it}` }; return { q: `${a} has ${x} ${it}. ${b} has ${d} fewer than ${a}. How many ${it} does ${b} have?`, bars: [{ label: a, parts: [part(x, x, 'blue')], total: { on: false, t: '' } }, { label: b, parts: [unk(x - d, 'orange', x - d)], total: { on: false, t: '' } }], diff: String(d), sol: `${x} − ${d} = ${x - d} ${it}` }; },
      mul() { const n = rnd(2, 5), p = rnd(2, Math.max(3, lvl / n / 2 | 0)), [a, b] = ['A pencil', 'A pen'], money = lvl >= 100; const u = money ? 'p' : ''; return { q: money ? `${a} costs ${p}p. ${b} costs ${n} times as much. How much does ${b.toLowerCase()} cost?` : `${NM[rnd(0, 17)]} has ${p} ${ITEM[1]}. ${NM[rnd(0, 17)]} has ${n} times as many. How many is that?`, bars: [{ label: money ? 'pencil' : 'first', parts: [part(p, p + u, 'green')], total: { on: false, t: '' } }, { label: money ? 'pen' : 'second', parts: Array.from({ length: n }, () => part(p, p + u, 'teal')), total: { on: true, t: '?', ans: n * p + u } }], sol: `${n} × ${p} = ${n * p}${u}` }; },
      frac() { const d = [2, 3, 4, 5, 6, 8, 10][rnd(0, lvl >= 100 ? 6 : 3)], nn = rnd(1, d - 1), each = rnd(2, Math.max(3, lvl / d | 0)), tot = d * each, it = ITEM[rnd(0, 7)]; return { q: `There are ${tot} ${it}. ${nn}/${d} of them are shiny. How many are shiny?`, bars: [{ label: '', parts: Array.from({ length: d }, (_, i) => ({ w: 2, t: '', c: 'purple', shade: i < nn, ans: String(each) })), total: { on: true, t: String(tot) } }], sol: `${tot} ÷ ${d} = ${each}, so ${nn}/${d} is ${nn} × ${each} = ${nn * each}` }; },
      ratio() { const [a, b] = shuffle(NM), k = rnd(2, 4), u = rnd(2, Math.max(3, lvl / (k + 1) / 2 | 0)), tot = u * (k + 1), it = ITEM[rnd(0, 7)]; return { q: `${a} and ${b} share ${tot} ${it}. ${b} gets ${k} times as many as ${a}. How many does ${a} get?`, bars: [{ label: a, parts: [unk(3, 'blue', u)], total: { on: false, t: '' } }, { label: b, parts: Array.from({ length: k }, () => ({ w: 3, t: '', c: 'orange', ans: String(u) })), total: { on: false, t: '' } }], whole: tot, sol: `${tot} ÷ ${k + 1} parts = ${u}, so ${a} gets ${u}` }; },
    };
    function randomProblem(type) {
      const t = type === 'any' ? shuffle(Object.keys(GEN))[0] : type, r = GEN[t]();
      question = r.q; qf.set(question); bars = r.bars; sol = r.sol; solShown = false;
      bars.forEach(b => { const u = b.parts.reduce((s2, p) => s2 + p.w, 0); if (u < 6) { const f = 6 / u; b.parts.forEach(p => p.w = +(p.w * f).toFixed(3)); } });
      const maxU = Math.max(...bars.map(units)); if (maxU > 40) { const f = 40 / maxU; bars.forEach(b => b.parts.forEach(p => p.w = +(p.w * f).toFixed(3))); }
      diff = r.diff ? { on: true, t: r.diff } : { on: false, t: '?' }; dT.set(diff.on, true);
      if (r.whole) question += `  (${r.whole} altogether)`;
      closeEd(); draw();
    }
    function reveal() {
      if (!sol) return c.toast('Choose a random problem first');
      bars.forEach(b => { b.parts.forEach(p => { if (p.ans != null) { p.t = String(p.ans); } }); if (b.total.ans != null) b.total.t = String(b.total.ans); });
      solShown = true; draw();
    }
    P.section('Make your own model');
    let mkBars = 2, mkParts = 3;
    P.stepper({ label: 'Bars', value: mkBars, min: 1, max: 5, onChange: v => mkBars = v });
    P.stepper({ label: 'Equal parts in each bar', value: mkParts, min: 1, max: 10, onChange: v => mkParts = v });
    P.buttons([['Make the bars', () => { bars = Array.from({ length: mkBars }, (_, k) => ({ label: '', parts: Array.from({ length: mkParts }, () => ({ w: Math.max(1, Math.round(24 / mkParts)), t: '', c: COLS[k % COLS.length] })), total: { on: true, t: '' } })); sol = null; diff.on = false; dT.set(false, true); question = ''; qf.set(''); closeEd(); draw(); }, 'primary'], ['Add a bar', () => { if (bars.length >= 5) return c.toast('Five bars is the most'); bars.push({ label: '', parts: [{ w: 5, t: '', c: COLS[bars.length % COLS.length] }], total: { on: false, t: '' } }); draw(); }]]);
    P.button('Clear', () => { bars = []; sol = null; diff.on = false; dT.set(false, true); closeEd(); draw(); });
    P.note('Tap any box to type a number or word in it. Tap + at the end of a bar to add a part, and drag the round handles to make parts longer or shorter.');
    const qf = P.field({ label: 'Word problem shown at the top (optional)', value: question, multiline: true, onChange: v => { question = v; draw(); } });
    P.section('Ready-made models');
    P.seg({ options: [['pw', 'Part–whole'], ['pw3', '3 parts'], ['cmp', 'Comparison'], ['eq', 'Equal parts'], ['mul', 'Times as many']], value: null, retrigger: true, onChange: k => { bars = T[k](); sol = null; diff.on = k === 'cmp'; dT.set(diff.on, true); closeEd(); draw(); } });
    P.section('Problems to work through');
    P.seg({ label: 'Numbers up to', options: [[20, '20'], [100, '100'], [1000, '1,000']], value: lvl, onChange: v => lvl = v });
    P.seg({ options: [['add', 'Altogether'], ['sub', 'Find a part'], ['cmp', 'More or fewer'], ['mul', 'Times as many'], ['frac', 'Fraction of'], ['ratio', 'Sharing'], ['any', 'Any']], value: null, retrigger: true, onChange: randomProblem });
    P.button('Reveal the answer', reveal);
    P.section('Show');
    P.toggle({ label: 'Brace for the whole on each bar', value: bars.some(b => b.total.on), onChange: v => { bars.forEach(b => b.total.on = v); draw(); } });
    const dT = P.toggle({ label: 'Difference between bars 1 and 2', value: diff.on, onChange: v => { diff.on = v; draw(); } });
    P.toggle({ label: 'Unit grid', value: grid, onChange: v => { grid = v; draw(); } });
    draw();
  }
});

tool({
  id: 'counting-stick', name: 'Counting stick', strand: 'muldiv', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'A counting stick for counting in steps and times tables, with numbers to hide and reveal, jumps, and the value shown as counters, Dienes or money.',
  tags: 'counting stick times tables multiples count in steps jumps dienes money counters',
  icon: '<rect x="2" y="20" width="44" height="8" rx="2"/><path d="M6 20v8M10.4 20v8M14.8 20v8M19.2 20v8M23.6 20v8M28 20v8M32.4 20v8M36.8 20v8M41.2 20v8" opacity=".5"/><path d="M8 16q4-6 8 0M16 16q4-6 8 0"/>',
  guide: ['Choose the step to count in. The stick has ten sections, from 0 to ten steps.', 'Tap a number card to hide or show it. Hide some numbers and ask the class to work them out from the ones they can see.', 'Tap a mark on the stick, or use Count on and Count back, to jump along. The jumps are drawn above the stick.', 'Underneath, the number at the arrow is shown as counters in equal groups, Dienes blocks, or money, so the class can see what the multiple means.'],
  mount(c) {
    const { svg, P } = c;
    let step = 3, at = 0, hidden = {}, vis = 'counters', facts = true, dir = 1, jumps = [];
    c.persist(() => ({ step, at, hidden, vis, facts, dir }), s => ({ step, at, hidden, vis, facts, dir } = Object.assign({ step, at, hidden, vis, facts, dir }, s)));
    const g = S('g', {}, svg), vg = S('g', {}, svg);
    const X0 = 90, X1 = 1010, SY = 190, X = k => X0 + k * (X1 - X0) / 10;
    const val = k => +(k * step).toFixed(4);
    const fmt = v => step < 1 && step >= .01 ? nf(v) : big(v);
    let playT = null;
    function draw() {
      clear(g);
      const k0 = dir > 0 ? 0 : 10;
      // stick
      for (let k = 0; k < 10; k++) S('rect', { x: X(k), y: SY - 20, width: X(k + 1) - X(k), height: 40, fill: k % 2 ? 'var(--yellow)' : 'var(--blue)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      S('rect', { x: X0 - 4, y: SY - 22, width: X1 - X0 + 8, height: 44, rx: 8, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      // jumps
      jumps.forEach(([a, b]) => { const xa = X(a), xb = X(b), m = (xa + xb) / 2; S('path', { d: `M${xa} ${SY - 26} Q${m} ${SY - 70} ${xb} ${SY - 26}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }, g); text(g, m, SY - 60, (b > a ? '+' : '−') + fmt(step), { 'font-size': 14, 'font-weight': 800, fill: 'var(--accent)', cls: 'num' }); });
      for (let k = 0; k <= 10; k++) {
        const x = X(k), hid = hidden[k], card = S('g', { cls: 'hit' }, g), v = dir > 0 ? val(k) : val(10 - k);
        S('rect', { x: x - 38, y: 60, width: 76, height: 46, rx: 10, fill: hid ? 'var(--accent)' : k === at ? 'var(--yellow-s)' : 'var(--board)', stroke: k === at ? 'var(--orange)' : 'var(--line-2)', 'stroke-width': k === at ? 3 : 1.5 }, card);
        text(card, x, 84, hid ? '?' : fmt(v), { 'font-size': fmt(v).length > 4 ? 18 : 24, 'font-weight': 800, cls: 'disp num', fill: hid ? 'var(--accent-ink)' : 'var(--ink)' });
        card.addEventListener('click', () => { hidden[k] = !hidden[k]; draw(); });
        const tap = S('rect', { x: x - 30, y: SY - 24, width: 60, height: 70, fill: 'transparent', cls: 'hit' }, g);
        tap.addEventListener('click', () => { jumpTo(k); });
      }
      // arrow
      S('path', { d: `M${X(at)} ${SY + 26} l-16 26 h32 z`, fill: 'var(--orange)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
      const n = dir > 0 ? at : 10 - at, v = val(n);
      if (facts) text(g, 550, 290, hidden[at] ? `${n} × ${fmt(step)} = ?` : `${n} × ${fmt(step)} = ${fmt(v)}`, { 'font-size': 38, 'font-weight': 800, cls: 'disp num' });
      drawVisual(n, v, hidden[at]);
    }
    function coinsFor(p) { const out = []; [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(cn => { while (p >= cn) { out.push(cn); p -= cn; } }); return out; }
    const lab = q => q >= 100 ? '£' + nf(q / 100) : q + 'p';
    // content drawers: draw one step's worth inside a box (cx, cy, bw, bh)
    function drawCounters(gg, cx, cy, bw, bh, i) {
      const cols = step <= 4 ? step : step <= 6 ? 3 : step <= 10 ? 5 : 6, rr = Math.ceil(step / cols), r = Math.min(18, bw / (cols * 2.6), bh / (rr * 2.6)), sp = r * 2.4;
      for (let j = 0; j < step; j++) S('circle', { cx: cx + (j % cols - (cols - 1) / 2) * sp, cy: cy + (Math.floor(j / cols) - (rr - 1) / 2) * sp, r, fill: col(['red', 'blue', 'green', 'purple', 'orange'][i % 5]), stroke: 'var(--ink)', 'stroke-width': 1.2 }, gg);
    }
    function drawDienes(gg, cx, cy, bw, bh) {
      const th = Math.floor(step / 1000), hu = Math.floor(step / 100) % 10, te = Math.floor(step / 10) % 10, on = step % 10;
      const tall = th || hu || te, u = Math.min(tall ? 11 : 20, (bh - 16) / (tall ? (th ? 12 : 10) : 6.2), (bw - 16) / (th * 12 + hu * 11.5 + te * 1.4 + (on ? 2.4 : 0) + 1));
      const parts = []; // widths
      if (th) parts.push(['cube', th, th * 12 * u + (th - 1) * 4]);
      if (hu) parts.push(['flat', hu, 10 * u + (hu - 1) * u * 1.4]);
      if (te) parts.push(['rod', te, te * u * 1.4]);
      if (on) parts.push(['unit', on, on > 5 ? 2.4 * u : 1.2 * u]);
      const tot = parts.reduce((a, p) => a + p[2], 0) + (parts.length - 1) * u * 1.5;
      let x = cx - tot / 2; const base = cy + (tall ? (th ? 6 : 5) : 3) * u;
      parts.forEach(([kind, d, w]) => {
        for (let k = 0; k < d; k++) {
          if (kind === 'unit') S('rect', { x: x + (k >= 5 ? 1.2 * u : 0), y: base - (k % 5 + 1) * 1.2 * u, width: u, height: u, fill: col('red'), stroke: 'var(--ink)', 'stroke-width': .8 }, gg);
          else if (kind === 'rod') { const rx = x + k * u * 1.4; S('rect', { x: rx, y: base - 10 * u, width: u, height: 10 * u, fill: col('blue'), stroke: 'var(--ink)', 'stroke-width': .8 }, gg); for (let j = 1; j < 10; j++) S('line', { x1: rx, y1: base - j * u, x2: rx + u, y2: base - j * u, stroke: 'var(--ink)', 'stroke-width': .4, opacity: .5 }, gg); }
          else if (kind === 'flat') { const fx = x + k * u * 1.4, fy = base - 10 * u; S('rect', { x: fx, y: fy, width: 10 * u, height: 10 * u, fill: col('green'), stroke: 'var(--ink)', 'stroke-width': .8 }, gg); for (let j = 1; j < 10; j++) { S('line', { x1: fx, y1: fy + j * u, x2: fx + 10 * u, y2: fy + j * u, stroke: 'var(--ink)', 'stroke-width': .3, opacity: .4 }, gg); S('line', { x1: fx + j * u, y1: fy, x2: fx + j * u, y2: fy + 10 * u, stroke: 'var(--ink)', 'stroke-width': .3, opacity: .4 }, gg); } }
          else { const fx = x + k * (12 * u + 4); S('rect', { x: fx, y: base - 12 * u, width: 12 * u, height: 12 * u, rx: 3, fill: col('purple'), stroke: 'var(--ink)', 'stroke-width': 1 }, gg); text(gg, fx + 6 * u, base - 6 * u, '1,000', { 'font-size': Math.max(10, u * 2), 'font-weight': 800, fill: '#fff' }); }
        }
        x += w + u * 1.5;
      });
    }
    function drawMoney(gg, cx, cy, bw, bh) {
      const list = coinsFor(Math.round(step < 1 ? step * 100 : step)), n2 = list.length, perR = n2 <= 3 ? n2 : Math.ceil(n2 / 2), rows = Math.ceil(n2 / perR);
      const r = Math.min(26, bw / (perR * 2.3), bh / (rows * 2.3)), sp = r * 2.2;
      list.forEach((cn, j) => {
        const x = cx + (j % perR - (Math.min(perR, n2) - 1) / 2) * sp, y = cy + (Math.floor(j / perR) - (rows - 1) / 2) * sp;
        if (cn >= 500) { S('rect', { x: x - r, y: y - r * .62, width: 2 * r, height: r * 1.24, rx: 4, fill: { 500: '#2FA59A', 1000: '#D9772B', 2000: '#7E57C2', 5000: '#D9434F' }[cn], stroke: 'var(--ink)', 'stroke-width': 1.5 }, gg); text(gg, x, y + 1, lab(cn), { 'font-size': r * .6, 'font-weight': 800, fill: '#fff', cls: 'num' }); }
        else { const rr = r * (cn >= 100 ? 1 : cn >= 20 ? .95 : cn >= 5 ? .82 : .78); S('circle', { cx: x, cy: y, r: rr, fill: cn <= 2 ? '#C77B45' : cn >= 100 ? '#E2B73F' : '#C5CCD6', stroke: 'var(--ink)', 'stroke-width': 1.5 }, gg); text(gg, x, y + 1, lab(cn), { 'font-size': rr * .62, 'font-weight': 800, fill: '#2B2F36', cls: 'num' }); }
      });
    }
    function drawVisual(n, v, hid) {
      clear(vg); const top = 330;
      if (vis === 'none' || hid) return;
      const msg = t => text(vg, 550, top + 120, t, { 'font-size': 20, fill: 'var(--ink-3)' });
      const whole = step === Math.round(step);
      if (vis === 'counters' && (!whole || step > 12)) return msg('Counters work for steps of 1 to 12');
      if (vis === 'dienes' && !whole) return msg('Dienes blocks work for whole-number steps');
      if (vis === 'money' && (step > 5000 || (!whole && Math.round(step * 100) !== step * 100))) return msg('Choose a smaller step for money');
      if (!n) return msg('No groups yet. Count on to add a group.');
      const perRow = 5, rows = Math.ceil(n / perRow), gw = 196, gh = rows > 1 ? 150 : 200;
      for (let i = 0; i < n; i++) {
        const inRow = Math.min(perRow, n - Math.floor(i / perRow) * perRow), gx = 550 + (i % perRow - (inRow - 1) / 2) * gw, gy = top + 4 + Math.floor(i / perRow) * (gh + 10);
        S('rect', { x: gx - gw / 2 + 6, y: gy, width: gw - 12, height: gh, rx: 14, fill: 'var(--board-2)', stroke: 'var(--line-2)' }, vg);
        const cx = gx, cy = gy + gh / 2, bw = gw - 28, bh = gh - 24;
        if (vis === 'counters') drawCounters(vg, cx, cy, bw, bh, i); else if (vis === 'dienes') drawDienes(vg, cx, cy, bw, bh); else drawMoney(vg, cx, cy, bw, bh);
      }
      if (vis === 'money') text(vg, 550, top + rows * (gh + 10) + 18, `${n} lots of ${lab(Math.round(step < 1 ? step * 100 : step))} = ${lab(Math.round(v * (step < 1 ? 100 : 1)))}`, { 'font-size': 20, 'font-weight': 800, fill: 'var(--ink-2)' });
    }
    function jumpTo(k) { if (k === at) return; const s2 = k > at ? 1 : -1; for (let i = at; i !== k; i += s2) jumps.push([i, i + s2]); at = k; draw(); }
    function stopPlay() { clearInterval(playT); playT = null; }
    c.onClean(stopPlay);
    P.section('Count in steps of');
    P.stepper({ label: 'Step', value: step, values: [0.1, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 50, 100, 1000], onChange: v => { step = v; jumps = []; draw(); } });
    P.seg({ label: 'Zero at', options: [[1, 'Left end'], [-1, 'Right end']], value: dir, onChange: v => { dir = v; jumps = []; draw(); } });
    P.section('Move along');
    P.buttons([['◀ Count back', () => { stopPlay(); if (at > 0) jumpTo(at - 1); }], ['Count on ▶', () => { stopPlay(); if (at < 10) jumpTo(at + 1); }, 'primary']]);
    P.buttons([['Count all the way', () => { stopPlay(); at = 0; jumps = []; draw(); playT = setInterval(() => { if (at >= 10) return stopPlay(); jumpTo(at + 1); }, 1100); }], ['Clear jumps', () => { stopPlay(); jumps = []; draw(); }]]);
    P.section('Hide numbers');
    P.buttons([['Hide all', () => { for (let k = 0; k <= 10; k++) hidden[k] = true; draw(); }], ['Show all', () => { hidden = {}; draw(); }]]);
    P.button('Hide some at random', () => { hidden = {}; shuffle(range(1, 10)).slice(0, 5).forEach(k => hidden[k] = true); draw(); });
    P.section('Show the number as');
    P.seg({ options: [['counters', 'Counters'], ['dienes', 'Dienes'], ['money', 'Money'], ['none', 'None']], value: vis, onChange: v => { vis = v; draw(); } });
    P.toggle({ label: 'Multiplication fact', value: facts, onChange: v => { facts = v; draw(); } });
    draw();
  }
});

tool({
  id: 'flash-tables', name: 'Flash times tables', strand: 'muldiv', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Times tables questions flash up one after another for the class to call out, with the answer shown after a few seconds.',
  tags: 'flash tables times tables recall quick fire multiplication division mental starter',
  icon: '<rect x="4" y="8" width="40" height="32" rx="4"/><path d="M14 18l8 8M22 18l-8 8M28 22h10"/><path d="M8 44h32" stroke-dasharray="3 3"/>',
  guide: ['Choose the tables to practise and whether you want multiplication, division or both.', 'Tap Start. A question appears in large type. The class calls out the answer before it appears.', 'Choose how long before the answer shows and how long it stays. Every fact comes up once before any repeats.', 'Pause at any time. Tap the board to move on straight away.'],
  mount(c) {
    const { svg, P } = c;
    let tables = [2, 5, 10], kind = 'mul', wait = 3, stay = 2, run = false, deck = [], cur = null, phase = 'idle', count = 0, hist = [], upTo = 12;
    c.persist(() => ({ tables, kind, wait, stay, upTo }), s => ({ tables, kind, wait, stay, upTo } = Object.assign({ tables, kind, wait, stay, upTo }, s)));
    const g = S('g', {}, svg);
    let t0 = 0, timer = null;
    const bg = S('rect', { x: 0, y: 0, width: 1000, height: 640, fill: 'transparent', cls: 'hit' }, svg); svg.insertBefore(bg, g);
    bg.addEventListener('click', () => { if (run) advance(); });
    function makeDeck() { const d = []; tables.forEach(t => { for (let m = 1; m <= upTo; m++) { const div = kind === 'div' || (kind === 'mix' && Math.random() < .5); d.push(div ? { q: `${t * m} ÷ ${t}`, a: m } : Math.random() < .5 ? { q: `${m} × ${t}`, a: m * t } : { q: `${t} × ${m}`, a: m * t }); } }); return shuffle(d); }
    function next() {
      if (!deck.length) deck = makeDeck();
      let n = deck.shift(); if (cur && n.q === cur.q && deck.length) { deck.push(n); n = deck.shift(); }
      cur = n; count++; phase = 'q'; t0 = performance.now(); draw();
      clearTimeout(timer); timer = setTimeout(() => { phase = 'a'; t0 = performance.now(); draw(); hist.unshift(cur); hist = hist.slice(0, 8); timer = setTimeout(() => { if (run) next(); }, stay * 1000); }, wait * 1000);
    }
    function advance() { clearTimeout(timer); if (phase === 'q') { phase = 'a'; hist.unshift(cur); hist = hist.slice(0, 8); draw(); timer = setTimeout(() => { if (run) next(); }, stay * 1000); } else next(); }
    function draw() {
      clear(g);
      if (!cur) { text(g, 500, 280, 'Flash times tables', { 'font-size': 56, 'font-weight': 800, cls: 'disp' }); text(g, 500, 350, `Tables: ${tables.slice().sort((a, b) => a - b).join(', ') || 'none chosen'}`, { 'font-size': 24, fill: 'var(--ink-2)' }); text(g, 500, 400, 'Tap Start', { 'font-size': 22, fill: 'var(--ink-3)' }); return; }
      S('rect', { x: 120, y: 90, width: 620, height: 420, rx: 34, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
      text(g, 430, 250, cur.q, { 'font-size': 120, 'font-weight': 800, cls: 'disp num' });
      if (phase === 'a') text(g, 430, 410, `= ${cur.a}`, { 'font-size': 100, 'font-weight': 800, cls: 'disp num', fill: 'var(--accent)' });
      else text(g, 430, 410, '= ?', { 'font-size': 100, 'font-weight': 800, cls: 'disp num', fill: 'var(--line-2)' });
      text(g, 140, 120, `Question ${count}`, { 'font-size': 18, fill: 'var(--ink-3)', 'text-anchor': 'start', 'font-weight': 700 });
      if (!run) text(g, 430, 560, 'Paused', { 'font-size': 26, 'font-weight': 800, fill: 'var(--orange)' });
      // history
      text(g, 870, 110, 'Just had', { 'font-size': 18, 'font-weight': 800, fill: 'var(--ink-3)' });
      hist.forEach((h, i) => text(g, 870, 150 + i * 44, `${h.q} = ${h.a}`, { 'font-size': 22, 'font-weight': 700, cls: 'num', fill: 'var(--ink-2)', opacity: 1 - i * .09 }));
      drawBar();
    }
    const barG = S('g', {}, svg);
    function drawBar() {
      clear(barG);
      if (run && cur) { const tot = (phase === 'q' ? wait : stay) * 1000, f = clamp((performance.now() - t0) / tot, 0, 1); S('rect', { x: 120, y: 528, width: 620, height: 10, rx: 5, fill: 'var(--line)' }, barG); S('rect', { x: 120, y: 528, width: 620 * f, height: 10, rx: 5, fill: phase === 'q' ? 'var(--orange)' : 'var(--green)' }, barG); }
    }
    c.raf(() => { drawBar(); });
    c.onClean(() => clearTimeout(timer));
    P.section('Go');
    const sb = P.button('Start', () => { if (!tables.length) return c.toast('Choose at least one table'); run = !run; sb.textContent = run ? 'Pause' : 'Start'; if (run) { if (!cur || phase === 'a') next(); else { clearTimeout(timer); t0 = performance.now(); timer = setTimeout(() => advance(), wait * 1000); } } else clearTimeout(timer); draw(); }, 'primary');
    P.button('Start again', () => { run = false; sb.textContent = 'Start'; clearTimeout(timer); deck = []; cur = null; count = 0; hist = []; draw(); });
    P.section('Tables');
    const tb = H('div', { cls: 'objpick tblpick' });
    const sync = () => [...tb.children].forEach(b => b.classList.toggle('primary', tables.includes(+b.dataset.t)));
    range(1, 13).forEach(t => tb.append(H('button', { cls: 'btn', 'data-t': t, text: String(t), on: { click: () => { tables = tables.includes(t) ? tables.filter(x => x !== t) : [...tables, t]; deck = []; sync(); if (!cur) draw(); } } })));
    P.raw(tb); sync();
    P.buttons([['All', () => { tables = range(2, 12); deck = []; sync(); draw(); }], ['None', () => { tables = []; deck = []; sync(); draw(); }]]);
    P.seg({ label: 'Questions up to', options: [[10, '× 10'], [12, '× 12']], value: upTo, onChange: v => { upTo = v; deck = []; } });
    P.section('Questions');
    P.seg({ options: [['mul', 'Multiply ×'], ['div', 'Divide ÷'], ['mix', 'Mixed']], value: kind, onChange: v => { kind = v; deck = []; } });
    P.section('Speed');
    P.seg({ label: 'Answer shows after', options: [[1.5, 'Fast'], [3, 'Medium'], [5, 'Slow'], [8, 'Very slow']], value: wait, onChange: v => wait = v });
    P.seg({ label: 'Answer stays for', options: [[1, '1 s'], [2, '2 s'], [4, '4 s']], value: stay, onChange: v => stay = v });
    draw();
  }
});

tool({
  id: 'calculator', name: 'Calculator', strand: 'muldiv', years: [2, 3, 4, 5, 6], w: 1000, h: 680,
  desc: 'A big classroom calculator in three levels, from simple to Year 6, with brackets, squares, square roots, percentages, remainders and memory. No sin, cos or tan.',
  tags: 'calculator calculate compute operations order brackets bodmas bidmas square root percentage remainder memory estimate check',
  icon: '<rect x="10" y="4" width="28" height="40" rx="4"/><rect x="14" y="8" width="20" height="9" rx="1.5"/><g fill="currentColor" stroke="none"><circle cx="17" cy="24" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="31" cy="24" r="2"/><circle cx="17" cy="31" r="2"/><circle cx="24" cy="31" r="2"/><circle cx="31" cy="31" r="2"/><circle cx="17" cy="38" r="2"/><circle cx="24" cy="38" r="2"/><circle cx="31" cy="38" r="2"/></g>',
  guide: ['Choose Simple, Standard or Year 6. Simple has the four operations. Standard adds brackets, squares, square roots and percentages. Year 6 adds cubes, cube roots, remainders, memory and rounding.', 'The whole calculation stays on the screen, so the class can check what was typed. Multiplication and division are worked out before addition and subtraction, and brackets first of all.', 'Turn on Estimate first: the first press of = asks for an estimate, and the second press shows the answer.', 'Use ÷R for division with a remainder, for example 17 ÷R 5 = 3 r 2. Percent means out of 100, so 10% × 50 = 5.', 'You can also type on a keyboard: numbers, + − * / ( ), Enter for = and Backspace.'],
  mount(c) {
    const { svg, P } = c;
    let level = 'standard', toks = [], result = null, ans = 0, mem = 0, hist = [], estimate = false, asked = false, commas = true, tape = true, err = '';
    c.persist(() => ({ level, ans, mem, hist, estimate, commas, tape }), s => ({ level, ans, mem, hist, estimate, commas, tape } = Object.assign({ level, ans, mem, hist, estimate, commas, tape }, s)));
    const g = S('g', {}, svg);
    const LAYOUT = {
      simple: [['C', '⌫', '±', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], [['0', 2], '.', '=']],
      standard: [['C', '⌫', '(', ')', '÷'], ['7', '8', '9', '√', '×'], ['4', '5', '6', 'x²', '−'], ['1', '2', '3', '%', '+'], ['±', '0', '.', 'Ans', '=']],
      y6: [['M+', 'M−', 'MR', 'MC', '⌫', 'C'], ['x²', 'x³', '(', ')', '%', '÷'], ['√', '∛', '7', '8', '9', '×'], ['÷R', '±', '4', '5', '6', '−'], [['Ans', 2], '1', '2', '3', '+'], [['Round', 2], ['0', 2], '.', '=']]
    };
    const OPS = ['+', '−', '×', '÷', '÷R'];
    // ---------- maths ----------
    function evaluate(ts) {
      let i = 0;
      const peek = () => ts[i], take = () => ts[i++];
      const expr = () => { let v = term(); while (peek() === '+' || peek() === '−') { const o = take(), r = term(); v = o === '+' ? v + r : v - r; } return v; };
      const term = () => { let v = factor(); while (peek() === '×' || peek() === '÷') { const o = take(), r = factor(); if (o === '÷' && r === 0) throw new Error('Cannot divide by 0'); v = o === '×' ? v * r : v / r; } return v; };
      const factor = () => { if (peek() === '−') { take(); return -factor(); } if (peek() === '√') { take(); const v = factor(); if (v < 0) throw new Error('No square root of a negative'); return Math.sqrt(v); } if (peek() === '∛') { take(); return Math.cbrt(factor()); } return power(); };
      const power = () => { let v = primary(); while (peek() === '²' || peek() === '³' || peek() === '%') { const o = take(); v = o === '²' ? v * v : o === '³' ? v * v * v : v / 100; } return v; };
      const primary = () => { const t = take(); if (t === '(') { const v = expr(); if (peek() === ')') take(); return v; } if (t === 'Ans') return ans; if (t === 'M') return mem; if (t != null && /^[\d.]+$/.test(t)) { if ((t.match(/\./g) || []).length > 1) throw new Error('Two decimal points'); return parseFloat(t === '.' ? '0' : t); } throw new Error('Check the calculation'); };
      const v = expr(); if (i < ts.length) throw new Error('Check the calculation'); return v;
    }
    function compute() {
      const k = toks.indexOf('÷R');
      if (k >= 0) { const a = evaluate(toks.slice(0, k)), b = evaluate(toks.slice(k + 1)); if (b === 0) throw new Error('Cannot divide by 0'); if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) throw new Error('÷R needs whole numbers'); const q = Math.floor(a / b), r = a - q * b; return { v: q, text: r ? `${fmt(q)} r ${fmt(r)}` : fmt(q) }; }
      const v = evaluate(toks); if (!isFinite(v)) throw new Error('Too big'); return { v, text: fmt(v) };
    }
    function fmt(v) {
      if (Math.abs(v) >= 1e12) return v.toExponential(4).replace('e+', ' × 10^');
      let s = String(+v.toPrecision(11));
      if (s.includes('e')) s = v.toFixed(10).replace(/0+$/, '').replace(/\.$/, '');
      const neg = s.startsWith('-'); if (neg) s = s.slice(1);
      let [a, b] = s.split('.'); if (commas) a = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (neg ? '−' : '') + a + (b ? '.' + b : '');
    }
    // ---------- input ----------
    const last = () => toks[toks.length - 1];
    const isNum = t => t != null && /^[\d.]+$/.test(t);
    function press(k) {
      err = '';
      if (result && !['=', 'M+', 'M−', 'MR', 'MC', 'Round', 'C', '⌫'].includes(k)) {
        if (OPS.includes(k) || ['x²', 'x³', '%'].includes(k)) toks = ['Ans']; else toks = [];
        result = null; asked = false;
      }
      if (/^\d$/.test(k) || k === '.') { if (isNum(last())) { if (k === '.' && last().includes('.')) return; if (last().replace('.', '').length >= 12) return; toks[toks.length - 1] += k; } else { if (last() === ')' || last() === 'Ans' || last() === '²' || last() === '³' || last() === '%') toks.push('×'); toks.push(k === '.' ? '0.' : k); } }
      else if (OPS.includes(k)) { if (!toks.length && k === '−') toks.push('−'); else if (!toks.length) toks.push('Ans', k); else if (OPS.includes(last()) && k !== '−') toks[toks.length - 1] = k; else toks.push(k); }
      else if (k === '(') { if (isNum(last()) || last() === ')' || last() === 'Ans') toks.push('×'); toks.push('('); }
      else if (k === ')') { const open = toks.filter(t => t === '(').length - toks.filter(t => t === ')').length; if (open > 0 && !OPS.includes(last()) && last() !== '(') toks.push(')'); }
      else if (k === 'x²' || k === 'x³' || k === '%') { if (!toks.length) toks.push('Ans'); if (OPS.includes(last()) || last() === '(') return; toks.push(k === 'x²' ? '²' : k === 'x³' ? '³' : '%'); }
      else if (k === '√' || k === '∛') { if (isNum(last()) || last() === ')') toks.push('×'); toks.push(k); }
      else if (k === '±') { if (isNum(last())) { const n = toks.pop(); if (last() === '−' && (toks.length === 1 || OPS.includes(toks[toks.length - 2]) || toks[toks.length - 2] === '(')) toks.pop(); else toks.push('−'); toks.push(n); } else toks.push('−'); }
      else if (k === 'Ans' || k === 'MR') { if (result) { toks = []; result = null; } if (isNum(last()) || last() === ')') toks.push('×'); toks.push(k === 'MR' ? 'M' : 'Ans'); }
      else if (k === 'C') { toks = []; result = null; asked = false; }
      else if (k === '⌫') { if (result) { result = null; asked = false; } else if (isNum(last()) && last().length > 1) toks[toks.length - 1] = last().slice(0, -1); else toks.pop(); }
      else if (k === 'MC') { mem = 0; }
      else if (k === 'M+' || k === 'M−') { const v = result ? result.v : (() => { try { return evaluate(toks); } catch (e) { return null; } })(); if (v == null) { err = 'Nothing to add to memory'; } else mem += k === 'M+' ? v : -v; }
      else if (k === 'Round') { if (result && !result.text.includes(' r ')) { const v = Math.round(result.v); result = { v, text: fmt(v), rounded: true }; ans = v; } else err = 'Press = first, then Round'; }
      else if (k === '=') {
        if (!toks.length) return;
        if (estimate && !asked && !result) { asked = true; draw(); return; }
        let open = toks.filter(t => t === '(').length - toks.filter(t => t === ')').length; while (open-- > 0) toks.push(')');
        try { result = compute(); ans = result.v; hist.unshift([toks.slice(), result.text]); hist = hist.slice(0, 9); asked = false; }
        catch (e) { err = e.message; result = null; asked = false; }
      }
      draw();
    }
    const dispNum = t => { let [a, b] = t.split('.'); if (commas) a = a.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return a + (t.includes('.') ? '.' + b : ''); };
    const show = ts => ts.map(t => t === '÷R' ? ' ÷R ' : OPS.includes(t) ? ` ${t} ` : isNum(t) ? dispNum(t) : t).join('').replace(/\s+/g, ' ').trim();
    // ---------- drawing ----------
    function draw() {
      clear(g);
      const wide = tape, W = wide ? 640 : 760, X0 = wide ? 30 : 120;
      // display
      S('rect', { x: X0, y: 24, width: W, height: 150, rx: 22, fill: '#1f2a24', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      S('rect', { x: X0 + 12, y: 36, width: W - 24, height: 126, rx: 14, fill: '#c9dcc0' }, g);
      const exprT = show(toks) || (result ? '' : '0');
      text(g, X0 + W - 30, 70, exprT.length > 40 ? '…' + exprT.slice(-40) : exprT, { 'font-size': exprT.length > 30 ? 22 : 28, 'text-anchor': 'end', fill: '#24332a', cls: 'num', 'font-weight': 700 });
      let main = err || (asked ? 'Estimate first…' : result ? result.text : '');
      text(g, X0 + W - 30, 128, main || (toks.length ? '' : '0'), { 'font-size': err || asked ? 34 : main.length > 14 ? 44 : 62, 'text-anchor': 'end', fill: err ? '#9a2a2a' : '#1b261f', cls: 'disp num', 'font-weight': 800 });
      if (mem) text(g, X0 + 30, 52, 'M', { 'font-size': 18, 'font-weight': 800, fill: '#24332a' });
      if (result && result.rounded) text(g, X0 + 30, 140, 'rounded', { 'font-size': 15, 'font-weight': 700, fill: '#24332a', 'text-anchor': 'start' });
      // keys
      const L = LAYOUT[level], cols = Math.max(...L.map(r => r.reduce((s, k) => s + (Array.isArray(k) ? k[1] : 1), 0))), gap = 10, kw = (W - gap * (cols - 1)) / cols, top = 194, kh = Math.min(84, (660 - top - gap * (L.length - 1)) / L.length);
      L.forEach((row, ri) => {
        let ci = 0;
        row.forEach(k => {
          const [lab, span] = Array.isArray(k) ? k : [k, 1], x = X0 + ci * (kw + gap), y = top + ri * (kh + gap), w = kw * span + gap * (span - 1);
          const kind = /^\d$|^\.$/.test(lab) ? 'num' : lab === '=' ? 'eq' : ['C', '⌫'].includes(lab) ? 'clr' : OPS.includes(lab) ? 'op' : 'fn';
          const fill = { num: 'var(--board)', eq: 'var(--accent)', clr: 'var(--red)', op: 'var(--blue-s)', fn: 'var(--board-2)' }[kind];
          const b = S('g', { cls: 'hit', role: 'button', 'aria-label': lab }, g);
          S('rect', { x, y, width: w, height: kh, rx: 16, fill, stroke: 'var(--line-2)', 'stroke-width': 2 }, b);
          S('rect', { x: x + 3, y: y + kh - 7, width: w - 6, height: 4, rx: 2, fill: '#000', opacity: .08 }, b);
          text(b, x + w / 2, y + kh / 2 + 1, lab, { 'font-size': lab.length > 3 ? 22 : kind === 'num' ? 34 : 28, 'font-weight': 800, cls: kind === 'num' ? 'disp num' : 'disp', fill: kind === 'eq' || kind === 'clr' ? '#fff' : 'var(--ink)' });
          b.addEventListener('pointerdown', () => { b.style.transform = 'translateY(2px)'; });
          b.addEventListener('pointerup', () => { b.style.transform = ''; });
          b.addEventListener('pointerleave', () => { b.style.transform = ''; });
          b.addEventListener('click', () => press(lab));
          ci += span;
        });
      });
      // tape
      if (tape) {
        const tx = 700; S('rect', { x: tx, y: 24, width: 280, height: 636, rx: 20, fill: 'var(--board-2)', stroke: 'var(--line)' }, g);
        text(g, tx + 20, 54, 'Calculations', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'start', cls: 'disp' });
        if (mem) text(g, tx + 260, 54, `Memory ${fmt(mem)}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: 'var(--ink-3)' });
        hist.forEach((h, i) => { const y = 92 + i * 62, e = show(h[0]); text(g, tx + 260, y, e.length > 26 ? '…' + e.slice(-26) : e, { 'font-size': 15, 'text-anchor': 'end', fill: 'var(--ink-2)', cls: 'num' }); text(g, tx + 260, y + 24, '= ' + h[1], { 'font-size': 21, 'font-weight': 800, 'text-anchor': 'end', cls: 'num' }); S('line', { x1: tx + 20, y1: y + 42, x2: tx + 260, y2: y + 42, stroke: 'var(--line)' }, g); const hit = S('rect', { x: tx + 10, y: y - 16, width: 260, height: 58, fill: 'transparent', cls: 'hit' }, g); hit.addEventListener('click', () => { toks = h[0].slice(); result = null; draw(); }); });
        if (!hist.length) text(g, tx + 140, 120, 'Answers appear here', { 'font-size': 15, fill: 'var(--ink-3)' });
      }
    }
    const KEYMAP = { '*': '×', 'x': '×', 'X': '×', '/': '÷', '-': '−', '+': '+', 'Enter': '=', '=': '=', 'Backspace': '⌫', 'Escape': 'C', '(': '(', ')': ')', '%': '%', '.': '.', ',': '.' };
    const onKey = e => { if (e.target.closest && e.target.closest('input,textarea,[contenteditable]')) return; if (!svg.isConnected) return; const k = /^\d$/.test(e.key) ? e.key : KEYMAP[e.key]; if (!k) return; if (k === '%' && level === 'simple') return; e.preventDefault(); press(k); };
    window.addEventListener('keydown', onKey); c.onClean(() => window.removeEventListener('keydown', onKey));
    P.section('Calculator');
    P.seg({ options: [['simple', 'Simple'], ['standard', 'Standard'], ['y6', 'Year 6']], value: level, onChange: v => { level = v; toks = []; result = null; draw(); } });
    P.section('Options');
    P.toggle({ label: 'Estimate first', value: estimate, onChange: v => { estimate = v; asked = false; draw(); } });
    P.toggle({ label: 'Commas in big numbers', value: commas, onChange: v => { commas = v; draw(); } });
    P.toggle({ label: 'List of calculations', value: tape, onChange: v => { tape = v; draw(); } });
    P.button('Clear the list', () => { hist = []; draw(); });
    P.note('Tap a calculation in the list to bring it back. Use the full screen button for the biggest keys.');
    draw();
  }
});

