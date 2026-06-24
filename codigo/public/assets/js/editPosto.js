async function buscarPostos(id) {
    const response = await fetch(
        `http://localhost:3000/postos/${id}`
    );
    const dados = await response.json();
    return dados;
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
        id: Math.random().toString(36).slice(2, 13),
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

function mostrarDadosPosto(posto) {
    document.getElementById('nome').value = posto.nome;
    document.getElementById('endereco').value = posto.endereco;
    document.getElementById('cidade').value = posto.cidade;
    document.getElementById('telefone').value = posto.telefone;
    document.getElementById('horario').value = posto.horario;
    document.getElementById('imagem').value = posto.imagem;
}

async function updatePosto(id, form) {
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
    
    await fetch(`http://localhost:3000/postos/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(posto)
    });
    
    
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const getId = params.get('id');
    const titulo = document.getElementById('titulo');
    titulo.innerText = getId ? "Editar Posto" : "Cadastrar Posto";
    if (getId == null) {
        const form = document.getElementById('formPosto');
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await postPosto(form);
            alert('Posto criado!');
            window.location.href = 'postos.html';
        });
    } else {
        const posto = await buscarPostos(getId);
        const form = document.getElementById('formPosto');
        const btn = document.getElementById('btnSubmit');
        btn.innerText=''
        btn.innerText='Atualizar Posto'
        mostrarDadosPosto(posto);
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await updatePosto(posto.id, form);
            alert('Posto Atualizado!');
            window.location.href = 'postos.html';
        });
    }
}

init();