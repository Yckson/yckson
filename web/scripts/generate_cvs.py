"""Generate the eight static résumé downloads with Python and ReportLab."""

from pathlib import Path
from xml.sax.saxutils import escape

import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


NAME = "William Gabriel Yckson Araújo Braga"
EMAIL = "williamgabrielbraga14@gmail.com"
GITHUB = "https://github.com/Yckson"
LINKEDIN = "https://www.linkedin.com/in/william-gabriel-braga-40a319255/"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "cv"

# Each pair is the same verified claim in Portuguese and English.
profiles = {
    "computer-science": {
        "title": ("Ciência da Computação", "Computer Science"),
        "summary": (
            "Graduando com foco em programação de sistemas, algoritmos e análise de código. Trabalhou com tradução de instruções para x86-64 e pesquisa sobre similaridade entre programas em C e C++.",
            "Computer science undergraduate focused on systems programming, algorithms and source-code analysis. Experience translating instructions to x86-64 and investigating similarity between C and C++ programs."),
        "skills": ("C, C++, Python, Assembly, Linux, GDB, Git, Tree-sitter",) * 2,
        "sections": [
            (("Pesquisa e projetos", "Research and projects"), [
                (("PIBIC · Análise de código-fonte · UFS, 2025–2026", "PIBIC · Source-code analysis · UFS, 2025–2026"),
                 ("Investiguei como reconhecer programas de origem comum após transformações de código. Preparei pares de programas do Code4Bench com o MAU, verifiquei seu comportamento e extraí blocos sintáticos com Tree-sitter.",
                  "Investigated how to identify programs with a common origin after source transformations. Prepared Code4Bench program pairs with MAU, checked their behavior and extracted syntax blocks with Tree-sitter."), None),
                (("PicoQuickProcessor · Tradução binária", "PicoQuickProcessor · Binary translation"),
                 ("Trabalhei em um compilador just-in-time para uma arquitetura didática de 32 bits. Documentei como operações aritméticas, acessos à memória e desvios se traduzem em instruções x86-64.",
                  "Worked on a just-in-time compiler for a 32-bit teaching architecture. Documented the translation of arithmetic, memory accesses and branches into x86-64 instructions."), GITHUB + "/PicoQuickProcessor"),
                (("Comparação de programas em C", "Comparing C programs"),
                 ("Desenvolvi em equipe uma ferramenta em Python e Streamlit para comparar sequências de tokens. A interface permite examinar a similaridade de Jaccard antes e depois da normalização sintática.",
                  "Co-developed a Python and Streamlit tool for comparing token sequences. The interface shows Jaccard similarity before and after syntax normalization."), GITHUB + "/n-grams")]),
            (("Publicações e conquistas", "Publications and awards"), [
                (("ERBASE · 2025",) * 2,
                 ("Coautor de dois artigos sobre ensino de computação. No mapeamento sistemático, analisei com a equipe como jogos são usados para ensinar arquitetura de processadores e sistemas digitais.",
                  "Co-authored two computing education papers. For the systematic mapping study, analyzed how educators use games to teach processor architecture and digital systems."), "https://doi.org/10.5753/erbase.2025.13754"),
                (("Competições de programação · 2025", "Programming competitions · 2025"),
                 ("Minha equipe venceu a PROGBASE e disputou a final nacional da Maratona de Programação da SBC.",
                  "Won PROGBASE with my team and competed in the Brazilian Computer Society’s national programming marathon finals."), None)])],
    },
    "embedded-systems": {
        "title": ("Engenharia de Sistemas Embarcados", "Embedded Systems Engineering"),
        "summary": ("Integração de sensores, microcontroladores e sistemas Linux. Na liga de hardware e robótica da UFS, coordeno testes de módulos e desenvolvimento de drivers e aplicações de exemplo.",
                    "Integrate sensors, microcontrollers and Linux systems. At the UFS hardware and robotics league, I coordinate module testing and the development of drivers and example applications."),
        "skills": ("C, C++, Linux, drivers de dispositivos, Arduino, ODROID, comunicação serial, GDB, FFmpeg",
                   "C, C++, Linux, device drivers, Arduino, ODROID, serial communication, GDB, FFmpeg"),
        "sections": [
            (("Experiência técnica", "Technical experience"), [
                (("CoreTECH · Coordenação de projetos de hardware · Desde março de 2025", "CoreTECH · Hardware project coordination · March 2025–present"),
                 ("Organizo atividades e repositórios da liga e acompanho estudantes nos testes de módulos antes do lançamento. Participei das parcerias com Toradex e Espressif. Entre as atividades da equipe estão testes com módulos Toradex baseados no NXP i.MX95.",
                  "Coordinate the league’s project work and repositories, and guide students testing pre-release modules. Helped establish partnerships with Toradex and Espressif. Team activities include work with NXP i.MX95-based Toradex modules."), None),
                (("UFS · Interface Hardware/Software · 2025", "UFS · Hardware/Software Interface · 2025"),
                 ("Desenvolvi drivers para Linux em nível de kernel. Uso GDB e GEF para acompanhar instruções e inspecionar registradores e memória durante a depuração.",
                  "Developed Linux kernel-level device drivers. Use GDB and GEF to step through instructions and inspect registers and memory while debugging."), None)]),
            (("Projetos e publicação", "Projects and publication"), [
                (("SiriBots · Cronometragem e transmissão de corridas", "SiriBots · Race timing and video streaming"),
                 ("Integrei a cronometragem por Arduino à transmissão de vídeo. Quando o robô cruza o laser, a ODROID recebe o tempo pela porta serial e o transmite à central para exibição sobre a imagem da corrida.",
                  "Integrated Arduino finish-line timing with the video broadcast. When a robot crosses the laser beam, an ODROID receives its time over serial and forwards it to the hub for display on the race footage."), GITHUB + "/siribots-transmission-sys"),
                (("Arduino e Minecraft · ERBASE 2025", "Arduino and Minecraft · ERBASE 2025"),
                 ("Construímos e testamos três protótipos que trocam sinais entre o jogo e o circuito físico: um botão de acionamento, um alarme de intrusão e um LED de atividade. Publiquei o trabalho em coautoria com Davi Araújo do Nascimento.",
                  "Co-built and tested three prototypes linking in-game events to a physical button, an intrusion alarm and an activity LED. Published the work with Davi Araújo do Nascimento."), "https://doi.org/10.5753/erbase.2025.13762")])],
    },
    "microelectronics-and-semiconductors": {
        "title": ("Microeletrônica e Semicondutores", "Microelectronics and Semiconductors"),
        "summary": ("Graduando com experiência em projeto digital em Verilog, arquitetura de processadores e interfaces de periféricos em FPGA. Membro fundador do capítulo estudantil IEEE Circuits and Systems Society na UFS.",
                    "Computer science undergraduate with experience in Verilog digital design, processor architecture and FPGA peripheral interfaces. Founding member of the IEEE Circuits and Systems Society student chapter at UFS."),
        "skills": ("Verilog HDL, FPGA, MIPS, RISC-V RV32I, Assembly, Altera DE2",) * 2,
        "sections": [
            (("Projetos de arquitetura e circuitos digitais", "Processor architecture and digital design projects"), [
                (("Processador MIPS de ciclo único", "Single-cycle MIPS processor"),
                 ("Projetei e implementei em Verilog um processador MIPS na disciplina de Arquitetura de Computadores. O circuito executa instruções aritméticas, lógicas, de acesso à memória e de controle de fluxo.",
                  "Designed and implemented a MIPS processor in Verilog for a computer architecture course. The circuit executes arithmetic, logic, memory-access and control-flow instructions."), GITHUB + "/Arquitetura"),
                (("Controlador de LCD · FPGA Altera DE2", "LCD controller · Altera DE2 FPGA"),
                 ("Escrevi o módulo em Verilog que gera os sinais do protocolo do LCD da placa DE2, permitindo atualizar o texto exibido a partir do circuito.",
                  "Wrote the Verilog module that drives the DE2 board’s LCD protocol, allowing the circuit to update the text on the display."), GITHUB + "/Arquitetura/tree/main/Projetos/Modulo%20LCD%20DE2%20Cyclone%20II"),
                (("Caminho de dados RISC-V", "RISC-V datapath"),
                 ("Trabalhei com o caminho de dados para o conjunto de instruções RV32I nos estudos de arquitetura de processadores.",
                  "Worked on the datapath for the RV32I instruction set as part of my processor architecture studies."), GITHUB + "/RISC-V-RV32I")]),
            (("Comunidade e formação complementar", "Technical community and professional development"), [
                (("ChipInventor · ChampionCHIP eXperience",) * 2,
                 ("Cursei nove módulos, incluindo projeto de um núcleo RISC-V e prototipagem em FPGA na nuvem. Estudei o fluxo de Verilog RTL a GDSII, da síntese lógica ao posicionamento e roteamento.",
                  "Completed nine modules, including RISC-V core design and cloud FPGA prototyping. Studied the Verilog RTL-to-GDSII flow, from logic synthesis through placement and routing."), "https://championchipexperience.org/"),
                (("IEEE CASS · UFS · 2025",) * 2,
                 ("Ajudei a organizar o primeiro IEEE CASS Sergipe Workshop, reunindo estudantes, pesquisadores e profissionais da indústria de circuitos e sistemas.",
                  "Helped organize the first IEEE CASS Sergipe Workshop, bringing together students, researchers and industry professionals working on circuits and systems."), None),
                (("Cadence Mentorship Program for University Students",) * 2,
                 ("Concluí o programa de mentoria sobre a indústria de microeletrônica e caminhos de carreira em semicondutores.",
                  "Completed the mentorship program covering the microelectronics industry and career paths in semiconductors."), "https://www.credly.com/badges/e204ee28-3c11-4432-908e-bb12983d3fc5")])],
    },
    "web-and-mobile": {
        "title": ("Desenvolvimento Web e Mobile", "Web and Mobile Development"),
        "summary": ("Desenvolvo interfaces web, APIs e aplicativos móveis. Trabalhei com React e NestJS no EndoCare e desenvolvo em React Native e Expo um aplicativo que acompanha um dispositivo vestível.",
                    "Build web interfaces, APIs and mobile apps. Contributed to EndoCare with React and NestJS and am developing a wearable companion app with React Native and Expo."),
        "skills": ("React, React Native, Expo, JavaScript, NestJS, PHP, Laravel, PostgreSQL, MySQL, Docker Compose, GitHub Actions",) * 2,
        "sections": [
            (("Projetos selecionados", "Selected projects"), [
                (("Aplicativo para dispositivo vestível · UFS · Em andamento", "Wearable companion app · UFS · In development"),
                 ("Desenvolvo o aplicativo móvel que acompanha um componente vestível na disciplina de Prática Orientada em Computação. Uso React Native, Expo e o ambiente de desenvolvimento em nuvem do Expo.",
                  "Building the mobile app for a wearable component in a supervised computing project. Using React Native, Expo and Expo’s cloud development environment."), None),
                (("EndoCare · Engenharia de Software II", "EndoCare · Software Engineering II"),
                 ("Contribuí para uma aplicação de acompanhamento de sintomas de endometriose. A interface React consome uma API NestJS com módulos de tratamentos, relatórios e permissões. O ambiente inclui PostgreSQL e Docker Compose.",
                  "Contributed to an endometriosis symptom-tracking app. The React frontend uses a NestJS API with treatment, reporting and permissions modules. The development environment includes PostgreSQL and Docker Compose."), GITHUB + "/endocare"),
                (("EVA · IFBA · 2023",) * 2,
                 ("Desenvolvi em equipe uma aplicação em Laravel e MySQL para identificar estudantes em risco de evasão. O questionário pode ser respondido pelo celular e fornece indicadores para orientar as ações de permanência.",
                  "Co-developed a Laravel and MySQL application to identify students at risk of dropping out. A mobile-accessible questionnaire provides indicators to guide student retention efforts."), "https://repositorio.ifba.edu.br/jspui/handle/123456789/547")]),
            (("Experiência e formação complementar", "Experience and additional training"), [
                (("SofTeam · Empresa júnior de computação da UFS · 2025", "SofTeam · UFS student-run computing company · 2025"),
                 ("Acompanhei escopo, prioridades e cronogramas de projetos de software e participei do desenvolvimento de um sistema de gestão de estoque.",
                  "Tracked project scope, priorities and schedules and contributed to the development of an inventory management system."), None),
                (("Danki Code · Desenvolvimento web", "Danki Code · Web development"),
                 ("Concluí todos os cursos de desenvolvimento web oferecidos pela Danki Code na época da minha formação.",
                  "Completed all web development courses Danki Code offered at the time."), None)])],
    },
}


def generate(slug, profile, language):
    pt = language == "pt"
    i = 0 if pt else 1
    title = profile["title"][i]
    pdf = Canvas(str(OUTPUT / f"William-Braga-{slug}-{language}.pdf"), pagesize=A4,
                 invariant=True, lang="pt-BR" if pt else "en")
    pdf.setAuthor(NAME)
    pdf.setTitle(f"{NAME} | {title}")
    width, height = A4
    left, top = 18 * mm, height - 17 * mm
    ink, teal = "#192822", "#245E50"

    def paragraph(text, size=10.4, leading=14.5, gap=5, bold=False, color=ink):
        nonlocal top
        style = ParagraphStyle("cv", fontName="VeraBold" if bold else "Vera",
                               fontSize=size, leading=leading, textColor=colors.HexColor(color))
        para = Paragraph(text, style)
        _, used = para.wrap(width - 2 * left, height)
        top -= used
        para.drawOn(pdf, left, top)
        top -= gap

    def link(url, label):
        return f'<a href="{escape(url)}" color="{teal}"><u>{escape(label)}</u></a>'

    def heading(text):
        nonlocal top
        top -= 7
        pdf.setStrokeColor(colors.HexColor("#A7BCB2"))
        pdf.line(left, top, width - left, top)
        top -= 7
        paragraph(escape(text), 13, 16, 5, True, teal)

    paragraph(NAME, 21, 25, 3, True)
    paragraph(escape(title), 14, 18, 5, True, teal)
    paragraph("  ·  ".join([link("mailto:" + EMAIL, EMAIL), link(GITHUB, "github.com/Yckson"),
                             link(LINKEDIN, "LinkedIn")]), 9.8, 13, 10)
    paragraph(escape(profile["summary"][i]))
    heading("Formação" if pt else "Education")
    paragraph("Universidade Federal de Sergipe · Ciência da Computação · 2023–atual" if pt else
              "Federal University of Sergipe · Computer Science undergraduate · 2023–present", bold=True)
    paragraph("Técnico em Informática · Instituto Federal da Bahia (IFBA), Campus Seabra" if pt else
              "Technical diploma in Information Technology · Federal Institute of Bahia (IFBA), Seabra")
    heading("Competências técnicas" if pt else "Technical skills")
    paragraph(escape(profile["skills"][i]))
    for section, entries in profile["sections"]:
        heading(section[i])
        for name, body, url in entries:
            paragraph(link(url, name[i]) if url else escape(name[i]), 10.4, 14, 2, True)
            paragraph(escape(body[i]), gap=7)
    heading("Idiomas" if pt else "Languages")
    paragraph("Português nativo · Inglês fluente" if pt else "Portuguese (native) · English (fluent)")
    if top < 13 * mm:
        raise ValueError(f"{slug}-{language} exceeds the page margin")
    pdf.save()


if __name__ == "__main__":
    fonts = Path(reportlab.__file__).parent / "fonts"
    for name, filename in [("Vera", "Vera.ttf"), ("VeraBold", "VeraBd.ttf")]:
        pdfmetrics.registerFont(TTFont(name, str(fonts / filename)))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for slug, profile in profiles.items():
        for language in ("pt", "en"):
            generate(slug, profile, language)
