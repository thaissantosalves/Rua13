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
    for (const [k,v] of data.entries()){
      if(!v) continue;
      if(['senha1','senha2','termos'].includes(k)) continue;
      lines.push(`<div><span class="text-secondary">${k}</span>: <strong>${v}</strong></div>`);
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

// submit
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!validateCurrent()) return;
  // Aqui você manda pro back (fetch/axios). Por enquanto, só feedback.
  const ok = document.createElement('div');
  ok.className = 'alert alert-success mt-3';
  ok.textContent = 'Conta criada! Confira seu e-mail para confirmação.';
  form.appendChild(ok);
  form.querySelectorAll('button').forEach(b=> b.disabled = true);
});

// init
showStep(0);
