const { useEffect, useMemo, useState } = React;
const h = React.createElement;

const DOCS_SOURCE = new URLSearchParams(window.location.search).get("source") === "local" ? "local" : "github";
const DOCS_LOCAL_ROOT = "../documento-software/Doc-Tecnica-Rev06/";
const DOCS_GITHUB_RAW_ROOT =
  "https://raw.githubusercontent.com/TheuusWmv/ProjetoFynx/main/FynxDocs/documento-software/Doc-Tecnica-Rev06/";

function buildDocPath(file) {
  return DOCS_SOURCE === "local" ? `${DOCS_LOCAL_ROOT}${file}` : `${DOCS_GITHUB_RAW_ROOT}${file}`;
}

const DOCS = [
  {
    id: "hub",
    title: "FYNX Rev06",
    description: "Hub global da documentacao",
    type: "Hub",
    status: "Base",
    file: "FynxRev06.md",
  },
  {
    id: "business",
    title: "Requisitos e Regras",
    description: "Requisitos funcionais, nao funcionais e regras",
    type: "Requisitos",
    status: "Core",
    file: "REQUISITOS_E_REGRAS.md",
  },
  {
    id: "workflows",
    title: "Fluxos e Casos de Uso",
    description: "Casos de uso, processos e diagramas",
    type: "Processos",
    status: "Core",
    file: "FLUXOS_E_CASOS_DE_USO.md",
  },
  {
    id: "api",
    title: "Referencia da API",
    description: "Contratos HTTP reais",
    type: "API",
    status: "Core",
    file: "REFERENCIA_DA_API.md",
  },
  {
    id: "database",
    title: "Banco de Dados",
    description: "DER, SQL, dicionario e persistencia",
    type: "Dados",
    status: "Core",
    file: "BANCO_DE_DADOS.md",
  },
  {
    id: "architecture",
    title: "Arquitetura",
    description: "DDD, rotas, pastas e ADRs",
    type: "Arquitetura",
    status: "Core",
    file: "ARQUITETURA.md",
  },
  {
    id: "gamification",
    title: "Motor de Gamificacao",
    description: "Score, ranking, badges e temporadas",
    type: "Dominio",
    status: "Core",
    file: "MOTOR_DE_GAMIFICACAO.md",
  },
  {
    id: "traceability",
    title: "Matriz de Rastreabilidade",
    description: "Checklist academico e matriz RF -> evidencia",
    type: "Academico",
    status: "Novo",
    file: "MATRIZ_DE_RASTREABILIDADE.md",
  },
  {
    id: "uiux",
    title: "Prototipos e Telas",
    description: "Telas, navegacao e comparativo com sistema",
    type: "Academico",
    status: "Novo",
    file: "PROTOTIPOS_E_TELAS.md",
  },
  {
    id: "implementation",
    title: "Evidencias da Implementacao",
    description: "Implementacao, CRUD, Git, SQL e testes",
    type: "Academico",
    status: "Novo",
    file: "EVIDENCIAS_DA_IMPLEMENTACAO.md",
  },
  {
    id: "presentation",
    title: "Roteiro de Apresentacao",
    description: "Roteiro do documento de requisitos",
    type: "Academico",
    status: "Novo",
    file: "ROTEIRO_DE_APRESENTACAO.md",
  },
  {
    id: "llms",
    title: "Contexto para IA",
    description: "Mapa compacto para agentes e LLMs",
    type: "Agentes",
    status: "Mapa",
    file: "llms.txt",
  },
].map((doc) => ({ ...doc, path: buildDocPath(doc.file) }));

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/`|\*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function docIdForHref(href) {
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return "";
  const fileName = decodeURIComponent(href.split("#")[0].split("/").pop() || "");
  return DOCS.find((doc) => doc.path.endsWith(`/${fileName}`))?.id || "";
}

function resolveDocumentHref(href, doc) {
  const docId = docIdForHref(href);
  if (docId) {
    const heading = href.split("#")[1] || "";
    return heading ? `#${docId}/${heading}` : `#${docId}`;
  }
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return href;
  return resolveAssetPath(href, doc);
}

function inlineMarkdown(value, doc) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const resolvedHref = resolveDocumentHref(href, doc);
    const safeHref = escapeHtml(resolvedHref);
    const isInternalDoc = safeHref.startsWith("#");
    const targetAttrs = isInternalDoc ? "" : ' target="_blank" rel="noreferrer"';
    return `<a href="${safeHref}"${targetAttrs}>${escapeHtml(text)}</a>`;
  });
  return html;
}

function resolveAssetPath(href, doc) {
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return href;
  const base = doc?.path ? doc.path.replace(/[^/]+$/, "") : "";
  if (/^https?:/i.test(base)) {
    return new URL(href, base).href;
  }
  return new URL(href, `${window.location.origin}/docs-site/${base}`).pathname;
}

function parseTable(lines, start, doc) {
  const tableLines = [];
  let index = start;

  while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
    tableLines.push(lines[index].trim());
    index += 1;
  }

  if (tableLines.length < 2 || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(tableLines[1])) {
    return null;
  }

  const rows = tableLines
    .filter((_, rowIndex) => rowIndex !== 1)
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );

  const head = rows[0] || [];
  const body = rows.slice(1);
  const html = [
    '<div class="table-wrap"><table>',
    "<thead><tr>",
    ...head.map((cell) => `<th>${inlineMarkdown(cell, doc)}</th>`),
    "</tr></thead><tbody>",
    ...body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell, doc)}</td>`).join("")}</tr>`),
    "</tbody></table></div>",
  ].join("");

  return { html, next: index };
}

function parseMarkdown(markdown, doc) {
  const headings = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let index = 0;
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;

  const closeLists = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    if (inOrderedList) {
      html.push("</ol>");
      inOrderedList = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      // Check if it was an alert or a normal blockquote
      // We'll just close div if it was an alert, but for simplicity we can track it
      if (html[html.length - 1] === "</blockquote>") {
        // do nothing
      } else if (html.join("").includes("<div class=\"alert")) {
         html.push("</div>");
      } else {
         html.push("</blockquote>");
      }
      inBlockquote = false;
    }
  };

  while (index < lines.length) {
    const line = lines[index];

    if (/^```/.test(line.trim())) {
      closeLists();
      closeBlockquote();
      const language = line.trim().replace(/^```/, "").trim() || "text";
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      const code = codeLines.join("\n");
      if (language.toLowerCase() === "mermaid") {
        html.push(`<div class="mermaid-box"><pre class="mermaid">${escapeHtml(code)}</pre></div>`);
      } else {
        html.push(
          `<div class="code-block"><div class="code-label"><span>${escapeHtml(language)}</span><button class="copy-code" type="button">Copiar</button></div><pre><code>${escapeHtml(code)}</code></pre></div>`,
        );
      }
      index += 1;
      continue;
    }

    const table = parseTable(lines, index, doc);
    if (table) {
      closeLists();
      closeBlockquote();
      html.push(table.html);
      index = table.next;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      closeLists();
      closeBlockquote();
      const level = heading[1].length;
      const text = heading[2].trim();
      const idBase = slugify(text) || `topico-${headings.length + 1}`;
      let id = idBase;
      let suffix = 2;
      while (headings.some((item) => item.id === id)) {
        id = `${idBase}-${suffix}`;
        suffix += 1;
      }
      headings.push({ level, text: text.replace(/`|\*/g, ""), id });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text, doc)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      closeLists();
      closeBlockquote();
      html.push("<hr />");
      index += 1;
      continue;
    }

    const image = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line);
    if (image) {
      closeLists();
      closeBlockquote();
      const alt = image[1].trim();
      const src = resolveAssetPath(image[2].trim(), doc);
      html.push(
        `<figure class="doc-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`,
      );
      index += 1;
      continue;
    }

    const alertMatch = /^\s*>\s?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.exec(line);
    if (alertMatch) {
      closeLists();
      if (inBlockquote) closeBlockquote();
      const type = alertMatch[1].toLowerCase();
      html.push(`<div class="alert alert-${type}"><div class="alert-title">${type}</div>`);
      inBlockquote = true; // Use same flag
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      closeLists();
      if (!inBlockquote) {
        html.push("<blockquote>");
        inBlockquote = true;
      }
      html.push(`<p>${inlineMarkdown(line.replace(/^\s*>\s?/, ""), doc)}</p>`);
      index += 1;
      continue;
    }

    const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      closeBlockquote();
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(unordered[1], doc)}</li>`);
      index += 1;
      continue;
    }

    const ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      closeBlockquote();
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      if (!inOrderedList) {
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${inlineMarkdown(ordered[1], doc)}</li>`);
      index += 1;
      continue;
    }

    if (!line.trim()) {
      closeLists();
      closeBlockquote();
      index += 1;
      continue;
    }

    closeLists();
    closeBlockquote();
    html.push(`<p>${inlineMarkdown(line.trim(), doc)}</p>`);
    index += 1;
  }

  closeLists();
  closeBlockquote();
  return { html: html.join("\n"), headings };
}

async function loadDocs() {
  const docs = await Promise.all(
    DOCS.map(async (doc) => {
      const response = await fetch(doc.path);
      if (!response.ok) {
        throw new Error(`Falha ao carregar ${doc.path}`);
      }
      const markdown = await response.text();
      const parsed = parseMarkdown(markdown, doc);
      return { ...doc, markdown, ...parsed };
    }),
  );
  return new Map(docs.map((doc) => [doc.id, doc]));
}

function readRoute() {
  const raw = window.location.hash.replace(/^#/, "");
  const [docId, headingId] = raw.split("/");
  return {
    docId: DOCS.some((doc) => doc.id === docId) ? docId : "hub",
    headingId: headingId || "",
  };
}

function navigate(docId, headingId = "") {
  window.location.hash = headingId ? `${docId}/${headingId}` : docId;
}

function renderMermaid() {
  const nodes = document.querySelectorAll(".mermaid");
  if (!nodes.length || !window.mermaid) return;

  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    themeVariables: {
      primaryColor: "#ede9fe",
      primaryTextColor: "#111827",
      primaryBorderColor: "#8b5cf6",
      lineColor: "#6b7280",
      secondaryColor: "#ecfccb",
      tertiaryColor: "#f8fafc",
      fontFamily: "Inter, system-ui, sans-serif",
    },
  });
  window.mermaid.run({ nodes });
}

function bindCodeCopy() {
  document.querySelectorAll(".code-block").forEach((block) => {
    const button = block.querySelector(".copy-code");
    const code = block.querySelector("code")?.textContent || "";
    button?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copiado";
      setTimeout(() => {
        button.textContent = "Copiar";
      }, 1200);
    });
  });
}

function Sidebar({ activeDoc, onOpenDoc, query, onQuery }) {
  return h(
    "aside",
    { className: "sidebar" },
    h(
      "div",
      { className: "brand animate-slide-in-up" },
      h("img", { src: "fynx-logo.png", alt: "Fynx Logo", className: "brand-logo-img animate-float" }),
      h("div", null, h("div", { className: "brand-name text-gradient" }, "FYNX Docs"), h("div", { className: "brand-subtitle" }, "Rev06")),
    ),
    h(
      "div",
      { className: "search-wrap" },
      h("input", {
        className: "search-input",
        type: "search",
        placeholder: "Buscar na documentacao",
        value: query,
        onChange: (event) => onQuery(event.target.value),
      }),
    ),
    h(
      "nav",
      { className: "doc-nav", "aria-label": "Documentos" },
      DOCS.map((doc) =>
        h(
          "button",
          {
            key: doc.id,
            className: `doc-button${doc.id === activeDoc ? " active" : ""}`,
            type: "button",
            onClick: () => onOpenDoc(doc.id),
          },
          h("div", { className: "doc-info" }, h("span", { className: "doc-title" }, doc.title), h("span", { className: "doc-desc" }, doc.description)),
          h("span", { className: "doc-status" }, doc.status),
        ),
      ),
    ),
  );
}

function Topbar({ doc, onMenu }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return h(
    "header",
    { className: "topbar" },
    h(
      "button",
      { className: "icon-button mobile-only", type: "button", "aria-label": "Abrir menu", onClick: onMenu },
      h("span"),
      h("span"),
      h("span"),
    ),
    h("div", { className: "topbar-title" }, h("span", null, doc?.type || "Documentacao tecnica"), h("strong", null, doc?.title || "FYNX Rev06")),
    h(
      "div",
      { className: "topbar-actions" },
      h("button", { className: "ghost-button", type: "button", onClick: copyLink }, copied ? "Copiado" : "Copiar link"),
      h(
        "button",
        {
          className: "accent-button",
          type: "button",
          onClick: () => doc && window.open(doc.path, "_blank", "noreferrer"),
        },
        "Markdown",
      ),
    ),
  );
}

function Toc({ doc }) {
  const headings = (doc?.headings || []).filter((heading) => heading.level > 1 && heading.level < 5);
  return h(
    "aside",
    { className: "toc-panel", "aria-label": "Topicos" },
    h("div", { className: "toc-title" }, "Topicos"),
    h(
      "nav",
      { className: "toc-nav" },
      headings.length
        ? headings.map((heading) =>
            h(
              "a",
              {
                key: heading.id,
                className: `toc-link toc-level-${heading.level}`,
                href: `#${doc.id}/${heading.id}`,
              },
              heading.text,
            ),
          )
        : h("div", { className: "empty-state" }, "Sem topicos"),
    ),
  );
}

function SearchResults({ docs, query, onOpenDoc }) {
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return Array.from(docs.values())
      .map((doc) => {
        const index = doc.markdown.toLowerCase().indexOf(normalized);
        if (index === -1) return null;
        const start = Math.max(0, index - 80);
        const end = Math.min(doc.markdown.length, index + 160);
        return {
          doc,
          snippet: doc.markdown.slice(start, end).replace(/\s+/g, " ").trim(),
        };
      })
      .filter(Boolean);
  }, [docs, query]);

  return h(
    React.Fragment,
    null,
    h("div", { className: "document-meta" }, h("span", { className: "meta-chip" }, `${results.length} resultado(s)`)),
    h(
      "div",
      { className: "markdown-body" },
      h("h1", null, "Resultados da busca"),
      h(
        "div",
        { className: "search-results" },
        results.length
          ? results.map(({ doc, snippet }) =>
              h(
                "button",
                { key: doc.id, className: "result-button", type: "button", onClick: () => onOpenDoc(doc.id) },
                h("div", { className: "result-title" }, doc.title),
                h("div", { className: "result-snippet", dangerouslySetInnerHTML: { __html: inlineMarkdown(snippet) } }),
              ),
            )
          : h("div", { className: "empty-state" }, "Nenhum resultado encontrado."),
      ),
    ),
  );
}

function DocumentView({ doc }) {
  useEffect(() => {
    bindCodeCopy();
    renderMermaid();
  }, [doc?.id]);

  if (!doc) {
    return h("div", { className: "markdown-body" }, h("div", { className: "loading-state" }, "Carregando documentacao..."));
  }

  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "document-meta" },
      h("span", { className: "meta-chip" }, doc.type),
      h("span", { className: "meta-chip" }, doc.status),
      h("span", { className: "meta-chip" }, DOCS_SOURCE === "github" ? "GitHub" : "Local"),
      h("span", { className: "meta-chip" }, doc.file),
    ),
    h("div", { className: "markdown-body", dangerouslySetInnerHTML: { __html: doc.html } }),
  );
}

function App() {
  const [docs, setDocs] = useState(new Map());
  const [loadingError, setLoadingError] = useState("");
  const [route, setRoute] = useState(readRoute);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDocs().then(setDocs).catch((error) => setLoadingError(error.message));
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!route.headingId) {
      window.scrollTo({ top: 0 });
      return;
    }
    window.requestAnimationFrame(() => {
      document.getElementById(route.headingId)?.scrollIntoView({ block: "start" });
    });
  }, [route.docId, route.headingId, docs]);

  const activeDoc = docs.get(route.docId) || docs.get("hub");

  function openDoc(docId) {
    setQuery("");
    setSidebarOpen(false);
    navigate(docId);
  }

  if (loadingError) {
    return h(
      "main",
      { className: "main" },
      h(
        "article",
        { className: "document-panel", style: { margin: 24 } },
        h(
          "div",
          { className: "markdown-body" },
          h("h1", null, "Falha ao carregar documentacao"),
          h("p", null, loadingError),
          h("p", null, DOCS_SOURCE === "github"
            ? "Verifique se o repositorio esta publico e se os arquivos ja foram enviados para a branch main."
            : "Execute com npm run dev dentro de FynxDocs/docs-site."),
        ),
      ),
    );
  }

  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "app-shell" },
      h(Sidebar, {
        activeDoc: route.docId,
        onOpenDoc: openDoc,
        query,
        onQuery: setQuery,
      }),
      h(
        "main",
        { className: "main" },
        h(Topbar, { doc: activeDoc, onMenu: () => setSidebarOpen(true) }),
        h(
          "div",
          { className: "content-layout" },
          h(
            "article",
            { className: "document-panel" },
            query.trim()
              ? h(SearchResults, { docs, query, onOpenDoc: openDoc })
              : h(DocumentView, { doc: activeDoc }),
          ),
          query.trim() ? h(Toc, { doc: null }) : h(Toc, { doc: activeDoc }),
        ),
      ),
    ),
    h("div", { className: "overlay", onClick: () => setSidebarOpen(false) }),
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
