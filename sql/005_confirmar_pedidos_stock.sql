-- ETERNA FRAGANCIA - Confirmación atómica y descuento de stock
-- Preparado para revisión. No ejecutar automáticamente.

create table if not exists public.pedido_confirmaciones (
    order_key text primary key,
    items jsonb not null,
    confirmado_at timestamptz not null default now(),
    confirmado_por uuid not null references auth.users(id)
);

alter table public.pedido_confirmaciones enable row level security;
revoke all on table public.pedido_confirmaciones from public, anon, authenticated;

-- La confirmación final vive en 006_pedidos_supabase.sql, donde puede leer
-- las líneas persistidas y actualizar pedidos y stock en una sola transacción.
-- Elimina la firma antigua si existía para que no quede una RPC insegura que
-- acepte líneas enviadas por el navegador.
drop function if exists public.confirm_order_stock(text, jsonb);
