/* ===== ITP Studio core ===== */
const NS = 'http://www.w3.org/2000/svg';
const STYLE_KEYS = new Set(['fill', 'stroke', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'pointer-events', 'cursor', 'stroke-dasharray']);
function setA(e, a) {
  for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k === 'text') { e.textContent = v; continue; }
    if (k === 'on') { for (const ev in v) e.addEventListener(ev, v[ev]); continue; }
    if (k === 'cls') { e.setAttribute('class', v); continue; }
    if (k === 'style') { e.style.cssText += ';' + v; continue; }
    if (STYLE_KEYS.has(k)) { e.style.setProperty(k, typeof v === 'number' && k === 'font-size' ? v + 'px' : v); continue; }
    e.setAttribute(k, v);
  }
  return e;
}
/* colour-blind mode: coloured shapes get a pattern on top as well as their colour */
const CB = { on: false, shapes: new Set(['circle', 'rect', 'path', 'polygon', 'ellipse']), map: {} };
['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'].forEach(k => CB.map[`var(--${k})`] = k); CB.map['var(--bead-a)'] = 'red';
try { CB.on = JSON.parse(localStorage.getItem('itp:cb')) === true; } catch (e) { }
function cbDefs() {
  if (document.getElementById('cb-defs')) return;
  const ink = 'rgba(0,0,0,.42)', sv = document.createElementNS(NS, 'svg'); sv.id = 'cb-defs'; sv.setAttribute('width', 0); sv.setAttribute('height', 0); sv.style.position = 'absolute';
  const P2 = { red: `<path d="M-2 2l4-4M0 10L10 0M8 12l4-4" stroke="${ink}" stroke-width="2.4"/>`, blue: `<circle cx="5" cy="5" r="1.9" fill="${ink}"/>`, green: `<path d="M0 3h10M0 8h10" stroke="${ink}" stroke-width="1.8"/>`, yellow: `<path d="M0 0L10 10M10 0L0 10" stroke="${ink}" stroke-width="1.3"/>`, purple: `<path d="M3 0v10M8 0v10" stroke="${ink}" stroke-width="1.8"/>`, orange: `<path d="M-2 8l4 4M0 0l10 10M8 -2l4 4" stroke="${ink}" stroke-width="2.4"/>`, pink: `<circle cx="5" cy="5" r="2.6" fill="none" stroke="${ink}" stroke-width="1.4"/>`, teal: `<rect x="0" y="0" width="5" height="5" fill="${ink}"/><rect x="5" y="5" width="5" height="5" fill="${ink}"/>` };
  sv.innerHTML = '<defs>' + Object.entries(P2).map(([k, v]) => `<pattern id="cbp-${k}" width="10" height="10" patternUnits="userSpaceOnUse">${v}</pattern>`).join('') + '</defs>';
  document.body.append(sv);
}
function S(tag, a = {}, parent) {
  const e = setA(document.createElementNS(NS, tag), a);
  if (parent) {
    parent.appendChild(e);
    if (CB.on && CB.shapes.has(tag) && typeof a.fill === 'string' && CB.map[a.fill] && !(a.opacity != null && +a.opacity < .6) && !(a['fill-opacity'] != null && +a['fill-opacity'] < .6)) { const o = e.cloneNode(false); o.removeAttribute('class'); o.style.fill = `url(#cbp-${CB.map[a.fill]})`; o.style.stroke = 'none'; o.style.pointerEvents = 'none'; o.style.fillOpacity = ''; parent.appendChild(o); }
  }
  return e;
}
function H(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in a) {
    const v = a[k]; if (v == null || v === false) continue;
    if (k === 'on') { for (const ev in v) e.addEventListener(ev, v[ev]); }
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'cls') e.className = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b, s = 1) => { const r = []; for (let v = a; s > 0 ? v <= b + 1e-9 : v >= b - 1e-9; v += s) r.push(+v.toFixed(6)); return r; };
function nf(n, dp) { if (n == null || isNaN(n)) return ''; let v = dp != null ? (+n).toFixed(dp) : String(+(+n).toFixed(6)); return v.replace('-', '−'); }
function big(n) { return (+n).toLocaleString('en-GB', { maximumFractionDigits: 6 }).replace('-', '−'); }
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const col = n => `var(--${n})`;
const PALETTE = ['red', 'yellow', 'green', 'blue', 'purple', 'orange', 'pink', 'teal'];

function svgPt(svg, evt) {
  const p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
  const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
}

/* ---------- registry ---------- */
const TOOLS = [];
function tool(def) { TOOLS.push(def); }
const STRANDS = [
  { id: 'number', name: 'Number and place value', c: 'blue' },
  { id: 'addsub', name: 'Addition and subtraction', c: 'green' },
  { id: 'muldiv', name: 'Multiplication and division', c: 'purple' },
  { id: 'frac', name: 'Fractions, decimals and ratio', c: 'orange' },
  { id: 'geom', name: 'Geometry', c: 'teal' },
  { id: 'meas', name: 'Measurement', c: 'red' },
  { id: 'stats', name: 'Statistics and probability', c: 'pink' },
];
const YEARS = [['all', 'All years'], [0, 'EYFS'], [1, 'Y1'], [2, 'Y2'], [3, 'Y3'], [4, 'Y4'], [5, 'Y5'], [6, 'Y6']];
function yearText(ys) {
  const n = ys.map(y => y === 0 ? 'EYFS' : 'Y' + y);
  return n.length > 2 ? n[0] + '–' + n[n.length - 1] : n.join(', ');
}

const store = {
  get(k, d) { try { const v = localStorage.getItem('itp:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('itp:' + k, JSON.stringify(v)); } catch (e) { } }
};

const APP_VERSION = '2.2', APP_BUILD = '__BUILD__';
function toast(msg) {
  const t = H('div', { cls: 'toast', role: 'status', text: msg });
  document.body.append(t); setTimeout(() => t.remove(), 1800);
}

/* ---------- control panel builder ---------- */
function Panel(root) {
  let host = root;
  const P = {
    section(title) { host = root; if (title) host.append(H('h3', { text: title })); return P; },
    // expandable group: everything added after it goes inside until the next section() or group()
    group(title, o = {}) {
      const d = H('details', { cls: 'pgroup' }), body = H('div', { cls: 'pgroup-body' });
      const sum = H('summary', {}, H('span', { cls: 'pg-t', text: title }), o.hint ? H('span', { cls: 'pg-h', text: o.hint }) : '', H('span', { cls: 'pg-chev', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' }));
      d.append(sum, body); if (o.open) d.open = true;
      d.addEventListener('toggle', () => {
        if (d.open && o.solo !== false) root.querySelectorAll('details.pgroup[open]').forEach(x => { if (x !== d) x.open = false; });
        o.onToggle && o.onToggle(d.open);
      });
      root.append(d); host = body; P.lastGroup = d; return P;
    },
    stepper(o) {
      const vals = o.values;
      let v = o.value;
      const out = H('output', { 'aria-live': 'polite' });
      const show = () => out.textContent = o.fmt ? o.fmt(v) : nf(v);
      const go = d => {
        let nv;
        if (vals) { const i = vals.indexOf(v); nv = vals[clamp((i < 0 ? 0 : i) + d, 0, vals.length - 1)]; }
        else { const st = typeof o.step === 'function' ? o.step(v, d) : (o.step || 1); nv = clamp(+(v + d * st).toFixed(6), o.min ?? -Infinity, o.max ?? Infinity); }
        if (nv !== v) { v = nv; show(); o.onChange && o.onChange(v); }
      };
      const lid = 'c' + Math.random().toString(36).slice(2, 8);
      const row = H('div', { cls: 'ctl' }, H('span', { cls: 'l', id: lid, text: o.label }),
        H('div', { cls: 'stp', role: 'group', 'aria-labelledby': lid },
          H('button', { 'aria-label': 'Decrease ' + o.label, text: '−', on: { click: () => go(-1) } }), out,
          H('button', { 'aria-label': 'Increase ' + o.label, text: '+', on: { click: () => go(1) } })));
      host.append(row); show();
      return { get: () => v, set(nv, silent) { v = nv; show(); if (!silent && o.onChange) o.onChange(v); }, el: row, setMax(m) { o.max = m; if (v > m) this.set(m); }, setMin(m) { o.min = m; if (v < m) this.set(m); } };
    },
    toggle(o) {
      let v = !!o.value;
      const b = H('button', { cls: 'sw-t', role: 'switch', 'aria-checked': String(v), 'aria-label': o.label });
      b.addEventListener('click', () => { v = !v; b.setAttribute('aria-checked', String(v)); o.onChange && o.onChange(v); });
      const row = H('div', { cls: 'ctl' }, H('span', { cls: 'l', text: o.label }), b);
      host.append(row);
      return { get: () => v, set(nv, silent) { v = !!nv; b.setAttribute('aria-checked', String(v)); if (!silent && o.onChange) o.onChange(v); }, el: row };
    },
    seg(o) {
      let v = o.value; const btns = [];
      const seg = H('div', { cls: 'seg', role: 'group' });
      const sync = () => btns.forEach(([val, b]) => b.setAttribute('aria-pressed', String(val === v)));
      for (const [val, label] of o.options) {
        const b = H('button', { text: label, on: { click: () => { if (v === val && !o.retrigger) return; v = val; sync(); o.onChange && o.onChange(v); } } });
        btns.push([val, b]); seg.append(b);
      }
      const w = H('div', { cls: 'segwrap' }, o.label ? H('span', { text: o.label }) : null, seg);
      host.append(w); sync();
      return { get: () => v, set(nv, silent) { v = nv; sync(); if (!silent && o.onChange) o.onChange(v); }, el: w };
    },
    button(label, fn, kind) { const b = H('button', { cls: 'btn' + (kind ? ' ' + kind : ''), text: label, on: { click: fn } }); host.append(b); return b; },
    buttons(list) { const r = H('div', { cls: 'btnrow' }); for (const [l, fn, k] of list) r.append(H('button', { cls: 'btn' + (k ? ' ' + k : ''), text: l, on: { click: fn } })); host.append(r); return r; },
    swatches(o) {
      let v = o.value; const w = H('div', { cls: 'swatches', role: 'group', 'aria-label': o.label || 'Colour' }); const bs = [];
      const sync = () => bs.forEach(([c, b]) => b.setAttribute('aria-pressed', String(c === v)));
      for (const c of o.colors || PALETTE) { const b = H('button', { 'aria-label': c, style: `background:var(--${c})`, on: { click: () => { v = c; sync(); o.onChange && o.onChange(v); } } }); bs.push([c, b]); w.append(b); }
      if (o.label) host.append(H('div', { cls: 'note', text: o.label }));
      host.append(w); sync(); return { get: () => v, set(nv, silent) { v = nv; sync(); if (!silent && o.onChange) o.onChange(v); } };
    },
    field(o) {
      const id = o.id || ('f' + Math.random().toString(36).slice(2, 8));
      const inp = H(o.multiline ? 'textarea' : 'input', { id, type: o.type || 'text', value: o.value ?? '', placeholder: o.placeholder || '', step: o.stepAttr, style: o.multiline ? 'height:110px;padding:8px 12px;resize:vertical' : null });
      if (o.multiline) inp.value = o.value ?? '';
      inp.addEventListener(o.live === false ? 'change' : 'input', () => o.onChange && o.onChange(inp.value));
      host.append(H('label', { cls: 'field', for: id }, H('span', { text: o.label }), inp));
      return { get: () => inp.value, set(v) { inp.value = v; }, el: inp };
    },
    note(t) { const n = H('p', { cls: 'note', text: t }); host.append(n); return n; },
    raw(el) { host.append(el); return el; },
  };
  return P;
}

/* ---------- icons ---------- */
const UI_ICONS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
};
const ui = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${UI_ICONS[k]}</svg>`;

/* ---------- pen overlay ---------- */
function Pen(wrap) {
  const cv = H('canvas', { cls: 'pen', 'aria-hidden': 'true' });
  const bar = H('div', { cls: 'penbar', hidden: true, role: 'toolbar', 'aria-label': 'Annotation tools' });
  wrap.append(cv, bar);
  const g = cv.getContext('2d');
  let strokes = [], cur = null, tool = { kind: 'pen', c: 'ink' }, size = 4, hsize = 22;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim() || '#000';
  const HL = { 'hl-yellow': '#FFE34D', 'hl-green': '#7CF29A', 'hl-pink': '#FF8AD0', 'hl-blue': '#7CC8FF', 'hl-orange': '#FFB061' };
  const btns = [];
  const pick = (b, t) => { tool = t; btns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); sl.value = t.kind === 'hl' ? hsize : size; out.textContent = sl.value; };
  const group = (label, ...kids) => H('div', { cls: 'pg' }, H('span', { cls: 'pgl', text: label }), H('div', { cls: 'pgr' }, ...kids));
  const mkB = (label, t, inner) => { const b = H('button', { 'aria-label': label, title: label, on: { click: () => pick(b, t) } }, inner); btns.push(b); return b; };
  const pens = ['ink', 'red', 'blue', 'green', 'purple', 'orange'].map(c => mkB('Pen ' + (c === 'ink' ? 'black' : c), { kind: 'pen', c }, H('i', { style: `background:var(--${c})` })));
  const hls = Object.keys(HL).map(k => mkB('Highlighter ' + k.slice(3), { kind: 'hl', c: k }, H('i', { cls: 'hl', style: `background:${HL[k]}` })));
  const eraser = mkB('Eraser', { kind: 'erase' }, H('span', { html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M16 4l5 5-10 10H6l-3-3z"/><path d="M11 9l5 5M6 19h14"/></svg>' }));
  const sl = H('input', { type: 'range', min: 1, max: 40, value: size, 'aria-label': 'Pen size' });
  const out = H('output', { cls: 'num', text: String(size) });
  const dot = H('i', { cls: 'szdot' });
  sl.addEventListener('input', () => { const v = +sl.value; if (tool.kind === 'hl') hsize = v; else size = v; out.textContent = v; dot.style.width = dot.style.height = Math.max(4, Math.min(26, v)) + 'px'; });
  const act = (label, svg, fn) => H('button', { cls: 'act', 'aria-label': label, title: label, html: svg + `<span>${label}</span>`, on: { click: fn } });
  bar.append(
    group('Pen', ...pens), H('i', { cls: 'sep' }),
    group('Highlighter', ...hls), H('i', { cls: 'sep' }),
    group('Size', H('label', { cls: 'szw' }, sl, out)), H('i', { cls: 'sep' }),
    group('Tools', eraser,
      act('Undo', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>', () => { strokes.pop(); draw(); }),
      act('Clear all', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>', () => { strokes = []; draw(); }))
  );
  pens[0].setAttribute('aria-pressed', 'true');
  function size_() { const r = wrap.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); draw(); }
  function draw() {
    g.clearRect(0, 0, cv.width, cv.height);
    for (const s of strokes) {
      g.globalCompositeOperation = s.kind === 'erase' ? 'destination-out' : s.kind === 'hl' ? 'multiply' : 'source-over';
      g.strokeStyle = s.kind === 'erase' ? '#000' : s.kind === 'hl' ? HL[s.c] : css(s.c);
      g.globalAlpha = s.kind === 'hl' ? .5 : 1;
      g.lineWidth = s.w; g.lineCap = s.kind === 'hl' ? 'square' : 'round'; g.lineJoin = 'round';
      g.beginPath(); s.p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (s.p.length === 1) g.lineTo(s.p[0][0] + .1, s.p[0][1]); g.stroke();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  const loc = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); const w = tool.kind === 'hl' ? hsize : tool.kind === 'erase' ? Math.max(size * 3, 18) : size; cur = { kind: tool.kind, c: tool.c, w, p: [loc(e)] }; strokes.push(cur); draw(); });
  cv.addEventListener('pointermove', e => { if (cur) { cur.p.push(loc(e)); draw(); } });
  const end = () => cur = null; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  const ro = new ResizeObserver(size_); ro.observe(wrap);
  dot.style.width = dot.style.height = size + 'px';
  return { toggle(v) { cv.classList.toggle('on', v); bar.hidden = !v; }, destroy() { ro.disconnect(); } };
}

/* ---------- saved boards and share links ---------- */
const Boards = {
  all() { return store.get('boards', []); },
  put(list) { store.set('boards', list); },
  b64u(bytes) { let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); },
  async encode(o) {
    const s = JSON.stringify(o);
    try { if (window.CompressionStream) { const st = new Blob([s]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'z' + this.b64u(new Uint8Array(await new Response(st).arrayBuffer())); } } catch (e) { }
    return 'j' + this.b64u(new TextEncoder().encode(s));
  },
  async decode(code) {
    const bytes = this.unb64u(code.slice(1));
    if (code[0] === 'z') { const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); return JSON.parse(await new Response(st).text()); }
    return JSON.parse(new TextDecoder().decode(bytes));
  },
  async link(id, state) { return location.origin + location.pathname + location.search + '#' + id + '/b=' + await this.encode(state); },
  async copy(txt) { try { await navigator.clipboard.writeText(txt); return true; } catch (e) { return false; } },
  when(t) { try { return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch (e) { return ''; } },
};

/* ---------- app ---------- */
const App = {
  cleanup: [], current: null,
  init() {
    this.home = document.getElementById('home'); this.view = document.getElementById('tool');
    this.year = store.get('year', 'all'); this.q = '';
    const th = store.get('theme', null); if (th) document.documentElement.setAttribute('data-theme', th);
    if (CB.on) cbDefs();
    this.buildHome();
    this.route(true);
    PWA.init();
    window.addEventListener('hashchange', () => this.route(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.current && !document.fullscreenElement) this.showHome(); });
  },
  async route(first) {
    let h = ''; try { h = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { }
    const [id, rest] = h.split('/'), t = TOOLS.find(t => t.id === id);
    if (!t) { if (first) this.showHome(); return; }
    if (rest && rest.startsWith('b=')) {
      try { const st = await Boards.decode(rest.slice(2)); this.open(t.id, true, st); toast('Opened a shared board'); return; }
      catch (e) { toast('That board link did not work, so the program opened blank'); }
    }
    if (first || !this.current || this.current.id !== t.id) this.open(t.id, true);
  },
  buildHome() {
    const h = this.home; clear(h);
    const inner = H('div', { cls: 'hm' }); h.append(inner);
    const word = H('span', { cls: 'word' }, ...[...'ITP Studio'].map(ch => H('span', { text: ch })));
    inner.append(H('header', { cls: 'hm-top' },
      H('div', { cls: 'brand2', html: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="6" width="40" height="36" rx="8" fill="#fffaf0" stroke="#1c1430" stroke-width="4"/><path d="M10 16h28M10 24h28M10 32h28" stroke="#1c1430" stroke-width="2.5"/><circle cx="16" cy="16" r="4" fill="#ff6b5b" stroke="#1c1430" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#ffcb3d" stroke="#1c1430" stroke-width="2"/><circle cx="31" cy="32" r="4" fill="#5cc2ff" stroke="#1c1430" stroke-width="2"/></svg>' }, word),
      H('nav', {}, PWA.button(), this.cbSwitch(), this.themeSwitch())));
    const hero = H('section', { cls: 'hero2' },
      H('div', {},
        H('h1', { html: 'Maths you can <em>see</em> and <em>move</em>' }),
        H('p', { cls: 'lede', text: `${TOOLS.length} interactive maths teaching programs for today's boards, tablets and laptops. Every one has a pen, full screen and a controls panel you can move or hide.` })),
      H('div', { cls: 'hero-art', 'aria-hidden': 'true', html: HERO_ART }));
    inner.append(hero);
    const search = H('input', { type: 'search', id: 'tool-search', placeholder: 'Find a program: fractions, clock, bead…', 'aria-label': 'Find a program' });
    search.addEventListener('input', () => { this.q = search.value.toLowerCase().trim(); this.renderTiles(); });
    const chips = H('div', { cls: 'chips2', role: 'group', 'aria-label': 'Year group' });
    for (const [v, l] of YEARS) chips.append(H('button', { cls: 'pill chip2', 'data-y': String(v), 'aria-pressed': String(this.year === v), text: l, on: { click: () => { this.year = v; store.set('year', v); chips.querySelectorAll('.chip2').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.y === String(v)))); this.renderTiles(); } } }));
    inner.append(H('div', { cls: 'filters2' }, H('label', { cls: 'search2', html: ui('search') }, search), chips));
    this.tilesHost = H('div'); inner.append(this.tilesHost);
    inner.append(H('p', { cls: 'foot2', text: 'Tip: each program has its own link, so you can bookmark the ones you use most. Press Esc in any program to come back here.' }));
    inner.append(H('p', { cls: 'copy2', html: `ITP Studio version ${APP_VERSION} · ${APP_BUILD}<br>© ${new Date().getFullYear()} <a href="https://www.lionelwalden.cambs.sch.uk" target="_blank" rel="noopener">Lionel Walden Primary School</a>. All rights reserved.` }));
    this.renderTiles();
  },
  cbSwitch() {
    const b = H('button', { cls: 'pill tsw', role: 'switch', 'aria-checked': String(CB.on), title: 'Add patterns to coloured counters, beads and blocks so colours can be told apart without colour vision' }, H('span', { cls: 'lbl', text: 'Colour-blind patterns' }), H('i', { cls: 'knob' }));
    b.addEventListener('click', () => { CB.on = !CB.on; store.set('cb', CB.on); b.setAttribute('aria-checked', String(CB.on)); if (CB.on) cbDefs(); toast(CB.on ? 'Coloured objects will have patterns too' : 'Patterns off'); });
    return b;
  },
  themeSwitch() {
    const on = this.isDark();
    const b = H('button', { cls: 'pill tsw', role: 'switch', 'aria-checked': String(on), title: 'Dark backgrounds inside the programs' }, H('span', { cls: 'lbl', text: 'Dark boards' }), H('i', { cls: 'knob' }));
    b.addEventListener('click', () => { this.cycleTheme(); b.setAttribute('aria-checked', String(this.isDark())); toast(this.isDark() ? 'Programs will open with dark boards' : 'Programs will open with light boards'); });
    return b;
  },
  isDark() { const cur = document.documentElement.getAttribute('data-theme'); return cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; },
  surprise() { const pool = TOOLS.filter(t => this.year === 'all' || t.years.includes(this.year)); this.open(pool[rnd(0, pool.length - 1)].id); },
  favs() { return new Set(store.get('favs', [])); },
  toggleFav(id) { const f = this.favs(); f.has(id) ? f.delete(id) : f.add(id); store.set('favs', [...f]); return f.has(id); },
  renderTiles() {
    const host = clear(this.tilesHost); let any = false;
    const TC = ['#ffcb3d', '#ff6b5b', '#5cc2ff', '#9be15d', '#b597ff', '#ff9ad5', '#4fe3b9', '#ff9a3d'];
    const favs = this.favs(), open = new Set(store.get('openStrands', []));
    const match = t => (this.year === 'all' || t.years.includes(this.year)) && (!this.q || (t.name + ' ' + t.desc + ' ' + (t.tags || '')).toLowerCase().includes(this.q));
    const tile = t => {
      const cc = TC[TOOLS.indexOf(t) % TC.length], s = STRANDS.find(x => x.id === t.strand), on = favs.has(t.id);
      const heart = H('button', { cls: 'heart', 'aria-pressed': String(on), 'aria-label': (on ? 'Remove ' : 'Add ') + t.name + (on ? ' from' : ' to') + ' favourites', title: on ? 'Remove from favourites' : 'Add to favourites', html: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3.1 1.5-1.8 3-3.1 5.2-3.1 3.8 0 5.8 3.9 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>' });
      heart.addEventListener('click', e => { e.stopPropagation(); this.toggleFav(t.id); this.renderTiles(); });
      const el = H('div', { cls: 'tile2', role: 'button', tabindex: '0', 'aria-label': 'Open ' + t.name, style: `--c:${cc}`, on: { click: () => this.open(t.id), keydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.open(t.id); } } } },
        H('span', { cls: 'thumb2', html: `<svg viewBox="0 0 48 48" fill="none" stroke="${cc}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${t.icon || ''}</svg>` }, heart),
        H('span', { cls: 'tb' }, H('span', { cls: 'name', text: t.name }), H('span', { cls: 'blurb', text: t.desc }),
          H('span', { cls: 'meta2' }, H('span', { cls: 'tag', text: yearText(t.years) }), H('span', { text: s.name.split(',')[0].replace(' and place value', '') }))));
      return el;
    };
    const favList = TOOLS.filter(t => favs.has(t.id) && match(t));
    if (favList.length) { any = true; host.append(H('section', { cls: 'favs2' }, H('h2', { cls: 'favh' }, H('span', { cls: 'fh', html: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3.1 1.5-1.8 3-3.1 5.2-3.1 3.8 0 5.8 3.9 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>' }), 'Your favourites', H('small', { text: favList.length + (favList.length === 1 ? ' program' : ' programs') })), H('div', { cls: 'tiles2' }, ...favList.map(tile)))); }
    const boards = Boards.all().filter(b => { const t = TOOLS.find(x => x.id === b.tool); return t && match(t) || (t && this.q && b.name.toLowerCase().includes(this.q)); });
    if (boards.length) {
      any = true;
      const list = H('div', { cls: 'saved2' });
      boards.slice().sort((a, b) => b.t - a.t).forEach(b => {
        const t = TOOLS.find(x => x.id === b.tool), cc = TC[TOOLS.indexOf(t) % TC.length];
        const del = H('button', { cls: 'sdel', 'aria-label': 'Delete ' + b.name, title: 'Delete this board', html: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>' });
        del.addEventListener('click', e => { e.stopPropagation(); if (!confirm(`Delete the saved board "${b.name}"?`)) return; Boards.put(Boards.all().filter(x => x.k !== b.k)); this.renderTiles(); });
        list.append(H('div', { cls: 'sb2', role: 'button', tabindex: '0', style: `--c:${cc}`, 'aria-label': `Open ${b.name} in ${t.name}`, on: { click: () => this.open(t.id, false, b.state), keydown: e => { if (e.key === 'Enter') this.open(t.id, false, b.state); } } },
          H('span', { cls: 'sbi', html: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${t.icon || ''}</svg>` }),
          H('span', { cls: 'sbt' }, H('b', { text: b.name }), H('small', { text: t.name + ' · ' + Boards.when(b.t) })), del));
      });
      host.append(H('section', { cls: 'favs2' }, H('h2', { cls: 'favh' }, H('span', { cls: 'fh', html: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="#ffcb3d"/></svg>' }), 'Saved boards', H('small', { text: boards.length + (boards.length === 1 ? ' board' : ' boards') })), list));
    }
    if (!favList.length && !this.q) host.append(H('p', { cls: 'favhint', text: 'Tap the heart on any program to keep it here at the top. Favourites are saved in this browser.' }));
    STRANDS.forEach((s, si) => {
      const list = TOOLS.filter(t => t.strand === s.id && match(t));
      if (!list.length) return; any = true;
      const isOpen = !!this.q || open.has(s.id), cc = TC[si % TC.length];
      const body = H('div', { cls: 'tiles2', hidden: !isOpen }, ...list.map(tile));
      const head = H('button', { cls: 'sbar', 'aria-expanded': String(isOpen), style: `--c:${cc}` },
        H('i', { cls: 'sdot' }), H('span', { cls: 'sname', text: s.name }), H('small', { text: list.length + (list.length === 1 ? ' program' : ' programs') }), H('span', { cls: 'chev', html: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>' }));
      head.addEventListener('click', () => { const o = head.getAttribute('aria-expanded') !== 'true'; head.setAttribute('aria-expanded', String(o)); body.hidden = !o; const st = new Set(store.get('openStrands', [])); o ? st.add(s.id) : st.delete(s.id); store.set('openStrands', [...st]); });
      host.append(H('section', { cls: 'strand2' }, head, body));
    });
    if (!any) host.append(H('p', { cls: 'empty2', text: 'No programs match. Try a different word or choose All years.' }));
  },

  boardsPanel(t, wrap, getter, btn) {
    const old = wrap.querySelector('.boards'); if (old) { old.remove(); btn.setAttribute('aria-pressed', 'false'); return; }
    btn.setAttribute('aria-pressed', 'true');
    const box = H('div', { cls: 'boards guide', role: 'dialog', 'aria-label': 'Saved boards' }); wrap.append(box);
    const close = () => { box.remove(); btn.setAttribute('aria-pressed', 'false'); };
    const render = () => {
      clear(box);
      const name = H('input', { type: 'text', placeholder: 'Name, e.g. Y3 starter: 4 hoops', 'aria-label': 'Name for this board', maxlength: 60 });
      const save = () => {
        const get = getter(); if (!get) return;
        const nm = name.value.trim() || `${t.name} board`;
        const list = Boards.all(), ex = list.find(b => b.tool === t.id && b.name.toLowerCase() === nm.toLowerCase());
        if (ex && !confirm(`Replace the saved board "${ex.name}"?`)) return;
        const rec = { k: ex ? ex.k : Date.now().toString(36) + Math.random().toString(36).slice(2, 6), tool: t.id, name: nm, t: Date.now(), state: JSON.parse(JSON.stringify(get())) };
        Boards.put([rec, ...list.filter(b => b !== ex)]); toast('Board saved'); render(); App.renderTiles?.();
      };
      name.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
      const linkOut = H('input', { type: 'text', readonly: true, cls: 'lnk', 'aria-label': 'Link to this board', hidden: true });
      const share = async st => { const url = await Boards.link(t.id, st); linkOut.hidden = false; linkOut.value = url; linkOut.select(); toast(await Boards.copy(url) ? 'Link copied. Paste it anywhere to share this board' : 'Copy the link from the box'); };
      box.append(
        H('div', { cls: 'bh' }, H('h4', { text: 'Boards' }), H('button', { cls: 'x', 'aria-label': 'Close', text: '×', on: { click: close } })),
        H('p', { cls: 'sub', text: 'Save how the board looks now, then open it again in one tap. Saved boards stay in this browser and show on the home page.' }),
        H('div', { cls: 'row' }, name, H('button', { cls: 'btn primary', text: 'Save', on: { click: save } })),
        H('button', { cls: 'btn', html: ui('link') + ' Copy a link to this board', on: { click: () => share(getter()()) } }), linkOut);
      const mine = Boards.all().filter(b => b.tool === t.id);
      if (mine.length) {
        box.append(H('h5', { text: 'Saved for ' + t.name }));
        const ul = H('ul', { cls: 'blist' });
        mine.forEach(b => ul.append(H('li', {},
          H('button', { cls: 'bopen', on: { click: () => { close(); this.open(t.id, true, b.state); toast('Opened ' + b.name); } } }, H('b', { text: b.name }), H('small', { text: Boards.when(b.t) })),
          H('button', { cls: 'ib', title: 'Copy a link', 'aria-label': 'Copy a link to ' + b.name, html: ui('link'), on: { click: () => share(b.state) } }),
          H('button', { cls: 'ib', title: 'Delete', 'aria-label': 'Delete ' + b.name, html: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>', on: { click: () => { if (!confirm(`Delete "${b.name}"?`)) return; Boards.put(Boards.all().filter(x => x.k !== b.k)); render(); App.renderTiles?.(); } } }))));
        box.append(ul);
      }
      name.focus();
    };
    render();
  },
  cycleTheme() {
    const dark = this.isDark(), next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next); store.set('theme', next);
  },
  showHome() {
    this.unmount(); this.view.hidden = true; this.home.hidden = false; document.body.classList.add('homeview'); document.title = 'ITP Studio';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  },
  unmount() { for (const f of this.cleanup.splice(0)) try { f(); } catch (e) { console.error(e); } this.current = null; },
  open(id, initial, state) {
    const t = TOOLS.find(x => x.id === id); if (!t) return;
    this.unmount(); this.current = t;
    try { history.replaceState(null, '', '#' + id); } catch (e) { }
    let getState = null, boardsBox = null;
    this.home.hidden = true; document.body.classList.remove('homeview'); const v = clear(this.view); v.hidden = false;
    const side = store.get('dock', 'right');
    const work = H('div', { cls: 'work' + (side === 'left' ? ' left' : '') });
    const wrap = H('div', { cls: 'stagewrap' });
    const dock = H('aside', { cls: 'dock', 'aria-label': 'Controls' });
    const svg = S('svg', { cls: 'stage', viewBox: `0 0 ${t.w || 1000} ${t.h || 640}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': t.name });
    wrap.append(svg); work.append(wrap, dock);
    const pen = Pen(wrap);
    let guide = null;
    const mk = (k, label, title, fn, pressed) => H('button', { cls: 'ib b-' + k, title, 'aria-label': title, 'aria-pressed': pressed == null ? null : String(pressed), html: ui(k) + (label ? `<span class="lbl">${label}</span>` : ''), on: { click: fn } });
    const showGuide = () => {
      if (guide) { guide.remove(); guide = null; return; }
      guide = H('div', { cls: 'guide' }, H('h4', { text: 'How to use ' + t.name }), H('ul', {}, ...(t.guide || []).map(g => H('li', { text: g }))));
      wrap.append(guide);
    };
    const bar = H('div', { cls: 'bar' },
      mk('back', 'All programs', 'Back to all programs', () => this.showHome()),
      H('h2', {}, t.name, H('small', { text: STRANDS.find(s => s.id === t.strand).name + ' · ' + yearText(t.years) })),
      (() => { const on = App.favs().has(t.id); const b = H('button', { cls: 'ib b-fav', title: 'Favourite', 'aria-label': 'Favourite', 'aria-pressed': String(on), html: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3.1 1.5-1.8 3-3.1 5.2-3.1 3.8 0 5.8 3.9 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>' }); b.addEventListener('click', () => { const v = App.toggleFav(t.id); b.setAttribute('aria-pressed', String(v)); toast(v ? 'Added to favourites' : 'Removed from favourites'); App.renderTiles(); }); return b; })(),
      mk('info', 'Guide', 'Show how to use this program', function () { showGuide(); this.setAttribute('aria-pressed', String(!!guide)); }, false),
      (() => { const b = mk('save', 'Boards', 'Save this board or share a link to it', () => this.boardsPanel(t, wrap, () => getState, b), false); b.hidden = true; this._saveBtn = b; return b; })(),
      mk('pen', 'Pen', 'Write on the board', function () { const on = this.getAttribute('aria-pressed') !== 'true'; this.setAttribute('aria-pressed', String(on)); pen.toggle(on); }, false),
      mk('swap', '', 'Move controls to the other side', () => { const l = !work.classList.contains('left'); work.classList.toggle('left', l); store.set('dock', l ? 'left' : 'right'); }),
      mk('panel', '', 'Hide or show controls', function () { const h = !work.classList.contains('hidedock'); work.classList.toggle('hidedock', h); this.setAttribute('aria-pressed', String(h)); }, false),
      mk('full', '', 'Full screen', () => { const d = document; if (d.fullscreenElement) d.exitFullscreen?.(); else d.documentElement.requestFullscreen?.().catch(() => toast('Full screen is not available here')); }),
    );
    v.append(bar, work);
    document.title = t.name + ' · ITP Studio';
    const ctx = {
      svg, W: t.w || 1000, H: t.h || 640, P: Panel(dock), wrap,
      onClean: f => this.cleanup.push(f),
      pt: e => svgPt(svg, e),
      raf(fn) { let id, last = performance.now(); const loop = n => { const dt = Math.max(0, Math.min(.05, (n - last) / 1000)); last = n; if (fn(dt, n) !== false) id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); App.cleanup.push(() => cancelAnimationFrame(id)); return () => cancelAnimationFrame(id); },
      every(ms, fn) { const id = setInterval(fn, ms); App.cleanup.push(() => clearInterval(id)); return id; },
      // make a button pulse while fn() is true (e.g. "Next step" while there are steps left)
      pulseWhen(el, fn) { if (!el) return; const tick = () => { let on = false; try { on = !!fn(); } catch (e) { } el.classList.toggle('pulse', on); }; tick(); const id = setInterval(tick, 250); App.cleanup.push(() => clearInterval(id)); },
      btn(label) { return [...dock.querySelectorAll('button')].find(b => b.textContent.trim() === label); },
      drag(el, h) {
        el.addEventListener('pointerdown', e => {
          if (e.button > 0) return;
          const p = svgPt(svg, e); if (h.start && h.start(p, e) === false) return;
          e.preventDefault(); e.stopPropagation();
          const id = e.pointerId;
          const mv = ev => { if (ev.pointerId === id) { ev.preventDefault(); h.move && h.move(svgPt(svg, ev), ev); } };
          const up = ev => { if (ev.pointerId !== id) return; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); h.end && h.end(svgPt(svg, ev), ev); };
          window.addEventListener('pointermove', mv, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
          App.cleanup.push(() => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); });
        });
      },
      toast,
      init: state || null,
      persist(get, set) { getState = get; if (state) { try { set(JSON.parse(JSON.stringify(state))); } catch (e) { console.error(e); } } },
    };
    this.cleanup.push(() => pen.destroy());
    try { t.mount(ctx); } catch (e) {
      console.error(e);
      if (state) { toast('That saved board could not be opened, so the program opened blank'); return this.open(id, initial); }
      dock.append(H('p', { cls: 'note', text: 'This program hit a problem: ' + e.message }));
    }
    this._saveBtn.hidden = !getState;
    if (!initial) window.scrollTo(0, 0);
  }
};

const HERO_ART = `<svg viewBox="0 0 440 320">
<g class="bob d2"><g transform="rotate(10 330 80)"><rect x="268" y="22" width="124" height="116" rx="22" fill="#fffaf0" stroke="#1c1430" stroke-width="6"/><text x="330" y="104" text-anchor="middle" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="78" fill="#ff6b5b">7</text></g></g>
<g class="bob"><path d="M30 120 A90 90 0 0 1 210 120 Z" fill="#5cc2ff" stroke="#1c1430" stroke-width="6"/><path d="M60 120 A60 60 0 0 1 180 120" fill="none" stroke="#fffaf0" stroke-width="5" opacity=".6"/><path d="M120 120 L172 70" stroke="#1c1430" stroke-width="6" stroke-linecap="round"/><circle cx="120" cy="120" r="9" fill="#ffcb3d" stroke="#1c1430" stroke-width="4"/></g>
<g class="bob d3"><line x1="40" y1="236" x2="250" y2="236" stroke="#1c1430" stroke-width="6" stroke-linecap="round"/><g stroke="#1c1430" stroke-width="4">${[0,1,2,3,4].map(i=>`<circle cx="${62+i*26}" cy="236" r="13" fill="#ff6b5b"/>`).join('')}${[0,1,2].map(i=>`<circle cx="${192+i*26}" cy="236" r="13" fill="#fffaf0"/>`).join('')}</g></g>
<g class="bob d4"><g transform="rotate(-12 350 240)"><rect x="276" y="196" width="150" height="66" rx="8" fill="#9be15d" stroke="#1c1430" stroke-width="6"/><path d="M306 196v66M336 196v66M366 196v66M396 196v66M276 229h150" stroke="#1c1430" stroke-width="4"/><g fill="#1c1430"><circle cx="291" cy="212" r="9"/><circle cx="321" cy="212" r="9"/><circle cx="351" cy="212" r="9"/><circle cx="291" cy="246" r="9"/></g></g></g>
<g class="bob d2"><circle cx="230" cy="70" r="26" fill="#b597ff" stroke="#1c1430" stroke-width="6"/><path d="M230 52v18l11 7" stroke="#1c1430" stroke-width="5" stroke-linecap="round" fill="none"/></g>
<g class="bob d3"><path d="M200 290 l22 -40 l22 40 z" fill="#ffcb3d" stroke="#1c1430" stroke-width="6" stroke-linejoin="round"/></g>
</svg>`;

/* shared drawing helpers used by several tools */
function bead(g, x, y, r, c, a = {}, ry = r) {
  const grp = S('g', a, g);
  S('ellipse', { cx: x, cy: y, rx: r, ry, fill: c, stroke: 'var(--bead-edge)', 'stroke-width': 1.5 }, grp);
  S('ellipse', { cx: x - r * .32, cy: y - ry * .4, rx: r * .3, ry: ry * .2, fill: '#fff', opacity: .45, 'pointer-events': 'none' }, grp);
  return grp;
}
function text(g, x, y, t, a = {}) { return S('text', Object.assign({ x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: t }, a), g); }
function card(g, x, y, w, h, label, a = {}) {
  const grp = S('g', { transform: `translate(${x},${y})`, cls: a.cls || 'grab' }, g);
  S('rect', { width: w, height: h, rx: a.rx ?? 10, fill: a.fill || 'var(--board)', stroke: a.stroke || 'var(--ink)', 'stroke-width': a.sw ?? 2 }, grp);
  const tx = text(grp, w / 2, h / 2 + 1, label, { 'font-size': a.fs || h * .55, 'font-weight': 700, cls: 'disp num', fill: a.ink || 'var(--ink)' });
  grp._t = tx; return grp;
}

/* ---------- installable app (PWA): offline, install button, update prompt ---------- */
const PWA = {
  deferred: null, btn: null, reg: null, reloading: false,
  standalone: () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  ios: () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  usable() {
    let top = false; try { top = window.top === window; } catch (e) { }
    return /^https?:$/.test(location.protocol) && top && 'serviceWorker' in navigator && !!document.querySelector('link[rel="manifest"]') && !/(^|\.)claude(usercontent)?\.(ai|com)$/.test(location.hostname);
  },
  init() {
    if (!this.usable()) return;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferred = e; this.sync(); });
    window.addEventListener('appinstalled', () => { this.deferred = null; this.sync(); toast('ITP Studio is installed. Open it from your Start menu or home screen.'); });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (this.reloading) location.reload(); });
    navigator.serviceWorker.register('sw.js').then(reg => {
      this.reg = reg;
      if (reg.waiting && navigator.serviceWorker.controller) this.offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) this.offer(w); });
      });
      const check = () => reg.update().catch(() => { });
      setInterval(check, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    }).catch(() => { });
    this.sync();
  },
  button() {
    this.btn = H('button', { cls: 'pill instbtn', hidden: true, title: 'Install ITP Studio as an app on this device', html: '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg><span class="lbl">Install app</span>', on: { click: () => this.install() } });
    this.sync(); return this.btn;
  },
  sync() {
    if (!this.btn) return;
    const show = this.usable() && !this.standalone() && (this.deferred || this.ios());
    this.btn.hidden = !show;
  },
  async install() {
    if (this.deferred) { const d = this.deferred; this.deferred = null; d.prompt(); try { await d.userChoice; } catch (e) { } this.sync(); return; }
    if (this.ios()) this.card('Add ITP Studio to your home screen', 'Tap the Share button in Safari, then choose Add to Home Screen. It will open full screen and work offline.', [['Got it', 'primary', c => c.remove()]]);
  },
  offer(worker) {
    if (document.querySelector('.updcard')) return;
    this.card('A new version of ITP Studio is ready', 'Update now to get the latest programs and fixes. The page will reload, so save a board first if you want to keep it.', [
      ['Later', '', c => c.remove()],
      ['Update', 'primary', c => { c.remove(); this.reloading = true; worker.postMessage({ type: 'SKIP_WAITING' }); setTimeout(() => location.reload(), 3000); }]
    ], 'updcard');
  },
  card(title, body, actions, extra = '') {
    const c = H('div', { cls: 'appcard ' + extra, role: 'dialog', 'aria-live': 'polite', 'aria-label': title });
    const row = H('div', { cls: 'appcard-act' });
    actions.forEach(([l, k, fn]) => row.append(H('button', { cls: 'btn' + (k ? ' ' + k : ''), text: l, on: { click: () => fn(c) } })));
    c.append(H('div', { cls: 'appcard-ico', html: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="10" fill="#0f3d45"/><rect x="7" y="8" width="34" height="32" rx="7" fill="#fffaf0" stroke="#1c1430" stroke-width="3"/><path d="M12 17h24M12 24h24M12 31h24" stroke="#1c1430" stroke-width="2"/><circle cx="17" cy="17" r="3.6" fill="#ff6b5b"/><circle cx="24" cy="24" r="3.6" fill="#ffcb3d"/><circle cx="31" cy="31" r="3.6" fill="#5cc2ff"/></svg>' }),
      H('div', { cls: 'appcard-txt' }, H('strong', { text: title }), H('p', { text: body })), row);
    document.body.append(c); return c;
  }
};
