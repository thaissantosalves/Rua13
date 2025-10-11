<?php
// Inclui o arquivo de configuração com PDO
require_once '../config.php';

// Define o tipo de requisição que o PHP irá processar
$action = $_GET['action'] ?? null; 

// Lógica para buscar a lista de produtos (JSON)
if ($action === 'get_produtos') {
    $categoria = $_GET['categoria'] ?? null;
    $produtos = [];
    
    if ($categoria) {
        $stmt = $pdo->prepare("SELECT id, nome, preco, imagem FROM produtos WHERE categoria = ?");
        $stmt->execute([$categoria]);
        $produtos = $stmt->fetchAll();
    }
    
    header('Content-Type: application/json');
    echo json_encode($produtos);
    exit();
}

// Lógica para servir as imagens
if ($action === 'get_image') {
    $id_produto = $_GET['id'] ?? null;

    if ($id_produto) {
        $stmt = $pdo->prepare("SELECT imagem FROM produtos WHERE id = ?");
        $stmt->execute([$id_produto]);
        $row = $stmt->fetch();

        if ($row) {
            $caminho_imagem = $row['imagem'];
            
            // Ajusta o caminho da imagem se for relativo (a partir da raiz do projeto)
            $caminho_completo = '../../' . $caminho_imagem;
            
            if (file_exists($caminho_completo)) {
                header('Content-Type: ' . mime_content_type($caminho_completo));
                header('Content-Length: ' . filesize($caminho_completo));
                readfile($caminho_completo);
                exit();
            } else {
                header('HTTP/1.0 404 Not Found');
                echo json_encode(['error' => 'Imagem não encontrada', 'path' => $caminho_imagem]);
                exit();
            }
        } else {
            header('HTTP/1.0 404 Not Found');
            echo json_encode(['error' => 'Produto não encontrado']);
            exit();
        }
    }
}

// Se nenhuma ação válida foi solicitada
http_response_code(400);
echo json_encode(['error' => 'Ação inválida.']);
?>

