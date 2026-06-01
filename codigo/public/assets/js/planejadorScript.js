import { rotas } from "./dataPlanejador.js";

async function buscarEndereco(endereco) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
    );
    const dados = await response.json();
    return {
        lat: parseFloat(dados[0].lat),
        lon: parseFloat(dados[0].lon)
    };
}

async function showMeDetails() {
    const saida = document.getElementById('saida').value;
    const chegada = document.getElementById('chegada').value;
    if (saida == '' || chegada == '') {
        alert('Digite um endereço de saida e de destino!!!');
        return NaN;
    }
    const tempo = document.getElementById('tempo');
    tempo.innerHTML = '';
    const distancia = document.getElementById('distancia');
    distancia.innerHTML = '';
    const postos = document.getElementById('postos');
    postos.innerHTML = '';
    const pT = document.createElement('p');
    const pD = document.createElement('p');
    const infoSaida = await buscarEndereco(saida);
    const infoChegada = await buscarEndereco(chegada);
    console.log(infoSaida);
    console.log(infoChegada);
    /* tempo.innerText = `${rota.tempo}h`;
    distancia.innerText = `${rota.distancia}Km`;
    postos.innerText = `${rota.postos}`; */
}

const saida = document.getElementById('saida');
const chegada = document.getElementById('chegada');
const btn = document.getElementById('btnCalcular');
const map = L.map('map').setView([-19.9167, -43.9345], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);
btn.addEventListener('click', ()=>showMeDetails());
