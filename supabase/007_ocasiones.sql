-- Nuevas ocasiones: home shower, graduación y ocasión especial.
alter table celebraciones drop constraint if exists celebraciones_ocasion_check;
alter table celebraciones add constraint celebraciones_ocasion_check
  check (ocasion in ('cumpleanos','matrimonio','baby-shower','home-shower','graduacion','especial'));
