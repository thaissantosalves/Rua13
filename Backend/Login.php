<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/config.php';

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['email']) || !isset($data['senha'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
        exit;
    }
    
    $email = trim($data['email']);
    $senha = $data['senha'];
    
    if (empty($email) || empty($senha)) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email e senha são obrigatórios']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
        exit;
    }
    
    // Buscar usuário
    $stmt = $pdo->prepare("SELECT id_usuario, nome, email, login, senha, perfil FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
	
    
    // Verificar senha (compatível com senhas em texto plano e hasheadas)
    $senhaValida = false;
    if (password_get_info($usuario['senha'])['algo'] !== null) {
        // Senha está hasheada
        $senhaValida = password_verify($senha, $usuario['senha']);
    } else {
        // Senha está em texto plano (usuário master)
        $senhaValida = ($senha === $usuario['senha']);
    }
    
    if (!$usuario || !$senhaValida) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email ou senha incorretos']);
        exit;
    }

    // Registrar último acesso/login (será atualizado após 2FA)
    // Removido daqui - será atualizado após verificação 2FA
    
    // Buscar as perguntas e respostas de segurança do usuário (incluindo master)
    $stmt = $pdo->prepare("SELECT id_2FA, perguntaescolhida, resposta_da_pergunta FROM autenticacao_2fa WHERE id_usuario = ? ORDER BY id_2FA");
    $stmt->execute([$usuario['id_usuario']]);
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verificar se encontrou perguntas
    if (empty($dados) || count($dados) < 2) {
        echo json_encode([
            'status' => 'erro', 
            'mensagem' => 'Perguntas de segurança não encontradas.'
        ]);
        exit;
    }
    
    // Sortear uma pergunta aleatória entre as 2 cadastradas
    $perguntaSorteada = $dados[array_rand($dados)];
    
    echo json_encode([
        'status' => '2fa',
        'mensagem' => 'Senha correta, confirme sua palavra-chave.',
        'id_usuario' => $usuario['id_usuario'],
        'pergunta' => $perguntaSorteada['perguntaescolhida'],
        'id_pergunta' => $perguntaSorteada['id_2FA'], // ID para verificação
        'perfil' => $usuario['perfil'] // Incluir perfil para redirecionamento correto
    ]);
    
} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage() ]);
}

