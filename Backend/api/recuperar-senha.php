<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? null;

// Ação: Verificar email e gerar código
if ($action === 'solicitar_codigo') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
        exit;
    }
    
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['email'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Email é obrigatório']);
            exit;
        }
        
        $email = trim($data['email']);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
            exit;
        }
        
        // Verificar se o email existe no banco
        $stmt = $pdo->prepare("SELECT id_usuario, nome, email FROM usuario WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'E-mail não encontrado. Verifique se você possui uma conta cadastrada.']);
            exit;
        }
        
        // Limpar códigos expirados ou usados deste usuário
        $stmt = $pdo->prepare("DELETE FROM recuperacao_senha WHERE id_usuario = ? AND (expirado_em < NOW() OR usado = 1)");
        $stmt->execute([$usuario['id_usuario']]);
        
        // Gerar código de 6 dígitos
        $codigo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Definir expiração (10 minutos)
        $expiracao = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        
        // Salvar código no banco
        $stmt = $pdo->prepare("INSERT INTO recuperacao_senha (id_usuario, codigo, expirado_em) VALUES (?, ?, ?)");
        $stmt->execute([$usuario['id_usuario'], $codigo, $expiracao]);
        
        // Em produção, aqui enviaria o código por email
        // Por enquanto, retornamos o código para desenvolvimento
        
        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Código de recuperação gerado com sucesso!',
            'codigo_dev' => $codigo, // Apenas para desenvolvimento - remover em produção
            'email' => $email
        ]);
        
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Ação: Validar código
if ($action === 'validar_codigo') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
        exit;
    }
    
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['email']) || !isset($data['codigo'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Email e código são obrigatórios']);
            exit;
        }
        
        $email = trim($data['email']);
        $codigo = trim($data['codigo']);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
            exit;
        }
        
        if (strlen($codigo) !== 6 || !ctype_digit($codigo)) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Código inválido. Deve conter 6 dígitos.']);
            exit;
        }
        
        // Buscar usuário
        $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'E-mail não encontrado.']);
            exit;
        }
        
        // Buscar código válido
        $stmt = $pdo->prepare("
            SELECT id, id_usuario 
            FROM recuperacao_senha 
            WHERE id_usuario = ? 
            AND codigo = ? 
            AND expirado_em > NOW() 
            AND usado = 0
            ORDER BY criado_em DESC
            LIMIT 1
        ");
        $stmt->execute([$usuario['id_usuario'], $codigo]);
        $codigoRecuperacao = $stmt->fetch();
        
        if (!$codigoRecuperacao) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Código inválido ou expirado. Solicite um novo código.']);
            exit;
        }
        
        // Marcar código como usado
        $stmt = $pdo->prepare("UPDATE recuperacao_senha SET usado = 1 WHERE id = ?");
        $stmt->execute([$codigoRecuperacao['id']]);
        
        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Código validado com sucesso!',
            'token' => base64_encode($usuario['id_usuario'] . '|' . time()) // Token temporário para segurança
        ]);
        
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Ação: Atualizar senha
if ($action === 'atualizar_senha') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
        exit;
    }
    
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['email']) || !isset($data['senha']) || !isset($data['token'])) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
            exit;
        }
        
        $email = trim($data['email']);
        $senha = $data['senha'];
        $token = $data['token'];
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
            exit;
        }
        
        if (strlen($senha) < 6) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'A senha deve ter no mínimo 6 caracteres']);
            exit;
        }
        
        // Validar token (simples - em produção usar JWT ou similar)
        $tokenData = base64_decode($token);
        $parts = explode('|', $tokenData);
        if (count($parts) !== 2) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Token inválido']);
            exit;
        }
        
        $idUsuario = (int)$parts[0];
        $tokenTime = (int)$parts[1];
        
        // Token válido por 30 minutos
        if (time() - $tokenTime > 1800) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Token expirado. Recomece o processo.']);
            exit;
        }
        
        // Verificar se o email corresponde ao ID do token
        $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario = ?");
        $stmt->execute([$email, $idUsuario]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados inválidos']);
            exit;
        }
        
        // Verificar se existe código usado recentemente (últimos 30 minutos)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM recuperacao_senha 
            WHERE id_usuario = ? 
            AND usado = 1 
            AND criado_em > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        ");
        $stmt->execute([$idUsuario]);
        $temCodigoUsado = $stmt->fetchColumn() > 0;
        
        if (!$temCodigoUsado) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Nenhum código válido encontrado. Recomece o processo.']);
            exit;
        }
        
        // Atualizar senha
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuario SET senha = ? WHERE id_usuario = ?");
        $stmt->execute([$senhaHash, $idUsuario]);
        
        // Limpar todos os códigos de recuperação deste usuário
        $stmt = $pdo->prepare("DELETE FROM recuperacao_senha WHERE id_usuario = ?");
        $stmt->execute([$idUsuario]);
        
        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Senha atualizada com sucesso!'
        ]);
        
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
    }
    exit;
}

// Se nenhuma ação válida foi solicitada
echo json_encode(['status' => 'erro', 'mensagem' => 'Ação inválida']);
?>

