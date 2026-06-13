const map = L.map('map').setView([-19.922553, -43.993710], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let userLatLng = null;
let userMarker = null;
let rotaAtual = null;
let watchId = null;
let seguindoUsuario = false;

// Ícone de posição do usuário estilo GPS
const userIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            width: 18px; height: 18px;
            background: #4285f4;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(66,133,244,0.6);
        "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

async function initApp() {
    const listaDiv = document.getElementById('lista-carregadores');

    let postos = [];

    try {
        const response = await fetch("http://localhost:3000/postos");
        if (!response.ok) throw new Error("Erro ao buscar postos");
        postos = await response.json();
    } catch (err) {
        console.error("Não foi possível carregar os postos:", err);
        listaDiv.innerHTML = "<p>Erro ao carregar os postos. Verifique se o servidor está rodando.</p>";
        return;
    }

    postos.forEach(posto => {
        if (!posto.latitude || !posto.longitude) return;

        const marker = L.marker([posto.latitude, posto.longitude]).addTo(map);
        marker.bindPopup(`<b>${posto.nome}</b><br>${posto.tipoConector ?? ''}`);

        const card = document.createElement('div');
        card.className = 'card-carregador';
        card.innerHTML = `
            <h2>${posto.nome}</h2>
            <p><strong>Endereço:</strong> ${posto.endereco}</p>
            <p><strong>Tipo:</strong> ${posto.tipoConector ?? 'N/A'}</p>
            <p><strong>Potência:</strong> ${posto.potencia ?? 'N/A'}</p>
            <p><strong>Horário:</strong> ${posto.horario ?? 'N/A'}</p>
            <span class="status ${posto.status}">${posto.status.toUpperCase()}</span>
        `;

        card.onclick = () => {
            map.flyTo([posto.latitude, posto.longitude], 16);
            marker.openPopup();

            if (rotaAtual) {
                map.removeControl(rotaAtual);
                rotaAtual = null;
            }

            if (userLatLng) {
                rotaAtual = L.Routing.control({
                    waypoints: [
                        userLatLng,
                        L.latLng(posto.latitude, posto.longitude)
                    ],
                    routeWhileDragging: false,
                    show: true,
                    collapsible: true,
                    router: L.Routing.osrmv1({
                        serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1'
                    }),
                    lineOptions: {
                        styles: [
                            { color: '#1a73e8', weight: 6, opacity: 0.9 },
                            { color: '#4285f4', weight: 4, opacity: 1 }
                        ]
                    },
                    createMarker: () => null
                }).addTo(map);

                iniciarAcompanhamento();

            } else {
                alert("Ative a localização para traçar a rota.");
            }
        };

        listaDiv.appendChild(card);
    });
}

function atualizarPosicaoUsuario(lat, lng) {
    userLatLng = L.latLng(lat, lng);

    if (userMarker) {
        userMarker.setLatLng(userLatLng);
    } else {
        userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup("Você está aqui");
    }

    if (rotaAtual) {
        const waypoints = rotaAtual.getWaypoints();
        if (waypoints.length >= 2) {
            rotaAtual.setWaypoints([
                userLatLng,
                waypoints[1].latLng
            ]);
        }
    }

    if (seguindoUsuario) {
        map.setView(userLatLng, map.getZoom());
    }
}

function findMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            atualizarPosicaoUsuario(pos.coords.latitude, pos.coords.longitude);
            map.setView(userLatLng, 14);
        }, () => {
            console.warn("Não foi possível obter localização.");
        });
    }
}

function iniciarAcompanhamento() {
    if (watchId !== null) return;

    seguindoUsuario = true;

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                atualizarPosicaoUsuario(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.warn("Erro no acompanhamento:", err);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );
    }

    if (!document.getElementById('btnPararRota')) {
        const btn = document.createElement('button');
        btn.id = 'btnPararRota';
        btn.innerText = '✕ Encerrar rota';
        btn.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: #e53935; color: white; border: none; border-radius: 24px;
            padding: 12px 28px; font-size: 1rem; font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer; z-index: 9999;
        `;
        btn.onclick = encerrarRota;
        document.body.appendChild(btn);
    }
}

function encerrarRota() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    seguindoUsuario = false;

    if (rotaAtual) {
        map.removeControl(rotaAtual);
        rotaAtual = null;
    }

    const btn = document.getElementById('btnPararRota');
    if (btn) btn.remove();
}

window.onload = () => {
    initApp();
    findMe();
};

function toggleMenu() {
    const menu = document.getElementById("menuItems");
    menu.classList.toggle("show");
}