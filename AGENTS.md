# Project Direction

This project is a new frontend and student experience for Canvas LMS.

The goal is to rebuild the daily Canvas workflow with the speed, density, and polish of Linear. Students should be able to manage assignments as todo list items, see comments and activity in a more useful social context, share study resources, and use helpful AI features without the app feeling heavy or slow.

Core product ideas:

- Treat assignments as actionable todo items, not just LMS records.
- Make class activity easier to scan, prioritize, and act on.
- Explore friend-visible comments and activity, potentially backed by a friends list system.
- Support sharing study resources between students.
- Add AI features where they reduce friction, explain course material, summarize activity, or help students plan work.

Performance should be a first-class product requirement. The app should feel instant by keeping the primary working set local, normalized, and reusable across screens. Follow the architecture direction from performance.dev's Linear breakdown: render from local data first, keep UI responsiveness independent from network latency, hydrate and refresh in the background, and avoid query-shaped duplicated caches when normalized entities can be shared.

Canvas data should be modeled separately from app-owned data. Canvas remains the source for LMS records, while this product can own student-specific features such as todos, friend relationships, comments visibility, shared resources, AI chat, and generated summaries.

When making architectural choices, prefer a client-heavy workspace model optimized for:

- normalized local data caching
- IndexedDB persistence
- optimistic updates
- background sync and refresh
- route preloading
- low-latency interactions
- type-safe client/server boundaries

Do not optimize this like a marketing site. Optimize it like a productivity app that students keep open all day.

# Mutation Workflow

All user-initiated mutations should go through a single local mutation queue rather than ad hoc request state. The queue should be durable in IndexedDB and shared across Canvas-backed mutations and app-owned data mutations so the app can grow toward offline support without redesigning write paths later.

Mutation behavior should be optimistic by default:

- Apply the expected result to the normalized local cache immediately.
- Persist the queued/pushing mutation with enough payload to retry or inspect it.
- Reflect the optimistic state in every screen that reads the affected normalized entity.
- Acknowledge the queued mutation when the server succeeds and merge the server response back into the cache.
- If the server fails, mark the mutation as errored and roll back only if a newer mutation has not superseded it.
- Avoid awaiting the network before closing menus, popovers, dialogs, or other transient UI controls.

Use the existing Canvas data provider and mutation queue primitives as the default place to add this behavior. If a new mutation type needs special conflict handling, keep that logic near the queue/apply layer instead of scattering it through UI components.

# Database Workflow

When making database schema changes, do not generate migrations by default. It is fine to apply schema changes directly with `bun run db:push`.
