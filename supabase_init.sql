-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN SUPABASE 24/7 — TDF POLÍTICOS & MONITOR NACIONAL 2.0
-- Pegar este script completo en el "SQL Editor" de Supabase y presionar "Run"
-- ============================================================================

-- 1. Tabla de Políticos (Tierra del Fuego y Nacional)
CREATE TABLE IF NOT EXISTS public.politicos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    ambito VARCHAR(30) DEFAULT 'tdf'
);

-- 2. Tabla de Usuarios y Credenciales del Equipo
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_mostrar VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'visualizador'
);

-- 3. Tabla de Solicitudes de Modificación de Directorio
CREATE TABLE IF NOT EXISTS public.solicitudes_cambio (
    id SERIAL PRIMARY KEY,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_rol VARCHAR(30) NOT NULL DEFAULT 'visualizador',
    ambito VARCHAR(30) NOT NULL DEFAULT 'tdf',
    old_politico_id VARCHAR(50) NOT NULL,
    old_politico_nombre VARCHAR(100) NOT NULL,
    new_politico_nombre VARCHAR(100) NOT NULL,
    new_politico_cargo VARCHAR(150) NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    nota_admin TEXT,
    fecha_creacion VARCHAR(40)
);

-- 4. Tabla de Mensajes del Chat Interno
CREATE TABLE IF NOT EXISTS public.mensajes_chat (
    id SERIAL PRIMARY KEY,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_rol VARCHAR(30) NOT NULL,
    ambito VARCHAR(30) DEFAULT 'general',
    texto TEXT NOT NULL,
    fecha_hora VARCHAR(40)
);

-- 5. Tabla de Actualizaciones de Inteligencia en Nube (Compartida entre todo el equipo)
CREATE TABLE IF NOT EXISTS public.cloud_overrides (
    politico_id VARCHAR(50) PRIMARY KEY,
    count INTEGER DEFAULT 1,
    delta_pos NUMERIC(5,2) DEFAULT 0,
    delta_neg NUMERIC(5,2) DEFAULT 0,
    updated_at VARCHAR(40),
    live_menciones JSONB
);

-- ============================================================================
-- SEMILLA DE USUARIOS INICIALES
-- ============================================================================
INSERT INTO public.usuarios (username, nombre_mostrar, password, rol) VALUES
('admin', 'Administrador General', 'admin2026', 'admin'),
('equipo', 'Analista Equipo TDF', 'tdf2026', 'visualizador'),
('invitado', 'Compañero Visualizador', 'ver2026', 'visualizador')
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- SEMILLA DE POLÍTICOS — ÁMBITO TIERRA DEL FUEGO (31 REFERENTES)
-- ============================================================================
INSERT INTO public.politicos (id, nombre, cargo, categoria, ambito) VALUES
('melella', 'Gustavo Melella', 'Gobernador TDF', 'Primera línea', 'tdf'),
('vuoto', 'Walter Vuoto', 'Intendente Ushuaia', 'Primera línea', 'tdf'),
('perez', 'Martín Perez', 'Intendente Río Grande', 'Primera línea', 'tdf'),
('harrington', 'Daniel Harrington', 'Intendente Tolhuin', 'Primera línea', 'tdf'),
('urquiza', 'Mónica Urquiza', 'Vicegobernadora', 'Primera línea', 'tdf'),
('greve', 'Federico Greve', 'Legislador Provincial', 'Primera línea', 'tdf'),
('lechman', 'Federico Lechman', 'Legislador Provincial', 'Primera línea', 'tdf'),
('pino', 'Juan Carlos Pino', 'Vicegobernador Int. / Legislador', 'Primera línea', 'tdf'),
('tita', 'Agustín Tita', 'Jefe de Gabinete TDF', 'Primera línea', 'tdf'),
('vonderthusen', 'Raúl von der Thusen', 'Legislador / Ex Concejal', 'Primera línea', 'tdf'),
('sciurano', 'Federico Sciurano', 'Legislador Provincial', 'Segunda línea', 'tdf'),
('lores', 'Damián Löffler', 'Legislador Provincial', 'Segunda línea', 'tdf'),
('martinez_m', 'Myriam Martínez', 'Legisladora Provincial', 'Segunda línea', 'tdf'),
('colazo', 'Laura Colazo', 'Legisladora Provincial', 'Segunda línea', 'tdf'),
('vvuoto', 'Victoria Vuoto', 'Legisladora Provincial', 'Segunda línea', 'tdf'),
('runin', 'Federico Runin', 'Ministro de Gobierno', 'Segunda línea', 'tdf'),
('castillo', 'Gabriela Castillo', 'Ministra de Obras Públicas', 'Segunda línea', 'tdf'),
('digiglio', 'Judit Di Giglio', 'Ministra de Salud', 'Segunda línea', 'tdf'),
('rossi', 'Lucía Rossi', 'Secretaria/Dirigente', 'Segunda línea', 'tdf'),
('coto', 'Agustín Coto', 'Legislador Provincial', 'Segunda línea', 'tdf'),
('graciania', 'Natalia Graciania', 'Legisladora Provincial', 'Segunda línea', 'tdf'),
('catena', 'Horacio Catena', 'Sec. Gral SUTEF', 'Tercera línea', 'tdf'),
('vergara', 'René Vergara', 'Sec. Gral Petroleros Privados', 'Tercera línea', 'tdf'),
('fernandez', 'Claudia Fernández', 'Cámara de Comercio Ushuaia', 'Tercera línea', 'tdf'),
('guglielmi', 'Luciana Guglielmi', 'Asociación Rural TDF', 'Tercera línea', 'tdf'),
('gliubich', 'Fernando Gliubich', 'Empresario Sector Agropecuario', 'Tercera línea', 'tdf'),
('worman', 'Guillermo Worman', 'Dir. Participación Ciudadana ONG', 'Tercera línea', 'tdf'),
('cordoba', 'Marcelo Córdoba', 'Dirigente ATE / Sec. General', 'Tercera línea', 'tdf'),
('etchepare', 'Claudia Etchepare', 'Sec. General ATSA', 'Tercera línea', 'tdf'),
('martinez_o', 'Oscar Martínez', 'Diputado M.C / Referente UOM', 'Tercera línea', 'tdf'),
('barrios', 'Dr. Javier Andrés Barrios', 'Sec. Gestión Sist. Sanitarios (Min. Salud)', 'Tercera línea', 'tdf'),
-- ============================================================================
-- SEMILLA DE POLÍTICOS — ÁMBITO NACIONAL (16 REFERENTES)
-- ============================================================================
('milei', 'Javier Milei', 'Presidente de la Nación (LLA)', 'Primera línea', 'nacional'),
('cfk', 'Cristina Fernández de Kirchner', 'Ex Presidenta / Referente PJ-UxP', 'Primera línea', 'nacional'),
('kicillof', 'Axel Kicillof', 'Gobernador PBA / Referente Federal PJ', 'Primera línea', 'nacional'),
('macri', 'Mauricio Macri', 'Ex Presidente / Pte. PRO Nacional', 'Primera línea', 'nacional'),
('villarruel', 'Victoria Villarruel', 'Vicepresidenta / Pdta. del Senado', 'Primera línea', 'nacional'),
('bullrich', 'Patricia Bullrich', 'Ministra de Seguridad Nacional', 'Primera línea', 'nacional'),
('caputo', 'Luis Caputo', 'Ministro de Economía de la Nación', 'Primera línea', 'nacional'),
('massa', 'Sergio Massa', 'Referente Frente Renovador / UxP', 'Primera línea', 'nacional'),
('francos', 'Guillermo Francos', 'Jefe de Gabinete de la Nación', 'Segunda línea', 'nacional'),
('pichetto', 'Miguel Ángel Pichetto', 'Diputado Nacional (Encuentro Federal)', 'Segunda línea', 'nacional'),
('lousteau', 'Martín Lousteau', 'Senador Nacional / Pte. UCR', 'Segunda línea', 'nacional'),
('llaryora', 'Martín Llaryora', 'Gobernador de Córdoba / Liga Federal', 'Segunda línea', 'nacional'),
('pullaro', 'Maximiliano Pullaro', 'Gobernador de Santa Fe / UCR', 'Segunda línea', 'nacional'),
('torres', 'Ignacio Torres', 'Gobernador de Chubut / Bloque Patagónico', 'Segunda línea', 'nacional'),
('menem_m', 'Martín Menem', 'Presidente Cámara de Diputados', 'Tercera línea', 'nacional'),
('bregman', 'Myriam Bregman', 'Referente Frente de Izquierda (FIT-U)', 'Tercera línea', 'nacional')
ON CONFLICT (id) DO NOTHING;

-- Mensaje de bienvenida inicial en el chat
INSERT INTO public.mensajes_chat (id, autor_nombre, autor_rol, ambito, texto, fecha_hora) VALUES
(1, 'Administrador General', 'admin', 'general', 'Bienvenidos al canal interno sincronizado en Supabase + Cloudflare 24/7. Cualquier actualización de perfil o solicitud enviada aquí se refleja en tiempo real para todo el equipo.', '28/10/2026 12:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PERMISOS Y POLÍTICAS DE ACCESO REST (PARA CONEXIÓN DIRECTA DESDE CLOUDFLARE)
-- ============================================================================
ALTER TABLE public.politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso publico politicos" ON public.politicos;
CREATE POLICY "Acceso publico politicos" ON public.politicos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico usuarios" ON public.usuarios;
CREATE POLICY "Acceso publico usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico solicitudes" ON public.solicitudes_cambio;
CREATE POLICY "Acceso publico solicitudes" ON public.solicitudes_cambio FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico chat" ON public.mensajes_chat;
CREATE POLICY "Acceso publico chat" ON public.mensajes_chat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico overrides" ON public.cloud_overrides;
CREATE POLICY "Acceso publico overrides" ON public.cloud_overrides FOR ALL USING (true) WITH CHECK (true);
