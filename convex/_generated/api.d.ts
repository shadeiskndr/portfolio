/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assets from "../assets.js";
import type * as commits from "../commits.js";
import type * as crons from "../crons.js";
import type * as github from "../github.js";
import type * as http from "../http.js";
import type * as photos from "../photos.js";
import type * as songs from "../songs.js";
import type * as spotify from "../spotify.js";
import type * as storage from "../storage.js";
import type * as themes from "../themes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assets: typeof assets;
  commits: typeof commits;
  crons: typeof crons;
  github: typeof github;
  http: typeof http;
  photos: typeof photos;
  songs: typeof songs;
  spotify: typeof spotify;
  storage: typeof storage;
  themes: typeof themes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
