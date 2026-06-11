

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

async function postPosto(form) {
    const dados = new FormData(form);
    const nome = dados.get("nome");
    const endereco = dados.get("endereco");
    const cidade = dados.get("cidade");
    const tel = dados.get("telefone");
    const horario = dados.get("horario");
    const imagem = dados.get("imagem");
    const {lat, lon} = await buscarEndereco(endereco+', '+cidade);
    
    const posto = {
        nome,
        endereco,
        cidade,
        telefone: tel,
        horario,
        imagem,
        latitude: lat,
        longitude: lon
    };

    console.log(posto);
    
    await fetch("http://localhost:3000/postos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(posto)
    });
}

async function init() {
    const form = document.getElementById('formPosto');
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        postPosto(form)
    });
}

init();