const form = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (nome === "" || email === "" || senha === "") {
    mensagem.innerText = "Preencha todos os campos!";
    mensagem.style.color = "red";
    return;
  }

  if (senha.length < 6) {
    mensagem.innerText = "A senha deve ter pelo menos 6 caracteres.";
    mensagem.style.color = "red";
    return;
  }

  mensagem.innerText = "Cadastro realizado com sucesso!";
  mensagem.style.color = "green";

  console.log({
    nome,
    email,
    senha
  });

  form.reset();
});