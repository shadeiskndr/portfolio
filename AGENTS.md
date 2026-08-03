# AGENTS.md

Guidance for coding agents working in this repository.

`shahathir.me` — personal portfolio. Next.js 16 (App Router) + React 19, self-hosted Convex backend, Bun, Tailwind v4, Biome.

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
- **react-doctor scores 100 and `doctor.config.jsonc` is only there for deslop's dead-code blind spots** (`unused-file` / `unused-export` over `convex/**`, the lib modules only Convex reaches, and the vendored registry). Every other intentional violation is an inline `react-doctor-disable-next-line react-doctor/<rule>` with a reason above it — don't add rule entries to the config. Suppress only when the rule is a confirmed false positive or the fix is structurally impossible (e.g. `prefer-dynamic-import` on `recharts`: its chart parents introspect child component types, so the children can't be wrapped in `next/dynamic`); otherwise fix the code.
- **Convex lint rules live in `biome-plugins/*.grit`**, ported from `@convex-dev/eslint-plugin` and registered in `biome.json` under `overrides` for `convex/**`. Don't install the upstream package: Biome can't load ESLint plugins, and `typescript-eslint` rejects TypeScript 7. GritQL is syntax-only with no autofix; each file's header notes what it ports and where it diverges. `no-schema-import-cycle` and `import-wrong-runtime` aren't ported — they need a cross-file module graph.
- Biome: 100 cols, 2-space indent, double quotes, semicolons. `useSortedClasses` auto-sorts Tailwind classes in `className`/`clsx`/`cva`/`cn`/`twMerge`.
- **The `react` and `next` lint domains are on at `"all"`, with no path-based overrides.** Intentional violations are inline `biome-ignore` comments with a reason, never a new `overrides` entry. Two consequences worth knowing: a component file may not export non-components (hooks and `cva` variants live in sibling `*-context.ts` / `*-variants.ts` modules — Next route-segment exports are allowed via `allowExportNames`), and JSX props may not take inline functions (hoist to `useCallback`, or push the binding into a child component when it closes over a `.map` item).
- **Biome honours `biome-ignore` only on the immediately preceding line**, so it and a `react-doctor-disable-next-line` can't both sit above the same statement. When they collide, use a file-top `biome-ignore-all` (it must precede `"use client"`).
- Commits are gitmoji + conventional: `✨ feat:`, `🐛 fix:`, `♻️ refactor:`, `🔧 chore:`, `⬆️ chore:`.
- **Commit straight to `main`.** This is a solo repo with no PR review flow, so don't create feature branches — not even for routine chores like dependency bumps.
- Imports use the `@/*` alias rooted at the repo.
- Pre-commit hook runs `biome check --staged` + `react-doctor --staged`; don't bypass with `--no-verify`.

## Gotchas

- `app/(old-portfolio)/old` and `components/old-portfolio/**` are an archive of the previous site. It's still live and still linted, so keep it compiling, but don't add features there.
- `components/ui/**` is registry code (shadcn + `@kokonutui`, `@diceui`, `@magicui`, `@smoothui`, `@componentry`, `@kibo-ui`, `@unlumen-ui` — see `components.json`). It's vendored, not upstream: we own it and it's held to the same lint gates as the rest. Re-running `bunx shadcn add @registry/name` will clobber local fixes, so diff before accepting. First-party work still goes in `components/new-site/**`.
- **Images aren't in `public/`.** They live in Convex storage, indexed by a string key; components call `useAsset("some-key")`. Add them with `scripts/add-asset.ts` and reference by key.
- **Never hardcode colors.** Themes are swappable CSS-variable maps, so use the semantic Tailwind tokens (`bg-background`, `text-muted-foreground`, `border-border`, `chart-1..5`).
- **A Convex function that calls another function in the same module needs an explicit return type.** `api.d.ts` declares `chat: typeof chat`, so `internal.chat.foo` depends on the module's inferred types — if a function's *inferred* return type consumes the result of a same-module `ctx.runQuery`/`runMutation`/`runAction`, the inference goes circular and TypeScript silently degrades the whole `api` object to `any`. The symptom is implicit-any errors in unrelated files (e.g. `components/**` calling `useQuery`), far from the cause. Annotate the handler (`handler: async (ctx): Promise<T> => …`) or the local (`const x: T = await ctx.runQuery(…)`). A `returns:` validator does **not** fix it — the handler's return type is still inferred.
- **`chatModels` rows are hand-tuned; `lib/chat/models.ts` must match them.** `models:seed` upserts by `modelId`, so any drift in an id silently inserts a duplicate model instead of updating the existing row. Keep `id`/`surface` in sync with the deployed table before running the seed.
- Convex functions **do not read `.env.local`** — their env vars (`AWS_*`, `SPOTIFY_*`, `CODESTATS_*`, GitHub webhook secret) are set with `bunx convex env set`. `.env.local` covers only the Next/CLI side (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_SELF_HOSTED_URL`, `CONVEX_SELF_HOSTED_ADMIN_KEY`, optional `UMAMI_WEBSITE_ID`).
- Deploys run `bunx convex deploy --cmd 'bun run build'` inside the `Dockerfile`, so backend functions and frontend always ship together. The admin key is passed as a BuildKit secret, never an `ARG`.
- New external image hosts need an entry in `next.config.ts` `images.remotePatterns`.
