-- Bushido · BOOK DE CREADORES (UGC / influencers)
-- Banco propio de creadores para armar castings por nicho, formato y audiencia.
-- Distinto del banco de crew audiovisual (esos van en `leads` con kind 'talento').
-- Ejecuta en Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.creadores (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  -- contacto
  nombre        text not null,
  email         text,
  telefono      text,
  ciudad        text,
  -- perfil
  nichos        text[],        -- ej: {Gastronomía, Fitness} → casting por nicho
  formatos      text[],        -- ej: {UGC sin rostro, Talking head, Unboxing}
  instagram     text,
  tiktok        text,
  youtube       text,
  seguidores    integer,       -- alcance aproximado (el mayor de sus redes)
  tarifa        text,          -- rango que cobra por pieza/colaboración
  notas         text,          -- lo que quiera contarnos
  portafolio    text,          -- link a ejemplos
  -- gestión interna
  estado        text not null default 'nuevo',  -- nuevo|aprobado|destacado|pausado
  rating        smallint,      -- 1-5, qué tan bien nos ha funcionado
  meta          jsonb
);

create index if not exists creadores_created_idx  on public.creadores (created_at desc);
create index if not exists creadores_estado_idx   on public.creadores (estado);
create index if not exists creadores_nichos_idx   on public.creadores using gin (nichos);
create index if not exists creadores_formatos_idx on public.creadores using gin (formatos);

alter table public.creadores enable row level security; -- solo service_role

-- ── Consultas para armar un casting ──
-- Creadores de gastronomía aprobados:
--   select nombre, instagram, seguidores, tarifa from creadores
--   where 'Gastronomía' = any(nichos) and estado in ('aprobado','destacado')
--   order by rating desc nulls last;
-- Quién hace UGC sin rostro:
--   select * from creadores where 'UGC sin rostro' = any(formatos);
