-- Migración de categorías oficiales de ETERNA FRAGANCIA.
-- Preparada para revisión. No ejecutar automáticamente.
-- Requiere que public.productos esté vacía.

BEGIN;

DO $$
DECLARE
    product_count bigint;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.productos;

    IF product_count > 0 THEN
        RAISE EXCEPTION
            'Migración detenida: public.productos contiene % registro(s). No se eliminó ninguna categoría.',
            product_count;
    END IF;
END $$;

DELETE FROM public.categorias;

INSERT INTO public.categorias (nombre)
VALUES
    ('Sahumerios'),
    ('Aromatización'),
    ('Velas y velones'),
    ('Porta sahumerios y accesorios'),
    ('Piedras y energías'),
    ('Amuletos y pulseras'),
    ('Relax y bienestar'),
    ('Decoración'),
    ('Kits');

COMMIT;
