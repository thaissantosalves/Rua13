<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/../config.php';

try {
    // Buscar logs de ações dos usuários com nome do usuário
    $stmt = $pdo->query("
        SELECT 
            au.id_acao_usuario,
            u.nome as nome_usuario,
            au.acao,
            au.criado_em,
            'N/A' as ip
        FROM acoes_usuario au
        LEFT JOIN usuario u ON au.id_usuario = u.id_usuario
        ORDER BY au.criado_em DESC
        LIMIT 100
    ");
    
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'logs' => $logs
    ]);

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
?>
