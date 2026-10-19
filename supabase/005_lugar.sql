-- Hora y lugar de la celebración.
alter table celebraciones add column if not exists hora text;
alter table celebraciones add column if not exists lugar text;
alter table celebraciones add column if not exists direccion text;
alter table celebraciones add column if not exists mapa_link text;
