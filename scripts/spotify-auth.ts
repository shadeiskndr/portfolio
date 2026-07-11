#!/usr/bin/env bun
/**
 * Mint a new SPOTIFY_REFRESH_TOKEN with the scopes this site needs and write it
 * straight to the Convex deployment.
 *
 * The original token only carried `user-read-currently-playing` and
 * `user-read-recently-played`, so `/v1/me/top/tracks` (which powers /songs)
 * 403s. Scopes are fixed at authorization time — the only way to add one is to
 * walk the user through the consent screen again, which is what this does.
 *
 * One-time setup in https://developer.spotify.com/dashboard → your app →
 * Settings → Redirect URIs: add exactly
 *
 *     http://127.0.0.1:8888/callback
 *
 * Spotify rejects `http://localhost` these days; the loopback IP literal is
 * required for plain-HTTP redirects.
 *
 * Usage: bun run scripts/spotify-auth.ts
 */
import { parseArgs } from "node:util";
import { $ } from "bun";

const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const PORT = 8888;

const DEFAULT_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
];

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    scopes: { type: "string", default: DEFAULT_SCOPES.join(" ") },
    "no-write": { type: "boolean", default: false },
  },
});

const scopes = values.scopes as string;

const convexEnvGet = async (key: string): Promise<string> => {
  const res = await $`bunx convex env get ${key}`.quiet().nothrow();
  if (res.exitCode !== 0) {
    console.error(`Could not read ${key} from the Convex deployment.`);
    process.exit(1);
  }
  return res.stdout.toString().trim();
};

console.log("Reading Spotify credentials from Convex…");
const clientId = await convexEnvGet("SPOTIFY_CLIENT_ID");
const clientSecret = await convexEnvGet("SPOTIFY_CLIENT_SECRET");

const state = crypto.randomUUID();
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  scope: scopes,
  redirect_uri: REDIRECT_URI,
  state,
  // Force the consent screen even though this account already authorized the
  // app — otherwise Spotify silently reissues a token with the OLD scope set.
  show_dialog: "true",
})}`;

const { promise, resolve, reject } = Promise.withResolvers<string>();

const server = Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/callback") return new Response("Not found", { status: 404 });

    const error = url.searchParams.get("error");
    if (error) {
      reject(new Error(`Spotify returned: ${error}`));
      return new Response(`Authorization failed: ${error}`, { status: 400 });
    }
    if (url.searchParams.get("state") !== state) {
      reject(new Error("State mismatch — aborting"));
      return new Response("State mismatch", { status: 400 });
    }
    const code = url.searchParams.get("code");
    if (!code) {
      reject(new Error("No code in callback"));
      return new Response("No code", { status: 400 });
    }

    resolve(code);
    return new Response(
      "<html><body style='font-family:system-ui;padding:3rem'>" +
        "<h2>Authorized.</h2><p>You can close this tab and return to the terminal.</p>" +
        "</body></html>",
      { headers: { "Content-Type": "text/html" } }
    );
  },
});

console.log(`\nScopes requested: ${scopes}`);
console.log("\nOpen this URL and approve:\n");
console.log(authUrl);
console.log("\nWaiting for the callback on http://127.0.0.1:8888/callback …");

let code: string;
try {
  code = await promise;
} catch (err) {
  console.error(`\n${err instanceof Error ? err.message : String(err)}`);
  server.stop(true);
  process.exit(1);
}
server.stop(true);

const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  }),
});

if (!tokenRes.ok) {
  console.error(`Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  process.exit(1);
}

const token = (await tokenRes.json()) as { refresh_token?: string; scope?: string };
if (!token.refresh_token) {
  console.error("No refresh_token in response.");
  process.exit(1);
}

console.log(`\nGranted scopes: ${token.scope}`);

const missing = scopes.split(" ").filter((s) => !token.scope?.split(" ").includes(s));
if (missing.length > 0) {
  console.warn(`Warning — not granted: ${missing.join(", ")}`);
}

if (values["no-write"]) {
  console.log("\n--no-write set; token not stored. Set it yourself with:");
  console.log("  bunx convex env set SPOTIFY_REFRESH_TOKEN <token>");
  console.log(`\n${token.refresh_token}`);
} else {
  await $`bunx convex env set SPOTIFY_REFRESH_TOKEN ${token.refresh_token}`.quiet();
  const masked = `${token.refresh_token.slice(0, 6)}…${token.refresh_token.slice(-4)}`;
  console.log(`\nStored SPOTIFY_REFRESH_TOKEN (${masked}) on the Convex deployment.`);
  console.log("Next: bunx convex run topTracks:refreshTopTracks");
}
