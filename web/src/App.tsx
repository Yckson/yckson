import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  initialLanguage,
  portfolios,
  remember,
  type Language,
} from "./catalog";
import { TourBoundary } from "./TourBoundary";
import { AcademicPortfolio } from "./AcademicPortfolio";
import { Accessibility, useDisplayPreferences } from "./Accessibility";
import "./style.css";
import "./lab.css";

const Tour = lazy(() => import("./Tour"));

const copy = {
  en: {
    name: "Repository Hub",
    title: "Repository Hub",
    index: "Portfolios",
    articles: "Articles",
    emptyArticles: "No articles published yet.",
    wing: "Portfolio wing",
    back: "Return to the lab",
    skip: "Skip to content",
    label: "Language",
  },
  pt: {
    name: "Hub de repositórios",
    title: "Hub de repositórios",
    index: "Portfólios",
    articles: "Artigos",
    emptyArticles: "Nenhum artigo publicado por enquanto.",
    wing: "Ala de portfólio",
    back: "Voltar ao laboratório",
    skip: "Pular para o conteúdo",
    label: "Idioma",
  },
};
function MuseumPage() {
  const { lang, slug } = useParams();
  const location = useLocation();
  const content = useRef<HTMLElement>(null);
  const language: Language = lang === "pt" ? "pt" : "en";
  const t = copy[language];
  const root = "/" + language;
  const portfolio = portfolios.find((item) => item.slug === slug);
  const index = location.pathname.endsWith("/portfolios");
  const articles = location.pathname.endsWith("/articles");
  const touring = !index && !portfolio && !articles;
  const prefs = useDisplayPreferences();

  const navigate = useNavigate();
  const onLoss = useCallback(
    () => navigate(root + "/portfolios?view=unavailable", { replace: true }),
    [root, navigate],
  );
  const returnUrl =
    portfolio &&
    new URLSearchParams(location.search).get("from") === portfolio.stop
      ? root + "/museum?stop=" + portfolio.stop
      : root;
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
    document.title =
      (portfolio?.title[language] ??
        (index ? t.index : articles ? t.articles : t.title)) + " · Yckson";
    content.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname, language, portfolio, index, articles, t]);
  if ((lang !== "en" && lang !== "pt") || (slug && !portfolio))
    return <Navigate replace to={"/" + initialLanguage()} />;
  return (
    <div
      className={touring ? "shell immersive" : "shell"}
      data-contrast={prefs.contrast}
    >
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          content.current?.focus();
        }}
      >
        {t.skip}
      </a>
      <header>
        <Link className="brand" to={root}>
          <i aria-hidden="true" className="mark" />
          {t.name}
        </Link>
        <div className="utility">
          {touring && (
            <Link className="index-shortcut" to={root + "/portfolios"}>
              {t.index} ↗
            </Link>
          )}
          <nav aria-label={t.label}>
            {(["en", "pt"] as const).map((l) => (
              <Link
                key={l}
                lang={l}
                aria-label={l === "en" ? "English" : "Português"}
                aria-current={l === language ? "true" : undefined}
                to={
                  location.pathname.replace(/^\/(en|pt)/, "/" + l) +
                  location.search
                }
                onClick={() => remember("language", l)}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
          <Accessibility language={language} prefs={prefs} />
        </div>
      </header>
      <main ref={content} tabIndex={-1} id="main">
        {touring && (
          <TourBoundary onLoss={onLoss}>
            <Suspense
              fallback={
                <p role="status">
                  {language === "pt"
                    ? "Carregando o laboratório…"
                    : "Loading the lab…"}
                </p>
              }
            >
              <Tour
                language={language}
                reduced={prefs.reduced}
                onLoss={onLoss}
              />
            </Suspense>
          </TourBoundary>
        )}
        {index &&
          new URLSearchParams(location.search).get("view") ===
            "unavailable" && (
            <p className="notice" role="status">
              {language === "pt"
                ? "O passeio 3D está indisponível. Você pode acessar os portfólios abaixo."
                : "The 3D tour is unavailable. You can explore the portfolios below."}
            </p>
          )}
        {index && (
          <section className="directory">
            <div className="section-head">
              <h1>{t.index}</h1>
              <span className="count">
                ({String(portfolios.length).padStart(2, "0")})
              </span>
            </div>
            {portfolios.map((item) => (
              <Link
                className="entry"
                key={item.slug}
                to={root + "/portfolio/" + item.slug}
              >
                <span className="chip" aria-hidden="true">
                  <i />
                </span>
                <strong>{item.title[language]}</strong>
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
            <Link className="secondary" to={root + "/articles"}>
              {t.articles} ↗
            </Link>
          </section>
        )}
        {articles && (
          <article className="wing">
            <h1>{t.articles}</h1>
            <p>{t.emptyArticles}</p>
            <Link
              className="secondary"
              to={
                new URLSearchParams(location.search).get("from") === "books"
                  ? root + "/museum?stop=books"
                  : root
              }
            >
              {t.back} ←
            </Link>
          </article>
        )}
        {portfolio && (
          <AcademicPortfolio language={language} returnUrl={returnUrl} />
        )}
      </main>
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Routes>
        {[
          "/:lang",
          "/:lang/museum",
          "/:lang/portfolios",
          "/:lang/articles",
          "/:lang/portfolio/:slug",
        ].map((path) => (
          <Route key={path} path={path} element={<MuseumPage />} />
        ))}
        <Route
          path="*"
          element={<Navigate replace to={"/" + initialLanguage()} />}
        />
      </Routes>
    </HashRouter>
  );
}
