-- Bushido · tabla de EVENTOS de interés (analítica propia).
-- Registra qué mira/toca la gente: CTAs, servicios abiertos, obras del portafolio,
-- vistas de página. Alimenta el panel admin y tu dataset de "qué mueve a la gente".
-- Ejecuta en Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null,   -- 'pageview' | 'cta' | 'servicio' | 'portafolio' | 'equipo' | ...
  name        text,            -- ej: nombre del servicio / obra / cta
  path        text,            -- ruta donde ocurrió
  ref         text,            -- referrer (de dónde llegó)
  meta        jsonb
);

create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_type_idx    on public.events (type);
create index if not exists events_name_idx     on public.events (name);

alter table public.events enable row level security; -- solo service_role escribe/lee

-- ── Consultas útiles para el panel / tu app ──
-- Qué servicios miran más:
--   select name, count(*) from events where type='servicio' group by 1 order by 2 desc;
-- CTAs más clickeados:
--   select name, count(*) from events where type='cta' group by 1 order by 2 desc;
-- Páginas más vistas (últimos 7 días):
--   select path, count(*) from events where type='pageview' and created_at > now()-interval '7 days' group by 1 order by 2 desc;
