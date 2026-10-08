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

Requires Node.js 20 or newer. From this repository, run:

```sh
npm start
```

Open `http://localhost:3000`. To choose a port, run `npm start -- --port 8000`.

## Download through npm

Once version 1.0.0 is published to the npm registry, preview it with:

```sh
npx urban-detail-co
```

Or install it into a project:

```sh
npm install urban-detail-co
npx urban-detail-co
```

To copy the website files into a new directory for editing or hosting:

```sh
npx urban-detail-co export my-website
```

The destination must not already exist. The preview listens on localhost only;
use the exported files with your hosting provider for a public website.
The package has no Node dependencies; browser CDN dependencies still require internet access.
The exported website uses the original business's Supabase configuration. Before
using it for another business, replace that configuration with your own project.

## Package and publish

See [DEPLOYMENT.md](DEPLOYMENT.md) for npm publishing, GitHub Pages setup,
other static hosting options, and a post-deployment checklist. The repository
includes `.github/workflows/deploy-pages.yml` for GitHub Pages deployments.

Create a downloadable archive without publishing:

```sh
npm test
npm pack
```

The result is `urban-detail-co-1.0.0.tgz`. It can be installed directly:

```sh
npm install /path/to/urban-detail-co-1.0.0.tgz
```

To publish under your npm account:

```sh
npm login
npm publish
```

The package name must be available. If it is already owned by someone else,
change `name` in `package.json` to `@YOUR_NPM_USERNAME/urban-detail-co`, and use
that scoped name in install and npx commands. Publishing runs the tests first.
Later releases need a new version, for example `npm version patch` before publishing.
The package is marked `UNLICENSED`; no open-source reuse license is granted.

## Alternative static preview

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

