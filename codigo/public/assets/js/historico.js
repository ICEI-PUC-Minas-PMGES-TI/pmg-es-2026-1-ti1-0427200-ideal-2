const BASE_URL = "http://localhost:3000";


async function tratarResposta(resposta, contexto) {
if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new Error(
Falha ao ${contexto} (HTTP ${resposta.status}). ${corpo}
    );
}
return resposta.json();
}


async function listarRecargas(filtros = {}) {

const filtrosLimpos = Object.fromEntries(
    Object.entries(filtros).filter(([_, v]) => v !== undefined && v !== null)
);

const params = new URLSearchParams(filtrosLimpos);
const query = params.toString();
const url = ${BASE_URL}/recargas${query ? `?${query} : ""}`;

const resposta = await fetch(url);
return tratarResposta(resposta, "listar recargas");
}


async function buscarRecargaPorId(id) {
if (!id) throw new Error("O ID da recarga é obrigatório.");

const resposta = await fetch(${BASE_URL}/recargas/${id});
if (resposta.status === 404) {
    throw new Error(Recarga com id ${id} não encontrada.);
}
return tratarResposta(resposta, buscar recarga ${id});
}


async function agendarRecarga(dados) {
const novaRecarga = {
    status: "agendada",
    energiaKwh: null,
    custoTotal: null,
    autonomiaFinalKm: null,
    observacoes: dados.observacoes ?? "",
    ...dados,
};

const resposta = await fetch(${BASE_URL}/recargas, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novaRecarga),
});
return tratarResposta(resposta, "agendar recarga");
}


async function atualizarRecarga(id, camposAtualizados) {
const resposta = await fetch(${BASE_URL}/recargas/${id}, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(camposAtualizados),
});
return tratarResposta(resposta, atualizar recarga ${id});
}


async function concluirRecarga(id, { energiaKwh, custoTotal, autonomiaFinalKm }) {
if (!id) throw new Error("O ID da recarga é obrigatório.");
return atualizarRecarga(id, {
    status: "concluida",
    energiaKwh: Number(energiaKwh),
    custoTotal: Number(custoTotal),
    autonomiaFinalKm: Number(autonomiaFinalKm),
});
}


async function cancelarRecarga(id, motivo = "") {
if (!id) throw new Error("O ID da recarga é obrigatório.");
return atualizarRecarga(id, {
    status: "cancelada",
    observacoes: motivo || "Cancelada pelo usuário",
});
}


async function removerRecarga(id) {
if (!id) throw new Error("O ID da recarga é obrigatório.");
const resposta = await fetch(${BASE_URL}/recargas/${id}, {
    method: "DELETE",
});
return tratarResposta(resposta, remover recarga ${id});
}


function calcularEstatisticas(recargas) {
const concluidas = recargas.filter((r) => r.status === "concluida");

const totalKwh = concluidas.reduce((soma, r) => soma + (r.energiaKwh || 0), 0);
const totalCusto = concluidas.reduce((soma, r) => soma + (r.custoTotal || 0), 0);

return {
    totalRecargas: recargas.length,
    concluidas: concluidas.length,
    agendadas: recargas.filter((r) => r.status === "agendada").length,
    canceladas: recargas.filter((r) => r.status === "cancelada").length,
    totalEnergiaKwh: Number(totalKwh.toFixed(2)),
    totalCustoReais: Number(totalCusto.toFixed(2)),
    custoMedioPorKwh:
    totalKwh > 0 ? Number((totalCusto / totalKwh).toFixed(2)) : 0,
};
}


function formatarRecarga(r) {
return (
    `#${r.id} | veículo ${r.veiculoId} | posto ${r.postoId} | ${r.dataAgendada || "-"} ` +
    `${r.horarioInicio || "-"}-${r.horarioFim || "-"} | status: ${r.status} | ` +
    energia: ${r.energiaKwh ?? "-"} kWh | custo: R$ ${r.custoTotal ?? "-"}
);
}


async function main() {
const [comando, ...args] = process.argv.slice(2);

try {
    switch (comando) {
    case "listar": {
        const recargas = await listarRecargas();
        if (recargas.length === 0) console.log("Nenhuma recarga encontrada.");
        recargas.forEach((r) => console.log(formatarRecarga(r)));
        break;
    }

    case "listar-status": {
        const [status] = args;
        if (!status) throw new Error("Uso correto: node planejador.js listar-status <status>");
        const recargas = await listarRecargas({ status });
        if (recargas.length === 0) console.log(Nenhuma recarga com status '${status}' encontrada.);
        recargas.forEach((r) => console.log(formatarRecarga(r)));
        break;
    }

    case "listar-veiculo": {
        const [veiculoId] = args;
        if (!veiculoId) throw new Error("Uso correto: node planejador.js listar-veiculo <veiculoId>");
        const recargas = await listarRecargas({ veiculoId: Number(veiculoId) });
        if (recargas.length === 0) console.log(Nenhuma recarga para o veículo #${veiculoId} encontrada.);
        recargas.forEach((r) => console.log(formatarRecarga(r)));
        break;
    }

    case "detalhe": {
        const [id] = args;
        const recarga = await buscarRecargaPorId(id);
        console.log(recarga);
        break;
    }

    case "agendar": {
        if (args.length < 6) {
        throw new Error("Uso correto: node planejador.js agendar <veiculoId> <postoId> <data> <horaInicio> <horaFim> <autonomiaInicialKm>");
        }
        const [veiculoId, postoId, dataAgendada, horarioInicio, horarioFim, autonomiaInicialKm] = args;
        const criada = await agendarRecarga({
        veiculoId: Number(veiculoId),
        postoId: Number(postoId),
        dataAgendada,
        horarioInicio,
        horarioFim,
        autonomiaInicialKm: Number(autonomiaInicialKm),
        });
        console.log("Recarga agendada com sucesso:");
        console.log(formatarRecarga(criada));
        break;
    }

    case "concluir": {
        if (args.length < 4) {
        throw new Error("Uso correto: node planejador.js concluir <id> <energiaKwh> <custoTotal> <autonomiaFinalKm>");
        }
        const [id, energiaKwh, custoTotal, autonomiaFinalKm] = args;
        const atualizada = await concluirRecarga(id, {
        energiaKwh,
        custoTotal,
        autonomiaFinalKm,
        });
        console.log("Recarga concluída:");
        console.log(formatarRecarga(atualizada));
        break;
    }

    case "cancelar": {
        const [id, ...motivoPartes] = args;
        const atualizada = await cancelarRecarga(id, motivoPartes.join(" "));
        console.log("Recarga cancelada:");
        console.log(formatarRecarga(atualizada));
        break;
    }

    case "remover": {
        const [id] = args;
        await removerRecarga(id);
        console.log(Recarga #${id} removida do histórico.);
        break;
    }

    case "estatisticas": {
        const recargas = await listarRecargas();
        console.log(calcularEstatisticas(recargas));
        break;
    }

    default:
        console.log(
        "Comando não reconhecido. Use:\n" +
        "  node planejador.js listar\n" +
        "  node planejador.js listar-status <status>\n" +
        "  node planejador.js listar-veiculo <veiculoId>\n" +
        "  node planejador.js detalhe <id>\n" +
        "  node planejador.js agendar <veiculoId> <postoId> <data> <horaInicio> <horaFim> <autonomiaInicialKm>\n" +
        "  node planejador.js concluir <id> <energiaKwh> <custoTotal> <autonomiaFinalKm>\n" +
        "  node planejador.js cancelar <id> [motivo]\n" +
        "  node planejador.js remover <id>\n" +
        "  node planejador.js estatisticas"
        );
    }
} catch (erro) {
    console.error("Erro:", erro.message);
    process.exitCode = 1;
}
}

if (require.main === module) {
main();
}

module.exports = {
listarRecargas,
buscarRecargaPorId,
agendarRecarga,
atualizarRecarga,
concluirRecarga,
cancelarRecarga,
removerRecarga,
calcularEstatisticas,
};