import { NextResponse } from "next/server";

export const revalidate = 30;

type SpotifyTrackResponse = {
  is_playing?: boolean;
  item?: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    external_urls: { spotify: string };
  } | null;
};

type RecentlyPlayedResponse = {
  items: {
    played_at: string;
    track: SpotifyTrackResponse["item"];
  }[];
};

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!(clientId && clientSecret && refreshToken)) {
    throw new Error("Spotify env vars missing");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function normalize(item: NonNullable<SpotifyTrackResponse["item"]>) {
  return {
    trackId: item.id,
    song: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    album: item.album.name,
    albumArtUrl: item.album.images[0]?.url ?? null,
    url: item.external_urls.spotify,
  };
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    });

    if (current.status === 200) {
      const data = (await current.json()) as SpotifyTrackResponse;
      if (data?.item && data.is_playing) {
        return NextResponse.json({ isPlaying: true, track: normalize(data.item) });
      }
    }

    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
    });

    if (recent.ok) {
      const data = (await recent.json()) as RecentlyPlayedResponse;
      const last = data.items[0];
      if (last?.track) {
        return NextResponse.json({
          isPlaying: false,
          track: normalize(last.track),
          playedAt: last.played_at,
        });
      }
    }

    return NextResponse.json({ isPlaying: false, track: null });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
