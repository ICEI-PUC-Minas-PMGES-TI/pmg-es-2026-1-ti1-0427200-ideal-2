let rotaAtual;
let map;

async function buscarPostos() {
    const response = await fetch(
        `/postos`
    );
    const dados = await response.json();
    return dados;
}

function contarPostosNaRota(rota, postos, map) {
    const coordenadas = rota.features[0].geometry.coordinates;
    let quantidade = 0;
    const postosEncontrados = [];
    postos.forEach(posto => {
        const passouPerto = coordenadas.some(coord => {
            const distancia = map.distance(
                [coord[1], coord[0]],
                [posto.latitude, posto.longitude]
            );
            return distancia <= 500;
        });
        if (passouPerto) {
            quantidade++;
            postosEncontrados.push(posto);
        }
    });
    return {
        quantidade,
        postosEncontrados
    };
}

function tratamentoInfos(data,postosQtd) {
    const distanciaKm = (data.distance / 1000).toFixed(1);
    const tempoHoras = Math.floor(data.duration / 3600);
    const tempoMinutos = Math.floor((data.duration % 3600) / 60);
    return {
        'distancia': distanciaKm,
        'horas': tempoHoras,
        'min': tempoMinutos,
        'postos': postosQtd
    }
}

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

async function buscarRota(origem, destino) {
    const origemCoords = [
        origem.lon,
        origem.lat
    ];
    const destinoCoords = [
        destino.lon,
        destino.lat
    ];
    const response = await fetch(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
            method: 'POST',
            headers: {
                'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjhiMDQ0NDI0MjVlMjQ1YTQ5NWM4MDIwODBiYTYwMWZjIiwiaCI6Im11cm11cjY0In0=',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coordinates: [
                    origemCoords,
                    destinoCoords
                ]
            })
        }
    );
    if (rotaAtual) {
        map.removeLayer(rotaAtual);
    }
    const data = await response.json();
    const resultado = contarPostosNaRota(
        data,
        await buscarPostos(),
        map
    );
    rotaAtual = L.geoJSON(data).addTo(map);
    const infos = data.features[0].properties.summary;
    return tratamentoInfos(infos, resultado.quantidade);
}

async function postViagem(saida, chegada, infos) {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
    if (usuario.login) {
        const viagem = {
            saida,
            destino: chegada,
            distancia: `${infos.distancia}Km`,
            tempo:`${infos.horas}h e ${infos.min} min`,
            postos: infos.postos,
            usuarioId: usuario.id
        };
        await fetch("/viagem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(viagem)
        });
    }
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
    const infosViajem = await buscarRota(infoSaida, infoChegada);
    tempo.innerText = `${infosViajem.horas}h e ${infosViajem.min} min`;
    distancia.innerText = `${infosViajem.distancia}Km`;
    postos.innerText = `${infosViajem.postos}`;
    await postViagem(saida,chegada,infosViajem);
}

async function init() {
    const saida = document.getElementById('saida');
    const chegada = document.getElementById('chegada');
    const btn = document.getElementById('btnCalcular');
    map = L.map('map').setView([-19.9167, -43.9345], 13);
    const postos = await buscarPostos();
    postos.forEach(posto => {
        if (!posto.latitude || !posto.longitude) return;

        const marker = L.marker([posto.latitude, posto.longitude]).addTo(map);
        marker.bindPopup(`<b>${posto.nome}</b><br>${posto.tipoConector ?? ''}`);
        });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    btn.addEventListener('click', ()=>showMeDetails());
}

init();

