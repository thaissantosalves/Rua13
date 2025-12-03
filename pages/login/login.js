// Sistema de Login com Backend e 2FA
// Sistema de contagem de tentativas falhas (silencioso)
const MAX_TENTATIVAS = 3;
const TENTATIVAS_KEY = 'login_tentativas';

// Função para obter tentativas
function getTentativas() {
    const tentativas = sessionStorage.getItem(TENTATIVAS_KEY);
    return tentativas ? parseInt(tentativas) : 0;
}

// Função para incrementar tentativas
function incrementarTentativa() {
    const tentativas = getTentativas() + 1;
    sessionStorage.setItem(TENTATIVAS_KEY, tentativas.toString());
    return tentativas;
}

// Função para resetar tentativas (quando login for bem-sucedido)
function resetarTentativas() {
    sessionStorage.removeItem(TENTATIVAS_KEY);
}

// Função para redirecionar para tela de erro
function redirecionarErro(titulo, descricao) {
    const params = new URLSearchParams({
        titulo: encodeURIComponent(titulo),
        desc: encodeURIComponent(descricao)
    });
    window.location.href = `../TelaErro/erro.php?${params.toString()}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Verificar se o clique foi em um link
            if (e.target.tagName === 'A') {
                return; // Deixar o link funcionar normalmente
            }

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log("Tentando login com:", { email, password: "***" });

            if (email && password) {
                // Mostrar loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = "Entrando...";
                submitBtn.disabled = true;

                try {
                    // Enviar dados para o backend de login
                    const response = await fetch("../../Backend/Login.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: email,
                            senha: password,
                        }),
                    });

                    console.log("Resposta do servidor:", response.status);

                    // Verificar se a resposta é válida
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Erro HTTP:", response.status, errorText);
                        
                        // Incrementar tentativa silenciosamente
                        const tentativas = incrementarTentativa();
                        
                        if (tentativas >= MAX_TENTATIVAS) {
                            redirecionarErro(
                                "Múltiplas Tentativas de Login Falhas",
                                `Você excedeu ${MAX_TENTATIVAS} tentativas de login com falha. Por favor, verifique suas credenciais e tente novamente.`
                            );
                            return;
                        }
                        
                        throw new Error(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
                    }

                    const result = await response.json();
                    console.log("Resultado:", result);

                    if (result.status === "2fa") {
                        // Resetar tentativas ao chegar na etapa 2FA (credenciais corretas)
                        resetarTentativas();
                        
                        console.log("=== DEBUG 2FA ===");
                        console.log("Resultado completo:", result);
                        console.log("Pergunta sorteada:", result.pergunta);
                        
                        // Guardar ID do usuário e da pergunta temporariamente
                        sessionStorage.setItem("id_usuario", result.id_usuario);
                        sessionStorage.setItem("id_pergunta", result.id_pergunta);

                        // Exibir apenas a pergunta sorteada no modal
                        if (result.pergunta) {
                            document.getElementById("pergunta1-label").textContent = result.pergunta;
                            // Esconder a segunda pergunta
                            const pergunta2Container = document.querySelector(".pergunta-container:nth-child(4)");
                            if (pergunta2Container) {
                                pergunta2Container.style.display = "none";
                            }
                            console.log("Pergunta carregada do banco:", result.pergunta);
                        } else {
                            console.error("Erro: Pergunta não encontrada no banco de dados!");
                            redirecionarErro(
                                "Erro de Configuração",
                                "Pergunta de segurança não encontrada no sistema. Entre em contato com o suporte técnico."
                            );
                            return;
                        }

                        // Limpar campos de resposta
                        const resposta1 = document.getElementById("resposta1");
                        const resposta2 = document.getElementById("resposta2");
                        const msg2fa = document.getElementById("msg-2fa");
                        const modal = document.getElementById("box-2fa");
                        
                        if (resposta1) resposta1.value = "";
                        if (resposta2) resposta2.value = "";
                        if (msg2fa) msg2fa.innerText = "";
                        
                        // Abrir modal 2FA
                        if (modal) {
                            modal.style.display = "flex";
                            console.log("Modal aberto com sucesso!");
                        } else {
                            console.error("Erro: Modal box-2fa não encontrado!");
                            redirecionarErro(
                                "Erro de Interface",
                                "Erro ao carregar interface de autenticação. Recarregue a página e tente novamente."
                            );
                        }
                        console.log("=== FIM DEBUG ===");
                    } else {
                        // Login falhou - incrementar tentativa silenciosamente
                        const tentativas = incrementarTentativa();
                        
                        if (tentativas >= MAX_TENTATIVAS) {
                            redirecionarErro(
                                "Múltiplas Tentativas de Login Falhas",
                                `Você excedeu ${MAX_TENTATIVAS} tentativas de login com falha. Motivo: ${result.mensagem || 'Credenciais inválidas'}. Por favor, verifique suas credenciais e tente novamente.`
                            );
                        } else {
                            // Não mostrar aviso, apenas contar silenciosamente
                            alert(`Erro no login: ${result.mensagem}`);
                        }
                    }
                } catch (error) {
                    console.error("Erro no login:", error);
                    
                    // Incrementar tentativa em caso de erro de conexão
                    const tentativas = incrementarTentativa();
                    
                    if (tentativas >= MAX_TENTATIVAS) {
                        redirecionarErro(
                            "Erro de Conexão",
                            `Não foi possível conectar ao servidor após ${MAX_TENTATIVAS} tentativas. Verifique sua conexão com a internet e tente novamente.`
                        );
                    } else {
                        // Não mostrar aviso de tentativas restantes
                        alert("Erro de conexão. Verifique se o servidor está rodando.");
                    }
                } finally {
                    // Restaurar botão
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                alert("Por favor, preencha todos os campos.");
            }
        });
    } else {
        console.error("Formulário não encontrado!");
    }

    // Confirmação do 2FA
    console.log("Configurando evento do botão 2FA...");
    const confirmar2faBtn = document.getElementById("confirmar2fa");
    console.log("Botão confirmar2fa encontrado:", confirmar2faBtn);
    
    if (confirmar2faBtn) {
        confirmar2faBtn.addEventListener("click", async () => {
            const id_usuario = sessionStorage.getItem("id_usuario");
            const id_pergunta = sessionStorage.getItem("id_pergunta");
            const resposta1 = document.getElementById("resposta1").value.trim();

            if (!resposta1) {
                document.getElementById("msg-2fa").innerText = "Preencha a resposta.";
                return;
            }

            try {
                const resp = await fetch("../../Backend/verificar2fa.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_usuario, id_pergunta, resposta: resposta1 }),
                });

                // Verificar se a resposta é válida
                if (!resp.ok) {
                    const errorText = await resp.text();
                    console.error("Erro HTTP:", resp.status, errorText);
                    throw new Error(`Erro ${resp.status}: ${errorText.substring(0, 100)}`);
                }

                const data = await resp.json();
                console.log("Resposta do verificar2fa:", data);

                if (data.status === "sucesso") {
                    // Resetar tentativas ao fazer login com sucesso
                    resetarTentativas();
                    
                    // Salva dados do usuário (incluindo perfil se for master)
                    const userDataToSave = {
                        id: data.usuario.id_usuario,
                        nome: data.usuario.nome,
                        email: data.usuario.email,
                        login: data.usuario.login
                    };
                    
                    // Se for master, adicionar perfil
                    if (data.perfil === 'master') {
                        userDataToSave.perfil = 'master';
                    }
                    
                    localStorage.setItem("userData", JSON.stringify(userDataToSave));
                    console.log("Dados do usuário salvos no localStorage:", userDataToSave);

                    // Atualiza interface do header se estiver disponível
                    if (window.headerComponent) {
                        window.headerComponent.updateUserInterface(data.usuario);
                    }

                    // Limpar dados temporários
                    sessionStorage.removeItem("id_usuario");
                    sessionStorage.removeItem("id_pergunta");
                    
                    // Fechar modal
                    document.getElementById("box-2fa").style.display = "none";
                    
                    // Mostrar novamente a segunda pergunta para próxima vez
                    const pergunta2Container = document.querySelector(".pergunta-container:nth-child(4)");
                    if (pergunta2Container) {
                        pergunta2Container.style.display = "block";
                    }
                    
                    // Redirecionar baseado no perfil
                    if (data.perfil === 'master' && data.redirect) {
                        // Master vai para dashboard
                        window.location.href = data.redirect;
                        alert("Login de administrador realizado com sucesso!");
                    } else {
                        // Cliente vai para página principal
                        window.location.href = "../principal/principal.html";
                        alert("Login realizado com sucesso!");
                    }
                } else {
                    // Resposta 2FA incorreta - incrementar tentativa silenciosamente
                    const tentativas = incrementarTentativa();
                    
                    if (tentativas >= MAX_TENTATIVAS) {
                        redirecionarErro(
                            "Múltiplas Tentativas de Autenticação Falhas",
                            `Você excedeu ${MAX_TENTATIVAS} tentativas de autenticação com falha. Motivo: ${data.mensagem || 'Resposta de segurança incorreta'}. Por favor, tente novamente.`
                        );
                    } else {
                        // Não mostrar tentativas restantes
                        document.getElementById("msg-2fa").innerText = data.mensagem;
                    }
                }
            } catch (error) {
                console.error("Erro na verificação 2FA:", error);
                
                // Incrementar tentativa em caso de erro de conexão
                const tentativas = incrementarTentativa();
                
                if (tentativas >= MAX_TENTATIVAS) {
                    redirecionarErro(
                        "Erro de Conexão",
                        `Não foi possível conectar ao servidor após ${MAX_TENTATIVAS} tentativas. Verifique sua conexão com a internet e tente novamente.`
                    );
                } else {
                    // Não mostrar tentativas restantes
                    document.getElementById("msg-2fa").innerText = "Erro de conexão. Tente novamente.";
                }
            }
        });
    }

    // Cancelar fecha modal
    const cancelar2faBtn = document.getElementById("cancelar2fa");
    if (cancelar2faBtn) {
        cancelar2faBtn.addEventListener("click", () => {
            document.getElementById("box-2fa").style.display = "none";
            sessionStorage.removeItem("id_usuario");
            sessionStorage.removeItem("id_pergunta");
            // Mostrar novamente a segunda pergunta
            const pergunta2Container = document.querySelector(".pergunta-container:nth-child(4)");
            if (pergunta2Container) {
                pergunta2Container.style.display = "block";
            }
        });
    }
});
