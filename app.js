(() => {
'use strict';
const JB = window.JB;
const $ = (s) => document.querySelector(s);
const RE = 6371008.8, rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
const LAT0 = -22.968, KX = 111320 * Math.cos(rad(LAT0)), KY = 110574;
const pm = (c) => [(c[0] + 43.2245) * KX, (c[1] - LAT0) * KY];
const ung = (q) => [q[0] / KX - 43.2245, q[1] / KY + LAT0];
function dist(a, b) {
  const dLa = rad(b[1] - a[1]), dLo = rad(b[0] - a[0]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLo / 2) ** 2;
  return 2 * RE * Math.asin(Math.sqrt(h));
}
function brg(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
const fmtM = (m) => m < 1000 ? `${Math.round(m / (m < 100 ? 5 : 10)) * (m < 100 ? 5 : 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
const fmtMin = (m) => { const t = Math.max(1, Math.round(m / 65)); return t < 60 ? `${t} min` : `${Math.floor(t / 60)} h ${t % 60} min`; };
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const CARD = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'];

/* ---------------- ícones ---------------- */
const ICON = {
  wc: '<svg viewBox="0 0 24 24"><circle cx="7" cy="3.6" r="2"/><circle cx="17" cy="3.6" r="2"/><path d="M4.6 6.5h4.8l1.1 7.5H9v8H5.1v-8H3.5zM14.6 6.5h4.8l2 9.5h-2.7v6h-3.4v-6h-2.7z"/></svg>',
  acess: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="3.5" r="2.1"/><path d="M9 6.8h2.6v4.6h5.2l3.1 6.4-2 .9-2.5-5H9z"/><path d="M7.7 9.6a6.4 6.4 0 1 0 8.5 9.2l-1.7-.9a4.5 4.5 0 1 1-6.8-6.3z"/></svg>',
  agua: '<svg viewBox="0 0 24 24"><path d="M12 2.2S5.6 9.4 5.6 14a6.4 6.4 0 0 0 12.8 0C18.4 9.4 12 2.2 12 2.2z"/></svg>',
  lanche: '<svg viewBox="0 0 24 24"><path d="M6.5 2v7.6a2.2 2.2 0 0 0 1.6 2.1V22h2.2V11.7A2.2 2.2 0 0 0 12 9.6V2h-1.4v6.4H9.8V2H8.7v6.4H7.9V2zM17 2c-1.8 0-3 2.4-3 5.6v6h2.2V22h2.3V2z"/></svg>',
  loja: '<svg viewBox="0 0 24 24"><path d="M3.5 8.5h17v4h-17zM5 12.5h6v9.5H5zM13 12.5h6v9.5h-6zM11 8.5h2V22h-2z"/><path d="M12 8.2C10.4 4.6 6.6 3.6 6.6 6.1c0 1.7 2.6 2.1 5.4 2.1 2.8 0 5.4-.4 5.4-2.1 0-2.5-3.8-1.5-5.4 2.1z"/></svg>',
  bilheteria: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5h19v3.6a2 2 0 0 0 0 3.8v3.6h-19v-3.6a2 2 0 0 0 0-3.8zM9 8v2h1.6V8zm0 3v2h1.6v-2zm0 3v2h1.6v-2z" fill-rule="evenodd"/></svg>',
};
const SVC_NAME = { wc: 'Banheiro', acess: 'Acesso para cadeirantes', agua: 'Bebedouro', lanche: 'Lanchonete', loja: 'Loja', bilheteria: 'Bilheteria' };
const SVC_EN = { wc: 'Toilets', acess: 'Wheelchair access', agua: 'Drinking fountain', lanche: 'Food service', loja: 'Store', bilheteria: 'Tickets' };
const CAT_NAME = { entrada: 'Entrada', jardim: 'Jardins e estufas', agua: 'Lagos e água', arte: 'Estátuas e monumentos', historia: 'História', cultura: 'Cultura', planta: 'Árvores e coleções', vista: 'Mirantes e recantos', pesquisa: 'Pesquisa', servico: 'Serviços' };
const MAJOR = new Set([1, 5, 14, 18, 23, 27, 29, 30, 33, 34, 38, 42, 45, 47, 51, 54, 58, 60, 61, 62]);

/* ---------------- itens (pontos + serviços) ---------------- */
const items = [];
JB.pois.forEach((p, i) => items.push({ id: 'p' + i, n: p.n, title: p.t, en: p.en, c: p.c, cat: p.cat, src: p.src, kind: 'poi' }));
JB.services.forEach((s, i) => items.push({ id: 's' + i, n: null, title: SVC_NAME[s.k], en: SVC_EN[s.k], c: s.c, cat: s.k === 'lanche' || s.k === 'loja' ? 'servico' : 'servico', svc: s.k, src: 'placa', kind: 'svc' }));

/* ---------------- mapa ---------------- */
const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
const fc = (features) => ({ type: 'FeatureCollection', features });
const ringFeat = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [JB.ring] } };
let gb = [[180, 90], [-180, -90]];
JB.ring.forEach(([x, y]) => { gb[0][0] = Math.min(gb[0][0], x); gb[0][1] = Math.min(gb[0][1], y); gb[1][0] = Math.max(gb[1][0], x); gb[1][1] = Math.max(gb[1][1], y); });
const OSM_ATTR = '© colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const W = (a, b, c, d) => ['interpolate', ['exponential', 1.6], ['zoom'], 14, a, 16, b, 18, c, 20, d];
const WM = (val, A, B) => ['interpolate', ['exponential', 1.6], ['zoom'], ...[14, 16, 18, 20].flatMap((z, i) => [z, ['match', ['get', 'k'], val, A[i], B[i]]])];

const style = {
  version: 8,
  glyphs: base + 'fonts/{fontstack}/{range}.pbf',
  sources: {
    sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19, attribution: 'Satélite © Esri, Maxar, Earthstar Geographics' },
    garden: { type: 'geojson', data: ringFeat, attribution: OSM_ATTR },
    ctxb: { type: 'geojson', data: JB.ctxBuildings },
    roads: { type: 'geojson', data: JB.roads },
    greens: { type: 'geojson', data: JB.greens },
    water: { type: 'geojson', data: JB.water },
    ww: { type: 'geojson', data: JB.waterways },
    rows: { type: 'geojson', data: JB.treerows },
    palms: { type: 'geojson', data: JB.palms },
    paths: { type: 'geojson', data: JB.paths },
    bld: { type: 'geojson', data: JB.buildings },
    acc: { type: 'geojson', data: fc([]) },
    route: { type: 'geojson', data: fc([]) },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#ebe5d2' } },
    { id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } },
    { id: 'ctxb', type: 'fill', source: 'ctxb', paint: { 'fill-color': '#dcd3be', 'fill-outline-color': '#cfc5ad' } },
    { id: 'road-case', type: 'line', source: 'roads', filter: ['!=', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#cdc3aa', 'line-width': W(2, 7, 20, 60) } },
    { id: 'road', type: 'line', source: 'roads', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'k'], 'walk', '#f3eedf', '#fffdf6'], 'line-width': WM('walk', [.5, 1.5, 4, 10], [1.2, 5.5, 17, 54]) } },
    { id: 'garden', type: 'fill', source: 'garden', paint: { 'fill-color': '#2f7a4c' } },
    { id: 'garden-edge', type: 'line', source: 'garden', paint: { 'line-color': '#1c5434', 'line-width': W(1, 2, 3, 5) } },
    { id: 'greens', type: 'fill', source: 'greens', paint: { 'fill-color': ['match', ['get', 'k'], 'wood', '#26683f', '#3e8b58'] } },
    { id: 'ww', type: 'line', source: 'ww', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'k'], 'river', '#4fb0e3', '#6cc0ec'], 'line-width': WM('river', [2, 4, 11, 34], [.6, 1.4, 4, 12]) } },
    { id: 'water', type: 'fill', source: 'water', paint: { 'fill-color': '#79c6ec' } },
    { id: 'water-line', type: 'line', source: 'water', paint: { 'line-color': '#3f9fd3', 'line-width': W(.4, .8, 1.5, 3) } },
    { id: 'rows', type: 'line', source: 'rows', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#174d2f', 'line-width': W(.8, 2, 5, 12), 'line-dasharray': [0.1, 2.2] } },
    { id: 'path-case', type: 'line', source: 'paths', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1e5234', 'line-width': WM('main', [2.2, 6, 17, 46], [1.2, 3.4, 10, 28]) } },
    { id: 'path', type: 'line', source: 'paths', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'k'], 'steps', '#e8d9b0', '#f6eed5'], 'line-width': WM('main', [1.4, 4.4, 14, 42], [.7, 2.2, 7.5, 24]) } },
    { id: 'palms', type: 'circle', source: 'palms', minzoom: 16.5, paint: { 'circle-color': '#1d5a37', 'circle-radius': W(1, 1.5, 3, 7), 'circle-stroke-color': '#9fd0a9', 'circle-stroke-width': .6 } },
    { id: 'bld', type: 'fill', source: 'bld', paint: { 'fill-color': '#d4674a' } },
    { id: 'bld-line', type: 'line', source: 'bld', paint: { 'line-color': '#9c4329', 'line-width': W(.4, .7, 1.2, 2) } },
    { id: 'acc', type: 'fill', source: 'acc', paint: { 'fill-color': '#1a73e8', 'fill-opacity': .12 } },
    { id: 'acc-line', type: 'line', source: 'acc', paint: { 'line-color': '#1a73e8', 'line-opacity': .35, 'line-width': 1 } },
    { id: 'route-case', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': W(5, 8, 14, 26) } },
    { id: 'route', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1a73e8', 'line-width': W(3, 5, 9, 18) } },
    { id: 'route-link', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'link'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#1a73e8', 'line-width': W(2, 3, 5, 9), 'line-dasharray': [0.2, 1.8] } },
    { id: 'road-label', type: 'symbol', source: 'roads', minzoom: 15, filter: ['all', ['has', 'n'], ['!=', ['get', 'k'], 'walk']], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 19, 14], 'symbol-spacing': 320 }, paint: { 'text-color': '#6d6450', 'text-halo-color': '#fffdf6', 'text-halo-width': 1.4 } },
    { id: 'path-label', type: 'symbol', source: 'paths', minzoom: 16.2, filter: ['has', 'n'], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Italic'], 'text-size': ['interpolate', ['linear'], ['zoom'], 16.2, 10, 19, 14], 'symbol-spacing': 260, 'text-max-angle': 35, 'text-padding': 2 }, paint: { 'text-color': '#28513a', 'text-halo-color': '#f6eed5', 'text-halo-width': 1.8 } },
  ],
};

// mesma posição das placas espalhadas pelo Jardim: a Aleia Barbosa Rodrigues fica de pé (topo = noroeste)
const SIGN_BEARING = -51.3;
const map = new maplibregl.Map({
  container: 'map', style, center: [-43.2252, -22.9679], zoom: 15.2, bearing: SIGN_BEARING,
  maxZoom: 20.5, minZoom: 12, pitchWithRotate: false, touchPitch: false, dragRotate: true,
  attributionControl: { compact: true },
});
window.__map = map;
function fitGarden(animate) {
  const cam = map.cameraForBounds(gb, { padding: { top: 76, bottom: 30, left: 14, right: 74 }, bearing: SIGN_BEARING });
  if (!cam) return;
  map[animate ? 'easeTo' : 'jumpTo']({ center: cam.center, zoom: cam.zoom + 0.35, bearing: SIGN_BEARING, duration: animate ? 600 : 0 });
}
fitGarden(false);
map.touchZoomRotate.enableRotation();
const setZoomCls = () => document.body.classList.toggle('zoomed-out', map.getZoom() < 16.6);
map.on('zoom', setZoomCls); setZoomCls();

/* ---------------- camadas: mapa x satélite ---------------- */
let sat = false;
const MAP_ONLY = ['ctxb', 'road-case', 'road', 'garden', 'greens', 'water', 'water-line', 'rows', 'palms', 'bld', 'bld-line', 'path-case', 'garden-edge'];
function applyLayerMode() {
  if (!map.isStyleLoaded()) return;
  map.setLayoutProperty('sat', 'visibility', sat ? 'visible' : 'none');
  MAP_ONLY.forEach((id) => map.setLayoutProperty(id, 'visibility', sat ? 'none' : 'visible'));
  map.setPaintProperty('path', 'line-opacity', sat ? 0.55 : 1);
  map.setPaintProperty('ww', 'line-opacity', sat ? 0.5 : 1);
  $('#layerLbl').textContent = sat ? 'Mapa' : 'Satélite';
}
$('#layerBtn').onclick = () => { sat = !sat; applyLayerMode(); try { localStorage.setItem('jb-sat', sat ? '1' : '0'); } catch (e) {} };
try { sat = localStorage.getItem('jb-sat') === '1'; } catch (e) {}
map.on('load', applyLayerMode);

/* ---------------- bússola do mapa ---------------- */
const compassBtn = $('#compassBtn');
function onRotate() {
  const b = map.getBearing();
  compassBtn.hidden = Math.abs(b) < 0.5 && mode !== 3;
  compassBtn.querySelector('svg').style.transform = `rotate(${-b}deg)`;
  refreshSheetDir();
}
map.on('rotate', onRotate);
compassBtn.onclick = () => { if (mode === 3) setMode(2); map.easeTo({ bearing: 0, duration: 400 }); };

/* ---------------- marcadores ---------------- */
const markers = new Map();
items.forEach((it) => {
  const el = document.createElement('div');
  if (it.kind === 'poi') {
    el.className = 'poi' + (it.n === 1 ? ' gate' : '') + (MAJOR.has(it.n) ? '' : ' minor');
    el.textContent = it.n;
    el.title = `${it.n} · ${it.title}`;
  } else {
    el.className = 'svc'; el.innerHTML = ICON[it.svc]; el.title = it.title;
  }
  el.addEventListener('click', (e) => { e.stopPropagation(); select(it, true); });
  const mk = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(it.c).addTo(map);
  markers.set(it.id, { mk, el });
});
const minorStyle = document.createElement('style');
minorStyle.textContent = '.zoomed-out .poi.minor{display:none}';
document.head.appendChild(minorStyle);

/* ---------------- grafo de caminhos e rotas ---------------- */
const G = (() => {
  const nodes = [], P = [], idx = new Map(), adj = [], segs = [];
  const nid = (c) => { const k = c[0].toFixed(6) + ',' + c[1].toFixed(6); let i = idx.get(k); if (i === undefined) { i = nodes.length; idx.set(k, i); nodes.push(c); P.push(pm(c)); adj.push([]); } return i; };
  const link = (a, b, w) => { adj[a].push([b, w]); adj[b].push([a, w]); };
  JB.paths.features.forEach((f) => {
    const cs = f.geometry.coordinates;
    for (let j = 0; j < cs.length - 1; j++) {
      const a = nid(cs[j]), b = nid(cs[j + 1]); if (a === b) continue;
      const w = Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]); link(a, b, w); segs.push([a, b, w]);
    }
  });
  // fecha pequenas falhas do desenho: ponta solta a até 8 m de outro caminho
  const nseg = segs.length;
  for (let i = 0; i < nodes.length; i++) {
    if (adj[i].length !== 1) continue;
    let best = null;
    for (let s = 0; s < nseg; s++) {
      const [a, b, len] = segs[s]; if (a === i || b === i || adj[i][0][0] === a || adj[i][0][0] === b) continue;
      const A = P[a], B = P[b], dx = B[0] - A[0], dy = B[1] - A[1];
      let t = ((P[i][0] - A[0]) * dx + (P[i][1] - A[1]) * dy) / (len * len || 1); t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(P[i][0] - A[0] - t * dx, P[i][1] - A[1] - t * dy);
      if (d < 8 && (!best || d < best.d)) best = { a, b, t, d, len };
    }
    if (best) { link(i, best.a, best.d + best.t * best.len); link(i, best.b, best.d + (1 - best.t) * best.len); }
  }
  return { nodes, P, adj, segs };
})();

function snap(c) {
  const p = pm(c); let best = null;
  for (const [a, b, len] of G.segs) {
    const A = G.P[a], B = G.P[b], dx = B[0] - A[0], dy = B[1] - A[1];
    let t = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / (len * len || 1); t = Math.max(0, Math.min(1, t));
    const qx = A[0] + t * dx, qy = A[1] + t * dy, d = Math.hypot(p[0] - qx, p[1] - qy);
    if (!best || d < best.d) best = { a, b, t, d, len, q: ung([qx, qy]) };
  }
  return best;
}
function shortest(from, to) {
  const s = snap(from), e = snap(to); if (!s || !e) return null;
  const N = G.nodes.length, S = N, T = N + 1;
  const extra = new Map();
  const add = (u, v, w) => { if (!extra.has(u)) extra.set(u, []); extra.get(u).push([v, w]); };
  add(S, s.a, s.t * s.len); add(S, s.b, (1 - s.t) * s.len);
  add(e.a, T, e.t * e.len); add(e.b, T, (1 - e.t) * e.len);
  if (s.a === e.a && s.b === e.b) add(S, T, Math.abs(s.t - e.t) * s.len);
  else if (s.a === e.b && s.b === e.a) add(S, T, Math.abs(s.t - (1 - e.t)) * s.len);
  const D = new Float64Array(N + 2).fill(Infinity), prev = new Int32Array(N + 2).fill(-1), done = new Uint8Array(N + 2);
  const heap = [[0, S]]; D[S] = 0;
  const push = (x) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  while (heap.length) {
    const [d, u] = pop(); if (done[u]) continue; done[u] = 1; if (u === T) break;
    const nb = (u < N ? G.adj[u] : []).concat(extra.get(u) || []);
    for (const [v, w] of nb) { const nd = d + w; if (nd < D[v]) { D[v] = nd; prev[v] = u; push([nd, v]); } }
  }
  if (!isFinite(D[T])) return null;
  const seq = []; for (let u = prev[T]; u !== -1 && u !== S; u = prev[u]) seq.push(G.nodes[u]);
  seq.reverse();
  const line = [s.q, ...seq, e.q];
  return { line, len: s.d + D[T] + e.d, s, e };
}

let routeTo = null, lastRouteAt = 0;
function drawRoute(force) {
  if (!routeTo || !me) return;
  const now = Date.now(); if (!force && now - lastRouteAt < 2500) return; lastRouteAt = now;
  const r = shortest(me.c, routeTo.c);
  const feats = [];
  let len;
  if (r) {
    feats.push({ type: 'Feature', properties: { k: 'walk' }, geometry: { type: 'LineString', coordinates: r.line } });
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [me.c, r.line[0]] } });
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [r.line[r.line.length - 1], routeTo.c] } });
    len = r.len;
  } else {
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [me.c, routeTo.c] } });
    len = dist(me.c, routeTo.c);
  }
  map.getSource('route').setData(fc(feats));
  const straight = dist(me.c, routeTo.c);
  if (straight < 15) {
    toast(`Você chegou: ${label(routeTo)}`);
    stopRoute(); return;
  }
  $('#rbMain').textContent = `${fmtMin(len)} · ${fmtM(len)}`;
  $('#rbSub').textContent = `até ${label(routeTo)}`;
}
function startRoute(it) {
  if (!me) { pendingRoute = it; startLocate(true); toast('Ligando o GPS para traçar a rota…'); return; }
  routeTo = it; document.body.classList.add('routing'); $('#routeBar').hidden = false;
  drawRoute(true);
  const bounds = new maplibregl.LngLatBounds(me.c, me.c); bounds.extend(it.c);
  map.fitBounds(bounds, { padding: { top: 120, bottom: sheetH() + 40, left: 50, right: 80 }, maxZoom: 18.5, duration: 700 });
}
function stopRoute() {
  routeTo = null; document.body.classList.remove('routing'); $('#routeBar').hidden = true;
  if (map.getSource('route')) map.getSource('route').setData(fc([]));
}
let pendingRoute = null;
$('#rbClose').onclick = stopRoute;

/* ---------------- seleção / folha ---------------- */
let sel = null;
const label = (it) => it.n ? `${it.n} · ${it.title}` : it.title;
function sheetH() { const s = $('#sheet'); return s.hidden ? 0 : s.getBoundingClientRect().height; }
function select(it, fly) {
  if (sel) { const m = markers.get(sel.id); if (m) m.el.classList.remove('sel'); }
  sel = it;
  const m = markers.get(it.id); if (m) { m.el.classList.add('sel'); m.el.parentElement && m.el.classList.remove('minor-hide'); }
  const badge = $('#sBadge');
  if (it.kind === 'svc') { badge.className = 'badge svc-b'; badge.innerHTML = ICON[it.svc]; }
  else { badge.className = 'badge'; badge.textContent = it.n; }
  $('#sTitle').textContent = it.title;
  $('#sEn').textContent = it.en || '';
  $('#sSrc').textContent = it.src === 'osm'
    ? `${CAT_NAME[it.cat] || ''} · posição tirada do OpenStreetMap`
    : (it.kind === 'svc' ? 'Posição do ícone da placa oficial (margem de ~10 m)' : `${CAT_NAME[it.cat] || ''} · posição pela placa oficial do Jardim (margem de ~10 m)`);
  $('#sheet').hidden = false;
  document.body.classList.add('sheet-open');
  document.documentElement.style.setProperty('--sheet-h', sheetH() + 'px');
  refreshSheetDir();
  if (fly) {
    const z = Math.max(map.getZoom(), 17.2);
    map.easeTo({ center: it.c, zoom: z, padding: { top: 70, bottom: window.innerWidth >= 760 ? 0 : sheetH(), left: window.innerWidth >= 760 ? 420 : 0, right: 0 }, duration: 600 });
    if (mode >= 2) setMode(1);
  }
}
function closeSheet() {
  if (sel) { const m = markers.get(sel.id); if (m) m.el.classList.remove('sel'); }
  sel = null; $('#sheet').hidden = true; document.body.classList.remove('sheet-open');
}
$('#sClose').onclick = closeSheet;
$('#sCenter').onclick = () => sel && map.easeTo({ center: sel.c, zoom: Math.max(map.getZoom(), 18), padding: { top: 70, bottom: window.innerWidth >= 760 ? 0 : sheetH(), left: 0, right: 0 }, duration: 500 });
$('#sRoute').onclick = () => sel && startRoute(sel);
map.on('click', () => { if (!$('#sheet').hidden) closeSheet(); });

function relWords(b) {
  if (heading == null) return { word: `ao ${CARD[Math.round(b / 45) % 8]}`, rot: b - map.getBearing() };
  const r = (b - heading + 360) % 360;
  const word = r < 25 || r > 335 ? 'à sua frente' : r < 155 ? (r < 65 ? 'à frente, à direita' : 'à sua direita') : r > 205 ? (r > 295 ? 'à frente, à esquerda' : 'à sua esquerda') : 'atrás de você';
  return { word, rot: r - 0 };
}
let lastDirAt = 0;
function refreshSheetDir(force) {
  if (!sel || $('#sheet').hidden) return;
  const now = Date.now(); if (!force && now - lastDirAt < 150) return; lastDirAt = now;
  const dir = $('#sDir'), dd = $('#sDist');
  if (!me) { dir.classList.add('na'); dir.style.transform = ''; dd.textContent = 'Toque no botão de localização para ver a distância e a direção.'; return; }
  const d = dist(me.c, sel.c), b = brg(me.c, sel.c), w = relWords(b);
  dir.classList.remove('na');
  dir.style.transform = `rotate(${heading == null ? b - map.getBearing() : w.rot}deg)`;
  dd.innerHTML = d < 15 ? '<b>Você está aqui</b>' : `<b>${fmtM(d)}</b> ${w.word} · em linha reta`;
}

/* ---------------- localização e bússola ---------------- */
let me = null, heading = null, mode = 0, watchId = null, meMarker = null, lastFix = 0;
const locBtn = $('#locBtn');
function setMode(m) {
  mode = m;
  locBtn.classList.toggle('on', m === 1);
  locBtn.classList.toggle('follow', m === 2);
  locBtn.classList.toggle('heading', m === 3);
  if (m !== 3 && Math.abs(map.getBearing()) > 0.5 && m === 2) { /* mantém a rotação escolhida */ }
  onRotate();
}
function meEl() {
  const el = document.createElement('div'); el.className = 'me';
  el.innerHTML = '<svg class="beam off" viewBox="0 0 120 120" style="position:absolute;inset:0"><defs><radialGradient id="bg1" cx="60" cy="60" r="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1a73e8" stop-opacity=".6"/><stop offset="1" stop-color="#1a73e8" stop-opacity="0"/></radialGradient></defs><path d="M60 60 L29.3 10.8 A58 58 0 0 1 90.7 10.8 Z" fill="url(#bg1)"/></svg><div class="halo"></div><div class="dot"></div>';
  return el;
}
function circlePoly(c, r) {
  const p = pm(c), pts = [];
  for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI; pts.push(ung([p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)])); }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } };
}
function onPos(pos) {
  const c = [pos.coords.longitude, pos.coords.latitude], acc = pos.coords.accuracy;
  const first = !me;
  me = { c, acc, t: Date.now() }; lastFix = Date.now();
  locBtn.classList.remove('wait');
  if (!meMarker) { meMarker = new maplibregl.Marker({ element: meEl(), anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat(c).addTo(map); }
  meMarker.setLngLat(c); meMarker.getElement().classList.remove('stale');
  if (map.getSource('acc')) map.getSource('acc').setData(acc > 6 ? circlePoly(c, acc) : fc([]));
  // sem bússola: usa o rumo do GPS quando está andando
  if (!compassOK && pos.coords.heading != null && !isNaN(pos.coords.heading) && (pos.coords.speed || 0) > 0.7) { heading = pos.coords.heading; renderHeading(); }
  if (first) {
    const dG = distToGarden(c);
    if (dG > 1500) { setMode(1); toast(`Você está a ${fmtM(dG)} do Jardim. O ponto azul aparece no mapa quando chegar.`); }
    else map.easeTo({ center: c, zoom: Math.max(map.getZoom(), 17.5), duration: 700 });
  } else if (mode >= 2) {
    map.easeTo({ center: c, duration: 450, bearing: mode === 3 && heading != null ? heading : map.getBearing() });
  }
  if (pendingRoute) { const it = pendingRoute; pendingRoute = null; startRoute(it); }
  drawRoute(false);
  refreshSheetDir(true);
  updateStatus();
}
function onPosErr(err) {
  locBtn.classList.remove('wait');
  if (err.code === 1) toast('A localização está bloqueada. No iPhone: Ajustes › Privacidade › Serviços de Localização › Safari › “Ao Usar o App”. Depois recarregue a página.', 9000);
  else if (!me) toast('Ainda sem sinal de GPS. Fique em um lugar mais aberto por alguns segundos.', 5000);
}
function distToGarden(c) {
  if (pointInRing(c, JB.ring)) return 0;
  let best = Infinity; for (const p of JB.ring) best = Math.min(best, dist(c, p)); return best;
}
function pointInRing(c, ring) {
  let inside = false; const [x, y] = c;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* bússola do aparelho */
let compassOK = false, hRaf = 0, lastBearingSet = 0;
function onOrient(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) h = e.webkitCompassHeading;
  else if ((e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null) h = 360 - e.alpha;
  if (h == null) return;
  const so = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
  h = (h + so + 360) % 360;
  compassOK = true;
  if (heading == null) heading = h; else { const d = ((h - heading + 540) % 360) - 180; heading = (heading + d * 0.3 + 360) % 360; }
  if (!hRaf) hRaf = requestAnimationFrame(() => { hRaf = 0; renderHeading(); });
}
function renderHeading() {
  if (!meMarker || heading == null) return;
  meMarker.setRotation(heading);
  meMarker.getElement().querySelector('.beam').classList.remove('off');
  if (mode === 3) {
    const now = performance.now();
    if (now - lastBearingSet > 80 && Math.abs(((heading - map.getBearing() + 540) % 360) - 180) > 1.5) { lastBearingSet = now; map.jumpTo({ bearing: heading }); }
  }
  refreshSheetDir();
}
async function askCompass() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r !== 'granted') { toast('Sem acesso à bússola: a direção vai aparecer quando você andar.', 5000); return; }
    }
  } catch (e) { /* segue sem bússola */ }
  if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient, true);
  else window.addEventListener('deviceorientation', onOrient, true);
}
let compassAsked = false;
function startLocate(fromRoute) {
  if (!('geolocation' in navigator)) { toast('Este navegador não dá acesso ao GPS.'); return; }
  if (!compassAsked) { compassAsked = true; askCompass(); }
  if (watchId == null) {
    locBtn.classList.add('wait');
    watchId = navigator.geolocation.watchPosition(onPos, onPosErr, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  }
  if (!fromRoute) setMode(2);
}
locBtn.onclick = () => {
  if (watchId == null || mode === 0) { startLocate(); return; }
  if (mode === 1) { setMode(2); if (me) map.easeTo({ center: me.c, zoom: Math.max(map.getZoom(), 17.5), duration: 500 }); return; }
  if (mode === 2) { setMode(3); if (heading == null) toast('Gire o celular devagar para a bússola acordar.', 3500); else map.easeTo({ bearing: heading, center: me ? me.c : map.getCenter(), duration: 400 }); return; }
  setMode(2); map.easeTo({ bearing: 0, duration: 400 });
};
map.on('dragstart', (e) => { if (e.originalEvent && mode >= 2) setMode(1); });
map.on('rotatestart', (e) => { if (e.originalEvent && mode === 3) setMode(2); });
setInterval(() => { if (me && Date.now() - lastFix > 30000 && meMarker) meMarker.getElement().classList.add('stale'); }, 5000);

/* onde estou */
const namedPaths = JB.paths.features.filter((f) => f.properties.n);
function nearestPathName(c) {
  const p = pm(c); let best = null;
  for (const f of namedPaths) {
    const cs = f.geometry.coordinates;
    for (let j = 0; j < cs.length - 1; j++) {
      const A = pm(cs[j]), B = pm(cs[j + 1]), dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy || 1;
      let t = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / L2; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(p[0] - A[0] - t * dx, p[1] - A[1] - t * dy);
      if (!best || d < best.d) best = { d, n: f.properties.n };
    }
  }
  return best && best.d < 14 ? best.n : null;
}
let lastStatus = 0;
function updateStatus() {
  const st = $('#status');
  if (!me) { st.hidden = true; return; }
  const now = Date.now(); if (now - lastStatus < 3000) return; lastStatus = now;
  const dG = distToGarden(me.c);
  if (dG > 60) { st.hidden = false; st.innerHTML = `Você está a <b>${fmtM(dG)}</b> do Jardim`; return; }
  let near = null;
  for (const it of items) { if (it.kind !== 'poi') continue; const d = dist(me.c, it.c); if (!near || d < near.d) near = { d, it }; }
  const path = nearestPathName(me.c);
  const parts = [];
  if (path) parts.push(`Na <b>${path}</b>`);
  if (near && near.d < 120) parts.push(`${parts.length ? 'perto' : 'Perto'} do <b>${near.it.n} · ${near.it.title}</b> (${fmtM(near.d)})`);
  if (!parts.length) parts.push('Você está no Jardim');
  st.innerHTML = parts.join(', ') + (me.acc > 25 ? ` <span style="opacity:.7">· GPS ±${Math.round(me.acc)} m</span>` : '');
  st.hidden = false;
}

/* ---------------- lista e busca ---------------- */
let filt = '';
function renderList() {
  const q = norm($('#q').value.trim());
  const ol = $('#items'); ol.innerHTML = '';
  let arr = items.slice();
  const SYN = { banheiro: 'wc', sanitario: 'wc', wc: 'wc', toalete: 'wc', agua: 'agua', bebedouro: 'agua', comida: 'lanche', lanche: 'lanche', cafe: 'lanche', lanchonete: 'lanche', restaurante: 'lanche', loja: 'loja', ingresso: 'bilheteria', bilheteria: 'bilheteria', cadeirante: 'acess', acessibilidade: 'acess' };
  if (filt && filt !== 'perto') arr = arr.filter((it) => it.cat === filt || (filt === 'servico' && it.kind === 'svc'));
  if (filt !== 'servico' && !q) arr = arr.filter((it) => it.kind === 'poi' || filt === 'perto');
  if (q) {
    const syn = Object.keys(SYN).find((k) => q.startsWith(k) || k.startsWith(q) && q.length >= 3);
    arr = arr.filter((it) => (/^\d+$/.test(q) ? String(it.n) === q : (norm(it.title).includes(q) || norm(it.en).includes(q) || (syn && it.svc === SYN[syn]) || norm(CAT_NAME[it.cat]).includes(q))));
  }
  if (me) arr.forEach((it) => { it._d = dist(me.c, it.c); });
  if (filt === 'perto' && me) arr.sort((a, b) => a._d - b._d);
  else arr.sort((a, b) => (a.n || 999) - (b.n || 999) || a.title.localeCompare(b.title));
  if (filt === 'perto' && !me) { ol.innerHTML = '<li class="empty">Ligue a localização (botão azul no mapa) para ordenar pelo mais perto.</li>'; return; }
  if (!arr.length) { ol.innerHTML = '<li class="empty">Nada encontrado. Tente outro nome ou o número da placa.</li>'; return; }
  const frag = document.createDocumentFragment();
  arr.forEach((it) => {
    const li = document.createElement('li');
    const badge = it.kind === 'poi' ? `<span class="n${it.n === 1 ? ' gate' : ''}">${it.n}</span>` : `<span class="n s">${ICON[it.svc]}</span>`;
    li.innerHTML = `${badge}<span class="t"><b></b><small></small></span><span class="d">${me ? fmtM(it._d) : ''}</span>`;
    li.querySelector('b').textContent = it.title;
    li.querySelector('small').textContent = it.kind === 'poi' ? (CAT_NAME[it.cat] || '') : 'Serviço';
    li.onclick = () => { closeList(); select(it, true); };
    frag.appendChild(li);
  });
  ol.appendChild(frag);
}
function openList() { $('#list').hidden = false; renderList(); setTimeout(() => $('#q').focus({ preventScroll: true }), 50); }
function closeList() { $('#list').hidden = true; $('#q').blur(); }
$('#searchBtn').onclick = openList;
$('#listClose').onclick = closeList;
$('#q').addEventListener('input', renderList);
$('#chips').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filt = b.dataset.f; document.querySelectorAll('#chips button').forEach((x) => x.classList.toggle('on', x === b)); renderList();
});

/* ---------------- avisos ---------------- */
let toastT = 0;
function toast(msg, ms) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 3200);
}
$('#toast').onclick = () => { $('#toast').hidden = true; };

/* ---------------- sem internet ---------------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
