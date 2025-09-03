document.addEventListener('DOMContentLoaded', () => {
  // Add to cart buttons
  document.querySelectorAll('.item-roupa .botao-comprar').forEach((button) => {
    button.addEventListener('click', (event) => {
      const container = event.currentTarget.closest('.item-roupa');
      if (!container) return;
      const name = container.querySelector('.descricao')?.textContent?.trim();
      const price = container.querySelector('.preco')?.textContent?.trim();
      if (!name || !price) return;

      const product = { nome: name, preco: price };

      const cart = JSON.parse(localStorage.getItem('carrinho')) || [];
      cart.push(product);
      localStorage.setItem('carrinho', JSON.stringify(cart));

      // Feedback message
      let message = container.querySelector('.mensagem-sucesso');
      if (!message) {
        message = document.createElement('p');
        message.classList.add('mensagem-sucesso');
        container.appendChild(message);
      }
      message.textContent = 'Produto adicionado ao carrinho!';
      message.style.color = 'green';
      setTimeout(() => {
        if (message) message.textContent = '';
      }, 2000);

      // Update modal if visible
      const modal = document.getElementById('carrinho-modal');
      if (modal && modal.style.display === 'block') {
        updateCartModal();
      }
    });
  });

  // Open cart modal when clicking cart icons in header (href="#")
  const cartIcons = document.querySelectorAll('a[href="#"] img[alt="carrinho"]');
  cartIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('carrinho-modal');
      if (!modal) return;
      updateCartModal();
      modal.style.display = 'block';
    });
  });

  // Close cart modal
  document.querySelector('.fechar-carrinho')?.addEventListener('click', () => {
    const modal = document.getElementById('carrinho-modal');
    if (modal) modal.style.display = 'none';
  });

  // Clear cart
  document.getElementById('limpar-carrinho')?.addEventListener('click', () => {
    localStorage.removeItem('carrinho');
    const list = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total-carrinho');
    if (list) list.innerHTML = '<li>Seu carrinho está vazio.</li>';
    if (totalElement) totalElement.textContent = '';
    setTimeout(() => {
      const modal = document.getElementById('carrinho-modal');
      if (modal) modal.style.display = 'none';
    }, 1000);
  });

  function updateCartModal() {
    const modal = document.getElementById('carrinho-modal');
    const list = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total-carrinho');
    if (!modal || !list) return;

    const cart = JSON.parse(localStorage.getItem('carrinho')) || [];
    list.innerHTML = '';
    if (cart.length === 0) {
      list.innerHTML = '<li>Seu carrinho está vazio.</li>';
      if (totalElement) totalElement.textContent = '';
      return;
    }

    let total = 0;
    cart.forEach((product) => {
      const item = document.createElement('li');
      item.textContent = `${product.nome} - ${product.preco}`;
      list.appendChild(item);
      const value = parseFloat(product.preco.replace('R$', '').replace('.', '').replace(',', '.').trim());
      if (!Number.isNaN(value)) total += value;
    });
    if (totalElement) totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
  }
});


