import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

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

crons.interval(
  "refresh code::stats profile",
  { minutes: 30 },
  internal.codestats.refreshProfile,
  {}
);

export default crons;
