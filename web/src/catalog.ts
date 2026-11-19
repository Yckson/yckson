export type Language = 'en' | 'pt'
export const portfolios = [{
  slug: 'computer-science',
  stop: 'wing',
  title: { en: 'Computer Science', pt: 'Ciência da Computação' },
  intro: {
    en: 'Welcome to the Computer Science wing of my home lab.',
    pt: 'Boas-vindas à ala de Ciência da Computação do meu laboratório.'
  }
}] as const

export function readPreference(key: string) {
  try { return localStorage.getItem('museum.' + key) } catch { return null }
}
export function remember(key: string, value: string) {
  try { localStorage.setItem('museum.' + key, value) } catch { /* Private browsing */ }
}
export function initialLanguage(): Language {
  const saved = readPreference('language')
  if (saved === 'pt' || saved === 'en') return saved
  return /^pt(?:-|$)/i.test(navigator.language) ? 'pt' : 'en'
}
