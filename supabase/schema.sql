create table parties (
  id         uuid    primary key default gen_random_uuid(),
  party_name text    not null,
  aliases    text[]  not null default '{}',
  zip_code   text    not null,
  max_guests integer not null default 1
);

create table rsvps (
  id              uuid        primary key default gen_random_uuid(),
  party_id        uuid        not null unique references parties(id) on delete cascade,
  attending_count integer,
  dietary_notes   text,
  notes           text,
  email           text,
  submitted_at    timestamptz default now()
);

-- Row Level Security
alter table parties enable row level security;
alter table rsvps   enable row level security;

-- parties: public read
create policy "public select on parties"
  on parties for select using (true);

-- rsvps: public read, insert, update
create policy "public select on rsvps"
  on rsvps for select using (true);

create policy "public insert on rsvps"
  on rsvps for insert with check (true);

create policy "public update on rsvps"
  on rsvps for update using (true);

-- Grant table-level access to the anon role
grant select on public.parties to anon;
grant select, insert, update on public.rsvps to anon;
