-- Miguel Ángel Jamonería · esquema inicial para Neon (plan gratuito)
-- Aplicar con: node scripts/init-db.mjs   (o psql "$DATABASE_URL" -f src/db/schema.sql)

CREATE TABLE IF NOT EXISTS categorias (
  id integer PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS productos (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  nombre text NOT NULL,
  categoria_id integer REFERENCES categorias(id),
  descripcion text NOT NULL,
  precio_cent integer NOT NULL,
  precio_antes_cent integer,
  formato text,
  precinto text,
  alergenos text[] DEFAULT '{}'::text[],
  ingredientes text,
  maridaje text,
  raciones_min integer,
  raciones_max integer,
  imagen text,
  temporada boolean DEFAULT false,
  nota_temporada text,
  oferta boolean DEFAULT false,
  oferta_fin timestamptz,
  destacado boolean DEFAULT false,
  valoracion numeric(2,1) DEFAULT 5,
  votos integer DEFAULT 0,
  stock integer DEFAULT 0,
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suscriptores (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preguntas_ia (
  id bigserial PRIMARY KEY,
  pregunta text NOT NULL,
  respuesta_chars integer NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos (categoria_id);
CREATE INDEX IF NOT EXISTS productos_destacado_idx ON productos (destacado);

INSERT INTO categorias (id, slug, nombre, descripcion, orden) VALUES
(1, 'jamones', 'Jamones Ibéricos', 'De bellota, cebo de campo y cebo. Piezas enteras con denominación de origen.', 1), (2, 'embutidos', 'Embutidos Ibéricos', 'Chorizo, salchichón, lomo y morcilla de la mejor materia prima.', 2), (3, 'loncheados', 'Loncheados', 'Calidad y sabor en cada loncha, listos para servir.', 3), (4, 'conservas', 'Conservas y Otros', 'Mantecas, patés, aceites y quesos para completar la mesa.', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO productos (slug, nombre, categoria_id, descripcion, precio_cent, precio_antes_cent, formato, precinto, alergenos, ingredientes, maridaje, raciones_min, raciones_max, imagen, temporada, nota_temporada, oferta, oferta_fin, destacado, valoracion, votos, stock, activo) VALUES
('jamon-bellota-100', 'Jamón Ibérico de Bellota 100% Ibérico', 1, 'Pieza entera de cerdo 100% ibérico criado en libertad en la dehesa y alimentado de bellota durante la montanera. Curado lento en bodega natural de Guijuelo entre 36 y 48 meses. Grasa infiltrada, aroma profundo y un final largo y persistente.', 49500, NULL, 'Pieza entera 7–8 kg', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Vino tinto de Ribera del Duero o cava brut nature. Pan de pueblo con tomate.', 25, 35, 'assets/img/jamon-whole.jpg', true, 'Montanera 2025/26 · disponible de noviembre a febrero', false, NULL, true, 5, 128, 12, true), ('paleta-bellota-100', 'Paleta Ibérica de Bellota 100% Ibérico', 1, 'La misma excelencia del jamón en formato paleta: más compacta, más intensa y perfecta para quien empieza. Cerdo 100% ibérico de bellota, curada 30 meses en bodega natural.', 24500, 27900, 'Pieza entera 4,5–5,5 kg', 'Negro', '{}'::text[], 'Paleta de cerdo ibérico, sal marina.', 'Tinto joven o manzanilla. Ideal con almendras marcona.', 15, 22, 'assets/img/secadero.jpg', true, 'Montanera 2025/26 · última partida de la temporada', true, '2026-11-10T00:59:59', true, 4.9, 96, 8, true), ('jamon-cebo-campo', 'Jamón Ibérico de Cebo de Campo 50%', 1, 'Cerdo ibérico al 50% criado en campo y alimentado con pienso natural. Curado 30 meses. Un jamón equilibrado, de sabor suave y precio contenido: la puerta de entrada al ibérico.', 29500, NULL, 'Pieza entera 6,5–7,5 kg', 'Verde', '{}'::text[], 'Jamón de cerdo ibérico, sal marina, conservantes (E-252, E-250).', 'Tinto de crianza o cerveza artesanal tostada.', 20, 28, 'assets/img/lonchas.jpg', false, NULL, false, NULL, true, 4.7, 74, 15, true), ('lomo-bellota', 'Lomo Ibérico de Bellota', 2, 'Lomo de cerdo ibérico adobado con pimentón de La Vera y ajo, embutido en tripa natural y curado 4 meses. Textura firme y sabor intenso, sin exceso de grasa.', 2450, NULL, 'Pieza 900 g – 1,1 kg', 'Negro', '{}'::text[], 'Lomo de cerdo ibérico, sal, pimentón, ajo, conservantes (E-250, E-252).', 'Tinto reserva. También con una copa de oloroso.', 6, 10, 'assets/img/lomo.jpg', false, NULL, false, NULL, true, 4.9, 61, 40, true), ('chorizo-bellota', 'Chorizo Ibérico de Bellota', 2, 'Chorizo elaborado con magro y tocino de cerdo ibérico de bellota, pimentón de La Vera y curación lenta en secadero natural. Picante justo, grasa que se deshace.', 1850, NULL, 'Pieza 500 g – 700 g', 'Negro', '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimentón, ajo, especias, conservantes (E-250, E-252).', 'Tinto con cuerpo o vermut. Perfecto en tabla.', 4, 8, 'assets/img/embutidos.jpg', false, NULL, false, NULL, true, 4.8, 112, 60, true), ('salchichon-bellota', 'Salchichón Ibérico de Bellota', 2, 'Salchichón de cerdo ibérico con pimienta negra en grano, curado 3 meses. Untuoso, aromático y nada graso en boca. El favorito de los más pequeños de la casa.', 1850, 2150, 'Pieza 500 g – 700 g', 'Negro', '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimienta negra, nuez moscada, conservantes (E-250, E-252).', 'Cerveza lager bien fría o vino blanco con crianza.', 4, 8, 'assets/img/salchichon.jpg', false, NULL, true, '2026-11-10T00:59:59', true, 4.8, 87, 45, true), ('loncheado-bellota-80', 'Loncheado de Jamón de Bellota 100% · 80 g', 3, 'Loncheado a cuchillo por nuestro maestro cortador y envasado al vacío el mismo día. Abre, atempera 20 minutos y sirve. Raciones individuales listas para llevar.', 1290, NULL, 'Sobre 80 g', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Cualquier ocasión. Ideal para una cena rápida o un aperitivo.', 2, 3, 'assets/img/loncheado.jpg', false, NULL, false, NULL, true, 4.9, 203, 120, true), ('pack-degustacion-4', 'Pack Degustación Ibérico para 4', 4, 'Nuestra tabla de la casa en una caja: 100 g de jamón de bellota, 100 g de lomo, chorizo y salchichón ibéricos, cuña de queso curado y pan de pueblo. Llega listo para servir.', 5990, 6990, 'Caja para 4 personas', 'Surtido', '{sulfitos, leche, lactosa, gluten}'::text[], 'Jamón, lomo, chorizo y salchichón de cerdo ibérico, queso de oveja, pan de trigo, sal, especias, conservantes (E-250, E-252).', 'Un vino tinto de Ribera o un cava. Es el regalo que nunca falla.', 3, 5, 'assets/img/tabla.jpg', true, 'Edición Navidad · hasta agotar existencias', true, '2026-11-10T00:59:59', true, 5, 156, 25, true), ('loncheado-mixto-200', 'Loncheado Mixto Ibérico · 200 g', 3, 'Selección de jamón de bellota, lomo, chorizo y salchichón ibéricos loncheados finos. La tabla completa resuelta en un sobre, para 3–4 personas.', 1990, 2450, 'Sobre 200 g', 'Surtido', '{sulfitos}'::text[], 'Jamón, lomo, chorizo y salchichón de cerdo ibérico, sal, pimentón, especias, conservantes (E-250, E-252).', 'Aperitivo con vino tinto o cava. Perfecto para llevar de picnic.', 3, 4, 'assets/img/jamon-queso.jpg', false, NULL, true, '2026-11-10T00:59:59', false, 4.7, 58, 80, true), ('queso-curado-oveja', 'Queso Curado de Oveja · 500 g', 4, 'Queso de oveja curado 6 meses, de pasta prensada y corteza natural. Notas de mantequilla y frutos secos. El contrapunto perfecto a un jamón de bellota.', 1490, NULL, 'Cuña 500 g', NULL, '{leche, lactosa}'::text[], 'Leche de oveja pasteurizada, sal, cuajo, fermentos lácteos, lisozima (contiene huevo).', 'Oloroso o Pedro Ximénez. Con membrillo, sublime.', 4, 6, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.8, 44, 30, true), ('manteca-iberica', 'Manteca Ibérica de Bellota', 4, 'Manteca de cerdo ibérico de bellota, batida en frío. Untada en pan caliente o para dar sabor a guisos y frituras. Un clásico de la matanza tradicional.', 850, NULL, 'Tarro 250 g', NULL, '{}'::text[], 'Manteca de cerdo ibérico, sal.', 'Pan de pueblo tostado. También para cocinar verduras y patatas.', 8, 12, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.6, 31, 50, true), ('jamon-cortado-mano', 'Jamón de Bellota cortado a cuchillo · 1 kg', 3, 'Un kilo de nuestro jamón 100% ibérico de bellota cortado a cuchillo delante de ti en el puesto del Mercado de Abastos y envasado al vacío en raciones de 100 g.', 8900, NULL, '1 kg en 10 sobres de 100 g', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Para una celebración. Atemperar 20 minutos antes de servir.', 8, 10, 'assets/img/corte-cuchillo.jpg', true, 'Corte al momento en el puesto · temporada de montanera', false, NULL, false, 5, 89, 20, true)
ON CONFLICT (slug) DO NOTHING;
