import type { Language, portfolios } from "./catalog";

type Technology = readonly [name: string, icon: string];

const debugging: Technology[] = [
  ["Linux", "linux"], ["C", "c"], ["C++", "cplusplus"], ["GDB", "gdb"],
  ["GEF", "bug"], ["gprof", "chart-no-axes-column"], ["Valgrind", "memory-stick"],
];
const digitalDesign: Technology[] = [
  ["RISC-V · RV32I", "riscv"], ["MIPS", "cpu"], ["Verilog", "verilog"],
  ["FPGA", "microchip"], ["Altera DE2", "circuit-board"], ["LCD", "monitor"],
];
const technologies = {
  "embedded-systems": debugging,
  "microelectronics-and-semiconductors": digitalDesign,
  "computer-science": [
    ...debugging, ...digitalDesign,
    ["Assembly", "assembly-generic"], ["x86 / x86-64", "assembly-intel"],
    ["PicoQuickProcessor", "cpu"], ["JIT", "binary"], ["Ghidra", "ghidra"],
    ["Arduino", "arduino"], ["ODROID", "circuit-board"], ["FFmpeg", "ffmpeg"],
    ["Python", "python"], ["Diffie–Hellman", "key-round"], ["Tree-sitter", "list-tree"],
    ["Streamlit", "streamlit"], ["React Native", "reactnative"], ["Expo · expo.dev", "expo"],
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
    {technologies[slug].map(([name, icon]) => <li key={name}>
      <svg aria-hidden="true" width="23" height="23">
        <use href={import.meta.env.BASE_URL + "academic/technology/icons.svg#" + icon} />
      </svg>
      {name}
    </li>)}
  </ul>;
}
