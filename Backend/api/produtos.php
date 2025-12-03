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

// Lógica para buscar todos os produtos (para admin)
if ($action === 'get_all_produtos') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                id_produto, 
                nome, 
                descricao, 
                preco, 
                estoque, 
                categoria, 
                sku, 
                imagem, 
                criado_em, 
                atualizado_em 
            FROM produtos 
            ORDER BY criado_em DESC
        ");
        $stmt->execute();
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'produtos' => $produtos
        ]);
        exit();
    } catch (\PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Erro ao buscar produtos: ' . $e->getMessage()
        ]);
        exit();
    }
}

// Lógica para servir as imagens
if ($action === 'get_image') {
    $id_produto = $_GET['id'] ?? null;

    if ($id_produto) {
        $stmt = $pdo->prepare("SELECT imagem FROM produtos WHERE id_produto = ?");
        $stmt->execute([$id_produto]);
        $row = $stmt->fetch();

        if ($row && !empty($row['imagem'])) {
            $caminho_imagem = $row['imagem'];
            
            // Se for URL externa (http:// ou https://), redirecionar
            if (strpos($caminho_imagem, 'http://') === 0 || strpos($caminho_imagem, 'https://') === 0) {
                header('Location: ' . $caminho_imagem);
                exit();
            }
            
            // Se for caminho local, tentar servir o arquivo
            // Tenta primeiro o caminho relativo a partir da raiz do projeto
            $caminho_completo = __DIR__ . '/../../' . $caminho_imagem;
            
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
            // Sem imagem cadastrada - retornar placeholder
            header('Content-Type: image/svg+xml');
            echo '<?xml version="1.0" encoding="UTF-8"?>
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#333"/>
                <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle" dy=".3em">Sem imagem</text>
            </svg>';
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
        // Receber dados do FormData
        $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
        $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : null;
        $preco = isset($_POST['preco']) ? floatval($_POST['preco']) : 0;
        $estoque = isset($_POST['estoque']) ? intval($_POST['estoque']) : 0;
        $categoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : '';
        $sku = isset($_POST['sku']) ? trim($_POST['sku']) : '';
        
        // Validar campos obrigatórios
        if (empty($nome) || empty($preco) || empty($categoria)) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Nome, preço e categoria são obrigatórios']);
            exit;
        }
        
        // Validar categoria
        if (!in_array($categoria, ['Masculino', 'Feminino'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Categoria inválida']);
            exit;
        }
        
        // Validar preço
        if ($preco <= 0) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'O preço deve ser maior que zero']);
            exit;
        }
        
        // Processar upload de imagem
        $caminho_imagem = '';
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $arquivo = $_FILES['imagem'];
            
            // Validar tipo de arquivo
            $tipos_permitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($arquivo['type'], $tipos_permitidos)) {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Tipo de arquivo inválido. Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)']);
                exit;
            }
            
            // Validar tamanho (máximo 5MB)
            if ($arquivo['size'] > 5 * 1024 * 1024) {
                echo json_encode(['status' => 'erro', 'mensagem' => 'A imagem é muito grande! Máximo permitido: 5MB']);
                exit;
            }
            
            // Criar diretório de uploads se não existir
            $upload_dir = __DIR__ . '/../../assets/uploads/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            // Gerar nome único para o arquivo
            $extensao = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
            $nome_arquivo = uniqid('produto_', true) . '_' . time() . '.' . $extensao;
            $caminho_completo = $upload_dir . $nome_arquivo;
            
            // Mover arquivo para o diretório de uploads
            if (move_uploaded_file($arquivo['tmp_name'], $caminho_completo)) {
                // Salvar caminho relativo no banco (a partir da raiz do projeto)
                $caminho_imagem = 'assets/uploads/' . $nome_arquivo;
            } else {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao fazer upload da imagem']);
                exit;
            }
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
            $caminho_imagem
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

