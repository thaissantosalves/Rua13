// Dark mode
document.addEventListener('DOMContentLoaded', () => {
  const botaoDarkMode = document.getElementById('toggle-dark-mode');
  const iconeLogin = document.getElementById('icone-login');
  const iconeCarrinho = document.getElementById('icone-carrinho');
  const iconeLupa = document.getElementById('icone-lupa');
  const logoModo = document.getElementById('logo-modo')

  function trocarIconePorTema(elemento, caminhoClaro, caminhoEscuro) {
    const estaNoDark = document.body.classList.contains('dark-mode');
    elemento.src = estaNoDark ? caminhoEscuro : caminhoClaro;
  }

  function toggleDarkMode() {
    const darkAtivo = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkAtivo ? 'enabled' : 'disabled');

    trocarIconePorTema(iconeLogin, '../svgheader/login.png', '../iconsmodoescuro/login.png');
    trocarIconePorTema(iconeCarrinho, '../svgheader/carrinho.png', '../iconsmodoescuro/carrinho-de-compras.png');
    trocarIconePorTema(iconeLupa, '../svgheader/lupa.png', '../iconsmodoescuro/lupa.png');
    trocarIconePorTema(logoModo, '../svgheader/logo.png', '../iconsmodoescuro/logomodo.png');
  }

  function loadDarkModeSetting() {
    const darkAtivo = localStorage.getItem('darkMode') === 'enabled';
    if (darkAtivo) document.body.classList.add('dark-mode');

    trocarIconePorTema(iconeLogin, '../svgheader/login.png', '../iconsmodoescuro/login.png');
    trocarIconePorTema(iconeCarrinho, '../svgheader/carrinho.png', '../iconsmodoescuro/carrinho-de-compras.png');
    trocarIconePorTema(iconeLupa, '../svgheader/lupa.png', '../iconsmodoescuro/lupa.png');
    trocarIconePorTema(logoModo, '../svgheader/logo.png', '../iconsmodoescuro/logomodo.png');
  }

  loadDarkModeSetting();
  botaoDarkMode.addEventListener('click', toggleDarkMode);
});