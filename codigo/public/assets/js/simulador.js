const chargerPowers = {
  'AC Monofásico — 3,7 kW': 3.7,
  'AC Bifásico — 7,4 kW': 7.4,
  'AC Trifásico — 11 kW': 11,
  'AC Trifásico — 22 kW': 22,
  'DC Rápido — 50 kW': 50,
  'DC Rápido — 100 kW': 100,
  'DC Ultra-Rápido — 150 kW': 150,
  'DC Ultra-Rápido — 350 kW': 350,
};
const BATTERY_KWH = 60;
const API = 'http://localhost:3000/simulacoes';

// Retorna o id do usuário logado como número, ou null se não estiver logado
function getUsuarioId() {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
    return (usuario && usuario.id) ? Number(usuario.id) || usuario.id : null;
  } catch {
    return null;
  }
}

function paintTrack(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.background = `linear-gradient(to right, #279b10 ${pct}%, #e2e8f0 ${pct}%)`;
}

const rangeA = document.getElementById('charge-range');
const rangeB = document.getElementById('current-range');

rangeA.value = 0;
rangeB.value = 0;
paintTrack(rangeA);
paintTrack(rangeB);

rangeA.addEventListener('input', () => {
  document.getElementById('slider-pct').textContent = rangeA.value + '%';
  paintTrack(rangeA);
});

rangeB.addEventListener('input', () => {
  document.getElementById('current-pct').textContent = rangeB.value + '%';
  paintTrack(rangeB);
});

async function carregarHistorico() {
  const usuarioId = getUsuarioId();

  // Se não estiver logado, não exibe nada
  if (!usuarioId) return;

  try {
    const res = await fetch(`${API}?usuarioId=${usuarioId}`);
    if (!res.ok) throw new Error('Erro ao carregar histórico');
    const simulacoes = await res.json();

    if (simulacoes.length === 0) return;

    document.getElementById('history-empty').style.display = 'none';
    document.getElementById('history-table').style.display = 'table';

    simulacoes.forEach(s => adicionarLinha(s));
  } catch (err) {
    console.error('Nao foi possivel conectar ao JSON Server:', err);
  }
}

async function simular() {
  const meta = +rangeA.value;
  const atual = +rangeB.value;
  const sel = document.getElementById('charger-select');
  const chargerName = sel.options[sel.selectedIndex].text;
  const power = chargerPowers[chargerName] || 7.4;

  if (meta <= atual) {
    alert('A meta deve ser maior que a carga atual.');
    return;
  }

  const energyKwh = ((meta - atual) / 100) * BATTERY_KWH;
  const timeMin = Math.round((energyKwh / power) * 60);
  const timeStr = timeMin >= 60
    ? `${Math.floor(timeMin / 60)}h ${timeMin % 60}min`
    : `${timeMin}min`;
  const energyStr = energyKwh.toFixed(1) + ' kWh';

  document.getElementById('res-time').textContent = timeStr;
  document.getElementById('res-energy').textContent = energyStr;
  document.getElementById('result-inline').classList.add('visible');

  const hoje = new Date();
  const data = `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${hoje.getFullYear()}`;
  const tag = chargerName.split('\u2014')[1]?.trim() || chargerName;

  const usuarioId = getUsuarioId();

  if (!usuarioId) {
    alert('Você precisa estar logado para salvar uma simulação.');
    return;
  }

  try {
    const listaAtual = await fetch(`${API}?usuarioId=${usuarioId}`).then(r => r.json());

    if (listaAtual.length >= 10) {
      const maisAntiga = listaAtual[0];
      await fetch(`${API}/${maisAntiga.id}`, { method: 'DELETE' });
      document.getElementById(`row-${maisAntiga.id}`)?.remove();
    }

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId,
        sessao: `${atual}% \u2192 ${meta}%`,
        meta: `${meta}%`,
        tag,
        timeStr,
        data
      })
    });
    if (!res.ok) throw new Error('Erro ao salvar');
    const salvo = await res.json();

    adicionarLinha(salvo);
    document.getElementById('history-empty').style.display = 'none';
    document.getElementById('history-table').style.display = 'table';
  } catch (err) {
    console.error('Nao foi possivel salvar no JSON Server:', err);
  }
}

function adicionarLinha(s) {
  const tr = document.createElement('tr');
  tr.id = `row-${s.id}`;
  tr.innerHTML = `
    <td class="col-name">${s.sessao}</td>
    <td>${s.meta}</td>
    <td><span class="charger-tag">${s.tag}</span></td>
    <td>${s.timeStr}</td>
    <td class="col-date">${s.data}</td>
    <td><button class="remove-btn" onclick="remover('${s.id}', ${s.usuarioId})">&#10005;</button></td>
  `;
  const tbody = document.getElementById('history-tbody');
  tbody.insertBefore(tr, tbody.firstChild);
}

function resetar() {
  rangeA.value = 0;
  document.getElementById('slider-pct').textContent = '0%';
  paintTrack(rangeA);

  rangeB.value = 0;
  document.getElementById('current-pct').textContent = '0%';
  paintTrack(rangeB);

  document.getElementById('result-inline').classList.remove('visible');
}

async function remover(id, donoId) {
  const usuarioId = getUsuarioId();

  // Só permite remover se for o dono da simulação
  if (!usuarioId || usuarioId !== donoId) {
    alert('Você não tem permissão para remover esta simulação.');
    return;
  }

  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Erro ao remover do JSON Server:', err);
  }
  document.getElementById(`row-${id}`)?.remove();
  if (!document.querySelectorAll('#history-tbody tr').length) {
    document.getElementById('history-empty').style.display = 'block';
    document.getElementById('history-table').style.display = 'none';
  }
}

carregarHistorico();