# YOUR_PROJECT_NAME

> YOUR_PROJECT_DESCRIPTION

A full-featured e-commerce storefront and admin dashboard built with Next.js (App Router), React, Tailwind CSS, and Supabase.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on the port defined in `package.json` (default `3009`).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your own values:

```bash
cp .env.example .env.local
```

See `.env.example` for the full list of required and optional variables.

## Creating an Admin User

```bash
npm run create-admin
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` first (defaults are placeholders only).

## Database

Database schema and migrations live in `supabase/`. See `supabase/README.md` for setup instructions.

## Customization

This codebase ships with neutral placeholders. Complete the steps in `CUSTOMIZE.md` to make it fully yours, and replace the brand assets listed in `public/ASSETS_GUIDE.md`.

## Deployment

YOUR_DEPLOYMENT_INSTRUCTIONS

## License

See `LICENSE`.
