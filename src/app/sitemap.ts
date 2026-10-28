import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Public pages only. Signed-in pages and /admin are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/changelog", "/privacy", "/terms", "/badge", "/auth/signup", "/auth/login"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/changelog" ? "weekly" : "monthly",
  }));
}
