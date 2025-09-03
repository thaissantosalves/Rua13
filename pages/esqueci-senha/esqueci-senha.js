// Esqueci a senha — front-only com localStorage + sessionStorage
// No futuro: trocar trechos marcados por chamadas ao teu back.

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const byId = (id) => document.getElementById(id);

const toast = new bootstrap.Toast(byId('toast'));
const showToast = (msg) => { byId('toastMsg').textContent = msg; toast.show(); };

// ------------ Storage "fake" de usuários -------------
const LS_KEY = 'sk_users';
// Estrutura: { "email@dominio": { passHash: "<sha256-hex>", createdAt: 1712345678901 } }

const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; }
  catch { return {}; }
};
const saveUsers = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

// SHA-256 em hex (pra não guardar senha pura)
async function hashSHA256(str){
  if (window.crypto?.subtle) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map(b => b.toString(16).padStart(2,'0')).join('');
  }
  return 'plain:' + str;
}

// ---------- Código de reset: sessionStorage ----------
function setResetCode(email, code, ttlMs=10*60*1000){
  const key = `sk_reset_${email}`;
  sessionStorage.setItem(key, JSON.stringify({ code, exp: Date.now()+ttlMs }));
}
function getResetCode(email){
  const key = `sk_reset_${email}`;
  try {
    const o = JSON.parse(sessionStorage.getItem(key) || '{}');
    if (!o.code || !o.exp) return null;
    if (Date.now() > o.exp) { sessionStorage.removeItem(key); return null; }
    return o;
  } catch { return null; }
}
function clearResetCode(email){
  sessionStorage.removeItem(`sk_reset_${email}`);
}

// -------------- UI: steps ----------------
const panels = {
  1: document.querySelector('[data-step-panel="1"]'),
  2: document.querySelector('[data-step-panel="2"]'),
  3: document.querySelector('[data-step-panel="3"]')
};
const stepDots = $$('.step');

function setStep(n){
  Object.values(panels).forEach(p => p.classList.add('d-none'));
  panels[n]?.classList.remove('d-none');
  stepDots.forEach(dot => dot.classList.toggle('active', +dot.dataset.step === n));
}

let currentEmail = '';
let resendTimer = null;
let resendLeft = 30;

function startResendTimer(){
  const btnResend = byId('btnResend');
  resendLeft = 30;
  btnResend.disabled = true;
  btnResend.textContent = `Reenviar (${resendLeft}s)`;
  resendTimer && clearInterval(resendTimer);
  resendTimer = setInterval(()=>{
    resendLeft--;
    if (resendLeft <= 0){
      clearInterval(resendTimer);
      btnResend.disabled = false;
      btnResend.textContent = 'Reenviar código';
    }else{
      btnResend.textContent = `Reenviar (${resendLeft}s)`;
    }
  }, 1000);
}

// -------------- Binds --------------
const form = byId('resetForm');

// Etapa 1: Enviar código
form.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const step1Visible = !panels[1].classList.contains('d-none');
  const step2Visible = !panels[2].classList.contains('d-none');
  const step3Visible = !panels[3].classList.contains('d-none');

  // força validação Bootstrap do painel atual
  const currentPanel = step1Visible ? panels[1] : step2Visible ? panels[2] : panels[3];
  const inputs = currentPanel.querySelectorAll('input[required]');
  let ok = true;
  inputs.forEach(inp => { if (!inp.checkValidity()) ok = false; });
  if (!ok) { form.classList.add('was-validated'); return; }

  if (step1Visible){
    // verificar se email existe no "cadastro"
    const email = byId('email').value.trim().toLowerCase();
    const users = loadUsers();
    if (!users[email]) {
      showToast('E-mail não encontrado. Crie uma conta antes de recuperar a senha.');
      return;
    }

    currentEmail = email;

    // gerar código (no futuro: back envia por e-mail)
    const code = (''+Math.floor(100000 + Math.random()*900000)).slice(-6);
    setResetCode(currentEmail, code);
    byId('hintEmail').textContent = `Enviamos um código para ${currentEmail}.`;
    byId('devCode').textContent = code; // DEV only
    byId('code').value = '';

    startResendTimer();
    setStep(2);
    showToast('Código enviado (DEV: exibido na tela).');
    return;
  }

  if (step2Visible){
    const typed = byId('code').value.trim();
    const payload = getResetCode(currentEmail);
    if (!payload){
      showToast('Código expirado. Reenvie o código.');
      return;
    }
    if (typed !== payload.code){
      showToast('Código inválido.');
      return;
    }
    setStep(3);
    return;
  }

  if (step3Visible){
    const p1 = byId('pass1').value;
    const p2 = byId('pass2').value;
    if (p1.length < 8){ showToast('Senha muito curta.'); return; }
    if (p1 !== p2){ showToast('As senhas não coincidem.'); return; }

    // salvar nova senha no "cadastro"
    const users = loadUsers();
    if (!users[currentEmail]){ showToast('Sessão inválida. Recomece o processo.'); setStep(1); return; }
    const passHash = await hashSHA256(p1);
    users[currentEmail].passHash = passHash;
    users[currentEmail].updatedAt = Date.now();
    saveUsers(users);
    clearResetCode(currentEmail);

    showToast('Senha atualizada! Redirecionando para o login...');
    setTimeout(() => window.location.assign('/pages/login/login.html'), 1200);
  }
});

// Voltar para etapa 1
byId('btnBack1').addEventListener('click', () => { setStep(1); });

// Reenviar código
byId('btnResend').addEventListener('click', () => {
  const payload = getResetCode(currentEmail);
  const code = (''+Math.floor(100000 + Math.random()*900000)).slice(-6);
  setResetCode(currentEmail, code);
  byId('devCode').textContent = code;
  startResendTimer();
  showToast('Novo código gerado (DEV).');
});

// Mostrar/ocultar senha
byId('toggleShow').addEventListener('change', (e) => {
  const type = e.target.checked ? 'text' : 'password';
  byId('pass1').type = type;
  byId('pass2').type = type;
});

// Estado inicial
setStep(1);

// ----------------- DICA P/ DEV -----------------
// Se ainda não tem cadastro salvo no localStorage, você pode pré-criar:
window.SK_DEV_seedUser = async (email='dev@streetkace.com', senha='12345678')=>{
  const u = loadUsers();
  u[email.toLowerCase()] = { passHash: await hashSHA256(senha), createdAt: Date.now() };
  saveUsers(u);
  console.log('Usuário seed:', email);
};
