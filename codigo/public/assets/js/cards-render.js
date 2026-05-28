//Pra funcionar la e puxar diferentes favoritos tem que escrever ?usuario="número de usuário aqui" pra aparecer diferentes postos que foram favoritados no site

function formatarStatus(posto) {
  if (!posto.recarga) return "";

  const labels = {
    "disponivel": "Disponível",
    "ocupada": "Ocupada",
    "fora-de-servico": "Fora de serviço"
  };

  const texto = labels[posto.status];
  if (!texto) return "";

  return "<span class='status-pill status-" + posto.status + "'>" + texto + "</span>";
}

const lista = document.getElementById("lista");
const pesquisa = document.getElementById("pesquisa");

const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("usuario") ? Number(params.get("usuario")) : 1;

const usuario = favoritos.find(function(u) {
  return u.usuarioId === usuarioId;
});

let postosFavoritos = [];

if (usuario) {
  postosFavoritos = postos.filter(function(posto) {
    return usuario.postosFavoritos.includes(posto.id);
  });
}

function renderizarLista(listaPostos) {
  lista.innerHTML = "";

  if (!usuario) {
    lista.innerHTML =
      "<div class='card'>" +
        "<div class='card-info'>" +
          "<strong>Usuário não encontrado</strong>" +
          "<span>Nenhum usuário com esse ID foi localizado.</span>" +
        "</div>" +
      "</div>";
    return;
  }

  if (postosFavoritos.length === 0) {
    lista.innerHTML =
      "<div class='card'>" +
        "<div class='card-info'>" +
          "<strong>Nenhum posto favoritado</strong>" +
          "<span>" + usuario.nomeUsuario + ", você ainda não adicionou postos aos favoritos.</span>" +
        "</div>" +
      "</div>";
    return;
  }

  if (listaPostos.length === 0) {
    lista.innerHTML =
      "<div class='sem-resultado'>Nenhum posto encontrado para os filtros selecionados.</div>";
    return;
  }

  listaPostos.forEach(function(posto) {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML =
      "<img src='" + posto.imagem + "' alt='posto' />" +
      "<div class='card-info'>" +
        "<strong>" + posto.nome + "</strong>" +
        "<span>" + posto.endereco + " — " + posto.cidade + "</span>" +
        formatarStatus(posto) +
      "</div>" +
      "<a href='favoritos.html?id=" + posto.id + "'><button>Ver detalhes</button></a>" +
      "<button class='btn-remover' data-id='" + posto.id + "'>Remover</button>";

    lista.appendChild(card);
  });
}

function removerFavorito(idPosto) {
  postosFavoritos = postosFavoritos.filter(function(posto) {
    return posto.id !== idPosto;
  });

  renderizarLista(aplicarFiltros());
}

let statusAtivo = "todos";

function combinaTexto(posto, termoLower) {
  if (termoLower === "") return true;
  return (
    posto.nome.toLowerCase().includes(termoLower) ||
    posto.endereco.toLowerCase().includes(termoLower) ||
    posto.cidade.toLowerCase().includes(termoLower)
  );
}

function combinaStatus(posto) {
  if (statusAtivo === "todos") return true;
  return posto.status === statusAtivo;
}

function aplicarFiltros() {
  const termoLower = pesquisa ? pesquisa.value.trim().toLowerCase() : "";

  return postosFavoritos.filter(function(posto) {
    return combinaStatus(posto) && combinaTexto(posto, termoLower);
  });
}

renderizarLista(postosFavoritos);

lista.addEventListener("click", function(e) {
  const botao = e.target.closest(".btn-remover");
  if (botao) {
    removerFavorito(Number(botao.dataset.id));
  }
});

if (pesquisa) {
  pesquisa.addEventListener("input", function() {
    renderizarLista(aplicarFiltros());
  });
}

const filtros = document.getElementById("filtros");

if (filtros) {
  filtros.addEventListener("click", function(e) {
    const botao = e.target.closest(".filtro-btn");
    if (!botao) return;

    statusAtivo = botao.dataset.status;

    // Marca visualmente o botão ativo
    filtros.querySelectorAll(".filtro-btn").forEach(function(b) {
      b.classList.remove("ativo");
    });
    botao.classList.add("ativo");

    renderizarLista(aplicarFiltros());
  });
}