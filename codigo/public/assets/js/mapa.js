const map = L.map('map').setView([-19.922553, -43.993710], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

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
        };

        listaDiv.appendChild(card);
    });
}

function findMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);

            L.circle([latitude, longitude], {
                color: '#3498db',
                fillColor: '#3498db',
                fillOpacity: 0.2,
                radius: 300
            }).addTo(map).bindPopup("Você está aqui").openPopup();
        });
    }
}

window.onload = () => {
    initApp();
    findMe();
};

function toggleMenu() {
    const menu = document.getElementById("menuItems");
    menu.classList.toggle("show");
}