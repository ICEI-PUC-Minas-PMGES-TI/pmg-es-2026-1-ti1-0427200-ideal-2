//Pra funcionar la e puxar diferentes favoritos tem que escrever ?usuario="número de usuário aqui" pra aparecer diferentes postos que foram favoritados no site

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
      "<div class='sem-resultado'>Nenhum posto encontrado para a sua pesquisa.</div>";
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
      "</div>" +
      "<a href='favoritos.html?id=" + posto.id + "'><button>Ver detalhes</button></a>";

    lista.appendChild(card);
  });
}

function filtrarPostos(termo) {
  const termoLower = termo.trim().toLowerCase();

  if (termoLower === "") {
    return postosFavoritos;
  }

  return postosFavoritos.filter(function(posto) {
    return (
      posto.nome.toLowerCase().includes(termoLower) ||
      posto.endereco.toLowerCase().includes(termoLower) ||
      posto.cidade.toLowerCase().includes(termoLower)
    );
  });
}

renderizarLista(postosFavoritos);

if (pesquisa) {
  pesquisa.addEventListener("input", function(e) {
    const resultados = filtrarPostos(e.target.value);
    renderizarLista(resultados);
  });
}