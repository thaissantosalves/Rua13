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
        $stmt = $this->pdo->prepare("INSERT INTO usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nome, $email, $senhaHash, $perfil]);
    }

    public function listar() {
        $stmt = $this->pdo->query("SELECT id_usuario, nome, email, perfil, criado_em FROM usuario");
        return $stmt->fetchAll();
    }

    public function atualizar($id, $nome, $email, $perfil) {
        $stmt = $this->pdo->prepare("UPDATE usuario SET nome=?, email=?, perfil=? WHERE id_usuario=?");
        $stmt->execute([$nome, $email, $perfil, $id]);
    }

    public function deletar($id) {
        $stmt = $this->pdo->prepare("DELETE FROM usuario WHERE id_usuario=?");
        $stmt->execute([$id]);
    }
}
?>