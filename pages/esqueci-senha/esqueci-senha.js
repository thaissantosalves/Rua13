// Esqueci a senha — Integrado com Backend
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const byId = (id) => document.getElementById(id);

const toast = new bootstrap.Toast(byId('toast'));
const showToast = (msg, type = 'info') => { 
  byId('toastMsg').textContent = msg; 
  const toastEl = byId('toast');
  toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-info');
  toastEl.classList.add(type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-info');
  toast.show(); 
};

// API Base URL
const API_BASE = '../../Backend/api/recuperar-senha.php';

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
    const email = byId('email').value.trim().toLowerCase();
    
    // Desabilitar botão durante requisição
    const btnSend = byId('btnSendCode');
    btnSend.disabled = true;
    btnSend.textContent = 'Enviando...';
    
    try {
      const response = await fetch(`${API_BASE}?action=solicitar_codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        currentEmail = email;
        byId('hintEmail').textContent = `Enviamos um código para ${email}.`;
        byId('devCode').textContent = data.codigo_dev || '—'; // DEV only - remover em produção
        byId('code').value = '';
        
        startResendTimer();
        setStep(2);
        showToast('Código enviado! Verifique seu e-mail.', 'success');
      } else {
        showToast(data.mensagem || 'Erro ao solicitar código.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
      btnSend.disabled = false;
      btnSend.textContent = 'Enviar código';
    }
    return;
  }

  if (step2Visible){
    const typed = byId('code').value.trim();
    
    if (typed.length !== 6 || !/^\d{6}$/.test(typed)) {
      showToast('Código deve conter 6 dígitos.', 'error');
      return;
    }
    
    // Desabilitar botão durante requisição
    const btnValidate = byId('btnValidateCode');
    btnValidate.disabled = true;
    btnValidate.textContent = 'Validando...';
    
    try {
      const response = await fetch(`${API_BASE}?action=validar_codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: currentEmail,
          codigo: typed
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Armazenar token temporariamente
        sessionStorage.setItem('reset_token', data.token);
        setStep(3);
        showToast('Código validado com sucesso!', 'success');
      } else {
        showToast(data.mensagem || 'Código inválido.', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
      btnValidate.disabled = false;
      btnValidate.textContent = 'Validar código';
    }
    return;
  }

  if (step3Visible){
    const p1 = byId('pass1').value;
    const p2 = byId('pass2').value;
    
    if (p1.length < 6){ 
      showToast('A senha deve ter no mínimo 6 caracteres.', 'error'); 
      return; 
    }
    if (p1 !== p2){ 
      showToast('As senhas não coincidem.', 'error'); 
      return; 
    }
    
    const token = sessionStorage.getItem('reset_token');
    if (!token) {
      showToast('Sessão expirada. Recomece o processo.', 'error');
      setStep(1);
      return;
    }
    
    // Desabilitar botão durante requisição
    const btnSave = byId('btnSave');
    btnSave.disabled = true;
    btnSave.textContent = 'Salvando...';
    
    try {
      const response = await fetch(`${API_BASE}?action=atualizar_senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: currentEmail,
          senha: p1,
          token: token
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        sessionStorage.removeItem('reset_token');
        showToast('Senha atualizada com sucesso! Redirecionando...', 'success');
        setTimeout(() => window.location.assign('../login/login.html'), 1500);
      } else {
        showToast(data.mensagem || 'Erro ao atualizar senha.', 'error');
        btnSave.disabled = false;
        btnSave.textContent = 'Salvar nova senha';
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro de conexão. Tente novamente.', 'error');
      btnSave.disabled = false;
      btnSave.textContent = 'Salvar nova senha';
    }
  }
});

// Voltar para etapa 1
byId('btnBack1').addEventListener('click', () => { setStep(1); });

// Reenviar código
byId('btnResend').addEventListener('click', async () => {
  if (!currentEmail) {
    showToast('Email não encontrado. Recomece o processo.', 'error');
    setStep(1);
    return;
  }
  
  const btnResend = byId('btnResend');
  btnResend.disabled = true;
  btnResend.textContent = 'Enviando...';
  
  try {
    const response = await fetch(`${API_BASE}?action=solicitar_codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: currentEmail })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      byId('devCode').textContent = data.codigo_dev || '—'; // DEV only
      startResendTimer();
      showToast('Novo código enviado!', 'success');
    } else {
      showToast(data.mensagem || 'Erro ao reenviar código.', 'error');
    }
  } catch (error) {
    console.error('Erro:', error);
    showToast('Erro de conexão. Tente novamente.', 'error');
  } finally {
    // O timer vai reabilitar o botão
  }
});

// Mostrar/ocultar senha
byId('toggleShow').addEventListener('change', (e) => {
  const type = e.target.checked ? 'text' : 'password';
  byId('pass1').type = type;
  byId('pass2').type = type;
});

// Estado inicial
setStep(1);

// Limpar token ao carregar a página (caso tenha ficado de sessão anterior)
if (sessionStorage.getItem('reset_token')) {
  // Manter token se estiver na etapa 3, senão limpar
  const step3Visible = !panels[3].classList.contains('d-none');
  if (!step3Visible) {
    sessionStorage.removeItem('reset_token');
  }
}
