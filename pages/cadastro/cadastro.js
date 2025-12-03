// ===== Helpers máscara/validação leve =====
const onlyDigits = s => (s || '').replace(/\D+/g,'');
const maskCPF = v => {
  v = onlyDigits(v).slice(0,11);
  return v
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};
const maskCEP = v => {
  v = onlyDigits(v).slice(0,8);
  return v.replace(/^(\d{5})(\d)/, '$1-$2');
};
const maskPhone = v => {
  v = onlyDigits(v).slice(0,11);
  if (v.length <= 10) {
    return v
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return v
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

// ===== ViaCEP Integration =====
const buscarCEP = async (cep) => {
  const cepLimpo = onlyDigits(cep);
  
  if (cepLimpo.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      endereco: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

const preencherEndereco = (dados) => {
  if (dados) {
    document.getElementById('endereco').value = dados.endereco || '';
    document.getElementById('bairro').value = dados.bairro || '';
    document.getElementById('cidade').value = dados.cidade || '';
    document.getElementById('estado').value = dados.estado || '';
  }
};

const mostrarLoadingCEP = (mostrar) => {
  const cepInput = document.getElementById('cep');
  const cepGroup = cepInput.closest('.col-12');
  
  if (mostrar) {
    // Remover loading anterior se existir
    const loadingAnterior = cepGroup.querySelector('.cep-loading');
    if (loadingAnterior) loadingAnterior.remove();
    
    // Adicionar loading
    const loading = document.createElement('div');
    loading.className = 'cep-loading';
    loading.innerHTML = '<small class="text-info"><i class="spinner-border spinner-border-sm me-1"></i>Buscando CEP...</small>';
    cepGroup.appendChild(loading);
  } else {
    // Remover loading
    const loading = cepGroup.querySelector('.cep-loading');
    if (loading) loading.remove();
  }
};

const cpfValido = v => {
  // validação simples: 11 dígitos e não tudo igual
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  // dígitos verificadores
  const calc = n => {
    let s=0; for (let i=0;i<n;i++) s += parseInt(d[i]) * (n+1-i);
    const r = (s*10)%11; return r===10?0:r;
  };
  return calc(9)===parseInt(d[9]) && calc(10)===parseInt(d[10]);
};

// ===== Wizard =====
const form = document.getElementById('formCadastro');
const steps = Array.from(document.querySelectorAll('.step'));
const stepper = document.getElementById('stepper').children;
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const reviewList = document.getElementById('reviewList');

let current = 0;

function showStep(i){
  steps.forEach((s,idx)=> s.classList.toggle('d-none', idx!==i));
  Array.from(stepper).forEach((li,idx)=>{
    li.classList.toggle('active', idx<=i);
  });
  btnPrev.disabled = i===0;
  btnNext.classList.toggle('d-none', i===steps.length-1);
  btnSubmit.classList.toggle('d-none', i!==steps.length-1);

  if(i===steps.length-1){ // montar revisão
    const data = new FormData(form);
    const lines = [];
    
    // Mapear nomes dos campos para exibição
    const fieldNames = {
      'nome': 'Nome Completo',
      'dataNascimento': 'Data de Nascimento',
      'sexo': 'Sexo',
      'nomeMaterno': 'Nome Materno',
      'cpf': 'CPF',
      'email': 'E-mail',
      'telefoneCelular': 'Celular',
      'telefoneFixo': 'Telefone Fixo',
      'cep': 'CEP',
      'endereco': 'Endereço',
      'numero': 'Número',
      'bairro': 'Bairro',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'login': 'Login',
      'pergunta1': 'Pergunta de Segurança 1',
      'resposta1': 'Resposta 1',
      'pergunta2': 'Pergunta de Segurança 2',
      'resposta2': 'Resposta 2'
    };
    
    for (const [k,v] of data.entries()){
      if(!v) continue;
      if(['senha1','senha2','termos'].includes(k)) continue;
      
      const fieldName = fieldNames[k] || k;
      let displayValue = v;
      
      // Formatação especial para alguns campos
      if (k === 'dataNascimento') {
        displayValue = new Date(v).toLocaleDateString('pt-BR');
      } else if (k === 'cpf') {
        displayValue = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (k === 'cep') {
        displayValue = v.replace(/(\d{5})(\d{3})/, '$1-$2');
      }
      
      lines.push(`<div class="mb-1"><span class="text-secondary">${fieldName}:</span> <strong>${displayValue}</strong></div>`);
    }
    reviewList.innerHTML = lines.join('');
  }
}

function validateCurrent(){
  // valida só campos visíveis
  let ok = true;
  const section = steps[current];
  section.querySelectorAll('input,select,textarea').forEach(el=>{
    // máscaras/extra
    if(el.id==='cpf'){
      if(!cpfValido(el.value)){ el.setCustomValidity('CPF inválido'); }
      else el.setCustomValidity('');
    }
    if(!el.checkValidity()){ ok=false; }
    el.classList.toggle('is-invalid', !el.checkValidity());
  });
  // senha == confirmar
  if (current===2){
    const s1 = document.getElementById('senha1').value;
    const s2 = document.getElementById('senha2').value;
    const c2 = document.getElementById('senha2');
    if(s1!==s2){ c2.setCustomValidity('x'); c2.classList.add('is-invalid'); ok=false; }
    else { c2.setCustomValidity(''); c2.classList.remove('is-invalid'); }
  }
  return ok;
}

// ==== Eventos ====
btnPrev.addEventListener('click', ()=>{ if(current>0){ current--; showStep(current); }});
btnNext.addEventListener('click', ()=>{
  if(validateCurrent()){ current++; showStep(current); }
});

// máscaras
const cpf = document.getElementById('cpf');
const cep = document.getElementById('cep');
const tel = document.querySelector('input[name="telefoneCelular"]');
const fixo = document.querySelector('input[name="telefoneFixo"]');

cpf.addEventListener('input', e=> e.target.value = maskCPF(e.target.value));
cep.addEventListener('input', e=> e.target.value = maskCEP(e.target.value));
tel.addEventListener('input', e=> e.target.value = maskPhone(e.target.value));
fixo.addEventListener('input', e=> e.target.value = maskPhone(e.target.value));

// Busca de CEP com ViaCEP
let timeoutCEP;
cep.addEventListener('input', async (e) => {
  const cepValue = e.target.value;
  const cepLimpo = onlyDigits(cepValue);
  
  // Limpar timeout anterior
  clearTimeout(timeoutCEP);
  
  // Se CEP está completo (8 dígitos)
  if (cepLimpo.length === 8) {
    mostrarLoadingCEP(true);
    
    // Debounce de 500ms para evitar muitas requisições
    timeoutCEP = setTimeout(async () => {
      try {
        const dados = await buscarCEP(cepValue);
        
        if (dados) {
          preencherEndereco(dados);
          
          // Mostrar sucesso
          const cepGroup = cep.closest('.col-12');
          const successMsg = document.createElement('div');
          successMsg.className = 'cep-success';
          successMsg.innerHTML = '<small class="text-success"><i class="bi bi-check-circle me-1"></i>CEP encontrado!</small>';
          cepGroup.appendChild(successMsg);
          
          // Remover mensagem após 3 segundos
          setTimeout(() => successMsg.remove(), 3000);
        } else {
          // Mostrar erro
          const cepGroup = cep.closest('.col-12');
          const errorMsg = document.createElement('div');
          errorMsg.className = 'cep-error';
          errorMsg.innerHTML = '<small class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>CEP não encontrado</small>';
          cepGroup.appendChild(errorMsg);
          
          // Remover mensagem após 3 segundos
          setTimeout(() => errorMsg.remove(), 3000);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        mostrarLoadingCEP(false);
      }
    }, 500);
  } else {
    // CEP incompleto - limpar campos de endereço
    if (cepLimpo.length < 8) {
      document.getElementById('endereco').value = '';
      document.getElementById('bairro').value = '';
      document.getElementById('cidade').value = '';
      document.getElementById('estado').value = '';
    }
  }
});

// submit
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!validateCurrent()) return;
  
  // Desabilitar botões durante envio
  form.querySelectorAll('button').forEach(b=> b.disabled = true);
  
  // Mostrar loading
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'alert alert-info mt-3';
  loadingDiv.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Processando cadastro...';
  form.appendChild(loadingDiv);
  
  try {
    // Preparar dados do formulário
    const formData = new FormData(form);
    
    // Enviar para o backend PHP
    const response = await fetch('http://localhost/Rua13/Backend/Cadastro.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    // Remover loading
    loadingDiv.remove();
    
    if (result.status === 'sucesso') {
      // Limpar tentativas de cadastro ao ter sucesso
      sessionStorage.removeItem('cadastro_tentativas');
      
      // Usar dados reais do usuário retornados pelo backend
      if (result.usuario) {
        // Salva dados reais do usuário
        localStorage.setItem('userData', JSON.stringify(result.usuario));
        
        // Atualiza interface do header se estiver disponível
        if (window.headerComponent) {
          window.headerComponent.updateUserInterface(result.usuario);
        }
      }
      
      // Redirecionar diretamente para a página principal
      window.location.href = '../principal/principal.html';
      
    } else {
      // Erro - contar tentativas
      const tentativasKey = 'cadastro_tentativas';
      const tentativas = parseInt(sessionStorage.getItem(tentativasKey) || '0') + 1;
      sessionStorage.setItem(tentativasKey, tentativas.toString());
      
      // Se exceder 3 tentativas com erro, redirecionar para tela de erro
      if (tentativas >= 3) {
        const mensagensErro = result.mensagens && Array.isArray(result.mensagens) 
          ? result.mensagens.join(', ') 
          : (result.mensagem || 'Erro desconhecido');
        
        const params = new URLSearchParams({
          titulo: encodeURIComponent('Erro no Cadastro'),
          desc: encodeURIComponent(`Não foi possível concluir seu cadastro após ${tentativas} tentativas. Motivo: ${mensagensErro}. Por favor, verifique os dados informados e tente novamente.`)
        });
        window.location.href = `../TelaErro/erro.php?${params.toString()}`;
        return;
      }
      
      // Erro - não mostrar contador, apenas o erro
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger mt-3';
      
      if (result.mensagens && Array.isArray(result.mensagens)) {
        errorDiv.innerHTML = `
          <strong>Erro no cadastro:</strong>
          <ul class="mb-0 mt-2">
            ${result.mensagens.map(msg => `<li>${msg}</li>`).join('')}
          </ul>
        `;
      } else {
        errorDiv.innerHTML = `<strong>Erro:</strong> ${result.mensagem || 'Erro desconhecido'}`;
      }
      
      form.appendChild(errorDiv);
    }
    
  } catch (error) {
    // Erro de conexão crítico - redirecionar para tela de erro após 3 tentativas
    loadingDiv.remove();
    
    // Contar tentativas de cadastro falhas
    const tentativasKey = 'cadastro_tentativas';
    const tentativas = parseInt(sessionStorage.getItem(tentativasKey) || '0') + 1;
    sessionStorage.setItem(tentativasKey, tentativas.toString());
    
    if (tentativas >= 3) {
      // Redirecionar para tela de erro após 3 tentativas
      const params = new URLSearchParams({
        titulo: encodeURIComponent('Erro de Conexão'),
        desc: encodeURIComponent('Não foi possível processar seu cadastro após múltiplas tentativas. Verifique sua conexão com a internet e tente novamente.')
      });
      window.location.href = `../TelaErro/erro.php?${params.toString()}`;
      return;
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.innerHTML = `
      <strong>Erro de conexão:</strong> ${error.message}
      <br><small>Verifique o console para mais detalhes.</small>
    `;
    form.appendChild(errorDiv);
    console.error('Erro detalhado:', error);
  }
  
  // Reabilitar botões
  form.querySelectorAll('button').forEach(b=> b.disabled = false);
});

// init
showStep(0);
