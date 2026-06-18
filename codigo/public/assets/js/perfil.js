const API_URL = "http://localhost:3000/usuarios";
const CODIGO_VALIDO = "0000";

let usuarioAtual = null;
let dadosPendentes = null;

const inputNome = document.getElementById("input-nome");
const inputLogin = document.getElementById("input-login");
const inputEmail = document.getElementById("input-email");
const inputSenha = document.getElementById("input-senha");

const btnEditar = document.getElementById("btn-editar");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const formPerfil = document.getElementById("form-perfil");

const modalVerificacao = document.getElementById("modal-verificacao");
const inputCodigo = document.getElementById("input-codigo");
const btnConfirmarCodigo = document.getElementById("btn-confirmar-codigo");
const btnCancelarCodigo = document.getElementById("btn-cancelar-codigo");
const emailMascaradoEl = document.getElementById("email-mascarado");
const alertaCodigoEl = document.getElementById("alerta-codigo");
const alertaPerfilEl = document.getElementById("alerta-perfil");

document.addEventListener("DOMContentLoaded", iniciarPagina);

function iniciarPagina() {
    let usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
        const usuarioDeTeste = {
            id: "1",
            login: "admin",
            senha: "123",
            nome: "Administrador do Sistema",
            email: "admin@abc.com"
        };
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioDeTeste));
        usuarioSalvo = JSON.stringify(usuarioDeTeste);
    }

    usuarioAtual = JSON.parse(usuarioSalvo);
    preencherCampos(usuarioAtual);
}

function preencherCampos(usuario) {
    inputNome.value = usuario.nome || "";
    inputLogin.value = usuario.login || "";
    inputEmail.value = usuario.email || "";
    inputSenha.value = usuario.senha || "";
}


btnEditar.addEventListener("click", () => {
    ativarModoEdicao();
});

function ativarModoEdicao() {
    inputNome.disabled = false;
    inputEmail.disabled = false;
    inputSenha.disabled = false;

    btnEditar.style.display = "none";
    btnSalvar.style.display = "block";
    btnCancelar.style.display = "block";

    esconderAlerta(alertaPerfilEl);
}

function desativarModoEdicao() {
    inputNome.disabled = true;
    inputEmail.disabled = true;
    inputSenha.disabled = true;

    btnEditar.style.display = "block";
    btnSalvar.style.display = "none";
    btnCancelar.style.display = "none";
}

btnCancelar.addEventListener("click", () => {
    preencherCampos(usuarioAtual);
    desativarModoEdicao();
});


formPerfil.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const novoNome = inputNome.value.trim();
    const novoEmail = inputEmail.value.trim();
    const novaSenha = inputSenha.value.trim();

    if (!novoNome || !novoEmail || !novaSenha) {
        mostrarAlerta(alertaPerfilEl, "Preencha todos os campos antes de salvar.", "erro");
        return;
    }

    dadosPendentes = {
        nome: novoNome,
        email: novoEmail,
        senha: novaSenha
    };

    abrirModalVerificacao(novoEmail);
});


function abrirModalVerificacao(emailDestino) {
    emailMascaradoEl.textContent = mascararEmail(emailDestino);
    inputCodigo.value = "";
    esconderAlerta(alertaCodigoEl);
    modalVerificacao.style.display = "flex";

    console.log(`[Simulação] Código de verificação enviado para ${emailDestino}: ${CODIGO_VALIDO}`);

    inputCodigo.focus();
}

function fecharModalVerificacao() {
    modalVerificacao.style.display = "none";
    dadosPendentes = null;
}

function mascararEmail(email) {
    const [parteLocal, dominio] = email.split("@");

    if (!dominio) return email;

    const visivel = parteLocal.slice(0, 1);
    const escondido = "●".repeat(Math.max(parteLocal.length - 1, 3));

    return `${visivel}${escondido}@${dominio}`;
}

btnCancelarCodigo.addEventListener("click", fecharModalVerificacao);

btnConfirmarCodigo.addEventListener("click", () => {
    const codigoDigitado = inputCodigo.value.trim();

    if (codigoDigitado === CODIGO_VALIDO) {
        salvarAlteracoes();
    } else {
        mostrarAlerta(alertaCodigoEl, "Código inválido. Tente novamente.", "erro");
    }
});

inputCodigo.addEventListener("keyup", (evento) => {
    if (evento.key === "Enter") {
        btnConfirmarCodigo.click();
    }
});

async function salvarAlteracoes() {
    try {
        btnConfirmarCodigo.disabled = true;
        btnConfirmarCodigo.textContent = "Salvando...";

        const resposta = await fetch(`${API_URL}/${usuarioAtual.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosPendentes)
        });

        if (!resposta.ok) {
            throw new Error("Falha ao atualizar usuário no servidor.");
        }

        const usuarioAtualizado = await resposta.json();

        usuarioAtual = usuarioAtualizado;
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

        fecharModalVerificacao();
        desativarModoEdicao();
        preencherCampos(usuarioAtualizado);

        mostrarAlerta(alertaPerfilEl, "Dados atualizados com sucesso!", "sucesso");

    } catch (erro) {
        console.error(erro);
        mostrarAlerta(alertaCodigoEl, "Não foi possível salvar. Verifique se o JSON Server está rodando.", "erro");
    } finally {
        btnConfirmarCodigo.disabled = false;
        btnConfirmarCodigo.textContent = "Confirmar";
    }
}

function mostrarAlerta(elemento, mensagem, tipo) {
    elemento.textContent = mensagem;
    elemento.className = `alerta-msg ${tipo}`;
    elemento.style.display = "block";
}

function esconderAlerta(elemento) {
    elemento.style.display = "none";
}


document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");

    window.location.reload();
});