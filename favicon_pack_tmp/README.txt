Window Maintenance — Favicon Pack
=================================

Files:
- favicon.ico (16, 32, 48)
- favicon-16.png, favicon-32.png, favicon-48.png, favicon-64.png, favicon-128.png, favicon-180.png (Apple touch), favicon-192.png, favicon-256.png, favicon-384.png, favicon-512.png
- site.webmanifest

Quick install (cPanel or any static host)
-----------------------------------------
1) Upload all files to your site root (e.g., /public_html/ or the root of your Astro project's /public folder).
   • If using Astro: place them under /public/icons (recommended) or directly /public.

2) Add these tags inside <head> on every page (or in your Astro layout):

<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png">
<link rel="shortcut icon" href="/icons/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon-180.png">
<link rel="manifest" href="/icons/site.webmanifest">
<meta name="theme-color" content="#0B132B">

Astro tip:
----------
Put the files into `public/icons/` and the links above will work without further build steps.