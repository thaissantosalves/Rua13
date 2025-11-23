// Aplicar dark mode e tamanho de fonte imediatamente (antes do DOMContentLoaded)
// Dark mode é o padrão
(function() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-mode");
    if (document.body) {
      document.body.classList.add("dark-mode");
    }
  } else {
    document.documentElement.classList.add("light-mode");
    if (document.body) {
      document.body.classList.add("light-mode");
    }
  }
  
  // Aplicar tamanho de fonte salvo
  const savedFontSize = localStorage.getItem("fontSize") || "default";
  if (savedFontSize === "medium") {
    document.documentElement.classList.add("font-size-medium");
  } else if (savedFontSize === "large") {
    document.documentElement.classList.add("font-size-large");
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

  // Ícones do header
  const iconLogin = document.getElementById("icone-login");
  const iconCart = document.getElementById("icone-carrinho");
  const iconSearch = document.getElementById("icone-lupa");
  const logo = document.getElementById("logo-modo");

  function applyIconsForCurrentTheme() {
    const isDark = document.body.classList.contains("dark-mode");
    // Por enquanto, sempre usar ícones do dark mode (pode ser ajustado depois)
    if (iconLogin) iconLogin.src = `${prefix}/assets/iconsmodoescuro/login.png`;
    if (iconCart) iconCart.src = `${prefix}/assets/iconsmodoescuro/carrinho-de-compras.png`;
    if (iconSearch) iconSearch.src = `${prefix}/assets/iconsmodoescuro/lupa.png`;
    if (logo) logo.src = `${prefix}/assets/iconsmodoescuro/logomodo.png`;
  }

  // Garantir que o tema está aplicado
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "dark") {
    document.documentElement.classList.remove("light-mode");
    document.body.classList.remove("light-mode");
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
    document.body.classList.remove("dark-mode");
    document.documentElement.classList.add("light-mode");
    document.body.classList.add("light-mode");
  }
  
  applyIconsForCurrentTheme();

  // Theme toggle functionality
  let themeToggleInitialized = false;
  
  function updateThemeIcon() {
    const themeIcon = document.getElementById("theme-icon");
    if (!document.body || !themeIcon) return;
    
    const isDark = document.body.classList.contains("dark-mode");
    themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  function toggleTheme() {
    if (!document.body) {
      console.error("Body not available");
      return;
    }
    
    const isDark = document.body.classList.contains("dark-mode");
    console.log("Current theme is dark:", isDark);
    
    // Remover todas as classes primeiro
    document.documentElement.classList.remove("dark-mode", "light-mode");
    document.body.classList.remove("dark-mode", "light-mode");
    
    if (isDark) {
      // Mudar para light mode
      document.documentElement.classList.add("light-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      console.log("Switched to LIGHT mode");
      console.log("HTML classes:", document.documentElement.className);
      console.log("Body classes:", document.body.className);
    } else {
      // Mudar para dark mode
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      console.log("Switched to DARK mode");
      console.log("HTML classes:", document.documentElement.className);
      console.log("Body classes:", document.body.className);
    }
    
    updateThemeIcon();
    applyIconsForCurrentTheme();
  }

  // Usar apenas delegação de eventos (mais confiável)
  if (!themeToggleInitialized) {
    document.addEventListener("click", function themeToggleHandler(e) {
      // Verificar se o clique foi no botão ou no ícone dentro dele
      const themeToggleBtn = e.target.closest("#theme-toggle-btn");
      const themeIcon = e.target.closest("#theme-icon");
      
      if (themeToggleBtn || themeIcon) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Theme toggle clicked!");
        toggleTheme();
      }
    }, true); // Usar capture phase para garantir que seja executado
    
    themeToggleInitialized = true;
  }

  // Inicializar o ícone do tema
  updateThemeIcon();
  
  // Tentar novamente após um delay para garantir que o ícone seja atualizado
  setTimeout(updateThemeIcon, 100);

  // Font Size Toggle functionality
  function updateFontSizeIcon() {
    const fontSizeIcon = document.getElementById("font-size-icon");
    if (!fontSizeIcon) return;
    
    const currentSize = localStorage.getItem("fontSize") || "default";
    // Ícone muda conforme o tamanho atual
    if (currentSize === "medium") {
      fontSizeIcon.className = "fa-solid fa-text-height";
      fontSizeIcon.title = "Tamanho médio ativo (125%) - Clique para aumentar";
    } else if (currentSize === "large") {
      fontSizeIcon.className = "fa-solid fa-text-height";
      fontSizeIcon.title = "Tamanho grande ativo (150%) - Clique para voltar ao padrão";
    } else {
      fontSizeIcon.className = "fa-solid fa-text-height";
      fontSizeIcon.title = "Tamanho padrão (100%) - Clique para aumentar";
    }
  }

  function toggleFontSize() {
    const currentSize = localStorage.getItem("fontSize") || "default";
    
    // Remover todas as classes primeiro
    document.documentElement.classList.remove("font-size-medium", "font-size-large");
    
    // Alternar: padrão -> médio -> grande -> padrão
    if (currentSize === "default") {
      document.documentElement.classList.add("font-size-medium");
      localStorage.setItem("fontSize", "medium");
      console.log("Font size changed to MEDIUM (125%)");
    } else if (currentSize === "medium") {
      document.documentElement.classList.add("font-size-large");
      localStorage.setItem("fontSize", "large");
      console.log("Font size changed to LARGE (150%)");
    } else {
      localStorage.setItem("fontSize", "default");
      console.log("Font size changed to DEFAULT (100%)");
    }
    
    updateFontSizeIcon();
  }

  // Listener para o botão de tamanho de fonte
  document.addEventListener("click", function fontSizeToggleHandler(e) {
    const fontSizeBtn = e.target.closest("#font-size-btn");
    const fontSizeIcon = e.target.closest("#font-size-icon");
    
    if (fontSizeBtn || fontSizeIcon) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Font size toggle clicked!");
      toggleFontSize();
    }
  }, true);

  // Inicializar o ícone do tamanho de fonte
  updateFontSizeIcon();
  setTimeout(updateFontSizeIcon, 100);

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


