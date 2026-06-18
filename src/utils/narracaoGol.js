/** Quebra o texto de gol para inserir bandeira inline antes do nome do time. */
export function partesTextoGol(linha) {
  if (linha.tipo !== "gol" || !linha.timeId || !linha.timeNome) return null;

  const tag = linha.timeNome.toUpperCase();
  const idx = linha.texto.indexOf(tag);
  if (idx === -1) return null;

  return {
    antes: linha.texto.slice(0, idx),
    timeNome: tag,
    depois: linha.texto.slice(idx + tag.length),
  };
}
