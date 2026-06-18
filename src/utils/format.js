export function fmtMoney(n) {
  return `$${Number(n).toLocaleString("pt-BR")}`;
}
