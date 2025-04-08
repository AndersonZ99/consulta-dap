
const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const cidadeSelect = document.getElementById('cidade');
const tabelaContainer = document.getElementById('tabela-container');
const paginacaoContainer = document.getElementById('paginacao');
const contadorSpan = document.getElementById('contador');

let paginaAtual = 1;

function buscar() {
  const nome = nomeInput.value;
  const cpf = cpfInput.value;
  const cidade = cidadeSelect.value;

  if ((nome && nome.length < 3) && (cpf && cpf.length < 3)) {
    tabelaContainer.innerHTML = '';
    paginacaoContainer.innerHTML = '';
    contadorSpan.textContent = '';
    return;
  }

  fetch(`/buscar?nome=${nome}&cpf=${cpf}&cidade=${cidade}&pagina=${paginaAtual}`)
    .then(res => res.json())
    .then(data => {
      renderTabela(data.dados);
      renderPaginacao(data.paginas);
      contadorSpan.textContent = `Total de registros encontrados: ${data.total}`;
    });
}

function renderTabela(dados) {
  let html = '<table class="table-auto w-full text-sm bg-white shadow rounded"><thead class="bg-green-200"><tr><th class="p-1 border">Nome</th><th class="p-1 border">CPF</th><th class="p-1 border">Município</th></tr></thead><tbody>';
  for (const d of dados) {
    html += `<tr class="hover:bg-green-50"><td class="p-1 border">${d['Nome Agricultor']}</td><td class="p-1 border">${d['CPF Agricultor']}</td><td class="p-1 border">${d['Município']}</td></tr>`;
  }
  html += '</tbody></table>';
  tabelaContainer.innerHTML = html;
}

function renderPaginacao(totalPaginas) {
  const maxBotoes = 5;
    let html = '';
  
      let inicio = Math.floor((paginaAtual - 1) / maxBotoes) * maxBotoes + 1;
      let fim = Math.min(inicio + maxBotoes - 1, totalPaginas);

  if (fim > totalPaginas) {
    fim = totalPaginas;
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

    if (paginaAtual > 1) {
    html += `<button onclick="mudarPagina(1)" class="px-2 py-1 border rounded bg-white text-green-600 hover:bg-green-100">Primeira</button>`;
        html += `<button onclick="mudarPagina(${paginaAtual - 1})" class="px-2 py-1 border rounded bg-white text-green-600 hover:bg-green-100">◄</button>`;
  }

  for (let i = inicio; i <= fim; i++) {
    html += `<button onclick="mudarPagina(${i})" class="px-2 py-1 border rounded ${i === paginaAtual ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-100'}">${i}</button>`;
  }

    if (paginaAtual < totalPaginas) {
    html += `<button onclick="mudarPagina(${totalPaginas})" class="px-2 py-1 border rounded bg-white text-green-600 hover:bg-green-100">Última</button>`;
        html += `<button onclick="mudarPagina(${paginaAtual + 1})" class="px-2 py-1 border rounded bg-white text-green-600 hover:bg-green-100">►</button>`;
  }

  paginacaoContainer.innerHTML = html;
}

function mudarPagina(pagina) {
  paginaAtual = pagina;
  buscar();
}

[nomeInput, cpfInput, cidadeSelect].forEach(el => {
  el.addEventListener('input', () => {
    paginaAtual = 1;
    buscar();
  });
});

let grafico = null;

function atualizarGrafico(distribuicao) {
  const ctx = document.getElementById('graficoMunicipios').getContext('2d');
  const labels = Object.keys(distribuicao);
  const valores = Object.values(distribuicao);

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Registros por município',
        data: valores,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 }
        },
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}


function atualizarGrafico(distribuicao) {
  const ctx = document.getElementById("grafico").getContext("2d");
  if (window.barras) window.barras.destroy();
  const labels = Object.keys(distribuicao);
  const valores = Object.values(distribuicao);
  window.barras = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cadastros por município',
        data: valores,
        backgroundColor: '#34d399'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function exportarExcel() {
  let csv = "Nome Agricultor,CPF Agricultor,Município\n";
  dadosVisiveis.forEach(d => {
    csv += `${d["Nome Agricultor"]},${d["CPF Agricultor"]},${d["Município"]}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "cadastros_filtrados.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
