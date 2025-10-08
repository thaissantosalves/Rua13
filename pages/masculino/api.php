<?php
include 'config.php';

// Define o tipo de requisição que o PHP irá processar
$action = $_GET['action'] ?? null; 

// Lógica para buscar a lista de produtos (JSON)
if ($action === 'get_produtos') {
    $categoria = $_GET['categoria'] ?? null;
    $produtos = [];
    
    if ($categoria) {
        $stmt = $conn->prepare("SELECT id, nome, preco, imagem FROM produtos WHERE categoria = ?");
        $stmt->bind_param("s", $categoria);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $produtos[] = $row;
            }
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($produtos);
    exit();
}

// Lógica para servir as imagens
if ($action === 'get_image') {
    $id_produto = $_GET['id'] ?? null;

    if ($id_produto) {
        $stmt = $conn->prepare("SELECT imagem FROM produtos WHERE id = ?");
        $stmt->bind_param("i", $id_produto);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $caminho_imagem = $row['imagem'];

            if (file_exists($caminho_imagem)) {
                header('Content-Type: ' . mime_content_type($caminho_imagem));
                header('Content-Length: ' . filesize($caminho_imagem));
                readfile($caminho_imagem);
                exit();
            } else {
                header('HTTP/1.0 404 Not Found');
                readfile('assets/placeholder.png'); 
                exit();
            }
        }
    }
}

// Se nenhuma ação válida foi solicitada
http_response_code(400);
echo json_encode(['error' => 'Ação inválida.']);

$conn->close();
?>