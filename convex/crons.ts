import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 30s was ~2.9k polls/day, and every idle tick also hit `recently-played` —
// which has a much tighter quota and started returning 429 QUOTA_EXCEEDED with
// a 16-hour Retry-After, silently blanking the now-playing widget. A minute is
// still comfortably "live" for a status card.
crons.interval("poll spotify", { minutes: 1 }, internal.spotify.pollSpotify);

crons.interval(
  "refresh spotify top tracks",
  { hours: 24 },
  internal.topTracks.refreshTopTracks,
  {}
);

crons.interval("refresh github contributions", { hours: 6 }, internal.github.refreshContributions, {
  username: "shadeiskndr",
});

crons.interval("refresh tweakcn themes", { hours: 24 }, internal.themes.refreshTweakcnThemes, {});

// Code::Stats aggregates XP into daily buckets, so there is nothing to gain
// from polling faster than the "last 12 hours" recent-XP window moves.
crons.interval(
  "refresh code::stats profile",
  { minutes: 30 },
  internal.codestats.refreshProfile,
  {}
);

export default crons;
