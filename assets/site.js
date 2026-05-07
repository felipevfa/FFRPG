const sections = [
  {
    slug: "fichas",
    title: "Fichas",
    path: "FFRPG2/Fichas",
    description: "Personagens, guilda e fichas técnicas da campanha.",
    files: [
      "FFRPG2/Fichas/andrus-andradus.md",
      "FFRPG2/Fichas/anne.md",
      "FFRPG2/Fichas/clarence.md",
      "FFRPG2/Fichas/erya-orbless.md",
      "FFRPG2/Fichas/ordem-do-ceu.md"
    ]
  },
  {
    slug: "bestiario",
    title: "Bestiário",
    path: "FFRPG2/Bestiário",
    description: "Monstros e encontros, incluindo os arquivos nas subpastas.",
    files: [
      "FFRPG2/Bestiário/Amorfo/flan-azul.md",
      "FFRPG2/Bestiário/Aquáticos/sahagin.md",
      "FFRPG2/Bestiário/Demônio/lamia.md",
      "FFRPG2/Bestiário/Demônio/olho-flutuante.md",
      "FFRPG2/Bestiário/Especiais/lazaro.md",
      "FFRPG2/Bestiário/Humanóides/assassino-da-khamja-arqueiro.md",
      "FFRPG2/Bestiário/Humanóides/assassino-da-khamja-cavaleiro.md",
      "FFRPG2/Bestiário/Humanóides/assassino-da-khamja-ladrao.md",
      "FFRPG2/Bestiário/Humanóides/bandido-alquimista.md",
      "FFRPG2/Bestiário/Humanóides/bandido-cavaleiro.md",
      "FFRPG2/Bestiário/Humanóides/goblin.md"
    ]
  }
];

const state = {
  documents: [],
  activeSlug: "",
  activeSection: ""
};

const els = {
  list: document.querySelector("#profile-list"),
  search: document.querySelector("#profile-search"),
  type: document.querySelector("#profile-type"),
  name: document.querySelector("#profile-name"),
  stats: document.querySelector("#profile-stats"),
  image: document.querySelector("#profile-image"),
  initials: document.querySelector("#profile-initials"),
  toc: document.querySelector("#profile-toc"),
  content: document.querySelector("#profile-content"),
  themeToggle: document.querySelector("#theme-toggle")
};

init();

async function init() {
  initTheme();
  const loaded = await Promise.all(sections.flatMap((section) => section.files.map((file) => loadDocument(file, section))));
  state.documents = loaded.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  els.search.addEventListener("input", renderNavigation);
  window.addEventListener("hashchange", selectFromHash);
  selectFromHash();
}

function initTheme() {
  const theme = document.documentElement.dataset.theme || "light";
  els.themeToggle.checked = theme === "dark";
  els.themeToggle.addEventListener("change", () => {
    const nextTheme = els.themeToggle.checked ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("ffrpg-theme", nextTheme);
    } catch (error) {
      return;
    }
  });
}

async function loadDocument(file, section) {
  try {
    const markdown = await fetchMarkdown(file);
    const data = extractDocument(markdown, file, section);
    return { file, section, ...data, markdown };
  } catch (error) {
    return {
      file,
      section,
      slug: slugify(file),
      name: file.split("/").pop().replace(/\.md$/, ""),
      title: file,
      type: "Indisponível",
      category: section.title,
      image: "",
      stats: [],
      searchText: file.toLowerCase(),
      markdown: `# ${file}\n\nNão foi possível carregar este arquivo.\n\n${error.message}`
    };
  }
}

async function fetchMarkdown(path) {
  const response = await fetch(encodeURI(path));
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function extractDocument(markdown, file, section) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.split("/").pop().replace(/\.md$/, "");
  const fields = extractFields(markdown);
  const isGuild = /^Guilda:/i.test(title);
  const name = fields.nome || title.replace(/^Guilda:\s*/i, "");
  const category = getCategory(file, section);
  const type = getDocumentType(fields, section, isGuild, category);
  const image = firstReferenceImage(markdown, file);
  const stats = getDocumentStats(fields, section, isGuild, category);

  return {
    name,
    title,
    type,
    category,
    image,
    fields,
    stats,
    slug: `${section.slug}-${slugify(name)}`,
    searchText: `${name} ${title} ${type} ${category} ${Object.values(fields).join(" ")}`.toLowerCase()
  };
}

function extractFields(markdown) {
  const fields = {};
  for (const line of markdown.split(/\r?\n/)) {
    const listField = line.match(/^\s*[*-]\s+\*\*(.+?)\*\*:?\s*(.+)$/);
    const plainField = line.match(/^([A-Za-zÀ-ÿ ]+):\s*(.+)$/);
    const match = listField || plainField;
    if (!match) continue;
    fields[normalizeKey(match[1])] = match[2].trim();
  }
  return fields;
}

function getDocumentType(fields, section, isGuild, category) {
  if (section.slug === "fichas") {
    if (isGuild) return "Guilda";
    return [fields["classe de personagem"], fields["tipo de classe"]].filter(Boolean).join(" / ") || "Personagem";
  }
  return fields["família do monstro"] || category || section.title;
}

function getDocumentStats(fields, section, isGuild, category) {
  if (section.slug === "fichas") {
    return isGuild
      ? pickStats(fields, ["nível", "fama", "experiência", "cofre da guilda"])
      : pickStats(fields, ["nível", "raça", "hp", "mp", "gil"]);
  }
  return [
    { label: "Categoria", value: fields["categoria(s)"] || fields.categoria || category },
    ...pickStats(fields, ["nível", "tipo", "hp", "pontos de vida", "xp", "gil"])
  ].filter((item) => item.value);
}

function getCategory(file, section) {
  const relative = file.replace(`${section.path}/`, "");
  const parts = relative.split("/");
  return parts.length > 1 ? parts[0] : section.title;
}

function pickStats(fields, keys) {
  return keys
    .map((key) => ({ label: titleCase(key), value: fields[key] }))
    .filter((item) => item.value);
}

function firstReferenceImage(markdown, file) {
  const markdownImages = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
  const links = [...markdown.matchAll(/\[[^\]]+\]\(<?(https?:\/\/[^>)]+)>?\)/g)].map((match) => match[1]);
  const allLinks = [...markdownImages, ...links];
  const image = allLinks.find((url) => /\.(png|jpe?g|webp)(\?|$)/i.test(url)) || allLinks[0] || "";
  return resolveAssetPath(image, file);
}

function resolveAssetPath(path, file) {
  if (!path || /^(https?:)?\/\//i.test(path) || path.startsWith("/")) return path;
  const basePath = file.split("/").slice(0, -1).join("/");
  return `${basePath}/${decodeURI(path)}`;
}

function renderNavigation() {
  const route = getRoute();
  const query = els.search.value.trim().toLowerCase();
  els.list.innerHTML = "";

  renderHomeLink(route);

  if (!query && route.type === "dashboard") {
    renderSectionLinks(route);
    return;
  }

  const candidates = route.section
    ? state.documents.filter((document) => document.section.slug === route.section.slug)
    : state.documents;
  const filtered = candidates.filter((document) => !query || document.searchText.includes(query));

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum item encontrado.";
    els.list.append(empty);
    return;
  }

  for (const document of filtered) {
    els.list.append(createNavButton(document.name, document.type, document.slug, document.slug === state.activeSlug));
  }
}

function renderHomeLink(route) {
  els.list.append(createNavButton("Início", "FFRPG2", "", route.type === "dashboard"));
}

function renderSectionLinks(route) {
  for (const section of sections) {
    els.list.append(createNavButton(section.title, section.path, `secao-${section.slug}`, route.section?.slug === section.slug));
  }
}

function createNavButton(title, subtitle, hash, isActive) {
  const button = document.createElement("button");
  button.className = `profile-card${isActive ? " is-active" : ""}`;
  button.type = "button";
  button.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span>`;
  button.addEventListener("click", () => {
    location.hash = hash;
  });
  return button;
}

function selectFromHash() {
  const route = getRoute();
  if (route.type === "dashboard") {
    renderDashboard();
  } else if (route.type === "section") {
    renderSection(route.section);
  } else if (route.type === "section-anchor") {
    if (state.activeSection !== route.section.slug || state.activeSlug) {
      renderSection(route.section);
      requestAnimationFrame(() => document.getElementById(route.hash)?.scrollIntoView());
    }
  } else if (route.type === "document") {
    renderDocument(route.document);
  } else if (route.type === "document-section") {
    if (state.activeSlug !== route.document.slug) {
      renderDocument(route.document);
      requestAnimationFrame(() => document.getElementById(route.hash)?.scrollIntoView());
    }
  }
  renderNavigation();
}

function getRoute() {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!hash) return { type: "dashboard", hash };

  const sectionMatch = hash.match(/^secao-(.+)$/);
  if (sectionMatch) {
    const section = sections.find((item) => item.slug === sectionMatch[1]);
    if (section) return { type: "section", section, hash };
  }

  const sectionAnchor = sections.find((item) => hash.startsWith(`secao-${item.slug}-`));
  if (sectionAnchor) {
    return { type: "section-anchor", section: sectionAnchor, hash };
  }

  const document = state.documents.find((item) => item.slug === hash);
  if (document) return { type: "document", document, section: document.section, hash };

  const sectionDocument = state.documents.find((item) => hash.startsWith(`${item.slug}-`));
  if (sectionDocument) {
    return { type: "document-section", document: sectionDocument, section: sectionDocument.section, hash };
  }

  return { type: "dashboard", hash };
}

function renderDashboard() {
  state.activeSlug = "";
  state.activeSection = "";
  els.content.classList.add("is-gallery");
  setHero({
    eyebrow: "Dashboard",
    title: "FFRPG2",
    initials: "F2",
    stats: sections.map((section) => ({
      label: section.title,
      value: `${section.files.length} itens`
    }))
  });
  showPortrait("");
  els.toc.innerHTML = "";
  els.content.innerHTML = `
    <section class="dashboard-grid">
      ${sections.map((section) => sectionCard(section)).join("")}
    </section>
  `;
}

function sectionCard(section) {
  const categories = [...new Set(section.files.map((file) => getCategory(file, section)))];
  return `
    <a class="dashboard-card" href="#secao-${section.slug}">
      <span>${escapeHtml(section.path)}</span>
      <strong>${escapeHtml(section.title)}</strong>
      <p>${escapeHtml(section.description)}</p>
      <small>${section.files.length} arquivos · ${categories.length} categorias</small>
    </a>
  `;
}

function renderSection(section) {
  state.activeSlug = "";
  state.activeSection = section.slug;
  els.content.classList.add("is-gallery");
  const documents = state.documents.filter((document) => document.section.slug === section.slug);
  const categories = [...new Set(documents.map((document) => document.category))];
  setHero({
    eyebrow: section.path,
    title: section.title,
    initials: section.title.slice(0, 2).toUpperCase(),
    stats: [
      { label: "Arquivos", value: documents.length },
      { label: "Categorias", value: categories.length }
    ]
  });
  showPortrait("");
  els.toc.innerHTML = categories.map((category) => `<a href="#secao-${section.slug}-${slugify(category)}">${escapeHtml(category)}</a>`).join("");
  els.content.innerHTML = categories
    .map((category) => {
      const items = documents.filter((document) => document.category === category);
      return `
        <section class="section-group" id="secao-${section.slug}-${slugify(category)}">
          <h2>${escapeHtml(category)}</h2>
          <div class="document-grid">
            ${items.map((document) => documentCard(document)).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function documentCard(document) {
  return `
    <a class="document-card" href="#${document.slug}">
      <strong>${escapeHtml(document.name)}</strong>
      <span>${escapeHtml(document.type)}</span>
    </a>
  `;
}

function renderDocument(document) {
  state.activeSlug = document.slug;
  state.activeSection = document.section.slug;
  els.content.classList.remove("is-gallery");
  setHero({
    eyebrow: document.type,
    title: document.name,
    initials: initialsFor(document.name),
    stats: document.stats
  });
  showPortrait(document.image);

  const rendered = renderMarkdown(document.markdown, document.slug);
  els.content.innerHTML = rendered.html;
  els.toc.innerHTML = rendered.toc
    .filter((item) => item.level <= 3)
    .map((item) => `<a href="#${document.slug}-${item.id}">${escapeHtml(item.text)}</a>`)
    .join("");
}

function setHero({ eyebrow, title, initials, stats }) {
  els.type.textContent = eyebrow;
  els.name.textContent = title;
  els.initials.textContent = initials || "F2";
  els.stats.innerHTML = stats
    .map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`)
    .join("");
}

function initialsFor(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function showPortrait(src) {
  els.image.hidden = true;
  els.image.removeAttribute("src");
  els.initials.hidden = false;
  if (!src) return;

  els.image.onload = () => {
    els.initials.hidden = true;
    els.image.hidden = false;
  };
  els.image.onerror = () => {
    els.image.hidden = true;
    els.initials.hidden = false;
  };
  els.image.alt = "";
  els.image.referrerPolicy = "no-referrer";
  els.image.src = src;
}

function renderMarkdown(markdown, documentSlug) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  const listStack = [];
  let paragraph = [];
  let inCode = false;
  let codeLines = [];
  const inlineMarkdown = (text) => inline(text, documentSlug);

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeListsTo = (depth) => {
    while (listStack.length > depth) {
      html.push("</ul>");
      listStack.pop();
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s{8,}/.test(line)) {
      flushParagraph();
      closeListsTo(0);
      inCode = true;
      codeLines.push(line.replace(/^\s{8}/, ""));
      continue;
    }

    if (inCode && line.trim() === "") {
      codeLines.push("");
      continue;
    }

    if (inCode) {
      html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      codeLines = [];
      inCode = false;
    }

    if (line.trim() === "") {
      flushParagraph();
      closeListsTo(0);
      continue;
    }

    if (isTableStart(lines, index)) {
      flushParagraph();
      closeListsTo(0);
      const table = collectTable(lines, index);
      html.push(renderTable(table.rows, table.alignments, inlineMarkdown));
      index = table.endIndex;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeListsTo(0);
      const level = heading[1].length;
      const text = stripInline(heading[2].trim());
      const id = uniqueId(slugify(text), toc);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${documentSlug}-${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      closeListsTo(0);
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const item = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (item) {
      flushParagraph();
      const depth = Math.floor(item[1].length / 2) + 1;
      while (listStack.length < depth) {
        html.push("<ul>");
        listStack.push("ul");
      }
      closeListsTo(depth);
      html.push(`<li>${inlineMarkdown(item[2])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushParagraph();
  closeListsTo(0);
  return { html: html.join("\n"), toc };
}

function isTableStart(lines, index) {
  return isTableRow(lines[index]) && isTableSeparator(lines[index + 1]);
}

function isTableRow(line = "") {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isTableSeparator(line = "") {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function collectTable(lines, startIndex) {
  const rows = [splitTableRow(lines[startIndex])];
  const alignments = splitTableRow(lines[startIndex + 1]).map(tableAlignment);
  let index = startIndex + 2;
  while (isTableRow(lines[index])) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }
  return { rows, alignments, endIndex: index - 1 };
}

function splitTableRow(line = "") {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function tableAlignment(separator) {
  const trimmed = separator.trim();
  if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
  if (trimmed.endsWith(":")) return "right";
  return "left";
}

function renderTable(rows, alignments, inlineMarkdown) {
  const [header, ...body] = rows;
  const align = (index) => ` style="text-align: ${alignments[index] || "left"}"`;
  return `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>${header.map((cell, index) => `<th${align(index)}>${inlineMarkdown(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${body.map((row) => `<tr>${row.map((cell, index) => `<td${align(index)}>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function inline(text, documentSlug) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(&lt;(.+?)&gt;\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\[([^\]]+)\]\((#[^)]+)\)/g, (_match, label, href) => {
      return `<a href="#${documentSlug}-${slugify(href.slice(1))}">${label}</a>`;
    })
    .replace(/\[([^\]]+)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function stripInline(text) {
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}

function normalizeKey(key) {
  return key.trim().replace(/:$/, "").toLowerCase();
}

function titleCase(text) {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(base, toc) {
  let id = base || "secao";
  let index = 2;
  while (toc.some((item) => item.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function escapeHtml(value = "") {
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
