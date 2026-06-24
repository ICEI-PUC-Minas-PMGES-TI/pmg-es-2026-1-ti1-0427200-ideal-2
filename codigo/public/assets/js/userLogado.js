export function logOrNot() {
    const usuario = JSON.parse(
        sessionStorage.getItem('usuarioCorrente')
    );
    if (usuario.login) {
        const btnLogin = document.getElementById('bottomLogin');
        const divLogin = document.getElementById('divLogin');
        btnLogin.setAttribute(
            'onclick',
            "location.href='../perfil/perfil.html'"
        );
        divLogin.lastChild.textContent = usuario.nome;
        return usuario
    }
    else{
        return false
    }
}

export function logoutUser () {
    let usuarioCorrente = {'login': false};
    sessionStorage.setItem ('usuarioCorrente', JSON.stringify (usuarioCorrente));
    window.location = 'planejador.html';
}

async function init() {
    const usuario = JSON.parse(
        sessionStorage.getItem('usuarioCorrente')
    );
    if (!usuario) {
        sessionStorage.setItem ('usuarioCorrente', JSON.stringify ({}));
    }
    const logado = logOrNot();
}

init();