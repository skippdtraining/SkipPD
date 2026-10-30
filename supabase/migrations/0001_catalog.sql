-- Step 3: database-backed catalog.
--
-- Creates the `categories` and `listings` tables, opens them for public
-- read access through Row Level Security, and keeps a lower-case
-- `search_text` column so catalog search runs inside the database.
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Then run `supabase/seed.sql` to load the six POC courses.

-- Suggested topics shown in the listing form. A listing's topic is free
-- text (trainers can pick "Other"), so listings store the topic name, not a
-- foreign key.
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  sort_order integer not null default 0
);

-- array_to_string() is not marked immutable, so it cannot be used in a
-- generated column directly. This wrapper is safe: same input, same output.
create function public.immutable_array_to_string(items text[], separator text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$ select pg_catalog.array_to_string(items, separator) $$;

-- One training listing in the catalog. Column names map to the app's
-- `Course` type in web/src/lib/data/supabase-course-repository.ts.
create table public.listings (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null,
  trainer_name text not null,
  trainer_role text not null default '',
  format text not null check (format in ('Live online', 'In person')),
  hours numeric(5, 2) not null check (hours > 0),
  price_usd numeric(10, 2) not null check (price_usd >= 0),
  grades text[] not null default '{}'
    check (grades <@ array['K–5', '6–8', '9–12']),
  tags text[] not null default '{}',
  description text not null,
  outcomes text[] not null default '{}',
  cover_color text not null,
  cover_accent text not null,
  cover_type text not null
    check (cover_type in ('books', 'tech', 'language', 'classroom', 'inclusive', 'leadership')),
  -- Lower numbers appear first when the catalog is sorted by "Recommended".
  recommended_rank integer not null default 0,
  -- Unpublished listings stay in the table but are hidden from the site.
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  search_text text generated always as (
    lower(
      title || ' ' || category || ' ' || trainer_name || ' '
        || public.immutable_array_to_string(tags, ' ')
    )
  ) stored
);

create index listings_recommended_idx on public.listings (recommended_rank, id);

-- Public read-only access. Anyone with the publishable key can read
-- categories and published listings; nobody can write through the API.
alter table public.categories enable row level security;
alter table public.listings enable row level security;

grant select on public.categories to anon, authenticated;
grant select on public.listings to anon, authenticated;

create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Published listings are public"
  on public.listings for select
  to anon, authenticated
  using (is_published);
