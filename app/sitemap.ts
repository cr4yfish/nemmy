import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://nemmy.app",
      lastModified: new Date(),
    },
  ];
}
