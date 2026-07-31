\set ON_ERROR_STOP on

insert into public.profiles (id, nombre, email, global_role, mfa_required)
values (
  :'admin_user_id'::uuid,
  :'admin_name',
  :'admin_email',
  'super_admin',
  false
)
on conflict (id) do update
set nombre = excluded.nombre,
    email = excluded.email,
    global_role = 'super_admin',
    updated_at = now();

insert into public.tenants (
  nombre,
  email,
  owner_user_id,
  plan,
  billing_status,
  max_instalaciones,
  max_activos,
  max_storage_mb
)
select
  'IsiVoltPro Activos',
  :'admin_email',
  :'admin_user_id'::uuid,
  'empresa',
  'active',
  1000,
  100000,
  102400
where not exists (
  select 1
  from public.tenants
  where nombre = 'IsiVoltPro Activos'
    and deleted_at is null
);

insert into public.tenant_members (tenant_id, user_id, role, estado)
select
  tenant.id,
  :'admin_user_id'::uuid,
  'admin_cliente',
  'activo'
from public.tenants tenant
where tenant.nombre = 'IsiVoltPro Activos'
  and tenant.deleted_at is null
order by tenant.created_at asc
limit 1
on conflict (tenant_id, user_id) do update
set role = 'admin_cliente',
    estado = 'activo',
    updated_at = now();
