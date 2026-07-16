# AGENTS.md

Guidance for coding agents working in this repository.

`shahathir.me` — personal portfolio. Next.js 16 canary (App Router) + React 19, self-hosted Convex backend, Bun, Tailwind v4, Biome.

## Commands

```bash
bun run dev            # Next dev + `convex dev` together — use this, not dev:next alone
bun run check          # biome check --write .  (lint + format + safe fixes) — the main gate
bun run doctor         # react-doctor: React/Next health, perf, a11y, bundle, dead code
bunx tsc --noEmit      # type check (TS 7 native; `next build` also type-checks)
bun run build          # prebuild (WASM asset sync) + next build
```

**There is no test framework in this repo.** "Verified" means `bun run check`, `bun run doctor`, and a successful `bun run build`.

`build` depends on `prebuild` (`sync:pdfjs`, `sync:typst`), which copies pdf.js and Typst WASM out of `node_modules` into gitignored `public/` paths — a fresh checkout must build, not just `next start`.

Content/data scripts (each shells out to `bunx convex run`): `add-asset.ts`, `add-photo.ts`, `add-song.ts`, `ingest-rag.ts`, `ingest-bookmarks.ts`, `spotify-auth.ts` in `scripts/`. Run with `bun run scripts/<name>.ts --help`-style usage printed on bad args.

## Conventions

- **Source files carry no comments.** `bun run strip-comments:write` enforces this across tracked `.ts/.tsx/.js/.jsx`; it keeps only directives (`biome-ignore`, `@ts-expect-error`, …), legal headers, and `TODO/FIXME/HACK/@deprecated`. Write self-explanatory code instead. Config files are the exception and *are* documented in prose.
- **react-doctor suppressions belong in `doctor.config.jsonc`, with a comment explaining why.** That file is the record of every intentional rule violation — read it before "fixing" something it already justifies.
- Biome: 100 cols, 2-space indent, double quotes, semicolons. `useSortedClasses` auto-sorts Tailwind classes in `className`/`clsx`/`cva`/`cn`/`twMerge`.
- Commits are gitmoji + conventional: `✨ feat:`, `🐛 fix:`, `♻️ refactor:`, `🔧 chore:`, `⬆️ chore:`.
- Imports use the `@/*` alias rooted at the repo.
- Pre-commit hook runs `biome check --staged` + `react-doctor --staged`; don't bypass with `--no-verify`.

## Gotchas

- `app/(old-portfolio)/old` and `components/old-portfolio/**` are a **frozen archive** of the previous site, excluded from the quality gates. Don't refactor them.
- `components/ui/**` is vendored registry code (shadcn + `@kokonutui`, `@diceui`, `@magicui`, `@smoothui`, `@componentry`, `@kibo-ui`, `@unlumen-ui` — see `components.json`). Treat it as upstream: install via `bunx shadcn add @registry/name`, avoid hand-edits. First-party work goes in `components/new-site/**`.
- **Images aren't in `public/`.** They live in Convex storage, indexed by a string key; components call `useAsset("some-key")`. Add them with `scripts/add-asset.ts` and reference by key.
- **Never hardcode colors.** Themes are swappable CSS-variable maps, so use the semantic Tailwind tokens (`bg-background`, `text-muted-foreground`, `border-border`, `chart-1..5`).
- Convex functions **do not read `.env.local`** — their env vars (`AWS_*`, `SPOTIFY_*`, `CODESTATS_*`, GitHub webhook secret) are set with `bunx convex env set`. `.env.local` covers only the Next/CLI side (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_SELF_HOSTED_URL`, `CONVEX_SELF_HOSTED_ADMIN_KEY`, optional `UMAMI_WEBSITE_ID`).
- Deploys run `bunx convex deploy --cmd 'bun run build'` inside the `Dockerfile`, so backend functions and frontend always ship together. The admin key is passed as a BuildKit secret, never an `ARG`.
- New external image hosts need an entry in `next.config.ts` `images.remotePatterns`.
