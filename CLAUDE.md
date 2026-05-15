# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A React 19 + Vite church website for **Ethiopian Emmanuel United Church of Columbus (EEUCC)**. It is bilingual (English / Amharic), Firebase-backed, and deployed to Firebase Hosting.

## Commands

```bash
npm run dev          # local dev server (uses dev Firebase app if VITE_FIREBASE_APP_ID_DEV is set)
npm run build        # production build
npm run build:dev    # staging build (Vite mode "staging")
npm run lint         # ESLint
npm run deploy:prod  # build:prod + firebase deploy --only hosting
npm run deploy:dev   # build:dev + firebase hosting:channel:deploy dev --expires 30d
node scripts/migrate-firestore.mjs  # one-off Firestore migration helper
```

There are no unit tests. ESLint is the only automated check (`npm run lint`).

## Environment setup

Copy `.env.example` to `.env` and fill in Firebase values. All vars are prefixed `VITE_FIREBASE_`. Two optional vars (`VITE_FIREBASE_APP_ID_DEV`, `VITE_FIREBASE_MEASUREMENT_ID_DEV`) activate a separate Firebase app for local and staging builds so dev traffic is isolated from production analytics.

## Architecture

### Context layer (read first)

Three React contexts wrap the entire app (`src/App.jsx`), in this order:

| Context | File | What it provides |
|---|---|---|
| `AuthContext` | `src/contexts/AuthContext.jsx` | `user` (Firebase Auth), `profile` (Firestore `/users/{uid}`), `loading` |
| `LanguageContext` | `src/contexts/LanguageContext.jsx` | `language`, `changeLanguage`, `t(key)` translation helper |
| `SiteSettingsContext` | `src/contexts/SiteSettingsContext.jsx` | `churchInfo`, `givingSettings`, `reloadSettings` |

`SiteSettingsContext` merges Firestore data on top of hardcoded `DEFAULT_CHURCH_INFO` / `DEFAULT_GIVING` fallbacks. Never display raw Firestore data directly — always let the context merge handle it.

### Bilingual text

All user-visible strings go through `t(key)` from `useLanguage()`. Translation keys live in:
- `src/i18n/en/translations.json`
- `src/i18n/am/translations.json`

Add a key to **both** files whenever adding new UI text. The `t()` function falls back to English automatically.

For Firestore-stored content (church info, events, sermons) the convention is parallel fields: `title` / `titleAm`, `desc` / `descAm`, etc. Render whichever matches `language`.

### Service layer

All Firestore and Storage access goes through `src/services/`:

| File | Collections touched |
|---|---|
| `firebase.js` | Initializes `auth`, `db`, `storage`, `analytics` |
| `authService.js` | `users` |
| `eventsService.js` | `events` |
| `sermonsService.js` | `sermons` (also uses Firebase Storage for audio) |
| `siteSettingsService.js` | `siteSettings` (docs: `churchInfo`, `giving`) |
| `contactService.js` | `contactMessages`, `prayerRequests` |
| `youthVideosService.js` | `youthVideos`, `youthPageContent` |
| `missingDataService.js` | `churchProfileUpdates` |

### Real-time hooks

- `useFirestoreCollection(collectionName, queryConstraints)` — `onSnapshot` subscriber, returns `{ data, loading, error }`
- `useFirestoreDoc(collectionName, docId)` — same for a single document

Use these hooks in components that need live updates. For one-time reads, call service functions directly.

### Routing and auth

`ProtectedRoute` (`src/components/ui/ProtectedRoute.jsx`) guards two kinds of routes:
- `<ProtectedRoute>` — requires any signed-in user
- `<ProtectedRoute adminOnly>` — requires `profile.role === 'admin'`

Roles are stored in Firestore `/users/{uid}.role`. New registrations always get `role: 'member'`; admin must be set manually in the Firestore console.

The admin panel lives at `/admin/*` and is handled entirely inside `src/pages/admin/AdminLayout.jsx` with its own nested `<Routes>`.

### Firestore security rules

`firestore.rules` enforces the same role model server-side. Public collections (events, sermons, siteSettings, youthVideos, youthPageContent) allow unauthenticated reads. All writes require `role === 'admin'` verified by a `get()` call on `/users/{uid}`.

## Active roadmap

`docs/church-cta-phases-plan.md` tracks a four-phase CTA improvement plan. Phase 1 (Plan Your Visit page + hero redesign) is not yet implemented. Keep this doc in mind when touching `src/pages/Home.jsx`, `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx`, or any route additions.

## Conventions

- **No TypeScript** — the project is plain JSX/JS.
- **CSS is global** — styles live in `src/index.css` and `src/App.css`; no CSS modules or Tailwind.
- `@headlessui/react` and `@heroicons/react` are available for UI primitives and icons.
- `react-hook-form` is used for all forms.
- `date-fns` is the date utility library.
- ESLint rule: `no-unused-vars` ignores names matching `/^[A-Z_]/` (constants and React components imported but rendered via JSX).
