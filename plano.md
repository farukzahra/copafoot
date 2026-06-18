# CopaFoot — Plano Inicial

> Clone do clássico **Elifoot** ambientado na **Copa do Mundo de 2026**.
> Jogo de gerenciamento de futebol, **web**, focado em HTML + CSS (com JavaScript para a lógica).

### Documentos e arquivos do projeto
- **`plano.md`** (este arquivo) — visão geral e plano inicial.
- **`regras-elifoot.md`** — pesquisa das mecânicas/regras do Elifoot e como adaptá-las (decisões fechadas).
- **`selecoes-2026.md`** — lista das 48 seleções da Copa 2026 e decisões da base de jogadores.
- **`tools/gerarBase.mjs`** — script que gera a base de dados (força automática por pote).
- **`data/selecoes.json`** — base gerada: **16 seleções, 288 jogadores** (nomes reais).

---

## 1. Visão Geral

O **CopaFoot** é um jogo de gerência (manager) inspirado no clássico Elifoot, onde o jogador
assume o comando de uma seleção nacional e tenta vencer a Copa do Mundo de 2026.
A proposta é manter a **simplicidade e nostalgia** do Elifoot original (telas diretas, foco em
texto e números, decisões rápidas) mas com um visual moderno, limpo e responsivo na web.

### Pilares do jogo
- **Simples de jogar, difícil de dominar** — poucas telas, decisões com impacto real.
- **Nostalgia do Elifoot** — escalação, treino, dinheiro, contratações e tabela de jogos.
- **Tema Copa 2026** — seleções nacionais, formato de Copa do Mundo (grupos + mata-mata).
- **100% no navegador** — sem necessidade de instalação ou login.

---

## 2. Referência: o que era o Elifoot

Para guiar o clone, os elementos clássicos do Elifoot que queremos reproduzir:

- Escolha de um time para gerenciar.
- **Elenco de jogadores** com posições e um valor de habilidade (estrelas/nota).
- **Escalação** do time titular e reservas, escolha de tática/formação.
- **Treino** dos jogadores (evolução de habilidade).
- **Finanças**: dinheiro em caixa, receitas (bilheteria, premiações) e despesas (salários).
- **Mercado de transferências**: comprar e vender jogadores.
- **Calendário de jogos** e **tabela de classificação**.
- **Simulação de partidas** (resultado gerado pela lógica, com narração simples).
- Progressão por temporada/torneio.

---

## 3. Adaptação para a Copa 2026

- O jogador escolhe **uma seleção** entre as classificadas para a Copa de 2026.
- Estrutura do torneio real de 2026:
  - **48 seleções**, divididas em **12 grupos de 4**.
  - Classificam-se os **2 primeiros de cada grupo + os 8 melhores terceiros** (32 no mata-mata).
  - Mata-mata: oitavas → quartas → semis → final.
- ✅ **Mercado livre de compra/venda** (estilo Elifoot): dá pra comprar o Mbappé e escalar no Brasil.
- ✅ **Modo carreira de treinador:** começa numa seleção fraca e sobe via convites.
- Objetivo principal: **ser campeão mundial**.

---

## 4. Funcionalidades (MVP vs. Futuro)

### MVP (primeira versão jogável)
- [ ] Tela inicial / menu (novo jogo).
- [ ] Seleção do time (entre as seleções da Copa).
- [ ] Tela de elenco com lista de jogadores (nome, posição, força).
- [ ] Escalação do time titular + formação básica (ex: 4-4-2, 4-3-3).
- [ ] **Mercado de compra/venda** de jogadores (usando o caixa).
- [ ] **Finanças** básicas (caixa + renda de mandante).
- [ ] Calendário da fase de grupos.
- [ ] **Simulação com narração minuto a minuto** (lances em texto + "GOOOLLL!"), duração configurável.
- [ ] Tabela de classificação do grupo.
- [ ] Avanço pelas fases até a final.

### Futuro (pós-MVP)
- [ ] **🎙️ Narrador com PERSONALIDADE — o coração do jogo:** piadas, bordões, comemorações
  exageradas, provocações e reações ao contexto da partida (favorito perdendo, zebra, goleada,
  pênalti, etc.). *(TODO destacado — ver seção 10.)*
- [ ] Sistema de treino e evolução de jogadores.
- [ ] Premiações por título / avanço de fase e expansão de estádio.
- [ ] Lesões, cartões e suspensões.
- [ ] Save/Load (salvar progresso no navegador via localStorage).
- [ ] Estatísticas (artilheiros, posse, chutes).
- [ ] Dificuldade ajustável.

---

## 5. Telas principais (UI)

1. **Menu inicial** — título, "Novo Jogo", "Continuar".
2. **Escolha da seleção** — grid com bandeiras/nomes das seleções.
3. **Vestiário / Elenco** — lista de jogadores e atributos.
4. **Escalação** — campo visual + formação selecionável.
5. **Partida** — placar, tempo, eventos da partida.
6. **Torneio** — grupos, tabela e chaveamento do mata-mata.
7. **Resumo da temporada** — resultado final / título.

---

## 6. Stack técnica proposta

- **HTML** para estrutura das telas.
- **CSS** para todo o visual (layout responsivo, tema da Copa, bandeiras).
- **JavaScript (vanilla)** para a lógica do jogo (sem framework no MVP, para manter leve).
- **localStorage** para salvar o progresso.
- Dados das seleções/jogadores em um **arquivo JSON** local.
- Sem backend no MVP — tudo roda no cliente.

### Estrutura de arquivos sugerida
```
copafoot/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js        (controle de telas / estado do jogo)
│   ├── data.js        (carregamento dos dados)
│   ├── match.js       (simulação de partidas)
│   └── tournament.js  (grupos e mata-mata)
├── data/
│   └── teams.json     (seleções e jogadores)
└── plano.md
```

---

## 7. Modelo de dados (rascunho)

```json
{
  "team": {
    "id": "BRA",
    "name": "Brasil",
    "flag": "🇧🇷",
    "players": [
      { "name": "Jogador 1", "position": "GOL", "skill": 85 },
      { "name": "Jogador 2", "position": "ZAG", "skill": 80 }
    ]
  }
}
```

> A simulação de partida pode usar a média de habilidade da escalação + um fator de sorte
> para gerar o placar (modelo simples no MVP, evoluindo depois).

---

## 8. Próximos passos sugeridos

1. ✅ ~~Montar a base de dados das seleções~~ — **feito** (`data/selecoes.json`, 16 seleções / 288 jogadores).
2. Fechar as últimas questões abertas (ver seção 9).
3. Criar o esqueleto HTML/CSS das telas principais.
4. Implementar o fluxo: menu → escolha → escalação → mercado → partida → tabela.

---

## 9. Questões — todas decididas ✅

- **Nome:** **CopaFoot**.
- **Idioma:** **português**.
- **Estilo visual:** **retrô/nostálgico** — cara do Elifoot antigo (fundo escuro, fontes simples,
  ar de planilha/terminal).
- **Simulação:** **narração minuto a minuto** com lances e gol comemorado ("**GOOOLLL!**"). A
  partida tem **duração configurável** (padrão ~1 minuto de relógio real).
- **Jogadores reais** (Mbappé, Messi, Vinícius...).
- **16 seleções** no MVP.
- **Você gerencia uma seleção**, mas tratada como "clube" (modo carreira + mercado).
- **Mercado livre de compra/venda** (não convocação).
- **Finanças** no estilo Elifoot (caixa, renda de mandante, compra/venda).
- **1 atributo** (Força 1–100), 4 posições, **sem setinhas**.
- **Força gerada automaticamente** por pote.

> Não há mais questões em aberto. Pronto para começar a implementação. 🎮

---

## 10. 🎙️ O Narrador (coração do jogo)

> A narração não é um detalhe — é a **alma do CopaFoot**. A graça do jogo está em acompanhar a
> partida sendo narrada com **personalidade, emoção e humor**. Um jogo "sem graça" narra o placar;
> o nosso narrador faz rir, vibrar e xingar a tela.

### TODO — Narrador com personalidade (pós-MVP, mas é prioridade alta)
- [ ] **Banco de falas por tipo de evento:** gol, defesaça, chance perdida, pênalti, falta,
  início/fim de tempo, apito final.
- [ ] **Comemoração de gol marcante:** "**GOOOOOOLLLLL!**" com variações e exageros.
- [ ] **Piadas e bordões** soltos durante os momentos mortos da partida (tiro de meta, lateral,
  jogo parado). *(pedido do dono do jogo 😄)*
- [ ] **Falas sensíveis ao contexto:** favorito perdendo pra zebra, goleada, virada, clássico,
  jogador de força baixa fazendo gol, craque (força alta) decidindo, final de Copa, etc.
- [ ] **Reação ao seu time:** o narrador "torce" junto / provoca conforme você ganha ou perde.
- [ ] **Variedade anti-repetição:** sortear falas sem repetir a mesma seguidamente.
- [ ] (Talvez) **personalidades de narrador** selecionáveis: clássico, engraçadão, dramático.
- [ ] (Talvez) sincronizar o ritmo das falas com a **duração configurável** da partida.
