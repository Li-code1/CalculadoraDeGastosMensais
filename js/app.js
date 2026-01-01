import { Gasto, Relatorio } from './classes.js';
import { parseValorBR, formatBR, validarValor } from './utils.js';

const relatorio = new Relatorio();

// Elementos DOM
const form = document.getElementById('form-gastos');
const lista = document.getElementById('lista-gastos');
const totalEl = document.getElementById('total');
const mesEl = document.getElementById('mes');
const btnPdf = document.getElementById('btn-pdf');
const btnReset = document.getElementById('btn-reset');

// Charts
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

const ctxMeses = document.getElementById('grafico-meses').getContext('2d');
const graficoMeses = new Chart(ctxMeses, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{ label: 'Total por mês (R$)', data: [], backgroundColor: '#3b82f6' }]
  },
  options: { scales: { y: { beginAtZero: true } } }
});

// Render principal
function atualizarListaETotal() {
  lista.innerHTML = '';
  relatorio.gastos.forEach(g => {
    const li = document.createElement('li');
    li.textContent = `${g.categoria} (${g.mes}): R$ ${formatBR(g.valor)}`;
    lista.appendChild(li);
  });

  const total = relatorio.calcularTotal();
  totalEl.textContent = formatBR(total);
}

function atualizarGraficoCategorias() {
  const dados = relatorio.gastosPorCategoria();
  graficoCategorias.data.labels = dados.map(d => d.categoria);
  graficoCategorias.data.datasets[0].data = dados.map(d => d.total);
  graficoCategorias.update();
}

function atualizarGraficoMeses() {
  graficoMeses.data.labels = Object.keys(relatorio.totaisPorMes);
  graficoMeses.data.datasets[0].data = Object.values(relatorio.totaisPorMes);
  graficoMeses.update();
}

// Eventos
form.addEventListener('submit', e => {
  e.preventDefault();

  const categoria = document.getElementById('categoria').value;
  const valorStr = document.getElementById('valor').value;
  const mes = mesEl.value;

  const valor = parseValorBR(valorStr);

  if (!validarValor(valor)) {
    alert('Informe um valor válido (ex.: 120,50).');
    document.getElementById('valor').focus();
    return;
  }

  const gasto = new Gasto(categoria, valor, mes);
  relatorio.adicionarGasto(gasto);

  atualizarListaETotal();
  atualizarGraficoCategorias();
  atualizarGraficoMeses();

  form.reset();
  document.getElementById('valor').focus();
});

btnPdf.addEventListener('click', () => {
  const mesAtual = mesEl.value;
  const linhas = relatorio.gastos
    .filter(g => g.mes === mesAtual)
    .map(g => `${g.categoria}: R$ ${formatBR(g.valor)}`);

  const totalMes = (relatorio.totaisPorMes[mesAtual] || 0);

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

btnReset.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja resetar todos os dados?')) {
    relatorio.gastos = [];
    relatorio.totaisPorMes = {};
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

// Inicializa interface coerente ao carregar
atualizarListaETotal();
atualizarGraficoCategorias();
atualizarGraficoMeses();
