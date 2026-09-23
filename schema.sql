-- Esquema para "Gastos de Beni"
-- Ejecutar esto en Supabase: Panel > SQL Editor > New query > pegar y correr (Run)
--
-- No hay login: cualquiera que entre a la página puede cargar, ver y borrar gastos,
-- eligiendo con la pastilla si pagó Abigail o Bruno. El historial queda registrado
-- con fecha y hora para que, ante cualquier duda, se pueda revisar.

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  concepto text not null,
  importe numeric(10,2) not null check (importe > 0),
  pagador text not null check (pagador in ('Abigail', 'Bruno')),
  creado_en timestamptz not null default now()
);

alter table public.gastos enable row level security;

-- Acceso abierto (sin login): cualquiera con el link puede ver, cargar y borrar.
create policy "Acceso abierto para ver gastos"
  on public.gastos for select
  to anon
  using (true);

create policy "Acceso abierto para cargar gastos"
  on public.gastos for insert
  to anon
  with check (true);

create policy "Acceso abierto para borrar gastos"
  on public.gastos for delete
  to anon
  using (true);

create index if not exists gastos_fecha_idx on public.gastos (fecha desc);
