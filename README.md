# Urban Detail Co. Website

A responsive, single-page web experience for an auto-detailing business. It combines service information, transparent package pricing, appointment requests, and an authenticated booking console in one static website.

## Features

- Mobile-friendly home, services and pricing, ceramic care, vehicle preparation, booking, FAQ, and admin views
- Flat-rate service packages: $50 exterior wash, $60 interior cleaning, and $100 full detail
- Booking requests stored in Supabase
- Admin booking management using Supabase Auth and role-based row-level security
- Optional browser push notifications, backed by a service worker
- Dark visual design with cyan accents, responsive layouts, and accessible form labels and dialogs

## Project files

- `index.html` — website markup, styling, navigation, and client-side application logic
- `sw.js` — service worker for push notification display and click handling
- `security-hardening.sql` — example least-privilege policies and constraints for the existing `public.bookings` table

## Run locally

This is a static site and has no build step. Serve the repository root over HTTP, then open it in a browser. For example, with Python installed:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. Use HTTPS when deploying; service workers and push notifications require a secure context (localhost is suitable for local development).

The page loads Tailwind CSS, Supabase JS, Font Awesome, and Google Fonts from external CDNs, so those features need an internet connection.

## Supabase setup

The page is wired to a Supabase project using its browser-safe URL and anon/publishable key. These values are client-side configuration, not admin credentials. Never put a Supabase service-role/secret key in browser code or commit one to this repository.

To connect a different Supabase project, update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `index.html`, create the `bookings` table with the columns used by the form, configure Supabase Auth for the admin account, and apply suitable row-level security. The SQL file here is an optional hardening example for an existing table; review it against your schema and policies before running it. It expects an admin role in the user's trusted `app_metadata`.

Push subscription controls are present in the admin view. Browser push also needs a service worker, HTTPS, a VAPID key pair, and server-side delivery logic. Keep the VAPID private key on the server; only a public VAPID key belongs in the browser.

## Security notes

- The browser anon key is intentionally used for public client requests; row-level security must enforce all access rules.
- Admin access is intended to use Supabase Auth and trusted app metadata. A hidden admin view by itself is not an authorization boundary.
- Booking submissions contain customer contact details. Restrict database access and protect the Supabase project accordingly.
- Do not commit service-role keys, admin passwords, private VAPID keys, or real customer records.

