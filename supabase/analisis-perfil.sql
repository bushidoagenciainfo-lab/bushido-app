-- Bushido · migración del informe (septiembre 2026)
-- Ejecuta esto UNA vez en Supabase → SQL Editor.

-- 1) Qué tipo de lead es, en qué etapa está la marca y qué fuentes se pudieron
--    leer al escribir el informe (Instagram, web, TikTok, sector). Sin esta
--    columna el sitio sigue funcionando: guarda el informe sin este dato.
alter table public.analisis add column if not exists perfil jsonb;

-- 2) (RECOMENDADO) Los informes anteriores al 14-sep se generaron en modo
--    "completo": el prospecto que abre hoy su link ve paquetes y precios del
--    catálogo viejo ("Paquete de redes · Crecimiento $3.200.000", etc.) y, en
--    muchos, observaciones de su perfil que el sistema nunca vio. Pasarlos a
--    "abrebocas" esconde el paquete y deja solo la lectura corta. Tú con la
--    sesión del panel los sigues viendo completos en el mismo link.
update public.analisis
set modo = 'abrebocas'
where coalesce(modo, 'completo') = 'completo'
  and created_at < '2026-09-21';

-- Para revisar después cómo están saliendo los informes nuevos:
--   select created_at, marca, perfil->>'tipo' as tipo, perfil->>'etapa' as etapa,
--          perfil->'fuentes'->>'instagram' as instagram, perfil->'fuentes'->>'web' as web,
--          con_datos_reales, paquete->>'nombre' as paquete
--   from analisis order by created_at desc limit 20;
