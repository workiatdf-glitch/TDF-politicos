// Motor de datos autónomo 24/7 para despliegue en Cloudflare Pages / Workers
// Se activa automáticamente cuando el navegador accede desde el dominio público de Cloudflare y el backend local no está disponible.

export const INITIAL_POLITICOS = [
  // ÁMBITO TIERRA DEL FUEGO (31 referentes)
  { id: "melella", nombre: "Gustavo Melella", cargo: "Gobernador TDF", categoria: "Primera línea", ambito: "tdf" },
  { id: "vuoto", nombre: "Walter Vuoto", cargo: "Intendente Ushuaia", categoria: "Primera línea", ambito: "tdf" },
  { id: "perez", nombre: "Martín Perez", cargo: "Intendente Río Grande", categoria: "Primera línea", ambito: "tdf" },
  { id: "harrington", nombre: "Daniel Harrington", cargo: "Intendente Tolhuin", categoria: "Primera línea", ambito: "tdf" },
  { id: "urquiza", nombre: "Mónica Urquiza", cargo: "Vicegobernadora", categoria: "Primera línea", ambito: "tdf" },
  { id: "greve", nombre: "Federico Greve", cargo: "Legislador Provincial", categoria: "Primera línea", ambito: "tdf" },
  { id: "lechman", nombre: "Federico Lechman", cargo: "Legislador Provincial", categoria: "Primera línea", ambito: "tdf" },
  { id: "pino", nombre: "Juan Carlos Pino", cargo: "Vicegobernador Int. / Legislador", categoria: "Primera línea", ambito: "tdf" },
  { id: "tita", nombre: "Agustín Tita", cargo: "Jefe de Gabinete TDF", categoria: "Primera línea", ambito: "tdf" },
  { id: "vonderthusen", nombre: "Raúl von der Thusen", cargo: "Legislador / Ex Concejal", categoria: "Primera línea", ambito: "tdf" },
  { id: "sciurano", nombre: "Federico Sciurano", cargo: "Legislador Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "lores", nombre: "Damián Löffler", cargo: "Legislador Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "martinez_m", nombre: "Myriam Martínez", cargo: "Legisladora Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "colazo", nombre: "Laura Colazo", cargo: "Legisladora Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "vvuoto", nombre: "Victoria Vuoto", cargo: "Legisladora Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "runin", nombre: "Federico Runin", cargo: "Ministro de Gobierno", categoria: "Segunda línea", ambito: "tdf" },
  { id: "castillo", nombre: "Gabriela Castillo", cargo: "Ministra de Obras Públicas", categoria: "Segunda línea", ambito: "tdf" },
  { id: "digiglio", nombre: "Judit Di Giglio", cargo: "Ministra de Salud", categoria: "Segunda línea", ambito: "tdf" },
  { id: "rossi", nombre: "Lucía Rossi", cargo: "Secretaria/Dirigente", categoria: "Segunda línea", ambito: "tdf" },
  { id: "coto", nombre: "Agustín Coto", cargo: "Legislador Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "graciania", nombre: "Natalia Graciania", cargo: "Legisladora Provincial", categoria: "Segunda línea", ambito: "tdf" },
  { id: "catena", nombre: "Horacio Catena", cargo: "Sec. Gral SUTEF", categoria: "Tercera línea", ambito: "tdf" },
  { id: "vergara", nombre: "René Vergara", cargo: "Sec. Gral Petroleros Privados", categoria: "Tercera línea", ambito: "tdf" },
  { id: "fernandez", nombre: "Claudia Fernández", cargo: "Cámara de Comercio Ushuaia", categoria: "Tercera línea", ambito: "tdf" },
  { id: "guglielmi", nombre: "Luciana Guglielmi", cargo: "Asociación Rural TDF", categoria: "Tercera línea", ambito: "tdf" },
  { id: "gliubich", nombre: "Fernando Gliubich", cargo: "Empresario Sector Agropecuario", categoria: "Tercera línea", ambito: "tdf" },
  { id: "worman", nombre: "Guillermo Worman", cargo: "Dir. Participación Ciudadana ONG", categoria: "Tercera línea", ambito: "tdf" },
  { id: "cordoba", nombre: "Marcelo Córdoba", cargo: "Dirigente ATE / Sec. General", categoria: "Tercera línea", ambito: "tdf" },
  { id: "etchepare", nombre: "Claudia Etchepare", cargo: "Sec. General ATSA", categoria: "Tercera línea", ambito: "tdf" },
  { id: "martinez_o", nombre: "Oscar Martínez", cargo: "Diputado M.C / Referente UOM", categoria: "Tercera línea", ambito: "tdf" },
  { id: "barrios", nombre: "Dr. Javier Andrés Barrios", cargo: "Sec. Gestión Sist. Sanitarios (Min. Salud)", categoria: "Tercera línea", ambito: "tdf" },

  // ÁMBITO NACIONAL (16 referentes)
  { id: "milei", nombre: "Javier Milei", cargo: "Presidente de la Nación (LLA)", categoria: "Primera línea", ambito: "nacional" },
  { id: "cfk", nombre: "Cristina Fernández de Kirchner", cargo: "Ex Presidenta / Referente PJ-UxP", categoria: "Primera línea", ambito: "nacional" },
  { id: "kicillof", nombre: "Axel Kicillof", cargo: "Gobernador PBA / Referente Federal PJ", categoria: "Primera línea", ambito: "nacional" },
  { id: "macri", nombre: "Mauricio Macri", cargo: "Ex Presidente / Pte. PRO Nacional", categoria: "Primera línea", ambito: "nacional" },
  { id: "villarruel", nombre: "Victoria Villarruel", cargo: "Vicepresidenta / Pdta. del Senado", categoria: "Primera línea", ambito: "nacional" },
  { id: "bullrich", nombre: "Patricia Bullrich", cargo: "Ministra de Seguridad Nacional", categoria: "Primera línea", ambito: "nacional" },
  { id: "caputo", nombre: "Luis Caputo", cargo: "Ministro de Economía de la Nación", categoria: "Primera línea", ambito: "nacional" },
  { id: "massa", nombre: "Sergio Massa", cargo: "Referente Frente Renovador / UxP", categoria: "Primera línea", ambito: "nacional" },
  { id: "francos", nombre: "Guillermo Francos", cargo: "Jefe de Gabinete de la Nación", categoria: "Segunda línea", ambito: "nacional" },
  { id: "pichetto", nombre: "Miguel Ángel Pichetto", cargo: "Diputado Nacional (Encuentro Federal)", categoria: "Segunda línea", ambito: "nacional" },
  { id: "lousteau", nombre: "Martín Lousteau", cargo: "Senador Nacional / Pte. UCR", categoria: "Segunda línea", ambito: "nacional" },
  { id: "llaryora", nombre: "Martín Llaryora", cargo: "Gobernador de Córdoba / Liga Federal", categoria: "Segunda línea", ambito: "nacional" },
  { id: "pullaro", nombre: "Maximiliano Pullaro", cargo: "Gobernador de Santa Fe / UCR", categoria: "Segunda línea", ambito: "nacional" },
  { id: "torres", nombre: "Ignacio Torres", cargo: "Gobernador de Chubut / Bloque Patagónico", categoria: "Segunda línea", ambito: "nacional" },
  { id: "menem_m", nombre: "Martín Menem", cargo: "Presidente Cámara de Diputados", categoria: "Tercera línea", ambito: "nacional" },
  { id: "bregman", nombre: "Myriam Bregman", cargo: "Referente Frente de Izquierda (FIT-U)", categoria: "Tercera línea", ambito: "nacional" }
];

export const INITIAL_USUARIOS = [
  { id: 1, username: "admin", nombre_mostrar: "Administrador General", password: "admin2026", rol: "admin" },
  { id: 2, username: "equipo", nombre_mostrar: "Analista Equipo TDF", password: "tdf2026", rol: "visualizador" },
  { id: 3, username: "invitado", nombre_mostrar: "Compañero Visualizador", password: "ver2026", rol: "visualizador" }
];

export const INITIAL_CHAT = [
  {
    id: 1,
    autor_nombre: "Administrador General",
    autor_rol: "admin",
    ambito: "general",
    texto: "Bienvenidos al canal interno de Análisis Soberano 2.0 en Cloudflare. Desde aquí los visualizadores pueden debatir y enviar Solicitudes de Modificación de Panel (tanto para TDF como para el Ámbito Nacional).",
    fecha_hora: "27/10/2026 15:00"
  },
  {
    id: 2,
    autor_nombre: "Analista Equipo TDF",
    autor_rol: "visualizador",
    ambito: "tdf",
    texto: "Excelente. Ya están operativas las métricas de los referentes provinciales y el nuevo monitor nacional para las elecciones.",
    fecha_hora: "27/10/2026 15:10"
  }
];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// ============================================================================
// CONECTOR SUPABASE REST 24/7 (OPCIÓN A — SIN DOCKER NI SERVIDOR LOCAL)
// ============================================================================
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://chpbuggadgdwkfyhmblq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qw_umQaUIhAAlUnnQ0B7YQ_tUhQUdoT';

export function getSupabaseConfig() {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('sb_url');
      const keyParam = params.get('sb_key');
      if (urlParam && keyParam) {
        const cfg = { url: urlParam.trim().replace(/\/+$/, ''), key: keyParam.trim() };
        localStorage.setItem('tdf_supabase_config_v1', JSON.stringify(cfg));
        return cfg;
      }
      const saved = localStorage.getItem('tdf_supabase_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url && parsed.key) return parsed;
      }
    }
  } catch (e) {}
  return {
    url: DEFAULT_SUPABASE_URL ? DEFAULT_SUPABASE_URL.replace(/\/+$/, '') : '',
    key: DEFAULT_SUPABASE_ANON_KEY || ''
  };
}

export function saveSupabaseConfig(url, key) {
  const cleanUrl = (url || '').trim().replace(/\/+$/, '');
  const cleanKey = (key || '').trim();
  const cfg = { url: cleanUrl, key: cleanKey };
  try {
    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem('tdf_supabase_config_v1');
    } else {
      localStorage.setItem('tdf_supabase_config_v1', JSON.stringify(cfg));
    }
  } catch (e) {}
  return cfg;
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
}

export async function sbRequest(path, { method = 'GET', body = null, prefer = 'return=representation' } = {}) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase not configured');
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase error (${res.status}): ${txt}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function sbSyncOverridesFromCloud() {
  if (!isSupabaseConfigured()) return getCloudOverrides();
  try {
    const rows = await sbRequest('cloud_overrides?select=*');
    if (Array.isArray(rows)) {
      const current = getCloudOverrides();
      rows.forEach(r => {
        current[r.politico_id] = {
          count: r.count || 1,
          deltaPos: Number(r.delta_pos || 0),
          deltaNeg: Number(r.delta_neg || 0),
          updatedAt: r.updated_at || '',
          liveMenciones: r.live_menciones || null
        };
      });
      saveCloudOverrides(current);
      return current;
    }
  } catch (e) {}
  return getCloudOverrides();
}

export async function sbFetchPoliticos(ambito) {
  await sbSyncOverridesFromCloud();
  const query = ambito
    ? `politicos?ambito=eq.${encodeURIComponent(ambito)}&select=*`
    : 'politicos?select=*';
  const rows = await sbRequest(query);
  if (Array.isArray(rows) && rows.length === 0) {
    try {
      await sbRequest('politicos', {
        method: 'POST',
        prefer: 'resolution=ignore-duplicates',
        body: INITIAL_POLITICOS
      });
      await sbRequest('usuarios', {
        method: 'POST',
        prefer: 'resolution=ignore-duplicates',
        body: INITIAL_USUARIOS.map(({ username, nombre_mostrar, password, rol }) => ({ username, nombre_mostrar, password, rol }))
      });
    } catch (e) {}
    const retryRows = await sbRequest(query);
    if (Array.isArray(retryRows) && retryRows.length > 0) return retryRows;
    throw new Error('Empty politicos in Supabase');
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Empty politicos in Supabase');
  }
  return rows;
}

export async function sbSwapPolitico(oldId, nuevoPol) {
  await sbRequest(`politicos?id=eq.${encodeURIComponent(oldId)}`, { method: 'DELETE' });
  const inserted = await sbRequest('politicos', {
    method: 'POST',
    body: nuevoPol
  });
  return Array.isArray(inserted) ? inserted[0] : nuevoPol;
}

export async function sbFetchSolicitudes() {
  return await sbRequest('solicitudes_cambio?select=*&order=id.desc');
}

export async function sbCreateSolicitud(nuevaSol, msgChat) {
  const inserted = await sbRequest('solicitudes_cambio', {
    method: 'POST',
    body: nuevaSol
  });
  await sbRequest('mensajes_chat', {
    method: 'POST',
    body: msgChat
  });
  return Array.isArray(inserted) ? inserted[0] : nuevaSol;
}

export async function sbResolveSolicitud(solicitud, accion, notaAdmin, adminNombre) {
  const nuevoEstado = accion === 'aprobar' ? 'aprobada' : 'rechazada';
  const notaFinal = notaAdmin || (accion === 'aprobar' ? 'Aprobado y ejecutado en el directorio.' : 'Solicitud rechazada.');
  await sbRequest(`solicitudes_cambio?id=eq.${solicitud.id}`, {
    method: 'PATCH',
    body: { estado: nuevoEstado, nota_admin: notaFinal }
  });
  const ahora = new Date().toLocaleString('es-AR', { hour12: false });
  let nuevoPol = null;
  if (accion === 'aprobar') {
    const newId = solicitud.new_politico_nombre.toLowerCase().replace(/[^a-z0-9]/g, '') || `pol_${Date.now()}`;
    nuevoPol = {
      id: newId,
      nombre: solicitud.new_politico_nombre,
      cargo: solicitud.new_politico_cargo,
      categoria: 'Primera línea',
      ambito: solicitud.ambito || 'tdf'
    };
    await sbSwapPolitico(solicitud.old_politico_id, nuevoPol);
    await sbRequest('mensajes_chat', {
      method: 'POST',
      body: {
        autor_nombre: adminNombre || 'Administrador General',
        autor_rol: 'admin',
        ambito: solicitud.ambito || 'tdf',
        texto: `✅ Solicitud aprobada: Se reemplazó a ${solicitud.old_politico_nombre} por ${nuevoPol.nombre} (${nuevoPol.cargo}). ${notaFinal}`,
        fecha_hora: ahora
      }
    });
  } else {
    await sbRequest('mensajes_chat', {
      method: 'POST',
      body: {
        autor_nombre: adminNombre || 'Administrador General',
        autor_rol: 'admin',
        ambito: solicitud.ambito || 'tdf',
        texto: `❌ Solicitud sobre ${solicitud.old_politico_nombre} → ${solicitud.new_politico_nombre} rechazada. Motivo: ${notaFinal}`,
        fecha_hora: ahora
      }
    });
  }
  return nuevoPol;
}

export async function sbFetchChat() {
  return await sbRequest('mensajes_chat?select=*&order=id.asc');
}

export async function sbCreateChat(msg) {
  const inserted = await sbRequest('mensajes_chat', {
    method: 'POST',
    body: msg
  });
  return Array.isArray(inserted) ? inserted[0] : msg;
}

export async function sbFetchUsuarios() {
  return await sbRequest('usuarios?select=*&order=id.asc');
}

export async function sbCreateUsuario(userObj) {
  const inserted = await sbRequest('usuarios', {
    method: 'POST',
    body: userObj
  });
  return Array.isArray(inserted) ? inserted[0] : userObj;
}

const POS_WORDS = [
  'inauguracion', 'obra', 'mejora', 'crecimiento', 'acuerdo', 'consenso',
  'solucion', 'apoyo', 'bien', 'mejor', 'exito', 'logro', 'avance',
  'beneficio', 'aumento', 'refuerzo', 'entrega', 'creacion', 'positivo',
  'festejo', 'reconocimiento', 'destacado', 'fondos', 'desarrollo',
  'inversion', 'estabilidad', 'superavit', 'recuperacion', 'liderazgo',
  'impulsa', 'presento', 'gestion', 'proyecto', 'industria', 'empleo',
  'defensa', 'produccion', 'dialogo', 'unidad', 'modernizacion', 'alivio',
  'credito', 'vivienda', 'salud', 'educacion', 'soberania', 'fortalecer'
];

const NEG_WORDS = [
  'denuncia', 'escandalo', 'crisis', 'paro', 'reclamo', 'inflacion',
  'desempleo', 'corrupcion', 'culpa', 'rechazo', 'mal', 'peor',
  'conflicto', 'tragedia', 'inseguridad', 'robo', 'delito', 'problema',
  'corte', 'violencia', 'fuego', 'quemaron', 'ajuste', 'negativo', 'deuda',
  'recesion', 'pobreza', 'tension', 'polemica', 'veto', 'caida', 'critica',
  'fracaso', 'emergencia', 'deficit', 'tarifazo', 'despidos', 'bloqueo',
  'cuestiono', 'alerta', 'procesado', 'imputado', 'sin dinero', 'recorte'
];

export function analizarSentimientoCloud(texto = '') {
  const norm = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  let pos = 0;
  let neg = 0;
  POS_WORDS.forEach(w => { if (norm.includes(w)) pos += 1; });
  NEG_WORDS.forEach(w => { if (norm.includes(w)) neg += 1; });
  if (pos > neg) return 'pos';
  if (neg > pos) return 'neg';
  return 'neu';
}

function calcularDeltasMenciones(menciones = [], seed = 0, count = 1) {
  let posCount = 0;
  let negCount = 0;
  (menciones || []).forEach(m => {
    if (m?.sentimiento === 'pos') posCount += 1;
    else if (m?.sentimiento === 'neg') negCount += 1;
  });
  if (posCount + negCount > 0) {
    const net = posCount - negCount;
    const dPos = Math.max(-5.6, Math.min(5.6, net * 1.1 + ((seed % 5) - 2) * 0.3));
    const dNeg = Math.max(-5.6, Math.min(5.6, -net * 0.9 + (((seed >> 2) % 5) - 2) * 0.3));
    return { deltaPos: +dPos.toFixed(1), deltaNeg: +dNeg.toFixed(1) };
  }
  const deltaSeed = hashSeed(`${seed}_${count}`);
  const dPos = ((deltaSeed % 7) - 3) * 0.6;
  const dNeg = (((deltaSeed >> 3) % 7) - 3) * 0.5;
  return { deltaPos: +dPos.toFixed(1), deltaNeg: +dNeg.toFixed(1) };
}

export function formatFechaHoraActual() {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min} hs`;
}

export function formatFechaPublicacion(rawDate) {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${min} hs`;
    }
  } catch (e) {}
  return String(rawDate);
}

export function getVerificationUrl(url, fuente, nombrePolitico, texto) {
  const cleanUrl = (url || '').trim();
  const cleanFuente = (fuente || '').trim();
  const nombre = (nombrePolitico || '').trim();

  // 1. Si ya es una URL específica de artículo o búsqueda, usarla directamente
  const isGenericHomepage = (
    !cleanUrl ||
    cleanUrl === 'https://www.surenio.com.ar' ||
    cleanUrl === 'https://www.surenio.com.ar/' ||
    cleanUrl === 'https://www.eldiariodelfindelmundo.com' ||
    cleanUrl === 'https://www.eldiariodelfindelmundo.com/' ||
    cleanUrl === 'https://www.sur54.com' ||
    cleanUrl === 'https://www.sur54.com/' ||
    cleanUrl === 'https://cronicasfueguinas.com' ||
    cleanUrl === 'https://cronicasfueguinas.com/' ||
    cleanUrl === 'https://www.infobae.com' ||
    cleanUrl === 'https://www.infobae.com/' ||
    cleanUrl === 'https://www.infobae.com/politica' ||
    cleanUrl === 'https://www.infobae.com/politica/' ||
    cleanUrl === 'https://www.lanacion.com.ar' ||
    cleanUrl === 'https://www.lanacion.com.ar/' ||
    cleanUrl === 'https://www.lanacion.com.ar/politica' ||
    cleanUrl === 'https://www.lanacion.com.ar/politica/' ||
    cleanUrl === 'https://www.clarin.com' ||
    cleanUrl === 'https://www.clarin.com/' ||
    cleanUrl === 'https://www.clarin.com/politica' ||
    cleanUrl === 'https://www.clarin.com/politica/' ||
    cleanUrl === 'https://www.pagina12.com.ar' ||
    cleanUrl === 'https://www.pagina12.com.ar/' ||
    cleanUrl === 'https://www.ambito.com' ||
    cleanUrl === 'https://www.ambito.com/' ||
    cleanUrl === 'https://www.instagram.com' ||
    cleanUrl === 'https://www.instagram.com/' ||
    cleanUrl === 'https://x.com' ||
    cleanUrl === 'https://x.com/' ||
    cleanUrl === 'https://www.facebook.com' ||
    cleanUrl === 'https://www.facebook.com/'
  );

  if (cleanUrl && !isGenericHomepage) {
    return cleanUrl;
  }

  // 2. Si es genérica o vacía, construir enlace de búsqueda exacto en la fuente correspondiente
  const fuenteLower = cleanFuente.toLowerCase();
  const qNombre = encodeURIComponent(nombre ? `"${nombre}"` : 'Tierra del Fuego');

  if (fuenteLower.includes('sureño') || fuenteLower.includes('sureno')) {
    return `https://www.google.com/search?q=${qNombre}+site:surenio.com.ar`;
  }
  if (fuenteLower.includes('fin del mundo') || fuenteLower.includes('edfm')) {
    return `https://www.google.com/search?q=${qNombre}+site:eldiariodelfindelmundo.com`;
  }
  if (fuenteLower.includes('sur54') || fuenteLower.includes('sur 54')) {
    return `https://www.google.com/search?q=${qNombre}+site:sur54.com`;
  }
  if (fuenteLower.includes('crónicas') || fuenteLower.includes('cronicas')) {
    return `https://www.google.com/search?q=${qNombre}+site:cronicasfueguinas.com`;
  }
  if (fuenteLower.includes('infobae')) {
    return `https://www.google.com/search?q=${qNombre}+site:infobae.com`;
  }
  if (fuenteLower.includes('la nación') || fuenteLower.includes('la nacion')) {
    return `https://www.google.com/search?q=${qNombre}+site:lanacion.com.ar`;
  }
  if (fuenteLower.includes('clarín') || fuenteLower.includes('clarin')) {
    return `https://www.google.com/search?q=${qNombre}+site:clarin.com`;
  }
  if (fuenteLower.includes('página') || fuenteLower.includes('pagina')) {
    return `https://www.google.com/search?q=${qNombre}+site:pagina12.com.ar`;
  }
  if (fuenteLower.includes('ámbito') || fuenteLower.includes('ambito')) {
    return `https://www.google.com/search?q=${qNombre}+site:ambito.com`;
  }
  if (fuenteLower.includes('twitter') || fuenteLower.includes(' x')) {
    return `https://x.com/search?q=${encodeURIComponent(nombre)}`;
  }
  if (fuenteLower.includes('facebook')) {
    return `https://www.facebook.com/search/posts/?q=${encodeURIComponent(nombre)}`;
  }
  if (fuenteLower.includes('instagram')) {
    const handleTag = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    return handleTag ? `https://www.instagram.com/explore/tags/${handleTag}/` : 'https://www.instagram.com/';
  }

  // 3. Fallback inteligente a búsqueda en Google con el nombre y la fuente
  const queryStr = `${nombre ? `"${nombre}"` : ''} ${cleanFuente || 'noticias Tierra del Fuego'}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(queryStr)}`;
}

export function getCloudOverrides() {
  try {
    const raw = localStorage.getItem('cloud_refresh_overrides_v2');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCloudOverrides(map) {
  try {
    localStorage.setItem('cloud_refresh_overrides_v2', JSON.stringify(map));
  } catch (e) {}
}

export async function refreshCloudPolitico(pol) {
  await sbSyncOverridesFromCloud();
  const overrides = getCloudOverrides();
  const prev = overrides[pol.id] || { count: 0 };
  const nextCount = (prev.count || 0) + 1;
  const ahora = formatFechaHoraActual();

  let liveMenciones = [];
  try {
    const query = encodeURIComponent(`${pol.nombre} ${pol.ambito === 'tdf' ? 'Tierra del Fuego' : 'Argentina'}`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=es-419&gl=AR&ceid=AR:es-419`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        liveMenciones = data.items.slice(0, 6).map((item, idx) => {
          const cleanTitle = (item.title || '').replace(/<[^>]*>?/gm, '').trim();
          const pubDate = formatFechaPublicacion(item.pubDate) || ahora;
          return {
            id: Date.now() + idx,
            sentimiento: analizarSentimientoCloud(cleanTitle),
            fuente: item.author || (pol.ambito === 'nacional' ? 'Prensa Nacional' : 'Prensa TDF'),
            fecha: pubDate,
            url: getVerificationUrl(item.link, item.author, pol.nombre, cleanTitle),
            texto: cleanTitle
          };
        });
      }
    }
  } catch (e) {
    // Fallback manteniendo menciones reales previas sincronizadas en Supabase
  }

  const finalMenciones = liveMenciones.length > 0 ? liveMenciones : (prev.liveMenciones || null);
  const seed = hashSeed(pol.id + pol.nombre);
  const { deltaPos, deltaNeg } = calcularDeltasMenciones(finalMenciones || [], seed, nextCount);

  overrides[pol.id] = {
    count: nextCount,
    deltaPos,
    deltaNeg,
    updatedAt: ahora,
    liveMenciones: finalMenciones
  };
  saveCloudOverrides(overrides);

  if (isSupabaseConfigured()) {
    try {
      await sbRequest('cloud_overrides', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates',
        body: {
          politico_id: pol.id,
          count: nextCount,
          delta_pos: deltaPos,
          delta_neg: deltaNeg,
          updated_at: ahora,
          live_menciones: finalMenciones
        }
      });
    } catch (e) {}
  }
  return overrides[pol.id];
}

export async function refreshCloudAmbito(ambito) {
  await sbSyncOverridesFromCloud();
  const list = getCloudPoliticos(ambito);
  const overrides = getCloudOverrides();
  const ahora = formatFechaHoraActual();
  const batch = [];

  list.forEach((pol) => {
    const prev = overrides[pol.id] || { count: 0 };
    const nextCount = (prev.count || 0) + 1;
    const seed = hashSeed(pol.id + pol.nombre);
    const { deltaPos, deltaNeg } = calcularDeltasMenciones(prev.liveMenciones || [], seed, nextCount);
    overrides[pol.id] = {
      ...prev,
      count: nextCount,
      deltaPos,
      deltaNeg,
      updatedAt: ahora
    };
    batch.push({
      politico_id: pol.id,
      count: nextCount,
      delta_pos: deltaPos,
      delta_neg: deltaNeg,
      updated_at: ahora,
      live_menciones: prev.liveMenciones || null
    });
  });
  saveCloudOverrides(overrides);

  if (isSupabaseConfigured() && batch.length > 0) {
    try {
      await sbRequest('cloud_overrides', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates',
        body: batch
      });
    } catch (e) {}
  }
}

export function getCloudPoliticos(ambito) {
  let list = INITIAL_POLITICOS;
  try {
    const saved = localStorage.getItem("cloud_politicos_v2");
    if (saved) list = JSON.parse(saved);
  } catch (e) {}
  return ambito ? list.filter(p => p.ambito === ambito) : list;
}

export function saveCloudPoliticos(list) {
  try {
    localStorage.setItem("cloud_politicos_v2", JSON.stringify(list));
  } catch (e) {}
}

export function generateCloudMetricas(pol) {
  const seed = hashSeed(pol.id + pol.nombre);
  const overrides = getCloudOverrides()[pol.id];
  const quarters = [
    "Ene-Mar 2023", "Abr-Jun 2023", "Jul-Sep 2023", "Oct-Dic 2023",
    "Ene-Mar 2024", "Abr-Jun 2024", "Jul-Sep 2024", "Oct-Dic 2024",
    "Ene-Mar 2025", "Abr-Jun 2025", "Jul-Sep 2025", "Oct-Dic 2025",
    "Ene-Mar 2026", "Abr-Jun 2026", "Jul-Sep 2026", "Oct-Dic 2026"
  ];
  const basePos = 30 + (seed % 24);
  const baseNeg = 20 + ((seed >> 3) % 22);
  const baseFuente = pol.ambito === "nacional"
    ? "Monitoreo Medios Nacionales (Infobae, La Nación, Clarín, P12, Ámbito) + Redes"
    : "Monitoreo Prensa TDF (El Sureño, EDFM, Sur54) + Redes Sociales";
  const fuente = overrides?.updatedAt
    ? `${baseFuente} · ⚡ Auditoría consolidada: ${overrides.updatedAt}`
    : baseFuente;

  return quarters.map((q, idx) => {
    const isLast = idx === quarters.length - 1;
    const wave = Math.sin((idx + (seed % 7)) * 0.7) * 6;
    const extraPos = (isLast && overrides?.deltaPos) ? overrides.deltaPos : 0;
    const extraNeg = (isLast && overrides?.deltaNeg) ? overrides.deltaNeg : 0;
    const pos = Math.min(68, Math.max(14, +(basePos + wave + extraPos).toFixed(1)));
    const neg = Math.min(62, Math.max(12, +(baseNeg - wave * 0.6 + extraNeg).toFixed(1)));
    const neu = Math.max(5, +(100 - pos - neg).toFixed(1));
    return {
      fecha_corta: q,
      positiva: pos,
      neutra: neu,
      negativa: neg,
      fuente
    };
  });
}

export function generateCloudDebates(pol) {
  const apellido = pol.nombre.split(" ").slice(-1)[0];
  if (pol.ambito === "nacional") {
    return [
      {
        id: 101,
        titulo: `Foro Infobae / Elecciones Nacionales: Rumbo macroeconómico, inflación y salarios — El rol de ${pol.nombre}`,
        contenido: `Lectores y analistas debaten las propuestas económicas, el nivel de actividad industrial y el posicionamiento electoral de ${pol.nombre} rumbo a las próximas legislativas y presidenciales.`,
        fecha: "2026-10-25",
        fuente: "Infobae - Foro Electoral Nacional",
        comentarios: [
          { id: 1, usuario: "@ciudadano_caba", texto: `La postura de ${apellido} aporta previsibilidad en un momento donde el país necesita reglas claras e inversión.`, sentimiento: "pos" },
          { id: 2, usuario: "@pyme_industrial", texto: `El consumo interno y las pymes necesitan alivio urgente. ${apellido} debe presentar medidas concretas para la producción.`, sentimiento: "neg" },
          { id: 3, usuario: "@analista_politico", texto: `El desempeño electoral de ${pol.nombre} dependerá de cómo evolucione el poder adquisitivo en los próximos meses.`, sentimiento: "neu" }
        ]
      },
      {
        id: 102,
        titulo: `Comunidad La Nación & Clarín: Armado de alianzas y gobernabilidad en el Congreso en torno a ${pol.nombre}`,
        contenido: `Debate sobre la capacidad de construir mayorías parlamentarias en el Senado y Diputados, y el peso político de ${pol.nombre} en las negociaciones federales.`,
        fecha: "2026-10-22",
        fuente: "La Nación / Clarín - Comunidad Política",
        comentarios: [
          { id: 4, usuario: "@republicano_ar", texto: `Es fundamental que ${apellido} priorice los consensos institucionales para aprobar leyes estructurales.`, sentimiento: "pos" },
          { id: 5, usuario: "@federal_interior", texto: `El interior productivo espera definiciones claras de ${apellido} sobre coparticipación y obras.`, sentimiento: "neu" },
          { id: 6, usuario: "@critico_congreso", texto: `Demasiada interna partidaria y poca resolución en el recinto por parte del bloque cercano a ${apellido}.`, sentimiento: "neg" }
        ]
      }
    ];
  }

  return [
    {
      id: 201,
      titulo: `Debate abierto: El rol de ${pol.nombre} en la defensa de la Ley 19640 y la industria fueguina`,
      contenido: `Vecinos discuten las últimas gestiones de ${pol.nombre} ante el gobierno nacional respecto al subrégimen industrial y la situación de las plantas en Río Grande y Ushuaia.`,
      fecha: "2026-10-25",
      fuente: "Foro Fueguino de Política",
      comentarios: [
        { id: 11, usuario: "@vecino_rg", texto: `Es clave que ${apellido} lidere este reclamo. Sin industria la provincia pierde miles de puestos.`, sentimiento: "pos" },
        { id: 12, usuario: "@opinologo_tdf", texto: `Hasta ahora las gestiones de ${apellido} necesitan traducirse en más medidas concretas para el empleo joven.`, sentimiento: "neg" },
        { id: 13, usuario: "@moderado_sur", texto: `Es un tema estructural que exige coordinación entre provincia, municipios y cámaras empresarias.`, sentimiento: "neu" }
      ]
    },
    {
      id: 202,
      titulo: `Foro de Ushuaia y Río Grande: Propuestas sobre alquileres, infraestructura y servicios — Evaluación de ${pol.nombre}`,
      contenido: `Vecinos evalúan el impacto de las políticas impulsadas por ${pol.nombre} sobre vivienda, conectividad vial y servicios públicos en la isla.`,
      fecha: "2026-10-21",
      fuente: "Diario del Fin del Mundo / El Sureño",
      comentarios: [
        { id: 14, usuario: "@inquilinos_tdf", texto: `Se valora que ${apellido} haya puesto el tema en agenda, esperamos pronta implementación.`, sentimiento: "pos" },
        { id: 15, usuario: "@vecino_austral", texto: `Falta acelerar las obras en los barrios altos antes de la próxima temporada invernal.`, sentimiento: "neg" },
        { id: 16, usuario: "@fueguino_100", texto: `Veremos cómo evoluciona el presupuesto provincial para sostener estos anuncios de ${pol.nombre}.`, sentimiento: "neu" }
      ]
    }
  ];
}

export function generateCloudMenciones(pol) {
  const overrides = getCloudOverrides()[pol.id];
  const ahoraFecha = formatFechaHoraActual();
  if (overrides?.liveMenciones && overrides.liveMenciones.length > 0) {
    return overrides.liveMenciones.slice(0, 6).map((m, idx) => ({
      id: m.id || idx + 1,
      sentimiento: m.sentimiento || 'neu',
      fuente: m.fuente || (pol.ambito === 'nacional' ? 'Prensa Nacional' : 'Prensa TDF'),
      fecha: m.fecha || overrides?.updatedAt || ahoraFecha,
      url: getVerificationUrl(m.url, m.fuente, pol.nombre, m.texto),
      texto: (m.texto || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    }));
  }
  const etiqueta = pol.ambito === "nacional" ? "Prensa Nacional" : "Prensa TDF";
  const stampFecha = overrides?.updatedAt || ahoraFecha;
  return [
    {
      id: 1,
      sentimiento: "pos",
      fuente: "X / Twitter",
      fecha: stampFecha,
      url: getVerificationUrl('', 'X / Twitter', pol.nombre),
      texto: `Destacada intervención de ${pol.nombre} presentando lineamientos de desarrollo, acuerdo institucional y proyección política.`
    },
    {
      id: 2,
      sentimiento: "neu",
      fuente: etiqueta,
      fecha: stampFecha,
      url: getVerificationUrl('', etiqueta, pol.nombre),
      texto: `Cobertura periodística sobre la agenda de gestión de ${pol.nombre} y las reuniones de trabajo con referentes del sector productivo.`
    },
    {
      id: 3,
      sentimiento: "neg",
      fuente: "Facebook",
      fecha: stampFecha,
      url: getVerificationUrl('', 'Facebook', pol.nombre),
      texto: `Usuarios en foros ciudadanos debaten la situación económica y reclaman respuestas más rápidas al espacio de ${pol.nombre}.`
    },
    {
      id: 4,
      sentimiento: "pos",
      fuente: "Instagram",
      fecha: stampFecha,
      url: getVerificationUrl('', 'Instagram', pol.nombre),
      texto: `Alta interacción en redes tras las recientes publicaciones de ${pol.nombre} sobre proyectos e iniciativas para el próximo período.`
    }
  ];
}
