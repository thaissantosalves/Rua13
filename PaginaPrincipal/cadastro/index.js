"use strict";

const usuarios = []; // array para armazenar login e senha

document.addEventListener("DOMContentLoaded", function () {
    // Preencher endereço via CEP
    const limparFormulario = () => {
        document.getElementById("endereco").value = "";
        document.getElementById("bairro").value = "";
        document.getElementById("cidade").value = "";
        document.getElementById("estado").value = "";
    };

    const preencherFormulario = (endereco) => {
        document.getElementById("endereco").value = endereco.logradouro;
        document.getElementById("bairro").value = endereco.bairro;
        document.getElementById("cidade").value = endereco.localidade;
        document.getElementById("estado").value = endereco.uf;
    };

    const eNumero = (numero) => /^[0-9]+$/.test(numero);
    const cepValido = (cep) => cep.length === 8 && eNumero(cep);

    const pesquisarCep = async () => {
        limparFormulario();
        const cep = document.getElementById("cep").value.replace(/\D/g, "");
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        if (cepValido(cep)) {
            const dados = await fetch(url);
            const endereco = await dados.json();
            if (endereco.hasOwnProperty("erro")) {
                document.getElementById("endereco").value = "CEP não encontrado!";
            } else {
                preencherFormulario(endereco);
            }
        } else {
            document.getElementById("endereco").value = "CEP incorreto!";
        }
    };

    document.getElementById("cep").addEventListener("focusout", pesquisarCep);

    // Menu mobile
    document.getElementById("botaoFecharMenu").addEventListener("click", function () {
        document.querySelector(".menu-mobile-responsivo").style.display = "none";
    });

    document.querySelector(".mobile-menu-responsivo").addEventListener("click", function () {
        document.querySelector(".menu-mobile-responsivo").style.display = "block";
    });

    // CPF: formatação e validação
    const cpfInput = document.getElementById("cpf");
    cpfInput.addEventListener("input", () => {
        let cpf = cpfInput.value.replace(/\D/g, "");
        if (cpf.length > 11) cpf = cpf.slice(0, 11);

        if (cpf.length > 9) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (cpf.length > 6) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
        } else if (cpf.length > 3) {
            cpf = cpf.replace(/(\d{3})(\d+)/, "$1.$2");
        }

        cpfInput.value = cpf;
    });

    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, "");
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        const digits = cpf.split("").map(Number);
        let soma = 0;
        for (let i = 0; i < 9; i++) soma += digits[i] * (10 - i);
        let resto = soma % 11;
        let digito1 = resto < 2 ? 0 : 11 - resto;
        if (digits[9] !== digito1) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += digits[i] * (11 - i);
        resto = soma % 11;
        let digito2 = resto < 2 ? 0 : 11 - resto;

        return digits[10] === digito2;
    }

    // Evento de envio do formulário
    document.getElementById("formulario").addEventListener("submit", function (event) {
        event.preventDefault();

        const senha = document.getElementById("senha1").value;
        const senha2 = document.getElementById("senha2").value;
        const login = document.getElementById("login").value;
        const cpf = document.getElementById("cpf").value;

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        if (!validarCPF(cpf)) {
            alert("CPF inválido!");
            return;
        }

        if (senha !== senha2) {
            alert("As senhas não são iguais!");
            return;
        }

        // Armazena login e senha1 no array
        const novoUsuario = { login, senha };

        usuarios.push(novoUsuario);

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        console.log("Usuários cadastrados:", usuarios);
        alert("Usuário salvo com sucesso!");

        window.location.href = "../Login/index.html";

        // Redirecionar ou limpar o formulário se quiser
        // window.location.href = "pagina-destino.html";
        // this.reset(); // limpa o formulário
    });
});
