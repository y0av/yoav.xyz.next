import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/guestbook",
      },
    ],
    sitemap: "https://yoav.xyz/sitemap.xml",
  };
}
