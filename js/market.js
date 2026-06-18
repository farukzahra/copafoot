/** Mercado de compra e venda — estilo Elifoot. */

import { calcularPreco, getSelecaoPorId, getTodosJogadores, getJogadorPorId } from "./data.js";
import { getEstado, adicionarJogadorElenco, removerJogadorElenco, salvar } from "./state.js";

export function getPrecoVenda(forca) {
  return Math.round(calcularPreco(forca) * 0.8);
}

export function listarMercado(filtro = "") {
  const estado = getEstado();
  const termo = filtro.toLowerCase();
  return getTodosJogadores().filter((j) => {
    const dono = estado.playerOwner?.[j.id] ?? j.selecaoOrigem;
    if (dono === estado.selecaoId) return false;
    if (!termo) return true;
    return (
      j.nome.toLowerCase().includes(termo) ||
      j.selecaoNome.toLowerCase().includes(termo) ||
      j.posicao.toLowerCase().includes(termo)
    );
  });
}

export function comprarJogador(jogadorId) {
  const estado = getEstado();
  const jogador = getJogadorPorId(jogadorId);
  if (!jogador) return { ok: false, msg: "Jogador não encontrado." };

  const dono = estado.playerOwner?.[jogadorId] ?? jogador.selecaoOrigem;
  if (dono === estado.selecaoId) return { ok: false, msg: "Já está no seu elenco." };

  const preco = calcularPreco(jogador.forca);
  if (estado.caixa < preco) {
    return { ok: false, msg: `Caixa insuficiente. Precisa de $${preco.toLocaleString("pt-BR")}.` };
  }

  estado.caixa -= preco;
  adicionarJogadorElenco(jogadorId, estado.selecaoId);
  salvar();
  return { ok: true, msg: `${jogador.nome} contratado por $${preco.toLocaleString("pt-BR")}!` };
}

export function venderJogador(jogadorId) {
  const estado = getEstado();
  const dono = estado.playerOwner?.[jogadorId];
  if (dono !== estado.selecaoId) return { ok: false, msg: "Jogador não está no seu elenco." };
  if (estado.lineup.includes(jogadorId)) {
    return { ok: false, msg: "Tire o jogador da escalação antes de vender." };
  }

  const jogador = getJogadorPorId(jogadorId);
  if (!jogador) return { ok: false, msg: "Dados do jogador não encontrados." };

  const valor = getPrecoVenda(jogador.forca);
  estado.caixa += valor;
  removerJogadorElenco(jogadorId, jogador.selecaoOrigem);
  salvar();
  return { ok: true, msg: `${jogador.nome} vendido por $${valor.toLocaleString("pt-BR")}.` };
}

export function listarMeuElenco() {
  const estado = getEstado();
  return estado.elencoIds
    .map((id) => getJogadorPorId(id))
    .filter(Boolean);
}

export function getElencoDoTime(timeId) {
  const estado = getEstado();
  if (!estado?.playerOwner) {
    const sel = getSelecaoPorId(timeId);
    return sel?.jogadores ?? [];
  }
  const ids = Object.entries(estado.playerOwner)
    .filter(([, owner]) => owner === timeId)
    .map(([id]) => id);
  if (!ids.length) {
    const sel = getSelecaoPorId(timeId);
    return sel?.jogadores ?? [];
  }
  return ids.map((id) => getJogadorPorId(id)).filter(Boolean);
}
