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
    // Receber parâmetro de busca
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Construir query com busca opcional
    $sql = "
        SELECT 
            id_usuario, 
            nome, 
            email,
            cpf,
            perfil, 
            criado_em,
            ultimo_login
        FROM usuario 
        WHERE perfil = 'cliente'
    ";
    
    $params = [];
    
    // Se houver busca, adicionar filtros
    if (!empty($search)) {
        $sql .= " AND (
            nome LIKE ? OR 
            email LIKE ? OR 
            cpf LIKE ?
        )";
        $searchParam = '%' . $search . '%';
        $params = [$searchParam, $searchParam, $searchParam];
    }
    
    $sql .= " ORDER BY criado_em DESC";
    
    $stmt = $pdo->prepare($sql);
    if (!empty($params)) {
        $stmt->execute($params);
    } else {
        $stmt->execute();
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'users' => $users
    ]);

} catch (\PDOException $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}
?>
