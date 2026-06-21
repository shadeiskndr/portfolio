#!/usr/bin/env bun
/**
 * Seed / refresh the /bookmarks page.
 *
 * For every curated URL (plus the ones parsed out of a browser bookmarks
 * export) this script:
 *   1. fetches the page and scrapes title / description / publish date / favicon
 *   2. snapshots the site above the fold with headless Chrome (1280×800)
 *   3. transcodes the PNG to WebP and uploads it to Convex storage
 *   4. upserts a `bookmarks` row via `bookmarks:upsertBookmark`
 *
 * Idempotent: re-running refreshes metadata in place and only swaps the preview
 * when a new screenshot succeeds. Usage:
 *   bun run scripts/ingest-bookmarks.ts [--clear] [--no-shots] [--only reading|resource]
 */
import { parseArgs } from "node:util";
import { $ } from "bun";

const CHROME = "google-chrome-stable";
const SHOT_DIR =
  "/tmp/claude-1000/-home-siskandar-DEV-P-portfolio/69973ffe-482f-4032-baf5-9e8393054fd1/scratchpad/shots";
const BOOKMARKS_HTML = "/home/siskandar/Downloads/bookmarks_7_11_26.html";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36";
const CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 15_000;
const SHOT_TIMEOUT_MS = 50_000;
const MAX_FAVICON_BYTES = 40 * 1024;

type Section = "reading" | "resource";

type Seed = {
  url: string;
  section: Section;
  tags: string[];
  /** Fallback title if scraping yields nothing useful. */
  title?: string;
  /** Fallback added-at (ms epoch). */
  addedAt?: number;
};

// ── Curated readings — blogs & articles. Sorted by publish date on the page. ──
const READINGS: Omit<Seed, "section">[] = [
  { url: "https://opencomputer.dev/blog/where-should-the-agent-live", tags: ["ai", "agents"] },
  { url: "https://notes.mtb.xyz/p/your-data-model-is-your-destiny", tags: ["engineering", "data"] },
  {
    url: "https://frederickvanbrabant.com/blog/2025-10-31-architectural-debt-is-not-just-technical-debt/",
    tags: ["architecture", "engineering"],
  },
  {
    url: "https://salehmubashar.com/blog/html-selects-are-actually-styleable-now",
    tags: ["css", "frontend"],
  },
  {
    url: "https://nickjanetakis.com/blog/why-i-like-using-docker-compose-in-production",
    tags: ["devops", "docker"],
  },
  { url: "https://vadimkravcenko.com/shorts/owner-vs-manager/", tags: ["career", "leadership"] },
  {
    url: "https://medium.com/@karstenbiedermann/the-css-if-function-has-arrived-152115ab2115",
    tags: ["css", "frontend"],
  },
  {
    url: "https://uxdesign.cc/material-3-expressive-building-on-the-failures-of-flat-design-d7a9bb627298",
    tags: ["design", "ux"],
  },
  { url: "https://blog.bytebytego.com/p/ep169-rag-vs-agentic-rag", tags: ["ai", "architecture"] },
  { url: "https://freek.dev/2894-preventing-scrollbar-layout-shifts", tags: ["css", "frontend"] },
  { url: "https://blog.algomaster.io/p/json-web-tokens", tags: ["security", "backend"] },
  {
    url: "https://dev.to/muhammadahsanmirza/frontend-isnt-just-ui-289d",
    tags: ["frontend", "career"],
  },
  {
    url: "https://www.deepintodev.com/blog/how-databases-store-your-tables-on-disk",
    tags: ["databases", "engineering"],
  },
  {
    url: "https://itnext.io/angular-animation-magic-unlock-the-power-of-the-view-transition-api-9af0b763372c",
    tags: ["frontend", "animation"],
  },
  {
    url: "https://x.com/RhysSullivan/status/2070630745891365008",
    tags: ["engineering", "web"],
    title: "Rhys Sullivan on the modern web stack",
  },
  {
    url: "https://medium.com/@abhirup.acharya009/managing-concurrent-access-optimistic-locking-vs-pessimistic-locking-0f6a64294db7",
    tags: ["databases", "backend"],
  },
];

// ── Curated resources — sites worth revisiting. Sorted by list order. ──
const RESOURCES: Omit<Seed, "section">[] = [
  { url: "https://strandsagents.com/", tags: ["ai", "agents"] },
  { url: "https://gofastmcp.com/getting-started/welcome", tags: ["ai", "mcp"] },
  { url: "https://dokploy.com/", tags: ["devops", "tools"] },
  { url: "https://codemirror.net/", tags: ["tools", "frontend"] },
  { url: "https://astryx.atmeta.com/", tags: ["ai", "tools"] },
  { url: "https://developer.chrome.com/docs/devtools/agents", tags: ["ai", "tools"] },
  { url: "https://www.convex.dev/", tags: ["backend", "tools"] },
  { url: "https://ui.shadcn.com/", tags: ["ui", "frontend"] },
  { url: "https://tweakcn.com/", tags: ["ui", "design"] },
];

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    clear: { type: "boolean", default: false },
    "no-shots": { type: "boolean", default: false },
    only: { type: "string" },
  },
});

const runConvex = async <T>(fn: string, args?: object): Promise<T> => {
  const cmd = args
    ? await $`bunx convex run ${fn} ${JSON.stringify(args)}`.quiet()
    : await $`bunx convex run ${fn}`.quiet();
  const stdout = cmd.stdout.toString().trim();
  return stdout ? (JSON.parse(stdout) as T) : (undefined as T);
};

// ── HTML helpers ──────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .trim();
}

function metaContent(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
      "i"
    );
    const tag = html.match(re)?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (content?.trim()) return decodeEntities(content);
  }
  return undefined;
}

function jsonLdDate(html: string): string | undefined {
  return html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
}

function urlDate(url: string): number | undefined {
  const m = url.match(/(20\d{2})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return undefined;
  const t = Date.parse(`${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`);
  return Number.isNaN(t) ? undefined : t;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function titleFromUrl(url: string): string {
  try {
    const { pathname, hostname } = new URL(url);
    const seg = pathname.split("/").filter(Boolean).pop();
    if (!seg) return domainOf(url);
    const cleaned = decodeURIComponent(seg)
      .replace(/\.[a-z]+$/i, "")
      .replace(/-[0-9a-f]{6,}$/i, "") // trailing hash id (medium etc.)
      .replace(/[-_]+/g, " ")
      .trim();
    if (!cleaned) return hostname.replace(/^www\./, "");
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return domainOf(url);
  }
}

async function timedFetch(url: string): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8,*/*;q=0.5",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function resolveUrl(base: string, href: string): string | undefined {
  try {
    return new URL(href, base).href;
  } catch {
    return undefined;
  }
}

async function fetchFavicon(pageUrl: string, html: string): Promise<string | undefined> {
  const linkTag = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i)?.[0];
  const href = linkTag?.match(/href=["']([^"']+)["']/i)?.[1];
  const candidates = [
    href ? resolveUrl(pageUrl, href) : undefined,
    resolveUrl(pageUrl, "/favicon.ico"),
  ].filter((v): v is string => Boolean(v));

  for (const candidate of candidates) {
    const res = await timedFetch(candidate);
    if (!res?.ok) continue;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) continue;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_FAVICON_BYTES) continue;
    return `data:${ct.split(";")[0]};base64,${Buffer.from(buf).toString("base64")}`;
  }
  return undefined;
}

type Meta = {
  title?: string;
  description?: string;
  publishedAt?: number;
  faviconUrl?: string;
};

async function scrapeMeta(url: string, wantDate: boolean): Promise<Meta> {
  const res = await timedFetch(url);
  if (!res?.ok) return {};
  const html = (await res.text()).slice(0, 600_000);

  const title =
    metaContent(html, ["og:title", "twitter:title"]) ??
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ? decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
      : undefined);

  const rawDesc = metaContent(html, ["og:description", "description", "twitter:description"]);
  const description = rawDesc ? rawDesc.slice(0, 220) : undefined;

  let publishedAt: number | undefined;
  if (wantDate) {
    const iso =
      metaContent(html, [
        "article:published_time",
        "og:article:published_time",
        "article:published",
        "datePublished",
        "date",
        "pubdate",
      ]) ??
      jsonLdDate(html) ??
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1];
    const parsed = iso ? Date.parse(iso) : Number.NaN;
    publishedAt = Number.isNaN(parsed) ? urlDate(url) : parsed;
  }

  const faviconUrl = await fetchFavicon(url, html).catch(() => undefined);

  return { title: title?.trim() || undefined, description, publishedAt, faviconUrl };
}

// ── Screenshot ──────────────────────────────────────────────────────────────

async function screenshot(url: string, slug: string): Promise<Uint8Array | null> {
  const outPng = `${SHOT_DIR}/${slug}.png`;
  const profile = `${SHOT_DIR}/profile-${slug}`;
  const proc = Bun.spawn(
    [
      CHROME,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1280,800",
      `--user-data-dir=${profile}`,
      "--virtual-time-budget=7000",
      `--screenshot=${outPng}`,
      url,
    ],
    { stdout: "ignore", stderr: "ignore" }
  );

  const timer = setTimeout(() => proc.kill(), SHOT_TIMEOUT_MS);
  await proc.exited.catch(() => {});
  clearTimeout(timer);
  await $`rm -rf ${profile}`.quiet().nothrow();

  const file = Bun.file(outPng);
  if (!(await file.exists())) return null;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await $`rm -f ${outPng}`.quiet().nothrow();
  return bytes.byteLength > 2000 ? bytes : null;
}

async function uploadPreview(png: Uint8Array): Promise<string | undefined> {
  const pipeline = new Bun.Image(png)
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 });
  const blob = await pipeline.blob();

  const uploadUrl = await runConvex<string>("storage:generateUploadUrl");
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
    body: blob,
  });
  if (!res.ok) return undefined;
  const { storageId } = (await res.json()) as { storageId: string };
  return storageId;
}

// ── Browser export parsing ────────────────────────────────────────────────

function slugify(url: string): string {
  return url
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .toLowerCase();
}

function parseBrowserExport(html: string, existing: Set<string>): Seed[] {
  const out: Seed[] = [];
  const seen = new Set(existing);
  const re = /<A\s+HREF="([^"]*)"([^>]*)>([\s\S]*?)<\/A>/gi;
  let m: RegExpExecArray | null;
  m = re.exec(html);
  while (m !== null) {
    const url = m[1];
    const attrs = m[2];
    if (/^https?:\/\//i.test(url) && !seen.has(url)) {
      seen.add(url);
      const addDate = attrs.match(/ADD_DATE="(\d+)"/i)?.[1];
      const host = domainOf(url);
      const tags = ["ui"];
      if (/github\.com/i.test(host)) tags.push("tools");
      out.push({
        url,
        section: "resource",
        tags,
        title: decodeEntities(m[3]).trim() || undefined,
        addedAt: addDate ? Number(addDate) * 1000 : undefined,
      });
    }
    m = re.exec(html);
  }
  return out;
}

function iconFromExport(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /<A\s+HREF="([^"]*)"([^>]*)>/gi;
  let m: RegExpExecArray | null;
  m = re.exec(html);
  while (m !== null) {
    const icon = m[2].match(/ICON="(data:image[^"]+)"/i)?.[1];
    if (icon) map.set(m[1], icon);
    m = re.exec(html);
  }
  return map;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function processSeed(seed: Seed, order: number, exportIcons: Map<string, string>) {
  const isReading = seed.section === "reading";
  const meta = await scrapeMeta(seed.url, isReading);
  const title = meta.title || seed.title || titleFromUrl(seed.url);
  const faviconUrl = exportIcons.get(seed.url) ?? meta.faviconUrl;

  let previewId: string | undefined;
  if (!values["no-shots"]) {
    const png = await screenshot(seed.url, slugify(seed.url)).catch(() => null);
    if (png) previewId = await uploadPreview(png).catch(() => undefined);
  }

  await runConvex("bookmarks:upsertBookmark", {
    section: seed.section,
    url: seed.url,
    title,
    domain: domainOf(seed.url),
    description: meta.description,
    tags: seed.tags,
    publishedAt: meta.publishedAt,
    addedAt: seed.addedAt ?? Date.now(),
    order,
    previewId,
    faviconUrl,
  });

  const dateStr = meta.publishedAt ? new Date(meta.publishedAt).toISOString().slice(0, 10) : "—";
  console.log(
    `${previewId ? "📸" : "  "} [${seed.section}] ${title.slice(0, 50).padEnd(50)} ${isReading ? dateStr : ""} ${seed.url}`
  );
}

async function pool<T>(items: T[], limit: number, fn: (item: T, i: number) => Promise<void>) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        await fn(items[i], i);
      } catch (err) {
        console.error(`✗ failed item ${i}:`, err);
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  await $`mkdir -p ${SHOT_DIR}`.quiet();

  const exportHtml = await Bun.file(BOOKMARKS_HTML)
    .text()
    .catch(() => "");
  const exportIcons = iconFromExport(exportHtml);

  const curatedResourceUrls = new Set(RESOURCES.map((r) => r.url));
  const parsedResources = exportHtml ? parseBrowserExport(exportHtml, curatedResourceUrls) : [];

  const readings = READINGS.map((s) => ({ ...s, section: "reading" as const }));
  const resources = [
    ...RESOURCES.map((s) => ({ ...s, section: "resource" as const })),
    ...parsedResources,
  ];

  const only = values.only as Section | undefined;
  const doReadings = !only || only === "reading";
  const doResources = !only || only === "resource";

  if (values.clear) {
    if (doReadings) await runConvex("bookmarks:clearSection", { section: "reading" });
    if (doResources) await runConvex("bookmarks:clearSection", { section: "resource" });
    console.log("Cleared existing rows.");
  }

  console.log(
    `Ingesting ${doReadings ? readings.length : 0} readings + ${doResources ? resources.length : 0} resources ` +
      `(shots: ${values["no-shots"] ? "off" : "on"}, concurrency ${CONCURRENCY})\n`
  );

  if (doReadings) {
    await pool(readings, CONCURRENCY, (seed, i) => processSeed(seed, i, exportIcons));
  }
  if (doResources) {
    await pool(resources, CONCURRENCY, (seed, i) => processSeed(seed, i, exportIcons));
  }

  console.log("\n✔ Done.");
}

await main();
