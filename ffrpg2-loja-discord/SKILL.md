---
name: ffrpg2-loja-discord
description: Use esta skill quando o usuário pedir uma consulta de itens disponíveis em loja de FFRPG2, baseada em Sistema/Contexto/12-itens-disponiveis-loja-ffrpg2.md, e quiser uma lista formatada para colar no Discord.
---

# FFRPG2 Loja Discord

Use esta skill para responder consultas sobre itens de loja do FFRPG2 usando o contexto local de disponibilidade. A consulta pode conter uma categoria, um nome parcial de item e/ou um número inteiro de 0 a 100 representando a disponibilidade mínima desejada. A saída inclui descrição quando o contexto trouxer esse campo.

## Fonte primária

Leia primeiro:

- `Sistema/Contexto/12-itens-disponiveis-loja-ffrpg2.md`

Se a pergunta pedir detalhe que não exista nesse Markdown, consulte:

- `Sistema/Contexto/rulebook.txt`

## Fluxo

1. Interprete o prompt do usuário como uma consulta por item, categoria ou termo parcial.
2. Se houver um número inteiro de 0 a 100 no prompt, trate-o como disponibilidade mínima. Exemplos:
   - `Katana 85` retorna itens da categoria Katana com disponibilidade de 85% ou mais.
   - `retorne todos os itens de disponibilidade 50%` retorna todos os itens do Markdown com disponibilidade de 50% ou mais.
   - Como o arquivo de referência atual lista apenas itens entre 75% e 100%, filtros abaixo de 75% retornam todos os itens cadastrados, salvo quando houver uma categoria/termo adicional.
3. Rode o script:

```bash
python3 ffrpg2-loja-discord/scripts/format_shop_items.py "consulta do usuário"
```

Para aplicar desconto no preço em Gil, use:

```bash
python3 ffrpg2-loja-discord/scripts/format_shop_items.py "consulta do usuário" --discount 15
```

4. Retorne a saída do script sem cercar em bloco de código, salvo se o usuário pedir explicitamente.
5. Se o script não encontrar resultados, consulte `rulebook.txt` para verificar se o termo existe em outro contexto e diga que ele não está listado como item disponível em loja no arquivo de disponibilidade.

## Formato esperado

A resposta deve estar pronta para colar no Discord:

- Cabeçalho curto em negrito.
- Agrupamento por categoria.
- Itens em bullets.
- Para cada item, retornar apenas: nome do item, custo e descrição.
- Nome do item em negrito.
- Custo em monospace.
- Se houver desconto, retornar somente o custo final com desconto; não explicitar o preço original nem dizer que houve desconto.
- Para equipamentos, incluir também quando disponíveis no contexto: fórmula de dano, modificadores de estatística e habilidades.

Não inclua explicações longas. Quando houver muitos resultados, mantenha todos os itens encontrados, pois a consulta costuma ser usada como lista de compra.
