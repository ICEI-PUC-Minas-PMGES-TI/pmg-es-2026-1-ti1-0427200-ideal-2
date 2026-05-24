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
let rowCounter = 0;

function paintTrack(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.background = `linear-gradient(to right, #3b82f6 ${pct}%, #e2e8f0 ${pct}%)`;
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

function simular() {
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
  const tag = chargerName.split('—')[1]?.trim() || chargerName;
  const id = `row-${++rowCounter}`;

  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td class="col-name">${atual}% → ${meta}%</td>
    <td>${meta}%</td>
    <td><span class="charger-tag">${tag}</span></td>
    <td>${timeStr}</td>
    <td class="col-date">${data}</td>
    <td><button class="remove-btn" onclick="remover('${id}')">✕</button></td>
  `;

  document.getElementById('history-tbody').appendChild(tr);
  document.getElementById('history-empty').style.display = 'none';
  document.getElementById('history-table').style.display = 'table';
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

function remover(id) {
  document.getElementById(id)?.remove();
  if (!document.querySelectorAll('#history-tbody tr').length) {
    document.getElementById('history-empty').style.display = 'block';
    document.getElementById('history-table').style.display = 'none';
  }
}
