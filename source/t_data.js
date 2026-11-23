/* ===== Statistics and probability ===== */

function niceMax(v) { if (v <= 0) return 10; const p = 10 ** Math.floor(Math.log10(v)); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p; return 10 * p; }
function niceStep(max) { for (const s of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]) if (max / s <= 10) return s; return max / 10; }

function tableEditor(P, rows, onChange, heads = ['Label', 'Value']) {
  const host = H('div', { cls: 'tbl' });
  function render() {
    clear(host);
    host.append(H('div', { style: 'display:grid;grid-template-columns:1fr 90px 32px;gap:6px;color:var(--ink-3);font-size:13px;margin-bottom:4px' }, H('span', { text: heads[0] }), H('span', { text: heads[1] }), H('span')));
    rows.forEach((r, i) => {
      const a = H('input', { value: r[0], 'aria-label': heads[0] + ' ' + (i + 1), style: 'height:36px;border:1px solid var(--line);border-radius:8px;background:var(--board-2);padding:0 8px;min-width:0' });
      const b = H('input', { value: String(r[1]), type: 'number', 'aria-label': heads[1] + ' ' + (i + 1), style: 'height:36px;border:1px solid var(--line);border-radius:8px;background:var(--board-2);padding:0 8px;min-width:0' });
      a.addEventListener('input', () => { r[0] = a.value; onChange(); });
      b.addEventListener('input', () => { r[1] = b.value === '' ? 0 : +b.value; onChange(); });
      const x = H('button', { text: '×', 'aria-label': 'Remove row', style: 'border:0;background:none;cursor:pointer;font-size:20px;color:var(--ink-3)', on: { click: () => { rows.splice(i, 1); render(); onChange(); } } });
      host.append(H('div', { style: 'display:grid;grid-template-columns:1fr 90px 32px;gap:6px;margin:4px 0' }, a, b, x));
    });
    host.append(H('button', { cls: 'btn', text: 'Add a row', on: { click: () => { if (rows.length < 14) { rows.push(['', 0]); render(); onChange(); } } } }));
  }
  P.raw(host); render(); return { render };
}

tool({
  id: 'data-handling', name: 'Data handling', strand: 'stats', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Type in a table and turn it into a bar chart, horizontal bar chart or pie chart.',
  tags: 'bar chart pie chart table statistics tally block graph',
  icon: '<path d="M6 42h36M6 42V6"/><rect x="11" y="24" width="7" height="18" fill="currentColor"/><rect x="22" y="14" width="7" height="28" fill="currentColor"/><rect x="33" y="30" width="7" height="12" fill="currentColor"/>',
  guide: ['Pick an example data set, or type your own labels and values in the table.', 'Switch between a bar chart, a horizontal bar chart and a pie chart. The chart redraws as you type.', 'Change the axis scale to practise reading intervals of 2, 5 or 10.', 'Hide the values on the bars so the class reads them from the scale.'],
  mount(c) {
    const { svg, P } = c;
    const sets = {
      fruit: ['Our favourite fruit', 'Number of children', [['Apple', 7], ['Banana', 5], ['Orange', 3], ['Grapes', 9], ['Strawberry', 6]]],
      pets: ['Pets in our class', 'Number of pets', [['Dog', 8], ['Cat', 11], ['Fish', 4], ['Rabbit', 3], ['Hamster', 2]]],
      weather: ['Weather in March', 'Number of days', [['Sunny', 9], ['Cloudy', 12], ['Rainy', 7], ['Windy', 3]]],
      travel: ['How we travel to school', 'Number of children', [['Walk', 14], ['Car', 9], ['Bus', 4], ['Bike', 3], ['Scooter', 2]]],
      olympics: ['Gold medals, Paris 2024', 'Gold medals', [['USA', 40], ['China', 40], ['Japan', 20], ['Australia', 18], ['France', 16], ['GB', 14]]],
    };
    let type = 'bar', title, yl, rows, showVals = true, stepSel = 'auto';
    const g = S('g', {}, svg);
    const colours = ['blue', 'orange', 'green', 'purple', 'red', 'teal', 'yellow', 'pink'];
    function load(k) { [title, yl, rows] = sets[k]; rows = rows.map(r => r.slice()); if (ed) { ed.render(); tf.set(title); } draw(); }
    function draw() {
      clear(g);
      text(g, 500, 32, title, { 'font-size': 28, 'font-weight': 800, cls: 'disp' });
      const data = rows.filter(r => r[0] || r[1]); if (!data.length) { text(g, 500, 320, 'Type labels and values in the table to make a chart', { 'font-size': 22, fill: 'var(--ink-3)' }); return; }
      const mx = Math.max(...data.map(r => r[1]), 0);
      const step = stepSel === 'auto' ? niceStep(niceMax(mx)) : stepSel, top = Math.ceil(niceMax(mx) / step) * step || step;
      if (type === 'bar') {
        const x0 = 110, x1 = 960, y0 = 560, y1 = 80, Y = v => y0 - v / top * (y0 - y1), bw = (x1 - x0) / data.length;
        for (let v = 0; v <= top + 1e-9; v += step) { S('line', { x1: x0, y1: Y(v), x2: x1, y2: Y(v), stroke: 'var(--line)', 'stroke-width': 1 }, g); text(g, x0 - 14, Y(v), nf(v), { 'font-size': 16, 'text-anchor': 'end', cls: 'num', fill: 'var(--ink-2)' }); }
        data.forEach((r, i) => { const x = x0 + i * bw + bw * .18, w = bw * .64; S('rect', { x, y: Y(r[1]), width: w, height: y0 - Y(r[1]), fill: col(colours[i % 8]), rx: 4 }, g); text(g, x + w / 2, y0 + 24, r[0], { 'font-size': data.length > 8 ? 14 : 18, 'font-weight': 700 }); if (showVals) text(g, x + w / 2, Y(r[1]) - 16, nf(r[1]), { 'font-size': 18, 'font-weight': 800, cls: 'num' }); });
        S('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g); S('line', { x1: x0, y1: y0, x2: x0, y2: y1 - 10, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g);
        const t = text(g, 34, (y0 + y1) / 2, yl, { 'font-size': 17, fill: 'var(--ink-2)', transform: `rotate(-90 34 ${(y0 + y1) / 2})` });
      } else if (type === 'hbar') {
        const x0 = 200, x1 = 940, y0 = 80, y1 = 560, X = v => x0 + v / top * (x1 - x0), bh = (y1 - y0) / data.length;
        for (let v = 0; v <= top + 1e-9; v += step) { S('line', { x1: X(v), y1: y0, x2: X(v), y2: y1, stroke: 'var(--line)' }, g); text(g, X(v), y1 + 22, nf(v), { 'font-size': 16, cls: 'num', fill: 'var(--ink-2)' }); }
        data.forEach((r, i) => { const y = y0 + i * bh + bh * .18, h = bh * .64; S('rect', { x: x0, y, width: X(r[1]) - x0, height: h, fill: col(colours[i % 8]), rx: 4 }, g); text(g, x0 - 14, y + h / 2, r[0], { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'end' }); if (showVals) text(g, X(r[1]) + 14, y + h / 2, nf(r[1]), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'start', cls: 'num' }); });
        S('line', { x1: x0, y1: y0 - 10, x2: x0, y2: y1, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g); S('line', { x1: x0, y1: y1, x2: x1, y2: y1, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g);
        text(g, (x0 + x1) / 2, y1 + 54, yl, { 'font-size': 17, fill: 'var(--ink-2)' });
      } else {
        const tot = data.reduce((s, r) => s + Math.max(0, r[1]), 0) || 1, cx = 360, cy = 340, R = 230; let a = -Math.PI / 2;
        data.forEach((r, i) => {
          const da = Math.max(0, r[1]) / tot * 2 * Math.PI; if (!da) return;
          const x1 = cx + R * Math.cos(a), y1 = cy + R * Math.sin(a), x2 = cx + R * Math.cos(a + da), y2 = cy + R * Math.sin(a + da);
          S('path', { d: da >= 2 * Math.PI - 1e-6 ? `M${cx - R} ${cy} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0` : `M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${da > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`, fill: col(colours[i % 8]), stroke: 'var(--board)', 'stroke-width': 3 }, g);
          const m = a + da / 2; if (showVals && da > .2) text(g, cx + R * .65 * Math.cos(m), cy + R * .65 * Math.sin(m), nf(+(r[1] / tot * 100).toFixed(0)) + '%', { 'font-size': 20, 'font-weight': 800, fill: 'var(--board)', cls: 'num' });
          a += da;
        });
        data.forEach((r, i) => { S('rect', { x: 660, y: 120 + i * 44, width: 26, height: 26, rx: 6, fill: col(colours[i % 8]) }, g); text(g, 700, 133 + i * 44, `${r[0]}`, { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'start' }); text(g, 960, 133 + i * 44, `${nf(r[1])}`, { 'font-size': 20, 'text-anchor': 'end', cls: 'num' }); });
        text(g, 810, 140 + data.length * 44, `Total ${nf(tot)}`, { 'font-size': 18, fill: 'var(--ink-2)' });
      }
    }
    title = 'Type a title'; yl = 'Value'; rows = [['', 0], ['', 0], ['', 0], ['', 0]];
    P.section('Chart');
    P.seg({ options: [['bar', 'Bar chart'], ['hbar', 'Horizontal'], ['pie', 'Pie chart']], value: type, onChange: v => { type = v; draw(); } });
    P.seg({ label: 'Scale goes up in', options: [['auto', 'Auto'], [1, '1s'], [2, '2s'], [5, '5s'], [10, '10s']], value: stepSel, onChange: v => { stepSel = v; draw(); } });
    P.toggle({ label: 'Values on the chart', value: showVals, onChange: v => { showVals = v; draw(); } });
    P.section('Examples');
    P.seg({ options: [['fruit', 'Fruit'], ['pets', 'Pets'], ['weather', 'Weather'], ['travel', 'Travel'], ['olympics', 'Medals']], value: null, onChange: load });
    P.section('Data');
    const tf = P.field({ label: 'Title', value: title, onChange: v => { title = v; draw(); } });
    const ed = tableEditor(P, rows, draw);
    P.button('Clear the table', () => { rows.length = 0; rows.push(['', 0]); ed.render(); draw(); });
    draw();
  }
});

tool({
  id: 'line-graph', name: 'Line graph', strand: 'stats', years: [4, 5, 6], w: 1000, h: 640,
  desc: 'Plot data over time as a line graph and read values between the points.',
  tags: 'line graph time series temperature journey continuous data',
  icon: '<path d="M6 42h36M6 42V6"/><path d="M10 34l8-12 8 6 12-16"/><circle cx="18" cy="22" r="2.5" fill="currentColor"/><circle cx="26" cy="28" r="2.5" fill="currentColor"/>',
  guide: ['Choose an example, or type your own values. Each row is one point on the graph.', 'Drag the green line along the graph to read values between the points.', 'Set the highest value on the vertical axis to change the scale.', 'Hide the line and show only the points to talk about when joining points makes sense.'],
  mount(c) {
    const { svg, P } = c;
    const sets = {
      temp: ['Temperature over 24 hours', 'Time', '°C', [['00:00', 6], ['03:00', 4], ['06:00', 3], ['09:00', 8], ['12:00', 14], ['15:00', 16], ['18:00', 12], ['21:00', 9], ['24:00', 7]]],
      lorry: ["A lorry driver's journey", 'Time', 'Miles from home', [['08:00', 0], ['09:00', 40], ['10:00', 85], ['11:00', 85], ['12:00', 120], ['13:00', 150], ['14:00', 150], ['15:00', 90], ['16:00', 30], ['17:00', 0]]],
      water: ['Water level in a bath', 'Minutes', 'Water level (cm)', [['0', 0], ['2', 8], ['4', 16], ['6', 24], ['8', 30], ['10', 30], ['12', 26], ['14', 20], ['16', 0]]],
      plant: ['Height of a sunflower', 'Week', 'Height (cm)', [['1', 2], ['2', 5], ['3', 11], ['4', 20], ['5', 34], ['6', 52], ['7', 70], ['8', 86]]],
    };
    let title, xl, yl, rows, yMax = 'auto', line = true, pts = true, readX = .5, reading = true;
    const g = S('g', {}, svg);
    function load(k) { [title, xl, yl, rows] = sets[k]; rows = rows.map(r => r.slice()); if (ed) { ed.rows = rows; edRebuild(); } draw(); }
    function draw() {
      clear(g);
      text(g, 500, 32, title, { 'font-size': 26, 'font-weight': 800, cls: 'disp' });
      if (rows.length < 2 || rows.every(r => !r[0] && !r[1])) { text(g, 500, 320, 'Type at least two rows in the table to draw a line', { 'font-size': 22, fill: 'var(--ink-3)' }); return; }
      const vals = rows.map(r => r[1]), lo = Math.min(0, ...vals), top = yMax === 'auto' ? niceMax(Math.max(...vals)) : yMax, step = niceStep(top - lo);
      const x0 = 120, x1 = 950, y0 = 540, y1 = 80, X = i => x0 + i / (rows.length - 1) * (x1 - x0), Y = v => y0 - (v - lo) / (top - lo) * (y0 - y1);
      for (let v = Math.ceil(lo / step) * step; v <= top + 1e-9; v += step) { S('line', { x1: x0, y1: Y(v), x2: x1, y2: Y(v), stroke: 'var(--line)' }, g); text(g, x0 - 14, Y(v), nf(v), { 'font-size': 16, 'text-anchor': 'end', cls: 'num', fill: 'var(--ink-2)' }); }
      rows.forEach((r, i) => { S('line', { x1: X(i), y1: y0, x2: X(i), y2: y1, stroke: 'var(--line)', 'stroke-dasharray': '3 5' }, g); text(g, X(i), y0 + 22, r[0], { 'font-size': rows.length > 10 ? 13 : 16, cls: 'num' }); });
      S('line', { x1: x0, y1: Y(Math.max(lo, 0)), x2: x1, y2: Y(Math.max(lo, 0)), stroke: 'var(--ink)', 'stroke-width': 2.5 }, g); S('line', { x1: x0, y1: y0, x2: x0, y2: y1 - 10, stroke: 'var(--ink)', 'stroke-width': 2.5 }, g);
      text(g, (x0 + x1) / 2, y0 + 56, xl, { 'font-size': 17, fill: 'var(--ink-2)' }); text(g, 36, (y0 + y1) / 2, yl, { 'font-size': 17, fill: 'var(--ink-2)', transform: `rotate(-90 36 ${(y0 + y1) / 2})` });
      if (line) S('polyline', { points: rows.map((r, i) => X(i) + ',' + Y(r[1])).join(' '), fill: 'none', stroke: 'var(--blue)', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      if (pts) rows.forEach((r, i) => S('circle', { cx: X(i), cy: Y(r[1]), r: 7, fill: 'var(--blue)', stroke: 'var(--board)', 'stroke-width': 2.5 }, g));
      if (reading) {
        const f = readX * (rows.length - 1), i = Math.min(rows.length - 2, Math.floor(f)), t = f - i, v = rows[i][1] + (rows[i + 1][1] - rows[i][1]) * t, x = x0 + readX * (x1 - x0);
        const rg = S('g', { cls: 'grab' }, g);
        S('line', { x1: x, y1: y0, x2: x, y2: y1, stroke: 'var(--green)', 'stroke-width': 3 }, rg);
        S('line', { x1: x0, y1: Y(v), x2: x, y2: Y(v), stroke: 'var(--green)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, rg);
        S('rect', { x: x - 30, y: y1, width: 60, height: y0 - y1, fill: 'transparent' }, rg);
        S('circle', { cx: x, cy: Y(v), r: 9, fill: 'var(--green)' }, rg);
        const bx = x > 820 ? x - 110 : x + 18, by = Y(v) - 52;
        S('rect', { x: bx, y: by, width: 92, height: 36, rx: 10, fill: 'var(--green)' }, rg);
        text(rg, bx + 46, by + 18, nf(+v.toFixed(1)), { 'font-size': 20, 'font-weight': 800, fill: 'var(--board)', cls: 'num' });
        c.drag(rg, { move: p => { readX = clamp((p.x - x0) / (x1 - x0), 0, 1); draw(); } });
      }
    }
    title = 'Type a title'; xl = 'Label'; yl = 'Value'; rows = [['', 0], ['', 0], ['', 0], ['', 0], ['', 0]];
    P.section('Examples');
    P.seg({ options: [['temp', 'Temperature'], ['lorry', 'Journey'], ['water', 'Bath'], ['plant', 'Sunflower']], value: null, onChange: load });
    P.section('Graph');
    P.toggle({ label: 'Join with a line', value: line, onChange: v => { line = v; draw(); } });
    P.toggle({ label: 'Show points', value: pts, onChange: v => { pts = v; draw(); } });
    P.toggle({ label: 'Reading line', value: reading, onChange: v => { reading = v; draw(); } });
    P.stepper({ label: 'Top of vertical axis', value: 0, min: 0, max: 1000, step: (v) => v >= 100 ? 50 : v >= 20 ? 10 : 5, fmt: v => v || 'auto', onChange: v => { yMax = v || 'auto'; draw(); } });
    P.section('Data');
    const edHost = H('div'); P.raw(edHost);
    let ed = { rows };
    function edRebuild() { clear(edHost); const sub = Panel(edHost); const e = tableEditor(sub, rows, draw, [xl, yl.length > 14 ? 'Value' : yl]); ed = { rows, render: e.render }; }
    edRebuild(); draw();
  }
});

tool({
  id: 'block-graph', name: 'Handy graph', strand: 'stats', years: [0, 1, 2, 3], w: 1000, h: 640,
  desc: 'Build a block graph, pictogram or tally chart live with the class by tapping columns.',
  tags: 'handy graph block graph pictogram tally quick vote',
  icon: '<path d="M6 42h36"/><rect x="9" y="30" width="8" height="8"/><rect x="9" y="20" width="8" height="8"/><rect x="21" y="30" width="8" height="8"/><rect x="33" y="30" width="8" height="8"/><rect x="33" y="20" width="8" height="8"/><rect x="33" y="10" width="8" height="8"/>',
  guide: ['Tap + under a column to add a block and − to take one away. You can also tap the column itself to add.', 'Type the column names in the panel. Up to eight columns.', 'Switch between blocks, a pictogram and a tally chart to compare ways of showing the same data.', 'Great for a quick class vote: everyone comes up and taps their choice.'],
  mount(c) {
    const { svg, P } = c;
    let cols = [['Red', 0], ['Blue', 0], ['Green', 0], ['Yellow', 0]], kind = 'blocks', pict = 'star', each = 1, title = 'Our favourite colours';
    const g = S('g', {}, svg);
    const hues = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'teal', 'pink'];
    function icon(gg, x, y, s, cl, frac = 1) {
      const grp = S('g', { 'pointer-events': 'none' }, gg);
      if (pict === 'star') { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .2 : s * .48; p.push((x + r * Math.cos(a)) + ',' + (y + r * Math.sin(a))); } S('polygon', { points: p.join(' '), fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 1.5 }, grp); }
      else if (pict === 'face') { S('circle', { cx: x, cy: y, r: s * .44, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 1.5 }, grp); S('circle', { cx: x - s * .14, cy: y - s * .08, r: s * .05, fill: 'var(--ink)' }, grp); S('circle', { cx: x + s * .14, cy: y - s * .08, r: s * .05, fill: 'var(--ink)' }, grp); S('path', { d: `M${x - s * .18} ${y + s * .1} q${s * .18} ${s * .18} ${s * .36} 0`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2 }, grp); }
      else S('circle', { cx: x, cy: y, r: s * .44, fill: col(cl), stroke: 'var(--ink)', 'stroke-width': 1.5 }, grp);
      if (frac < 1) { const id = 'cl' + Math.random().toString(36).slice(2, 7); const cp = S('clipPath', { id }, gg); S('rect', { x: x - s / 2, y: y - s / 2, width: s * frac, height: s }, cp); grp.setAttribute('clip-path', `url(#${id})`); }
    }
    const pm = (x, y, i, r = 20) => {
      [[-1, '−', -(r + 6)], [1, '+', r + 6]].forEach(([d, t, dx]) => {
        const b = S('g', { cls: 'hit' }, g);
        S('circle', { cx: x + dx, cy: y, r, fill: d > 0 ? 'var(--accent)' : 'var(--board-2)', stroke: d > 0 ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': 1.5 }, b);
        text(b, x + dx, y + 1, t, { 'font-size': 24, 'font-weight': 800, fill: d > 0 ? 'var(--accent-ink)' : 'var(--ink)' });
        b.addEventListener('click', () => { cols[i][1] = Math.max(0, cols[i][1] + d); draw(); });
      });
    };
    function draw() {
      clear(g);
      text(g, 500, 32, title, { 'font-size': 28, 'font-weight': 800, cls: 'disp' });
      const n = cols.length;
      if (kind === 'tally') {
        const rh = Math.min(66, 540 / n);
        cols.forEach(([name, v], i) => {
          const y = 90 + i * rh;
          S('rect', { x: 40, y: y - rh / 2 + 4, width: 920, height: rh - 8, rx: 12, fill: i % 2 ? 'var(--board)' : 'var(--board-2)' }, g);
          text(g, 64, y, name, { 'font-size': 22, 'font-weight': 700, 'text-anchor': 'start' });
          let x = 240;
          for (let k = 0; k < v; k += 5) { const m = Math.min(5, v - k); for (let j = 0; j < Math.min(m, 4); j++) S('line', { x1: x + j * 12, y1: y - 16, x2: x + j * 12, y2: y + 16, stroke: col(hues[i % 8]), 'stroke-width': 4, 'stroke-linecap': 'round' }, g); if (m === 5) S('line', { x1: x - 6, y1: y + 12, x2: x + 42, y2: y - 12, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); x += 66; }
          text(g, 800, y, String(v), { 'font-size': 26, 'font-weight': 800, cls: 'num' });
          pm(890, y, i, Math.min(20, rh / 2 - 8));
        });
        return;
      }
      const cw = Math.min(150, 860 / n), x0 = 500 - n * cw / 2, y0 = 500;
      const units = cols.map(c2 => kind === 'pict' ? Math.ceil(c2[1] / each) : c2[1]);
      const bs = Math.min(cw * .7, 410 / Math.max(8, ...units));
      cols.forEach(([name, v], i) => {
        const x = x0 + i * cw + cw / 2;
        const hit = S('rect', { x: x - cw / 2 + 4, y: 60, width: cw - 8, height: y0 - 60, rx: 10, fill: 'transparent', cls: 'hit' }, g);
        hit.addEventListener('click', () => { cols[i][1]++; draw(); });
        if (kind === 'blocks') for (let k = 0; k < v; k++) S('rect', { x: x - bs / 2, y: y0 - (k + 1) * bs, width: bs, height: bs - 2, rx: 4, fill: col(hues[i % 8]), stroke: 'var(--ink)', 'stroke-width': 1.5, 'pointer-events': 'none' }, g);
        else { const full = Math.floor(v / each), part = (v % each) / each; for (let k = 0; k < full; k++) icon(g, x, y0 - (k + .5) * bs, bs * .95, hues[i % 8]); if (part) icon(g, x, y0 - (full + .5) * bs, bs * .95, hues[i % 8], part); }
        text(g, x, y0 + 26, name, { 'font-size': 20, 'font-weight': 700 });
        text(g, x, y0 + 56, String(v), { 'font-size': 22, 'font-weight': 800, cls: 'num', fill: 'var(--ink-2)' });
        pm(x, y0 + 98, i);
      });
      S('line', { x1: x0 - 10, y1: y0, x2: x0 + n * cw + 10, y2: y0, stroke: 'var(--ink)', 'stroke-width': 3 }, g);
      if (kind === 'pict') { S('rect', { x: 790, y: 26, width: 190, height: 50, rx: 12, fill: 'var(--board-2)', stroke: 'var(--line)' }, g); icon(g, 822, 51, 34, 'ink-3'); text(g, 846, 51, `stands for ${each}`, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'start' }); }
    }
    P.section('Show as');
    P.seg({ options: [['blocks', 'Blocks'], ['pict', 'Pictogram'], ['tally', 'Tally']], value: kind, onChange: v => { kind = v; pa.el.hidden = pb.el.hidden = v !== 'pict'; draw(); } });
    const pa = P.seg({ label: 'Pictogram symbol', options: [['star', 'Star'], ['face', 'Face'], ['dot', 'Circle']], value: pict, onChange: v => { pict = v; draw(); } });
    const pb = P.seg({ label: 'Each symbol stands for', options: [[1, '1'], [2, '2'], [5, '5'], [10, '10']], value: each, onChange: v => { each = v; draw(); } });
    pa.el.hidden = pb.el.hidden = true;
    P.section('Columns');
    P.field({ label: 'Title', value: title, onChange: v => { title = v; draw(); } });
    const host = H('div'); P.raw(host);
    function names() { clear(host); cols.forEach((cc, i) => { const inp = H('input', { value: cc[0], 'aria-label': 'Column ' + (i + 1) + ' name', style: 'height:36px;width:100%;margin:3px 0;border:1px solid var(--line);border-radius:8px;background:var(--board-2);padding:0 10px' }); inp.addEventListener('input', () => { cc[0] = inp.value; draw(); }); host.append(inp); }); }
    P.buttons([['Add column', () => { if (cols.length < 8) { cols.push(['New', 0]); names(); draw(); } }], ['Remove last', () => { if (cols.length > 1) { cols.pop(); names(); draw(); } }]]);
    P.button('Set all to zero', () => { cols.forEach(cc => cc[1] = 0); draw(); });
    names(); draw();
  }
});

tool({
  id: 'spinners', name: 'Spinners', strand: 'stats', years: [2, 3, 4, 5, 6], w: 1000, h: 640,
  desc: 'Spin up to three spinners, change the size of each section, and compare the chances with the results.',
  tags: 'probability chance spinner random tally likely fair unfair fraction percentage',
  icon: '<circle cx="24" cy="24" r="18"/><path d="M24 6v36M8.4 15l31.2 18M8.4 33l31.2-18"/><path d="M24 24l8-10" stroke-width="3.5"/>',
  guide: ['Choose how many spinners and how many sections each has.', 'Drag the yellow handles on the first spinner to make sections bigger or smaller. A bigger section has a bigger chance of being landed on.', 'The probability of each result is listed as a fraction, a decimal and a percentage.', 'Spin once, ten times or a hundred times and compare the results with the probabilities. With two or three number spinners, the list shows the chance of each total.'],
  mount(c) {
    const { svg, P } = c;
    const U = 72; // 5 degree units
    let n = 1, sides = 4, labels = 'numbers', sizes = null, spins = [], angles = [0, 0, 0], results = [], busy = false;
    const g = S('g', {}, svg);
    const hues = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'teal', 'pink', 'red', 'blue'];
    const geo = () => { const R = n === 1 ? 210 : n === 2 ? 140 : 100; const xs = n === 1 ? [300] : n === 2 ? [165, 465] : [115, 330, 545]; return { R, xs, y: 310 }; };
    const sz = () => sizes || Array(sides).fill(U / sides);
    const label = i => labels === 'numbers' ? String(i + 1) : labels === 'colours' ? hues[i] : 'ABCDEFGHIJ'[i];
    const probs = () => { const s = sz(); return s.map(v => v / U); };
    const fracStr = p => { if (!sizes) { return p === 1 ? '1' : `1/${sides}`; } const num = Math.round(p * U), gg = gcd(num, U); return num === U ? '1' : `${num / gg}/${U / gg}`; };
    function outcomes() {
      const p = probs();
      if (n === 1 || labels !== 'numbers') return p.map((q, i) => ({ k: label(i), p: q, f: sizes ? fracStr(q) : `1/${sides}` }));
      let dist = { 0: 1 }, den = 1;
      for (let s = 0; s < n; s++) { const nd = {}; for (const t in dist) p.forEach((q, i) => { const k = +t + i + 1; nd[k] = (nd[k] || 0) + dist[t] * q; }); dist = nd; }
      const eqDen = sizes ? U ** n : sides ** n;
      return Object.keys(dist).map(Number).sort((a, b) => a - b).map(k => { const num = Math.round(dist[k] * eqDen), gg = gcd(num, eqDen); return { k: String(k), p: dist[k], f: `${num / gg}/${eqDen / gg}` }; });
    }
    function draw() {
      clear(g); const { R, xs, y } = geo(), s = sz();
      xs.forEach((x, k) => {
        const sp = S('g', { cls: 'hit' }, g); let a = -Math.PI / 2;
        s.forEach((v, i) => { const da = v / U * 2 * Math.PI, x1 = x + R * Math.cos(a), y1 = y + R * Math.sin(a), x2 = x + R * Math.cos(a + da), y2 = y + R * Math.sin(a + da); S('path', { d: `M${x} ${y} L${x1} ${y1} A${R} ${R} 0 ${da > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`, fill: col(hues[i]), stroke: 'var(--ink)', 'stroke-width': 3 }, sp); const m = a + da / 2; if (labels !== 'colours' && da > .25) text(sp, x + R * .64 * Math.cos(m), y + R * .64 * Math.sin(m), label(i), { 'font-size': Math.min(R * .24, 20 + da * 30), 'font-weight': 800, fill: hues[i] === 'yellow' ? '#18202E' : '#fff', cls: 'disp' }); a += da; });
        S('circle', { cx: x, cy: y, r: R, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5 }, sp);
        S('path', { d: `M${x - 12} ${y} L${x} ${y - R * .86} L${x + 12} ${y} Z`, fill: 'var(--ink)', transform: `rotate(${angles[k]} ${x} ${y})` }, sp);
        S('circle', { cx: x, cy: y, r: 14, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 4 }, sp);
        sp.addEventListener('click', () => spin());
        if (spins[k] != null) text(g, x, y + R + 34, labels === 'colours' ? hues[spins[k]] : label(spins[k]), { 'font-size': 28, 'font-weight': 800, cls: 'disp' });
        if (k === 0 && sides > 1) { let b = 0; for (let i = 0; i < sides - 1; i++) { b += s[i]; const ang = -Math.PI / 2 + b / U * 2 * Math.PI, hx = x + (R + 14) * Math.cos(ang), hy = y + (R + 14) * Math.sin(ang); const h = S('g', { cls: 'grab' }, g); S('circle', { cx: hx, cy: hy, r: 13, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2.5 }, h);
          c.drag(h, { move: p => { let t = Math.atan2(p.y - y, p.x - x) + Math.PI / 2; if (t < 0) t += 2 * Math.PI; let u = Math.round(t / (2 * Math.PI) * U); const cur = sizes ? sizes.slice() : Array.from({ length: sides }, (_, q) => Math.floor(U / sides) + (q < U % sides ? 1 : 0)); const lo = cur.slice(0, i).reduce((a2, b2) => a2 + b2, 0) + 1, hi = lo - 1 + cur[i] + cur[i + 1] - 1; u = clamp(u, lo, hi); const nv = u - (lo - 1); cur[i + 1] = cur[i] + cur[i + 1] - nv; cur[i] = nv; sizes = cur; results = []; draw(); } }); } }
      });
      // probability table
      const outs = outcomes(), x0 = 660, rowH = Math.min(36, 470 / (outs.length + 1));
      text(g, x0, 40, 'Probability', { 'font-size': 22, 'font-weight': 800, cls: 'disp', 'text-anchor': 'start' });
      text(g, x0, 66, n > 1 && labels === 'numbers' ? 'of each total' : 'of each result', { 'font-size': 14, fill: 'var(--ink-3)', 'text-anchor': 'start' });
      const hx = [x0, x0 + 90, x0 + 170, x0 + 240];
      ['', 'Fraction', 'Decimal', results.length ? 'Results' : '%'].forEach((h, i) => text(g, hx[i] + (i ? 30 : 0), 96, h, { 'font-size': 13, 'font-weight': 800, fill: 'var(--ink-3)' }));
      const maxP = Math.max(...outs.map(o => o.p));
      outs.forEach((o, i) => {
        const yy = 122 + i * rowH, cnt = results.filter(r => r === o.k).length;
        if (n === 1 && labels !== 'numbers') S('rect', { x: x0, y: yy - 9, width: 18, height: 18, rx: 4, fill: col(hues[i]) }, g);
        text(g, x0 + (n === 1 && labels !== 'numbers' ? 30 : 12), yy, labels === 'colours' && n === 1 ? '' : o.k, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'start' });
        S('rect', { x: x0 + 40, y: yy - 4, width: Math.max(2, o.p / maxP * 40), height: 8, rx: 4, fill: 'var(--accent)', opacity: .5 }, g);
        text(g, hx[1] + 30, yy, o.f, { 'font-size': 16, 'font-weight': 700, cls: 'num' });
        text(g, hx[2] + 30, yy, nf(+o.p.toFixed(3)), { 'font-size': 16, cls: 'num' });
        text(g, hx[3] + 30, yy, results.length ? `${cnt} (${Math.round(cnt / results.length * 100)}%)` : `${nf(+(o.p * 100).toFixed(1))}%`, { 'font-size': 16, cls: 'num', 'font-weight': results.length ? 700 : 400 });
      });
      if (results.length) text(g, x0 + 170, 122 + outs.length * rowH + 14, `${results.length} spin${results.length === 1 ? '' : 's'} so far`, { 'font-size': 15, fill: 'var(--ink-2)' });
    }
    function pickIdx() { const s = sz(); let r = Math.random() * U; for (let i = 0; i < s.length; i++) { r -= s[i]; if (r < 0) return i; } return s.length - 1; }
    function angleFor(i) { const s = sz(); const st = s.slice(0, i).reduce((a, b) => a + b, 0); return (st + s[i] * (.2 + Math.random() * .6)) / U * 360; }
    const keyOf = res => n === 1 || labels !== 'numbers' ? res.map(label).join(' + ') : String(res.reduce((t, r) => t + r + 1, 0));
    function spin() {
      if (busy) return; busy = true;
      const res = Array.from({ length: n }, pickIdx), start = angles.slice(0, n), tgt = res.map((r, k) => { const base = start[k] + 720 + Math.random() * 360; const want = angleFor(r); return base + ((want - base % 360) + 360) % 360; }), t0 = performance.now();
      c.raf((dt, now) => { const t = clamp((now - t0) / 1800, 0, 1), e = 1 - (1 - t) ** 3; for (let k = 0; k < n; k++) angles[k] = start[k] + (tgt[k] - start[k]) * e; draw(); if (t >= 1) { spins = res; results.push(keyOf(res)); busy = false; draw(); return false; } });
    }
    function many(m) { for (let i = 0; i < m; i++) { const res = Array.from({ length: n }, pickIdx); results.push(keyOf(res)); spins = res; res.forEach((r, k) => angles[k] = angleFor(r)); } draw(); }
    P.section('Spinners');
    P.seg({ label: 'How many', options: [[1, '1'], [2, '2'], [3, '3']], value: n, onChange: v => { n = v; results = []; spins = []; draw(); } });
    P.stepper({ label: 'Sections', value: sides, min: 2, max: 10, onChange: v => { sides = v; sizes = null; results = []; spins = []; draw(); } });
    P.seg({ label: 'Label sections with', options: [['numbers', 'Numbers'], ['letters', 'Letters'], ['colours', 'Colours']], value: labels, onChange: v => { labels = v; results = []; spins = []; draw(); } });
    P.button('Make all sections equal', () => { sizes = null; results = []; draw(); });
    P.note('Drag the yellow handles to change section sizes.');
    P.section('Spin');
    P.button('Spin', () => spin(), 'primary');
    P.buttons([['Spin 10 times', () => many(10)], ['Spin 100 times', () => many(100)]]);
    P.button('Clear results', () => { results = []; spins = []; draw(); });
    draw();
  }
});

tool({
  id: 'venn', name: 'Venn diagram', strand: 'stats', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Sort shapes or numbers into a Venn diagram with two or three circles, then check. Ready-made problems and free play.',
  tags: 'venn diagram sort sorting classify criteria sets shapes numbers properties even odd multiples',
  icon: '<circle cx="18" cy="24" r="12"/><circle cx="30" cy="24" r="12"/><rect x="2" y="6" width="44" height="36" rx="3"/>',
  guide: ['Choose a problem. The labels show what goes in each circle. Drag every shape or number from the tray into the right place: in a circle, where the circles overlap, or outside both circles.', 'Tap Check. Each item gets a tick or a cross, and the score shows how many are right. Show me moves everything to the right place.', 'Free play: type your own labels for the circles and sort any set of shapes or numbers. Nothing is checked, so the class can decide together.', 'Use two or three circles. Items that fit none of the labels go outside the circles but inside the box.'],
  mount(c) {
    const { svg, P } = c;
    const COLN = { red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow' };
    const SHAPES = { circle: 0, triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 };
    const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
    const CRIT = {
      red: ['Red', o => o.c === 'red'], blue: ['Blue', o => o.c === 'blue'], green: ['Green', o => o.c === 'green'], yellow: ['Yellow', o => o.c === 'yellow'],
      big: ['Big', o => o.big], small: ['Small', o => !o.big], circle: ['Circles', o => o.sh === 'circle'], triangle: ['Triangles', o => o.sh === 'triangle'],
      four: ['Has 4 sides', o => SHAPES[o.sh] === 4], straight: ['Only straight sides', o => o.sh !== 'circle'], more4: ['More than 4 sides', o => SHAPES[o.sh] > 4],
      even: ['Even', o => o.n % 2 === 0], odd: ['Odd', o => o.n % 2 === 1], m3: ['Multiples of 3', o => o.n % 3 === 0], m4: ['Multiples of 4', o => o.n % 4 === 0], m5: ['Multiples of 5', o => o.n % 5 === 0], m10: ['Multiples of 10', o => o.n % 10 === 0], m2: ['Multiples of 2', o => o.n % 2 === 0],
      gt50: ['Greater than 50', o => o.n > 50], lt20: ['Less than 20', o => o.n < 20], sq: ['Square numbers', o => Number.isInteger(Math.sqrt(o.n))], prime: ['Prime numbers', o => isPrime(o.n)], seven: ['Has the digit 7', o => String(o.n).includes('7')], two: ['2-digit numbers', o => o.n >= 10 && o.n <= 99],
    };
    const PROBLEMS = [
      ['shape', ['red', 'circle']], ['shape', ['blue', 'four']], ['shape', ['big', 'triangle']], ['shape', ['straight', 'green']], ['shape', ['more4', 'yellow']], ['shape', ['red', 'big', 'four']],
      ['num', ['even', 'm3']], ['num', ['odd', 'gt50']], ['num', ['m5', 'm2']], ['num', ['sq', 'even']], ['num', ['prime', 'odd']], ['num', ['m10', 'lt20']], ['num', ['seven', 'two']], ['num', ['m2', 'm3', 'm5']],
    ];
    let mode = 'prob', pi = 0, items = [], uid = 0, checked = false, labels = ['', '', ''], nC = 2, freeKind = 'shape';
    c.persist(() => ({ mode, pi, items, uid, checked, labels, nC, freeKind }), s => ({ mode, pi, items, uid, checked, labels, nC, freeKind } = Object.assign({ mode, pi, items, uid, checked, labels, nC, freeKind }, s)));
    const U = { x: 30, y: 20, w: 740, h: 600 }, TRAY = { x: 790, y: 20, w: 290, h: 600 };
    const g = S('g', {}, svg), ig = S('g', {}, svg), og = S('g', {}, svg);
    const circles = () => nC === 2 ? [{ x: 300, y: 330, r: 205 }, { x: 500, y: 330, r: 205 }] : [{ x: 300, y: 250, r: 175 }, { x: 500, y: 250, r: 175 }, { x: 400, y: 420, r: 175 }];
    const crit = () => mode === 'prob' ? PROBLEMS[pi][1].map(k => CRIT[k]) : null;
    const inU = p => p.x > U.x && p.x < U.x + U.w && p.y > U.y && p.y < U.y + U.h;
    const regionAt = p => circles().map(cc => Math.hypot(p.x - cc.x, p.y - cc.y) < cc.r - 4);
    const truth = o => crit().map(([, f]) => !!f(o));
    const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
    function drawItem(gp, o, x, y) {
      if (o.kind === 'num') { S('rect', { x: x - 30, y: y - 22, width: 60, height: 44, rx: 10, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, gp); text(gp, x, y + 1, String(o.n), { 'font-size': 24, 'font-weight': 800, cls: 'disp num' }); return; }
      const r = o.big ? 24 : 15, f = col(o.c), st = { fill: f, stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' };
      const poly = (n, rot = -Math.PI / 2) => { const pts = []; for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1)); } S('polygon', Object.assign({ points: pts.join(' ') }, st), gp); };
      if (o.sh === 'circle') S('circle', Object.assign({ cx: x, cy: y, r }, st), gp);
      else if (o.sh === 'square') S('rect', Object.assign({ x: x - r * .85, y: y - r * .85, width: r * 1.7, height: r * 1.7 }, st), gp);
      else if (o.sh === 'rectangle') S('rect', Object.assign({ x: x - r * 1.15, y: y - r * .62, width: r * 2.3, height: r * 1.24 }, st), gp);
      else poly(SHAPES[o.sh], o.sh === 'triangle' ? -Math.PI / 2 : -Math.PI / 2);
    }
    function trayPos(k, n) { const cols = 4, w = TRAY.w / cols, h = Math.min(66, (TRAY.h - 40) / Math.ceil(n / cols)); return [TRAY.x + w * (k % cols) + w / 2, TRAY.y + 44 + h * Math.floor(k / cols) + h / 2]; }
    function draw() {
      clear(g); clear(ig); clear(og);
      S('rect', { x: U.x, y: U.y, width: U.w, height: U.h, rx: 18, fill: 'var(--board-2)', stroke: 'var(--ink-2)', 'stroke-width': 3 }, g);
      const cs = circles(), cl = ['blue', 'orange', 'green'];
      cs.forEach((cc, i) => S('circle', { cx: cc.x, cy: cc.y, r: cc.r, fill: col(cl[i]), 'fill-opacity': .12, stroke: col(cl[i]), 'stroke-width': 4 }, g));
      const names = mode === 'prob' ? crit().map(([n]) => n) : labels.slice(0, nC);
      const lp = nC === 2 ? [[150, 82], [650, 82]] : [[170, 60], [630, 60], [400, 606]];
      names.forEach((n, i) => { const t = n || (mode === 'free' ? `Label ${i + 1}` : ''), w = Math.max(110, t.length * 12 + 30), [x, y] = lp[i]; S('rect', { x: x - w / 2, y: y - 20, width: w, height: 40, rx: 12, fill: col(cl[i]), stroke: 'var(--ink)', 'stroke-width': 2 }, g); text(g, x, y + 1, t, { 'font-size': 19, 'font-weight': 800, fill: '#fff', cls: 'disp' }); });
      text(g, U.x + U.w - 14, U.y + U.h - 16, nC === 2 ? 'Neither' : 'None of these', { 'font-size': 15, fill: 'var(--ink-3)', 'text-anchor': 'end', 'font-weight': 700 });
      // tray
      S('rect', { x: TRAY.x, y: TRAY.y, width: TRAY.w, height: TRAY.h, rx: 18, fill: 'var(--board)', stroke: 'var(--line-2)', 'stroke-dasharray': '7 6' }, g);
      const left = items.filter(o => !o.placed);
      text(g, TRAY.x + TRAY.w / 2, TRAY.y + 22, left.length ? `Drag these into the diagram (${left.length})` : 'All sorted!', { 'font-size': 15, 'font-weight': 700, fill: 'var(--ink-3)' });
      left.forEach((o, k) => { [o.tx, o.ty] = trayPos(k, left.length); });
      let right = 0;
      items.forEach(o => {
        const x = o.placed ? o.x : o.tx, y = o.placed ? o.y : o.ty, el = S('g', { cls: 'grab' }, ig);
        drawItem(el, o, x, y);
        if (checked && o.placed && mode === 'prob') { const ok = same(regionAt(o), truth(o)); if (ok) right++; S('circle', { cx: x + 22, cy: y - 18, r: 11, fill: ok ? 'var(--green)' : 'var(--red)', stroke: '#fff', 'stroke-width': 2 }, el); text(el, x + 22, y - 17, ok ? '✓' : '✗', { 'font-size': 14, 'font-weight': 800, fill: '#fff' }); }
        let sx, sy;
        c.drag(el, { start: p => { sx = p.x; sy = p.y; ig.append(el); }, move: p => el.setAttribute('transform', `translate(${p.x - sx},${p.y - sy})`), end: p => { const nx = x + p.x - sx, ny = y + p.y - sy; if (inU({ x: nx, y: ny })) { o.placed = true; o.x = clamp(nx, U.x + 26, U.x + U.w - 26); o.y = clamp(ny, U.y + 26, U.y + U.h - 26); } else o.placed = false; checked = false; draw(); } });
      });
      if (checked && mode === 'prob') { const n = items.filter(o => o.placed).length, msg = !n ? 'Drag some items into the diagram first' : `${right} out of ${n} in the right place${n < items.length ? ` (${items.length - n} still in the tray)` : ''}${right === items.length ? '. Brilliant!' : ''}`, w = msg.length * 10.5 + 50; S('rect', { x: U.x + U.w / 2 - w / 2, y: U.y + U.h + 8, width: w, height: 40, rx: 14, fill: right === items.length ? 'var(--green)' : 'var(--ink)', opacity: .94 }, og); text(og, U.x + U.w / 2, U.y + U.h + 29, msg, { 'font-size': 18, 'font-weight': 800, fill: right === items.length ? '#fff' : 'var(--bg)', cls: 'num' }); }
    }
    // pick items so every region has something
    function makeItems(kind, cr) {
      const pool = [];
      if (kind === 'shape') { Object.keys(SHAPES).forEach(sh => Object.keys(COLN).forEach(cc => [true, false].forEach(big => pool.push({ kind: 'shape', sh, c: cc, big })))); }
      else for (let n = 1; n <= 100; n++) pool.push({ kind: 'num', n });
      if (!cr) return shuffle(pool).slice(0, 14);
      const byReg = {}; shuffle(pool).forEach(o => { const k = cr.map(([, f]) => f(o) ? 1 : 0).join(''); (byReg[k] = byReg[k] || []).push(o); });
      const keys = Object.keys(byReg), out = [], want = cr.length === 3 ? 16 : 14;
      let round = 0; while (out.length < want && round < 10) { keys.forEach(k => { if (out.length < want && byReg[k][round]) out.push(byReg[k][round]); }); round++; }
      return shuffle(out);
    }
    function loadProblem(i) { pi = i; const [kind, keys] = PROBLEMS[i]; nC = keys.length; items = makeItems(kind, keys.map(k => CRIT[k])).map(o => ({ ...o, id: ++uid, placed: false })); checked = false; draw(); }
    function showMe() {
      if (mode !== 'prob') return;
      const cs = circles(), taken = [];
      items.forEach(o => {
        const want = truth(o); let best = null;
        for (let t = 0; t < 600 && !best; t++) { const p = { x: U.x + 30 + Math.random() * (U.w - 60), y: U.y + 30 + Math.random() * (U.h - 60) }; if (!same(regionAt(p), want)) continue; if (cs.some(cc => Math.abs(Math.hypot(p.x - cc.x, p.y - cc.y) - cc.r) < 30)) continue; const lb = (nC === 2 ? [[150, 82], [650, 82]] : [[170, 60], [630, 60], [400, 606]]); if (lb.some(([lx, ly]) => Math.abs(p.x - lx) < 130 && Math.abs(p.y - ly) < 46)) continue; if (taken.some(q => Math.hypot(q.x - p.x, q.y - p.y) < Math.max(40, 70 - t / 12))) continue; best = p; }
        if (best) { o.x = best.x; o.y = best.y; o.placed = true; taken.push(best); }
      });
      checked = true; draw();
    }
    const dk = () => [...svg.closest('.work').querySelector('.dock').children];
    P.section('Activity');
    P.seg({ options: [['prob', 'Problems'], ['free', 'Free play']], value: mode, onChange: v => { mode = v; probBits.forEach(e => e.hidden = v !== 'prob'); freeBits.forEach(e => e.hidden = v !== 'free'); if (v === 'prob') loadProblem(pi); else { nC = nCS.get(); items = makeItems(freeKind).map(o => ({ ...o, id: ++uid, placed: false })); checked = false; draw(); } } });
    let before = new Set(dk());
    P.section('Problems');
    const list = H('div', { cls: 'objpick vennpick' });
    PROBLEMS.forEach(([kind, keys], i) => list.append(H('button', { cls: 'btn', text: keys.map(k => CRIT[k][0]).join(' / '), on: { click: () => loadProblem(i) } })));
    P.raw(list);
    P.buttons([['Check', () => { checked = true; draw(); }, 'primary'], ['Show me', showMe]]);
    P.buttons([['Next problem', () => loadProblem((pi + 1) % PROBLEMS.length)], ['Start again', () => loadProblem(pi)]]);
    const probBits = dk().filter(k => !before.has(k)); before = new Set(dk());
    P.section('Free play');
    const nCS = P.seg({ label: 'Circles', options: [[2, '2 circles'], [3, '3 circles']], value: nC, onChange: v => { nC = v; draw(); } });
    [0, 1, 2].forEach(i => P.field({ label: `Label for circle ${i + 1}`, value: labels[i], placeholder: ['e.g. Red', 'e.g. Has 4 sides', 'e.g. Big'][i], onChange: v => { labels[i] = v; draw(); } }));
    P.seg({ label: 'Things to sort', options: [['shape', 'Shapes'], ['num', 'Numbers 1 to 100']], value: freeKind, onChange: v => { freeKind = v; items = makeItems(v).map(o => ({ ...o, id: ++uid, placed: false })); draw(); } });
    P.button('New set to sort', () => { items = makeItems(freeKind).map(o => ({ ...o, id: ++uid, placed: false })); draw(); });
    const freeBits = dk().filter(k => !before.has(k));
    probBits.forEach(e => e.hidden = mode !== 'prob'); freeBits.forEach(e => e.hidden = mode !== 'free');
    if (!items.length) { if (mode === 'prob') loadProblem(pi); else { items = makeItems(freeKind).map(o => ({ ...o, id: ++uid, placed: false })); draw(); } } else draw();
  }
});

tool({
  id: 'carroll', name: 'Carroll diagram', strand: 'stats', years: [1, 2, 3, 4, 5, 6], w: 1100, h: 680,
  desc: 'Sort shapes or numbers into a Carroll diagram with one or two criteria, then check. Ready-made problems and free play.',
  tags: 'carroll diagram sort sorting classify criteria not shapes numbers properties even odd multiples table',
  icon: '<rect x="4" y="6" width="40" height="36" rx="3"/><path d="M16 6v36M4 16h40M30 16v26M16 29h28"/>',
  guide: ['Choose a problem. Each column and row has a label, and the other column or row is its opposite, for example Even and Not even.', 'Drag every shape or number from the tray into the box where it belongs. Each item belongs in exactly one box.', 'Tap Check. Each item gets a tick or a cross. Show me moves everything to the right box.', 'Free play: type your own labels and sort any set of shapes or numbers. Use one criterion for a simple two-column sort, or two for the full grid.'],
  mount(c) {
    const { svg, P } = c;
    const SHAPES = { circle: 0, triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 };
    const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
    const CRIT = {
      red: ['Red', 'Not red', o => o.c === 'red'], blue: ['Blue', 'Not blue', o => o.c === 'blue'], yellow: ['Yellow', 'Not yellow', o => o.c === 'yellow'],
      big: ['Big', 'Small', o => o.big], circle: ['Circle', 'Not a circle', o => o.sh === 'circle'], triangle: ['Triangle', 'Not a triangle', o => o.sh === 'triangle'],
      four: ['4 sides', 'Not 4 sides', o => SHAPES[o.sh] === 4], straight: ['Only straight sides', 'Has a curved side', o => o.sh !== 'circle'], more4: ['More than 4 sides', '4 sides or fewer', o => SHAPES[o.sh] > 4],
      even: ['Even', 'Odd', o => o.n % 2 === 0], m3: ['Multiple of 3', 'Not a multiple of 3', o => o.n % 3 === 0], m4: ['Multiple of 4', 'Not a multiple of 4', o => o.n % 4 === 0], m5: ['Multiple of 5', 'Not a multiple of 5', o => o.n % 5 === 0], m10: ['Multiple of 10', 'Not a multiple of 10', o => o.n % 10 === 0],
      gt50: ['Greater than 50', '50 or less', o => o.n > 50], lt20: ['Less than 20', '20 or more', o => o.n < 20], sq: ['Square number', 'Not a square number', o => Number.isInteger(Math.sqrt(o.n))], prime: ['Prime', 'Not prime', o => isPrime(o.n)], two: ['2-digit', 'Not 2-digit', o => o.n >= 10 && o.n <= 99],
    };
    const PROBLEMS = [['shape', ['red']], ['shape', ['four']], ['shape', ['red', 'circle']], ['shape', ['big', 'four']], ['shape', ['triangle', 'blue']], ['shape', ['straight', 'yellow']], ['shape', ['more4', 'big']], ['num', ['even']], ['num', ['m5']], ['num', ['even', 'm3']], ['num', ['gt50', 'm4']], ['num', ['m5', 'two']], ['num', ['sq', 'even']], ['num', ['prime', 'lt20']], ['num', ['m10', 'gt50']]];
    let mode = 'prob', pi = 2, items = [], uid = 0, checked = false, labels = ['', '', '', ''], nK = 2, freeKind = 'shape';
    c.persist(() => ({ mode, pi, items, uid, checked, labels, nK, freeKind }), s => ({ mode, pi, items, uid, checked, labels, nK, freeKind } = Object.assign({ mode, pi, items, uid, checked, labels, nK, freeKind }, s)));
    const U = { x: 30, y: 20, w: 740, h: 600 }, TRAY = { x: 790, y: 20, w: 290, h: 600 }, HW = 160, HH = 70;
    const g = S('g', {}, svg), ig = S('g', {}, svg), og = S('g', {}, svg);
    const crit = () => mode === 'prob' ? PROBLEMS[pi][1].map(k => CRIT[k]) : null;
    const k2 = () => mode === 'prob' ? crit().length : nK;
    const cellW = () => (U.w - HW) / 2, cellH = () => k2() === 2 ? (U.h - HH) / 2 : U.h - HH;
    const cellRect = (ci, ri) => ({ x: U.x + HW + ci * cellW(), y: U.y + HH + ri * cellH(), w: cellW(), h: cellH() });
    const cellAt = p => { const ci = Math.floor((p.x - U.x - HW) / cellW()), ri = Math.floor((p.y - U.y - HH) / cellH()); if (ci < 0 || ci > 1 || ri < 0 || ri > k2() - 1) return null; return [ci, ri]; };
    const truth = o => { const cr = crit(); return [cr[0][2](o) ? 0 : 1, cr.length === 2 ? (cr[1][2](o) ? 0 : 1) : 0]; };
    function drawItem(gp, o, x, y) {
      if (o.kind === 'num') { S('rect', { x: x - 30, y: y - 22, width: 60, height: 44, rx: 10, fill: 'var(--board)', stroke: 'var(--ink)', 'stroke-width': 2 }, gp); text(gp, x, y + 1, String(o.n), { 'font-size': 24, 'font-weight': 800, cls: 'disp num' }); return; }
      const r = o.big ? 24 : 15, st = { fill: col(o.c), stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linejoin': 'round' };
      const poly = n => { const pts = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1)); } S('polygon', Object.assign({ points: pts.join(' ') }, st), gp); };
      if (o.sh === 'circle') S('circle', Object.assign({ cx: x, cy: y, r }, st), gp);
      else if (o.sh === 'square') S('rect', Object.assign({ x: x - r * .85, y: y - r * .85, width: r * 1.7, height: r * 1.7 }, st), gp);
      else if (o.sh === 'rectangle') S('rect', Object.assign({ x: x - r * 1.15, y: y - r * .62, width: r * 2.3, height: r * 1.24 }, st), gp);
      else poly(SHAPES[o.sh]);
    }
    function trayPos(k, n) { const cols = 4, w = TRAY.w / cols, h = Math.min(66, (TRAY.h - 40) / Math.ceil(n / cols)); return [TRAY.x + w * (k % cols) + w / 2, TRAY.y + 44 + h * Math.floor(k / cols) + h / 2]; }
    function heads() {
      if (mode === 'prob') { const cr = crit(); return { cols: [cr[0][0], cr[0][1]], rows: cr.length === 2 ? [cr[1][0], cr[1][1]] : [''] }; }
      return { cols: [labels[0] || 'Label 1', labels[1] || (labels[0] ? 'Not ' + labels[0].toLowerCase() : 'Label 2')], rows: nK === 2 ? [labels[2] || 'Label 3', labels[3] || (labels[2] ? 'Not ' + labels[2].toLowerCase() : 'Label 4')] : [''] };
    }
    function wrapText(t, n) { const out = []; let line = ''; t.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function draw() {
      clear(g); clear(ig); clear(og);
      const h = heads(), rows = k2();
      S('rect', { x: U.x, y: U.y, width: U.w, height: U.h, rx: 18, fill: 'var(--board-2)', stroke: 'var(--ink-2)', 'stroke-width': 3 }, g);
      const cl = ['blue', 'orange'];
      h.cols.forEach((t, ci) => { const r = cellRect(ci, 0); S('rect', { x: r.x + 6, y: U.y + 8, width: r.w - 12, height: HH - 16, rx: 12, fill: col(cl[0]), 'fill-opacity': ci ? .55 : 1, stroke: 'var(--ink)', 'stroke-width': 2 }, g); text(g, r.x + r.w / 2, U.y + HH / 2, t, { 'font-size': t.length > 18 ? 16 : 19, 'font-weight': 800, fill: '#fff', cls: 'disp' }); });
      if (rows === 2) h.rows.forEach((t, ri) => { const r = cellRect(0, ri); S('rect', { x: U.x + 8, y: r.y + 6, width: HW - 16, height: r.h - 12, rx: 12, fill: col(cl[1]), 'fill-opacity': ri ? .55 : 1, stroke: 'var(--ink)', 'stroke-width': 2 }, g); const ls = wrapText(t, 12); ls.forEach((l, j) => text(g, U.x + HW / 2, r.y + r.h / 2 + (j - (ls.length - 1) / 2) * 22, l, { 'font-size': 17, 'font-weight': 800, fill: '#fff', cls: 'disp' })); });
      else text(g, U.x + HW / 2, U.y + HH + cellH() / 2, 'Sort', { 'font-size': 18, 'font-weight': 800, fill: 'var(--ink-3)' });
      for (let ci = 0; ci < 2; ci++) for (let ri = 0; ri < rows; ri++) { const r = cellRect(ci, ri); S('rect', { x: r.x + 4, y: r.y + 4, width: r.w - 8, height: r.h - 8, rx: 12, fill: 'var(--board)', stroke: 'var(--line-2)', 'stroke-width': 2 }, g); }
      S('rect', { x: TRAY.x, y: TRAY.y, width: TRAY.w, height: TRAY.h, rx: 18, fill: 'var(--board)', stroke: 'var(--line-2)', 'stroke-dasharray': '7 6' }, g);
      const left = items.filter(o => !o.placed);
      text(g, TRAY.x + TRAY.w / 2, TRAY.y + 22, left.length ? `Drag these into the diagram (${left.length})` : 'All sorted!', { 'font-size': 15, 'font-weight': 700, fill: 'var(--ink-3)' });
      left.forEach((o, k) => { [o.tx, o.ty] = trayPos(k, left.length); });
      let right = 0;
      items.forEach(o => {
        const x = o.placed ? o.x : o.tx, y = o.placed ? o.y : o.ty, el = S('g', { cls: 'grab' }, ig);
        drawItem(el, o, x, y);
        if (checked && o.placed && mode === 'prob') { const at = cellAt(o), t = truth(o), ok = at && at[0] === t[0] && at[1] === t[1]; if (ok) right++; S('circle', { cx: x + 22, cy: y - 18, r: 11, fill: ok ? 'var(--green)' : 'var(--red)', stroke: '#fff', 'stroke-width': 2 }, el); text(el, x + 22, y - 17, ok ? '✓' : '✗', { 'font-size': 14, 'font-weight': 800, fill: '#fff' }); }
        let sx, sy;
        c.drag(el, { start: p => { sx = p.x; sy = p.y; ig.append(el); }, move: p => el.setAttribute('transform', `translate(${p.x - sx},${p.y - sy})`), end: p => { const q = { x: x + p.x - sx, y: y + p.y - sy }, at = cellAt(q); if (at) { const r = cellRect(...at); o.placed = true; o.x = clamp(q.x, r.x + 30, r.x + r.w - 30); o.y = clamp(q.y, r.y + 30, r.y + r.h - 30); } else o.placed = false; checked = false; draw(); } });
      });
      if (checked && mode === 'prob') { const n = items.filter(o => o.placed).length, msg = !n ? 'Drag some items into the diagram first' : `${right} out of ${n} in the right box${n < items.length ? ` (${items.length - n} still in the tray)` : ''}${right === items.length ? '. Brilliant!' : ''}`, w = msg.length * 10.5 + 50; S('rect', { x: U.x + U.w / 2 - w / 2, y: U.y + U.h + 8, width: w, height: 40, rx: 14, fill: right === items.length ? 'var(--green)' : 'var(--ink)', opacity: .94 }, og); text(og, U.x + U.w / 2, U.y + U.h + 29, msg, { 'font-size': 18, 'font-weight': 800, fill: right === items.length ? '#fff' : 'var(--bg)', cls: 'num' }); }
    }
    function makeItems(kind, cr) {
      const pool = [];
      if (kind === 'shape') { Object.keys(SHAPES).forEach(sh => ['red', 'blue', 'green', 'yellow'].forEach(cc => [true, false].forEach(big => pool.push({ kind: 'shape', sh, c: cc, big })))); }
      else for (let n = 1; n <= 100; n++) pool.push({ kind: 'num', n });
      if (!cr) return shuffle(pool).slice(0, 14);
      const byReg = {}; shuffle(pool).forEach(o => { const k = cr.map(c3 => c3[2](o) ? 1 : 0).join(''); (byReg[k] = byReg[k] || []).push(o); });
      const keys = Object.keys(byReg), out = []; let round = 0; while (out.length < 14 && round < 12) { keys.forEach(k => { if (out.length < 14 && byReg[k][round]) out.push(byReg[k][round]); }); round++; }
      return shuffle(out);
    }
    function loadProblem(i) { pi = i; const [kind, keys] = PROBLEMS[i]; items = makeItems(kind, keys.map(k => CRIT[k])).map(o => ({ ...o, id: ++uid, placed: false })); checked = false; draw(); }
    function showMe() {
      if (mode !== 'prob') return;
      const groups = {}; items.forEach(o => { const t = truth(o).join(','); (groups[t] = groups[t] || []).push(o); });
      Object.entries(groups).forEach(([k, list]) => { const [ci, ri] = k.split(',').map(Number), r = cellRect(ci, ri), cols = Math.max(2, Math.floor((r.w - 20) / 72)); list.forEach((o, j) => { o.placed = true; o.x = r.x + 46 + (j % cols) * ((r.w - 92) / Math.max(1, cols - 1)); o.y = r.y + 46 + Math.floor(j / cols) * 64; }); });
      checked = true; draw();
    }
    const freshFree = () => { items = makeItems(freeKind).map(o => ({ ...o, id: ++uid, placed: false })); checked = false; draw(); };
    P.section('Activity');
    P.seg({ options: [['prob', 'Problems'], ['free', 'Free play']], value: mode, onChange: v => { mode = v; pG.hidden = v !== 'prob'; fG.hidden = v !== 'free'; (v === 'prob' ? pG : fG).open = true; if (v === 'prob') loadProblem(pi); else freshFree(); } });
    P.group('Problems', { open: mode === 'prob' }); const pG = P.lastGroup;
    const list = H('div', { cls: 'objpick vennpick' });
    PROBLEMS.forEach(([kind, keys], i) => list.append(H('button', { cls: 'btn', text: keys.map(k => CRIT[k][0]).join(' / '), on: { click: () => loadProblem(i) } })));
    P.raw(list);
    P.buttons([['Check', () => { checked = true; draw(); }, 'primary'], ['Show me', showMe]]);
    P.buttons([['Next problem', () => loadProblem((pi + 1) % PROBLEMS.length)], ['Start again', () => loadProblem(pi)]]);
    P.group('Free play', { open: mode === 'free' }); const fG = P.lastGroup;
    P.seg({ label: 'Criteria', options: [[1, 'One (2 columns)'], [2, 'Two (grid)']], value: nK, onChange: v => { nK = v; items.forEach(o => o.placed = false); draw(); } });
    [['Column 1', 'e.g. Red'], ['Column 2', 'e.g. Not red'], ['Row 1', 'e.g. Big'], ['Row 2', 'e.g. Small']].forEach(([l, ph], i) => P.field({ label: l, value: labels[i], placeholder: ph, onChange: v => { labels[i] = v; draw(); } }));
    P.seg({ label: 'Things to sort', options: [['shape', 'Shapes'], ['num', 'Numbers 1 to 100']], value: freeKind, onChange: v => { freeKind = v; freshFree(); } });
    P.button('New set to sort', freshFree);
    pG.hidden = mode !== 'prob'; fG.hidden = mode !== 'free';
    if (!items.length) { if (mode === 'prob') loadProblem(pi); else freshFree(); } else draw();
  }
});

