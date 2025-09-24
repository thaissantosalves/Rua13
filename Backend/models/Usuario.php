<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

class Usuario {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function criar($nome, $email, $senha, $perfil = 'cliente') {
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nome, $email, $senhaHash, $perfil]);
    }

    public function listar() {
        $stmt = $this->pdo->query("SELECT id, nome, email, perfil, criado_em FROM usuarios");
        return $stmt->fetchAll();
    }

    public function atualizar($id, $nome, $email, $perfil) {
        $stmt = $this->pdo->prepare("UPDATE usuarios SET nome=?, email=?, perfil=? WHERE id=?");
        $stmt->execute([$nome, $email, $perfil, $id]);
    }

    public function deletar($id) {
        $stmt = $this->pdo->prepare("DELETE FROM usuarios WHERE id=?");
        $stmt->execute([$id]);
    }
}
?>