import "server-only";

import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

export const ASSETS_CACHE_TAG = "assets";

export type AssetRow = Awaited<ReturnType<typeof fetchQuery<typeof api.assets.list>>>[number];

export async function getAssets(): Promise<AssetRow[]> {
  "use cache";
  cacheLife("days");
  cacheTag(ASSETS_CACHE_TAG);
  return await fetchQuery(api.assets.list, {});
}
