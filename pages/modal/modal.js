// modal.js (ESM)
let bootstrapModal, toastOk;
const ids = (id) => document.getElementById(id);

const parseBRLToCents = (s) => {
    const clean = (s || '').replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.');
    const v = Math.round(parseFloat(clean || '0') * 100);
    return isNaN(v) ? 0 : v;
};
const fmt = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Estado
let current = { title: '', priceCents: 0, img: '' };
let freteCents = 1990;
const FRETE_PADRAO = 1990;
const FRETE_GRATIS_MIN = 39900;

// bind inicial (uma vez)
function bindOnce() {
    // radios pagamento
    const payCard = ids('payCard');
    ['payPix', 'payCard', 'payBoleto'].forEach(k => {
        ids(k)?.addEventListener('change', () => {
            ids('cardForm').classList.toggle('d-none', !payCard.checked);
        });
    });

    // qty
    ids('qtyMinus').addEventListener('click', () => { setQty(Math.max(1, getQty() - 1)); });
    ids('qtyPlus').addEventListener('click', () => { setQty(Math.min(10, getQty() + 1)); });
    ids('qtyInput').addEventListener('input', () => {
        let v = parseInt(ids('qtyInput').value || '1', 10);
        if (isNaN(v) || v < 1) v = 1; if (v > 10) v = 10; setQty(v);
    });

    // frete
    ids('calcFrete').addEventListener('click', calcFrete);

    // ações
    ids('btnAddCart').addEventListener('click', addToCart);
    ids('btnCheckout').addEventListener('click', checkout);

    // bootstrap refs
    bootstrapModal = new bootstrap.Modal(ids('comprarModal'));
    toastOk = new bootstrap.Toast(ids('toastOk'));
}

function getQty() { return +ids('qtyInput').value || 1; }
function setQty(v) { ids('qtyInput').value = v; updateTotals(); }

function calcFrete() {
    const subtotal = current.priceCents * getQty();
    freteCents = subtotal >= FRETE_GRATIS_MIN ? 0 : FRETE_PADRAO;
    ids('freteInfo').textContent = freteCents === 0 ? 'Frete GRÁTIS aplicado.' : 'Frete padrão R$ 19,90.';
    updateTotals();
}

function updateTotals() {
    const subtotal = current.priceCents * getQty();
    // regra grátis automática
    const autoFrete = subtotal >= FRETE_GRATIS_MIN ? 0 : freteCents;
    ids('subtotalText').textContent = fmt(subtotal);
    ids('freteText').textContent = fmt(autoFrete);
    ids('totalText').textContent = fmt(subtotal + autoFrete);
}

function addToCart() {
    const size = (document.querySelector('input[name="size"]:checked') || {}).value;
    if (!size) { ids('sizeWarn').classList.remove('d-none'); return; }
    const item = { title: current.title, priceCents: current.priceCents, img: current.img, size, qty: getQty() };
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        ids('toastMsg').textContent = 'Item adicionado ao carrinho.';
        toastOk.show();
    } catch (e) {
        ids('toastMsg').textContent = 'Falha ao adicionar ao carrinho.';
        toastOk.show();
    }
}

function checkout() {
    const size = (document.querySelector('input[name="size"]:checked') || {}).value;
    if (!size) { ids('sizeWarn').classList.remove('d-none'); return; }
    if (ids('payCard').checked) {
        const ok = ids('ccName').value && ids('ccNumber').value && ids('ccExp').value && ids('ccCvv').value;
        if (!ok) { ids('toastMsg').textContent = 'Preencha os dados do cartão.'; toastOk.show(); return; }
    }
    ids('toastMsg').textContent = 'Pedido criado! Confira seu e-mail.';
    toastOk.show();
    bootstrapModal.hide();
}

export function openComprarModal(product) {
    // primeira carga: bind
    if (!bootstrapModal) { bindOnce(); }

    // set produto
    current = {
        title: product.title || '',
        priceCents: parseBRLToCents(product.priceStr || 'R$ 0,00'),
        img: product.img || ''
    };
    freteCents = FRETE_PADRAO;

    ids('modalProductTitle').textContent = current.title;
    ids('modalProductPrice').textContent = product.priceStr || 'R$ 0,00';
    const img = ids('modalProductImage'); img.src = current.img; img.alt = current.title;

    // reset UI
    document.querySelectorAll('input[name="size"]').forEach(r => r.checked = false);
    ids('sizeWarn').classList.add('d-none');
    setQty(1);
    ids('cepInput').value = '';
    ids('freteInfo').innerHTML = 'Frete padrão R$ 19,90. <span class="text-hot fw-semibold">Grátis acima de R$ 399,00</span>.';
    ids('cardForm').classList.toggle('d-none', !ids('payCard').checked);

    updateTotals();
    bootstrapModal.show();
}
