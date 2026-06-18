# AGENTS.md — CopaFoot

Guia para agentes de IA (Cursor, Copilot, etc.) que trabalham neste repositório.

---

## Visão geral

**CopaFoot** é um clone web do **Elifoot 98** ambientado na **Copa do Mundo 2026**.

| Item | Valor |
|------|--------|
| Stack | Vue 3 + Vite 6 |
| Estilo | Terminal retrô (CSS em `src/assets/style.css`) |
| Persistência | `localStorage` via `src/stores/gameStore.js` |
| Dados | `public/data/selecoes.json` (16 seleções, ~23 jogadores cada) |
| Repositório | https://github.com/farukzahra/copafoot.git |

---

## Git: commit e push (OBRIGATÓRIO)

**Sempre que o usuário pedir commit e/ou push:**

1. Use **Conventional Commits** — mensagem **inteira em inglês**.
2. Formato: `tipo(escopo opcional): descrição curta`
3. Tipos comuns:
   - `feat:` — funcionalidade nova
   - `fix:` — correção de bug
   - `refactor:` — refatoração sem mudar comportamento
   - `docs:` — README, AGENTS.md, comentários de doc
   - `chore:` — build, deps, config, scripts
   - `style:` — só formatação/CSS visual
   - `test:` — testes
4. Exemplos:
   ```
   feat(tournament): add knockout tab before group tabs
   fix(career): only offer invite to teams still in tournament
   docs: add README and AGENTS.md
   chore: initial project commit
   ```
5. **Nunca** altere `git config` do usuário.
6. **Nunca** `--force` em `main`/`master` sem aviso explícito.
7. Após commit bem-sucedido, faça `git push` se o usuário pediu (remote: `origin`).

---

## Arquitetura

### Camadas

```
UI (Vue)          → src/components/, src/App.vue
Orquestração      → src/composables/usePartida.js, src/stores/gameStore.js
Regras de jogo    → src/game/*.js  (sem dependência de Vue)
Dados estáticos   → public/data/selecoes.json
```

**Regra:** lógica de torneio, partida, mercado e estado vive em `src/game/`. Componentes Vue só renderizam e chamam funções exportadas.

### Telas (`store.ui.tela`)

| Tela | Componente | Descrição |
|------|------------|-----------|
| `menu` | ScreenMenu | Novo jogo / Continuar |
| `escolha` | ScreenEscolha | Escolher seleção (só 3ª Divisão) |
| `hub` | ScreenHub | Painéis: torneio, elenco, escalação, mercado |
| `partida` | ScreenPartida | Partida ao vivo |
| `convite` | ScreenConvite | Convite de carreira |
| `fim` | ScreenFim | Campeão |

### Arquivos principais

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/game/tournament.js` | Grupos, rodadas, mata-mata, chave KO, histórico, `getProximoJogo`, `timeAtivoNoTorneio` |
| `src/game/match.js` | Simulação ao vivo, partidas paralelas, placares |
| `src/game/state.js` | Estado do save, escalação, `trocarSelecao`, autosave helpers |
| `src/game/data.js` | Carrega JSON, `formatDivisao`, formações, caixa inicial |
| `src/game/market.js` | Compra/venda de jogadores |
| `src/composables/usePartida.js` | Fluxo partida → resultado → rodada → convite → hub |
| `src/stores/gameStore.js` | Store reativo + `localStorage` |
| `src/components/hub/PanelTorneio.vue` | Abas grupo/mata-mata, classificação, chave |

### Legacy

- `src/game/main.js` e pasta `js/` — versão vanilla antiga; **não é o entry point**. Entry: `src/main.js` + Vue.
- Ao mudar regras, priorize `src/game/` e `src/composables/`; atualize legacy só se for trivial.

---

## Mecânicas do torneio

1. **16 seleções** → sorteio em **4 grupos × 4 times**
2. **3 rodadas** de fase de grupos (turno único dentro do grupo)
3. **2 classificados** por grupo → **8 times** no mata-mata
4. Chave: quartas → semifinal → final (empate no KO = gol de prata aleatório)
5. Ao clicar **Jogar**: partidas **paralelas** da mesma rodada rodam ao vivo (sem narração nos outros jogos)
6. Histórico de jogos por grupo; na aba **Mata-mata** (selecionada ao entrar no KO) mostra `chaveKO`

### Funções úteis (`tournament.js`)

- `getProximoJogo(torneio, selecaoId)` — próximo jogo do usuário
- `timeEliminado(torneio, id)` — eliminado no mata-mata
- `timeAtivoNoTorneio(torneio, id)` — ainda no ciclo (grupos ou KO vivo)
- `completarRodadaTorneio` — simula IA o restante da rodada
- `hidratarTorneio` — compatibilidade de saves antigos

---

## Modo carreira e convites

- Jogador começa em seleção **3ª Divisão** (`getSelecoesCarreira()` → `pote === 3`)
- UI mostra **1º Divisão**, **2º Divisão**… via `formatDivisao(pote)` em `data.js`
- Campo interno nos JSON/dados: **`pote`** (não renomear sem migração de save)
- **Convite:** ao **início do mata-mata** (antes de qualquer jogo KO), se terminou grupos em 1º ou 2º e `pote >= 2`
- Candidatas: divisão **immediately above** (`pote - 1`) que estejam **`timeAtivoNoTorneio`**
- Flag `conviteCarreiraOferecido` evita repetir convite
- Aceitar convite: `trocarSelecao()` — mantém elenco, caixa, escalação; troca `selecaoId`

---

## Partida ao vivo

- Duração configurável (`duracaoPartidaMs` no estado)
- Autosave de partida pausada em `estado.partidaSalva`
- Botão DEBUG (vermelho) encerra partida instantaneamente — só dev
- `continuarAposPartida()` registra resultados, avança rodada, verifica convite/fim

---

## Dados e geração

- Fonte: `data/selecoes.json` e cópia em `public/data/selecoes.json`
- Regenerar: `node tools/gerarBase.mjs` (força por `pote`, posição, aleatoriedade)
- Bandeiras: componente `Bandeira.vue` + `flag-icons`

---

## Convenções de código

1. **Escopo mínimo** — diff pequeno e focado
2. **Sem over-engineering** — reutilize funções existentes em `src/game/`
3. **Comentários** só para lógica não óbvia
4. **UI em português**; **commits em inglês** (Conventional Commits)
5. **Não commitar** `.env`, secrets, `node_modules/`, `dist/` (já no `.gitignore`)
6. **Não criar commits** unless the user asks (exceto quando pedido explicitamente)

---

## Comandos

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build
npm run preview
```

---

## Problemas conhecidos / histórico de fixes

| Bug | Causa | Fix |
|-----|-------|-----|
| Semifinal sem botão Jogar | `mataMata` dessincronizado | `getProximoJogo` busca em `chaveKO` |
| Convite para time eliminado | Sorteio só por `pote` | `timeAtivoNoTorneio` + convite só no início do KO |
| Aceitar convite não funcionava | `trocarSelecao` com estado stale | Usar `getEstado()` em `state.js` |

---

## Documentação complementar

- `README.md` — visão do usuário e setup
- `regras-elifoot.md` — pesquisa Elifoot → decisões do CopaFoot
- `selecoes-2026.md` — lista de seleções e potes/divisões
