<?php
// PHP para receber a mensagem de erro
$erro_titulo = $_GET['titulo'] ?? "Erro Inesperado!";
$erro_descricao = $_GET['desc'] ?? "Ocorreu um problema ao processar sua solicitação ou autenticar seu acesso. Por favor, tente novamente mais tarde.";
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Erro - StreetKace</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="Teladeerro.css">
</head>

<body>
    <div class="error-container">
        <i class="fa-solid fa-triangle-exclamation error-icon"></i>
        
        <h1 class="error-title"><?php echo htmlspecialchars($erro_titulo, ENT_QUOTES, 'UTF-8'); ?></h1>
        
        <p class="error-message">
            <?php echo htmlspecialchars($erro_descricao, ENT_QUOTES, 'UTF-8'); ?>
        </p>

        <div class="error-actions">
            <a href="../login/login.html" class="btn btn-lg btn-gradient-error w-100 mb-3">
                <i class="fas fa-sign-in-alt me-2"></i>
                Voltar para o Login
            </a>

            <a href="../principal/principal.html" class="btn btn-lg btn-outline-light w-100">
                <i class="fas fa-home me-2"></i>
                Voltar para a Home
            </a>
        </div>
    </div>

    <script>
        // Limpar tentativas ao carregar a tela de erro (permite tentar novamente)
        sessionStorage.removeItem('login_tentativas');
        sessionStorage.removeItem('cadastro_tentativas');
    </script>
</body>
</html>