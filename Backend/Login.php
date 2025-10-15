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
    $stmt = $pdo->prepare("SELECT id, nome, email, login, senha FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
	
    
    if (!$usuario || $senha !== $usuario['senha']) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Email ou senha incorretos']);
    exit;
    }

    if ($usuario['perfil'] === 'master') {
    // Redireciona o master para o painel de administração
    echo json_encode([
        'status' => 'master',
        'mensagem' => 'Login de administrador bem-sucedido',
        'id_usuario' => $usuario['id'],
        'nome' => $usuario['nome'],        // retorna nome real do banco
        'perfil' => $usuario['perfil'],    // retorna 'master'
        'redirect' => '../admin/dashboard.html' // caminho do painel do master
    ]);
    exit; // interrompe o fluxo normal do login para cliente
}

    
    // Buscar as perguntas e respostas de segurança do usuário
    $stmt = $pdo->prepare("SELECT perguntaescolhida, resposta_da_pergunta FROM autenticacao_2fa WHERE id_usuario = ? ORDER BY id");
    $stmt->execute([$usuario['id']]);
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);


    
    // Extrair apenas as perguntas
    $perguntas = [];
    foreach ($dados as $dado) {
        $perguntas[] = $dado['perguntaescolhida'];
    }
    
    // Verificar se encontrou perguntas
    if (empty($perguntas) || count($perguntas) < 2) {
        echo json_encode([
            'status' => 'erro', 
            'mensagem' => 'Perguntas de segurança não encontradas.'
        ]);
        exit;
    }
    
    echo json_encode([
        'status' => '2fa',
        'mensagem' => 'Senha correta, confirme suas palavras-chave.',
        'id_usuario' => $usuario['id'],
        'perguntas' => $perguntas
    ]);
    
} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage() ]);
}

