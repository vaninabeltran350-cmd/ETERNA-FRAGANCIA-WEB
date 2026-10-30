-- ETERNA FRAGANCIA - Stock general cuando solo quedan variantes retiradas
-- Requiere que public.producto_variantes y el trigger de la migración 004 ya existan.
-- No modifica datos al instalarse: solo reemplaza la función ejecutada por el trigger.

begin;

create or replace function public.recalculate_producto_stock_from_variants(
    p_producto_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    active_variant_count integer;
    total_stock integer;
begin
    select count(*)::integer, coalesce(sum(stock), 0)::integer
      into active_variant_count, total_stock
      from public.producto_variantes
     where producto_id = p_producto_id
       and stock > 0;

    -- Las variantes con stock 0 pueden conservarse por historial de pedidos.
    -- Cuando no quedan variantes disponibles, se conserva productos.stock como
    -- stock general administrado manualmente.
    if active_variant_count > 0 then
        update public.productos
           set stock = total_stock
         where id = p_producto_id;
    end if;
end;
$$;

revoke all on function public.recalculate_producto_stock_from_variants(bigint)
from public, anon, authenticated;

-- Las RPC instaladas anteriormente también deben considerar únicamente
-- variantes disponibles. Las variantes con stock 0 quedan reservadas para
-- conservar referencias históricas de pedido.
create or replace function public.create_pending_order(
    p_order_key text,
    p_customer_name text,
    p_customer_email text,
    p_customer_phone text,
    p_payment_method text,
    p_notes text,
    p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    item jsonb;
    v_order_id bigint;
    v_existing_id bigint;
    v_product_id bigint;
    v_variant_id bigint;
    v_quantity integer;
    v_product_name text;
    v_aroma text;
    v_price numeric(12, 2);
    v_product_active boolean;
    v_stock integer;
    v_variant_stock integer;
    v_has_variants boolean;
    v_requested_before integer;
    v_line_subtotal numeric(12, 2);
    v_subtotal numeric(12, 2) := 0;
begin
    if nullif(trim(p_order_key), '') is null then
        raise exception 'El identificador del pedido es obligatorio.' using errcode = '22023';
    end if;
    if nullif(trim(p_customer_name), '') is null
       or nullif(trim(p_customer_email), '') is null
       or nullif(trim(p_customer_phone), '') is null then
        raise exception 'Los datos del cliente son obligatorios.' using errcode = '22023';
    end if;
    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
        raise exception 'El pedido no contiene productos válidos.' using errcode = '22023';
    end if;

    p_order_key := trim(p_order_key);

    insert into public.pedidos (
        order_key, customer_name, customer_email, customer_phone,
        payment_method, notes
    )
    values (
        p_order_key, trim(p_customer_name), trim(p_customer_email),
        trim(p_customer_phone), trim(p_payment_method), coalesce(p_notes, '')
    )
    on conflict (order_key) do nothing
    returning id into v_order_id;

    if v_order_id is null then
        select id, subtotal, total
          into v_existing_id, v_subtotal, v_line_subtotal
          from public.pedidos
         where order_key = p_order_key;
        return jsonb_build_object(
            'id', v_existing_id,
            'order_key', p_order_key,
            'subtotal', v_subtotal,
            'total', v_line_subtotal,
            'already_created', true
        );
    end if;

    for item in select value from jsonb_array_elements(p_items)
    loop
        v_product_id := nullif(item->>'product_id', '')::bigint;
        v_variant_id := nullif(item->>'variant_id', '')::bigint;
        v_quantity := nullif(item->>'quantity', '')::integer;

        if v_product_id is null or v_quantity is null or v_quantity <= 0 then
            raise exception 'El pedido contiene una cantidad o producto inválido.' using errcode = '22023';
        end if;

        select p.nombre, p.precio, p.stock, p.estado,
               exists (
                   select 1 from public.producto_variantes pv
                    where pv.producto_id = p.id
                      and pv.stock > 0
               )
          into v_product_name, v_price, v_stock, v_product_active, v_has_variants
          from public.productos p
         where p.id = v_product_id;

        if not found then
            raise exception 'El producto seleccionado ya no existe.' using errcode = 'P0002';
        end if;
        if not coalesce(v_product_active, false) then
            raise exception 'El producto seleccionado no está disponible.' using errcode = '22023';
        end if;

        if v_variant_id is not null then
            select pv.aroma, pv.stock
              into v_aroma, v_variant_stock
              from public.producto_variantes pv
             where pv.id = v_variant_id
               and pv.producto_id = v_product_id;
            if not found then
                raise exception 'La variante seleccionada ya no existe.' using errcode = 'P0002';
            end if;
            if v_variant_stock < v_quantity then
                raise exception 'Stock insuficiente para la variante seleccionada.' using errcode = 'P0001';
            end if;
            select coalesce(sum(cantidad), 0)
              into v_requested_before
              from public.pedido_items
             where pedido_id = v_order_id
               and variante_id = v_variant_id;
            if v_variant_stock < v_requested_before + v_quantity then
                raise exception 'La cantidad total solicitada supera el stock de la variante.' using errcode = 'P0001';
            end if;
        elsif v_has_variants then
            raise exception 'El producto requiere una variante de aroma.' using errcode = '22023';
        elsif v_stock < v_quantity then
            raise exception 'Stock insuficiente para el producto seleccionado.' using errcode = 'P0001';
        else
            select coalesce(sum(cantidad), 0)
              into v_requested_before
              from public.pedido_items
             where pedido_id = v_order_id
               and producto_id = v_product_id
               and variante_id is null;
            if v_stock < v_requested_before + v_quantity then
                raise exception 'La cantidad total solicitada supera el stock del producto.' using errcode = 'P0001';
            end if;
        end if;

        v_line_subtotal := round(v_price * v_quantity, 2);
        v_subtotal := v_subtotal + v_line_subtotal;

        insert into public.pedido_items (
            pedido_id, producto_id, variante_id, producto_nombre, aroma,
            cantidad, precio_unitario, subtotal
        )
        values (
            v_order_id, v_product_id, v_variant_id, v_product_name, v_aroma,
            v_quantity, v_price, v_line_subtotal
        );
    end loop;

    update public.pedidos
       set subtotal = v_subtotal,
           total = v_subtotal
     where id = v_order_id;

    return jsonb_build_object(
        'id', v_order_id,
        'order_key', p_order_key,
        'subtotal', v_subtotal,
        'total', v_subtotal,
        'already_created', false
    );
end;
$$;

revoke all on function public.create_pending_order(text, text, text, text, text, text, jsonb)
from public, anon, authenticated;
grant execute on function public.create_pending_order(text, text, text, text, text, text, jsonb)
to anon, authenticated;

create or replace function public.confirm_order_stock(p_order_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_order public.pedidos%rowtype;
    line record;
    v_variant_stock integer;
    v_product_stock integer;
    v_has_variants boolean;
    v_user_id uuid := auth.uid();
    v_snapshot jsonb;
begin
    if v_user_id is null or not public.es_admin() then
        raise exception 'La confirmación requiere permisos de administrador.' using errcode = '42501';
    end if;

    select * into v_order
      from public.pedidos
     where order_key = trim(p_order_key)
     for update;

    if not found then
        raise exception 'El pedido no existe en Supabase.' using errcode = 'P0002';
    end if;
    if v_order.estado = 'confirmado' then
        return jsonb_build_object('confirmed', false, 'already_confirmed', true);
    end if;
    if v_order.estado <> 'pendiente' then
        raise exception 'Solo se pueden confirmar pedidos pendientes.' using errcode = '22023';
    end if;

    select jsonb_agg(jsonb_build_object(
        'product_id', producto_id,
        'variant_id', variante_id,
        'quantity', cantidad
    ) order by id)
      into v_snapshot
      from public.pedido_items
     where pedido_id = v_order.id;

    if v_snapshot is null then
        raise exception 'El pedido no tiene líneas guardadas.' using errcode = '22023';
    end if;

    for line in
        select * from public.pedido_items where pedido_id = v_order.id order by id
    loop
        if line.variante_id is not null then
            select stock into v_variant_stock
              from public.producto_variantes
             where id = line.variante_id
               and producto_id = line.producto_id
             for update;
            if not found then
                raise exception 'La variante del pedido ya no existe.' using errcode = 'P0002';
            end if;
            if v_variant_stock < line.cantidad then
                raise exception 'Stock insuficiente para una variante del pedido.' using errcode = 'P0001';
            end if;
            update public.producto_variantes
               set stock = stock - line.cantidad,
                   updated_at = now()
             where id = line.variante_id;
        else
            select exists (
                select 1 from public.producto_variantes
                 where producto_id = line.producto_id
                   and stock > 0
            ) into v_has_variants;
            if v_has_variants then
                raise exception 'El pedido no tiene una variante para un producto que la requiere.' using errcode = '22023';
            end if;
            select stock into v_product_stock
              from public.productos
             where id = line.producto_id
             for update;
            if not found then
                raise exception 'El producto del pedido ya no existe.' using errcode = 'P0002';
            end if;
            if v_product_stock < line.cantidad then
                raise exception 'Stock insuficiente para un producto del pedido.' using errcode = 'P0001';
            end if;
            update public.productos
               set stock = stock - line.cantidad
             where id = line.producto_id;
        end if;
    end loop;

    update public.pedidos
       set estado = 'confirmado', confirmado_at = now(), confirmado_por = v_user_id,
           actualizado_at = now()
     where id = v_order.id;

    insert into public.pedido_confirmaciones (order_key, items, confirmado_por)
    values (v_order.order_key, v_snapshot, v_user_id)
    on conflict (order_key) do nothing;

    return jsonb_build_object('confirmed', true, 'already_confirmed', false);
end;
$$;

revoke all on function public.confirm_order_stock(text) from public, anon, authenticated;
grant execute on function public.confirm_order_stock(text) to authenticated;

commit;
