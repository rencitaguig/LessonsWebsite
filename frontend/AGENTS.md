# Frontend (Expo — "EduSphere")

Expo HAS CHANGED. Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Expo 57 / React Native 0.86 / React 19, expo-router entry, strict TypeScript. Dev server: `npm run web` → `http://localhost:8081` (run commands for the whole stack are in the root `AGENTS.md`).

## Verify

- `npx tsc --noEmit` — strict TS is on; this is the main check.
- `npm run lint` — Expo lint.
- No tests exist.

## Layout

- `src/app/` — expo-router entry only. `_layout.tsx` renders `<Slot/>`; `index.tsx` switches screens manually via `currentRoute` state (`RouteName` in `Navbar.jsx`). Routes are not files: new screens go in `src/screens/`, get a `RouteName`, and are wired into `index.tsx` and the Navbar.
- `src/screens/` — full pages: LandingPage, LessonsPage, AdminPage, ProfilePage, AuthPage.
- `src/components/` — shared UI. `*.web.tsx` siblings override the base file on web; `*.module.css` pairs with them.
- `src/constants/api.ts` — `API_URL` (`EXPO_PUBLIC_API_URL`, else `http://<hostname>:5001/api`).
- `src/constants/theme.ts` — `Colors`, `Palette`, `Spacing`, `Fonts`; `src/hooks/use-theme.ts` resolves light/dark.

## Conventions

- Plain `fetch` against `API_URL` — no API client exists. Responses are snake_case DB rows; screens declare local interfaces matching them (`topic.parent_topic_id`, `option.option_text`). Request bodies are camelCase JSON, or FormData for image uploads.
- Session is `localStorage` key `learn-portal-user`, read/written in `src/app/index.tsx` (`getStoredUser`/`storeUser`/`clearStoredUser`) and passed down as `UserSession` props. Every `window`/`localStorage` access needs a `typeof window === 'undefined'` guard.
- `StyleSheet.create` at the bottom of each file; pull colors from `Palette`/`useTheme` and spacing from `Spacing` rather than new hardcoded values.
- Platform splits: write a `.web.tsx` sibling to override web behavior (Metro resolves it automatically). Use `Platform.OS === 'web'` inline guards for DOM-only APIs — see the YouTube embed in `LessonsPage.tsx`.
- `Navbar.jsx` is the only `.jsx` file — write new code in `.ts`/`.tsx`.
- React Compiler experiment is enabled (`app.json`) — write plain components; manual `useMemo`/`useCallback` is unnecessary.
- Import alias: `@/*` → `src/*`, `@/assets/*` → `assets/`.
