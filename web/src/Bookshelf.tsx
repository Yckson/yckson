import type { Language } from "./catalog";

import { publications } from "./publications";

export function Bookshelf({ language }: { language: Language }) {
  return <div className="publication-shelf">
    {publications.map(paper => <details key={paper.url}>
      <summary>
        <span className="academic-meta">{paper.venue} · {"kind" in paper ? paper.kind[language] : (language === "pt" ? "Artigo" : "Paper")}</span>
        <strong>{paper.title[language]}</strong>
      </summary>
      <p className="publication-authors">{paper.authors}</p>
      <p>{paper.summary[language]}</p>
      <a className="academic-source" href={paper.url}>{language === "pt" ? "Ler publicação" : "Read publication"} ↗</a>
    </details>)}
  </div>;
}
