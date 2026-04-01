export const prerender = true;

export async function GET() {
  const site = "https://www.arbrebio.com";
  const langs = ["", "/fr", "/es", "/af"];
  const hreflangCodes = { "": "en", "/fr": "fr", "/es": "es", "/af": "af" };
  const pages = [
    "/", "/greenhouses/", "/greenhouses/high-tech/", "/greenhouses/accessories/",
    "/irrigation/", "/irrigation/drip-systems/", "/irrigation/sprinklers/", "/irrigation/controllers/",
    "/substrates/", "/substrates/growing-solutions/",
    "/projects/", "/company/", "/blog/", "/contact/", "/about/", "/solutions/"
  ];
  const today = new Date().toISOString().split("T")[0];
  const urls = [];

  for (const page of pages) {
    for (const lang of langs) {
      const loc = lang === "" ? site + page : site + lang + (page === "/" ? "/" : page);
      const alternates = langs.map(l => {
        const href = l === "" ? site + page : site + l + (page === "/" ? "/" : page);
        return `<xhtml:link rel="alternate" hreflang="${hreflangCodes[l]}" href="${href}"/>`;
      }).join("\n        ");
      urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "/" ? "1.0" : "0.8"}</priority>
    ${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${site + page}"/>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
}
