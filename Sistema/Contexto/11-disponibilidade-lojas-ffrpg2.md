# Disponibilidade de Lojas em FFRPG2

Fonte: `rulebook.pdf`, contexto de equipamentos e disponibilidade; calibrado pelas fichas em `FFRPG2/Fichas`.

## Recomendação Base

Use **75% de disponibilidade base** para itens de loja geral em FFRPG2.

Essa chance representa uma loja confiável para reposição comum, sem tornar itens raros ou equipamentos especiais garantidos.

## Piso do Índice de Disponibilidade

O Índice de Disponibilidade de uma loja em FFRPG2 **nunca deve ser menor que**:

```text
92 - (nível médio do grupo x 1.25)
```

Para FFRPG2, o nível médio do grupo deve ser calculado como a média simples entre:

| Personagem | Fonte | Nível |
|---|---|---:|
| Andrus Andradus | `FFRPG2/Fichas/andrus-andradus.md` | 10 |
| Erya Orbless | `FFRPG2/Fichas/erya-orbless.md` | 10 |

Média atual:

```text
(10 + 10) / 2 = 10
```

Piso atual:

```text
92 - (10 x 1.25) = 79,5
```

Como as tabelas de disponibilidade trabalham com percentuais inteiros, use **80%** como piso operacional atual. Assim, qualquer consulta, rolagem ou geração de inventário em que o Índice de Disponibilidade da loja seja relevante deve tratar valores abaixo de 80% como 80%.

## Ajustes por Raridade

| Disponibilidade | Itens |
|---:|---|
| 90% | Consumíveis básicos, como Tônico, Poção, Antidote e Eye Drops. |
| 75% | Consumíveis comuns úteis ao grupo, como Extrato/Tincture e Poção Média/Hi-Potion. |
| 55% | Itens mais fortes ou situacionais, como Ether, Phoenix Down, Remedy e Light Curtain. |
| 30% | Equipamentos especiais, armas com status, acessórios e itens de nicho. |

## Materiais

Para materiais, mantenha a disponibilidade por Tier conforme `Sistema/Perícias Técnicas/Materiais.md`.

## Justificativa

Andrus e Erya estão em nível 10 e têm bastante Gil, enquanto Clarence e Anne têm recursos bem menores. A base de 75% preserva acesso razoável a reposição entre aventuras, mas ainda exige planejamento para itens de ressurreição, suporte forte, equipamentos especiais e materiais melhores.
