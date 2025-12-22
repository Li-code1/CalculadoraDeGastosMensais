// Estado
let gastos = [];
let totaisPorMes = {}; // { "Janeiro": 1234.56, ... }

// Elementos
const form = document.getElementById('form-gastos');
const lista = document.getElementById('lista-gastos');
const totalEl = document.getElementById('total');
const mesEl = document.getElementById('mes');
const btnPdf = document.getElementById('btn-pdf');
const btnReset = document.getElementById('btn-reset');

// Chart: categorias
const ctxCategorias = document.getElementById('grafico-categorias').getContext('2d');
const graficoCategorias = new Chart(ctxCategorias, {
  type: 'pie',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#64748b']
    }]
  }
});

// Chart: meses
const ctxMeses = document.getElementById('grafico-meses').getContext('2d');
const graficoMeses = new Chart(ctxMeses, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{ label: 'Total por mês (R$)', data: [], backgroundColor: '#3b82f6' }]
  },
  options: { scales: { y: { beginAtZero: true } } }
});

// Util: normaliza valor para número (aceita vírgula)
function parseValorBR(str) {
  if (typeof str !== 'string') return NaN;
  const normalizado = str.replace(/\./g, '').replace(',', '.').trim();
  return Number(normalizado);
}

// Util: formata número para BR
function formatBR(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Submit gasto
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const categoria = document.getElementById('categoria').value;
  const valorStr = document.getElementById('valor').value;
  const valor = parseValorBR(valorStr);
  const mes = mesEl.value;

  if (!isFinite(valor) || valor <= 0) {
    alert('Informe um valor válido (ex.: 120,50).');
    document.getElementById('valor').focus();
    return;
  }

  gastos.push({ categoria, valor, mes });

  // Atualiza totais por mês
  totaisPorMes[mes] = (totaisPorMes[mes] || 0) + valor;

  atualizarListaETotal();
  atualizarGraficoCategorias();
  atualizarGraficoMeses();

  // Limpa e foca o campo valor
  form.reset();
  document.getElementById('valor').focus();
});

// Atualiza lista e soma na tela (recalcula total por redução)
function atualizarListaETotal() {
  lista.innerHTML = '';
  gastos.forEach((g) => {
    const li = document.createElement('li');
    li.textContent = `${g.categoria} (${g.mes}): R$ ${formatBR(g.valor)}`;
    lista.appendChild(li);
  });

  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  totalEl.textContent = formatBR(total);
}

// Atualiza gráfico de categorias (soma por categoria)
function atualizarGraficoCategorias() {
  const categorias = [...new Set(gastos.map((g) => g.categoria))];
  const valores = categorias.map((cat) =>
    gastos.filter((g) => g.categoria === cat).reduce((soma, g) => soma + g.valor, 0)
  );

  graficoCategorias.data.labels = categorias;
  graficoCategorias.data.datasets[0].data = valores;
  graficoCategorias.update();
}

// Atualiza gráfico de meses (usa totaisPorMes)
function atualizarGraficoMeses() {
  const meses = Object.keys(totaisPorMes);
  const valores = Object.values(totaisPorMes);

  graficoMeses.data.labels = meses;
  graficoMeses.data.datasets[0].data = valores;
  graficoMeses.update();
}

// Baixar PDF
btnPdf.addEventListener('click', () => {
  const mesAtual = mesEl.value;
  const linhas = gastos
    .filter((g) => g.mes === mesAtual)
    .map((g) => `${g.categoria}: R$ ${formatBR(g.valor)}`);

  const totalMes = (totaisPorMes[mesAtual] || 0);

  const conteudo = [
    `Relatório de Gastos - ${mesAtual}`,
    '',
    ...linhas,
    '',
    `Total: R$ ${formatBR(totalMes)}`
  ].join('\n');

  const doc = new window.jspdf.jsPDF();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(conteudo, 10, 10);
  doc.save(`gastos-${mesAtual}.pdf`);
});

// Reset
btnReset.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja resetar todos os dados?')) {
    gastos = [];
    totaisPorMes = {};
    lista.innerHTML = '';
    totalEl.textContent = formatBR(0);

    graficoCategorias.data.labels = [];
    graficoCategorias.data.datasets[0].data = [];
    graficoCategorias.update();

    graficoMeses.data.labels = [];
    graficoMeses.data.datasets[0].data = [];
    graficoMeses.update();
  }
});
