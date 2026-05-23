# Canvas V4

Canvas V4 is an experimental, modern frontend for Canvas LMS.

The goal is to build a Canvas experience that feels much faster than the default UI: local-first, responsive, easier to navigate, and eventually better suited for AI-assisted workflows like chat, study tools, and todos.

## Current Focus

This project is starting with the technical foundation before the polished interface:

- A typed Canvas API SDK.
- A sync engine that normalizes Canvas data.
- Local-first caching with IndexedDB.
- Reactive client-side data access for fast UI updates.
- A debug dashboard for inspecting loaded Canvas data.
- Hook-based resource APIs for building frontend screens.

The early app is intentionally more of a sync/debug surface than a finished Canvas replacement. Once the data layer feels solid, the frontend can be built on top of it.

## Architecture Direction

Canvas remains the source of truth. The app keeps a fast local read model so screens can render from cached data immediately, then revalidate Canvas data in the background.

```txt
Canvas API
  -> server sync endpoints
  -> normalized Canvas entities
  -> client sync/cache layer
  -> IndexedDB persistence
  -> React hooks and UI
```

App-owned features, such as AI chat, study sets, todos, and user settings, will sync separately against the app database rather than being stored in Canvas.

## Development

Install dependencies:

```bash
bun install
```

Run the app:

```bash
bun run dev
```

Useful checks:

```bash
bun run check-types
bun run test
bun run build
```
