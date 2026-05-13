function showMeDetails() {
    const saida = document.getElementById('saida').value;
    const chegada = document.getElementById('chegada').value;
    const results = document.getElementById('results');
    results.innerHTML = `
    ${saida}
    ${chegada}
    `
}

const saida = document.getElementById('saida');
const chegada = document.getElementById('chegada');
const btn = document.getElementById('btnCalcular');

btn.addEventListener('click', ()=>showMeDetails());
