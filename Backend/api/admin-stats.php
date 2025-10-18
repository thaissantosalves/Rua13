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
    // Verificar se é master (opcional - pode remover se quiser)
    // $userData = json_decode($_SERVER['HTTP_USER_DATA'] ?? '{}', true);
    // if (!$userData || $userData['perfil'] !== 'master') {
    //     echo json_encode(['status' => 'erro', 'mensagem' => 'Acesso negado']);
    //     exit;
    // }

    // Total de usuários (apenas clientes)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuario WHERE perfil = 'cliente'");
    $totalUsers = $stmt->fetch()['total'];

    // Cadastros hoje (apenas clientes)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuario WHERE perfil = 'cliente' AND DATE(criado_em) = CURDATE()");
    $newRegistrations = $stmt->fetch()['total'];

    // Total de pedidos (compras)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM compras");
    $totalOrders = $stmt->fetch()['total'];

    // Faturamento total
    $stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as total FROM compras WHERE status = 'pago'");
    $revenue = $stmt->fetch()['total'];

    echo json_encode([
        'status' => 'success',
        'stats' => [
            'totalUsers' => (int)$totalUsers,
            'newRegistrations' => (int)$newRegistrations,
            'totalOrders' => (int)$totalOrders,
            'revenue' => (float)$revenue
        ]
    ]);

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
?>
