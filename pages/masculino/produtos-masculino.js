// =========================================
// SCRIPT DE PRODUTOS MASCULINOS
// RUA13 - STREET KACE
// =========================================

console.log('=== PRODUTOS MASCULINOS - INICIANDO ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - iniciando busca de produtos masculinos');
    
    // Elemento container dos produtos
    const container = document.getElementById('produtos-container');
    
    if (!container) {
        console.error('ERRO: Elemento produtos-container nao encontrado!');
        return;
    }
    
    console.log('Container encontrado:', container);
    
    // Função para buscar produtos da API
    async function buscarProdutos() {
        try {
            console.log('Fazendo requisição para API...');
            
            const url = 'http://localhost/Rua13/Backend/api/produtos.php?action=get_produtos&categoria=Masculino';
            console.log('URL:', url);
            
            const resposta = await fetch(url);
            console.log('Status da resposta:', resposta.status);
            
            if (!resposta.ok) {
                throw new Error('Erro na requisição: ' + resposta.status);
            }
            
            const produtos = await resposta.json();
            console.log('Produtos recebidos:', produtos);
            console.log('Quantidade de produtos:', produtos.length);
            
            if (produtos.length === 0) {
                mostrarMensagemNenhumProduto();
            } else {
                exibirProdutos(produtos);
            }
            
        } catch (erro) {
            console.error('Erro ao buscar produtos:', erro);
            mostrarErro(erro.message);
        }
    }
    
    // Função para exibir os produtos
    function exibirProdutos(produtos) {
        console.log('Exibindo', produtos.length, 'produtos');
        
        // Limpa o container
        container.innerHTML = '';
        
        produtos.forEach(function(produto, index) {
            console.log('Criando card para produto', index + 1, ':', produto.nome);
            
            const card = criarCardProduto(produto);
            container.appendChild(card);
        });
        
        console.log('Todos os produtos exibidos com sucesso!');
    }
    
    // Função para criar o card de um produto
    function criarCardProduto(produto) {
        const coluna = document.createElement('div');
        coluna.className = 'col-12 col-sm-6 col-lg-4';
        
        // Formata o preço
        const preco = parseFloat(produto.preco);
        const precoFormatado = preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        coluna.innerHTML = `
            <div class="card card-hot h-100" data-product-id="${produto.id_produto}">
                <img src="../../Backend/api/produtos.php?action=get_image&id=${produto.id_produto}" 
                     class="card-img-top" 
                     alt="${produto.nome}" 
                     loading="lazy">
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
        
        return coluna;
    }
    
    // Função para mostrar mensagem quando não há produtos
    function mostrarMensagemNenhumProduto() {
        console.log('Nenhum produto encontrado');
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhum produto masculino encontrado no momento.
                </div>
            </div>
        `;
    }
    
    // Função para mostrar erro
    function mostrarErro(mensagem) {
        console.error('Exibindo erro:', mensagem);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Erro ao carregar produtos: ${mensagem}
                </div>
            </div>
        `;
    }
    
    // Inicia a busca de produtos
    console.log('Iniciando busca de produtos masculinos...');
    buscarProdutos();
});

console.log('=== PRODUTOS MASCULINOS - SCRIPT CARREGADO ===');
