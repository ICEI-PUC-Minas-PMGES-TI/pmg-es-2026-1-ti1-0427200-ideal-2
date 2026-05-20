import { rotas } from "./dataPlanejador.js";

function showMeDetails() {
    const saida = document.getElementById('saida').value;
    const chegada = document.getElementById('chegada').value;
    const tempo = document.getElementById('tempo');
    tempo.innerHTML = '';
    const distancia = document.getElementById('distancia');
    distancia.innerHTML = '';
    const pT = document.createElement('p');
    const pD = document.createElement('p');
    const img = document.getElementById('mapImg');
    img.src = 'https://rech.com.br/wp-content/uploads/2019/07/erp_siger_rotas_google_maps_13092017.jpg'
    const rota = rotas.find(r =>
        r.origem == saida && r.destino == chegada);
    pT.innerText = `${rota.tempo}h`;
    tempo.appendChild(pT);
    pD.innerText = `${rota.distancia}Km`;
    distancia.appendChild(pD);
}

const saida = document.getElementById('saida');
const chegada = document.getElementById('chegada');
const btn = document.getElementById('btnCalcular');

btn.addEventListener('click', ()=>showMeDetails());
