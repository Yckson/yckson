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
    en: 'I study Computer Science at the Federal University of Sergipe (UFS), where I help lead hardware and robotics projects at CoreTECH. I write Linux device drivers and guide other students as they test hardware modules and build example applications. For SiriBots, I worked on the link between the finish line and the race broadcast: when a robot breaks a laser beam, an Arduino records its time and sends it over a serial connection to an ODROID so the result can appear on the live video.',
    pt: 'Curso Ciência da Computação na Universidade Federal de Sergipe (UFS) e coordeno projetos de hardware e robótica na CoreTECH. Desenvolvo drivers para Linux e acompanho outros estudantes nos testes de módulos de hardware e na criação de aplicações de exemplo. No SiriBots, trabalhei na integração entre a linha de chegada e a transmissão da corrida: quando um robô cruza o feixe de laser, um Arduino registra o tempo e o envia pela porta serial a uma ODROID para que o resultado apareça no vídeo ao vivo.'
  },
  project: 'SiriBots',
  url: 'https://github.com/Yckson/siribots-transmission-sys'
} as const
export const microelectronics = {
  slug: 'microelectronics-and-semiconductors',
  title: { en: 'Microelectronics and Semiconductors', pt: 'Microeletrônica e Semicondutores' },
  intro: {
    en: 'What happens inside a processor when a program asks it to read from memory or take a branch? That question shapes my work in digital design as a Computer Science student at the Federal University of Sergipe (UFS). I designed a single-cycle MIPS processor in Verilog and worked on the datapath for the RISC-V RV32I instruction set. On the Altera DE2 FPGA board, I wrote an LCD controller that generates the signals to update the display. I also helped found the IEEE Circuits and Systems Society student chapter at UFS.',
    pt: 'O que acontece dentro de um processador quando um programa pede uma leitura de memória ou um desvio? Essa pergunta orienta meu trabalho com circuitos digitais na graduação em Ciência da Computação na Universidade Federal de Sergipe (UFS). Projetei em Verilog um processador MIPS de ciclo único e trabalhei com o caminho de dados do conjunto de instruções RISC-V RV32I. Na placa FPGA Altera DE2, escrevi o controlador que gera os sinais para atualizar o texto do LCD. Também participei da fundação do capítulo estudantil da IEEE Circuits and Systems Society na UFS.'
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
