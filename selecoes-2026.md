# Seleções da Copa do Mundo de 2026 (Base de Dados)

> Lista das **48 seleções** classificadas para a Copa do Mundo de 2026
> (sede: **Estados Unidos, México e Canadá** — de 11 de junho a 19 de julho de 2026).
> Fontes: FIFA, Olympics.com, CNN Brasil, Wikipédia (Eliminatórias da Copa de 2026).

## Formato do torneio (confirmado)

- **48 seleções** divididas em **12 grupos de 4**.
- Avançam ao mata-mata: os **2 primeiros de cada grupo** + os **8 melhores terceiros colocados**
(= 32 seleções no mata-mata).
- O campeão faz **8 jogos** até o título (grupos: 3 jogos + 5 fases de mata-mata).
- Total de **104 jogos** na competição.

---

## Seleções por confederação (48)

### Anfitriões (3)

- 🇨🇦 Canadá
- 🇲🇽 México
- 🇺🇸 Estados Unidos

### CONCACAF — América do Norte/Central e Caribe (3 + anfitriões)

- 🇵🇦 Panamá
- 🇨🇼 Curaçao
- 🇭🇹 Haiti

### CONMEBOL — América do Sul (6)

- 🇦🇷 Argentina
- 🇧🇷 Brasil
- 🇪🇨 Equador
- 🇺🇾 Uruguai
- 🇨🇴 Colômbia
- 🇵🇾 Paraguai

### UEFA — Europa (16)

- 🏴 Inglaterra
- 🇫🇷 França
- 🇭🇷 Croácia
- 🇵🇹 Portugal
- 🇳🇴 Noruega
- 🇳🇱 Holanda (Países Baixos)
- 🇩🇪 Alemanha
- 🇨🇭 Suíça
- 🏴 Escócia
- 🇪🇸 Espanha
- 🇦🇹 Áustria
- 🇧🇪 Bélgica
- 🇸🇪 Suécia
- 🇹🇷 Turquia
- 🇨🇿 Tchéquia (República Tcheca)
- 🇧🇦 Bósnia e Herzegovina

### AFC — Ásia (8 + 1 repescagem)

- 🇯🇵 Japão
- 🇮🇷 Irã
- 🇺🇿 Uzbequistão
- 🇰🇷 Coreia do Sul
- 🇯🇴 Jordânia
- 🇦🇺 Austrália
- 🇶🇦 Catar
- 🇸🇦 Arábia Saudita
- 🇮🇶 Iraque *(via repescagem intercontinental)*

### CAF — África (9 + 1 repescagem)

- 🇲🇦 Marrocos
- 🇹🇳 Tunísia
- 🇪🇬 Egito
- 🇩🇿 Argélia
- 🇬🇭 Gana
- 🇨🇻 Cabo Verde
- 🇿🇦 África do Sul
- 🇸🇳 Senegal
- 🇨🇮 Costa do Marfim
- 🇨🇩 RD Congo *(via repescagem intercontinental)*

### OFC — Oceania (1)

- 🇳🇿 Nova Zelândia

---

## Vagas por confederação (resumo)


| Confederação                 | Vagas                   |
| ---------------------------- | ----------------------- |
| UEFA (Europa)                | 16                      |
| CAF (África)                 | 9                       |
| AFC (Ásia)                   | 8                       |
| CONMEBOL (América do Sul)    | 6                       |
| CONCACAF (Am. Norte/Central) | 6 (inclui 3 anfitriões) |
| OFC (Oceania)                | 1                       |
| Repescagem intercontinental  | 2 (Iraque e RD Congo)   |
| **Total**                    | **48**                  |


---

## Força das seleções (para o atributo do jogo)

Para definir a "força" de cada seleção no jogo (e o nível dos jogadores), podemos usar como
referência o **Ranking da FIFA** / status de cabeça de chave. Uma divisão aproximada em "potes":

- **Pote 1 (favoritas/fortes):** Argentina, França, Espanha, Inglaterra, Brasil, Portugal,
Holanda, Bélgica + anfitriões (EUA, México, Canadá).
- **Pote 2 (fortes):** Alemanha, Croácia, Marrocos, Colômbia, Uruguai, Japão, Suíça, etc.
- **Pote 3 (médias):** Equador, Áustria, Coreia do Sul, Senegal, Noruega, Escócia, etc.
- **Pote 4 (mais fracas/estreantes):** Curaçao, Haiti, Jordânia, Cabo Verde, Nova Zelândia,
Uzbequistão, etc.

> *(Os potes acima são uma estimativa para balancear o jogo; podemos refinar com o ranking
> oficial da FIFA mais perto do sorteio.)*

---

## Sobre a base de JOGADORES

A base foi gerada e está em **`data/selecoes.json`** (criada pelo script `tools/gerarBase.mjs`).
As decisões que guiaram a geração estão logo abaixo.

> Para a Copa inteira seriam ~48 × 23 ≈ 1.100 jogadores. Como o MVP usa **16 seleções × 18
> jogadores = 288**, a base atual é enxuta e fácil de manter/editar.

---

## Decisões fechadas (suas respostas)

1. ✅ **Nomes reais** dos jogadores (ex.: Mbappé, Vinícius Jr., Bellingham...).
2. ✅ **16 seleções** no MVP (subconjunto das 48).
3. ✅ **Força gerada automaticamente** a partir do pote da seleção + variação por posição e
   aleatoriedade (não definida na mão).
4. ✅ **Mais simples melhor (estilo Elifoot 98):** elenco **enxuto** e apenas as **4 posições**
   (GOL/DEF/MEI/ATA), 1 atributo (Força). Adotado **18 jogadores por seleção**
   (2 GOL, 6 DEF, 6 MEI, 4 ATA).
5. ✅ **Formato JSON** em `data/selecoes.json`, gerado por um script (`tools/gerarBase.mjs`).

### As 16 seleções escolhidas para o MVP
Mix de favoritas + anfitriões + variedade de continentes:

| # | Seleção | Conf. | Pote |
|---|---------|-------|:----:|
| 1 | 🇧🇷 Brasil | CONMEBOL | 1 |
| 2 | 🇦🇷 Argentina | CONMEBOL | 1 |
| 3 | 🇫🇷 França | UEFA | 1 |
| 4 | 🇪🇸 Espanha | UEFA | 1 |
| 5 | 🏴 Inglaterra | UEFA | 1 |
| 6 | 🇵🇹 Portugal | UEFA | 1 |
| 7 | 🇳🇱 Holanda | UEFA | 2 |
| 8 | 🇩🇪 Alemanha | UEFA | 2 |
| 9 | 🇧🇪 Bélgica | UEFA | 2 |
| 10 | 🇭🇷 Croácia | UEFA | 2 |
| 11 | 🇺🇾 Uruguai | CONMEBOL | 2 |
| 12 | 🇨🇴 Colômbia | CONMEBOL | 2 |
| 13 | 🇲🇦 Marrocos | CAF | 2 |
| 14 | 🇺🇸 Estados Unidos | CONCACAF (anfitrião) | 3 |
| 15 | 🇲🇽 México | CONCACAF (anfitrião) | 3 |
| 16 | 🇯🇵 Japão | AFC | 3 |

> A força de cada jogador é gerada a partir de uma **base por pote** (Pote 1 ≈ 82, Pote 2 ≈ 75,
> Pote 3 ≈ 68) com pequenos ajustes por posição e aleatoriedade — então mesmo o Mbappé recebe
> uma força alta por estar numa seleção de Pote 1. Tudo isso é **editável** depois.