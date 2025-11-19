// ====== ADMIN PANEL JAVASCRIPT ======

let currentUserToDelete = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as master
    checkAdminAuth();
    
    // Load initial data
    loadStats();
    loadUsers();
    loadLogs();
    loadProducts();
    
    // Set admin name
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.nome) {
        document.getElementById('admin-name').textContent = userData.nome;
    }
});

// ====== AUTHENTICATION ======
function checkAdminAuth() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!userData.perfil || userData.perfil !== 'master') {
        alert('Acesso negado! Apenas administradores podem acessar esta página.');
        window.location.href = '../login/login.html';
        return;
    }
}

// ====== TAB MANAGEMENT ======
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'users') {
        refreshUsers(); // Usar refreshUsers para preservar busca
    } else if (tabName === 'logs') {
        loadLogs();
    } else if (tabName === 'products') {
        loadProducts();
    }
}

// ====== STATS LOADING ======
async function loadStats() {
    try {
        const response = await fetch('../../Backend/api/admin-stats.php');
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('total-users').textContent = data.stats.totalUsers || 0;
            document.getElementById('new-registrations').textContent = data.stats.newRegistrations || 0;
            document.getElementById('total-orders').textContent = data.stats.totalOrders || 0;
            document.getElementById('revenue').textContent = `R$ ${(data.stats.revenue || 0).toFixed(2)}`;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ====== USERS MANAGEMENT ======
let searchTimeout = null;

async function loadUsers(searchTerm = '') {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Carregando usuários...
                </div>
            </td>
        </tr>
    `;
    
    try {
        let url = '../../Backend/api/admin-users.php';
        if (searchTerm) {
            url += '?search=' + encodeURIComponent(searchTerm);
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success') {
            displayUsers(data.users);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erro ao carregar usuários: ${data.mensagem}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erro de conexão
                </td>
            </tr>
        `;
    }
}

// Função para lidar com busca em tempo real
function handleSearch(event) {
    // Limpar timeout anterior
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Aguardar 500ms após o usuário parar de digitar
    searchTimeout = setTimeout(() => {
        const searchTerm = event.target.value.trim();
        loadUsers(searchTerm);
    }, 500);
}

function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-users"></i>
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        // Formatar CPF
        let cpfFormatado = 'N/A';
        if (user.cpf) {
            const cpfLimpo = String(user.cpf).replace(/\D/g, '');
            if (cpfLimpo.length === 11) {
                cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else {
                cpfFormatado = user.cpf;
            }
        }
        
        // Formatar último acesso
        const ultimoAcesso = user.ultimo_login ? formatDateTime(user.ultimo_login) : 'Nunca';
        
        // Escapar caracteres especiais
        const nomeEscapado = String(user.nome || '').replace(/'/g, "\\'");
        const emailEscapado = String(user.email || '').replace(/'/g, "\\'");
        
        return `
        <tr>
            <td>${user.id_usuario}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${cpfFormatado}</td>
            <td>
                <span class="badge bg-primary">
                    Cliente
                </span>
            </td>
            <td>${formatDate(user.criado_em)}</td>
            <td>${ultimoAcesso}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="showDeleteModal(${user.id_usuario}, '${nomeEscapado}', '${emailEscapado}')">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// ====== LOGS MANAGEMENT ======
async function loadLogs() {
    const tbody = document.getElementById('logs-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Carregando logs...
                </div>
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch('../../Backend/api/admin-logs.php');
        const data = await response.json();
        
        if (data.status === 'success') {
            displayLogs(data.logs);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erro ao carregar logs: ${data.mensagem}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erro de conexão
                </td>
            </tr>
        `;
    }
}

function displayLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
    
    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-history"></i>
                    Nenhum log encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${log.id_acao_usuario}</td>
            <td>${log.nome_usuario || 'N/A'}</td>
            <td>${log.acao}</td>
            <td>${formatDateTime(log.criado_em)}</td>
            <td>${log.ip || 'N/A'}</td>
        </tr>
    `).join('');
}

// ====== DELETE USER ======
function showDeleteModal(userId, userName, userEmail) {
    currentUserToDelete = userId;
    document.getElementById('delete-user-name').textContent = userName;
    document.getElementById('delete-user-email').textContent = userEmail;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentUserToDelete = null;
}

async function confirmDelete() {
    if (!currentUserToDelete) return;
    
    try {
        const response = await fetch('../../Backend/api/admin-delete-user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUserToDelete
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Usuário excluído com sucesso!');
            closeDeleteModal();
            refreshUsers(); // Reload users list preservando busca
            loadStats(); // Reload stats
        } else {
            alert('Erro ao excluir usuário: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro de conexão ao excluir usuário');
    }
}

// Função para atualizar preservando a busca
function refreshUsers() {
    const searchInput = document.getElementById('user-search');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    loadUsers(searchTerm);
}

// ====== LOGOUT ======
function logout() {
    if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    }
}

// ====== UTILITY FUNCTIONS ======
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}

// ====== AUTO REFRESH ======
// Refresh stats every 30 seconds
setInterval(loadStats, 30000);

// Refresh current tab data every 15 seconds (mais frequente para atualizar último acesso)
setInterval(() => {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        if (activeTab.id === 'users-tab') {
            // Preservar o termo de busca se houver
            const searchInput = document.getElementById('user-search');
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            loadUsers(searchTerm);
        } else if (activeTab.id === 'logs-tab') {
            loadLogs();
        } else if (activeTab.id === 'products-tab') {
            loadProducts();
        }
    }
}, 15000); // Atualiza a cada 15 segundos

// ====== PRODUCT MANAGEMENT ======
let productModalLoaded = false;

async function loadProductModal() {
    if (productModalLoaded) return;
    
    try {
        const response = await fetch('modal-produto.html');
        if (!response.ok) {
            throw new Error('Arquivo não encontrado');
        }
        const html = await response.text();
        document.getElementById('productModalContainer').innerHTML = html;
        productModalLoaded = true;
    } catch (error) {
        console.error('Erro ao carregar modal de produto:', error);
        alert('Erro ao carregar formulário de produto');
    }
}

async function openProductModal() {
    await loadProductModal();
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Limpar formulário
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
        }
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        nome: document.getElementById('produto-nome').value.trim(),
        descricao: document.getElementById('produto-descricao').value.trim(),
        preco: parseFloat(document.getElementById('produto-preco').value),
        estoque: parseInt(document.getElementById('produto-estoque').value) || 0,
        categoria: document.getElementById('produto-categoria').value,
        sku: document.getElementById('produto-sku').value.trim(),
        imagem: document.getElementById('produto-imagem').value.trim()
    };
    
    // Validação básica
    if (!formData.nome || !formData.preco || !formData.categoria) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    if (formData.preco <= 0) {
        alert('O preço deve ser maior que zero!');
        return;
    }
    
    try {
        const response = await fetch('../../Backend/api/produtos.php?action=create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Produto cadastrado com sucesso!');
            closeProductModal();
            // Recarregar produtos se estiver na aba de produtos
            if (document.getElementById('products-tab').classList.contains('active')) {
                loadProducts();
            }
        } else {
            alert('Erro ao cadastrar produto: ' + (data.mensagem || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        alert('Erro de conexão ao cadastrar produto');
    }
}

// ====== PRODUCTS MANAGEMENT ======
async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return; // Se a tabela não existir ainda, não faz nada
    
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Carregando produtos...
                </div>
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch('../../Backend/api/produtos.php?action=get_all_produtos');
        const data = await response.json();
        
        if (data.status === 'success') {
            displayProducts(data.produtos);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erro ao carregar produtos: ${data.mensagem}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erro de conexão
                </td>
            </tr>
        `;
    }
}

function displayProducts(produtos) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    <i class="fas fa-box"></i>
                    Nenhum produto cadastrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => {
        // Formatar preço
        const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        // Truncar descrição se for muito longa
        const descricao = produto.descricao 
            ? (produto.descricao.length > 50 
                ? produto.descricao.substring(0, 50) + '...' 
                : produto.descricao)
            : 'N/A';
        
        // Formatar data
        const dataCadastro = formatDate(produto.criado_em);
        
        // Badge para categoria
        const categoriaBadge = produto.categoria === 'Masculino' 
            ? '<span class="badge bg-primary">Masculino</span>'
            : '<span class="badge bg-danger">Feminino</span>';
        
        return `
        <tr>
            <td>${produto.id_produto}</td>
            <td>${produto.nome}</td>
            <td>${descricao}</td>
            <td>${precoFormatado}</td>
            <td>${produto.estoque || 0}</td>
            <td>${categoriaBadge}</td>
            <td>${produto.sku || 'N/A'}</td>
            <td>${dataCadastro}</td>
        </tr>
        `;
    }).join('');
}

// ====== PDF GENERATION ======
async function printUsersPDF() {
    try {
        // Mostrar loading
        const loadingMsg = 'Gerando PDF...';
        if (confirm('Deseja gerar um PDF com a lista de todos os usuários cadastrados?')) {
            // Buscar todos os usuários
            const response = await fetch('../../Backend/api/admin-users.php');
            const data = await response.json();
            
            if (data.status !== 'success' || !data.users || data.users.length === 0) {
                alert('Nenhum usuário encontrado para gerar o PDF.');
                return;
            }
            
            // Gerar PDF usando jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const startY = 20;
            let yPos = startY;
            const lineHeight = 8;
            const maxY = doc.internal.pageSize.getHeight() - 20;
            
            // Título
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Lista de Usuários Cadastrados', pageWidth / 2, yPos, { align: 'center' });
            yPos += lineHeight * 2;
            
            // Data de geração
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const dataGeracao = new Date().toLocaleString('pt-BR');
            doc.text(`Gerado em: ${dataGeracao}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += lineHeight * 2;
            
            // Cabeçalho da tabela
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            const headers = ['ID', 'Nome', 'Email', 'CPF', 'Data Cadastro'];
            const colWidths = [15, 60, 60, 35, 30];
            let xPos = margin;
            
            // Desenhar cabeçalho
            headers.forEach((header, index) => {
                doc.text(header, xPos, yPos);
                xPos += colWidths[index];
            });
            
            yPos += lineHeight;
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += lineHeight;
            
            // Dados dos usuários
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            
            data.users.forEach((user, index) => {
                // Verificar se precisa de nova página
                if (yPos > maxY) {
                    doc.addPage();
                    yPos = startY;
                }
                
                // Formatar CPF
                let cpfFormatado = 'N/A';
                if (user.cpf) {
                    const cpfLimpo = String(user.cpf).replace(/\D/g, '');
                    if (cpfLimpo.length === 11) {
                        cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    } else {
                        cpfFormatado = user.cpf;
                    }
                }
                
                // Formatar data
                const dataCadastro = user.criado_em ? formatDate(user.criado_em) : 'N/A';
                
                // Truncar textos longos
                const nome = doc.splitTextToSize(user.nome || 'N/A', colWidths[1] - 2);
                const email = doc.splitTextToSize(user.email || 'N/A', colWidths[2] - 2);
                
                // Desenhar linha
                xPos = margin;
                doc.text(String(user.id_usuario || ''), xPos, yPos);
                xPos += colWidths[0];
                
                doc.text(nome[0] || 'N/A', xPos, yPos);
                xPos += colWidths[1];
                
                doc.text(email[0] || 'N/A', xPos, yPos);
                xPos += colWidths[2];
                
                doc.text(cpfFormatado, xPos, yPos);
                xPos += colWidths[3];
                
                doc.text(dataCadastro, xPos, yPos);
                
                // Ajustar Y para múltiplas linhas
                const maxLines = Math.max(nome.length, email.length);
                yPos += lineHeight * maxLines;
            });
            
            // Rodapé
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
            
            // Salvar PDF
            const fileName = `usuarios_cadastrados_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            alert('PDF gerado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
}

// Fechar modal ao clicar no overlay
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('sidebar-overlay')) {
                closeProductModal();
            }
        });
    }
});
