//Pra funcionar la e puxar diferentes favoritos tem que escrever ?usuario="número de usuário aqui" pra aparecer diferentes postos que foram favoritados no site

const lista = document.getElementById("lista");

const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("usuario") ? Number(params.get("usuario")) : 1;

const usuario = favoritos.find(function(u) {
  return u.usuarioId === usuarioId;
});

if (!usuario) {
  lista.innerHTML =
    "<div class='card'>" +
      "<div class='card-info'>" +
        "<strong>Usuário não encontrado</strong>" +
        "<span>Nenhum usuário com esse ID foi localizado.</span>" +
      "</div>" +
    "</div>";
} else {
  const postosFavoritos = postos.filter(function(posto) {
    return usuario.postosFavoritos.includes(posto.id);
  });

  if (postosFavoritos.length === 0) {
    lista.innerHTML =
      "<div class='card'>" +
        "<div class='card-info'>" +
          "<strong>Nenhum posto favoritado</strong>" +
          "<span>" + usuario.nomeUsuario + ", você ainda não adicionou postos aos favoritos.</span>" +
        "</div>" +
      "</div>";
  } else {
    postosFavoritos.forEach(function(posto) {
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
}
