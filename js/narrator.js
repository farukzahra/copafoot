/** Falas do narrador — MVP (piadas/personalidade: TODO seção 10 do plano). */

const LANCE_NEUTRO = [
  "{time} avança pelo meio.",
  "Bola rolando no meio-campo.",
  "{time} tenta construir jogada.",
  "Defesa do {time} afasta o perigo.",
  "Partida equilibrada neste momento.",
  "Arquibancada empurra o {time}.",
  "Cruzamento na área... nada feito.",
  "{time} recupera a posse.",
];

const CHANCE = [
  "Quase! {jogador} ({time}) finaliza e passa perto!",
  "{jogador} cabeceia forte — o goleiro espalma!",
  "Grande defesa! {jogador} ({time}) chuta e o goleiro voa!",
  "{jogador} ({time}) aparece na área... trave!",
];

const GOL = [
  "GOOOOOOOLLLLL! {jogador} MARCA PARA {time}!",
  "GOOOLLL! É DE {jogador}! {time} FESTEJA!",
  "GOOOOOOOLLL! {jogador} NÃO PERDOOU! {time} NA FRENTE!",
  "GOOOLLL! {jogador} MANDOU A REDE BALANÇAR! {time}!",
];

const INICIO = [
  "Apito inicial! A bola rola!",
  "Começa o jogo! Boa sorte às duas seleções!",
];

const INTERVALO = [
  "Intervalo! Placar: {mandante} {gm} x {gv} {visitante}.",
];

const FIM = [
  "Apito final! {mandante} {gm} x {gv} {visitante}.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function narrarInicio() {
  return pick(INICIO);
}

export function narrarIntervalo(mandante, visitante, gm, gv) {
  return fmt(pick(INTERVALO), { mandante, visitante, gm, gv });
}

export function narrarFim(mandante, visitante, gm, gv) {
  return fmt(pick(FIM), { mandante, visitante, gm, gv });
}

export function narrarLanceNeutro(timeNome) {
  return fmt(pick(LANCE_NEUTRO), { time: timeNome });
}

export function narrarChance(jogador, timeNome) {
  return fmt(pick(CHANCE), { jogador: jogador.nome, time: timeNome });
}

export function narrarGol(jogador, timeNome) {
  return fmt(pick(GOL), { jogador: jogador.nome, time: timeNome.toUpperCase() });
}
