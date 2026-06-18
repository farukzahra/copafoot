# CopaFoot

Clone do clássico **Elifoot 98** focado na **Copa do Mundo 2026**. Gerencie uma seleção nacional, monte elenco, escale o time, dispute grupos e mata-mata — tudo no estilo terminal verde dos anos 90.

## O que é

CopaFoot é um jogo de gerência de futebol no navegador. Você é técnico e diretor ao mesmo tempo: compra e vende jogadores, define formação, joga partidas ao vivo (com narração) e tenta ser campeão.

O **modo carreira** começa numa seleção da **3ª Divisão** (times mais fracos). Com bons resultados na fase de grupos, você pode receber **convites** de seleções da divisão acima — subindo de patamar como no Elifoot clássico.

## Funcionalidades

- **16 seleções** · 4 grupos de 4 · 3 rodadas · mata-mata (quartas → semi → final)
- **Hub de gerenciamento**: elenco, escalação, mercado e torneio
- **Partidas ao vivo** com placares paralelos dos outros jogos da rodada
- **Autosave** em `localStorage` (F5 continua de onde parou)
- **Modo carreira** com convites entre divisões
- Visual retrô (Courier, verde sobre preto) + bandeiras (`flag-icons`)

## Requisitos

- [Node.js](https://nodejs.org/) 18+ (recomendado 20+)

## Instalação e execução

```bash
git clone https://github.com/farukzahra/copafoot.git
cd copafoot
npm install
npm run dev
```

Abra **http://127.0.0.1:5173**

### Outros comandos

```bash
npm run build    # gera pasta dist/ para deploy estático
npm run preview  # preview da build de produção
```

## Estrutura do projeto

```
src/
  components/     # Telas Vue (menu, hub, partida, convite…)
  composables/    # usePartida.js — fluxo de jogo e partida ao vivo
  game/           # Lógica pura: torneio, partida, mercado, estado, dados
  stores/         # gameStore.js — estado reativo + persistência
  assets/         # style.css global
public/data/      # selecoes.json — base de times e jogadores
data/             # Cópia/fonte dos dados (gerada por tools/gerarBase.mjs)
tools/            # Script para regenerar selecoes.json
```

## Divisões (carreira)

| Divisão | Significado |
|---------|-------------|
| 1ª Divisão | Seleções favoritas (maior caixa, elenco mais forte) |
| 2ª Divisão | Seleções fortes |
| 3ª Divisão | Início da carreira |
| 4ª Divisão | Reservado para expansão futura |

Na UI aparece como **1º Divisão**, **2º Divisão**, etc. Internamente o campo nos dados continua sendo `pote`.

## Documentação para agentes / IA

Veja **[AGENTS.md](./AGENTS.md)** — arquitetura, convenções, fluxos e regras de commit.

## Referências de design

- `regras-elifoot.md` — pesquisa sobre mecânicas do Elifoot
- `selecoes-2026.md` — base de seleções da Copa 2026

## Licença

Projeto pessoal / educacional. Elifoot é marca de seus respectivos titulares.

## Repositório

https://github.com/farukzahra/copafoot
