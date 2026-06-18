/**
 * Códigos ISO para bandeiras (pacote flag-icons).
 * Base: https://github.com/lipis/flag-icons
 */
export const CODIGO_BANDEIRA = {
  BRA: "br",
  ARG: "ar",
  FRA: "fr",
  ESP: "es",
  ENG: "gb-eng",
  POR: "pt",
  NED: "nl",
  GER: "de",
  BEL: "be",
  CRO: "hr",
  URU: "uy",
  COL: "co",
  MAR: "ma",
  USA: "us",
  MEX: "mx",
  JPN: "jp",
};

export function codigoBandeira(selecaoId) {
  return CODIGO_BANDEIRA[selecaoId] ?? selecaoId.slice(0, 2).toLowerCase();
}
