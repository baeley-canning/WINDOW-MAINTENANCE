# Window Maintenance

This is a static site built with Astro + Tailwind.

## Local development

- Node.js 18+ required
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build static site: `npm run build` (outputs to `dist/`)

## Deploying to cPanel (MyHost)

This site is fully static. You only need the contents of `dist/`.

1) Build locally
- Run `npm install` then `npm run build`.
- Confirm `dist/` contains `index.html`, subfolders, and assets.

2) Upload to cPanel
- In the File Manager, open the document root for `windowmaintenance.co.nz` (usually `public_html`).
- Upload the CONTENTS of `dist/` into that folder (not the folder itself).
- Ensure `.htaccess` is present after upload (it comes from `public/.htaccess` and handles redirects).

3) Clean up conflicts
- If you had a previous site (WordPress, etc.), remove or rename its old `.htaccess` to avoid conflicts. Keep only this site’s `.htaccess`.
- Do not upload `node_modules/`, source files, or build config — only the built assets from `dist/`.

Troubleshooting a 500 error
- Most 500s on static sites come from a conflicting `.htaccess` directive. Replace it with the minimal one shipped in `public/.htaccess`.
- Check cPanel → Metrics → Errors for the exact directive causing the failure.

## GitHub Pages (optional)

This repo includes `public/CNAME` and can be adapted for GitHub Pages. Use a GitHub Actions workflow to build and publish `dist/` to Pages if desired.

