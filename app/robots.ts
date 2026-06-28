import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /old is intentionally NOT disallowed here: it carries a meta noindex, and
// crawlers must be able to fetch the pages to see it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
