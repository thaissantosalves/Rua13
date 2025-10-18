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

    if (!$data || !isset($data['id_usuario']) || !isset($data['resposta1']) || !isset($data['resposta2'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
        exit;
    }

    $idUsuario = (int)$data['id_usuario'];
    $resposta1 = trim($data['resposta1']);
    $resposta2 = trim($data['resposta2']);

    // Buscar as duas respostas do banco
    $stmt = $pdo->prepare("SELECT resposta_da_pergunta FROM autenticacao_2fa WHERE id_usuario = ?");
    $stmt->execute([$idUsuario]);
    $respostas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!$respostas || count($respostas) < 2) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Perguntas de segurança não encontradas.']);
        exit;
    }

    // Verificar se ambas batem
    if (in_array($resposta1, $respostas) && in_array($resposta2, $respostas) && $resposta1 !== $resposta2) {
        // Buscar dados completos do usuário
        $stmt = $pdo->prepare("SELECT id_usuario, nome, email, login FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$idUsuario]);
        $usuario = $stmt->fetch();
        
        if ($usuario) {
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Login realizado com sucesso! Bem-vindo.',
                'usuario' => $usuario
            ]);
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao buscar dados do usuário.']);
        }
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Respostas incorretas.']);
    }

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
