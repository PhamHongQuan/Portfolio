-- Portfolio content store. Run once in the Supabase SQL editor, then run seed.sql.
-- Replace admin@example.com with the email of the admin account (Supabase Auth).

create table if not exists public.site_content (
  key text primary key check (key in ('en', 'vi', 'profile', 'settings')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "public read" on public.site_content;
create policy "public read" on public.site_content for select using (true);

drop policy if exists "admin write" on public.site_content;
create policy "admin write" on public.site_content for all to authenticated
  using (auth.jwt() ->> 'email' = 'admin@example.com')
  with check (auth.jwt() ->> 'email' = 'admin@example.com');

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

-- Images and files (project shots, CV PDF...). Public read, admin write.
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true)
  on conflict (id) do nothing;

drop policy if exists "portfolio admin write" on storage.objects;
create policy "portfolio admin write" on storage.objects for all to authenticated
  using (bucket_id = 'portfolio' and auth.jwt() ->> 'email' = 'admin@example.com')
  with check (bucket_id = 'portfolio' and auth.jwt() ->> 'email' = 'admin@example.com');
