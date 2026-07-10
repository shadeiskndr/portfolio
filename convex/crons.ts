import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("poll spotify", { seconds: 30 }, internal.spotify.pollSpotify);

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
