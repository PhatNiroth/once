-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (mirrors auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Events
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null default 'party',
  date date not null,
  shot_limit int not null default 10,
  guest_count int not null default 20,
  reveal_at timestamptz,
  revealed boolean default false,
  paid boolean default false,
  join_code text unique not null,
  created_at timestamptz default now()
);
alter table public.events enable row level security;
create policy "Hosts manage own events" on public.events for all using (auth.uid() = host_id);
create policy "Anyone can read events by join code" on public.events for select using (true);

-- Guests
create table public.guests (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  shots_taken int default 0,
  created_at timestamptz default now()
);
alter table public.guests enable row level security;
create policy "Anyone can insert guests" on public.guests for insert with check (true);
create policy "Anyone can read guests" on public.guests for select using (true);
create policy "Guests can update own record" on public.guests for update using (true);

-- Photos
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  guest_id uuid references public.guests(id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz default now()
);
alter table public.photos enable row level security;
create policy "Anyone can insert photos" on public.photos for insert with check (true);
create policy "Anyone can read photos for revealed events" on public.photos for select using (
  exists (
    select 1 from public.events e
    where e.id = event_id and (e.revealed = true or e.host_id = auth.uid())
  )
);

-- Storage bucket for photos
insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', false);
create policy "Anyone can upload photos" on storage.objects for insert with check (bucket_id = 'event-photos');
create policy "Anyone can read revealed event photos" on storage.objects for select using (bucket_id = 'event-photos');

-- Function to auto-reveal events past their reveal_at time
create or replace function public.auto_reveal_events()
returns void language plpgsql as $$
begin
  update public.events
  set revealed = true
  where reveal_at is not null
    and reveal_at <= now()
    and revealed = false
    and paid = true;
end;
$$;

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
