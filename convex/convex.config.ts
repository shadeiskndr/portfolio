import agent from "@convex-dev/agent/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    CODESTATS_USERNAME: v.string(),
    GITHUB_OWNER: v.string(),
    GITHUB_REPO: v.string(),
    GITHUB_WEBHOOK_SECRET: v.string(),
    GITHUB_PERSONAL_ACCESS_TOKEN: v.optional(v.string()),
    GITHUB_BRANCH: v.optional(v.string()),
    SPOTIFY_CLIENT_ID: v.string(),
    SPOTIFY_CLIENT_SECRET: v.string(),
    SPOTIFY_REFRESH_TOKEN: v.string(),
  },
});
app.use(agent);

export default app;
