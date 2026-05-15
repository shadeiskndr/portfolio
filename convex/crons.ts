import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("poll spotify", { seconds: 30 }, internal.spotify.pollSpotify);

export default crons;
