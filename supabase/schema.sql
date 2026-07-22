-- Bushido · esquema de la base de datos (Supabase / Postgres)
-- Ejecuta esto en Supabase → SQL Editor una vez creado el proyecto.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('analisis','contacto','talento','descarga','rental')),
  name        text,
  company     text,
  email       text,
  phone       text,
  social      text,
  web         text,
  role        text,
  portfolio   text,
  behance     text,
  reel        text,
  links       text,
  project     text,
  message     text,
  pack        text,
  meta        jsonb,
  status      text not null default 'nuevo'   -- nuevo | contactado | propuesta | ganado | perdido
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_kind_idx on public.leads (kind);
create index if not exists leads_status_idx on public.leads (status);

-- Seguridad: la tabla queda cerrada al público.
-- El sitio escribe SOLO desde el servidor (route handler) con la SERVICE ROLE key,
-- que salta RLS. Nadie puede leer/escribir con la anon key.
alter table public.leads enable row level security;
-- (sin políticas = nadie con anon/authenticated puede tocarla; solo service_role)
