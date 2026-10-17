// Single source of curated, public, source-backed atlas content.
// Every claim here should be traceable to a linked repository README or publisher page.

const freezeDeep = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    return Object.freeze(value);
  }
  return value;
};

export const DOMAINS = freezeDeep([
  { id: 'all', label: 'All' },
  { id: 'agents', label: 'Agents' },
  { id: 'retrieval', label: 'Retrieval' },
  { id: 'systems', label: 'Systems' },
  { id: 'security', label: 'Security' },
  { id: 'tools', label: 'Developer tools' },
]);

// Map territories (background regions of the constellation plate).
export const REGIONS = freezeDeep([
  { id: 'systems', label: 'SYSTEMS', x: 250, y: 250, rx: 210, ry: 160 },
  { id: 'intelligence', label: 'INTELLIGENCE', x: 720, y: 290, rx: 240, ry: 190 },
  { id: 'security', label: 'SECURITY', x: 470, y: 560, rx: 230, ry: 110 },
]);

export const ITEMS = freezeDeep([
  {
    id: 'graft',
    index: '01',
    kind: 'paper',
    title: 'GRAFT',
    fullTitle: 'GRAFT: gRPC-Routed Agent Framework for Tasking in Edge and Personal Devices',
    subtitle: 'ACM CAIS 2026',
    authors: 'Chinmay Shringi, Alon Hillel-Tuch, Sariya Rizwan',
    summary: 'A runtime for agent tasks on edge and personal devices, routed by capability across CPU, GPU and NPU targets.',
    detail: 'Agent tasks are routed by capability across heterogeneous CPU, GPU and NPU targets over sessioned gRPC, and execution is kept inside safety bounds. The routing lab on this page is a simplified, illustrative take on the idea.',
    technologies: ['gRPC', 'Edge devices', 'CPU / GPU / NPU', 'Agents'],
    domains: ['systems', 'agents'],
    architecture: [
      { label: 'Task', note: 'An agent task arrives with the capability it needs.' },
      { label: 'Route', note: 'A capability-aware router picks a suitable device.' },
      { label: 'Session', note: 'Work moves over sessioned gRPC.' },
      { label: 'Bound', note: 'Execution stays inside safety bounds.' },
    ],
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1145/3786335.3813216' },
      { label: 'PDF on OpenReview', href: 'https://openreview.net/pdf?id=AHUfHheG4V' },
    ],
    pos: { x: 300, y: 190 },
  },
  {
    id: 'slm-swarm',
    index: '02',
    kind: 'project',
    title: 'SLM Swarm',
    subtitle: 'Research platform',
    summary: 'A reproducible platform comparing swarms of small language models with a single large model on summarization.',
    detail: 'Four Ollama workers (Qwen2.5-7B, Llama-3.1-8B, Mistral-7B and a Phi-3 judge) sit behind a FastAPI coordinator. Outputs are combined by cosine-similarity consensus, an LLM judge or voting, and an evaluator scores them with ROUGE, BERTScore and entity-based factuality.',
    technologies: ['Python', 'Docker', 'FastAPI', 'Ollama'],
    domains: ['agents', 'systems'],
    architecture: [
      { label: 'Workers', note: 'Four small models served by Ollama.' },
      { label: 'Coordinator', note: 'FastAPI service that fans requests out.' },
      { label: 'Consensus', note: 'Cosine similarity, LLM judge or voting.' },
      { label: 'Evaluate', note: 'ROUGE, BERTScore and factuality metrics.' },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/ChinmayShringi/slm-swarm' }],
    pos: { x: 500, y: 250 },
  },
  {
    id: 'shoemaker-elves',
    index: '03',
    kind: 'project',
    title: 'Shoemaker Elves',
    subtitle: 'Agent orchestrator',
    summary: 'Breaks large projects into atomic tasks that an AI coding agent executes in sequence, with LLM planning and review.',
    detail: 'In its LLM mode, a planner model writes a batch of tasks, a hook-driven chain runs them one after another through a coding agent, and the planner reviews the results before writing the next batch. A manual mode runs task files you write yourself.',
    technologies: ['Python', 'CLI', 'LLM planning', 'Coding agents'],
    domains: ['agents', 'tools'],
    architecture: [
      { label: 'Plan', note: 'An LLM writes a batch of atomic tasks.' },
      { label: 'Execute', note: 'A coding agent runs the tasks in order.' },
      { label: 'Review', note: 'The LLM checks results.' },
      { label: 'Next batch', note: 'Planning resumes from the review.' },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/ChinmayShringi/shoemaker-elves' }],
    pos: { x: 730, y: 170 },
  },
  {
    id: 'sourcesnap',
    index: '04',
    kind: 'project',
    title: 'SourceSnap',
    subtitle: 'Browser extension',
    summary: 'Alt+Click any element in a running web app to open its source file in your editor.',
    detail: 'A pure browser extension with no bundler plugin. It reads framework metadata (React DevTools hook and Fiber internals, Vue component files, Svelte meta attributes, SolidJS data attributes, Preact internals) to find the source location, then opens it in the editor you choose.',
    technologies: ['TypeScript', 'React', 'Vue', 'Svelte', 'SolidJS', 'Preact'],
    domains: ['tools'],
    architecture: [
      { label: 'Click', note: 'Hold Alt and click an element.' },
      { label: 'Detect', note: 'Framework metadata identifies the component.' },
      { label: 'Locate', note: 'Resolve the source file and line.' },
      { label: 'Open', note: 'Launch it in VS Code, Cursor, WebStorm and others.' },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/ChinmayShringi/sourcesnap' }],
    pos: { x: 880, y: 300 },
  },
  {
    id: 'persona-ai',
    index: '05',
    kind: 'project',
    title: 'Persona AI',
    subtitle: 'Self-hosted assistant',
    summary: 'A privacy-first Gmail assistant with semantic search and question answering over your own inbox.',
    detail: 'Indexes Gmail into vector embeddings and a knowledge graph of people, topics and emails, then answers natural-language questions with retrieval-augmented generation. The model backend is pluggable: OpenAI, Anthropic or local models through Ollama.',
    technologies: ['Python', 'PostgreSQL', 'Neo4j', 'Redis', 'Docker'],
    domains: ['retrieval', 'agents'],
    architecture: [
      { label: 'Ingest', note: 'Gmail API indexing on your own infrastructure.' },
      { label: 'Index', note: 'Vector embeddings plus a knowledge graph.' },
      { label: 'Retrieve', note: 'Hybrid search over both stores.' },
      { label: 'Answer', note: 'Pluggable model writes the response.' },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/ChinmayShringi/persona-ai' }],
    pos: { x: 700, y: 400 },
  },
  {
    id: 'hybrid-rag',
    index: '06',
    kind: 'project',
    title: 'Hybrid RAG',
    subtitle: 'PDF question answering',
    summary: 'Upload PDFs and ask questions, answered with pgvector semantic search combined with Neo4j graph retrieval.',
    detail: 'PostgreSQL with pgvector handles semantic text search, Neo4j holds entities and their relationships, and an Express back end combines both before an LLM writes the answer.',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'pgvector', 'Neo4j'],
    domains: ['retrieval'],
    architecture: [
      { label: 'Upload', note: 'PDF content enters the system.' },
      { label: 'Vectors', note: 'pgvector for semantic search.' },
      { label: 'Graph', note: 'Neo4j for entities and relations.' },
      { label: 'Answer', note: 'An LLM answers from both contexts.' },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/ChinmayShringi/rag-vector-graph-hybrid-neo4js' }],
    pos: { x: 470, y: 400 },
  },
  {
    id: 'ai-database',
    index: '07',
    kind: 'paper',
    title: 'AI-Driven Database',
    fullTitle: 'An Advanced AI-Driven Database System',
    subtitle: 'EDULEARN25',
    summary: 'Conference paper presented at EDULEARN25 (2025).',
    detail: 'Published in the EDULEARN25 proceedings. See the IATED library entry for the abstract and full text.',
    technologies: ['Databases', 'AI'],
    domains: ['systems'],
    architecture: [],
    links: [
      { label: 'IATED library', href: 'https://library.iated.org/view/TEDESCHI2025ANA' },
      { label: 'DOI', href: 'https://doi.org/10.21125/edulearn.2025.1294' },
    ],
    pos: { x: 150, y: 330 },
  },
  {
    id: 'branch-commit-validate',
    index: '08',
    kind: 'paper',
    title: 'Branch-Commit-Validate',
    fullTitle: 'Branch-Commit-Validate: A Git-Inspired Workflow for Autonomous Red-Team Agents',
    subtitle: 'Springer CCIS 2937',
    summary: 'A proposed workflow that makes red-team agent actions reviewable, comparable and reversible, like code.',
    detail: 'Published in Springer CCIS 2937, the proceedings of CSCE 2025 (2026). It proposes a workflow; it does not report production measurements.',
    technologies: ['Red-team agents', 'Version control', 'Security'],
    domains: ['security', 'agents'],
    architecture: [
      { label: 'Branch', note: 'Explore an approach in isolation.' },
      { label: 'Commit', note: 'Record actions as reviewable steps.' },
      { label: 'Validate', note: 'Check results before they are kept.' },
    ],
    links: [{ label: 'DOI', href: 'https://doi.org/10.1007/978-3-032-22208-4_37' }],
    pos: { x: 610, y: 560 },
  },
  {
    id: 'spotlight-benchmark',
    index: '09',
    kind: 'project',
    title: 'Spotlight Benchmark',
    subtitle: 'AI security evaluation',
    summary: 'Benchmark work on evaluating AI agents at defensive security tasks on live hosts.',
    detail: 'A public benchmark site on which Chinmay is listed among the authors. Visit the site for its methodology and results.',
    technologies: ['AI evaluation', 'Defensive security', 'Live hosts'],
    domains: ['security'],
    architecture: [
      { label: 'Agent', note: 'An AI agent under evaluation.' },
      { label: 'Task', note: 'Defensive security work.' },
      { label: 'Host', note: 'Carried out on live hosts.' },
    ],
    links: [{ label: 'Benchmark site', href: 'https://www.benchmark-spotlightsecurity.com/' }],
    pos: { x: 360, y: 590 },
  },
]);

// Shared ideas between entries, drawn as constellation lines.
export const RELATIONS = freezeDeep([
  { a: 'graft', b: 'slm-swarm', label: 'Small and local models' },
  { a: 'graft', b: 'branch-commit-validate', label: 'Bounded agent execution' },
  { a: 'slm-swarm', b: 'shoemaker-elves', label: 'LLM orchestration' },
  { a: 'shoemaker-elves', b: 'sourcesnap', label: 'Developer tooling' },
  { a: 'shoemaker-elves', b: 'branch-commit-validate', label: 'Reviewable agent steps' },
  { a: 'branch-commit-validate', b: 'spotlight-benchmark', label: 'Agents in security work' },
  { a: 'persona-ai', b: 'hybrid-rag', label: 'Vector plus graph retrieval' },
  { a: 'hybrid-rag', b: 'ai-database', label: 'AI and data systems' },
]);

export const CONTACT = freezeDeep([
  { label: 'Email', href: 'mailto:cs7810@nyu.edu', text: 'cs7810@nyu.edu' },
  { label: 'Portfolio', href: 'https://chinmayshringi.web.app/', text: 'chinmayshringi.web.app' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chinmay-shringi/', text: 'in/chinmay-shringi' },
  { label: 'GitHub', href: 'https://github.com/ChinmayShringi', text: 'ChinmayShringi' },
  { label: 'Writing', href: 'https://medium.com/@chinmayshringi4', text: 'Medium' },
  { label: 'ORCID', href: 'https://orcid.org/0009-0008-0325-7668', text: '0009-0008-0325-7668' },
]);

// Sample device pool for the illustrative routing lab. Not the paper's setup.
export const LAB_DEVICES = freezeDeep([
  { id: 'phone-npu', label: 'Phone NPU', local: true, capabilities: ['speech', 'vision'] },
  { id: 'laptop-gpu', label: 'Laptop GPU', local: true, capabilities: ['vision', 'text'] },
  { id: 'laptop-cpu', label: 'Laptop CPU', local: true, capabilities: ['text'] },
  { id: 'remote-gpu', label: 'Remote GPU', local: false, capabilities: ['text', 'vision', 'embedding'] },
]);

export const LAB_CAPABILITIES = freezeDeep([
  { id: 'text', label: 'Text' },
  { id: 'vision', label: 'Vision' },
  { id: 'speech', label: 'Speech' },
  { id: 'embedding', label: 'Embedding' },
  { id: 'audio-gen', label: 'Audio generation' },
]);

export function relationsFor(id) {
  return RELATIONS.filter((r) => r.a === id || r.b === id).map((r) => ({
    id: r.a === id ? r.b : r.a,
    label: r.label,
  }));
}
