// ================= HEADER COMPONENT LOADER =================
class HeaderComponent {
    constructor() {
        this.headerContainer = null;
        this.basePath = this.getBasePath();
    }

    getBasePath() {
        // Determina o caminho base baseado na página atual
        const path = window.location.pathname;
        
        if (path.includes('/pages/cadastro/') || path.includes('/pages/login/')) {
            return '../../';
        } else if (path.includes('/pages/principal/') || path.includes('/pages/masculino/') || path.includes('/pages/feminino/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return './';
    }

    async loadHeader(containerId = 'header-container') {
        try {
            // Busca o componente header
            const response = await fetch(`${this.basePath}components/header.html`);
            const headerHTML = await response.text();
            
            // Aplica os caminhos corretos baseado na página
            const adjustedHTML = this.adjustPaths(headerHTML);
            
            // Insere no container
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = adjustedHTML;
                this.headerContainer = container;
                
                // Inicializa funcionalidades do header
                this.initHeaderFunctionality();
            } else {
                console.error('Container do header não encontrado:', containerId);
            }
        } catch (error) {
            console.error('Erro ao carregar header:', error);
        }
    }

    adjustPaths(html) {
        // Ajusta os caminhos das imagens baseado na página atual
        let adjustedHTML = html;
        
        // Substitui caminhos relativos pelos corretos
        adjustedHTML = adjustedHTML.replace(/src="\.\.\/\.\.\/assets\//g, `src="${this.basePath}assets/`);
        adjustedHTML = adjustedHTML.replace(/href="\.\.\/\.\.\/pages\//g, `href="${this.basePath}pages/`);
        adjustedHTML = adjustedHTML.replace(/href="\.\.\/pages\//g, `href="${this.basePath}pages/`);
        
        return adjustedHTML;
    }

    initHeaderFunctionality() {
        // Inicializa funcionalidades do header como menu mobile, etc.
        this.initMobileMenu();
        this.initThemeToggle();
        this.initCartFunctionality();
        this.initUserInterface();
    }

    initMobileMenu() {
        // Adicionar estilos CSS para o menu mobile
        this.addMobileStyles();
        
        const mobileMenuBtn = document.querySelector('.mobile-menu-responsivo');
        const mobileMenu = document.querySelector('.menu-mobile-responsivo');
        const closeBtn = document.getElementById('botaoFecharMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }

        if (closeBtn && mobileMenu) {
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        }
    }

    addMobileStyles() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('mobile-menu-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'mobile-menu-styles';
        style.textContent = `
            /* ====== MENU MOBILE ====== */
            .mobile-menu-responsivo {
                display: none;
                flex-direction: column;
                cursor: pointer;
                padding: 10px;
                position: absolute;
                right: 20px;
                top: 20px;
                z-index: 1001;
            }

            .mobile-menu-responsivo .line1,
            .mobile-menu-responsivo .line2,
            .mobile-menu-responsivo .line3 {
                width: 25px;
                height: 3px;
                background-color: #fff;
                margin: 3px 0;
                transition: 0.3s;
            }

            .mobile-menu-responsivo.active .line1 {
                transform: rotate(-45deg) translate(-5px, 6px);
            }

            .mobile-menu-responsivo.active .line2 {
                opacity: 0;
            }

            .mobile-menu-responsivo.active .line3 {
                transform: rotate(45deg) translate(-5px, -6px);
            }

            .menu-mobile-responsivo {
                display: none;
                position: fixed;
                top: 0;
                right: -300px;
                width: 300px;
                height: 100vh;
                background-color: #181818;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
                transition: right 0.3s ease;
                z-index: 1000;
                padding: 60px 20px 20px;
            }

            .menu-mobile-responsivo.active {
                right: 0;
            }

            .menu-mobile-responsivo .nav-menu-mobile .nav-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .menu-mobile-responsivo .nav-menu-mobile .nav-list li a {
                display: flex;
                align-items: center;
                gap: 15px;
                color: #fff;
                text-decoration: none;
                font-size: 18px;
                padding: 10px;
                border-radius: 8px;
                transition: background-color 0.3s;
            }

            .menu-mobile-responsivo .nav-menu-mobile .nav-list li a:hover {
                background-color: #333;
            }

            .menu-mobile-responsivo .nav-menu-mobile .nav-list li a img {
                width: 24px;
                height: 24px;
            }

            #botaoFecharMenu {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 10px;
            }

            #botaoFecharMenu img {
                width: 24px;
                height: 24px;
            }

            @media (max-width: 768px) {
                .mobile-menu-responsivo {
                    display: flex;
                }
                
                .header-principal .nav-menu,
                .nav-roupas {
                    display: none;
                }
            }

            /* ====== USER INTERFACE ====== */
            .user-dropdown-btn {
                color: #fff !important;
                text-decoration: none !important;
                border: none !important;
                background: none !important;
                padding: 8px 12px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }

            .user-dropdown-btn:hover {
                background-color: rgba(255, 255, 255, 0.1) !important;
                border-radius: 6px !important;
            }

            .user-dropdown-btn::after {
                border-top-color: #fff !important;
                margin-left: 8px !important;
            }

            .dropdown-menu {
                background-color: #181818 !important;
                border: 1px solid #333 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            }

            .dropdown-item {
                color: #fff !important;
                padding: 10px 16px !important;
                display: flex !important;
                align-items: center !important;
            }

            .dropdown-item:hover {
                background-color: #333 !important;
                color: #fff !important;
            }

            .dropdown-header {
                color: #ccc !important;
                font-size: 0.85rem !important;
                font-weight: 500 !important;
                padding: 8px 16px 4px !important;
            }

            .dropdown-divider {
                border-color: #333 !important;
                margin: 8px 0 !important;
            }

            .dropdown-item.text-danger:hover {
                background-color: rgba(220, 53, 69, 0.1) !important;
                color: #dc3545 !important;
            }

            #user-name {
                font-weight: 500;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .user-dropdown-btn {
                    padding: 6px 8px !important;
                    font-size: 0.85rem !important;
                }
                
                #user-name {
                    display: none;
                }
            }
            
            /* ====== LIGHT MODE STYLES ====== */
            body:not(.dark-mode) .mobile-menu-responsivo .line1,
            body:not(.dark-mode) .mobile-menu-responsivo .line2,
            body:not(.dark-mode) .mobile-menu-responsivo .line3 {
                background-color: #333;
            }
            
            body:not(.dark-mode) .menu-mobile-responsivo {
                background-color: #fff;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            }
            
            body:not(.dark-mode) .menu-mobile-responsivo .nav-menu-mobile .nav-list li a {
                color: #333;
            }
            
            body:not(.dark-mode) .menu-mobile-responsivo .nav-menu-mobile .nav-list li a:hover {
                background-color: #f0f0f0;
            }
            
            body:not(.dark-mode) .menu-mobile-responsivo .nav-menu-mobile .nav-list li a img {
                filter: brightness(0);
            }
            
            body:not(.dark-mode) .user-dropdown-btn {
                color: #333 !important;
            }
            
            body:not(.dark-mode) .user-dropdown-btn:hover {
                background-color: rgba(0, 0, 0, 0.05) !important;
            }
            
            body:not(.dark-mode) .user-dropdown-btn::after {
                border-top-color: #333 !important;
            }
            
            body:not(.dark-mode) .dropdown-menu {
                background-color: #fff !important;
                border: 1px solid #e0e0e0 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            }
            
            body:not(.dark-mode) .dropdown-item {
                color: #333 !important;
            }
            
            body:not(.dark-mode) .dropdown-item:hover {
                background-color: #f5f5f5 !important;
                color: #333 !important;
            }
            
            body:not(.dark-mode) .dropdown-header {
                color: #666 !important;
            }
            
            body:not(.dark-mode) .dropdown-divider {
                border-color: #e0e0e0 !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    initThemeToggle() {
        // Inicializa funcionalidades de tema se existirem
        if (typeof applyIconsForCurrentTheme === 'function') {
            applyIconsForCurrentTheme();
        }
    }

    initCartFunctionality() {
        // Aguarda o carrinho ser carregado
        setTimeout(() => {
            if (window.Cart) {
                // Atualiza o badge do carrinho
                window.Cart.updateBadge = window.Cart.updateBadge || (() => {
                    const cart = window.Cart.get();
                    const total = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
                    const badge = document.querySelector('.cart-badge');
                    if (badge) {
                        badge.textContent = total;
                        badge.style.display = total > 0 ? 'inline-block' : 'none';
                    }
                });
                
                // Inicializa o badge
                window.Cart.updateBadge();
                
                // Conecta o ícone do carrinho no header componentizado
                const cartIcon = document.querySelector('#icone-carrinho');
                if (cartIcon) {
                    const cartLink = cartIcon.closest('a') || cartIcon.parentElement;
                    if (cartLink) {
                        cartLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.Cart.open();
                        });
                    }
                }
            }
        }, 100);
    }

    initUserInterface() {
        // Verifica se há usuário logado
        this.checkUserLoginState();
        
        // Configura eventos do dropdown
        this.setupUserDropdownEvents();
    }

    checkUserLoginState() {
        const userData = this.getUserData();
        
        if (userData && userData.nome) {
            this.showUserInterface(userData);
        } else {
            this.showLoginInterface();
        }
    }

    getUserData() {
        // Tenta buscar dados do usuário do localStorage ou sessionStorage
        try {
            const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erro ao recuperar dados do usuário:', error);
            return null;
        }
    }

    showUserInterface(userData) {
        // Esconde ícone de login
        const loginContainer = document.getElementById('login-icon-container');
        const mobileLoginContainer = document.getElementById('mobile-login-container');
        
        if (loginContainer) loginContainer.style.display = 'none';
        if (mobileLoginContainer) mobileLoginContainer.style.display = 'none';

        // Mostra interface do usuário
        const userContainer = document.getElementById('user-dropdown-container');
        const mobileUserContainer = document.getElementById('mobile-user-container');
        
        if (userContainer) userContainer.style.display = 'block';
        if (mobileUserContainer) mobileUserContainer.style.display = 'block';

        // Atualiza dados do usuário
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const mobileUserName = document.getElementById('mobile-user-name');

        if (userName) userName.textContent = userData.nome;
        if (userEmail) userEmail.textContent = userData.email;
        if (mobileUserName) mobileUserName.textContent = userData.nome;
    }

    showLoginInterface() {
        // Esconde interface do usuário
        const userContainer = document.getElementById('user-dropdown-container');
        const mobileUserContainer = document.getElementById('mobile-user-container');
        
        if (userContainer) userContainer.style.display = 'none';
        if (mobileUserContainer) mobileUserContainer.style.display = 'none';

        // Mostra ícone de login
        const loginContainer = document.getElementById('login-icon-container');
        const mobileLoginContainer = document.getElementById('mobile-login-container');
        
        if (loginContainer) loginContainer.style.display = 'block';
        if (mobileLoginContainer) mobileLoginContainer.style.display = 'block';
    }

    setupUserDropdownEvents() {
        // Evento de logout
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logoutUser();
            });
        }

        // Eventos dos links do dropdown
        const profileLink = document.getElementById('profile-link');
        const ordersLink = document.getElementById('orders-link');
        const settingsLink = document.getElementById('settings-link');

        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade de perfil em desenvolvimento!');
            });
        }

        if (ordersLink) {
            ordersLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade de pedidos em desenvolvimento!');
            });
        }

        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade de configurações em desenvolvimento!');
            });
        }
    }

    logoutUser() {
        // Remove dados do usuário
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        
        // Volta para interface de login
        this.showLoginInterface();
        
        // Redireciona para página inicial
        window.location.href = '../principal/principal.html';
    }

    // Método público para atualizar interface após login
    updateUserInterface(userData) {
        if (userData) {
            // Salva dados do usuário
            localStorage.setItem('userData', JSON.stringify(userData));
            this.showUserInterface(userData);
        } else {
            this.showLoginInterface();
        }
    }
}

// Auto-inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const headerComponent = new HeaderComponent();
    headerComponent.loadHeader();
});
