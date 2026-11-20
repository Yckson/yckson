import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const address = process.env.SITE_URL || (productionHost && "https://" + productionHost);
if (process.env.VERCEL_ENV === "production" && !address) throw Error("Set SITE_URL to the public site origin.");
const origin = new URL(address || "http://localhost:4173").origin;
const preview = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
const server = await createServer({
  ssr: { noExternal: ["react-router-dom", "react-router"], resolve: { conditions: ["module", "module-sync", "node"] } },
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { renderPage } = await server.ssrLoadModule("/scripts/renderPage.tsx");
  const { publicPaths, metadata } = await server.ssrLoadModule("/src/seo.ts");
  const template = await readFile("dist/index.html", "utf8");
  for (const path of ["/", ...publicPaths, "/en/museum", "/pt/museum"]) {
    const route = path === "/" ? "/en" : path;
    const page = metadata(route, origin);
    const tags = page.tags.map(([type, attrs]) => renderToStaticMarkup(createElement(type, {
      ...attrs, "data-page-meta": "",
    }))).join("\n");
    const content = renderPage(route);
    const file = path === "/" ? "dist/index.html" : "dist" + path + ".html";
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, template.replace('lang="en"', 'lang="' + page.lang + '" data-origin="' + origin + '"')
      .replace(/<title>.*?<\/title>/, () => "<title>" + page.title + "</title>\n" + tags +
        (preview ? '<meta name="robots" content="noindex">' : ""))
      .replace('<div id="root"></div>', () => '<div id="root">' + content + '</div>'));
  }
  await writeFile("dist/sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    publicPaths.map(path => "  <url><loc>" + origin + path + "</loc></url>").join("\n") + "\n</urlset>\n");
  await writeFile("dist/robots.txt", "User-agent: *\nAllow: /\nSitemap: " + origin + "/sitemap.xml\n");
} finally {
  await server.close();
}
