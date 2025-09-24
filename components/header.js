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
}

// Auto-inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const headerComponent = new HeaderComponent();
    headerComponent.loadHeader();
});
