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

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const posto = postos.find(function(p) { return p.id === id; });

const detalhe = document.getElementById("detalhe");

if (posto) {
  const recargaHtml = posto.recarga
    ? "<div class='secao-recarga'>" +
        "<h3>Ponto de Recarga Elétrica</h3>" +
        "<p><span>Status:</span> " + formatarStatus(posto) + "</p>" +
        "<p><span>Conector:</span> " + posto.tipoConector + "</p>" +
        "<p><span>Potência:</span> " + posto.potencia + "</p>" +
        "<p><span>Tomadas disponíveis:</span> " + posto.tomadas + "</p>" +
      "</div>"
    : "<div class='secao-recarga sem-recarga'>" +
        "<p>Este posto não possui ponto de recarga elétrica.</p>" +
      "</div>";

  detalhe.innerHTML =
    "<img src='" + posto.imagem + "' alt='posto' />" +
    "<h2>" + posto.nome + "</h2>" +
    "<div class='secao'>" +
      "<p><span>Endereço:</span> " + posto.endereco + "</p>" +
      "<p><span>Cidade:</span> " + posto.cidade + "</p>" +
      "<p><span>Telefone:</span> " + posto.telefone + "</p>" +
      "<p><span>Horário de funcionamento:</span> " + posto.horario + "</p>" +
    "</div>" +
    recargaHtml +
    "<a class='btn-voltar' href='cards.html'>← Voltar</a>";
} else {
  detalhe.innerHTML =
    "<p>Posto não encontrado.</p>" +
    "<a class='btn-voltar' href='cards.html'>← Voltar</a>";
}