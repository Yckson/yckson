export type Language = 'en' | 'pt'
export const computerScience = {
  slug: 'computer-science',
  stop: 'terminal',
  title: { en: 'Computer Science', pt: 'Ciência da Computação' },
  intro: {
    en: 'Welcome to the Computer Science wing of my home lab.',
    pt: 'Boas-vindas à ala de Ciência da Computação do meu laboratório.'
  }
} as const
export const embedded = {
  slug: 'embedded-systems',
  title: { en: 'Embedded Systems Engineering', pt: 'Engenharia de Sistemas Embarcados' },
  intro: {
    en: 'Firmware and hardware working together: in SiriBots, an Arduino times each finish and sends the result over serial to an ODROID.',
    pt: 'Firmware e hardware trabalhando juntos: no SiriBots, um Arduino cronometra a chegada e envia o resultado pela serial para uma ODROID.'
  },
  project: 'SiriBots',
  url: 'https://github.com/Yckson/siribots-transmission-sys'
} as const
export const microelectronics = {
  slug: 'microelectronics-and-semiconductors',
  title: { en: 'Microelectronics and Semiconductors', pt: 'Microeletrônica e Semicondutores' },
  intro: {
    en: 'Digital design in Verilog. On the Altera DE2 FPGA board, my LCD controller drives the signals that update the text on the display.',
    pt: 'Projeto digital em Verilog. Na placa FPGA Altera DE2, meu controlador de LCD gera os sinais que atualizam o texto no display.'
  },
  project: 'Verilog · LCD / Altera DE2',
  url: 'https://github.com/Yckson/Arquitetura/tree/main/Projetos/Modulo%20LCD%20DE2%20Cyclone%20II'
} as const
export const webMobile = {
  slug: 'web-and-mobile',
  title: { en: 'Web & Mobile', pt: 'Web e Mobile' },
  intro: {
    pt: 'Desenvolvo interfaces web, APIs e aplicativos móveis. No EndoCare, trabalhei com React, NestJS e PostgreSQL. Hoje desenvolvo em React Native e Expo um aplicativo para acompanhar um dispositivo vestível.',
    en: 'I build web interfaces, APIs and mobile apps. On EndoCare, I worked with React, NestJS and PostgreSQL. I am currently building a companion app for a wearable device with React Native and Expo.'
  }
} as const
export const boards = { arduino: embedded, esp32: embedded, fpga: microelectronics } as const
export function isBoard(id: string): id is keyof typeof boards {
  return Object.hasOwn(boards, id)
}
export const portfolios = [computerScience, embedded, microelectronics, webMobile] as const

export function readPreference(key: string) {
  try { return localStorage.getItem('museum.' + key) } catch { return null }
}
export function remember(key: string, value: string) {
  try { localStorage.setItem('museum.' + key, value) } catch { /* Private browsing */ }
}
export function initialLanguage(): Language {
  const saved = readPreference('language')
  if (saved === 'pt' || saved === 'en') return saved
  return typeof navigator !== 'undefined' && /^pt(?:-|$)/i.test(navigator.language) ? 'pt' : 'en'
}
