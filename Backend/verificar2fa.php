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

    if (!$data || !isset($data['id_usuario']) || !isset($data['id_pergunta']) || !isset($data['resposta'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
        exit;
    }

    $idUsuario = (int)$data['id_usuario'];
    $idPergunta = (int)$data['id_pergunta'];
    $resposta = trim($data['resposta']);

    // Buscar a resposta específica da pergunta sorteada
    $stmt = $pdo->prepare("SELECT resposta_da_pergunta FROM autenticacao_2fa WHERE id_usuario = ? AND id_2FA = ?");
    $stmt->execute([$idUsuario, $idPergunta]);
    $respostaCorreta = $stmt->fetchColumn();

    if (!$respostaCorreta) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Pergunta de segurança não encontrada.']);
        exit;
    }

    // Verificar se a resposta está correta (comparação case-insensitive)
    if (strtolower(trim($resposta)) === strtolower(trim($respostaCorreta))) {
        // Registrar último acesso/login
        try {
            $stmt_update = $pdo->prepare("UPDATE usuario SET ultimo_login = NOW() WHERE id_usuario = ?");
            $stmt_update->execute([$idUsuario]);
        } catch (\PDOException $e) {
            // Log erro mas não interrompe o login
            error_log("Erro ao atualizar ultimo_login: " . $e->getMessage());
        }
        
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
        echo json_encode(['status' => 'erro', 'mensagem' => 'Resposta incorreta.']);
    }

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
