export function parseValorBR(str) {
  if (typeof str !== 'string') return NaN;
  // remove separador de milhar (.)
  const semMilhar = str.replace(/\./g, '').trim();
  // troca vírgula por ponto para decimal
  const normalizado = semMilhar.replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : NaN;
}

export function formatBR(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Validação simples e mensagem amigável
export function validarValor(valor) {
  return Number.isFinite(valor) && valor > 0;
}
