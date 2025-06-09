document.getElementById("botaoFecharMenu").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "none";
});

document.querySelector(".mobile-menu-responsivo").addEventListener("click", function () {
    document.querySelector(".menu-mobile-responsivo").style.display = "block";
});

document.getElementById("formulario").addEventListener("submit", function (event) {
    event.preventDefault();

    const login = document.getElementById("login").value;
    const senha = document.getElementById("senha1").value; // Corrigido aqui também

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioValido = usuarios.find((user) => user.login === login && user.senha === senha);

    if (usuarioValido) {
        alert("Login bem-sucedido!");
        window.location.href = "../PaginaPrincipal/index.html";
    } else {
        alert("Login ou senha inválidos!");
    }
});
