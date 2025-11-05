<?php
// Headers CORS para permitir requisições do frontend
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Inclui o arquivo de configuração com PDO
require_once __DIR__ . '/../config.php';

// Define o tipo de requisição que o PHP irá processar
$action = $_GET['action'] ?? null; 

// Lógica para buscar a lista de produtos (JSON)
if ($action === 'get_produtos') {
    $categoria = $_GET['categoria'] ?? null;
    $produtos = [];
    
    if ($categoria) {
        $stmt = $pdo->prepare("SELECT id_produto, nome, preco, categoria, imagem FROM produtos WHERE categoria = ?");
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
        $stmt = $pdo->prepare("SELECT imagem FROM produtos WHERE id_produto = ?");
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
                // Retornar uma imagem placeholder em vez de JSON
                header('Content-Type: image/svg+xml');
                echo '<?xml version="1.0" encoding="UTF-8"?>
                <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#333"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle" dy=".3em">Imagem não encontrada</text>
                </svg>';
                exit();
            }
        } else {
            header('HTTP/1.0 404 Not Found');
            echo json_encode(['error' => 'Produto não encontrado']);
            exit();
        }
    }
}

// Lógica para criar produto
if ($action === 'create') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
        exit;
    }
    
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados inválidos']);
            exit;
        }
        
        // Validar campos obrigatórios
        if (empty($data['nome']) || empty($data['preco']) || empty($data['categoria'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Nome, preço e categoria são obrigatórios']);
            exit;
        }
        
        // Validar categoria
        if (!in_array($data['categoria'], ['Masculino', 'Feminino'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Categoria inválida']);
            exit;
        }
        
        // Preparar dados
        $nome = trim($data['nome']);
        $descricao = isset($data['descricao']) ? trim($data['descricao']) : null;
        $preco = floatval($data['preco']);
        $estoque = isset($data['estoque']) ? intval($data['estoque']) : 0;
        $categoria = $data['categoria'];
        $sku = isset($data['sku']) ? trim($data['sku']) : '';
        $imagem = isset($data['imagem']) ? trim($data['imagem']) : '';
        
        // Validar preço
        if ($preco <= 0) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'O preço deve ser maior que zero']);
            exit;
        }
        
        // Inserir produto
        $stmt = $pdo->prepare("
            INSERT INTO produtos (nome, descricao, preco, estoque, categoria, sku, imagem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $nome,
            $descricao,
            $preco,
            $estoque,
            $categoria,
            $sku,
            $imagem
        ]);
        
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Produto cadastrado com sucesso!',
            'id_produto' => $pdo->lastInsertId()
        ]);
        exit;
        
    } catch (\PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
        exit;
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
        exit;
    }
}

// Se nenhuma ação válida foi solicitada
header('Content-Type: application/json');
http_response_code(400);
echo json_encode(['status' => 'erro', 'mensagem' => 'Ação inválida.']);
?>

