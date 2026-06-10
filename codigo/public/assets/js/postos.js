async function buscarPostos() {
    const response = await fetch(
        `http://localhost:3000/postos`
    );
    const dados = await response.json();
    return dados;
}

function createPostos(posto) {
    const card = document.createElement('div');
    card.innerHTML =`
    <img src="${posto.imagem}">
    <div class="info">
        <P>${posto.nome}</p>
        <P>${posto.endereco}</p>
        <P>${posto.cidade}</p>
        <P>${posto.telefone}</p>
    </div>
    <div class="card-btn">
        <a href="./editPosto.html?id=${posto.id}">Editar</a>
        <button class="btnCalcular" id="btnCalcular">Deletar</button>
    </div>
    `;
    return card;
}

async function renderPostos() {
    const listPostos = document.getElementById('listaDePostos');
    const postos = await buscarPostos();
    postos.forEach(p => listPostos.appendChild(createPostos(p)));
}

await renderPostos()