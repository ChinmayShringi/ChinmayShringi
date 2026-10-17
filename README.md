<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/hero-light.svg">
  <img src="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/hero-light.svg" width="100%" alt="Chinmay Shringi. Systems. Intelligence. Security. A field-notes style header with a request routed to CPU, GPU and NPU targets inside a safety boundary.">
</picture>

<p align="center">
  <a href="https://chinmayshringi.web.app/"><b>Portfolio</b></a>
  &nbsp;/&nbsp;
  <a href="https://www.linkedin.com/in/chinmay-shringi/"><b>LinkedIn</b></a>
  &nbsp;/&nbsp;
  <a href="mailto:cs7810@nyu.edu"><b>Email</b></a>
  &nbsp;/&nbsp;
  <a href="https://medium.com/@chinmayshringi4"><b>Writing</b></a>
  &nbsp;/&nbsp;
  <a href="https://orcid.org/0009-0008-0325-7668"><b>ORCID</b></a>
</p>

<p align="center">
  <sub><a href="#user-content-domains">Domains</a> &nbsp;·&nbsp; <a href="#user-content-selected-work">Selected work</a> &nbsp;·&nbsp; <a href="#user-content-research">Research</a> &nbsp;·&nbsp; <a href="#user-content-experience">Experience</a> &nbsp;·&nbsp; <a href="#user-content-toolkit">Toolkit</a> &nbsp;·&nbsp; <a href="#user-content-contact">Contact</a></sub>
</p>

<br>

I'm **Chinmay Shringi**, a full-stack engineer and researcher in New York. I build across **AI agents**, **secure systems** and **developer tools**: runtimes that route work to the right hardware, agent workflows that can be reviewed and rolled back, and small tools that remove friction from everyday engineering.

## Domains

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/domains-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/domains-light.svg">
  <img src="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/domains-light.svg" width="100%" alt="Three domains: 01 Systems, 02 Intelligence, 03 Security.">
</picture>

- **01 / Systems.** Distributed inference runtimes, WebAssembly sandboxing in Rust and C, and microservice back ends.
- **02 / Intelligence.** LLM agent orchestration, retrieval-augmented generation over vector and graph stores, and small-model collaboration.
- **03 / Security.** Red-team agent workflows, Dockerized cyber ranges, and defensive AI evaluation on live hosts.

## Selected work

> Field entries, each with a public link.

**[SourceSnap](https://github.com/ChinmayShringi/sourcesnap)** &nbsp;<sub>`BROWSER EXTENSION` `TYPESCRIPT`</sub><br>
Alt+Click any element in a running app to open its source file in your editor. Works with React, Vue, Svelte, SolidJS and Preact, with no bundler plugin required.

**[Shoemaker Elves](https://github.com/ChinmayShringi/shoemaker-elves)** &nbsp;<sub>`AGENT ORCHESTRATOR` `PYTHON`</sub><br>
Breaks large projects into atomic tasks. An LLM plans a batch, a coding agent executes the tasks in sequence, and the LLM reviews results before planning the next batch.

**[SLM Swarm](https://github.com/ChinmayShringi/slm-swarm)** &nbsp;<sub>`RESEARCH PLATFORM` `DOCKER` `FASTAPI` `OLLAMA`</sub><br>
A reproducible setup for comparing swarms of small language models against a single large model on summarization, using embedding-based consensus and standard metrics.

**[Persona AI](https://github.com/ChinmayShringi/persona-ai)** &nbsp;<sub>`RAG` `PYTHON`</sub><br>
A self-hosted Gmail assistant: semantic search and question answering over your inbox with hybrid retrieval and a pluggable model backend.

**[Hybrid RAG](https://github.com/ChinmayShringi/rag-vector-graph-hybrid-neo4js)** &nbsp;<sub>`PGVECTOR` `NEO4J` `NODE.JS`</sub><br>
PDF question answering that combines pgvector semantic search with Neo4j knowledge-graph retrieval.

**[Spotlight Security Benchmark](https://www.benchmark-spotlightsecurity.com/)** &nbsp;<sub>`AI EVALUATION` `SECURITY`</sub><br>
Benchmark work on evaluating AI agents at defensive security tasks on live hosts. I am listed among the authors.

<sub>More on the <a href="https://github.com/ChinmayShringi?tab=repositories">repositories tab</a>.</sub>

## Research

**GRAFT: gRPC-Routed Agent Framework for Tasking in Edge and Personal Devices**<br>
<sub>C. Shringi, A. Hillel-Tuch, S. Rizwan &nbsp;·&nbsp; ACM CAIS 2026 &nbsp;·&nbsp; [DOI](https://doi.org/10.1145/3786335.3813216) &nbsp;·&nbsp; [PDF](https://openreview.net/pdf?id=AHUfHheG4V)</sub><br>
A runtime for agent tasks on edge and personal devices. It routes work by capability across CPU, GPU and NPU targets over sessioned gRPC and keeps execution inside safety bounds.

**Branch-Commit-Validate: A Git-Inspired Workflow for Autonomous Red-Team Agents**<br>
<sub>Springer CCIS 2937, proceedings of CSCE 2025 (2026) &nbsp;·&nbsp; [DOI](https://doi.org/10.1007/978-3-032-22208-4_37)</sub><br>
Proposes a branch, commit and validate workflow so red-team agent actions can be reviewed, compared and rolled back like code.

**An Advanced AI-Driven Database System**<br>
<sub>EDULEARN25 (2025) &nbsp;·&nbsp; [IATED library](https://library.iated.org/view/TEDESCHI2025ANA) &nbsp;·&nbsp; DOI 10.21125/edulearn.2025.1294</sub>

## Experience

**M.S., New York University** &nbsp;<sub>2024 to 2026</sub>

My experience spans research and product engineering: Rust, C and WebAssembly isolation work on the Lind project, Dockerized cyber ranges for LLM security evaluation, Node.js and Spring Boot microservices, WebRTC, and distributed consensus research.

<details>
<summary><b>Roles</b></summary>
<br>

| Role | Organization | Started |
|:--|:--|:--|
| Research Developer | Scrypted Inc. | 2025 |
| Research Assistant | New York University | 2024 |
| Full Stack Developer | Yliway | 2023 (to 2024) |
| Senior Full Stack Developer / Tech Lead | Fassix | 2022 (to 2023) |
| Founder / Full Stack Engineer | Webscape | 2019 (to 2021) |

Certifications: AWS Certified Cloud Practitioner, Cisco CCNA.

</details>

## Toolkit

| Area | Tools |
|:--|:--|
| **Languages** | TypeScript, JavaScript, Python, Go, Rust, Java |
| **Frameworks** | React, Next.js, Node.js, Spring Boot |
| **Data** | PostgreSQL, Redis, Neo4j |
| **Infrastructure** | Docker, Kubernetes, AWS |
| **AI systems** | LLM orchestration, retrieval-augmented generation, WebAssembly sandboxing |

## Contact

Working on agents, secure systems or developer tooling? I'm glad to compare notes, review an idea or collaborate.
Reach me at **[cs7810@nyu.edu](mailto:cs7810@nyu.edu)**, on **[LinkedIn](https://www.linkedin.com/in/chinmay-shringi/)**, or through my **[portfolio](https://chinmayshringi.web.app/)**.

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/footer-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/footer-light.svg">
  <img src="https://cdn.jsdelivr.net/gh/ChinmayShringi/ChinmayShringi@41a6393b00889e07c578051c218d964e9da9247a/docs/assets/footer-light.svg" width="100%" alt="End of notes.">
</picture>
