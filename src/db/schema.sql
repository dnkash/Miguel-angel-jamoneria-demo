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

-- Tablas propias de la demo: no mezclan sus datos con la web en producción.
CREATE TABLE IF NOT EXISTS demo_suscriptores (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_preguntas (
  id bigserial PRIMARY KEY,
  pregunta text NOT NULL,
  respuesta_chars integer NOT NULL,
  creado_en timestamptz DEFAULT now()
);

-- Ampliación a 50 productos (variedad de jamones, embutidos, loncheados y conservas).
INSERT INTO productos (slug, nombre, categoria_id, descripcion, precio_cent, precio_antes_cent, formato, precinto, alergenos, ingredientes, maridaje, raciones_min, raciones_max, imagen, temporada, nota_temporada, oferta, oferta_fin, destacado, valoracion, votos, stock, activo) VALUES
('jamon-bellota-50', 'Jamón Ibérico de Bellota 50%', 1, 'Jamón de cerdo ibérico al 50% criado en dehesa y alimentado con bellota en montanera. Curación de 30 meses en bodega natural. Sabor equilibrado y grasa suave.', 19500, NULL, 'Pieza entera 6–7 kg', 'Verde', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Tinto de Ribera del Duero o cava brut.', 18, 25, 'assets/img/jamon-whole.jpg', true, 'Montanera 2025/26 · disponible hasta fin de existencias', false, NULL, true, 4.8, 64, 10, true),
('paleta-cebo-campo', 'Paleta Ibérica de Cebo de Campo 50%', 1, 'Paleta de cerdo ibérico al 50% criado en campo y alimentado con pienso natural. Curación de 24 meses. Formato compacto y sabor intenso.', 14500, NULL, 'Pieza entera 4–5 kg', 'Verde', '{}'::text[], 'Paleta de cerdo ibérico, sal marina, conservantes (E-250, E-252).', 'Tinto joven o cerveza artesanal.', 12, 18, 'assets/img/secadero.jpg', false, NULL, false, NULL, false, 4.7, 52, 14, true),
('jamon-cebo-50', 'Jamón Ibérico de Cebo 50%', 1, 'Jamón de cerdo ibérico al 50% alimentado con pienso natural y curado 24 meses. La puerta de entrada al ibérico, con precio contenido y sabor reconocible.', 17500, NULL, 'Pieza entera 6,5–7,5 kg', 'Blanco', '{}'::text[], 'Jamón de cerdo ibérico, sal marina, conservantes (E-250, E-252).', 'Tinto de crianza o vermut.', 20, 28, 'assets/img/lonchas.jpg', false, NULL, false, NULL, false, 4.6, 48, 18, true),
('paleta-cebo-50', 'Paleta Ibérica de Cebo 50%', 1, 'Paleta de cerdo ibérico al 50% de cebo, curada 20 meses. Ideal para mesas grandes, tapas y bocadillos de categoría sin disparar el presupuesto.', 9500, 11000, 'Pieza entera 4–4,5 kg', 'Blanco', '{}'::text[], 'Paleta de cerdo ibérico, sal marina, conservantes (E-250, E-252).', 'Cerveza lager o vino tinto joven.', 10, 16, 'assets/img/secadero.jpg', false, NULL, true, '2026-12-31T23:59:59', false, 4.5, 39, 22, true),
('jamon-jabugo-bellota', 'Jamón de Bellota D.O. Jabugo', 1, 'Jamón 100% ibérico de bellota con denominación de origen Jabugo. Curación mínima de 40 meses en bodega de la sierra. La pieza más exclusiva del puesto.', 46500, NULL, 'Pieza entera 7–8 kg', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Gran reserva de Ribera o champán vintage.', 25, 35, 'assets/img/jamon-whole.jpg', true, 'Partida limitada de montanera', false, NULL, true, 5.0, 88, 5, true),
('paleta-bellota-50', 'Paleta de Bellota 50%', 1, 'Paleta de cerdo ibérico al 50% que sí pasa la montanera comiendo bellota. Curación de 26 meses. Más suave que el 100% y perfecta para empezar.', 16500, NULL, 'Pieza entera 4,5–5 kg', 'Verde', '{}'::text[], 'Paleta de cerdo ibérico, sal marina.', 'Manzanilla o tinto de Ribera.', 14, 20, 'assets/img/secadero.jpg', true, 'Montanera 2025/26', false, NULL, false, 4.8, 57, 9, true),
('jamon-mini-bellota', 'Jamón de Bellota 5 kg', 1, 'Formato mini de jamón 100% ibérico de bellota, de piezas seleccionadas de 5 kg. Misma curación de 36 meses en un tamaño manejable para nevera y cortador casero.', 36500, NULL, 'Pieza 5 kg aprox.', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Cualquier tinto con cuerpo.', 18, 25, 'assets/img/jamon-whole.jpg', false, NULL, false, NULL, true, 4.9, 73, 7, true),
('morcilla-iberica', 'Morcilla Ibérica', 2, 'Morcilla elaborada con sangre y tocino de cerdo ibérico, cebolla y especias. Curación lenta y sabor profundo. Ideal para plancha o guiso.', 750, NULL, 'Pieza 400–500 g', NULL, '{sulfitos}'::text[], 'Sangre y tocino de cerdo ibérico, cebolla, arroz, sal, especias, conservantes.', 'Tinto joven o sidra natural.', 4, 6, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.6, 31, 35, true),
('sobrasada-iberica', 'Sobrasada Ibérica', 2, 'Sobrasada de cerdo ibérico con pimentón de La Vera, textura untuosa y sabor dulce-picante. Perfecta para tostas, pasta y huevos.', 890, NULL, 'Tripa 400 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, pimentón, sal, especias.', 'Vino tinto joven o cava.', 4, 8, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.7, 44, 40, true),
('fuet-iberico', 'Fuet Ibérico', 2, 'Fuet de cerdo ibérico con pimienta negra, curado 3 meses en secadero natural. Formato fino, ideal para picar y llevar.', 650, NULL, 'Pieza 250–300 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimienta, conservantes.', 'Cerveza lager o vermut.', 2, 4, 'assets/img/salchichon.jpg', false, NULL, false, NULL, false, 4.5, 29, 50, true),
('salchichon-vela', 'Salchichón de Vela Ibérico', 2, 'Salchichón de vela de cerdo ibérico en formato grande, curado 4 meses. Pimienta gruesa y textura firme para cortar en lonchas generosas.', 1250, NULL, 'Pieza 900 g – 1,1 kg', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimienta negra, especias.', 'Tinto de crianza.', 8, 12, 'assets/img/salchichon.jpg', false, NULL, false, NULL, false, 4.8, 55, 30, true),
('chorizo-vela', 'Chorizo de Vela Ibérico', 2, 'Chorizo de vela de cerdo ibérico con pimentón de La Vera, curado 4 meses. Sabor intenso y grasa que se deshace en boca.', 1350, NULL, 'Pieza 900 g – 1,1 kg', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimentón, ajo, especias.', 'Tinto con cuerpo o vermut.', 8, 12, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.8, 62, 28, true),
('lomo-embuchado', 'Lomo Embuchado Ibérico', 2, 'Lomo de cerdo ibérico adobado y embutido en tripa natural, curado 5 meses. Muy magro, sabor limpio y corte firme.', 2350, NULL, 'Pieza 800 g – 1 kg', NULL, '{sulfitos}'::text[], 'Lomo de cerdo ibérico, sal, pimentón, ajo, conservantes.', 'Tinto reserva u oloroso.', 6, 10, 'assets/img/lomo.jpg', false, NULL, false, NULL, false, 4.9, 51, 26, true),
('panceta-iberica', 'Panceta Ibérica', 2, 'Panceta de cerdo ibérico curada y ahumada suavemente. Cortada fina y pasada por la plancha es un espectáculo.', 690, NULL, 'Pieza 500 g', NULL, '{sulfitos}'::text[], 'Panceta de cerdo ibérico, sal, especias, humo natural.', 'Cerveza artesanal o tinto joven.', 4, 6, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.6, 27, 32, true),
('cecina-leon', 'Cecina de León', 2, 'Cecina de vacuno curada y ahumada con leña de encina, IGP Cecina de León. Textura fina y sabor intenso, distinta al ibérico.', 1850, NULL, 'Pieza 500 g', NULL, '{sulfitos}'::text[], 'Carne de vacuno, sal, especias, humo natural.', 'Tinto del Bierzo o cerveza tostada.', 4, 8, 'assets/img/lomo.jpg', false, NULL, false, NULL, false, 4.7, 33, 20, true),
('butifarra-iberica', 'Butifarra Ibérica', 2, 'Butifarra fresca de cerdo ibérico con pimienta y anís. Para cocinar a la brasa o en guiso, con una grasa muy aromática.', 780, NULL, 'Pieza 400 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimienta, anís.', 'Vino blanco seco o cerveza.', 3, 5, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.4, 18, 24, true),
('chistorra-iberica', 'Chistorra Ibérica', 2, 'Chistorra de cerdo ibérico, fina y jugosa, con pimentón y ajo. Lista para la plancha en cinco minutos.', 720, NULL, 'Pieza 350 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimentón, ajo.', 'Cerveza bien fría o txakoli.', 3, 5, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.5, 22, 30, true),
('cabeza-lomo', 'Cabeza de Lomo Ibérico', 2, 'Cabeza de lomo de cerdo ibérico, la parte más grasa y sabrosa del lomo, curada 4 meses. Para los que buscan intensidad.', 1650, NULL, 'Pieza 500–600 g', NULL, '{sulfitos}'::text[], 'Cabeza de lomo de cerdo ibérico, sal, pimentón, ajo.', 'Tinto potente o vermut.', 4, 6, 'assets/img/lomo.jpg', false, NULL, false, NULL, false, 4.7, 26, 15, true),
('loncheado-bellota-200', 'Loncheado de Bellota 200 g', 3, 'Dos sobres de 100 g de jamón 100% ibérico de bellota cortado a cuchillo. Envasado al vacío el mismo día del corte.', 3490, NULL, '2 sobres de 100 g', 'Negro', '{}'::text[], 'Jamón de cerdo ibérico, sal marina.', 'Cualquier ocasión; tinto o cava.', 4, 6, 'assets/img/loncheado.jpg', false, NULL, false, NULL, true, 4.9, 141, 60, true),
('loncheado-cebo-80', 'Loncheado de Cebo 80 g', 3, 'Jamón ibérico de cebo loncheado finamente, envasado al vacío. Una ración individual para aperitivo o bocadillo.', 890, NULL, 'Sobre 80 g', 'Blanco', '{}'::text[], 'Jamón de cerdo ibérico, sal marina, conservantes.', 'Cerveza o vino tinto joven.', 1, 2, 'assets/img/loncheado.jpg', false, NULL, false, NULL, false, 4.6, 58, 90, true),
('loncheado-lomo-100', 'Loncheado de Lomo 100 g', 3, 'Lomo ibérico curado loncheado fino, envasado al vacío. Sabor intenso y textura firme, listo para servir.', 1390, NULL, 'Sobre 100 g', NULL, '{sulfitos}'::text[], 'Lomo de cerdo ibérico, sal, pimentón, ajo.', 'Tinto reserva.', 2, 3, 'assets/img/jamon-queso.jpg', false, NULL, false, NULL, false, 4.8, 47, 70, true),
('loncheado-chorizo-100', 'Loncheado de Chorizo 100 g', 3, 'Chorizo ibérico de bellota loncheado, envase de 100 g. Perfecto para una tabla rápida o un bocadillo de categoría.', 690, NULL, 'Sobre 100 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimentón, ajo.', 'Cerveza o vermut.', 2, 3, 'assets/img/embutidos.jpg', false, NULL, false, NULL, false, 4.7, 66, 85, true),
('loncheado-salchichon-100', 'Loncheado de Salchichón 100 g', 3, 'Salchichón ibérico loncheado con pimienta negra, envase de 100 g. Untuoso y aromático, el favorito de los niños.', 750, NULL, 'Sobre 100 g', NULL, '{sulfitos}'::text[], 'Magro y tocino de cerdo ibérico, sal, pimienta, especias.', 'Cerveza lager o vino blanco.', 2, 3, 'assets/img/salchichon.jpg', false, NULL, false, NULL, false, 4.7, 54, 80, true),
('loncheado-paleta-80', 'Loncheado de Paleta 80 g', 3, 'Paleta ibérica de bellota loncheada, ración de 80 g. Más intensa que el jamón y perfecta para una cena individual.', 990, NULL, 'Sobre 80 g', 'Negro', '{}'::text[], 'Paleta de cerdo ibérico, sal marina.', 'Tinto joven o manzanilla.', 1, 2, 'assets/img/loncheado.jpg', false, NULL, false, NULL, false, 4.8, 61, 75, true),
('loncheado-mixto-400', 'Loncheado Mixto Ibérico 400 g', 3, 'Cuatro sobres de 100 g: jamón de bellota, lomo, chorizo y salchichón ibéricos. La tabla completa sin tener que cortar nada.', 3790, NULL, '4 sobres de 100 g', NULL, '{sulfitos}'::text[], 'Jamón, lomo, chorizo y salchichón de cerdo ibérico, sal, especias.', 'Tinto de crianza o cava.', 6, 10, 'assets/img/jamon-queso.jpg', false, NULL, false, NULL, true, 4.9, 97, 40, true),
('aceite-oliva-500', 'Aceite de Oliva Virgen Extra 500 ml', 4, 'Aceite de oliva virgen extra de almazara de Salamanca, variedad picual. Frutado intenso y amargo elegante.', 1250, NULL, 'Botella 500 ml', NULL, '{}'::text[], 'Aceite de oliva virgen extra.', 'Pan de pueblo, jamón y quesos curados.', 10, 20, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.8, 42, 50, true),
('aceite-oliva-1l', 'Aceite de Oliva Virgen Extra 1 L', 4, 'Garrafa de un litro del mismo aceite picual de almazara salmantina. Mejor precio por litro para el día a día.', 2190, NULL, 'Garrafa 1 L', NULL, '{}'::text[], 'Aceite de oliva virgen extra.', 'Para cocinar, aliñar y acompañar.', 20, 40, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.8, 35, 45, true),
('pate-iberico-150', 'Paté Ibérico 150 g', 4, 'Paté de hígado y tocino de cerdo ibérico, textura fina y sabor suave. Envase de cristal de 150 g.', 690, NULL, 'Tarro 150 g', NULL, '{}'::text[], 'Hígado y tocino de cerdo ibérico, sal, especias.', 'Tostada de pan de pueblo y tinto joven.', 2, 4, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.7, 38, 55, true),
('pate-higado-200', 'Paté de Hígado 200 g', 4, 'Paté de hígado de cerdo ibérico con un toque de brandy. Cremoso y equilibrado, ideal para untar.', 590, NULL, 'Tarro 200 g', NULL, '{}'::text[], 'Hígado de cerdo ibérico, tocino, brandy, sal, especias.', 'Oloroso o cerveza tostada.', 3, 5, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.6, 24, 48, true),
('aceitunas-manzanilla-350', 'Aceitunas Manzanilla 350 g', 4, 'Aceitunas manzanilla aliñadas con ajo, laurel y tomillo. Un clásico para acompañar la tabla de ibéricos.', 450, NULL, 'Tarro 350 g', NULL, '{}'::text[], 'Aceitunas, agua, sal, ajo, laurel, tomillo, vinagre.', 'Vermut o cerveza.', 4, 6, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.5, 19, 60, true),
('pimientos-piquillo-250', 'Pimientos del Piquillo 250 g', 4, 'Pimientos del piquillo asados y pelados a mano, de Lodosa. Dulces, carnosos y sin amargor.', 550, NULL, 'Tarro 250 g', NULL, '{}'::text[], 'Pimientos del piquillo, agua, sal.', 'Con jamón, queso o solos.', 3, 5, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.6, 21, 40, true),
('miel-romero-500', 'Miel de Romero 500 g', 4, 'Miel cruda de romero de la sierra de Salamanca, sin pasteurizar. Aroma floral y final ligeramente ácido.', 890, NULL, 'Tarro 500 g', NULL, '{}'::text[], 'Miel de romero.', 'Queso curado y pan de pueblo.', 10, 20, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.8, 30, 35, true),
('queso-curado-1kg', 'Queso Curado de Oveja 1 kg', 4, 'Queso de oveja curado 8 meses, de pasta prensada y corteza natural. Intenso, mantecoso y con retrogusto largo.', 2790, NULL, 'Pieza 1 kg', NULL, '{leche,lactosa,huevo}'::text[], 'Leche de oveja pasteurizada, sal, cuajo, fermentos, lisozima.', 'Oloroso o tinto reserva.', 8, 12, 'assets/img/queso.jpg', false, NULL, false, NULL, true, 4.9, 68, 25, true),
('queso-tetilla-500', 'Queso Tetilla 500 g', 4, 'Queso gallego de tetilla, cremoso y suave, con la forma característica. Perfecto para untar o gratinar.', 1590, NULL, 'Pieza 500 g', NULL, '{leche,lactosa}'::text[], 'Leche de vaca pasteurizada, sal, cuajo, fermentos.', 'Albariño o cerveza lager.', 4, 6, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.6, 28, 30, true),
('queso-azul-250', 'Queso Azul 250 g', 4, 'Queso azul de oveja con vetas de penicillium, intenso y cremoso. Para los amantes de los sabores fuertes.', 1190, NULL, 'Cuña 250 g', NULL, '{leche,lactosa}'::text[], 'Leche de oveja, sal, cuajo, penicillium.', 'Pedro Ximénez o Oporto.', 4, 6, 'assets/img/queso.jpg', false, NULL, false, NULL, false, 4.7, 26, 18, true),
('pan-pueblo-500', 'Pan de Pueblo 500 g', 4, 'Hogaza de masa madre de trigo, corteza crujiente y miga alveolada. Se hornea cada mañana en Salamanca.', 390, NULL, 'Hogaza 500 g', NULL, '{gluten}'::text[], 'Harina de trigo, agua, masa madre, sal, levadura.', 'Con todo. Es el soporte oficial del jamón.', 4, 8, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.8, 33, 20, true),
('pack-gourmet-6', 'Pack Gourmet para 6', 4, 'Caja regalo con jamón de bellota loncheado, lomo, chorizo, salchichón, queso curado, aceite y pan. Presentación con lazo.', 8990, 9990, 'Caja para 6 personas', NULL, '{sulfitos,leche,lactosa,gluten}'::text[], 'Selección de ibéricos, queso, aceite y pan.', 'Cena completa; tinto de Ribera.', 6, 6, 'assets/img/tabla.jpg', true, 'Ideal para regalo navideño', true, '2026-12-31T23:59:59', true, 5.0, 112, 18, true),
('pack-cena-2', 'Pack Cena para 2', 4, 'Cena resuelta: 100 g de jamón de bellota, 100 g de lomo, queso curado, aceitunas y pan. Todo listo para servir.', 3490, NULL, 'Caja para 2 personas', NULL, '{sulfitos,leche,lactosa,gluten}'::text[], 'Jamón, lomo, queso, aceitunas y pan.', 'Una copa de tinto o cava.', 2, 2, 'assets/img/tabla.jpg', false, NULL, false, NULL, false, 4.9, 74, 28, true)
ON CONFLICT (slug) DO NOTHING;

-- ═════════ PEDIDOS DEMO ═════════
CREATE TABLE IF NOT EXISTS demo_pedidos (
  id serial PRIMARY KEY,
  numero text UNIQUE NOT NULL,
  token text UNIQUE NOT NULL,
  estado text NOT NULL DEFAULT 'pagado',
  cliente_nombre text NOT NULL,
  cliente_email text NOT NULL,
  cliente_telefono text,
  entrega_tipo text NOT NULL DEFAULT 'envio',
  direccion text,
  ciudad text,
  codigo_postal text,
  notas text,
  nota_interna text,
  subtotal_cent integer NOT NULL,
  envio_cent integer NOT NULL DEFAULT 0,
  total_cent integer NOT NULL,
  pago_metodo text NOT NULL DEFAULT 'demo',
  pago_estado text NOT NULL DEFAULT 'simulado',
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  preparado_en timestamptz,
  listo_en timestamptz,
  enviado_en timestamptz,
  entregado_en timestamptz,
  cancelado_en timestamptz
);

CREATE TABLE IF NOT EXISTS demo_pedido_lineas (
  id serial PRIMARY KEY,
  pedido_id integer NOT NULL REFERENCES demo_pedidos(id) ON DELETE CASCADE,
  producto_slug text NOT NULL,
  nombre text NOT NULL,
  precio_cent integer NOT NULL,
  cantidad integer NOT NULL,
  subtotal_cent integer NOT NULL,
  alergenos text[] DEFAULT '{}'::text[]
);

CREATE TABLE IF NOT EXISTS demo_mensajes (
  id serial PRIMARY KEY,
  pedido_id integer REFERENCES demo_pedidos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'email',
  destinatario text,
  asunto text NOT NULL,
  cuerpo text NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_pedidos_estado_idx ON demo_pedidos (estado);
CREATE INDEX IF NOT EXISTS demo_pedidos_creado_idx ON demo_pedidos (creado_en DESC);
CREATE INDEX IF NOT EXISTS demo_pedido_lineas_pedido_idx ON demo_pedido_lineas (pedido_id);
CREATE INDEX IF NOT EXISTS demo_mensajes_pedido_idx ON demo_mensajes (pedido_id);

CREATE TABLE IF NOT EXISTS demo_auditoria (
  id serial PRIMARY KEY,
  usuario text NOT NULL,
  rol text NOT NULL,
  accion text NOT NULL,
  pedido_id integer REFERENCES demo_pedidos(id) ON DELETE SET NULL,
  detalle text,
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_auditoria_pedido_idx ON demo_auditoria (pedido_id);
CREATE INDEX IF NOT EXISTS demo_auditoria_creado_idx ON demo_auditoria (creado_en DESC);

ALTER TABLE demo_pedidos ADD COLUMN IF NOT EXISTS nota_interna text;
