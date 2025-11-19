-- Script para adicionar perguntas 2FA ao usuário master
-- Execute este script se o usuário master já existe no banco

USE `ProjetoBackendFaculXamp`;

-- Obter ID do usuário master
SET @master_id = (SELECT id_usuario FROM usuario WHERE perfil = 'master' LIMIT 1);

-- Verificar se já existem perguntas para o master
SET @existe_2fa = (SELECT COUNT(*) FROM autenticacao_2fa WHERE id_usuario = @master_id);

-- Se não existir, inserir as perguntas
-- IMPORTANTE: Altere as respostas conforme necessário
INSERT INTO `autenticacao_2fa` (`id_usuario`, `perguntaescolhida`, `resposta_da_pergunta`) 
SELECT @master_id, 'Qual o nome do seu primeiro animal de estimação?', 'admin123'
WHERE @existe_2fa = 0;

INSERT INTO `autenticacao_2fa` (`id_usuario`, `perguntaescolhida`, `resposta_da_pergunta`) 
SELECT @master_id, 'Qual o nome da sua primeira escola?', 'admin456'
WHERE @existe_2fa = 0;

-- Verificar se foi inserido
SELECT 'Perguntas 2FA do Master:' as Status, COUNT(*) as Total FROM autenticacao_2fa WHERE id_usuario = @master_id;

