const POSTOS_URL = "/postos";
const FAVORITOS_URL = "/favoritos";

let postos = [];
let favoritos = [];

let postosFavoritos = [];
let usuario = null;
let statusAtivo = "todos";

const lista = document.getElementById("lista");
const pesquisa = document.getElementById("pesquisa");
const filtros = document.getElementById("filtros");
const btnAdicionar = document.getElementById("btn-adicionar");
const modal = document.getElementById("modal-adicionar");
const modalLista = document.getElementById("modal-lista");
const modalFechar = document.getElementById("modal-fechar");
const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("usuario") ? Number(params.get("usuario")) : 1;

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

    const linkDetalhe = "favoritos.html?id=" + posto.id + "&usuario=" + usuarioId;

    card.innerHTML =
      "<img src='" + posto.imagem + "' alt='posto' />" +
      "<div class='card-info'>" +
        "<strong>" + posto.nome + "</strong>" +
        "<span>" + posto.endereco + " — " + posto.cidade + "</span>" +
        formatarStatus(posto) +
      "</div>" +
      "<a href='" + linkDetalhe + "'><button>Ver detalhes</button></a>" +
      "<button class='btn-remover' data-id='" + posto.id + "'>Remover</button>";

    lista.appendChild(card);
  });
}

function removerFavorito(idPosto) {
  const novosFavoritos = usuario.postosFavoritos.filter(function(id) {
    return id !== idPosto;
  });

  fetch(FAVORITOS_URL + "/" + usuario.id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postosFavoritos: novosFavoritos })
  })
  .then(function(r) {
    if (!r.ok) throw new Error("Falha ao remover favorito");
    return r.json();
  })
  .then(function(usuarioAtualizado) {
    usuario = usuarioAtualizado;
    postosFavoritos = postos.filter(function(posto) {
      return usuario.postosFavoritos.includes(posto.id);
    });

    renderizarLista(aplicarFiltros());
  })
  .catch(function(error) {
    console.error("Erro ao remover favorito:", error);
    alert("Não foi possível remover o posto dos favoritos. Tente novamente.");
  });
}

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

function postosDisponiveisParaAdicionar() {
  return postos.filter(function(posto) {
    return !usuario.postosFavoritos.includes(posto.id);
  });
}

function renderizarModal() {
  modalLista.innerHTML = "";

  const disponiveis = postosDisponiveisParaAdicionar();

  if (disponiveis.length === 0) {
    modalLista.innerHTML =
      "<div class='sem-resultado'>Todos os postos já estão nos seus favoritos.</div>";
    return;
  }

  disponiveis.forEach(function(posto) {
    const item = document.createElement("div");
    item.classList.add("card");

    item.innerHTML =
      "<img src='" + posto.imagem + "' alt='posto' />" +
      "<div class='card-info'>" +
        "<strong>" + posto.nome + "</strong>" +
        "<span>" + posto.endereco + " — " + posto.cidade + "</span>" +
        formatarStatus(posto) +
      "</div>" +
      "<button class='btn-adicionar-favorito' data-id='" + posto.id + "'>Adicionar</button>";

    modalLista.appendChild(item);
  });
}

function abrirModal() {
  if (!usuario) return;
  renderizarModal();
  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
}

function adicionarFavorito(idPosto) {
  const novosFavoritos = usuario.postosFavoritos.concat([idPosto]);

  fetch(FAVORITOS_URL + "/" + usuario.id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postosFavoritos: novosFavoritos })
  })
  .then(function(r) {
    if (!r.ok) throw new Error("Falha ao adicionar favorito");
    return r.json();
  })
  .then(function(usuarioAtualizado) {
    usuario = usuarioAtualizado;
    postosFavoritos = postos.filter(function(posto) {
      return usuario.postosFavoritos.includes(posto.id);
    });

    renderizarModal();
    renderizarLista(aplicarFiltros());
    fecharModal();
  })
  .catch(function(error) {
    console.error("Erro ao adicionar favorito:", error);
    alert("Não foi possível adicionar o posto aos favoritos. Tente novamente.");
  });
}

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

if (filtros) {
  filtros.addEventListener("click", function(e) {
    const botao = e.target.closest(".filtro-btn");
    if (!botao) return;

    statusAtivo = botao.dataset.status;

    filtros.querySelectorAll(".filtro-btn").forEach(function(b) {
      b.classList.remove("ativo");
    });
    botao.classList.add("ativo");

    renderizarLista(aplicarFiltros());
  });
}

if (btnAdicionar) {
  btnAdicionar.addEventListener("click", abrirModal);
}

if (modalFechar) {
  modalFechar.addEventListener("click", fecharModal);
}

if (modal) {
  modal.addEventListener("click", function(e) {
    if (e.target === modal) fecharModal();
  });
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && modal && !modal.hidden) fecharModal();
});

if (modalLista) {
  modalLista.addEventListener("click", function(e) {
    const botao = e.target.closest(".btn-adicionar-favorito");
    if (botao) {
      adicionarFavorito(Number(botao.dataset.id));
    }
  });
}

Promise.all([
  fetch(POSTOS_URL).then(function(r) { return r.json(); }),
  fetch(FAVORITOS_URL).then(function(r) { return r.json(); })
])
.then(function(resultados) {
  postos = resultados[0];
  favoritos = resultados[1];

  usuario = favoritos.find(function(u) {
    return u.usuarioId === usuarioId;
  });

  if (usuario) {
    postosFavoritos = postos.filter(function(posto) {
      return usuario.postosFavoritos.includes(posto.id);
    });
  }

  renderizarLista(postosFavoritos);
})
.catch(function(error) {
  console.error("Erro ao carregar dados da API:", error);
  lista.innerHTML =
    "<div class='sem-resultado'>Erro ao carregar os dados. Verifique se o servidor está rodando.</div>";
});