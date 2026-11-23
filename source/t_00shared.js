const PV_NAMES = { 9: 'B', 8: 'HM', 7: 'TM', 6: 'M', 5: 'HTh', 4: 'TTh', 3: 'Th', 2: 'H', 1: 'T', 0: 'O', '-1': 't', '-2': 'h', '-3': 'th' };
const PV_COLS = { 6: 'pink', 5: 'orange', 4: 'teal', 3: 'purple', 2: 'green', 1: 'blue', 0: 'red' };
function numWords(n) {
  if (!n) return 'zero';
  const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], t = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const two = x => x < 20 ? a[x] : t[Math.floor(x / 10)] + (x % 10 ? '-' + a[x % 10] : '');
  const three = x => { const h = Math.floor(x / 100), r = x % 100; return (h ? a[h] + ' hundred' + (r ? ' and ' : '') : '') + (r ? two(r) : ''); };
  const parts = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]; let out = [], r = n;
  for (const [v, w] of parts) { if (r >= v) { out.push(three(Math.floor(r / v)) + ' ' + w); r %= v; } }
  if (r) out.push((out.length && r < 100 ? 'and ' : '') + three(r));
  return out.join(' ');
}
const PLACE_WORD = { 0: 'one', 1: 'ten', 2: 'hundred', 3: 'thousand', 4: 'ten thousand', 5: 'hundred thousand', 6: 'million' };


/* shared: balance scales. Returns pan centres for a given tilt in degrees. */
function balancePans(ang, cx = 500, cy = 200, arm = 270) { const a = ang * Math.PI / 180; return [{ x: cx - arm * Math.cos(a), y: cy - arm * Math.sin(a) }, { x: cx + arm * Math.cos(a), y: cy + arm * Math.sin(a) }]; }
function drawBalance(g, ang, opt = {}) {
  const cx = opt.cx || 500, cy = opt.cy || 200, ps = balancePans(ang, cx, cy, opt.arm || 270), base = opt.base || 470;
  S('path', { d: `M${cx - 30} ${base} L${cx} ${cy + 10} L${cx + 30} ${base} Z`, fill: 'var(--ink-2)' }, g);
  S('rect', { x: cx - 110, y: base - 4, width: 220, height: 18, rx: 6, fill: 'var(--ink-2)' }, g);
  S('line', { x1: ps[0].x, y1: ps[0].y, x2: ps[1].x, y2: ps[1].y, stroke: 'var(--ink)', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
  S('circle', { cx, cy, r: 12, fill: 'var(--yellow)', stroke: 'var(--ink)', 'stroke-width': 2 }, g);
  const hang = opt.hang || 130;
  ps.forEach((p, k) => {
    S('path', { d: `M${p.x} ${p.y} L${p.x - 120} ${p.y + hang} M${p.x} ${p.y} L${p.x + 120} ${p.y + hang}`, stroke: 'var(--ink-3)', 'stroke-width': 2 }, g);
    S('path', { d: `M${p.x - 140} ${p.y + hang} H${p.x + 140} Q${p.x + 120} ${p.y + hang + 30} ${p.x} ${p.y + hang + 30} Q${p.x - 120} ${p.y + hang + 30} ${p.x - 140} ${p.y + hang} Z`, fill: k ? 'var(--blue-s)' : 'var(--red-s)', stroke: k ? 'var(--blue)' : 'var(--red)', 'stroke-width': 3 }, g);
  });
  return ps.map(p => ({ x: p.x, y: p.y + hang }));
}
function tiltFor(L, R) { const m = Math.max(Math.abs(L), Math.abs(R), 1); return Math.abs(L - R) < 1e-9 ? 0 : clamp((R - L) / m * 22, -16, 16) + (R > L ? 2 : -2); }

/* shared: place value colours and labels used by counters, Dienes and column methods */
const PVC = p => ['red', 'blue', 'green', 'purple', 'teal', 'orange', 'pink'][((p % 7) + 7) % 7];
const PV_LONG = { 9: 'Billions', 8: 'Hundred millions', 7: 'Ten millions', 6: 'Millions', 5: 'Hundred thousands', 4: 'Ten thousands', 3: 'Thousands', 2: 'Hundreds', 1: 'Tens', 0: 'Ones', '-1': 'Tenths', '-2': 'Hundredths', '-3': 'Thousandths' };
const pvVal = p => p >= 0 ? big(10 ** p) : '0.' + '0'.repeat(-p - 1) + '1';

/* shared: a place value chart of counters with animated exchanges.
   set(cols, opt): cols = { p: [{ id, kind: 'a' | 'b', mark }] }
   opt.fly = { goneId: targetId } sends removed counters to a new counter
   opt.spawn = { newId: goneId } makes new counters burst out of a removed one
   opt.layout = { p: { rows, per } } lays a column out as rows (sharing), otherwise rows of five
   opt.hl = p highlights a column; opt.instant skips animation */
function CounterChart(c, root, o) {
  const g = S('g', {}, root), cg = S('g', {}, root), els = new Map();
  let cfg = null, last = {}, posOf = {};
  const geo = () => { const n = o.places.length, W = o.w / n; return { n, W, X: p => o.x + o.places.indexOf(p) * W }; };
  function chart(hl) {
    clear(g); const { W, X } = geo(), top = o.y, bot = o.y + o.h;
    o.places.forEach((p, i) => {
      const x = X(p), cl = PVC(p);
      S('rect', { x, y: top, width: W, height: o.h, fill: p === hl ? 'var(--yellow-s)' : p < 0 ? 'var(--orange-s)' : i % 2 ? 'var(--board-2)' : 'var(--board)', stroke: 'var(--line)', 'stroke-width': 1.5 }, g);
      S('rect', { x, y: top, width: W, height: 44, fill: col(cl), opacity: .14 }, g);
      text(g, x + W / 2, top + 23, W > 150 && o.long !== false ? PV_LONG[p] : PV_NAMES[p], { 'font-size': W > 150 ? 20 : 18, 'font-weight': 800, cls: 'disp', fill: col(cl) });
    });
    const dp = o.places.indexOf(-1); if (dp > 0) S('circle', { cx: o.x + dp * geo().W, cy: top + 36, r: 6, fill: 'var(--ink)' }, g);
    if (o.decor) o.decor(g, geo());
  }
  function arr(cnt) {
    const { W } = geo(), H = o.h - 64;
    const fit = (per, grp) => { const rows = Math.ceil(Math.max(cnt, 1) / per), gaps = Math.floor(Math.max(rows - 1, 0) / grp) * 8; return Math.min(((W - 16) / per - 4) / 2, ((H - gaps) / rows - 4) / 2, 26); };
    const a = { per: 5, grp: 2, r: fit(5, 2) }, b = { per: 2, grp: 5, r: fit(2, 5) };
    const best = b.r > a.r + 3 ? b : a; best.r = Math.max(7, best.r); return best;
  }
  function sizeFor(p, cnt, lay) {
    const { W } = geo(), H = o.h - 64;
    if (lay) { const r = Math.min((W - 16) / Math.max(lay.per, 1) / 2 - 2, (H - 10) / (lay.rows + (lay.extra ? 1.4 : 0)) / 2 - 3, 26); return Math.max(7, r); }
    return arr(cnt).r;
  }
  function place(p, list, lay) {
    const { W, X } = geo(), r = sizeFor(p, list.length, lay), d = 2 * r + 4, cx = X(p) + W / 2, y0 = o.y + 56 + r;
    const out = {};
    if (lay) {
      const n = lay.rows * lay.per;
      list.forEach((it, k) => {
        if (k < n) { const row = Math.floor(k / lay.per), q = k % lay.per; out[it.id] = [cx + (q - (lay.per - 1) / 2) * d, y0 + row * (d + 4), r]; }
        else { const q = k - n; out[it.id] = [cx + (q - (Math.min(list.length - n, 6) - 1) / 2) * d, y0 + lay.rows * (d + 4) + 14 + Math.floor(q / 6) * d, r]; }
      });
    } else { const A = arr(list.length); list.forEach((it, k) => { const row = Math.floor(k / A.per), q = k % A.per; out[it.id] = [cx + (q - (A.per - 1) / 2) * d, y0 + row * d + Math.floor(row / A.grp) * 8, r]; }); }
    return out;
  }
  function counterEl(it, p, r) {
    const cl = PVC(p), outer = S('g', { cls: o.bind ? 'grab' : '', style: 'transition:transform .5s cubic-bezier(.3,.8,.3,1),opacity .4s' }, cg), inner = S('g', { style: 'transition:transform .35s cubic-bezier(.3,1.4,.5,1);transform:scale(.1)' }, outer);
    outer._inner = inner; draw1(outer, it, p, r); return outer;
  }
  function draw1(outer, it, p, r) {
    const inner = outer._inner, cl = PVC(p); clear(inner); outer._r = r; outer._k = (it.kind || 'a') + (it.mark ? 'm' : '') + (it.ring ? 'r' : '');
    const lab = pvVal(p), b = it.kind === 'b';
    S('circle', { r, fill: b ? 'var(--board)' : col(cl), stroke: b ? col(cl) : 'var(--ink)', 'stroke-width': b ? 3.5 : 1.6 }, inner);
    if (it.ring) S('circle', { r: r + 5, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, inner);
    if (r >= 11) text(inner, 0, 1, lab, { 'font-size': Math.min(r * .9, r * 2.7 / lab.length), 'font-weight': 800, cls: 'num', fill: b ? col(cl) : '#fff', 'pointer-events': 'none' });
    if (it.mark) { S('path', { d: `M${-r * .8} ${-r * .8} L${r * .8} ${r * .8} M${r * .8} ${-r * .8} L${-r * .8} ${r * .8}`, stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }, inner); outer.style.opacity = .55; } else outer.style.opacity = 1;
  }
  const api = {
    get geo() { return geo(); },
    colAt(x) { const { W } = geo(), i = Math.floor((x - o.x) / W); return i >= 0 && i < o.places.length ? o.places[i] : null; },
    pos: id => posOf[id],
    config(places) { o.places = places; els.forEach(e => e.remove()); els.clear(); chart(); },
    set(cols, opt = {}) {
      chart(opt.hl);
      const want = new Map(), next = {};
      o.places.forEach(p => { const list = cols[p] || []; const ps = place(p, list, opt.layout && opt.layout[p]); list.forEach(it => { want.set(it.id, [it, p]); next[it.id] = ps[it.id]; }); });
      // removed
      els.forEach((el, id) => {
        if (want.has(id)) return; els.delete(id);
        const tgt = opt.fly && opt.fly[id] != null ? next[opt.fly[id]] : null;
        if (tgt && !opt.instant) { el.style.transform = `translate(${tgt[0]}px,${tgt[1]}px)`; setTimeout(() => { el.style.opacity = 0; }, 380); setTimeout(() => el.remove(), 800); }
        else if (opt.instant) el.remove();
        else { el._inner.style.transform = 'scale(.1)'; el.style.opacity = 0; setTimeout(() => el.remove(), 400); }
      });
      const anyFly = opt.fly && Object.keys(opt.fly).length;
      want.forEach(([it, p], id) => {
        const [x, y, r] = next[id]; let el = els.get(id);
        if (!el) {
          el = counterEl(it, p, r); els.set(id, el);
          const from = opt.spawn && opt.spawn[id] != null ? (posOf[opt.spawn[id]] || null) : null;
          if (opt.instant) { el.style.transition = 'none'; el.style.transform = `translate(${x}px,${y}px)`; el._inner.style.transition = 'none'; el._inner.style.transform = 'scale(1)'; requestAnimationFrame(() => { el.style.transition = 'transform .5s cubic-bezier(.3,.8,.3,1),opacity .4s'; el._inner.style.transition = 'transform .35s cubic-bezier(.3,1.4,.5,1)'; }); }
          else {
            el.style.transform = `translate(${(from || [x])[0]}px,${(from || [x, y])[1]}px)`;
            const delay = anyFly && !from ? 520 : from ? 60 : 30;
            setTimeout(() => { el.style.transform = `translate(${x}px,${y}px)`; el._inner.style.transform = 'scale(1)'; }, delay);
          }
          if (o.bind) o.bind(el, it, p);
        } else {
          if (el._r !== r || el._k !== (it.kind || 'a') + (it.mark ? 'm' : '') + (it.ring ? 'r' : '')) draw1(el, it, p, r);
          el._inner.style.transform = 'scale(1)';
          el.style.transform = `translate(${x}px,${y}px)`;
        }
        cg.append(el);
      });
      posOf = next; last = cols;
    },
  };
  chart();
  return api;
}

/* shared: a place value chart with several rows (for example first number, second number, total).
   set({ rows: { key: { p: [items] } }, digits: { key: { p: '7' } } }, opt)
   items: { id, kind: 'a' solid | 'b' outline | 'g' ghost, mark, ring }. The same id in a different row slides there. */
function RowChart(c, root, o) {
  const g = S('g', {}, root), cg = S('g', {}, root), dg = S('g', {}, root), els = new Map();
  let posOf = {};
  const DH = o.digitsH ?? 34, HD = 40, LW = o.labelW || 0;
  const geo = () => { const n = o.places.length, W = (o.w - LW) / n, RH = (o.h - HD) / o.rows.length; return { n, W, RH, X: p => o.x + LW + o.places.indexOf(p) * W, Y: ri => o.y + HD + ri * RH }; };
  function chart(opt = {}) {
    clear(g); const { W, RH, X, Y } = geo();
    o.places.forEach((p, i) => {
      const x = X(p), cl = PVC(p);
      S('rect', { x, y: o.y, width: W, height: o.h, fill: p === opt.hl ? 'var(--yellow-s)' : p < 0 ? 'var(--orange-s)' : i % 2 ? 'var(--board-2)' : 'var(--board)', stroke: 'var(--line)', 'stroke-width': 1.5 }, g);
      S('rect', { x, y: o.y, width: W, height: HD, fill: col(cl), opacity: .14 }, g);
      text(g, x + W / 2, o.y + HD / 2 + 1, W > 150 ? PV_LONG[p] : PV_NAMES[p], { 'font-size': W > 150 ? 19 : 17, 'font-weight': 800, cls: 'disp', fill: col(cl) });
    });
    o.rows.forEach((r, ri) => {
      const y = Y(ri);
      if (ri) S('line', { x1: o.x, y1: y, x2: o.x + o.w, y2: y, stroke: r.total ? 'var(--ink)' : 'var(--line-2)', 'stroke-width': r.total ? 3 : 1.5, 'stroke-dasharray': r.total ? null : '6 5' }, g);
      if (opt.hlRow === r.key) S('rect', { x: o.x + LW, y: y + 2, width: o.w - LW, height: RH - 4, fill: 'var(--accent)', opacity: .06 }, g);
      if (LW) { text(g, o.x + LW / 2, y + RH / 2 - (r.sub ? 10 : 0), r.label, { 'font-size': 16, 'font-weight': 800, fill: r.total ? 'var(--accent)' : 'var(--ink-2)', cls: 'disp' }); if (r.sub) text(g, o.x + LW / 2, y + RH / 2 + 12, r.sub, { 'font-size': 13, fill: 'var(--ink-3)' }); }
      if (r.sign && LW >= 120) text(g, o.x + 14, y + RH / 2, r.sign, { 'font-size': 28, 'font-weight': 800, fill: 'var(--ink-2)' });
    });
    if (LW) S('line', { x1: o.x + LW, y1: o.y, x2: o.x + LW, y2: o.y + o.h, stroke: 'var(--line-2)', 'stroke-width': 1.5 }, g);
    const dp = o.places.indexOf(-1); if (dp > 0) S('circle', { cx: o.x + LW + dp * W, cy: o.y + HD / 2, r: 6, fill: 'var(--ink)' }, g);
  }
  function arr(cnt) {
    const { W, RH } = geo(), H = RH - DH - 10;
    const fit = (per, grp) => { const rows = Math.ceil(Math.max(cnt, 1) / per), gaps = Math.floor(Math.max(rows - 1, 0) / grp) * 6; return Math.min(((W - 12) / per - 3) / 2, ((H - gaps) / rows - 3) / 2, 24); };
    const a = { per: 5, grp: 2, r: fit(5, 2) }, b = { per: 2, grp: 5, r: fit(2, 5) };
    const best = b.r > a.r + 3 ? b : a; best.r = Math.max(5, best.r); return best;
  }
  function placeCell(p, ri, list) {
    const { W, X, Y } = geo(), A = arr(list.length), d = 2 * A.r + 3, cx = X(p) + W / 2, y0 = Y(ri) + 8 + A.r, out = {};
    list.forEach((it, k) => { const row = Math.floor(k / A.per), q = k % A.per; out[it.id] = [cx + (q - (A.per - 1) / 2) * d, y0 + row * d + Math.floor(row / A.grp) * 6, A.r]; });
    return out;
  }
  const keyOf = it => (it.kind || 'a') + (it.mark ? 'm' : '') + (it.ring ? 'r' : '');
  function draw1(outer, it, p, r) {
    const inner = outer._inner, cl = PVC(p); clear(inner); outer._r = r; outer._k = keyOf(it); outer._p = p;
    const lab = pvVal(p), b = it.kind === 'b', gh = it.kind === 'g';
    if (gh) { S('circle', { r, fill: 'none', stroke: col(cl), 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: .7 }, inner); return; }
    S('circle', { r, fill: b ? 'var(--board)' : col(cl), stroke: b ? col(cl) : 'var(--ink)', 'stroke-width': b ? 3 : 1.5 }, inner);
    if (it.ring) S('circle', { r: r + 4, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }, inner);
    if (r >= 10) text(inner, 0, 1, lab, { 'font-size': Math.min(r * .9, r * 2.7 / lab.length), 'font-weight': 800, cls: 'num', fill: b ? col(cl) : '#fff', 'pointer-events': 'none' });
    if (it.mark) S('path', { d: `M${-r * .8} ${-r * .8} L${r * .8} ${r * .8} M${r * .8} ${-r * .8} L${-r * .8} ${r * .8}`, stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, inner);
    outer.style.opacity = it.mark ? .55 : 1;
  }
  const api = {
    get geo() { return geo(); },
    set(state, opt = {}) {
      chart(opt); clear(dg);
      const { W, RH, X, Y } = geo(), want = new Map(), next = {};
      o.rows.forEach((r, ri) => o.places.forEach(p => { const list = ((state.rows || {})[r.key] || {})[p] || []; const ps = placeCell(p, ri, list); list.forEach(it => { want.set(it.id, [it, p]); next[it.id] = ps[it.id]; }); }));
      // digits
      if (o.digits !== false) o.rows.forEach((r, ri) => o.places.forEach(p => { const d = ((state.digits || {})[r.key] || {})[p]; if (d == null) return; const hot = opt.hot && opt.hot[r.key + p]; text(dg, X(p) + W / 2, Y(ri) + RH - DH / 2 - 2, String(d), { 'font-size': Math.min(30, DH * .95), 'font-weight': 800, cls: 'disp num', fill: hot ? 'var(--accent)' : r.total ? 'var(--ink)' : 'var(--ink-2)' }); }));
      els.forEach((el, id) => {
        if (want.has(id)) return; els.delete(id);
        const tgt = opt.fly && opt.fly[id] != null ? next[opt.fly[id]] : null;
        if (tgt && !opt.instant) { el.style.transform = `translate(${tgt[0]}px,${tgt[1]}px)`; setTimeout(() => { el.style.opacity = 0; }, 420); setTimeout(() => el.remove(), 850); }
        else if (opt.instant) el.remove();
        else { el._inner.style.transform = 'scale(.1)'; el.style.opacity = 0; setTimeout(() => el.remove(), 420); }
      });
      const anyFly = opt.fly && Object.keys(opt.fly).length;
      want.forEach(([it, p], id) => {
        const [x, y, r] = next[id]; let el = els.get(id);
        if (!el) {
          el = S('g', { style: 'transition:transform .6s cubic-bezier(.3,.8,.3,1),opacity .4s' }, cg); el._inner = S('g', { style: 'transition:transform .35s cubic-bezier(.3,1.4,.5,1);transform:scale(.1)' }, el); draw1(el, it, p, r); els.set(id, el);
          const from = opt.spawn && opt.spawn[id] != null ? posOf[opt.spawn[id]] : null;
          if (opt.instant) { el.style.transition = 'none'; el.style.transform = `translate(${x}px,${y}px)`; el._inner.style.transition = 'none'; el._inner.style.transform = 'scale(1)'; requestAnimationFrame(() => { el.style.transition = 'transform .6s cubic-bezier(.3,.8,.3,1),opacity .4s'; el._inner.style.transition = 'transform .35s cubic-bezier(.3,1.4,.5,1)'; }); }
          else { el.style.transform = `translate(${(from || [x])[0]}px,${(from || [x, y])[1]}px)`; const delay = anyFly && !from ? 560 : from ? 60 : 30; setTimeout(() => { el.style.transform = `translate(${x}px,${y}px)`; el._inner.style.transform = 'scale(1)'; }, delay); }
        } else {
          if (el._r !== r || el._k !== keyOf(it) || el._p !== p) draw1(el, it, p, r);
          el._inner.style.transform = 'scale(1)'; el.style.transform = `translate(${x}px,${y}px)`;
          if (opt.instant) { el.style.transition = 'none'; requestAnimationFrame(() => el.style.transition = 'transform .6s cubic-bezier(.3,.8,.3,1),opacity .4s'); }
        }
        cg.append(el);
      });
      posOf = next;
    },
    reset() { els.forEach(e => e.remove()); els.clear(); posOf = {}; },
  };
  chart();
  return api;
}

/* shared: step-by-step column addition and subtraction, as written method items plus counter chart states */
function pvDecs(s) { return (String(s).split('.')[1] || '').length; }
function pvAddSteps(As, Bs) {
  const dp = Math.max(pvDecs(As), pvDecs(Bs)), lo = -dp, A = Math.round(+As * 10 ** dp), B = Math.round(+Bs * 10 ** dp), Sm = A + B;
  const len = N => String(N).length, dg = (N, p) => Math.floor(N / 10 ** (p - lo)) % 10;
  const hiA = Math.max(len(A) - 1 + lo, 0), hiB = Math.max(len(B) - 1 + lo, 0), hiS = Math.max(len(Sm) - 1 + lo, 0), hi = Math.max(hiA, hiB, hiS);
  const decA = pvDecs(As), decB = pvDecs(Bs), sing = p => PV_LONG[p].toLowerCase().replace(/s$/, ''), plur = p => PV_LONG[p].toLowerCase();
  const places = range(lo, hi).reverse();
  let id = 0; const rows = { A: {}, B: {}, T: {} }, digits = { A: {}, B: {}, T: {} }; places.forEach(p => { rows.A[p] = []; rows.B[p] = []; rows.T[p] = []; });
  const items = [];
  for (let p = lo; p <= hiA; p++) { const ph = p < 0 && -p > decA, d = dg(A, p); items.push({ r: 'A', p, t: String(d), grey: ph }); digits.A[p] = d; if (!ph) for (let k = 0; k < d; k++) rows.A[p].push({ id: ++id, kind: 'a' }); }
  for (let p = lo; p <= hiB; p++) { const ph = p < 0 && -p > decB, d = dg(B, p); items.push({ r: 'B', p, t: String(d), grey: ph }); digits.B[p] = d; if (!ph) for (let k = 0; k < d; k++) rows.B[p].push({ id: ++id, kind: 'b' }); }
  const frames = [], snap = () => JSON.parse(JSON.stringify({ rows, digits }));
  const push = (msg, opt = {}) => frames.push({ items: items.map(x => ({ ...x })), msg, state: snap(), opt });
  push(`Write the numbers in columns so the digits line up by place value${dp ? ', with the decimal points in line. Fill any empty decimal places with a zero' : ''}. Start with the ${plur(lo)}.`);
  let carry = 0;
  for (let p = lo; p <= hi; p++) {
    const da = p <= hiA ? dg(A, p) : 0, db = p <= hiB ? dg(B, p) : 0, s = da + db + carry;
    if (p > Math.max(hiA, hiB) && !carry) break;
    rows.T[p] = [...rows.T[p], ...rows.A[p], ...rows.B[p]]; rows.A[p] = []; rows.B[p] = [];
    const sumTxt = p > Math.max(hiA, hiB) ? `There is just the 1 exchanged ${sing(p)}.` : `${PV_LONG[p]}: ${da} + ${db}${carry ? ' + 1 exchanged' : ''} = ${s}.`;
    if (s >= 10) {
      push(`${sumTxt} Put them together: that makes ${s} ${plur(p)}, which is ten or more.`, { hl: p, hot: {} });
      const nu = { id: ++id, kind: 'a' }, fly = {}; rows.T[p].slice(0, 10).forEach(x => fly[x.id] = nu.id); rows.T[p] = rows.T[p].slice(10); rows.T[p + 1] = rows.T[p + 1] || []; rows.T[p + 1].push(nu);
      digits.T[p] = s - 10;
      items.push({ r: 'ANS', p, t: String(s - 10), hot: 1 }, { r: 'CAR', p: p + 1, t: '1', small: 1, hot: 1 });
      push(`Exchange ten ${plur(p)} for one ${sing(p + 1)}. Write ${s - 10} in the ${plur(p)} column and carry the 1 into the ${plur(p + 1)} column.`, { hl: p, fly, hot: { ['T' + p]: 1 } });
      carry = 1;
    } else {
      digits.T[p] = s; items.push({ r: 'ANS', p, t: String(s), hot: 1 });
      push(`${sumTxt} Put them together and write ${s} in the ${plur(p)} column.`, { hl: p, hot: { ['T' + p]: 1 } }); carry = 0;
    }
    items.forEach(x => x.hot = 0);
  }
  items.forEach(x => { if (x.r === 'ANS') x.done = 1; });
  const fmt = (n, d) => big(+(+n).toFixed(d));
  push(`${fmt(As, dp)} + ${fmt(Bs, dp)} = ${fmt(+As + +Bs, dp)}`, { end: 1 });
  return { lo, hi, dp, places, frames };
}
function pvSubSteps(As, Bs) {
  const dp = Math.max(pvDecs(As), pvDecs(Bs)), lo = -dp, A = Math.round(+As * 10 ** dp), B = Math.round(+Bs * 10 ** dp), D = A - B;
  const len = N => String(N).length, dg = (N, p) => Math.floor(N / 10 ** (p - lo)) % 10;
  const hiA = Math.max(len(A) - 1 + lo, 0), hiB = Math.max(len(B) - 1 + lo, 0), decA = pvDecs(As), decB = pvDecs(Bs), sing = p => PV_LONG[p].toLowerCase().replace(/s$/, ''), plur = p => PV_LONG[p].toLowerCase();
  const places = range(lo, hiA).reverse();
  let id = 0; const rows = { A: {}, B: {}, T: {} }, digits = { A: {}, B: {}, T: {} }; places.forEach(p => { rows.A[p] = []; rows.B[p] = []; rows.T[p] = []; });
  const w = {}, hist = {}, items = [];
  for (let p = lo; p <= hiA; p++) { const ph = p < 0 && -p > decA; w[p] = dg(A, p); hist[p] = [w[p]]; digits.A[p] = w[p]; if (!ph) for (let k = 0; k < w[p]; k++) rows.A[p].push({ id: ++id, kind: 'a' }); items.push({ r: 'A', p, t: String(w[p]), grey: ph, key: 'a' + p }); }
  for (let p = lo; p <= hiB; p++) { const d = dg(B, p); items.push({ r: 'B', p, t: String(d), grey: p < 0 && -p > decB }); digits.B[p] = d; for (let k = 0; k < d; k++) rows.B[p].push({ id: ++id, kind: 'g' }); }
  const histItems = () => { const out = []; for (let p = lo; p <= hiA; p++) { const h = hist[p]; if (h.length > 1) { out.push({ r: 'A', p, t: String(h[0]), struck: 1 }); h.slice(1).forEach((v, k) => out.push({ r: 'X', p, t: String(v), small: 1, struck: k < h.length - 2, sub: k, of: h.length - 1 })); } } return out; };
  const frames = [], snap = () => JSON.parse(JSON.stringify({ rows, digits }));
  const push = (msg, opt = {}) => { const base = items.filter(x => !(x.key && hist[x.p].length > 1)); frames.push({ items: [...base, ...histItems()].map(x => ({ ...x })), msg, state: snap(), opt }); };
  const clearTaken = () => places.forEach(p => { rows.B[p] = rows.B[p].filter(x => !x.mark); });
  push(`Make the first number with counters. The second number shows as dotted circles: that is what we take away. Start with the ${plur(lo)}.`);
  for (let p = lo; p <= hiA; p++) {
    const db = p <= hiB ? dg(B, p) : 0;
    if (w[p] < db) {
      let q = p + 1; while (w[q] === 0) q++; const cur0 = w[p];
      for (let k = q; k > p; k--) {
        clearTaken();
        w[k] -= 1; hist[k].push(w[k]); w[k - 1] += 10; hist[k - 1].push(w[k - 1]); digits.A[k] = w[k]; digits.A[k - 1] = w[k - 1];
        const gone = rows.A[k].pop(), spawn = {};
        for (let j = 0; j < 10; j++) { const nu = { id: ++id, kind: 'a' }; spawn[nu.id] = gone.id; rows.A[k - 1].push(nu); }
        const why = k === q ? (q === p + 1 ? `${PV_LONG[p]}: ${cur0} − ${db}. There are not enough ${plur(p)} to take away ${db}, so exchange one ${sing(k)} for ten ${plur(k - 1)}.` : `${PV_LONG[p]}: ${cur0} − ${db}. There are not enough ${plur(p)}, and no ${plur(p + 1)} to exchange, so start with the ${plur(q)}: exchange one ${sing(k)} for ten ${plur(k - 1)}.`) : `Now exchange one of those ${plur(k)} for ten ${plur(k - 1)}.`;
        push(`${why} The ${hist[k][hist[k].length - 2]} becomes ${w[k]} and the ${plur(k - 1)} become ${w[k - 1]}.`, { hl: p, spawn, hot: { ['A' + k]: 1, ['A' + (k - 1)]: 1 } });
      }
    }
    clearTaken();
    const r = w[p] - db;
    if (db) {
      const take = rows.A[p].slice(-db); rows.A[p] = rows.A[p].slice(0, rows.A[p].length - db);
      rows.B[p] = take.map(x => ({ ...x, mark: true }));
      push(`${PV_LONG[p]}: take away ${db}. Move ${db} ${db === 1 ? sing(p) : plur(p)} onto the dotted circles and cross them out.`, { hl: p });
      clearTaken();
    }
    const lead = p > Math.max(len(D) - 1 + lo, 0) && r === 0;
    rows.T[p] = rows.A[p]; rows.A[p] = []; if (!lead) digits.T[p] = r;
    if (!lead) items.push({ r: 'ANS', p, t: String(r), hot: 1 });
    push(lead ? `${PV_LONG[p]}: ${w[p]} − ${db} = 0. We do not need a zero at the front of the answer.` : `${PV_LONG[p]}: ${w[p]} − ${db} = ${r}. ${r} ${r === 1 ? sing(p) : plur(p)} left: write ${r} in the ${plur(p)} column.`, { hl: p, hot: { ['T' + p]: 1 } });
    items.forEach(x => x.hot = 0);
  }
  items.forEach(x => { if (x.r === 'ANS') x.done = 1; });
  const fmt = (n, d) => big(+(+n).toFixed(d));
  push(`${fmt(As, dp)} − ${fmt(Bs, dp)} = ${fmt(+As - +Bs, dp)}`, { end: 1 });
  return { lo, hi: hiA, dp, places, frames };
}
