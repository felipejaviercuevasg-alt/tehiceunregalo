-- Redes sociales del festejado: { instagram: "https://...", tiktok: "...", ... }
alter table celebraciones add column if not exists redes jsonb not null default '{}'::jsonb;
