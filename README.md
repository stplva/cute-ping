# cute-ping 🎀

Ping your favorite people with tiny bursts of cuteness 💌 — tap anywhere to fling a kawaii emoji their way, watch the pongs roll in, and befriend the wandering kittens that show up to cheer you on.

## Features

- 🔗 **Code matching** — share a session code and ping a friend anywhere.
- 📍 **Nearby matching** — find everyone within ~150m or ~1km using geohash cells.
- 💌 **Realtime ping/pong** — tap to broadcast a kawaii emoji; "sent to N" is derived from live presence.
- 🐱 **Gamification** — kittens reveal one-by-one as you tap (up to 12, with sparkles), and wander around on their own when you stop.

## Tech stack

- React 19 · TypeScript · Vite
- Tailwind CSS 4 · shadcn/ui
- Supabase Realtime (broadcast + presence)
- ngeohash · framer-motion · Vitest

No backend, no database — pings are ephemeral and Supabase is used purely for pub/sub + presence.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

The anon/publishable key is safe to expose in the browser. Never use the `service_role` key client-side.

## Deploying to Vercel

1. Import the repo (or run `vercel`).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production/Preview/Development.
3. Deploy — the build command is `npm run build` and the output directory is `dist`.
