import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://nemmy.vercel.app",
            lastModified: new Date(),
        }
    ]
}