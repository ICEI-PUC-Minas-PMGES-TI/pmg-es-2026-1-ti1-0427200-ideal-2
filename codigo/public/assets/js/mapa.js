const LOCATIONS = [
    { id: 1, title: "Shopping Central", address: "Av. Paulista, 1234", lat: -19.942824, lng: -44.076051, type: "Tipo 2", price: "R$ 12,00/h", status: "disponivel" },
    { id: 2, title: "Posto Shell Eco", address: "Rua Augusta, 500", lat: -19.933936, lng: -43.936350, type: "CCS 50kW", price: "R$ 1.50/kWh", status: "ocupado" },
    { id: 3, title: "Eletroposto Parque", address: "Ibirapuera, Portão 3", lat: -19.922553, lng: -43.993710, type: "Tipo 2", price: "Grátis", status: "disponivel" }
];

const map = L.map('map').setView([-19.922553, -43.993710], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function initApp() {
    const listaDiv = document.getElementById('lista-carregadores');

    LOCATIONS.forEach(loc => {

        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(`<b>${loc.title}</b><br>${loc.type}`);

        const card = document.createElement('div');
        card.className = 'card-carregador';
        card.innerHTML = `
            <h2>${loc.title}</h2>
            <p><strong>Endereço:</strong> ${loc.address}</p>
            <p><strong>Tipo:</strong> ${loc.type}</p>
            <p><strong>Preço:</strong> ${loc.price}</p>
            <span class="status ${loc.status}">${loc.status.toUpperCase()}</span>
    `;

        card.onclick = () => {
            map.flyTo([loc.lat, loc.lng], 16);
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