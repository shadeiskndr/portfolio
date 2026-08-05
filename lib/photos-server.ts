import "server-only";

import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

export const PHOTOS_CACHE_TAG = "photos";

export type PhotoRow = Awaited<ReturnType<typeof fetchQuery<typeof api.photos.list>>>[number];

export async function getPhotos(): Promise<PhotoRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PHOTOS_CACHE_TAG);
  return await fetchQuery(api.photos.list, {});
}
