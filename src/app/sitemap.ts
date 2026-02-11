import type { MetadataRoute } from "next";

const siteUrl = "https://yoav.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
