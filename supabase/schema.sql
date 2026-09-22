-- ==============================================================================
-- AL KABEER H MART - SUPABASE POSTGRESQL SCHEMA
-- Run this in your Supabase Project: Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role text not null default 'customer',
  avatar_url text,
  addresses jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

-- Auto-create profile on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  bengali_name text,
  hindi_name text,
  short_desc text,
  tagline text,
  image text,
  icon_name text default 'ShoppingBag',
  banner_gradient text,
  archived boolean default false,
  subcategories jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text,
  category text references public.categories(slug) on delete set null,
  price numeric not null default 0,
  old_price numeric,
  stock integer not null default 0,
  weight text,
  description text,
  images jsonb default '[]'::jsonb,
  price_pending boolean default false,
  archived boolean default false,
  revision text,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_stock on public.products(stock);

-- ------------------------------------------------------------------------------
-- 4. ORDERS
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  request_key text unique,
  status text not null default 'Processing',
  items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  customer jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  payment jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ------------------------------------------------------------------------------
-- 5. REVIEWS
-- ------------------------------------------------------------------------------
create table if not exists public.reviews (
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null default 'Customer',
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now()),
  primary key (product_id, user_id)
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- ------------------------------------------------------------------------------
-- 6. STORE SETTINGS
-- ------------------------------------------------------------------------------
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  delivery_fee numeric default 10,
  minimum_order numeric default 0,
  service_pincodes jsonb default '["712701"]'::jsonb,
  accepting_orders boolean default true,
  store_details jsonb default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now())
);

-- Insert default settings row if missing
insert into public.store_settings (id, delivery_fee, minimum_order, service_pincodes, accepting_orders)
values (1, 10, 0, '["712701"]'::jsonb, true)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

-- Profiles: Anyone can view names, user can edit own profile, service_role has full access
drop policy if exists "Public profiles view" on public.profiles;
create policy "Public profiles view" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories & Products & Store Settings: Public read access
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select using (true);

-- Reviews: Public read, logged-in customer insert/update their own
drop policy if exists "Public read reviews" on public.reviews;
create policy "Public read reviews" on public.reviews for select using (true);

drop policy if exists "Users manage own reviews" on public.reviews;
create policy "Users manage own reviews" on public.reviews for all using (auth.uid() = user_id);

-- Orders: Customers can view their own orders; admin/service_role manages all
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders" on public.orders for insert with check (auth.uid() = user_id or auth.uid() is null);

-- Service role bypasses RLS automatically for backend Node operations
