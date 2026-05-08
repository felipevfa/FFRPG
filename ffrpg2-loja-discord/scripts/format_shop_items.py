#!/usr/bin/env python3
"""Format FFRPG2 shop availability entries for Discord."""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = REPO_ROOT / "Sistema" / "Contexto" / "12-itens-disponiveis-loja-ffrpg2.md"
PARTY_LEVEL_FILES = [
    REPO_ROOT / "FFRPG2" / "Fichas" / "andrus-andradus.md",
    REPO_ROOT / "FFRPG2" / "Fichas" / "erya-orbless.md",
]


@dataclass(frozen=True)
class Item:
    section: str
    category: str
    name: str
    tier: str
    cost: str
    availability: str
    description: str
    damage: str
    modifiers: str
    abilities: str

    @property
    def availability_value(self) -> int:
        return int(self.availability.rstrip("%"))


ITEM_RE = re.compile(
    r"^- (?P<name>.+?) \((?P<tier>T\d+)?(?:,\s*)?(?P<cost>.+?), (?P<availability>\d+%)\)(?P<details>.*)$"
)
STOPWORDS = {
    "a",
    "as",
    "com",
    "consulta",
    "comprar",
    "da",
    "de",
    "disponiveis",
    "disponivel",
    "disponibilidade",
    "do",
    "dos",
    "e",
    "em",
    "ffrpg2",
    "item",
    "itens",
    "loja",
    "na",
    "no",
    "o",
    "os",
    "para",
    "porcento",
    "retorne",
    "retornar",
    "todos",
    "todas",
}
AVAILABILITY_RE = re.compile(r"(?<![A-Za-z])(?P<value>100|\d{1,2})\s*%?")


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return ascii_text.casefold()


def tokens(value: str) -> list[str]:
    return [token for token in re.findall(r"[a-z0-9]+", normalize(value)) if token not in STOPWORDS]


def split_query(query: str) -> tuple[str, int | None]:
    """Return category/item query plus an optional minimum availability threshold."""
    matches = list(AVAILABILITY_RE.finditer(query))
    if not matches:
        stripped = query.strip()
        return (stripped if tokens(stripped) else ""), None

    match = matches[-1]
    threshold = int(match.group("value"))
    stripped = f"{query[:match.start()]} {query[match.end():]}".strip()
    if not tokens(stripped):
        stripped = ""
    return stripped, threshold


def current_availability_floor() -> int:
    levels = []
    for path in PARTY_LEVEL_FILES:
        if not path.exists():
            continue
        match = re.search(r"\*\s+\*\*Nível\*\*:\s*(\d+)", path.read_text(encoding="utf-8"))
        if match:
            levels.append(int(match.group(1)))

    if not levels:
        return 0

    average_level = sum(levels) / len(levels)
    floor = 92 - (average_level * 1.25)
    return int(-(-floor // 1))


def parse_items(source: Path) -> list[Item]:
    section = ""
    category = ""
    items: list[Item] = []

    for line in source.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            section = line.removeprefix("## ").strip()
            category = ""
            continue
        if line.startswith("### "):
            category = line.removeprefix("### ").strip()
            continue

        match = ITEM_RE.match(line.strip())
        if not match:
            continue

        cost = match.group("cost").strip()
        tier = match.group("tier") or "-"
        details = parse_details(match.group("details"))
        items.append(
            Item(
                section=section,
                category=category or section,
                name=match.group("name").strip(),
                tier=tier,
                cost=cost,
                availability=match.group("availability"),
                description=details.get("Descrição", ""),
                damage=details.get("Dano", ""),
                modifiers=details.get("Modificadores", ""),
                abilities=details.get("Habilidades", ""),
            )
        )

    return items


def parse_details(raw: str) -> dict[str, str]:
    details: dict[str, str] = {}
    for part in raw.split(" — "):
        if ":" not in part:
            continue
        key, value = part.split(":", 1)
        key = key.strip(" -—")
        if key in {"Descrição", "Dano", "Modificadores", "Habilidades"}:
            details[key] = value.strip()
    return details


def score(item: Item, query: str) -> int:
    if not query.strip() or normalize(query.strip()) in {"all", "todos", "tudo", "*"}:
        return 1

    haystacks = [
        normalize(item.name),
        normalize(item.category),
        normalize(item.section),
        normalize(f"{item.section} {item.category} {item.name} {item.tier} {item.cost} {item.availability}"),
    ]
    query_norm = normalize(query)
    query_tokens = tokens(query)
    if not query_tokens:
        return 0

    result = 0
    if query_norm in haystacks[0]:
        result += 8
    if query_norm in haystacks[1]:
        result += 6
    if query_norm in haystacks[2]:
        result += 4

    combined = haystacks[3]
    if all(token in combined for token in query_tokens):
        result += len(query_tokens)

    return result


def effective_threshold(threshold: int | None, floor: int) -> int | None:
    if threshold is None:
        return None
    return max(threshold, floor)


def filter_items(items: list[Item], query: str, threshold: int | None) -> list[Item]:
    filtered = items
    if threshold is not None:
        filtered = [item for item in filtered if item.availability_value >= threshold]

    if not query.strip() and threshold is not None:
        return filtered

    return [item for item in filtered if score(item, query) > 0]


def discounted_cost(cost: str, discount: int | None) -> str | None:
    if discount is None:
        return None

    match = re.fullmatch(r"(?P<value>\d+) Gil(?P<suffix>.*)", cost)
    if not match:
        return None

    value = int(match.group("value"))
    discounted = round(value * (100 - discount) / 100)
    return f"{discounted} Gil{match.group('suffix')}"


def format_discord(
    items: list[Item],
    original_query: str,
    category_query: str,
    threshold: int | None,
    requested_threshold: int | None,
    source: Path,
    discount: int | None,
) -> str:
    details = []
    if category_query.strip():
        details.append(f"categoria/termo `{category_query}`")
    if threshold is not None:
        if requested_threshold is not None and threshold != requested_threshold:
            details.append(f"disponibilidade mínima `{threshold}%` (piso aplicado sobre `{requested_threshold}%`)")
        else:
            details.append(f"disponibilidade mínima `{threshold}%`")
    if discount is not None:
        details.append(f"desconto `{discount}%`")
    filter_description = " | ".join(details) if details else "todos"

    if not items:
        return (
            f"**Itens de loja FFRPG2 - consulta:** `{original_query}`\n"
            f"Filtro: {filter_description}\n"
            "Nenhum item encontrado em `Sistema/Contexto/12-itens-disponiveis-loja-ffrpg2.md`."
        )

    lines = [
        f"**Itens de loja FFRPG2 - consulta:** `{original_query or 'todos'}`",
        f"Filtro: {filter_description}",
        f"Fonte: `{source.relative_to(REPO_ROOT)}`",
    ]

    current_group = None
    for item in items:
        group = f"{item.section} / {item.category}" if item.section != item.category else item.section
        if group != current_group:
            lines.append("")
            lines.append(f"**{group}**")
            current_group = group

        sale_price = discounted_cost(item.cost, discount)
        price = sale_price or item.cost

        fields = [f"Custo: `{price}`"]
        if item.description:
            fields.append(f"Desc.: {item.description}")
        if item.damage:
            fields.append(f"Dano: `{item.damage}`")
        if item.modifiers:
            fields.append(f"Mod.: `{item.modifiers}`")
        if item.abilities:
            fields.append(f"Hab.: {item.abilities}")

        lines.append(f"- **{item.name}** — " + " | ".join(fields))

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="*", help="Termo de busca, item ou categoria.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Markdown de disponibilidade.")
    parser.add_argument("--discount", type=int, default=None, help="Percentual de desconto a aplicar ao custo em Gil.")
    args = parser.parse_args()

    query = " ".join(args.query).strip()
    if not args.source.exists():
        print(f"Arquivo de origem não encontrado: {args.source}", file=sys.stderr)
        return 2

    items = parse_items(args.source)
    category_query, threshold = split_query(query)
    floor = current_availability_floor()
    requested_threshold = threshold
    threshold = effective_threshold(threshold, floor)
    matches = filter_items(items, category_query, threshold)
    print(format_discord(matches, query, category_query, threshold, requested_threshold, args.source, args.discount))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
