## Why

I want a tiny, free, single-purpose app that lets me "ping" a friend remotely and see their "pong" in real time — a cute way to nudge someone (hello kitty / kawaii emoji) without sending a text. It should be as simple as possible to build, host for free, and be fun for a personal pet project.

## What Changes

- Introduce a client-only realtime app (no custom backend) hosted on Vercel.
- Add **connection** capability: match two people either by a shared session code (reusable, not single-use) or by proximity within a chosen radius (geohash cell), with presence showing who is currently in the session and an optional nickname.
- Add **ping** capability: tapping the ping canvas sends a "ping" (a cute emoji) via pub/sub broadcast; receivers see it as a floating kawaii animation and send an automatic "pong" delivery acknowledgement back.
- Pings are ephemeral (no persistence) for the MVP; identity is anonymous (client-generated UUID + optional nickname).

## Capabilities

### New Capabilities
- `connection`: Establish a realtime session between people via shared session code or radius (geohash) matching, including presence, connection status, and identity (optional nickname).
- `ping`: Send and receive pings and pongs in real time, rendered as floating kawaii emoji animations.

### Modified Capabilities
<!-- None — this is a greenfield project with no existing specs. -->

## Impact

- **New code**: Vite + React + TypeScript frontend with Tailwind CSS and shadcn/ui components; Supabase Realtime (broadcast + presence) via `@supabase/supabase-js`; `ngeohash` for radius matching; `framer-motion` for animations.
- **Config**: Vite `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars (local `.env.local`, committed `.env.example` template, and Vercel).
- **No backend, no database writes** — Supabase is used only for Realtime channels.
- **Deployment**: Vercel (free tier), no server.
