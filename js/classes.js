export class Gasto {
  constructor(categoria, valor, mes) {
    this.categoria = String(categoria);
    this.valor = Number(valor);
    this.mes = String(mes);
  }
}

export class Relatorio {
  constructor() {
    this.gastos = [];
    this.totaisPorMes = {};
  }

  adicionarGasto(gasto) {
    this.gastos.push(gasto);
    this.totaisPorMes[gasto.mes] = (this.totaisPorMes[gasto.mes] || 0) + gasto.valor;
  }

  calcularTotal() {
    return this.gastos.reduce((acc, g) => acc + (Number(g.valor) || 0), 0);
  }

  gastosPorCategoria() {
    const categorias = [...new Set(this.gastos.map(g => g.categoria))];
    return categorias.map(cat => ({
      categoria: cat,
      total: this.gastos
        .filter(g => g.categoria === cat)
        .reduce((soma, g) => soma + (Number(g.valor) || 0), 0)
    }));
  }
}
