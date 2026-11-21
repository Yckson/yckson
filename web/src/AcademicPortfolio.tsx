import { Link, useSearchParams } from "react-router-dom";
import { computerScience, embedded, microelectronics, portfolios, type Language } from "./catalog";
import "./academic.css";
import { ExperienceTechnologies } from "./ExperienceTechnologies";
import { ifbaResearch } from "./publications";

const sectionNames = {
  research: ["Pesquisa", "Research"],
  projects: ["Projetos", "Projects"],
  experience: ["Experiência", "Experience"],
  community: ["Comunidade", "Community"],
  achievements: ["Conquistas", "Achievements"],
  studies: ["Formação", "Education"],
  recommendations: ["Recomendações & Certificações", "Recommendations & Certifications"],
} as const;

const terms = [
  ["2026.2", "Em andamento", "In progress", "Interface Humano-Computador, Computação Gráfica, Análise de Sistemas Lineares e Prática Orientada em Computação II.", "Human–computer interaction, computer graphics, linear systems analysis and supervised computing practice II."],
  ["2026.1", "Computação aplicada", "Applied computing", "Prática Orientada em Computação I, Equações Diferenciais I e Cálculo Numérico I.", "Supervised computing practice I, differential equations and numerical methods."],
  ["2025.2", "Do compilador aos sistemas distribuídos", "From compilers to distributed systems", "Compiladores, Sistemas Distribuídos, Inteligência Artificial, Processamento de Imagens e Engenharia de Software II.", "Compilers, distributed systems, artificial intelligence, image processing and software engineering II."],
  ["2025.1", "Software de sistemas", "Systems software", "Interface Hardware/Software, Sistemas Operacionais, Redes, Programação Paralela e Concorrente, Banco de Dados I, Engenharia de Software I e Informática, Ética e Sociedade.", "Hardware/software interfaces, operating systems, networks, parallel and concurrent programming, databases, software engineering and computing ethics."],
  ["2024.2", "Arquitetura e algoritmos", "Architecture and algorithms", "Arquitetura de Computadores, Sistemas Embarcados, Grafos, Projeto e Análise de Algoritmos, Estatística Aplicada e Métodos de Pesquisa.", "Computer architecture, embedded systems, graphs, algorithm design and analysis, applied statistics and research methods."],
  ["2024.1", "Circuitos e estruturas de dados", "Circuits and data structures", "Fundamentos e Prática de Sistemas Digitais, Estruturas de Dados, Programação Orientada a Objetos, Linguagens Formais e Computabilidade e Cálculo C.", "Digital systems theory and lab, data structures, object-oriented programming, formal languages and computability, and calculus C."],
  ["2023.2", "Lógica e programação imperativa", "Logic and imperative programming", "Lógica para Computação, Programação Imperativa, Álgebra Linear I, Cálculo B, Física I e Laboratório de Física I.", "Logic for computing, imperative programming, linear algebra, calculus B, physics and physics lab."],
  ["2023.1", "Ingresso na UFS", "Starting at UFS", "Programação Funcional, Seminários em Computação, Fundamentos Elementares da Matemática, Vetores e Geometria Analítica e Cálculo A.", "Functional programming, computing seminars, elementary mathematics, vectors and analytic geometry, and calculus A."],
];

export function AcademicPortfolio({ portfolio, language, returnUrl }: { portfolio: (typeof portfolios)[number]; language: Language; returnUrl: string }) {
  const pt = language === "pt";
  const t = (portuguese: string, english: string) => pt ? portuguese : english;
  const [params] = useSearchParams();
  const sections = Object.keys(sectionNames) as (keyof typeof sectionNames)[];
  const section = sections.find(key => key === params.get("section")) ?? "research";
  const renderEntry = (meta: string, title: string, body: string, url?: string, linkLabel = "GitHub") => (
    <div className="academic-entry" key={meta + title}>
      <span className="academic-meta">{meta}</span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
        {url && <a className="academic-source" href={url} aria-label={linkLabel + " · " + title}>{linkLabel} ↗</a>}
      </div>
    </div>
  );
  const cs = portfolio === computerScience;
  const isEmbedded = portfolio === embedded;
  const isMicro = portfolio === microelectronics;
  const omit = () => null;
  const entry = cs ? renderEntry : omit;
  const embeddedEntry = cs || isEmbedded ? renderEntry : omit;
  const digitalEntry = cs || isMicro ? renderEntry : omit;
  const coreTechPartnerships = () => renderEntry("CoreTECH · UFS", t("Parcerias com a Toradex e a Espressif", "Partnerships with Toradex and Espressif"), t(
          "Participei da criação da liga de hardware da UFS e das parcerias com a Toradex e a Espressif. Na CoreTECH, coordenei estudantes nos testes de módulos antes do lançamento e no desenvolvimento de drivers e aplicações de exemplo.",
          "I helped establish the UFS hardware league and its partnerships with Toradex and Espressif. At CoreTECH, I coordinated students testing pre-release modules and developing drivers and example applications."
        ));
  return <article className="academic">
    <div className="academic-cover">
      <div>
        <p className="academic-meta">{t("Departamento de Computação (DCOMP)", "Department of Computing (DCOMP)")}</p>
        <h1>{portfolio.title[language]}</h1>
        <h2>William Gabriel Yckson Araújo Braga</h2>
        <p>{cs ? t("Minha formação em Tecnologia da Informação (TI) começou com o curso técnico em Informática no Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA). Em 2023, entrei na graduação em Ciência da Computação na Universidade Federal de Sergipe (UFS). Gosto de acompanhar o caminho que uma instrução percorre, do programa ao circuito. Foi esse interesse que me levou a construir um processador em Verilog e a trabalhar com sistemas embarcados na Liga Acadêmica de Hardware e Robótica da UFS (CoreTECH).", "I started my degree at the Federal University of Sergipe (UFS) in 2023 after completing a technical program in Information Technology (IT) at the Federal Institute of Education, Science and Technology of Bahia (IFBA). I like following an instruction from the program down to the circuit. That curiosity led me to build a processor in Verilog and work on embedded systems with the university’s Academic League for Hardware and Robotics (CoreTECH).") : portfolio.intro[language]}</p>
      </div>
      <div>
        <img src={import.meta.env.BASE_URL + "academic/william.jpg"} width="1080" height="1080" alt={t("William Gabriel ao ar livre no campus", "William Gabriel outdoors on campus")} />
        <div className="academic-profiles">
        <a href="https://www.linkedin.com/in/william-gabriel-braga-40a319255/" target="_blank" rel="noopener noreferrer">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 16 16" fill="#0a66c2">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zM4.943 13.394V6.169H2.542v7.225zM3.743 5.182c.837 0 1.358-.554 1.358-1.248-.015-.709-.521-1.248-1.342-1.248s-1.359.54-1.359 1.248c0 .694.521 1.248 1.327 1.248zM8.652 13.394V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.4V9.25c0-2.22-1.184-3.253-2.764-3.253-1.274 0-1.845.7-2.164 1.193V6.169h-2.4c.031.678 0 7.225 0 7.225z" />
          </svg>
          LinkedIn
        </a>
        <a href="https://github.com/Yckson" target="_blank" rel="noopener noreferrer">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.49c-2.23.49-2.7-.95-2.7-.95-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.72 1.22 1.87.87 2.33.67.07-.52.28-.87.51-1.07-1.78-.2-3.65-.89-3.65-3.96 0-.88.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.66 7.66 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.08-1.88 3.75-3.67 3.95.29.25.54.74.54 1.49v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/>
          </svg>
          GitHub
        </a>
        </div>
      </div>
    </div>
    <nav className="academic-nav" aria-label={t("Seções do portfólio", "Portfolio sections")}>{sections.map(key => {
      const next = new URLSearchParams(params);
      next.set("section", key);
      return <Link key={key} preventScrollReset to={{ search: next.toString() }} aria-current={key === section ? "page" : undefined}>{sectionNames[key][pt ? 0 : 1]}</Link>;
    })}</nav>
    <section className="academic-section">
      <h2>{sectionNames[section][pt ? 0 : 1]}</h2>
      {section === "research" && <>
        {cs && ifbaResearch.map(paper => renderEntry(
          paper.venue + " · " + paper.kind[language], paper.title[language],
          paper.summary[language], paper.url, t("Ler publicação", "Read publication")
        ))}
        {entry("PIBIC · 2025/2026", t("Determinação de Plágio em Código-fonte", "Detecting Plagiarism in Source Code"), t("Na iniciação científica, sob orientação de Bruno Otávio Piedade Prado, investiguei se ainda é possível reconhecer a origem comum de dois programas em C ou C++ depois que a forma do código muda. Usamos o MAU para preparar pares de programas do Code4Bench, verificamos seu comportamento e extraímos blocos sintáticos com Tree-sitter.", "In my undergraduate research supervised by Bruno Otávio Piedade Prado, I studied whether two C or C++ programs could still be traced to a common source after changes to their code. We used MAU to prepare pairs from Code4Bench, checked their behavior and extracted syntax blocks with Tree-sitter."))}
        {renderEntry(t("Publicado na ERBASE 2025 · DCOMP", "Published at ERBASE 2025 · DCOMP"), t("Explorando Pensamento Computacional com Minecraft e Arduino para Iniciação à Programação e Microeletrônica", "Exploring Computational Thinking with Minecraft and Arduino to Introduce Programming and Microelectronics"), t("Na Escola Regional de Computação Bahia, Alagoas e Sergipe (ERBASE), publiquei este artigo com Davi Araújo do Nascimento. Construímos três protótipos para explorar o ensino de programação e microeletrônica. Um botão físico acionava uma plantação no Minecraft, uma intrusão no jogo disparava um alarme e um LED indicava a atividade de uma fornalha virtual. Verificamos a troca de sinais nos três protótipos. A avaliação com estudantes ficou para uma etapa futura.", "Davi Araújo do Nascimento and I published this paper at the Regional School of Computing for Bahia, Alagoas and Sergipe (ERBASE). We built three prototypes for teaching programming and microelectronics. A physical button triggered a Minecraft farm, an intrusion in the game set off an alarm, and an LED indicated when a virtual furnace was active. We verified signal exchange in all three prototypes. Evaluation with students remains an open question."))}
        {digitalEntry(
          t("Publicado na ERBASE 2025 · DCOMP e Programa de Pós-Graduação em Ciência da Computação (PROCC)", "Published at ERBASE 2025 · DCOMP and Graduate Program in Computer Science (PROCC)"),
          t("Uso de Jogos no Ensino de Arquitetura de Processadores e Sistemas Digitais: Um Mapeamento Sistemático", "Using Games to Teach Processor Architecture and Digital Systems: A Systematic Mapping Study"),
          t("Com Pedro Vitor Lima de Almeida, Verônica dos Santos Nascimento e Gilton José Ferreira da Silva, mapeei como professores e pesquisadores usam jogos para ensinar arquitetura de processadores e sistemas digitais. Um dos estudos propõe nove laboratórios em Minecraft para explorar circuitos digitais. Os trabalhos analisados relatam maior envolvimento dos estudantes e ganhos de compreensão, mas diferenças entre os métodos de avaliação dificultam comparar os resultados.", "With Pedro Vitor Lima de Almeida, Verônica dos Santos Nascimento and Gilton José Ferreira da Silva, I mapped how educators and researchers use games to teach processor architecture and digital systems. One study proposes nine Minecraft labs for exploring digital circuits. The studies report stronger student engagement and better understanding, though differences in how they assessed learning make their results difficult to compare.")
        )}
      </>}
      {section === "projects" && <>
        {entry("C++ · x86-64", "PicoQuickProcessor (PQP)", t(
          "Como executar em um computador x86-64 um programa escrito para um processador de 32 bits com apenas 256 bytes de memória? Trabalhei com a arquitetura didática criada pelo professor Bruno Otávio Piedade Prado. O repositório reúne um interpretador e um compilador just-in-time (JIT) que traduz instruções do PQP para código de máquina x86-64 durante a execução. Documentei a tradução das operações aritméticas, dos acessos à memória e dos desvios.",
          "How do you run a program written for a 32-bit processor with just 256 bytes of memory on an x86-64 computer? I worked with the teaching architecture designed by Professor Bruno Otávio Piedade Prado. The repository includes an interpreter and a just-in-time (JIT) compiler that translates PQP instructions into x86-64 machine code at runtime. I documented how arithmetic, memory operations and branches are translated."
        ), "https://github.com/Yckson/PicoQuickProcessor")}
        {embeddedEntry("ODROID · Arduino · FFmpeg", t("SiriBots — transmissão local e cronometragem de corridas", "SiriBots — local video streaming and race timing"), t(
          "Para o SiriBots, trabalhei em um sistema que reúne as câmeras da pista e a cronometragem da chegada. O operador escolhe entre uma webcam ligada a um computador e uma câmera conectada a uma placa ODROID. Outras fontes podem participar por meio de um conector próprio. Na linha de chegada, o Arduino registra o tempo quando o robô cruza o feixe de laser. A ODROID recebe esse tempo pela porta serial e o envia à central de transmissão, onde o operador pode sobrepô-lo ao vídeo. O público acompanha a corrida em um aplicativo que encontra a central na rede local.",
          "For SiriBots, I worked on a system that brings track cameras and finish-line timing into the same broadcast. The operator can switch between a computer webcam and a camera connected to an ODROID board. Other sources can join through their own connectors. When a robot crosses the laser beam at the finish line, the Arduino records its finish time. The ODROID reads that time over a serial connection and sends it to the streaming hub, where the operator can overlay it on the video. Spectators watch through an app that discovers the hub on the local network."
        ), "https://github.com/Yckson/siribots-transmission-sys/branches")}
        {entry("React · NestJS · PostgreSQL", "EndoCare", t(
          "Na disciplina de Engenharia de Software II, participei do desenvolvimento de uma aplicação para acompanhar sintomas de endometriose. A interface em React se comunica com uma API em NestJS, com módulos de tratamentos, relatórios e permissões. O repositório inclui a especificação do sistema e a configuração Docker Compose para executar a aplicação com seu banco de dados.",
          "In Software Engineering II, I worked on a web application for tracking endometriosis symptoms. Its React interface connects to a NestJS API with modules for treatments, reports and permissions. The repository includes the system specification and a Docker Compose setup for running the application with its database."
        ), "https://github.com/Yckson/endocare")}
        {entry("Python · Streamlit", t("N-gramas aplicados a código C", "N-grams for C source code"), t(
          "Em um projeto em equipe para a disciplina de Inteligência Artificial, usamos sequências curtas de tokens para comparar programas em C e sugerir o próximo token de um trecho de código. Na interface em Streamlit, é possível comparar a similaridade de Jaccard antes e depois da normalização sintática com Tree-sitter.",
          "For a team project in our artificial intelligence course, we used short token sequences to compare C programs and suggest the next token in a code fragment. The Streamlit interface lets you compare Jaccard similarity before and after syntax normalization with Tree-sitter."
        ), "https://github.com/Yckson/n-grams")}
        {entry("C++ · ncurses", t("Visualizador 3D no terminal", "3D viewer in the terminal"), t(
          "Construí um visualizador que lê modelos no formato OBJ e os renderiza diretamente no terminal com ncurses. Também é possível capturar os quadros em formato PPM e convertê-los em vídeo com FFmpeg. O repositório inclui modelos para experimentar e um vídeo de exemplo.",
          "I built a viewer that reads OBJ models and renders them directly in the terminal using ncurses. It can also capture PPM frames for conversion to video with FFmpeg. The repository includes sample models and a recorded demonstration."
        ), "https://github.com/Yckson/3D-terminal")}
        {digitalEntry("Verilog HDL", "MIPS single-cycle", t("Na disciplina de Arquitetura de Computadores, projetei e implementei um processador MIPS de ciclo único. O circuito executa instruções aritméticas, lógicas, de acesso à memória e de controle de fluxo.", "For my computer architecture course, I designed and implemented a single-cycle MIPS processor that executes arithmetic, logic, memory and control-flow instructions."), "https://github.com/Yckson/Arquitetura/tree/main/Projetos/MIPS%20Ciclo%20%C3%9Anico")}
        {renderEntry("FPGA · Altera DE2", t("Escrita no LCD", "Writing to the LCD"), t("Desenvolvi em Verilog o módulo que controla o protocolo do LCD da placa DE2 com FPGA Cyclone II. Com ele, é possível atualizar as cadeias de caracteres exibidas pelo próprio circuito.", "I wrote a Verilog module that drives the LCD protocol on the Cyclone II–based DE2 board, allowing the circuit to update the text on the display."), "https://github.com/Yckson/Arquitetura/tree/main/Projetos/Modulo%20LCD%20DE2%20Cyclone%20II")}
        {digitalEntry("RV32I · Assembly", t("Caminho de dados RISC-V", "RISC-V datapath"), t("Meus estudos de arquitetura incluem um caminho de dados para RV32I e programas em Assembly MIPS.", "My architecture work includes an RV32I datapath and MIPS assembly programs."), "https://github.com/Yckson/RISC-V-RV32I")}
        {entry(t("Projeto e Análise de Algoritmos", "Algorithm Design and Analysis"), t("AES e Diffie–Hellman em C", "AES and Diffie–Hellman in C"), t(
          "Implementei em C a cifra AES em modo ECB e a troca de chaves Diffie–Hellman de 2.048 bits. Para trabalhar com números desse tamanho, escrevi as operações de aritmética de inteiros grandes e usei a redução de Barrett nos cálculos modulares.",
          "I implemented the AES cipher in ECB mode and 2,048-bit Diffie–Hellman key exchange in C. To handle numbers of that size, I wrote the large-integer arithmetic and used Barrett reduction for modular calculations."
        ), "https://github.com/Yckson/PAA/tree/main/Projetos/III_UNIDADE/Criptografia")}
        {entry("KMP · Dijkstra", t("Algoritmos e geração de código", "Algorithms and code generation"), t("Implementei busca de padrões com KMP, percursos em largura e profundidade e caminhos mínimos com Dijkstra. Também trabalhei com ordenação, programação dinâmica e geração de código em tempo de execução.", "I implemented KMP pattern matching, breadth-first and depth-first traversals, and Dijkstra’s shortest-path algorithm. I also worked on sorting, dynamic programming and runtime code generation."))}
        {entry("LED · Luz na Educação", "Divulga Aí", t("Liderei o desenvolvimento da aplicação de divulgação de eventos e iniciativas educacionais, trabalhando tanto na interface quanto no backend.", "I led development of an application for sharing educational events and initiatives, working on both the interface and the backend."))}
        {entry("Laravel · PHP · MySQL", t("Evasão escolar", "School dropout analysis"), t("Desenvolvi uma aplicação web para ajudar a identificar possíveis casos de evasão no ensino médio.", "I developed a web application to help identify potential cases of students dropping out of secondary school."))}
      </>}
      {section === "experience" && <>
        <ExperienceTechnologies slug={portfolio.slug} language={language} />
        {isMicro && renderEntry("RV32I", t("Caminho de dados RISC-V", "RISC-V datapath"), t(
          "Nos meus estudos de arquitetura de computadores, trabalhei com o caminho de dados do processador para o conjunto de instruções RV32I.",
          "In my computer architecture studies, I worked on the processor datapath for the RV32I instruction set."
        ), "https://github.com/Yckson/RISC-V-RV32I")}
        {isMicro && renderEntry("Verilog · FPGA", t("Projeto de circuitos digitais", "Digital circuit design"), t(
          "Projetei um processador MIPS de ciclo único e um controlador de LCD para a Altera DE2.",
          "I designed a single-cycle MIPS processor and an LCD controller for the Altera DE2."
        ))}
        {embeddedEntry("Linux · C · C++", t("Drivers e programação em nível de kernel", "Device drivers and kernel programming"), t(
          "Na disciplina de Interface Hardware/Software (IHS), desenvolvi drivers para Linux e programei em nível de kernel. Na CoreTECH, também coordenei estudantes no teste de módulos de hardware e no desenvolvimento de drivers e aplicações de exemplo.",
          "In my Hardware/Software Interface course, I developed Linux device drivers and wrote kernel-level code. At CoreTECH, I also coordinated students testing hardware modules and developing drivers and example applications."
        ))}
        {entry("RISC-V · x86 · MIPS", t("Assembly e geração de código de máquina", "Assembly and machine-code generation"), t(
          "Programo em Assembly para RISC-V e x86 e escrevi programas para MIPS. No PicoQuickProcessor, trabalhei em C++ com tradução binária: o compilador just-in-time transforma instruções de um processador didático em código x86-64 durante a execução.",
          "I write assembly for RISC-V and x86 and have written MIPS assembly programs. On PicoQuickProcessor, I worked on binary translation in C++: the just-in-time compiler turns instructions for a teaching processor into x86-64 machine code at runtime."
        ))}
        {embeddedEntry("GDB · GEF · gprof · Valgrind", t("Depuração e análise de desempenho", "Debugging and profiling"), t(
          "Tenho boa experiência com o depurador GDB e sua extensão GEF para acompanhar instruções e inspecionar registradores e memória. Uso gprof para identificar onde um programa concentra tempo de execução e Valgrind para investigar o uso da memória.",
          "I’m comfortable using GDB with the GEF extension to step through instructions and inspect registers and memory. I use gprof to identify where a program spends its time and Valgrind to investigate memory use."
        ))}
        {entry("Ghidra", t("Engenharia reversa", "Reverse engineering"), t(
          "Tenho experiência inicial com o Ghidra para estudar programas compilados e interpretar o código desmontado. Na IEEEXtreme 20.0, minha equipe foi a única no Brasil a resolver o desafio de engenharia reversa.",
          "I have introductory experience using Ghidra to study compiled programs and read disassembly. At IEEEXtreme 20.0, my team was the only one in Brazil to solve the reverse engineering challenge."
        ))}
        {entry("Verilog · FPGA · Arduino · ODROID", t("Circuitos digitais e sistemas embarcados", "Digital design and embedded systems"), t(
          "Projetei um processador MIPS de ciclo único e um controlador de LCD em Verilog para a placa Altera DE2. Também trabalhei com o caminho de dados RISC-V RV32I. No SiriBots, integrei hardware e software em um sistema que reúne captura de vídeo, transmissão com FFmpeg e cronometragem de chegada por Arduino.",
          "I designed a single-cycle MIPS processor and wrote a Verilog LCD controller for the Altera DE2 board. I also worked on an RV32I datapath. On SiriBots, I worked across hardware and software to bring video capture, FFmpeg streaming and Arduino finish-line timing into one system."
        ))}
        {entry("C · C++ · Python", t("Algoritmos e análise de código", "Algorithms and source-code analysis"), t(
          "Implemento estruturas de dados, algoritmos de grafos, busca de padrões e programação dinâmica. Em C, escrevi a aritmética de inteiros grandes para uma troca de chaves Diffie–Hellman. Na pesquisa, usei Tree-sitter para comparar blocos de código. Em Inteligência Artificial, trabalhei com Python e Streamlit para explorar n-gramas e sugerir o próximo token em código C.",
          "I implement data structures, graph algorithms, pattern matching and dynamic programming. In C, I wrote the large-integer arithmetic for Diffie–Hellman key exchange. In my research, I used Tree-sitter to compare code blocks. In my AI course, I worked with Python and Streamlit to explore n-grams and predict the next token in C code."
        ))}
        {entry("React Native · Expo", t("Aplicativo para um dispositivo vestível", "Mobile app for a wearable device"), t(
          "Na disciplina de Prática Orientada em Computação, estou desenvolvendo um projeto que combina um componente vestível e um aplicativo móvel. Desenvolvo o aplicativo em React Native com Expo e uso o ambiente de desenvolvimento em nuvem do Expo (expo.dev).",
          "For my supervised computing project, I’m developing a wearable component and its companion mobile app. I’m building the app with React Native and Expo, using Expo’s cloud development environment (expo.dev)."
        ))}
        {entry("JavaScript · PHP · SQL", t("Aplicações web e bancos de dados", "Web applications and databases"), t(
          "Trabalho da interface ao banco de dados. No EndoCare, participei de uma aplicação com React, NestJS, PostgreSQL e Docker Compose. Para o projeto sobre evasão escolar, desenvolvi uma aplicação com Laravel e MySQL. Uso Git e GitHub para versionar código e organizar o trabalho em equipe. Também configuro workflows no GitHub Actions para automatizar tarefas do projeto e trabalho com agentes de desenvolvimento usando Claude Code, Codex e Antigravity.",
          "I work across the interface, backend and database. On EndoCare, I contributed to an application built with React, NestJS, PostgreSQL and Docker Compose. For the school dropout project, I developed a web application with Laravel and MySQL. I use Git and GitHub for version control and team collaboration. I also configure GitHub Actions workflows to automate project tasks and use Claude Code, Codex and Antigravity for agent-assisted development."
        ))}
        {entry("CoreTECH · SofTeam", t("Liderança e organização de equipes", "Team leadership and project coordination"), t(
          "Na CoreTECH, organizo projetos de hardware, distribuo atividades e acompanho os estudantes nos testes. Na SofTeam, concilio decisões de implementação com o acompanhamento de escopo, prioridades e prazos em projetos de software.",
          "At CoreTECH, I organize hardware projects, coordinate tasks and support students during testing. At SofTeam, I balance implementation decisions with tracking scope, priorities and deadlines for software projects."
        ))}
        {entry(t("Pesquisa · Eventos · Maratonas", "Research · Events · Contests"), t("Comunicação, colaboração e resolução de problemas", "Communication, collaboration and problem-solving"), t(
          "Escrevi artigos em coautoria e apresentei resultados de pesquisa em pôster. Na organização do workshop de circuitos e sistemas, trabalhei com estudantes, pesquisadores e empresas. Nas maratonas de programação, pratico a resolução de problemas em equipe sob limite de tempo.",
          "I co-authored papers and communicated research findings through a poster. Organizing the circuits and systems workshop involved working with students, researchers and companies. Programming contests give me practice solving problems as a team under time constraints."
        ))}
        {entry(t("Idiomas", "Languages"), t("Português e inglês", "Portuguese and English"), t(
          "Português é minha língua nativa. Sou fluente em inglês, tanto na comunicação oral quanto na escrita.",
          "Portuguese is my native language. I am fluent in both spoken and written English."
        ))}
      </>}
      {section === "achievements" && <>
        {isEmbedded && coreTechPartnerships()}
        {isMicro && renderEntry("CSBC 2026 · Gramado", "Cadathlon", t(
          "Minha equipe conquistou o primeiro lugar entre as equipes do Nordeste no Cadathlon, em Gramado.",
          "At the Cadathlon in Gramado, my team placed first among teams from Northeast Brazil."
        ))}
        {renderEntry("2025 · Lagarto, Sergipe", t("1º lugar na PROGBASE", "First place at PROGBASE"), t(
          "Minha equipe venceu a maratona de programação da Escola Regional de Computação Bahia, Alagoas e Sergipe (ERBASE).",
          "My team won the programming contest at the Regional School of Computing for Bahia, Alagoas and Sergipe (ERBASE)."
        ))}
        {renderEntry("2025 · São Paulo", t("Finalista da Maratona de Programação da SBC", "Brazilian Programming Marathon national finalist"), t(
          "Minha equipe disputou a final nacional da Maratona de Programação da Sociedade Brasileira de Computação (SBC) no bairro da Liberdade, em São Paulo.",
          "My team competed in the national finals of the Brazilian Computer Society (SBC) Programming Marathon in São Paulo’s Liberdade neighborhood."
        ))}
      </>}
      {section === "community" && <>
        {isMicro && coreTechPartnerships()}
        {entry("2026", "IEEEXtreme 20.0", t(
          "Minha equipe ficou em 15º lugar no Brasil nessa competição internacional de programação de 24 horas. Fomos a única equipe brasileira a resolver o desafio de engenharia reversa da edição.",
          "My team placed 15th in Brazil in this international 24-hour programming competition. We were the only Brazilian team to solve this edition’s reverse engineering challenge."
        ))}
        {entry(t("Congresso da Sociedade Brasileira de Computação (CSBC) 2026 · Gramado", "Brazilian Computer Society Congress (CSBC) 2026 · Gramado"), "Cadathlon", t(
          "Em Gramado, disputei o Cadathlon com minha equipe e conquistamos o primeiro lugar entre as equipes do Nordeste.",
          "My team and I competed in the Cadathlon in Gramado and placed first among teams from Northeast Brazil."
        ))}
        {entry("ERBASE 2025 · Lagarto, Sergipe", "PROGBASE", t(
          "Minha equipe conquistou o primeiro lugar na PROGBASE, a maratona de programação da Escola Regional de Computação Bahia, Alagoas e Sergipe (ERBASE).",
          "My team won first place at PROGBASE, the programming contest at the Regional School of Computing for Bahia, Alagoas and Sergipe (ERBASE)."
        ))}
        {entry("CSBC 2025 · Alagoas", t("Escola de Inverno da Maratona de Programação", "Programming Marathon Winter School"), t(
          "Durante o congresso, participei da Escola de Inverno da Maratona de Programação da Sociedade Brasileira de Computação (SBC). Minha equipe ficou em quinto lugar na competição da escola.",
          "During the congress, I took part in the Brazilian Computer Society’s Programming Marathon Winter School. My team placed fifth in the school’s competition."
        ))}
        {renderEntry("CoreTECH · 03/2025", t("Direção de projetos de hardware e robótica", "Leading hardware and robotics projects"), t("Na liga acadêmica da UFS, coordeno equipes, organizo repositórios e acompanho entregas técnicas. Entre os projetos estão uma instrução SHA-256 para um simulador RISC-V, captação de energia para alimentar um nó IoT e atividades com módulos Toradex baseados no NXP i.MX95.", "At the UFS academic league, I coordinate teams, organize repositories and track technical deliverables. Projects include a SHA-256 instruction for a RISC-V simulator, energy harvesting to power an IoT node, and work with Toradex modules based on the NXP i.MX95."))}
        {entry("SofTeam · 2025", t("Da coordenação ao código", "From coordination to code"), t("Na empresa júnior de computação da UFS, acompanho escopo, prioridades e cronogramas de projetos de software. Também participei do desenvolvimento de um sistema de gestão de estoque.", "At the UFS student-run computing company, I track project scope, priorities and schedules. I also contributed to the development of an inventory management system."))}
        {digitalEntry("2025", t("Circuitos e sistemas em Sergipe", "Circuits and systems in Sergipe"), t("Sou membro fundador do capítulo estudantil da Circuits and Systems Society (CASS) do Institute of Electrical and Electronics Engineers (IEEE) na UFS. Participei da organização do primeiro IEEE CASS Sergipe Workshop, que reuniu pesquisadores e profissionais da indústria.", "I am a founding member of the UFS student chapter of the Circuits and Systems Society (CASS), part of the Institute of Electrical and Electronics Engineers (IEEE). I helped organize the first IEEE CASS Sergipe Workshop, bringing together researchers and industry professionals."))}
      </>}
      {section === "studies" && <>
        {!cs && renderEntry("UFS · 2024.1", t("Sistemas digitais", "Digital systems"), t("Cursei Fundamentos e Prática de Sistemas Digitais.", "I studied digital systems theory and completed the accompanying lab."))}
        {!cs && renderEntry("UFS · 2024.2", t("Arquitetura de Computadores", "Computer Architecture"), isEmbedded
          ? t("Cursei Arquitetura de Computadores e Sistemas Embarcados.", "I took Computer Architecture and Embedded Systems.")
          : t("Na disciplina de Arquitetura de Computadores, implementei em Verilog um processador MIPS de ciclo único.", "In Computer Architecture, I implemented a single-cycle MIPS processor in Verilog."))}
        {isEmbedded && renderEntry("UFS · 2025.1", t("Interface Hardware/Software", "Hardware/Software Interface"), t("Na disciplina de Interface Hardware/Software, desenvolvi drivers para Linux. Nesse semestre também cursei Sistemas Operacionais e Redes.", "I developed Linux drivers in Hardware/Software Interface. That semester I also took Operating Systems and Networks."))}
        {cs && terms.map(([term, ptTitle, enTitle, ptBody, enBody]) => entry(term, t(ptTitle,enTitle), t(ptBody,enBody)))}
        {entry("IFBA · Seabra", t("Técnico em Informática", "Technical education in IT"), t("Antes de entrar na UFS, fiz o curso técnico integrado em Informática no Instituto Federal da Bahia. Complementei a formação com cursos de front-end, banco de dados e web design em 2023.", "Before entering UFS, I studied IT in an integrated technical program at the Federal Institute of Bahia. In 2023 I also took courses in frontend development, databases and web design."))}
      </>}
      {section === "recommendations" && <>
        {renderEntry(t("Orientador de iniciação científica", "Undergraduate research supervisor"), "Bruno Otávio Piedade Prado", t(
          "Ao orientar William na iniciação científica, Bruno destacou a iniciativa e a organização com que ele conduzia as tarefas da pesquisa. Como professor, também ressaltou seu domínio da geração de código de máquina em tempo de execução.",
          "As William’s research supervisor, Bruno highlighted the initiative and organization William brought to his research tasks. As his professor, he also singled out William’s command of runtime machine-code generation."
        ))}
        {renderEntry(t("Professor de Seminários em Computação", "Computing seminars instructor"), "Rogério Patrício Chagas do Nascimento", t(
          "Rogério situou William entre os 10% de estudantes mais dedicados e promissores que conheceu em 18 anos de docência. Destacou seu papel na criação da liga de hardware e robótica e nas parcerias com a Toradex e a Espressif, que abriram oportunidades para outros estudantes.",
          "Rogério counted William among the top 10% of students he had taught in 18 years for dedication and promise. He highlighted William’s role in founding the hardware and robotics league and building partnerships with Toradex and Espressif that opened opportunities for other students."
        ))}
        {renderEntry(t("Professor de Arquitetura de Computadores", "Computer architecture instructor"), "Calebe Conceição", t(
          "Calebe destacou a capacidade de William de envolver colegas em projetos práticos de hardware. Como exemplo, descreveu seu trabalho na CoreTECH, onde William coordenou estudantes em testes de módulos antes do lançamento e no desenvolvimento de drivers e aplicações de exemplo.",
          "Calebe highlighted William’s ability to bring fellow students into hands-on hardware projects. He described William’s work at CoreTECH coordinating students as they tested pre-release modules and developed drivers and example applications."
        ))}
        {renderEntry(t("Certificação · Cadence", "Certification · Cadence"), "Cadence Mentorship Program for University Students", t(
          "Concluí o programa de mentoria da Cadence, com apresentações sobre a indústria de microeletrônica e encontros sobre caminhos de carreira.",
          "I completed Cadence’s mentorship program, attending microelectronics industry presentations and mentoring sessions on career paths."
        ), "https://www.credly.com/badges/e204ee28-3c11-4432-908e-bb12983d3fc5", t("Ver credencial no Credly", "View credential on Credly"))}
      </>}
    </section>
    <Link className="secondary" to={returnUrl}>← {t("Voltar ao laboratório", "Return to the lab")}</Link>
  </article>;
}

