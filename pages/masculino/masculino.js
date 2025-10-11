document.addEventListener('DOMContentLoaded', () => {
    const produtosContainer = document.getElementById('produtos-container');

    const fetchProdutos = async (categoria) => {
        try {
            const response = await fetch(`../../Backend/api/produtos.php?action=get_produtos&categoria=${categoria}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar os produtos.');
            }
            const produtos = await response.json();
            
            displayProdutos(produtos);
        } catch (error) {
            console.error('Erro:', error);
            produtosContainer.innerHTML = `<div class="col-12"><p class="alert alert-danger">${error.message}</p></div>`;
        }
    };

    const displayProdutos = (produtos) => {
        if (produtos.length === 0) {
            produtosContainer.innerHTML = '<div class="col-12"><p class="alert alert-info">Nenhum produto encontrado.</p></div>';
            return;
        }

        produtos.forEach(produto => {
            const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-lg-4';
            card.innerHTML = `
                <div class="card card-hot h-100" data-product-id="${produto.id}">
                    <img src="../../Backend/api/produtos.php?action=get_image&id=${produto.id}" class="card-img-top" alt="${produto.nome}" loading="lazy">
                    <div class="card-body">
                        <h6 class="card-title mb-1">${produto.nome}</h6>
                        <p class="price mb-3">${precoFormatado}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-icon" aria-label="Adicionar ao carrinho">
                                <img src="../../assets/icons/carrinho-de-compras (3).png" class="icon-cart" alt="">
                            </button>
                            <button class="btn btn-gradient flex-fill btn-comprar" type="button">Comprar</button>
                        </div>
                    </div>
                </div>
            `;
            produtosContainer.appendChild(card);
        });
    };

    // Chama a função para buscar os produtos da categoria "masculina"
    fetchProdutos('masculina');
});