document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  document.getElementById("botaoFecharMenu")?.addEventListener("click", () => {
    document.querySelector(".menu-mobile-responsivo").style.display = "none";
  });

  document.querySelector(".mobile-menu-responsivo")?.addEventListener("click", () => {
    document.querySelector(".menu-mobile-responsivo").style.display = "block";
  });

  // Dark mode
  const botaoDarkMode = document.getElementById("toggle-dark-mode");
  const botaoDarkMenu = document.getElementById("btn-dark-menu");

  const iconeModo = document.getElementById("icone-modo");
  const iconeLogin = document.getElementById("icone-login");
  const iconeCarrinho = document.getElementById("icone-carrinho");
  const iconeLupa = document.getElementById("icone-lupa");
  const logoModo = document.getElementById("logo-modo");

  function trocarIconePorTema(elemento, caminhoClaro, caminhoEscuro) {
    if (!elemento) return;
    const estaNoDark = document.body.classList.contains("dark-mode");
    elemento.src = estaNoDark ? caminhoEscuro : caminhoClaro;
  }

  function toggleDarkMode() {
    const darkAtivo = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", darkAtivo ? "enabled" : "disabled");

    trocarIconePorTema(iconeModo, "imgpaginaprincipal/modoclaro.png", "iconsmodoescuro/modoescuro.png");
    trocarIconePorTema(iconeLogin, "svgheader/login.png", "iconsmodoescuro/login.png");
    trocarIconePorTema(iconeCarrinho, "svgheader/carrinho.png", "iconsmodoescuro/carrinho-de-compras.png");
    trocarIconePorTema(iconeLupa, "svgheader/lupa.png", "iconsmodoescuro/lupa.png");
    trocarIconePorTema(logoModo, "svgheader/logo.png", "iconsmodoescuro/logomodo.png");
  }

  function loadDarkModeSetting() {
    const darkAtivo = localStorage.getItem("darkMode") === "enabled";
    if (darkAtivo) document.body.classList.add("dark-mode");

    trocarIconePorTema(iconeModo, "imgpaginaprincipal/modoclaro.png", "iconsmodoescuro/modoescuro.png");
    trocarIconePorTema(iconeLogin, "svgheader/login.png", "iconsmodoescuro/login.png");
    trocarIconePorTema(iconeCarrinho, "svgheader/carrinho.png", "iconsmodoescuro/carrinho-de-compras.png");
    trocarIconePorTema(iconeLupa, "svgheader/lupa.png", "iconsmodoescuro/lupa.png");
    trocarIconePorTema(logoModo, "svgheader/logo.png", "iconsmodoescuro/logomodo.png");
  }

  loadDarkModeSetting();

  botaoDarkMode?.addEventListener("click", toggleDarkMode);
  botaoDarkMenu?.addEventListener("click", toggleDarkMode);

  // Usuário logado
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    const divUsuario = document.getElementById("div-usuario");
    const mensagemUsuario = document.getElementById("mensagem-usuario");
    mensagemUsuario.textContent = `Bem-vindo, ${usuarioLogado}`;
    divUsuario.style.display = "flex";
  }

  // Acessibilidade
  const botao = document.getElementById('btn-acessibilidade');
  const menu = document.getElementById('menu-acessibilidade');

  botao?.addEventListener('click', () => {
    menu?.classList.toggle('ativo');
  });

  document.getElementById('btn-aumentar-fonte')?.addEventListener('click', () => {
    document.body.style.fontSize = 'larger';
  });

  document.getElementById('btn-diminuir-fonte')?.addEventListener('click', () => {
    document.body.style.fontSize = 'smaller';
  });
});
