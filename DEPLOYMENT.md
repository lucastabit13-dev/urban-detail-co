# Publishing and deployment

npm distributes the downloadable website package. GitHub Pages hosts the public
website visitors open in their browser. They can be released independently.

## Published npm package

`urban-detail-co@1.0.0` is published on npm and currently carries the `latest`
tag. Install it into a project and run its local preview with:

```sh
npm install urban-detail-co
npx urban-detail-co
```

Or run the published command without adding it to a project:

```sh
npx --yes urban-detail-co@1.0.0
```

To export the website files to a new directory, run:

```sh
npx urban-detail-co export my-website
```

## Publish a future release

1. Install Node.js 20 or newer and edit the project files.
2. Run `npm test` and `npm pack --dry-run` to check the package contents and CLI.
3. Run `npm version patch` to increment the version and create a Git tag.
4. Push the commit and tag with `git push origin main --follow-tags`.
5. Run `npm publish` and complete any npm two-factor verification.
6. Confirm the release with `npm view urban-detail-co version` and
   `npx --yes urban-detail-co@VERSION --help`.

Publishing runs the package tests first. Each published version is permanent; use
`npm version minor` or `npm version major` for larger changes. Never add npm
credentials or tokens to this repository.

To share an archive without publishing, run `npm pack` and install its generated
`.tgz` file with `npm install ./urban-detail-co-X.Y.Z.tgz`.

## Deploy on GitHub Pages

The included `.github/workflows/deploy-pages.yml` publishes just `index.html`
and `sw.js`, leaving SQL and development files out of the website artifact.

1. Push the repository to GitHub's `main` branch.
2. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
3. Go to **Actions → Deploy website to GitHub Pages** and run the workflow on
   `main`. Later changes to `index.html` or `sw.js` on `main` deploy automatically.
4. Wait for the workflow to succeed and open the deployment URL shown in its
   summary. For this repository, it should be
   `https://lucastabit13-dev.github.io/urban-detail-co/`.

If deployment fails, confirm Pages is set to GitHub Actions and the repository's
`github-pages` environment allows deployment from `main`.

## Deploy to a different static host

Run `npx urban-detail-co export my-website` after publishing the npm package, or
copy `index.html` and `sw.js` from this repository. Upload both files to the
host's public directory. There is no build step. Use HTTPS and keep the service
worker alongside the page. The Node preview command is for local use.

## Verify after deployment

- Check the home page, navigation, and mobile layout.
- Confirm `sw.js` is reachable next to the page, including from the project URL.
- Test a booking and confirm it appears for an authorized admin.
- Check admin sign-in and sign-out. If authentication redirects back to the site,
  add the deployed URL to the Supabase Auth Site URL and allowed redirect URLs.
- Review database row-level security before accepting customer bookings. The
  optional SQL file expects an existing table and must be checked against its schema.
- Push notifications require VAPID setup and server-side delivery in addition to
  HTTPS; static hosting alone does not provide these.

The site uses the business's current Supabase URL and browser-safe public anon
key. Configure a separate backend before adapting it for another business.

References: [npm publishing](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
and [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
