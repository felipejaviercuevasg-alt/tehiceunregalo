-- Te hice un regalo · esquema de base de datos
-- Pégalo completo en Supabase > SQL Editor > New query y presiona "Run".

create extension if not exists pgcrypto;

create table if not exists celebraciones (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_email text not null,
  nombre text not null check (char_length(nombre) between 1 and 80),
  ocasion text not null check (ocasion in ('cumpleanos','matrimonio','baby-shower')),
  edad int check (edad between 0 and 130),
  fecha date,
  mensaje text check (char_length(mensaje) <= 400),
  banco_cifrado text not null,
  banco_resumen text not null,
  estado text not null default 'activa' check (estado in ('activa','cerrada')),
  transferido_at timestamptz,
  transferido_monto int,
  created_at timestamptz not null default now()
);

create table if not exists regalos (
  id uuid primary key default gen_random_uuid(),
  celebracion_id uuid not null references celebraciones(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  descripcion text check (char_length(descripcion) <= 160),
  link text check (char_length(link) <= 500),
  foto text,
  meta int not null check (meta between 1000 and 100000000),
  orden int not null default 0
);

create table if not exists deseos (
  id uuid primary key default gen_random_uuid(),
  celebracion_id uuid not null references celebraciones(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 140),
  descripcion text check (char_length(descripcion) <= 300),
  orden int not null default 0
);

create table if not exists aportes (
  id uuid primary key default gen_random_uuid(),
  celebracion_id uuid not null references celebraciones(id) on delete cascade,
  regalo_id uuid references regalos(id) on delete set null,
  deseo_id uuid references deseos(id) on delete set null,
  nombre text not null check (char_length(nombre) between 1 and 60),
  mensaje text check (char_length(mensaje) <= 280),
  monto int not null check (monto >= 1000),
  porcentaje int check (porcentaje between 1 and 100),
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  mp_payment_id text,
  created_at timestamptz not null default now(),
  aprobado_at timestamptz
);

create index if not exists aportes_celebracion_idx on aportes (celebracion_id, estado);
create index if not exists regalos_celebracion_idx on regalos (celebracion_id);
create index if not exists deseos_celebracion_idx on deseos (celebracion_id);
create index if not exists celebraciones_owner_idx on celebraciones (owner_id);

-- Seguridad: nadie accede directo desde el navegador.
-- Todo pasa por el servidor de la web, que usa la clave de servicio.
alter table celebraciones enable row level security;
alter table regalos enable row level security;
alter table deseos enable row level security;
alter table aportes enable row level security;
