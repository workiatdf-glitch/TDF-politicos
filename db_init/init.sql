CREATE TABLE IF NOT EXISTS politicos (
    id VARCHAR(100) PRIMARY KEY, -- Apellido o identificador, p. ej. 'melella', 'milei'
    nombre VARCHAR(200) NOT NULL, -- Nombre completo
    cargo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'Primera línea', 'Segunda línea', 'Tercera línea'
    ambito VARCHAR(50) NOT NULL DEFAULT 'tdf' -- 'tdf' o 'nacional'
);

CREATE TABLE IF NOT EXISTS metricas_imagen (
    id SERIAL PRIMARY KEY,
    politico_id VARCHAR(100) REFERENCES politicos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    imagen_positiva NUMERIC(5, 2) NOT NULL,
    imagen_neutra NUMERIC(5, 2) NOT NULL,
    imagen_negativa NUMERIC(5, 2) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'Extracción Simulación/Noticias'
);

CREATE TABLE IF NOT EXISTS menciones_texto (
    id SERIAL PRIMARY KEY,
    politico_id VARCHAR(100) REFERENCES politicos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    texto TEXT NOT NULL,
    sentimiento VARCHAR(20), -- 'pos', 'neu', 'neg'
    fuente VARCHAR(100), -- 'Facebook', 'X', 'Instagram', 'Prensa'
    url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS debates_publicacion (
    id SERIAL PRIMARY KEY,
    politico_id VARCHAR(100) REFERENCES politicos(id) ON DELETE CASCADE,
    titulo VARCHAR(300) NOT NULL,
    contenido TEXT,
    fecha DATE NOT NULL,
    fuente VARCHAR(100) NOT NULL,
    url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS comentarios_debate (
    id SERIAL PRIMARY KEY,
    debate_id INTEGER REFERENCES debates_publicacion(id) ON DELETE CASCADE,
    usuario VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    sentimiento VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_mostrar VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'visualizador' -- 'admin' o 'visualizador'
);

CREATE TABLE IF NOT EXISTS solicitudes_cambio (
    id SERIAL PRIMARY KEY,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_rol VARCHAR(30) NOT NULL,
    ambito VARCHAR(50) NOT NULL DEFAULT 'tdf',
    old_politico_id VARCHAR(100) NOT NULL,
    old_politico_nombre VARCHAR(200) NOT NULL,
    new_politico_nombre VARCHAR(200) NOT NULL,
    new_politico_cargo VARCHAR(150) NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada'
    nota_admin TEXT,
    fecha_creacion VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS mensajes_chat (
    id SERIAL PRIMARY KEY,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_rol VARCHAR(30) NOT NULL,
    ambito VARCHAR(50) NOT NULL DEFAULT 'general',
    texto TEXT NOT NULL,
    fecha_hora VARCHAR(50) NOT NULL
);

-- ÁMBITO TIERRA DEL FUEGO (TDF)
INSERT INTO politicos (id, nombre, cargo, categoria, ambito) VALUES
-- PRIMERA LÍNEA TDF
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

-- SEGUNDA LÍNEA TDF
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

-- TERCERA LÍNEA TDF
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

-- ÁMBITO NACIONAL (ELECCIONES NACIONALES / REFERENTES)
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

INSERT INTO usuarios (username, nombre_mostrar, password, rol) VALUES
('admin', 'Administrador General', 'admin2026', 'admin'),
('equipo', 'Analista Equipo TDF', 'tdf2026', 'visualizador'),
('invitado', 'Compañero Visualizador', 'ver2026', 'visualizador')
ON CONFLICT (username) DO NOTHING;
