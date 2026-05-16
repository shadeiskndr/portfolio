import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("poll spotify", { seconds: 30 }, internal.spotify.pollSpotify);

crons.interval("refresh github contributions", { hours: 6 }, internal.github.refreshContributions, {
  username: "shadeiskndr",
});

crons.interval("refresh tweakcn themes", { hours: 24 }, internal.themes.refreshTweakcnThemes, {});

export default crons;
