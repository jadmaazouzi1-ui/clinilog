import type { MetadataRoute } from "next";
import { PALETTE } from "@/lib/palette";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClinicLog MD",
    short_name: "ClinicLog MD",
    description: "Log clinical hours for AMCAS and compare medical schools with your numbers.",
    start_url: "/dashboard",
    display: "standalone",
    theme_color: PALETTE.black,
    background_color: PALETTE.black,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
