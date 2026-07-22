-- Bushido · tabla de ANÁLISIS (7 maletas) — la base de tu data de clientes.
-- Ejecuta en Supabase → SQL Editor (después de schema.sql).

create extension if not exists "pgcrypto";

create table if not exists public.analisis (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  lead_id       uuid references public.leads(id) on delete set null,
  -- cliente
  marca         text not null,
  nicho         text,                 -- ej: "Repostería · gastronomía"  (para agrupar por nicho)
  redes         text,
  web           text,
  -- diagnóstico
  resumen       text,
  fortalezas    jsonb,                -- string[]
  carencias     jsonb,                -- string[]
  oportunidades jsonb,                -- string[]
  -- quién compra
  buyer_persona jsonb,                -- { nombre, descripcion, jtbd[] }
  -- 7 maletas + emociones
  maletas       jsonb,                -- { nombre, insight }[]
  emociones     text[],               -- de la taxonomía fija → consultable y comparable
  -- propuesta
  propuesta     text,
  paquete       jsonb,                -- { nombre, precio, porque }
  -- pipeline
  estado        text not null default 'analizado',  -- nuevo|analizado|enviado|seguimiento|cerrado
  report_url    text
);

create index if not exists analisis_created_idx on public.analisis (created_at desc);
create index if not exists analisis_nicho_idx   on public.analisis (nicho);
create index if not exists analisis_estado_idx  on public.analisis (estado);
-- índice GIN para consultar por emoción rápido
create index if not exists analisis_emociones_idx on public.analisis using gin (emociones);

alter table public.analisis enable row level security; -- solo service_role escribe/lee

-- ─────────────────────────────────────────────────────────────
-- EJEMPLOS DE CONSULTAS PARA TU DATA (cuando tengas varios análisis):
-- ─────────────────────────────────────────────────────────────
-- ¿Qué emociones se repiten en gastronomía?
--   select unnest(emociones) as emocion, count(*)
--   from analisis where nicho ilike '%gastronom%'
--   group by 1 order by 2 desc;
--
-- ¿Qué carencias aparecen más en un nicho? (fortalezas/carencias son jsonb array)
--   select c.value as carencia, count(*)
--   from analisis, jsonb_array_elements_text(carencias) c
--   where nicho ilike '%gastronom%' group by 1 order by 2 desc;
--
-- Marcas por emoción dominante:
--   select marca, emociones from analisis where 'Deseo' = any(emociones);
