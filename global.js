// Aplicar dark mode imediatamente (antes do DOMContentLoaded)
// Dark mode sempre ativo - não há modo claro
document.documentElement.classList.add("dark-mode");
document.body.classList.add("dark-mode");

document.addEventListener("DOMContentLoaded", () => {
  // Detect relative prefix depending on nesting level
  const isNested = /\/pages\//.test(window.location.pathname) === false; // pages/ is at repo root under Rua13
  const prefix = isNested ? "." : "..";

  // Mobile menu toggle (if present)
  const closeMenuButton = document.getElementById("botaoFecharMenu");
  const mobileMenuButton = document.querySelector(".mobile-menu-responsivo");
  const mobileMenu = document.querySelector(".menu-mobile-responsivo");

  closeMenuButton?.addEventListener("click", () => {
    if (mobileMenu) mobileMenu.style.display = "none";
  });

  mobileMenuButton?.addEventListener("click", () => {
    if (mobileMenu) mobileMenu.style.display = "block";
  });

  // Ícones do header (sempre dark mode)
  const iconLogin = document.getElementById("icone-login");
  const iconCart = document.getElementById("icone-carrinho");
  const iconSearch = document.getElementById("icone-lupa");
  const logo = document.getElementById("logo-modo");

  function applyIconsForCurrentTheme() {
    // Sempre usar ícones do dark mode (modo claro foi removido)
    if (iconLogin) iconLogin.src = `${prefix}/assets/iconsmodoescuro/login.png`;
    if (iconCart) iconCart.src = `${prefix}/assets/iconsmodoescuro/carrinho-de-compras.png`;
    if (iconSearch) iconSearch.src = `${prefix}/assets/iconsmodoescuro/lupa.png`;
    if (logo) logo.src = `${prefix}/assets/iconsmodoescuro/logomodo.png`;
  }

  // Dark mode sempre ativo - garantir que está aplicado
  if (!document.body.classList.contains("dark-mode")) {
    document.body.classList.add("dark-mode");
  }
  
  applyIconsForCurrentTheme();

  // Accessibility menu (if present)
  const btnAcessibilidade = document.getElementById("btn-acessibilidade");
  const menuAcessibilidade = document.getElementById("menu-acessibilidade");
  btnAcessibilidade?.addEventListener("click", () => {
    menuAcessibilidade?.classList.toggle("ativo");
  });

  document.getElementById('btn-aumentar-fonte')?.addEventListener('click', () => {
    document.body.style.fontSize = 'larger';
  });

  document.getElementById('btn-diminuir-fonte')?.addEventListener('click', () => {
    document.body.style.fontSize = 'smaller';
  });

  // Show logged user (if target elements exist)
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    const divUsuario = document.getElementById("div-usuario");
    const mensagemUsuario = document.getElementById("mensagem-usuario");
    if (divUsuario && mensagemUsuario) {
      mensagemUsuario.textContent = `Bem-vindo, ${usuarioLogado}`;
      divUsuario.style.display = "flex";
    }
  }
});


