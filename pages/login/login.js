// Sistema de Login com Backend e 2FA
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
                    const response = await fetch("http://localhost/Rua13/Backend/Login.php", {
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


                    const result = await response.json();
                    console.log("Resultado:", result);

					if (result.status === "master") {
                       // Salva dados do master
                     localStorage.setItem("userData", JSON.stringify({
                      id: result.id_usuario,
                      nome: result.nome,      //vem do banco
                      perfil: result.perfil   //vem do banco
                      }));

                       // Redireciona automaticamente para painel de admin
                       window.location.href = result.redirect;

                      alert("Login de administrador realizado com sucesso!");
                    }

                     else if (result.status === "2fa") {
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
                            alert("Erro: Pergunta de segurança não encontrada. Entre em contato com o suporte.");
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
                        }
                        console.log("=== FIM DEBUG ===");
                    } else {
                        alert("Erro no login: " + result.mensagem);
                    }
                } catch (error) {
                    console.error("Erro no login:", error);
                    alert("Erro de conexão. Verifique se o servidor está rodando.");
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
                const resp = await fetch("http://localhost/Rua13/Backend/verificar2fa.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_usuario, id_pergunta, resposta: resposta1 }),
                });

                const data = await resp.json();
                console.log("Resposta do verificar2fa:", data);

                if (data.status === "sucesso") {
                    // Salva dados do usuário
                    localStorage.setItem("userData", JSON.stringify(data.usuario));
                    console.log("Dados do usuário salvos no localStorage:", data.usuario);
                    
                    // Verificar se foi salvo corretamente
                    const savedData = localStorage.getItem("userData");
                    console.log("Dados recuperados do localStorage:", savedData);

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
                    
                    // Redirecionar para página principal
                    window.location.href = "../principal/principal.html";
                    
                    alert("Login realizado com sucesso!");
                } else {
                    document.getElementById("msg-2fa").innerText = data.mensagem;
                }
            } catch (error) {
                console.error("Erro na verificação 2FA:", error);
                document.getElementById("msg-2fa").innerText = "Erro de conexão. Tente novamente.";
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
