import { httpRouter } from "convex/server";
import { registerGithubWebhook } from "./http/githubWebhook";
import { registerResumeRoutes } from "./http/resume";

const http = httpRouter();

registerResumeRoutes(http);
registerGithubWebhook(http);

export default http;
