<?php
ini_set('display_errors', 1); 
error_reporting(E_ALL);
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Captura de dados do formulário
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha1 = $_POST['senha1'] ?? '';
    $senha2 = $_POST['senha2'] ?? '';
    $login = trim($_POST['login'] ?? '');

    // Dados pessoais e contato
    $dataNascimento = $_POST['dataNascimento'] ?? '';
    $sexo = trim($_POST['sexo'] ?? '');
    $nomeMaterno = trim($_POST['nomeMaterno'] ?? '');
    $cpf = trim($_POST['cpf'] ?? '');
    $telefone_celular = trim($_POST['telefoneCelular'] ?? '');
    $telefone_residencial = trim($_POST['telefoneFixo'] ?? '');
    $cep = trim($_POST['cep'] ?? '');
    $endereco = trim($_POST['endereco'] ?? '');
    $numero = trim($_POST['numero'] ?? '');
    $bairro = trim($_POST['bairro'] ?? '');
    $cidade = trim($_POST['cidade'] ?? '');
    $estado = trim($_POST['estado'] ?? '');
    $pergunta1 = trim($_POST['pergunta1'] ?? '');
    $resposta1 = trim($_POST['resposta1'] ?? '');
    $pergunta2 = trim($_POST['pergunta2'] ?? '');
    $resposta2 = trim($_POST['resposta2'] ?? '');

    // Validação básica
    $erros = [];
    if (empty($nome) || strlen($nome) < 5) $erros[] = "Nome inválido.";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $erros[] = "Email inválido.";
    if (strlen($senha1) < 6) $erros[] = "Senha muito curta.";
    if ($senha1 !== $senha2) $erros[] = "Senhas não conferem.";
    if (empty($login)) $erros[] = "Login obrigatório.";
    if (empty($dataNascimento)) $erros[] = "Data de nascimento obrigatória.";
    if (empty($sexo)) $erros[] = "Sexo obrigatório.";
    if (empty($nomeMaterno)) $erros[] = "Nome materno obrigatório.";
    if (empty($cpf)) $erros[] = "CPF obrigatório.";
    if (empty($pergunta1) || empty($resposta1)) $erros[] = "Pergunta e resposta de segurança 1 obrigatórias.";
    if (empty($pergunta2) || empty($resposta2)) $erros[] = "Pergunta e resposta de segurança 2 obrigatórias.";
    if (empty($telefone_celular)) $erros[] = "Telefone celular obrigatório.";
    if (empty($cep)) $erros[] = "CEP obrigatório.";
    if (empty($endereco)) $erros[] = "Endereço obrigatório.";
    if (empty($numero)) $erros[] = "Número do endereço obrigatório.";
    if (empty($bairro)) $erros[] = "Bairro obrigatório.";
    if (empty($cidade)) $erros[] = "Cidade obrigatória.";
    if (empty($estado)) $erros[] = "Estado obrigatório.";

    if (!empty($erros)) {
        echo json_encode(['status' => 'erro', 'mensagens' => $erros]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Inserir usuário
        $stmt = $pdo->prepare("
            INSERT INTO usuarios 
            (nome, email, login, senha, perfil, numero_celular, telefone_residencial, cep, endereco, numero, bairro, cidade, estado, data_nascimento, sexo, nome_materno, cpf, criado_em)
            VALUES 
            (:nome, :email, :login, :senha, 'cliente', :celular, :residencial, :cep, :endereco, :numero, :bairro, :cidade, :estado, :data_nasc, :sexo, :nome_mae, :cpf, NOW())
        ");
        $senha_hash = password_hash($senha1, PASSWORD_DEFAULT);
        $stmt->execute([
            ':nome' => $nome,
            ':email' => $email,
            ':login' => $login,
            ':senha' => $senha_hash,
            ':celular' => $telefone_celular,
            ':residencial' => $telefone_residencial,
            ':cep' => $cep,
            ':endereco' => $endereco,
            ':numero' => $numero,
            ':bairro' => $bairro,
            ':cidade' => $cidade,
            ':estado' => $estado,
            ':data_nasc' => $dataNascimento,
            ':sexo' => $sexo,
            ':nome_mae' => $nomeMaterno,
            ':cpf' => $cpf
        ]);

        // Pega o ID do usuário inserido
        $idUsuario = $pdo->lastInsertId();

        // Inserir perguntas de segurança (2FA)
        $stmt2 = $pdo->prepare("
            INSERT INTO autenticacao_2fa (id_usuario, perguntaescolhida, resposta_da_pergunta)
            VALUES (:id_usuario, :pergunta, :resposta)
        ");

        // Pergunta 1
        $stmt2->execute([
            ':id_usuario' => $idUsuario,
            ':pergunta' => $pergunta1,
            ':resposta' => $resposta1
        ]);

        // Pergunta 2
        $stmt2->execute([
            ':id_usuario' => $idUsuario,
            ':pergunta' => $pergunta2,
            ':resposta' => $resposta2
        ]);

        $pdo->commit();

        // Buscar dados do usuário recém-criado (sem a senha)
        $stmt = $pdo->prepare("SELECT id, nome, email, login FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        echo json_encode([
            'status' => 'sucesso',
            'mensagem' => 'Cadastro realizado com sucesso!',
            'usuario' => $usuario
        ]);

    } catch (\PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'erro', 'mensagem' => 'Falha no cadastro: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
}
