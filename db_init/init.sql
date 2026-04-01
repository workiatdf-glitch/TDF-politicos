CREATE TABLE politicos (
    id VARCHAR(100) PRIMARY KEY, -- Apellido, p. ej. 'melella'
    nombre VARCHAR(200) NOT NULL, -- Nombre completo, p. ej. 'Gustavo Melella'
    cargo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL -- 'Primera línea', 'Segunda línea', 'Tercera línea'
);

CREATE TABLE metricas_imagen (
    id SERIAL PRIMARY KEY,
    politico_id VARCHAR(100) REFERENCES politicos(id),
    fecha DATE NOT NULL,
    imagen_positiva NUMERIC(5, 2) NOT NULL, -- Porcentaje, ej. 45.50
    imagen_neutra NUMERIC(5, 2) NOT NULL,
    imagen_negativa NUMERIC(5, 2) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'Extracción Simulación/Noticias'
);

-- Ejemplos de PRIMERA, SEGUNDA y TERCERA línea en Tierra del Fuego
-- Categoría referencial sugerida basándose en peso político-social territorial
INSERT INTO politicos (id, nombre, cargo, categoria) VALUES
-- PRIMERA LÍNEA
('melella', 'Gustavo Melella', 'Gobernador TDF', 'Primera línea'),
('vuoto', 'Walter Vuoto', 'Intendente Ushuaia', 'Primera línea'),
('perez', 'Martín Perez', 'Intendente Río Grande', 'Primera línea'),
('harrington', 'Daniel Harrington', 'Intendente Tolhuin', 'Primera línea'),
('urquiza', 'Mónica Urquiza', 'Vicegobernadora', 'Primera línea'),
('greve', 'Federico Greve', 'Legislador Provincial', 'Primera línea'),
('lechman', 'Federico Lechman', 'Legislador Provincial', 'Primera línea'),
('pino', 'Juan Carlos Pino', 'Vicegobernador Int. / Legislador', 'Primera línea'),
('tita', 'Agustín Tita', 'Jefe de Gabinete TDF', 'Primera línea'),
('vonderthusen', 'Raúl von der Thusen', 'Legislador / Ex Concejal', 'Primera línea'),

-- SEGUNDA LÍNEA
('sciurano', 'Federico Sciurano', 'Legislador Provincial', 'Segunda línea'),
('lores', 'Damián Löffler', 'Legislador Provincial', 'Segunda línea'),
('martinez_m', 'Myriam Martínez', 'Legisladora Provincial', 'Segunda línea'),
('colazo', 'Laura Colazo', 'Legisladora Provincial', 'Segunda línea'),
('vvuoto', 'Victoria Vuoto', 'Legisladora Provincial', 'Segunda línea'),
('runin', 'Federico Runin', 'Ministro de Gobierno', 'Segunda línea'),
('castillo', 'Gabriela Castillo', 'Ministra de Obras Públicas', 'Segunda línea'),
('digiglio', 'Judit Di Giglio', 'Ministra de Salud', 'Segunda línea'),
('rossi', 'Lucía Rossi', 'Secretaria/Dirigente', 'Segunda línea'),
('coto', 'Agustín Coto', 'Legislador Provincial', 'Segunda línea'),
('graciania', 'Natalia Graciania', 'Legisladora Provincial', 'Segunda línea'),

-- TERCERA LÍNEA
('catena', 'Horacio Catena', 'Sec. Gral SUTEF', 'Tercera línea'),
('vergara', 'René Vergara', 'Sec. Gral Petroleros Privados', 'Tercera línea'),
('fernandez', 'Claudia Fernández', 'Cámara de Comercio Ushuaia', 'Tercera línea'),
('guglielmi', 'Luciana Guglielmi', 'Asociación Rural TDF', 'Tercera línea'),
('gliubich', 'Fernando Gliubich', 'Empresario Sector Agropecuario', 'Tercera línea'),
('worman', 'Guillermo Worman', 'Dir. Participación Ciudadana ONG', 'Tercera línea'),
('cordoba', 'Marcelo Córdoba', 'Dirigente ATE / Sec. General', 'Tercera línea'),
('etchepare', 'Claudia Etchepare', 'Sec. General ATSA', 'Tercera línea'),
('martinez_o', 'Oscar Martínez', 'Diputado M.C / Referente UOM', 'Tercera línea'),
('barrios', 'Dr. Javier Andrés Barrios', 'Sec. Gestión Sist. Sanitarios (Min. Salud)', 'Tercera línea');
