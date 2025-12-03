CREATE DATABASE `ProjetoBackendFaculXamp` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- =========================================
-- 3. USAR O BANCO
-- =========================================
USE `ProjetoBackendFaculXamp`;

-- =========================================
-- 4. CRIAR TODAS AS TABELAS
-- =========================================

-- Tabela: usuario
CREATE TABLE `usuario` (
    `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `login` VARCHAR(50) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `perfil` ENUM('cliente','master') DEFAULT 'cliente',
    `numero_celular` VARCHAR(20),
    `telefone_residencial` VARCHAR(20),
    `cep` VARCHAR(10),
    `endereco` VARCHAR(100),
    `numero` VARCHAR(10),
    `bairro` VARCHAR(50),
    `cidade` VARCHAR(50),
    `estado` VARCHAR(2),
    `data_nascimento` DATE,
    `sexo` ENUM('Feminino','Masculino','Outro'), 
    `cpf` VARCHAR(14) UNIQUE,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ultimo_login` DATETIME NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: produtos
CREATE TABLE `produtos` (
    `id_produto` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(150) NOT NULL,
    `descricao` TEXT,
    `preco` DECIMAL(10,2) NOT NULL,
    `estoque` INT DEFAULT 0,
    `categoria` ENUM('Masculino','Feminino'),
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `sku` VARCHAR(50) NOT NULL DEFAULT '',
    `imagem` VARCHAR(500) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: compras
CREATE TABLE `compras` (
    `id_compra` INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario` INT NOT NULL,
    `total` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pendente','pago','cancelada','entregue') DEFAULT 'pendente',
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: detalhes_compras
CREATE TABLE `detalhes_compras` (
    `id_detalhes_compras` INT AUTO_INCREMENT PRIMARY KEY,
    `id_compra` INT NOT NULL,
    `id_produto` INT NOT NULL,
    `quantidade` INT NOT NULL DEFAULT 1,
    `preco_unitario` DECIMAL(10,2) NOT NULL,
    `data_compra` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_compra`) REFERENCES `compras`(`id_compra`) ON DELETE CASCADE,
    FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id_produto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: acoes_usuario
CREATE TABLE `acoes_usuario` (
    `id_acao_usuario` INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario` INT NOT NULL,
    `acao` VARCHAR(255) NOT NULL, 
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: autenticacao_2fa
CREATE TABLE `autenticacao_2fa` (
    `id_2FA` INT AUTO_INCREMENT PRIMARY KEY, 
    `id_usuario` INT NOT NULL,
    `perguntaescolhida` VARCHAR(150),
    `resposta_da_pergunta` VARCHAR(150),
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: estoque
CREATE TABLE `estoque` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_produto` INT NOT NULL,
    `tamanho` VARCHAR(10) NOT NULL,
    `quantidade` INT NOT NULL,
    FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: recuperacao_senha
CREATE TABLE `recuperacao_senha` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario` INT NOT NULL,
    `codigo` VARCHAR(6) NOT NULL,
    `expirado_em` DATETIME NOT NULL,
    `usado` TINYINT(1) DEFAULT 0,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE,
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_expirado` (`expirado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 5. INSERIR DADOS INICIAIS
-- =========================================

-- 1. Inserir usuário master
INSERT INTO `usuario` (`nome`, `email`, `login`, `senha`, `perfil`) VALUES
('Master', 'admin@gmail.com', 'Master', 'senhaforte', 'master');

-- 2. Inserir perguntas 2FA (substitua @master_id pelo ID do master inserido)
SET @master_id = (SELECT id_usuario FROM usuario WHERE perfil = 'master' LIMIT 1);

-- Verificar se já existem perguntas para o master antes de inserir
SET @existe_2fa = (SELECT COUNT(*) FROM autenticacao_2fa WHERE id_usuario = @master_id);

-- Inserir perguntas 2FA apenas se não existirem
INSERT INTO `autenticacao_2fa` (`id_usuario`, `perguntaescolhida`, `resposta_da_pergunta`) 
SELECT @master_id, 'Qual o nome do seu primeiro animal de estimação?', 'admin123'
WHERE @existe_2fa = 0;

INSERT INTO `autenticacao_2fa` (`id_usuario`, `perguntaescolhida`, `resposta_da_pergunta`) 
SELECT @master_id, 'Qual o nome da sua primeira escola?', 'admin456'
WHERE @existe_2fa = 0;

-- Produtos completos
INSERT INTO `produtos` (`nome`, `descricao`, `preco`, `estoque`, `categoria`, `sku`, `imagem`) VALUES
('Camiseta Básica Masculina', 'Camiseta de algodão 100% confortável', 29.90, 50, 'Masculino', '', ''),
('Vestido Elegante Feminino', 'Vestido para ocasiões especiais', 89.90, 25, 'Feminino', '', ''),
('Calça Jeans Masculina', 'Calça jeans clássica azul', 79.90, 30, 'Masculino', '', ''),
('Blusa Feminina', 'Blusa estampada moderna', 45.90, 40, 'Feminino', '', ''),
('Kimono Rework Preto', 'Kimono estiloso da linha Rework, ideal para um visual streetwear.', 89.90, 0, 'Masculino', 'KIMONO001', 'assets/imgmasculino/imagem1.png'),
('Camiseta Future Preta', 'Camiseta com estampa futurista, tecido premium.', 199.90, 0, 'Masculino', 'CAMIFUTU002', 'assets/imgmasculino/imagem2.png'),
('Camiseta Estonada Cinza', 'Camiseta com lavagem estonada, cor Cinza.', 159.90, 0, 'Masculino', 'CAMIES003', 'assets/imgmasculino/imagem3.png'),
('Camiseta Órbita Preta', 'Design minimalista com estampa de órbita.', 89.90, 0, 'Masculino', 'CAMIORB004', 'assets/imgmasculino/imagem4.png'),
('Regata Gola Alta Cloud Preta', 'Regata moderna com gola alta, conforto e estilo.', 199.90, 0, 'Masculino', 'REGATACLOUD005', 'assets/imgmasculino/imagem5.png'),
('Camisa de Zíper Broxy Creme', 'Camisa com fechamento em zíper, cor Creme.', 159.90, 0, 'Masculino', 'CAMIZIP006', 'assets/imgmasculino/imagem6.png'),
('Bermuda Rework Cinza', 'Bermuda confortável da linha Rework, cor Cinza.', 89.90, 0, 'Masculino', 'BERMWORK007', 'assets/imgmasculino/imagem7.png'),
('Camiseta Nebulosa Preta', 'Estampa exclusiva Nebulosa, 100% algodão.', 199.90, 0, 'Masculino', 'CAMINEB008', 'assets/imgmasculino/imagem8.png'),
('Bermuda Rework Preta', 'Bermuda confortável da linha Rework, cor Preta.', 159.90, 0, 'Masculino', 'BERMWORK009', 'assets/imgmasculino/imagem9.png'),
('Short Rework Preto', 'Short confortável da linha Rework, cor preta.', 89.90, 0, 'Feminino', 'SHORTFEM001', 'assets/imgfeminino/img1.png'),
('Manga única Genesis Preta', 'Blusa de manga única com estilo Genesis, cor preta.', 199.90, 0, 'Feminino', 'MANGAUNICA002', 'assets/imgfeminino/img2.png'),
('Top de Compressão Preto', 'Top esportivo de alta compressão, cor preta.', 159.90, 0, 'Feminino', 'TOPCOMP003', 'assets/imgfeminino/img3.png'),
('Jaqueta WR Ultra Race', 'Jaqueta leve para corrida, estilo Ultra Race.', 89.90, 0, 'Feminino', 'JAQUETAWR004', 'assets/imgfeminino/img4.png'),
('Regata Feminina Canelada Preta', 'Regata básica canelada, cor preta.', 199.90, 0, 'Feminino', 'REGATA005', 'assets/imgfeminino/img5.png'),
('Moletom Cybernova Preto', 'Moletom estilo Cybernova, superconfortável.', 159.90, 0, 'Feminino', 'MOLETON006', 'assets/imgfeminino/img6.png'),
('Poncho Genesis Preto', 'Poncho com design Genesis, cor preta.', 89.90, 0, 'Feminino', 'PONCHO007', 'assets/imgfeminino/img7.png'),
('Calça Parachute Preta', 'Calça estilo Parachute, moderna e solta.', 199.90, 0, 'Feminino', 'CALCAPARA008', 'assets/imgfeminino/img8.png'),
('Manga Única Genesis Cinza', 'Blusa de manga única com estilo Genesis, cor cinza.', 159.90, 0, 'Feminino', 'MANGAUNICA009', 'assets/imgfeminino/img9.png');

-- =========================================
-- 6. VERIFICAR CRIAÇÃO
-- =========================================
SELECT 'BANCO E TABELAS CRIADOS COM SUCESSO!' as Status;

-- Mostrar todas as tabelas
SHOW TABLES;

-- Mostrar estrutura da tabela usuario
DESCRIBE `usuario`;

-- Contar registros
SELECT 'Usuários:' as Tabela, COUNT(*) as Total FROM `usuario`
UNION ALL
SELECT 'Produtos:', COUNT(*) FROM `produtos`
UNION ALL
SELECT 'Compras:', COUNT(*) FROM `compras`
UNION ALL
SELECT 'Detalhes Compras:', COUNT(*) FROM `detalhes_compras`
UNION ALL
SELECT 'Ações Usuário:', COUNT(*) FROM `acoes_usuario`
UNION ALL
SELECT '2FA:', COUNT(*) FROM `autenticacao_2fa`
UNION ALL
SELECT 'Estoque:', COUNT(*) FROM `estoque`;