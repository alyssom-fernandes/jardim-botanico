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
const angDiff = (a, b) => ((a - b + 540) % 360) - 180;
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* ---------------- idiomas ---------------- */
const T = {
  pt: {
    search: 'Buscar no Jardim', ctaTitle: 'Mostrar onde estou', ctaSub: 'e para onde o celular aponta',
    walkThere: 'Como chegar a pé', center: 'Centralizar', sat: 'Satélite', map: 'Mapa',
    qPh: 'Nome ou número (ex.: 47, orquídeas, banheiro)', segSign: 'Placas do Jardim', segGuide: 'Guia de visitação',
    chipAll: 'Todos', chipNear: 'Mais perto',
    footTrail: 'Linha verde tracejada: trilha sugerida pelo Jardim.',
    credits: 'Desenho: mapa do arboreto (AAJB) e guia de visitação do JBRJ, encaixados no OpenStreetMap. Satélite: Esri.',
    needLoc: 'Toque no botão azul para ver a distância e a direção.',
    here: 'Você está aqui', straight: 'em linha reta',
    d_ahead: 'à sua frente', d_aheadR: 'à frente, à direita', d_right: 'à sua direita', d_aheadL: 'à frente, à esquerda', d_left: 'à sua esquerda', d_behind: 'atrás de você',
    card: ['ao norte', 'a nordeste', 'a leste', 'a sudeste', 'ao sul', 'a sudoeste', 'a oeste', 'a noroeste'],
    point: ['o norte', 'o nordeste', 'o leste', 'o sudeste', 'o sul', 'o sudoeste', 'o oeste', 'o noroeste'],
    pointing: 'Apontando para {d}', ahead: 'À frente: {x}, {m}.', noneAhead: 'Nenhum ponto nessa direção.', byGps: '(pelo GPS)',
    onPath: 'Na {p}', near: 'perto do {x}', Near: 'Perto do {x}', inGarden: 'Você está no Jardim', away: 'Você está a {d} do Jardim', gps: 'GPS ±{n} m',
    numSign: 'Número das placas do Jardim.', numGuide: 'Número do guia de visitação.',
    srcOsm: 'Posição exata (OpenStreetMap).', srcGuide: 'Posição pelo guia oficial (margem de 7 m).', srcSign: 'Posição pela placa do Jardim (margem de 10 m).',
    service: 'Serviço', rbMain: '{t} a pé ({d})', rbTo: 'Até {x}',
    t_cone: 'O cone azul mostra para onde o celular aponta. Toque de novo no botão azul para o mapa girar com você.',
    t_far: 'Você está a {d} do Jardim. O ponto azul aparece quando você chegar.',
    t_blocked: 'A localização está bloqueada. No iPhone: Ajustes › Privacidade › Serviços de Localização › Safari › "Ao Usar o App". Depois recarregue a página.',
    t_nogps: 'Ainda sem sinal de GPS. Fique num lugar mais aberto por alguns segundos.',
    t_nocompass: 'Este celular não mandou a bússola. A direção aparece quando você andar.',
    t_denied: 'Sem acesso à bússola. Feche a aba, abra o link de novo e toque em "Permitir" quando o iPhone perguntar sobre movimento e orientação.',
    t_wake: 'Gire o celular devagar para a bússola acordar.',
    t_rotating: 'O mapa agora gira com você: o topo da tela é para onde o celular aponta.',
    t_routeGps: 'Ligando o GPS para traçar a rota…', t_arrived: 'Você chegou: {x}', t_noGeo: 'Este navegador não dá acesso ao GPS.',
    e_near: 'Ligue a localização no botão azul do mapa para ordenar pelo mais perto.', e_none: 'Nada encontrado. Tente outro nome ou o número da placa.',
    cat_entrada: 'Entradas', cat_jardim: 'Jardins e estufas', cat_agua: 'Lagos e água', cat_planta: 'Árvores e coleções', cat_arte: 'Estátuas e monumentos',
    cat_historia: 'História', cat_cultura: 'Cultura', cat_vista: 'Mirantes e recantos', cat_pesquisa: 'Pesquisa', cat_servico: 'Serviços',
    a_north: 'Apontar o mapa para o norte', a_layer: 'Trocar entre mapa e satélite', a_loc: 'Mostrar minha localização', a_close: 'Fechar',
  },
  en: {
    search: 'Search the Garden', ctaTitle: 'Show where I am', ctaSub: 'and which way my phone points',
    walkThere: 'Walk there', center: 'Center on map', sat: 'Satellite', map: 'Map',
    qPh: 'Name or number (e.g. 47, orchids, toilet)', segSign: 'Garden signs', segGuide: 'Visitor guide',
    chipAll: 'All', chipNear: 'Nearest',
    footTrail: 'Dashed green line: trail suggested by the Garden.',
    credits: 'Drawing: arboretum map (AAJB) and the JBRJ visitor guide, fitted to OpenStreetMap. Satellite: Esri.',
    needLoc: 'Tap the blue button to see distance and direction.',
    here: 'You are here', straight: 'in a straight line',
    d_ahead: 'ahead of you', d_aheadR: 'ahead, to your right', d_right: 'to your right', d_aheadL: 'ahead, to your left', d_left: 'to your left', d_behind: 'behind you',
    card: ['to the north', 'to the northeast', 'to the east', 'to the southeast', 'to the south', 'to the southwest', 'to the west', 'to the northwest'],
    point: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'],
    pointing: 'Pointing {d}', ahead: 'Ahead: {x}, {m}.', noneAhead: 'Nothing numbered in this direction.', byGps: '(from GPS)',
    onPath: 'On {p}', near: 'near {x}', Near: 'Near {x}', inGarden: 'You are in the Garden', away: "You're {d} from the Garden", gps: 'GPS ±{n} m',
    numSign: 'Number on the Garden signs.', numGuide: 'Number in the visitor guide.',
    srcOsm: 'Exact position (OpenStreetMap).', srcGuide: 'Position from the official guide (within 7 m).', srcSign: 'Position from the Garden sign (within 10 m).',
    service: 'Service', rbMain: '{t} walk ({d})', rbTo: 'To {x}',
    t_cone: 'The blue cone shows which way your phone points. Tap the blue button again to rotate the map with you.',
    t_far: "You're {d} from the Garden. The blue dot appears when you get there.",
    t_blocked: 'Location is blocked. On iPhone: Settings › Privacy › Location Services › Safari › "While Using the App". Then reload the page.',
    t_nogps: 'No GPS signal yet. Stand somewhere more open for a few seconds.',
    t_nocompass: "This phone didn't send compass data. The direction appears once you start walking.",
    t_denied: 'No compass access. Close the tab, open the link again and tap "Allow" when the iPhone asks about motion and orientation.',
    t_wake: 'Turn your phone slowly to wake up the compass.',
    t_rotating: 'The map now turns with you: the top of the screen is where your phone points.',
    t_routeGps: 'Turning on GPS to plan the route…', t_arrived: "You've arrived: {x}", t_noGeo: "This browser doesn't give access to GPS.",
    e_near: 'Turn on location with the blue button on the map to sort by nearest.', e_none: 'Nothing found. Try another name or the sign number.',
    cat_entrada: 'Entrances', cat_jardim: 'Gardens & greenhouses', cat_agua: 'Lakes & water', cat_planta: 'Trees & collections', cat_arte: 'Statues & monuments',
    cat_historia: 'History', cat_cultura: 'Culture', cat_vista: 'Viewpoints', cat_pesquisa: 'Research', cat_servico: 'Services',
    a_north: 'Point the map north', a_layer: 'Switch between map and satellite', a_loc: 'Show my location', a_close: 'Close',
  },
  es: {
    search: 'Buscar en el Jardín', ctaTitle: 'Mostrar dónde estoy', ctaSub: 'y hacia dónde apunta mi celular',
    walkThere: 'Cómo llegar a pie', center: 'Centrar en el mapa', sat: 'Satélite', map: 'Mapa',
    qPh: 'Nombre o número (ej.: 47, orquídeas, baño)', segSign: 'Carteles del Jardín', segGuide: 'Guía de visita',
    chipAll: 'Todos', chipNear: 'Más cerca',
    footTrail: 'Línea verde discontinua: sendero sugerido por el Jardín.',
    credits: 'Dibujo: mapa del arboreto (AAJB) y guía de visita del JBRJ, ajustados a OpenStreetMap. Satélite: Esri.',
    needLoc: 'Toca el botón azul para ver la distancia y la dirección.',
    here: 'Estás aquí', straight: 'en línea recta',
    d_ahead: 'delante de ti', d_aheadR: 'adelante, a tu derecha', d_right: 'a tu derecha', d_aheadL: 'adelante, a tu izquierda', d_left: 'a tu izquierda', d_behind: 'detrás de ti',
    card: ['al norte', 'al noreste', 'al este', 'al sureste', 'al sur', 'al suroeste', 'al oeste', 'al noroeste'],
    point: ['el norte', 'el noreste', 'el este', 'el sureste', 'el sur', 'el suroeste', 'el oeste', 'el noroeste'],
    pointing: 'Apuntando hacia {d}', ahead: 'Adelante: {x}, {m}.', noneAhead: 'Ningún punto en esa dirección.', byGps: '(por GPS)',
    onPath: 'En la {p}', near: 'cerca de {x}', Near: 'Cerca de {x}', inGarden: 'Estás en el Jardín', away: 'Estás a {d} del Jardín', gps: 'GPS ±{n} m',
    numSign: 'Número de los carteles del Jardín.', numGuide: 'Número de la guía de visita.',
    srcOsm: 'Posición exacta (OpenStreetMap).', srcGuide: 'Posición según la guía oficial (margen de 7 m).', srcSign: 'Posición según el cartel del Jardín (margen de 10 m).',
    service: 'Servicio', rbMain: '{t} a pie ({d})', rbTo: 'Hasta {x}',
    t_cone: 'El cono azul muestra hacia dónde apunta tu celular. Toca de nuevo el botón azul para que el mapa gire contigo.',
    t_far: 'Estás a {d} del Jardín. El punto azul aparece cuando llegues.',
    t_blocked: 'La ubicación está bloqueada. En iPhone: Ajustes › Privacidad › Localización › Safari › "Mientras se usa la app". Luego recarga la página.',
    t_nogps: 'Todavía no hay señal GPS. Quédate en un lugar más abierto unos segundos.',
    t_nocompass: 'Este celular no envió la brújula. La dirección aparece cuando empieces a caminar.',
    t_denied: 'Sin acceso a la brújula. Cierra la pestaña, abre el enlace de nuevo y toca "Permitir" cuando el iPhone pregunte por movimiento y orientación.',
    t_wake: 'Gira el celular despacio para activar la brújula.',
    t_rotating: 'Ahora el mapa gira contigo: la parte de arriba de la pantalla es hacia donde apunta el celular.',
    t_routeGps: 'Activando el GPS para trazar la ruta…', t_arrived: 'Llegaste: {x}', t_noGeo: 'Este navegador no da acceso al GPS.',
    e_near: 'Activa la ubicación con el botón azul del mapa para ordenar por cercanía.', e_none: 'No se encontró nada. Prueba otro nombre o el número del cartel.',
    cat_entrada: 'Entradas', cat_jardim: 'Jardines e invernaderos', cat_agua: 'Lagos y agua', cat_planta: 'Árboles y colecciones', cat_arte: 'Estatuas y monumentos',
    cat_historia: 'Historia', cat_cultura: 'Cultura', cat_vista: 'Miradores', cat_pesquisa: 'Investigación', cat_servico: 'Servicios',
    a_north: 'Orientar el mapa al norte', a_layer: 'Cambiar entre mapa y satélite', a_loc: 'Mostrar mi ubicación', a_close: 'Cerrar',
  },
};
const LANGS = ['pt', 'en', 'es'];
let lang = (() => {
  try { const s = localStorage.getItem('jb-lang'); if (LANGS.includes(s)) return s; } catch (e) {}
  const n = (navigator.language || 'pt').slice(0, 2).toLowerCase();
  return n === 'es' ? 'es' : n === 'en' ? 'en' : 'pt';
})();
const t = (k, v) => {
  let s = T[lang][k]; if (s === undefined) s = T.pt[k]; if (s === undefined) return k;
  if (v && typeof s === 'string') for (const [a, b] of Object.entries(v)) s = s.split('{' + a + '}').join(b);
  return s;
};
const fmtM = (m) => {
  if (m < 1000) { const st = m < 100 ? 5 : 10; return `${Math.round(m / st) * st} m`; }
  const km = (m / 1000).toFixed(1); return `${lang === 'en' ? km : km.replace('.', ',')} km`;
};
const fmtMin = (m) => { const x = Math.max(1, Math.round(m / 65)); return x < 60 ? `${x} min` : `${Math.floor(x / 60)} h ${x % 60} min`; };
// nomes compostos: "A · B" vira "A, B"; entradas viram "Entrada: Portão 920"
const nice = (s) => (s || '').replace(/^(Entrada|Entrance) · /, '$1: ').replace(/ · /g, ', ');

/* ---------------- ícones e nomes dos serviços (legenda da placa) ---------------- */
const ICON = {
  bilheteria: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5h19v3.6a2 2 0 0 0 0 3.8v3.6h-19v-3.6a2 2 0 0 0 0-3.8zM9 8v2h1.6V8zm0 3v2h1.6v-2zm0 3v2h1.6v-2z" fill-rule="evenodd"/></svg>',
  loja: '<svg viewBox="0 0 24 24"><path d="M3.5 8.5h17v4h-17zM5 12.5h6v9.5H5zM13 12.5h6v9.5h-6zM11 8.5h2V22h-2z"/><path d="M12 8.2C10.4 4.6 6.6 3.6 6.6 6.1c0 1.7 2.6 2.1 5.4 2.1 2.8 0 5.4-.4 5.4-2.1 0-2.5-3.8-1.5-5.4 2.1z"/></svg>',
  telefone: '<svg viewBox="0 0 24 24"><path d="M6.6 2.5 9.4 6c.5.6.4 1.4-.1 2L8 9.3a13 13 0 0 0 6.7 6.7l1.3-1.3c.6-.5 1.4-.6 2-.1l3.5 2.8c.6.5.7 1.4.2 2l-1.6 1.9c-.7.8-1.8 1.1-2.8.8C10.8 20.4 3.6 13.2 1.9 6.7c-.3-1 0-2.1.8-2.8l1.9-1.6c.6-.5 1.5-.4 2 .2z"/></svg>',
  wc: '<svg viewBox="0 0 24 24"><circle cx="7" cy="3.6" r="2"/><circle cx="17" cy="3.6" r="2"/><path d="M4.6 6.5h4.8l1.1 7.5H9v8H5.1v-8H3.5zM14.6 6.5h4.8l2 9.5h-2.7v6h-3.4v-6h-2.7z"/></svg>',
  acess: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="3.5" r="2.1"/><path d="M9 6.8h2.6v4.6h5.2l3.1 6.4-2 .9-2.5-5H9z"/><path d="M7.7 9.6a6.4 6.4 0 1 0 8.5 9.2l-1.7-.9a4.5 4.5 0 1 1-6.8-6.3z"/></svg>',
  agua: '<svg viewBox="0 0 24 24"><path d="M12 2.2S5.6 9.4 5.6 14a6.4 6.4 0 0 0 12.8 0C18.4 9.4 12 2.2 12 2.2z"/></svg>',
  lanche: '<svg viewBox="0 0 24 24"><path d="M6.5 2v7.6a2.2 2.2 0 0 0 1.6 2.1V22h2.2V11.7A2.2 2.2 0 0 0 12 9.6V2h-1.4v6.4H9.8V2H8.7v6.4H7.9V2zM17 2c-1.8 0-3 2.4-3 5.6v6h2.2V22h2.3V2z"/></svg>',
  carro: '<svg viewBox="0 0 24 24"><path d="M3.5 4h17v2.2h-17zM5.2 6.2l.7 6.3h12.2l.7-6.3h-1.9l-.5 4.4H7.6l-.5-4.4zM2.5 12.6h19v4.6h-19z"/><circle cx="7" cy="18.6" r="2.3"/><circle cx="17" cy="18.6" r="2.3"/></svg>',
};
const SVC = {
  bilheteria: { pt: 'Bilheteria', en: 'Tickets', es: 'Taquilla' },
  loja: { pt: 'Loja', en: 'Store', es: 'Tienda' },
  telefone: { pt: 'Telefone', en: 'Telephone', es: 'Teléfono' },
  wc: { pt: 'Sanitários', en: 'Restrooms (WC)', es: 'Baños' },
  acess: { pt: 'Acesso para deficiente físico', en: 'Wheelchair access', es: 'Acceso para silla de ruedas' },
  agua: { pt: 'Bebedouro', en: 'Drinking fountain', es: 'Bebedero' },
  lanche: { pt: 'Lanche', en: 'Food service', es: 'Cafetería' },
  carro: { pt: 'Parada do carro elétrico', en: 'Electric car stop', es: 'Parada del carrito eléctrico' },
};
const SVC_ORDER = ['bilheteria', 'loja', 'telefone', 'wc', 'acess', 'agua', 'lanche', 'carro'];
const MAJOR_SETS = { guia: new Set([1, 4, 7, 11, 13, 15, 17, 20, 21, 25, 28, 31, 34, 36, 38, 39, 42, 44]), placa: new Set([1, 5, 14, 18, 23, 27, 29, 30, 33, 34, 38, 42, 45, 47, 51, 54, 58, 60, 61, 62]) };
let numMode = 'placa';
try { if (localStorage.getItem('jb-num') === 'guia') numMode = 'guia'; } catch (e) {}

/* ---------------- itens (pontos + serviços) ---------------- */
const items = [];
function buildItems() {
  items.length = 0;
  const pois = numMode === 'guia' ? JB.guide.pois : JB.pois;
  pois.forEach((p, i) => items.push({ id: numMode[0] + i, n: p.n, names: { pt: p.t, en: p.en, es: p.es || p.t }, c: p.c, cat: p.cat, src: p.src, kind: 'poi' }));
  JB.services.forEach((s, i) => items.push({ id: 's' + i, n: null, svc: s.k, c: s.c, cat: 'servico', src: 'placa', kind: 'svc' }));
  JB.guide.icons.filter((s) => s.k === 'carro').forEach((s, i) => items.push({ id: 'c' + i, n: null, svc: 'carro', c: s.c, cat: 'servico', src: 'guia', kind: 'svc' }));
  // cada serviço ganha uma referência: o ponto numerado mais perto
  const poiList = items.filter((x) => x.kind === 'poi');
  items.forEach((it) => {
    if (it.kind !== 'svc') return;
    let best = null; for (const p of poiList) { const d = dist(it.c, p.c); if (!best || d < best.d) best = { d, p }; }
    it.near = best && best.d < 140 ? best.p : null;
  });
}
const title = (it) => it.kind === 'svc' ? SVC[it.svc][lang] : nice(it.names[lang]);
const subtitle = (it) => it.kind === 'svc'
  ? (it.near ? t('Near', { x: `${it.near.n} ${nice(it.near.names[lang])}` }) : (lang === 'pt' ? SVC[it.svc].en : SVC[it.svc].pt))
  : nice(lang === 'pt' ? it.names.en : it.names.pt);
const label = (it) => it.n ? `${it.n} ${title(it)}` : title(it);
buildItems();

/* ---------------- mapa ---------------- */
const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
const fc = (features) => ({ type: 'FeatureCollection', features });
const GROUND = JB.pdf.ground.geometry.coordinates[0];
let gb = [[180, 90], [-180, -90]];
GROUND.forEach(([x, y]) => { gb[0][0] = Math.min(gb[0][0], x); gb[0][1] = Math.min(gb[0][1], y); gb[1][0] = Math.max(gb[1][0], x); gb[1][1] = Math.max(gb[1][1], y); });
const OSM_ATTR = '© colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const W = (a, b, c, d) => ['interpolate', ['exponential', 1.6], ['zoom'], 14, a, 16, b, 18, c, 20, d];
const WM = (val, A, B) => ['interpolate', ['exponential', 1.6], ['zoom'], ...[14, 16, 18, 20].flatMap((z, i) => [z, ['match', ['get', 'k'], val, A[i], B[i]]])];
const style = {
  version: 8,
  glyphs: base + 'fonts/{fontstack}/{range}.pbf',
  sources: {
    sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19, attribution: 'Satélite © Esri, Maxar, Earthstar Geographics' },
    ground: { type: 'geojson', data: JB.pdf.ground, attribution: 'Desenho: AAJB e JBRJ · ' + OSM_ATTR },
    beds: { type: 'geojson', data: JB.pdf.beds },
    amazon: { type: 'geojson', data: JB.pdf.amazon },
    pwater: { type: 'geojson', data: JB.pdf.water },
    canal: { type: 'geojson', data: JB.pdf.canal },
    trail: { type: 'geojson', data: JB.pdf.trail },
    pbld: { type: 'geojson', data: JB.pdf.bld },
    ctxb: { type: 'geojson', data: JB.ctxBuildings },
    roads: { type: 'geojson', data: JB.roads },
    palms: { type: 'geojson', data: JB.palms },
    paths: { type: 'geojson', data: JB.paths },
    gtrail: { type: 'geojson', data: JB.guide.trail },
    acc: { type: 'geojson', data: fc([]) },
    route: { type: 'geojson', data: fc([]) },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#e4ddc8' } },
    { id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } },
    { id: 'ctxb', type: 'fill', source: 'ctxb', paint: { 'fill-color': '#d6ccb3', 'fill-outline-color': '#c9bea3' } },
    { id: 'road-case', type: 'line', source: 'roads', filter: ['!=', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#c8bda2', 'line-width': W(2, 7, 20, 60) } },
    { id: 'road', type: 'line', source: 'roads', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'k'], 'walk', '#efe9d8', '#fffdf6'], 'line-width': WM('walk', [.5, 1.5, 4, 10], [1.2, 5.5, 17, 54]) } },
    { id: 'ground', type: 'fill', source: 'ground', paint: { 'fill-color': '#f7f0dc' } },
    { id: 'ground-edge', type: 'line', source: 'ground', paint: { 'line-color': '#b9ab84', 'line-width': W(.6, 1, 1.6, 2.5) } },
    { id: 'beds', type: 'fill', source: 'beds', paint: { 'fill-color': '#2f7b4b' } },
    { id: 'beds-edge', type: 'line', source: 'beds', paint: { 'line-color': '#1f5c37', 'line-width': W(.2, .5, 1, 1.6) } },
    { id: 'amazon', type: 'fill', source: 'amazon', paint: { 'fill-color': '#5c9d5a' } },
    { id: 'canal', type: 'line', source: 'canal', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#5fb9ea', 'line-width': W(.5, 1.2, 3, 8) } },
    { id: 'pwater', type: 'fill', source: 'pwater', paint: { 'fill-color': '#7cc9ef' } },
    { id: 'pwater-line', type: 'line', source: 'pwater', paint: { 'line-color': '#3f9ed4', 'line-width': W(.3, .6, 1.2, 2.4) } },
    { id: 'trail', type: 'line', source: 'trail', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#f7f0dc', 'line-width': W(.5, 1.2, 3.2, 9) } },
    { id: 'palms', type: 'circle', source: 'palms', minzoom: 16.8, paint: { 'circle-color': '#1b5233', 'circle-radius': W(1, 1.4, 2.8, 6.5), 'circle-stroke-color': '#a7d6b0', 'circle-stroke-width': .6 } },
    { id: 'pbld', type: 'fill', source: 'pbld', paint: { 'fill-color': '#e2703a' } },
    { id: 'pbld-line', type: 'line', source: 'pbld', paint: { 'line-color': '#a6461f', 'line-width': W(.3, .6, 1.1, 2) } },
    { id: 'beds-sat', type: 'line', source: 'beds', layout: { visibility: 'none' }, paint: { 'line-color': '#fff6d8', 'line-opacity': .55, 'line-width': W(.4, .8, 1.4, 2.2) } },
    { id: 'path', type: 'line', source: 'paths', layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff3cf', 'line-opacity': .5, 'line-width': WM('main', [1.2, 2.6, 6, 16], [.6, 1.4, 3.5, 9]) } },
    { id: 'gtrail-case', type: 'line', source: 'gtrail', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-opacity': .95, 'line-width': W(2.5, 4.5, 8, 14) } },
    { id: 'gtrail', type: 'line', source: 'gtrail', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1f8f63', 'line-width': W(1.2, 2.4, 4.4, 8), 'line-dasharray': [1.6, 1.1] } },
    { id: 'acc', type: 'fill', source: 'acc', paint: { 'fill-color': '#1a73e8', 'fill-opacity': .12 } },
    { id: 'acc-line', type: 'line', source: 'acc', paint: { 'line-color': '#1a73e8', 'line-opacity': .35, 'line-width': 1 } },
    { id: 'route-case', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': W(5, 8, 14, 26) } },
    { id: 'route', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'walk'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1a73e8', 'line-width': W(3, 5, 9, 18) } },
    { id: 'route-link', type: 'line', source: 'route', filter: ['==', ['get', 'k'], 'link'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#1a73e8', 'line-width': W(2, 3, 5, 9), 'line-dasharray': [0.2, 1.8] } },
    { id: 'road-label', type: 'symbol', source: 'roads', minzoom: 15, filter: ['all', ['has', 'n'], ['!=', ['get', 'k'], 'walk']], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 19, 14], 'symbol-spacing': 320 }, paint: { 'text-color': '#6d6450', 'text-halo-color': '#fffdf6', 'text-halo-width': 1.4 } },
    { id: 'path-label', type: 'symbol', source: 'paths', minzoom: 16.2, filter: ['has', 'n'], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Italic'], 'text-size': ['interpolate', ['linear'], ['zoom'], 16.2, 10, 19, 14], 'symbol-spacing': 260, 'text-max-angle': 35, 'text-padding': 2 }, paint: { 'text-color': '#24492f', 'text-halo-color': '#f7f0dc', 'text-halo-width': 2 } },
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
  const cam = map.cameraForBounds(gb, { bearing: SIGN_BEARING });
  if (!cam) return;
  map.jumpTo({ center: cam.center, zoom: cam.zoom, bearing: SIGN_BEARING });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  GROUND.forEach((c) => { const q = map.project(c); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
  const cw = map.getContainer().clientWidth, ch = map.getContainer().clientHeight;
  const pad = { t: 76, b: 96, l: 10, r: 72 };
  const k = Math.min((cw - pad.l - pad.r) / (x1 - x0), (ch - pad.t - pad.b) / (y1 - y0));
  const mid = map.unproject([(x0 + x1) / 2, (y0 + y1) / 2]);
  const z = map.getZoom() + Math.log2(k);
  map.jumpTo({ center: mid, zoom: z });
  const cpx = map.project(mid); const ctr = map.unproject([cpx.x - (pad.l - pad.r) / 2, cpx.y - (pad.t - pad.b) / 2]);
  map[animate ? 'easeTo' : 'jumpTo']({ center: ctr, zoom: z, bearing: SIGN_BEARING, duration: animate ? 600 : 0 });
}
fitGarden(false);
map.touchZoomRotate.enableRotation();
const setZoomCls = () => { const z = map.getZoom(); document.body.classList.toggle('zoomed-out', z < 16.6); document.body.classList.toggle('far-out', z < 14.6); };
map.on('zoom', setZoomCls); setZoomCls();

/* ---------------- camadas: mapa x satélite ---------------- */
let sat = false;
const MAP_ONLY = ['ctxb', 'road-case', 'road', 'ground', 'ground-edge', 'beds', 'beds-edge', 'amazon', 'canal', 'pwater', 'pwater-line', 'trail', 'palms', 'pbld', 'pbld-line'];
const SAT_ONLY = ['sat', 'beds-sat', 'path'];
function applyLayerMode() {
  $('#layerLbl').textContent = sat ? t('map') : t('sat');
  if (!map.isStyleLoaded()) { map.once('idle', applyLayerMode); return; }
  SAT_ONLY.forEach((id) => map.setLayoutProperty(id, 'visibility', sat ? 'visible' : 'none'));
  MAP_ONLY.forEach((id) => map.setLayoutProperty(id, 'visibility', sat ? 'none' : 'visible'));
  map.setPaintProperty('path-label', 'text-halo-color', sat ? '#ffffff' : '#f7f0dc');
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
function renderMarkers() {
  markers.forEach((m) => m.mk.remove()); markers.clear();
  const major = MAJOR_SETS[numMode];
  items.forEach((it) => {
    const el = document.createElement('div');
    if (it.kind === 'poi') {
      el.className = 'poi ' + (numMode === 'guia' ? 'g' : 'p') + (major.has(it.n) ? '' : ' minor');
      el.textContent = it.n;
    } else { el.className = 'svc'; el.innerHTML = ICON[it.svc]; }
    el.title = label(it);
    el.addEventListener('click', (e) => { e.stopPropagation(); select(it, true); });
    const mk = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(it.c).addTo(map);
    markers.set(it.id, { mk, el, it });
  });
}
renderMarkers();
function setNumMode(m) {
  if (m === numMode) return;
  numMode = m;
  try { localStorage.setItem('jb-num', m); } catch (e) {}
  closeSheet(); stopRoute();
  buildItems(); renderMarkers(); paintSeg();
  if (!$('#list').hidden) renderList();
}

/* ---------------- grafo de caminhos e rotas (rede tirada do mapa oficial) ---------------- */
const G = (() => {
  const nodes = [], P = [], idx = new Map(), adj = [], segs = [];
  const nid = (c) => { const k = c[0].toFixed(6) + ',' + c[1].toFixed(6); let i = idx.get(k); if (i === undefined) { i = nodes.length; idx.set(k, i); nodes.push(c); P.push(pm(c)); adj.push([]); } return i; };
  const link = (a, b, w) => { adj[a].push([b, w]); adj[b].push([a, w]); };
  JB.walk.features.forEach((f) => {
    const cs = f.geometry.coordinates;
    for (let j = 0; j < cs.length - 1; j++) {
      const a = nid(cs[j]), b = nid(cs[j + 1]); if (a === b) continue;
      const w = Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]); link(a, b, w); segs.push([a, b, w]);
    }
  });
  const nseg = segs.length;
  for (let i = 0; i < nodes.length; i++) {
    if (adj[i].length !== 1) continue;
    let best = null;
    for (let s = 0; s < nseg; s++) {
      const [a, b, len] = segs[s]; if (a === i || b === i || adj[i][0][0] === a || adj[i][0][0] === b) continue;
      const A = P[a], B = P[b], dx = B[0] - A[0], dy = B[1] - A[1];
      let u = ((P[i][0] - A[0]) * dx + (P[i][1] - A[1]) * dy) / (len * len || 1); u = Math.max(0, Math.min(1, u));
      const d = Math.hypot(P[i][0] - A[0] - u * dx, P[i][1] - A[1] - u * dy);
      if (d < 5 && (!best || d < best.d)) best = { a, b, u, d, len };
    }
    if (best) { link(i, best.a, best.d + best.u * best.len); link(i, best.b, best.d + (1 - best.u) * best.len); }
  }
  return { nodes, P, adj, segs };
})();
function snap(c) {
  const p = pm(c); let best = null;
  for (const [a, b, len] of G.segs) {
    const A = G.P[a], B = G.P[b], dx = B[0] - A[0], dy = B[1] - A[1];
    let u = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / (len * len || 1); u = Math.max(0, Math.min(1, u));
    const qx = A[0] + u * dx, qy = A[1] + u * dy, d = Math.hypot(p[0] - qx, p[1] - qy);
    if (!best || d < best.d) best = { a, b, u, d, len, q: ung([qx, qy]) };
  }
  return best;
}
function shortest(from, to) {
  const s = snap(from), e = snap(to); if (!s || !e) return null;
  const N = G.nodes.length, S = N, Tn = N + 1;
  const extra = new Map();
  const add = (u, v, w) => { if (!extra.has(u)) extra.set(u, []); extra.get(u).push([v, w]); };
  add(S, s.a, s.u * s.len); add(S, s.b, (1 - s.u) * s.len);
  add(e.a, Tn, e.u * e.len); add(e.b, Tn, (1 - e.u) * e.len);
  if (s.a === e.a && s.b === e.b) add(S, Tn, Math.abs(s.u - e.u) * s.len);
  else if (s.a === e.b && s.b === e.a) add(S, Tn, Math.abs(s.u - (1 - e.u)) * s.len);
  const D = new Float64Array(N + 2).fill(Infinity), prev = new Int32Array(N + 2).fill(-1), done = new Uint8Array(N + 2);
  const heap = [[0, S]]; D[S] = 0;
  const push = (x) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  while (heap.length) {
    const [d, u] = pop(); if (done[u]) continue; done[u] = 1; if (u === Tn) break;
    const nb = (u < N ? G.adj[u] : []).concat(extra.get(u) || []);
    for (const [v, w] of nb) { const nd = d + w; if (nd < D[v]) { D[v] = nd; prev[v] = u; push([nd, v]); } }
  }
  if (!isFinite(D[Tn])) return null;
  const seq = []; for (let u = prev[Tn]; u !== -1 && u !== S; u = prev[u]) seq.push(G.nodes[u]);
  seq.reverse();
  return { line: [s.q, ...seq, e.q], len: s.d + D[Tn] + e.d };
}
let routeTo = null, lastRouteAt = 0, pendingRoute = null;
function drawRoute(force) {
  if (!routeTo || !me) return;
  const src = map.getSource('route'); if (!src) return;
  const now = Date.now(); if (!force && now - lastRouteAt < 2500) return; lastRouteAt = now;
  const r = shortest(me.c, routeTo.c);
  const feats = []; let len;
  if (r) {
    feats.push({ type: 'Feature', properties: { k: 'walk' }, geometry: { type: 'LineString', coordinates: r.line } });
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [me.c, r.line[0]] } });
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [r.line[r.line.length - 1], routeTo.c] } });
    len = r.len;
  } else {
    feats.push({ type: 'Feature', properties: { k: 'link' }, geometry: { type: 'LineString', coordinates: [me.c, routeTo.c] } });
    len = dist(me.c, routeTo.c);
  }
  src.setData(fc(feats));
  if (dist(me.c, routeTo.c) < 15) { toast(t('t_arrived', { x: label(routeTo) })); stopRoute(); return; }
  $('#rbMain').textContent = t('rbMain', { t: fmtMin(len), d: fmtM(len) });
  $('#rbSub').textContent = t('rbTo', { x: label(routeTo) });
}
function startRoute(it) {
  if (!me) { pendingRoute = it; startLocate(true); toast(t('t_routeGps')); return; }
  routeTo = it; document.body.classList.add('routing'); $('#routeBar').hidden = false;
  drawRoute(true);
  const bounds = new maplibregl.LngLatBounds(me.c, me.c); bounds.extend(it.c);
  map.fitBounds(bounds, { padding: { top: 120, bottom: sheetH() + 40, left: 50, right: 80 }, maxZoom: 18.5, duration: 700, bearing: map.getBearing() });
}
function stopRoute() {
  routeTo = null; document.body.classList.remove('routing'); $('#routeBar').hidden = true;
  const src = map.getSource('route'); if (src) src.setData(fc([]));
}
$('#rbClose').onclick = stopRoute;
map.on('load', () => { if (routeTo) drawRoute(true); });

/* ---------------- seleção / folha ---------------- */
let sel = null;
function sheetH() { const s = $('#sheet'); return s.hidden ? 0 : s.getBoundingClientRect().height; }
function syncSheetH() { document.documentElement.style.setProperty('--sheet-h', Math.ceil(sheetH()) + 'px'); }
if ('ResizeObserver' in window) new ResizeObserver(syncSheetH).observe($('#sheet'));
function paintSheet() {
  const it = sel; if (!it) return;
  const badge = $('#sBadge');
  if (it.kind === 'svc') { badge.className = 'badge s'; badge.innerHTML = ICON[it.svc]; }
  else { badge.className = 'badge ' + (numMode === 'guia' ? 'g' : 'p'); badge.textContent = it.n; }
  $('#sTitle').textContent = title(it);
  $('#sSub').textContent = subtitle(it);
  const num = it.kind === 'poi' ? t(numMode === 'guia' ? 'numGuide' : 'numSign') + ' ' : '';
  const src = it.src === 'osm' ? t('srcOsm') : it.src === 'guia' ? t('srcGuide') : t('srcSign');
  $('#sSrc').textContent = num + (it.kind === 'poi' ? t('cat_' + it.cat) + '. ' : '') + src;
  refreshSheetDir(true);
}
function select(it, fly) {
  if (sel) { const m = markers.get(sel.id); if (m) m.el.classList.remove('sel'); }
  sel = it;
  const m = markers.get(it.id); if (m) m.el.classList.add('sel');
  $('#sheet').hidden = false; document.body.classList.add('sheet-open');
  paintSheet(); syncSheetH();
  if (fly) {
    const wide = window.innerWidth >= 760;
    map.easeTo({ center: it.c, zoom: Math.max(map.getZoom(), 17.2), padding: { top: 70, bottom: wide ? 0 : sheetH(), left: wide ? 430 : 0, right: 0 }, duration: 600 });
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
  if (heading == null) return { word: t('card')[Math.round(b / 45) % 8], rot: b - map.getBearing() };
  const r = (b - heading + 360) % 360;
  const word = r < 25 || r > 335 ? t('d_ahead') : r < 155 ? (r < 65 ? t('d_aheadR') : t('d_right')) : r > 205 ? (r > 295 ? t('d_aheadL') : t('d_left')) : t('d_behind');
  return { word, rot: r };
}
let lastDirAt = 0;
function refreshSheetDir(force) {
  if (!sel || $('#sheet').hidden) return;
  const now = Date.now(); if (!force && now - lastDirAt < 150) return; lastDirAt = now;
  const dir = $('#sDir'), dd = $('#sDist');
  if (!me) { dir.classList.add('na'); dir.style.transform = ''; dd.textContent = t('needLoc'); return; }
  const d = dist(me.c, sel.c), b = brg(me.c, sel.c), w = relWords(b);
  dir.classList.remove('na');
  dir.style.transform = `rotate(${w.rot}deg)`;
  dd.innerHTML = d < 15 ? `<b>${esc(t('here'))}</b>` : `<b>${fmtM(d)}</b> ${esc(w.word)}, ${esc(t('straight'))}`;
}

/* ---------------- localização e bússola ---------------- */
let me = null, heading = null, mode = 0, watchId = null, meMarker = null, beamMarker = null, lastFix = 0;
const locBtn = $('#locBtn');
function setMode(m) {
  mode = m;
  locBtn.classList.toggle('on', m === 1);
  locBtn.classList.toggle('follow', m === 2);
  locBtn.classList.toggle('heading', m === 3);
  onRotate();
}
function beamEl() {
  const el = document.createElement('div'); el.className = 'mebeam';
  el.innerHTML = '<svg class="beam off" viewBox="0 0 120 120"><defs><radialGradient id="bg1" cx="60" cy="60" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1a73e8" stop-opacity=".8"/><stop offset=".55" stop-color="#1a73e8" stop-opacity=".38"/><stop offset="1" stop-color="#1a73e8" stop-opacity="0"/></radialGradient></defs><path d="M60 60 L24.7 11.5 A60 60 0 0 1 95.3 11.5 Z" fill="url(#bg1)"/></svg>';
  return el;
}
function meEl() { const el = document.createElement('div'); el.className = 'me'; el.innerHTML = '<div class="halo"></div><div class="dot"></div>'; return el; }
function circlePoly(c, r) {
  const p = pm(c), pts = [];
  for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI; pts.push(ung([p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)])); }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } };
}
/* A bússola do celular mede o norte magnético. No Jardim ele fica 23,0° a oeste do norte verdadeiro
   (modelo WMM-2025 da NOAA para 21/11/2026), então o rumo é corrigido. Se, andando, o rumo do GPS
   mostrar que o aparelho já entrega o norte verdadeiro, a correção é desligada sozinha. */
const DECL = -23.0;
let declOn = true, rawH = null, headingSrc = null;
const calib = [];
function calibrate(pos) {
  const co = pos.coords;
  if (rawH == null || co.heading == null || isNaN(co.heading) || (co.speed || 0) < 0.9 || co.accuracy > 20) return;
  calib.push(angDiff(co.heading, rawH)); if (calib.length > 30) calib.shift();
  if (calib.length < 8) return;
  const sx = calib.reduce((a, d) => a + Math.cos(rad(d)), 0), sy = calib.reduce((a, d) => a + Math.sin(rad(d)), 0);
  if (Math.hypot(sx, sy) / calib.length < 0.85) return;
  const m = deg(Math.atan2(sy, sx));
  declOn = Math.abs(angDiff(m, DECL)) < Math.abs(angDiff(m, 0));
}
function onPos(pos) {
  const c = [pos.coords.longitude, pos.coords.latitude], acc = pos.coords.accuracy;
  const first = !me;
  me = { c, acc, t: Date.now() }; lastFix = Date.now();
  locBtn.classList.remove('wait');
  try { localStorage.setItem('jb-loc', '1'); } catch (e) {}
  $('#startBtn').hidden = true;
  if (!meMarker) {
    beamMarker = new maplibregl.Marker({ element: beamEl(), anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat(c).addTo(map);
    meMarker = new maplibregl.Marker({ element: meEl(), anchor: 'center' }).setLngLat(c).addTo(map);
    if (heading != null) renderHeading();
  }
  meMarker.setLngLat(c); beamMarker.setLngLat(c); meMarker.getElement().classList.remove('stale');
  const accSrc = map.getSource('acc'); if (accSrc) accSrc.setData(acc > 6 ? circlePoly(c, acc) : fc([]));
  calibrate(pos);
  if (!compassOK && pos.coords.heading != null && !isNaN(pos.coords.heading) && (pos.coords.speed || 0) > 0.7) { heading = pos.coords.heading; headingSrc = 'gps'; renderHeading(); }
  if (first) {
    const dG = distToGarden(c);
    if (dG > 1500) { setMode(1); toast(t('t_far', { d: fmtM(dG) })); }
    else {
      map.easeTo({ center: c, zoom: Math.max(map.getZoom(), 17.5), duration: 700 });
      setTimeout(() => toast(t('t_cone'), 6500), 900);
    }
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
  if (err.code === 1) toast(t('t_blocked'), 9000);
  else if (!me) toast(t('t_nogps'), 5000);
}
function pointInRing(c, ring) {
  let inside = false; const [x, y] = c;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function distToGarden(c) {
  if (pointInRing(c, GROUND) || pointInRing(c, JB.ring)) return 0;
  let best = Infinity; for (const p of GROUND) best = Math.min(best, dist(c, p)); return best;
}
let compassOK = false, hTimer = 0, lastBearingSet = 0, orientOn = false, permAsked = false;
function onOrient(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading) && e.webkitCompassHeading >= 0) h = e.webkitCompassHeading;
  else if ((e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null) h = 360 - e.alpha;
  if (h == null) return;
  const so = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
  h = (h + so + 360) % 360;
  compassOK = true;
  rawH = rawH == null ? h : (rawH + angDiff(h, rawH) * 0.3 + 360) % 360;
  heading = (rawH + (declOn ? DECL : 0) + 360) % 360; headingSrc = 'bussola';
  if (!hTimer) hTimer = setTimeout(() => { hTimer = 0; renderHeading(); }, 50);
}
function renderHeading() {
  if (heading == null) return;
  if (beamMarker) { beamMarker.setRotation(heading); beamMarker.getElement().querySelector('.beam').classList.remove('off'); }
  if (mode === 3) {
    const now = performance.now();
    if (now - lastBearingSet > 80 && Math.abs(angDiff(heading, map.getBearing())) > 1.5) { lastBearingSet = now; map.jumpTo({ bearing: heading }); }
  }
  refreshSheetDir();
  updateHeadingLine();
}
const needsIOSPerm = () => typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
function listenOrientation() {
  if (orientOn) return; orientOn = true;
  if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient, true);
  else window.addEventListener('deviceorientation', onOrient, true);
  setTimeout(() => { if (!compassOK && me) toast(t('t_nocompass'), 5000); }, 6000);
}
// No iPhone a bússola só pode ser ligada por um toque: este pedido roda dentro do toque
function askCompass() {
  if (orientOn) return;
  if (!needsIOSPerm()) { listenOrientation(); return; }
  if (permAsked) return;
  try {
    DeviceOrientationEvent.requestPermission().then((r) => {
      permAsked = true; listenOrientation();
      if (r !== 'granted') setTimeout(() => { if (!compassOK) toast(t('t_denied'), 9000); }, 2500);
    }).catch(() => {});
  } catch (e) { /* sem toque: tenta no próximo */ }
}
document.addEventListener('click', () => { if (!orientOn) askCompass(); }, true);
document.addEventListener('touchend', () => { if (!orientOn) askCompass(); }, true);
function startLocate(fromRoute) {
  if (!('geolocation' in navigator)) { toast(t('t_noGeo')); return; }
  askCompass();
  if (watchId == null) {
    locBtn.classList.add('wait');
    watchId = navigator.geolocation.watchPosition(onPos, onPosErr, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  }
  if (!fromRoute) setMode(2);
}
locBtn.onclick = () => {
  if (watchId == null || mode === 0) { startLocate(); return; }
  if (mode === 1) { setMode(2); if (me) map.easeTo({ center: me.c, zoom: Math.max(map.getZoom(), 17.5), duration: 500 }); return; }
  if (mode === 2) {
    setMode(3);
    if (heading == null) toast(t('t_wake'), 3500);
    else { map.easeTo({ bearing: heading, center: me ? me.c : map.getCenter(), duration: 400 }); toast(t('t_rotating'), 3500); }
    return;
  }
  setMode(2); map.easeTo({ bearing: SIGN_BEARING, duration: 400 });
};
$('#startBtn').onclick = () => { $('#startBtn').hidden = true; startLocate(); };
map.on('dragstart', (e) => { if (e.originalEvent && mode >= 2) setMode(1); });
map.on('rotatestart', (e) => { if (e.originalEvent && mode === 3) setMode(2); });
setInterval(() => { if (me && Date.now() - lastFix > 30000 && meMarker) meMarker.getElement().classList.add('stale'); }, 5000);
// já usou antes: liga o GPS sozinho ao abrir (no iPhone a bússola liga no primeiro toque)
try {
  if (localStorage.getItem('jb-loc') === '1' && 'geolocation' in navigator) {
    $('#startBtn').hidden = true;
    if (!needsIOSPerm()) listenOrientation();
    watchId = navigator.geolocation.watchPosition(onPos, onPosErr, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    setMode(2);
  }
} catch (e) {}

/* ---------------- onde estou + para onde estou apontando ---------------- */
const namedPaths = JB.paths.features.filter((f) => f.properties.n);
function nearestPathName(c) {
  const p = pm(c); let best = null;
  for (const f of namedPaths) {
    const cs = f.geometry.coordinates;
    for (let j = 0; j < cs.length - 1; j++) {
      const A = pm(cs[j]), B = pm(cs[j + 1]), dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy || 1;
      let u = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / L2; u = Math.max(0, Math.min(1, u));
      const d = Math.hypot(p[0] - A[0] - u * dx, p[1] - A[1] - u * dy);
      if (!best || d < best.d) best = { d, n: f.properties.n };
    }
  }
  return best && best.d < 14 ? best.n : null;
}
let lastStatus = 0, whereHTML = '', headHTML = '', lastHead = 0;
function aheadOf(c, h) {
  let best = null;
  for (const it of items) {
    if (it.kind !== 'poi') continue;
    const d = dist(c, it.c); if (d < 12 || d > 500) continue;
    const off = Math.abs(angDiff(brg(c, it.c), h));
    if (off <= (d < 60 ? 22 : 14) && (!best || d < best.d)) best = { d, it };
  }
  return best;
}
function paintStatus() {
  const st = $('#status');
  const html = [whereHTML, headHTML].filter(Boolean).map((x) => `<span class="ln">${x}</span>`).join('');
  st.innerHTML = html; st.hidden = !html;
}
function updateHeadingLine(force) {
  const now = Date.now(); if (!force && now - lastHead < 400) return; lastHead = now;
  if (heading == null) { headHTML = ''; paintStatus(); return; }
  const arrow = `<i class="hd" style="transform:rotate(${Math.round(heading - map.getBearing())}deg)"></i>`;
  let txt = `${arrow}${esc(t('pointing', { d: '' }))}<b>${esc(t('point')[Math.round(heading / 45) % 8])}</b> (${Math.round(heading)}°).`;
  if (me && distToGarden(me.c) < 60) {
    const a = aheadOf(me.c, heading);
    txt += ' ' + (a ? esc(t('ahead', { x: '\u0001', m: fmtM(a.d) })).replace('\u0001', `<b>${esc(label(a.it))}</b>`) : esc(t('noneAhead')));
  }
  if (headingSrc === 'gps') txt += ` <span class="dim">${esc(t('byGps'))}</span>`;
  headHTML = txt; paintStatus();
}
function updateStatus(force) {
  if (!me) { whereHTML = ''; paintStatus(); return; }
  const now = Date.now(); if (!force && now - lastStatus < 2500) return; lastStatus = now;
  const dG = distToGarden(me.c);
  if (dG > 60) { whereHTML = esc(t('away', { d: '\u0001' })).replace('\u0001', `<b>${fmtM(dG)}</b>`); paintStatus(); return; }
  let near = null;
  for (const it of items) { if (it.kind !== 'poi') continue; const d = dist(me.c, it.c); if (!near || d < near.d) near = { d, it }; }
  const path = nearestPathName(me.c);
  const parts = [];
  if (path) parts.push(esc(t('onPath', { p: '\u0001' })).replace('\u0001', `<b>${esc(path)}</b>`));
  if (near && near.d < 120) parts.push(esc(t(parts.length ? 'near' : 'Near', { x: '\u0001' })).replace('\u0001', `<b>${esc(label(near.it))}</b>`) + ` (${fmtM(near.d)})`);
  if (!parts.length) parts.push(esc(t('inGarden')));
  whereHTML = parts.join(', ') + (me.acc > 25 ? ` <span class="dim">${esc(t('gps', { n: Math.round(me.acc) }))}</span>` : '');
  paintStatus();
  updateHeadingLine(true);
}

/* ---------------- lista, busca e legenda ---------------- */
let filt = '';
const SYN = {
  banheiro: 'wc', sanitario: 'wc', wc: 'wc', toalete: 'wc', toilet: 'wc', restroom: 'wc', bathroom: 'wc', bano: 'wc', servicio: 'wc',
  agua: 'agua', bebedouro: 'agua', water: 'agua', fountain: 'agua', bebedero: 'agua',
  comida: 'lanche', lanche: 'lanche', cafe: 'lanche', lanchonete: 'lanche', restaurante: 'lanche', food: 'lanche', snack: 'lanche', cafeteria: 'lanche',
  loja: 'loja', store: 'loja', shop: 'loja', tienda: 'loja',
  ingresso: 'bilheteria', bilheteria: 'bilheteria', ticket: 'bilheteria', taquilla: 'bilheteria', entrada: 'bilheteria',
  cadeirante: 'acess', acessibilidade: 'acess', deficiente: 'acess', wheelchair: 'acess', silla: 'acess',
  carro: 'carro', carrinho: 'carro', eletrico: 'carro', cart: 'carro', car: 'carro', carrito: 'carro',
  telefone: 'telefone', phone: 'telefone', telefono: 'telefone',
};
function renderList() {
  const q = norm($('#q').value.trim());
  const ol = $('#items'); ol.innerHTML = '';
  let arr = items.slice();
  if (filt.startsWith('svc:')) arr = arr.filter((it) => it.svc === filt.slice(4));
  else if (filt && filt !== 'perto') arr = arr.filter((it) => it.cat === filt && it.kind === 'poi');
  else if (!q && filt !== 'perto') arr = arr.filter((it) => it.kind === 'poi');
  if (q) {
    const syn = Object.keys(SYN).find((k) => q === k || (q.length >= 3 && k.startsWith(q)) || q.startsWith(k + ' '));
    arr = arr.filter((it) => /^\d+$/.test(q) ? String(it.n) === q
      : (syn && it.svc === SYN[syn]) || (it.kind === 'poi' && LANGS.some((l) => norm(it.names[l]).includes(q))) || (it.kind === 'svc' && LANGS.some((l) => norm(SVC[it.svc][l]).includes(q))));
  }
  if (me) arr.forEach((it) => { it._d = dist(me.c, it.c); });
  const byDist = me && (filt === 'perto' || filt.startsWith('svc:'));
  if (byDist) arr.sort((a, b) => a._d - b._d);
  else arr.sort((a, b) => (a.n || 999) - (b.n || 999) || title(a).localeCompare(title(b)));
  if (filt === 'perto' && !me) { ol.innerHTML = `<li class="empty">${esc(t('e_near'))}</li>`; return; }
  if (!arr.length) { ol.innerHTML = `<li class="empty">${esc(t('e_none'))}</li>`; return; }
  const frag = document.createDocumentFragment();
  arr.forEach((it) => {
    const li = document.createElement('li');
    const badge = it.kind === 'poi' ? `<span class="n ${numMode === 'guia' ? 'g' : 'p'}">${it.n}</span>` : `<span class="n s">${ICON[it.svc]}</span>`;
    li.innerHTML = `${badge}<span class="t"><b></b><small></small></span><span class="d">${me ? fmtM(it._d) : ''}</span>`;
    li.querySelector('b').textContent = title(it);
    li.querySelector('small').textContent = it.kind === 'poi' ? t('cat_' + it.cat) : subtitle(it);
    li.onclick = () => { closeList(); select(it, true); };
    frag.appendChild(li);
  });
  ol.appendChild(frag);
}
function renderSvcChips() {
  const box = $('#svcChips'); box.innerHTML = '';
  SVC_ORDER.forEach((k) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.f = 'svc:' + k;
    b.innerHTML = ICON[k] + `<span>${esc(SVC[k][lang])}</span>`;
    if (filt === 'svc:' + k) b.classList.add('on');
    box.appendChild(b);
  });
}
function setFilter(f) {
  filt = f;
  document.querySelectorAll('#chips button, #svcChips button').forEach((x) => x.classList.toggle('on', x.dataset.f === f));
  renderList();
}
function openList() { $('#list').hidden = false; renderList(); setTimeout(() => $('#q').focus({ preventScroll: true }), 50); }
function closeList() { $('#list').hidden = true; $('#q').blur(); }
$('#searchBtn').onclick = openList;
$('#listClose').onclick = closeList;
$('#q').addEventListener('input', renderList);
$('#chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setFilter(b.dataset.f); });
$('#svcChips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setFilter(filt === b.dataset.f ? '' : b.dataset.f); });
function paintSeg() { document.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.m === numMode)); }
$('#seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setNumMode(b.dataset.m); });

/* ---------------- avisos ---------------- */
let toastT = 0;
function toast(msg, ms) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms || 3200);
}
$('#toast').onclick = () => { $('#toast').hidden = true; };

/* ---------------- aplicar idioma ---------------- */
function applyLang() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  document.querySelectorAll('[data-i]').forEach((el) => { el.textContent = t(el.dataset.i); });
  $('#q').placeholder = t('qPh');
  compassBtn.setAttribute('aria-label', t('a_north')); $('#layerBtn').setAttribute('aria-label', t('a_layer')); locBtn.setAttribute('aria-label', t('a_loc'));
  document.querySelectorAll('.x').forEach((x) => x.setAttribute('aria-label', t('a_close')));
  $('#layerLbl').textContent = sat ? t('map') : t('sat');
  document.querySelectorAll('#langs button').forEach((b) => { const on = b.dataset.l === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  markers.forEach((m) => { m.el.title = label(m.it); });
  renderSvcChips(); paintSeg();
  if (sel) paintSheet();
  if (routeTo) drawRoute(true);
  if (!$('#list').hidden) renderList();
  lastStatus = 0; updateStatus(true); updateHeadingLine(true);
}
$('#langs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || b.dataset.l === lang) return;
  lang = b.dataset.l; try { localStorage.setItem('jb-lang', lang); } catch (er) {}
  applyLang();
});
applyLang();

/* ---------------- sem internet ---------------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
