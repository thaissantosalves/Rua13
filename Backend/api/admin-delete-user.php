<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/../config.php';

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['user_id'])) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'ID do usuário não fornecido']);
        exit;
    }
    
    $userId = (int)$data['user_id'];
    
    // Verificar se o usuário existe e não é master
    $stmt = $pdo->prepare("SELECT perfil FROM usuario WHERE id_usuario = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Usuário não encontrado']);
        exit;
    }
    
    if ($user['perfil'] === 'master') {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Não é possível excluir usuário master']);
        exit;
    }
    
    // Iniciar transação
    $pdo->beginTransaction();
    
    try {
        // Excluir registros relacionados primeiro (devido às foreign keys)
        $pdo->prepare("DELETE FROM autenticacao_2fa WHERE id_usuario = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM acoes_usuario WHERE id_usuario = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM detalhes_compras WHERE id_compra IN (SELECT id_compra FROM compras WHERE id_usuario = ?)")->execute([$userId]);
        $pdo->prepare("DELETE FROM compras WHERE id_usuario = ?")->execute([$userId]);
        
        // Excluir o usuário
        $stmt = $pdo->prepare("DELETE FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Usuário não foi excluído');
        }
        
        $pdo->commit();
        
        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Usuário excluído com sucesso'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
?>
