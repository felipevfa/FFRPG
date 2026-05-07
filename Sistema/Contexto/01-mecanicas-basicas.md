# Mecânicas Básicas

Fonte: `rulebook.pdf`, Capítulo I.

## Dados

O sistema usa dados `d6`, `d8`, `d10` e `d12`. A maioria dos testes usa `d%`, formado por dois `d10`, gerando valores de 1 a 100.

Em testes percentuais, o personagem tem sucesso se rolar valor igual ou menor que a Chance de Sucesso (`CdS`).

## Críticos

| Rolagem | Resultado |
|---|---|
| 1 a 10 | Sucesso crítico, se o teste permitir. |
| 95 a 100 | Falha crítica. |

A Regra do 10 garante que uma rolagem de 10 ou menos ainda seja sucesso quando modificadores reduzirem a CdS a 0 ou menos, desde que a tarefa não seja explicitamente impossível. Esse sucesso não conta como sucesso crítico.

## Atributos

| Atributo | Abrev. | Uso |
|---|---:|---|
| Força | FOR | Força física, carga, dano com armas físicas. |
| Vitalidade | VIT | Resistência, fôlego, defesa física e durabilidade. |
| Agilidade | AGI | Coordenação, mira, destreza e ataques de precisão. |
| Velocidade | VEL | Corrida, reflexos, iniciativa e deslocamento. |
| Magia | MAG | Controle de mana, chi, elementos e eficácia mágica. |
| Espírito | ESP | Determinação, resistência mental, carisma e proteção mágica. |

Para testes de Atributo, use:

```text
Verificação de Atributo = (Atributo x 3) + 10
```

## Estatísticas de Combate

| Estatística | Uso |
|---|---|
| HP | Condição física; ao chegar a 0, o personagem fica inconsciente. |
| MP | Reserva para magias e habilidades mágicas. |
| EVA | Defesa contra ataques físicos. |
| EVA M. | Defesa contra efeitos mágicos. |
| PREC | Chance-base para ataques com armas. |
| PREC M. | Chance-base para magias e efeitos mágicos. |
| ARM | Redução de dano físico. |
| ARM M. | Redução de dano mágico. |
| DEX | Precisão de ataques especiais baseados em Agilidade. |
| MNT | Precisão de ataques especiais baseados em Magia. |
| EXP | Estatística usada por Jobs Experts. |

## Verificações de Tarefa

O Mestre escolhe um Atributo ou Perícia e aplica um Modificador de Condição.

| Dificuldade | Modificador |
|---|---:|
| Elementar | +80 |
| Fácil | +40 |
| Simples | +20 |
| Problemática | 0 |
| Desafiadora | -20 |
| Formidável | -40 |
| Heróica | -60 |
| Impossível | -80 |

Se `Atributo/Perícia + Modificador >= 100`, o sucesso é automático. Caso contrário, role `d%` contra esse total.

## Testes Resistidos

Em uma Verificação Resistida, todos os envolvidos rolam contra suas próprias CdS. Vence quem obtiver o menor valor relativo dentro da própria CdS. Falhas removem o participante, salvo se todos falharem. Sucessos críticos vencem, salvo se houver outro sucesso crítico.

## Cenas

Uma Cena tem três fases:

| Fase | Função |
|---|---|
| Iniciativa | Define a ordem de ação com `d10 + VEL`. |
| Ação | Participantes executam ações, testes, ataques ou habilidades. |
| Status | Aplica efeitos de status, reduz timers e resolve consequências. |

Uma Cena termina com mudança relevante de local, passagem significativa de tempo ou conclusão do conflito.

