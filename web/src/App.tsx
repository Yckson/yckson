import { useEffect, useRef } from 'react'
import { HashRouter, Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { initialLanguage, portfolios, remember, type Language } from './catalog'
import './style.css'

const copy = {
  en: { name: 'Portfolio Museum', title: 'The Computer Museum', explore: 'Explore the museum', list: 'View portfolios', index: 'Portfolios', caption: 'Main hall', wing: 'Portfolio wing', back: 'Return to the hall', skip: 'Skip to content', label: 'Language' },
  pt: { name: 'Museu de Portfólios', title: 'Museu da Computação', explore: 'Explorar o museu', list: 'Ver portfólios', index: 'Portfólios', caption: 'Hall principal', wing: 'Ala de portfólio', back: 'Voltar ao hall', skip: 'Pular para o conteúdo', label: 'Idioma' }
}
function MuseumPage() {
  const { lang, slug } = useParams()
  const location = useLocation()
  const content = useRef<HTMLElement>(null)
  const language: Language = lang === 'pt' ? 'pt' : 'en'
  const t = copy[language]
  const root = '/' + language
  const portfolio = portfolios.find(item => item.slug === slug)
  const index = location.pathname.endsWith('/portfolios')
  const home = !index && !portfolio
  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
    document.title = (portfolio?.title[language] ?? (index ? t.index : t.title)) + ' · Yckson'
    content.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [location.pathname, language, portfolio, index, t])
  if (lang !== 'en' && lang !== 'pt' || (slug && !portfolio)) return <Navigate replace to={'/' + initialLanguage()} />
  return <div className="shell">
    <a className="skip" href="#main" onClick={e => { e.preventDefault(); content.current?.focus() }}>{t.skip}</a>
    <header><Link className="brand" to={root}><i aria-hidden="true" className="mark" />Yckson<span className="brand-label">{t.name}</span></Link>
      <div className="utility"><nav aria-label={t.label}>{(['en', 'pt'] as const).map(l => <Link key={l} lang={l} aria-label={l === 'en' ? 'English' : 'Português'} aria-current={l === language ? 'true' : undefined} to={location.pathname.replace(/^\/(en|pt)/, '/' + l) + location.search} onClick={() => remember('language', l)}>{l.toUpperCase()}</Link>)}</nav></div>
    </header>
    <main ref={content} tabIndex={-1} id="main">
      {home && <section className="hero"><div className="hero-wall" /><div className="hero-copy"><p className="room"><i/>{t.caption}</p><h1>{t.title}</h1><div className="actions"><Link className="primary" to={root + '/portfolios'}>{t.list}<span aria-hidden="true">↗</span></Link></div></div></section>}
      {!portfolio && <section className="directory"><div className="section-head">{index ? <h1>{t.index}</h1> : <h2>{t.index}</h2>}<span className="count">({String(portfolios.length).padStart(2,'0')})</span></div>
        {portfolios.map(item => <Link className="entry" key={item.slug} to={root + '/portfolio/' + item.slug}><span className="chip" aria-hidden="true"><i/></span><strong>{item.title[language]}</strong><span className="arrow" aria-hidden="true">↗</span></Link>)}</section>}
      {portfolio && <article className="wing"><p className="room"><i/>{t.wing}</p><h1>{portfolio.title[language]}</h1><p>{portfolio.intro[language]}</p><Link className="secondary" to={root}>{t.back} ←</Link></article>}
    </main>
    <footer><Link to={root}>Yckson</Link><span>{t.name}</span></footer>
  </div>
}
export default function App() {
  return <HashRouter><Routes>{['/:lang', '/:lang/portfolios', '/:lang/portfolio/:slug'].map(path => <Route key={path} path={path} element={<MuseumPage/>}/>)}<Route path="*" element={<Navigate replace to={'/' + initialLanguage()}/>}/></Routes></HashRouter>
}
