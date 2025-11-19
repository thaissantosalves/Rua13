// Aplicar dark mode imediatamente (antes do DOMContentLoaded)
(function() {
  const savedTheme = localStorage.getItem("darkMode");
  // Dark mode é sempre o padrão - apenas usar light mode se explicitamente desabilitado
  if (savedTheme !== "disabled") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
    // Garantir que localStorage reflita dark mode como padrão
    if (savedTheme !== "enabled") {
      localStorage.setItem("darkMode", "enabled");
    }
  }
})();

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

  // Dark mode + icon swap (if buttons exist)
  const btnDarkMode = document.getElementById("toggle-dark-mode");
  const btnDarkMenu = document.getElementById("btn-dark-menu");

  const iconLogin = document.getElementById("icone-login");
  const iconCart = document.getElementById("icone-carrinho");
  const iconSearch = document.getElementById("icone-lupa");
  const logo = document.getElementById("logo-modo");

  function swapIconByTheme(element, lightPath, darkPath) {
    if (!element) return;
    const isDark = document.body.classList.contains("dark-mode");
    element.src = isDark ? darkPath : lightPath;
  }

  function applyIconsForCurrentTheme() {
    swapIconByTheme(iconLogin, `${prefix}/svgheader/login.png`, `${prefix}/assets/iconsmodoescuro/login.png`);
    swapIconByTheme(iconCart, `${prefix}/svgheader/carrinho.png`, `${prefix}/assets/iconsmodoescuro/carrinho-de-compras.png`);
    swapIconByTheme(iconSearch, `${prefix}/svgheader/lupa.png`, `${prefix}/assets/iconsmodoescuro/lupa.png`);
    swapIconByTheme(logo, `${prefix}/svgheader/logo.png`, `${prefix}/assets/iconsmodoescuro/logomodo.png`);
  }

  function toggleDarkMode() {
    const enabled = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
    applyIconsForCurrentTheme();
    updateFooterButton();
  }

  // Function to update footer button text and icon based on current theme
  function updateFooterButton() {
    const btnLightModeFooter = document.getElementById("btn-light-mode-footer");
    if (!btnLightModeFooter) return;
    
    const isDark = document.body.classList.contains("dark-mode");
    const icon = btnLightModeFooter.querySelector("i");
    const span = btnLightModeFooter.querySelector("span");
    
    if (isDark) {
      // Currently dark mode, button should say "Modo Claro"
      if (icon) icon.className = "fas fa-sun";
      if (span) span.textContent = "Modo Claro";
      btnLightModeFooter.title = "Ativar Modo Claro";
    } else {
      // Currently light mode, button should say "Modo Escuro"
      if (icon) icon.className = "fas fa-moon";
      if (span) span.textContent = "Modo Escuro";
      btnLightModeFooter.title = "Ativar Modo Escuro";
    }
  }

  // Dark mode já foi aplicado antes do DOMContentLoaded
  // Apenas garantir que está sincronizado e aplicar ícones
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme !== "disabled" && !document.body.classList.contains("dark-mode")) {
    document.body.classList.add("dark-mode");
  }
  
  applyIconsForCurrentTheme();
  updateFooterButton();

  btnDarkMode?.addEventListener("click", toggleDarkMode);
  btnDarkMenu?.addEventListener("click", toggleDarkMode);
  
  // Light/Dark mode toggle button in footer
  const btnLightModeFooter = document.getElementById("btn-light-mode-footer");
  btnLightModeFooter?.addEventListener("click", toggleDarkMode);

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


