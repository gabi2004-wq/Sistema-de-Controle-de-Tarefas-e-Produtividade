const form = document.getElementById("formTarefa");
const tabela = document.getElementById("tabelaTarefas");

const pesquisa = document.getElementById("pesquisa");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");

const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");
const mensagem = document.getElementById("mensagem");

const totalTarefas = document.getElementById("totalTarefas");
const tarefasPendentes = document.getElementById("tarefasPendentes");
const tarefasAndamento = document.getElementById("tarefasAndamento");
const tarefasConcluidas = document.getElementById("tarefasConcluidas");

let tarefas = [];
let tarefaEditando = null;

try {
    tarefas = JSON.parse(localStorage.getItem("controleTarefas")) || [];
} catch {
    tarefas = [];
}

// Salvar tarefas no navegador
function salvarDados() {
    localStorage.setItem("controleTarefas", JSON.stringify(tarefas));
}

// Exibir mensagens
function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

// Limpar formulário
function limparFormulario() {
    form.reset();
    tarefaEditando = null;
    botaoSalvar.textContent = "Cadastrar tarefa";
    botaoCancelar.hidden = true;
}

// Atualizar indicadores
function atualizarIndicadores() {
    totalTarefas.textContent = tarefas.length;

    tarefasPendentes.textContent = tarefas.filter(
        tarefa => tarefa.status === "Pendente"
    ).length;

    tarefasAndamento.textContent = tarefas.filter(
        tarefa => tarefa.status === "Em andamento"
    ).length;

    tarefasConcluidas.textContent = tarefas.filter(
        tarefa => tarefa.status === "Concluída"
    ).length;
}

// Criar célula da tabela com segurança
function criarCelula(linha, valor) {
    const celula = document.createElement("td");
    celula.textContent = valor;
    linha.appendChild(celula);
}

// Mostrar tarefas na tabela
function exibirTarefas() {
    tabela.replaceChildren();

    const termo = pesquisa.value.toLowerCase().trim();
    const statusSelecionado = filtroStatus.value;
    const prioridadeSelecionada = filtroPrioridade.value;

    const tarefasFiltradas = tarefas.filter(tarefa => {
        const correspondePesquisa =
            tarefa.titulo.toLowerCase().includes(termo) ||
            tarefa.descricao.toLowerCase().includes(termo);

        const correspondeStatus =
            !statusSelecionado || tarefa.status === statusSelecionado;

        const correspondePrioridade =
            !prioridadeSelecionada ||
            tarefa.prioridade === prioridadeSelecionada;

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondePrioridade
        );
    });

    tarefasFiltradas.forEach(tarefa => {
        const linha = document.createElement("tr");

        criarCelula(linha, tarefa.titulo);
        criarCelula(linha, tarefa.descricao || "Sem descrição");
        criarCelula(linha, tarefa.prioridade);

        criarCelula(
            linha,
            new Date(tarefa.prazo + "T00:00:00").toLocaleDateString("pt-BR")
        );

        criarCelula(linha, tarefa.status);

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "botao-editar";
        botaoEditar.type = "button";

        botaoEditar.addEventListener("click", () => {
            editarTarefa(tarefa.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.type = "button";

        botaoExcluir.addEventListener("click", () => {
            excluirTarefa(tarefa.id);
        });

        celulaAcoes.append(botaoEditar, botaoExcluir);
        linha.appendChild(celulaAcoes);

        tabela.appendChild(linha);
    });

    const tabelaVazia = document.getElementById("tabelaVazia");

    tabelaVazia.hidden = tarefasFiltradas.length > 0;

    if (tarefasFiltradas.length === 0) {
        tabelaVazia.textContent = tarefas.length === 0
            ? "Nenhuma tarefa cadastrada."
            : "Nenhuma tarefa encontrada.";
    }

    atualizarIndicadores();
}

// Cadastrar ou atualizar tarefa
form.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const prioridade = document.getElementById("prioridade").value;
    const prazo = document.getElementById("prazo").value;
    const status = document.getElementById("status").value;

    if (!titulo || !prioridade || !prazo || !status) {
        mostrarMensagem("Preencha os campos obrigatórios.", "erro");
        return;
    }

    const dadosTarefa = {
        id: tarefaEditando ?? Date.now(),
        titulo,
        descricao,
        prioridade,
        prazo,
        status
    };

    if (tarefaEditando !== null) {
        tarefas = tarefas.map(tarefa =>
            tarefa.id === tarefaEditando ? dadosTarefa : tarefa
        );

        mostrarMensagem("Tarefa atualizada com sucesso!");
    } else {
        tarefas.push(dadosTarefa);
        mostrarMensagem("Tarefa cadastrada com sucesso!");
    }

    salvarDados();
    limparFormulario();
    exibirTarefas();
});

// Editar tarefa
function editarTarefa(id) {
    const tarefa = tarefas.find(item => item.id === id);

    if (!tarefa) return;

    document.getElementById("titulo").value = tarefa.titulo;
    document.getElementById("descricao").value = tarefa.descricao;
    document.getElementById("prioridade").value = tarefa.prioridade;
    document.getElementById("prazo").value = tarefa.prazo;
    document.getElementById("status").value = tarefa.status;

    tarefaEditando = id;

    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;

    mostrarMensagem("Editando tarefa.");
    form.scrollIntoView({ behavior: "smooth" });
}

// Excluir tarefa
function excluirTarefa(id) {
    const confirmar = confirm("Deseja realmente excluir esta tarefa?");

    if (!confirmar) return;

    tarefas = tarefas.filter(tarefa => tarefa.id !== id);

    if (tarefaEditando === id) {
        limparFormulario();
    }

    salvarDados();
    exibirTarefas();

    mostrarMensagem("Tarefa excluída com sucesso!");
}

// Cancelar edição
botaoCancelar.addEventListener("click", function() {
    limparFormulario();
    mostrarMensagem("Edição cancelada.");
});

// Eventos de pesquisa e filtros
pesquisa.addEventListener("input", exibirTarefas);
filtroStatus.addEventListener("change", exibirTarefas);
filtroPrioridade.addEventListener("change", exibirTarefas);

// Carregar tarefas ao abrir a página
exibirTarefas();