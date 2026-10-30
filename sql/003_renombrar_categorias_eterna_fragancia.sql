-- Renombrado de categorías oficiales de ETERNA FRAGANCIA.
-- Preparado para ejecución manual en Supabase. No ejecutar automáticamente.
-- No crea ni elimina filas, no modifica IDs ni toca public.productos.

BEGIN;

UPDATE public.categorias SET nombre = 'Velas/velones' WHERE id = 9;
UPDATE public.categorias SET nombre = 'Porta sahumerios' WHERE id = 10;
UPDATE public.categorias SET nombre = 'Piedras' WHERE id = 11;
UPDATE public.categorias SET nombre = 'Amuletos' WHERE id = 12;
UPDATE public.categorias SET nombre = 'Bienestar' WHERE id = 13;

COMMIT;
