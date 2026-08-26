export default function robots() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${domain}/sitemap.xml`,
  };
}
