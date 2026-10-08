-- Urban Detail Co. security hardening for public.bookings
-- Run this in the Supabase SQL Editor AFTER creating the admin user in Supabase Auth.
--
-- IMPORTANT:
-- 1. Replace ADMIN_USER_UUID below with the Auth user's UUID.
-- 2. Never put a service_role/secret key in the HTML.
-- 3. The browser's anon/publishable key is not an admin credential; RLS is the
--    authoritative authorization boundary.

begin;

-- Ensure the exposed table is protected.
alter table public.bookings enable row level security;

-- Least-privilege Data API grants.
revoke all on table public.bookings from anon, authenticated;
grant insert on table public.bookings to anon, authenticated;
grant select, update, delete on table public.bookings to authenticated;

-- Remove old policies if this project already has them.
drop policy if exists "public can insert bookings" on public.bookings;
drop policy if exists "anon can create pending bookings" on public.bookings;
drop policy if exists "admins can read bookings" on public.bookings;
drop policy if exists "admins can update bookings" on public.bookings;
drop policy if exists "admins can delete bookings" on public.bookings;

-- Anonymous visitors may ONLY create a pending booking that matches one of
-- the site's advertised packages. They cannot read, edit, or delete bookings.
create policy "anon can create pending bookings"
on public.bookings
for insert
to anon
with check (
    status = 'Pending'
    and price in (50, 60, 100)
    and (
        ("serviceTitle" = 'Exterior Wash ($50)' and price = 50)
        or ("serviceTitle" = 'Interior Cleaning ($60)' and price = 60)
        or ("serviceTitle" = 'Full Detail Package ($100)' and price = 100)
    )
    and length(trim(name)) between 2 and 100
    and length(trim(phone)) between 7 and 30
    and length(trim(vehicle)) between 2 and 120
    and date >= current_date
    and "createdAt" between (extract(epoch from now()) * 1000 - 300000)
                             and (extract(epoch from now()) * 1000 + 300000)
);

-- Authenticated non-admin users get the same narrow booking-creation path.
create policy "authenticated users can create pending bookings"
on public.bookings
for insert
to authenticated
with check (
    status = 'Pending'
    and price in (50, 60, 100)
    and (
        ("serviceTitle" = 'Exterior Wash ($50)' and price = 50)
        or ("serviceTitle" = 'Interior Cleaning ($60)' and price = 60)
        or ("serviceTitle" = 'Full Detail Package ($100)' and price = 100)
    )
    and length(trim(name)) between 2 and 100
    and length(trim(phone)) between 7 and 30
    and length(trim(vehicle)) between 2 and 120
    and date >= current_date
    and "createdAt" between (extract(epoch from now()) * 1000 - 300000)
                             and (extract(epoch from now()) * 1000 + 300000)
);

-- Admin authorization uses raw_app_meta_data, which end users cannot edit.
-- Do NOT use user_metadata for authorization.
create policy "admins can read bookings"
on public.bookings
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins can update bookings"
on public.bookings
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and status in ('Pending', 'Confirmed')
);

create policy "admins can delete bookings"
on public.bookings
for delete
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Optional but recommended database-level constraints. These are deliberately
-- narrow and match the current site's allowed values.
do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'bookings_status_allowed'
          and conrelid = 'public.bookings'::regclass
    ) then
        alter table public.bookings
            add constraint bookings_status_allowed
            check (status in ('Pending', 'Confirmed'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'bookings_price_allowed'
          and conrelid = 'public.bookings'::regclass
    ) then
        alter table public.bookings
            add constraint bookings_price_allowed
            check (price in (50, 60, 100));
    end if;
end $$;

-- Assign the admin role to the Auth user.
-- Replace the UUID before running this statement.
-- update auth.users
-- set raw_app_meta_data =
--     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where id = 'REPLACE_WITH_ADMIN_USER_UUID';

commit;

-- Security notes:
-- * Do not create a SELECT policy for anon.
-- * Do not grant anon UPDATE/DELETE.
-- * Do not expose service_role/secret keys to the browser.
-- * After changing app_metadata, sign out/in (or refresh the JWT) so the new
--   claim is present in the admin session.
