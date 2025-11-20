# Initial Field Values

## Filament Material Classes

Based on the material types [used by OpenPrintTag](https://specs.openprinttag.org/#/material_types). In addition to these options, filaments also have a text "Material" field meant for the full material name used by the brand (e.g. "PLA+", "PLA Basic", "High Speed Matte PLA").

```sql
INSERT INTO filament_material_classes(id, name) VALUES
(gen_random_uuid(), 'PLA'),
(gen_random_uuid(), 'PETG'),
(gen_random_uuid(), 'TPU'),
(gen_random_uuid(), 'ABS'),
(gen_random_uuid(), 'ASA'),
(gen_random_uuid(), 'PC'),
(gen_random_uuid(), 'PCTG'),
(gen_random_uuid(), 'PP'),
(gen_random_uuid(), 'PA6'),
(gen_random_uuid(), 'PA11'),
(gen_random_uuid(), 'PA12'),
(gen_random_uuid(), 'PA66'),
(gen_random_uuid(), 'CPE'),
(gen_random_uuid(), 'TPE'),
(gen_random_uuid(), 'HIPS'),
(gen_random_uuid(), 'PHA'),
(gen_random_uuid(), 'PET'),
(gen_random_uuid(), 'PEI'),
(gen_random_uuid(), 'PBT'),
(gen_random_uuid(), 'PVB'),
(gen_random_uuid(), 'PVA'),
(gen_random_uuid(), 'PEKK'),
(gen_random_uuid(), 'PEEK'),
(gen_random_uuid(), 'BVOH'),
(gen_random_uuid(), 'TPC'),
(gen_random_uuid(), 'PPS'),
(gen_random_uuid(), 'PPSU'),
(gen_random_uuid(), 'PVC'),
(gen_random_uuid(), 'PEBA'),
(gen_random_uuid(), 'PVDF'),
(gen_random_uuid(), 'PPA'),
(gen_random_uuid(), 'PCL'),
(gen_random_uuid(), 'PES'),
(gen_random_uuid(), 'PMMA'),
(gen_random_uuid(), 'POM'),
(gen_random_uuid(), 'PPE'),
(gen_random_uuid(), 'PS'),
(gen_random_uuid(), 'PSU'),
(gen_random_uuid(), 'TPI'),
(gen_random_uuid(), 'SBS');
```

## Tags and Tag Categories

Partly based on the [OpenPrintTag tag list](https://specs.openprinttag.org/#/material_tags).

```sql
-- Colors
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Color', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category)
VALUES
  (gen_random_uuid(), 'Black', (SELECT id FROM cat)),
  (gen_random_uuid(), 'White', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Gray', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Red', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Orange', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Yellow', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Green', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Blue', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Purple', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Pink', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Brown', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Clear', (SELECT id FROM cat));

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Color';

-- Visual
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Visual', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category, aliases)
VALUES
  (gen_random_uuid(), 'Multiple Colors', (SELECT id FROM cat), ARRAY['Multicolor']::text[]),
  (gen_random_uuid(), 'Matte', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Silk', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Translucent', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Transparent', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Iridescent', (SELECT id FROM cat), ARRAY['Mystic']::text[]),
  (gen_random_uuid(), 'Pearlescent', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Glitter', (SELECT id FROM cat), ARRAY['Galaxy', 'Sparkle']::text[]),
  (gen_random_uuid(), 'Glow In The Dark', (SELECT id FROM cat), ARRAY['Phosphorescent']::text[]),
  (gen_random_uuid(), 'Fluorescent', (SELECT id FROM cat), ARRAY['Neon']::text[]),
  (gen_random_uuid(), 'Temperature Color Change', (SELECT id FROM cat), ARRAY[]::text[]),
  (gen_random_uuid(), 'Gradient', (SELECT id FROM cat), ARRAY['Gradual Color Change']::text[]),
  (gen_random_uuid(), 'Coextruded', (SELECT id FROM cat), ARRAY[]::text[]);

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Visual';

-- Organic Additives
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Organic Additive', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category)
VALUES
  (gen_random_uuid(), 'Contains Organic Material', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Wood', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Cork', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Wax', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Algae', (SELECT id FROM cat));

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Organic Additive';

-- Metal Additives
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Metal Additive', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category)
VALUES
  (gen_random_uuid(), 'Contains Metal', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Bronze', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Iron', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Steel', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Silver', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Copper', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Aluminium', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Brass', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Tungsten', (SELECT id FROM cat));

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Metal Additive';

-- Other Additives
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Other Additive', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category)
VALUES
  (gen_random_uuid(), 'Contains Carbon', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Carbon Fiber', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Carbon Nano Tubes', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Glass', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Glass Fiber', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Kevlar', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains PTFE', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Stone', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Magnetite', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Ceramic', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Contains Boron Carbide', (SELECT id FROM cat));

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Other Additive';

-- Imitates
WITH cat AS (
  INSERT INTO tag_categories (id, name, product_types)
  VALUES
    (gen_random_uuid(), 'Imitates', ARRAY['filament']::product_type[])
  RETURNING id
)
INSERT INTO tags (id, name, category)
VALUES
  (gen_random_uuid(), 'Imitates Wood', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Imitates Metal', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Imitates Marble', (SELECT id FROM cat)),
  (gen_random_uuid(), 'Imitates Stone', (SELECT id FROM cat));

UPDATE tags SET product_types = ARRAY['filament']::product_type[] FROM tag_categories WHERE tag_categories.id = tags.category AND tag_categories.name = 'Imitates';
```
