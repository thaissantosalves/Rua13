const btnEsquerdo = document.querySelector('.botao-esquerdo');
const btnDireito = document.querySelector('.botao-direito');
const imagens = document.querySelector('.imagens');

let index = 0;
const itens = document.querySelectorAll('.item');
const totalItens = itens.length;
const itemWidth = itens[0].offsetWidth + 20; // largura + margin

btnDireito.addEventListener('click', () => {
  if (index < totalItens - 1) {
    index++;
    imagens.style.transform = `translateX(${-itemWidth * index}px)`;
  }
});

btnEsquerdo.addEventListener('click', () => {
  if (index > 0) {
    index--;
    imagens.style.transform = `translateX(${-itemWidth * index}px)`;
  }
});
