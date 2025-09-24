// Sistema de Login com Backend
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('Tentando login com:', { email, password: '***' });
            
            if (email && password) {
                // Mostrar loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Entrando...';
                submitBtn.disabled = true;
                
                try {
                    // Enviar dados para o backend de login
                    const response = await fetch('http://localhost/Rua13/Backend/Login.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            senha: password
                        })
                    });
                    
                    console.log('Resposta do servidor:', response.status);
                    const result = await response.json();
                    console.log('Resultado:', result);
                    
                    if (result.status === 'sucesso') {
                        // Salva dados reais do usuário
                        localStorage.setItem('userData', JSON.stringify(result.usuario));
                        console.log('Dados do usuário salvos:', result.usuario);
                        
                        // Atualiza interface do header se estiver disponível
                        if (window.headerComponent) {
                            window.headerComponent.updateUserInterface(result.usuario);
                        }
                        
                        // Redireciona para página principal
                        window.location.href = '../principal/principal.html';
                        
                        alert('Login realizado com sucesso!');
                    } else {
                        alert('Erro no login: ' + result.mensagem);
                    }
                } catch (error) {
                    console.error('Erro no login:', error);
                    alert('Erro de conexão. Verifique se o servidor está rodando.');
                } finally {
                    // Restaurar botão
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    } else {
        console.error('Formulário não encontrado!');
    }
});
