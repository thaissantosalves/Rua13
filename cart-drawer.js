/* StreetKace - Cart Drawer (reuso masculin/feminino) */
(function () {
    const CART_KEY = 'cart';
    const AUTO_OPEN_ON_ADD = false; 
    const SELECTORS = {
      cartIcon: '#icone-carrinho',
      addBtn: '.btn-icon',            
      card: '.card',
      title: '.card-title',
      price: '.price',
      img: 'img.card-img-top'
    };
  
    // ===== Utils
    const fmt = (c) => (c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const parseBRL = (s) => {
      const clean=(s||'').replace(/[^\d,]/g,'').replace(/\./g,'').replace(',','.');
      const v=Math.round(parseFloat(clean||'0')*100); return isNaN(v)?0:v;
    };
    const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); } catch { return []; } };
    const setCart = (arr) => { localStorage.setItem(CART_KEY, JSON.stringify(arr)); updateBadge(arr); };
  
    // ===== Badge no header
    function ensureBadge() {
      const icon = document.querySelector(SELECTORS.cartIcon);
      if (!icon) return null;
      const anchor = icon.closest('a') || icon.parentElement;
      if (anchor) anchor.classList.add('position-relative');
      let badge = anchor?.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge position-absolute translate-middle badge rounded-pill';
        badge.textContent = '0';
        anchor?.appendChild(badge);
      }
      return badge;
    }
    const badgeEl = ensureBadge();
    function updateBadge(arr=getCart()){
      if(!badgeEl) return;
      const total = arr.reduce((acc,i)=>acc+(i.qty||1),0);
      badgeEl.textContent = total;
      badgeEl.style.display = total ? 'inline-block':'none';
    }
  
    // ===== Drawer (offcanvas) - injeta se faltar
    function ensureDrawer() {
      if (document.getElementById('cartDrawer')) return;
      const html = `
  <div class="offcanvas offcanvas-start text-bg-dark" tabindex="-1" id="cartDrawer">
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title">Seu carrinho</h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <ul id="cartItems" class="list-group list-group-flush mb-3"></ul>
      <div class="mt-auto border-top border-secondary pt-3">
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal</span><strong id="cartSubtotal">R$ 0,00</strong>
        </div>
        <div class="d-grid gap-2">
          <a href="/pages/checkout.html" class="btn btn-gradient">Finalizar compra</a>
          <button id="btnClearCart" class="btn btn-outline-light" type="button">Limpar carrinho</button>
        </div>
      </div>
    </div>
  </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    }
    ensureDrawer();
  
    // refs do drawer
    const itemsEl = () => document.getElementById('cartItems');
    const subtotalEl = () => document.getElementById('cartSubtotal');
  
    // ===== Render
    function renderCart(){
      const list = itemsEl(); if(!list) return;
      const cart = getCart();
      list.innerHTML = '';
      if(!cart.length){
        list.innerHTML = '<li class="list-group-item dark">Seu carrinho está vazio.</li>';
        if (subtotalEl()) subtotalEl().textContent = fmt(0);
        return;
      }
      cart.forEach((it,i)=>{
        const li = document.createElement('li');
        li.className = 'list-group-item dark';
        li.innerHTML = `
          <div class="d-flex">
            <img src="${it.img||''}" class="rounded me-3" style="width:56px;height:56px;object-fit:cover" alt="">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <strong>${it.title||''}</strong>
                <button class="btn btn-sm btn-link text-danger" data-action="remove" data-i="${i}" type="button">Remover</button>
              </div>
              ${it.size ? `<div class="small text-secondary">Tamanho: ${it.size}</div>`:''}
              <div class="d-flex align-items-center mt-1">
                <div class="input-group input-group-sm" style="width:130px">
                  <button class="btn btn-outline-light" data-action="minus" data-i="${i}" type="button">−</button>
                  <input class="form-control text-center bg-dark text-light border-secondary" value="${it.qty||1}" readonly>
                  <button class="btn btn-outline-light" data-action="plus" data-i="${i}" type="button">+</button>
                </div>
                <span class="ms-auto fw-semibold">${fmt((it.priceCents||0)*(it.qty||1))}</span>
              </div>
            </div>
          </div>`;
        list.appendChild(li);
      });
      const subtotal = cart.reduce((acc,it)=>acc+(it.priceCents||0)*(it.qty||1),0);
      if (subtotalEl()) subtotalEl().textContent = fmt(subtotal);
    }
  
    // ===== Mutações de carrinho
    function addToCart(product){
      const cart = getCart();
      const keyMatch = (i) => i.title===product.title && (i.size||null)===(product.size||null) && (i.priceCents||0)===(product.priceCents||0);
      const idx = cart.findIndex(keyMatch);
      if(idx>=0) cart[idx].qty = (cart[idx].qty||1)+1;
      else cart.push({ title:product.title, img:product.img, priceCents:product.priceCents, qty:1, size:product.size||null });
      setCart(cart);
      if (AUTO_OPEN_ON_ADD) { renderCart(); openDrawer(); }
    }
    function clearCart(){ setCart([]); renderCart(); }
  
    // ===== Header: abrir drawer
    let drawer;
    function openDrawer(){
      if (!drawer) drawer = new bootstrap.Offcanvas('#cartDrawer');
      renderCart();
      drawer.show();
    }
    const icon = document.querySelector(SELECTORS.cartIcon);
    (icon?.closest('a') || icon)?.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); });
  
    // ===== Delegações globais
    document.addEventListener('click', (e)=>{
      // add de card (btn de ícone)
      const addBtn = e.target.closest(SELECTORS.addBtn);
      if (addBtn) {
        const card = addBtn.closest(SELECTORS.card);
        const product = {
          title: card?.querySelector(SELECTORS.title)?.textContent.trim() || '',
          priceStr: card?.querySelector(SELECTORS.price)?.textContent.trim() || 'R$ 0,00',
          priceCents: parseBRL(card?.querySelector(SELECTORS.price)?.textContent.trim() || 'R$ 0,00'),
          img: card?.querySelector(SELECTORS.img)?.src || '',
          size: null
        };
        addToCart(product);
        return;
      }
  
      // ações dentro do drawer
      const act = e.target.closest('[data-action]');
      if (act && itemsEl()?.contains(act)) {
        const i = +act.dataset.i;
        const cart = getCart();
        const a = act.dataset.action;
        if (a==='plus') cart[i].qty = (cart[i].qty||1)+1;
        if (a==='minus') cart[i].qty = Math.max(1,(cart[i].qty||1)-1);
        if (a==='remove') cart.splice(i,1);
        setCart(cart);
        renderCart();
        return;
      }
  
      // limpar carrinho
      if (e.target.id === 'btnClearCart') { clearCart(); }
    });
  
    // inicializa badge no load
    updateBadge();
  
    // expõe API simples (útil pro modal usar a mesma store)
    window.Cart = {
      add: addToCart,
      get: getCart,
      set: setCart,
      clear: clearCart,
      open: openDrawer,
      render: renderCart,
      fmt
    };
  })();
  