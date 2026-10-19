-- Encuadre de la foto de portada (posición del fondo, ej: "68% 26%").
alter table celebraciones add column if not exists portada_pos text not null default '50% 50%';
