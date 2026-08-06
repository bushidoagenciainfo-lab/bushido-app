-- Bushido · bandeja de WhatsApp.
-- Guarda lo que la gente responde por WhatsApp para poder verlo y contestarlo
-- desde el panel (el número está en la Cloud API y no se puede abrir en la app).
-- Ejecutar en Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.wa_mensajes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  wa_id       text not null,                    -- número del contacto, sin "+"
  nombre      text,                             -- nombre de su perfil de WhatsApp
  direccion   text not null,                    -- 'entrante' | 'saliente'
  texto       text,
  tipo        text not null default 'text',     -- text|image|audio|video|document|otro
  message_id  text unique,                      -- id de Meta: evita guardar duplicados
  leido       boolean not null default false
);

-- Conversación de un contacto, lo más nuevo primero
create index if not exists wa_mensajes_contacto_idx
  on public.wa_mensajes (wa_id, created_at desc);
create index if not exists wa_mensajes_fecha_idx
  on public.wa_mensajes (created_at desc);
create index if not exists wa_mensajes_sin_leer_idx
  on public.wa_mensajes (leido) where leido = false;

-- Solo el servidor (service role) toca esta tabla.
alter table public.wa_mensajes enable row level security;
