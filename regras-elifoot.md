# Regras e Mecânicas do Elifoot (Pesquisa) → Adaptação para o CopaFoot

> Documento de pesquisa sobre como o **Elifoot** funciona, para deixarmos o CopaFoot
> o mais fiel possível ao clássico. No fim de cada seção há a **proposta de adaptação**
> para o nosso jogo de Copa do Mundo 2026.

Fontes consultadas: site/história oficial do Elifoot, Wikipédia (Elifoot), análises (Salão de
Jogos, Baixaki, A Casa do Cogumelo), fóruns e guias de dicas (Footmundo, Turbo Elifoot,
Guia Elifoot 98) e a página da loja do Elifoot 24.

---

## 1. Conceito geral do Elifoot

- Jogo de **gerência de futebol** de estilo clássico, criado por Elifoot (PT) — versão mais
  famosa é o **Elifoot 98**. Hoje continua ativo (Elifoot 24).
- O jogador é **dirigente + técnico** ao mesmo tempo: escala o time, cuida das finanças,
  compra e vende jogadores e define a tática de cada partida.
- Foco em **simplicidade**: pouca firula gráfica, muitas decisões de números e texto.
- Característica marcante: você começa num **time fraco (4ª divisão)** e, com bons resultados,
  recebe **convites** de clubes melhores até chegar à elite.

---

## 2. Sistema de divisões (clássico)

- Estrutura em **divisões sequenciais**: 1ª, 2ª, 3ª e 4ª divisão (no Elifoot 98).
- Versões modernas permitem **configurar** o número de divisões e o número de times por
  divisão (até ~20 por divisão).
- O jogo distribui as equipes da **mais forte para a mais fraca**: as melhores ficam na 1ª
  divisão e assim por diante.
- **Acesso/Promoção:** geralmente os **2 melhores** colocados sobem de divisão.
- **Rebaixamento:** os piores colocados caem para a divisão inferior.
- A cada temporada disputa-se o **campeonato da divisão** + o **campeonato nacional** (todos os
  times do país) + copas (nacionais, internacionais e, em alguns países, estaduais).
- **Sindicato de Técnicos:** impede você de ser demitido, *exceto* se o time for rebaixado da
  última divisão nacional.

> **✅ DECISÃO (CopaFoot):** Usamos o **modo carreira com "potes"** no lugar das divisões.
> Os **4 potes** do sorteio fazem o papel das divisões (Pote 1 = seleções fortes, Pote 4 = mais
> fracas). Você começa numa **seleção fraca** e recebe **convites** de seleções melhores conforme
> tem bons resultados — a essência "comece pequeno e cresça" do Elifoot.

---

## 3. Jogadores e atributos

### No Elifoot 98 (clássico, mais simples)
- Apenas **4 posições**: **Guarda-redes (Goleiro)**, **Defesa (Zagueiro)**, **Médio (Meio-campo)**
  e **Avançado (Atacante)**.
- O atributo principal era a **Força (nível)**, um número que definia a qualidade do jogador.
- **Estrelinha / asterisco (\*)**: jogadores marcados com asterisco têm **rendimento superior**
  no longo prazo (especialmente meias e atacantes viram artilheiros). ~30% dos meias/atacantes
  têm estrelinha. É um dos segredos clássicos do jogo.

### Atributos que apareceram nas versões mais novas
- **Força:** qualidade técnica geral do jogador.
- **Performance:** o jogador pode ter muita força mas estar com performance baixa, o que
  prejudica seu desempenho (e o do time). É como uma "forma" atual.
- **Remate:** atributo de finalização — um dos mais importantes para fazer gols.
- **Moral:** afeta diretamente a produtividade em campo.
- **Comportamento:** disciplina do jogador (ex.: "cavalheiro" = quase não toma cartão/expulsão).
- Versões a partir de **2009** detalharam as **posições** (lateral esquerdo, ponta-de-lança,
  médio direito, etc.) e formações específicas, em vez das 4 posições básicas.
- Há também **lesões**, **cansaço/fadiga**, **idade** (pedida pelos jogadores) e evolução por
  treino.

> **✅ DECISÃO (CopaFoot):** O mais simples possível — **1 único atributo**:
> - Posições: **GOL / DEF / MEI / ATA** (4 posições).
> - Atributo único: **Força (1–100)**. É só isso que define a qualidade do jogador.
> - Estrelinha, Remate, Moral, Comportamento e Performance: **ficam fora** (eventual fase futura).

---

## 4. Tática e partida

- **Escalação:** 11 titulares + reservas (no Elifoot 2010, 7 reservas; plantel de 18+).
  É possível escalar automaticamente pelo esquema ou montar manualmente.
- **Formações:** escritas como números, ex.: **442, 433, 352, 4231**. O usuário pode posicionar
  jogadores em qualquer posição do campo nas versões novas.
- **Setinhas (ordens ofensiva/defensiva):** empurram o meio-campo para atacar ou defender.
  - Seta defensiva → meias ajudam a defesa (ganha % na defesa, perde no meio/ataque).
  - Seta ofensiva → o contrário.
  - Dica clássica: muitas vezes **substituir** é melhor do que apenas dar uma ordem.
- **Partida minuto a minuto:** dá para acompanhar e reagir a lesões e expulsões em tempo real.
- Elementos da partida: **gols, cartões amarelos e vermelhos, lesões, pênaltis**, posse
  (relacionada a ter mais meio-campo), e o fator **sorte** (o Elifoot 98 é famoso por isso).
- **Como ganhar (dica clássica):** ter **goleadores** é o que decide; manter ~45–70% de posse;
  ajustar a tática conforme o adversário; cuidar do **cansaço** quando se joga muitos torneios.

> **✅ DECISÃO (CopaFoot):**
> - Formações selecionáveis (442/433/352/4231...).
> - Simulação baseada em **média de força da escalação + posição + fator sorte**.
> - **Narração minuto a minuto** já no MVP: lances de texto e **gol comemorado ("GOOOLLL!")**.
> - **Duração da partida configurável** (padrão ~1 minuto de relógio real; ajustável/acelerável).
> - Cartões e lesões ficam para a fase 2.

---

## 5. Finanças

- **Caixa do clube** com receitas e despesas.
- Receitas: **bilheteria** (renda do estádio), **premiações** de títulos, **patrocínio**
  (dinheiro extra por temporada), venda de jogadores.
- Despesas: **salários**, contratações.
- **Empréstimos bancários** disponíveis.
- **Estádio:** pode ser **expandido** para aumentar a renda.
- Curiosidade do 98: time pequeno que perde de goleada para um time grande costumava **ganhar
  bastante dinheiro** (mistério da época).

> **✅ DECISÃO (CopaFoot):** Teremos **finanças no estilo Elifoot clássico**:
> - **Caixa em dinheiro**, usada para **comprar e vender jogadores** (vende um, compra um melhor).
> - **Renda de partida quando você é o mandante** (bilheteria).
> - (Fase 2) premiações por avançar de fase / títulos.
> Mesmo sendo seleções, o jogo trata cada seleção como um "clube" gerenciável (estilo arcade),
> mantendo o loop financeiro que é a graça do Elifoot.

---

## 6. Mercado de transferências

- **Compra e venda** de jogadores — uma das funções mais marcantes do jogo.
- **Leilão** de jogadores e **busca no mercado** com filtros (olheiros que procuram atletas no
  padrão que você definir).
- Dicas clássicas: priorizar **goleadores**; equiparar o **preço** dos seus jogadores ao mercado;
  desconfiar de propostas "armadilha"; renovar o elenco para achar **novos talentos**.

> **✅ DECISÃO (CopaFoot):** **Mercado livre de compra e venda** no estilo Elifoot.
> - Você usa o **caixa** para comprar jogadores de **qualquer seleção** e vender os seus.
> - É **arcade/fantasia**: dá pra comprar o **Mbappé e escalá-lo no Brasil**, por exemplo.
> - Não há restrição de nacionalidade — qualquer jogador pode jogar em qualquer seleção.
> - A "escalação" é só o passo de montar o time a partir do elenco que você possui.

---

## 7. Carreira e progressão

- Começa-se na **4ª divisão** com um time fraco.
- Bons resultados geram **convites** de times melhores (inclusive de **outros países**).
- Versões novas: **multi-ligas** (várias ligas ao mesmo tempo) e até liga única mundial.
- Objetivo: subir de divisão, ganhar títulos e ser contratado por clubes cada vez maiores.

> **✅ DECISÃO (CopaFoot):** O jogo será no **modo Carreira de Treinador**.
> Você começa numa **seleção fraca** (ex.: pote 4) e, ao ir bem (Copas/amistosos + bom
> gerenciamento financeiro do elenco), recebe **convites de seleções melhores**, até comandar
> uma favorita e buscar o título mundial. É a "alma" do Elifoot: comece pequeno e cresça.

---

## 8. Resumo: o que replicar no MVP do CopaFoot

| Elemento Elifoot        | No MVP? | Como fica no CopaFoot                              |
|-------------------------|:------:|----------------------------------------------------|
| 4 posições (GOL/DEF/MEI/ATA) | ✅ | Base dos jogadores                                 |
| Força (1–100)           | ✅ | **Único atributo** do jogador                       |
| Estrelinha (\*)          | ❌ | Cortada (regra "1 atributo só")                     |
| Formações (442, 433...) | ✅ | Seleção de tática                                   |
| Simulação com sorte     | ✅ | Resultado por força média + aleatoriedade           |
| Tabela / classificação  | ✅ | Grupos da Copa                                      |
| Mata-mata               | ✅ | Oitavas → final                                     |
| **Finanças (caixa)**    | ✅ | Caixa + **renda de mandante** + compra/venda        |
| **Mercado compra/venda**| ✅ | Vende jogador → compra melhor (estilo Elifoot)      |
| **Carreira com convites**| ✅ | Começa em seleção fraca, sobe via convites          |
| Narração minuto a minuto| ✅ | Lances em texto + "GOOOLLL!", duração configurável  |
| Cartões / lesões        | ⏳ | Fase 2                                              |
| Estádio (expandir)      | ⏳ | Fase 2                                              |
| Treino / evolução       | ⏳ | Fase 2                                              |
| Setinhas (ordens)       | ❌ | Cortada (não precisa)                               |

Legenda: ✅ no MVP · ⏳ depois · ❌ cortado

---

## 9. Decisões fechadas (suas respostas)

1. ✅ **Modo Carreira de Treinador** — começar fraco e subir via convites.
2. ✅ **Finanças no estilo Elifoot** — caixa em dinheiro, **renda de mandante** na partida e
   **compra/venda** de jogadores (vende um, compra um melhor).
3. ✅ **Mercado livre de compra/venda** — sem restrição de nacionalidade. Dá pra comprar o
   **Mbappé e escalá-lo no Brasil**. (Resolvido: é mercado, não convocação.)
4. ✅ **1 atributo só: Força (1–100)** — sem estrelinha e sem atributos secundários.
5. ✅ **Sem setinhas/ordens táticas** — só formações.

> Todas as decisões de regras estão fechadas. ✔️
