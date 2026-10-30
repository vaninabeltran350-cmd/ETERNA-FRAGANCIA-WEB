-- ETERNA FRAGANCIA - Configuración pública y persistencia del hero
-- Requiere public.configuracion y public.es_admin() existentes.
-- No sube, reemplaza ni elimina imágenes: solo prepara permisos y la RPC pública.

begin;

alter table public.configuracion enable row level security;

revoke all on table public.configuracion from anon;
revoke all on table public.configuracion from authenticated;
grant select, insert, update on table public.configuracion to authenticated;

drop policy if exists "Public can read store configuration" on public.configuracion;

drop policy if exists "Administrators can read store configuration" on public.configuracion;
create policy "Administrators can read store configuration"
    on public.configuracion
    for select
    to authenticated
    using ((select public.es_admin()));

drop policy if exists "Administrators can insert store configuration" on public.configuracion;
create policy "Administrators can insert store configuration"
    on public.configuracion
    for insert
    to authenticated
    with check ((select public.es_admin()));

drop policy if exists "Administrators can update store configuration" on public.configuracion;
create policy "Administrators can update store configuration"
    on public.configuracion
    for update
    to authenticated
    using ((select public.es_admin()))
    with check ((select public.es_admin()));

create or replace function public.get_public_store_config()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
    select case when c.id is null then null else jsonb_build_object(
        'storeName', c.store_name,
        'storeDescription', c.store_description,
        'storeLogo', c.store_logo,
        'whatsappNumber', c.whatsapp_number,
        'instagramUsername', c.instagram_username,
        'storeAddress', c.store_address,
        'storeHours', c.store_hours,
        'heroEyebrow', c.hero_eyebrow,
        'heroTitle', c.hero_title,
        'heroDescription', c.hero_description,
        'heroImage', c.hero_image_url
    ) end
    from public.configuracion c
    where c.id = 1;
$function$;

revoke all on function public.get_public_store_config() from public, anon, authenticated;
grant execute on function public.get_public_store_config() to anon, authenticated;

commit;
