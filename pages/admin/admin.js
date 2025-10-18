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
        loadUsers();
    } else if (tabName === 'logs') {
        loadLogs();
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
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Carregando usuários...
                </div>
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch('../../Backend/api/admin-users.php');
        const data = await response.json();
        
        if (data.status === 'success') {
            displayUsers(data.users);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
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
                <td colspan="6" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erro de conexão
                </td>
            </tr>
        `;
    }
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
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id_usuario}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge bg-primary">
                    Cliente
                </span>
            </td>
            <td>${formatDate(user.criado_em)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="showDeleteModal(${user.id_usuario}, '${user.nome}', '${user.email}')">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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
            loadUsers(); // Reload users list
            loadStats(); // Reload stats
        } else {
            alert('Erro ao excluir usuário: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro de conexão ao excluir usuário');
    }
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

// Refresh current tab data every 60 seconds
setInterval(() => {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        if (activeTab.id === 'users-tab') {
            loadUsers();
        } else if (activeTab.id === 'logs-tab') {
            loadLogs();
        }
    }
}, 60000);
