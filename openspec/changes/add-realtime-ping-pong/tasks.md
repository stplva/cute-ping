## 1. Project Setup

- [ ] 1.1 Scaffold a Vite React + TypeScript app in the repo root and verify `npm run dev` serves the starter page
- [ ] 1.2 Add Tailwind CSS and initialize shadcn/ui; verify a shadcn Button renders with correct styling
- [ ] 1.3 Add dependencies `@supabase/supabase-js`, `ngeohash`, `framer-motion`, and `vitest` (dev); verify `npm install` succeeds
- [ ] 1.4 Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` (git-ignored) and a committed `.env.example` with placeholder names; verify the values load via `import.meta.env`

## 2. Realtime + Identity + Protocol Foundations

- [ ] 2.1 Create `lib/supabase.ts` that instantiates the Supabase client from env vars; verify no crash on load and the client is created
- [ ] 2.2 Implement identity helpers: generate/persist `crypto.randomUUID()` in `localStorage` with an in-memory fallback, assign a random kawaii avatar emoji; verify identity is stable across reloads and survives disabled storage
- [ ] 2.3 Define the versioned `PingEvent` protocol type and a validation/allowlist module (shape check, fixed 3–6 emoji palette); verify unit tests reject malformed shapes and non-palette emojis
- [ ] 2.4 Implement channel helpers: open a Supabase channel by name, subscribe, and expose broadcast send/on + presence track/on; verify two browser tabs on the same channel see each other's presence

## 3. Connection (code mode)

- [ ] 3.1 Implement high-entropy code generation (from `crypto.randomUUID()` or 6+ chars of a 32-char alphabet) plus display normalization (uppercase, no look-alikes) and entered-code normalization; verify unit tests cover generation and normalization
- [ ] 3.2 Wire code mode: creating/entering a code joins `ping:code:{CODE}`; verify two tabs entering the same code land in the same session (presence shows both)
- [ ] 3.3 Add nickname input with length clamp and control-character stripping, passed (with identity) into the presence payload; verify presence shows the sanitized nickname

## 4. Connection (radius mode)

- [ ] 4.1 Implement geohash encoding with radius→precision mapping (~150m→7 chars, ~1km→6 chars) using `ngeohash`; verify unit tests confirm the mapping against `ngeohash`'s actual cell geometry, not assumed values
- [ ] 4.2 Request browser geolocation, handle denial with an error message, and join `ping:geo:{cell}` sending only the derived cell (never raw coordinates); verify two clients with mocked nearby coordinates share a session and no raw coords are transmitted
- [ ] 4.3 Add the radius selector (~150m / ~1km) with an "approximate" hint and verify it changes the joined cell

## 5. Ping / Pong

- [ ] 5.1 Implement the emoji palette picker (fixed 3–6 emojis) plus tap-to-ping on the canvas (hit area excludes controls): broadcast a `PingEvent` carrying the selected palette emoji, with throttle, and show a "no one here" cue instead of broadcasting when presence is empty; verify rapid taps are throttled
- [ ] 5.2 Implement ping reception: validate the payload, filter out own `fromId`, render a floating emoji animation (framer-motion), and render a static indicator under `prefers-reduced-motion`; verify a ping from tab B animates on tab A only
- [ ] 5.3 Implement auto-pong: on receiving a valid ping, broadcast `pong` to the sender; verify the sender shows a "delivered" acknowledgement and a missing pong reads as unknown
- [ ] 5.4 Add presence badge plus connection-status indicator (connected / alone / reconnecting); verify it updates on join/leave and on a dropped connection

## 6. Polish + Tests

- [ ] 6.1 Build the screen flow (landing → code lobby / nearby lobby → ping canvas) and verify navigation works end-to-end
- [ ] 6.2 Style the screens with shadcn/ui components and verify the UI is usable on mobile viewport widths
- [ ] 6.3 Run `npm test` and verify the unit-test slice (geohash mapping, code normalization, payload validation, identity fallback) passes

## 7. Manual: Deploy to Vercel

- [ ] 7.1 Push the repo to `origin` (stplva/cute-ping) and verify the remote has the latest commit
- [ ] 7.2 Connect the repo in Vercel and add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (per `.env.example`) for Production/Preview/Development; verify the env vars are set in the dashboard
- [ ] 7.3 Trigger a production deploy and verify the live URL loads and a two-browser ping round-trip works on the deployed app
