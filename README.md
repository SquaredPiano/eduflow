This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project structure

The repository is organized with a clear separation of concerns (routes, components, domain, services, adapters, etc.). Key folders:

```
src/
	app/
		api/
			ingest/route.ts
			transcribe/route.ts
			generate/route.ts
			export/route.ts
			canvas-sync/route.ts
		dashboard/page.tsx
		auth/
			callback/route.ts
			layout.tsx
	components/
		ui/
		dashboard/
		agents/
		canvas/
		exports/
	hooks/
	lib/
	domain/
		interfaces/
		entities/
		types/
	services/
	adapters/
	workers/
	providers/
	styles/
	types/
public/
	icons/
	images/
.env.local.example
```

Notes:
- We kept `next.config.ts` (TypeScript) instead of `next.config.js` to match the current project setup. We can switch if needed.
- All new routes and modules are lightweight stubs so the app remains buildable; wire integrations incrementally.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your secrets.

```
cp .env.local.example .env.local
```

Common keys:
- Auth0: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_REDIRECT_URI
- Gemini: GEMINI_API_KEY
- ElevenLabs: ELEVENLABS_API_KEY
- Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Uploads: UPLOADTHING_SECRET, UPLOADTHING_APP_ID
- Canvas: CANVAS_BASE_URL, CANVAS_API_TOKEN
- Public: NEXT_PUBLIC_APP_NAME
