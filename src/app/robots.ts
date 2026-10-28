import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE = [
  "/api/", "/admin", "/dashboard", "/profile", "/schools", "/archetype", "/applications", "/interviews",
  "/recommendations", "/outline", "/mock-interview", "/fee-tracker", "/gapyear", "/postbacc", "/import",
  "/resources", "/specialties", "/stories", "/auth/callback", "/auth/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
