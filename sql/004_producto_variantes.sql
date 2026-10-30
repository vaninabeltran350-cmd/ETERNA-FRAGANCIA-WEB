-- ETERNA FRAGANCIA - Seguridad y sincronización de producto_variantes
-- Migración para la instalación real. No crea ni recrea tablas.

begin;

-- Dependencias verificadas sin modificar datos.
do $$
begin
    if to_regclass('public.productos') is null then
        raise exception 'Falta public.productos.';
    end if;
    if to_regclass('public.producto_variantes') is null then
        raise exception 'Falta public.producto_variantes.';
    end if;
    if to_regclass('public.admin_users') is null then
        raise exception 'Falta public.admin_users.';
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'admin_users'
          and column_name = 'user_id'
          and udt_name = 'uuid'
    ) then
        raise exception 'admin_users.user_id debe ser uuid.';
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'producto_variantes'
          and column_name in ('created_at', 'updated_at')
        group by table_schema, table_name
        having count(*) = 2
    ) then
        raise exception 'producto_variantes debe tener created_at y updated_at.';
    end if;
end;
$$;

-- Mecanismo único: auth.uid() contra admin_users.user_id.
do $$
begin
    if to_regprocedure('public.es_admin()') is null then
        execute $function$
            create function public.es_admin()
            returns boolean language sql stable security definer
            set search_path = public, pg_temp
            as $body$
                select exists (
                    select 1 from public.admin_users
                    where user_id = (select auth.uid())
                )
            $body$
        $function$;
    else
        execute $function$
            create or replace function public.es_admin()
            returns boolean language sql stable security definer
            set search_path = public, pg_temp
            as $body$
                select exists (
                    select 1 from public.admin_users
                    where user_id = (select auth.uid())
                )
            $body$
        $function$;
    end if;

    revoke all on function public.es_admin() from public, anon, authenticated;
    grant execute on function public.es_admin() to authenticated;

    if to_regprocedure('public.is_admin()') is not null then
        execute $function$
            create or replace function public.is_admin()
            returns boolean language sql stable security definer
            set search_path = public, pg_temp
            as $body$
                select public.es_admin()
            $body$
        $function$;
        revoke all on function public.is_admin() from public, anon, authenticated;
        grant execute on function public.is_admin() to authenticated;
    end if;
end;
$$;

alter table public.productos enable row level security;
alter table public.producto_variantes enable row level security;

-- Conserva la lectura pública del catálogo. Si ya existe una política SELECT
-- para anon, no crea otra ni modifica sus permisos.
do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'productos'
          and cmd = 'SELECT'
          and ('anon' = any (roles) or 'public' = any (roles))
          and (
              qual is null
              or btrim(qual) in ('true', '(true)')
          )
    ) then
        create policy "Public can read products"
            on public.productos
            for select to anon, authenticated
            using (true);
    end if;
end;
$$;

-- Conserva SELECT y reemplaza únicamente las políticas de escritura.
do $$
declare
    existing_policy record;
begin
    for existing_policy in
        select tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename in ('productos', 'producto_variantes')
          and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
    loop
        execute format(
            'drop policy if exists %I on public.%I',
            existing_policy.policyname,
            existing_policy.tablename
        );
    end loop;

    create policy "Authenticated users can manage products"
        on public.productos for all to authenticated
        using ((select public.es_admin()))
        with check ((select public.es_admin()));

    create policy "Administrators can insert product variants"
        on public.producto_variantes for insert to authenticated
        with check ((select public.es_admin()));
    create policy "Administrators can update product variants"
        on public.producto_variantes for update to authenticated
        using ((select public.es_admin()))
        with check ((select public.es_admin()));
    create policy "Administrators can delete product variants"
        on public.producto_variantes for delete to authenticated
        using ((select public.es_admin()));
end;
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'producto_variantes'
          and cmd = 'SELECT'
          and (
              'anon' = any (roles)
              or 'public' = any (roles)
          )
          and (
              qual is null
              or btrim(qual) in ('true', '(true)')
          )
    ) then
        create policy "Public can read product variants"
            on public.producto_variantes for select using (true);
    end if;
end;
$$;

-- Actualiza productos.stock solo mientras exista al menos una variante.
-- No modifica productos.estado. Si se elimina la última variante, conserva
-- el stock general para evitar cambios implícitos.
create or replace function public.recalculate_producto_stock_from_variants(
    p_producto_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    variant_count integer;
    total_stock integer;
begin
    select count(*)::integer, coalesce(sum(stock), 0)::integer
    into variant_count, total_stock
    from public.producto_variantes
    where producto_id = p_producto_id;
    if variant_count > 0 then
        update public.productos set stock = total_stock where id = p_producto_id;
    end if;
end;
$$;

revoke all on function public.recalculate_producto_stock_from_variants(bigint)
from public, anon, authenticated;

create or replace function public.sync_producto_stock_from_variants()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if tg_op = 'INSERT' then
        perform public.recalculate_producto_stock_from_variants(new.producto_id);
    elsif tg_op = 'DELETE' then
        perform public.recalculate_producto_stock_from_variants(old.producto_id);
    else
        perform public.recalculate_producto_stock_from_variants(old.producto_id);
        if new.producto_id is distinct from old.producto_id then
            perform public.recalculate_producto_stock_from_variants(new.producto_id);
        end if;
    end if;
    if tg_op = 'DELETE' then return old; end if;
    return new;
end;
$$;

revoke all on function public.sync_producto_stock_from_variants()
from public, anon, authenticated;

drop trigger if exists trg_sync_producto_stock_from_variants
on public.producto_variantes;
create trigger trg_sync_producto_stock_from_variants
after insert or update or delete on public.producto_variantes
for each row execute function public.sync_producto_stock_from_variants();

commit;
