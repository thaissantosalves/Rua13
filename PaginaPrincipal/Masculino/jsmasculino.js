document.getElementById("botaoFecharMenu").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "none";
});

document.querySelector(".mobile-menu-responsivo").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "block";
});

/*---------------------------------------------------------------*/

document.getElementById("botaoFecharMenu").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "none";
});

document.querySelector(".mobile-menu-responsivo").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "block";
});

// -------- Interatividade dos botões "Comprar" --------
document.querySelectorAll(".item-roupa").forEach((item) => {
    const botao = item.querySelector(".botao-comprar");

    botao.addEventListener("click", () => {
        const nome = item.querySelector(".descricao").textContent.trim();
        const preco = item.querySelector(".preco").textContent.trim();

        const produto = { nome, preco };

        // Salva no localStorage
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.push(produto);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        // Exibe mensagem temporária
        let mensagem = item.querySelector(".mensagem-sucesso");
        if (!mensagem) {
            mensagem = document.createElement("p");
            mensagem.classList.add("mensagem-sucesso");
            item.appendChild(mensagem);
        }

        mensagem.textContent = "Produto adicionado ao carrinho!";
        mensagem.style.color = "green";

        setTimeout(() => {
            mensagem.textContent = "";
        }, 2000);

        // ✅ Atualiza o modal se ele estiver visível
        const modal = document.getElementById("carrinho-modal");
        if (modal.style.display === "block") {
            atualizarCarrinhoModal();
        }
    });
});


/*---------------------------------------------------------------------------------------------*/

const carrinhoIcones = document.querySelectorAll('a[href="#"] img[alt="carrinho"]');

carrinhoIcones.forEach(icone => {
    icone.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById("carrinho-modal");
        const lista = document.getElementById("lista-carrinho");
        lista.innerHTML = "";

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (carrinho.length === 0) {
            lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
        } else {
            carrinho.forEach(produto => {
                const item = document.createElement("li");
                item.textContent = `${produto.nome} - ${produto.preco}`;
                lista.appendChild(item);
                // Salva no localStorage com controle de quantidade
                let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            const indice = carrinho.findIndex(item => item.nome === produto.nome);
            if (indice !== -1) {
            carrinho[indice].quantidade += 1;
            } else {
            produto.quantidade = 1;
            carrinho.push(produto);
}

localStorage.setItem("carrinho", JSON.stringify(carrinho));
                
            });
        }

        modal.style.display = "block";
    });
});

// Fechar carrinho
document.querySelector(".fechar-carrinho").addEventListener("click", () => {
    document.getElementById("carrinho-modal").style.display = "none";
});

// Limpar o carrinho e fechar o modal
document.getElementById("limpar-carrinho").addEventListener("click", () => {
    localStorage.removeItem("carrinho");

    // Atualiza a lista com carrinho vazio
    const lista = document.getElementById("lista-carrinho");
    lista.innerHTML = "<li>Seu carrinho está vazio.</li>";

    // ✅ Zera o total também
    const totalElement = document.getElementById("total-carrinho");
    totalElement.textContent = "";

    // Fecha o modal após 1 segundo (ajustável)
    setTimeout(() => {
        document.getElementById("carrinho-modal").style.display = "none";
    }, 1000);
});

function atualizarCarrinhoModal() {
    const modal = document.getElementById("carrinho-modal");
    const lista = document.getElementById("lista-carrinho");
    const totalElement = document.getElementById("total-carrinho");

    if (!modal || !lista) return;

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
        totalElement.textContent = "";
    } else {
        let total = 0;

        carrinho.forEach(produto => {
            const item = document.createElement("li");
            item.textContent = `${produto.nome} - ${produto.preco}`;
            lista.appendChild(item);

            const valor = parseFloat(produto.preco.replace("R$", "").replace(",", ".").trim());
            total += valor;
        });

        totalElement.textContent = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
    }
}