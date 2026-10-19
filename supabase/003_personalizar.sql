-- Personalización de la celebración: foto de portada y color.
-- Pegar en Supabase > SQL Editor > New query > Run.

alter table celebraciones add column if not exists portada text;
alter table celebraciones add column if not exists tema text not null default 'azul';
alter table celebraciones drop constraint if exists celebraciones_tema_check;
alter table celebraciones add constraint celebraciones_tema_check
  check (tema in ('azul','mostaza','terracota','bosque','rosa','celeste','lila'));
