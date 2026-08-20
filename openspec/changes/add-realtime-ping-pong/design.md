## Context

Greenfield project. Frontend-only app hosted on Vercel; Supabase Realtime is used solely as a managed pub/sub + presence layer (no Postgres writes, no custom server, no auth). Pings are ephemeral. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- A free, zero-backend realtime "ping a friend" app that two browsers can use today.
- Two matching modes sharing the same session machinery: shared session code and radius (geohash).
- One transport abstraction so "send ping / receive pong / see presence" works identically in both modes.
- A single, versioned message protocol so clients agree on payload shape and can evolve it.

**Non-Goals:**
- Persistent ping history, replay, or moderation.
- Multi-cell (neighbor) radius coverage — single geohash cell only for MVP.
- Authentication, accounts, or server-side abuse/rate limiting (only a light client-side throttle is in scope).
- Native/mobile clients.

## Decisions

### 1. Supabase Realtime (broadcast + presence) instead of self-hosted WebSockets
- **Decision**: use `@supabase/supabase-js` channels with `broadcast` (for pings/pongs) and `presence` (for "who's here").
- **Why**: Vercel serverless can't hold long-lived sockets, so a custom WS server would need a second always-on host. Supabase runs the sockets, handles fan-out/reconnect, and gives presence for free.
- **Alternatives considered**: raw WebSockets on a separate host (more ops); Ably (equally good, but Supabase bundles presence + room to grow into Postgres history); Pusher (tight free tier, effectively EOL).

### 2. Channel naming + session-code entropy
- **Decision**: sessions map 1:1 to a channel name: `ping:code:{CODE}` (code mode) and `ping:geo:{geohash}` (radius mode). A code is a reusable session name, not a single-use token.
- **Entropy**: codes are generated with `crypto.randomUUID()` (or 6+ characters from a full 32-char alphabet), not a short human-friendly string. "Unambiguous" applies only to display (uppercase, no look-alike characters for copy-paste), never to the encoded space.
- **Why**: matching is just "both clients join the same channel"; high entropy prevents trivial brute-force joins. Low-entropy human codes would be brute-forceable in seconds.

### 3. Radius via geohash precision, not distance math
- **Decision**: encode the user's lat/lng with `ngeohash`; radius selects precision — ~150m → 7 chars (~153m cell), ~1km → 6 chars (~1.2km × 0.6km cell). Join `ping:geo:{cell}`. Only the derived cell is ever transmitted; raw coordinates never leave the client. Cell sizes are labeled "approximate" in the UI.
- **Verification**: confirm the precision→distance figures against `ngeohash`'s actual alphabet and cell geometry (latitude-dependent) during task 4.1 rather than assuming them.
- **Why**: no server, no cross-client distance computation; co-located users naturally land in the same cell.
- **Alternatives considered**: server-side distance queries (needs backend + DB); H3/S2 hex cells (more accurate but heavier and overkill for MVP).

### 4. Message protocol (versioned TS type)
- **Decision**: define a shared type `PingEvent = { v: 1, type: 'ping' | 'pong', fromId: string, emoji: string, ts: number }` with a `v` version field for forward compatibility; every broadcast conforms to it.
- **Why**: it is the only interface in a zero-backend app; a version field lets the payload shape evolve without breaking older clients.

### 5. Receiver-side validation + emoji palette (picker = allowlist)
- **Decision**: the ping emoji comes from a fixed curated palette of 3–6 kawaii emojis (e.g. 🐱 💖 ⭐ 🐶 🎀). The picker and the allowlist are the *same* set — the UI only offers palette emojis, and receivers validate every broadcast against the protocol shape and that same palette, dropping unknown shapes/types/emojis. Nicknames are clamped to a max length, stripped of control/zero-width characters, and rendered only as React text (never `dangerouslySetInnerHTML`, never raw `src`/`style`).
- **Why**: making the picker and allowlist identical guarantees nothing is ever silently dropped (a free-text input would let senders pick emojis the receiver then rejects); a short palette is also a one-tap send on mobile and fits the "cute" aesthetic. Validation still turns "anyone can broadcast" into "anyone can broadcast only valid-looking pings" and mitigates nickname injection and spoofed payloads.
- **Note**: the ping palette is distinct from the random *avatar* emoji assigned for identity (Decision 6); the avatar is not part of the broadcast protocol.

### 6. Anonymous identity (no auth)
- **Decision**: on first visit generate `crypto.randomUUID()`, persist in `localStorage`, pair with a random kawaii avatar emoji and optional user-supplied nickname; include these in the presence payload. Fall back to an in-memory identity when `localStorage` is unavailable (e.g. private mode).
- **Why**: zero friction for a pet project; the anon key is designed to be public, so no secret management.

### 7. Pong as an automatic "delivered" ack
- **Decision**: on receiving a valid `ping`, the receiver broadcasts a `pong` back to the sender; the sender renders a "delivered" acknowledgement (not "seen"). Senders filter by `fromId` to avoid echoing their own pings; a missing pong is treated as "unknown," not "unseen."
- **Note**: `fromId` is forgeable without auth, so "delivered" is best-effort only (see Risks).

### 8. Client-side throttle + reduced motion
- **Decision**: debounce/throttle ping sends (bounded pings/sec) and cap concurrent on-screen animations; honor `prefers-reduced-motion` with a static indicator. The ping hit area is the canvas only, excluding controls, to avoid accidental taps while scrolling or using the UI.
- **Why**: flooding degrades everyone's UX; reduced-motion is a cheap accessibility win; a constrained hit area prevents false triggers on mobile.

### 9. Frontend stack
- **Decision**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui; `framer-motion` for the floating emoji animations; `ngeohash` for geohashing; `vitest` for the unit-testable logic (geohash mapping, code normalization, payload validation, identity fallback); a lightweight state machine for screens (landing → code lobby / nearby lobby → ping canvas) rather than a router.
- **Why**: standard, fast to scaffold, deploys to Vercel free with no config beyond build output.

### 10. Configuration via `VITE_` env vars
- **Decision**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (publishable key) in `.env.local` for dev, a committed `.env.example` with placeholder names for onboarding, and Vercel env vars for prod. The anon/publishable key is intentionally public; the `service_role` key is never used client-side.

## Risks / Trade-offs

- **[Unauthenticated = anyone can listen/spoof]** With a public anon key and no auth, any client can join any `ping:code:{CODE}` or `ping:geo:{cell}` channel and read or spoof everything. This is inherent to the design and is an accepted tradeoff for a pet project. → Mitigations: high-entropy codes (code mode) and receiver-side validation/allowlist (limits spoofed payloads to valid-looking pings). `fromId` remains forgeable, so "delivered" acks are best-effort only.
- **[Channel enumerability]** Geohash cells are enumerable (6-char ≈ 2.4M, 7-char ≈ 1.4B), so a determined lurker can sweep cells near a target location. → Accepted; radius mode is inherently semi-public, and raw coordinates are never exposed.
- **[Neighbor-cell edge effect]** Two people physically meters apart but in adjacent geohash cells won't match. → Accept for MVP; documented follow-up is subscribing to the 8 surrounding cells (pure client change, no spec impact).
- **[Cell size vs. radius mismatch]** A 7-char cell (~153m) can over-match people up to ~2× the selected radius. → Labeled "approximate" in the UI; coarser precision keeps it simple.
- **[Geolocation reliability]** Browser geolocation can be imprecise or denied. → Handle denial gracefully (spec `connection`); allow manual coordinate override in dev for testing.
- **[Offline/reconnect silently drops pings]** Supabase auto-reconnects, but without a status indicator pings fail silently during a disconnect. → Add a connection-status indicator (spec `connection`).
- **[Presence without auth]** Supabase presence keys off a client identity; multiple tabs/devices from the same user appear as separate entries. → Acceptable for MVP.
- **[Supabase free-tier limits]** Hundreds of concurrent connections; irrelevant for a personal app.

## Migration Plan

No data or existing system to migrate. Deployment is a fresh Vercel project: connect the `stplva/cute-ping` repo, set the two `VITE_` env vars (with `.env.example` as the reference), build outputs `dist/`. Rollback is a previous Vercel deployment.

## Open Questions

None — remaining choices (exact emoji set, animation tuning) are cosmetic and can be decided during implementation without changing specs or task breakdown.
