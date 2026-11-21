import type { Language, portfolios } from "./catalog";

type Technology = readonly [name: string, icon: string, portugueseName?: string];

const debugging: Technology[] = [
  ["Linux", "linux"], ["C", "c"], ["C++", "cplusplus"], ["GDB", "gdb"],
  ["GEF", "bug"], ["gprof", "chart-no-axes-column"], ["Valgrind", "memory-stick"],
];
const digitalDesign: Technology[] = [
  ["RISC-V", "riscv"], ["MIPS", "cpu"], ["Verilog", "verilog"], ["FPGA", "microchip"],
];
const technologies = {
  "embedded-systems": [...debugging, ["Arduino", "arduino"], ["ESP32", "microchip"]],
  "microelectronics-and-semiconductors": digitalDesign,
  "computer-science": [
    ...debugging, ...digitalDesign,
    ["Assembly", "assembly-generic"], ["x86 / x86-64", "assembly-intel"],
    ["Ghidra", "ghidra"], ["Arduino", "arduino"], ["FFmpeg", "ffmpeg"],
    ["Python", "python"], ["Cryptography", "key-round", "Criptografia"], ["Tree-sitter", "list-tree"],
    ["Streamlit", "streamlit"], ["React Native", "reactnative"], ["Expo", "expo"],
    ["JavaScript", "javascript"], ["PHP", "php"], ["SQL", "database"], ["React", "react"],
    ["NestJS", "nestjs"], ["PostgreSQL", "postgresql"], ["Docker Compose", "docker"],
    ["Laravel", "laravel"], ["MySQL", "mysql"], ["Git", "git"], ["GitHub", "github"],
    ["GitHub Actions", "githubactions"], ["Claude Code", "claudecode"],
    ["Codex", "codex"], ["Antigravity", "antigravity"],
  ],
} satisfies Record<(typeof portfolios)[number]["slug"], Technology[]>;

export function ExperienceTechnologies({ slug, language }: {
  slug: keyof typeof technologies;
  language: Language;
}) {
  return <ul className="experience-technologies" aria-label={language === "pt" ? "Tecnologias" : "Technologies"}>
    {technologies[slug].map(([name, icon, portugueseName]) => <li key={name}>
      <svg aria-hidden="true" width="23" height="23">
        <use href={import.meta.env.BASE_URL + "academic/technology/icons.svg#" + icon} />
      </svg>
      {language === "pt" ? portugueseName ?? name : name}
    </li>)}
  </ul>;
}
