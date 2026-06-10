async function buscarPostos() {
    const response = await fetch(
        `http://localhost:3000/postos`
    );
    const dados = await response.json();
    return dados;
}
async function deletePosto(id) {
    fetch(`http://localhost:3000/postos/${id}`, {
      method: "DELETE"
    });
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
        <button class="btnDeletar" id="btnDeletar"  data-id="${posto.id}">Deletar</button>
    </div>
    `;
    return card;
}

async function renderPostos() {
    const listPostos = document.getElementById('listaDePostos');
    const postos = await buscarPostos();
    postos.forEach(p => listPostos.appendChild(createPostos(p)));
}

async function init() {
    await renderPostos()
    document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnDeletar")) {
        const id = e.target.dataset.id;
        const confirmar = confirm(
            "Tem certeza que deseja deletar este posto?"
        );
        if (!confirmar) {
            return;
        }
        console.log("ID do posto deletado:", id);
        deletePosto(id);
        location.reload();
    }
});
}

init();