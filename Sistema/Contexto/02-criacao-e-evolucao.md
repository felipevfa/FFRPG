# Criação e Evolução de Personagens

Fonte: `rulebook.pdf`, Capítulo II.

## Fluxo de Criação

1. Definir conceito, nome, idade, aparência, histórico, personalidade, posses, objetivos e citação.
2. Escolher Raça.
3. Escolher Classe e Job.
4. Distribuir Atributos.
5. Calcular verificações de Atributos.
6. Escolher Vantagens e Desvantagens, se o Mestre permitir.
7. Comprar equipamentos.
8. Calcular Estatísticas de Combate.
9. Distribuir Perícias.
10. Escolher magias ou invenções iniciais, se aplicável.
11. Pré-calcular códigos de dano e efeitos frequentes.

## Atributos Iniciais

Personagens iniciantes recebem 40 pontos para distribuir entre FOR, VIT, AGI, VEL, MAG e ESP. Cada Atributo deve receber pelo menos 1 ponto, e nenhum pode exceder o Máximo Racial inicial.

## Máximos Raciais Iniciais

| Raça | FOR | VIT | AGI | VEL | MAG | ESP |
|---|---:|---:|---:|---:|---:|---:|
| Humano | 10 | 10 | 10 | 10 | 10 | 10 |
| Bangaa | 12 | 12 | 10 | 9 | 9 | 8 |
| Creimire | 8 | 10 | 13 | 11 | 9 | 9 |
| Anão | 10 | 13 | 10 | 8 | 9 | 10 |
| Elfo | 13 | 13 | 7 | 9 | 7 | 11 |
| Galka | 11 | 15 | 10 | 9 | 8 | 7 |
| Mithra | 9 | 9 | 12 | 12 | 9 | 9 |
| Moogle | 8 | 6 | 11 | 12 | 11 | 12 |
| Nu Mou | 10 | 9 | 10 | 7 | 12 | 12 |
| Qu | 10 | 11 | 6 | 7 | 13 | 13 |
| Ronso | 12 | 13 | 9 | 7 | 12 | 7 |
| Tarutaru | 6 | 7 | 9 | 11 | 12 | 15 |
| Varg | 11 | 8 | 12 | 13 | 8 | 8 |
| Viera | 12 | 6 | 12 | 12 | 12 | 6 |
| Yeti | 13 | 15 | 6 | 9 | 7 | 10 |

## Estatísticas Iniciais

```text
HP inicial = 30 + rolagem do Dado de Vida do Job + VIT
MP inicial = 10 + rolagem do Dado de Magia do Job + ESP
```

Jobs sem Dado de Magia têm 0 MP.

```text
EVA = AGI + VEL + bônus de equipamentos
EVA M. = ESP + MAG + bônus de equipamentos
DEX = Nível + (AGI x 2) + 50
MNT = Nível + (MAG x 2) + 50
PREC = Nível + (AGI x 2) + Bônus de Ataque do Job + Perícia com Arma
PREC M. = Nível + (MAG x 2) + 100
EXP = (Perícia Expert / 2) + Nível + (Atributo da Perícia Expert x 2)
EXP de Engenheiro = Inventar + Nível + (AGI x 2)
```

ARM e ARM M. somam os valores dos equipamentos e aplicam modificador por VIT ou ESP.

| VIT/ESP | Modificador |
|---:|---:|
| 1-2 | +5% |
| 3-4 | +10% |
| 5-6 | +15% |
| 7-8 | +20% |
| 9-10 | +25% |
| 11-12 | +30% |
| 13-14 | +35% |
| 15-16 | +40% |
| 17-18 | +45% |
| 19-20 | +50% |
| 21-22 | +55% |
| 23-24 | +60% |
| 25-26 | +65% |
| 27-28 | +70% |
| 29-30 | +75% |

## Perícias Iniciais

- Cada Job concede uma quantidade de Pontos de Perícia.
- Perícias custam 1 por ponto, exceto quando a regra indicar custo diferente.
- Perícias dentro da Aptidão do Job compram 2 pontos de perícia para cada 1 ponto gasto.
- Perícias compradas na criação devem ter valor mínimo 20 e máximo 50.
- Todo personagem deve ter pelo menos uma Perícia com Arma em 20.
- Todo personagem recebe Prontidão 30 grátis.
- O personagem recebe 160 pontos extras apenas para Conhecimento* e Língua*, além de Língua Comum 50 grátis.

## Magia Inicial

- Magias Negra, Branca, Vermelha, Tempo ou Encantamento: três magias de Nível 1 da lista apropriada.
- Mago Azul: escolhe magias azuis cuja soma de custo em MP não exceda seu MP inicial; recomenda-se não iniciar com magias acima de 15 MP.
- Cavaleiro Mágico: uma magia da Linha Elemental e uma da Linha de Status.
- Summoner: começa com um Summon entre Valefor, Lakshmi, Remora, Ifrit, Ramuh ou Shiva.
- Invocador: começa com Valefor, Lakshmi ou Remora e mais duas magias de Nível 1 de sua lista.

## Evolução

Para subir de nível:

```text
XP necessário = Nível atual x 500
```

O XP zera após a evolução.

Ao ganhar nível:

- HP aumenta em `Dado de Vida do Job + (VIT / 2)`.
- MP aumenta em `Dado de Magia do Job + (ESP / 2)`, se o Job tiver Dado de Magia.
- Ganha 1 Ponto de Atributo.
- Não pode aumentar o mesmo Atributo em dois níveis consecutivos.
- Não pode exceder o Limite de Atributo, salvo regra de avanço além do limite.
- Ganha 10 Pontos de Perícia gerais.
- Ganha 6 pontos para Língua* e Conhecimento*.
- Perícias acima de 50 só podem aumentar até 2 pontos por nível.
- Nenhuma Perícia pode exceder 100.

## Personagens Experientes

Para criação rápida acima do nível 1:

```text
Pontos de Atributo = 40 + (Nível - 1)
HP = 30 + VIT + (Nível x valor médio do Dado de Vida) + [(VIT / 2) x (Nível - 1)]
MP = 10 + ESP + (Nível x valor médio do Dado de Magia) + [(ESP / 2) x (Nível - 1)]
Pontos de Perícia extras = 10 x (Nível - 1)
Pontos extras de Língua*/Conhecimento* = 6 x (Nível - 1)
Valor máximo de Perícia = 48 + (2 x Nível), limitado a 100
```

