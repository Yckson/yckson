import { computerScience, embedded, microelectronics } from "./catalog";

const pages = {
  ...Object.fromEntries([embedded, microelectronics].map(p => ["/portfolio/" + p.slug, {
    en: [p.title.en, p.intro.en], pt: [p.title.pt, p.intro.pt],
  }])),
  "": {
    en: ["Portfolio Hub", "Explore William Gabriel Yckson Araújo Braga’s home computer lab and portfolios in hardware, programming and digital systems."],
    pt: ["Hub de Portfólios", "Explore o laboratório de computação de William Gabriel Yckson Araújo Braga e seus portfólios de hardware, programação e sistemas digitais."],
  },
  "/portfolios": {
    en: ["Portfolios", "Browse Yckson’s portfolios, starting with Computer Science at the Federal University of Sergipe."],
    pt: ["Portfólios", "Conheça os portfólios de Yckson, começando por Ciência da Computação na Universidade Federal de Sergipe."],
  },
  "/articles": {
    en: ["Articles", "The bookshelf for William Gabriel Yckson Araújo Braga’s articles."],
    pt: ["Artigos", "A estante de artigos de William Gabriel Yckson Araújo Braga."],
  },
  ["/portfolio/" + computerScience.slug]: {
    en: [computerScience.title.en, "Research, projects and academic experience of William Gabriel Yckson Araújo Braga in computer architecture, Verilog and embedded systems."],
    pt: [computerScience.title.pt, "Pesquisa, projetos e trajetória acadêmica de William Gabriel Yckson Araújo Braga em arquitetura de computadores, Verilog e sistemas embarcados."],
  },
};
export const publicPaths = ["en", "pt"].flatMap(lang => Object.keys(pages).map(path => "/" + lang + path));

export function metadata(path: string, origin: string) {
  const [, locale, ...parts] = path.split("/");
  const lang = locale === "pt" ? "pt" : "en";
  const suffix = "/" + parts.join("/");
  const key = Object.hasOwn(pages, suffix) ? suffix : "";
  const [name, description] = pages[key][lang];
  const title = name + " · Yckson";
  const url = origin + "/" + lang + key;
  const tags: [string, Record<string, string>][] = [
    ["meta", { name: "description", content: description }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: origin + (key.startsWith("/portfolio/") ? "/academic/william.jpg" : "/museum/hall.jpg") }],
    ["link", { rel: "canonical", href: url }],
  ];
  for (const [locale, code] of [["en", "en"], ["pt", "pt-BR"], ["en", "x-default"]]) {
    tags.push(["link", { rel: "alternate", hrefLang: code, href: origin + "/" + locale + key }]);
  }
  return { title, description, tags, lang: lang === "pt" ? "pt-BR" : "en" };
}

export function updateHead(page: ReturnType<typeof metadata>) {
  document.title = page.title;
  document.head.querySelectorAll("[data-page-meta]").forEach(node => node.remove());
  for (const [type, attributes] of page.tags) {
    const element = document.createElement(type);
    element.setAttribute("data-page-meta", "");
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    document.head.append(element);
  }
}
