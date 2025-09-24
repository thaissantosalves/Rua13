<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
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
    // Receber dados JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['email']) || !isset($data['senha'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
        exit;
    }
    
    $email = trim($data['email']);
    $senha = $data['senha'];
    
    // Validar dados
    if (empty($email) || empty($senha)) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email e senha são obrigatórios']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
        exit;
    }
    
    // Buscar usuário no banco
    $stmt = $pdo->prepare("SELECT id, nome, email, login, senha FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email ou senha incorretos']);
        exit;
    }
    
    // Verificar senha
    if (!password_verify($senha, $usuario['senha'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email ou senha incorretos']);
        exit;
    }
    
    // Remover senha dos dados retornados
    unset($usuario['senha']);
    
    // Login realizado com sucesso
    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Login realizado com sucesso!',
        'usuario' => $usuario
    ]);
    
} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
?>
