const profiles = [
  { file: "FFRPG2/Fichas/Andrus Andradus.md" },
  { file: "FFRPG2/Fichas/Anne.md" },
  { file: "FFRPG2/Fichas/Clarence.md" },
  { file: "FFRPG2/Fichas/Erya Orbless.md" },
  { file: "FFRPG2/Fichas/Ordem do Céu.md" }
];

const state = {
  profiles: [],
  activeSlug: ""
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
  content: document.querySelector("#profile-content")
};

init();

async function init() {
  const loaded = await Promise.all(profiles.map(loadProfile));
  state.profiles = loaded.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  renderList();
  els.search.addEventListener("input", renderList);
  window.addEventListener("hashchange", selectFromHash);
  selectFromHash();
}

async function loadProfile(profile) {
  const paths = [profile.file, `../${profile.file}`];
  try {
    const markdown = await fetchFirst(paths);
    const data = extractProfile(markdown, profile.file);
    return { ...profile, ...data, markdown };
  } catch (error) {
    return {
      ...profile,
      slug: slugify(profile.file),
      name: profile.file.split("/").pop().replace(/\.md$/, ""),
      type: "Indisponível",
      searchText: profile.file,
      markdown: `# ${profile.file}\n\nNão foi possível carregar esta ficha.\n\n${error.message}`
    };
  }
}

async function fetchFirst(paths) {
  const errors = [];
  for (const path of paths) {
    try {
      const response = await fetch(encodeURI(path));
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      errors.push(`${path}: ${error.message}`);
    }
  }
  throw new Error(errors.join("; "));
}

function extractProfile(markdown, file) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.split("/").pop().replace(/\.md$/, "");
  const fields = {};
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\s*[*-]\s+\*\*(.+?)\*\*:?\s*(.+)$/);
    if (!match) continue;
    fields[normalizeKey(match[1])] = match[2].trim();
  }

  const name = fields.nome || title.replace(/^Guilda:\s*/i, "");
  const isGuild = /^Guilda:/i.test(title);
  const type = isGuild
    ? "Guilda"
    : [fields["classe de personagem"], fields["tipo de classe"]].filter(Boolean).join(" / ") || "Personagem";
  const image = firstReferenceImage(markdown);
  const stats = isGuild
    ? pickStats(fields, ["nível", "fama", "experiência", "cofre da guilda"])
    : pickStats(fields, ["nível", "raça", "hp", "mp", "gil"]);

  return {
    name,
    title,
    type,
    image,
    fields,
    stats,
    slug: slugify(name),
    searchText: `${name} ${title} ${type} ${Object.values(fields).join(" ")}`.toLowerCase()
  };
}

function pickStats(fields, keys) {
  return keys
    .map((key) => ({ label: titleCase(key), value: fields[key] }))
    .filter((item) => item.value);
}

function firstReferenceImage(markdown) {
  const links = [...markdown.matchAll(/\[[^\]]+\]\(<?(https?:\/\/[^>)]+)>?\)/g)].map((match) => match[1]);
  return links.find((url) => /\.(png|jpe?g|webp)(\?|$)/i.test(url)) || links[0] || "";
}

function renderList() {
  const query = els.search.value.trim().toLowerCase();
  const filtered = state.profiles.filter((profile) => !query || profile.searchText.includes(query));
  els.list.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma ficha encontrada.";
    els.list.append(empty);
    return;
  }

  for (const profile of filtered) {
    const button = document.createElement("button");
    button.className = `profile-card${profile.slug === state.activeSlug ? " is-active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.type)}</span>`;
    button.addEventListener("click", () => {
      location.hash = profile.slug;
    });
    els.list.append(button);
  }
}

function selectFromHash() {
  const wanted = decodeURIComponent(location.hash.replace(/^#/, ""));
  const profile = state.profiles.find((item) => item.slug === wanted) || state.profiles[0];
  if (!profile) return;
  state.activeSlug = profile.slug;
  renderProfile(profile);
  renderList();
}

function renderProfile(profile) {
  els.type.textContent = profile.type;
  els.name.textContent = profile.name;
  els.stats.innerHTML = profile.stats
    .map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`)
    .join("");

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  els.initials.textContent = initials || "F2";
  showPortrait(profile.image);

  const rendered = renderMarkdown(profile.markdown);
  els.content.innerHTML = rendered.html;
  els.toc.innerHTML = rendered.toc
    .filter((item) => item.level <= 3)
    .map((item) => `<a href="#${profile.slug}-${item.id}">${escapeHtml(item.text)}</a>`)
    .join("");
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

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  const listStack = [];
  let paragraph = [];
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeListsTo = (depth) => {
    while (listStack.length > depth) {
      html.push("</ul>");
      listStack.pop();
    }
  };

  for (const line of lines) {
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

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeListsTo(0);
      const level = heading[1].length;
      const text = stripInline(heading[2].trim());
      const id = uniqueId(slugify(text), toc);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${state.activeSlug}-${id}">${inline(text)}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      closeListsTo(0);
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
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
      html.push(`<li>${inline(item[2])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushParagraph();
  closeListsTo(0);
  return { html: html.join("\n"), toc };
}

function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(&lt;(.+?)&gt;\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
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
