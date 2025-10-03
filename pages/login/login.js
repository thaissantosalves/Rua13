// Sistema de Login com Backend
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

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

                    if (result.status === "sucesso") {
                        // Salva dados reais do usuário
                        localStorage.setItem("userData", JSON.stringify(result.usuario));
                        console.log("Dados do usuário salvos:", result.usuario);

                        // Atualiza interface do header se estiver disponível
                        if (window.headerComponent) {
                            window.headerComponent.updateUserInterface(result.usuario);
                        }

                        // Redireciona para página principal
                        window.location.href = "../principal/principal.html";

                        alert("Login realizado com sucesso!");
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
});

// Exemplo: login via fetch
document.querySelector("#form-login").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const senha = document.querySelector("#senha").value;

    const resp = await fetch("http://localhost/seuprojeto/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
    });

    const data = await resp.json();

    if (data.status === "2fa") {
        // guardar ID do usuário temporariamente
        sessionStorage.setItem("id_usuario", data.id_usuario);

        // abrir box 2FA
        document.getElementById("box-2fa").style.display = "flex";
    } else if (data.status === "sucesso") {
        alert("Login completo!");
        window.location.href = "pagina-principal.html";
    } else {
        alert(data.mensagem);
    }
});

// Confirmação do 2FA
document.getElementById("confirmar2fa").addEventListener("click", async () => {
    const id_usuario = sessionStorage.getItem("id_usuario");
    const resposta1 = document.getElementById("resposta1").value.trim();
    const resposta2 = document.getElementById("resposta2").value.trim();

    if (!resposta1 || !resposta2) {
        document.getElementById("msg-2fa").innerText = "Preencha as duas respostas.";
        return;
    }

    const resp = await fetch("http://localhost/seuprojeto/verifica2fa.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, resposta1, resposta2 }),
    });

    const data = await resp.json();

    if (data.status === "sucesso") {
        window.location.href = "pagina-principal.html";
    } else {
        document.getElementById("msg-2fa").innerText = data.mensagem;
    }
});

// Cancelar fecha modal
document.getElementById("cancelar2fa").addEventListener("click", () => {
    document.getElementById("box-2fa").style.display = "none";
});
