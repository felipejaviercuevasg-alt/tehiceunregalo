-- Transferencias al festejado (semanales y pago final).
-- Pegar en Supabase > SQL Editor > New query > Run.

create table if not exists transferencias (
  id uuid primary key default gen_random_uuid(),
  celebracion_id uuid not null references celebraciones(id) on delete cascade,
  monto int not null check (monto > 0),
  comision int not null default 0 check (comision >= 0),
  final boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists transferencias_celebracion_idx on transferencias (celebracion_id, created_at);
alter table transferencias enable row level security;
