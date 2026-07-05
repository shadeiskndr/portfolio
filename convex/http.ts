import { httpRouter } from "convex/server";
import { registerGithubWebhook } from "./http/githubWebhook";
import { registerResumeRoutes } from "./http/resume";

// Router manifest only — each concern registers its own routes. The résumé
// assistant SSE endpoints live in ./http/resume (sharing ./http/sse), and the
// GitHub push webhook in ./http/githubWebhook.
const http = httpRouter();

registerResumeRoutes(http);
registerGithubWebhook(http);

export default http;
