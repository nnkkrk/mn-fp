import { MetadataRoute } from "next";
import { BLOGS_DATA } from "@/lib/blogData";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mlbbtopup.in";
  const now = new Date();

  // 1. Core Platform Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/games`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/giveaways`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/tournament`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/tournament/mlbb`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/trade`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.75 },
    { url: `${baseUrl}/region`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/blog/mlbb`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/partner`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/check`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/donate`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // 2. Static & DB Blog Routes
  const blogUrlSet = new Set<string>();
  const blogRoutes: MetadataRoute.Sitemap = [];

  BLOGS_DATA.forEach((blog) => {
    const url = `${baseUrl}/blog/${blog.game}/${blog.slug}`;
    blogUrlSet.add(url);
    blogRoutes.push({
      url,
      lastModified: new Date(blog.publishedAt),
      changeFrequency: "weekly",
      priority: blog.featured ? 0.75 : 0.65,
    });
  });

  try {
    await connectDB();
    const dbBlogs = await Blog.find({}).select("game slug publishedAt updatedAt").lean();
    dbBlogs.forEach((blog: any) => {
      const url = `${baseUrl}/blog/${blog.game}/${blog.slug}`;
      if (!blogUrlSet.has(url)) {
        blogUrlSet.add(url);
        blogRoutes.push({
          url,
          lastModified: blog.updatedAt ? new Date(blog.updatedAt) : (blog.publishedAt ? new Date(blog.publishedAt) : now),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    });
  } catch (err) {
    console.error("DB Blog Sitemap Error:", err);
  }

  // 3. OTT & Membership Routes
  const OTTS = ["youtube-premium", "netflix", "spotify"];
  const MEMBERSHIPS = ["silver-membership", "reseller-membership"];

  const ottRoutes: MetadataRoute.Sitemap = OTTS.map((slug) => ({
    url: `${baseUrl}/games/ott/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const membershipRoutes: MetadataRoute.Sitemap = MEMBERSHIPS.map((slug) => ({
    url: `${baseUrl}/games/membership/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 4. Dynamic Game Routes
  let gameRoutes: MetadataRoute.Sitemap = [];
  const manualGames = [
    { slug: "coc-manual", priority: 0.9 },
    { slug: "starlight-card-manual", priority: 0.9 },
    { slug: "bgmi-manual", priority: 0.9 },
  ];

  const manualRoutes: MetadataRoute.Sitemap = manualGames.map((g) => ({
    url: `${baseUrl}/games/${g.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: g.priority,
  }));

  try {
    const response = await fetch("https://game-off-ten.vercel.app/api/v1/game", {
      headers: { "x-api-key": process.env.API_SECRET_KEY || "" },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      const games = data?.data?.games || [];
      gameRoutes = games
        .filter((g: any) => g.gameSlug && g.gameAvailablity)
        .map((g: any) => ({
          url: `${baseUrl}/games/${g.gameSlug}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.9,
        }));
    }
  } catch (error) {
    console.error("Sitemap API generation error:", error);
  }

  return [
    ...staticRoutes,
    ...manualRoutes,
    ...gameRoutes,
    ...ottRoutes,
    ...membershipRoutes,
    ...blogRoutes,
  ];
}
